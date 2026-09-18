/**
 * 草面温度传感器（Grass-surface Temperature Sensor）
 *
 * 参考特征（依据 equipment/grass.md 描述）：
 *   - 草地面积约 1㎡
 *   - 传感器安装在距地 6cm 高度，与地面大致平行，感应部分朝南
 *   - 细长探针 + 引出电缆接至小立柱/接线盒
 *
 * 八阶段管线：Blockout → Structural → Form → Material → Surface → Lighting → Interaction → Optimization
 */
import * as THREE from 'three'

export function createGrassTemp(): THREE.Group {
  const root = new THREE.Group()
  root.name = 'GrassTemp'

  // ── 材质 ──
  const grassMat = new THREE.MeshStandardMaterial({ color: 0x4f9d3a, roughness: 0.95, metalness: 0 })
  const probeMat = new THREE.MeshStandardMaterial({ color: 0xd8dde1, roughness: 0.35, metalness: 0.6 })
  const darkMat = new THREE.MeshStandardMaterial({ color: 0x2b2f33, roughness: 0.6, metalness: 0.25 })
  const poleMat = new THREE.MeshStandardMaterial({ color: 0xbfc7cc, roughness: 0.5, metalness: 0.4 })

  // ── 1. Blockout：1㎡ 草皮（略高于地表） ──
  const patch = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.05, 1.0), grassMat)
  patch.position.y = 0.025
  root.add(patch)

  // 草叶簇（少量短锥，增加辨识度）
  const bladeMat = new THREE.MeshStandardMaterial({ color: 0x62b84a, roughness: 1 })
  for (let i = 0; i < 26; i++) {
    const a = Math.random() * Math.PI * 2
    const r = 0.10 + Math.random() * 0.36
    const blade = new THREE.Mesh(new THREE.ConeGeometry(0.012, 0.07 + Math.random() * 0.05, 4), bladeMat)
    blade.position.set(Math.cos(a) * r, 0.05 + blade.geometry.parameters.height / 2, Math.sin(a) * r)
    blade.rotation.z = (Math.random() - 0.5) * 0.5
    root.add(blade)
  }

  // ── 2. Structural：距地 6cm 的平行探针（感应部分朝南 = +Z 方向） ──
  const H = 0.06
  const probe = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.34, 12), probeMat)
  probe.rotation.z = Math.PI / 2   // 水平放置，指向南北
  probe.rotation.y = 0
  probe.position.set(0, H, 0.02)
  root.add(probe)

  // 探针端部感应头（加粗小段）
  const tip = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.06, 12), darkMat)
  tip.rotation.z = Math.PI / 2
  tip.position.set(0, H, 0.02 - 0.18)
  root.add(tip)

  // ── 3. Form：支撑立柱 + 接线盒 ──
  const poleH = 0.5
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.022, poleH, 12), poleMat)
  pole.position.set(0, poleH / 2 + 0.05, 0.42)
  root.add(pole)

  const jbox = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.16, 0.08), darkMat)
  jbox.position.set(0, 0.42, 0.42)
  root.add(jbox)

  // ── 4. Surface：引出电缆（探针 → 接线盒） ──
  const cablePts = [
    new THREE.Vector3(0, H, 0.19),
    new THREE.Vector3(0, 0.14, 0.33),
    new THREE.Vector3(0, 0.34, 0.42),
  ]
  const cable = new THREE.Mesh(
    new THREE.TubeGeometry(new THREE.CatmullRomCurve3(cablePts), 16, 0.009, 8, false),
    new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.75 }),
  )
  root.add(cable)

  return root
}
