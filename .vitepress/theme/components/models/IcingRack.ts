/**
 * 电线积冰架（Wire Icing Observation Rack）
 *
 * 结构（按实拍）：2 根立柱 + 顶部一根粗电线（顶部"横杆"本身就是观测导线）。
 * 再复制一组并转 90°：一组测东西向导线的覆冰，另一组测南北向。
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

  const H = 1.7            // 立柱高
  const span = 1.05        // 两柱间距（≈1m 标准观测段）
  const hw = span / 2

  // 单组积冰架：2 立柱 + 顶部粗电线（导线沿本地 X 方向）
  function buildFrame(): THREE.Group {
    const g = new THREE.Group()
    // 两根立柱 + 底座
    for (const sx of [-1, 1]) {
      const post = new THREE.Mesh(new THREE.BoxGeometry(0.08, H, 0.08), steelMat)
      post.position.set(sx * hw, H / 2, 0)
      g.add(post)
      const foot = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.06, 0.24), baseMat)
      foot.position.set(sx * hw, 0.03, 0)
      g.add(foot)
      // 端部夹具
      const clamp = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.05, 0.05), steelMat)
      clamp.position.set(sx * hw, H, 0)
      g.add(clamp)
    }
    // 顶部横杆＝较粗的观测导线（圆柱默认沿 Y，绕 Z 转 90° 后沿 X）
    const wire = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, span, 12), wireMat)
    wire.rotation.z = Math.PI / 2
    wire.position.y = H
    g.add(wire)
    // 导线中段示意性覆冰（雾凇/雨凇）
    const ice = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.03, span * 0.55, 12), iceMat)
    ice.rotation.z = Math.PI / 2
    ice.position.y = H
    g.add(ice)
    return g
  }

  // 东西向（导线沿 X）
  const ew = buildFrame()
  ew.position.z = -0.4
  root.add(ew)
  // 南北向（同一组转 90°，导线沿 Z）
  const ns = buildFrame()
  ns.position.z = 0.4
  ns.rotation.y = Math.PI / 2
  root.add(ns)

  root.userData.labelHeight = 2.1
  return root
}
