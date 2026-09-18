/**
 * 天气现象视频观测仪（Weather Phenomena Video Observer）
 *
 * 参考特征（依据 equipment/phenom.md 描述 + 标准视频观测仪形态）：
 *   - 立杆顶部为一体化摄像机云台 + 防护罩，镜头朝下/朝前
 *   - 顶部半球透明罩用于总云量观测（鱼眼）
 *   - 地面白色标定板（雪深/积雪识别）
 *
 * 八阶段管线：Blockout → Structural → Form → Material → Surface → Lighting → Interaction → Optimization
 */
import * as THREE from 'three'

export function createPhenomCamera(): THREE.Group {
  const root = new THREE.Group()
  root.name = 'PhenomCamera'

  // ── 材质 ──
  const poleMat = new THREE.MeshStandardMaterial({ color: 0xbfc7cc, roughness: 0.5, metalness: 0.45 })
  const whiteMat = new THREE.MeshStandardMaterial({ color: 0xf2f5f7, roughness: 0.5, metalness: 0.1 })
  const darkMat = new THREE.MeshStandardMaterial({ color: 0x2b2f33, roughness: 0.5, metalness: 0.3 })
  const glassMat = new THREE.MeshStandardMaterial({
    color: 0xbfe4ff, roughness: 0.06, metalness: 0, transparent: true, opacity: 0.45,
  })
  const lensMat = new THREE.MeshStandardMaterial({
    color: 0x0f1720, roughness: 0.12, metalness: 0.2, emissive: 0x11304a, emissiveIntensity: 0.4,
  })
  const boardMat = new THREE.MeshStandardMaterial({ color: 0xf7f9fa, roughness: 0.7, metalness: 0.05 })

  // ── 1. Blockout：立杆 ──
  const poleH = 2.1
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.07, poleH, 18), poleMat)
  pole.position.y = poleH / 2
  root.add(pole)
  const foot = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.2, 0.06, 20), poleMat)
  foot.position.y = 0.03
  root.add(foot)

  // ── 2. Structural：顶部云台摄像机 ──
  const headY = poleH + 0.12
  const housing = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.22, 0.22), whiteMat)
  housing.position.y = headY
  root.add(housing)
  // 前部镜头
  const lens = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.07, 0.08, 20), lensMat)
  lens.rotation.z = Math.PI / 2
  lens.position.set(0.26, headY, 0)
  root.add(lens)
  // 后部接线仓
  const rear = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.16, 0.16), darkMat)
  rear.position.set(-0.27, headY, 0)
  root.add(rear)

  // ── 3. Form：顶部鱼眼透明罩（总云量观测） ──
  const domeR = 0.14
  const dome = new THREE.Mesh(
    new THREE.SphereGeometry(domeR, 24, 14, 0, Math.PI * 2, 0, Math.PI / 2),
    glassMat,
  )
  dome.position.y = headY + 0.13
  root.add(dome)
  // 罩内鱼眼镜头
  const fisheye = new THREE.Mesh(new THREE.SphereGeometry(0.045, 14, 14), lensMat)
  fisheye.position.y = headY + 0.14
  root.add(fisheye)
  // 支撑环
  const ring = new THREE.Mesh(new THREE.TorusGeometry(domeR, 0.012, 8, 26), whiteMat)
  ring.rotation.x = Math.PI / 2
  ring.position.y = headY + 0.13
  root.add(ring)

  // ── 4. Surface：地面白色标定板（积雪/雪深识别靶） ──
  const board = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.02, 1.0), boardMat)
  board.position.set(0, 0.012, 0.9)
  root.add(board)
  // 棋盘格标识
  for (let i = 0; i < 4; i++) {
    const cell = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.005, 0.5), darkMat)
    cell.position.set((i % 2 === 0 ? -0.25 : 0.25), 0.026, 0.9 + (i < 2 ? -0.25 : 0.25))
    root.add(cell)
  }

  // ── 4b. 立杆喉箍与电缆 ──
  const clamp = new THREE.Mesh(new THREE.TorusGeometry(0.062, 0.014, 8, 20), darkMat)
  clamp.rotation.x = Math.PI / 2
  clamp.position.y = poleH - 0.25
  root.add(clamp)

  root.userData.labelHeight = 2.9
  return root
}
