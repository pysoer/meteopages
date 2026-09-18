/**
 * 超声波蒸发传感器（Ultrasonic Evaporation Sensor）
 *
 * 形态依据（用户明确指出 + 参考图 public/equipment/evapsensor.jpg）：
 *   ——「它就是一个没有底座的百叶箱」
 * 完全复用百叶箱（StevensonScreen）的箱体 + 大出檐平顶构件，
 * 箱体直接坐落在地面草皮上：无立柱、无底座、无任何附加物。
 *
 * 八阶段管线：Blockout → Structural → Form → Material → Surface → Lighting → Interaction → Optimization
 */
import * as THREE from 'three'
import { makeMaterials, createCabinet, createRoof } from './StevensonScreen'

export function createUltrasonicEvap(): THREE.Group {
  const root = new THREE.Group()
  root.name = 'UltrasonicEvap'

  const mats = makeMaterials()

  // ── 尺寸：与百叶箱同规格（箱体 1.0 × 0.75 × 0.6 m），直接落地 ──
  const cabW = 1.0
  const cabH = 0.6

  // 1. 箱体（原点 = 地面接触点；门朝 -Z，与百叶箱一致）
  const cabinet = createCabinet(cabH, mats)
  cabinet.rotation.y = Math.PI
  cabinet.position.y = cabH / 2
  root.add(cabinet)

  // 2. 大出檐平顶（含支撑角铁与防水沿），箱顶之上留窄缝
  const roof = createRoof(cabW, 0.75, mats)
  roof.position.y = cabH + 0.02
  root.add(roof)

  root.userData.tick = (_delta: number) => {
    // 静态箱体，无动画
  }

  // 总高 ≈ 0.7m（无立柱、无底座）
  root.userData.labelHeight = 1.15
  return root
}
