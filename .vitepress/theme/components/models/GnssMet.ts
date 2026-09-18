/**
 * GNSS/MET 地基导航卫星水汽探测仪（GNSS Meteorology Receiver）
 *
 * 参考特征（依据 equipment/gnssmet.md 描述 + 标准 GNSS 观测墩形态）：
 *   - 混凝土观测墩（方柱），顶部安装大地型扼流圈天线 + 白色天线罩
 *   - 墩下/旁设接收机机柜，馈线沿墩身下行
 *
 * 八阶段管线：Blockout → Structural → Form → Material → Surface → Lighting → Interaction → Optimization
 */
import * as THREE from 'three'

export function createGnssMet(): THREE.Group {
  const root = new THREE.Group()
  root.name = 'GnssMet'

  // ── 材质 ──
  const concreteMat = new THREE.MeshStandardMaterial({ color: 0xd2d6d9, roughness: 0.9, metalness: 0.03 })
  const domeMat = new THREE.MeshStandardMaterial({ color: 0xf4f7f9, roughness: 0.55, metalness: 0.05 })
  const metalMat = new THREE.MeshStandardMaterial({ color: 0xbfc7cc, roughness: 0.35, metalness: 0.6 })
  const darkMat = new THREE.MeshStandardMaterial({ color: 0x2b2f33, roughness: 0.55, metalness: 0.3 })

  // ── 1. Blockout：混凝土观测墩 ──
  const pierH = 1.35
  const pier = new THREE.Mesh(new THREE.BoxGeometry(0.42, pierH, 0.42), concreteMat)
  pier.position.y = pierH / 2
  root.add(pier)
  // 墩基
  const base = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.14, 0.72), concreteMat)
  base.position.y = 0.07
  root.add(base)

  // ── 2. Structural：墩顶强制对中基座 ──
  const topPlate = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.22, 0.06, 24), metalMat)
  topPlate.position.y = pierH + 0.03
  root.add(topPlate)

  // ── 3. Form：大地型扼流圈天线 + 白色天线罩 ──
  const antY = pierH + 0.06
  // 扼流圈天线（多层同心环）
  for (let i = 0; i < 4; i++) {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(0.2 - i * 0.04, 0.014, 8, 28),
      metalMat,
    )
    ring.rotation.x = Math.PI / 2
    ring.position.y = antY + i * 0.018
    root.add(ring)
  }
  // 天线基盘
  const dish = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.2, 0.03, 28), metalMat)
  dish.position.y = antY
  root.add(dish)
  // 白色天线罩（半球顶）
  const radome = new THREE.Mesh(
    new THREE.SphereGeometry(0.22, 26, 14, 0, Math.PI * 2, 0, Math.PI / 2),
    domeMat,
  )
  radome.position.y = antY + 0.06
  root.add(radome)
  // 罩体圆柱裙边
  const skirt = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.12, 26), domeMat)
  skirt.position.y = antY + 0.0
  root.add(skirt)

  // ── 4. Surface：接收机机柜 + 馈线 ──
  const cab = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.75, 0.42), domeMat)
  cab.position.set(-0.7, 0.375 + 0.05, 0)
  root.add(cab)
  const cabBase = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.05, 0.48), darkMat)
  cabBase.position.set(-0.7, 0.025, 0)
  root.add(cabBase)
  // 机柜前面板灯
  const lampMat = new THREE.MeshStandardMaterial({ color: 0x34d399, emissive: 0x34d399, emissiveIntensity: 1.2 })
  const lamp = new THREE.Mesh(new THREE.CircleGeometry(0.016, 10), lampMat)
  lamp.position.set(-0.7, 0.72, 0.211)
  root.add(lamp)

  // 馈线：墩顶 → 机柜
  const feedPts = [
    new THREE.Vector3(0.06, antY + 0.02, 0.06),
    new THREE.Vector3(-0.1, pierH * 0.6, 0.22),
    new THREE.Vector3(-0.5, 0.55, 0.2),
    new THREE.Vector3(-0.7, 0.5, 0.2),
  ]
  const feed = new THREE.Mesh(
    new THREE.TubeGeometry(new THREE.CatmullRomCurve3(feedPts), 24, 0.012, 8, false),
    new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.7 }),
  )
  root.add(feed)

  // 避雷针（墩顶一角细针）
  const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.6, 8), metalMat)
  rod.position.set(0.16, antY + 0.4, 0.16)
  root.add(rod)

  root.userData.labelHeight = 2.4
  return root
}
