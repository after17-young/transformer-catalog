#!/usr/bin/env python3
"""
大北互产品管理工具 - 本地服务器
双击运行或在终端执行: python admin.py
自动在浏览器打开 http://localhost:8080
"""

import http.server
import json
import os
import re
import webbrowser
import sys
from urllib.parse import urlparse, parse_qs

PORT = 8080
DATA_FILE = os.path.join(os.path.dirname(__file__), 'js', 'products.js')
JSON_CACHE = os.path.join(os.path.dirname(__file__), 'products_cache.json')

# ========== JS 解析/生成 ==========

def parse_js_array(text, var_name):
    """从 JS 文件中提取数组变量"""
    pattern = r'const\s+' + re.escape(var_name) + r'\s*=\s*(\[[\s\S]*?\])\s*;\s*\n'
    match = re.search(pattern, text)
    if match:
        js_str = match.group(1)
        # 将 JS 对象字面量转为 JSON
        return js_to_json(js_str)
    return None

def js_to_json(js_str):
    """将 JS 对象数组转为 JSON（处理单引号、末尾逗号等）"""
    # 去掉注释
    s = re.sub(r'//.*?\n', '\n', js_str)
    # 单引号转双引号
    s = s.replace("'", '"')
    # 去掉属性名周围的引号（已经是双引号的保留）
    s = re.sub(r'(\s+)(\w+)(\s*):', r'\1"\2"\3:', s)
    # 去掉末尾逗号
    s = re.sub(r',\s*([\]}])', r'\1', s)
    try:
        return json.loads(s)
    except json.JSONDecodeError as e:
        print(f"JSON解析错误: {e}")
        return None

def products_to_json_file():
    """从 products.js 提取数据并缓存为 JSON"""
    if not os.path.exists(DATA_FILE):
        print(f"错误: 找不到 {DATA_FILE}")
        return False

    with open(DATA_FILE, 'r', encoding='utf-8') as f:
        content = f.read()

    products = parse_js_array(content, 'products')
    if products is None:
        print("解析 products 失败！")
        return False

    with open(JSON_CACHE, 'w', encoding='utf-8') as f:
        json.dump({
            'products': products,
            'fileContent': content
        }, f, ensure_ascii=False, indent=2)

    print(f"成功加载 {len(products)} 个产品")
    return True

def save_products(products):
    """保存产品数据回 products.js"""
    with open(JSON_CACHE, 'r', encoding='utf-8') as f:
        cached = json.load(f)

    old_content = cached['fileContent']

    # 替换 products 数组部分
    start = old_content.find('const products = [')
    if start == -1:
        return False

    # 找到数组结束位置
    depth = 0
    in_str = False
    str_char = ''
    end = start

    for i in range(start, len(old_content)):
        ch = old_content[i]
        if in_str:
            if ch == '\\':
                pass
            elif ch == str_char:
                in_str = False
        else:
            if ch in ["'", '"', '`']:
                in_str = True
                str_char = ch
            elif ch == '[':
                depth += 1
            elif ch == ']':
                depth -= 1
                if depth == 0:
                    end = i + 1
                    break

    if end <= start:
        return False

    # 生成新的 JS 数组
    new_js = json_to_js(products)
    new_content = old_content[:start] + 'const products = ' + new_js + old_content[end:]

    with open(DATA_FILE, 'w', encoding='utf-8') as f:
        f.write(new_content)

    # 更新缓存
    with open(JSON_CACHE, 'w', encoding='utf-8') as f:
        json.dump({
            'products': products,
            'fileContent': new_content
        }, f, ensure_ascii=False, indent=2)

    return True

def json_to_js(obj):
    """将 Python 对象转为 JS 格式"""
    return json.dumps(obj, ensure_ascii=False, indent=2)

# ========== HTTP 服务器 ==========

ADMIN_HTML = '''<!DOCTYPE html>
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
.status{position:fixed;top:10px;right:10px;padding:8px 16px;border-radius:6px;font-size:13px;z-index:999}
.status.success{background:#e8f5e9;color:#2e7d32;border:1px solid #a5d6a7}
.status.error{background:#ffebee;color:#c62828;border:1px solid #ef9a9a}
</style>
</head>
<body>
<div id="app">
  <div class="sidebar">
    <div class="sidebar-header">
      <h2>产品管理</h2>
      <div class="toolbar">
        <button class="primary" onclick="saveAll()">💾 保存</button>
        <button onclick="addProduct()">+ 新增产品</button>
        <button onclick="exportJS()">📥 导出JS</button>
      </div>
    </div>
    <div class="search-box">
      <input type="text" id="searchInput" placeholder="搜索..." oninput="renderList()">
    </div>
    <div class="product-list" id="productList"></div>
  </div>
  <div class="main" id="mainArea">
    <div class="empty-state" id="emptyState"><h3>选择产品开始编辑</h3></div>
    <div id="editPanel" class="hidden"></div>
  </div>
</div>
<div id="status" class="status hidden"></div>

<script>
let products = []
let currentId = null

async function loadData() {
  try {
    const r = await fetch('/api/products')
    products = await r.json()
    renderList()
  } catch(e) { showStatus('加载失败: ' + e.message, 'error') }
}
loadData()

function showStatus(msg, type) {
  const el = document.getElementById('status')
  el.textContent = msg; el.className = 'status ' + type; el.classList.remove('hidden')
  setTimeout(() => el.classList.add('hidden'), 3000)
}

function renderList() {
  const q = document.getElementById('searchInput').value.toLowerCase()
  const list = document.getElementById('productList')
  const filtered = q ? products.filter(p => p.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q)) : products

  list.innerHTML = filtered.map(p => \`
    <div class="product-item\${p.id===currentId?' active':''}" onclick="select('\${p.id}')">
      <strong>\${esc(p.name)}</strong>
      <div class="id">\${p.id} | \${p.type}\${p.voltage?' | '+p.voltage:''}</div>
    </div>
  \`).join('')
}

function select(id) {
  currentId = id; renderList()
  document.getElementById('emptyState').classList.add('hidden')
  document.getElementById('editPanel').classList.remove('hidden')
  renderEdit(id)
}

function esc(s) { return (s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;') }

function renderEdit(id) {
  const p = products.find(x => x.id === id)
  if (!p) return
  currentId = id
  const panel = document.getElementById('editPanel')

  panel.innerHTML = \`
    <div class="form-section">
      <h3>基本信息</h3>
      <div class="form-row">
        <div class="form-field"><label>ID</label><input value="\${esc(p.id)}" id="f_id" readonly style="background:#f5f5f5"></div>
        <div class="form-field"><label>名称</label><input value="\${esc(p.name)}" id="f_name"></div>
        <div class="form-field"><label>电压</label><input value="\${p.voltage||''}" id="f_voltage"></div>
      </div>
      <div class="form-row">
        <div class="form-field"><label>类型</label><input value="\${esc(p.type)}" id="f_type"></div>
        <div class="form-field"><label>产品线</label><input value="\${esc(p.line)}" id="f_line"></div>
        <div class="form-field"><label>系列</label><input value="\${esc(p.series||'')}" id="f_series"></div>
      </div>
      <div class="form-row">
        <div class="form-field"><label>摘要</label><input value="\${esc(p.summary)}" id="f_summary"></div>
      </div>
      <div class="form-row">
        <div class="form-field"><label>卡片图片</label><input value="\${esc(p.cardImage||'')}" id="f_cimg"></div>
        <div class="form-field"><label>详情图片</label><input value="\${esc(p.image||'')}" id="f_img"></div>
      </div>
    </div>

    <div class="form-section">
      <h3>外形尺寸</h3>
      <div class="form-row">
        <div class="form-field"><label>长(mm)</label><input value="\${esc(p.dimensions?.length||'')}" id="f_dl"></div>
        <div class="form-field"><label>宽(mm)</label><input value="\${esc(p.dimensions?.width||'')}" id="f_dw"></div>
        <div class="form-field"><label>高(mm)</label><input value="\${esc(p.dimensions?.height||'')}" id="f_dh"></div>
        <div class="form-field"><label>重(kg)</label><input value="\${esc(p.dimensions?.weight||'')}" id="f_dwt"></div>
      </div>
    </div>

    <div class="form-section">
      <h3>规格参数 <button onclick="addSpec()" style="float:right;padding:2px 8px;border:1px solid #ccc;border-radius:4px;background:#fff;cursor:pointer;font-size:11px">+ 添加</button></h3>
      <table class="table-editor" id="specsTable"><thead><tr><th>参数名</th><th>参数值</th><th></th></tr></thead><tbody>\${(p.specs||[]).map((s,i) => \`<tr><td><input value="\${esc(s.label)}" data-si="\${i}" data-sk="l"></td><td><input value="\${esc(s.value)}" data-si="\${i}" data-sk="v"></td><td class="row-del" onclick="rmSpec(\${i})">×</td></tr>\`).join('')}</tbody></table>
    </div>

    \${p.ratings ? \`
    <div class="form-section">
      <h3>电流互感器对照表 <button onclick="addRating()" style="float:right;padding:2px 8px;border:1px solid #ccc;border-radius:4px;background:#fff;cursor:pointer;font-size:11px">+ 添加行</button></h3>
      <table class="table-editor"><thead><tr><th>一次电流</th><th>热电流</th><th>动稳定</th><th>准确级</th><th>二次输出</th><th>爬电距离</th><th>重量</th><th></th></tr></thead><tbody>\${(p.ratings).map((r,i) => \`<tr>\${['primary','thermal','dynamic','accuracy','output','creepage','weight'].map(f => '<td><input value="\${esc(r[f]||'')}" data-ri="\${i}" data-rf="\${f}"></td>').join('')}<td class="row-del" onclick="rmRating(\${i})">×</td></tr>\`).join('')}</tbody></table>
    </div>\` : ''}

    \${p.vtRatings ? \`
    <div class="form-section">
      <h3>电压互感器对照表 <button onclick="addVtRating()" style="float:right;padding:2px 8px;border:1px solid #ccc;border-radius:4px;background:#fff;cursor:pointer;font-size:11px">+ 添加行</button></h3>
      <table class="table-editor"><thead><tr><th>电压比</th><th>准确级</th><th>二次输出</th><th>极限输出</th><th>绝缘水平</th><th>爬电距离</th><th>重量</th><th></th></tr></thead><tbody>\${(p.vtRatings).map((r,i) => \`<tr>\${['ratio','accuracy','output','limitOutput','insulation','creepage','weight'].map(f => '<td><input value="\${esc(r[f]||'')}" data-vi="\${i}" data-vf="\${f}"></td>').join('')}<td class="row-del" onclick="rmVtRating(\${i})">×</td></tr>\`).join('')}</tbody></table>
    </div>\` : ''}

    <div class="form-section">
      <h3>产品描述</h3>
      <div class="form-field"><textarea id="f_desc" rows="3">\${esc(p.description)}</textarea></div>
    </div>

    <div class="form-section">
      <h3>产品特点</h3>
      <div class="list-editor" id="featuresEditor">
        \${(p.features||[]).map((f,i) => \`<span class="item">\${esc(f)}<span class="del" onclick="rmFeat(\${i})">×</span></span>\`).join('')}
        <div class="add-row"><input id="newFeat" placeholder="新特点..."><button onclick="addFeat()">添加</button></div>
      </div>
    </div>

    <div style="text-align:right;margin-top:10px">
      <button onclick="saveAll()" style="padding:8px 24px;background:#0047ab;color:#fff;border:none;border-radius:6px;font-size:14px;cursor:pointer">💾 保存所有修改</button>
    </div>
  \`
}

// 动态表编辑
function addSpec() {
  const p = products.find(x => x.id === currentId)
  p.specs.push({label:'',value:''}); renderEdit(currentId)
}
function rmSpec(i) {
  const p = products.find(x => x.id === currentId)
  p.specs.splice(i,1); renderEdit(currentId)
}
function addRating() {
  const p = products.find(x => x.id === currentId)
  p.ratings.push({primary:'',thermal:'',dynamic:'',accuracy:'',output:'',creepage:'',weight:''}); renderEdit(currentId)
}
function rmRating(i) {
  const p = products.find(x => x.id === currentId)
  p.ratings.splice(i,1); renderEdit(currentId)
}
function addVtRating() {
  const p = products.find(x => x.id === currentId)
  p.vtRatings.push({ratio:'',accuracy:'',output:'',limitOutput:'',insulation:'',creepage:'',weight:''}); renderEdit(currentId)
}
function rmVtRating(i) {
  const p = products.find(x => x.id === currentId)
  p.vtRatings.splice(i,1); renderEdit(currentId)
}
function addFeat() {
  const v = document.getElementById('newFeat')
  if(!v.value.trim()) return
  const p = products.find(x => x.id === currentId)
  p.features.push(v.value.trim()); v.value=''; renderEdit(currentId)
}
function rmFeat(i) {
  const p = products.find(x => x.id === currentId)
  p.features.splice(i,1); renderEdit(currentId)
}
function addProduct() {
  const id = 'new-' + Date.now()
  products.push({id,name:'新产品',type:'current',line:'standard',summary:'',description:'',specs:[],features:[],dimensions:{length:'',width:'',height:'',weight:''}})
  select(id)
}

async function saveAll() {
  const p = products.find(x => x.id === currentId)
  if(!p) return

  // 读取表单
  p.name = document.getElementById('f_name').value
  p.type = document.getElementById('f_type').value
  p.line = document.getElementById('f_line').value
  p.voltage = document.getElementById('f_voltage').value || null
  p.summary = document.getElementById('f_summary').value
  p.cardImage = document.getElementById('f_cimg').value
  p.image = document.getElementById('f_img').value
  p.description = document.getElementById('f_desc').value
  p.series = document.getElementById('f_series').value || undefined
  p.dimensions = p.dimensions || {}
  p.dimensions.length = document.getElementById('f_dl').value
  p.dimensions.width = document.getElementById('f_dw').value
  p.dimensions.height = document.getElementById('f_dh').value
  p.dimensions.weight = document.getElementById('f_dwt').value

  // 读取 specs 表
  document.querySelectorAll('#specsTable input[data-si]').forEach(el => {
    const i = parseInt(el.dataset.si), k = el.dataset.sk
    if(!p.specs[i]) p.specs[i] = {label:'',value:''}
    if(k === 'l') p.specs[i].label = el.value
    else p.specs[i].value = el.value
  })

  // 读取 ratings
  if(p.ratings) {
    document.querySelectorAll('[data-ri]').forEach(el => {
      const i = parseInt(el.dataset.ri), f = el.dataset.rf
      if(!p.ratings[i]) p.ratings[i] = {}
      p.ratings[i][f] = el.value
    })
  }

  // 读取 vtRatings
  if(p.vtRatings) {
    document.querySelectorAll('[data-vi]').forEach(el => {
      const i = parseInt(el.dataset.vi), f = el.dataset.vf
      if(!p.vtRatings[i]) p.vtRatings[i] = {}
      p.vtRatings[i][f] = el.value
    })
  }

  try {
    const r = await fetch('/api/save', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify(products)
    })
    if(r.ok) showStatus('✅ 保存成功！', 'success')
    else showStatus('❌ 保存失败', 'error')
  } catch(e) { showStatus('❌ ' + e.message, 'error') }
  renderList()
}

async function exportJS() {
  try {
    const r = await fetch('/api/export')
    const blob = await r.blob()
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'products.js'
    a.click()
    showStatus('✅ 导出成功！', 'success')
  } catch(e) { showStatus('❌ ' + e.message, 'error') }
}
</script>
</body>
</html>'''

class AdminHandler(http.server.BaseHTTPRequestHandler):
    def do_GET(self):
        parsed = urlparse(self.path)
        path = parsed.path

        if path == '/':
            self.send_response(200)
            self.send_header('Content-Type', 'text/html; charset=utf-8')
            self.end_headers()
            self.wfile.write(ADMIN_HTML.encode('utf-8'))

        elif path == '/api/products':
            if not os.path.exists(JSON_CACHE):
                if not products_to_json_file():
                    self.send_error(500, '无法加载产品数据')
                    return
            with open(JSON_CACHE, 'r', encoding='utf-8') as f:
                data = json.load(f)
            self.send_response(200)
            self.send_header('Content-Type', 'application/json; charset=utf-8')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps(data['products'], ensure_ascii=False).encode('utf-8'))

        elif path == '/api/export':
            if not os.path.exists(DATA_FILE):
                self.send_error(404, '文件不存在')
                return
            with open(DATA_FILE, 'r', encoding='utf-8') as f:
                content = f.read()
            self.send_response(200)
            self.send_header('Content-Type', 'application/javascript; charset=utf-8')
            self.send_header('Content-Disposition', 'attachment; filename="products.js"')
            self.end_headers()
            self.wfile.write(content.encode('utf-8'))

        else:
            self.send_error(404)

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def do_POST(self):
        if self.path == '/api/save':
            length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(length)
            products = json.loads(body)

            if save_products(products):
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps({'ok': True}).encode())
            else:
                self.send_error(500, '保存失败')
        else:
            self.send_error(404)

    def log_message(self, format, *args):
        pass  # 减少控制台输出

def main():
    print('=' * 50)
    print('🏭 大北互产品管理工具')
    print('=' * 50)

    if not os.path.exists(DATA_FILE):
        print(f'❌ 找不到 {DATA_FILE}')
        print(f'请将此文件放在 transformer-catalog 目录下运行')
        input('按回车退出...')
        return

    print(f'📂 产品数据: {DATA_FILE}')

    if not products_to_json_file():
        input('数据加载失败，按回车退出...')
        return

    server = http.server.HTTPServer(('127.0.0.1', PORT), AdminHandler)
    url = f'http://127.0.0.1:{PORT}'

    print(f'✅ 服务器已启动: {url}')
    print(f'📝 在浏览器打开网址即可编辑')
    print(f'⚠️  编辑后记得点击"💾 保存"按钮！')
    print(f'  按 Ctrl+C 停止服务器')
    print('=' * 50)

    webbrowser.open(url)

    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print('\n服务器已停止')

if __name__ == '__main__':
    main()
