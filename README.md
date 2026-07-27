# RxClear — Understand Your Prescription in Seconds

## a. What it does & the problem it solves

**RxClear** is a web app that helps patients read and understand handwritten or printed medical prescriptions. Doctors' handwriting is frequently illegible, and prescriptions are full of abbreviations and shorthand that most patients — especially elderly people, people with limited literacy, or anyone unfamiliar with medical terminology — simply cannot decode on their own. This leads to missed doses, incorrect dosing, confusion at the pharmacy, and unnecessary anxiety about one's own health.

**Who it's for:** patients and caregivers who want to double-check and understand a prescription in plain language before taking it to the pharmacy — without needing to wait for a phone call back from the doctor or make an extra trip just to ask "what does this say?"

**Core design decision:** rather than pretending to confidently decode every prescription (which risks dangerous misinformation on illegible handwriting), RxClear's AI explicitly rates its own confidence per medicine — **High Confidence / Needs Confirmation / Unclear — Action Required** — and tells the user honestly when something needs pharmacist confirmation instead of guessing. This is the single most important design choice in the app: it's built to be a responsible reading aid, not a false authority. In the example shown in the screenshots below, the app correctly flagged "Cap. Rlij 2g" as unclear rather than guessing at a specific drug name, and prompted the user to confirm it with their pharmacist.

> ⚠️ **RxClear is a reading-assistance tool, not a medical diagnosis tool.** It does not replace professional advice — always confirm with a doctor or pharmacist before taking any medication.

---

## b. Live URL

**🔗 [https://rx-clear-liard.vercel.app/](https://rx-clear-liard.vercel.app/)**

---

## c. Features

- 📸 **Upload or capture a prescription photo** directly from a device camera or file picker (JPEG/PNG up to 10MB)
- 🖼️ **Image preview** before submitting, with a "Retake Photo" option
- 🤖 **AI-powered decoding** — reads the prescription and returns a structured, plain-language explanation
- 💊 **Per-medicine breakdown**, including:
  - Medicine name (as read)
  - Purpose / what it treats, explained in plain language
  - Dosage & frequency
  - Duration of treatment
  - Common side effects
  - **Confidence rating** — "High Confidence," "Needs Confirmation," or "Unclear — Action Required," with a clear explanatory note when something is uncertain
- 🗓️ **Auto-generated daily schedule** — a Morning / Afternoon / Evening / Night table showing exactly when to take each medicine
- 🔒 **Private, anonymous history** — every user gets a silent, invisible anonymous session (no login, no signup, no personal information collected) so their past scans stay private to them and are never mixed with anyone else's
- 📋 **History screen** — revisit past decoded prescriptions
- 📄 **Save Result as PDF** — download the decoded results for offline reference or to show a pharmacist
- 🔗 **Share Results** — quickly share the decoded prescription summary
- ⚠️ **Persistent safety disclaimer** shown on every screen
- 🛡️ **Graceful error handling** — unreadable images, AI service hiccups, and rate limits all show honest, calm messages instead of crashing or displaying raw errors
- 📱 **Fully responsive** — works on both desktop and mobile browsers

---

## d. The AI feature

**What it does:** The core AI feature reads an uploaded prescription image using a vision-capable large language model and returns a structured, honest explanation — including an explicit confidence rating per medicine, so the user always knows what to trust and what to double-check with a pharmacist.

**The exact system prompt used:**

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

**Why this matters:** the confidence-flagging behavior is intentional and is the core "instructions I wrote myself" piece of this project — it directly shapes the model into refusing to hallucinate a drug name when handwriting is genuinely illegible, instead surfacing uncertainty honestly to the user, and even providing a "Confirm Medicine Name" call-to-action for the pharmacist visit. This was iteratively tested and tuned against real prescription photos with varying handwriting quality.

---

## e. Tools, services, and AI models used

| Category | Tool/Service |
|---|---|
| Frontend & Backend | Next.js (App Router), React, TypeScript, Tailwind CSS |
| AI Model | Google Gemini (vision-capable model), called server-side via a dedicated API route |
| Database | Firebase Firestore (private, per-user history via Firebase Anonymous Authentication) |
| UI Design | Google Stitch (initial screen designs and component styling) |
| Development / Build Assistance | Antigravity and Cursor (AI coding agents used to implement the functional app on top of the designed UI) |
| Hosting | Vercel |
| Version Control | Git / GitHub (public repository) |

---

## f. Screenshots

**Home screen**
![Home screen](screenshots/Dashboard1.png)

**Upload area**
![Upload area](screenshots/Dashboard2.png)

**Feature highlights**
![Feature highlights](screenshots/Dashboard3.png)

**Decoded results — High Confidence & Needs Confirmation**
![Decoded results](screenshots/Result1.png)

**Decoded results — Unclear medicine flagged for pharmacist confirmation**
![Unclear medicine flagged](screenshots/Result2.png)

**Daily schedule & export options**
![Daily schedule](screenshots/Result3.png)

**History screen**
![History screen](screenshots/History.png)

---

## g. How to run this project locally

### Prerequisites
- Node.js (v18 or later)
- A free Gemini API key (Google AI Studio)
- A free Firebase project with Firestore enabled and Anonymous Authentication enabled

### Setup steps

```bash
# 1. Clone the repository
git clone https://github.com/areefasamar/RxClear.git
cd RxClear

# 2. Install dependencies
npm install

# 3. Create a .env.local file in the project root with the following:
GEMINI_API_KEY=your_key_here
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# 4. Run the development server
npm run dev

# 5. Open http://localhost:3000 in your browser
```

### Deployment
This project is deployed on **Vercel**. To deploy your own copy:
1. Push this repository to your own GitHub account
2. Import it into Vercel (vercel.com → New Project → select the repo)
3. Add all the environment variables listed above in Vercel's Project Settings → Environment Variables
4. Deploy

---

## A note on responsible design

No login, signup, or personal information (name, phone number, etc.) is ever collected. Each user's history stays private through an invisible, anonymous session — protecting privacy without adding any friction to a tool meant to be used quickly, often by people who are worried about their health in the moment.
