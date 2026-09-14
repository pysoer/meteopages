<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue'
import { useRouter, withBase } from 'vitepress'

const router = useRouter()
const container = ref<HTMLDivElement | null>(null)
const selected = ref<any>(null)
const loading = ref(true)
const errorMsg = ref('')
const showGrid = ref(true) // 0.5m 虚线网格 + 场地框

const toggleGrid = () => {
  showGrid.value = !showGrid.value
  if (gridOverlay) gridOverlay.visible = showGrid.value
}

const FIELD_SIZE = 25 // 观测场边长（米）：25m × 25m 正方形，原点(0,0)在西南角，X 东、Y 北
const PATH_W = 0.6   // 步道宽度（米），规范小路
const PAD = 1.4      // 设备便道平台边长（米）
const NORTH_EXT = 7  // 北门外引路在场外延伸的长度（米）

// 全部设备（与 equipment/*.md 一一对应）
const FULL: any[] = [
  { id: 'th', name: '百叶箱（温湿度）', type: 'th', color: 0x22d3ee, desc: '白色玻璃钢百叶箱，安装温、湿度传感器，防止辐射并保证通风。' },
  { id: 'wind', name: '风塔', type: 'wind', color: 0x3b82f6, desc: '10–12m 高风塔，安装风向标与风杯，测风向与风速。' },
  { id: 'rainfall', name: '翻斗式雨量传感器', type: 'rain', color: 0x38bdf8, desc: '翻斗计数 / 称重计量降水量，反演降水强度。' },
  { id: 'visibility', name: '能见度传感器', type: 'visibility', color: 0x34d399, desc: '散射法测量气象光学视程（MOR）。' },
  { id: 'precip', name: '降水现象仪', type: 'precip', color: 0x2dd4bf, desc: '激光检测粒子图谱，识别雨、雪、冰雹等降水现象。' },
  { id: 'phenom', name: '天气现象视频观测仪', type: 'phenom', color: 0xa855f7, desc: '计算机视觉 + 深度学习，识别云、霜、积雪等。' },
  { id: 'ground', name: '地温场', type: 'ground', color: 0xf59e0b, desc: '测地面温度及 5/10/15/20cm 浅层地温。' },
  { id: 'sunshine', name: '日照传感器', type: 'sunshine', color: 0xfacc15, desc: '记录太阳实际照射时数。' },
  { id: 'grass', name: '草面温度传感器', type: 'grass', color: 0x84cc16, desc: '距地 6cm 测草面温度，用于霜冻预警。' },
  { id: 'deep', name: '深层地温传感器', type: 'deep', color: 0xfb923c, desc: '测 40/80/160/320cm 深层地温，反映土壤热状况。' },
  { id: 'evap', name: '蒸发观测设备', type: 'evap', color: 0x8b5cf6, desc: 'E-601 蒸发皿，观测水面蒸发量。' },
  { id: 'pressure', name: '气压传感器', type: 'pressure', color: 0xf472b6, desc: '测量本站气压，用于天气形势分析。' },
  { id: 'cloudradar', name: '毫米波测云仪', type: 'cloudradar', color: 0x60a5fa, desc: '毫米波散射探测云的垂直结构（回波顶/底高、粒子尺度）。' },
  { id: 'radiometer', name: '微波辐射计', type: 'radiometer', color: 0xfbbf24, desc: '被动微波遥感，连续获取温湿廓线与云水含量。' },
  { id: 'aerosollidar', name: '气溶胶激光雷达', type: 'aerosollidar', color: 0xf87171, desc: '激光遥感气溶胶浓度与垂直分布、混合层高度。' },
  { id: 'windprofiler', name: '风廓线雷达', type: 'windprofiler', color: 0x818cf8, desc: '湍流散射连续获取水平/垂直风场廓线。' },
  { id: 'gnssmet', name: 'GNSS/MET 水汽探测仪', type: 'gnssmet', color: 0x34d399, desc: '导航卫星信号反演大气可降水量等参数。' },
  { id: 'lidarwind', name: '3D 激光测风雷达', type: 'lidarwind', color: 0x2dd4bf, desc: '多普勒激光获取三维风矢量与风廓线。' },
  { id: 'weathermod', name: '人工影响天气装备', type: 'weathermod', color: 0xf43f5e, desc: '火箭/高炮/烟炉/飞机向云中播撒催化剂，增雨防雹消雾。' }
]

// 设备布局（gx 东向、gy 北向，原点西南角，25m×35m 场地）
// 北部（y>10）为图册第6页标准布局的设备及其标注坐标；图册中没有的设备统一先放南部，待后续手动调整
const placeMap: any[] = [
  // —— 图册布局设备（北部） ——
  { x: 3, y: 19.5, id: 'windprofiler', label: '电线积冰架' },
  { x: 3.2, y: 18.2, id: 'phenom', label: '天气现象仪' },
  { x: 5.5, y: 19, id: 'visibility', label: '能见度仪' },
  { x: 19, y: 19.5, id: 'wind', label: '风塔', height: 10 },
  { x: 6.5, y: 13.5, id: 'precip', label: '人工观测雨量筒' },
  { x: 11.5, y: 13.5, id: 'cloudradar', label: '云观测设备' },
  { x: 16.5, y: 13.8, id: 'th', label: '百叶箱' },
  { x: 16.5, y: 10.5, id: 'rainfall', label: '雨量传感器' },
  { x: 6.5, y: 6, id: 'evap', label: '大型蒸发皿' },
  { x: 8.5, y: 5, id: 'grass', label: '草温' },
  { x: 4, y: 8, id: 'ground', label: '地面浅层地温' },
  { x: 8, y: 8, id: 'deep', label: '深层地温' },
  { x: 17.5, y: 8, id: 'sunshine', label: '日照计' },
  { x: 12.5, y: 10.5, id: 'gnssmet', label: 'GNSS/MET' },
  // —— 图册中没有的设备（暂放南部，可拖动调整） ——
  { x: 4, y: 4, id: 'radiometer', label: '微波辐射计' },
  { x: 8, y: 4, id: 'aerosollidar', label: '气溶胶激光雷达' },
  { x: 12, y: 4, id: 'lidarwind', label: '3D激光测风雷达' },
  { x: 16, y: 4, id: 'pressure', label: '气压传感器' },
  { x: 20, y: 4, id: 'weathermod', label: '人工影响天气装备' }
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

const go = (link: string) => router.go(link)

function makeHead(type: string, THREE: any, color: number) {
  const g = new THREE.Group()
  const mat = new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.35, metalness: 0.3, roughness: 0.45 })
  if (type === 'th') {
    g.add(new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.4, 1.4), mat))
  } else if (type === 'wind') {
    g.add(new THREE.Mesh(new THREE.SphereGeometry(0.3, 16, 16), mat))
    for (let i = 0; i < 3; i++) {
      const arm = new THREE.Group(); arm.rotation.y = (i * Math.PI * 2) / 3
      const s = new THREE.Mesh(new THREE.SphereGeometry(0.28, 12, 12), mat); s.position.set(1.1, 0, 0)
      arm.add(s); g.add(arm)
    }
  } else if (type === 'rain') {
    g.add(new THREE.Mesh(new THREE.ConeGeometry(0.9, 1.2, 20, 1, true), mat))
  } else if (type === 'evap') {
    g.add(new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.5, 0.4, 28), mat))
  } else if (type === 'pressure') {
    g.add(new THREE.Mesh(new THREE.TorusGeometry(0.6, 0.16, 12, 28), mat))
  } else if (type === 'visibility') {
    const a = new THREE.Mesh(new THREE.BoxGeometry(0.4, 1, 0.4), mat); a.position.x = -0.6
    const b = new THREE.Mesh(new THREE.BoxGeometry(0.4, 1, 0.4), mat); b.position.x = 0.6
    g.add(a, b)
  } else if (type === 'precip') {
    const a = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.9, 0.35), mat); a.position.x = -0.6
    const b = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.9, 0.35), mat); b.position.x = 0.6
    g.add(a, b)
  } else if (type === 'phenom') {
    g.add(new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.7, 0.7), mat))
    const lens = new THREE.Mesh(new THREE.SphereGeometry(0.25, 12, 12), mat); lens.position.set(0.6, 0, 0); g.add(lens)
  } else if (type === 'ground') {
    for (let i = -1; i <= 1; i++) { const p = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.2, 0.12), mat); p.position.set(i * 0.5, -0.4, 0); g.add(p) }
  } else if (type === 'sunshine') {
    g.add(new THREE.Mesh(new THREE.SphereGeometry(0.6, 20, 20), mat))
  } else if (type === 'grass') {
    for (let i = -1; i <= 1; i++) { const b = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.0, 0.1), mat); b.position.set(i * 0.4, 0, 0); g.add(b) }
  } else if (type === 'deep') {
    g.add(new THREE.Mesh(new THREE.BoxGeometry(0.5, 1.6, 0.5), mat))
  } else if (type === 'cloudradar') {
    g.add(new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.7, 0.7), mat))
    const dish = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.12, 10, 24), mat); dish.position.y = 0.6; g.add(dish)
  } else if (type === 'radiometer') {
    const dish = new THREE.Mesh(new THREE.ConeGeometry(0.8, 0.6, 22, 1, true), mat); dish.rotation.x = Math.PI; dish.position.y = 0.3; g.add(dish)
  } else if (type === 'aerosollidar') {
    g.add(new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 1.1, 16), mat))
    const beam = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.9, 14), mat); beam.position.y = 1.0; g.add(beam)
  } else if (type === 'windprofiler') {
    for (let i = -1; i <= 1; i++) { const a = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.2, 0.12), mat); a.position.set(i * 0.55, 0.1, 0); g.add(a) }
  } else if (type === 'gnssmet') {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.6, 0.1, 10, 24), mat); ring.rotation.x = Math.PI / 2.4; g.add(ring)
  } else if (type === 'lidarwind') {
    g.add(new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.7, 0.9), mat))
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.22, 14, 14), mat); eye.position.y = 0.5; g.add(eye)
  } else if (type === 'weathermod') {
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 1.0, 14), mat); body.position.y = 0.2; g.add(body)
    const nose = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.4, 14), mat); nose.position.y = 0.9; g.add(nose)
    const fin = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.18, 0.04), mat); fin.position.y = -0.2; g.add(fin)
  } else {
    g.add(new THREE.Mesh(new THREE.SphereGeometry(0.4, 16, 16), mat))
  }
  return g
}

function makeGroundTexture(THREE: any, shapes: Shape[]) {
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

  // 设备点位标记（柔和圆点 + 简称）
  c.textAlign = 'center'; c.textBaseline = 'middle'
  c.font = 'bold 11px sans-serif'
  for (const p of placeMap) {
    const meta = FULL.find((e) => e.id === p.id)!
    const color = '#' + meta.color.toString(16).padStart(6, '0')
    c.fillStyle = color
    c.beginPath(); c.arc(cx(p.x), cy(p.y) + 0.55 * m, 0.28 * m, 0, Math.PI * 2); c.fill()
    c.fillStyle = 'rgba(255,255,255,0.92)'
    c.fillText(p.label, cx(p.x), cy(p.y) + 1.15 * m)
  }

  // 场地中心标志（25m × 25m 的几何中心 12.5m, 12.5m）
  c.strokeStyle = '#f59e0b'; c.lineWidth = 3
  c.beginPath(); c.arc(cx(12.5), cy(12.5), 0.3 * m, 0, Math.PI * 2); c.stroke()
  c.fillStyle = '#f59e0b'; c.font = 'bold 13px sans-serif'
  c.fillText('中心标志', cx(12.5), cy(12.5) - 0.5 * m)

  // 场地边框
  c.strokeStyle = '#7d8b7a'; c.lineWidth = 4
  c.strokeRect(0, NORTH_EXT * m, FIELD_SIZE * m, FIELD_SIZE * m)

  // 方位标识（北在上，画在北门外引路区域内）
  c.fillStyle = 'rgba(255,255,255,0.9)'; c.font = 'bold 26px sans-serif'
  c.fillText('N', W / 2, 18)

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

  // 观测场草地（含南门外引路的贴地纹理）
  const groundTex = makeGroundTexture(THREE, shapes)
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
    const slot = placeMap.find((s) => s.id === e.id)
    return slot ? { ...e, pos: toWorld(slot.x, slot.y), label: slot.label, customHeight: slot.height } : { ...e, pos: [0, 0] }
  })

  for (const e of list) {
    const [wx, wz] = e.pos
    const grp = new THREE.Group()
    grp.position.set(wx, 0, wz)
    grp.userData = e

    let poleH = e.type === 'deep' ? 1.4 : e.type === 'evap' ? 1.2 : 5
    if (e.customHeight) poleH = e.customHeight
    const pole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.1, 0.13, poleH, 12),
      new THREE.MeshStandardMaterial({ color: 0xe8ecee, metalness: 0.25, roughness: 0.5 })
    )
    pole.position.y = poleH / 2
    grp.add(pole)

    const base = new THREE.Mesh(
      new THREE.CylinderGeometry(0.55, 0.65, 0.22, 20),
      new THREE.MeshStandardMaterial({ color: 0xb9c2c6, metalness: 0.15, roughness: 0.7 })
    )
    base.position.y = 0.11
    grp.add(base)

    const halo = new THREE.Mesh(
      new THREE.RingGeometry(0.62, 0.78, 32),
      new THREE.MeshBasicMaterial({ color: e.color, transparent: true, opacity: 0.45, side: THREE.DoubleSide })
    )
    halo.rotation.x = -Math.PI / 2
    halo.position.y = 0.07
    grp.add(halo)

    const head = makeHead(e.type, THREE, e.color)
    head.position.y = poleH + (e.type === 'evap' ? 0.4 : 0.9)
    grp.add(head)
    grp.userData.head = head
    grp.userData.headBaseY = head.position.y
    grp.userData.baseEmissive = 0.35

    const div = document.createElement('div')
    div.className = 'sci-label'
    div.style.pointerEvents = 'auto'
    div.style.opacity = '0'
    div.style.transform = 'scale(0.9)'
    div.style.transition = 'opacity 0.2s, transform 0.2s'
    div.innerHTML = `<span class="dot"></span>${e.name}`
    div.onclick = () => selectGroup(grp)
    const label = new CSS2DObject(div)
    label.position.set(0, poleH + 2.2, 0)
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
      if (hovered.userData.labelEl && hovered.userData.id !== selected.value?.id) {
        hovered.userData.labelEl.style.opacity = '0'
        hovered.userData.labelEl.style.transform = 'scale(0.9)'
      }
    }
    hovered = grp
    if (hovered) {
      hovered.userData.head.scale.setScalar(1.25)
      if (hovered.userData.labelEl) {
        hovered.userData.labelEl.style.opacity = '1'
        hovered.userData.labelEl.style.transform = 'scale(1)'
      }
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

function selectGroup(grp: any) {
  selected.value = { ...grp.userData }
  controls.autoRotate = false
  grp.userData.head.scale.setScalar(1.4)
  grp.userData.head.children.forEach((c: any) => { if (c.material) c.material.emissiveIntensity = 1.6 })
  if (grp.userData.labelEl) {
    grp.userData.labelEl.style.opacity = '1'
    grp.userData.labelEl.style.transform = 'scale(1)'
  }
  tcontrols.attach(grp)
}

function clearSelected() {
  if (selected.value) {
    const grp = groups.find((g) => g.userData.id === selected.value.id)
    if (grp) {
      grp.userData.head.scale.setScalar(1)
      grp.userData.head.children.forEach((c: any) => { if (c.material) c.material.emissiveIntensity = grp.userData.baseEmissive })
      if (grp.userData.labelEl) {
        grp.userData.labelEl.style.opacity = '0'
        grp.userData.labelEl.style.transform = 'scale(0.9)'
      }
    }
  }
  selected.value = null
  tcontrols.detach()
  controls.autoRotate = true
}

function animate() {
  animId = requestAnimationFrame(animate)
  const t = clock.getElapsedTime()
  groups.forEach((g, i) => {
    if (g.userData.head) g.userData.head.position.y = g.userData.headBaseY + Math.sin(t * 1.2 + i) * 0.1
  })
  controls.update()
  renderer.render(scene, camera)
  labelRenderer.render(scene, camera)
}

onMounted(() => {
  init().catch((e) => {
    loading.value = false
    errorMsg.value = e?.message || '初始化失败'
  })
})

onBeforeUnmount(() => {
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
      <span class="sci-kicker">3D INTERACTIVE GUIDE</span>
      <h1>虚拟观测场导览</h1>
      <p>25m × 25m · 白色围栏 + 北门 · 0.5m 虚线网格 · 道路可由 /road-planner.html 导出</p>
      <div class="grid-toggle">
        <button class="sci-btn small" @click="toggleGrid">
          {{ showGrid ? '隐藏网格' : '显示网格' }}
        </button>
      </div>
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

    <div class="hint">提示：白色为尖桩围栏（北侧为大门），浅灰为步道与设备便道，虚线网格间距 0.5m；道路布局可用 public/roads.json 覆盖</div>
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
