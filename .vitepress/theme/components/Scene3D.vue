<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue'
import { useRouter } from 'vitepress'

const router = useRouter()
const container = ref<HTMLDivElement | null>(null)
const selected = ref<any>(null)

// 观测场设备布置（x, z 平面坐标；y 为离地高度），18 类仪器按 6×3 网格排布
const EQUIPMENTS = [
  { id: 'th', name: '百叶箱（温湿度）', type: 'th', color: 0x22d3ee, pos: [-12.5, -8], desc: '白色玻璃钢百叶箱，安装温、湿度传感器，防止辐射并保证通风。' },
  { id: 'wind', name: '风塔', type: 'wind', color: 0x3b82f6, pos: [-7.5, -8], desc: '10–12m 高风塔，安装风向标与风杯，测风向与风速。' },
  { id: 'rainfall', name: '翻斗式雨量传感器', type: 'rain', color: 0x38bdf8, pos: [-2.5, -8], desc: '翻斗计数，计量降水量，反演降雨强度。' },
  { id: 'visibility', name: '能见度传感器', type: 'visibility', color: 0x34d399, pos: [2.5, -8], desc: '散射法测量气象光学视程（MOR）。' },
  { id: 'precip', name: '降水现象仪', type: 'precip', color: 0x2dd4bf, pos: [7.5, -8], desc: '激光检测粒子图谱，识别雨、雪、冰雹等降水现象。' },
  { id: 'phenom', name: '天气现象视频观测仪', type: 'phenom', color: 0xa855f7, pos: [12.5, -8], desc: '计算机视觉 + 深度学习，识别云、霜、积雪等。' },
  { id: 'ground', name: '地温场', type: 'ground', color: 0xf59e0b, pos: [-12.5, 0], desc: '测地面温度及 5/10/15/20cm 浅层地温。' },
  { id: 'sunshine', name: '日照传感器', type: 'sunshine', color: 0xfacc15, pos: [-7.5, 0], desc: '记录太阳实际照射时数。' },
  { id: 'grass', name: '草面温度传感器', type: 'grass', color: 0x84cc16, pos: [-2.5, 0], desc: '距地 6cm 测草面温度，用于霜冻预警。' },
  { id: 'deep', name: '深层地温传感器', type: 'deep', color: 0xfb923c, pos: [2.5, 0], desc: '测 40/80/160/320cm 深层地温。' },
  { id: 'evap', name: '蒸发观测设备', type: 'evap', color: 0x8b5cf6, pos: [7.5, 0], desc: 'E-601 蒸发皿，观测水面蒸发量。' },
  { id: 'pressure', name: '气压传感器', type: 'pressure', color: 0xf472b6, pos: [12.5, 0], desc: '测量本站气压，用于天气形势分析。' },
  { id: 'cloudradar', name: '毫米波测云仪', type: 'cloudradar', color: 0x60a5fa, pos: [-12.5, 8], desc: '毫米波散射探测云的垂直结构（回波顶/底高、粒子尺度）。' },
  { id: 'radiometer', name: '微波辐射计', type: 'radiometer', color: 0xfbbf24, pos: [-7.5, 8], desc: '被动微波遥感，连续获取温湿廓线与云水含量。' },
  { id: 'aerosollidar', name: '气溶胶激光雷达', type: 'aerosollidar', color: 0xf87171, pos: [-2.5, 8], desc: '激光遥感气溶胶浓度与垂直分布、混合层高度。' },
  { id: 'windprofiler', name: '风廓线雷达', type: 'windprofiler', color: 0x818cf8, pos: [2.5, 8], desc: '湍流散射连续获取水平/垂直风场廓线。' },
  { id: 'gnssmet', name: 'GNSS/MET 水汽探测仪', type: 'gnssmet', color: 0x34d399, pos: [7.5, 8], desc: '导航卫星信号反演大气可降水量等参数。' },
  { id: 'lidarwind', name: '3D 激光测风雷达', type: 'lidarwind', color: 0x2dd4bf, pos: [12.5, 8], desc: '多普勒激光获取三维风矢量与风廓线。' },
  { id: 'weathermod', name: '人工影响天气装备', type: 'weathermod', color: 0xf43f5e, pos: [0, 16], desc: '火箭/高炮/烟炉/飞机向云中播撒催化剂，增雨防雹消雾。' }
]

let renderer: any, scene: any, camera: any, controls: any, labelRenderer: any
let raycaster: any, pointer: any, clock: any, animId = 0
const groups: any[] = []
let hovered: any = null

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

async function init() {
  const THREE = await import('three')
  const { OrbitControls } = await import('three/examples/jsm/controls/OrbitControls.js')
  const { CSS2DRenderer, CSS2DObject } = await import('three/examples/jsm/renderers/CSS2DRenderer.js')

  const el = container.value!
  const w = el.clientWidth, h = el.clientHeight

  scene = new THREE.Scene()
  scene.fog = new THREE.FogExp2(0x05070f, 0.02)

  camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 200)
  camera.position.set(0, 16, 26)

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
  controls.maxDistance = 55
  controls.maxPolarAngle = Math.PI / 2.15
  controls.target.set(0, 2, 0)
  controls.autoRotate = true
  controls.autoRotateSpeed = 0.5

  scene.add(new THREE.AmbientLight(0x88aaff, 0.5))
  const p1 = new THREE.PointLight(0x22d3ee, 80, 80); p1.position.set(12, 16, 12); scene.add(p1)
  const p2 = new THREE.PointLight(0xa855f7, 70, 80); p2.position.set(-14, 12, -10); scene.add(p2)

  const ground = new THREE.Mesh(
    new THREE.CircleGeometry(24, 64),
    new THREE.MeshStandardMaterial({ color: 0x0a1326, metalness: 0.2, roughness: 0.9 })
  )
  ground.rotation.x = -Math.PI / 2
  scene.add(ground)

  const grid = new THREE.GridHelper(48, 48, 0x22d3ee, 0x16324a)
  ;(grid.material as any).opacity = 0.3
  ;(grid.material as any).transparent = true
  scene.add(grid)

  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(22, 0.08, 12, 100),
    new THREE.MeshBasicMaterial({ color: 0x22d3ee })
  )
  ring.rotation.x = -Math.PI / 2
  scene.add(ring)

  const starGeo = new THREE.BufferGeometry()
  const starN = 600
  const arr = new Float32Array(starN * 3)
  for (let i = 0; i < starN; i++) {
    arr[i * 3] = (Math.random() - 0.5) * 120
    arr[i * 3 + 1] = Math.random() * 50 + 5
    arr[i * 3 + 2] = (Math.random() - 0.5) * 120
  }
  starGeo.setAttribute('position', new THREE.BufferAttribute(arr, 3))
  scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0x88ccff, size: 0.18, transparent: true, opacity: 0.8 })))

  for (const e of EQUIPMENTS) {
    const grp = new THREE.Group()
    grp.position.set(e.pos[0], 0, e.pos[1])
    grp.userData = e

    const poleH = e.type === 'evap' ? 1.2 : 5
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

    const head = makeHead(e.type, THREE, e.color)
    head.position.y = poleH + (e.type === 'evap' ? 0.4 : 0.9)
    grp.add(head)
    grp.userData.head = head
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
  animate()
}

function onResize() {
  if (!container.value) return
  const w = container.value.clientWidth, h = container.value.clientHeight
  camera.aspect = w / h; camera.updateProjectionMatrix()
  renderer.setSize(w, h); labelRenderer.setSize(w, h)
}

function onMove(ev: PointerEvent) {
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

function onClick() { if (hovered) selectGroup(hovered) }

function findGroup(obj: any): any {
  let o = obj
  while (o && !o.userData?.id) o = o.parent
  return o
}

function selectGroup(grp: any) {
  selected.value = { ...grp.userData, link: `/equipment/${grp.userData.id}` }
  controls.autoRotate = false
  grp.userData.head.scale.setScalar(1.4)
  grp.userData.head.children.forEach((c: any) => { if (c.material) c.material.emissiveIntensity = 2.2 })
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
  controls.autoRotate = true
}

function animate() {
  animId = requestAnimationFrame(animate)
  const t = clock.getElapsedTime()
  groups.forEach((g, i) => {
    if (g.userData.head) g.userData.head.position.y = (g.userData.type === 'evap' ? 1.6 : 5.9) + Math.sin(t * 1.2 + i) * 0.12
  })
  controls.update()
  renderer.render(scene, camera)
  labelRenderer.render(scene, camera)
}

onMounted(init)
onBeforeUnmount(() => {
  cancelAnimationFrame(animId)
  window.removeEventListener('resize', onResize)
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
      <p>拖拽旋转 · 滚轮缩放 · 点击设备查看详情</p>
    </div>

    <div class="legend">
      <button v-for="e in EQUIPMENTS" :key="e.id" class="leg-item" @click="go('/equipment/' + e.id)">
        <span class="sw" :style="{ background: '#' + e.color.toString(16).padStart(6, '0') }"></span>
        {{ e.name }}
      </button>
    </div>

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

    <div class="hint">提示：点击场景中的设备立柱或标签均可弹出信息</div>
  </div>
</template>

<style scoped>
.scene3d { position: relative; width: 100%; height: calc(100vh - 56px); height: calc(100dvh - 56px); min-height: 520px; }
.canvas-wrap { position: absolute; inset: 0; }
.canvas-wrap :deep(canvas) { display: block; touch-action: none; }

.top-bar { position: absolute; top: 16px; left: 0; right: 0; text-align: center; z-index: 5; pointer-events: none; padding: 0 12px; }
.top-bar h1 { font-size: 24px; margin: 6px 0 4px; }
.top-bar p { color: var(--vp-c-text-2); font-size: 13px; margin: 0; }

.legend { position: absolute; left: 12px; top: 104px; z-index: 5; display: flex; flex-direction: column; gap: 6px; max-height: 60%; overflow: auto; }
.leg-item {
  display: flex; align-items: center; gap: 7px;
  background: rgba(10,16,32,0.7); border: 1px solid var(--vp-c-divider);
  color: var(--vp-c-text-1); border-radius: 999px; padding: 5px 11px;
  font-size: 12px; cursor: pointer; backdrop-filter: blur(8px);
  transition: border-color 0.2s, transform 0.2s;
}
.leg-item:hover { border-color: var(--sci-cyan); transform: translateX(3px); }
.sw { width: 9px; height: 9px; border-radius: 50%; box-shadow: 0 0 8px currentColor; }

.info-panel { position: absolute; right: 14px; bottom: 52px; z-index: 6; width: 300px; max-width: calc(100% - 28px); padding: 18px; }
.info-panel h3 { margin: 6px 0 8px; font-size: 18px; }
.info-panel p { color: var(--vp-c-text-2); font-size: 13.5px; line-height: 1.7; margin: 0 0 14px; }
.close { position: absolute; top: 8px; right: 10px; background: none; border: 0; color: var(--vp-c-text-2); font-size: 22px; cursor: pointer; line-height: 1; }
.close:hover { color: var(--sci-cyan); }

.hint { position: absolute; bottom: 12px; left: 0; right: 0; text-align: center; color: var(--vp-c-text-3); font-size: 11px; z-index: 4; pointer-events: none; }

.fade-enter-active, .fade-leave-active { transition: opacity 0.3s, transform 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; transform: translateY(10px); }

@media (max-width: 720px) {
  .legend { top: auto; bottom: 84px; left: 10px; flex-direction: row; flex-wrap: wrap; max-width: 70%; max-height: none; }
  .info-panel { right: 10px; left: 10px; width: auto; bottom: 44px; }
}
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
