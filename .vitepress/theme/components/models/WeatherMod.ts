/**
 * 人工影响天气装备（37mm 高射炮，Weather Modification — 37mm AA Gun）
 *
 * 形态依据（参考图 public/equipment/weathermod.png 实拍重建，55式37mm高射炮）：
 *   - 军绿色炮身：长炮管 + 炮口制退器 + 复进机，上仰约 50°
 *   - 炮床：中央立轴回转座 + 摇架 + 防盾板 + 炮手座椅
 *   - 双后大架（展开呈八字）+ 大架尾驻锄
 *   - 四轮：前方一对大橡胶轮（带孔轮辋），大架尾一对小轮
 *
 * 八阶段管线：Blockout → Structural → Form → Material → Surface → Lighting → Interaction → Optimization
 */
import * as THREE from 'three'

export function createWeatherMod(): THREE.Group {
  const root = new THREE.Group()
  root.name = 'WeatherMod'

  // ── 材质 ──
  const greenMat = new THREE.MeshStandardMaterial({ color: 0x5c6b47, roughness: 0.62, metalness: 0.28 })
  const darkGreenMat = new THREE.MeshStandardMaterial({ color: 0x47543a, roughness: 0.65, metalness: 0.25 })
  const rubberMat = new THREE.MeshStandardMaterial({ color: 0x26292b, roughness: 0.9, metalness: 0.05 })
  const steelMat = new THREE.MeshStandardMaterial({ color: 0x3a3f36, roughness: 0.5, metalness: 0.5 })
  const rimMat = new THREE.MeshStandardMaterial({ color: 0x66754f, roughness: 0.55, metalness: 0.3 })

  // 车轮工厂（轮轴沿 z 轴）：(外半径, 轮胎厚, 轮辋厚)
  function makeWheel(R: number, tube: number, rimW: number): THREE.Group {
    const w = new THREE.Group()
    const tire = new THREE.Mesh(new THREE.TorusGeometry(R, tube, 12, 28), rubberMat)
    w.add(tire)
    const rim = new THREE.Mesh(new THREE.CylinderGeometry(R, R, rimW, 24), rimMat)
    rim.rotation.x = Math.PI / 2
    w.add(rim)
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(R * 0.18, R * 0.18, rimW + 0.03, 12), steelMat)
    hub.rotation.x = Math.PI / 2
    w.add(hub)
    // 轮辋减重孔
    const holes = 5
    for (let i = 0; i < holes; i++) {
      const a = (i / holes) * Math.PI * 2
      const hole = new THREE.Mesh(new THREE.CylinderGeometry(R * 0.16, R * 0.16, rimW + 0.02, 10), darkGreenMat)
      hole.rotation.x = Math.PI / 2
      hole.position.set(Math.cos(a) * R * 0.52, Math.sin(a) * R * 0.52, 0)
      w.add(hole)
    }
    return w
  }

  // ── 1. Blockout：双后大架（八字展开）+ 尾轮 + 驻锄 ──
  for (const s of [-1, 1]) {
    const trail = new THREE.Group()
    trail.rotation.y = s * 0.36 // 约 ±20° 张开
    const beam = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.14, 0.16), greenMat)
    beam.position.set(-0.95, 0.34, 0)
    trail.add(beam)
    // 大架尾部上翘过渡
    const tip = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.1, 0.14), greenMat)
    tip.position.set(-1.85, 0.28, 0)
    tip.rotation.z = -0.12
    trail.add(tip)
    // 驻锄板
    const spade = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.42, 0.36), darkGreenMat)
    spade.position.set(-2.05, 0.24, 0)
    trail.add(spade)
    // 大架尾小轮
    const rw = makeWheel(0.17, 0.06, 0.1)
    rw.position.set(-1.62, 0.3, 0)
    trail.add(rw)
    root.add(trail)
  }

  // ── 2. Structural：炮床（底架 + 回转座 + 立轴） ──
  const lowerCarriage = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.26, 0.56), greenMat)
  lowerCarriage.position.y = 0.3
  root.add(lowerCarriage)
  const turntable = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.33, 0.18, 20), darkGreenMat)
  turntable.position.y = 0.52
  root.add(turntable)
  const column = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.34, 0.26), greenMat)
  column.position.y = 0.76
  root.add(column)

  // ── 3. Form：摇架 + 炮管（上仰约 50°，指向 +x） ──
  const cradle = new THREE.Group()
  cradle.position.y = 1.0
  cradle.rotation.z = 0.9
  // 摇架箱体
  const cradleBox = new THREE.Mesh(new THREE.BoxGeometry(0.66, 0.26, 0.28), greenMat)
  cradleBox.position.set(0.12, 0, 0)
  cradle.add(cradleBox)
  // 炮管
  const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.056, 2.0, 16), greenMat)
  barrel.rotation.z = -Math.PI / 2
  barrel.position.set(1.45, 0.02, 0)
  cradle.add(barrel)
  // 炮口制退器（双室）
  const muzzle = new THREE.Mesh(new THREE.CylinderGeometry(0.082, 0.082, 0.36, 16), steelMat)
  muzzle.rotation.z = -Math.PI / 2
  muzzle.position.set(2.54, 0.02, 0)
  cradle.add(muzzle)
  for (const mx of [2.45, 2.63]) {
    const ring = new THREE.Mesh(new THREE.CylinderGeometry(0.086, 0.086, 0.03, 16), darkGreenMat)
    ring.rotation.z = -Math.PI / 2
    ring.position.set(mx, 0.02, 0)
    cradle.add(ring)
  }
  // 复进机（炮管下方细筒）
  const recoil = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.032, 1.15, 12), steelMat)
  recoil.rotation.z = -Math.PI / 2
  recoil.position.set(1.05, -0.09, 0)
  cradle.add(recoil)
  // 炮闩 / 尾部机匣
  const breech = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.34, 0.3), darkGreenMat)
  breech.position.set(-0.24, 0.02, 0)
  cradle.add(breech)
  // 瞄准具
  const sightPost = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.2, 10), steelMat)
  sightPost.position.set(-0.18, 0.28, 0.08)
  cradle.add(sightPost)
  const sightBox = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.1, 0.1), greenMat)
  sightBox.position.set(-0.18, 0.4, 0.08)
  cradle.add(sightBox)
  // 防盾板（微前倾）
  const shield = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.52, 0.025), greenMat)
  shield.position.set(0.52, -0.1, 0.02)
  shield.rotation.x = 0.1
  cradle.add(shield)
  root.add(cradle)

  // ── 4. Surface：前大轮（一对）+ 前轴 ──
  const axle = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 1.52, 12), steelMat)
  axle.rotation.x = Math.PI / 2
  axle.position.set(0.38, 0.44, 0)
  root.add(axle)
  for (const s of [-1, 1]) {
    const fw = makeWheel(0.3, 0.1, 0.16)
    fw.position.set(0.38, 0.44, s * 0.74)
    root.add(fw)
  }

  // ── 5. Surface：炮手座椅（右侧） ──
  const seat = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.04, 0.3), darkGreenMat)
  seat.position.set(0.08, 0.82, 0.44)
  root.add(seat)
  const backrest = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.36, 0.3), darkGreenMat)
  backrest.position.set(-0.1, 0.99, 0.44)
  backrest.rotation.z = 0.18
  root.add(backrest)
  for (const lz of [0.32, 0.56]) {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.36, 8), steelMat)
    leg.position.set(0.08, 0.62, lz)
    root.add(leg)
  }

  // 炮口最高点 ≈ 3.0m，炮全长（含大架）≈ 3.4m
  root.userData.labelHeight = 3.2
  return root
}
