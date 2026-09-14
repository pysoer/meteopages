import { defineConfig } from 'vitepress'

// 站点整体配置：气象观测场设备数字导览
export default defineConfig({
  title: '气象观测场设备导览',
  description: '地面气象观测场主要观测设备介绍 —— 百叶箱、风塔、雨量、蒸发、能见度、地温等',
  lang: 'zh-CN',

  appearance: 'dark',
  cleanUrls: true,

  themeConfig: {
    nav: [
      { text: '首页', link: '/' },
      { text: '3D 导览', link: '/guide' },
      { text: '道路绘制', link: '/road-planner.html' },
      {
        text: '观测设备',
        items: [
          { text: '百叶箱（温湿度）', link: '/equipment/th' },
          { text: '风塔', link: '/equipment/wind' },
          { text: '翻斗式雨量传感器', link: '/equipment/rainfall' },
          { text: '能见度传感器', link: '/equipment/visibility' },
          { text: '降水现象仪', link: '/equipment/precip' },
          { text: '天气现象视频观测仪', link: '/equipment/phenom' },
          { text: '地温场', link: '/equipment/ground' },
          { text: '日照传感器', link: '/equipment/sunshine' },
          { text: '草面温度传感器', link: '/equipment/grass' },
          { text: '深层地温传感器', link: '/equipment/deep' },
          { text: '蒸发观测设备', link: '/equipment/evap' },
          { text: '气压传感器', link: '/equipment/pressure' },
          { text: '毫米波测云仪', link: '/equipment/cloudradar' },
          { text: '微波辐射计', link: '/equipment/radiometer' },
          { text: '气溶胶激光雷达', link: '/equipment/aerosollidar' },
          { text: '风廓线雷达', link: '/equipment/windprofiler' },
          { text: 'GNSS/MET 水汽探测仪', link: '/equipment/gnssmet' },
          { text: '3D 激光测风雷达', link: '/equipment/lidarwind' },
          { text: '人工影响天气装备', link: '/equipment/weathermod' }
        ]
      }
    ],

    sidebar: {
      '/equipment/': [
        {
          text: '观测场内设备',
          items: [
            { text: '百叶箱（温湿度）', link: '/equipment/th' },
            { text: '风塔', link: '/equipment/wind' },
            { text: '翻斗式雨量传感器', link: '/equipment/rainfall' },
            { text: '能见度传感器', link: '/equipment/visibility' },
            { text: '降水现象仪', link: '/equipment/precip' },
            { text: '天气现象视频观测仪', link: '/equipment/phenom' },
            { text: '地温场', link: '/equipment/ground' },
            { text: '日照传感器', link: '/equipment/sunshine' },
            { text: '草面温度传感器', link: '/equipment/grass' },
            { text: '深层地温传感器', link: '/equipment/deep' },
            { text: '蒸发观测设备', link: '/equipment/evap' },
            { text: '气压传感器', link: '/equipment/pressure' },
            { text: '毫米波测云仪', link: '/equipment/cloudradar' },
            { text: '微波辐射计', link: '/equipment/radiometer' },
            { text: '气溶胶激光雷达', link: '/equipment/aerosollidar' },
            { text: '风廓线雷达', link: '/equipment/windprofiler' },
            { text: 'GNSS/MET 水汽探测仪', link: '/equipment/gnssmet' },
            { text: '3D 激光测风雷达', link: '/equipment/lidarwind' },
            { text: '人工影响天气装备', link: '/equipment/weathermod' }
          ]
        }
      ],
      '/': [
        {
          text: '开始',
          items: [
            { text: '首页', link: '/' },
            { text: '3D 导览', link: '/guide' }
          ]
        }
      ]
    },

    socialLinks: [{ icon: 'github', link: 'https://github.com' }],

    footer: {
      message: '地面气象观测场设备数字导览',
      copyright: 'Copyright © 2026 气象观测科普'
    },

    search: { provider: 'local' },

    docFooter: { prev: false, next: false },
    outline: { label: '本页目录' },
    returnToTopLabel: '回到顶部',
    sidebarMenuLabel: '菜单',
    darkModeSwitchLabel: '主题',
    lightModeSwitchTitle: '切换到浅色',
    darkModeSwitchTitle: '切换到深色'
  }
})
