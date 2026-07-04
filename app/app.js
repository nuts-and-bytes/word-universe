// Word Universe — Core App Logic

(function() {
  'use strict';

  const STORAGE_KEY = 'word_universe_words';
  const GUIDE_KEY   = 'word_universe_guide_seen';
  const LANG_KEY    = 'word_universe_lang';
  const API_KEY     = 'openai_api_key';

  const CLUSTERS = ['concrete', 'abstract', 'action', 'nature', 'social'];
  const CLUSTER_COLORS = {
    concrete: '#6B7FD7',
    abstract: '#9B8ACB',
    action:   '#E07A4A',
    nature:   '#5B9A6B',
    social:   '#D47F7F',
  };
  const GOLD = '#C9A84C';

  // ── i18n ────────────────────────────────────────────────────────────────

  const I18N = {
    en: {
      addWord: 'Add word',
      modalTitle: 'Add a word',
      wordLabel: 'Word', wordPlaceholder: 'ephemeral',
      languageLabel: 'Language',
      tagsLabel: 'Tags', tagsPlaceholder: 'adjective, time, philosophy',
      definitionLabel: 'Definition', definitionPlaceholder: 'lasting for a very short time',
      exampleLabel: 'Example sentence', examplePlaceholder: 'Fame in social media is often ephemeral.',
      cancel: 'Cancel', save: 'Save',
      addToUniverse: 'Add to Universe',
      close: 'Close',
      definition: 'Definition', example: 'Example', tags: 'Tags',
      added: 'Added', lastReviewed: 'Last reviewed',
      mastery: 'Mastery', masteryShort: 'Mastery',
      removeFromUniverse: 'Remove from universe', cluster: 'Cluster',
      similarWords: 'Similar words',
      wordAdded: 'added to your universe', wordRemoved: 'removed',
      emptyError: 'Write something first.',
      // Stats / filter
      statTotal: 'Total', statLearning: 'Learning', statMastered: 'Mastered',
      filterAll: 'All',
      // Search
      searchPlaceholder: 'Search words…',
      searchNoResults: 'No matches',
      // Settings
      settingsTitle: 'Settings',
      apiKeyLabel: 'OpenAI API Key',
      apiKeyHint: 'Optional — enables real semantic positioning. Stored locally only.',
      apiKeySaved: 'API key saved',
      apiKeyCleared: 'API key cleared',
      shortcutsTitle: 'Keyboard shortcuts',
      scSearch: 'Focus search', scAdd: 'Add a word',
      scFit: 'Fit to view', scClose: 'Close panel / modal',
      resetData: 'Reset all words', resetConfirm: 'Delete all words? This cannot be undone.',
      // Mastery
      masteryNew: 'New', masterySeen: 'Seen',
      masteryFamiliar: 'Familiar', masteryMastered: 'Mastered',
      // Guide
      guideStep1Title: 'Add words you are learning',
      guideStep1Desc: 'Type a word, its definition, and an example sentence. Each word becomes a star in your universe.',
      guideStep2Title: 'Watch meaning create shape',
      guideStep2Desc: 'Related words drift together. Abstract concepts gather on one side, concrete nouns on another. You see the shape of your knowledge.',
      guideStep3Title: 'Track your mastery',
      guideStep3Desc: 'Rate each word 0-3. Level 3 words glow gold. The universe rewards consistency — come back daily.',
      gotIt: 'Got it', tryIt: 'Add my first word',
      // Empty
      emptyTitle: 'Your universe is empty', emptyDesc: 'Add your first word to begin.',
      // Clusters
      Concrete: 'Concrete', Abstract: 'Abstract', Action: 'Action', Nature: 'Nature', Social: 'Social',
    },
    zh: {
      addWord: '添加单词',
      modalTitle: '添加一个单词',
      wordLabel: '单词', wordPlaceholder: 'ephemeral',
      languageLabel: '语言',
      tagsLabel: '标签', tagsPlaceholder: '形容词, 时间, 哲学',
      definitionLabel: '释义', definitionPlaceholder: 'lasting for a very short time',
      exampleLabel: '例句', examplePlaceholder: 'Fame in social media is often ephemeral.',
      cancel: '取消', save: '保存',
      addToUniverse: '添加到词宇宙',
      close: '关闭',
      definition: '释义', example: '例句', tags: '标签',
      added: '添加时间', lastReviewed: '上次复习',
      mastery: '掌握度', masteryShort: '掌握',
      removeFromUniverse: '从词宇宙移除', cluster: '语义分类',
      similarWords: '相似词',
      wordAdded: '已添加到你的词宇宙', wordRemoved: '已移除',
      emptyError: '先输入一个单词吧。',
      statTotal: '总数', statLearning: '学习中', statMastered: '已掌握',
      filterAll: '全部',
      searchPlaceholder: '搜索单词…',
      searchNoResults: '没有匹配的词',
      settingsTitle: '设置',
      apiKeyLabel: 'OpenAI API Key',
      apiKeyHint: '可选 — 启用真实语义定位。仅本地存储。',
      apiKeySaved: 'API key 已保存',
      apiKeyCleared: 'API key 已清除',
      shortcutsTitle: '键盘快捷键',
      scSearch: '聚焦搜索', scAdd: '添加单词',
      scFit: '适应视图', scClose: '关闭面板 / 弹窗',
      resetData: '清空所有单词', resetConfirm: '删除所有单词？此操作无法撤销。',
      masteryNew: '新词', masterySeen: '见过',
      masteryFamiliar: '熟悉', masteryMastered: '掌握',
      guideStep1Title: '添加你正在学习的单词',
      guideStep1Desc: '输入一个单词、释义和例句。每个单词都会成为你词宇宙中的一颗星。',
      guideStep2Title: '看着意义塑造形状',
      guideStep2Desc: '相关的词会聚在一起。抽象概念在一侧，具体名词在另一侧。你能看到自己知识结构的形状。',
      guideStep3Title: '追踪掌握程度',
      guideStep3Desc: '给每个单词打 0-3 分。3 分的单词会发光。宇宙奖励坚持 — 每天回来复习。',
      gotIt: '明白了', tryIt: '添加第一个单词',
      emptyTitle: '你的词宇宙是空的', emptyDesc: '添加第一个单词开始探索。',
      Concrete: '具体', Abstract: '抽象', Action: '动作', Nature: '自然', Social: '社交',
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
    renderClusterCounts();
    renderStats();
    if (selectedWord) showWordPanel(selectedWord);
  }

  function applyLang() {
    document.querySelectorAll('[data-i18n]').forEach(function(el) {
      el.textContent = t(el.getAttribute('data-i18n'));
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(function(el) {
      el.placeholder = t(el.getAttribute('data-i18n-placeholder'));
    });
  }

  // ── Data Layer ────────────────────────────────────────────────────────────

  function loadWords() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }
    catch (e) { return []; }
  }
  function saveWords(words) { localStorage.setItem(STORAGE_KEY, JSON.stringify(words)); }

  function addWordRecord(word, language, definition, example, tags, cluster, embedding) {
    const words = loadWords();
    const now = new Date().toISOString();
    words.push({
      id: Date.now(),
      word: word, language: language, definition: definition, example: example,
      tags: tags.filter(function(t){ return t.trim(); }),
      cluster: cluster, embedding: embedding,
      addedDate: now, lastReviewed: now, masteryLevel: 0,
    });
    saveWords(words);
    return words[words.length - 1];
  }
  function updateMastery(id, level) {
    const words = loadWords();
    const idx = words.findIndex(function(w){ return w.id === id; });
    if (idx === -1) return;
    words[idx].masteryLevel = level;
    words[idx].lastReviewed = new Date().toISOString();
    saveWords(words);
  }
  function deleteWord(id) {
    saveWords(loadWords().filter(function(w){ return w.id !== id; }));
  }

  // ── State ─────────────────────────────────────────────────────────────────

  let selectedWord     = null;
  let activeClusters   = new Set(CLUSTERS);
  let masteredOnly     = false;
  let simulation       = null;
  let zoomBehavior     = null;
  let svgSel           = null;
  let gSel             = null;
  let currentNodes     = [];
  let tooltipTimer     = null;
  let searchActiveIdx  = -1;
  let searchMatches    = [];

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
    for (let i = 0; i < dim; i++) arr[i] = Math.sin(seed * (i + 1) * 0.1) * 2 - 1;
    const norm = Math.sqrt(arr.reduce(function(s,v){ return s + v*v; }, 0));
    return arr.map(function(v){ return v / norm; });
  }

  function clusterWord(word) {
    const w = word.toLowerCase();
    const abstractWords = ['ephemeral','serendipity','solitude','wisdom','truth','justice','freedom','meaning','purpose','existence','transient','eternal','paradox'];
    const natureWords   = ['tree','ocean','forest','mountain','river','sun','moon','earth','flower','animal','photosynthesis','neuron','ecology'];
    const actionWords   = ['run','create','build','write','think','move','grow','change','discover','explore','migrate','evolve','collaborate'];
    const socialWords   = ['friend','family','love','community','share','trust','support','together','empathy','communicate'];
    if (abstractWords.indexOf(w) !== -1) return 'abstract';
    if (natureWords.indexOf(w) !== -1)   return 'nature';
    if (actionWords.indexOf(w) !== -1)   return 'action';
    if (socialWords.indexOf(w) !== -1)   return 'social';
    return 'concrete';
  }

  async function generateEmbedding(word, apiKey) {
    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + apiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'text-embedding-3-small', input: word }),
    });
    if (!response.ok) throw new Error('API error: ' + response.status);
    const data = await response.json();
    return data.data[0].embedding.slice(0, 16);
  }

  function cosineSimilarity(a, b) {
    if (!a || !b || a.length !== b.length) return 0;
    let dot = 0, na = 0, nb = 0;
    for (let i = 0; i < a.length; i++) { dot += a[i]*b[i]; na += a[i]*a[i]; nb += b[i]*b[i]; }
    return dot / (Math.sqrt(na) * Math.sqrt(nb) + 1e-10);
  }

  // ── Modal ─────────────────────────────────────────────────────────────────

  function openAddModal() {
    document.getElementById('modal-overlay').classList.add('active');
    setTimeout(function(){ document.getElementById('word-input').focus(); }, 100);
  }
  function closeModal() {
    document.getElementById('modal-overlay').classList.remove('active');
    document.getElementById('add-form').reset();
  }

  async function submitWord() {
    const word = document.getElementById('word-input').value.trim();
    if (!word) { showToast(t('emptyError')); return; }

    const language   = document.getElementById('language-select').value;
    const definition = document.getElementById('definition-input').value.trim();
    const example    = document.getElementById('example-input').value.trim();
    const tagsRaw    = document.getElementById('tags-input').value;
    const tags       = tagsRaw ? tagsRaw.split(',').map(function(t){ return t.trim(); }) : [];

    let embedding = null;
    const cluster = clusterWord(word);
    const apiKey  = localStorage.getItem(API_KEY);

    if (apiKey) {
      try { embedding = await generateEmbedding(word, apiKey); }
      catch (e) { embedding = generateFallbackEmbedding(word); }
    } else {
      embedding = generateFallbackEmbedding(word);
    }

    addWordRecord(word, language, definition, example, tags, cluster, embedding);
    closeModal();
    renderAll();
    showToast('"' + word + '" ' + t('wordAdded'));
  }

  // ── D3 Graph ──────────────────────────────────────────────────────────────

  function getRadius(d) {
    const base = d.masteryLevel >= 3 ? 10 : d.masteryLevel >= 1 ? 7 : 5;
    return base + (d.word.length > 8 ? 2 : 0);
  }

  function filteredWords() {
    return loadWords().filter(function(w) {
      if (masteredOnly && w.masteryLevel < 3) return false;
      return activeClusters.has(w.cluster);
    });
  }

  async function renderGraph() {
    const container = document.getElementById('graph-container');
    container.innerHTML = '';

    if (typeof d3 === 'undefined') return;

    const words = filteredWords();

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
      svgSel = null; gSel = null; currentNodes = [];
      return;
    }

    const width  = container.clientWidth;
    const height = container.clientHeight;

    const svg = d3.select(container).append('svg').attr('width', width).attr('height', height);
    svgSel = svg;
    const g = svg.append('g');
    gSel = g;

    zoomBehavior = d3.zoom()
      .scaleExtent([0.3, 4])
      .on('zoom', function(event){ g.attr('transform', event.transform); });
    svg.call(zoomBehavior);

    const nodes = words.map(function(w) {
      return Object.assign({}, w, {
        x: width/2 + (Math.random()-0.5)*200,
        y: height/2 + (Math.random()-0.5)*200,
      });
    });
    currentNodes = nodes;

    const links = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        if (!nodes[i].embedding || !nodes[j].embedding) continue;
        const sim = cosineSimilarity(nodes[i].embedding, nodes[j].embedding);
        if (sim > 0.45) links.push({ source: i, target: j, similarity: sim });
      }
    }

    if (simulation) simulation.stop();

    simulation = d3.forceSimulation(nodes)
      .force('link',     d3.forceLink(links).id(function(d){ return d.id; }).distance(90).strength(function(d){ return d.similarity * 0.4; }))
      .force('charge',   d3.forceManyBody().strength(-140))
      .force('center',   d3.forceCenter(width/2, height/2))
      .force('collision', d3.forceCollide().radius(function(d){ return getRadius(d) + 12; }));

    const link = g.append('g').selectAll('line').data(links).join('line')
      .attr('stroke', 'rgba(255,255,255,0.05)')
      .attr('stroke-width', function(d){ return Math.max(0.5, d.similarity * 1.5); });

    const node = g.append('g').selectAll('g').data(nodes).join('g')
      .attr('class', 'node')
      .style('cursor', 'pointer')
      .call(d3.drag()
        .on('start', function(event, d){
          if (!event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x; d.fy = d.y;
        })
        .on('drag', function(event, d){ d.fx = event.x; d.fy = event.y; })
        .on('end', function(event, d){
          if (!event.active) simulation.alphaTarget(0);
          d.fx = null; d.fy = null;
        }));

    node.append('circle').attr('class', 'node-glow')
      .attr('r', function(d){ return getRadius(d) + 5; })
      .attr('fill', function(d){ return d.masteryLevel >= 3 ? GOLD : (CLUSTER_COLORS[d.cluster] || CLUSTER_COLORS.concrete); })
      .attr('opacity', 0.12);

    node.append('circle').attr('class', 'node-circle')
      .attr('r', function(d){ return getRadius(d); })
      .attr('fill', function(d){ return d.masteryLevel >= 3 ? GOLD : (CLUSTER_COLORS[d.cluster] || CLUSTER_COLORS.concrete); })
      .attr('opacity', function(d){ return d.masteryLevel >= 3 ? 0.95 : 0.75; });

    node.append('text').attr('class', 'node-label')
      .text(function(d){ return d.word; })
      .attr('text-anchor', 'middle')
      .attr('dy', function(d){ return getRadius(d) + 14; })
      .attr('fill', 'rgba(228,228,231,0.45)')
      .attr('font-size', '10px').attr('font-weight', '400')
      .attr('font-family', 'Outfit, system-ui, sans-serif')
      .attr('pointer-events', 'none');

    node
      .on('mouseenter', function(event, d) {
        const r = getRadius(d);
        const self = d3.select(this);
        self.select('.node-glow').transition().duration(150).attr('r', (r+5)*1.5).attr('opacity', 0.28);
        self.select('.node-circle').transition().duration(150).attr('r', r*1.5).attr('opacity', 1);
        self.select('.node-label').transition().duration(150)
          .attr('fill', 'rgba(228,228,231,0.9)').attr('font-size','12px').attr('font-weight','700').attr('dy', r*1.5 + 16);
        scheduleTooltip(d, event);
      })
      .on('mousemove', function(event, d) { positionTooltip(event); })
      .on('mouseleave', function(event, d) {
        const r = getRadius(d);
        const self = d3.select(this);
        self.select('.node-glow').transition().duration(150).attr('r', r+5).attr('opacity', 0.12);
        self.select('.node-circle').transition().duration(150).attr('r', r).attr('opacity', d.masteryLevel >= 3 ? 0.95 : 0.75);
        self.select('.node-label').transition().duration(150)
          .attr('fill', 'rgba(228,228,231,0.45)').attr('font-size','10px').attr('font-weight','400').attr('dy', r+14);
        hideTooltip();
      })
      .on('click', function(event, d) { event.stopPropagation(); showWordPanel(d); });

    simulation.on('tick', function() {
      link
        .attr('x1', function(d){ return d.source.x; }).attr('y1', function(d){ return d.source.y; })
        .attr('x2', function(d){ return d.target.x; }).attr('y2', function(d){ return d.target.y; });
      node.attr('transform', function(d){ return 'translate(' + d.x + ',' + d.y + ')'; });
    });

    svg.on('click', function(){ hideWordPanel(); });
    svg.on('dblclick.zoom', null);
    svg.on('dblclick', function(){ fitToView(); });
  }

  // ── Tooltip ──────────────────────────────────────────────────────────

  function scheduleTooltip(d, event) {
    clearTimeout(tooltipTimer);
    tooltipTimer = setTimeout(function(){ showTooltip(d, event); }, 200);
  }
  function showTooltip(d, event) {
    const tip = document.getElementById('star-tooltip');
    document.getElementById('tooltip-word').textContent    = d.word;
    document.getElementById('tooltip-lang').textContent    = (d.language || '').toUpperCase();
    document.getElementById('tooltip-cluster').textContent = t(capitalize(d.cluster));
    document.getElementById('tooltip-cluster').style.color = CLUSTER_COLORS[d.cluster] || '';
    document.getElementById('tooltip-def').textContent     = d.definition || '';
    const mastery = document.getElementById('tooltip-mastery');
    mastery.innerHTML = '';
    for (let i = 0; i < 4; i++) {
      const pip = document.createElement('span');
      pip.className = 'tooltip-pip' + (i < d.masteryLevel ? ' filled' : '');
      mastery.appendChild(pip);
    }
    tip.hidden = false;
    positionTooltip(event);
    requestAnimationFrame(function(){ tip.classList.add('visible'); });
  }
  function positionTooltip(event) {
    const tip = document.getElementById('star-tooltip');
    if (tip.hidden) return;
    const pad = 14;
    const rect = tip.getBoundingClientRect();
    let x = event.clientX + pad;
    let y = event.clientY + pad;
    if (x + rect.width + 8 > window.innerWidth)  x = event.clientX - rect.width - pad;
    if (y + rect.height + 8 > window.innerHeight) y = event.clientY - rect.height - pad;
    tip.style.left = Math.max(8, x) + 'px';
    tip.style.top  = Math.max(8, y) + 'px';
  }
  function hideTooltip() {
    clearTimeout(tooltipTimer);
    const tip = document.getElementById('star-tooltip');
    tip.classList.remove('visible');
    setTimeout(function(){ tip.hidden = true; }, 150);
  }

  function capitalize(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : ''; }

  // ── Word Detail Panel ─────────────────────────────────────────────────────

  function masteryLabel(level) {
    return [t('masteryNew'), t('masterySeen'), t('masteryFamiliar'), t('masteryMastered')][level] || '—';
  }

  function formatDate(iso) {
    if (!iso) return '—';
    try {
      return new Date(iso).toLocaleDateString(
        currentLang === 'zh' ? 'zh-CN' : 'en-US',
        { year: 'numeric', month: 'short', day: 'numeric' }
      );
    } catch (e) { return '—'; }
  }

  function showWordPanel(word) {
    selectedWord = word;
    const panel = document.getElementById('word-panel');
    document.getElementById('panel-word').textContent     = word.word;
    document.getElementById('panel-language').textContent = (word.language || '').toUpperCase();
    document.getElementById('panel-cluster').textContent  = t(capitalize(word.cluster));
    document.getElementById('panel-cluster').style.color  = CLUSTER_COLORS[word.cluster] || '';
    document.getElementById('panel-definition').textContent = word.definition || '—';
    document.getElementById('panel-example').textContent    = word.example || '—';
    document.getElementById('panel-tags').textContent       = (word.tags && word.tags.length) ? word.tags.join(', ') : '—';
    document.getElementById('panel-date').textContent       = formatDate(word.addedDate);
    document.getElementById('panel-reviewed').textContent   = formatDate(word.lastReviewed);
    document.getElementById('panel-mastery-label').textContent = masteryLabel(word.masteryLevel);

    // Mastery dots: level N fills dots 0..N-1; level 3 fills all + glow on dot[3]
    document.querySelectorAll('#mastery-dots .mastery-dot').forEach(function(btn) {
      const lvl  = parseInt(btn.getAttribute('data-level'), 10);
      const lvlW = word.masteryLevel;
      const filled = lvlW >= 3 ? true : (lvl < lvlW);
      btn.classList.toggle('filled', filled);
      btn.classList.toggle('mastered', lvlW >= 3 && lvl === 3);
    });
    document.getElementById('mastery-level-text').textContent = masteryLabel(word.masteryLevel);

    renderSimilarWords(word);
    panel.classList.add('open');
  }

  function renderSimilarWords(word) {
    const section = document.getElementById('similar-section');
    const list    = document.getElementById('similar-list');
    list.innerHTML = '';
    if (!word.embedding) { section.hidden = true; return; }
    const others = loadWords().filter(function(w){ return w.id !== word.id && w.embedding; });
    const scored = others.map(function(w){
      return { w: w, score: cosineSimilarity(word.embedding, w.embedding) };
    }).filter(function(x){ return x.score > 0.3; })
      .sort(function(a,b){ return b.score - a.score; })
      .slice(0, 5);

    if (scored.length === 0) { section.hidden = true; return; }
    section.hidden = false;

    scored.forEach(function(s) {
      const item = document.createElement('div');
      item.className = 'similar-item';
      const color = s.w.masteryLevel >= 3 ? GOLD : (CLUSTER_COLORS[s.w.cluster] || CLUSTER_COLORS.concrete);
      item.innerHTML =
        '<span class="similar-dot" style="background:' + color + '"></span>' +
        '<span class="similar-word"></span>' +
        '<span class="similar-score">' + (s.score * 100).toFixed(0) + '%</span>';
      item.querySelector('.similar-word').textContent = s.w.word;
      item.addEventListener('click', function(){
        showWordPanel(s.w);
        focusNode(s.w.id);
      });
      list.appendChild(item);
    });
  }

  function hideWordPanel() {
    document.getElementById('word-panel').classList.remove('open');
    selectedWord = null;
  }

  function setMastery(level) {
    if (!selectedWord) return;
    updateMastery(selectedWord.id, level);
    selectedWord.masteryLevel = level;
    selectedWord.lastReviewed = new Date().toISOString();
    renderAll();
    showWordPanel(selectedWord);
  }

  function deleteCurrentWord() {
    if (!selectedWord) return;
    if (!confirm('Delete "' + selectedWord.word + '"?')) return;
    const name = selectedWord.word;
    deleteWord(selectedWord.id);
    hideWordPanel();
    renderAll();
    showToast('"' + name + '" ' + t('wordRemoved'));
  }

  // ── Cluster Filter ────────────────────────────────────────────────────────

  function setupClusterFilter() {
    document.querySelectorAll('.cluster-chip').forEach(function(chip) {
      chip.addEventListener('click', function() {
        const k = chip.getAttribute('data-cluster');
        if (k === '__all') {
          activeClusters = new Set(CLUSTERS);
          masteredOnly = false;
        } else if (k === '__mastered') {
          masteredOnly = !masteredOnly;
        } else {
          const allActive = CLUSTERS.every(function(c){ return activeClusters.has(c); });
          if (allActive) {
            activeClusters = new Set([k]);
          } else if (activeClusters.has(k)) {
            activeClusters.delete(k);
            if (activeClusters.size === 0) activeClusters = new Set(CLUSTERS);
          } else {
            activeClusters.add(k);
          }
        }
        updateChipStates();
        renderGraph();
      });
    });
    updateChipStates();
  }

  function updateChipStates() {
    const allActive = CLUSTERS.every(function(c){ return activeClusters.has(c); });
    document.querySelectorAll('.cluster-chip').forEach(function(chip) {
      const k = chip.getAttribute('data-cluster');
      let active = false;
      if (k === '__all')      active = allActive && !masteredOnly;
      else if (k === '__mastered') active = masteredOnly;
      else                    active = activeClusters.has(k) && !allActive;
      chip.classList.toggle('active', active);
      chip.classList.toggle('dimmed', k !== '__all' && k !== '__mastered' && !allActive && !activeClusters.has(k));
    });
  }

  function renderClusterCounts() {
    const words = loadWords();
    document.querySelector('[data-count-for="__all"]').textContent      = words.length;
    document.querySelector('[data-count-for="__mastered"]').textContent = words.filter(function(w){ return w.masteryLevel >= 3; }).length;
    CLUSTERS.forEach(function(c) {
      const el = document.querySelector('[data-count-for="' + c + '"]');
      if (el) el.textContent = words.filter(function(w){ return w.cluster === c; }).length;
    });
  }

  // ── Stats ────────────────────────────────────────────────────────────

  function renderStats() {
    const words = loadWords();
    const learning = words.filter(function(w){ return w.masteryLevel < 3; }).length;
    const mastered = words.length - learning;
    document.getElementById('stat-total').textContent    = words.length;
    document.getElementById('stat-learning').textContent = learning;
    document.getElementById('stat-mastered').textContent = mastered;
  }

  // ── Search ───────────────────────────────────────────────────────────

  function setupSearch() {
    const input   = document.getElementById('search-input');
    const results = document.getElementById('search-results');
    const wrap    = document.getElementById('topbar-search');

    input.addEventListener('input', function() {
      const q = input.value.trim().toLowerCase();
      if (!q) { results.hidden = true; results.innerHTML = ''; searchMatches = []; return; }
      const words = loadWords();
      searchMatches = words.filter(function(w) {
        if (w.word.toLowerCase().includes(q)) return true;
        if (w.definition && w.definition.toLowerCase().includes(q)) return true;
        if (w.tags && w.tags.some(function(t){ return t.toLowerCase().includes(q); })) return true;
        return false;
      }).slice(0, 8);

      results.innerHTML = '';
      searchActiveIdx = -1;

      if (searchMatches.length === 0) {
        const empty = document.createElement('div');
        empty.className = 'search-empty';
        empty.textContent = t('searchNoResults');
        results.appendChild(empty);
      } else {
        searchMatches.forEach(function(w, idx) {
          const item = document.createElement('div');
          item.className = 'search-result-item';
          item.dataset.idx = idx;
          const color = w.masteryLevel >= 3 ? GOLD : (CLUSTER_COLORS[w.cluster] || CLUSTER_COLORS.concrete);
          item.innerHTML =
            '<span class="result-dot" style="background:' + color + '"></span>' +
            '<span class="result-text">' +
              '<span class="result-word"></span>' +
              '<span class="result-def"></span>' +
            '</span>' +
            (w.masteryLevel >= 3 ? '<span class="result-mastery-pip"></span>' : '');
          item.querySelector('.result-word').textContent = w.word;
          item.querySelector('.result-def').textContent  = w.definition || t(capitalize(w.cluster));
          item.addEventListener('mouseenter', function(){ setActiveResult(idx); });
          item.addEventListener('mousedown', function(e){ e.preventDefault(); pickSearchResult(idx); });
          results.appendChild(item);
        });
      }
      results.hidden = false;
    });

    input.addEventListener('keydown', function(e) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (!searchMatches.length) return;
        setActiveResult(Math.min(searchActiveIdx + 1, searchMatches.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (!searchMatches.length) return;
        setActiveResult(Math.max(searchActiveIdx - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (searchMatches.length) pickSearchResult(searchActiveIdx >= 0 ? searchActiveIdx : 0);
      } else if (e.key === 'Escape') {
        input.blur();
        results.hidden = true;
        wrap.classList.remove('mobile-open');
      }
    });

    document.addEventListener('click', function(e) {
      if (!wrap.contains(e.target)) {
        results.hidden = true;
        wrap.classList.remove('mobile-open');
      }
    });

    const mobileBtn = document.getElementById('mobile-search-btn');
    if (mobileBtn) mobileBtn.addEventListener('click', function() {
      wrap.classList.add('mobile-open');
      setTimeout(function(){ input.focus(); }, 50);
    });
  }

  function setActiveResult(idx) {
    searchActiveIdx = idx;
    document.querySelectorAll('.search-result-item').forEach(function(el) {
      el.classList.toggle('active', parseInt(el.dataset.idx, 10) === idx);
    });
  }

  function pickSearchResult(idx) {
    const w = searchMatches[idx];
    if (!w) return;
    document.getElementById('search-input').value = '';
    document.getElementById('search-results').hidden = true;
    document.getElementById('topbar-search').classList.remove('mobile-open');
    document.getElementById('search-input').blur();

    // If the word is filtered out of the current graph, reset filters
    const visible = currentNodes.some(function(n){ return n.id === w.id; });
    if (!visible) {
      activeClusters = new Set(CLUSTERS);
      masteredOnly = false;
      updateChipStates();
      renderGraph();
      setTimeout(function(){ showWordPanel(w); focusNode(w.id); }, 350);
    } else {
      showWordPanel(w);
      focusNode(w.id);
    }
  }

  function focusNode(id) {
    const target = currentNodes.find(function(n){ return n.id === id; });
    if (!target || !svgSel || !zoomBehavior) return;
    const w = svgSel.attr('width');
    const h = svgSel.attr('height');
    const scale = 1.6;
    const tx = w/2 - target.x * scale;
    const ty = h/2 - target.y * scale;
    svgSel.transition().duration(500).call(zoomBehavior.transform, d3.zoomIdentity.translate(tx, ty).scale(scale));
  }

  // ── Zoom Controls ────────────────────────────────────────────────────

  function fitToView() {
    if (!svgSel || !zoomBehavior || !currentNodes.length) return;
    const w = +svgSel.attr('width');
    const h = +svgSel.attr('height');
    const xs = currentNodes.map(function(n){ return n.x; });
    const ys = currentNodes.map(function(n){ return n.y; });
    const minX = Math.min.apply(null, xs), maxX = Math.max.apply(null, xs);
    const minY = Math.min.apply(null, ys), maxY = Math.max.apply(null, ys);
    const pad = 80;
    const bw = (maxX - minX) || 1, bh = (maxY - minY) || 1;
    const scale = Math.min(4, Math.max(0.3, Math.min((w - pad*2)/bw, (h - pad*2)/bh)));
    const tx = w/2 - ((minX + maxX)/2) * scale;
    const ty = h/2 - ((minY + maxY)/2) * scale;
    svgSel.transition().duration(450).call(zoomBehavior.transform, d3.zoomIdentity.translate(tx, ty).scale(scale));
  }

  function zoomBy(factor) {
    if (!svgSel || !zoomBehavior) return;
    svgSel.transition().duration(200).call(zoomBehavior.scaleBy, factor);
  }

  // ── Settings Popover ────────────────────────────────────────────────

  function openSettings() {
    const input = document.getElementById('api-key-input');
    input.value = localStorage.getItem(API_KEY) || '';
    document.getElementById('settings-overlay').hidden = false;
    setTimeout(function(){ input.focus(); }, 50);
  }
  function closeSettings() {
    document.getElementById('settings-overlay').hidden = true;
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
    toast._timeout = setTimeout(function(){ toast.classList.remove('visible'); }, 2800);
  }

  // ── Guide Overlay ────────────────────────────────────────────────────────

  let guideStep = 0;

  function showGuide() {
    if (localStorage.getItem(GUIDE_KEY)) return;
    document.getElementById('guide-overlay').classList.add('active');
    guideStep = 0;
    updateGuideStep(0);
  }

  function updateGuideStep(step) {
    const steps = [
      { num: '01', title: t('guideStep1Title'), desc: t('guideStep1Desc') },
      { num: '02', title: t('guideStep2Title'), desc: t('guideStep2Desc') },
      { num: '03', title: t('guideStep3Title'), desc: t('guideStep3Desc') },
    ];
    const s = steps[step];
    document.getElementById('guide-num').textContent = s.num;
    document.getElementById('guide-step-title').textContent = s.title;
    document.getElementById('guide-step-desc').textContent  = s.desc;
    document.querySelectorAll('.guide-dot').forEach(function(d, i){ d.classList.toggle('active', i === step); });
    [0,1,2].forEach(function(i){
      const el = document.getElementById('guide-visual-' + i);
      if (el) el.classList.toggle('hidden', i !== step);
    });
    const nextBtn = document.getElementById('guide-next');
    if (step === 0) nextBtn.textContent = t('tryIt');
    else if (step === steps.length - 1) nextBtn.textContent = t('gotIt');
    else nextBtn.textContent = currentLang === 'zh' ? '下一步' : 'Next';
  }

  function nextGuideStep() {
    if (guideStep < 2) { guideStep++; updateGuideStep(guideStep); }
    else closeGuide();
  }
  function closeGuide() {
    document.getElementById('guide-overlay').classList.remove('active');
    localStorage.setItem(GUIDE_KEY, '1');
    guideStep = 0;
  }

  function toggleLang() { setLang(currentLang === 'en' ? 'zh' : 'en'); }

  // ── Render combined ─────────────────────────────────────────────────

  function renderAll() {
    renderStats();
    renderClusterCounts();
    renderGraph();
  }

  // ── Init ───────────────────────────────────────────────────────────────────

  function bindEvents() {
    currentLang = detectLang();

    document.getElementById('lang-toggle').addEventListener('click', toggleLang);

    // Guide
    document.getElementById('guide-next').addEventListener('click', nextGuideStep);
    document.getElementById('guide-skip').addEventListener('click', closeGuide);
    document.getElementById('guide-overlay').addEventListener('click', function(e) {
      if (e.target.id === 'guide-overlay') closeGuide();
    });

    // Modal
    const overlay = document.getElementById('modal-overlay');
    overlay.addEventListener('click', function(e){ if (e.target === overlay) closeModal(); });
    document.getElementById('modal-close').addEventListener('click', closeModal);
    document.getElementById('modal-close-btn').addEventListener('click', closeModal);
    document.getElementById('add-form').addEventListener('submit', function(e){
      e.preventDefault();
      submitWord();
    });

    // FAB
    document.getElementById('fab-add').addEventListener('click', openAddModal);

    // Word panel
    document.getElementById('panel-close').addEventListener('click', hideWordPanel);
    document.getElementById('word-delete').addEventListener('click', deleteCurrentWord);

    // Mastery dots
    document.querySelectorAll('#mastery-dots .mastery-dot').forEach(function(btn) {
      btn.addEventListener('click', function() {
        const level = parseInt(btn.getAttribute('data-level'), 10);
        setMastery(level);
      });
    });

    // Swipe-down to close panel (mobile)
    setupPanelSwipe();

    // Cluster filter
    setupClusterFilter();

    // Search
    setupSearch();

    // Settings
    document.getElementById('settings-btn').addEventListener('click', openSettings);
    document.getElementById('settings-close').addEventListener('click', closeSettings);
    document.getElementById('settings-overlay').addEventListener('click', function(e) {
      if (e.target.id === 'settings-overlay') closeSettings();
    });
    document.getElementById('api-key-save').addEventListener('click', function() {
      const v = document.getElementById('api-key-input').value.trim();
      if (v) { localStorage.setItem(API_KEY, v); showToast(t('apiKeySaved')); }
      else   { localStorage.removeItem(API_KEY); showToast(t('apiKeyCleared')); }
      closeSettings();
    });
    document.getElementById('reset-data').addEventListener('click', function() {
      if (!confirm(t('resetConfirm'))) return;
      localStorage.removeItem(STORAGE_KEY);
      closeSettings();
      hideWordPanel();
      renderAll();
    });

    // Zoom toolbar
    document.getElementById('zoom-fit').addEventListener('click', fitToView);
    document.getElementById('zoom-in').addEventListener('click', function(){ zoomBy(1.4); });
    document.getElementById('zoom-out').addEventListener('click', function(){ zoomBy(1/1.4); });

    // Keyboard
    document.addEventListener('keydown', function(e) {
      const inField = e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable);

      if (e.key === 'Escape') {
        closeModal(); hideWordPanel(); closeGuide(); closeSettings();
      }
      if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        const wrap = document.getElementById('topbar-search');
        wrap.classList.add('mobile-open');
        document.getElementById('search-input').focus();
        document.getElementById('search-input').select();
      }
      if ((e.metaKey || e.ctrlKey) && (e.key === 'n' || e.key === 'N')) {
        e.preventDefault();
        openAddModal();
      }
      if (!inField && (e.key === 'f' || e.key === 'F')) {
        e.preventDefault();
        fitToView();
      }
    });

    // Resize
    let resizeTimer;
    window.addEventListener('resize', function() {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(renderGraph, 200);
    });
  }

  function setupPanelSwipe() {
    const panel  = document.getElementById('word-panel');
    const handle = panel.querySelector('.panel-swipe-handle');
    if (!handle) return;
    let startY = null;
    handle.addEventListener('touchstart', function(e){ startY = e.touches[0].clientY; });
    handle.addEventListener('touchmove', function(e) {
      if (startY === null) return;
      const dy = e.touches[0].clientY - startY;
      if (dy > 60) { hideWordPanel(); startY = null; }
    });
    handle.addEventListener('touchend', function(){ startY = null; });
  }

  window.addEventListener('DOMContentLoaded', function() {
    bindEvents();
    applyLang();
    renderAll();
    setTimeout(showGuide, 800);
  });
})();
