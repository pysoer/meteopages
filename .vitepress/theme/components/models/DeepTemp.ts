/**
 * 深层地温传感器（Deep Soil Temperature Sensor）
 *
 * 参考特征（依据 equipment/deep.md 描述）：
 *   - 观测 40 / 80 / 160 / 320 cm 土壤温度
 *   - 地表为土面，垂直导管 + 分层探杆，顶部有接线盒
 *
 * 八阶段管线：Blockout → Structural → Form → Material → Surface → Lighting → Interaction → Optimization
 */
import * as THREE from 'three'

export function createDeepTemp(): THREE.Group {
  const root = new THREE.Group()
  root.name = 'DeepTemp'

  // ── 材质 ──
  const soilMat = new THREE.MeshStandardMaterial({ color: 0x6b4f36, roughness: 1, metalness: 0 })
  const pipeMat = new THREE.MeshStandardMaterial({ color: 0xd8dde1, roughness: 0.35, metalness: 0.5 })
  const darkMat = new THREE.MeshStandardMaterial({ color: 0x2b2f33, roughness: 0.6, metalness: 0.25 })
  const rodMat = new THREE.MeshStandardMaterial({ color: 0xb9c2c6, roughness: 0.4, metalness: 0.5 })

  // ── 1. Blockout：观测土面（疏松裸地土台） ──
  const bed = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.08, 0.8), soilMat)
  bed.position.y = 0.04
  root.add(bed)

  // ── 2. Structural：中央垂直导管 ──
  const pipeH = 0.55
  const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.06, pipeH, 20), pipeMat)
  pipe.position.y = 0.08 + pipeH / 2
  root.add(pipe)

  // 深度标识环（40/80/160/320cm 示意，按等比缩略绘制在导管上）
  for (let i = 1; i <= 4; i++) {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.062, 0.006, 8, 20), darkMat)
    ring.rotation.x = Math.PI / 2
    ring.position.y = 0.08 + (pipeH * i) / 4.6
    root.add(ring)
  }

  // ── 3. Form：顶部接线盒 ──
  const jbox = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.14, 0.16), darkMat)
  jbox.position.y = 0.08 + pipeH + 0.07
  root.add(jbox)

  // ── 4. Surface：从导管引出的 4 根探杆（斜插入土，示意分层） ──
  const depths = [40, 80, 160, 320]
  depths.forEach((d, i) => {
    const ang = (i / 4) * Math.PI * 2 + Math.PI / 4
    const len = 0.5 + i * 0.12
    const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, len, 10), rodMat)
    // 从导管中部斜向下插入土
    rod.position.set(
      Math.cos(ang) * (0.09 + i * 0.03),
      0.30 - i * 0.02,
      Math.sin(ang) * (0.09 + i * 0.03),
    )
    rod.rotation.z = Math.PI / 2.6 * (i % 2 === 0 ? 1 : -1)
    rod.rotation.x = ang
    root.add(rod)

    // 深度刻度小标签块
    const tag = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.012, 0.03), darkMat)
    tag.position.set(Math.cos(ang) * 0.075, 0.08 + pipeH - i * 0.09, Math.sin(ang) * 0.075)
    root.add(tag)
  })

  return root
}
