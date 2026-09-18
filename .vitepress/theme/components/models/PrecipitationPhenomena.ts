/**
 * 降水现象仪（Precipitation Phenomenon Sensor，激光雨滴谱 / 粒子图谱）
 *
 * 形态依据（按行业标准激光降水现象仪实拍形态重建，如 DSG5 / Parsivel 类）：
 *   - 单根竖直立柱 + 顶部水平「光学头横梁」——不再是两根落地立柱
 *   - 横梁两端各向下伸出一段短臂，两臂内侧面为发射 / 接收光学窗，中间是开放采样缝
 *   - 立柱中部为接线盒与电缆，底部为法兰 + 地脚板
 *
 * 八阶段管线：Blockout → Structural → Form → Material → Surface → Lighting → Interaction → Optimization
 */
import * as THREE from 'three'

export function createPrecipitationPhenomena(): THREE.Group {
  const root = new THREE.Group()
  root.name = 'PrecipitationPhenomena'

  // ── 材质 ──
  const bodyMat = new THREE.MeshStandardMaterial({ color: 0xdfe5e9, roughness: 0.42, metalness: 0.35 })
  const darkMat = new THREE.MeshStandardMaterial({ color: 0x2b2f33, roughness: 0.55, metalness: 0.3 })
  const metalMat = new THREE.MeshStandardMaterial({ color: 0xb6bfc5, roughness: 0.35, metalness: 0.6 })
  const lensMat = new THREE.MeshStandardMaterial({
    color: 0x9fe3ff, emissive: 0x2f6f9f, emissiveIntensity: 0.8, roughness: 0.12, metalness: 0.1,
  })

  // ── 1. Blockout：地脚板 + 法兰底座 ──
  const plate = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.04, 0.4), metalMat)
  plate.position.y = 0.02
  root.add(plate)
  const flange = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.13, 0.06, 20), metalMat)
  flange.position.y = 0.07
  root.add(flange)

  // ── 2. Structural：单立柱 ──
  const poleH = 1.42
  const poleBase = 0.10
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.055, poleH, 20), bodyMat)
  pole.position.y = poleBase + poleH / 2
  root.add(pole)
  const poleTopY = poleBase + poleH            // 1.52

  // 立柱抱箍（两处）
  for (const hy of [poleTopY - 0.18, 0.75]) {
    const clamp = new THREE.Mesh(new THREE.CylinderGeometry(0.062, 0.062, 0.035, 20), metalMat)
    clamp.position.y = hy
    root.add(clamp)
  }

  // ── 3. Form：顶部光学头横梁 + 两端下垂臂 ──
  const barL = 0.74          // 横梁总长
  const barH = 0.13
  const barD = 0.17
  const armW = 0.13
  const armH = 0.34
  const barCenterY = poleTopY + 0.01 + barH / 2

  const headBar = new THREE.Mesh(new THREE.BoxGeometry(barL, barH, barD), bodyMat)
  headBar.position.y = barCenterY
  root.add(headBar)

  // 横梁顶部整体防雨罩（略出檐）
  const hood = new THREE.Mesh(new THREE.BoxGeometry(barL + 0.05, 0.028, barD + 0.05), darkMat)
  hood.position.y = barCenterY + barH / 2 + 0.014
  root.add(hood)

  const armX = barL / 2 - armW / 2
  const armCenterY = barCenterY - barH / 2 - armH / 2
  for (const sign of [-1, 1]) {
    // 下垂臂
    const arm = new THREE.Mesh(new THREE.BoxGeometry(armW, armH, barD - 0.02), bodyMat)
    arm.position.set(sign * armX, armCenterY, 0)
    root.add(arm)
    // 臂底面封板
    const cap = new THREE.Mesh(new THREE.BoxGeometry(armW + 0.02, 0.02, barD), darkMat)
    cap.position.set(sign * armX, armCenterY - armH / 2, 0)
    root.add(cap)
    // 内侧光学窗（发射 / 接收，相对而立）
    const win = new THREE.Mesh(new THREE.BoxGeometry(0.014, 0.2, 0.09), lensMat)
    win.position.set(sign * (armX - armW / 2 - 0.008), armCenterY, 0)
    root.add(win)
    // 窗框
    const ring = new THREE.Mesh(new THREE.BoxGeometry(0.01, 0.24, 0.12), metalMat)
    ring.position.set(sign * (armX - armW / 2 - 0.002), armCenterY, 0)
    root.add(ring)
  }

  // 立柱与横梁之间的斜撑
  for (const sign of [-1, 1]) {
    const brace = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.24, 0.03), metalMat)
    brace.position.set(sign * 0.09, poleTopY - 0.06, 0)
    brace.rotation.z = sign * 0.5
    root.add(brace)
  }

  // ── 4. Form：开放采样缝内的激光光带（两窗之间的水平激光面） ──
  const gapX = 2 * (armX - armW / 2 - 0.016)      // ≈0.44
  const beamPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(gapX, 0.2),
    new THREE.MeshBasicMaterial({
      color: 0x7fd4ff, transparent: true, opacity: 0.24, side: THREE.DoubleSide, depthWrite: false,
    }),
  )
  beamPlane.rotation.y = Math.PI / 2
  beamPlane.position.y = armCenterY
  root.add(beamPlane)

  // ── 5. Surface：接线盒 + 电缆 ──
  const jbox = new THREE.Mesh(new THREE.BoxGeometry(0.17, 0.24, 0.12), darkMat)
  jbox.position.set(0, 0.9, 0.11)
  root.add(jbox)
  const lampMat = new THREE.MeshStandardMaterial({ color: 0x34d399, emissive: 0x34d399, emissiveIntensity: 1.1 })
  const lamp = new THREE.Mesh(new THREE.CircleGeometry(0.013, 10), lampMat)
  lamp.position.set(0.045, 0.96, 0.171)
  root.add(lamp)

  const cablePts = [
    new THREE.Vector3(-0.06, 0.8, 0.14),
    new THREE.Vector3(-0.14, 0.4, 0.2),
    new THREE.Vector3(-0.2, 0.04, 0.24),
  ]
  const cable = new THREE.Mesh(
    new THREE.TubeGeometry(new THREE.CatmullRomCurve3(cablePts), 18, 0.011, 8, false),
    new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.75 }),
  )
  root.add(cable)

  // ── 6. Interaction：激光采样面呼吸闪烁 ──
  root.userData.tick = (_delta: number) => {
    const t = performance.now() / 1000
    const m = beamPlane.material as THREE.MeshBasicMaterial
    m.opacity = 0.16 + Math.abs(Math.sin(t * 1.6)) * 0.18
    const l = lampMat as THREE.MeshStandardMaterial
    l.emissiveIntensity = 0.5 + (Math.sin(t * 2) > 0.6 ? 1.0 : 0.1)
  }

  // 总高 ≈ 1.67m（光学头臂底 ~1.06m）
  root.userData.labelHeight = 2.05
  return root
}
