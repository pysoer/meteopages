/**
 * 闪电定位仪（Lightning Locator / Lightning Detection Sensor）
 *
 * 形态依据（参考图 public/equipment/lightning.jpg 实拍重建）：
 *   - 白色圆形底法兰 + 小混凝土基墩
 *   - 白色圆杆（整机总高约 1.8m，杆身约 0.86m）
 *   - 杆顶大号竖直胶囊形白色天线罩（甚低频/低频电磁脉冲天线），
 *     罩宽约 0.44m、高约 0.9m，罩面有竖向板缝
 *   - 一根电缆贴杆而下
 *
 * 八阶段管线：Blockout → Structural → Form → Material → Surface → Lighting → Interaction → Optimization
 */
import * as THREE from 'three'

export function createLightningLocator(): THREE.Group {
  const root = new THREE.Group()
  root.name = 'LightningLocator'

  // ── 材质 ──
  const whiteMat = new THREE.MeshStandardMaterial({ color: 0xf2f5f7, roughness: 0.45, metalness: 0.1 })
  const seamMat = new THREE.MeshStandardMaterial({ color: 0xdde3e7, roughness: 0.55, metalness: 0.08 })
  const metalMat = new THREE.MeshStandardMaterial({ color: 0xb8c0c6, roughness: 0.4, metalness: 0.6 })
  const concreteMat = new THREE.MeshStandardMaterial({ color: 0xcfcac0, roughness: 0.95, metalness: 0 })

  // ── 1. Blockout：混凝土小基墩 + 白色底法兰 ──
  const pad = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.34, 0.08, 24), concreteMat)
  pad.position.y = 0.04
  root.add(pad)
  const baseDisc = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.2, 0.05, 20), whiteMat)
  baseDisc.position.y = 0.105
  root.add(baseDisc)
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2
    const bolt = new THREE.Mesh(new THREE.CylinderGeometry(0.009, 0.009, 0.04, 8), metalMat)
    bolt.position.set(Math.cos(a) * 0.14, 0.145, Math.sin(a) * 0.14)
    root.add(bolt)
  }

  // ── 2. Structural：白杆（0.13m → 0.86m） ──
  const poleBot = 0.13, poleTop = 0.86
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.04, poleTop - poleBot, 16), whiteMat)
  pole.position.y = (poleTop + poleBot) / 2
  root.add(pole)

  // ── 3. Form：罩底过渡箍圈（杆顶 → 天线罩底部） ──
  const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.115, 0.09, 0.09, 20), whiteMat)
  collar.position.y = poleTop + 0.045
  root.add(collar)

  // ── 4. Form：竖直胶囊形天线罩（核心特征） ──
  // 参考图等比：罩高 ≈ 0.9m、罩宽 ≈ 0.44m → capR=0.22, capLen=0.46
  const capR = 0.22, capLen = 0.46
  const radome = new THREE.Mesh(
    new THREE.CapsuleGeometry(capR, capLen, 8, 28),
    whiteMat,
  )
  // 截面略扁（前后方向压扁，接近实拍的椭圆断面）
  radome.scale.z = 0.78
  const radomeBottomY = poleTop + 0.09
  const radomeCenterY = radomeBottomY + capR + capLen / 2
  radome.position.y = radomeCenterY
  root.add(radome)
  // 罩体竖向板缝（前/后/左/右各一条细凸缝）
  const ribGeo = new THREE.BoxGeometry(0.012, capLen + capR * 0.9, 0.012)
  const ribX = capR * 0.995
  const ribZ = capR * 0.78 * 0.995
  const ribPos: [number, number][] = [[ribX, 0], [-ribX, 0], [0, ribZ], [0, -ribZ]]
  for (const [rx, rz] of ribPos) {
    const rib = new THREE.Mesh(ribGeo, seamMat)
    rib.position.set(rx, radomeCenterY, rz)
    root.add(rib)
  }

  // ── 5. Surface：电缆贴杆而下 ──
  const cablePts = [
    new THREE.Vector3(0.04, radomeBottomY, 0.055),
    new THREE.Vector3(0.05, 0.55, 0.05),
    new THREE.Vector3(0.045, 0.2, 0.05),
    new THREE.Vector3(0.06, 0.03, 0.09),
  ]
  const cable = new THREE.Mesh(
    new THREE.TubeGeometry(new THREE.CatmullRomCurve3(cablePts), 20, 0.009, 8, false),
    new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.8 }),
  )
  root.add(cable)

  // 总高 ≈ 1.82m（天线罩顶），符合实机约 1.8m
  root.userData.labelHeight = 2.0
  return root
}
