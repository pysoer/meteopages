/**
 * 电线积冰架（Wire Icing Observation Rack）
 *
 * 参考特征（依据 equipment/icingrack.md 描述）：
 *   - 钢架：两根立柱 + 上部横梁
 *   - 横梁上架设标准导线（约 1m 观测段），用于观测雾凇/雨凇覆冰
 *   - 结构简单、露天，便于人工定期测量
 *
 * 八阶段管线：Blockout → Structural → Form → Material → Surface → Lighting → Interaction → Optimization
 */
import * as THREE from 'three'

export function createIcingRack(): THREE.Group {
  const root = new THREE.Group()
  root.name = 'IcingRack'

  // ── 材质 ──
  const steelMat = new THREE.MeshStandardMaterial({ color: 0x9aa4aa, roughness: 0.45, metalness: 0.65 })
  const wireMat = new THREE.MeshStandardMaterial({ color: 0xced4d8, roughness: 0.35, metalness: 0.75 })
  const iceMat = new THREE.MeshStandardMaterial({
    color: 0xdff2ff, roughness: 0.15, metalness: 0, transparent: true, opacity: 0.65,
  })
  const baseMat = new THREE.MeshStandardMaterial({ color: 0x8f989d, roughness: 0.85, metalness: 0.1 })

  // ── 1. Blockout：两立柱 ──
  const H = 1.7
  const span = 1.05
  for (const sx of [-1, 1]) {
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.08, H, 0.08), steelMat)
    post.position.set(sx * (span / 2), H / 2, 0)
    root.add(post)
    // 柱底座
    const foot = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.06, 0.24), baseMat)
    foot.position.set(sx * (span / 2), 0.03, 0)
    root.add(foot)
  }

  // ── 2. Structural：上部横梁 + 斜撑 ──
  const beam = new THREE.Mesh(new THREE.BoxGeometry(span, 0.07, 0.07), steelMat)
  beam.position.y = H - 0.06
  root.add(beam)
  // 双横梁（上下两根，形成观测架）
  const beam2 = new THREE.Mesh(new THREE.BoxGeometry(span, 0.05, 0.05), steelMat)
  beam2.position.y = H - 0.5
  root.add(beam2)
  // 斜撑
  for (const sx of [-1, 1]) {
    const brace = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.6, 0.05), steelMat)
    brace.position.set(sx * (span / 2 - 0.2), H - 0.4, 0)
    brace.rotation.z = sx * 0.6
    root.add(brace)
  }

  // ── 3. Form：标准观测导线（约 1m 段，架于两柱之间） ──
  const wireLen = span - 0.16
  const wire = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, wireLen, 10), wireMat)
  wire.rotation.z = Math.PI / 2
  wire.position.y = H - 0.02
  root.add(wire)

  // ── 4. Surface：导线上示意性薄冰（雾凇/雨凇） ──
  const iceLen = wireLen * 0.6
  const ice = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.026, iceLen, 10), iceMat)
  ice.rotation.z = Math.PI / 2
  ice.position.y = H - 0.02
  root.add(ice)
  // 冰凌尖刺
  for (let i = 0; i < 5; i++) {
    const spike = new THREE.Mesh(new THREE.ConeGeometry(0.012, 0.06, 6), iceMat)
    spike.position.set(-iceLen / 2 + (i / 4) * iceLen, H - 0.06, 0)
    spike.rotation.x = Math.PI
    root.add(spike)
  }

  // 挂钩/夹具（导线两端）
  for (const sx of [-1, 1]) {
    const clamp = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.05, 0.05), steelMat)
    clamp.position.set(sx * (wireLen / 2 + 0.02), H - 0.02, 0)
    root.add(clamp)
  }

  root.userData.labelHeight = 2.1
  return root
}
