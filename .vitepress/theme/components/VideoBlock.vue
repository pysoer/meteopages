<script setup lang="ts">
// 演示视频区块：仅当传入 src（视频文件）时才渲染，无视频则整块不显示
defineProps<{
  src?: string
  poster?: string
  caption?: string
}>()
</script>

<template>
  <div v-if="src" class="video-block">
    <video :src="src" :poster="poster" controls playsinline preload="metadata" />
    <p v-if="caption" class="cap">{{ caption }}</p>
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
.cap { margin: 0; padding: 10px 14px; font-size: 13px; color: var(--sci-cyan); text-align: center; }
</style>
