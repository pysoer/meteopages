/**
 * Ka波段全固态毫米波测云仪（Ka-Band All-Solid-State Millimeter-Wave Cloud Radar）
 *
 * 形态依据（参考图 public/equipment/cloudradar.png 实拍重建）：
 *   - 高大混凝土方墩基座，白色圆筒身坐在墩顶（下部灰色环带）
 *   - 筒顶檐下鼓形段（竖向棱条装饰）
 *   - 宽大外翻环形平檐 + 其上的锥形天线罩（蘑菇伞盖，核心特征）
 *   - 檐下 4 根斜拉钢缆 → 地面白色方形锚块
 *   - 筒身正面接线盒，黑色电缆垂至墩顶并盘绕
 *
 * 八阶段管线：Blockout → Structural → Form → Material → Surface → Lighting → Interaction → Optimization
 */
import * as THREE from 'three'

export function createCloudRadar(): THREE.Group {
  const root = new THREE.Group()
  root.name = 'CloudRadar'

  // ── 材质定义 ──
  const whiteMat = new THREE.MeshStandardMaterial({ color: 0xf2f5f7, roughness: 0.45, metalness: 0.08 })
  const grayRingMat = new THREE.MeshStandardMaterial({ color: 0x8b939a, roughness: 0.5, metalness: 0.3 })
  const darkMat = new THREE.MeshStandardMaterial({ color: 0x3a4046, roughness: 0.55, metalness: 0.35 })
  const blueMat = new THREE.MeshStandardMaterial({ color: 0x1a5276, roughness: 0.4, metalness: 0.15 })
  const concreteMat = new THREE.MeshStandardMaterial({ color: 0xbdb7ab, roughness: 0.95, metalness: 0 })
  const anchorMat = new THREE.MeshStandardMaterial({ color: 0xe8e6e0, roughness: 0.85, metalness: 0 })
  const cableMat = new THREE.LineBasicMaterial({ color: 0x555555 })
  const blackCableMat = new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.85 })

  // ── 1. Blockout：混凝土方墩基座 + 地面矮圈 ──
  const plinthH = 0.62
  const plinth = new THREE.Mesh(new THREE.BoxGeometry(1.5, plinthH, 1.3), concreteMat)
  plinth.position.y = plinthH / 2
  root.add(plinth)
  const curb = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.09, 1.9), concreteMat)
  curb.position.y = 0.045
  root.add(curb)

  // ── 2. Structural：白色圆筒身（0.62m → 1.98m） ──
  const bodyR = 0.55
  const bodyBot = plinthH, bodyTop = 1.98
  const body = new THREE.Mesh(
    new THREE.CylinderGeometry(bodyR, bodyR * 1.05, bodyTop - bodyBot, 28),
    whiteMat,
  )
  body.position.y = (bodyTop + bodyBot) / 2
  root.add(body)

  // 筒身下部灰色环带
  const grayRing = new THREE.Mesh(
    new THREE.CylinderGeometry(bodyR * 1.05 + 0.015, bodyR * 1.05 + 0.02, 0.24, 28),
    grayRingMat,
  )
  grayRing.position.y = bodyBot + 0.12
  root.add(grayRing)

  // ── 3. Surface：圆形设备标志（白底蓝圈） ──
  const logoY = 1.45
  const logo = new THREE.Mesh(new THREE.CircleGeometry(0.11, 20), whiteMat)
  logo.position.set(0, logoY, bodyR * 1.03 + 0.005)
  root.add(logo)
  const logoRing = new THREE.Mesh(new THREE.TorusGeometry(0.11, 0.013, 8, 24), blueMat)
  logoRing.position.set(0, logoY, bodyR * 1.03 + 0.004)
  root.add(logoRing)
  // 设备名称蓝色细横带（示意 KA-BAND CLOUD RADAR 字样位置）
  const nameBand = new THREE.Mesh(new THREE.CylinderGeometry(bodyR + 0.012, bodyR + 0.012, 0.09, 28, 1, true), blueMat)
  nameBand.position.y = 1.68
  root.add(nameBand)

  // ── 4. Surface：接线盒 + 垂落盘绕的黑色电缆 ──
  const jbox = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.14, 0.1), darkMat)
  jbox.position.set(0.22, 0.92, bodyR * 1.02)
  root.add(jbox)
  const cableOut = new THREE.Mesh(
    new THREE.TubeGeometry(
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(0.26, 0.86, bodyR * 0.98),
        new THREE.Vector3(0.48, 0.68, 0.32),
        new THREE.Vector3(0.42, plinthH + 0.02, 0.18),
      ]),
      16, 0.02, 8, false,
    ),
    blackCableMat,
  )
  root.add(cableOut)
  // 墩顶盘绕电缆圈
  const coil = new THREE.Mesh(new THREE.TorusGeometry(0.14, 0.02, 8, 28), blackCableMat)
  coil.rotation.x = Math.PI / 2
  coil.position.set(0.3, plinthH + 0.03, 0.05)
  root.add(coil)

  // ── 5. Form：檐下鼓形段（竖向棱条装饰） ──
  const drumR = 0.64
  const drumH = 0.26
  const drumBot = bodyTop
  const drum = new THREE.Mesh(new THREE.CylinderGeometry(drumR, bodyR + 0.02, drumH, 28), whiteMat)
  drum.position.y = drumBot + drumH / 2
  root.add(drum)
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2
    const rib = new THREE.Mesh(new THREE.BoxGeometry(0.03, drumH * 0.85, 0.015), whiteMat)
    rib.position.set(Math.cos(a) * (drumR + 0.004), drumBot + drumH / 2, Math.sin(a) * (drumR + 0.004))
    rib.rotation.y = -a
    root.add(rib)
  }

  // ── 6. Form：宽大外翻环形平檐（蘑菇伞盖的帽檐） ──
  const brimY = drumBot + drumH
  const brimOuter = 1.2
  const brimPts: THREE.Vector2[] = [
    new THREE.Vector2(drumR + 0.02, 0.1),
    new THREE.Vector2(1.02, 0.1),
    new THREE.Vector2(brimOuter, 0.03),
    new THREE.Vector2(brimOuter + 0.015, -0.03),
    new THREE.Vector2(brimOuter - 0.02, -0.09),
    new THREE.Vector2(drumR + 0.02, -0.03),
  ]
  const brimMat = whiteMat.clone()
  brimMat.side = THREE.DoubleSide
  const brim = new THREE.Mesh(new THREE.LatheGeometry(brimPts, 44), brimMat)
  brim.position.y = brimY
  root.add(brim)

  // ── 7. Form：锥形天线罩（坐在宽檐上的钝锥顶，核心特征！） ──
  // Lathe 轮廓法线朝内，使用双面材质避免罩体呈暗色
  const coneMat = whiteMat.clone()
  coneMat.side = THREE.DoubleSide
  const coneBaseR = 0.86
  const coneH = 0.72
  const conePts: THREE.Vector2[] = []
  const CN = 18
  for (let i = 0; i <= CN; i++) {
    const t = i / CN
    conePts.push(new THREE.Vector2(coneBaseR * t, coneH * (1 - Math.pow(t, 1.15))))
  }
  const cone = new THREE.Mesh(new THREE.LatheGeometry(conePts, 44), coneMat)
  cone.position.y = brimY + 0.08
  root.add(cone)
  // 锥顶小圆头
  const coneCap = new THREE.Mesh(new THREE.SphereGeometry(0.045, 14, 10), whiteMat)
  coneCap.position.y = brimY + 0.08 + coneH
  root.add(coneCap)

  // ── 8. Surface：斜拉钢缆（檐下鼓形段 → 地面白色方形锚块）×4 ──
  const attachY = drumBot + drumH * 0.5
  const groundR = 1.75
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + Math.PI / 4
    const gx = Math.cos(a) * groundR
    const gz = Math.sin(a) * groundR
    const geo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(Math.cos(a) * drumR, attachY, Math.sin(a) * drumR),
      new THREE.Vector3(gx, 0.05, gz),
    ])
    root.add(new THREE.Line(geo, cableMat))
    const anchor = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.07, 0.38), anchorMat)
    anchor.position.set(gx, 0.035, gz)
    root.add(anchor)
  }

  // 高度汇总：基座 0~0.62 / 筒身 0.62~1.98 / 鼓段 1.98~2.24 / 檐 2.24~2.32 / 锥顶 → ≈3.05
  // 总高 ≈ 3.05m，伞檐最宽处直径 ≈ 2.43m
  root.userData.labelHeight = 3.4
  return root
}
