# Design System: Word Universe — 单词宇宙

## 1. Visual Theme & Atmosphere

A personal semantic galaxy rendered in real-time. Each word you learn is a star — its position determined by meaning, not alphabet. Over months, a personal constellation forms. The interface feels like a planetarium: dark, precise, quietly alive. Not a learning app — a **living map of your mind**. Dense data visualization with the restraint of a Bloomberg terminal and the curiosity of an explorer's journal.

**Density:** 6/10 — Balanced. Information-rich for the visualization itself, but UI chrome is minimal.
**Variance:** 8/10 — Artsy Chaotic. The stars themselves create organic asymmetry; the UI must not fight this.
**Motion:** 7/10 — Fluid CSS + D3.js force simulation. Stars drift, gravitate, cluster. Continuous micro-motion.

---

## 2. Color Palette & Roles

- **Deep Space** (#0D0D12) — Primary background. Near-black with a hint of blue.
- **Nebula Surface** (#13131A) — Cards, panels, modals.
- **Star White** (#E4E4E7) — Primary text.
- **Cosmic Dust** (#71717A) — Secondary text, metadata, labels.
- **Semantic Cluster Blue** (#6B7FD7) — Words with concrete/visual meaning cluster (blue region).
- **Action Orange** (#E07A4A) — Words about doing/moving/taking action cluster.
- **Abstract Violet** (#9B8ACB) — Abstract concepts, feelings, philosophy cluster.
- **Nature Green** (#5B9A6B) — Natural world, science, biology cluster.
- **Social Coral** (#D47F7F) — People, relationships, social words cluster.
- **Focused Gold** (#C9A84C) — Words marked as "mastered" or priority — the bright stars.
- **Wireframe Gray** (#2A2A35) — Force graph edges, grid lines, axes.
- **Whisper Border** (rgba(255,255,255,0.05)) — Subtle dividers.
- **Banned:** Purple neon glows, outer glow shadows, Inter, pure black.

---

## 3. Typography Rules

- **Display / Word Labels:** `Outfit` — Weight 500-600, tight tracking. Each star label is small (10-12px) so the star field dominates. Hover reveals full Outfit 700 label at 1rem.
- **Body / UI:** `Outfit` — Weight 400, relaxed leading (1.6). Used in panels, modals, about page.
- **Monospace / Metadata:** `JetBrains Mono` — Word counts, dates, similarity scores, node counts.
- **Font CDN:** `https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap`
- **Banned:** Inter, generic serif, pure black text.

---

## 4. Component Stylings

### Star (Individual Word)
- **Shape:** Circle, radius 3-12px based on "mastery level" (more mastered = larger).
- **Color:** Determined by semantic cluster (see palette). If unclustered, default to Star White at 60% opacity.
- **Glow:** Radial gradient from cluster color at 40% to transparent — simulates bloom without neon.
- **Hover state:** Radius expands 1.5×, label appears (Outfit 700, 14px, Star White), tooltip shows: word, language, date added, cluster, similarity score.
- **Mastered state:** Gold (#C9A84C) fill, slightly larger, subtle pulse animation.
- **Active/selected:** White stroke ring (2px).

### Force-Directed Graph (D3.js)
- Nodes = words. Edges = semantic similarity > 0.7 threshold (from LLM embedding).
- Physics: force simulation with gentle repulsion, medium-link attraction, weak center gravity.
- The result: natural clusters emerge organically. The user watches their universe self-organize.
- Zoom: D3 zoom, min 0.3× max 3×.
- Pan: Click-drag on empty space.

### Control Panel (Top-Right)
- Floating pill-shaped panel, Nebula Surface background, subtle border.
- Buttons: "Add Word", "Filter: All/Learning/Mastered", "Cluster View On/Off".
- Minimal — icons with tooltips, no text labels.

### Word Entry Modal
- Full-screen overlay, Deep Space at 90% opacity + backdrop blur.
- Centered card, Nebula Surface, max-width 480px, generous padding (2.5rem).
- Fields:
  - Word (large input, Outfit 600, 1.5rem)
  - Language (dropdown: English / 中文 / Español / Other)
  - Cluster (auto-assigned by LLM, but overridable — pill selector)
  - Definition (textarea, small)
  - Example sentence (textarea, small)
  - Tags (comma-separated input)
- Submit: Semantic cluster color of the word, pill button.

### Word Detail Panel (Right Slide-In)
- Slides in from right on word click, 360px wide, Nebula Surface.
- Shows: full word, all metadata, example sentence, similarity connections list.
- "Words similar to this" — clickable list of connected nodes.

### Empty State
- Centered star field, but with a single slowly-orbiting planet (SVG).
- Text: "Your universe is empty. Add your first word to begin." — Cosmic Dust color.
- Subtle particle drift animation in background.

### Landing Page (For GitHub)
- Split layout: Left = headline + description + CTA. Right = animated star field demo (CSS/JS only, not Three.js — keep it lightweight).
- Headline: "See your knowledge as a galaxy." — Outfit 700, large, left-aligned.
- Feature list: Inline with small inline SVG icons (not emoji): "Semantic positioning", "LLM-powered clusters", "Time-decay review", "Export to Obsidian".
- Dark throughout, same Deep Space background.

---

## 5. Layout Principles

- **Main View:** Full-bleed D3.js canvas, control panel floating top-right, word detail panel slides from right.
- **No header/navbar** on the main app — the universe IS the interface.
- **Responsive:** Mobile = force graph fills screen, FAB bottom-right for "Add Word", detail panel becomes full-screen bottom sheet.
- **Containment:** 100dvw × 100dvh always, no scroll on main app.
- **Grid:** None — canvas-native.
- **Banned:** Centered layouts, flexbox math hacks, h-screen (use 100dvh).

---

## 6. Motion & Interaction

- **Initial load:** Stars fade in with staggered delay (opacity 0→1, 50ms stagger, 400ms duration).
- **New word added:** Appears at mouse position (or center), expands from 0→full size with spring ease, then simulation re-runs and it drifts to its cluster.
- **Hover:** 150ms ease-out scale + opacity shift.
- **Panel slide-in:** 250ms ease-out translateX.
- **Cluster color transitions:** When re-clustering, colors morph with 600ms transition.
- **Perpetual:** Active simulation runs continuously but at very low alpha (stars drift very slowly even when not interacting).
- **Performance:** D3 force simulation in requestAnimationFrame, throttled. Canvas rendering for edges. DOM nodes for word labels (better text rendering than canvas).
- **Physics preset:** `{ strength: -30, distanceMin: 20, distanceMax: 300, theta: 0.9 }` — loose, airy clustering.

---

## 7. Landing Page Design (For GitHub README)

- Same color palette as app.
- Animated CSS star field background (no Three.js — keep landing lightweight).
- Headline + 3 feature callouts in asymmetric grid.
- Demo static screenshot of a real word universe.
- Tech badges: D3.js, Vanilla JS, Python (for LLM embedding pipeline), LocalStorage.
- GitHub-ready: clear install instructions, live demo link (GitHub Pages).

---

## 8. Anti-Patterns (Banned)

- No emojis
- No Inter font
- No pure black (#000000)
- No neon outer glows (soft radial gradients are fine — must not "glow" beyond node boundary)
- No centered hero on landing page
- No 3-column equal card grids
- No generic placeholder text
- No fake round statistics
- No "Scroll to explore" or bounce chevrons
- No floating labels — labels above inputs always
- No visible borders on cards — shadow elevation only
- No generic serif fonts
- No heavy framework dependencies (React/Vue banned for main app — D3 + vanilla JS only)

---

## 9. File Structure

```
WordUniverse/
├── index.html              # Main app
├── style.css               # All CSS, custom properties
├── app.js                  # D3 setup, simulation, interaction logic
├── components/
│   ├── modal.js            # Add/edit word modal
│   ├── panel.js            # Word detail panel
│   └── controls.js         # Top-right control panel
├── pipeline/
│   ├── embed.py            # LLM embedding generation (OpenAI/minimax API)
│   └── cluster.py          # Semantic clustering logic
├── data/
│   └── sample.json         # 20 sample words for demo
├── landing.html            # Standalone landing page
├── README.md
└── CONTRIBUTING.md
```

---

## 10. Data Model

```json
{
  "word": "ephemeral",
  "language": "en",
  "definition": "lasting for a very short time",
  "example": "Fame in the age of social media is often ephemeral.",
  "tags": ["adjective", "time", "philosophy"],
  "cluster": "abstract",          // auto-assigned by LLM
  "embedding": [0.123, -0.456, ...], // 1536-dim OpenAI or 1024-dim minimax
  "addedDate": "2025-01-15",
  "lastReviewed": "2025-02-20",
  "masteryLevel": 2,               // 0=new, 1=seen, 2=familiar, 3=mastered
  "similarWords": ["transient", "fleeting", "evanescent"]
}
```
