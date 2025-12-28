# Agent.js — What it does

This file explains, step-by-step, what `Agent.js` does, how to set it up safely, and how to run your coding assistant locally.

---

## 1) Overview
- `Agent.js` uses the `groq-sdk` Chat Completions API to send a short conversation (system + user messages) to a model and print the model output.
- The current flow is:
  1. Read `GROQ_API_KEY` from environment variables
  2. Create a `Groq` client with that key
  3. Call `groq.chat.completions.create(...)` with `messages` and `model`
  4. Print out the returned message content

---

## 2) Important security & robustness notes
- **Do not log your API keys.** The existing code logs `process.env.GROQ_API_KEY` — remove that line immediately.
- Check that `GROQ_API_KEY` is present and fail with a helpful message if it is missing.
- Add `try/catch` around the network call so errors are reported clearly.
- Do not commit a `.env` file with secrets to source control. Add `.env` to `.gitignore`.

---

## 3) Quick setup (recommended)
1. Create a file named `.env` at the project root with the following content:
```
GROQ_API_KEY=sk-...your-key-here...
```
2. Ensure `.env` is in `.gitignore` (do not commit it).
3. Run the app one of these ways:
   - With the included npm script (recommended):
     ```powershell
     npm run dev
     ```
     That runs `node --env-file=.env Agent.js` as defined in `package.json`.
   - Or run directly if you add `dotenv` to the code (see next section):
     ```powershell
     node Agent.js "Give me an even/odd program only in Python"
     ```

Note (Windows PowerShell): if you get `ExecutionPolicy` errors when running `npm run dev`, either:
- Run `Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned -Force` (recommended persistent fix)
- Or use the CMD shim: `npm.cmd run dev`
- Or use a one-time bypass: `powershell -ExecutionPolicy Bypass -Command "npm run dev"`

---

## 4) Minimal safe `Agent.js` example (recommended change)
```javascript
import 'dotenv/config'; // optional: makes .env loading explicit
import Groq from 'groq-sdk';

const API_KEY = process.env.GROQ_API_KEY;
if (!API_KEY) {
  console.error('Missing GROQ_API_KEY in environment. Set it in .env or your env vars.');
  process.exit(1);
}

const groq = new Groq({ apiKey: API_KEY });

const prompt = process.argv.slice(2).join(' ') || 'Give me an even/odd program only in Python. Only return the code block.';

async function callAgent() {
  try {
    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: 'You are a helpful coding assistant. Provide runnable code when asked and nothing else.' },
        { role: 'user', content: prompt }
      ],
      model: process.env.MODEL || 'llama-3.3-70b-versatile'
    });

    console.log(completion?.choices?.[0]?.message?.content ?? 'No content returned');
  } catch (err) {
    console.error('Groq API error:', err?.message ?? err);
    process.exitCode = 1;
  }
}

callAgent();
```

---

## 5) Usage tips
- To get only a code block, instruct the user message to "Return only a fenced code block in Python".
- For debugging, don't print secrets — log structured errors instead.

---

## 6) Troubleshooting
- If you see a PowerShell `PSSecurityException` when running `npm run dev`, see the "Quick setup" notes above.
- If the API request fails, check network connectivity and that `GROQ_API_KEY` is valid.

---

## 7) Quick Bengali summary (সংক্ষেপে — বাংলা)
- `.env` বানাও এবং `GROQ_API_KEY` রাখো।
- `Agent.js` সরাসরি API কল করে মডেলের আউটপুট টার্মিনালে ছাপায়।
- নিরাপত্তার জন্য API কী কনসোলে দেখাবে না; কনসোল লগ মুছে ফেলো।
- চালাতে: `npm run dev` (PowerShell সমস্যা হলে `npm.cmd run dev` বা `Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned -Force` চালাও)।

---

If you'd like, I can also update `Agent.js` for you with the safe example above and add a short script that accepts CLI prompts — shall I apply those changes now?