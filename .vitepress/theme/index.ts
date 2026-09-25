import DefaultTheme from 'vitepress/theme'
import './style.css'

// 自定义组件注册
import HomeLanding from './components/HomeLanding.vue'
import Scene3D from './components/Scene3D.vue'
import EquipmentPage from './components/EquipmentPage.vue'
import EquipImage from './components/EquipImage.vue'
import VideoBlock from './components/VideoBlock.vue'
import QrCodes from './components/QrCodes.vue'

export default {
  extends: DefaultTheme,
  enhanceApp({ app, router }) {
    app.component('HomeLanding', HomeLanding)
    app.component('Scene3D', Scene3D)
    app.component('EquipmentPage', EquipmentPage)
    app.component('EquipImage', EquipImage)
    app.component('VideoBlock', VideoBlock)
    app.component('QrCodes', QrCodes)

    // 手机端：页面未滚动时隐藏二级菜单栏（VPLocalNav），滚动过顶部导航高度后再显示
    // 配合 style.css 中的 html.is-scrolled 规则，避免首屏被菜单栏占用
    if (typeof window !== 'undefined') {
      const html = document.documentElement
      const update = () => {
        const navH =
          parseInt(getComputedStyle(html).getPropertyValue('--vp-nav-height')) || 64
        html.classList.toggle('is-scrolled', window.scrollY >= navH)
      }
      update()
      window.addEventListener('scroll', update, { passive: true })
      const prevAfter = router?.onAfterRouteChanged
      if (router) {
        router.onAfterRouteChanged = (href: string) => {
          prevAfter?.(href)
          requestAnimationFrame(update)
        }
      }
    }
  }
}
