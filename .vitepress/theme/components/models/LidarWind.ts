/**
 * 3D 激光测风雷达（3D Scanning Doppler Wind Lidar，风探 FC-III 型）
 *
 * 形态依据（参考图 public/equipment/lidarwind.png 实拍重建）：
 *   - 圆形混凝土基墩
 *   - 红白横条纹圆柱基柱（3 条红带，侧面白色圆形标志）
 *   - 白色法兰盘 + 台阶状锥台柱（两段，上小下大）
 *   - 顶部白色球形天线罩（带水平接缝环与检修小盖），可缓慢旋转扫描
 *
 * 八阶段管线：Blockout → Structural → Form → Material → Surface → Lighting → Interaction → Optimization
 */
import * as THREE from 'three'

export function createLidarWind(): THREE.Group {
  const root = new THREE.Group()
  root.name = 'LidarWind'

  // ── 材质 ──
  const whiteMat = new THREE.MeshStandardMaterial({ color: 0xf2f5f7, roughness: 0.42, metalness: 0.1 })
  const redMat = new THREE.MeshStandardMaterial({ color: 0xd6493e, roughness: 0.5, metalness: 0.12 })
  const concreteMat = new THREE.MeshStandardMaterial({ color: 0xd8d4cb, roughness: 0.95, metalness: 0 })
  const metalMat = new THREE.MeshStandardMaterial({ color: 0xb8c0c6, roughness: 0.4, metalness: 0.6 })
  const seamMat = new THREE.MeshStandardMaterial({ color: 0xdfe4e8, roughness: 0.55, metalness: 0.08 })

  // ── 1. Blockout：圆形混凝土基墩 ──
  const pier = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.66, 0.75, 30), concreteMat)
  pier.position.y = 0.375
  root.add(pier)
  // 墩顶白色法兰板
  const plate = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.42, 0.06, 26), whiteMat)
  plate.position.y = 0.78
  root.add(plate)

  // ── 2. Structural：红白条纹基柱（0.81m → 1.71m） ──
  const colBot = 0.81, colTop = 1.71
  const column = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.28, colTop - colBot, 24), whiteMat)
  column.position.y = (colTop + colBot) / 2
  root.add(column)
  for (const by of [0.98, 1.26, 1.54]) {
    const band = new THREE.Mesh(new THREE.CylinderGeometry(0.272, 0.272, 0.1, 24), redMat)
    band.position.y = by
    root.add(band)
  }
  // 柱身白色圆形标志（带细环）
  const badge = new THREE.Mesh(new THREE.CircleGeometry(0.11, 20), whiteMat)
  badge.position.set(0, 1.26, 0.275)
  root.add(badge)
  const badgeRing = new THREE.Mesh(new THREE.TorusGeometry(0.11, 0.01, 8, 24), metalMat)
  badgeRing.position.set(0, 1.26, 0.275)
  root.add(badgeRing)

  // ── 3. Form：柱顶法兰 + 台阶状锥台柱 ──
  const flangeY = colTop + 0.03
  const flange = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.32, 0.06, 24), whiteMat)
  flange.position.y = flangeY
  root.add(flange)
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2
    const bolt = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.04, 8), metalMat)
    bolt.position.set(Math.cos(a) * 0.26, flangeY + 0.03, Math.sin(a) * 0.26)
    root.add(bolt)
  }

  // ── 4. 可旋转上部：二级台阶柱 + 球形天线罩 ──
  const scanner = new THREE.Group()
  const step1Bot = flangeY + 0.03
  const step1 = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.3, 0.26, 24), whiteMat)
  step1.position.y = step1Bot + 0.13
  scanner.add(step1)
  const step2 = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.21, 0.3, 22), whiteMat)
  step2.position.y = step1Bot + 0.26 + 0.15
  scanner.add(step2)

  const domeR = 0.44
  const domeCenterY = step1Bot + 0.56 + domeR * 0.55
  const dome = new THREE.Mesh(new THREE.SphereGeometry(domeR, 32, 24), whiteMat)
  dome.position.y = domeCenterY
  scanner.add(dome)
  // 水平接缝环（赤道）
  const seam = new THREE.Mesh(new THREE.TorusGeometry(domeR * 0.995, 0.008, 8, 40), seamMat)
  seam.rotation.x = Math.PI / 2
  seam.position.y = domeCenterY
  scanner.add(seam)
  // 检修小盖板
  const hatch = new THREE.Mesh(new THREE.CircleGeometry(0.12, 20), seamMat)
  hatch.position.set(0, domeCenterY + 0.05, domeR * 0.99)
  hatch.rotation.x = -0.1
  scanner.add(hatch)
  // 蓝色型号小标
  const tag = new THREE.Mesh(new THREE.PlaneGeometry(0.16, 0.07), new THREE.MeshStandardMaterial({ color: 0x2b6cb0, roughness: 0.4 }))
  tag.position.set(domeR * 0.55, domeCenterY + 0.28, domeR * 0.62)
  tag.rotation.y = -0.55
  tag.rotation.x = -0.5
  scanner.add(tag)

  scanner.position.y = 0
  root.add(scanner)

  // ── 7. Interaction：球罩缓慢旋转扫描 ──
  root.userData.tick = (delta: number) => {
    scanner.rotation.y += delta * 0.45
  }

  // 高度汇总：基墩 0~0.75 / 条纹柱 0.81~1.71 / 法兰+台阶柱 → 球罩顶 ≈ 3.05m
  root.userData.labelHeight = 3.5
  return root
}
