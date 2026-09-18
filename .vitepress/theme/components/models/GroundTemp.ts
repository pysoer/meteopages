/**
 * 地温场 / 浅层地温观测（Shallow Soil Temperature Field）
 *
 * 参考特征（依据 equipment/ground.md 描述）：
 *   - 场地 2m（南北）× 4m（东西）疏松平整裸地
 *   - 测地面温度与离地 5 / 10 / 15 / 20 cm 浅层地温
 *   - 地面温度表平卧地表，浅层地温表斜插入土
 *
 * 八阶段管线：Blockout → Structural → Form → Material → Surface → Lighting → Interaction → Optimization
 */
import * as THREE from 'three'

export function createGroundTemp(): THREE.Group {
  const root = new THREE.Group()
  root.name = 'GroundTemp'

  // ── 材质 ──
  const soilMat = new THREE.MeshStandardMaterial({ color: 0x6f5238, roughness: 1, metalness: 0 })
  const soilTopMat = new THREE.MeshStandardMaterial({ color: 0x7d5c40, roughness: 1, metalness: 0 })
  const glassMat = new THREE.MeshStandardMaterial({
    color: 0xe8f2f8, roughness: 0.1, metalness: 0, transparent: true, opacity: 0.55,
  })
  const darkMat = new THREE.MeshStandardMaterial({ color: 0x2b2f33, roughness: 0.6, metalness: 0.25 })

  // ── 1. Blockout：2m(南北) × 4m(东西) 裸地土台 ──
  const bed = new THREE.Mesh(new THREE.BoxGeometry(4.0, 0.10, 2.0), soilMat)
  bed.position.y = 0.05
  root.add(bed)
  // 表层疏松土（略浅色，靠近地表）
  const top = new THREE.Mesh(new THREE.BoxGeometry(3.96, 0.03, 1.96), soilTopMat)
  top.position.y = 0.10
  root.add(top)

  // 土面颗粒噪点（示意疏松）
  for (let i = 0; i < 60; i++) {
    const s = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.012, 0.03), soilTopMat)
    s.position.set((Math.random() - 0.5) * 3.8, 0.115, (Math.random() - 0.5) * 1.8)
    s.rotation.y = Math.random() * Math.PI
    root.add(s)
  }

  // ── 2. Structural：地面温度表（平卧地表，玻璃管 + 刻度） ──
  const gThem = new THREE.Group()
  const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.32, 10), glassMat)
  tube.rotation.z = Math.PI / 2
  gThem.add(tube)
  const mercury = new THREE.Mesh(
    new THREE.CylinderGeometry(0.003, 0.003, 0.30, 8),
    new THREE.MeshStandardMaterial({ color: 0xd93b3b, roughness: 0.4 }),
  )
  mercury.rotation.z = Math.PI / 2
  gThem.add(mercury)
  gThem.position.set(1.3, 0.125, 0.55)
  root.add(gThem)

  // 地面最低温度表（略短，旁边）
  const gMin = gThem.clone()
  gMin.position.set(1.3, 0.125, 0.2)
  root.add(gMin)

  // ── 3. Form：5/10/15/20cm 浅层地温表（斜插入土） ──
  const depths = [5, 10, 15, 20]
  depths.forEach((d, i) => {
    const g = new THREE.Group()
    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.42, 10), glassMat)
    shaft.position.y = 0.21
    g.add(shaft)
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.017, 12, 12), darkMat)
    head.position.y = 0.44
    g.add(head)
    // 探头（下端感温球）
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.012, 10, 10),
      new THREE.MeshStandardMaterial({ color: 0xd93b3b, roughness: 0.4 }))
    bulb.position.y = 0.0
    g.add(bulb)
    // 斜插：倾角随深度增大
    g.rotation.z = Math.PI / 2 - (0.28 + i * 0.06)
    g.position.set(-1.2 + i * 0.22, 0.10 + 0.02 * i, -0.62)
    root.add(g)
  })

  // ── 4. Surface：北侧接线盒 + 电缆 ──
  const jbox = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.16, 0.14), darkMat)
  jbox.position.set(-0.2, 0.18, -0.78)
  root.add(jbox)
  const cablePts = [
    new THREE.Vector3(-0.2, 0.10, -0.72),
    new THREE.Vector3(0.2, 0.06, -0.55),
    new THREE.Vector3(1.1, 0.04, -0.4),
  ]
  const cable = new THREE.Mesh(
    new THREE.TubeGeometry(new THREE.CatmullRomCurve3(cablePts), 18, 0.01, 8, false),
    new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.75 }),
  )
  root.add(cable)

  return root
}
