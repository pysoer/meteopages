<script setup lang="ts">
// 根据设备类型生成科技风 SVG 占位插图，无需外部图片资源
defineProps<{
  type: string
  label?: string
}>()

const accent: Record<string, string> = {
  th: '#22d3ee',
  wind: '#3b82f6',
  rain: '#38bdf8',
  evap: '#8b5cf6',
  pressure: '#f472b6',
  visibility: '#34d399',
  precip: '#2dd4bf',
  phenom: '#a855f7',
  ground: '#f59e0b',
  sunshine: '#facc15',
  grass: '#84cc16',
  deep: '#fb923c',
  cloudradar: '#60a5fa',
  radiometer: '#fbbf24',
  windprofiler: '#818cf8',
  gnssmet: '#34d399',
  lidarwind: '#2dd4bf',
  weathermod: '#f43f5e'
}
</script>

<template>
  <div class="equip-img">
    <svg viewBox="0 0 640 420" preserveAspectRatio="xMidYMid meet" role="img" :aria-label="label || type">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#0a1326" />
          <stop offset="100%" stop-color="#05070f" />
        </linearGradient>
        <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse">
          <path d="M32 0H0V32" fill="none" stroke="rgba(120,160,220,0.12)" stroke-width="1" />
        </pattern>
        <radialGradient id="halo" cx="50%" cy="40%" r="55%">
          <stop offset="0%" :stop-color="(accent[type] || '#22d3ee')" stop-opacity="0.35" />
          <stop offset="100%" :stop-color="(accent[type] || '#22d3ee')" stop-opacity="0" />
        </radialGradient>
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="6" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      <rect width="640" height="420" fill="url(#bg)" />
      <rect width="640" height="420" fill="url(#grid)" />
      <ellipse cx="320" cy="200" rx="260" ry="200" fill="url(#halo)" />

      <!-- 地面基准线 -->
      <line x1="40" y1="330" x2="600" y2="330" :stroke="(accent[type] || '#22d3ee')" stroke-opacity="0.5" stroke-width="2" />
      <ellipse cx="320" cy="330" rx="150" ry="26" fill="none" :stroke="(accent[type] || '#22d3ee')" stroke-opacity="0.4" />

      <!-- 通用立柱 -->
      <rect x="313" y="150" width="14" height="180" rx="4" :fill="(accent[type] || '#22d3ee')" opacity="0.85" filter="url(#glow)" />

      <!-- 百叶箱 -->
      <g v-if="type === 'th'" :stroke="accent.th" fill="none" stroke-width="2" filter="url(#glow)">
        <rect x="250" y="150" width="140" height="120" rx="6" :fill="accent.th" fill-opacity="0.08" />
        <line x1="250" y1="172" x2="390" y2="172" /><line x1="250" y1="194" x2="390" y2="194" />
        <line x1="250" y1="216" x2="390" y2="216" /><line x1="250" y1="238" x2="390" y2="238" />
        <line x1="250" y1="260" x2="390" y2="260" />
      </g>

      <!-- 风塔 -->
      <g v-else-if="type === 'wind'" :stroke="accent.wind" fill="none" stroke-width="2" filter="url(#glow)">
        <line x1="320" y1="150" x2="320" y2="96" />
        <circle cx="320" cy="96" r="6" :fill="accent.wind" />
        <line x1="320" y1="96" x2="372" y2="78" /><circle cx="380" cy="76" r="10" :fill="accent.wind" fill-opacity="0.5" />
        <line x1="320" y1="96" x2="268" y2="78" /><circle cx="260" cy="76" r="10" :fill="accent.wind" fill-opacity="0.5" />
        <line x1="320" y1="96" x2="320" y2="44" /><circle cx="320" cy="36" r="10" :fill="accent.wind" fill-opacity="0.5" />
        <path d="M300 130 L340 130 L320 110 Z" :fill="accent.wind" fill-opacity="0.4" />
      </g>

      <!-- 翻斗式雨量 -->
      <g v-else-if="type === 'rain'" :stroke="accent.rain" fill="none" stroke-width="2" filter="url(#glow)">
        <path d="M280 150 L360 150 L352 250 L288 250 Z" :fill="accent.rain" fill-opacity="0.1" />
        <ellipse cx="320" cy="150" rx="40" ry="12" :fill="accent.rain" fill-opacity="0.15" />
        <ellipse cx="320" cy="250" rx="32" ry="10" :fill="accent.rain" fill-opacity="0.2" />
      </g>

      <!-- 蒸发 -->
      <g v-else-if="type === 'evap'" :stroke="accent.evap" fill="none" stroke-width="2" filter="url(#glow)">
        <ellipse cx="320" cy="250" rx="86" ry="30" :fill="accent.evap" fill-opacity="0.12" />
        <ellipse cx="320" cy="240" rx="86" ry="30" :fill="accent.evap" fill-opacity="0.18" />
        <line x1="250" y1="285" x2="390" y2="285" />
      </g>

      <!-- 气压 -->
      <g v-else-if="type === 'pressure'" :stroke="accent.pressure" fill="none" stroke-width="2" filter="url(#glow)">
        <circle cx="320" cy="120" r="46" :fill="accent.pressure" fill-opacity="0.1" />
        <line x1="320" y1="120" x2="348" y2="96" :stroke="accent.pressure" stroke-width="3" />
        <circle cx="320" cy="120" r="5" :fill="accent.pressure" />
        <path d="M296 104 A46 46 0 0 1 344 104" stroke-dasharray="4 6" />
      </g>

      <!-- 能见度 -->
      <g v-else-if="type === 'visibility'" :stroke="accent.visibility" fill="none" stroke-width="2" filter="url(#glow)">
        <rect x="244" y="120" width="20" height="100" rx="4" :fill="accent.visibility" fill-opacity="0.15" />
        <rect x="376" y="120" width="20" height="100" rx="4" :fill="accent.visibility" fill-opacity="0.15" />
        <line x1="264" y1="150" x2="376" y2="150" stroke-dasharray="3 7" :stroke="accent.visibility" />
        <circle cx="264" cy="150" r="5" :fill="accent.visibility" />
        <circle cx="376" cy="150" r="5" :fill="accent.visibility" />
      </g>

      <!-- 降水现象仪 -->
      <g v-else-if="type === 'precip'" :stroke="accent.precip" fill="none" stroke-width="2" filter="url(#glow)">
        <line x1="298" y1="150" x2="298" y2="118" /><line x1="342" y1="150" x2="342" y2="118" />
        <line x1="298" y1="134" x2="342" y2="134" stroke-dasharray="3 6" />
        <rect x="288" y="110" width="18" height="13" rx="2" :fill="accent.precip" fill-opacity="0.3" />
        <rect x="334" y="110" width="18" height="13" rx="2" :fill="accent.precip" fill-opacity="0.3" />
      </g>

      <!-- 天气现象视频观测仪 -->
      <g v-else-if="type === 'phenom'" :stroke="accent.phenom" fill="none" stroke-width="2" filter="url(#glow)">
        <rect x="294" y="106" width="44" height="32" rx="4" :fill="accent.phenom" fill-opacity="0.15" />
        <circle cx="344" cy="122" r="9" :fill="accent.phenom" fill-opacity="0.4" />
        <line x1="320" y1="106" x2="320" y2="96" />
      </g>

      <!-- 地温场 -->
      <g v-else-if="type === 'ground'" :stroke="accent.ground" fill="none" stroke-width="2" filter="url(#glow)">
        <rect x="278" y="330" width="84" height="46" :fill="accent.ground" fill-opacity="0.12" stroke="none" />
        <line x1="278" y1="348" x2="362" y2="348" /><line x1="278" y1="366" x2="362" y2="366" />
        <line x1="300" y1="330" x2="300" y2="368" :stroke="accent.ground" stroke-width="3" />
        <line x1="320" y1="330" x2="320" y2="372" :stroke="accent.ground" stroke-width="3" />
        <line x1="340" y1="330" x2="340" y2="368" :stroke="accent.ground" stroke-width="3" />
        <circle cx="300" cy="368" r="3" :fill="accent.ground" /><circle cx="320" cy="372" r="3" :fill="accent.ground" /><circle cx="340" cy="368" r="3" :fill="accent.ground" />
      </g>

      <!-- 日照传感器 -->
      <g v-else-if="type === 'sunshine'" :stroke="accent.sunshine" fill="none" stroke-width="2" filter="url(#glow)">
        <circle cx="320" cy="120" r="22" :fill="accent.sunshine" fill-opacity="0.18" />
        <path d="M298 150 Q320 178 342 150" />
        <circle cx="320" cy="120" r="6" :fill="accent.sunshine" />
      </g>

      <!-- 草面温度 -->
      <g v-else-if="type === 'grass'" :stroke="accent.grass" fill="none" stroke-width="2" filter="url(#glow)">
        <path d="M305 150 Q300 120 308 106" /><path d="M320 150 Q320 114 320 100" /><path d="M335 150 Q340 120 332 106" />
        <circle cx="320" cy="146" r="4" :fill="accent.grass" />
      </g>

      <!-- 深层地温 -->
      <g v-else-if="type === 'deep'" :stroke="accent.deep" fill="none" stroke-width="2" filter="url(#glow)">
        <rect x="312" y="150" width="16" height="200" rx="3" :fill="accent.deep" fill-opacity="0.12" />
        <line x1="312" y1="185" x2="328" y2="185" /><line x1="312" y1="225" x2="328" y2="225" />
        <line x1="312" y1="285" x2="328" y2="285" /><line x1="312" y1="345" x2="328" y2="345" />
        <circle cx="320" cy="185" r="3" :fill="accent.deep" /><circle cx="320" cy="225" r="3" :fill="accent.deep" />
        <circle cx="320" cy="285" r="3" :fill="accent.deep" /><circle cx="320" cy="345" r="3" :fill="accent.deep" />
      </g>

      <!-- 毫米波测云仪：天线箱 + 向上雷达波 -->
      <g v-else-if="type === 'cloudradar'" :stroke="accent.cloudradar" fill="none" stroke-width="2" filter="url(#glow)">
        <rect x="294" y="138" width="52" height="34" rx="5" :fill="accent.cloudradar" fill-opacity="0.12" />
        <path d="M278 120 A42 42 0 0 1 362 120" stroke-dasharray="4 7" />
        <path d="M268 104 A58 58 0 0 1 372 104" stroke-dasharray="4 7" />
        <ellipse cx="320" cy="120" rx="40" ry="14" :fill="accent.cloudradar" fill-opacity="0.1" />
      </g>

      <!-- 微波辐射计：抛物面天线 -->
      <g v-else-if="type === 'radiometer'" :stroke="accent.radiometer" fill="none" stroke-width="2" filter="url(#glow)">
        <path d="M268 96 Q320 150 372 96" :fill="accent.radiometer" fill-opacity="0.1" />
        <line x1="320" y1="124" x2="320" y2="156" />
        <circle cx="320" cy="90" r="5" :fill="accent.radiometer" />
      </g>


      <!-- 风廓线雷达：多天线阵 -->
      <g v-else-if="type === 'windprofiler'" :stroke="accent.windprofiler" fill="none" stroke-width="2" filter="url(#glow)">
        <line x1="296" y1="150" x2="296" y2="96" /><line x1="320" y1="150" x2="320" y2="88" /><line x1="344" y1="150" x2="344" y2="96" />
        <line x1="284" y1="150" x2="284" y2="108" /><line x1="356" y1="150" x2="356" y2="108" />
        <path d="M276 92 L364 92" stroke-dasharray="3 6" />
      </g>

      <!-- GNSS/MET：小天线 + 卫星轨道 -->
      <g v-else-if="type === 'gnssmet'" :stroke="accent.gnssmet" fill="none" stroke-width="2" filter="url(#glow)">
        <path d="M286 132 Q320 156 354 132" :fill="accent.gnssmet" fill-opacity="0.1" />
        <ellipse cx="320" cy="108" rx="46" ry="16" stroke-dasharray="4 6" />
        <circle cx="320" cy="108" r="4" :fill="accent.gnssmet" />
        <circle cx="366" cy="108" r="3" :fill="accent.gnssmet" /><circle cx="274" cy="108" r="3" :fill="accent.gnssmet" />
      </g>

      <!-- 3D 激光测风雷达：扫描盒 + 旋转波束 -->
      <g v-else-if="type === 'lidarwind'" :stroke="accent.lidarwind" fill="none" stroke-width="2" filter="url(#glow)">
        <rect x="296" y="140" width="48" height="26" rx="5" :fill="accent.lidarwind" fill-opacity="0.12" />
        <path d="M320 140 L300 96 M320 140 L340 96" />
        <path d="M320 140 L388 104 M320 140 L252 104" stroke-dasharray="3 6" />
        <circle cx="320" cy="92" r="4" :fill="accent.lidarwind" />
      </g>

      <!-- 人工影响天气装备：火箭 + 发射架 + 催化云 -->
      <g v-else-if="type === 'weathermod'" :stroke="accent.weathermod" fill="none" stroke-width="2" filter="url(#glow)">
        <line x1="306" y1="150" x2="306" y2="92" /><line x1="334" y1="150" x2="334" y2="92" />
        <path d="M312 92 L320 64 L328 92 Z" :fill="accent.weathermod" fill-opacity="0.15" />
        <line x1="320" y1="64" x2="320" y2="50" />
        <path d="M300 128 Q320 150 340 128" :fill="accent.weathermod" fill-opacity="0.08" />
        <circle cx="312" cy="78" r="2.5" :fill="accent.weathermod" /><circle cx="328" cy="84" r="2.5" :fill="accent.weathermod" />
      </g>

      <text x="320" y="392" text-anchor="middle" fill="rgba(200,220,255,0.7)" font-size="16" letter-spacing="2">
        {{ label || type }}
      </text>
    </svg>
  </div>
</template>

<style scoped>
.equip-img { width: 100%; border-radius: 14px; overflow: hidden; border: 1px solid var(--vp-c-divider); background: #05070f; }
.equip-img svg { display: block; width: 100%; height: auto; }
</style>
