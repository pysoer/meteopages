/**
 * 天气现象视频观测仪：3m 立柱（3 摄像头 + 2 小箱）主设备；
 * 南侧 1m 处一组电线积冰架（2 根 1.5m 立柱 + 顶部粗电线）；再南 0.5m 处雪深标尺
 * （互相垂直的两组积冰架见独立的 IcingRack 模型）
 */
import * as THREE from 'three'

export function createPhenomCamera(): THREE.Group {
  const root = new THREE.Group()
  root.name = 'PhenomCamera'

  const poleMat = new THREE.MeshStandardMaterial({ color: 0xbfc7cc, roughness: 0.5, metalness: 0.45 })
  const whiteMat = new THREE.MeshStandardMaterial({ color: 0xf2f5f7, roughness: 0.5, metalness: 0.1 })
  const darkMat = new THREE.MeshStandardMaterial({ color: 0x2b2f33, roughness: 0.5, metalness: 0.3 })
  const glassMat = new THREE.MeshStandardMaterial({ color: 0x0f1720, roughness: 0.12, metalness: 0.2, emissive: 0x11304a, emissiveIntensity: 0.4 })
  const boxMat = new THREE.MeshStandardMaterial({ color: 0xe7ecef, roughness: 0.6, metalness: 0.05 })
  const wireMat = new THREE.MeshStandardMaterial({ color: 0x222629, roughness: 0.6, metalness: 0.2 })
  const ruleMat = new THREE.MeshStandardMaterial({ color: 0xf4f6f7, roughness: 0.6, metalness: 0.05 })

  // ── 1. 主设备：3m 立柱 ──
  const poleH = 3.0
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.075, poleH, 18), poleMat)
  pole.position.y = poleH / 2
  root.add(pole)
  const foot = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.22, 0.08, 20), poleMat)
  foot.position.y = 0.04
  root.add(foot)

  // ── 2. 顶部摄像机横臂 + 3 个摄像头 ──
  const headY = poleH
  const bar = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.12, 0.14), whiteMat)
  bar.position.y = headY
  root.add(bar)
  for (let i = 0; i < 3; i++) {
    const cx = -0.32 + i * 0.32
    const cam = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.14, 0.18), whiteMat)
    cam.position.set(cx, headY + 0.13, 0)
    root.add(cam)
    const lens = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.045, 0.05, 16), glassMat)
    lens.rotation.x = Math.PI / 2
    lens.position.set(cx, headY + 0.13, 0.1)
    root.add(lens)
  }
  // 横臂顶部鱼眼罩（总云量）
  const dome = new THREE.Mesh(new THREE.SphereGeometry(0.1, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2), glassMat)
  dome.position.y = headY + 0.06
  root.add(dome)
  const domeRing = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.01, 8, 22), whiteMat)
  domeRing.rotation.x = Math.PI / 2
  domeRing.position.y = headY + 0.06
  root.add(domeRing)

  // ── 3. 2 个小箱子（中部控制箱 + 底部机箱） ──
  const ctrlBox = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.22, 0.18), boxMat)
  ctrlBox.position.set(0, poleH * 0.62, 0.14)
  root.add(ctrlBox)
  const baseBox = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.3, 0.26), boxMat)
  baseBox.position.set(0, 0.15, 0.16)
  root.add(baseBox)

  // ── 4. 电线积冰架：2 根立柱 + 顶部粗电线（横杆）；两组互相垂直 ──
  const fz = 1.0                 // 积冰架位于立柱以南 1m（本地 +Z = 南）
  const FW = 1.0, FH = 1.5       // 跨度 1m，高 1.5m
  const hw = FW / 2

  // 单组积冰架：两根立柱 + 顶部一根粗电线（电线沿本地 X 方向）
  function buildIceFrame(): THREE.Group {
    const g = new THREE.Group()
    const postGeo = new THREE.CylinderGeometry(0.03, 0.03, FH, 10)
    for (const sx of [-hw, hw]) {
      const post = new THREE.Mesh(postGeo, poleMat)
      post.position.set(sx, FH / 2, 0)
      g.add(post)
    }
    // 顶部粗电线（圆柱默认沿 Y，绕 Z 转 90° 后沿 X）
    const wire = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, FW, 10), wireMat)
    wire.rotation.z = Math.PI / 2
    wire.position.set(0, FH, 0)
    g.add(wire)
    return g
  }

  // 南侧 1m 处一组电线积冰架（2 立柱 + 顶部粗电线，东西向）
  const frameEW = buildIceFrame()
  frameEW.position.set(0, 0, fz)
  root.add(frameEW)

  // ── 5. 再南 0.5m 处：竖着的雪深标尺 ──
  const rz = fz + 0.5
  const RL = 1.2                 // 标尺高度
  const ruler = new THREE.Mesh(new THREE.BoxGeometry(0.04, RL, 0.02), ruleMat)
  ruler.position.set(0, RL / 2, rz)
  root.add(ruler)
  // 刻度条（红白相间示意）
  for (let i = 1; i <= 6; i++) {
    const tick = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.02, 0.022), i % 2 ? darkMat : ruleMat)
    tick.position.set(0, (RL / 6) * i, rz)
    root.add(tick)
  }

  root.userData.labelHeight = 3.3
  return root
} 
