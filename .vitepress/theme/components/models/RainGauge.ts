/**
 * 雨量桶（Rain Gauge）— 由参考图像重建的程序化 Three.js 模型
 *
 * 八阶段管线：blockout → structural → form → material → surface → lighting → interaction → optimization
 * 参考图：不锈钢翻斗式雨量传感器，圆柱形筒身，高 70cm，直径 20cm
 *
 * 用法：
 *   import { createRainGauge } from './models/RainGauge'
 *   const gauge = createRainGauge()
 *   scene.add(gauge)
 */

import * as THREE from 'three'

// ============================================================
// 常量（米）
// ============================================================
const BUCKET_H = 0.70       // 筒身高度
const BUCKET_R = 0.10       // 筒身半径（直径 20cm）
const RIM_H = 0.045         // 外翻漏斗沿高度
const RIM_TOP_R = 0.125     // 沿口外径
const BASE_PLATE_R = 0.16   // 底座板半径
const BASE_PLATE_H = 0.015  // 底座板厚度

// ============================================================
// 材质
// ============================================================
function makeMaterials() {
  // 不锈钢主体 — 高金属度、低粗糙度、冷灰色调
  const stainlessMat = new THREE.MeshStandardMaterial({
    color: 0xd4d8dc,
    roughness: 0.18,
    metalness: 0.92,
    envMapIntensity: 1.2,
  })

  // 底座板 — 同材质但稍暗
  const baseMat = new THREE.MeshStandardMaterial({
    color: 0xbfc4c9,
    roughness: 0.3,
    metalness: 0.85,
  })

  // 螺栓 — 更暗的金属
  const boltMat = new THREE.MeshStandardMaterial({
    color: 0x7a8088,
    roughness: 0.35,
    metalness: 0.88,
  })

  return { stainlessMat, baseMat, boltMat }
}

// ============================================================
// Stage 1-3: Blockout → Structural → Form
// ============================================================

/** 创建带水平加强环的圆柱筒身 */
function createBarrelBody(mat: THREE.Material): THREE.Group {
  const body = new THREE.Group()

  // 主圆柱体
  const cylGeo = new THREE.CylinderGeometry(BUCKET_R, BUCKET_R, BUCKET_H, 24)
  const cylinder = new THREE.Mesh(cylGeo, mat)
  cylinder.position.y = BUCKET_H / 2
  body.add(cylinder)

  // 水平加强环（3 道，模拟接缝/加强筋）
  const ringH = 0.006
  const ringPositions = [0.22, 0.45, 0.65] // 从底向上的位置
  for (const ry of ringPositions) {
    const ringGeo = new THREE.TorusGeometry(BUCKET_R + ringH * 0.6, ringH, 8, 32)
    const ring = new THREE.Mesh(ringGeo, mat)
    ring.rotation.x = Math.PI / 2
    ring.position.y = ry
    body.add(ring)
  }

  return body
}

/** 创建顶部外翻漏斗沿 */
function createRim(mat: THREE.Material): THREE.Mesh {
  // 使用 LatheGeometry 创建外翻轮廓
  const points: [number, number][] = [
    [BUCKET_R, 0],
    [BUCKET_R, RIM_H * 0.25],
    [RIM_TOP_R - 0.008, RIM_H * 0.75],
    [RIM_TOP_R, RIM_H],
    [RIM_TOP_R - 0.006, RIM_H + 0.004],        // 外缘倒角
  ]
  const latheGeo = new THREE.LatheGeometry(points, 32)
  const rim = new THREE.Mesh(latheGeo, mat)
  rim.position.y = BUCKET_H
  return rim
}

/** 创建底部安装板 + 螺栓 */
function createBasePlate(
  baseMat: THREE.Material,
  boltMat: THREE.Material,
): THREE.Group {
  const baseGroup = new THREE.Group()

  // 圆形安装板
  const plateGeo = new THREE.CylinderGeometry(BASE_PLATE_R, BASE_PLATE_R, BASE_PLATE_H, 28)
  const plate = new THREE.Mesh(plateGeo, baseMat)
  plate.position.y = BASE_PLATE_H / 2
  baseGroup.add(plate)

  // 4 颗固定螺栓（均布在板上）
  const boltR = 0.01
  const boltH = 0.02
  const boltDist = BASE_PLATE_R * 0.68
  const boltGeo = new THREE.CylinderGeometry(boltR, boltR, boltH, 8)
  for (let i = 0; i < 4; i++) {
    const ang = (i / 4) * Math.PI * 2 + Math.PI / 4
    const bolt = new THREE.Mesh(boltGeo, boltMat)
    bolt.position.set(
      Math.cos(ang) * boltDist,
      BASE_PLATE_H + boltH / 2 - 0.001,
      Math.sin(ang) * boltDist,
    )
    baseGroup.add(bolt)
  }

  // 中心排水孔盖（小圆凸起）
  const drainGeo = new THREE.CylinderGeometry(0.018, 0.018, 0.006, 12)
  const drain = new THREE.Mesh(drainGeo, boltMat)
  drain.position.set(0, BASE_PLATE_H + 0.003, 0)
  baseGroup.add(drain)

  return baseGroup
}

// ============================================================
// 主工厂函数
// ============================================================

export function createRainGauge(): THREE.Group {
  const root = new THREE.Group()
  const mats = makeMaterials()

  // 1. 底座安装板 + 螺栓
  const basePlate = createBasePlate(mats.baseMat, mats.boltMat)
  root.add(basePlate)

  // 2. 不锈钢圆柱筒身 + 加强环
  const barrel = createBarrelBody(mats.stainlessMat)
  root.add(barrel)

  // 3. 顶部外翻漏斗沿
  const rim = createRim(mats.stainlessMat)
  root.add(rim)

  // 元数据
  root.userData.type = 'rain-gauge'

  return root
}
