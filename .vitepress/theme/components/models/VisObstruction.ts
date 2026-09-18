/**
 * 视程障碍现象仪（Visibility Obstruction Phenomenon Sensor，气溶胶激光散射）
 *
 * 参考特征（依据 equipment/visobs.md 描述）：
 *   - 落地机箱，内置激光测量腔、采样泵与除湿模块
 *   - 顶部直立采样管（带防雨帽的进样口）
 *   - 前面板显示/指示灯，侧面排气口
 *
 * 八阶段管线：Blockout → Structural → Form → Material → Surface → Lighting → Interaction → Optimization
 */
import * as THREE from 'three'

export function createVisObstruction(): THREE.Group {
  const root = new THREE.Group()
  root.name = 'VisObstruction'

  // ── 材质 ──
  const cabMat = new THREE.MeshStandardMaterial({ color: 0xe8edf0, roughness: 0.45, metalness: 0.25 })
  const metalMat = new THREE.MeshStandardMaterial({ color: 0xbfc7cc, roughness: 0.35, metalness: 0.6 })
  const darkMat = new THREE.MeshStandardMaterial({ color: 0x2b2f33, roughness: 0.55, metalness: 0.3 })

  // ── 1. Blockout：落地机箱 ──
  const cabW = 0.52, cabH = 0.9, cabD = 0.42
  const cabinet = new THREE.Mesh(new THREE.BoxGeometry(cabW, cabH, cabD), cabMat)
  cabinet.position.y = cabH / 2 + 0.07
  root.add(cabinet)
  const plinth = new THREE.Mesh(new THREE.BoxGeometry(cabW + 0.08, 0.07, cabD + 0.08), darkMat)
  plinth.position.y = 0.035
  root.add(plinth)

  // ── 2. Structural：顶部直立采样管 ──
  const tubeH = 0.75
  const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.05, tubeH, 18), metalMat)
  tube.position.set(0.12, cabH + 0.07 + tubeH / 2, 0)
  root.add(tube)
  // 采样管弯头（通向机箱）
  const elbow = new THREE.Mesh(new THREE.TorusGeometry(0.08, 0.045, 10, 16, Math.PI / 2), metalMat)
  elbow.rotation.z = Math.PI
  elbow.position.set(0.12, cabH + 0.07, 0.03)
  root.add(elbow)

  // 进样口防雨帽
  const hat = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.08, 18), metalMat)
  hat.position.set(0.12, cabH + 0.07 + tubeH + 0.06, 0)
  root.add(hat)
  // 帽下支撑
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2
    const s = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.08, 6), metalMat)
    s.position.set(0.12 + Math.cos(a) * 0.06, cabH + 0.07 + tubeH + 0.02, Math.sin(a) * 0.06)
    root.add(s)
  }

  // ── 3. Form：前面板（显示窗 + 指示灯） ──
  const screen = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.14, 0.01), darkMat)
  screen.position.set(-0.1, 0.72, cabD / 2 + 0.006)
  root.add(screen)
  const scrMat = new THREE.MeshStandardMaterial({ color: 0x1b3a4d, emissive: 0x22d3ee, emissiveIntensity: 0.5 })
  const scr = new THREE.Mesh(new THREE.PlaneGeometry(0.17, 0.11), scrMat)
  scr.position.set(-0.1, 0.72, cabD / 2 + 0.012)
  root.add(scr)

  const lampMat = new THREE.MeshStandardMaterial({ color: 0x34d399, emissive: 0x34d399, emissiveIntensity: 1.1 })
  for (let i = 0; i < 3; i++) {
    const l = new THREE.Mesh(new THREE.CircleGeometry(0.014, 10), lampMat)
    l.position.set(0.08 + i * 0.05, 0.72, cabD / 2 + 0.012)
    root.add(l)
  }

  // ── 4. Surface：侧面排气口 + 散热格栅 ──
  const exhaust = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.06, 16), metalMat)
  exhaust.rotation.z = Math.PI / 2
  exhaust.position.set(cabW / 2 + 0.02, 0.28, 0.05)
  root.add(exhaust)
  for (let i = 0; i < 5; i++) {
    const g = new THREE.Mesh(new THREE.BoxGeometry(cabW - 0.24, 0.012, 0.01), darkMat)
    g.position.set(0, 0.2 + i * 0.045, cabD / 2 + 0.006)
    root.add(g)
  }

  root.userData.tick = (_delta: number) => {
    const t = performance.now() / 1000
    const m = scrMat as THREE.MeshStandardMaterial
    m.emissiveIntensity = 0.4 + Math.abs(Math.sin(t * 1.4)) * 0.3
  }

  root.userData.labelHeight = 1.9
  return root
}
