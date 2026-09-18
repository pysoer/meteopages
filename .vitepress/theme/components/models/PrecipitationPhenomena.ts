/**
 * 降水现象仪（Precipitation Phenomenon Sensor，激光雨滴谱 / 粒子图谱）
 *
 * 形态依据（参考图 public/equipment/precip.jpg —— WUSH-FPW 型实拍重建）：
 *   - 白色立式机柜架在短支架上（底板 + 方形立柱基座）
 *   - 柜顶黑色短立柱，顶端分叉成 V 形叉臂
 *   - 两臂各托一个水平黑色圆筒光学头，端口相对、中间留开放采样缝
 *   - 机柜正面标签带
 *
 * 八阶段管线：Blockout → Structural → Form → Material → Surface → Lighting → Interaction → Optimization
 */
import * as THREE from 'three'

export function createPrecipitationPhenomena(): THREE.Group {
  const root = new THREE.Group()
  root.name = 'PrecipitationPhenomena'

  // ── 材质 ──
  const whiteMat = new THREE.MeshStandardMaterial({ color: 0xf0f3f5, roughness: 0.45, metalness: 0.15 })
  const metalMat = new THREE.MeshStandardMaterial({ color: 0xb8c0c6, roughness: 0.4, metalness: 0.6 })
  const blackMat = new THREE.MeshStandardMaterial({ color: 0x1c1f22, roughness: 0.5, metalness: 0.35 })
  const darkMat = new THREE.MeshStandardMaterial({ color: 0x33383d, roughness: 0.55, metalness: 0.3 })

  // ── 1. Blockout：底板 + 支架基座 ──
  const plate = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.05, 0.5), whiteMat)
  plate.position.y = 0.025
  root.add(plate)
  for (const sx of [-1, 1]) {
    for (const sz of [-1, 1]) {
      const bolt = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.05, 8), metalMat)
      bolt.position.set(sx * 0.18, 0.07, sz * 0.18)
      root.add(bolt)
    }
  }
  const pedestal = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.55, 0.26), whiteMat)
  pedestal.position.y = 0.05 + 0.275
  root.add(pedestal)

  // ── 2. Structural：白色机柜（0.6m → 1.35m） ──
  const cabW = 0.55, cabH = 0.75, cabD = 0.42
  const cabY = 0.6 + cabH / 2
  const cabinet = new THREE.Mesh(new THREE.BoxGeometry(cabW, cabH, cabD), whiteMat)
  cabinet.position.y = cabY
  root.add(cabinet)
  const lip = new THREE.Mesh(new THREE.BoxGeometry(cabW + 0.04, 0.03, cabD + 0.04), whiteMat)
  lip.position.y = 0.6 + cabH + 0.015
  root.add(lip)
  // 正面标签带（简化文字）
  const label = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.06, 0.008), darkMat)
  label.position.set(0, cabY + 0.16, cabD / 2 + 0.005)
  root.add(label)
  const dot = new THREE.Mesh(new THREE.CircleGeometry(0.035, 16), new THREE.MeshStandardMaterial({ color: 0x2456a8, roughness: 0.4 }))
  dot.position.set(-0.13, cabY - 0.05, cabD / 2 + 0.006)
  root.add(dot)
  // 柜门缝
  const seam = new THREE.Mesh(new THREE.BoxGeometry(0.006, cabH - 0.1, 0.008), darkMat)
  seam.position.set(0, cabY, cabD / 2 + 0.004)
  root.add(seam)

  // ── 3. Form：柜顶黑色短立柱 ──
  const mastBot = 0.6 + cabH + 0.03
  const mastTop = mastBot + 0.42
  const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, mastTop - mastBot, 14), blackMat)
  mast.position.y = (mastBot + mastTop) / 2
  root.add(mast)

  // ── 4. Form：V 形叉臂（黑色） ──
  const yokeTopY = mastTop + 0.26
  const yokeSpread = 0.3
  for (const sign of [-1, 1]) {
    const dx = sign * yokeSpread, dy = yokeTopY - mastTop
    const len = Math.hypot(dx, dy)
    const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.028, len, 12), blackMat)
    // 中点 + 倾斜（绕 Z 轴）
    arm.position.set(sign * yokeSpread / 2, (mastTop + yokeTopY) / 2, 0)
    arm.rotation.z = -Math.atan2(dx, dy)
    root.add(arm)
  }

  // ── 5. Form：两个水平对射的黑色圆筒光学头 ──
  const headR = 0.08, headL = 0.44
  const headX = 0.34                     // 筒中心距中轴
  const headY = yokeTopY - 0.04
  for (const sign of [-1, 1]) {
    const head = new THREE.Mesh(new THREE.CylinderGeometry(headR, headR, headL, 22), blackMat)
    head.rotation.z = Math.PI / 2
    head.position.set(sign * headX, headY, 0)
    root.add(head)
    // 内端面（发射/接收窗，深灰环）
    const ring = new THREE.Mesh(new THREE.TorusGeometry(headR - 0.015, 0.012, 8, 22), darkMat)
    ring.rotation.y = Math.PI / 2
    ring.position.set(sign * (headX - headL / 2 - 0.005), headY, 0)
    root.add(ring)
    const lens = new THREE.Mesh(
      new THREE.CircleGeometry(headR - 0.02, 18),
      new THREE.MeshStandardMaterial({ color: 0x35424e, roughness: 0.15, metalness: 0.5 }),
    )
    lens.rotation.y = sign * -Math.PI / 2
    lens.position.set(sign * (headX - headL / 2), headY, 0)
    root.add(lens)
    // 筒尾端盖
    const tail = new THREE.Mesh(new THREE.CylinderGeometry(headR + 0.008, headR + 0.008, 0.02, 22), darkMat)
    tail.rotation.z = Math.PI / 2
    tail.position.set(sign * (headX + headL / 2), headY, 0)
    root.add(tail)
  }

  // ── 6. Interaction：开放采样缝内的激光光带（微弱呼吸） ──
  const beamPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(2 * (headX - headL / 2) - 0.02, headR * 1.4),
    new THREE.MeshBasicMaterial({
      color: 0xff5a5a, transparent: true, opacity: 0.1, side: THREE.DoubleSide, depthWrite: false,
    }),
  )
  beamPlane.rotation.y = Math.PI / 2
  beamPlane.position.y = headY
  root.add(beamPlane)

  // ── 7. Surface：电缆（柜底 → 地面） ──
  const cablePts = [
    new THREE.Vector3(0.1, 0.62, 0.18),
    new THREE.Vector3(0.16, 0.3, 0.24),
    new THREE.Vector3(0.2, 0.04, 0.26),
  ]
  const cable = new THREE.Mesh(
    new THREE.TubeGeometry(new THREE.CatmullRomCurve3(cablePts), 14, 0.01, 8, false),
    new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.8 }),
  )
  root.add(cable)

  root.userData.tick = (_delta: number) => {
    const t = performance.now() / 1000
    const m = beamPlane.material as THREE.MeshBasicMaterial
    m.opacity = 0.06 + Math.abs(Math.sin(t * 1.6)) * 0.08
  }

  // 总高 ≈ 2.55m（光学头中心 ~2.1m）
  root.userData.labelHeight = 2.7
  return root
}
