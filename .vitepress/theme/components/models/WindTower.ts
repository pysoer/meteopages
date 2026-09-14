/**
 * 风塔（Wind Tower）— 由参考图像重建的程序化 Three.js 模型
 *
 * 八阶段管线：blockout → structural → form → material → surface → lighting → interaction → optimization
 * 参考图：气象观测场格构式测风塔，高 10.5m，顶部三杯风速仪 + 风向标
 *
 * 用法：
 *   import { createWindTower } from './models/WindTower'
 *   const tower = createWindTower()
 *   scene.add(tower)
 */

import * as THREE from 'three'

// ============================================================
// 常量与材质
// ============================================================
const TOWER_H = 10.5          // 塔身总高（米）
const BASE_H = 0.35            // 混凝土基座高度
const PLATFORM_H = 0.12        // 顶部平台厚度
const RAILING_H = 0.55         // 护栏高度

// 截面尺寸（底部大、顶部小，线性插值）
function sectionWidth(y: number): number {
  // y=0(底) → 0.85m, y=TOWER_H(顶) → 0.45m
  return 0.85 - (y / TOWER_H) * 0.4
}

function makeMaterials() {
  // 塔身钢材 — 浅灰镀锌/喷漆
  const steelMat = new THREE.MeshStandardMaterial({
    color: 0xb8c0c8,
    roughness: 0.55,
    metalness: 0.7,
  })

  // 混凝土基座
  const concreteMat = new THREE.MeshStandardMaterial({
    color: 0xc8cfc7,
    roughness: 0.9,
    metalness: 0.02,
  })

  // 护栏 — 同钢材但稍深
  const railMat = new THREE.MeshStandardMaterial({
    color: 0x9aa5b0,
    roughness: 0.45,
    metalness: 0.75,
  })

  // 风杯/风向标 — 白色塑料/金属
  const sensorWhite = new THREE.MeshStandardMaterial({
    color: 0xf0f2f4,
    roughness: 0.4,
    metalness: 0.15,
  })

  // 传感器金属件
  const sensorMetal = new THREE.MeshStandardMaterial({
    color: 0x88929c,
    roughness: 0.35,
    metalness: 0.8,
  })

  return { steelMat, concreteMat, railMat, sensorWhite, sensorMetal }
}

// ============================================================
// Stage 1-3: Blockout → Structural → Form
// ============================================================

/** 创建单根角钢/立柱段 */
function createLegSegment(
  y0: number, y1: number,
  cornerIdx: number,        // 0=SW, 1=SE, 2=NE, 3=NW
  mat: THREE.Material,
): THREE.Mesh {
  const w0 = sectionWidth(y0) / 2
  const w1 = sectionWidth(y1) / 2
  // 四个角的 x,z 坐标
  const corners = [
    [-w0, -w0], [w0, -w0], [w0, w0], [-w0, w0],
  ]
  const c0 = corners[cornerIdx]
  const c1 = [
    [-w1, -w1], [w1, -w1], [w1, w1], [-w1, w1],
  ][cornerIdx]

  const dx = c1[0] - c0[0]
  const dz = c1[1] - c0[1]
  const len = Math.sqrt(dx * dx + dz * dz + (y1 - y0) * (y1 - y0))
  const geo = new THREE.CylinderGeometry(0.022, 0.022, len, 6)
  const mesh = new THREE.Mesh(geo, mat)

  // 定位到段中点
  mesh.position.set(
    (c0[0] + c1[0]) / 2,
    (y0 + y1) / 2,
    (c0[1] + c1[1]) / 2,
  )
  // 朝向：从下端指向上端
  mesh.lookAt(c1[0], y1, c1[1])
  mesh.rotateX(Math.PI / 2) // Cylinder 默认沿 Y，需转回

  return mesh
}

/** 创建单根斜撑（对角线连接） */
function createBrace(
  y0: number, y1: number,
  x0: number, z0: number,
  x1: number, z1: number,
  mat: THREE.Material,
): THREE.Mesh {
  const dx = x1 - x0, dz = z1 - z0, dy = y1 - y0
  const len = Math.sqrt(dx * dx + dy * dy + dz * dz)
  const geo = new THREE.CylinderGeometry(0.012, 0.012, len, 5)
  const mesh = new THREE.Mesh(geo, mat)
  mesh.position.set((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2)
  mesh.lookAt(x1, y1, z1)
  mesh.rotateX(Math.PI / 2)
  return mesh
}

/** 创建一层桁架（含 4 根立柱 + X 斜撑） */
function createTrussLayer(
  y0: number, y1: number,
  mat: THREE.Material,
): THREE.Group {
  const layer = new THREE.Group()

  // 4 根主立柱
  for (let i = 0; i < 4; i++) {
    layer.add(createLegSegment(y0, y1, i, mat))
  }

  // X 斜撑（每面两根交叉）
  const w0 = sectionWidth(y0) / 2
  const w1 = sectionWidth(y1) / 2
  // 四个面的斜撑
  const faces = [
    [[-w0, -w0], [w0, -w0]],   // 南面
    [[w0, -w0], [w1, -w1]],
    [[w0, -w0], [w0, w0]],     // 东面
    [[w1, -w1], [w1, w1]],
    [[w0, w0], [-w0, w0]],     // 北面
    [[w1, w1], [-w1, w1]],
    [[-w0, w0], [-w0, -w0]],  // 西面
    [[-w1, w1], [-w1, -w1]],
  ]
  for (let f = 0; f < faces.length; f += 2) {
    const [p0, p1] = faces[f]
    const [p2, p3] = faces[f + 1]
    layer.add(createBrace(y0, y1, p0[0], p0[1], p3[0], p3[1], mat))
    layer.add(createBrace(y0, y1, p1[0], p1[1], p2[0], p2[1], mat))
  }

  // 水平横档（每层上下各一圈）
  for (const y of [y0, y1]) {
    const wy = sectionWidth(y) / 2
    const hGeo = new THREE.CylinderGeometry(0.015, 0.015, wy * 2, 5)
    // 南北向横档（前后）
    for (const zx of [-wy, wy]) {
      const hMesh = new THREE.Mesh(hGeo, mat)
      hMesh.rotation.z = Math.PI / 2
      hMesh.position.set(0, y, zx)
      layer.add(hMesh)
    }
    // 东西向横档（左右）
    for (const xx of [-wy, wy]) {
      const hMesh2 = new THREE.Mesh(hGeo, mat)
      hMesh2.rotation.x = Math.PI / 2
      hMesh2.position.set(xx, y, 0)
      layer.add(hMesh2)
    }
  }

  return layer
}

/** 创建完整塔身（多层桁架堆叠） */
function createTowerBody(mats: ReturnType<typeof makeMaterials>): THREE.Group {
  const body = new THREE.Group()
  const layerCount = 14          // 层数
  const bodyH = TOWER_H - BASE_H - PLATFORM_H - RAILING_H
  const layerH = bodyH / layerCount

  for (let i = 0; i < layerCount; i++) {
    const y0 = BASE_H + i * layerH
    const y1 = y0 + layerH
    body.add(createTrussLayer(y0, y1, mats.steelMat))
  }

  return body
}

/** 创建混凝土基座 */
function createBase(mat: THREE.Material): THREE.Group {
  const base = new THREE.Group()
  const bw = 1.1

  // 主基座
  const mainGeo = new THREE.BoxGeometry(bw, BASE_H, bw)
  const main = new THREE.Mesh(mainGeo, mat)
  main.position.y = BASE_H / 2
  base.add(main)

  // 底部扩大脚
  const footGeo = new THREE.BoxGeometry(bw + 0.25, 0.08, bw + 0.25)
  const foot = new THREE.Mesh(footGeo, mat)
  foot.position.y = 0.04
  base.add(foot)

  return base
}

/** 创建顶部平台 + 护栏 */
function createPlatform(mats: ReturnType<typeof makeMaterials>): THREE.Group {
  const plat = new THREE.Group()
  const topY = TOWER_H - PLATFORM_H - RAILING_H
  const pw = sectionWidth(topY) + 0.18

  // 平台板
  const deckGeo = new THREE.BoxGeometry(pw, PLATFORM_H, pw)
  const deck = new THREE.Mesh(deckGeo, mats.steelMat)
  deck.position.y = topY + PLATFORM_H / 2
  plat.add(deck)

  // 护栏立柱 + 横杆
  const railY = topY + PLATFORM_H
  const postCount = 4
  const postGeo = new THREE.CylinderGeometry(0.015, 0.015, RAILING_H, 6)
  const railGeo = new THREE.CylinderGeometry(0.008, 0.008, pw - 0.04, 5)

  for (let i = 0; i < postCount; i++) {
    const angle = (i / postCount) * Math.PI * 2 + Math.PI / 4
    const rx = Math.cos(angle) * (pw / 2 - 0.04)
    const rz = Math.sin(angle) * (pw / 2 - 0.04)
    const post = new THREE.Mesh(postGeo, mats.railMat)
    post.position.set(rx, railY + RAILING_H / 2, rz)
    plat.add(post)
  }

  // 横杆（四面）
  for (let s = 0; s < 4; s++) {
    const angle = (s / 4) * Math.PI * 2 + Math.PI / 4
    const nx = Math.cos(angle)
    const nz = Math.sin(angle)
    const rail = new THREE.Mesh(railGeo, mats.railMat)
    rail.position.set(nx * 0.02, railY + RAILING_H * 0.75, nz * 0.02)
    rail.rotation.y = -angle + Math.PI / 2
    plat.add(rail)

    // 下横杆
    const rail2 = rail.clone()
    rail2.position.y = railY + RAILING_H * 0.35
    plat.add(rail2)
  }

  return plat
}

/** 创建三杯风速仪（可旋转） */
function createAnemometer(mats: ReturnType<typeof makeMaterials>): THREE.Group {
  const ano = new THREE.Group()
  const cupR = 0.09
  const armLen = 0.13
  const hubR = 0.025

  // 中心轴
  const shaftGeo = new THREE.CylinderGeometry(0.008, 0.01, 0.18, 6)
  const shaft = new THREE.Mesh(shaftGeo, mats.sensorMetal)
  shaft.position.y = 0.09
  ano.add(shaft)

  // 旋转部件组（用于动画）
  const rotor = new THREE.Group()
  rotor.name = 'anemometer_rotor'

  // 中心轮毂
  const hubGeo = new THREE.SphereGeometry(hubR, 10, 8)
  const hub = new THREE.Mesh(hubGeo, mats.sensorMetal)
  rotor.add(hub)

  // 三个杯子（120° 分布）
  const cupGeo = new THREE.SphereGeometry(cupR, 10, 8, 0, Math.PI * 2, 0, Math.PI * 0.62)
  for (let i = 0; i < 3; i++) {
    const ang = (i / 3) * Math.PI * 2
    // 杯臂
    const armGeo = new THREE.CylinderGeometry(0.006, 0.006, armLen, 5)
    const arm = new THREE.Mesh(armGeo, mats.sensorMetal)
    arm.rotation.z = Math.PI / 2
    arm.position.set(Math.cos(ang) * armLen / 2, 0, Math.sin(ang) * armLen / 2)
    arm.rotation.y = -ang
    rotor.add(arm)

    // 杯子（开口朝外）
    const cup = new THREE.Mesh(cupGeo, mats.sensorWhite)
    cup.position.set(Math.cos(ang) * (armLen + cupR * 0.55), 0, Math.sin(ang) * (armLen + cupR * 0.55))
    // 让杯口朝切线方向（旋转方向）
    cup.rotation.y = -ang + Math.PI / 2
    rotor.add(cup)
  }

  ano.add(rotor)
  ano.userData.rotor = rotor

  return ano
}

/** 创建风向标 */
function createWindVane(mats: ReturnType<typeof makeMaterials>): THREE.Group {
  const vane = new THREE.Group()

  // 立杆
  const poleGeo = new THREE.CylinderGeometry(0.006, 0.01, 0.22, 6)
  const pole = new THREE.Mesh(poleGeo, mats.sensorMetal)
  pole.position.y = 0.11
  vane.add(pole)

  // 旋转部分
  const spinner = new THREE.Group()
  spinner.name = 'wind_vane_spinner'

  // 水平横臂
  const armGeo = new THREE.CylinderGeometry(0.005, 0.005, 0.28, 5)
  const arm = new THREE.Mesh(armGeo, mats.sensorMetal)
  arm.rotation.z = Math.PI / 2
  spinner.add(arm)

  // 尾翼（较大面积，使风向标自动对准风向）
  const tailGeo = new THREE.BoxGeometry(0.03, 0.16, 0.11)
  const tail = new THREE.Mesh(tailGeo, mats.sensorWhite)
  tail.position.x = -0.125
  spinner.add(tail)

  // 风向箭头（指向来风方向）
  const arrowGeo = new THREE.ConeGeometry(0.025, 0.08, 6)
  const arrow = new THREE.Mesh(arrowGeo, mats.sensorMetal)
  arrow.rotation.z = -Math.PI / 2
  arrow.position.x = 0.155
  spinner.add(arrow)

  vane.add(spinner)
  vane.userData.spinner = spinner

  return vane
}

// ============================================================
// 主工厂函数
// ============================================================

export function createWindTower(): THREE.Group {
  const root = new THREE.Group()
  const mats = makeMaterials()

  // 1. 混凝土基座
  const base = createBase(mats.concreteMat)
  root.add(base)

  // 2. 格构塔身
  const body = createTowerBody(mats)
  root.add(body)

  // 3. 顶部平台 + 护栏
  const platform = createPlatform(mats)
  root.add(platform)

  // 4. 三杯风速仪（位于平台中心偏一侧）
  const anemometer = createAnemometer(mats)
  anemometer.position.set(0.08, TOWER_H, 0.05)
  root.add(anemometer)

  // 5. 风向标（在风速仪旁边）
  const windVane = createWindVane(mats)
  windVane.position.set(-0.12, TOWER_H, 0.05)
  root.add(windVane)

  // userData
  root.userData.type = 'wind-tower'
  root.userData.anemometerRotor = anemometer.userData.rotor
  root.userData.vaneSpinner = windVane.userData.spinner

  // 动画：风杯持续旋转
  root.userData.tick = (delta: number) => {
    if (root.userData.anemometerRotor) {
      // 约 2~4 转/秒（模拟有风状态）
      ;(root.userData.anemometerRotor as THREE.Group).rotation.y += delta * 10
    }
    // 风向标轻微摆动模拟
    if (root.userData.vaneSpinner) {
      ;(root.userData.vaneSpinner as THREE.Group).rotation.y =
        Math.sin(Date.now() * 0.0003) * 0.08
    }
  }

  return root
}
