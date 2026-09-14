/**
 * Ka波段全固态毫米波测云仪（Ka-Band All-Solid-State Millimeter-Wave Cloud Radar）
 *
 * 参考图特征（蘑菇头造型）：
 *   - 蘑菇头雷达罩：半球形圆顶 + 宽大外翻裙边（像蘑菇伞盖）
 *   - 圆柱筒身（较矮），带蓝色文字标识 "HTMW / 华腾微波"
 *   - 底部脚架/轮子（非固定混凝土基座）
 *
 * 八阶段管线产出：
 *   Blockout → Structural → Form → Material → Surface → Lighting → Interaction → Optimization
 */
import * as THREE from 'three'

export function createCloudRadar(): THREE.Group {
  const root = new THREE.Group()
  root.name = 'CloudRadar'

  // ── 材质定义 ──
  const radomeMat = new THREE.MeshStandardMaterial({
    color: 0xf0f4f8, roughness: 0.5, metalness: 0.04,
  }) // 白色玻璃钢雷达罩（微哑光）
  const bodyMat = new THREE.MeshStandardMaterial({
    color: 0xf0f4f8, roughness: 0.35, metalness: 0.1,
  }) // 白色烤漆筒身
  const darkMat = new THREE.MeshStandardMaterial({
    color: 0x555555, roughness: 0.45, metalness: 0.35,
  }) // 深灰金属（法兰、脚架）
  const cableMat = new THREE.LineBasicMaterial({ color: 0x666666 }) // 钢缆

  // ── 1. 底部脚架/底座（参考图：四角轮式脚架） ──
  const footR = 0.42           // 脚架外接圆半径
  const footH = 0.22           // 脚架高度
  const legW = 0.05            // 腿宽

  for (let i = 0; i < 4; i++) {
    const angle = (i / 4) * Math.PI * 2 + Math.PI / 4
    const lx = Math.cos(angle) * footR
    const lz = Math.sin(angle) * footR
    // 腿
    const leg = new THREE.Mesh(
      new THREE.BoxGeometry(legW, footH, legW),
      darkMat,
    )
    leg.position.set(lx, footH / 2, lz)
    root.add(leg)
    // 轮子（小圆柱）
    const wheel = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.04, 0.03, 12),
      new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.6, metalness: 0.3 }),
    )
    wheel.rotation.x = Math.PI / 2
    wheel.position.set(lx, 0.03, lz + legW * 0.6)
    root.add(wheel)
  }

  // 底板（连接四腿的方形板）
  const basePlate = new THREE.Mesh(
    new THREE.BoxGeometry(0.7, 0.04, 0.7),
    bodyMat,
  )
  basePlate.position.y = footH
  root.add(basePlate)

  // ── 2. 圆柱筒身（较矮） ──
  const bodyRadius = 0.35
  const bodyH = 0.75

  const body = new THREE.Mesh(
    new THREE.CylinderGeometry(bodyRadius, bodyRadius * 1.05, bodyH, 28),
    bodyMat,
  )
  body.position.y = footH + 0.02 + bodyH / 2
  root.add(body)

  const bodyTopY = footH + 0.02 + bodyH

  // 筒身顶部法兰盘（连接雷达罩）
  const flange = new THREE.Mesh(
    new THREE.CylinderGeometry(bodyRadius + 0.08, bodyRadius + 0.06, 0.06, 28),
    darkMat,
  )
  flange.position.y = bodyTopY + 0.03
  root.add(flange)

  // ── 3. 蘑菇头雷达罩（核心特征！） ──
  // 参考图：半球形圆顶 + 非常宽的外翻裙边，整体像蘑菇
  const domeR = 0.38              // 半球半径
  const skirtMaxR = 1.1           // 裙边最大外延半径
  const skirtW = 0.72             // 裙边水平宽度
  const domeCenterY = bodyTopY + 0.06 + domeR  // 半球球心 Y

  // 3a. 半球形圆顶（SphereGeometry，取上半球）
  const domeGeo = new THREE.SphereGeometry(domeR, 36, 18, 0, Math.PI * 2, 0, Math.PI / 2)
  const dome = new THREE.Mesh(domeGeo, radomeMat)
  dome.position.y = domeCenterY
  root.add(dome)

  // 3b. 外翻裙边（LatheGeometry 旋转轮廓——从半球底部向外翻卷）
  // 轮廓点：(r, y) 从半球底边开始向外下翻
  const skirtPoints: [number, number][] = []
  const skirtSegments = 20
  for (let i = 0; i <= skirtSegments; i++) {
    const t = i / skirtSegments
    // 从半球底边 (domeR, domeCenterY) 开始，向外向下翻卷
    const r = domeR + t * skirtW
    // Y 先平缓下降再微微上翘（模拟翻边厚度）
    const y = domeCenterY - t * t * 0.12
    skirtPoints.push([r, y])
  }
  // 用 LatheGeometry 生成旋转体
  const skirtShape = new THREE.Shape()
  skirtPoints.forEach((p, i) => {
    if (i === 0) skirtShape.moveTo(p[0], p[1])
    else skirtShape.lineTo(p[0], p[1])
  })
  const skirtGeo = new THREE.LatheGeometry(
    skirtPoints.map((p) => new THREE.Vector2(p[0], p[1] - domeCenterY)),
    36,
  )
  const skirt = new THREE.Mesh(skirtGeo, radomeMat)
  skirt.position.y = domeCenterY
  root.add(skirt)

  // 3c. 裙边底沿（Torus 增加厚度感）
  const skirtEdge = new THREE.Mesh(
    new THREE.TorusGeometry(skirtMaxR, 0.025, 10, 36),
    radomeMat,
  )
  skirtEdge.rotation.x = Math.PI / 2
  skirtEdge.position.y = domeCenterY - 0.12
  root.add(skirtEdge)

  // ── 4. 表面细节 ──
  // 筒身蓝色标识区域（模拟"HTMW 华腾微波"文字带）
  const labelBand = new THREE.Mesh(
    new THREE.CylinderGeometry(bodyRadius + 0.004, bodyRadius + 0.004, 0.22, 28),
    new THREE.MeshStandardMaterial({ color: 0x1a5276, roughness: 0.35, metalness: 0.15 }),
  )
  labelBand.position.y = footH + 0.02 + bodyH * 0.55
  root.add(labelBand)

  // 接线盒（筒身下部小凸起）
  const jbox = new THREE.Mesh(
    new THREE.BoxGeometry(0.14, 0.08, 0.1),
    darkMat,
  )
  jbox.position.set(0, footH + 0.08, bodyRadius * 0.75)
  root.add(jbox)

  // ── 5. 斜拉钢缆（从法兰向四个方向拉到地面） ──
  const cableAttachY = bodyTopY + 0.05
  const cableGroundR = 1.7

  for (let i = 0; i < 4; i++) {
    const angle = (i / 4) * Math.PI * 2 + Math.PI / 4
    const gx = Math.cos(angle) * cableGroundR
    const gz = Math.sin(angle) * cableGroundR

    const pts = [
      new THREE.Vector3(0, cableAttachY, 0),
      new THREE.Vector3(gx, 0, gz),
    ]
    const cableGeo = new THREE.BufferGeometry().setFromPoints(pts)
    root.add(new THREE.Line(cableGeo, cableMat))

    // 锚块
    const anchor = new THREE.Mesh(
      new THREE.BoxGeometry(0.2, 0.05, 0.16),
      new THREE.MeshStandardMaterial({ color: 0x888888, roughness: 0.85, metalness: 0.05 }),
    )
    anchor.position.set(gx, 0.025, gz)
    root.add(anchor)
  }

  // ── 高度汇总 ──
  // 脚架: 0 ~ 0.22m
  // 底板: 0.22 ~ 0.26m
  // 筒身: 0.26 ~ 1.01m
  // 法兰: 1.01 ~ 1.07m
  // 半球圆顶中心: 1.07 + 0.38 = 1.45m
  // 圆顶最高点: 1.45 + 0.38 = 1.83m
  // 裙边最宽处 R=1.1m
  // 总高 ≈ 1.85m

  return root
}
