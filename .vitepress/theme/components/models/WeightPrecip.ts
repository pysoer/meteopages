/**
 * 称重式降水传感器（Weighing Precipitation Gauge）
 *
 * 参考特征（依据 equipment/weightprecip.md 描述 + 标准称重式雨量计形态）：
 *   - 内部承水器（圆柱桶），外部尼龙/金属防风圈（Alter 型，多层漏斗状挡板）
 *   - 底部基座 + 称重传感器腔体，侧面接线盒
 *
 * 八阶段管线：Blockout → Structural → Form → Material → Surface → Lighting → Interaction → Optimization
 */
import * as THREE from 'three'

export function createWeightPrecip(): THREE.Group {
  const root = new THREE.Group()
  root.name = 'WeightPrecip'

  // ── 材质 ──
  const steelMat = new THREE.MeshStandardMaterial({ color: 0xcfd6da, roughness: 0.35, metalness: 0.6 })
  const shieldMat = new THREE.MeshStandardMaterial({ color: 0xe6ebee, roughness: 0.55, metalness: 0.2 })
  const darkMat = new THREE.MeshStandardMaterial({ color: 0x2b2f33, roughness: 0.6, metalness: 0.3 })
  const innerMat = new THREE.MeshStandardMaterial({ color: 0xb9c2c6, roughness: 0.4, metalness: 0.5 })

  // ── 1. Blockout：基座 ──
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.48, 0.22, 28), darkMat)
  base.position.y = 0.11
  root.add(base)

  // ── 2. Structural：内部承水桶（漏斗口） ──
  const bucketH = 0.7
  const bucket = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, bucketH, 28), steelMat)
  bucket.position.y = 0.22 + bucketH / 2
  root.add(bucket)
  // 承水口漏斗沿
  const funnel = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.28, 0.1, 28, 1, true), innerMat)
  funnel.position.y = 0.22 + bucketH + 0.05
  funnel.material.side = THREE.DoubleSide
  root.add(funnel)
  // 桶口加强环
  const rim = new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.016, 8, 32), steelMat)
  rim.rotation.x = Math.PI / 2
  rim.position.y = 0.22 + bucketH + 0.1
  root.add(rim)

  // ── 3. Form：Alter 型防风圈（多层漏斗状挡板，环绕承水口） ──
  const layers = 3
  for (let i = 0; i < layers; i++) {
    const r = 0.5 + i * 0.13
    // 每层用开口圆锥环模拟倾斜挡板
    const cone = new THREE.Mesh(
      new THREE.CylinderGeometry(r + 0.12, r, 0.16, 32, 1, true),
      shieldMat,
    )
    cone.material.side = THREE.DoubleSide
    cone.position.y = 0.22 + bucketH + 0.16 - i * 0.02
    root.add(cone)
  }
  // 防风圈支撑肋（竖条）
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2
    const rib = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.5, 0.012), steelMat)
    rib.position.set(Math.cos(a) * 0.56, 0.22 + bucketH - 0.08, Math.sin(a) * 0.56)
    root.add(rib)
  }

  // ── 4. Surface：接线盒 + 电缆 ──
  const jbox = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.2, 0.1), darkMat)
  jbox.position.set(0.3, 0.34, 0.3)
  root.add(jbox)
  const cablePts = [
    new THREE.Vector3(0.3, 0.24, 0.32),
    new THREE.Vector3(0.42, 0.06, 0.42),
  ]
  const cable = new THREE.Mesh(
    new THREE.TubeGeometry(new THREE.CatmullRomCurve3(cablePts), 12, 0.011, 8, false),
    new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.75 }),
  )
  root.add(cable)

  root.userData.labelHeight = 1.7
  return root
}
