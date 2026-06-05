/**
 * 大北互 PWA - 主应用逻辑 v2
 * 三级分类：产品线 → 类型 → 电压等级 + 轮播图
 */
(function () {
  'use strict'

  const $ = s => document.querySelector(s)
  const $$ = s => document.querySelectorAll(s)

  // ---- DOM ----
  const headerTitle = $('#headerTitle')
  const menuBtn = $('#menuBtn')
  const closeSidebar = $('#closeSidebar')
  const sidebar = $('#sidebar')
  const overlay = $('#overlay')
  const searchBtn = $('#searchBtn')
  const searchOverlay = $('#searchOverlay')
  const searchBack = $('#searchBack')
  const searchInput = $('#searchInput')
  const searchResults = $('#searchResults')
  const bottomBar = $('#bottomBar')
  const modalOverlay = $('#modalOverlay')
  const modalBody = $('#modalBody')
  const modalClose = $('#modalClose')
  const productGrid = $('#productGrid')
  const homeProductGrid = $('#homeProductGrid')
  const emptyState = $('#emptyState')
  const lineTabs = $('#lineTabs')
  const typeTabs = $('#typeTabs')
  const voltageTabs = $('#voltageTabs')
  const seriesTabsDom = $('#seriesTabs')
  const carouselTrack = $('#carouselTrack')
  const carouselDots = $('#carouselDots')
  const carouselPrev = $('#carouselPrev')
  const carouselNext = $('#carouselNext')

  const pageTitles = { home: '首页', products: '产品中心', params: '智能选型', about: '企业简介' }

  // ---- 编辑模式 ----
  if (editMode) {
    const style = document.createElement('style')
    style.textContent = '.edit-btn{background:rgba(255,255,255,0.2);border:1px solid rgba(255,255,255,0.4);color:#fff;padding:4px 10px;border-radius:6px;font-size:11px;cursor:pointer;margin-left:8px}.edit-btn:hover{background:rgba(255,255,255,0.3)}.edit-bar{text-align:right;margin-top:12px;display:flex;gap:6px;justify-content:flex-end}.edit-bar button{padding:6px 14px;border-radius:6px;font-size:12px;cursor:pointer;border:1px solid #ccc}.edit-bar .primary{background:#0047ab;color:#fff;border-color:#0047ab}.edit-input{width:100%;padding:5px 8px;border:1.5px solid #ddd;border-radius:5px;font-size:13px;outline:0;font-family:inherit;box-sizing:border-box}.edit-input:focus{border-color:#0047ab}.edit-modal-editor table{width:100%;border-collapse:collapse;font-size:12px}.edit-modal-editor th{background:#f5f7fa;padding:5px 3px;text-align:center;font-weight:600;font-size:11px;border:1px solid #e0e0e0;white-space:nowrap}.edit-modal-editor td{padding:2px;border:1px solid #e0e0e0}.edit-modal-editor input{width:100%;border:none;padding:4px 3px;font-size:12px;text-align:center;outline:0;background:transparent;font-family:inherit}.edit-modal-editor input:focus{background:#e8f0fe}.edit-modal-editor .del{cursor:pointer;color:#d32f2f;text-align:center;font-weight:700;padding:2px 6px}.edit-old-badge{display:inline-block;background:#0047ab;color:#fff;font-size:10px;padding:2px 8px;border-radius:4px;margin-left:8px;vertical-align:middle}'
    document.head.appendChild(style)
  }

  // ---- 状态 ----
  let currentPage = 'home'
  const filter = { type: 'all', subType: 'all', series: 'all' }
  let carouselIndex = 0
  let carouselTimer = null
  let editMode = location.search.includes('edit=1')

  // =============================================
  // 轮播图
  // =============================================
  function initCarousel() {
    if (!carouselSlides || !carouselSlides.length) return
    const total = carouselSlides.length

    carouselTrack.innerHTML = carouselSlides.map((s, i) =>
      `<div class="carousel-slide" data-index="${i}">
        <img src="${s.src}" alt="${s.alt}" loading="${i === 0 ? 'eager' : 'lazy'}">
        <div class="carousel-slide-overlay">
          <h3>${s.alt}</h3>
          <p>${companyInfo.name} — ${companyInfo.slogan}</p>
        </div>
      </div>`
    ).join('')

    carouselDots.innerHTML = carouselSlides.map((_, i) =>
      `<span class="carousel-dot${i === 0 ? ' active' : ''}" data-index="${i}"></span>`
    ).join('')

    carouselDots.addEventListener('click', e => {
      const dot = e.target.closest('.carousel-dot')
      if (dot) goToSlide(parseInt(dot.dataset.index))
    })

    carouselPrev.addEventListener('click', () => goToSlide(carouselIndex - 1))
    carouselNext.addEventListener('click', () => goToSlide(carouselIndex + 1))

    startAutoPlay()

    // Touch swipe
    let startX = 0, startY = 0
    const el = document.getElementById('carousel')
    el.addEventListener('touchstart', e => { startX = e.touches[0].clientX; startY = e.touches[0].clientY }, { passive: true })
    el.addEventListener('touchend', e => {
      const dx = e.changedTouches[0].clientX - startX
      const dy = e.changedTouches[0].clientY - startY
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy))
        dx > 0 ? goToSlide(carouselIndex - 1) : goToSlide(carouselIndex + 1)
    }, { passive: true })
  }

  function goToSlide(index) {
    const total = carouselSlides.length
    if (index < 0) index = total - 1
    if (index >= total) index = 0
    carouselIndex = index
    carouselTrack.style.transform = `translateX(-${index * 100}%)`
    $$('.carousel-dot').forEach((d, i) => d.classList.toggle('active', i === index))
    resetAutoPlay()
  }

  function startAutoPlay() { if (carouselSlides.length < 2) return; stopAutoPlay(); carouselTimer = setInterval(() => goToSlide(carouselIndex + 1), 4000) }
  function stopAutoPlay() { if (carouselTimer) { clearInterval(carouselTimer); carouselTimer = null } }
  function resetAutoPlay() { stopAutoPlay(); startAutoPlay() }

  // =============================================
  // 分类筛选
  // =============================================

  function renderLineTabs() {
    lineTabs.innerHTML = ''
    lineTabs.style.display = 'none'
  }

  function renderTypeTabs() {
    typeTabs.innerHTML = types.map(t =>
      `<button class="filter-tab${t.id === filter.type ? ' active' : ''}" data-type="${t.id}">${t.icon || ''} ${t.name}</button>`
    ).join('')
  }

  function renderSubTypeTabs() {
    let subTypes = []
    if (filter.type === 'current') {
      subTypes = [
        { id: 'all', name: '全部型号' },
        { id: 'post', name: '支柱式电流互感器' },
        { id: 'wall', name: '穿墙式电流互感器' },
        { id: 'outdoor', name: '户外电流、电压互感器' },
        { id: 'zero', name: '零序电流互感器' },
        { id: 'rail_ct', name: '机车动车电流互感器' }
      ]
    } else if (filter.type === 'voltage') {
      subTypes = [
        { id: 'all', name: '全部型号' },
        { id: 'vt36', name: '3.6-12KV电压互感器' },
        { id: 'vtOutdoor', name: '3.6-12KV户外电压互感器' },
        { id: 'rail_vt', name: '机车动车电压互感器' }
      ]
    }
    if (subTypes.length) {
      voltageTabs.innerHTML = subTypes.map(s =>
        `<button class="filter-tab voltage-tab${s.id === filter.subType ? ' active' : ''}" data-subtype="${s.id}">${s.name}</button>`
      ).join('')
      voltageTabs.style.display = ''
    } else {
      voltageTabs.innerHTML = ''
      voltageTabs.style.display = 'none'
    }
  }

  function selectLine(id) {
    // no longer used
  }

  function selectType(id) {
    filter.type = id; filter.subType = 'all'; filter.series = 'all'
    renderTypeTabs(); renderSubTypeTabs(); renderSeriesView(); renderFilteredProducts()
  }

  function selectSubType(id) {
    filter.subType = id; filter.series = 'all'
    renderSubTypeTabs(); renderSeriesView(); renderFilteredProducts()
  }

  function renderSeriesView() {
    if (filter.type === 'current' && filter.subType === 'post') {
      if (filter.series === 'all') {
        seriesTabsDom.innerHTML = ''
        seriesTabsDom.style.display = 'none'
      } else {
        // Show back button + series name when in a series
        const s = series.find(x => x.id === filter.series)
        seriesTabsDom.innerHTML = `<div style="display:flex;align-items:center;gap:10px;padding:6px 16px">
          <button class="filter-tab" id="backToSeriesBtn" style="padding:4px 12px;font-size:12px">← 返回系列</button>
          <span style="font-size:14px;font-weight:600;color:var(--text)">${s ? s.name : ''}</span>
        </div>`
        seriesTabsDom.style.display = ''
      }
    } else {
      seriesTabsDom.innerHTML = ''
      seriesTabsDom.style.display = 'none'
    }
  }

  function selectSeries(id) {
    filter.series = id
    renderSeriesView(); renderFilteredProducts()
  }

  function buildSeriesCard(s) {
    const imgSrc = `images/series/${s.id}.jpg`
    return `<div class="product-card series-card" data-series="${s.id}" role="button" tabindex="0" style="cursor:pointer">
      <div class="product-card-img" style="background:var(--primary-light);display:flex;align-items:center;justify-content:center;font-size:48px;opacity:0.6">
        <img src="${imgSrc}" alt="${s.name}" loading="lazy" onerror="this.style.display='none';this.parentElement.innerHTML='🏛️'" style="width:100%;height:100%;object-fit:contain;padding:12px;display:block">
      </div>
      <div class="product-card-body" style="text-align:center">
        <h4 class="product-card-name" style="font-size:15px;text-align:center">${s.name}</h4>
      </div>
    </div>`
  }

  // 统一事件代理
  document.addEventListener('click', function (e) {
    const typeBtn = e.target.closest('#typeTabs .filter-tab')
    if (typeBtn) { e.preventDefault(); selectType(typeBtn.dataset.type); return }
    const subBtn = e.target.closest('#voltageTabs .filter-tab')
    if (subBtn) { e.preventDefault(); selectSubType(subBtn.dataset.subtype); return }
    const backBtn = e.target.closest('#backToSeriesBtn')
    if (backBtn) { e.preventDefault(); filter.series = 'all'; renderSeriesView(); renderFilteredProducts(); return }
    const serCard = e.target.closest('.series-card')
    if (serCard) { e.preventDefault(); selectSeries(serCard.dataset.series); return }
  })

  // =============================================
  // 产品筛选与渲染
  // =============================================

  function getFilteredProducts() {
    return products.filter(p => {
      if (filter.type !== 'all') {
        if (filter.type === 'current') {
          if (filter.subType === 'all') return p.type === 'post' || p.type === 'wall' || p.type === 'outdoor' || p.type === 'zero' || p.type === 'rail_ct'
          if (filter.subType === 'post') {
            if (filter.series !== 'all') return p.type === 'post' && p.series === filter.series
            return p.type === 'post'
          }
          return p.type === filter.subType
        } else if (filter.type === 'voltage') {
          if (filter.subType === 'all') return p.type === 'vt36' || p.type === 'vtOutdoor' || p.type === 'rail_vt'
          return p.type === filter.subType
        } else if (p.type !== filter.type) return false
      }
      return true
    })
  }

  function renderFilteredProducts() {
    // Show series cards when in 支柱式 series overview
    if (filter.type === 'current' && filter.subType === 'post' && filter.series === 'all') {
      emptyState.style.display = 'none'
      productGrid.innerHTML = series.filter(s => s.id !== 'all').map(s => buildSeriesCard(s)).join('')
      return
    }
    const list = getFilteredProducts()
    if (!list.length) { productGrid.innerHTML = ''; emptyState.style.display = 'flex'; return }
    emptyState.style.display = 'none'
    productGrid.innerHTML = list.map(p => buildCard(p)).join('')
    bindCardClicks(productGrid)
  }

  function renderHomeProducts() {
    const hot = products.slice(0, 6)
    homeProductGrid.innerHTML = hot.map(p => buildCard(p)).join('')
    bindCardClicks(homeProductGrid)
  }

  function buildCard(p) {
    const typeNames = { current: '电流互感器', voltage: '电压互感器', combined: '组合互感器', zero: '零序电流互感器', post: '3.6-12KV支柱式电流互感器', wall: '3.6-12KV穿墙式电流互感器', outdoor: '3.6-12KV户外电流、电压互感器', vt36: '3.6-12KV电压互感器', vtOutdoor: '3.6-12KV户外电压互感器', rail_ct: '机车动车电流互感器', rail_vt: '机车动车电压互感器' }
    const typeIcons = { current: '⚡', voltage: '🔌', combined: '🔗', zero: '🔄', post: '🏛️', wall: '🧱', outdoor: '🌲', vt36: '🔌', vtOutdoor: '🌲', rail_ct: '🚂', rail_vt: '🚄' }
    return `<div class="product-card" data-id="${p.id}" role="button" tabindex="0">
      <div class="product-card-img">
        <span class="line-badge">${p.type === 'rail_ct' ? '机车动车' : p.type === 'rail_vt' ? '机车动车' : ''}</span>
        <img src="${p.cardImage || p.image}" alt="${p.name}" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
        <span style="font-size:32px;opacity:0.35;display:none">${typeIcons[p.type] || '📦'}</span>
      </div>
      <div class="product-card-body">
        <span class="product-card-type${p.type === 'voltage' ? ' voltage-t' : ''}">${typeNames[p.type] || ''}</span>
        <h4 class="product-card-name">${p.name}</h4>
        ${p.voltage ? `<p class="product-card-voltage">${p.voltage.replace('KV', 'kV')}</p>` : ''}
        <p class="product-card-summary">${p.summary}</p>
      </div>
    </div>`
  }

  function bindCardClicks(container) {
    container.querySelectorAll('.product-card').forEach(card => {
      card.addEventListener('click', () => {
        const p = products.find(x => x.id === card.dataset.id)
        if (p) showDetail(p)
      })
    })
  }

  // =============================================
  // 智能选型（参数筛选）
  // =============================================

  function getSpecValue(p, key) {
    const s = p.specs.find(s => s.label.includes(key))
    return s ? s.value : ''
  }

  function doParamFilter() {
    const v = $('#pv_voltage').value
    const t = $('#pv_type').value
    const a = $('#pv_accuracy').value.trim().toLowerCase()
    const c = $('#pv_capacity').value.trim().toLowerCase()
    const d = $('#pv_dimension').value.trim().toLowerCase()

    const result = products.filter(p => {
      if (v !== 'all' && p.voltage !== v) return false
      if (t !== 'all' && p.type !== t) return false
      if (a) {
        const accVal = getSpecValue(p, '准确级').toLowerCase()
        if (!accVal.includes(a)) return false
      }
      if (c) {
        const capVal = getSpecValue(p, '额定容量').toLowerCase()
        if (!capVal.includes(c)) return false
      }
      if (d) {
        const dims = p.dimensions || {}
        const dimStr = [dims.length, dims.width, dims.height, dims.weight].join(' ').toLowerCase()
        if (!dimStr.includes(d)) return false
      }
      return true
    })

    const count = $('#paramsCount')
    const grid = $('#paramsProductGrid')
    const results = $('#paramsResults')
    results.style.display = ''

    if (!result.length) {
      count.textContent = '未找到匹配产品'
      grid.innerHTML = ''
      return
    }
    count.textContent = `共匹配 ${result.length} 个产品`
    grid.innerHTML = result.map(p => buildCard(p)).join('')
    bindCardClicks(grid)
  }

  // Expose for inline onclick
  window.doParamFilterFn = doParamFilter

  function renderParamsPage() {
    // Reset form and clear results on page enter
    $('#pv_voltage').value = 'all'
    $('#pv_type').value = 'all'
    $('#pv_accuracy').value = ''
    $('#pv_capacity').value = ''
    $('#pv_dimension').value = ''
    $('#paramsResults').style.display = 'none'
  }

  // =============================================
  // 搜索
  // =============================================

  function openSearch() {
    searchOverlay.classList.add('open')
    setTimeout(() => searchInput.focus(), 150)
    searchInput.value = ''; searchResults.innerHTML = ''
  }

  function closeSearch() {
    searchOverlay.classList.remove('open')
    searchInput.value = ''; searchResults.innerHTML = ''
  }

  function doSearch(q) {
    if (!q) { searchResults.innerHTML = ''; return }
    const r = products.filter(p => {
      const s = q.toLowerCase()
      const fields = [p.name, p.id, p.summary, getTypeName(p.type), getLineName(p.line), p.voltage || '']
      if (fields.some(f => f.toLowerCase().includes(s))) return true
      return p.specs.some(x => x.label.toLowerCase().includes(s) || x.value.toLowerCase().includes(s))
    })
    if (!r.length) { searchResults.innerHTML = `<div class="empty-state"><span class="empty-icon">🔍</span><p>未找到相关产品</p></div>`; return }
    const ti = { current: '⚡', voltage: '🔌', combined: '🔗', zero: '🔄', post: '🏛️', wall: '🧱', outdoor: '🌲', vt36: '🔌', vtOutdoor: '🌲', rail_ct: '🚂', rail_vt: '🚄' }
    searchResults.innerHTML = r.map(p => `<div class="search-result-item" data-id="${p.id}">
      <span class="search-result-icon">${ti[p.type] || '📦'}</span>
      <div class="search-result-info">
        <span class="search-result-badge">${getTypeName(p.type)}</span>
        <p class="search-result-name">${h(p.name, q)}</p>
        <p class="search-result-summary">${h(p.summary, q)}</p>
      </div>
    </div>`).join('')
    searchResults.querySelectorAll('.search-result-item').forEach(el => {
      el.addEventListener('click', () => {
        const p = products.find(x => x.id === el.dataset.id)
        if (p) { closeSearch(); showDetail(p) }
      })
    })
  }

  function h(t, q) { if (!q) return t; const i = t.toLowerCase().indexOf(q.toLowerCase()); return i === -1 ? t : t.slice(0, i) + '<mark>' + t.slice(i, i + q.length) + '</mark>' + t.slice(i + q.length) }
  function getTypeName(id) { const m = { current: '电流互感器', voltage: '电压互感器', combined: '组合互感器', zero: '零序电流互感器' }; return m[id] || '' }
  function getLineName(id) { return '' }

  // =============================================
  // 产品详情（支持编辑模式）
  // =============================================

  function showDetail(p) {
    const ln = {}
    const tn = { current: '电流互感器', voltage: '电压互感器', combined: '组合互感器', zero: '零序电流互感器', post: '3.6-12KV支柱式电流互感器', wall: '3.6-12KV穿墙式电流互感器', outdoor: '3.6-12KV户外电流、电压互感器', vt36: '3.6-12KV电压互感器', vtOutdoor: '3.6-12KV户外电压互感器', rail_ct: '机车动车电流互感器', rail_vt: '机车动车电压互感器' }

    if (editMode) {
      modalBody.innerHTML = buildEditForm(p, tn, ln)
    } else {
      modalBody.innerHTML = buildViewDetail(p, tn, ln)
    }

    modalOverlay.classList.add('visible')
    document.body.style.overflow = 'hidden'
  }

  function esc(s) { return (s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;') }

  function buildViewDetail(p, tn, ln) {
    return `
      <span class="line-label">${ln[p.line] || ''}</span>
      <span class="product-card-type${p.type === 'voltage' ? ' voltage-t' : ''}">${tn[p.type] || ''}</span>
      <h3 class="product-card-name">${p.name}</h3>
      ${p.voltage ? `<p class="product-card-voltage">电压等级：${p.voltage.replace('KV', 'kV')}</p>` : ''}
      <p class="product-card-summary">${p.summary}</p>
      <div class="modal-img">
        <img src="${p.image}" alt="${p.name}外形图" loading="lazy" onerror="this.parentElement.classList.add('img-error')">
      </div>
      <div class="modal-desc"><h4>产品描述</h4><p>${p.description}</p></div>
      <div class="modal-specs"><h4>技术参数</h4><table class="specs-table">${p.specs.map(s => `<tr><td>${s.label}</td><td>${s.value}</td></tr>`).join('')}</table></div>
      ${p.ratings ? `
      <div class="modal-ratings"><h4>额定电流/负荷对照表</h4>
        <div class="ratings-table-wrap">
          <table class="ratings-table">
            <thead><tr><th>额定一次电流 (A)</th><th>一秒热电流 (kA)</th><th>动稳定电流 (kA)</th><th>准确级组合</th><th>额定二次输出 (VA)</th><th>表面爬电距离 (mm)</th><th>重量 (kg)</th></tr></thead>
            <tbody>${p.ratings.map(r => `<tr><td>${r.primary}</td><td>${r.thermal}</td><td>${r.dynamic}</td><td>${r.accuracy}</td><td>${r.output}</td><td>${r.creepage}</td><td>${r.weight}</td></tr>`).join('')}</tbody>
          </table>
        </div>
      </div>` : ''}
      ${p.vtRatings ? `
      <div class="modal-ratings"><h4>电压互感器技术参数对照表</h4>
        <div class="ratings-table-wrap">
          <table class="ratings-table">
            <thead><tr><th>额定电压比</th><th>准确级及准确级组合</th><th>额定二次输出 (VA)</th><th>极限输出 (VA)</th><th>额定绝缘水平</th><th>表面爬电距离 (mm)</th><th>重量 (kg)</th></tr></thead>
            <tbody>${p.vtRatings.map(r => `<tr><td>${r.ratio}</td><td>${r.accuracy}</td><td>${r.output}</td><td>${r.limitOutput}</td><td>${r.insulation}</td><td>${r.creepage}</td><td>${r.weight}</td></tr>`).join('')}</tbody>
          </table>
        </div>
      </div>` : ''}
      <div class="modal-features"><h4>产品特点</h4><ul>${p.features.map(f => `<li>${f}</li>`).join('')}</ul></div>`
  }

  function buildEditForm(p, tn, ln) {
    // Build editable specs table
    const specsRows = p.specs.map((s, i) =>
      `<tr><td><input class="edit-input" value="${esc(s.label)}" data-si="${i}" data-sk="l"></td><td><input class="edit-input" value="${esc(s.value)}" data-si="${i}" data-sk="v"></td><td class="del" onclick="editRmSpec(${i})">×</td></tr>`
    ).join('')

    // Build ratings table
    const ratingsHtml = p.ratings ? `
      <div class="modal-ratings"><h4>⚡ 电流对照表 <button onclick="editAddRating()" style="float:right;padding:2px 8px;border:1px solid #ccc;border-radius:4px;background:#fff;cursor:pointer;font-size:11px">+ 行</button></h4>
      <div class="edit-modal-editor"><table><thead><tr><th>一次电流</th><th>热电流</th><th>动稳定</th><th>准确级</th><th>二次输出</th><th>爬电距离</th><th>重量</th><th></th></tr></thead><tbody>
      ${p.ratings.map((r, i) => `<tr>${['primary','thermal','dynamic','accuracy','output','creepage','weight'].map(f => `<td><input class="edit-input" value="${esc(r[f]||'')}" data-ri="${i}" data-rf="${f}"></td>`).join('')}<td class="del" onclick="editRmRating(${i})">×</td></tr>`).join('')}
      </tbody></table></div></div>` : ''

    const vtRatingsHtml = p.vtRatings ? `
      <div class="modal-ratings"><h4>🔌 电压对照表 <button onclick="editAddVtRating()" style="float:right;padding:2px 8px;border:1px solid #ccc;border-radius:4px;background:#fff;cursor:pointer;font-size:11px">+ 行</button></h4>
      <div class="edit-modal-editor"><table><thead><tr><th>电压比</th><th>准确级</th><th>二次输出</th><th>极限输出</th><th>绝缘水平</th><th>爬电距离</th><th>重量</th><th></th></tr></thead><tbody>
      ${p.vtRatings.map((r, i) => `<tr>${['ratio','accuracy','output','limitOutput','insulation','creepage','weight'].map(f => `<td><input class="edit-input" value="${esc(r[f]||'')}" data-vi="${i}" data-vf="${f}"></td>`).join('')}<td class="del" onclick="editRmVtRating(${i})">×</td></tr>`).join('')}
      </tbody></table></div></div>` : ''

    // Features editable list
    const featHtml = p.features.map((f, i) =>
      `<span style="display:inline-flex;align-items:center;gap:4px;background:#f5f7fa;border-radius:4px;padding:2px 6px;font-size:12px;margin:2px">${esc(f)}<span class="del" onclick="editRmFeat(${i})" style="cursor:pointer;color:#d32f2f;font-weight:700;margin-left:3px">×</span></span>`
    ).join('')

    return `
      <div style="max-height:70vh;overflow-y:auto">
      <span class="product-card-type${p.type === 'voltage' ? ' voltage-t' : ''}">${tn[p.type] || ''}</span>
      <h3 class="product-card-name">编辑: ${p.name}</h3>

      <div style="margin:10px 0">
        <div style="display:flex;gap:8px;margin-bottom:6px">
          <div style="flex:1"><label style="font-size:11px;font-weight:600;color:#666">名称</label><input class="edit-input" value="${esc(p.name)}" id="ef_name"></div>
          <div style="flex:1"><label style="font-size:11px;font-weight:600;color:#666">ID</label><input class="edit-input" value="${esc(p.id)}" id="ef_id" readonly style="background:#f5f5f5"></div>
        </div>
        <div style="display:flex;gap:8px;margin-bottom:6px">
          <div style="flex:1"><label style="font-size:11px;font-weight:600;color:#666">类型</label><input class="edit-input" value="${esc(p.type)}" id="ef_type"></div>
          <div style="flex:1"><label style="font-size:11px;font-weight:600;color:#666">电压</label><input class="edit-input" value="${esc(p.voltage||'')}" id="ef_voltage"></div>
          <div style="flex:1"><label style="font-size:11px;font-weight:600;color:#666">产品线</label><input class="edit-input" value="${esc(p.line)}" id="ef_line"></div>
        </div>
        <div style="margin-bottom:6px"><label style="font-size:11px;font-weight:600;color:#666">摘要</label><input class="edit-input" value="${esc(p.summary)}" id="ef_summary"></div>
        <div style="display:flex;gap:8px;margin-bottom:6px">
          <div style="flex:1"><label style="font-size:11px;font-weight:600;color:#666">卡片图片</label><input class="edit-input" value="${esc(p.cardImage||'')}" id="ef_cimg"></div>
          <div style="flex:1"><label style="font-size:11px;font-weight:600;color:#666">详情图片</label><input class="edit-input" value="${esc(p.image||'')}" id="ef_img"></div>
        </div>
      </div>

      <div style="margin:10px 0">
        <h4 style="font-size:13px;font-weight:600;margin-bottom:6px;padding-bottom:4px;border-bottom:1px solid #eee">📐 外形尺寸</h4>
        <div style="display:flex;gap:8px">
          <div style="flex:1"><label style="font-size:11px;font-weight:600;color:#666">长(mm)</label><input class="edit-input" value="${esc(p.dimensions?.length||'')}" id="ef_dl"></div>
          <div style="flex:1"><label style="font-size:11px;font-weight:600;color:#666">宽(mm)</label><input class="edit-input" value="${esc(p.dimensions?.width||'')}" id="ef_dw"></div>
          <div style="flex:1"><label style="font-size:11px;font-weight:600;color:#666">高(mm)</label><input class="edit-input" value="${esc(p.dimensions?.height||'')}" id="ef_dh"></div>
          <div style="flex:1"><label style="font-size:11px;font-weight:600;color:#666">重(kg)</label><input class="edit-input" value="${esc(p.dimensions?.weight||'')}" id="ef_dwt"></div>
        </div>
      </div>

      <div style="margin:10px 0">
        <h4 style="font-size:13px;font-weight:600;margin-bottom:6px;padding-bottom:4px;border-bottom:1px solid #eee">📋 规格参数 <button onclick="editAddSpec()" style="float:right;padding:2px 8px;border:1px solid #ccc;border-radius:4px;background:#fff;cursor:pointer;font-size:11px">+</button></h4>
        <div class="edit-modal-editor"><table><thead><tr><th>参数名</th><th>参数值</th><th></th></tr></thead><tbody>${specsRows}</tbody></table></div>
      </div>

      ${ratingsHtml}
      ${vtRatingsHtml}

      <div style="margin:10px 0">
        <h4 style="font-size:13px;font-weight:600;margin-bottom:6px;padding-bottom:4px;border-bottom:1px solid #eee">📄 描述</h4>
        <textarea class="edit-input" id="ef_desc" rows="3" style="resize:vertical">${esc(p.description)}</textarea>
      </div>

      <div style="margin:10px 0">
        <h4 style="font-size:13px;font-weight:600;margin-bottom:6px;padding-bottom:4px;border-bottom:1px solid #eee">⭐ 产品特点
          <span style="float:right"><input id="ef_newFeat" placeholder="新特点..." style="padding:3px 6px;border:1px solid #ddd;border-radius:4px;font-size:11px;width:140px"><button onclick="editAddFeat()" style="padding:3px 8px;border:1px solid #ccc;border-radius:4px;background:#fff;cursor:pointer;font-size:11px;margin-left:4px">添加</button></span>
        </h4>
        <div>${featHtml || '<span style="font-size:12px;color:#999">暂无</span>'}</div>
      </div>

      <div class="edit-bar">
        <button onclick="editSave()" class="primary">💾 保存</button>
        <button onclick="editExport()">📥 导出JS</button>
      </div>
      </div>`
  }

  function closeModal() { modalOverlay.classList.remove('visible'); document.body.style.overflow = '' }

  // ========== 编辑模式辅助函数 ==========
  if (editMode) {
    // 使用 window 对象暴露给 onclick
    window.editSave = function() {
      const p = products.find(x => x.id === document.getElementById('ef_id').value)
      if (!p) return
      p.name = document.getElementById('ef_name').value
      p.type = document.getElementById('ef_type').value
      p.line = document.getElementById('ef_line').value
      p.voltage = document.getElementById('ef_voltage').value || null
      p.summary = document.getElementById('ef_summary').value
      p.cardImage = document.getElementById('ef_cimg').value
      p.image = document.getElementById('ef_img').value
      p.description = document.getElementById('ef_desc').value
      p.dimensions = p.dimensions || {}
      p.dimensions.length = document.getElementById('ef_dl').value
      p.dimensions.width = document.getElementById('ef_dw').value
      p.dimensions.height = document.getElementById('ef_dh').value
      p.dimensions.weight = document.getElementById('ef_dwt').value

      // Save specs
      document.querySelectorAll('[data-si]').forEach(el => {
        const i = parseInt(el.dataset.si), k = el.dataset.sk
        if (!p.specs[i]) p.specs[i] = {label:'',value:''}
        if (k === 'l') p.specs[i].label = el.value
        else p.specs[i].value = el.value
      })
      // Save ratings
      document.querySelectorAll('[data-ri]').forEach(el => {
        const i = parseInt(el.dataset.ri), f = el.dataset.rf
        if (!p.ratings[i]) p.ratings[i] = {}
        p.ratings[i][f] = el.value
      })
      // Save vtRatings
      document.querySelectorAll('[data-vi]').forEach(el => {
        const i = parseInt(el.dataset.vi), f = el.dataset.vf
        if (!p.vtRatings[i]) p.vtRatings[i] = {}
        p.vtRatings[i][f] = el.value
      })
      // 关闭弹窗刷新页面
      closeModal()
      renderFilteredProducts()
      alert('✅ 已保存！点顶部"📥 导出JS"下载更新后的文件')
    }

    window.editExport = function() {
      // 将 products 数组转为 JS 字符串
      let js = JSON.stringify(products, null, 2)
      js = js.replace(/"([a-zA-Z_$]\w*)":/g, '$1:')  // 去属性名引号
      js = js.replace(/'/g, "\\'")
      js = js.replace(/"/g, "'")

      const content = `// 大北互产品数据 - 由编辑模式导出
const products = ${js};

if (typeof module !== 'undefined') {
  module.exports = { products, companyInfo }
}`
      const blob = new Blob([content], {type:'application/javascript'})
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = 'products.js'
      a.click()
      alert('✅ 已导出！将文件替换到仓库 js/products.js\n然后 git push 部署')
    }

    window.editAddSpec = function() {
      const p = products.find(x => x.id === document.getElementById('ef_id').value)
      if (!p) return
      p.specs.push({label:'',value:''})
      showDetail(p)
    }
    window.editRmSpec = function(i) {
      const p = products.find(x => x.id === document.getElementById('ef_id').value)
      if (!p) return; p.specs.splice(i,1); showDetail(p)
    }
    window.editAddRating = function() {
      const p = products.find(x => x.id === document.getElementById('ef_id').value)
      if (!p) return
      p.ratings.push({primary:'',thermal:'',dynamic:'',accuracy:'',output:'',creepage:'',weight:''})
      showDetail(p)
    }
    window.editRmRating = function(i) {
      const p = products.find(x => x.id === document.getElementById('ef_id').value)
      if (!p) return; p.ratings.splice(i,1); showDetail(p)
    }
    window.editAddVtRating = function() {
      const p = products.find(x => x.id === document.getElementById('ef_id').value)
      if (!p) return
      p.vtRatings.push({ratio:'',accuracy:'',output:'',limitOutput:'',insulation:'',creepage:'',weight:''})
      showDetail(p)
    }
    window.editRmVtRating = function(i) {
      const p = products.find(x => x.id === document.getElementById('ef_id').value)
      if (!p) return; p.vtRatings.splice(i,1); showDetail(p)
    }
    window.editAddFeat = function() {
      const input = document.getElementById('ef_newFeat')
      if (!input || !input.value.trim()) return
      const p = products.find(x => x.id === document.getElementById('ef_id').value)
      if (!p) return; p.features.push(input.value.trim()); input.value=''; showDetail(p)
    }
    window.editRmFeat = function(i) {
      const p = products.find(x => x.id === document.getElementById('ef_id').value)
      if (!p) return; p.features.splice(i,1); showDetail(p)
    }
  }

  // =============================================
  // 页面路由
  // =============================================

  function navigateTo(page) {
    currentPage = page
    $$('.page').forEach(p => p.classList.remove('active'))
    const t = $(`#page-${page}`)
    if (t) t.classList.add('active')
    headerTitle.textContent = pageTitles[page] || ''
    bottomBar.querySelectorAll('.bottom-bar-item').forEach(i => i.classList.toggle('active', i.dataset.page === page))
    sidebar.querySelectorAll('[data-page]').forEach(a => a.classList.toggle('active', a.dataset.page === page))
    if (searchOverlay.classList.contains('open')) closeSearch()
    closeSidebarFn()
    if (page === 'home') renderHomeProducts()
    if (page === 'products') { renderTypeTabs(); renderSubTypeTabs(); renderSeriesView(); renderFilteredProducts() }
    if (page === 'params') { renderParamsPage() }
  }

  function openSidebar() { sidebar.classList.add('open'); overlay.classList.add('visible') }
  function closeSidebarFn() { sidebar.classList.remove('open'); overlay.classList.remove('visible') }

  // =============================================
  // 联系方式
  // =============================================

  function fillContact() {
    const c = companyInfo.contact
    $$('#contactAddress, #aboutAddress').forEach(el => { el.textContent = c.address })
    $$('#contactPhone, #aboutPhone').forEach(el => { el.textContent = c.phone })
    $$('#contactEmail, #aboutEmail').forEach(el => { el.textContent = c.email })
    $$('#contactWebsite, #aboutWebsite').forEach(el => { el.textContent = c.website })
  }

  // =============================================
  // 事件绑定
  // =============================================

  function bindEvents() {
    bottomBar.querySelectorAll('.bottom-bar-item').forEach(item => {
      item.addEventListener('click', () => navigateTo(item.dataset.page))
    })
    sidebar.querySelectorAll('[data-page]').forEach(a => {
      a.addEventListener('click', e => { e.preventDefault(); navigateTo(a.dataset.page) })
    })
    document.querySelectorAll('[data-page-link]').forEach(el => {
      el.addEventListener('click', e => {
        e.preventDefault()
        const type = el.dataset.type; if (type) { filter.type = type; filter.subType = 'all'; filter.series = 'all' } navigateTo(el.dataset.pageLink)
      })
    })
    menuBtn.addEventListener('click', openSidebar)
    closeSidebar.addEventListener('click', closeSidebarFn)
    overlay.addEventListener('click', closeSidebarFn)
    searchBtn.addEventListener('click', openSearch)
    searchBack.addEventListener('click', closeSearch)
    searchInput.addEventListener('input', () => doSearch(searchInput.value))
    searchInput.addEventListener('keydown', e => { if (e.key === 'Escape') closeSearch() })
    modalClose.addEventListener('click', closeModal)
    modalOverlay.addEventListener('click', e => { if (e.target === modalOverlay) closeModal() })
    const paramBtn = $('#paramSearchBtn')
    if (paramBtn) paramBtn.addEventListener('click', doParamFilter)
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        if (modalOverlay.classList.contains('visible')) { closeModal(); return }
        if (sidebar.classList.contains('open')) { closeSidebarFn(); return }
        if (searchOverlay.classList.contains('open')) { closeSearch(); return }
      }
    })
  }

  // =============================================
  // Service Worker
  // =============================================

  function registerSW() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js').catch(() => {})
      })
      window.addEventListener('offline', () => $('#offlineBanner')?.classList.add('visible'))
      window.addEventListener('online', () => $('#offlineBanner')?.classList.remove('visible'))
    }
  }

  // =============================================
  // 启动
  // =============================================

  function init() {
    fillContact()
    initCarousel()
    renderHomeProducts()
    registerSW()
    bindEvents()
    // 预渲染产品筛选
    renderTypeTabs()
    renderSubTypeTabs()
    renderSeriesView()
    renderFilteredProducts()
    console.log('[PWA] 大北互 v2 已启动')
    if (editMode) {
      const h = document.querySelector('.header-brand')
      if (h) {
        const b = document.createElement('span')
        b.className = 'edit-old-badge'
        b.textContent = '编辑模式'
        h.appendChild(b)
      }
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init)
  else init()
})()
