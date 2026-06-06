# Word Universe

**See your knowledge as a galaxy.**

Every word you learn is a star. Positioned by meaning, not alphabet. Over months, a personal constellation forms — showing you exactly how your knowledge is shaped.

**[Open App →](https://nuts-and-bytes.github.io/word-universe/app/)**
&nbsp;&middot;&nbsp;
**[Live Demo (Landing)](https://nuts-and-bytes.github.io/word-universe/)**
&nbsp;&middot;&nbsp;
**[GitHub →](https://github.com/nuts-and-bytes/word-universe)**

---

## What it does

- **Semantic positioning** — Words are placed by meaning (LLM embeddings), not alphabet. Related words cluster naturally
- **Five semantic clusters** — Concrete, Abstract, Action, Nature, Social — auto-detected by content analysis
- **Mastery tracking** — Rate words 0-3. Level 3 = gold star. The universe rewards consistency
- **D3.js force graph** — Words drift, gravitate, and cluster in real-time. Drag, zoom, explore
- **No backend** — All data in LocalStorage. Your vocabulary is yours alone
- **Optional OpenAI embeddings** — Enter your API key for real semantic positioning. Without it, a deterministic fallback is used

---

## How it works

```
Word Universe/
├── app/
│   ├── index.html      # The app
│   ├── style.css       # All styles
│   └── app.js         # D3 graph + word logic
└── index.html          # Landing page
```

**Tech stack:** D3.js · Vanilla JS · LocalStorage · OpenAI / Minimax Embeddings API

---

## Quick start

```bash
# Open in browser
open https://nuts-and-bytes.github.io/word-universe/app/

# Or run locally
npx serve .
# then open http://localhost:3000/app/
```

### Optional: Enable real embeddings

1. Get an OpenAI API key (or Minimax)
2. Open the app, open browser DevTools → Console
3. Run: `localStorage.setItem('openai_api_key', 'your-key-here')`
4. Refresh — new words will now use real semantic embeddings

---

## Adding your first words

Try these to see clustering in action:

| Word | Language | Cluster (auto) | Example |
|------|----------|----------------|---------|
| ephemeral | EN | Abstract | "Fame in social media is often ephemeral." |
| serendipity | EN | Abstract | "Finding that book was pure serendipity." |
| mountains | EN | Nature | "We spent a week in the mountains." |
| create | EN | Action | "She wants to create something meaningful." |
| friend | EN | Social | "He's been my best friend for ten years." |

---

## Philosophy

Most vocabulary apps are about memorization. This one is about **seeing the shape of your knowledge**.

Alphabetical word lists hide everything. But if you can see your words arranged by meaning — with abstract concepts here, concrete nouns there, action words over here — you start to notice gaps. You start to notice clusters. You start to ask: *what kind of person is building this universe?*

---

## Keyboard shortcuts

| Key | Action |
|-----|--------|
| `Ctrl+N` / `Cmd+N` | Add new word |
| `Esc` | Close modal / panel |

---

## License

MIT · [View on GitHub](https://github.com/nuts-and-bytes/word-universe)
