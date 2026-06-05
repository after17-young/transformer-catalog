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

  // ---- 状态 ----
  let currentPage = 'home'
  const filter = { type: 'all', subType: 'all', series: 'all' }
  let carouselIndex = 0
  let carouselTimer = null

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
  // 产品详情
  // =============================================

  function showDetail(p) {
    const ln = {}
    const tn = { current: '电流互感器', voltage: '电压互感器', combined: '组合互感器', zero: '零序电流互感器', post: '3.6-12KV支柱式电流互感器', wall: '3.6-12KV穿墙式电流互感器', outdoor: '3.6-12KV户外电流、电压互感器', vt36: '3.6-12KV电压互感器', vtOutdoor: '3.6-12KV户外电压互感器', rail_ct: '机车动车电流互感器', rail_vt: '机车动车电压互感器' }
    // 机车动车产品保持原样显示
    if (p.type === 'rail_ct' || p.type === 'rail_vt') {
      modalBody.innerHTML = buildFullDetail(p, tn, ln)
    } else {
      modalBody.innerHTML = buildSimpleDetail(p, tn, ln)
    }
    modalOverlay.classList.add('visible')
    document.body.style.overflow = 'hidden'
  }

  function esc(s) { return (s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;') }

  function buildFullDetail(p, tn, ln) {
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

  function buildSimpleDetail(p, tn, ln) {
    let html = ''
    html += '<span class="product-card-type' + (p.type === 'voltage' ? ' voltage-t' : '') + '">' + (tn[p.type] || '') + '</span>'
    html += '<h3 class="product-card-name" style="margin:0 0 4px 0">' + esc(p.name) + '</h3>'
    // 显示 ratings 表（电流互感器），所有列在一个可横向滑动的表格
    if (p.ratings && p.ratings.length) {
      html += '<div class="modal-ratings"><h4>技术参数</h4><div class="ratings-table-wrap" style="overflow-x:auto">'
      // 主体表格
      html += '<table class="ratings-table" style="min-width:900px"><thead><tr>'
      html += '<th>额定一次电流 (A)</th><th>一秒热电流 (kA)</th><th>动稳定电流 (kA)</th>'
      if (p.accuracyCombos && p.accuracyCombos.length) {
        html += '<th>准确级组合</th><th>0.2(S) 输出 (VA)</th><th>0.5(S) 输出 (VA)</th><th>5P10 输出 (VA)</th>'
      }
      html += '<th>表面爬电距离 (mm)</th><th>重量 (kg)</th></tr></thead><tbody>'
      for (var i = 0; i < p.ratings.length; i++) {
        var r = p.ratings[i]
        html += '<tr><td>' + esc(r.primary) + '</td><td>' + esc(r.thermal) + '</td><td>' + esc(r.dynamic) + '</td>'
        html += '<td colspan="4"></td>'
        html += '<td>245</td><td>' + esc(p.weight || '') + '</td></tr>'
      }
      // 追加准确级组合行（合并展示）
      if (p.accuracyCombos && p.accuracyCombos.length) {
        for (var i = 0; i < p.accuracyCombos.length; i++) {
          var c = p.accuracyCombos[i]
          html += '<tr><td colspan="3" style="color:#999;font-size:11px">准确级对应输出</td>'
          html += '<td>' + esc(c.combo) + '</td><td>' + esc(c.out02) + '</td><td>' + esc(c.out05) + '</td><td>' + esc(c.out5p10) + '</td>'
          html += '<td></td><td></td></tr>'
        }
      }
      html += '</tbody></table></div></div>'
    }
    // 显示 vtRatings 表（电压互感器）
    if (p.vtRatings && p.vtRatings.length) {
      html += '<div class="modal-ratings"><h4>技术参数</h4><div class="ratings-table-wrap"><table class="ratings-table">'
      html += '<thead><tr><th>额定电压比</th><th>准确级组合</th><th>额定二次输出 (VA)</th><th>极限输出 (VA)</th><th>额定绝缘水平</th><th>表面爬电距离 (mm)</th><th>重量 (kg)</th></tr></thead><tbody>'
      for (var i = 0; i < p.vtRatings.length; i++) {
        var r = p.vtRatings[i]
        html += '<tr><td>' + esc(r.ratio) + '</td><td>' + esc(r.accuracy) + '</td><td>' + esc(r.output) + '</td><td>' + esc(r.limitOutput) + '</td><td>' + esc(r.insulation) + '</td><td>' + esc(r.creepage) + '</td><td>' + esc(r.weight) + '</td></tr>'
      }
      html += '</tbody></table></div></div>'
    }
    // 既没有 ratings、accuracyCombos 也没有 vtRatings 时显示 specs
    if (!p.ratings && !p.vtRatings && !p.accuracyCombos) {
      html += '<div class="modal-specs"><h4>技术参数</h4><table class="specs-table">'
      for (var i = 0; i < p.specs.length; i++) {
        html += '<tr><td>' + esc(p.specs[i].label) + '</td><td>' + esc(p.specs[i].value) + '</td></tr>'
      }
      html += '</table></div>'
    }
    return html
  }

  function closeModal() { modalOverlay.classList.remove('visible'); document.body.style.overflow = '' }

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
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init)
  else init()
})()
