<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue'
import { withBase } from 'vitepress'
import { createStevensonScreen } from './models/StevensonScreen'
import { createWindTower } from './models/WindTower'
import { createRainGauge } from './models/RainGauge'
import { createCloudRadar } from './models/CloudRadar'
import { createVisibilitySensor } from './models/VisibilitySensor'
// —— img2threejs 管线重建的其余设备模型 ——
import { createPrecipitationPhenomena } from './models/PrecipitationPhenomena'
import { createPhenomCamera } from './models/PhenomCamera'
import { createGroundTemp } from './models/GroundTemp'
import { createSunshineSensor } from './models/SunshineSensor'
import { createGrassTemp } from './models/GrassTemp'
import { createDeepTemp } from './models/DeepTemp'
import { createEvaporationPan } from './models/EvaporationPan'
import { createMicrowaveRadiometer } from './models/MicrowaveRadiometer'
import { createWindProfiler } from './models/WindProfiler'
import { createGnssMet } from './models/GnssMet'
import { createLidarWind } from './models/LidarWind'
import { createWeatherMod } from './models/WeatherMod'
import { createWeightPrecip } from './models/WeightPrecip'
import { createIcingRack } from './models/IcingRack'
import { createLightningLocator } from './models/LightningLocator'
import { createVisObstruction } from './models/VisObstruction'
import { createPowerBox } from './models/PowerBox'
import { createDataLogger } from './models/DataLogger'
import { createHwController } from './models/HwController'
import { createUltrasonicEvap } from './models/UltrasonicEvap'

const container = ref<HTMLDivElement | null>(null)
const selected = ref<any>(null)
const loading = ref(true)
const errorMsg = ref('')
const showGrid = ref(false) // 默认不显示网格

// 设备是否可拖动：默认 false（禁止拖动），需要时由调用方通过 :draggable="true" 开启
const props = withDefaults(defineProps<{ draggable?: boolean }>(), { draggable: false })

const FIELD_SIZE = 25 // 观测场边长（米）：25m × 25m 正方形，原点(0,0)在西南角，X 东、Y 北
const PATH_W = 0.6   // 步道宽度（米），规范小路
const PAD = 1.4      // 设备便道平台边长（米）
const NORTH_EXT = 7  // 北门外引路在场外延伸的长度（米）

// 全部设备（与 equipment/*.md 一一对应）
const FULL: any[] = [
  { id: 'th', name: '百叶箱（温湿度）', type: 'th', color: 0x22d3ee, desc: '白色玻璃钢百叶箱，安装温、湿度传感器，防止辐射并保证通风。', link: '/equipment/th' },
  { id: 'wind', name: '风塔', type: 'wind', color: 0x3b82f6, desc: '10–12m 高风塔，安装风向标与风杯，测风向与风速。', link: '/equipment/wind' },
  { id: 'rainfall', name: '翻斗式雨量传感器', type: 'rain', color: 0x38bdf8, desc: '翻斗计数 / 称重计量降水量，反演降水强度。', link: '/equipment/rainfall' },
  { id: 'rainfall2', name: '翻斗式雨量传感器②', type: 'rain', color: 0x38bdf8, desc: '翻斗式雨量传感器（三角阵列）', link: '/equipment/rainfall' },
  { id: 'rainfall3', name: '翻斗式雨量传感器③', type: 'rain', color: 0x38bdf8, desc: '翻斗式雨量传感器（三角阵列）', link: '/equipment/rainfall' },
  { id: 'rainfall_backup', name: '备份雨量桶', type: 'rain', color: 0x7dd3fc, desc: '备份用标准雨量筒，不锈钢材质。', link: '/equipment/rainfall' },
  { id: 'visibility', name: '能见度传感器', type: 'visibility', color: 0x34d399, desc: '散射法测量气象光学视程（MOR）。', link: '/equipment/visibility' },
  { id: 'precip', name: '降水现象仪', type: 'precip', color: 0x2dd4bf, desc: '激光检测粒子图谱，识别雨、雪、冰雹等降水现象。', link: '/equipment/precip' },
  { id: 'phenom', name: '天气现象视频观测仪', type: 'phenom', color: 0xa855f7, desc: '计算机视觉 + 深度学习，识别云、霜、积雪等。', link: '/equipment/phenom' },
  { id: 'ground', name: '地温场', type: 'ground', color: 0xf59e0b, desc: '测地面温度及 5/10/15/20cm 浅层地温。', link: '/equipment/ground' },
  { id: 'sunshine', name: '日照传感器', type: 'sunshine', color: 0xfacc15, desc: '记录太阳实际照射时数。', link: '/equipment/sunshine' },
  { id: 'grass', name: '草面温度传感器', type: 'grass', color: 0x84cc16, desc: '距地 6cm 测草面温度，用于霜冻预警。', link: '/equipment/grass' },
  { id: 'deep', name: '深层地温传感器', type: 'deep', color: 0xfb923c, desc: '测 40/80/160/320cm 深层地温，反映土壤热状况。', link: '/equipment/deep' },
  { id: 'evap', name: '蒸发观测设备', type: 'evap', color: 0x8b5cf6, desc: 'E-601 蒸发皿，观测水面蒸发量。', link: '/equipment/evap' },
  { id: 'datalogger', name: '自动气象站采集器（气压）', type: 'datalogger', color: 0xf472b6, desc: '采集并汇总各类常规气象观测要素，气压传感器也位于此。', link: '/equipment/datalogger' },
  { id: 'evapsensor', name: '超声波蒸发传感器', type: 'evapsensor', color: 0xc084fc, desc: '超声波测距测量蒸发器内水面高度变化。', link: '/equipment/evapsensor' },
  { id: 'weightprecip', name: '称重式降水传感器', type: 'weightprecip', color: 0x5eead4, desc: '称重计量固态/液态降水量，适用雨、雪、冰雹。', link: '/equipment/weightprecip' },
  { id: 'icingrack', name: '电线积冰架', type: 'icingrack', color: 0xa5f3fc, desc: '观测导线覆冰厚度、直径与重量。', link: '/equipment/icingrack' },
  { id: 'lightning', name: '闪电定位仪', type: 'lightning', color: 0xfde047, desc: '探测云地闪电位置、时间与强度。', link: '/equipment/lightning' },
  { id: 'visobs', name: '视程障碍现象仪', type: 'visobs', color: 0x7dd3fc, desc: '识别雾、霾、沙尘等视程障碍现象。', link: '/equipment/visobs' },
  { id: 'powerbox', name: '智能配电箱', type: 'powerbox', color: 0xfb7185, desc: '统一为观测场设备配电、防雷与远程控制。', link: '/equipment/powerbox' },
  { id: 'hwcontroller', name: '综合集成硬件控制器', type: 'hwcontroller', color: 0x94a3b8, desc: '集成采集、控制与通信的现场核心机箱。', link: '/equipment/hwcontroller' },
  { id: 'cloudradar', name: '毫米波测云仪', type: 'cloudradar', color: 0x60a5fa, desc: '毫米波散射探测云的垂直结构（回波顶/底高、粒子尺度）。', link: '/equipment/cloudradar' },
  { id: 'radiometer', name: '微波辐射计', type: 'radiometer', color: 0xfbbf24, desc: '被动微波遥感，连续获取温湿廓线与云水含量。', link: '/equipment/radiometer' },
  { id: 'windprofiler', name: '风廓线雷达', type: 'windprofiler', color: 0x818cf8, desc: '湍流散射连续获取水平/垂直风场廓线。', link: '/equipment/windprofiler' },
  { id: 'gnssmet', name: 'GNSS/MET 水汽探测仪', type: 'gnssmet', color: 0x34d399, desc: '导航卫星信号反演大气可降水量等参数。', link: '/equipment/gnssmet' },
  { id: 'lidarwind', name: '3D 激光测风雷达', type: 'lidarwind', color: 0x2dd4bf, desc: '多普勒激光获取三维风矢量与风廓线。', link: '/equipment/lidarwind' },
  { id: 'weathermod', name: '人工影响天气装备', type: 'weathermod', color: 0xf43f5e, desc: '火箭/高炮/烟炉/飞机向云中播撒催化剂，增雨防雹消雾。', link: '/equipment/weathermod' }
]

// 设备布局（gx 东向、gy 北向，原点西南角，25m×25m 场地）
// 与 public/devices.json 保持一致：devices.json 优先，此处作为其缺失时的回退坐标。
// 所有坐标均收敛在场地范围内（此前 devices.json 中若干设备 x≈28 / y=-9.9 落在围栏之外，已重排进场）。
const placeMap: any[] = [
  { x: 19.47, y: 17.16, id: 'th', label: '百叶箱' },
  { x: 21.22, y: 21.97, id: 'wind', label: '风塔', height: 10 },
  { x: 14.92, y: 11.16, id: 'rainfall', label: '雨量传感器' },
  { x: 16.47, y: 11.13, id: 'rainfall2', label: '雨量传感器②' },
  { x: 15.6, y: 12.39, id: 'rainfall3', label: '雨量传感器③' },
  { x: 9.75, y: 12.3, id: 'rainfall_backup', label: '备份雨量桶' },
  { x: 10.2, y: 21.31, id: 'visibility', label: '能见度仪' },
  { x: 4.02, y: 21.8, id: 'precip', label: '人工观测雨量筒' },
  { x: 3.85, y: 12.92, id: 'phenom', label: '天气现象仪' },
  { x: 8.46, y: 3.33, id: 'ground', label: '地面浅层地温' },
  { x: 12.51, y: 3.51, id: 'sunshine', label: '日照计' },
  { x: 6, y: 3, id: 'grass', label: '草温' },
  { x: 17.61, y: 3.06, id: 'deep', label: '深层地温' },
  { x: 4.67, y: 6.34, id: 'evap', label: '大型蒸发皿' },
  // —— 原先 devices.json 中坐标越界、实际落在图外的设备（现已收入场内地块） ——
  { x: 7.3, y: 19.2, id: 'cloudradar', label: '云观测设备' },
  { x: 7.3, y: 15.6, id: 'radiometer', label: '微波辐射计' },
  { x: 2.6, y: 9, id: 'windprofiler', label: '风廓线雷达' },
  { x: 22.6, y: 12.6, id: 'gnssmet', label: 'GNSS/MET' },
  { x: 22.6, y: 9.6, id: 'lidarwind', label: '3D激光测风雷达' },
  { x: 2.8, y: 4.8, id: 'weathermod', label: '人工影响天气装备' },
  // —— 2026-09-18 新增设备（原先仅建介绍页，未进 3D；现补入场景） ——
  { x: 22.6, y: 19.4, id: 'datalogger', label: '采集器' },
  { x: 6.6, y: 7.8, id: 'evapsensor', label: '超声波蒸发传感器' },
  { x: 11.6, y: 17.2, id: 'weightprecip', label: '称重式降水传感器' },
  { x: 7, y: 17.6, id: 'icingrack', label: '电线积冰架' },
  { x: 13.6, y: 19.2, id: 'lightning', label: '闪电定位仪' },
  { x: 16.6, y: 20.6, id: 'visobs', label: '视程障碍现象仪' },
  { x: 22.8, y: 16.4, id: 'powerbox', label: '智能配电箱' },
  { x: 22.6, y: 6.8, id: 'hwcontroller', label: '综合硬件控制器' }
]

// 步道布局：内置默认方案为「北门进入 + 一条纵向主路 + 四条横向步道」。
// 若把绘制工具（/road-planner.html）导出的 roads.json 放进 public/，则以该文件为准。
const MAIN_X = 12.5                                 // 纵向主路中心（东西向位置）
const H_YS = [20, 15, 10, 5]                        // 横向步道中心线 y
const H_X_SPAN: [number, number] = [2.5, 22.5]      // 横向步道东西范围

type Item = any
// 统一图元：cx/cy - 中心（场地坐标）、len - 长度、wid - 宽度、rot - 逆时针弧度（0 = 东西向）
type Shape = { kind: 'road' | 'pad'; cx: number; cy: number; len: number; wid: number; rot: number }

const DEFAULT_ITEMS: Item[] = [
  { type: 'rect', x1: MAIN_X - 1.2, y1: FIELD_SIZE, x2: MAIN_X + 1.2, y2: FIELD_SIZE + NORTH_EXT }, // 北门外引路
  { type: 'path', width: PATH_W, points: [[MAIN_X, 0], [MAIN_X, FIELD_SIZE]] } // 纵向主路贯穿南北
]
for (const y of H_YS) {
  DEFAULT_ITEMS.push({ type: 'rect', x1: H_X_SPAN[0], y1: y - PATH_W / 2, x2: H_X_SPAN[1], y2: y + PATH_W / 2 })
}
for (const p of placeMap) DEFAULT_ITEMS.push({ type: 'pad', x: p.x, y: p.y, size: PAD })

// 读取 public/roads.json（绘制工具导出），缺失或失败时回落内置布局
async function loadRoadItems(): Promise<Item[]> {
  try {
    const res = await fetch(withBase('roads.json'))
    if (!res.ok) return DEFAULT_ITEMS
    const json = await res.json()
    const arr = Array.isArray(json) ? json : json?.items
    if (Array.isArray(arr) && arr.length) return arr
  } catch (e) { /* 未放置 roads.json 时使用内置布局 */ }
  return DEFAULT_ITEMS
}

// 读取 public/devices.json（拖动后导出的设备布局），缺失或失败时回落内置 placeMap
async function loadDeviceMap(): Promise<any[]> {
  try {
    const res = await fetch(withBase('devices.json'))
    if (!res.ok) return placeMap
    const json = await res.json()
    if (Array.isArray(json) && json.length) return json
  } catch (e) { /* 未放置 devices.json 时使用内置布局 */ }
  return placeMap
}

// 图元 → 矩形块（贴图与实体共用）
function itemToShapes(it: Item): Shape[] {
  if (it.type === 'rect') {
    const x1 = Math.min(it.x1, it.x2), x2 = Math.max(it.x1, it.x2)
    const y1 = Math.min(it.y1, it.y2), y2 = Math.max(it.y1, it.y2)
    const dx = x2 - x1, dy = y2 - y1
    return [{ kind: 'road', cx: (x1 + x2) / 2, cy: (y1 + y2) / 2, len: Math.max(dx, dy), wid: Math.min(dx, dy), rot: dy > dx ? Math.PI / 2 : 0 }]
  }
  if (it.type === 'pad') return [{ kind: 'pad', cx: it.x, cy: it.y, len: it.size, wid: it.size, rot: 0 }]
  if (it.type === 'path' && Array.isArray(it.points) && it.points.length >= 2) {
    const w = it.width || PATH_W
    const pts: number[][] = it.points.map((p: any) => (Array.isArray(p) ? [p[0], p[1]] : [p.x, p.y]))
    const out: Shape[] = []
    for (let i = 0; i < pts.length - 1; i++) {
      const dx = pts[i + 1][0] - pts[i][0], dy = pts[i + 1][1] - pts[i][1]
      const len = Math.hypot(dx, dy)
      if (len < 1e-4) continue
      out.push({ kind: 'road', cx: (pts[i][0] + pts[i + 1][0]) / 2, cy: (pts[i][1] + pts[i + 1][1]) / 2, len: len + w / 2, wid: w, rot: Math.atan2(dy, dx) })
    }
    // 转角补方块，避免折线接缝露空
    for (let i = 1; i < pts.length - 1; i++) out.push({ kind: 'road', cx: pts[i][0], cy: pts[i][1], len: w, wid: w, rot: 0 })
    return out
  }
  return []
}

function itemsToShapes(items: Item[]): Shape[] {
  const out: Shape[] = []
  for (const it of items) for (const s of itemToShapes(it)) out.push(s)
  return out
}

// 地面坐标 → 世界坐标（X 东不变，北向 Y 映射到 -Z）
const toWorld = (gx: number, gy: number): [number, number] => [gx, -(gy - FIELD_SIZE / 2)]

let renderer: any, scene: any, camera: any, controls: any, labelRenderer: any, tcontrols: any
let raycaster: any, pointer: any, clock: any, animId = 0
let gridOverlay: any = null
const groups: any[] = []
let hovered: any = null
let dragging = false

// 整页跳转：避免 SPA 内容过渡(Transition) 与 Three.js 画布卸载冲突
// 该冲突会导致 Vue 在 patch 旧页面时报 "Cannot read properties of null (reading 'subTree')"
const go = (link: string) => {
  if (!link) return
  window.location.href = withBase(link)
}

// 3D 页面离开时使用整页刷新，避免 VitePress 的 SPA 路由过渡与 Three.js 画布卸载冲突
// （该冲突会让顶部导航“点击无反应”）。对顶部导航内的真实页面链接强制整页跳转；
// 下拉触发器（无 href 的按钮）不受影响，仍可正常展开。
function onNavAnchorClick(e: MouseEvent) {
  const a = (e.target as HTMLElement | null)?.closest?.('.VPNav a[href]') as HTMLAnchorElement | null
  if (!a) return
  const href = a.getAttribute('href') || ''
  if (!href || href.startsWith('http') || href.startsWith('//') || href.startsWith('#')) return
  e.preventDefault()
  window.location.href = withBase(href)
}

// 使用 img2threejs 管线重建的完整程序化模型：type → 模型工厂
// 这些模型均自带底座与真实尺度，因此不再叠加通用底座圆盘，也不随分组整体浮动
const MODEL_FACTORY: Record<string, () => any> = {
  // 原有 5 个模型
  th: createStevensonScreen,          // 百叶箱
  wind: createWindTower,              // 风塔
  rain: createRainGauge,              // 翻斗式雨量（含备份桶共用）
  cloudradar: createCloudRadar,       // 毫米波测云仪
  visibility: createVisibilitySensor, // 能见度仪
  // 2026-09-18 新增：其余设备全部改用 img2threejs 管线重建
  precip: createPrecipitationPhenomena, // 降水现象仪
  phenom: createPhenomCamera,           // 天气现象视频观测仪
  ground: createGroundTemp,             // 地温场（浅层地温）
  sunshine: createSunshineSensor,       // 日照传感器
  grass: createGrassTemp,               // 草面温度传感器
  deep: createDeepTemp,                 // 深层地温传感器
  evap: createEvaporationPan,           // E-601 蒸发器
  evapsensor: createUltrasonicEvap,     // 超声波蒸发传感器
  radiometer: createMicrowaveRadiometer,// 微波辐射计
  windprofiler: createWindProfiler,     // 风廓线雷达
  gnssmet: createGnssMet,               // GNSS/MET 水汽探测仪
  lidarwind: createLidarWind,           // 3D 激光测风雷达
  weathermod: createWeatherMod,         // 人工影响天气装备
  weightprecip: createWeightPrecip,     // 称重式降水传感器
  icingrack: createIcingRack,           // 电线积冰架
  lightning: createLightningLocator,    // 闪电定位仪
  visobs: createVisObstruction,         // 视程障碍现象仪
  powerbox: createPowerBox,             // 智能配电箱
  datalogger: createDataLogger,         // 自动气象站采集器
  hwcontroller: createHwController,     // 综合集成硬件控制器
}

function makeHead(type: string, THREE: any, color: number) {
  const factory = MODEL_FACTORY[type]
  if (factory) return factory()
  // 兜底：未建模的 type 用一个通用指示球
  const g = new THREE.Group()
  const mat = new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.35, metalness: 0.3, roughness: 0.45 })
  g.add(new THREE.Mesh(new THREE.SphereGeometry(0.4, 16, 16), mat))
  return g
}

function makeGroundTexture(THREE: any, shapes: Shape[], deviceList: any[] = placeMap) {
  // 纹理与 3D 世界严格 1:1 对齐：去掉边距，像素 = 地理坐标 × m
  const m = 40                                   // 像素 / 米
  const W = FIELD_SIZE * m                       // 场地宽（东向，gx 0..25）
  const H = (FIELD_SIZE + NORTH_EXT) * m         // 含北门外引路（gy 0..25+7）
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  // 地面坐标 (gx, gy) → canvas 像素：顶部为北（gy=25+7 北门外引路段），底部为南（gy=0）
  const cx = (gx: number) => gx * m
  const cy = (gy: number) => (FIELD_SIZE + NORTH_EXT - gy) * m

  const c = canvas.getContext('2d')!

  // 场外土地底色（铺满，含北门外引路区域）
  c.fillStyle = '#8fae7c'
  c.fillRect(0, 0, W, H)
  // 草地底色（场地 gy 0..25）
  c.fillStyle = '#5cb85c'
  c.fillRect(0, NORTH_EXT * m, FIELD_SIZE * m, FIELD_SIZE * m)

  // 草地噪点纹理
  for (let i = 0; i < 12000; i++) {
    const gx = Math.random() * FIELD_SIZE, gy = Math.random() * FIELD_SIZE
    c.fillStyle = Math.random() > 0.5 ? 'rgba(255,255,255,0.045)' : 'rgba(0,60,0,0.05)'
    c.fillRect(cx(gx), cy(gy), 2, 2)
  }

  // 步道 / 便道平台（支持任意角度：先统一填充，再给平台描边）
  for (const s of shapes) {
    c.save()
    c.translate(cx(s.cx), cy(s.cy))
    c.rotate(-s.rot)            // 地面逆时针 → canvas 顺时针
    const w = s.len * m, h = s.wid * m
    c.fillStyle = s.kind === 'pad' ? '#cdd4d6' : '#d8dede'
    c.fillRect(-w / 2, -h / 2, w, h)
    if (s.kind === 'pad') {
      c.strokeStyle = '#aeb9bc'
      c.lineWidth = 1.5
      c.strokeRect(-w / 2, -h / 2, w, h)
    }
    c.restore()
  }

  // 地面仅保留草地 / 步道 / 便道 / 场地边框，不再绘制设备圆点与文字标注
  // （设备识别由悬浮 CSS2D 标签承担，避免贴地文字与 3D 模型位置错位）

  // 场地边框
  c.strokeStyle = '#7d8b7a'; c.lineWidth = 4
  c.strokeRect(0, NORTH_EXT * m, FIELD_SIZE * m, FIELD_SIZE * m)

  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 8
  return tex
}

function buildPicketFence(THREE: any, scene: any) {
  // 白色尖桩围栏：立柱 + 两根横杆 + 尖桩（参考图册效果）
  const white = new THREE.MeshStandardMaterial({ color: 0xf5f7f8, roughness: 0.55, metalness: 0.08 })
  const F_H = 1.1, PICKET_W = 0.09, PICKET_T = 0.03, GAP = 0.09, POST_STEP = 2.5
  const gateW = 2.6 // 北侧大门开口（主步道处）

  const addPickets = (x1: number, y1: number, x2: number, y2: number, skipMid?: [number, number]) => {
    const dx = x2 - x1, dy = y2 - y1
    const len = Math.hypot(dx, dy)
    const n = Math.max(1, Math.round(len / (PICKET_W + GAP)))
    const angle = Math.atan2(-dy, dx) // 世界坐标旋转（北向 y → -z）
    for (let i = 0; i <= n; i++) {
      const t = i / n
      const px = x1 + dx * t, pz = y1 + dy * t
      if (skipMid && px > skipMid[0] && px < skipMid[1]) continue
      const picket = new THREE.Mesh(new THREE.BoxGeometry(PICKET_W, F_H, PICKET_T), white)
      picket.position.set(px, F_H / 2, pz)
      picket.rotation.y = -angle
      scene.add(picket)
    }
    // 横杆（上下两根，分段以避开大门开口）
    const rail = (yOff: number) => {
      const segs: [number, number][] = skipMid
        ? [[x1, skipMid[0]], [skipMid[1], x2]]
        : [[x1, x2]]
      for (const [a, b] of segs) {
        const mid = (a + b) / 2
        const rl = Math.max(0.01, b - a)
        const r = new THREE.Mesh(new THREE.BoxGeometry(rl, 0.07, 0.05), white)
        r.position.set(mid, yOff, y1)
        r.rotation.y = -angle
        scene.add(r)
      }
    }
    rail(F_H * 0.72); rail(F_H * 0.32)
    // 加强立柱
    const posts = Math.max(1, Math.round(len / POST_STEP))
    for (let i = 0; i <= posts; i++) {
      const t = i / posts
      const px = x1 + dx * t, pz = y1 + dy * t
      if (skipMid && px > skipMid[0] - 0.1 && px < skipMid[1] + 0.1) continue
      const post = new THREE.Mesh(new THREE.BoxGeometry(0.14, F_H + 0.18, 0.14), white)
      post.position.set(px, (F_H + 0.18) / 2, pz)
      post.rotation.y = -angle
      scene.add(post)
    }
  }

  const [wx0] = toWorld(0, 0)
  const [, wzN] = toWorld(0, FIELD_SIZE)
  const [wx25] = toWorld(FIELD_SIZE, 0)
  // 北（大门开口在主步道两侧）/ 南 / 西 / 东
  const [gx1, gx2] = [MAIN_X - gateW / 2, MAIN_X + gateW / 2]
  addPickets(wx0, wzN, wx25, wzN, [gx1, gx2])
  addPickets(wx0, -wzN, wx25, -wzN)
  addPickets(wx0, wzN, wx0, -wzN)
  addPickets(wx25, wzN, wx25, -wzN)
  // 大门（两扇对开栅栏门，微开）
  for (const s of [-1, 1]) {
    const gate = new THREE.Group()
    for (let i = 0; i < 7; i++) {
      const p = new THREE.Mesh(new THREE.BoxGeometry(PICKET_W, F_H, PICKET_T), white)
      p.position.set(i * (PICKET_W + GAP), F_H / 2, 0); gate.add(p)
    }
    for (const yo of [F_H * 0.72, F_H * 0.32]) {
      const r = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.07, 0.05), white)
      r.position.set(0.55, yo, 0); gate.add(r)
    }
    const hingeX = s > 0 ? gx2 : gx1
    gate.position.set(hingeX, 0, wzN)
    gate.rotation.y = s * -0.5
    scene.add(gate)
  }
}

// 25m × 25m 场地框 + 0.5m 间隔虚线网格（贴地 3cm，便于对照图纸定位道路）
function buildGridOverlay(THREE: any, step = 0.5) {
  const g = new THREE.Group()
  const y = 0.035
  const pts: number[] = []
  const n = Math.round(FIELD_SIZE / step)
  for (let i = 0; i <= n; i++) {
    const v = i * step
    if (v > FIELD_SIZE + 1e-6) break
    const [ax, azN] = toWorld(v, 0), [, azEnd] = toWorld(v, FIELD_SIZE)
    pts.push(ax, y, azN, ax, y, azEnd)
    const [bxW, bz] = toWorld(0, v), [bxE] = toWorld(FIELD_SIZE, v)
    pts.push(bxW, y, bz, bxE, y, bz)
  }
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3))
  const lines = new THREE.LineSegments(
    geo,
    new THREE.LineDashedMaterial({ color: 0x9fd8ff, dashSize: 0.25, gapSize: 0.2, transparent: true, opacity: 0.5 })
  )
  lines.computeLineDistances()
  g.add(lines)

  // 场地外框
  const [c0x, c0z] = toWorld(0, 0), [c1x, c1z] = toWorld(FIELD_SIZE, FIELD_SIZE)
  const borderGeo = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(c0x, y, c0z), new THREE.Vector3(c1x, y, c0z),
    new THREE.Vector3(c1x, y, c1z), new THREE.Vector3(c0x, y, c1z)
  ])
  g.add(new THREE.LineLoop(borderGeo, new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.75 })))
  return g
}

function makeSkyTexture(THREE: any) {
  // 淡蓝 → 白 渐变天空
  const canvas = document.createElement('canvas')
  canvas.width = 16; canvas.height = 256
  const c = canvas.getContext('2d')!
  const grad = c.createLinearGradient(0, 0, 0, 256)
  grad.addColorStop(0, '#7ec3f0')
  grad.addColorStop(0.6, '#cfe8f8')
  grad.addColorStop(1, '#f2f8fc')
  c.fillStyle = grad
  c.fillRect(0, 0, 16, 256)
  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

async function init() {
  const THREE = await import('three')
  const { OrbitControls } = await import('three/examples/jsm/controls/OrbitControls.js')
  const { CSS2DRenderer, CSS2DObject } = await import('three/examples/jsm/renderers/CSS2DRenderer.js')
  const { TransformControls } = await import('three/examples/jsm/controls/TransformControls.js')

  const el = container.value!
  const w = el.clientWidth, h = el.clientHeight

  scene = new THREE.Scene()
  scene.fog = new THREE.Fog(0xe4f1fa, 80, 220)

  camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 500)
  camera.position.set(34, 22, 34)

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  renderer.setSize(w, h)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  el.appendChild(renderer.domElement)

  labelRenderer = new CSS2DRenderer()
  labelRenderer.setSize(w, h)
  labelRenderer.domElement.style.position = 'absolute'
  labelRenderer.domElement.style.top = '0'
  labelRenderer.domElement.style.left = '0'
  labelRenderer.domElement.style.pointerEvents = 'none'
  el.appendChild(labelRenderer.domElement)

  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.08
  controls.minDistance = 10
  controls.maxDistance = 120
  controls.maxPolarAngle = Math.PI / 2.15
  controls.target.set(FIELD_SIZE / 2, 0.5, -FIELD_SIZE / 2 + 3)
  controls.autoRotate = true
  controls.autoRotateSpeed = 0.25

  // 拖动控制（仅地面 X/Z 平移）
  tcontrols = new TransformControls(camera, renderer.domElement)
  tcontrols.setMode('translate')
  if ('showY' in tcontrols) tcontrols.showY = false
  tcontrols.setSize(0.9)
  tcontrols.addEventListener('dragging-changed', (e: any) => {
    dragging = e.value
    controls.enabled = !e.value
  })
  const tHelper = (tcontrols as any).getHelper ? (tcontrols as any).getHelper() : tcontrols
  scene.add(tHelper)

  // 光照（清新日光感）
  scene.add(new THREE.HemisphereLight(0xcfe8f8, 0x6a9a5c, 0.9))
  const dir = new THREE.DirectionalLight(0xfff5e0, 1.6)
  dir.position.set(30, 45, 20)
  scene.add(dir)

  scene.background = makeSkyTexture(THREE)

  // 场外草地（大范围）
  const outer = new THREE.Mesh(
    new THREE.PlaneGeometry(300, 300),
    new THREE.MeshStandardMaterial({ color: 0x8fae7c, roughness: 1, metalness: 0 })
  )
  outer.rotation.x = -Math.PI / 2
  outer.position.y = -0.02
  scene.add(outer)

  // 道路布局：优先加载 public/roads.json（绘制工具导出），否则用内置布局
  const items = await loadRoadItems()
  const shapes = itemsToShapes(items)
  // 设备布局：优先加载 public/devices.json（拖动导出后的布局），否则用内置 placeMap
  const deviceMap = await loadDeviceMap()

  // 合并布局：devices.json 优先，缺失的设备回退到内置 placeMap，
  // 保证新增设备（未出现在旧版 devices.json 中）也有正确坐标而不是全部堆在原点。
  const layout = FULL.map((e) => {
    const slot = deviceMap.find((s) => s.id === e.id) || placeMap.find((s) => s.id === e.id)
    return slot ? { ...slot } : { id: e.id, x: FIELD_SIZE / 2, y: FIELD_SIZE / 2, label: e.name }
  })

  // 观测场草地（含南门外引路的贴地纹理）；贴图上的设备圆点+名称标记使用真实布局，避免与 3D 模型位置不一致
  const groundTex = makeGroundTexture(THREE, shapes, layout)
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(FIELD_SIZE, FIELD_SIZE + NORTH_EXT),
    new THREE.MeshStandardMaterial({ map: groundTex, roughness: 0.95, metalness: 0 })
  )
  ground.rotation.x = -Math.PI / 2
  // 场地 X∈[0,25]、Z∈[-12.5,12.5]，北门外引路向 -Z 延伸 NORTH_EXT m → 平面中心 z = -NORTH_EXT/2
  ground.position.set(FIELD_SIZE / 2, 0, -NORTH_EXT / 2)
  scene.add(ground)

  // 步道 / 便道实体（浅灰，微高于草地）
  const roadMat = new THREE.MeshStandardMaterial({ color: 0xd8dede, roughness: 0.9, metalness: 0.02 })
  const padMat = new THREE.MeshStandardMaterial({ color: 0xcdd4d6, roughness: 0.9, metalness: 0.02 })
  for (const s of shapes) {
    const isPad = s.kind === 'pad'
    const [wx, wz] = toWorld(s.cx, s.cy)
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(s.len, isPad ? 0.06 : 0.05, s.wid), isPad ? padMat : roadMat)
    mesh.position.set(wx, isPad ? 0.03 : 0.025, wz)
    mesh.rotation.y = s.rot
    scene.add(mesh)
  }

  // 25m × 25m 场地框 + 0.5m 虚线网格（可切换）
  gridOverlay = buildGridOverlay(THREE)
  gridOverlay.visible = showGrid.value
  scene.add(gridOverlay)

  // 白色尖桩围栏 + 大门
  buildPicketFence(THREE, scene)

  // 设备
  const list = FULL.map((e) => {
    const slot = layout.find((s) => s.id === e.id)!
    return { ...e, pos: toWorld(slot.x, slot.y), label: slot.label, customHeight: (slot as any).height }
  })

  for (const e of list) {
    const [wx, wz] = e.pos
    const grp = new THREE.Group()
    grp.position.set(wx, 0, wz)
    grp.userData = e

    const useModel = !!MODEL_FACTORY[e.type]

    // 设备底座圆盘（程序化模型自带底座，不再额外叠加）
    if (!useModel) {
      const base = new THREE.Mesh(
        new THREE.CylinderGeometry(0.55, 0.65, 0.22, 20),
        new THREE.MeshStandardMaterial({ color: 0xb9c2c6, metalness: 0.15, roughness: 0.7 })
      )
      base.position.y = 0.11
      grp.add(base)
    }

    // 选中高亮环（贴地）
    const halo = new THREE.Mesh(
      new THREE.RingGeometry(0.62, 0.78, 32),
      new THREE.MeshBasicMaterial({ color: e.color, transparent: true, opacity: 0.45, side: THREE.DoubleSide })
    )
    halo.rotation.x = -Math.PI / 2
    halo.position.y = 0.07
    grp.add(halo)

    // 设备本体：全部使用 img2threejs 管线重建的程序化模型（自带底座与真实尺度）
    const head = makeHead(e.type, THREE, e.color)
    const headY = useModel ? 0 : 0.4
    head.position.y = headY
    grp.add(head)
    grp.userData.head = head
    grp.userData.headBaseY = headY
    grp.userData.baseEmissive = 0.35
    // 声明了 labelHeight 的模型为真实尺度模型：标注挂到模型顶部，且不参与整体上下浮动
    // （贴地的地温/草温/积冰架等若跟着浮动会明显离地）
    const modelLabelH = head.userData?.labelHeight as number | undefined
    grp.userData.noFloat = !!modelLabelH

    const div = document.createElement('div')
    div.className = 'sci-label'
    div.style.pointerEvents = 'none' // 默认隐藏，不拦截点击，点击设备后再显示
    div.style.opacity = '0'
    div.style.transform = 'scale(0.6)'
    div.style.transition = 'opacity 0.2s, transform 0.2s'
    div.innerHTML = `<span class="dot"></span>${e.name}`
    div.onclick = () => selectGroup(grp)
    const label = new CSS2DObject(div)
    label.position.set(0, modelLabelH ?? 1.5, 0)
    grp.add(label)
    grp.userData.labelEl = div

    scene.add(grp)
    groups.push(grp)
  }

  raycaster = new THREE.Raycaster()
  pointer = new THREE.Vector2()

  renderer.domElement.addEventListener('pointermove', onMove)
  renderer.domElement.addEventListener('click', onClick)
  window.addEventListener('resize', onResize)

  clock = new THREE.Clock()
  loading.value = false
  animate()
}

function onResize() {
  if (!container.value) return
  const w = container.value.clientWidth, h = container.value.clientHeight
  camera.aspect = w / h; camera.updateProjectionMatrix()
  renderer.setSize(w, h); labelRenderer.setSize(w, h)
}

function onMove(ev: PointerEvent) {
  if (dragging) return
  const rect = renderer.domElement.getBoundingClientRect()
  pointer.x = ((ev.clientX - rect.left) / rect.width) * 2 - 1
  pointer.y = -((ev.clientY - rect.top) / rect.height) * 2 + 1
  raycaster.setFromCamera(pointer, camera)
  const hit = raycaster.intersectObjects(groups, true)[0]
  const grp = hit ? findGroup(hit.object) : null
  if (grp !== hovered) {
    if (hovered) {
      hovered.userData.head.scale.setScalar(1)
    }
    hovered = grp
    if (hovered) {
      hovered.userData.head.scale.setScalar(1.25)
    }
    renderer.domElement.style.cursor = hovered ? 'pointer' : 'grab'
  }
}

function onClick() { if (hovered && !dragging) selectGroup(hovered) }

function findGroup(obj: any): any {
  let o = obj
  while (o && !o.userData?.id) o = o.parent
  return o
}

function setLabelVisible(grp: any, visible: boolean) {
  const el = grp?.userData?.labelEl
  if (!el) return
  el.style.opacity = visible ? '1' : '0'
  el.style.transform = visible ? 'scale(1)' : 'scale(0.6)'
  el.style.pointerEvents = visible ? 'auto' : 'none'
}

function selectGroup(grp: any) {
  // 先还原上一个选中设备的标签与高亮
  if (selected.value) {
    const prev = groups.find((g) => g.userData.id === selected.value.id)
    if (prev) {
      prev.userData.head.scale.setScalar(1)
      prev.userData.head.children.forEach((c: any) => { if (c.material) c.material.emissiveIntensity = prev.userData.baseEmissive })
      setLabelVisible(prev, false)
    }
  }
  selected.value = { ...grp.userData }
  controls.autoRotate = false
  grp.userData.head.scale.setScalar(1.4)
  grp.userData.head.children.forEach((c: any) => { if (c.material) c.material.emissiveIntensity = 1.6 })
  setLabelVisible(grp, true)
  if (props.draggable) tcontrols.attach(grp)
}

function clearSelected() {
  if (selected.value) {
    const grp = groups.find((g) => g.userData.id === selected.value.id)
    if (grp) {
      grp.userData.head.scale.setScalar(1)
      grp.userData.head.children.forEach((c: any) => { if (c.material) c.material.emissiveIntensity = grp.userData.baseEmissive })
      setLabelVisible(grp, false)
    }
  }
  selected.value = null
  if (props.draggable) tcontrols.detach()
  controls.autoRotate = true
}

// 世界坐标 → 场地坐标（X 东不变，北向 -Z 还原为 Y）
const toField = (wx: number, wz: number): [number, number] => [wx, FIELD_SIZE / 2 - wz]

// 导出当前设备布局为 devices.json（可放入 public/ 后由页面自动加载）
function exportLayout() {
  const out = FULL.map((e: any) => {
    const grp = groups.find((g: any) => g.userData.id === e.id)
    const slot = placeMap.find((s: any) => s.id === e.id)
    const [wx, wz] = grp ? [grp.position.x, grp.position.z] : [0, 0]
    const [x, y] = toField(wx, wz)
    return {
      x: +x.toFixed(2),
      y: +y.toFixed(2),
      id: e.id,
      label: (grp?.userData.label as string) || slot?.label || e.name,
      ...(slot?.height ? { height: slot.height } : {}),
    }
  })
  const json = JSON.stringify(out, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'devices.json'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

function animate() {
  animId = requestAnimationFrame(animate)
  const t = clock.getElapsedTime()
  const delta = clock.getDelta()
  groups.forEach((g, i) => {
    // 真实尺度模型（noFloat）保持贴地不动；其余沿用轻微的上下浮动动效
    if (g.userData.head && !g.userData.noFloat) {
      g.userData.head.position.y = g.userData.headBaseY + Math.sin(t * 1.2 + i) * 0.1
    }
    // 调用设备自定义动画（如风塔风杯旋转、雷达扫描、指示灯呼吸）
    if (g.userData.head?.userData?.tick) g.userData.head.userData.tick(delta)
  })
  controls.update()
  renderer.render(scene, camera)
  labelRenderer.render(scene, camera)
}

onMounted(() => {
  document.addEventListener('click', onNavAnchorClick, true)
  init().catch((e) => {
    loading.value = false
    errorMsg.value = e?.message || '初始化失败'
  })
})

onBeforeUnmount(() => {
  document.removeEventListener('click', onNavAnchorClick, true)
  cancelAnimationFrame(animId)
  window.removeEventListener('resize', onResize)
  if (tcontrols) tcontrols.dispose?.()
  if (renderer) {
    renderer.domElement.removeEventListener('pointermove', onMove)
    renderer.domElement.removeEventListener('click', onClick)
    renderer.dispose()
    if (renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement)
    if (labelRenderer?.domElement.parentNode) labelRenderer.domElement.parentNode.removeChild(labelRenderer.domElement)
  }
})
</script>

<template>
  <div class="scene3d">
    <div ref="container" class="canvas-wrap"></div>

    <div class="top-bar">
      <span class="sci-kicker">地面气象观测场</span>
    </div>

    <div v-if="loading" class="status">正在加载三维场景…</div>
    <div v-if="errorMsg" class="status err">{{ errorMsg }}</div>

    <transition name="fade">
      <div v-if="selected" class="info-panel sci-card">
        <span class="corner tl" /><span class="corner tr" />
        <span class="corner bl" /><span class="corner br" />
        <button class="close" @click="clearSelected">×</button>
        <span class="sci-kicker">SELECTED</span>
        <h3>{{ selected.name }}</h3>
        <p>{{ selected.desc }}</p>
        <button class="sci-btn" @click="go(selected.link)">查看设备详情 →</button>
      </div>
    </transition>

  </div>
</template>

<style scoped>
.scene3d { position: relative; width: 100%; height: calc(100vh - 56px); height: calc(100dvh - 56px); min-height: 520px; }
.canvas-wrap { position: absolute; inset: 0; }
.canvas-wrap :deep(canvas) { display: block; touch-action: none; }

.top-bar { position: absolute; top: 16px; left: 0; right: 0; text-align: center; z-index: 5; pointer-events: none; padding: 0 12px; }
.top-bar h1 { font-size: 24px; margin: 6px 0 4px; }
.top-bar p { color: var(--vp-c-text-2); font-size: 13px; margin: 0; }
.grid-toggle { display: flex; justify-content: center; margin-top: 8px; }
.grid-toggle button { pointer-events: auto; padding: 4px 14px; font-size: 12px; }

.status { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 7; color: var(--vp-c-text-2); font-size: 14px; }
.status.err { color: #f87171; }

.info-panel { position: absolute; right: 14px; bottom: 52px; z-index: 6; width: 300px; max-width: calc(100% - 28px); padding: 18px; }
.info-panel h3 { margin: 6px 0 8px; font-size: 18px; }
.info-panel p { color: var(--vp-c-text-2); font-size: 13.5px; line-height: 1.7; margin: 0 0 14px; }
.close { position: absolute; top: 8px; right: 10px; background: none; border: 0; color: var(--vp-c-text-2); font-size: 22px; cursor: pointer; line-height: 1; }
.close:hover { color: var(--sci-cyan); }

.hint { position: absolute; bottom: 12px; left: 0; right: 0; text-align: center; color: var(--vp-c-text-3); font-size: 11px; z-index: 4; pointer-events: none; }

.fade-enter-active, .fade-leave-active { transition: opacity 0.3s, transform 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; transform: translateY(10px); }
</style>

<style>
.sci-label {
  display: inline-flex; align-items: center; gap: 6px;
  background: rgba(255,255,255,0.85); border: 1px solid rgba(80,130,160,0.35);
  color: #1f3a4d; font-size: 11px; padding: 3px 9px; border-radius: 999px;
  white-space: nowrap; cursor: pointer; backdrop-filter: blur(6px);
  box-shadow: 0 1px 6px rgba(20,60,90,0.18); user-select: none;
  transition: transform 0.2s, border-color 0.2s;
}
.sci-label:hover { transform: scale(1.06); border-color: #22d3ee; }
.sci-label .dot { width: 7px; height: 7px; border-radius: 50%; background: #22d3ee; box-shadow: 0 0 6px rgba(34,211,238,0.8); }
</style>
