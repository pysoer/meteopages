/**
 * 前向散射式能见度仪（Forward Scattering Visibility Sensor）
 *
 * 参考图特征：
 *   - 双筒 V 形传感器头：两根白色圆柱筒向外前方倾斜（像张开的翅膀）
 *   - 圆柱末端有黑色镜头开口
 *   - 中央白色矩形接线盒（四角可见螺钉）
 *   - 下方 3m 白色立柱
 *
 * 八阶段管线产出：
 *   Blockout → Structural → Form → Material → Surface → Lighting → Interaction → Optimization
 */
import * as THREE from 'three'

export function createVisibilitySensor(): THREE.Group {
  const root = new THREE.Group()
  root.name = 'VisibilitySensor'

  // ── 材质定义 ──
  const whiteMat = new THREE.MeshStandardMaterial({
    color: 0xf0f4f8, roughness: 0.4, metalness: 0.08,
  }) // 白色烤漆（传感器头、接线盒、立柱）
  const blackMat = new THREE.MeshStandardMaterial({
    color: 0x111111, roughness: 0.2, metalness: 0.5,
  }) // 黑色镜头内部
  const screwMat = new THREE.MeshStandardMaterial({
    color: 0x888888, roughness: 0.35, metalness: 0.7,
  }) // 不锈钢螺钉

  // ── 1. 立柱（3m 高） ──
  const poleH = 3.0
  const poleW = 0.08   // 方柱宽度
  const pole = new THREE.Mesh(
    new THREE.BoxGeometry(poleW, poleH, poleW),
    whiteMat,
  )
  pole.position.y = poleH / 2
  root.add(pole)

  // ── 2. 接线盒（立柱顶部） ──
  const boxW = 0.22, boxD = 0.14, boxH = 0.10
  const junctionBox = new THREE.Mesh(
    new THREE.BoxGeometry(boxW, boxH, boxD),
    whiteMat,
  )
  junctionBox.position.y = poleH + boxH / 2
  root.add(junctionBox)

  const boxTopY = poleH + boxH

  // 四角螺钉（贴盒顶面）
  const screwR = 0.008
  const screwPos: [number, number][] = [
    [-boxW / 2 + 0.03, boxD / 2 - 0.025],
    [boxW / 2 - 0.03, boxD / 2 - 0.025],
    [-boxW / 2 + 0.03, -boxD / 2 + 0.025],
    [boxW / 2 - 0.03, -boxD / 2 + 0.025],
  ]
  for (const [sx, sz] of screwPos) {
    const screw = new THREE.Mesh(
      new THREE.CylinderGeometry(screwR, screwR, 0.012, 8),
      screwMat,
    )
    screw.position.set(sx, boxTopY + 0.006, sz)
    root.add(screw)
  }

  // ── 3. 双筒传感器头（V 形张开） ──
  // 参考图：两根白色圆柱从接线盒两侧向外前方倾斜，呈 V 字形（均朝前 +Z）
  const tubeLen = 0.45       // 圆柱筒长度
  const tubeR = 0.055        // 圆柱筒半径
  const armLen = 0.16        // 横臂长度（盒中心 → 筒根部）
  const spread = 0.55        // 水平张开角（绕 Y）
  const droop = 0.14         // 向下倾角（绕 X）

  const yMid = boxTopY + boxH / 2  // 臂/头中心高度

  for (const side of [-1, 1]) {
    const armEndX = side * (armLen + boxW / 2)

    // 横臂（水平圆柱，沿 X）
    const arm = new THREE.Mesh(
      new THREE.CylinderGeometry(0.025, 0.025, armLen, 10),
      whiteMat,
    )
    arm.rotation.z = Math.PI / 2
    arm.position.set(side * (armLen / 2 + boxW / 2), yMid, 0)
    root.add(arm)

    // 头 pivot：置于横臂外端正端，先绕 Y 张开、再绕 X 下倾
    // 注意 order='YXZ'：先张开后下倾，确保两筒都朝前(+Z)对称张开
    const headPivot = new THREE.Group()
    headPivot.position.set(armEndX, yMid, 0)
    headPivot.rotation.order = 'YXZ'
    headPivot.rotation.y = -side * spread   // 两筒均朝前(+Z)，向 ±X 对称张开
    headPivot.rotation.x = droop            // 略微下倾
    root.add(headPivot)

    // 传感器筒：沿 +X 轴（先旋转 z=PI/2 使圆柱轴从 Y 转到 X），内端落在 headPivot 原点 → 与横臂相接
    const tube = new THREE.Mesh(
      new THREE.CylinderGeometry(tubeR, tubeR * 1.08, tubeLen, 16),
      whiteMat,
    )
    tube.rotation.z = Math.PI / 2
    tube.position.x = side * tubeLen / 2
    headPivot.add(tube)

    // 黑色镜头（筒的远端 +X 端）
    const lens = new THREE.Mesh(
      new THREE.CircleGeometry(tubeR * 0.82, 16),
      blackMat,
    )
    lens.position.x = side * (tubeLen / 2 + 0.002)
    lens.rotation.y = side * Math.PI / 2   // 法线朝外侧
    tube.add(lens)

    // 端盖环（筒远端白色环）
    const endCap = new THREE.Mesh(
      new THREE.TorusGeometry(tubeR + 0.006, 0.006, 8, 20),
      whiteMat,
    )
    endCap.position.x = side * (tubeLen / 2 + 0.002)
    endCap.rotation.y = Math.PI / 2
    tube.add(endCap)
  }

  // ── 高度汇总 ──
  // 立柱: 0 ~ 3.0m
  // 接线盒: 3.0 ~ 3.1m
  // 传感器头最高点: ~3.35m（含倾斜）
  // 总高 ≈ 3.35m

  return root
}
