// 设备统一数据源：顶部导航「观测设备」、侧栏、首页卡片均由本文件派生。
// 今后新增 / 删除设备只需改动这里，无需再同步三处列表。
//
// 字段说明：
//   type     路由 id，对应页面 /equipment/<type>
//   name     导航栏 / 侧栏显示名
//   desc     首页卡片描述（也便于后续复用）
//   inNav    是否进入顶部导航「观测设备」下拉与侧栏（默认 true；pressure 设为 false）
//   home     是否出现在首页设备卡片（默认 false）
//   homeTitle 首页卡片标题需与 name 不同时的覆盖（如「蒸发器」在卡片上显示为「蒸发观测设备」）

export interface Equipment {
  type: string
  name: string
  desc: string
  inNav?: boolean
  home?: boolean
  homeTitle?: string
}

export const EQUIPMENTS: Equipment[] = [
  { type: 'wind', name: '风塔', desc: '10–12m 高，测风向与风速', home: true }, 
  { type: 'datalogger', name: '自动气象站采集器（气压）', desc: '采集并汇总各类常规气象观测要素，气压传感器也位于此' },   
  { type: 'th', name: '百叶箱（温湿度）', desc: '白色玻璃钢百叶箱，安装温湿度传感器，防辐射通风', home: true },
  { type: 'visobs', name: '视程障碍现象仪', desc: '识别雾、霾、沙尘等视程障碍现象' },
  { type: 'hwcontroller', name: '综合集成硬件控制器', desc: '集成采集、控制与通信的现场核心机箱' },
  { type: 'powerbox', name: '智能配电箱', desc: '统一为观测场设备配电、防雷与远程控制' },
  { type: 'visibility', name: '能见度传感器', desc: '散射法测气象光学视程 MOR', home: true },
  { type: 'precip', name: '降水现象仪', desc: '激光识别雨、雪、冰雹等降水现象', home: true },
  { type: 'phenom', name: '天气现象视频观测仪', desc: '计算机视觉识别云、霜、积雪等', home: true },
  { type: 'rainfall', name: '翻斗式雨量传感器', desc: '翻斗计数，计量降水量', home: true },
  { type: 'weightprecip', name: '称重式降水传感器', desc: '称重计量固态/液态降水量，适用雨、雪、冰雹' },
  { type: 'lightning', name: '闪电定位仪', desc: '探测云地闪电位置、时间与强度' },
  { type: 'evap', name: '蒸发器', desc: 'E-601 蒸发皿测水面蒸发', home: true, homeTitle: '蒸发观测设备' },
  { type: 'evapsensor', name: '超声波蒸发传感器', desc: '超声波测蒸发量' },
  { type: 'ground', name: '浅层低温观测', desc: '测地面及 5–20cm 浅层地温', home: true, homeTitle: '地温场' },
  { type: 'grass', name: '草面温度传感器', desc: '贴地 6cm 测草温，霜冻预警', home: true },
  { type: 'sunshine', name: '日照传感器', desc: '记录太阳实际照射时数', home: true },
  { type: 'deep', name: '深层地温传感器', desc: '测 40–320cm 深层地温', home: true },
  { type: 'cloudradar', name: 'Ka波段毫米波测云仪', desc: '毫米波散射探测云的垂直结构', home: true },
  { type: 'radiometer', name: '微波辐射计', desc: '被动微波遥感温湿廓线与云水', home: true },
  { type: 'windprofiler', name: 'P波段风廓线雷达', desc: '湍流散射连续获取风场廓线', home: true },
  { type: 'gnssmet', name: 'GNSS/MET 水汽探测仪', desc: '导航卫星信号反演大气可降水量', home: true },
  { type: 'lidarwind', name: '3D扫描式激光测风雷达', desc: '多普勒激光获取三维风场', home: true },
  { type: 'icingrack', name: '电线积冰架', desc: '观测导线覆冰厚度、直径与重量' },
  { type: 'weathermod', name: '人工影响天气装备', desc: '火箭/高炮/烟炉/飞机催化增雨防雹', home: true }
]
