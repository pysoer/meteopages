/**
 * 超声波蒸发传感器（Ultrasonic Evaporation Sensor）
 *
 * 形态依据（用户明确指出）：
 *   ——「它就是一个没有底座的百叶箱」
 * 因此本模型直接复用百叶箱（StevensonScreen）的箱体 + 屋顶构件，
 * 仅去掉锥形立柱与安装托盘，箱体直接坐落在地面上；
 * 另加一根贴地连通管（通向 E-601 蒸发桶）与引出电缆，
 * 箱内顶部吊装朝下的超声波测距探头。
 *
 * 八阶段管线：Blockout → Structural → Form → Material → Surface → Lighting → Interaction → Optimization
 */
import * as THREE from 'three'
import { makeMaterials, createCabinet, createRoof } from './StevensonScreen'

export function createUltrasonicEvap(): THREE.Group {
  const root = new THREE.Group()
  root.name = 'UltrasonicEvap'

  const mats = makeMaterials()

  // ── 尺寸：与百叶箱同规格，但无立柱、无底座 ──
  const cabW = 1.0
  const cabH = 0.6          // 箱体高 60cm
  const footPad = 0.04      // 箱体底板离地间隙（仅垫脚，非底座）

  // ── 1. Blockout：箱体直接落地 ──
  const cabinet = createCabinet(cabH, mats)
  cabinet.position.y = cabH / 2 + footPad
  root.add(cabinet)

  // 2. 屋顶（含出檐与角铁）
  const roof = createRoof(cabW, 0.75, mats)
  roof.position.y = cabH + footPad + 0.02
  const roofTopY = roof.position.y + 0.06

  // ── 3. 落地的短垫脚（避免箱体直接压在土面上，仍是「无底座」） ──
  const padGeo = new THREE.BoxGeometry(0.1, footPad, 0.1)
  for (const sx of [-1, 1]) {
    for (const sz of [-1, 1]) {
      const pad = new THREE.Mesh(padGeo, mats.metalMat)
      pad.position.set(sx * 0.42, footPad / 2, sz * 0.3)
      root.add(pad)
    }
  }

  // ── 4. Form：箱内吊装的超声波测距探头（朝下测量水面） ──
  const probeMat = new THREE.MeshStandardMaterial({
    color: 0x8fd8ff, emissive: 0x2f6f9f, emissiveIntensity: 0.5, roughness: 0.2, metalness: 0.2,
  })
  const probeY = cabH + footPad - 0.12
  const probeStem = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.12, 10), mats.metalMat)
  probeStem.position.y = probeY + 0.08
  root.add(probeStem)
  const probeHead = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.095, 0.1, 24), mats.elecMat)
  probeHead.position.y = probeY
  root.add(probeHead)
  // 朝下的换能器发光面
  const transducer = new THREE.Mesh(new THREE.CircleGeometry(0.07, 24), probeMat)
  transducer.rotation.x = Math.PI / 2
  transducer.position.y = probeY - 0.051
  root.add(transducer)
  // 探头向下打出的测距锥（示意，半透明）
  const coneMat = new THREE.MeshBasicMaterial({
    color: 0x7fd4ff, transparent: true, opacity: 0.12, side: THREE.DoubleSide, depthWrite: false,
  })
  const cone = new THREE.Mesh(new THREE.ConeGeometry(0.145, 0.34, 20, 1, true), coneMat)
  cone.rotation.x = Math.PI
  cone.position.y = probeY - 0.16
  root.add(cone)
  // 静水筒水面（箱内）
  const water = new THREE.Mesh(
    new THREE.CircleGeometry(0.1, 20),
    new THREE.MeshStandardMaterial({
      color: 0x2f7fb8, roughness: 0.12, metalness: 0.15, transparent: true, opacity: 0.75,
    }),
  )
  water.rotation.x = -Math.PI / 2
  water.position.set(0, footPad + 0.22, 0)
  root.add(water)

  // ── 5. Surface：贴地连通管（通往蒸发桶）+ 法兰 + 引出电缆 ──
  const pipeMat = new THREE.MeshStandardMaterial({ color: 0xc9d1d6, roughness: 0.32, metalness: 0.6 })
  const pipePts = [
    new THREE.Vector3(0.0, 0.09, -0.34),
    new THREE.Vector3(0.12, 0.06, -0.5),
    new THREE.Vector3(0.5, 0.05, -0.62),
    new THREE.Vector3(0.95, 0.05, -0.66),
  ]
  const pipe = new THREE.Mesh(
    new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pipePts), 24, 0.035, 12, false),
    pipeMat,
  )
  root.add(pipe)
  // 管口法兰（接蒸发桶一侧）
  const flange = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.04, 18), pipeMat)
  flange.rotation.z = Math.PI / 2
  flange.position.set(0.97, 0.05, -0.66)
  root.add(flange)
  // 管卡
  for (const px of [0.3, 0.7]) {
    const clip = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.05, 0.03), mats.metalMat)
    clip.position.set(px, 0.025, -0.62 - (px - 0.3) * 0.08)
    root.add(clip)
  }

  // 电缆：箱体侧下方引出 → 落地
  const cablePts = [
    new THREE.Vector3(-0.5, cabH * 0.45 + footPad, 0.3),
    new THREE.Vector3(-0.62, 0.3, 0.42),
    new THREE.Vector3(-0.74, 0.05, 0.5),
  ]
  const cable = new THREE.Mesh(
    new THREE.TubeGeometry(new THREE.CatmullRomCurve3(cablePts), 18, 0.011, 8, false),
    new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.75 }),
  )
  root.add(cable)
  // 引出口
  const gland = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.03, 12), mats.metalMat)
  gland.rotation.x = Math.PI / 2
  gland.position.set(-0.5, cabH * 0.45 + footPad, 0.36)
  root.add(gland)

  // ── 6. Interaction：超声波测距呼吸脉冲 ──
  root.userData.tick = (_delta: number) => {
    const t = performance.now() / 1000
    const m = probeMat as THREE.MeshStandardMaterial
    m.emissiveIntensity = 0.35 + Math.abs(Math.sin(t * 2.4)) * 0.5
    ;(coneMat as THREE.MeshBasicMaterial).opacity = 0.08 + Math.abs(Math.sin(t * 2.4)) * 0.1
    water.position.y = footPad + 0.22 + Math.sin(t * 0.7) * 0.004
  }

  // 总高 ≈ 0.72m（无立柱、无底座）
  root.userData.labelHeight = 1.05
  void roofTopY
  return root
}
