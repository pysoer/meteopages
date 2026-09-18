/**
 * 综合集成硬件控制器（Integrated Hardware Controller）
 *
 * 参考特征（依据 equipment/hwcontroller.md 描述）：
 *   - 现场核心机箱：多串口通信、信号转换、光电隔离、数据转换、光猫（光电转换）模块高度集成
 *   - 标准机架/壁挂式机箱，正面为模块插槽与状态指示灯排
 *   - 底部为光纤/电源进出接口，侧面散热
 *
 * 八阶段管线：Blockout → Structural → Form → Material → Surface → Lighting → Interaction → Optimization
 */
import * as THREE from 'three'

export function createHwController(): THREE.Group {
  const root = new THREE.Group()
  root.name = 'HwController'

  // ── 材质 ──
  const caseMat = new THREE.MeshStandardMaterial({ color: 0xdde3e7, roughness: 0.48, metalness: 0.32 })
  const panelMat = new THREE.MeshStandardMaterial({ color: 0x39424a, roughness: 0.5, metalness: 0.4 })
  const darkMat = new THREE.MeshStandardMaterial({ color: 0x24282c, roughness: 0.6, metalness: 0.3 })
  const metalMat = new THREE.MeshStandardMaterial({ color: 0xbfc7cc, roughness: 0.35, metalness: 0.65 })

  // ── 1. Blockout：立式机箱 ──
  const w = 0.56, h = 1.05, d = 0.5
  const cabinet = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), caseMat)
  cabinet.position.y = h / 2 + 0.12
  root.add(cabinet)

  // 底座（可调脚）
  const plinth = new THREE.Mesh(new THREE.BoxGeometry(w + 0.06, 0.06, d + 0.06), darkMat)
  plinth.position.y = 0.06
  root.add(plinth)
  for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]] as [number, number][]) {
    const foot = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.06, 10), metalMat)
    foot.position.set(sx * (w / 2), 0.03, sz * (d / 2))
    root.add(foot)
  }

  // ── 2. Structural：正面模块面板（多层插槽） ──
  const slots = 6
  const panelH = h - 0.2
  const slotH = panelH / slots
  for (let i = 0; i < slots; i++) {
    const slot = new THREE.Mesh(new THREE.BoxGeometry(w - 0.12, slotH - 0.03, 0.02), panelMat)
    slot.position.set(0, 0.12 + 0.1 + panelH - slotH * (i + 0.5), d / 2 + 0.011)
    root.add(slot)
    // 该模块的状态指示灯
    for (let j = 0; j < 2; j++) {
      const c = j === 0 ? 0x34d399 : 0xfacc15
      const lm = new THREE.MeshStandardMaterial({ color: c, emissive: c, emissiveIntensity: 1.1 })
      const lamp = new THREE.Mesh(new THREE.CircleGeometry(0.011, 10), lm)
      lamp.position.set(-(w / 2 - 0.16) + j * 0.05, slot.position.y, d / 2 + 0.023)
      root.add(lamp)
    }
    // 模块把手/标签
    const label = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.02, 0.005), metalMat)
    label.position.set(w / 2 - 0.14, slot.position.y, d / 2 + 0.022)
    root.add(label)
  }

  // ── 3. Form：光纤接口盘（光猫，前面板下部） ──
  const fiberPlate = new THREE.Mesh(new THREE.BoxGeometry(w - 0.16, 0.12, 0.02), darkMat)
  fiberPlate.position.set(0, 0.2, d / 2 + 0.011)
  root.add(fiberPlate)
  for (let i = 0; i < 4; i++) {
    const port = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.03, 12), metalMat)
    port.rotation.x = Math.PI / 2
    port.position.set(-0.15 + i * 0.1, 0.2, d / 2 + 0.02)
    root.add(port)
  }

  // ── 4. Surface：顶部透气窗 + 侧面散热孔 ──
  const vent = new THREE.Mesh(new THREE.BoxGeometry(w - 0.2, 0.02, d - 0.2), darkMat)
  vent.position.y = h + 0.12 - 0.01
  root.add(vent)
  for (let i = 0; i < 6; i++) {
    const louver = new THREE.Mesh(new THREE.BoxGeometry(0.01, 0.02, d - 0.16), darkMat)
    louver.position.set(w / 2 + 0.006, 0.28 + i * 0.05, 0)
    root.add(louver)
  }
  // 接地端子
  const gnd = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.04, 10), metalMat)
  gnd.rotation.z = Math.PI / 2
  gnd.position.set(-(w / 2 + 0.02), 0.16, 0)
  root.add(gnd)

  root.userData.tick = (_delta: number) => {
    const t = performance.now() / 1000
    // 指示灯整体呼吸（示意运行中）
    root.traverse((o: any) => {
      if (o.material && (o.material as THREE.MeshStandardMaterial).emissive) {
        const m = o.material as THREE.MeshStandardMaterial
        if (m.emissiveIntensity > 0) m.emissiveIntensity = 0.7 + Math.abs(Math.sin(t * 1.3)) * 0.6
      }
    })
  }

  root.userData.labelHeight = 2.1
  return root
}
