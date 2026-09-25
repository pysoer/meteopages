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
  enhanceApp({ app }) {
    app.component('HomeLanding', HomeLanding)
    app.component('Scene3D', Scene3D)
    app.component('EquipmentPage', EquipmentPage)
    app.component('EquipImage', EquipImage)
    app.component('VideoBlock', VideoBlock)
    app.component('QrCodes', QrCodes)
  }
}
