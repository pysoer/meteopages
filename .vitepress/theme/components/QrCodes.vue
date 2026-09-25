<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { EQUIPMENTS } from '../../equipments'

const QUIET = 4 // 二维码静默区（模块数）

interface QrItem {
  name: string // 卡片 / 图片上的中文标题
  path: string // 站内路径
  file: string // 文件名（纯英文，避免压缩包乱码）
  size: number // 矩阵边长（模块数），生成后填充
  d: string // SVG path，页面渲染用
}

interface Matrix {
  size: number
  data: Uint8Array
}

// 二维码内容 = 当前访问站点 + 页面路径（挂载后取 location.origin，不写死域名）
const host = ref('')
const urlOf = (it: QrItem) => host.value + it.path

const items = ref<QrItem[]>([
  { name: '地面气象观测场导览', path: '/', file: 'home', size: 0, d: '' },
  { name: '3D 导览', path: '/guide', file: 'guide', size: 0, d: '' },
  ...EQUIPMENTS.map((e) => ({
    name: e.name,
    path: `/equipment/${e.type}`,
    file: `equipment-${e.type}`,
    size: 0,
    d: ''
  }))
])

const ready = ref(false)
const busy = ref(false)
const progress = ref('')
const toast = ref('')
let toastTimer: ReturnType<typeof setTimeout> | undefined

const matrixMap = new Map<string, Matrix>()

function notify(msg: string) {
  toast.value = msg
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => (toast.value = ''), 2200)
}

/** 模块矩阵 -> SVG path */
function toPath(m: Matrix) {
  const n = m.size
  let d = ''
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (m.data[r * n + c]) d += `M${c} ${r}h1v1h-1z`
    }
  }
  return d
}

function viewBox(it: QrItem) {
  const t = it.size + QUIET * 2
  return `${-QUIET} ${-QUIET} ${t} ${t}`
}

/** 绘制带标题的二维码 PNG（白底 + 深色模块 + 底部中文标题） */
function drawQr(item: QrItem, target = 620): HTMLCanvasElement {
  const m = matrixMap.get(item.file)!
  const total = m.size + QUIET * 2
  const cell = Math.max(2, Math.floor(target / total))
  const qrPx = cell * total
  const pad = Math.round(qrPx * 0.05)
  const capH = Math.round(qrPx * 0.15)

  const cv = document.createElement('canvas')
  cv.width = qrPx + pad * 2
  cv.height = pad * 2 + qrPx + capH
  const ctx = cv.getContext('2d')!

  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, cv.width, cv.height)

  ctx.fillStyle = '#0b1220'
  for (let r = 0; r < m.size; r++) {
    for (let c = 0; c < m.size; c++) {
      if (m.data[r * m.size + c]) {
        ctx.fillRect(pad + (c + QUIET) * cell, pad + (r + QUIET) * cell, cell, cell)
      }
    }
  }

  // 底部标题：过长时自动缩小字号
  const maxW = cv.width - pad * 2
  let fs = Math.round(capH * 0.58)
  const font = (px: number) => `600 ${px}px "Microsoft YaHei","PingFang SC","Noto Sans CJK SC",sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.font = font(fs)
  while (fs > 9 && ctx.measureText(item.name).width > maxW) {
    fs -= 1
    ctx.font = font(fs)
  }
  ctx.fillStyle = '#111827'
  ctx.fillText(item.name, cv.width / 2, pad + qrPx + capH * 0.55)

  return cv
}

function toBlob(cv: HTMLCanvasElement) {
  return new Promise<Blob>((resolve, reject) => {
    cv.toBlob((b) => (b ? resolve(b) : reject(new Error('生成 PNG 失败'))), 'image/png')
  })
}

function save(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

async function downloadOne(item: QrItem) {
  if (!ready.value) return
  try {
    save(await toBlob(drawQr(item)), `${item.file}.png`)
    notify(`已下载 ${item.file}.png`)
  } catch (e) {
    notify((e as Error).message)
  }
}

async function downloadAll() {
  if (!ready.value || busy.value) return
  busy.value = true
  try {
    const mod: any = await import('jszip')
    const JSZip = mod.default ?? mod.JSZip
    const zip = new JSZip()
    const dir = zip.folder('meteopages-qrcodes')!

    let list = '气象观测场设备导览 · 页面链接清单\n\n'
    for (let i = 0; i < items.value.length; i++) {
      const it = items.value[i]
      const idx = String(i + 1).padStart(2, '0')
      progress.value = `正在生成 ${i + 1}/${items.value.length}：${it.name}`
      await new Promise((r) => setTimeout(r, 0)) // 让出主线程以刷新进度
      dir.file(`${idx}-${it.file}.png`, await toBlob(drawQr(it)))
      list += `${idx}. ${it.name}\t${urlOf(it)}\n`
    }

    progress.value = '正在打包 ZIP…'
    const blob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE' })
    save(blob, 'meteopages-qrcodes.zip')
    notify(`已打包下载 ${items.value.length} 个二维码`)
  } catch (e) {
    notify('打包失败：' + (e as Error).message)
  } finally {
    busy.value = false
    progress.value = ''
  }
}

async function copyLink(item: QrItem) {
  try {
    await navigator.clipboard.writeText(urlOf(item))
    notify('链接已复制')
  } catch {
    notify('复制失败，请手动选择复制')
  }
}

onMounted(async () => {
  try {
    host.value = window.location.origin
    const mod: any = await import('qrcode')
    const create = mod.create ?? mod.default?.create
    for (const it of items.value) {
      const qr = create(urlOf(it), { errorCorrectionLevel: 'M' })
      const m = qr.modules as Matrix
      matrixMap.set(it.file, m)
      it.size = m.size
      it.d = toPath(m)
    }
    ready.value = true
  } catch (e) {
    notify('二维码生成失败：' + (e as Error).message)
  }
})
</script>

<template>
  <div class="qr-page">
    <header class="qh">
      <span class="sci-kicker">QR CODES</span>
      <h1 class="qtitle">页面<span class="grad">二维码</span></h1>
      <p class="lead">
        共 <b>{{ items.length }}</b> 个二维码：地面气象观测场导览（首页）、3D 导览页，以及每台观测设备的独立介绍页。
        二维码内容取自当前访问站点 <code>{{ host || '…' }}</code>，可单张下载，也可一键打包下载全部。
      </p>
      <div class="qh-actions">
        <button class="sci-btn" :disabled="!ready || busy" @click="downloadAll">
          {{ busy ? '打包中…' : '全部下载（ZIP）' }}
        </button>
        <span v-if="progress" class="prog">{{ progress }}</span>
        <span v-else-if="!ready" class="prog">二维码生成中…</span>
      </div>
    </header>

    <section class="grid">
      <div v-for="(it, i) in items" :key="it.file" class="sci-card qcard">
        <span class="corner tl" /><span class="corner br" />
        <div class="qname">{{ String(i + 1).padStart(2, '0') }} · {{ it.name }}</div>

        <div class="qplate">
          <svg
            v-if="it.d"
            class="qsvg"
            :viewBox="viewBox(it)"
            xmlns="http://www.w3.org/2000/svg"
            shape-rendering="crispEdges"
          >
            <rect :x="-QUIET" :y="-QUIET" :width="it.size + QUIET * 2" :height="it.size + QUIET * 2" fill="#ffffff" />
            <path :d="it.d" fill="#0b1220" />
          </svg>
          <div v-else class="qph">生成中…</div>
        </div>

        <a class="qurl" :href="urlOf(it)" target="_blank" rel="noopener">{{ urlOf(it) }}</a>

        <div class="qbtns">
          <button class="sci-btn ghost sm" :disabled="!ready" @click="downloadOne(it)">下载 PNG</button>
          <button class="sci-btn ghost sm" @click="copyLink(it)">复制链接</button>
        </div>
      </div>
    </section>

    <div v-if="toast" class="toast">{{ toast }}</div>
  </div>
</template>

<style scoped>
.qr-page { max-width: 1180px; margin: 0 auto; padding: 28px 16px 64px; color: var(--vp-c-text-1); }

.qh { text-align: center; padding: 12px 0 26px; }
.qtitle { font-size: clamp(26px, 6vw, 40px); font-weight: 800; margin: 6px 0 14px; }
.grad { background: linear-gradient(90deg, #22d3ee, #6366f1, #a855f7); -webkit-background-clip: text; background-clip: text; color: transparent; }
.lead { color: var(--vp-c-text-2); font-size: 14px; line-height: 1.85; max-width: 720px; margin: 0 auto; }
.lead b, .lead code { color: var(--sci-cyan); }
.qh-actions { margin-top: 20px; display: flex; align-items: center; justify-content: center; gap: 12px; flex-wrap: wrap; }
.qh-actions .sci-btn:disabled { opacity: 0.55; cursor: not-allowed; }
.prog { font-size: 12.5px; color: var(--vp-c-text-3); }

.grid { display: grid; grid-template-columns: 1fr; gap: 16px; }
.qcard { padding: 16px; display: flex; flex-direction: column; gap: 10px; }
.qname { font-weight: 700; font-size: 15px; }
.qplate {
  align-self: center; background: #fff; border-radius: 12px; padding: 10px;
  width: 100%; max-width: 220px; aspect-ratio: 1 / 1; display: grid; place-items: center;
}
.qsvg { width: 100%; height: 100%; display: block; }
.qph { color: #6b7a99; font-size: 13px; }
.qurl {
  font-family: var(--vp-font-family-mono); font-size: 11.5px; color: var(--vp-c-text-3);
  word-break: break-all; text-decoration: none; line-height: 1.6;
}
.qurl:hover { color: var(--sci-cyan); }
.qbtns { display: flex; gap: 8px; margin-top: auto; }
.qbtns .sm { padding: 7px 12px; font-size: 12.5px; border-radius: 999px; flex: 1; justify-content: center; }
.qbtns .sm:disabled { opacity: 0.5; cursor: not-allowed; }

.toast {
  position: fixed; left: 50%; bottom: 28px; transform: translateX(-50%); z-index: 60;
  padding: 10px 18px; border-radius: 999px; font-size: 13px;
  color: #04121a; background: linear-gradient(90deg, var(--sci-cyan), var(--sci-blue));
  box-shadow: 0 8px 26px rgba(34, 211, 238, 0.4);
}

@media (min-width: 560px) { .grid { grid-template-columns: repeat(2, 1fr); } }
@media (min-width: 880px) { .grid { grid-template-columns: repeat(3, 1fr); gap: 18px; } }
@media (min-width: 1180px) { .grid { grid-template-columns: repeat(4, 1fr); } }
</style>
