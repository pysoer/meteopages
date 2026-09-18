/**
 * 蒸发器（E-601 型蒸发皿 / Evaporation Pan）
 *
 * 参考特征（依据 equipment/evap.md 描述）：
 *   - 圆柱形桶，器口面积 0.3㎡（约 φ618mm，深 600mm），桶体埋入地中、桶口略高于地面
 *   - 桶底中心装一直管，直管上端装有测针座与水面指示针
 *   - 桶口外圈有防鸟/防溅围圈，旁设小型雨量器与量杯
 *
 * 八阶段管线：Blockout → Structural → Form → Material → Surface → Lighting → Interaction → Optimization
 */
import * as THREE from 'three'

export function createEvaporationPan(): THREE.Group {
  const root = new THREE.Group()
  root.name = 'EvaporationPan'
  root.scale.setScalar(1.0)

  // ── 材质 ──
  const steelMat = new THREE.MeshStandardMaterial({ color: 0xc9d1d6, roughness: 0.32, metalness: 0.65 })
  const innerMat = new THREE.MeshStandardMaterial({ color: 0xaeb8be, roughness: 0.4, metalness: 0.55 })
  const waterMat = new THREE.MeshStandardMaterial({
    color: 0x2f7fb8, roughness: 0.08, metalness: 0.15, transparent: true, opacity: 0.75,
  })
  const darkMat = new THREE.MeshStandardMaterial({ color: 0x2b2f33, roughness: 0.6, metalness: 0.3 })

  // ── 1. Blockout：桶体外壳（埋地，仅露出上部约 0.22m） ──
  const panR = 1.1          // 半径（示意，实际 φ0.618m，此处按场景比例放大至便于辨识）
  const panH = 0.42         // 露出地面高度
  const wall = 0.05

  // 桶外壁（开顶圆柱）
  const outer = new THREE.Mesh(
    new THREE.CylinderGeometry(panR, panR, panH, 40, 1, true),
    steelMat,
  )
  outer.position.y = panH / 2
  outer.material.side = THREE.DoubleSide
  root.add(outer)

  // 桶底
  const bottom = new THREE.Mesh(new THREE.CylinderGeometry(panR, panR, wall, 40), steelMat)
  bottom.position.y = wall / 2
  root.add(bottom)

  // 桶口加厚翻边
  const rim = new THREE.Mesh(new THREE.TorusGeometry(panR, 0.03, 10, 40), steelMat)
  rim.rotation.x = Math.PI / 2
  rim.position.y = panH
  root.add(rim)

  // ── 2. Structural：桶内水面 ──
  const waterH = 0.26
  const water = new THREE.Mesh(new THREE.CylinderGeometry(panR - wall, panR - wall, waterH, 40), waterMat)
  water.position.y = waterH / 2 + 0.02
  root.add(water)

  // ── 3. Form：桶底中心直管 + 测针座 + 水面指示针 ──
  const tubeH = 0.75
  const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, tubeH, 16), steelMat)
  tube.position.y = tubeH / 2
  root.add(tube)

  // 直管上端测针座
  const seat = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.08, 0.06, 20), darkMat)
  seat.position.y = tubeH + 0.03
  root.add(seat)

  // 水面指示针（细针，针尖指向水面）
  const needle = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.5, 10), steelMat)
  needle.position.y = tubeH - 0.25
  root.add(needle)
  const point = new THREE.Mesh(new THREE.ConeGeometry(0.012, 0.05, 10), steelMat)
  point.rotation.x = Math.PI
  point.position.y = tubeH - 0.52
  root.add(point)

  // ── 4. Surface：防溅/防鸟围圈（桶口外侧圆环围栏） ──
  const guardR = panR + 0.22
  const guard = new THREE.Mesh(new THREE.TorusGeometry(guardR, 0.015, 8, 44), steelMat)
  guard.rotation.x = Math.PI / 2
  guard.position.y = panH + 0.12
  root.add(guard)
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.24, 8), steelMat)
    post.position.set(Math.cos(a) * guardR, panH + 0.0, Math.sin(a) * guardR)
    root.add(post)
  }

  // 旁侧小型雨量器（直筒）
  const rainG = new THREE.Group()
  const rc = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.3, 20), steelMat)
  rc.position.y = 0.15
  rainG.add(rc)
  const rfunnel = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.09, 0.06, 20), steelMat)
  rfunnel.position.y = 0.33
  rainG.add(rfunnel)
  rainG.position.set(panR + 0.75, 0, 0.2)
  root.add(rainG)

  // ── 7. Interaction：水面轻微波动 ──
  root.userData.tick = (_delta: number) => {
    const t = performance.now() / 1000
    water.position.y = waterH / 2 + 0.02 + Math.sin(t * 0.8) * 0.004
  }

  return root
}
