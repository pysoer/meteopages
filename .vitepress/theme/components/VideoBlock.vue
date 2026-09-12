<script setup lang="ts">
// 演示视频区块：传入 src 则渲染视频，否则显示占位提示
defineProps<{
  src?: string
  poster?: string
  caption?: string
}>()
</script>

<template>
  <div class="video-block">
    <video v-if="src" :src="src" :poster="poster" controls playsinline preload="metadata" />
    <div v-else class="video-placeholder">
      <div class="play">
        <svg viewBox="0 0 24 24" width="34" height="34"><path d="M8 5v14l11-7z" fill="currentColor" /></svg>
      </div>
      <p class="tip">演示视频占位</p>
      <p class="sub">将短视频放入 <code>public/videos/</code> 后，在页面中传入 <code>:src="'/videos/xxx.mp4'"</code> 即可显示</p>
      <p v-if="caption" class="cap">{{ caption }}</p>
    </div>
  </div>
</template>

<style scoped>
.video-block {
  margin-top: 16px;
  border-radius: 14px;
  overflow: hidden;
  border: 1px solid var(--vp-c-divider);
  background: #05070f;
}
.video-block video { display: block; width: 100%; height: auto; }
.video-placeholder {
  aspect-ratio: 16 / 9;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  text-align: center;
  padding: 20px;
  color: var(--vp-c-text-2);
  background:
    repeating-linear-gradient(45deg, rgba(34,211,238,0.04) 0 12px, transparent 12px 24px),
    #070b16;
}
.play {
  width: 64px; height: 64px;
  display: grid; place-items: center;
  border-radius: 50%;
  color: #04121a;
  background: linear-gradient(135deg, #22d3ee, #3b82f6);
  box-shadow: 0 0 24px rgba(34, 211, 238, 0.5);
}
.tip { margin: 4px 0 0; font-weight: 600; color: var(--vp-c-text-1); }
.sub { margin: 0; font-size: 13px; opacity: 0.8; }
.cap { margin: 0; font-size: 13px; color: var(--sci-cyan); }
code { background: rgba(34,211,238,0.1); padding: 1px 6px; border-radius: 6px; color: var(--sci-cyan); }
</style>
