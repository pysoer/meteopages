/**
 * 日照传感器（光电式日照计 / Photoelectric Sunshine Duration Sensor）
 *
 * 参考特征（依据 equipment/sunshine.md 描述 + 地面气象观测场标准形态）：
 *   - 短立柱支撑，顶部为传感器主体
 *   - 主体为圆柱形黑色遮光腔体 + 上部半球形玻璃罩（直接辐射进入）
 *   - 一侧有白色遮光板/支架
 *
 * 八阶段管线：Blockout → Structural → Form → Material → Surface → Lighting → Interaction → Optimization
 */
import * as THREE from 'three'

export function createSunshineSensor(): THREE.Group {
  const root = new THREE.Group()
  root.name = 'SunshineSensor'

  // ── 材质 ──
  const poleMat = new THREE.MeshStandardMaterial({ color: 0xbfc7cc, roughness: 0.5, metalness: 0.45 })
  const bodyMat = new THREE.MeshStandardMaterial({ color: 0x2b2f33, roughness: 0.55, metalness: 0.3 })
  const glassMat = new THREE.MeshStandardMaterial({
    color: 0xcfe8ff, roughness: 0.08, metalness: 0.0, transparent: true, opacity: 0.4,
  })
  const whiteMat = new THREE.MeshStandardMaterial({ color: 0xf2f5f7, roughness: 0.6, metalness: 0.05 })

  // ── 1. Blockout：立柱 ──
  const poleH = 1.15
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.055, poleH, 16), poleMat)
  pole.position.y = poleH / 2
  root.add(pole)

  // 底部法兰
  const foot = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.18, 0.05, 20), poleMat)
  foot.position.y = 0.025
  root.add(foot)

  // ── 2. Structural：传感器主体（圆柱腔 + 顶部玻璃罩） ──
  const bodyY = poleH + 0.11
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.12, 0.22, 24), bodyMat)
  body.position.y = bodyY
  root.add(body)

  // 玻璃半球罩（感应面）
  const dome = new THREE.Mesh(
    new THREE.SphereGeometry(0.11, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2),
    glassMat,
  )
  dome.position.y = bodyY + 0.11
  root.add(dome)

  // 内部黑色感应元件（小圆盘）
  const sensor = new THREE.Mesh(
    new THREE.CylinderGeometry(0.055, 0.055, 0.012, 18),
    new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.9, metalness: 0.1 }),
  )
  sensor.position.y = bodyY + 0.07
  root.add(sensor)

  // ── 3. Form：白色遮光/反射环（防止侧面杂光） ──
  const shield = new THREE.Mesh(new THREE.TorusGeometry(0.135, 0.018, 10, 28), whiteMat)
  shield.rotation.x = Math.PI / 2
  shield.position.y = bodyY + 0.04
  root.add(shield)

  // 主体侧面接线盒
  const jbox = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.09, 0.05), bodyMat)
  jbox.position.set(0, bodyY - 0.06, 0.125)
  root.add(jbox)

  // 电缆（沿立柱向下）
  const cablePts = [
    new THREE.Vector3(0, bodyY - 0.06, 0.13),
    new THREE.Vector3(0.04, 0.6, 0.09),
    new THREE.Vector3(0.05, 0.05, 0.06),
  ]
  const cable = new THREE.Mesh(
    new THREE.TubeGeometry(new THREE.CatmullRomCurve3(cablePts), 20, 0.012, 8, false),
    new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.7 }),
  )
  root.add(cable)

  // 总高 ≈ 1.15 + 0.22 + 0.11 ≈ 1.48m
  return root
}
