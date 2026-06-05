/**
 * 互感器产品数据
 *
 * 三级分类结构：
 *   产品线 (line):  standard(标准) | rail(机车动车)
 *   类型   (type):  current(电流) | voltage(电压) | combined(组合) | zero(零序)
 *   电压   (voltage): 10KV | 20KV | 35KV | null
 *
 * 修改以下产品信息为你公司的实际产品
 */

// =========================================
// 轮播图配置（替换为你自己的图片）
// =========================================
// 把图片放到 images/ 目录下，在这里添加路径
const carouselSlides = [
  { src: 'images/slide-company.jpg', alt: '公司厂区全景' },
  { src: 'images/slide-products.jpg', alt: '产品展示' },
  { src: 'images/slide-workshop.jpg', alt: '生产车间' }
]

// =========================================
// 产品数据（示例，替换为实际产品）
// =========================================
const products = [
  // ───── 标准产品 - 电压互感器 ─────
  {
    id: 'vt-10kv-01', line: 'standard', type: 'voltage', voltage: '10KV',
    name: 'JDZ-10 型电压互感器',
    summary: '户内环氧树脂浇注式电压互感器，适用于10kV开关柜',
    image: 'images/products/vt-10kv-01.jpg',
    cardImage: 'images/products/card/vt-10kv-01.jpg',
    dimensions: {
      length: '',
      width: '',
      height: '',
      weight: '',
    },
    specs: [
      { label: '额定电压比', value: '10000/100V / 10000/√3 : 100/√3 V' },
      { label: '额定频率', value: '50/60 Hz' },
      { label: '准确级', value: '0.2 / 0.5 / 3P' },
      { label: '额定容量', value: '30-200 VA' },
      { label: '绝缘水平', value: '12/28/75 kV' },
      { label: '使用环境', value: '-25°C ~ +55°C' },
      { label: '执行标准', value: 'GB/T 20840.3-2010' }
    ],
    description: 'JDZ-10 系列电压互感器为户内环氧树脂浇注式结构，适用于 10kV 及以下电力系统中作电压测量、电能计量及继电保护使用。',
    features: ['环氧树脂浇注绝缘，阻燃自熄', '测量精度高，稳定性好', '体积小，重量轻', '局部放电量小'],
    vtRatings: [
      { ratio: '', accuracy: '', output: '', limitOutput: '', insulation: '', creepage: '', weight: '' }
    ],
  },
  {
    id: 'vt-20kv-01', line: 'standard', type: 'voltage', voltage: '20KV',
    name: 'JDZX-20 型电压互感器',
    summary: '20kV 户内干式电压互感器，带剩余电压绕组',
    image: 'images/products/vt-20kv-01.jpg',
    cardImage: 'images/products/card/vt-20kv-01.jpg',
    dimensions: {
      length: '',
      width: '',
      height: '',
      weight: '',
    },
    specs: [
      { label: '额定电压比', value: '20000/√3 : 100/√3 : 100/3 V' },
      { label: '额定频率', value: '50/60 Hz' },
      { label: '准确级', value: '0.2 / 0.5 / 3P / 6P' },
      { label: '额定容量', value: '50-300 VA' },
      { label: '绝缘水平', value: '24/50/95 kV' },
      { label: '爬电距离', value: '≥ 630 mm' },
      { label: '使用环境', value: '-25°C ~ +55°C' }
    ],
    description: 'JDZX-20 系列电压互感器为户内干式结构，带有剩余电压绕组，适用于 20kV 中压配电系统的电压测量和接地保护。',
    features: ['带剩余电压绕组，可实现接地保护', '真空环氧浇注', '大爬电距离设计', '高精度多绕组输出'],
    vtRatings: [
      { ratio: '', accuracy: '', output: '', limitOutput: '', insulation: '', creepage: '', weight: '' }
    ],
  },
  {
    id: 'vt-35kv-01', line: 'standard', type: 'voltage', voltage: '35KV',
    name: 'JDZX-35 型电压互感器',
    summary: '35kV 户外干式电压互感器，带剩余电压绕组',
    image: 'images/products/vt-35kv-01.jpg',
    cardImage: 'images/products/card/vt-35kv-01.jpg',
    dimensions: {
      length: '',
      width: '',
      height: '',
      weight: '',
    },
    specs: [
      { label: '额定电压比', value: '35000/√3 : 100/√3 : 100/3 V' },
      { label: '额定频率', value: '50/60 Hz' },
      { label: '准确级', value: '0.2 / 0.5 / 3P / 6P' },
      { label: '额定容量', value: '50-500 VA' },
      { label: '绝缘水平', value: '40.5/95/185 kV' },
      { label: '爬电距离', value: '≥ 1050 mm' },
      { label: '使用环境', value: '-40°C ~ +55°C' }
    ],
    description: 'JDZX-35 系列电压互感器为户外干式结构，带有剩余电压绕组（开口三角形绕组），适用于 35kV 电力系统的电压测量、电能计量和接地保护。',
    features: ['带剩余电压绕组，可实现接地保护', '真空环氧浇注，耐候性强', '大爬电距离设计', '高精度多绕组输出'],
    vtRatings: [
      { ratio: '', accuracy: '', output: '', limitOutput: '', insulation: '', creepage: '', weight: '' }
    ],
  },

  {
    id: 'jqvt-10kv-01', line: 'standard', type: 'rail_vt', voltage: '10KV',
    name: 'JDZXW2-25A2 型机车电压互感器',
    summary: '机车专用干式电压互感器，适用于10kV机车配电',
    image: 'images/products/jqvt-10kv-01.jpg',
    cardImage: 'images/products/card/jqvt-10kv-01.jpg',
    dimensions: {
      length: '',
      width: '',
      height: '',
      weight: '',
    },
    specs: [
      { label: '额定电压比', value: '25/0.15/0.15 KV' },
      { label: '额定频率', value: '50 Hz' },
      { label: '准确级', value: '1 / 1' },
      { label: '额定容量', value: '30/130 VA' },
      { label: '绝缘水平', value: '40.5/85/200 kV' },
      { label: '抗震等级', value: 'Ⅰ级' },
      { label: '使用环境', value: '-40°C ~ +70°C' },
      { label: '执行标准', value: 'TB/T 3202-2015' }
    ],
    description: 'JQG-10Y 系列机车电压互感器专为电力机车设计，具有优异的抗震动和耐候性能，适用于机车配电系统的电压测量和计量。',
    features: ['抗震动设计', '体积小、重量轻', '温度适应范围宽', '可靠性高'],
    vtRatings: [
      { ratio: '', accuracy: '', output: '', limitOutput: '', insulation: '', creepage: '', weight: '' }
    ],
  },
  {
    id: 'jqvt-25-07', line: 'standard', type: 'rail_vt', voltage: '20KV',
    name: 'JDZXW2-25A1 型机车电压互感器',
    summary: '机车专用干式电压互感器，适用于20kV机车配电',
    image: 'images/products/jqvt-25-07.jpg',
    cardImage: 'images/products/card/jqvt-25-07.jpg',
    dimensions: {
      length: '',
      width: '',
      height: '',
      weight: '',
    },
    specs: [
      { label: '额定电压比', value: '25/0.15/0.15 KV' },
      { label: '额定频率', value: '50 Hz' },
      { label: '准确级', value: '1 / 1' },
      { label: '额定容量', value: '30/30 VA' },
      { label: '绝缘水平', value: '40.5/85/200 kV' },
      { label: '抗震等级', value: 'Ⅰ级' },
      { label: '使用环境', value: '-40°C ~ +70°C' },
      { label: '执行标准', value: 'TB/T 3202-2015' }
    ],
    description: 'JDZX 系列机车电压互感器，适用于 25kV 机车配电系统的电压测量和计量。',
    features: ['抗震动设计', '体积小、重量轻', '温度适应范围宽', '可靠性高'],
    vtRatings: [
      { ratio: '', accuracy: '', output: '', limitOutput: '', insulation: '', creepage: '', weight: '' }
    ],
  },
  {
    id: 'JDZXW2-25A', line: 'standard', type: 'rail_vt', voltage: '35KV',
    name: 'JDZXW2-25A 型机车电压互感器',
    summary: '机车专用干式电压互感器，适用于35kV机车配电',
    image: 'images/products/jqvt-35kv-01.jpg',
    cardImage: 'images/products/card/jqvt-35kv-01.jpg',
    dimensions: {
      length: '',
      width: '',
      height: '',
      weight: '',
    },
    specs: [
      { label: '额定电压比', value: '25/0.1 KV' },
      { label: '额定频率', value: '50 Hz' },
      { label: '准确级', value: '1' },
      { label: '额定容量', value: '30 VA' },
      { label: '绝缘水平', value: '30.5/70/170 kV' },
      { label: '抗震等级', value: 'Ⅰ级' },
      { label: '使用环境', value: '-40°C ~ +70°C' },
      { label: '执行标准', value: 'TB/T 3202-2015' }
    ],
    description: 'JQG-35Y 系列机车电压互感器专为电力机车设计，适用于 35kV 机车配电系统的电压测量和继电保护。',
    features: ['抗震动设计', '高精度多绕组设计', '温度适应范围宽', '可靠性高'],
    vtRatings: [
      { ratio: '', accuracy: '', output: '', limitOutput: '', insulation: '', creepage: '', weight: '' }
    ],
  },
  {
    id: 'jqvt-25-01', line: 'standard', type: 'rail_vt', voltage: '20KV',
    name: 'JDZXW3-25 型机车电压互感器',
    summary: '机车专用干式电压互感器，适用于20kV机车配电',
    image: 'images/products/jqvt-25-01.jpg',
    cardImage: 'images/products/card/jqvt-25-01.jpg',
    dimensions: {
      length: '',
      width: '',
      height: '',
      weight: '',
    },
    specs: [
      { label: '额定电压比', value: '25/0.1 KV' },
      { label: '额定频率', value: '50 Hz' },
      { label: '准确级', value: '0.5' },
      { label: '额定容量', value: '20 VA' },
      { label: '绝缘水平', value: '31/80/170 kV' },
      { label: '抗震等级', value: 'Ⅰ级' },
      { label: '使用环境', value: '-40°C ~ +70°C' },
      { label: '执行标准', value: 'TB/T 3202-2015' }
    ],
    description: 'JDZXW3-25 系列机车电压互感器，适用于 25kV 机车配电系统的电压测量和计量。',
    features: ['抗震动设计', '体积小、重量轻', '温度适应范围宽', '可靠性高'],
    vtRatings: [
      { ratio: '', accuracy: '', output: '', limitOutput: '', insulation: '', creepage: '', weight: '' }
    ],
  },
  {
    id: 'jqvt-25-02', line: 'standard', type: 'rail_vt', voltage: '20KV',
    name: 'JDZX18-25B 型机车电压互感器',
    summary: '机车专用干式电压互感器，适用于20kV机车配电',
    image: 'images/products/jqvt-25-02.jpg',
    cardImage: 'images/products/card/jqvt-25-02.jpg',
    dimensions: {
      length: '',
      width: '',
      height: '',
      weight: '',
    },
    specs: [
      { label: '额定电压比', value: '25/0.2/0.2/0.2 KV' },
      { label: '额定频率', value: '50 Hz' },
      { label: '准确级', value: '0.5/0.5/0.5' },
      { label: '额定容量', value: '15/15/15 VA' },
      { label: '绝缘水平', value: '31/80/170 kV' },
      { label: '抗震等级', value: 'Ⅰ级' },
      { label: '使用环境', value: '-40°C ~ +70°C' },
      { label: '执行标准', value: 'TB/T 3202-2015' }
    ],
    description: 'JDZX 系列机车电压互感器，适用于 25kV 机车配电系统的电压测量和计量。',
    features: ['抗震动设计', '体积小、重量轻', '温度适应范围宽', '可靠性高'],
    vtRatings: [
      { ratio: '', accuracy: '', output: '', limitOutput: '', insulation: '', creepage: '', weight: '' }
    ],
  },
  {
    id: 'jqvt-25-03', line: 'standard', type: 'rail_vt', voltage: '20KV',
    name: 'JDZX18-25B 型机车电压互感器',
    summary: '机车专用干式电压互感器，适用于20kV机车配电',
    image: 'images/products/jqvt-25-03.jpg',
    cardImage: 'images/products/card/jqvt-25-03.jpg',
    dimensions: {
      length: '',
      width: '',
      height: '',
      weight: '',
    },
    specs: [
      { label: '额定电压比', value: '25/0.15/0.15 KV' },
      { label: '额定频率', value: '50 Hz' },
      { label: '准确级', value: '1/1' },
      { label: '额定容量', value: '30/30 VA' },
      { label: '绝缘水平', value: '31/85/200 kV' },
      { label: '抗震等级', value: 'Ⅰ级' },
      { label: '使用环境', value: '-40°C ~ +70°C' },
      { label: '执行标准', value: 'TB/T 3202-2015' }
    ],
    description: 'JDZX 系列机车电压互感器，适用于 25kV 机车配电系统的电压测量和计量。',
    features: ['抗震动设计', '体积小、重量轻', '温度适应范围宽', '可靠性高'],
    vtRatings: [
      { ratio: '', accuracy: '', output: '', limitOutput: '', insulation: '', creepage: '', weight: '' }
    ],
  },
  {
    id: 'jqvt-25-04', line: 'standard', type: 'rail_vt', voltage: '20KV',
    name: 'JDZX18-25（C) 型机车电压互感器',
    summary: '机车专用干式电压互感器，适用于20kV机车配电',
    image: 'images/products/jqvt-25-04.jpg',
    cardImage: 'images/products/card/jqvt-25-04.jpg',
    dimensions: {
      length: '',
      width: '',
      height: '',
      weight: '',
    },
    specs: [
      { label: '额定电压比', value: '25/0.1 KV' },
      { label: '额定频率', value: '50 Hz' },
      { label: '准确级', value: '1' },
      { label: '额定容量', value: '30 VA' },
      { label: '绝缘水平', value: '31/80/170 kV' },
      { label: '抗震等级', value: 'Ⅰ级' },
      { label: '使用环境', value: '-40°C ~ +70°C' },
      { label: '执行标准', value: 'TB/T 3202-2015' }
    ],
    description: 'JDZX 系列机车电压互感器，适用于 25kV 机车配电系统的电压测量和计量。',
    features: ['抗震动设计', '体积小、重量轻', '温度适应范围宽', '可靠性高'],
    vtRatings: [
      { ratio: '', accuracy: '', output: '', limitOutput: '', insulation: '', creepage: '', weight: '' }
    ],
  },
  {
    id: 'jqvt-25-05', line: 'standard', type: 'rail_vt', voltage: '20KV',
    name: 'JDZX18-25D 型机车电压互感器',
    summary: '机车专用干式电压互感器，适用于20kV机车配电',
    image: 'images/products/jqvt-25-05.jpg',
    cardImage: 'images/products/card/jqvt-25-05.jpg',
    dimensions: {
      length: '',
      width: '',
      height: '',
      weight: '',
    },
    specs: [
      { label: '额定电压比', value: '25/0.1 KV' },
      { label: '额定频率', value: '50 Hz' },
      { label: '准确级', value: '1' },
      { label: '额定容量', value: '120 VA' },
      { label: '绝缘水平', value: '31/85/200 kV' },
      { label: '抗震等级', value: 'Ⅰ级' },
      { label: '使用环境', value: '-40°C ~ +70°C' },
      { label: '执行标准', value: 'TB/T 3202-2015' }
    ],
    description: 'JDZX 系列机车电压互感器，适用于 25kV 机车配电系统的电压测量和计量。',
    features: ['抗震动设计', '体积小、重量轻', '温度适应范围宽', '可靠性高'],
    vtRatings: [
      { ratio: '', accuracy: '', output: '', limitOutput: '', insulation: '', creepage: '', weight: '' }
    ],
  },
  {
    id: 'jqvt-25-06', line: 'standard', type: 'rail_vt', voltage: '20KV',
    name: 'JDZXW3-25B1 型机车电压互感器',
    summary: '机车专用干式电压互感器，适用于20kV机车配电',
    image: 'images/products/jqvt-25-06.jpg',
    cardImage: 'images/products/card/jqvt-25-06.jpg',
    dimensions: {
      length: '',
      width: '',
      height: '',
      weight: '',
    },
    specs: [
      { label: '额定电压比', value: '25/0.1/0.1 KV' },
      { label: '额定频率', value: '50 Hz' },
      { label: '准确级', value: '0.5/0.5' },
      { label: '额定容量', value: '20/20 VA' },
      { label: '绝缘水平', value: '40.5/100/200 kV' },
      { label: '抗震等级', value: 'Ⅰ级' },
      { label: '使用环境', value: '-40°C ~ +70°C' },
      { label: '执行标准', value: 'TB/T 3202-2015' }
    ],
    description: 'JDZX 系列机车电压互感器，适用于 25kV 机车配电系统的电压测量和计量。',
    features: ['抗震动设计', '体积小、重量轻', '温度适应范围宽', '可靠性高'],
    vtRatings: [
      { ratio: '', accuracy: '', output: '', limitOutput: '', insulation: '', creepage: '', weight: '' }
    ],
  },
]

const lines = [
  { id: 'all', name: '全部' }
]

const types = [
  { id: 'all', name: '全部' },
  { id: 'current', name: '电流互感器', icon: '⚡' },
  { id: 'voltage', name: '电压互感器', icon: '🔌' },
  { id: 'combined', name: '组合互感器', icon: '🔗' }
]

const voltages = []

const series = [
  { id: 'all', name: '全部' },
  { id: 'lzzb9', name: 'LZZB9系列' },
  { id: 'lzzbj9', name: 'LZZBJ9系列' },
  { id: 'lzzbj18', name: 'LZZBJ18系列' }
]

function getTypeIcon(typeId) {
  const map = { current: '⚡', voltage: '🔌', combined: '🔗', zero: '🔄', post: '🏛️', wall: '🧱', outdoor: '🌲', vt36: '🔌', vtOutdoor: '🌲', rail_ct: '🚂', rail_vt: '🚄' }
  return map[typeId] || '📦'
}

function getTypeName(typeId) {
  const map = { current: '电流互感器', voltage: '电压互感器', combined: '组合互感器', zero: '零序电流互感器', post: '3.6-12KV支柱式电流互感器', wall: '3.6-12KV穿墙式电流互感器', outdoor: '3.6-12KV户外电流、电压互感器', vt36: '3.6-12KV电压互感器', vtOutdoor: '3.6-12KV户外电压互感器', rail_ct: '机车动车电流互感器', rail_vt: '机车动车电压互感器' }
  return map[typeId] || '未知'
}

function getLineName(lineId) {
  const map = {}
  return map[lineId] || ''
}

const companyInfo = {
  name: '大北互',
  fullName: '大连北方互感器集团有限公司',
  shortName: '大北互',
  slogan: '人品决定产品，科技决定未来',
  desc: '公司位于辽宁省大连市普兰店区丰荣工业园区，是专业从事电力互感器研发、生产和销售的高新技术企业。',
  contact: {
    address: '辽宁省大连市普兰店区丰荣工业园区',
    email: '',
    website: 'www.dlbf.com',
    phone: '0411-83291638'
  },
  certifications: [
    { icon: '🏅', name: 'ISO9001 质量认证' },
    { icon: '📜', name: '国家计量器具许可' },
    { icon: '🔬', name: '省级高新技术企业' },
    { icon: '🌍', name: 'CE 国际认证' }
  ],
  strengths: [
    { num: '40万+', label: '㎡ 占地面积' },
    { num: '1800+', label: '在职员工' },
    { num: '200+', label: '国家专利' },
    { num: '30+', label: '参编标准(部)' }
  ]
}

if (typeof module !== 'undefined') {
  module.exports = { products, carouselSlides, lines, types, voltages, series, getTypeIcon, getTypeName, getLineName, companyInfo }
}
