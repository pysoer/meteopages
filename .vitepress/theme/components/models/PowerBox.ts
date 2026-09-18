/**
 * 智能配电箱（Intelligent Power Distribution Box）
 *
 * 参考特征（依据 equipment/powerbox.md 描述）：
 *   - 户外金属配电柜，落地/立柱安装
 *   - 正面柜门带观察窗、计量仪表、指示灯，配警示标识
 *   - 顶部防雨檐，侧面散热百叶与进出线孔
 *
 * 八阶段管线：Blockout → Structural → Form → Material → Surface → Lighting → Interaction → Optimization
 */
import * as THREE from 'three'

export function createPowerBox(): THREE.Group {
  const root = new THREE.Group()
  root.name = 'PowerBox'

  // ── 材质 ──
  const caseMat = new THREE.MeshStandardMaterial({ color: 0xdde3e7, roughness: 0.5, metalness: 0.3 })
  const doorMat = new THREE.MeshStandardMaterial({ color: 0xcfd6da, roughness: 0.45, metalness: 0.35 })
  const darkMat = new THREE.MeshStandardMaterial({ color: 0x2b2f33, roughness: 0.6, metalness: 0.3 })
  const glassMat = new THREE.MeshStandardMaterial({
    color: 0xbfe0f0, roughness: 0.1, metalness: 0.1, transparent: true, opacity: 0.5,
  })
  const warnMat = new THREE.MeshStandardMaterial({ color: 0xf2c200, roughness: 0.6, metalness: 0.1 })

  // ── 1. Blockout：柜体 ──
  const w = 0.62, h = 0.95, d = 0.34
  const body = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), caseMat)
  body.position.y = h / 2 + 0.3
  root.add(body)

  // 支撑立柱
  const poleH = 0.3
  for (const sx of [-1, 1]) {
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.035, poleH, 12), caseMat)
    pole.position.set(sx * (w / 2 - 0.08), poleH / 2, 0)
    root.add(pole)
  }
  const cross = new THREE.Mesh(new THREE.BoxGeometry(w - 0.1, 0.05, 0.05), caseMat)
  cross.position.y = 0.12
  root.add(cross)

  // ── 2. Structural：正面柜门 ──
  const door = new THREE.Mesh(new THREE.BoxGeometry(w - 0.06, h - 0.06, 0.02), doorMat)
  door.position.set(0, h / 2 + 0.3, d / 2 + 0.01)
  root.add(door)
  // 门框缝隙
  const seam = new THREE.Mesh(new THREE.BoxGeometry(w - 0.02, h - 0.02, 0.005), darkMat)
  seam.position.set(0, h / 2 + 0.3, d / 2 + 0.001)
  root.add(seam)
  // 门把手
  const handle = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.12, 0.03), darkMat)
  handle.position.set(w / 2 - 0.09, h / 2 + 0.3, d / 2 + 0.03)
  root.add(handle)
  // 铰链
  for (const yy of [-0.25, 0.25]) {
    const hinge = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.06, 0.02), darkMat)
    hinge.position.set(-(w / 2 - 0.05), h / 2 + 0.3 + yy, d / 2 + 0.02)
    root.add(hinge)
  }

  // ── 3. Form：观察窗 + 计量仪表 ──
  const win = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.22, 0.01), glassMat)
  win.position.set(-0.08, h / 2 + 0.55, d / 2 + 0.022)
  root.add(win)
  // 数字电表
  const meterMat = new THREE.MeshStandardMaterial({ color: 0x131a1f, emissive: 0x39d98a, emissiveIntensity: 0.6 })
  const meter = new THREE.Mesh(new THREE.PlaneGeometry(0.13, 0.07), meterMat)
  meter.position.set(-0.08, h / 2 + 0.58, d / 2 + 0.028)
  root.add(meter)

  // 警示标识（黄底三角）
  const warn = new THREE.Mesh(new THREE.CircleGeometry(0.05, 3), warnMat)
  warn.position.set(0.14, h / 2 + 0.62, d / 2 + 0.028)
  root.add(warn)

  // 指示灯排
  const lampMat = new THREE.MeshStandardMaterial({ color: 0x34d399, emissive: 0x34d399, emissiveIntensity: 1.2 })
  for (let i = 0; i < 3; i++) {
    const l = new THREE.Mesh(new THREE.CircleGeometry(0.013, 10), lampMat)
    l.position.set(-0.16 + i * 0.06, h / 2 + 0.3, d / 2 + 0.028)
    root.add(l)
  }

  // ── 4. Surface：顶部防雨檐 + 侧面百叶 ──
  const roof = new THREE.Mesh(new THREE.BoxGeometry(w + 0.1, 0.04, d + 0.1), caseMat)
  roof.position.y = h + 0.3 + 0.02
  root.add(roof)
  // 檐下滴水沿
  const drip = new THREE.Mesh(new THREE.BoxGeometry(w + 0.06, 0.03, d + 0.06), darkMat)
  drip.position.y = h + 0.3 - 0.02
  root.add(drip)
  // 侧面百叶
  for (let i = 0; i < 5; i++) {
    const louver = new THREE.Mesh(new THREE.BoxGeometry(0.01, 0.02, d - 0.1), darkMat)
    louver.position.set(w / 2 + 0.006, h / 2 + 0.3 - 0.15 + i * 0.05, 0)
    root.add(louver)
  }
  // 底部进出线孔
  const grommet = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.03, 14), darkMat)
  grommet.position.set(-0.15, 0.3 + 0.015, 0)
  root.add(grommet)

  root.userData.labelHeight = 2.0
  return root
}
