/**
 * 蒸发观测设备（E-601B 型蒸发站 / Sunken Evaporation Pan Station）
 *
 * 形态依据（参考图 public/equipment/evap.jpg 实拍重建）：
 *   - 埋地式布置：白色瓷砖圆形坑池，坑沿略高出草面，坑底铺砂砾
 *   - 中央白色蒸发桶（淡绿色水面），桶外一圈环形水槽（外围水圈，同为水面）
 *   - 桶沿立不锈钢测针支架，横臂伸至桶中心上方、带垂直指示针
 *   - 白色溢流管从桶侧通至坑壁，白色踏板跨坑沿便于观测
 *   - 已移除：方形控制箱、黑色小圆柱雨量器（仅保留圆形部分，整体缩放 0.5）
 *
 * 八阶段管线：Blockout → Structural → Form → Material → Surface → Lighting → Interaction → Optimization
 */
import * as THREE from 'three'

export function createEvaporationPan(): THREE.Group {
  const root = new THREE.Group()
  root.name = 'EvaporationPan'

  // 只保留圆形部分（坑池 + 蒸发桶 + 水圈），整体缩小一半。
  // 注意：缩放放在 inner 上，root 的 scale 会被 hover / 选中的放大逻辑覆盖。
  const inner = new THREE.Group()
  inner.scale.setScalar(0.5)

  // ── 材质 ──
  const tileMat = new THREE.MeshStandardMaterial({ color: 0xf3f4ef, roughness: 0.32, metalness: 0.02 })
  const gravelMat = new THREE.MeshStandardMaterial({ color: 0xc2ab84, roughness: 1, metalness: 0 })
  const panMat = new THREE.MeshStandardMaterial({ color: 0xe9ecea, roughness: 0.42, metalness: 0.05 })
  const waterMat = new THREE.MeshStandardMaterial({
    color: 0x9fbfa2, roughness: 0.12, metalness: 0.1, transparent: true, opacity: 0.85,
  })
  const steelMat = new THREE.MeshStandardMaterial({ color: 0xb9c2c8, roughness: 0.3, metalness: 0.7 })
  const pipeMat = new THREE.MeshStandardMaterial({ color: 0xdfe2df, roughness: 0.5, metalness: 0.1 })

  // ── 尺寸（参考实拍比例） ──
  const OUTER_R = 2.0   // 瓷砖坑外半径
  const WALL_T = 0.16   // 坑壁厚
  const WALL_H = 0.3    // 坑沿高出草面
  const INNER_R = OUTER_R - WALL_T

  // ── 1. Blockout：白色瓷砖环形坑壁 + 平顶坑沿 ──
  const wall = new THREE.Mesh(
    new THREE.CylinderGeometry(OUTER_R, OUTER_R, WALL_H, 48, 1, true),
    tileMat,
  )
  wall.material.side = THREE.DoubleSide
  wall.position.y = WALL_H / 2
  inner.add(wall)

  const rimTop = new THREE.Mesh(new THREE.RingGeometry(INNER_R, OUTER_R + 0.02, 48), tileMat)
  rimTop.rotation.x = -Math.PI / 2
  rimTop.position.y = WALL_H
  inner.add(rimTop)

  // ── 2. Structural：坑底砂砾面 ──
  const gravel = new THREE.Mesh(new THREE.CircleGeometry(INNER_R, 48), gravelMat)
  gravel.rotation.x = -Math.PI / 2
  gravel.position.y = 0.04
  inner.add(gravel)

  // 砾石散点（细小深色颗粒，增强质感；仅落在水圈外侧的砾石带上）
  const pebbleMat = new THREE.MeshStandardMaterial({ color: 0xa08a63, roughness: 1 })
  const pebbleGeo = new THREE.SphereGeometry(0.022, 6, 5)
  for (let i = 0; i < 90; i++) {
    const a = Math.random() * Math.PI * 2
    const r = 1.56 + Math.random() * 0.24
    const pebble = new THREE.Mesh(pebbleGeo, pebbleMat)
    pebble.position.set(Math.cos(a) * r, 0.05, Math.sin(a) * r)
    pebble.scale.setScalar(0.6 + Math.random() * 0.9)
    inner.add(pebble)
  }

  // ── 3. Form：环形水槽（外围水圈，紧贴中央蒸发桶） ──
  const RING_OUT = 1.52, RING_IN = 0.66, RING_H = 0.2
  const ringFloor = new THREE.Mesh(new THREE.RingGeometry(RING_IN, RING_OUT, 48), panMat)
  ringFloor.rotation.x = -Math.PI / 2
  ringFloor.position.y = 0.06
  inner.add(ringFloor)
  for (const rr of [RING_IN, RING_OUT]) {
    const w = new THREE.Mesh(new THREE.CylinderGeometry(rr, rr, RING_H, 48, 1, true), panMat)
    w.material.side = THREE.DoubleSide
    w.position.y = 0.06 + RING_H / 2
    inner.add(w)
  }
  // 水圈水面
  const ringWater = new THREE.Mesh(new THREE.RingGeometry(RING_IN + 0.02, RING_OUT - 0.02, 48), waterMat)
  ringWater.rotation.x = -Math.PI / 2
  ringWater.position.y = 0.06 + RING_H - 0.04
  inner.add(ringWater)

  // ── 4. Form：中央蒸发桶 ──
  const PAN_R = 0.62, PAN_H = 0.44, PAN_BASE = 0.05
  const panWall = new THREE.Mesh(
    new THREE.CylinderGeometry(PAN_R, PAN_R, PAN_H, 40, 1, true),
    panMat,
  )
  panWall.material.side = THREE.DoubleSide
  panWall.position.y = PAN_BASE + PAN_H / 2
  inner.add(panWall)
  const panBottom = new THREE.Mesh(new THREE.CylinderGeometry(PAN_R, PAN_R, 0.03, 40), panMat)
  panBottom.position.y = PAN_BASE + 0.015
  inner.add(panBottom)
  const panRim = new THREE.Mesh(new THREE.TorusGeometry(PAN_R, 0.018, 10, 40), panMat)
  panRim.rotation.x = Math.PI / 2
  panRim.position.y = PAN_BASE + PAN_H
  inner.add(panRim)
  // 桶内水面（略低于桶口）
  const panWater = new THREE.Mesh(new THREE.CircleGeometry(PAN_R - 0.03, 40), waterMat)
  panWater.rotation.x = -Math.PI / 2
  panWater.position.y = PAN_BASE + PAN_H - 0.08
  inner.add(panWater)

  // ── 5. Form：测针支架（不锈钢，立于桶沿，横臂至桶中心上方） ──
  const postX = PAN_R - 0.02
  const postH = 0.5
  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, postH, 12), steelMat)
  post.position.set(postX, PAN_BASE + PAN_H + postH / 2, 0)
  inner.add(post)
  const armLen = PAN_R
  const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, armLen, 10), steelMat)
  arm.rotation.z = Math.PI / 2
  arm.position.set(postX - armLen / 2, PAN_BASE + PAN_H + postH, 0)
  inner.add(arm)
  // 垂直指示针（针尖指向水面）
  const needleLen = 0.34
  const needle = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, needleLen, 8), steelMat)
  needle.position.set(0, PAN_BASE + PAN_H + postH - needleLen / 2, 0)
  inner.add(needle)
  const tip = new THREE.Mesh(new THREE.ConeGeometry(0.01, 0.04, 10), steelMat)
  tip.rotation.x = Math.PI
  tip.position.set(0, PAN_BASE + PAN_H + postH - needleLen - 0.02, 0)
  inner.add(tip)

  // ── 6. Surface：溢流管（桶侧 → 坑壁）＋ 跨坑踏板 ──
  const pipeLen = INNER_R - PAN_R + 0.05
  const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.038, 0.038, pipeLen, 14), pipeMat)
  pipe.rotation.z = Math.PI / 2
  pipe.position.set(PAN_R + pipeLen / 2 - 0.02, PAN_BASE + PAN_H - 0.1, 0.3)
  inner.add(pipe)
  const drop = new THREE.Mesh(new THREE.CylinderGeometry(0.038, 0.038, 0.22, 14), pipeMat)
  drop.position.set(INNER_R - 0.05, PAN_BASE + PAN_H - 0.21, 0.3)
  inner.add(drop)

  const step = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.06, 0.2), tileMat)
  step.position.set(OUTER_R - 0.02, WALL_H + 0.03, -0.55)
  inner.add(step)









  root.add(inner)

  // ── 8. Interaction：水面轻微波动 ──
  const waterBaseY = PAN_BASE + PAN_H - 0.08
  const ringBaseY = 0.06 + RING_H - 0.04
  root.userData.tick = (_delta: number) => {
    const t = performance.now() / 1000
    panWater.position.y = waterBaseY + Math.sin(t * 0.8) * 0.004
    ringWater.position.y = ringBaseY + Math.sin(t * 0.8 + 0.6) * 0.003
  }

  root.userData.labelHeight = 0.95
  return root
}