import Groq from 'groq-sdk';
import readline from 'readline';

(async () => {
  // Try to load dotenv if present, but don't crash if it's missing
  try {
    await import('dotenv/config');
  } catch (e) {
    console.warn('dotenv not found; ensure env vars are set or run with `npm run dev` (node --env-file=.env).');
  }

  const API_KEY = process.env.GROQ_API_KEY;
  if (!API_KEY) {
    console.error('Missing GROQ_API_KEY in environment. Set it in .env or your environment variables.');
    process.exit(1);
  }

  const groq = new Groq({ apiKey: API_KEY });

  // Conversation state: start with a system message and add user/assistant messages
  const systemMessage = {
    role: 'system',
    content: 'You are a helpful coding assistant. Provide concise, runnable code only when asked. Be polite and brief.'
  };

  const messages = [systemMessage];
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

  function ask(question) {
    return new Promise((resolve) => rl.question(question, resolve));
  }

  async function chatLoop() {
    console.log("Start chatting with the agent. Type 'Good Bye' to exit.\n");

    while (true) {
      const userInput = (await ask('You: ')).trim();

      if (!userInput) {
        continue; // ignore empty lines
      }

      // Exit keywords (case-insensitive)
      if (/^(good bye|goodbye|bye|exit|quit)$/i.test(userInput)) {
        console.log('Agent: Good Bye!');
        break;
      }

      // Add user message to history
      messages.push({ role: 'user', content: userInput });

      try {
        // Keep only recent messages to limit request size
        const recent = messages.slice(-20);

        const completion = await groq.chat.completions.create({
          messages: recent,
          model: process.env.MODEL || 'llama-3.3-70b-versatile'
        });

        const assistantReply = completion?.choices?.[0]?.message?.content ?? '[no response]';

        console.log('\nAgent:', assistantReply, '\n');

        // Save assistant reply to history
        messages.push({ role: 'assistant', content: assistantReply });
      } catch (err) {
        console.error('Error calling Groq API:', err?.message ?? err);
      }
    }

    rl.close();
  }

  chatLoop();
})();