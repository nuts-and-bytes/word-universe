// Word Universe — Core App Logic

(function() {
  'use strict';

  const STORAGE_KEY = 'word_universe_words';
  const GUIDE_KEY = 'word_universe_guide_seen';
  const LANG_KEY = 'word_universe_lang';

  // ── i18n ────────────────────────────────────────────────────────────────

  const I18N = {
    en: {
      // UI
      all: 'All',
      learning: 'Learning',
      mastered: 'Mastered',
      addWord: 'Add word',
      // Modal
      modalTitle: 'Add a word',
      wordLabel: 'Word',
      wordPlaceholder: 'ephemeral',
      languageLabel: 'Language',
      tagsLabel: 'Tags',
      tagsPlaceholder: 'adjective, time, philosophy',
      definitionLabel: 'Definition',
      definitionPlaceholder: 'lasting for a very short time',
      exampleLabel: 'Example sentence',
      examplePlaceholder: 'Fame in social media is often ephemeral.',
      apiHint: 'OpenAI API key optional — enables real embeddings. Stored locally only.',
      cancel: 'Cancel',
      addToUniverse: 'Add to Universe',
      // Panel
      close: 'Close',
      definition: 'Definition',
      example: 'Example',
      tags: 'Tags',
      added: 'Added',
      mastery: 'Mastery',
      removeFromUniverse: 'Remove from universe',
      cluster: 'Cluster',
      // Feedback
      wordAdded: 'added to your universe',
      wordRemoved: 'removed',
      emptyError: 'Write something first.',
      // Guide
      guideTitle: 'How it works',
      guideStep1Title: 'Add words you are learning',
      guideStep1Desc: 'Type a word, its definition, and an example sentence. Each word becomes a star in your universe.',
      guideStep2Title: 'Watch meaning create shape',
      guideStep2Desc: 'Related words drift together. Abstract concepts gather on one side, concrete nouns on another. You see the shape of your knowledge.',
      guideStep3Title: 'Track your mastery',
      guideStep3Desc: 'Rate each word 0-3. Level 3 words glow gold. The universe rewards consistency — come back daily.',
      gotIt: 'Got it',
      tryIt: 'Add my first word',
      // Empty
      emptyTitle: 'Your universe is empty',
      emptyDesc: 'Add your first word to begin.',
      // Clusters
      Concrete: 'Concrete',
      Abstract: 'Abstract',
      Action: 'Action',
      Nature: 'Nature',
      Social: 'Social',
    },
    zh: {
      // UI
      all: '全部',
      learning: '学习中',
      mastered: '已掌握',
      addWord: '添加单词',
      // Modal
      modalTitle: '添加一个单词',
      wordLabel: '单词',
      wordPlaceholder: 'ephemeral',
      languageLabel: '语言',
      tagsLabel: '标签',
      tagsPlaceholder: '形容词, 时间, 哲学',
      definitionLabel: '释义',
      definitionPlaceholder: 'lasting for a very short time',
      exampleLabel: '例句',
      examplePlaceholder: 'Fame in social media is often ephemeral.',
      apiHint: 'OpenAI API key 可选 — 用于真实语义定位。仅本地存储。',
      cancel: '取消',
      addToUniverse: '添加到词宇宙',
      // Panel
      close: '关闭',
      definition: '释义',
      example: '例句',
      tags: '标签',
      added: '添加时间',
      mastery: '掌握度',
      removeFromUniverse: '从词宇宙移除',
      cluster: '语义分类',
      // Feedback
      wordAdded: '已添加到你的词宇宙',
      wordRemoved: '已移除',
      emptyError: '先输入一个单词吧。',
      // Guide
      guideTitle: '使用指南',
      guideStep1Title: '添加你正在学习的单词',
      guideStep1Desc: '输入一个单词、释义和例句。每个单词都会成为你词宇宙中的一颗星。',
      guideStep2Title: '看着意义塑造形状',
      guideStep2Desc: '相关的词会聚在一起。抽象概念在一侧，具体名词在另一侧。你能看到自己知识结构的形状。',
      guideStep3Title: '追踪掌握程度',
      guideStep3Desc: '给每个单词打 0-3 分。3 分的单词会发光。宇宙奖励坚持 — 每天回来复习。',
      gotIt: '明白了',
      tryIt: '添加第一个单词',
      // Empty
      emptyTitle: '你的词宇宙是空的',
      emptyDesc: '添加第一个单词开始探索。',
      // Clusters
      Concrete: '具体',
      Abstract: '抽象',
      Action: '动作',
      Nature: '自然',
      Social: '社交',
    },
  };

  let currentLang = 'en';

  function t(key) {
    return (I18N[currentLang] && I18N[currentLang][key]) || I18N.en[key] || key;
  }

  function detectLang() {
    const stored = localStorage.getItem(LANG_KEY);
    if (stored) return stored;
    return navigator.language && navigator.language.startsWith('zh') ? 'zh' : 'en';
  }

  function setLang(lang) {
    currentLang = lang;
    localStorage.setItem(LANG_KEY, lang);
    applyLang();
  }

  function applyLang() {
    document.querySelectorAll('[data-i18n]').forEach(function(el) {
      const key = el.getAttribute('data-i18n');
      el.textContent = t(key);
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(function(el) {
      const key = el.getAttribute('data-i18n-placeholder');
      el.placeholder = t(key);
    });
  }

  // ── Data Layer ────────────────────────────────────────────────────────────

  function loadWords() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    } catch (e) {
      return [];
    }
  }

  function saveWords(words) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(words));
  }

  function addWord(word, language, definition, example, tags, cluster, embedding) {
    const words = loadWords();
    const now = new Date().toISOString();
    words.push({
      id: Date.now(),
      word: word,
      language: language,
      definition: definition,
      example: example,
      tags: tags.filter(function(t) { return t.trim(); }),
      cluster: cluster,
      embedding: embedding,
      addedDate: now,
      lastReviewed: now,
      masteryLevel: 0,
    });
    saveWords(words);
    return words[words.length - 1];
  }

  function updateMastery(id, level) {
    const words = loadWords();
    const idx = words.findIndex(function(w) { return w.id === id; });
    if (idx === -1) return;
    words[idx].masteryLevel = level;
    words[idx].lastReviewed = new Date().toISOString();
    saveWords(words);
  }

  function deleteWord(id) {
    const words = loadWords().filter(function(w) { return w.id !== id; });
    saveWords(words);
  }

  // ── State ─────────────────────────────────────────────────────────────────

  let selectedWord = null;
  let currentFilter = 'all';
  let simulation = null;

  // ── Embeddings ─────────────────────────────────────────────────────────

  function generateFallbackEmbedding(word) {
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
    const norm = Math.sqrt(arr.reduce(function(s, v) { return s + v * v; }, 0));
    return arr.map(function(v) { return v / norm; });
  }

  function clusterWord(word) {
    const w = word.toLowerCase();
    const abstractWords = ['ephemeral', 'serendipity', 'solitude', 'wisdom', 'truth', 'justice', 'freedom', 'meaning', 'purpose', 'existence', 'transient', 'eternal', 'paradox'];
    const natureWords = ['tree', 'ocean', 'forest', 'mountain', 'river', 'sun', 'moon', 'earth', 'flower', 'animal', 'photosynthesis', 'neuron', 'ecology'];
    const actionWords = ['run', 'create', 'build', 'write', 'think', 'move', 'grow', 'change', 'discover', 'explore', 'migrate', 'evolve', 'collaborate'];
    const socialWords = ['friend', 'family', 'love', 'community', 'share', 'trust', 'support', 'together', 'empathy', 'collaborate', 'communicate'];

    if (abstractWords.indexOf(w) !== -1) return 'abstract';
    if (natureWords.indexOf(w) !== -1) return 'nature';
    if (actionWords.indexOf(w) !== -1) return 'action';
    if (socialWords.indexOf(w) !== -1) return 'social';
    return 'concrete';
  }

  async function generateEmbedding(word, apiKey) {
    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ model: 'text-embedding-3-small', input: word }),
    });
    if (!response.ok) throw new Error('API error: ' + response.status);
    const data = await response.json();
    return data.data[0].embedding.slice(0, 16);
  }

  // ── Modal ─────────────────────────────────────────────────────────────────

  function openAddModal() {
    document.getElementById('modal-overlay').classList.add('active');
    setTimeout(function() { document.getElementById('word-input').focus(); }, 100);
  }

  function closeModal() {
    document.getElementById('modal-overlay').classList.remove('active');
    document.getElementById('add-form').reset();
  }

  async function submitWord() {
    const word = document.getElementById('word-input').value.trim();
    if (!word) {
      showToast(t('emptyError'));
      return;
    }

    const language = document.getElementById('language-select').value;
    const definition = document.getElementById('definition-input').value.trim();
    const example = document.getElementById('example-input').value.trim();
    const tagsRaw = document.getElementById('tags-input').value;
    const tags = tagsRaw ? tagsRaw.split(',').map(function(t) { return t.trim(); }) : [];

    let embedding = null;
    let cluster = clusterWord(word);

    const apiKey = localStorage.getItem('openai_api_key');
    if (apiKey) {
      try {
        embedding = await generateEmbedding(word, apiKey);
      } catch (e) {
        embedding = generateFallbackEmbedding(word);
      }
    } else {
      embedding = generateFallbackEmbedding(word);
    }

    addWord(word, language, definition, example, tags, cluster, embedding);
    closeModal();
    renderGraph();
    showToast('"' + word + '" ' + t('wordAdded'));
  }

  // ── D3 Graph ──────────────────────────────────────────────────────────────

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

  async function renderGraph() {
    const container = document.getElementById('graph-container');
    container.innerHTML = '';

    // Ensure D3 loaded
    if (typeof d3 === 'undefined') {
      await new Promise(function(resolve, reject) {
        const s = document.createElement('script');
        s.src = 'https://cdn.jsdelivr.net/npm/d3@7.8.5/dist/d3.min.js';
        s.onload = resolve;
        s.onerror = reject;
        document.head.appendChild(s);
      });
    }

    const words = loadWords().filter(function(w) {
      if (currentFilter === 'learning') return w.masteryLevel < 3;
      if (currentFilter === 'mastered') return w.masteryLevel >= 3;
      return true;
    });

    if (words.length === 0) {
      container.innerHTML = '<div class="graph-empty">' +
        '<svg width="60" height="60" viewBox="0 0 60 60" fill="none">' +
        '<circle cx="30" cy="30" r="8" fill="#6B7FD7" opacity="0.6"/>' +
        '<circle cx="12" cy="18" r="4" fill="#9B8ACB" opacity="0.5"/>' +
        '<circle cx="48" cy="20" r="5" fill="#5B9A6B" opacity="0.5"/>' +
        '<circle cx="40" cy="44" r="4" fill="#E07A4A" opacity="0.5"/>' +
        '<circle cx="16" cy="46" r="3" fill="#D47F7F" opacity="0.5"/>' +
        '</svg>' +
        '<p class="graph-empty-title">' + t('emptyTitle') + '<br>' + t('emptyDesc') + '</p>' +
        '</div>';
      return;
    }

    const width = container.clientWidth;
    const height = container.clientHeight;

    const svg = d3.select(container)
      .append('svg')
      .attr('width', width)
      .attr('height', height);

    const g = svg.append('g');

    svg.call(d3.zoom()
      .scaleExtent([0.3, 4])
      .on('zoom', function(event) { g.attr('transform', event.transform); }));

    const nodes = words.map(function(w) {
      return Object.assign({}, w, {
        x: width / 2 + (Math.random() - 0.5) * 200,
        y: height / 2 + (Math.random() - 0.5) * 200,
      });
    });

    const links = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        if (!nodes[i].embedding || !nodes[j].embedding) continue;
        const sim = cosineSimilarity(nodes[i].embedding, nodes[j].embedding);
        if (sim > 0.45) {
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

    if (simulation) simulation.stop();

    simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links).id(function(d) { return d.id; }).distance(90).strength(function(d) { return d.similarity * 0.4; }))
      .force('charge', d3.forceManyBody().strength(-140))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(function(d) { return getRadius(d) + 12; }));

    const link = g.append('g')
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke', 'rgba(255,255,255,0.05)')
      .attr('stroke-width', function(d) { return Math.max(0.5, d.similarity * 1.5); });

    const node = g.append('g')
      .selectAll('g')
      .data(nodes)
      .join('g')
      .attr('class', 'node')
      .style('cursor', 'pointer')
      .call(d3.drag()
        .on('start', function(event, d) {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x; d.fy = d.y;
        })
        .on('drag', function(event, d) { d.fx = event.x; d.fy = event.y; })
        .on('end', function(event, d) {
          if (!event.active) simulation.alphaTarget(0);
          d.fx = null; d.fy = null;
        }));

    node.append('circle')
      .attr('r', function(d) { return getRadius(d) + 5; })
      .attr('fill', function(d) { return d.masteryLevel >= 3 ? goldColor : (clusterColors[d.cluster] || clusterColors.concrete); })
      .attr('opacity', 0.12);

    node.append('circle')
      .attr('r', function(d) { return getRadius(d); })
      .attr('fill', function(d) { return d.masteryLevel >= 3 ? goldColor : (clusterColors[d.cluster] || clusterColors.concrete); })
      .attr('opacity', function(d) { return d.masteryLevel >= 3 ? 0.95 : 0.75; });

    node.append('text')
      .text(function(d) { return d.word; })
      .attr('text-anchor', 'middle')
      .attr('dy', function(d) { return getRadius(d) + 14; })
      .attr('fill', 'rgba(228,228,231,0.55)')
      .attr('font-size', '10px')
      .attr('font-family', 'Outfit, system-ui, sans-serif')
      .attr('pointer-events', 'none');

    node.on('click', function(event, d) {
      event.stopPropagation();
      showWordPanel(d);
    });

    simulation.on('tick', function() {
      link
        .attr('x1', function(d) { return d.source.x; })
        .attr('y1', function(d) { return d.source.y; })
        .attr('x2', function(d) { return d.target.x; })
        .attr('y2', function(d) { return d.target.y; });
      node.attr('transform', function(d) { return 'translate(' + d.x + ',' + d.y + ')'; });
    });

    svg.on('click', function() { hideWordPanel(); });
  }

  // ── Word Detail Panel ─────────────────────────────────────────────────────

  function showWordPanel(word) {
    selectedWord = word;
    const panel = document.getElementById('word-panel');
    document.getElementById('panel-word').textContent = word.word;
    document.getElementById('panel-language').textContent = word.language.toUpperCase();
    document.getElementById('panel-cluster').textContent = t(word.cluster.charAt(0).toUpperCase() + word.cluster.slice(1));
    document.getElementById('panel-definition').textContent = word.definition || '—';
    document.getElementById('panel-example').textContent = word.example || '—';
    document.getElementById('panel-tags').textContent = word.tags.join(', ') || '—';

    const dateStr = new Date(word.addedDate).toLocaleDateString(
      currentLang === 'zh' ? 'zh-CN' : 'en-US',
      { year: 'numeric', month: 'short', day: 'numeric' }
    );
    document.getElementById('panel-date').textContent = dateStr;

    [0, 1, 2, 3].forEach(function(level) {
      document.getElementById('mastery-' + level).classList.toggle('active', level === word.masteryLevel);
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
    if (!confirm('Delete "' + selectedWord.word + '"?')) return;
    const name = selectedWord.word;
    deleteWord(selectedWord.id);
    hideWordPanel();
    renderGraph();
    showToast('"' + name + '" ' + t('wordRemoved'));
  }

  // ── Filter ────────────────────────────────────────────────────────────────

  function setFilter(filter) {
    currentFilter = filter;
    document.querySelectorAll('.filter-btn').forEach(function(btn) {
      btn.classList.toggle('active', btn.dataset.filter === filter);
    });
    renderGraph();
  }

  // ── Toast ─────────────────────────────────────────────────────────────────

  function showToast(message) {
    var toast = document.getElementById('toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'toast';
      toast.className = 'toast';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('visible');
    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(function() { toast.classList.remove('visible'); }, 2800);
  }

  // ── Guide Overlay ────────────────────────────────────────────────────────

  var guideStep = 0;

  function showGuide() {
    if (localStorage.getItem(GUIDE_KEY)) return;
    document.getElementById('guide-overlay').classList.add('active');
    guideStep = 0;
    updateGuideStep(0);
  }

  function updateGuideStep(step) {
    var steps = [
      { num: '01', title: t('guideStep1Title'), desc: t('guideStep1Desc') },
      { num: '02', title: t('guideStep2Title'), desc: t('guideStep2Desc') },
      { num: '03', title: t('guideStep3Title'), desc: t('guideStep3Desc') },
    ];

    var s = steps[step];
    document.getElementById('guide-num').textContent = s.num;
    document.getElementById('guide-step-title').textContent = s.title;
    document.getElementById('guide-step-desc').textContent = s.desc;

    document.querySelectorAll('.guide-dot').forEach(function(d, i) {
      d.classList.toggle('active', i === step);
    });

    var nextBtn = document.getElementById('guide-next');
    nextBtn.textContent = step < steps.length - 1
      ? (step === 0 ? t('tryIt') : 'Next')
      : t('gotIt');
  }

  function nextGuideStep() {
    if (guideStep < 2) {
      guideStep++;
      updateGuideStep(guideStep);
    } else {
      closeGuide();
    }
  }

  function closeGuide() {
    document.getElementById('guide-overlay').classList.remove('active');
    localStorage.setItem(GUIDE_KEY, '1');
    guideStep = 0;
  }

  function toggleLang() {
    setLang(currentLang === 'en' ? 'zh' : 'en');
  }

  // ── Init ───────────────────────────────────────────────────────────────────

  function bindEvents() {
    currentLang = detectLang();

    const langBtn = document.getElementById('lang-toggle');
    if (langBtn) langBtn.addEventListener('click', toggleLang);

    // Guide
    document.getElementById('guide-next').addEventListener('click', nextGuideStep);
    document.getElementById('guide-skip').addEventListener('click', closeGuide);

    const guideOverlay = document.getElementById('guide-overlay');
    if (guideOverlay) {
      guideOverlay.addEventListener('click', function(e) {
        if (e.target === guideOverlay) closeGuide();
      });
    }

    // Modal
    const overlay = document.getElementById('modal-overlay');
    overlay.addEventListener('click', function(e) {
      if (e.target === overlay) closeModal();
    });
    document.getElementById('modal-close').addEventListener('click', closeModal);
    document.getElementById('modal-close-btn').addEventListener('click', closeModal);
    document.getElementById('add-form').addEventListener('submit', function(e) {
      e.preventDefault();
      submitWord();
    });

    // FAB
    document.getElementById('fab-add').addEventListener('click', openAddModal);

    // Word panel
    document.getElementById('panel-close').addEventListener('click', hideWordPanel);
    document.getElementById('word-delete').addEventListener('click', deleteCurrentWord);
    [0, 1, 2, 3].forEach(function(level) {
      document.getElementById('mastery-' + level).addEventListener('click', function() {
        setMastery(level);
      });
    });

    // Filter
    document.querySelectorAll('.filter-btn').forEach(function(btn) {
      btn.addEventListener('click', function() { setFilter(btn.dataset.filter); });
    });

    // Keyboard
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
        closeModal();
        hideWordPanel();
        closeGuide();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
        e.preventDefault();
        openAddModal();
      }
    });

    // Resize
    var resizeTimer;
    window.addEventListener('resize', function() {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(renderGraph, 200);
    });
  }

  window.addEventListener('DOMContentLoaded', function() {
    bindEvents();
    applyLang();
    renderGraph();
    setTimeout(showGuide, 800);
  });
})();
