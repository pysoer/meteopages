/**
 * 3D 激光测风雷达（3D Scanning Doppler Wind Lidar）
 *
 * 参考特征（依据 equipment/lidarwind.md 描述 + 标准 3D 扫描激光雷达形态）：
 *   - 落地机柜本体（激光器/接收机/控制单元）
 *   - 顶部为楔形/圆柱形扫描光学头，含出光窗口，可 360° 旋转俯仰扫描
 *   - 机柜面板有散热格栅与状态灯
 *
 * 八阶段管线：Blockout → Structural → Form → Material → Surface → Lighting → Interaction → Optimization
 */
import * as THREE from 'three'

export function createLidarWind(): THREE.Group {
  const root = new THREE.Group()
  root.name = 'LidarWind'

  // ── 材质 ──
  const cabMat = new THREE.MeshStandardMaterial({ color: 0xeceff2, roughness: 0.45, metalness: 0.25 })
  const darkMat = new THREE.MeshStandardMaterial({ color: 0x2b2f33, roughness: 0.5, metalness: 0.35 })
  const metalMat = new THREE.MeshStandardMaterial({ color: 0xbfc7cc, roughness: 0.32, metalness: 0.65 })
  const windowMat = new THREE.MeshStandardMaterial({
    color: 0x9ad9ff, roughness: 0.08, metalness: 0.2, emissive: 0x2f6f9f, emissiveIntensity: 0.7,
  })

  // ── 1. Blockout：落地机柜（略呈方形） ──
  const cabW = 0.85, cabH = 1.0, cabD = 0.7
  const cabinet = new THREE.Mesh(new THREE.BoxGeometry(cabW, cabH, cabD), cabMat)
  cabinet.position.y = cabH / 2 + 0.07
  root.add(cabinet)

  // 底座
  const plinth = new THREE.Mesh(new THREE.BoxGeometry(cabW + 0.1, 0.07, cabD + 0.1), darkMat)
  plinth.position.y = 0.035
  root.add(plinth)

  // 机柜顶盖
  const top = new THREE.Mesh(new THREE.BoxGeometry(cabW + 0.02, 0.05, cabD + 0.02), metalMat)
  top.position.y = cabH + 0.07 + 0.025
  root.add(top)

  // ── 2. Structural：顶部扫描光学头（可旋转） ──
  const scanY = cabH + 0.07 + 0.05
  const scanner = new THREE.Group()
  scanner.position.y = scanY

  // 转台
  const turntable = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.24, 0.08, 24), metalMat)
  turntable.position.y = 0.04
  scanner.add(turntable)

  // 楔形光学舱（倾斜指向天空）
  const head = new THREE.Group()
  head.position.y = 0.1
  head.rotation.z = -0.6            // 出光口上仰
  const housing = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.19, 0.42, 24), cabMat)
  head.add(housing)
  // 前端出光窗（镜面朝外）
  const win = new THREE.Mesh(new THREE.CircleGeometry(0.13, 20), windowMat)
  win.rotation.x = -Math.PI / 2
  win.position.y = 0.215
  head.add(win)
  // 窗口金属压环
  const winRing = new THREE.Mesh(new THREE.TorusGeometry(0.145, 0.018, 8, 26), metalMat)
  winRing.rotation.x = Math.PI / 2
  winRing.position.y = 0.215
  head.add(winRing)
  // 背部配重/散热块
  const counter = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.16, 0.16), darkMat)
  counter.position.y = -0.22
  head.add(counter)
  scanner.add(head)

  root.add(scanner)

  // ── 4. Surface：机柜面板细节 ──
  for (let i = 0; i < 5; i++) {
    const g = new THREE.Mesh(new THREE.BoxGeometry(cabW - 0.2, 0.02, 0.01), darkMat)
    g.position.set(0, 0.28 + i * 0.09, cabD / 2 + 0.006)
    root.add(g)
  }
  // 状态灯
  const lampMat = new THREE.MeshStandardMaterial({ color: 0x22d3ee, emissive: 0x22d3ee, emissiveIntensity: 1.2 })
  const lamp = new THREE.Mesh(new THREE.CircleGeometry(0.018, 12), lampMat)
  lamp.position.set(cabW / 2 - 0.1, 0.86, cabD / 2 + 0.007)
  root.add(lamp)

  // 侧面接线口
  const port = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.1, 0.12), darkMat)
  port.position.set(cabW / 2 + 0.012, 0.35, 0)
  root.add(port)

  // ── 7. Interaction：扫描头 360° 旋转 + 出光窗呼吸闪烁 ──
  root.userData.tick = (delta: number) => {
    scanner.rotation.y += delta * 0.6
    const t = performance.now() / 1000
    const m = windowMat as THREE.MeshStandardMaterial
    m.emissiveIntensity = 0.5 + Math.abs(Math.sin(t * 2.2)) * 0.8
  }

  root.userData.labelHeight = 2.0
  return root
}
