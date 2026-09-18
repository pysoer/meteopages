/**
 * 视程障碍现象仪（Visibility/Vis Obstruction Phenomenon Sensor）
 *
 * 形态依据（参考图 public/equipment/visobs.jpg 实拍重建）：
 *   - 细长白色圆杆（总高约 3m），落地法兰 + 地脚螺栓 + 混凝土基墩
 *   - 杆上部安装蓝灰色金属接线箱（正面圆形锁扣）
 *   - 箱顶左侧：小型白色圆筒传感器（带顶盖短桩）
 *   - 箱顶右侧：白色多层防辐射罩（百叶盘堆叠，短横臂外挑）
 *   - 电缆贴杆而下
 *
 * 八阶段管线：Blockout → Structural → Form → Material → Surface → Lighting → Interaction → Optimization
 */
import * as THREE from 'three'

export function createVisObstruction(): THREE.Group {
  const root = new THREE.Group()
  root.name = 'VisObstruction'

  // ── 材质 ──
  const whiteMat = new THREE.MeshStandardMaterial({ color: 0xf2f5f7, roughness: 0.5, metalness: 0.1 })
  const cabMat = new THREE.MeshStandardMaterial({ color: 0xa9c0d4, roughness: 0.45, metalness: 0.3 })
  const cabPanel = new THREE.MeshStandardMaterial({ color: 0x93aec6, roughness: 0.5, metalness: 0.25 })
  const metalMat = new THREE.MeshStandardMaterial({ color: 0xb8c0c6, roughness: 0.4, metalness: 0.6 })
  const darkMat = new THREE.MeshStandardMaterial({ color: 0x3a4046, roughness: 0.6, metalness: 0.3 })
  const concreteMat = new THREE.MeshStandardMaterial({ color: 0xc9c4ba, roughness: 0.95, metalness: 0 })

  // ── 1. Blockout：混凝土基墩 + 法兰 + 地脚螺栓 ──
  const pad = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.12, 0.75), concreteMat)
  pad.position.y = 0.06
  root.add(pad)
  const flange = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.19, 0.06, 20), whiteMat)
  flange.position.y = 0.15
  root.add(flange)
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + Math.PI / 4
    const bolt = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.06, 8), metalMat)
    bolt.position.set(Math.cos(a) * 0.14, 0.19, Math.sin(a) * 0.14)
    root.add(bolt)
  }

  // ── 2. Structural：细长主杆（0.18m → 2.62m） ──
  const poleBot = 0.18, poleTop = 2.62
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.06, poleTop - poleBot, 16), whiteMat)
  pole.position.y = (poleTop + poleBot) / 2
  root.add(pole)

  // ── 3. Form：蓝灰色机箱（杆顶，重心略前倾安装在杆上） ──
  const cabW = 0.5, cabH = 0.42, cabD = 0.28
  const cabY = 2.4
  const cabinet = new THREE.Mesh(new THREE.BoxGeometry(cabW, cabH, cabD), cabMat)
  cabinet.position.set(0, cabY, 0.06)
  root.add(cabinet)
  // 正面板（略深色）+ 圆形锁扣
  const panel = new THREE.Mesh(new THREE.BoxGeometry(cabW - 0.06, cabH - 0.06, 0.012), cabPanel)
  panel.position.set(0, cabY, 0.06 + cabD / 2 + 0.006)
  root.add(panel)
  const knob = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.02, 12), darkMat)
  knob.rotation.x = Math.PI / 2
  knob.position.set(cabW / 2 - 0.07, cabY - 0.05, 0.06 + cabD / 2 + 0.016)
  root.add(knob)
  // 箱体顶/底加强边
  for (const dy of [cabH / 2, -cabH / 2]) {
    const rim = new THREE.Mesh(new THREE.BoxGeometry(cabW + 0.02, 0.02, cabD + 0.02), cabPanel)
    rim.position.set(0, cabY + dy, 0.06)
    root.add(rim)
  }
  // 箱背与杆的抱箍
  const clamp = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.05, 14), metalMat)
  clamp.position.set(0, cabY - cabH / 2 - 0.02, 0)
  root.add(clamp)

  // ── 4. Surface：箱顶左侧小型圆筒传感器 ──
  const stub = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.07, 10), metalMat)
  stub.position.set(-0.14, cabY + cabH / 2 + 0.035, 0.06)
  root.add(stub)
  const gauge = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.14, 16), whiteMat)
  gauge.position.set(-0.14, cabY + cabH / 2 + 0.14, 0.06)
  root.add(gauge)
  const gaugeCap = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.02, 16), whiteMat)
  gaugeCap.position.set(-0.14, cabY + cabH / 2 + 0.22, 0.06)
  root.add(gaugeCap)

  // ── 5. Surface：箱顶右侧多层防辐射罩（百叶盘堆叠） ──
  const armX = 0.17
  const arm = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.025, 0.025), metalMat)
  arm.position.set(armX / 2 + 0.03, cabY + cabH / 2 + 0.012, 0.06)
  root.add(arm)
  const shieldX = armX + 0.03
  const shieldBaseY = cabY + cabH / 2 + 0.03
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.05, 8), metalMat)
  stem.position.set(shieldX, shieldBaseY + 0.025, 0.06)
  root.add(stem)
  // 交替半径的百叶盘 ×7
  const plateH = 0.032
  for (let i = 0; i < 7; i++) {
    const r = i % 2 === 0 ? 0.085 : 0.062
    const plate = new THREE.Mesh(new THREE.CylinderGeometry(r, r, plateH, 18), whiteMat)
    plate.position.set(shieldX, shieldBaseY + 0.07 + i * plateH, 0.06)
    root.add(plate)
  }
  const cap = new THREE.Mesh(new THREE.ConeGeometry(0.055, 0.045, 16), whiteMat)
  cap.position.set(shieldX, shieldBaseY + 0.07 + 7 * plateH + 0.02, 0.06)
  root.add(cap)

  // ── 6. Surface：电缆贴杆而下 ──
  const cablePts = [
    new THREE.Vector3(0.02, cabY - cabH / 2 + 0.05, 0.2),
    new THREE.Vector3(0.055, 1.4, 0.06),
    new THREE.Vector3(0.05, 0.4, 0.05),
    new THREE.Vector3(0.06, 0.05, 0.1),
  ]
  const cable = new THREE.Mesh(
    new THREE.TubeGeometry(new THREE.CatmullRomCurve3(cablePts), 20, 0.011, 8, false),
    new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.8 }),
  )
  root.add(cable)

  // 总高 ≈ 2.95m
  root.userData.labelHeight = 3.15
  return root
}
