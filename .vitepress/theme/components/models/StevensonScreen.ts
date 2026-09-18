/**
 * 百叶箱（Stevensons Screen）— 由参考图像重建的程序化 Three.js 模型
 *
 * 建管线：blockout → structural → form → material → surface → lighting → interaction → optimization
 * 参考图：气象观测场白色百叶箱，双门百叶格栅 + 平顶出檐 + 锥形立柱
 *
 * 用法：
 *   import { createStevensonScreen } from './models/StevensonScreen'
 *   const screen = createStevensonScreen()
 *   scene.add(screen)
 */

import * as THREE from 'three'

// ============================================================
// 材质定义（从参考图像素推导 PBR 参数）
// ============================================================
export function makeMaterials() {
  // 主体白色 — 哑光漆面，轻微黄色老化
  const bodyWhite = new THREE.MeshStandardMaterial({
    color: 0xf0f2f4,
    roughness: 0.72,
    metalness: 0.02,
  })

  // 百叶格栅 — 同色但略深，增加层次
  const louverMat = new THREE.MeshStandardMaterial({
    color: 0xe8eaec,
    roughness: 0.68,
    metalness: 0.03,
  })

  // 金属件（铰链、搭扣、角铁）— 浅灰金属
  const metalMat = new THREE.MeshStandardMaterial({
    color: 0x9aa5b0,
    roughness: 0.42,
    metalness: 0.65,
  })

  // 屋顶 — 略带灰调的白色
  const roofMat = new THREE.MeshStandardMaterial({
    color: 0xdcdfe4,
    roughness: 0.78,
    metalness: 0.01,
  })

  // 立柱 — 纯白光滑
  const pedestalMat = new THREE.MeshStandardMaterial({
    color: 0xfafafa,
    roughness: 0.35,
    metalness: 0.05,
  })

  // 接线盒/电子仓 — 深灰
  const elecMat = new THREE.MeshStandardMaterial({
    color: 0x6b7280,
    roughness: 0.55,
    metalness: 0.3,
  })

  return { bodyWhite, louverMat, metalMat, roofMat, pedestalMat, elecMat }
}

// ============================================================
// Stage 1-3: Blockout → Structural → Form（合并为构建函数）
// ============================================================

/** 创建百叶格栅面板 */
export function createLouverPanel(w: number, h: number, slatCount: number, mat: THREE.Material) {
  const group = new THREE.Group()
  const slatH = h / (slatCount + 1) * 0.7       // 百叶条高度（留间隙）
  const gap = h / (slatCount + 1) * 0.3           // 间隙
  const slatGeo = new THREE.BoxGeometry(w + 0.02, slatH, 0.015)

  for (let i = 0; i < slatCount; i++) {
    const y = -h / 2 + gap + i * (slatH + gap) + slatH / 2
    const slat = new THREE.Mesh(slatGeo, mat)
    slat.position.set(0, y, 0)
    group.add(slat)
  }
  // 背板（半透明，防止穿帮）
  const backGeo = new THREE.BoxGeometry(w - 0.04, h - 0.04, 0.008)
  const backMat = new THREE.MeshStandardMaterial({
    color: 0xe0e4e8,
    roughness: 0.8,
    metalness: 0,
    transparent: true,
    opacity: 0.35,
  })
  const back = new THREE.Mesh(backGeo, backMat)
  group.add(back)

  return group
}

/** 创建单扇门（含百叶 + 边框 + 铰链 + 搭扣） */
export function createDoor(
  doorW: number, doorH: number,
  isLeft: boolean,
  mats: { louverMat: THREE.Material; bodyWhite: THREE.Material; metalMat: THREE.Material },
) {
  const door = new THREE.Group()

  // 门框
  const frameGeo = new THREE.BoxGeometry(doorW, doorH, 0.06)
  const frame = new THREE.Mesh(frameGeo, mats.bodyWhite)
  door.add(frame)

  // 百叶格栅（内嵌）
  const louver = createLouverPanel(doorW - 0.08, doorH - 0.1, 14, mats.louverMat)
  louver.position.z = 0.03
  door.add(louver)

  // 铰链（门轴侧）
  const hingeGeo = new THREE.BoxGeometry(0.03, 0.12, 0.05)
  const hingeX = isLeft ? -doorW / 2 : doorW / 2
  for (let iy = -1; iy <= 1; iy++) {
    const hinge = new THREE.Mesh(hingeGeo, mats.metalMat)
    hinge.position.set(hingeX, iy * (doorH * 0.28), 0.03)
    door.add(hinge)
  }

  // 搭扣（把手侧中部）
  if (!isLeft) {
    const latchBase = new THREE.Mesh(
      new THREE.BoxGeometry(0.06, 0.08, 0.04),
      mats.metalMat,
    )
    latchBase.position.set(doorW / 2 - 0.02, 0, 0.05)
    door.add(latchBase)
    const latchHandle = new THREE.Mesh(
      new THREE.BoxGeometry(0.025, 0.06, 0.025),
      mats.metalMat,
    )
    latchHandle.position.set(doorW / 2 + 0.01, 0, 0.08)
    door.add(latchHandle)
  }

  return door
}

/** 创建主体箱体 */
export function createCabinet(cabH: number, mats: ReturnType<typeof makeMaterials>) {
  const cab = new THREE.Group()
  const cabW = 1.0, cabD = 0.75

  // 顶板
  const topGeo = new THREE.BoxGeometry(cabW + 0.06, 0.04, cabD + 0.06)
  const top = new THREE.Mesh(topGeo, mats.bodyWhite)
  top.position.y = cabH / 2
  cab.add(top)

  // 底板
  const bot = new THREE.Mesh(topGeo, mats.bodyWhite)
  bot.position.y = -cabH / 2
  cab.add(bot)

  // 左右侧板
  const sideGeo = new THREE.BoxGeometry(0.04, cabH, cabD)
  const leftSide = new THREE.Mesh(sideGeo, mats.bodyWhite)
  leftSide.position.x = -cabW / 2
  cab.add(leftSide)
  const rightSide = new THREE.Mesh(sideGeo, mats.bodyWhite)
  rightSide.position.x = cabW / 2
  cab.add(rightSide)

  // 背板
  const backGeo = new THREE.BoxGeometry(cabW - 0.08, cabH - 0.08, 0.03)
  const back = new THREE.Mesh(backGeo, mats.bodyWhite)
  back.position.z = -cabD / 2
  cab.add(back)

  // 双门
  const doorW = (cabW - 0.06) / 2
  const doorH = cabH - 0.12
  const leftDoor = createDoor(doorW, doorH, true, mats)
  leftDoor.position.set(-doorW / 2 - 0.03, 0, cabD / 2 - 0.01)
  cab.add(leftDoor)

  const rightDoor = createDoor(doorW, doorH, false, mats)
  rightDoor.position.set(doorW / 2 + 0.03, 0, cabD / 2 - 0.01)
  cab.add(rightDoor)

  return cab
}

/** 创建屋顶（平顶 + 出檐 + 支撑角铁） */
export function createRoof(cabW: number, cabD: number, mats: ReturnType<typeof makeMaterials>) {
  const roof = new THREE.Group()
  const overhang = 0.12
  const roofW = cabW + overhang * 2
  const roofD = cabD + overhang * 2
  const roofT = 0.05

  // 屋顶板
  const topGeo = new THREE.BoxGeometry(roofW, roofT, roofD)
  const top = new THREE.Mesh(topGeo, mats.roofMat)
  top.position.y = roofT / 2
  roof.add(top)

  // 四根支撑角铁（屋檐下）
  const angleGeo = new THREE.BoxGeometry(0.025, 0.08, 0.025)
  const ox = cabW / 2 + overhang / 2
  const oz = cabD / 2 + overhang / 2
  for (const sx of [-ox, ox]) {
    for (const sz of [-oz, oz]) {
      const angle = new THREE.Mesh(angleGeo, mats.metalMat)
      angle.position.set(sx, -0.04, sz)
      roof.add(angle)
    }
  }

  // 屋顶边缘防水沿（薄边）
  const lipGeo = new THREE.BoxGeometry(roofW + 0.02, 0.015, roofD + 0.02)
  const lip = new THREE.Mesh(lipGeo, mats.roofMat)
  lip.position.y = -roofT / 2 + 0.008
  roof.add(lip)

  return roof
}

/** 创建锥形立柱 */
function createPedestal(mats: ReturnType<typeof makeMaterials>) {
  const ped = new THREE.Group()
  const pedH = 1.25
  const topR = 0.16, botR = 0.26

  // 锥形柱体
  const pedGeo = new THREE.CylinderGeometry(topR, botR, pedH, 20)
  const pedMesh = new THREE.Mesh(pedGeo, mats.pedestalMat)
  pedMesh.position.y = -pedH / 2
  ped.add(pedMesh)

  // 底座圆盘
  const baseGeo = new THREE.CylinderGeometry(botR + 0.06, botR + 0.08, 0.06, 24)
  const base = new THREE.Mesh(baseGeo, mats.pedestalMat)
  base.position.y = -pedH - 0.03
  ped.add(base)

  return ped
}

/** 创建安装架 + 接线盒 */
function createMount(cabW: number, mats: ReturnType<typeof makeMaterials>) {
  const mount = new THREE.Group()

  // 安装托盘
  const trayGeo = new THREE.BoxGeometry(cabW * 0.7, 0.06, 0.45)
  const tray = new THREE.Mesh(trayGeo, mats.metalMat)
  tray.position.y = -0.03
  mount.add(tray)

  // 接线盒
  const boxGeo = new THREE.BoxGeometry(0.3, 0.12, 0.22)
  const box = new THREE.Mesh(boxGeo, mats.elecMat)
  box.position.set(0.05, -0.12, 0.05)
  mount.add(box)

  // 简化线缆（两条曲线用 TubeGeometry 近似）
  const cablePts = [
    new THREE.Vector3(0, -0.05, 0.1),
    new THREE.Vector3(0.02, -0.1, 0.08),
    new THREE.Vector3(0.05, -0.14, 0.06),
  ]
  const cableGeo = new THREE.TubeGeometry(
    new THREE.CatmullRomCurve3(cablePts),
    8, 0.012, 6, false,
  )
  const cableMat = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.9 })
  const cable = new THREE.Mesh(cableGeo, cableMat)
  mount.add(cable)

  return mount
}

// ============================================================
// 主工厂函数
// ============================================================

export function createStevensonScreen(): THREE.Group {
  const root = new THREE.Group()
  const mats = makeMaterials()

  const cabW = 1.0
  const cabH = 0.6
  const pedH = 1.25

  // 内部容器：模型原点 = 地面接触点（底座底面），便于场景统一以 headY=0 放置
  const body = new THREE.Group()

  // 1. 立柱（底座，高 1.25m），柱顶位于 body 局部 y=0
  const pedestal = createPedestal(mats)
  body.add(pedestal)

  // 2. 安装架 + 接线盒（位于柱顶、箱体下方）
  const mount = createMount(cabW, mats)
  mount.position.y = 0
  body.add(mount)

  // 3. 箱体（高 60cm，门朝北 -Z），底贴柱顶
  const cabinet = createCabinet(cabH, mats)
  cabinet.rotation.y = Math.PI
  cabinet.position.y = cabH / 2
  body.add(cabinet)

  // 4. 屋顶（箱体之上）
  const roof = createRoof(cabW, 0.75, mats)
  roof.position.y = cabH + 0.02
  body.add(roof)

  // 抬升使底座底面落在 body 原点（地面）；root 原点保持 0，交由场景统一放置
  body.position.y = pedH + 0.06
  root.add(body)

  // userData 用于外部控制
  root.userData.type = 'stevenson-screen'
  root.userData.tick = (_delta: number) => {
    // 可扩展：百叶门微动动画等
  }

  return root
}
