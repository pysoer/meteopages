/**
 * 深层地温传感器：8 根 50cm 白色立柱 + 8 根配套 PVC 线管
 *
 * 布置（俯视）：2 排，排间距 50cm；每排 4 个传感器 + 4 根 PVC 线管。
 * 因每根立柱与其 PVC 线管紧挨着（相隔约 10cm），现场看上去是 4 条平行线：
 *   [立柱排1][线管排1]  ——50cm——  [立柱排2][线管排2]
 */
import * as THREE from 'three'

export function createDeepTemp(): THREE.Group {
  const root = new THREE.Group()
  root.name = 'DeepTemp'

  const whiteMat = new THREE.MeshStandardMaterial({ color: 0xf2f5f7, roughness: 0.5, metalness: 0.1 })
  const pvcMat = new THREE.MeshStandardMaterial({ color: 0xe9eef0, roughness: 0.35, metalness: 0.05 })
  const capMat = new THREE.MeshStandardMaterial({ color: 0xcfd6da, roughness: 0.5, metalness: 0.2 })

  const ROWS = 2                 // 2 排
  const PER_ROW = 4              // 每排 4 个传感器
  const SP = 0.26                // 同排内立柱间距（米）
  const ROW_SP = 0.5             // 排间距 50cm
  const PVC_OFF = 0.1            // 传感器与 PVC 线管间距（很近）
  const H = 0.5                  // 立柱高 50cm
  const R = 0.038                // 立柱半径
  const totalW = (PER_ROW - 1) * SP
  const startX = -totalW / 2

  for (let r = 0; r < ROWS; r++) {
    const zc = (r - (ROWS - 1) / 2) * ROW_SP
    const zCol = zc - PVC_OFF / 2
    const zPvc = zc + PVC_OFF / 2

    for (let i = 0; i < PER_ROW; i++) {
      const x = startX + i * SP
      // 白色立柱
      const col = new THREE.Mesh(new THREE.CylinderGeometry(R, R, H, 18), whiteMat)
      col.position.set(x, H / 2, zCol)
      root.add(col)
      // 柱顶封盖
      const cap = new THREE.Mesh(new THREE.CylinderGeometry(R * 1.2, R * 1.2, 0.03, 18), capMat)
      cap.position.set(x, H + 0.015, zCol)
      root.add(cap)
      // 配套的 PVC 线管（略高、略粗，紧挨立柱南侧）
      const pvc = new THREE.Mesh(new THREE.CylinderGeometry(R * 0.8, R * 0.8, H + 0.06, 14), pvcMat)
      pvc.position.set(x, (H + 0.06) / 2, zPvc)
      root.add(pvc)
      const pvcCap = new THREE.Mesh(new THREE.SphereGeometry(R * 0.8, 12, 8), pvcMat)
      pvcCap.position.set(x, H + 0.06, zPvc)
      root.add(pvcCap)
    }

    // 每排底部汇线槽
    const rail = new THREE.Mesh(new THREE.BoxGeometry(totalW + 0.2, 0.05, 0.08), capMat)
    rail.position.set(0, 0.025, zPvc)
    root.add(rail)
  }

  root.userData.labelHeight = 1.0
  return root
}