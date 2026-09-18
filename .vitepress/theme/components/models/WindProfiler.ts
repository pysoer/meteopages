/**
 * 风廓线雷达（Wind Profiler Radar，相控阵 / P 波段）
 *
 * 参考特征（依据 equipment/windprofiler.md 描述 + 标准相控阵风廓线雷达形态）：
 *   - 大面阵相控阵天线（矩形栅格天线单元）朝上或微倾
 *   - 天线固定在支架/基座上，四周有护栏
 *   - 侧面机柜与馈电电缆
 *
 * 八阶段管线：Blockout → Structural → Form → Material → Surface → Lighting → Interaction → Optimization
 */
import * as THREE from 'three'

export function createWindProfiler(): THREE.Group {
  const root = new THREE.Group()
  root.name = 'WindProfiler'

  // ── 材质 ──
  const frameMat = new THREE.MeshStandardMaterial({ color: 0xb9c2c6, roughness: 0.4, metalness: 0.55 })
  const panelMat = new THREE.MeshStandardMaterial({ color: 0xdfe5e9, roughness: 0.5, metalness: 0.3 })
  const elemMat = new THREE.MeshStandardMaterial({ color: 0x3a4148, roughness: 0.55, metalness: 0.35 })
  const darkMat = new THREE.MeshStandardMaterial({ color: 0x2b2f33, roughness: 0.55, metalness: 0.3 })
  const guardMat = new THREE.MeshStandardMaterial({ color: 0xe4c33a, roughness: 0.6, metalness: 0.2 })

  const A = 3.0          // 天线阵面边长（示意）
  const tiltY = 0.9      // 阵面中心高度

  // ── 1. Blockout：支撑基座 + 四腿支架 ──
  for (const sx of [-1, 1]) {
    for (const sz of [-1, 1]) {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.12, tiltY, 0.12), frameMat)
      leg.position.set(sx * (A / 2 - 0.25), tiltY / 2, sz * (A / 2 - 0.25))
      root.add(leg)
    }
  }
  // 横撑
  const cross1 = new THREE.Mesh(new THREE.BoxGeometry(A - 0.3, 0.08, 0.08), frameMat)
  cross1.position.set(0, tiltY * 0.45, -(A / 2 - 0.25)); root.add(cross1)
  const cross2 = cross1.clone(); cross2.position.z = (A / 2 - 0.25); root.add(cross2)

  // ── 2. Structural：天线阵面板（微倾 ±20°） ──
  const arrayGroup = new THREE.Group()
  arrayGroup.position.y = tiltY + 0.06
  arrayGroup.rotation.x = -0.35

  const panel = new THREE.Mesh(new THREE.BoxGeometry(A, 0.08, A), panelMat)
  arrayGroup.add(panel)

  // ── 3. Form：阵面天线单元栅格 ──
  const N = 6
  const step = A / N
  for (let i = 0; i < N; i++) {
    for (let j = 0; j < N; j++) {
      const el = new THREE.Mesh(new THREE.BoxGeometry(step * 0.62, 0.05, step * 0.62), elemMat)
      el.position.set(-A / 2 + step / 2 + i * step, 0.06, -A / 2 + step / 2 + j * step)
      arrayGroup.add(el)
      // 单元中心小凸起
      const cap = new THREE.Mesh(new THREE.CylinderGeometry(step * 0.12, step * 0.12, 0.03, 10), frameMat)
      cap.position.set(el.position.x, 0.09, el.position.z)
      arrayGroup.add(cap)
    }
  }
  root.add(arrayGroup)

  // ── 4. Surface：四周安全护栏 ──
  const guardR = A / 2 + 0.45
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2
    const rail = new THREE.Mesh(new THREE.BoxGeometry(A + 0.9, 0.05, 0.05), guardMat)
    rail.position.set(Math.sin(a) * guardR, 0.55, Math.cos(a) * guardR)
    rail.rotation.y = a
    root.add(rail)
  }
  const postPositions: [number, number][] = [[-1, -1], [1, -1], [-1, 1], [1, 1]]
  for (const [sx, sz] of postPositions) {
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.7, 10), guardMat)
    post.position.set(sx * (A / 2 + 0.4), 0.35, sz * (A / 2 + 0.4))
    root.add(post)
  }

  // 侧面机柜
  const cab = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.9, 0.5), panelMat)
  cab.position.set(A / 2 + 0.7, 0.45 + 0.06, 0)
  root.add(cab)
  const cabBase = new THREE.Mesh(new THREE.BoxGeometry(0.66, 0.05, 0.56), darkMat)
  cabBase.position.set(cab.position.x, 0.03, 0)
  root.add(cabBase)

  root.userData.labelHeight = 3.0
  return root
}
