/**
 * 微波辐射计（Microwave Radiometer）
 *
 * 参考特征（依据 equipment/radiometer.md 描述 + 标准地基微波辐射计形态）：
 *   - 落地机柜/机箱本体（内含接收机、控制单元）
 *   - 顶部可转平台 + 抛物面反射镜/天线，仰视天空接收微波辐射
 *   - 机柜面板有散热格栅、指示灯与接线口
 *
 * 八阶段管线：Blockout → Structural → Form → Material → Surface → Lighting → Interaction → Optimization
 */
import * as THREE from 'three'

export function createMicrowaveRadiometer(): THREE.Group {
  const root = new THREE.Group()
  root.name = 'MicrowaveRadiometer'

  // ── 材质 ──
  const cabMat = new THREE.MeshStandardMaterial({ color: 0xe8edf0, roughness: 0.45, metalness: 0.25 })
  const darkMat = new THREE.MeshStandardMaterial({ color: 0x2b2f33, roughness: 0.55, metalness: 0.3 })
  const metalMat = new THREE.MeshStandardMaterial({ color: 0xbfc7cc, roughness: 0.35, metalness: 0.6 })
  const dishMat = new THREE.MeshStandardMaterial({
    color: 0xf0f4f8, roughness: 0.3, metalness: 0.15, side: THREE.DoubleSide,
  })

  // ── 1. Blockout：落地机柜 ──
  const cabW = 0.8, cabH = 1.15, cabD = 0.6
  const cabinet = new THREE.Mesh(new THREE.BoxGeometry(cabW, cabH, cabD), cabMat)
  cabinet.position.y = cabH / 2 + 0.06
  root.add(cabinet)

  // 底座（四角可调支脚）
  const plinth = new THREE.Mesh(new THREE.BoxGeometry(cabW + 0.08, 0.06, cabD + 0.08), darkMat)
  plinth.position.y = 0.03
  root.add(plinth)

  // ── 2. Structural：顶部可转平台 ──
  const turntable = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.22, 0.09, 24), metalMat)
  turntable.position.y = cabH + 0.1
  root.add(turntable)

  // ── 3. Form：抛物面反射镜（仰视天空） ──
  const dishR = 0.42
  const dish = new THREE.Mesh(
    new THREE.LatheGeometry(
      Array.from({ length: 14 }, (_, i) => {
        const t = i / 13
        const r = t * dishR
        const y = (t * t) * 0.13
        return new THREE.Vector2(r, y)
      }),
      32,
    ),
    dishMat,
  )
  // 镜面朝上并略倾斜
  const dishPivot = new THREE.Group()
  dishPivot.position.y = cabH + 0.16
  dishPivot.rotation.x = -0.55
  dish.position.y = 0.04
  dishPivot.add(dish)

  // 中心馈源/接收喇叭
  const feed = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.04, 0.16, 16), darkMat)
  feed.position.y = 0.1
  dishPivot.add(feed)
  // 支撑杆
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2
    const strut = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.2, 6), metalMat)
    strut.position.set(Math.cos(a) * dishR * 0.6, 0.09, Math.sin(a) * dishR * 0.6)
    strut.rotation.z = Math.cos(a) * 0.5
    strut.rotation.x = -Math.sin(a) * 0.5
    dishPivot.add(strut)
  }
  root.add(dishPivot)

  // ── 4. Surface：机柜面板细节 ──
  // 散热格栅
  for (let i = 0; i < 6; i++) {
    const g = new THREE.Mesh(new THREE.BoxGeometry(cabW - 0.14, 0.02, 0.01), darkMat)
    g.position.set(0, 0.35 + i * 0.09, cabD / 2 + 0.006)
    root.add(g)
  }
  // 指示灯
  const lampMat = new THREE.MeshStandardMaterial({ color: 0x22d3ee, emissive: 0x22d3ee, emissiveIntensity: 1.2 })
  for (let i = 0; i < 3; i++) {
    const lamp = new THREE.Mesh(new THREE.CircleGeometry(0.018, 12), lampMat)
    lamp.position.set(-0.28 + i * 0.07, 0.9, cabD / 2 + 0.007)
    root.add(lamp)
  }
  // 侧面接线口
  const port = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.1, 0.03), darkMat)
  port.position.set(cabW / 2 + 0.01, 0.32, 0)
  root.add(port)

  // ── 7. Interaction：反射镜缓慢转动扫描 ──
  root.userData.tick = (delta: number) => {
    dishPivot.rotation.y += delta * 0.35
  }
  root.userData.labelHeight = 2.0
  return root
}
