# Build Spec: Prescription Decoder

Hand this entire document to an AI coding tool (Claude Code, Cursor, v0, Replit AI, etc.) as the instructions to build the app. It contains the problem statement, full feature list, exact system prompt, API contracts, UI flow, and deployment steps.

---

## 1. What this app is

**Name:** Prescription Decoder (rename freely, e.g. "RxClear")

**Problem it solves:** Doctors' handwritten prescriptions are frequently illegible or use abbreviations patients don't understand. Patients — especially elderly people, people with limited literacy, or people unfamiliar with medical shorthand — often don't know what medicine they were prescribed, why, how much to take, when, or what side effects to expect. This causes missed doses, wrong dosing, and unnecessary pharmacy trips.

**Who it's for:** Patients and caregivers who want to double-check and understand a prescription before taking it to the pharmacy.

**Core idea:** User uploads a photo of a prescription. The AI reads it, identifies each medicine, and explains it in plain language — but critically, it **flags its own confidence level** per item instead of pretending to be certain. Low-confidence items are clearly marked "please confirm with your pharmacist" rather than guessed at authoritatively. This is the app's key design decision — it makes the tool honest and safe rather than a black box that might hallucinate a drug name.

**Hard rule for the whole app:** This is a reading-assistance tool, NOT a medical diagnosis or medication-safety tool. This must be stated in the UI persistently (e.g. a banner) and in the README.

---

## 2. Recommended tech stack

- **Frontend + Backend:** Next.js 14 (App Router), React, TypeScript, Tailwind CSS — single deployable app, works cleanly on Vercel.
- **AI Model:** Google **Gemini 2.0 Flash** (free tier) via the Gemini API, using its native vision (image) input.
- **Database:** **Firebase Firestore** — used to store a history of past decoded prescriptions (so users can look back at previous results). This is optional-but-recommended: it turns a purely stateless demo into a slightly more complete product, and gives you an easy second feature to show in your README/screenshots.
- **Hosting:** Vercel (free tier is sufficient).
- **No auth required.** Keep it public and frictionless — anyone opens the link and uses it immediately. History can be stored anonymously (no login needed).
- **Image handling:** Accept upload via `<input type="file" accept="image/*" capture="environment">` so it also works on mobile camera directly.

### 2a. Firebase setup (Firestore for history)

1. Go to console.firebase.google.com → create a project → enable **Firestore Database** (start in test mode, tighten security rules before final submission — see Section 9).
2. Get your Firebase config from Project Settings → General → Your apps → Web app.
3. Install: `npm install firebase`
4. Create `lib/firebase.ts`:

```typescript
import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
export const db = getFirestore(app);
```

5. In the `/api/decode` route, after parsing the AI's JSON response, save a copy to Firestore:

```typescript
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

await addDoc(collection(db, "prescriptions"), {
  ...parsed,
  createdAt: serverTimestamp(),
});
```

6. Add a `/history` page that reads the most recent entries:

```typescript
import { db } from "@/lib/firebase";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";

const q = query(collection(db, "prescriptions"), orderBy("createdAt", "desc"), limit(20));
const snapshot = await getDocs(q);
const history = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
```

Note: Firebase's `NEXT_PUBLIC_*` client config values are meant to be public (this is normal for Firebase, unlike a real secret key) — but Firestore **security rules** still need to be locked down before submission (e.g. allow create + read, disallow delete, add basic validation) so a grader poking around in the browser console can't wipe your data.

---

## 3. Complete feature list

1. **Upload a prescription photo** (from file picker or mobile camera).
2. **Image preview** before submitting, with a "Retake / Re-upload" option.
3. **"Decode Prescription" button** that sends the image to the AI and shows a loading state.
4. **Structured results screen** showing, for each medicine detected:
   - Medicine name (as read)
   - Likely purpose / what it treats (plain language)
   - Dosage & frequency (e.g. "1 tablet, twice daily, after meals")
   - Duration if stated (e.g. "for 5 days")
   - Common side effects (2–4 bullet points, plain language)
   - **Confidence level**: High / Medium / Low, with color coding (green/amber/red)
   - If Low confidence: a clear note "Unclear — please confirm this with your pharmacist" instead of a guessed answer
5. **Overall summary line** at the top (e.g. "3 medicines identified, 1 needs pharmacist confirmation").
6. **Daily schedule view** — auto-generated simple timetable (Morning / Afternoon / Evening / Night) showing which medicine to take when, built from the dosage frequency data.
7. **Persistent safety disclaimer banner**: "This tool helps you read prescriptions — it does not replace advice from your doctor or pharmacist. Always confirm before taking any medication."
8. **Error handling states:**
   - No image uploaded → prompt to upload
   - Image unreadable / not a prescription → friendly message asking to retake photo with better lighting/focus
   - API failure → friendly retry message, not a raw error
9. **"Start Over" button** to decode another prescription without refreshing the page.
10. **Mobile-responsive design** — most real users will use this on a phone camera.
11. *(Optional stretch feature if time allows)* Language toggle: show explanation in English or Urdu.
12. *(Optional stretch feature if time allows)* "Download as PDF/Image" button so the user can save the plain-language summary and schedule.

---

## 4. User flow (step by step)

1. User lands on homepage → sees app name, one-line explanation, safety disclaimer, and an upload button.
2. User uploads/takes a photo of a prescription.
3. Preview shown → user taps "Decode Prescription."
4. Loading state (spinner + short reassuring text: "Reading prescription...").
5. Results screen renders: summary line, then a card per medicine, then the daily schedule table, then the disclaimer again.
6. User can tap "Start Over" to go back to step 2.

---

## 5. Backend logic (API route)

Create one API route: `POST /api/decode`

**Request:** multipart form data or base64 JSON containing the image.

**Server-side steps:**
1. Receive image, validate it's an image file and under a reasonable size limit (e.g. 10MB).
2. Convert to base64 if not already.
3. Call the Anthropic API (or OpenAI API) with the image and the system prompt below (Section 6), requesting a **strict JSON response** (no prose, no markdown fences).
4. Parse the JSON response server-side. If parsing fails, retry once with a follow-up message telling the model "Your last response was not valid JSON, return ONLY valid JSON matching the schema." If it fails again, return a friendly error to the frontend.
5. Return the parsed structured JSON to the frontend.

**Gemini API call shape (Node/TypeScript, using fetch):**

The system prompt goes into the `systemInstruction` field — this is where ALL of the prompt engineering from Section 6 lives. It is kept entirely server-side, never sent from or visible to the browser.

```typescript
const response = await fetch(
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
  {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: {
        parts: [{ text: SYSTEM_PROMPT }], // <-- full system prompt from Section 6
      },
      contents: [
        {
          role: "user",
          parts: [
            {
              inline_data: {
                mime_type: "image/jpeg", // or image/png, detect from upload
                data: base64ImageData, // raw base64, no "data:image/..." prefix
              },
            },
            {
              text: "Read this prescription image and return the structured JSON exactly as instructed. Return ONLY the JSON, nothing else.",
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.2,
        responseMimeType: "application/json", // forces valid JSON output natively
      },
    }),
  }
);

const data = await response.json();
const rawText = data.candidates[0].content.parts[0].text;
const parsed = JSON.parse(rawText); // responseMimeType above means this should already be clean JSON
```

Model name note: `gemini-2.0-flash` is fast, supports vision, and is available on the free tier — check ai.google.dev for the current free-tier model name in case it has been renamed by the time you build this.

**IMPORTANT: Never expose `GEMINI_API_KEY` to the frontend.** It must only be read from `process.env` inside the server-side API route, and set as an environment variable on Vercel (never committed to the repo, never in `.env` files that get pushed to GitHub — add `.env*` to `.gitignore`). Firebase's client config values, by contrast, are safe to expose as `NEXT_PUBLIC_*` — see Section 2a.

---

## 6. The AI system prompt (the actual "AI feature" for your README)

Use this exact system prompt (adjust wording as you like, but keep the structure and the confidence-flagging behavior — this is the core design decision of the app):

```
You are a prescription-reading assistant. Your job is to read an image of
a handwritten or printed medical prescription and explain it in plain,
simple language for a patient who is not medically trained.

CRITICAL RULES:
1. You are a reading aid, not a doctor. Never diagnose, never suggest
   changing a dose, never recommend stopping or starting any medication.
2. For each medicine you detect, you MUST assign an honest confidence
   level: "high", "medium", or "low".
   - "high": the medicine name and dosage are clearly legible and you
     recognize it as a real, known medication.
   - "medium": you can make a reasonable reading but there is some
     ambiguity (unclear letter, unusual abbreviation, partial dosage info).
   - "low": the handwriting is too unclear to confidently identify the
     medicine or dosage. In this case, do NOT guess a specific drug name
     with confidence. Instead, describe what you can see (e.g. "starts
     with 'Aug...', unclear rest") and set confidence to "low".
3. Never invent information that is not visible in the image. If dosage,
   frequency, or duration is not stated or not legible, say so explicitly
   rather than filling in a plausible-sounding default.
4. If the image does not appear to be a prescription at all, or is too
   blurry/dark to read anything meaningful, respond with the JSON error
   format shown below instead of guessing.
5. Keep all explanations short, plain-language, and free of medical
   jargon. Assume the reader has no medical background.

OUTPUT FORMAT:
Return ONLY valid JSON matching this exact schema. No markdown fences,
no commentary, no text before or after the JSON.

{
  "readable": true,
  "summary": "string, e.g. '3 medicines identified, 1 needs pharmacist confirmation'",
  "medicines": [
    {
      "name": "string, medicine name as read",
      "confidence": "high" | "medium" | "low",
      "purpose": "string, plain-language explanation of what it treats, or null if unknown",
      "dosage": "string, e.g. '1 tablet, twice daily, after meals', or null if illegible",
      "duration": "string, e.g. 'for 5 days', or null if not stated",
      "side_effects": ["string", "string"],
      "note": "string or null — required if confidence is 'low', explaining what is unclear"
    }
  ],
  "schedule": {
    "morning": ["medicine names to take in the morning"],
    "afternoon": ["..."],
    "evening": ["..."],
    "night": ["..."]
  }
}

If the image is not readable as a prescription at all, return instead:

{
  "readable": false,
  "reason": "string explaining why (e.g. 'image too blurry', 'does not appear to be a prescription')"
}
```

**Why this system prompt matters for your grade:** explicitly explain in your README that the confidence-flagging behavior is intentional — the AI is instructed to admit uncertainty rather than hallucinate a drug name, which is the responsible way to apply AI to a medical-adjacent reading task.

---

## 7. Frontend components to build

- `UploadScreen` — file input, camera capture, image preview, submit button.
- `LoadingState` — spinner + reassuring text.
- `ResultsScreen` — renders summary, list of `MedicineCard` components, `ScheduleTable`, disclaimer, and "Start Over" button.
- `MedicineCard` — name, confidence badge (color-coded), purpose, dosage, duration, side effects, note if low confidence.
- `ScheduleTable` — simple 4-row table (Morning/Afternoon/Evening/Night) populated from the `schedule` object.
- `DisclaimerBanner` — persistent, shown on every screen.
- `ErrorState` — friendly retry message for unreadable images or API failures.

---

## 8. Edge cases to explicitly handle

| Case | Behavior |
|---|---|
| No image selected, user clicks decode | Show inline validation message, don't call API |
| Image too large (>10MB) | Reject client-side with a message, ask to use a smaller photo |
| `readable: false` returned by AI | Show `ErrorState` with the AI's stated reason, offer retake |
| AI returns malformed JSON | Retry once server-side; if it fails again, show generic friendly error |
| API key missing/invalid | Server returns 500, frontend shows "Something went wrong, please try again shortly" (never expose the raw error or key) |
| Very slow response (>20s) | Show an extended loading message so user doesn't think it's frozen |

---

## 9. Environment variables & security

`.env.local` (not committed):
```
GEMINI_API_KEY=your_gemini_key_here
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```

- `.gitignore` must include `.env*`
- `GEMINI_API_KEY` is a real secret — server-only, never `NEXT_PUBLIC_`. Never log it, never send it to the client, never hardcode it anywhere in the repo.
- The `NEXT_PUBLIC_FIREBASE_*` values are safe to expose (this is normal for Firebase's client SDK) — but lock down **Firestore security rules** before submission so a grader can't write/delete arbitrary data from the browser console.
- On Vercel: Project Settings → Environment Variables → add all of the above for Production/Preview/Development.

---

## 10. Deployment steps

1. `npx create-next-app@latest prescription-decoder --typescript --tailwind --app`
2. Build the components and API route as specified above.
3. Test locally with `npm run dev`, using a real `.env.local` key.
4. `git init`, commit, create a **public** GitHub repo, push.
5. Go to vercel.com → Import the GitHub repo → add the `ANTHROPIC_API_KEY` environment variable in the Vercel dashboard → Deploy.
6. Test the live URL in an incognito window to confirm it works with no login required.
7. Take at least 3 screenshots: (a) upload screen, (b) results screen with a mix of high/medium/low confidence items, (c) the schedule table.

---

## 11. README requirements checklist (fill this in after building)

- [ ] App name + one-paragraph problem statement (who it helps and why)
- [ ] Live URL (test it in incognito before submitting)
- [ ] Full features list (copy from Section 3, adjust to what you actually shipped)
- [ ] AI feature section: explain the confidence-flagging design decision and include the system prompt verbatim (Section 6)
- [ ] Tools/services used: Next.js, Tailwind, Anthropic API (claude-sonnet-4-6), Vercel
- [ ] 3+ screenshots embedded in the README
- [ ] "How to run locally" section: clone repo → `npm install` → add `.env.local` with `ANTHROPIC_API_KEY` → `npm run dev`
- [ ] Explicit disclaimer that this is a reading aid, not medical advice

---

## 12. One-line pitch for your README's opening paragraph

> "Prescription Decoder reads a photo of a handwritten or printed prescription and explains each medicine in plain language — including an honest confidence rating, so patients know exactly which parts they can trust and which parts they still need to confirm with a pharmacist."
