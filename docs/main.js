const chatEl = document.getElementById('chat');
const inputEl = document.getElementById('input');
const form = document.getElementById('form');

// client-side history (no system message here)
const history = [];

function render() {
  chatEl.innerHTML = history.map(h => `
    <div class="turn ${h.role}">
      <div class="role">${h.role}</div>
      <div class="content">${escapeHtml(h.content).replace(/\n/g, '<br>')}</div>
    </div>
  `).join('');
  chatEl.scrollTop = chatEl.scrollHeight;
}

function escapeHtml(unsafe) {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

async function sendMessage(message) {
  // optimistic UI
  history.push({ role: 'user', content: message });
  render();
  inputEl.value = '';
  inputEl.disabled = true;
  document.getElementById('send').disabled = true;

  try {
    const serverBase = (window.SERVER_URL || '').replace(/\/$/, '');
    const apiUrl = serverBase ? `${serverBase}/api/chat` : '/api/chat';

    const res = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ history, message })
    });

    // If the server returns JSON, parse it; otherwise show friendly message
    const ctype = res.headers.get('content-type') || '';
    if (!ctype.includes('application/json')) {
      // probably an HTML page (404 or static site), show helpful message
      history.push({ role: 'assistant', content: '' });
      render();
      await typewriterAnimate(`Server error: expected JSON but received HTML. This usually means the backend server is not deployed or the URL is incorrect (tried ${apiUrl}). Run the local server (npm run web) or deploy it and set SERVER_URL in the page.`, (partial) => {
        history[history.length - 1].content = partial;
        render();
      }, 14);
      return;
    }

    const data = await res.json();
    if (res.ok) {
      const reply = data.reply || '[no response]';
      // Insert an assistant placeholder and animate text character-by-character
      history.push({ role: 'assistant', content: '' });
      render();
      await typewriterAnimate(reply, (partial) => {
        history[history.length - 1].content = partial;
        render();
      }, 16);
    } else {
      const err = data.error || 'Server error';
      history.push({ role: 'assistant', content: '' });
      render();
      await typewriterAnimate(`Error: ${err}`, (partial) => {
        history[history.length - 1].content = partial;
        render();
      }, 16);
    }
  } catch (err) {
    history.push({ role: 'assistant', content: '' });
    render();
    await typewriterAnimate(`Network error: ${err.message || err}`, (partial) => {
      history[history.length - 1].content = partial;
      render();
    }, 16);
  }

  inputEl.disabled = false;
  document.getElementById('send').disabled = false;
  inputEl.focus();
}

// Typewriter animation helper
function typewriterAnimate(text, onUpdate, delay = 20) {
  return new Promise((resolve) => {
    let i = 0;
    const timer = setInterval(() => {
      i += 1;
      onUpdate(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(timer);
        resolve();
      }
    }, delay);
  });
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const value = inputEl.value.trim();
  if (!value) return;
  // local exit words
  if (/^(good bye|goodbye|bye|exit|quit)$/i.test(value)) {
    history.push({ role: 'assistant', content: 'Good Bye!' });
    render();
    inputEl.disabled = true;
    document.getElementById('send').disabled = true;
    return;
  }
  sendMessage(value);
});



render();