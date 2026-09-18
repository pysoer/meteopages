/**
 * 闪电定位仪（Lightning Locator / Lightning Detection Sensor）
 *
 * 参考特征（依据 equipment/lightning.md 描述 + 标准单站闪电定位仪形态）：
 *   - 立柱 + 顶部平面板状天线（VLF/LF 磁场天线 + 电场天线）
 *   - 天线下方为电子机箱，含指示灯与接线口
 *
 * 八阶段管线：Blockout → Structural → Form → Material → Surface → Lighting → Interaction → Optimization
 */
import * as THREE from 'three'

export function createLightningLocator(): THREE.Group {
  const root = new THREE.Group()
  root.name = 'LightningLocator'

  // ── 材质 ──
  const poleMat = new THREE.MeshStandardMaterial({ color: 0xbfc7cc, roughness: 0.45, metalness: 0.5 })
  const antMat = new THREE.MeshStandardMaterial({ color: 0xdfe5e9, roughness: 0.4, metalness: 0.35 })
  const darkMat = new THREE.MeshStandardMaterial({ color: 0x2b2f33, roughness: 0.55, metalness: 0.3 })
  const loopMat = new THREE.MeshStandardMaterial({ color: 0x5b666e, roughness: 0.45, metalness: 0.55 })

  // ── 1. Blockout：立柱 ──
  const poleH = 1.5
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.07, poleH, 16), poleMat)
  pole.position.y = poleH / 2
  root.add(pole)
  const foot = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.2, 0.08, 18), poleMat)
  foot.position.y = 0.04
  root.add(foot)

  // ── 2. Structural：顶部板状电场天线 ──
  const antY = poleH + 0.06
  const plate = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.02, 0.42), antMat)
  plate.position.y = antY
  root.add(plate)
  // 天线绝缘支撑
  for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]] as [number, number][]) {
    const stand = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.1, 8), darkMat)
    stand.position.set(sx * 0.16, antY - 0.06, sz * 0.16)
    root.add(stand)
  }

  // ── 3. Form：两组正交磁场环天线（VLF/LF 磁天线） ──
  for (const rot of [0, Math.PI / 2]) {
    const loop = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.012, 8, 32), loopMat)
    loop.rotation.y = rot
    loop.position.y = antY + 0.28
    root.add(loop)
  }
  // 环天线中心杆
  const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.5, 10), poleMat)
  mast.position.y = antY + 0.2
  root.add(mast)

  // ── 4. Surface：电子机箱 + 指示灯 ──
  const box = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.4, 0.24), darkMat)
  box.position.set(0, 0.78, 0.02)
  root.add(box)
  // 散热格栅
  for (let i = 0; i < 4; i++) {
    const g = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.014, 0.01), poleMat)
    g.position.set(0, 0.66 + i * 0.05, box.position.z + 0.126)
    root.add(g)
  }
  // 状态灯
  const lampMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, emissive: 0xfacc15, emissiveIntensity: 1.2 })
  const lamp = new THREE.Mesh(new THREE.CircleGeometry(0.016, 10), lampMat)
  lamp.position.set(0.1, 0.93, box.position.z + 0.127)
  root.add(lamp)

  // 接地扁铁
  const gnd = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.5, 0.03), poleMat)
  gnd.position.set(0.12, 0.25, 0.12)
  root.add(gnd)

  // ── 7. Interaction：状态灯缓慢闪烁（模拟监听中） ──
  root.userData.tick = (_delta: number) => {
    const t = performance.now() / 1000
    const m = lampMat as THREE.MeshStandardMaterial
    m.emissiveIntensity = 0.4 + (Math.sin(t * 3) > 0.7 ? 1.2 : 0)
  }

  root.userData.labelHeight = 2.4
  return root
}
