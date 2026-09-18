/**
 * 微波辐射计（Microwave Radiometer）
 *
 * 形态依据（参考图 public/equipment/radiometer.jpg —— HF-G5 型实拍重建）：
 *   - 黑色三脚架（3 根圆管腿 + 中心转台轴）
 *   - 卧式白色大圆筒主体（水平胶囊形，左端半球封头）
 *   - 筒身之下深灰/蓝灰色底环（带散热鳍片）
 *   - 筒身右端上方白色多层防辐射罩（百叶盘堆叠）
 *   - 筒身侧面蓝色标识
 *
 * 八阶段管线：Blockout → Structural → Form → Material → Surface → Lighting → Interaction → Optimization
 */
import * as THREE from 'three'

export function createMicrowaveRadiometer(): THREE.Group {
  const root = new THREE.Group()
  root.name = 'MicrowaveRadiometer'

  // ── 材质 ──
  const whiteMat = new THREE.MeshStandardMaterial({ color: 0xf2f5f7, roughness: 0.4, metalness: 0.1 })
  const frameMat = new THREE.MeshStandardMaterial({ color: 0x454f59, roughness: 0.55, metalness: 0.45 })
  const ringMat = new THREE.MeshStandardMaterial({ color: 0x4e5a63, roughness: 0.5, metalness: 0.4 })
  const darkMat = new THREE.MeshStandardMaterial({ color: 0x2c3237, roughness: 0.6, metalness: 0.3 })
  const blueMat = new THREE.MeshStandardMaterial({ color: 0x1f4f8f, roughness: 0.4, metalness: 0.2 })

  // ── 1. Blockout：三脚架 ──
  const hubY = 1.08
  const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.11, 0.2, 16), frameMat)
  hub.position.y = hubY
  root.add(hub)
  const footR = 0.82
  const up = new THREE.Vector3(0, 1, 0)
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2 + Math.PI / 2
    const top = new THREE.Vector3(Math.cos(a) * 0.06, hubY - 0.06, Math.sin(a) * 0.06)
    const foot = new THREE.Vector3(Math.cos(a) * footR, 0.03, Math.sin(a) * footR)
    const dir = foot.clone().sub(top)
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.038, dir.length(), 12), frameMat)
    leg.position.copy(top.clone().add(foot).multiplyScalar(0.5))
    leg.quaternion.setFromUnitVectors(up, dir.clone().normalize())
    root.add(leg)
    // 脚垫
    const footPad = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.08, 0.05, 12), darkMat)
    footPad.position.set(foot.x, 0.025, foot.z)
    root.add(footPad)
  }

  // ── 2. Structural：深灰底环（带散热鳍片，静态） ──
  const ringY = hubY + 0.2
  const ring = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.5, 0.22, 28), ringMat)
  ring.position.y = ringY
  root.add(ring)
  // 散热鳍片（环向小片 ×18）
  for (let i = 0; i < 18; i++) {
    const a = (i / 18) * Math.PI * 2
    const fin = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.16, 0.045), ringMat)
    fin.position.set(Math.cos(a) * 0.5, ringY - 0.02, Math.sin(a) * 0.5)
    fin.rotation.y = -a
    root.add(fin)
  }

  // ── 3. Form：卧式圆筒主体（可旋转头部） ──
  const head = new THREE.Group()
  head.position.y = 0
  const bodyY = ringY + 0.22 + 0.42 - 0.08   // 筒身中心 ≈ 1.84
  const bodyR = 0.42, bodyLen = 0.95
  const body = new THREE.Mesh(
    new THREE.CapsuleGeometry(bodyR, bodyLen, 8, 28),
    whiteMat,
  )
  body.rotation.z = Math.PI / 2              // 轴线沿 X
  body.position.y = bodyY
  head.add(body)
  // 右端过渡短筒 + 端板
  const endPlate = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.4, 0.07, 26), whiteMat)
  endPlate.rotation.z = Math.PI / 2
  endPlate.position.set(bodyLen / 2 + bodyR * 0.55, bodyY, 0)
  head.add(endPlate)
  // 左端测湿窗口（浅灰圆窗）
  const port = new THREE.Mesh(new THREE.CircleGeometry(0.16, 20), darkMat)
  port.rotation.y = Math.PI / 2
  port.position.set(-bodyLen / 2 - bodyR + 0.001, bodyY, 0)
  head.add(port)

  // ── 4. Surface：右端上方多层防辐射罩 ──
  const shieldX = bodyLen / 2 + 0.1
  const stemBot = bodyY + bodyR - 0.1
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.16, 10), frameMat)
  stem.position.set(shieldX, stemBot + 0.08, 0)
  head.add(stem)
  const arm = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.03, 0.03), frameMat)
  arm.position.set(shieldX - 0.08, stemBot + 0.02, 0)
  head.add(arm)
  const plateH = 0.034
  for (let i = 0; i < 7; i++) {
    const r = i % 2 === 0 ? 0.095 : 0.07
    const plate = new THREE.Mesh(new THREE.CylinderGeometry(r, r, plateH, 18), whiteMat)
    plate.position.set(shieldX, stemBot + 0.18 + i * plateH, 0)
    head.add(plate)
  }
  const cap = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.05, 16), whiteMat)
  cap.position.set(shieldX, stemBot + 0.18 + 7 * plateH + 0.022, 0)
  head.add(cap)

  // ── 5. Surface：筒身蓝色标识 ──
  const logo = new THREE.Mesh(new THREE.CircleGeometry(0.13, 20), blueMat)
  logo.position.set(-0.25, bodyY + 0.08, bodyR * 0.98)
  logo.rotation.x = -0.12
  head.add(logo)

  root.add(head)

  // ── 7. Interaction：头部绕垂直轴缓慢扫描 ──
  root.userData.tick = (delta: number) => {
    head.rotation.y += delta * 0.3
  }

  // 总高 ≈ 2.65m（防辐射罩顶）
  root.userData.labelHeight = 2.9
  return root
}
