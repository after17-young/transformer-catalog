#!/usr/bin/env node
/**
 * 大北互产品管理工具
 * 双击运行或在终端执行: node admin.js
 * 自动打开浏览器 http://localhost:8080
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8080;
const DATA_FILE = path.join(__dirname, 'js', 'products.js');

// ========== 管理页面 HTML ==========
const ADMIN_HTML = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>大北互产品管理</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,sans-serif;background:#f0f2f5;color:#333;font-size:14px}
#app{display:flex;height:100vh}
.sidebar{width:300px;min-width:300px;background:#fff;border-right:1px solid #ddd;display:flex;flex-direction:column}
.sidebar-header{padding:14px;border-bottom:1px solid #eee}
.sidebar-header h2{font-size:16px;margin-bottom:8px}
.toolbar{display:flex;gap:4px;flex-wrap:wrap}
.toolbar button{padding:5px 10px;border:1px solid #ccc;border-radius:5px;background:#fff;cursor:pointer;font-size:11px}
.toolbar button:hover{background:#e8f0fe}
.toolbar button.primary{background:#0047ab;color:#fff;border-color:#0047ab}
.search-box{padding:8px 14px}
.search-box input{width:100%;padding:7px 10px;border:1px solid #ddd;border-radius:6px;font-size:13px;outline:0}
.search-box input:focus{border-color:#0047ab}
.product-list{flex:1;overflow-y:auto}
.product-item{padding:8px 14px;border-bottom:1px solid #f0f0f0;cursor:pointer;font-size:13px}
.product-item:hover{background:#f5f7fa}
.product-item.active{background:#e8f0fe;border-left:3px solid #0047ab}
.product-item .id{font-size:11px;color:#999}
.main{flex:1;overflow-y:auto;padding:20px;max-width:900px}
.empty-state{display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;color:#999}
.form-section{background:#fff;border-radius:8px;padding:14px;margin-bottom:14px;box-shadow:0 1px 3px rgba(0,0,0,.08)}
.form-section h3{font-size:14px;font-weight:600;margin-bottom:10px;padding-bottom:6px;border-bottom:1px solid #eee}
.form-row{display:flex;gap:10px;margin-bottom:8px}
.form-field{flex:1;min-width:0}
.form-field label{display:block;font-size:11px;font-weight:600;color:#666;margin-bottom:3px}
.form-field input,.form-field select,.form-field textarea{width:100%;padding:6px 8px;border:1.5px solid #ddd;border-radius:5px;font-size:13px;outline:0;font-family:inherit}
.form-field input:focus,.form-field select:focus,.form-field textarea:focus{border-color:#0047ab}
.form-field textarea{min-height:50px;resize:vertical}
.table-editor{width:100%;border-collapse:collapse;font-size:12px}
.table-editor th{background:#f5f7fa;padding:5px 3px;text-align:center;font-weight:600;font-size:11px;border:1px solid #e0e0e0;white-space:nowrap}
.table-editor td{padding:2px;border:1px solid #e0e0e0}
.table-editor input{width:100%;border:none;padding:4px 3px;font-size:12px;text-align:center;outline:0;background:transparent}
.table-editor input:focus{background:#e8f0fe}
.table-editor .row-del{cursor:pointer;color:#d32f2f;text-align:center;font-weight:700;padding:2px 6px}
.table-actions{margin-top:6px}
.table-actions button{padding:3px 8px;border:1px solid #ccc;border-radius:4px;background:#fff;cursor:pointer;font-size:11px}
.list-editor{display:flex;flex-wrap:wrap;gap:4px}
.list-editor .item{display:flex;align-items:center;gap:3px;background:#f5f7fa;border-radius:4px;padding:2px 6px;font-size:12px}
.list-editor .item .del{cursor:pointer;color:#d32f2f;font-weight:700;margin-left:4px}
.list-editor .add-row{display:flex;gap:4px;margin-top:5px;width:100%}
.list-editor .add-row input{flex:1;padding:3px 6px;border:1px solid #ddd;border-radius:4px;font-size:12px}
.list-editor .add-row button{padding:3px 8px;border:1px solid #ccc;border-radius:4px;background:#fff;cursor:pointer;font-size:11px}
.img-preview{width:80px;height:80px;object-fit:contain;border:1px solid #ddd;border-radius:4px;background:#f9f9f9;margin-top:4px}
.hidden{display:none!important}
.status{position:fixed;top:10px;right:10px;padding:8px 16px;border-radius:6px;font-size:13px;z-index:999;transition:opacity .3s}
.status.success{background:#e8f5e9;color:#2e7d32;border:1px solid #a5d6a7}
.status.error{background:#ffebee;color:#c62828;border:1px solid #ef9a9a}
</style>
</head>
<body>
<div id="app">
  <div class="sidebar">
    <div class="sidebar-header">
      <h2>📋 产品管理 <span id="count" style="font-size:12px;color:#999"></span></h2>
      <div class="toolbar">
        <button class="primary" onclick="saveAll()">💾 保存</button>
        <button onclick="addProduct()">+ 新增</button>
        <button onclick="exportJS()">📥 导出</button>
        <button onclick="deleteCurrent()" style="color:#d32f2f">🗑️ 删除</button>
      </div>
    </div>
    <div class="search-box">
      <input type="text" id="searchInput" placeholder="搜索产品名称..." oninput="renderList()">
    </div>
    <div class="product-list" id="productList"></div>
  </div>
  <div class="main" id="mainArea">
    <div class="empty-state" id="emptyState"><h3>👈 选择产品开始编辑</h3></div>
    <div id="editPanel" class="hidden"></div>
  </div>
</div>
<div id="status" class="status hidden"></div>

<script>
let products = [], currentId = null;

async function loadData() {
  const r = await fetch('/api/products');
  products = await r.json();
  document.getElementById('count').textContent = '(' + products.length + '个)';
  renderList();
}
loadData();

function show(msg, type) {
  const el = document.getElementById('status');
  el.textContent = msg; el.className = 'status ' + type; el.classList.remove('hidden');
  setTimeout(() => el.classList.add('hidden'), 2500);
}

function renderList() {
  const q = document.getElementById('searchInput').value.toLowerCase();
  const list = document.getElementById('productList');
  const f = q ? products.filter(p => p.name.toLowerCase().includes(q) || p.id.includes(q)) : products;
  list.innerHTML = f.map(p => \`<div class="product-item\${p.id===currentId?' active':''}" onclick="select('\${p.id}')"><strong>\${esc(p.name)}</strong><div class="id">\${p.id} | \${p.type}\${p.voltage?' | '+p.voltage:''}</div></div>\`).join('');
}

function select(id) { currentId = id; renderList(); document.getElementById('emptyState').classList.add('hidden'); document.getElementById('editPanel').classList.remove('hidden'); renderEdit(id); }
function esc(s) { return (s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

function renderEdit(id) {
  const p = products.find(x => x.id === id); if(!p) return;
  currentId = id;
  document.getElementById('editPanel').innerHTML = \`
    <div class="form-section">
      <h3>📝 基本信息</h3>
      <div class="form-row">
        <div class="form-field"><label>ID</label><input value="\${esc(p.id)}" id="f_id" readonly style="background:#f5f5f5"></div>
        <div class="form-field"><label>名称</label><input value="\${esc(p.name)}" id="f_name"></div>
      </div>
      <div class="form-row">
        <div class="form-field"><label>类型 (type)</label><input value="\${esc(p.type)}" id="f_type"></div>
        <div class="form-field"><label>产品线 (line)</label><input value="\${esc(p.line)}" id="f_line"></div>
        <div class="form-field"><label>电压等级</label><input value="\${p.voltage||''}" id="f_voltage"></div>
      </div>
      <div class="form-row">
        <div class="form-field"><label>摘要</label><input value="\${esc(p.summary)}" id="f_summary"></div>
      </div>
      <div class="form-row">
        <div class="form-field"><label>卡片图片路径</label><input value="\${esc(p.cardImage||'')}" id="f_cimg"></div>
        <div class="form-field"><label>详情图片路径</label><input value="\${esc(p.image||'')}" id="f_img"></div>
      </div>
    </div>

    <div class="form-section">
      <h3>📐 外形尺寸</h3>
      <div class="form-row">
        <div class="form-field"><label>长(mm)</label><input value="\${esc(p.dimensions?.length||'')}" id="f_dl"></div>
        <div class="form-field"><label>宽(mm)</label><input value="\${esc(p.dimensions?.width||'')}" id="f_dw"></div>
        <div class="form-field"><label>高(mm)</label><input value="\${esc(p.dimensions?.height||'')}" id="f_dh"></div>
        <div class="form-field"><label>重(kg)</label><input value="\${esc(p.dimensions?.weight||'')}" id="f_dwt"></div>
      </div>
    </div>

    <div class="form-section">
      <h3>📋 规格参数 <button onclick="addSpec()" style="float:right;padding:2px 8px;border:1px solid #ccc;border-radius:4px;background:#fff;cursor:pointer;font-size:11px">+ 添加</button></h3>
      <table class="table-editor" id="specsTable"><thead><tr><th>参数名</th><th>参数值</th><th></th></tr></thead><tbody>\${(p.specs||[]).map((s,i) => \`<tr><td><input value="\${esc(s.label)}" data-si="\${i}" data-sk="l"></td><td><input value="\${esc(s.value)}" data-si="\${i}" data-sk="v"></td><td class="row-del" onclick="rmSpec(\${i})">×</td></tr>\`).join('')}</tbody></table>
    </div>

    \${p.ratings ? \`
    <div class="form-section">
      <h3>⚡ 电流对照表 <button onclick="addRating()" style="float:right;padding:2px 8px;border:1px solid #ccc;border-radius:4px;background:#fff;cursor:pointer;font-size:11px">+ 行</button></h3>
      <table class="table-editor"><thead><tr><th>一次电流</th><th>热电流</th><th>动稳定</th><th>准确级</th><th>二次输出</th><th>爬电距离</th><th>重量</th><th></th></tr></thead><tbody>\${p.ratings.map((r,i) => \`<tr>\${['primary','thermal','dynamic','accuracy','output','creepage','weight'].map(f => '<td><input value="\${esc(r[f]||'')}" data-ri="\${i}" data-rf="\${f}"></td>').join('')}<td class="row-del" onclick="rmRating(\${i})">×</td></tr>\`).join('')}</tbody></table>
    </div>\` : ''}

    \${p.vtRatings ? \`
    <div class="form-section">
      <h3>🔌 电压对照表 <button onclick="addVtRating()" style="float:right;padding:2px 8px;border:1px solid #ccc;border-radius:4px;background:#fff;cursor:pointer;font-size:11px">+ 行</button></h3>
      <table class="table-editor"><thead><tr><th>电压比</th><th>准确级</th><th>二次输出</th><th>极限输出</th><th>绝缘水平</th><th>爬电距离</th><th>重量</th><th></th></tr></thead><tbody>\${p.vtRatings.map((r,i) => \`<tr>\${['ratio','accuracy','output','limitOutput','insulation','creepage','weight'].map(f => '<td><input value="\${esc(r[f]||'')}" data-vi="\${i}" data-vf="\${f}"></td>').join('')}<td class="row-del" onclick="rmVtRating(\${i})">×</td></tr>\`).join('')}</tbody></table>
    </div>\` : ''}

    <div class="form-section">
      <h3>📄 产品描述</h3>
      <textarea id="f_desc" rows="3" style="width:100%;padding:6px 8px;border:1.5px solid #ddd;border-radius:5px;font-size:13px;font-family:inherit;resize:vertical">\${esc(p.description)}</textarea>
    </div>

    <div class="form-section">
      <h3>⭐ 产品特点</h3>
      <div class="list-editor">
        \${(p.features||[]).map((f,i) => \`<span class="item">\${esc(f)}<span class="del" onclick="rmFeat(\${i})">×</span></span>\`).join('')}
        <div class="add-row"><input id="newFeat" placeholder="新特点..." style="flex:1;padding:3px 6px;border:1px solid #ddd;border-radius:4px;font-size:12px"><button onclick="addFeat()" style="padding:3px 8px;border:1px solid #ccc;border-radius:4px;background:#fff;cursor:pointer;font-size:11px">添加</button></div>
      </div>
    </div>
  \`;
}

function addSpec() { const p = products.find(x => x.id === currentId); p.specs.push({label:'',value:''}); renderEdit(currentId); }
function rmSpec(i) { const p = products.find(x => x.id === currentId); p.specs.splice(i,1); renderEdit(currentId); }
function addRating() { const p = products.find(x => x.id === currentId); p.ratings.push({primary:'',thermal:'',dynamic:'',accuracy:'',output:'',creepage:'',weight:''}); renderEdit(currentId); }
function rmRating(i) { const p = products.find(x => x.id === currentId); p.ratings.splice(i,1); renderEdit(currentId); }
function addVtRating() { const p = products.find(x => x.id === currentId); p.vtRatings.push({ratio:'',accuracy:'',output:'',limitOutput:'',insulation:'',creepage:'',weight:''}); renderEdit(currentId); }
function rmVtRating(i) { const p = products.find(x => x.id === currentId); p.vtRatings.splice(i,1); renderEdit(currentId); }
function addFeat() { const v = document.getElementById('newFeat'); if(!v.value.trim()) return; const p = products.find(x => x.id === currentId); p.features.push(v.value.trim()); v.value=''; renderEdit(currentId); }
function rmFeat(i) { const p = products.find(x => x.id === currentId); p.features.splice(i,1); renderEdit(currentId); }

function addProduct() {
  const id = 'new-' + Date.now();
  products.push({id,name:'新产品',type:'current',line:'standard',summary:'',description:'',specs:[{label:'额定电压',value:''}],features:[],dimensions:{length:'',width:'',height:'',weight:''}});
  select(id);
}

function deleteCurrent() {
  if(!confirm('确定删除？')) return;
  const i = products.findIndex(x => x.id === currentId);
  if(i>-1) products.splice(i,1);
  currentId = null;
  renderList();
  document.getElementById('emptyState').classList.remove('hidden');
  document.getElementById('editPanel').classList.add('hidden');
}

async function saveAll() {
  const p = products.find(x => x.id === currentId);
  if(!p) return;
  p.name = document.getElementById('f_name').value;
  p.type = document.getElementById('f_type').value;
  p.line = document.getElementById('f_line').value;
  p.voltage = document.getElementById('f_voltage').value || null;
  p.summary = document.getElementById('f_summary').value;
  p.cardImage = document.getElementById('f_cimg').value;
  p.image = document.getElementById('f_img').value;
  p.description = document.getElementById('f_desc').value;
  p.dimensions = p.dimensions||{};
  p.dimensions.length = document.getElementById('f_dl').value;
  p.dimensions.width = document.getElementById('f_dw').value;
  p.dimensions.height = document.getElementById('f_dh').value;
  p.dimensions.weight = document.getElementById('f_dwt').value;
  document.querySelectorAll('#specsTable input[data-si]').forEach(el => {
    const i = parseInt(el.dataset.si), k = el.dataset.sk;
    if(!p.specs[i]) p.specs[i]={label:'',value:''};
    if(k==='l') p.specs[i].label=el.value; else p.specs[i].value=el.value;
  });
  document.querySelectorAll('[data-ri]').forEach(el => {
    const i = parseInt(el.dataset.ri), f = el.dataset.rf;
    if(!p.ratings[i]) p.ratings[i]={}; p.ratings[i][f]=el.value;
  });
  document.querySelectorAll('[data-vi]').forEach(el => {
    const i = parseInt(el.dataset.vi), f = el.dataset.vf;
    if(!p.vtRatings[i]) p.vtRatings[i]={}; p.vtRatings[i][f]=el.value;
  });
  const r = await fetch('/api/save', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(products)});
  show(r.ok?'✅ 保存成功！':'❌ 保存失败', r.ok?'success':'error');
  renderList();
}

async function exportJS() {
  const r = await fetch('/api/export');
  const blob = await r.blob();
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'products.js'; a.click();
  show('✅ 导出成功！', 'success');
}
</script>
</body>
</html>`;

// ========== 服务器逻辑 ==========

function loadProducts() {
  const content = fs.readFileSync(DATA_FILE, 'utf-8');
  // 用 Function 直接执行 JS 文件来获取 products 变量
  const fakeModule = { exports: {} };
  const fn = new Function('module', 'exports', 'require', content + '; return module.exports.products || products;');
  return fn(fakeModule, fakeModule.exports, () => {});
}

function saveProducts(products) {
  let content = fs.readFileSync(DATA_FILE, 'utf-8');
  const start = content.indexOf('const products = [');
  if (start === -1) return false;

  // 找到 products 数组结束位置
  let depth = 0, inStr = false, strChar = '';
  let end = start;
  for (let i = start; i < content.length; i++) {
    const ch = content[i];
    if (inStr) {
      if (ch === '\\') { i++; continue; }
      if (ch === strChar) inStr = false;
      continue;
    }
    if (ch === "'" || ch === '"' || ch === '`') { inStr = true; strChar = ch; continue; }
    if (ch === '[') depth++;
    if (ch === ']') { depth--; if (depth === 0) { end = i + 1; break; } }
  }

  // 生成新数组字符串
  const newArr = JSON.stringify(products, null, 2)
    .replace(/"([a-zA-Z_$]\w*)":/g, '$1:')     // 去属性名引号
    .replace(/"/g, "'");                         // 双引号转单引号

  const newContent = content.substring(0, start) + 'const products = ' + newArr + content.substring(end);
  fs.writeFileSync(DATA_FILE, newContent, 'utf-8');
  return true;
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const path = url.pathname;

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  if (path === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(ADMIN_HTML);

  } else if (path === '/api/products') {
    try {
      const products = loadProducts();
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify(products));
    } catch (e) {
      res.writeHead(500);
      res.end(JSON.stringify({ error: e.message }));
    }

  } else if (path === '/api/save' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const products = JSON.parse(body);
        if (saveProducts(products)) {
          res.writeHead(200);
          res.end(JSON.stringify({ ok: true }));
        } else {
          res.writeHead(500);
          res.end(JSON.stringify({ error: '保存失败' }));
        }
      } catch (e) {
        res.writeHead(500);
        res.end(JSON.stringify({ error: e.message }));
      }
    });

  } else if (path === '/api/export') {
    try {
      const content = fs.readFileSync(DATA_FILE, 'utf-8');
      res.writeHead(200, { 'Content-Type': 'application/javascript; charset=utf-8', 'Content-Disposition': 'attachment; filename="products.js"' });
      res.end(content);
    } catch (e) {
      res.writeHead(500);
      res.end(JSON.stringify({ error: e.message }));
    }

  } else {
    res.writeHead(404);
    res.end('Not Found');
  }
});

server.listen(PORT, '127.0.0.1', () => {
  console.log('='.repeat(50));
  console.log('🏭 大北互产品管理工具');
  console.log('='.repeat(50));
  console.log(`✅ 服务器已启动: http://127.0.0.1:${PORT}`);
  console.log('📝 在浏览器打开网址即可编辑');
  console.log('⚠️  编辑后记得点击"💾 保存"按钮！');
  console.log('  按 Ctrl+C 停止服务器');
  console.log('='.repeat(50));
});

// 自动打开浏览器
try {
  const { exec } = require('child_process');
  exec(`start http://127.0.0.1:${PORT}`);
} catch(e) {}
