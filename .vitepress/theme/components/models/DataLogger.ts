/**
 * 自动气象站采集器（Automatic Weather Station Data Logger）
 *
 * 参考特征（依据 equipment/datalogger.md 描述）：
 *   - 立杆安装的小型采集机箱，正面有液晶显示屏与操作键
 *   - 底部多路传感器接线端子/航插，侧面通风散热
 *   - 含气压传感器（本设备页标注为「自动气象站采集器（气压）」）
 *
 * 八阶段管线：Blockout → Structural → Form → Material → Surface → Lighting → Interaction → Optimization
 */
import * as THREE from 'three'

export function createDataLogger(): THREE.Group {
  const root = new THREE.Group()
  root.name = 'DataLogger'

  // ── 材质 ──
  const poleMat = new THREE.MeshStandardMaterial({ color: 0xbfc7cc, roughness: 0.5, metalness: 0.45 })
  const caseMat = new THREE.MeshStandardMaterial({ color: 0xe8edf0, roughness: 0.45, metalness: 0.3 })
  const darkMat = new THREE.MeshStandardMaterial({ color: 0x2b2f33, roughness: 0.55, metalness: 0.3 })
  const glassMat = new THREE.MeshStandardMaterial({
    color: 0xbfe0f0, roughness: 0.08, metalness: 0.1, transparent: true, opacity: 0.55,
  })

  // ── 1. Blockout：立柱 ──
  const poleH = 1.0
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.055, poleH, 16), poleMat)
  pole.position.y = poleH / 2
  root.add(pole)
  const foot = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.17, 0.07, 18), poleMat)
  foot.position.y = 0.035
  root.add(foot)

  // ── 2. Structural：采集机箱 ──
  const w = 0.4, h = 0.44, d = 0.26
  const boxY = poleH + 0.1
  const box = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), caseMat)
  box.position.y = boxY
  root.add(box)
  // 机箱背面固定支架
  const bracket = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.1, 0.08), darkMat)
  bracket.position.set(0, boxY, -d / 2 - 0.03)
  root.add(bracket)

  // ── 3. Form：正面显示屏 + 操作键 ──
  const screenFrame = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.14, 0.02), darkMat)
  screenFrame.position.set(-0.04, boxY + 0.07, d / 2 + 0.005)
  root.add(screenFrame)
  const scrMat = new THREE.MeshStandardMaterial({ color: 0x0f2a37, emissive: 0x2f8fb8, emissiveIntensity: 0.7 })
  const scr = new THREE.Mesh(new THREE.PlaneGeometry(0.21, 0.11), scrMat)
  scr.position.set(-0.04, boxY + 0.07, d / 2 + 0.016)
  root.add(scr)
  // 屏幕反光玻璃
  const gl = new THREE.Mesh(new THREE.PlaneGeometry(0.21, 0.11), glassMat)
  gl.position.set(-0.04, boxY + 0.07, d / 2 + 0.02)
  root.add(gl)
  // 按键
  const keyMat = new THREE.MeshStandardMaterial({ color: 0x8a949b, roughness: 0.6, metalness: 0.2 })
  for (let i = 0; i < 4; i++) {
    const key = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.012, 12), keyMat)
    key.rotation.x = Math.PI / 2
    key.position.set(-0.05 + i * 0.06, boxY - 0.12, d / 2 + 0.012)
    root.add(key)
  }

  // ── 4. Surface：底部航插 + 侧面散热格栅 ──
  const connMat = new THREE.MeshStandardMaterial({ color: 0x8a949b, roughness: 0.45, metalness: 0.55 })
  for (let i = 0; i < 4; i++) {
    const conn = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.03, 12), connMat)
    conn.position.set(-0.12 + i * 0.08, boxY - h / 2 - 0.015, 0)
    root.add(conn)
  }
  for (let i = 0; i < 4; i++) {
    const g = new THREE.Mesh(new THREE.BoxGeometry(0.01, 0.02, d - 0.08), darkMat)
    g.position.set(w / 2 + 0.006, boxY - 0.06 + i * 0.045, 0)
    root.add(g)
  }

  // 顶部微型气压进气口（环境压力感知）
  const vent = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.05, 12), connMat)
  vent.position.set(0.1, boxY + h / 2 + 0.025, 0)
  root.add(vent)

  root.userData.tick = (_delta: number) => {
    const t = performance.now() / 1000
    const m = scrMat as THREE.MeshStandardMaterial
    m.emissiveIntensity = 0.5 + Math.abs(Math.sin(t * 1.1)) * 0.35
  }

  root.userData.labelHeight = 1.9
  return root
}
