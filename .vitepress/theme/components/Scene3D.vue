<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue'
import { useRouter } from 'vitepress'

const router = useRouter()
const container = ref<HTMLDivElement | null>(null)
const selected = ref<any>(null)
const loading = ref(true)
const errorMsg = ref('')

const BASE = import.meta.env.BASE_URL
const FIELD_SIZE = 25 // 观测场边长（米），原点(0,0)在西南角，X东、Y北

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

// 设备布局（gx 东向、gy 北向，原点西南角），按观测场布局图摆放
const placeMap: any[] = [
  { x: 4.5, y: 22.5, id: 'windprofiler', label: '人工观测风' },
  { x: 12.5, y: 22.5, id: 'phenom', label: '电线积冰架' },
  { x: 20.5, y: 22.5, id: 'wind', label: '风塔', height: 10 },
  { x: 4.5, y: 19.5, id: 'th', label: '备份百叶箱' },
  { x: 8.5, y: 19.5, id: 'radiometer', label: '温湿度自记' },
  { x: 16.5, y: 19.5, id: 'cloudradar', label: '温湿度表' },
  { x: 20.5, y: 19.5, id: 'visibility', label: '温湿传感器' },
  { x: 4.5, y: 16.5, id: 'precip', label: '人工雨量筒' },
  { x: 8.5, y: 16.5, id: 'rainfall', label: '雨量传感器' },
  { x: 16.5, y: 16.5, id: 'pressure', label: '翻斗雨量计' },
  { x: 20.5, y: 16.5, id: 'gnssmet', label: '闪电定位仪' },
  { x: 4.5, y: 13.5, id: 'evap', label: '大型蒸发' },
  { x: 8.5, y: 13.5, id: 'grass', label: '小型蒸发' },
  { x: 12.5, y: 13.5, id: 'aerosollidar', label: '蒸发专用雨量筒' },
  { x: 20.5, y: 13.5, id: 'weathermod', label: '酸雨采集桶' },
  { x: 4.5, y: 10.5, id: 'ground', label: '地温场' },
  { x: 8.5, y: 10.5, id: 'sunshine', label: '日照' },
  { x: 12.5, y: 10.5, id: 'deep', label: '深层地温' },
  { x: 16.5, y: 10.5, id: 'lidarwind', label: '自动观测' }
]

// 道路（gx 东向、gy 北向）
const ROADS: any[] = [
  { x1: 11, x2: 14, y1: 0, y2: 25, name: '纵向主路' },
  { x1: 2, x2: 23, y1: 20, y2: 23, name: '北部横向路' },
  { x1: 0, x2: 25, y1: 12, y2: 15, name: '中部横向路' },
  { x1: 3, x2: 22, y1: 4, y2: 7, name: '南部横向路' }
]

// 地面坐标 → 世界坐标（X 东不变，北向 Y 映射到 -Z）
const toWorld = (gx: number, gy: number): [number, number] => [gx, -(gy - FIELD_SIZE / 2)]

let renderer: any, scene: any, camera: any, controls: any, labelRenderer: any, tcontrols: any
let raycaster: any, pointer: any, clock: any, animId = 0
const groups: any[] = []
let hovered: any = null
let dragging = false

const go = (link: string) => router.go(link)

function makeHead(type: string, THREE: any, color: number) {
  const g = new THREE.Group()
  const mat = new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.9, metalness: 0.4, roughness: 0.3 })
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

function makeGroundTexture(THREE: any) {
  const size = 1024
  const canvas = document.createElement('canvas')
  canvas.width = size; canvas.height = size
  const m = (size - 64) / FIELD_SIZE
  const pad = 32
  // 地面坐标 (gx, gy) → canvas 像素
  const cx = (gx: number) => pad + gx * m
  const cy = (gy: number) => size - pad - gy * m

  const c = canvas.getContext('2d')!

  // 草地底色
  c.fillStyle = '#10b981'
  c.fillRect(0, 0, size, size)

  // 道路（水泥地砖色）
  for (const r of ROADS) {
    c.fillStyle = '#cbd5e1'
    c.fillRect(cx(r.x1), cy(r.y2), (r.x2 - r.x1) * m, (r.y2 - r.y1) * m)
    c.strokeStyle = '#94a3b8'
    c.lineWidth = 2
    c.strokeRect(cx(r.x1), cy(r.y2), (r.x2 - r.x1) * m, (r.y2 - r.y1) * m)
  }

  // 设备点位标记（彩色圆点 + 简称）
  c.textAlign = 'center'; c.textBaseline = 'middle'
  c.font = 'bold 12px sans-serif'
  for (const p of placeMap) {
    const meta = FULL.find((e) => e.id === p.id)!
    const color = '#' + meta.color.toString(16).padStart(6, '0')
    c.fillStyle = color
    c.beginPath(); c.arc(cx(p.x), cy(p.y), 0.45 * m, 0, Math.PI * 2); c.fill()
    c.strokeStyle = '#ffffff'; c.lineWidth = 2; c.stroke()
    c.fillStyle = '#1f2937'
    c.fillText(p.label, cx(p.x), cy(p.y) + 0.9 * m)
  }

  // 中心标志
  c.strokeStyle = '#f59e0b'; c.lineWidth = 4
  c.beginPath(); c.arc(cx(12.5), cy(16.5), 0.3 * m, 0, Math.PI * 2); c.stroke()
  c.fillStyle = '#f59e0b'; c.font = 'bold 14px sans-serif'
  c.fillText('中心标志', cx(12.5), cy(16.5))

  // 场地边框
  c.strokeStyle = '#475569'; c.lineWidth = 5
  c.strokeRect(pad, pad, size - 2 * pad, size - 2 * pad)

  // 方位标识（北在上）
  c.fillStyle = '#1f2937'; c.font = 'bold 28px sans-serif'
  c.fillText('N', size / 2, pad + 22)
  c.fillText('S', size / 2, size - pad - 22)
  c.fillText('W', pad + 22, size / 2)
  c.fillText('E', size - pad - 22, size / 2)

  // 比例尺
  c.fillStyle = '#1f2937'; c.font = 'bold 18px sans-serif'; c.textAlign = 'left'
  c.fillText('0', pad + 6, size - pad - 12)
  c.fillText('25m', pad + m * 25 - 56, size - pad - 12)
  c.strokeStyle = '#1f2937'; c.lineWidth = 3
  c.beginPath()
  c.moveTo(pad + 6, size - pad - 28)
  c.lineTo(pad + m * 25 - 6, size - pad - 28)
  c.stroke()

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
  scene.fog = new THREE.FogExp2(0xbfdaf2, 0.004)

  camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 400)
  camera.position.set(12.5, 34, 26)

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
  controls.minDistance = 12
  controls.maxDistance = 140
  controls.maxPolarAngle = Math.PI / 2.05
  controls.target.set(12.5, 1, -8)
  controls.autoRotate = true
  controls.autoRotateSpeed = 0.3

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

  // 光照
  scene.add(new THREE.AmbientLight(0xffffff, 0.65))
  scene.add(new THREE.HemisphereLight(0x87ceeb, 0x10b981, 0.45))
  const dir = new THREE.DirectionalLight(0xffffff, 1.2)
  dir.position.set(20, 40, 10)
  scene.add(dir)

  scene.background = new THREE.Color(0xbfdaf2)

  // 地面（草地）
  const groundTex = makeGroundTexture(THREE)
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(FIELD_SIZE, FIELD_SIZE),
    new THREE.MeshStandardMaterial({ map: groundTex, roughness: 0.9, metalness: 0.05 })
  )
  ground.rotation.x = -Math.PI / 2
  scene.add(ground)

  // 道路实体（水泥）
  const roadMat = new THREE.MeshStandardMaterial({ color: 0xcbd5e1, roughness: 0.85, metalness: 0.05 })
  for (const r of ROADS) {
    const [wx, wz] = toWorld((r.x1 + r.x2) / 2, (r.y1 + r.y2) / 2)
    const road = new THREE.Mesh(
      new THREE.BoxGeometry(r.x2 - r.x1, 0.04, r.y2 - r.y1),
      roadMat
    )
    road.position.set(wx, 0.02, wz)
    scene.add(road)
  }

  // 围栏（深灰色），原点西南角，边界 X∈[0,25] Y∈[0,25]
  const fenceMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.35, roughness: 0.5 })
  const H = 1.2, T = 0.2, ext = 0.3
  const north = new THREE.Mesh(new THREE.BoxGeometry(FIELD_SIZE + ext, H, T), fenceMat)
  north.position.set(FIELD_SIZE / 2, H / 2, -FIELD_SIZE / 2); scene.add(north) // Y=25
  const south = new THREE.Mesh(new THREE.BoxGeometry(FIELD_SIZE + ext, H, T), fenceMat)
  south.position.set(FIELD_SIZE / 2, H / 2, FIELD_SIZE / 2); scene.add(south) // Y=0
  const west = new THREE.Mesh(new THREE.BoxGeometry(T, H, FIELD_SIZE + ext), fenceMat)
  west.position.set(0, H / 2, 0); scene.add(west) // X=0
  const east = new THREE.Mesh(new THREE.BoxGeometry(T, H, FIELD_SIZE + ext), fenceMat)
  east.position.set(FIELD_SIZE, H / 2, 0); scene.add(east) // X=25

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
      new THREE.CylinderGeometry(0.12, 0.16, poleH, 12),
      new THREE.MeshStandardMaterial({ color: 0x4a5a78, metalness: 0.6, roughness: 0.4 })
    )
    pole.position.y = poleH / 2
    grp.add(pole)

    const base = new THREE.Mesh(
      new THREE.CylinderGeometry(0.6, 0.7, 0.2, 20),
      new THREE.MeshStandardMaterial({ color: 0x223052, metalness: 0.5, roughness: 0.5 })
    )
    base.position.y = 0.1
    grp.add(base)

    const halo = new THREE.Mesh(
      new THREE.RingGeometry(0.7, 1.0, 32),
      new THREE.MeshBasicMaterial({ color: e.color, transparent: true, opacity: 0.6, side: THREE.DoubleSide })
    )
    halo.rotation.x = -Math.PI / 2
    halo.position.y = 0.03
    grp.add(halo)

    const head = makeHead(e.type, THREE, e.color)
    head.position.y = poleH + (e.type === 'evap' ? 0.4 : 0.9)
    grp.add(head)
    grp.userData.head = head
    grp.userData.headBaseY = head.position.y
    grp.userData.baseEmissive = 0.9

    const div = document.createElement('div')
    div.className = 'sci-label'
    div.style.pointerEvents = 'auto'
    div.innerHTML = `<span class="dot"></span>${e.name}`
    div.onclick = () => selectGroup(grp)
    const label = new CSS2DObject(div)
    label.position.set(0, poleH + 2.4, 0)
    grp.add(label)

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
    if (hovered) hovered.userData.head.scale.setScalar(1)
    hovered = grp
    if (hovered) hovered.userData.head.scale.setScalar(1.25)
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
  grp.userData.head.children.forEach((c: any) => { if (c.material) c.material.emissiveIntensity = 2.2 })
  tcontrols.attach(grp)
}

function clearSelected() {
  if (selected.value) {
    const grp = groups.find((g) => g.userData.id === selected.value.id)
    if (grp) {
      grp.userData.head.scale.setScalar(1)
      grp.userData.head.children.forEach((c: any) => { if (c.material) c.material.emissiveIntensity = grp.userData.baseEmissive })
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
    if (g.userData.head) g.userData.head.position.y = g.userData.headBaseY + Math.sin(t * 1.2 + i) * 0.12
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
      <p>25m × 25m · 原点西南角 · 草地 + 水泥道路 + 围栏 · 点击设备可拖动</p>
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

    <div class="hint">提示：灰色为水泥道路（纵向主路 / 北·中·南横向路），绿色为草坪，深色为围栏；设备可拖动</div>
  </div>
</template>

<style scoped>
.scene3d { position: relative; width: 100%; height: calc(100vh - 56px); height: calc(100dvh - 56px); min-height: 520px; }
.canvas-wrap { position: absolute; inset: 0; }
.canvas-wrap :deep(canvas) { display: block; touch-action: none; }

.top-bar { position: absolute; top: 16px; left: 0; right: 0; text-align: center; z-index: 5; pointer-events: none; padding: 0 12px; }
.top-bar h1 { font-size: 24px; margin: 6px 0 4px; }
.top-bar p { color: var(--vp-c-text-2); font-size: 13px; margin: 0; }

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
  background: rgba(8,14,28,0.82); border: 1px solid rgba(34,211,238,0.5);
  color: #d8f4ff; font-size: 11px; padding: 3px 9px; border-radius: 999px;
  white-space: nowrap; cursor: pointer; backdrop-filter: blur(6px);
  box-shadow: 0 0 14px rgba(34,211,238,0.25); user-select: none;
  transition: transform 0.2s, border-color 0.2s;
}
.sci-label:hover { transform: scale(1.06); border-color: #22d3ee; }
.sci-label .dot { width: 7px; height: 7px; border-radius: 50%; background: #22d3ee; box-shadow: 0 0 8px #22d3ee; }
</style>
