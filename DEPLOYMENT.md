# Deployment guide — Backend (web_server.js)

This project has a static UI in `/docs` (served by GitHub Pages) and a Node backend `web_server.js` which proxies to the Groq API using your `GROQ_API_KEY`.

If you see "Server error: expected JSON but received HTML" in the UI, that means the browser called the UI's `/api/chat` endpoint but there was no backend on that origin (GitHub Pages is static and cannot run the Node server). Use one of the options below to deploy the backend.

## Quick Deploy: Render (recommended)
1. Create a free account on https://render.com and click **New -> Web Service**. Connect your GitHub repo `SouravNaga/Coding-AI-Agent`.
2. Use branch: `main` and **Root Directory**: `/` (the service runs `web_server.js`).
3. Set build and start commands:
   - Build Command: `npm install`
   - Start Command: `node web_server.js`
4. In Render service **Environment** settings add the environment variable:
   - `GROQ_API_KEY` = `sk-...your key...`
   - Optionally: `CORS_ORIGIN` = `https://souravnaga.github.io` (or `*` during testing)
5. Deploy — once the service is live you'll have a URL like `https://my-app.onrender.com`.
6. Edit `/docs/index.html` in the repo and set the `meta[name="server-url"]` content to the service URL (e.g., `https://my-app.onrender.com`). Commit & push. The static UI will now call the deployed server.

## Local testing
1. Run locally: `npm run web` (this starts `web_server.js` and serves the UI on http://localhost:3000)
2. Open http://localhost:3000 and chat.

## Notes
- The server uses CORS. By default it allows all origins (via `CORS_ORIGIN='*'`). For production, set `CORS_ORIGIN` to your GitHub Pages site origin.
- The server includes a `/ping` endpoint to verify availability: `GET https://your-backend/ping` returns JSON.

If you want, I can prepare a `render.yaml` to make creating the Render service easier or help configure your Render/GitHub settings directly; tell me which you'd prefer.