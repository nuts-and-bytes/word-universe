// Word Universe — Core App Logic

(function() {
  'use strict';

  const STORAGE_KEY = 'word_universe_words';

  // ── Data Layer ────────────────────────────────────────────────────────────

  function loadWords() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    } catch {
      return [];
    }
  }

  function saveWords(words) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(words));
  }

  function addWord(word, language, definition, example, tags, cluster, embedding) {
    const words = loadWords();
    const now = new Date().toISOString();
    const newWord = {
      id: Date.now(),
      word,
      language,
      definition,
      example,
      tags: tags.filter(t => t.trim()),
      cluster,
      embedding,
      addedDate: now,
      lastReviewed: now,
      masteryLevel: 0,
    };
    words.push(newWord);
    saveWords(words);
    return newWord;
  }

  function updateMastery(id, level) {
    const words = loadWords();
    const idx = words.findIndex(w => w.id === id);
    if (idx === -1) return;
    words[idx].masteryLevel = level;
    words[idx].lastReviewed = new Date().toISOString();
    saveWords(words);
  }

  function deleteWord(id) {
    const words = loadWords().filter(w => w.id !== id);
    saveWords(words);
  }

  // ── State ─────────────────────────────────────────────────────────────────

  let selectedWord = null;
  let simulation = null;

  // ── Modal ─────────────────────────────────────────────────────────────────

  function openAddModal() {
    const overlay = document.getElementById('modal-overlay');
    overlay.classList.add('active');
    setTimeout(() => document.getElementById('word-input').focus(), 100);
  }

  function closeModal() {
    document.getElementById('modal-overlay').classList.remove('active');
    document.getElementById('add-form').reset();
    document.getElementById('cluster-hint').textContent = '';
  }

  async function submitWord() {
    const form = document.getElementById('add-form');
    const word = document.getElementById('word-input').value.trim();
    const language = document.getElementById('language-select').value;
    const definition = document.getElementById('definition-input').value.trim();
    const example = document.getElementById('example-input').value.trim();
    const tagsRaw = document.getElementById('tags-input').value;
    const tags = tagsRaw ? tagsRaw.split(',').map(t => t.trim()) : [];

    if (!word) return;

    // Generate pseudo-embedding using LLM API if key is set, otherwise random
    let embedding = null;
    let cluster = 'abstract';
    const apiKey = localStorage.getItem('openai_api_key');
    if (apiKey) {
      try {
        const result = await generateEmbedding(word, apiKey);
        embedding = result.embedding;
        cluster = result.cluster;
      } catch (e) {
        console.warn('Embedding generation failed, using fallback', e);
        embedding = generateFallbackEmbedding(word);
        cluster = clusterWord(word);
      }
    } else {
      embedding = generateFallbackEmbedding(word);
      cluster = clusterWord(word);
    }

    addWord(word, language, definition, example, tags, cluster, embedding);
    closeModal();
    renderGraph();
    showToast(`"${word}" added to your universe`);
  }

  function generateFallbackEmbedding(word) {
    // Deterministic pseudo-embedding based on word hash
    const dim = 16;
    const arr = new Array(dim).fill(0);
    let hash = 0;
    for (let i = 0; i < word.length; i++) {
      hash = ((hash << 5) - hash) + word.charCodeAt(i);
      hash |= 0;
    }
    const seed = Math.abs(hash);
    for (let i = 0; i < dim; i++) {
      arr[i] = Math.sin(seed * (i + 1) * 0.1) * 2 - 1;
    }
    // Normalize
    const norm = Math.sqrt(arr.reduce((s, v) => s + v * v, 0));
    return arr.map(v => v / norm);
  }

  function clusterWord(word) {
    // Simple heuristic cluster assignment
    const w = word.toLowerCase();
    const abstractWords = ['ephemeral', 'serendipity', 'solitude', 'wisdom', 'truth', 'justice', 'freedom', 'meaning', 'purpose', 'existence'];
    const natureWords = ['tree', 'ocean', 'forest', 'mountain', 'river', 'sun', 'moon', 'earth', 'flower', 'animal'];
    const actionWords = ['run', 'create', 'build', 'write', 'think', 'move', 'grow', 'change', 'discover', 'explore'];
    const socialWords = ['friend', 'family', 'love', 'community', 'collaborate', 'share', 'trust', 'support', 'together'];

    if (abstractWords.includes(w)) return 'abstract';
    if (natureWords.includes(w)) return 'nature';
    if (actionWords.includes(w)) return 'action';
    if (socialWords.includes(w)) return 'social';
    return 'concrete';
  }

  async function generateEmbedding(word, apiKey) {
    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'text-embedding-3-small',
        input: word,
      }),
    });
    if (!response.ok) throw new Error(`API error: ${response.status}`);
    const data = await response.json();
    const embedding = data.data[0].embedding;
    // Reduce to 16 dims for performance
    const reduced = embedding.slice(0, 16);
    const cluster = clusterWord(word);
    return { embedding: reduced, cluster };
  }

  // ── D3 Graph ──────────────────────────────────────────────────────────────

  async function renderGraph() {
    const container = document.getElementById('graph-container');
    container.innerHTML = '';
    const words = loadWords();

    if (words.length === 0) {
      container.innerHTML = `
        <div class="graph-empty">
          <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
            <circle cx="30" cy="30" r="8" fill="#6B7FD7" opacity="0.6"/>
            <circle cx="12" cy="18" r="4" fill="#9B8ACB" opacity="0.5"/>
            <circle cx="48" cy="20" r="5" fill="#5B9A6B" opacity="0.5"/>
            <circle cx="40" cy="44" r="4" fill="#E07A4A" opacity="0.5"/>
            <circle cx="16" cy="46" r="3" fill="#D47F7F" opacity="0.5"/>
          </svg>
          <p>Your universe is empty.<br>Add your first word to begin.</p>
        </div>
      `;
      return;
    }

    const width = container.clientWidth;
    const height = container.clientHeight;

    const svg = d3.select(container)
      .append('svg')
      .attr('width', width)
      .attr('height', height);

    const g = svg.append('g');

    // Zoom
    svg.call(d3.zoom()
      .scaleExtent([0.3, 4])
      .on('zoom', (event) => g.attr('transform', event.transform)));

    const nodes = words.map(w => ({
      ...w,
      x: width / 2 + (Math.random() - 0.5) * 200,
      y: height / 2 + (Math.random() - 0.5) * 200,
    }));

    // Links based on embedding similarity
    const links = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        if (!nodes[i].embedding || !nodes[j].embedding) continue;
        const sim = cosineSimilarity(nodes[i].embedding, nodes[j].embedding);
        if (sim > 0.5) {
          links.push({ source: i, target: j, similarity: sim });
        }
      }
    }

    const clusterColors = {
      abstract: '#9B8ACB',
      nature: '#5B9A6B',
      action: '#E07A4A',
      social: '#D47F7F',
      concrete: '#6B7FD7',
    };

    const goldColor = '#C9A84C';

    simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links).id(d => d.id).distance(80).strength(d => d.similarity * 0.5))
      .force('charge', d3.forceManyBody().strength(-120))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(d => getRadius(d) + 10));

    // Links
    const link = g.append('g')
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke', 'rgba(255,255,255,0.06)')
      .attr('stroke-width', d => Math.max(0.5, d.similarity * 1.5));

    // Nodes
    const node = g.append('g')
      .selectAll('g')
      .data(nodes)
      .join('g')
      .attr('class', 'node')
      .style('cursor', 'pointer')
      .call(d3.drag()
        .on('start', (event, d) => {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x; d.fy = d.y;
        })
        .on('drag', (event, d) => { d.fx = event.x; d.fy = event.y; })
        .on('end', (event, d) => {
          if (!event.active) simulation.alphaTarget(0);
          d.fx = null; d.fy = null;
        }));

    // Glow circle
    node.append('circle')
      .attr('r', d => getRadius(d) + 4)
      .attr('fill', d => d.masteryLevel >= 3 ? goldColor : clusterColors[d.cluster] || clusterColors.concrete)
      .attr('opacity', 0.15)
      .attr('class', 'node-glow');

    // Main circle
    node.append('circle')
      .attr('r', d => getRadius(d))
      .attr('fill', d => d.masteryLevel >= 3 ? goldColor : clusterColors[d.cluster] || clusterColors.concrete)
      .attr('opacity', d => d.masteryLevel >= 3 ? 0.95 : 0.75)
      .attr('class', 'node-circle');

    // Label
    node.append('text')
      .text(d => d.word)
      .attr('text-anchor', 'middle')
      .attr('dy', d => getRadius(d) + 14)
      .attr('fill', 'rgba(228,228,231,0.6)')
      .attr('font-size', '10px')
      .attr('font-family', 'Outfit, system-ui, sans-serif')
      .attr('pointer-events', 'none');

    node.on('click', (event, d) => {
      event.stopPropagation();
      showWordPanel(d);
    });

    simulation.on('tick', () => {
      link
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);
      node.attr('transform', d => `translate(${d.x},${d.y})`);
    });

    // Click outside to deselect
    svg.on('click', () => hideWordPanel());
  }

  function getRadius(d) {
    const base = d.masteryLevel >= 3 ? 10 : d.masteryLevel >= 1 ? 7 : 5;
    return base + (d.word.length > 8 ? 2 : 0);
  }

  function cosineSimilarity(a, b) {
    if (!a || !b || a.length !== b.length) return 0;
    let dot = 0, na = 0, nb = 0;
    for (let i = 0; i < a.length; i++) {
      dot += a[i] * b[i];
      na += a[i] * a[i];
      nb += b[i] * b[i];
    }
    return dot / (Math.sqrt(na) * Math.sqrt(nb) + 1e-10);
  }

  // ── Word Detail Panel ─────────────────────────────────────────────────────

  function showWordPanel(word) {
    selectedWord = word;
    const panel = document.getElementById('word-panel');
    document.getElementById('panel-word').textContent = word.word;
    document.getElementById('panel-language').textContent = word.language.toUpperCase();
    document.getElementById('panel-cluster').textContent = word.cluster;
    document.getElementById('panel-definition').textContent = word.definition || '—';
    document.getElementById('panel-example').textContent = word.example || '—';
    document.getElementById('panel-tags').textContent = word.tags.join(', ') || '—';
    document.getElementById('panel-date').textContent = new Date(word.addedDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

    // Mastery buttons
    const mastery = word.masteryLevel;
    [0, 1, 2, 3].forEach(level => {
      const btn = document.getElementById(`mastery-${level}`);
      btn.classList.toggle('active', level === mastery);
    });

    panel.classList.add('open');
  }

  function hideWordPanel() {
    document.getElementById('word-panel').classList.remove('open');
    selectedWord = null;
  }

  function setMastery(level) {
    if (!selectedWord) return;
    updateMastery(selectedWord.id, level);
    selectedWord.masteryLevel = level;
    renderGraph();
    showWordPanel(selectedWord);
  }

  function deleteCurrentWord() {
    if (!selectedWord) return;
    if (!confirm(`Delete "${selectedWord.word}"?`)) return;
    deleteWord(selectedWord.id);
    hideWordPanel();
    renderGraph();
    showToast(`"${selectedWord.word}" removed`);
  }

  // ── Controls ──────────────────────────────────────────────────────────────

  let filterState = 'all';
  function setFilter(filter) {
    filterState = filter;
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.filter === filter);
    });
    // For now just re-render — in a full version would filter nodes
    renderGraph();
  }

  // ── Toast ─────────────────────────────────────────────────────────────────

  function showToast(message) {
    let toast = document.getElementById('toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'toast';
      toast.className = 'toast';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('visible');
    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(() => toast.classList.remove('visible'), 2800);
  }

  // ── D3 CDN check ─────────────────────────────────────────────────────────

  function ensureD3() {
    return new Promise((resolve, reject) => {
      if (window.d3) return resolve();
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/d3@7.8.5/dist/d3.min.js';
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  // ── Init ───────────────────────────────────────────────────────────────────

  function bindEvents() {
    // Modal
    const overlay = document.getElementById('modal-overlay');
    overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });
    document.getElementById('modal-close').addEventListener('click', closeModal);
    document.getElementById('add-form').addEventListener('submit', e => {
      e.preventDefault();
      submitWord();
    });

    // FAB
    document.getElementById('fab-add').addEventListener('click', openAddModal);

    // Word panel
    document.getElementById('panel-close').addEventListener('click', hideWordPanel);
    document.getElementById('word-delete').addEventListener('click', deleteCurrentWord);
    [0, 1, 2, 3].forEach(level => {
      document.getElementById(`mastery-${level}`).addEventListener('click', () => setMastery(level));
    });

    // Filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', () => setFilter(btn.dataset.filter));
    });

    // Keyboard
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') { closeModal(); hideWordPanel(); }
      if ((e.metaKey || e.ctrlKey) && e.key === 'n') { e.preventDefault(); openAddModal(); }
    });

    // Resize
    window.addEventListener('resize', () => {
      clearTimeout(window._resizeTimer);
      window._resizeTimer = setTimeout(renderGraph, 200);
    });
  }

  async function init() {
    await ensureD3();
    bindEvents();
    renderGraph();
  }

  window.addEventListener('DOMContentLoaded', init);
})();
