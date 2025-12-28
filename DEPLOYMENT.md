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

---

## Automatic deploy via GitHub Actions
You can enable automated deploys to Render on every push to `main`. Follow these steps:

1. Create the Render service first (see 'Quick Deploy' above) so you have the service created and its Service ID.
2. Create an **API Key** in Render (Account → API Keys) and copy the value.
3. In your GitHub repository, go to **Settings → Secrets & variables → Actions** and add two secrets:
   - `RENDER_API_KEY` — the API key value from Render (keep it secret)
   - `RENDER_SERVICE_ID` — the numeric/alphanumeric Service ID for your service (found in the Render service URL or settings)
4. The repository now includes a workflow `.github/workflows/deploy-to-render.yml` which triggers on pushes to `main`. It will call the Render API to start a deployment and wait for it to finish.

Notes:
- The Action requires the service to already exist. If you prefer, I can add a more advanced workflow that attempts to create the service if it doesn't exist, but creating the service once via the UI is simplest.
- After the Action runs successfully, your service will be redeployed automatically on each push to `main`.