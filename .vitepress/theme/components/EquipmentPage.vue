<script setup lang="ts">
import { withBase } from 'vitepress'
import EquipImage from './EquipImage.vue'
import VideoBlock from './VideoBlock.vue'

interface Spec { k: string; v: string }

defineProps<{
  type: string
  title: string
  subtitle?: string
  intro?: string
  image?: string
  specs?: Spec[]
  principle?: string
  application?: string
  video?: string
  poster?: string
}>()
</script>

<template>
  <div class="equip-page">
    <!-- 手机端优先：默认单列，宽屏并排 -->
    <div class="grid">
      <div class="left">
        <div class="sci-card media">
          <span class="corner tl" /><span class="corner tr" />
          <span class="corner bl" /><span class="corner br" />
          <img v-if="image" :src="withBase(image)" :alt="title" class="real-img" />
          <EquipImage v-else :type="type" :label="title" />
          <VideoBlock :src="video" :poster="poster" :caption="subtitle" />
        </div>
      </div>

      <div class="right">
        <span class="sci-kicker">OBSERVATION INSTRUMENT</span>
        <h1 class="title">{{ title }}</h1>
        <p v-if="subtitle" class="subtitle">{{ subtitle }}</p>
        <p v-if="intro" class="intro">{{ intro }}</p>

        <div v-if="specs && specs.length" class="specs sci-card">
          <span class="corner tl" /><span class="corner br" />
          <h3>技术参数</h3>
          <table>
            <tbody>
              <tr v-for="s in specs" :key="s.k">
                <td class="k">{{ s.k }}</td>
                <td class="v">{{ s.v }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <section v-if="principle" class="block">
          <h3><span class="dot" />测量原理</h3>
          <p>{{ principle }}</p>
        </section>

        <section v-if="application" class="block">
          <h3><span class="dot" />应用场景</h3>
          <p>{{ application }}</p>
        </section>

        <div class="actions">
          <a class="sci-btn" href="/guide">查看 3D 导览</a>
          <a class="sci-btn ghost" href="/qr">页面二维码</a>
          <a class="sci-btn ghost" href="/">返回首页</a>
        </div>
      </div>
    </div>

    <!-- 自由排版区：md 文件中写在 <EquipmentPage> 标签之间的 Markdown 会渲染到这里
         可放任意数量的图片、说明文字、列表、表格等 -->
    <div v-if="$slots.default" class="md-body">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.equip-page { padding: 8px 0 40px; }
.grid { display: grid; grid-template-columns: 1fr; gap: 24px; align-items: start; }
.media { padding: 16px; }
.real-img { display: block; width: 100%; height: auto; border-radius: 10px; }
.right .title {
  font-size: 28px; margin: 6px 0 8px; line-height: 1.25;
  background: linear-gradient(90deg, #e6f1ff, #22d3ee);
  -webkit-background-clip: text; background-clip: text; color: transparent;
}
.subtitle { color: var(--sci-cyan); font-size: 15px; margin: 0 0 12px; }
.intro { color: var(--vp-c-text-2); line-height: 1.85; font-size: 15px; }

.specs { padding: 16px 18px; margin: 18px 0; }
.specs h3 { margin: 0 0 10px; color: var(--vp-c-text-1); }
.specs table { width: 100%; border-collapse: collapse; }
.specs td { padding: 9px 4px; border-bottom: 1px solid var(--vp-c-divider); font-size: 14px; vertical-align: top; }
.specs td.k { color: var(--sci-cyan); width: 38%; white-space: nowrap; }
.specs td.v { color: var(--vp-c-text-1); }
.specs tr:last-child td { border-bottom: 0; }

.block { margin: 20px 0; }
.block h3 { display: flex; align-items: center; gap: 10px; color: var(--vp-c-text-1); font-size: 17px; margin: 0 0 8px; }
.block .dot { width: 9px; height: 9px; border-radius: 50%; background: var(--sci-cyan); box-shadow: var(--sci-glow); }
.block p { color: var(--vp-c-text-2); line-height: 1.85; margin: 0; font-size: 15px; }

.actions { display: flex; gap: 12px; margin-top: 24px; flex-wrap: wrap; }

@media (min-width: 860px) {
  .grid { grid-template-columns: 1fr 1fr; gap: 36px; }
  .right .title { font-size: 34px; }
}

/* 自由排版区：slot 内容由 md 编译而来，不在本组件的 scoped 作用域内，需用 :deep 命中 */
.md-body { margin-top: 36px; }
.md-body :deep(img) {
  display: block;
  width: 100%;
  height: auto;
  margin: 14px 0;
  border-radius: 10px;
  border: 1px solid var(--vp-c-divider);
  background: #05070f;
}
/* 约定：独占一段的 *斜体* 视为图注 */
.md-body :deep(p > em:only-child) {
  display: block;
  margin: -6px 0 18px;
  font-style: normal;
  font-size: 13px;
  text-align: center;
  color: var(--sci-cyan);
}
.md-body :deep(hr) { border: 0; border-top: 1px solid var(--vp-c-divider); margin: 28px 0; }
</style>
