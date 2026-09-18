/**
 * 人工影响天气装备（Weather Modification Equipment）
 *
 * 参考特征（依据 equipment/weathermod.md 描述）：
 *   - 地面增雨防雹火箭发射架（四脚支架 + 定向导轨）
 *   - 导轨上装载增雨防雹火箭弹（圆柱弹身 + 锥形战斗部 + 尾翼）
 *   - 旁设控制箱
 *
 * 八阶段管线：Blockout → Structural → Form → Material → Surface → Lighting → Interaction → Optimization
 */
import * as THREE from 'three'

export function createWeatherMod(): THREE.Group {
  const root = new THREE.Group()
  root.name = 'WeatherMod'

  // ── 材质 ──
  const frameMat = new THREE.MeshStandardMaterial({ color: 0x5b666e, roughness: 0.5, metalness: 0.6 })
  const railMat = new THREE.MeshStandardMaterial({ color: 0xbfc7cc, roughness: 0.32, metalness: 0.7 })
  const bodyMat = new THREE.MeshStandardMaterial({ color: 0xd8dde1, roughness: 0.4, metalness: 0.35 })
  const noseMat = new THREE.MeshStandardMaterial({ color: 0xc0392b, roughness: 0.45, metalness: 0.2 })
  const boxMat = new THREE.MeshStandardMaterial({ color: 0x2b2f33, roughness: 0.55, metalness: 0.3 })

  // ── 1. Blockout：四脚支架 ──
  const legH = 0.95
  const spread = 0.55
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + Math.PI / 4
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.035, legH, 12), frameMat)
    leg.position.set(Math.cos(a) * spread, legH / 2, Math.sin(a) * spread)
    leg.rotation.z = -Math.cos(a) * 0.18
    leg.rotation.x = Math.sin(a) * 0.18
    root.add(leg)
    // 脚垫
    const pad = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.07, 0.03, 12), boxMat)
    pad.position.set(Math.cos(a) * (spread + 0.09), 0.015, Math.sin(a) * (spread + 0.09))
    root.add(pad)
  }
  // 十字横撑
  const bar1 = new THREE.Mesh(new THREE.BoxGeometry(spread * 2.1, 0.05, 0.05), frameMat)
  bar1.position.y = 0.45; root.add(bar1)
  const bar2 = bar1.clone(); bar2.rotation.y = Math.PI / 2; root.add(bar2)

  // 顶部回转座
  const pivot = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 0.12, 20), frameMat)
  pivot.position.y = legH + 0.06
  root.add(pivot)

  // ── 2. Structural：定向导轨（上仰约 45°） ──
  const railGroup = new THREE.Group()
  railGroup.position.y = legH + 0.12
  railGroup.rotation.z = -Math.PI / 4

  const railLen = 1.7
  const railL = new THREE.Mesh(new THREE.BoxGeometry(0.05, railLen, 0.05), railMat)
  railL.position.set(-0.09, 0, 0)
  const railR = new THREE.Mesh(new THREE.BoxGeometry(0.05, railLen, 0.05), railMat)
  railR.position.set(0.09, 0, 0)
  railGroup.add(railL, railR)
  // 导轨横档
  for (let i = -2; i <= 2; i++) {
    const rung = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.03, 0.03), railMat)
    rung.position.y = i * railLen * 0.2
    railGroup.add(rung)
  }
  root.add(railGroup)

  // ── 3. Form：装载的增雨防雹火箭弹 ──
  const rocket = new THREE.Group()
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.06, 0.85, 18), bodyMat)
  rocket.add(body)
  const nose = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.24, 18), noseMat)
  nose.position.y = 0.85 / 2 + 0.12
  rocket.add(nose)
  // 尾翼
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2
    const fin = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.16, 0.012), bodyMat)
    fin.position.set(Math.cos(a) * 0.1, -0.32, Math.sin(a) * 0.1)
    fin.rotation.y = a
    rocket.add(fin)
  }
  // 弹身色带
  const band = new THREE.Mesh(new THREE.CylinderGeometry(0.062, 0.062, 0.06, 18), noseMat)
  band.position.y = 0.1
  rocket.add(band)
  rocket.position.set(0, 0.04, 0)
  railGroup.add(rocket)

  // ── 4. Surface：旁侧控制箱 ──
  const ctrl = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.28, 0.24), boxMat)
  ctrl.position.set(spread + 0.35, 0.14, spread * 0.3)
  root.add(ctrl)
  const lampMat = new THREE.MeshStandardMaterial({ color: 0xf43f5e, emissive: 0xf43f5e, emissiveIntensity: 1.1 })
  const lamp = new THREE.Mesh(new THREE.CircleGeometry(0.015, 10), lampMat)
  lamp.position.set(ctrl.position.x, 0.22, ctrl.position.z + 0.121)
  root.add(lamp)
  // 控制电缆
  const cablePts = [
    new THREE.Vector3(spread + 0.2, 0.14, spread * 0.3),
    new THREE.Vector3(0.35, 0.05, 0.25),
    new THREE.Vector3(0.06, 0.6, 0),
  ]
  const cable = new THREE.Mesh(
    new THREE.TubeGeometry(new THREE.CatmullRomCurve3(cablePts), 18, 0.01, 8, false),
    new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.75 }),
  )
  root.add(cable)

  root.userData.labelHeight = 2.0
  return root
}
