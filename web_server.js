import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import Groq from 'groq-sdk';

const API_KEY = process.env.GROQ_API_KEY;
if (!API_KEY) {
  console.error('Missing GROQ_API_KEY in environment. Set it in .env or your environment variables.');
  process.exit(1);
}

const groq = new Groq({ apiKey: API_KEY });

const app = express();
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, 'docs')));

const systemMessage = {
  role: 'system',
  content: 'You are a helpful coding assistant. Provide concise, runnable code only when asked. Be polite and brief.'
};

app.post('/api/chat', async (req, res) => {
  const { history, message } = req.body || {};
  if (!message) return res.status(400).json({ error: 'Missing message' });

  const messages = [systemMessage, ...(Array.isArray(history) ? history : []), { role: 'user', content: message }];
  const recent = messages.slice(-20);

  try {
    const completion = await groq.chat.completions.create({
      messages: recent,
      model: process.env.MODEL || 'llama-3.3-70b-versatile'
    });

    const reply = completion?.choices?.[0]?.message?.content ?? '';
    return res.json({ reply });
  } catch (err) {
    console.error('Groq API error:', err?.message ?? err);
    return res.status(500).json({ error: err?.message ?? 'API error' });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server listening on http://localhost:${port}`));
