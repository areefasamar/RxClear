import { NextResponse } from 'next/server';

// ---------------------------------------------------------------------------
// System prompt
// ---------------------------------------------------------------------------
const SYSTEM_PROMPT = `You are a prescription reading assistant for patients (not doctors). Never diagnose or change doses.
Assign per-medicine confidence: high, medium, or low. If confidence is low, do not guess the drug name; describe what you see.
Never invent text not visible in the image. If the image is not a prescription or is unreadable, return readable:false JSON.

Return ONLY valid JSON (no markdown, no extra text). Schema:

{"readable":true,"summary":"string","medicines":[{"name":"string","confidence":"high"|"medium"|"low","purpose":"string|null","dosage":"string|null","duration":"string|null","side_effects":["string"],"note":"string|null"}],"schedule":{"morning":[],"afternoon":[],"evening":[],"night":[]}}

If unreadable: {"readable":false,"reason":"short explanation"}`;

// ---------------------------------------------------------------------------
// Mock response — returned when MOCK_AI=true
// ---------------------------------------------------------------------------
const MOCK_RESPONSE = {
  readable: true,
  summary: 'This is a mock prescription for local UI development. No real API call was made.',
  medicines: [
    {
      name: 'Amoxicillin 500mg',
      confidence: 'high',
      purpose: 'Antibiotic — treats bacterial infections',
      dosage: '1 capsule three times daily',
      duration: '7 days',
      side_effects: ['Nausea', 'Diarrhea', 'Allergic reaction (rare)'],
      note: 'Take with food to reduce stomach upset.',
    },
    {
      name: 'Paracetamol 500mg',
      confidence: 'high',
      purpose: 'Pain reliever and fever reducer',
      dosage: '1–2 tablets every 6 hours as needed',
      duration: 'As required',
      side_effects: ['Liver damage if overused'],
      note: 'Do not exceed 8 tablets in 24 hours.',
    },
  ],
  schedule: {
    morning: ['Amoxicillin 500mg', 'Paracetamol 500mg'],
    afternoon: ['Amoxicillin 500mg'],
    evening: ['Amoxicillin 500mg', 'Paracetamol 500mg'],
    night: [],
  },
};

// ---------------------------------------------------------------------------
// In-memory rate limiter: max 10 requests per IP per hour
// ---------------------------------------------------------------------------
interface RateLimitEntry {
  count: number;
  windowStart: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();
const RATE_LIMIT_MAX = 10;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
    rateLimitMap.set(ip, { count: 1, windowStart: now });
    return true;
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return false;
  }

  entry.count += 1;
  return true;
}

// ---------------------------------------------------------------------------
// Sleep helper
// ---------------------------------------------------------------------------
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// ---------------------------------------------------------------------------
// Parse retry delay from Gemini 429 response body
// Returns delay in ms (default 35s if not found)
// ---------------------------------------------------------------------------
function parseRetryDelayMs(rawBody: string): number {
  try {
    const parsed = JSON.parse(rawBody) as {
      error?: {
        details?: Array<{ '@type'?: string; retryDelay?: string }>;
      };
    };
    const details = parsed?.error?.details ?? [];
    for (const d of details) {
      if (d['@type']?.includes('RetryInfo') && d.retryDelay) {
        // retryDelay format: "32s" or "6.5s"
        const seconds = parseFloat(d.retryDelay.replace('s', ''));
        if (!isNaN(seconds)) return Math.ceil(seconds) * 1000 + 2000; // add 2s buffer
      }
    }
  } catch { /* ignore */ }
  return 35_000; // safe fallback: 35 seconds
}

// ---------------------------------------------------------------------------
// Gemini API call with automatic retry on 429
// Models tried in order (each has its own free quota bucket):
//   1. gemini-3.1-flash-lite — lightest, fastest model (least quota usage)
//   2. gemini-2.5-flash      — very reliable free tier model as fallback
// ---------------------------------------------------------------------------
const GEMINI_MODELS = ['gemini-3.1-flash-lite', 'gemini-2.5-flash'];

async function callGemini(
  apiKey: string,
  base64Image: string,
  mimeType: string,
  reqId: string
): Promise<Record<string, unknown>> {
  const buildEndpoint = (model: string) =>
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const buildBody = () =>
    JSON.stringify({
      system_instruction: {
        parts: [{ text: SYSTEM_PROMPT }],
      },
      contents: [
        {
          parts: [
            {
              inline_data: {
                mime_type: mimeType || 'image/jpeg',
                data: base64Image,
              },
            },
            {
              text: 'Read this prescription image. Return ONLY the JSON schema from your instructions.',
            },
          ],
        },
      ],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.2,
        maxOutputTokens: 2048,
      },
    });

  for (const model of GEMINI_MODELS) {
    const endpoint = buildEndpoint(model);
    console.log(`[${reqId}] Trying Gemini model: ${model}`);

    // Each model gets up to 2 attempts (in case of transient 429)
    for (let attempt = 1; attempt <= 2; attempt++) {
      let rawBody = '';
      let response: Response;

      try {
        response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: buildBody(),
        });

        if (response.ok) {
          const data = await response.json();
          const candidate = data.candidates?.[0];
          const finishReason = candidate?.finishReason;
          const rawText = candidate?.content?.parts?.[0]?.text;

          console.log(`[${reqId}] ${model} finishReason=${finishReason}, length=${rawText?.length ?? 0}`);

          if (finishReason === 'MAX_TOKENS') {
            throw { clientReason: 'service_error', message: 'Response cut short — try a clearer image.' };
          }
          if (finishReason === 'SAFETY') {
            throw { clientReason: 'service_error', message: 'Image blocked by Gemini safety filters.' };
          }
          if (!rawText) {
            throw { clientReason: 'service_error', message: 'Empty response from Gemini.' };
          }

          // Strip any accidental markdown fences
          const cleaned = rawText.trim().replace(/^```json\s*/i, '').replace(/```\s*$/i, '');
          try {
            return JSON.parse(cleaned) as Record<string, unknown>;
          } catch {
            console.error(`[${reqId}] JSON parse failed:\n${rawText}`);
            throw { clientReason: 'service_error', message: 'Could not parse Gemini JSON response.' };
          }
        }

        // Non-OK response
        try { rawBody = await response.text(); } catch { rawBody = ''; }
        console.error(`[${reqId}] ${model} HTTP ${response.status} (attempt ${attempt}):\n${rawBody}`);

        if (response.status === 429) {
          const delayMs = parseRetryDelayMs(rawBody);
          if (attempt === 1) {
            // Wait and retry the same model once
            console.log(`[${reqId}] Rate limited — waiting ${delayMs}ms before retry…`);
            await sleep(delayMs);
            continue; // retry
          } else {
            // Both attempts on this model failed — try next model
            console.log(`[${reqId}] ${model} exhausted after 2 attempts — trying next model`);
            break; // break inner loop → next model
          }
        }

        // Non-retryable errors
        if (response.status === 401 || response.status === 403) {
          throw { clientReason: 'api_key', message: 'Gemini API key rejected.' };
        }
        if (response.status === 404) {
          console.log(`[${reqId}] Model ${model} not found — trying next`);
          break; // try next model
        }
        if (response.status === 503) {
          throw { clientReason: 'model_unavailable', message: 'Gemini temporarily unavailable.' };
        }
        throw { clientReason: 'service_error', message: `Gemini HTTP ${response.status}` };

      } catch (err: unknown) {
        // Re-throw our own structured errors
        const e = err as { clientReason?: string };
        if (e.clientReason) throw err;
        // Network errors — treat as service error
        console.error(`[${reqId}] Network error on ${model}:`, err);
        throw { clientReason: 'service_error', message: 'Network error calling Gemini.' };
      }
    }
    // If we get here, move to the next model in the list
  }

  // All models exhausted
  throw { clientReason: 'rate_limited', message: 'All Gemini models are rate-limited. Please wait a minute and try again.' };
}

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------
export async function POST(req: Request) {
  const reqId = Math.random().toString(36).substring(2, 9);

  // ── Rate limit ─────────────────────────────────────────────────────────────
  const forwarded = req.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown';

  if (!checkRateLimit(ip)) {
    console.warn(`[${reqId}] Rate limit exceeded for IP: ${ip}`);
    return NextResponse.json(
      {
        readable: false,
        reason: 'too_many_requests',
        message: 'Too many requests — please wait an hour and try again.',
      },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();
    const { image, mimeType } = body as { image?: string; mimeType?: string };

    if (!image) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    // ── Mock mode ────────────────────────────────────────────────────────────
    if (process.env.MOCK_AI === 'true') {
      console.log(`[${reqId}] MOCK_AI=true — returning mock response`);
      return NextResponse.json(MOCK_RESPONSE);
    }

    // ── Gemini API ──────────────────────────────────────────────────────────
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn(`[${reqId}] GEMINI_API_KEY not set — returning mock. Restart dev server after editing .env.local.`);
      return NextResponse.json(MOCK_RESPONSE);
    }

    // Strip data URI prefix if present
    const base64 = image.startsWith('data:') ? image.split(',')[1] : image;
    const resolvedMime = mimeType || 'image/jpeg';

    try {
      const result = await callGemini(apiKey, base64, resolvedMime, reqId);
      return NextResponse.json(result);
    } catch (err: unknown) {
      const e = err as { clientReason?: string; message?: string };
      console.error(`[${reqId}] Gemini failed (${e.clientReason}):`, e.message);
      return NextResponse.json(
        { readable: false, reason: e.clientReason ?? 'service_error' },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error(`[${reqId}] Fatal Error:`, error);
    return NextResponse.json(
      { error: 'Internal server error while decoding prescription.' },
      { status: 500 }
    );
  }
}
