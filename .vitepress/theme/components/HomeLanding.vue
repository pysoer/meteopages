<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue'
import { useRouter } from 'vitepress'

const router = useRouter()
const canvas = ref<HTMLCanvasElement | null>(null)
let raf = 0

const stats = [
  { v: '12', k: '观测设备类型' },
  { v: '25+', k: '气象要素' },
  { v: '24h', k: '连续自动观测' },
  { v: '1956', k: '建站年份' }
]

const items = [
  { link: '/equipment/th', type: 'th', title: '百叶箱（温湿度）', desc: '白色玻璃钢百叶箱，安装温湿度传感器，防辐射通风' },
  { link: '/equipment/wind', type: 'wind', title: '风塔', desc: '10–12m 高，测风向与风速' },
  { link: '/equipment/rainfall', type: 'rain', title: '翻斗式雨量传感器', desc: '翻斗计数，计量降水量' },
  { link: '/equipment/visibility', type: 'visibility', title: '能见度传感器', desc: '散射法测气象光学视程 MOR' },
  { link: '/equipment/precip', type: 'precip', title: '降水现象仪', desc: '激光识别雨、雪、冰雹等降水现象' },
  { link: '/equipment/phenom', type: 'phenom', title: '天气现象视频观测仪', desc: '计算机视觉识别云、霜、积雪等' },
  { link: '/equipment/ground', type: 'ground', title: '地温场', desc: '测地面及 5–20cm 浅层地温' },
  { link: '/equipment/sunshine', type: 'sunshine', title: '日照传感器', desc: '记录太阳实际照射时数' },
  { link: '/equipment/grass', type: 'grass', title: '草面温度传感器', desc: '贴地 6cm 测草温，霜冻预警' },
  { link: '/equipment/deep', type: 'deep', title: '深层地温传感器', desc: '测 40–320cm 深层地温' },
  { link: '/equipment/evap', type: 'evap', title: '蒸发观测设备', desc: 'E-601 蒸发皿测水面蒸发' },
  { link: '/equipment/pressure', type: 'pressure', title: '气压传感器', desc: '测量本站气压' }
]

const go = (link: string) => router.go(link)

onMounted(() => {
  const cv = canvas.value!
  const ctx = cv.getContext('2d')!
  let w = 0, h = 0, dpr = Math.min(window.devicePixelRatio || 1, 2)
  const N = 60
  const pts = Array.from({ length: N }, () => ({
    x: Math.random(), y: Math.random(),
    vx: (Math.random() - 0.5) * 0.0006, vy: (Math.random() - 0.5) * 0.0006
  }))
  const resize = () => {
    w = cv.clientWidth; h = cv.clientHeight
    cv.width = w * dpr; cv.height = h * dpr
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  }
  resize()
  window.addEventListener('resize', resize)
  const draw = () => {
    ctx.clearRect(0, 0, w, h)
    for (const p of pts) {
      p.x += p.vx; p.y += p.vy
      if (p.x < 0 || p.x > 1) p.vx *= -1
      if (p.y < 0 || p.y > 1) p.vy *= -1
    }
    for (let i = 0; i < N; i++) {
      const a = pts[i], ax = a.x * w, ay = a.y * h
      for (let j = i + 1; j < N; j++) {
        const b = pts[j], bx = b.x * w, by = b.y * h
        const d = Math.hypot(ax - bx, ay - by)
        if (d < 120) {
          ctx.strokeStyle = `rgba(34,211,238,${(1 - d / 120) * 0.22})`
          ctx.lineWidth = 1
          ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.stroke()
        }
      }
      ctx.fillStyle = 'rgba(120,200,255,0.9)'
      ctx.beginPath(); ctx.arc(ax, ay, 1.5, 0, Math.PI * 2); ctx.fill()
    }
    raf = requestAnimationFrame(draw)
  }
  draw()
  onBeforeUnmount(() => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize) })
})
</script>

<template>
  <div class="home">
    <header class="hero">
      <canvas ref="canvas" class="net"></canvas>
      <div class="hero-inner">
        <span class="sci-kicker">GROUND METEOROLOGICAL OBSERVATORY</span>
        <h1 class="htitle">气象地面观测场<br /><span class="grad">设备数字导览</span></h1>
        <p class="lead">
          以可视化方式带您认识观测场内的各类仪器 —— 温湿度、风向风速、降水、蒸发、气压与能见度等。
          支持 <b>3D 交互导览</b>，点击设备即可了解其原理与参数。
        </p>
        <div class="cta">
          <button class="sci-btn" @click="go('/guide')">进入 3D 导览 →</button>
          <button class="sci-btn ghost" @click="go('/equipment/th')">浏览设备</button>
        </div>
        <div class="stats">
          <div v-for="s in stats" :key="s.k" class="stat">
            <div class="num">{{ s.v }}</div>
            <div class="lab">{{ s.k }}</div>
          </div>
        </div>
      </div>
    </header>

    <section class="section">
      <div class="sec-head">
        <span class="sci-kicker">INSTRUMENTS</span>
        <h2>观测场内主要设备</h2>
        <p>每一台仪器都有独立介绍页面，包含文字说明、示意图与演示视频。</p>
      </div>
      <div class="cards">
        <a v-for="it in items" :key="it.link" class="sci-card card" :href="it.link" @click.prevent="go(it.link)">
          <span class="corner tl" /><span class="corner tr" />
          <span class="corner bl" /><span class="corner br" />
          <div class="card-top"><span class="badge">{{ it.title }}</span></div>
          <p class="card-desc">{{ it.desc }}</p>
          <span class="more">查看详情 →</span>
        </a>
      </div>
    </section>

    <section class="cta-foot">
      <div class="sci-card foot-card">
        <span class="corner tl" /><span class="corner br" />
        <h2>想直观看到设备摆放位置？</h2>
        <p>打开 3D 导览，在虚拟观测场中自由旋转、缩放，并点击任意设备进入介绍页。</p>
        <button class="sci-btn" @click="go('/guide')">开启 3D 导览</button>
      </div>
    </section>
  </div>
</template>

<style scoped>
.home { color: var(--vp-c-text-1); }
.hero { position: relative; min-height: 76vh; display: grid; place-items: center; overflow: hidden; padding: 0 14px; }
.net { position: absolute; inset: 0; width: 100%; height: 100%; }
.hero-inner { position: relative; z-index: 2; text-align: center; max-width: 860px; padding: 36px 8px; }
.htitle { font-size: clamp(30px, 8vw, 56px); line-height: 1.15; margin: 6px 0 16px; font-weight: 800; }
.grad { background: linear-gradient(90deg, #22d3ee, #6366f1, #a855f7); -webkit-background-clip: text; background-clip: text; color: transparent; }
.lead { color: var(--vp-c-text-2); font-size: 15px; line-height: 1.85; max-width: 640px; margin: 0 auto 24px; }
.lead b { color: var(--sci-cyan); }
.cta { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
.stats { display: flex; gap: 18px; justify-content: center; flex-wrap: wrap; margin-top: 36px; }
.stat .num { font-size: 26px; font-weight: 800; color: var(--sci-cyan); text-shadow: var(--sci-glow); }
.stat .lab { font-size: 12px; color: var(--vp-c-text-3); margin-top: 4px; }

.section { max-width: 1100px; margin: 0 auto; padding: 48px 16px; }
.sec-head { text-align: center; margin-bottom: 28px; }
.sec-head h2 { font-size: 26px; margin: 6px 0 8px; }
.sec-head p { color: var(--vp-c-text-2); font-size: 14px; }

/* 手机端优先：默认单列，逐级增列 */
.cards { display: grid; grid-template-columns: 1fr; gap: 16px; }
.card { padding: 18px; cursor: pointer; text-decoration: none; color: inherit; display: flex; flex-direction: column; gap: 8px; }
.badge { display: inline-block; font-weight: 700; font-size: 16px; color: var(--vp-c-text-1); }
.card-desc { color: var(--vp-c-text-2); font-size: 13.5px; line-height: 1.7; margin: 0; flex: 1; }
.more { color: var(--sci-cyan); font-size: 13.5px; font-weight: 600; }

.cta-foot { max-width: 1100px; margin: 0 auto 64px; padding: 0 16px; }
.foot-card { padding: 32px 22px; text-align: center; }
.foot-card h2 { font-size: 22px; margin: 6px 0 10px; }
.foot-card p { color: var(--vp-c-text-2); margin: 0 0 20px; font-size: 14px; }

@media (min-width: 560px) { .cards { grid-template-columns: repeat(2, 1fr); gap: 18px; } }
@media (min-width: 920px) { .cards { grid-template-columns: repeat(3, 1fr); } .section { padding: 60px 24px; } }
</style>
