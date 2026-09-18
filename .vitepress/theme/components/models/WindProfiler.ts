/**
 * 风廓线雷达（Wind Profiler Radar，边界层相控阵 + RASS 声学阵列）
 *
 * 形态依据（参考图 public/equipment/windprofiler.png 实拍航拍重建）：
 *   - 正方形白色网围栏场地，顶部栏杆呈花瓣状内弯弧线
 *   - 场地四角各一座白色圆柱形声学塔（RASS 声阵列），
 *     塔顶一圈黑色锯齿状尖齿冠
 *   - 场地中央：大型白色方形相控阵天线（顶面布满天线单元栅格），
 *     由短腿架空
 *   - 场地一角配电机柜
 *
 * 八阶段管线：Blockout → Structural → Form → Material → Surface → Lighting → Interaction → Optimization
 */
import * as THREE from 'three'

export function createWindProfiler(): THREE.Group {
  const root = new THREE.Group()
  root.name = 'WindProfiler'

  // ── 材质 ──
  const whiteMat = new THREE.MeshStandardMaterial({ color: 0xf0f3f5, roughness: 0.5, metalness: 0.15 })
  const frameMat = new THREE.MeshStandardMaterial({ color: 0xd6dde1, roughness: 0.45, metalness: 0.35 })
  const meshMat = new THREE.MeshStandardMaterial({
    color: 0xffffff, roughness: 0.6, metalness: 0.1,
    transparent: true, opacity: 0.28, side: THREE.DoubleSide, depthWrite: false,
  })
  const darkMat = new THREE.MeshStandardMaterial({ color: 0x2f343a, roughness: 0.6, metalness: 0.25 })
  const elemMat = new THREE.MeshStandardMaterial({ color: 0xc8d0d6, roughness: 0.5, metalness: 0.3 })
  const concreteMat = new THREE.MeshStandardMaterial({ color: 0xcfcac0, roughness: 0.95, metalness: 0 })

  const HALF = 4.2            // 围栏半边长 → 场地 8.4m × 8.4m
  const FENCE_H = 2.1         // 围栏直段高度
  const TOP_H = 0.85          // 顶部内弯段高度

  // ── 1. Blockout：水泥场地台 ──
  const slab = new THREE.Mesh(new THREE.BoxGeometry(HALF * 2 + 0.6, 0.12, HALF * 2 + 0.6), concreteMat)
  slab.position.y = 0.06
  root.add(slab)

  // ── 2. Structural：方形网围栏（四侧，顶部内弯花瓣状） ──
  for (let k = 0; k < 4; k++) {
    const side = new THREE.Group()
    side.rotation.y = (k * Math.PI) / 2
    // 下段网面
    const lower = new THREE.Mesh(new THREE.PlaneGeometry(HALF * 2, FENCE_H), meshMat)
    lower.position.set(0, FENCE_H / 2 + 0.12, HALF)
    side.add(lower)
    // 上下横栏
    const railGeo = new THREE.CylinderGeometry(0.03, 0.03, HALF * 2, 10)
    for (const ry of [0.18, FENCE_H + 0.05]) {
      const rail = new THREE.Mesh(railGeo, whiteMat)
      rail.rotation.x = Math.PI / 2
      rail.position.set(0, ry, HALF)
      side.add(rail)
    }
    // 顶部内弯弧形栏（花瓣状：角部高、边中低、并向内收）
    const curvePts = [
      new THREE.Vector3(-HALF, FENCE_H + TOP_H, HALF),
      new THREE.Vector3(-HALF * 0.55, FENCE_H + TOP_H * 0.62, HALF - 0.22),
      new THREE.Vector3(0, FENCE_H + TOP_H * 0.42, HALF - 0.42),
      new THREE.Vector3(HALF * 0.55, FENCE_H + TOP_H * 0.62, HALF - 0.22),
      new THREE.Vector3(HALF, FENCE_H + TOP_H, HALF),
    ]
    const topRail = new THREE.Mesh(
      new THREE.TubeGeometry(new THREE.CatmullRomCurve3(curvePts), 32, 0.035, 8, false),
      whiteMat,
    )
    side.add(topRail)
    // 上段倾斜网面（连接直段顶与弧形栏）
    const upper = new THREE.Mesh(new THREE.PlaneGeometry(HALF * 2, TOP_H + 0.35), meshMat)
    upper.position.set(0, FENCE_H + (TOP_H + 0.35) / 2 - 0.02, HALF - 0.16)
    upper.rotation.x = -0.32
    side.add(upper)
    // 竖栏柱（角柱在围栏转角处单独加）
    for (let p = -2; p <= 2; p++) {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, FENCE_H + 0.12, 10), whiteMat)
      post.position.set(p * HALF / 2.5, (FENCE_H + 0.12) / 2 + 0.06, HALF)
      if (Math.abs(p) === 2) continue // 角部由角柱承担
      side.add(post)
    }
    root.add(side)
  }
  // 四根高角柱
  for (const sx of [-1, 1]) {
    for (const sz of [-1, 1]) {
      const corner = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, FENCE_H + TOP_H + 0.1, 12), whiteMat)
      corner.position.set(sx * HALF, (FENCE_H + TOP_H + 0.1) / 2 + 0.06, sz * HALF)
      root.add(corner)
    }
  }

  // ── 3. Form：四角声学塔（白圆柱 + 黑色锯齿尖齿冠） ──
  const towerIn = HALF - 1.05
  for (const sx of [-1, 1]) {
    for (const sz of [-1, 1]) {
      const t = new THREE.Group()
      t.position.set(sx * towerIn, 0.12, sz * towerIn)
      const body = new THREE.Mesh(new THREE.CylinderGeometry(0.52, 0.56, 1.45, 22), whiteMat)
      body.position.y = 0.725
      t.add(body)
      // 塔顶托圈
      const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.56, 0.1, 22), frameMat)
      collar.position.y = 1.5
      t.add(collar)
      // 黑色锯齿尖齿冠（一圈三角尖齿，微微外倾）
      const teeth = 10
      for (let i = 0; i < teeth; i++) {
        const a = (i / teeth) * Math.PI * 2
        const tooth = new THREE.Mesh(new THREE.ConeGeometry(0.13, 0.34, 4), darkMat)
        tooth.position.set(Math.cos(a) * 0.48, 1.72, Math.sin(a) * 0.48)
        tooth.rotation.y = -a
        tooth.rotation.x = Math.sin(a) * 0.18
        tooth.rotation.z = -Math.cos(a) * 0.18
        t.add(tooth)
      }
      // 中心小圆顶
      const dome = new THREE.Mesh(new THREE.SphereGeometry(0.16, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2), whiteMat)
      dome.position.y = 1.55
      t.add(dome)
      root.add(t)
    }
  }

  // ── 4. Form：中央大型相控阵天线（顶面天线单元栅格） ──
  const A = 4.4, AT = 0.55
  const arrayGroup = new THREE.Group()
  arrayGroup.position.y = 0.12
  arrayGroup.rotation.y = Math.PI / 4 * 0  // 阵面朝向与场地一致
  // 承重短腿
  const legOff = A / 2 - 0.35
  for (const lx of [-legOff, 0, legOff]) {
    for (const lz of [-legOff, legOff]) {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.07, 0.62, 12), frameMat)
      leg.position.set(lx, 0.31, lz)
      arrayGroup.add(leg)
    }
  }
  // 天线箱体
  const box = new THREE.Mesh(new THREE.BoxGeometry(A, AT, A), whiteMat)
  box.position.y = 0.62 + AT / 2
  arrayGroup.add(box)
  // 顶面外沿挡边
  const rimH = 0.08
  for (const [rx, rz, rw, rd] of [
    [0, A / 2 - 0.05, A, 0.1], [0, -A / 2 + 0.05, A, 0.1],
    [A / 2 - 0.05, 0, 0.1, A], [-A / 2 + 0.05, 0, 0.1, A],
  ]) {
    const rim = new THREE.Mesh(new THREE.BoxGeometry(rw, rimH, rd), frameMat)
    rim.position.set(rx, 0.62 + AT + rimH / 2, rz)
    arrayGroup.add(rim)
  }
  // 顶面天线单元栅格（细密方阵，随机微差更真实）
  const N = 13, step = (A - 0.3) / N
  for (let i = 0; i < N; i++) {
    for (let j = 0; j < N; j++) {
      const el = new THREE.Mesh(new THREE.CylinderGeometry(step * 0.3, step * 0.3, 0.07, 8), elemMat)
      el.position.set(
        -A / 2 + 0.15 + step / 2 + i * step,
        0.62 + AT + 0.035,
        -A / 2 + 0.15 + step / 2 + j * step,
      )
      arrayGroup.add(el)
    }
  }
  root.add(arrayGroup)

  // ── 5. Surface：场内一角设备机柜 ──
  const cab = new THREE.Mesh(new THREE.BoxGeometry(0.7, 1.15, 0.5), whiteMat)
  cab.position.set(towerIn - 0.4, 0.12 + 0.575, -towerIn + 0.9)
  root.add(cab)
  const cabDoor = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.95, 0.38), frameMat)
  cabDoor.position.set(cab.position.x - 0.36, cab.position.y, cab.position.z)
  root.add(cabDoor)

  root.userData.labelHeight = 3.4
  return root
}
