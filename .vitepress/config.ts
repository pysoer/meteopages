import { defineConfig } from 'vitepress'
import { EQUIPMENTS } from './equipments'

// 导航栏 / 侧栏的设备列表统一由 equipments.ts 派生
const equipmentLinks = EQUIPMENTS
  .filter((e) => e.inNav !== false)
  .map((e) => ({ text: e.name, link: '/equipment/' + e.type }))

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
      {
        text: '观测设备',
        items: equipmentLinks
      }
    ],

    sidebar: {
      '/equipment/': [
        {
          text: '观测场内设备',
          items: equipmentLinks
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

    socialLinks: [{ icon: 'github', link: 'https://github.com/pysoer/meteopages' }],

    footer: {
      message: '地面气象观测场设备数字导览',
      copyright: 'Copyright © 2026 益阳市气象局'
    },

    search: { provider: 'local' },

    docFooter: { prev: false, next: false },
    outline: { label: '本页目录' },
    returnToTopLabel: '回到顶部',
    sidebarMenuLabel: '菜单'
  }
})
