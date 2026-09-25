# 气象观测场设备数字导览

基于 **VitePress** + **Three.js** 的地面气象观测场设备介绍站点。包含科技感首页、可交互的 **3D 观测场导览**、各设备的独立介绍页（文字 + 示意图 + 演示视频位），以及可单个 / 批量下载的**页面二维码**（`/qr`）。

已实现自动提交到阿里云的边缘函数pages，可直接访问：https://meteopages.pycinrad.cn/

## 技术栈

- [VitePress](https://vitepress.dev/) —— 静态站点生成器（Markdown 驱动，便于后期维护）
- [Vue 3](https://vuejs.org/) —— 自定义组件
- [Three.js](https://threejs.org/) —— 3D 导览场景

## 目录结构

```
meteopages/
├── .vitepress/
│   ├── config.ts                 # 站点配置（导航、侧边栏、页脚）
│   └── theme/
│       ├── index.ts              # 注册自定义组件
│       ├── style.css             # 科技感主题样式
│       └── components/
│           ├── HomeLanding.vue    # 首页落地页（粒子动画）
│           ├── Scene3D.vue        # 3D 观测场导览
│           ├── EquipmentPage.vue  # 设备详情页布局
│           ├── EquipImage.vue     # 设备 SVG 示意图
│           ├── VideoBlock.vue     # 演示视频区块
│           └── QrCodes.vue        # 页面二维码（生成 / 单个或批量下载）
├── index.md                      # 首页（使用 HomeLanding）
├── guide.md                      # 3D 导览页（使用 Scene3D）
├── qr.md                         # 页面二维码页（使用 QrCodes）
├── equipment/                    # 各设备介绍页（Markdown）
│   ├── temperature-humidity.md
│   ├── wind.md
│   ├── rainfall.md
│   ├── evaporation.md
│   ├── pressure.md
│   └── visibility.md
└── public/
    ├── images/                   # 设备实拍图（可选）
    ├── videos/                   # 演示视频（可选）
    ├── road-planner.html         # 观测场道路绘制工具（25m×25m + 0.5m 虚线网格）
    └── roads.json                # 工具导出的道路布局（可选，存在时优先于内置布局）
```

## 本地运行

```bash
npm install      # 安装依赖
npm run dev      # 本地预览，默认 http://localhost:5173
npm run build    # 构建到 .vitepress/dist
npm run preview  # 预览构建产物
```

## 如何修改内容（便于后期维护）

所有正文都在 `*.md` 文件中，直接编辑即可，无需改动代码。

### 修改某台设备的介绍

打开 `equipment/xxx.md`，修改 `<EquipmentPage>` 上的属性：

- `title` / `subtitle` / `intro`：标题、副标题、简介
- `:specs="[{ k:'参数名', v:'参数值' }, ...]"`：技术参数表
- `principle`：测量原理
- `application`：应用场景

### 替换示意图为实拍照片

1. 将图片放入 `public/equipment/`，例如 `public/equipment/th.jpg`
2. 在对应设备页的 `<EquipmentPage>` 上增加 `image="/images/th.jpg"`

不传 `image` 时，会自动使用内置的科技风 SVG 示意图。

### 添加演示视频

1. 将视频放入 `public/videos/`，例如 `public/videos/th.mp4`
2. 在对应设备页的 `<EquipmentPage>` 上增加 `video="/videos/th.mp4"`

未提供 `video` 时，页面显示带播放按钮的占位区块，提示后续补录。

### 绘制观测场道路（步道 / 便道）

1. 打开 `/road-planner.html`（本地：`http://localhost:5173/road-planner.html`，导航栏「道路绘制」）
2. 画布为 **25m × 25m** 场地框，内含 **0.5m 间隔虚线网格**（可切换 1m / 0.25m、可吸附）
3. 用「矩形道路 / 折线道路 / 设备便道」在框内绘制：拖动或点击，右侧面板可改宽度、删除元素
4. 导出 `roads.json` 放进 `public/` 目录，3D 导览页会自动加载；也可导出 TS 片段直接粘贴代码
5. 坐标系与 3D 场景一致：原点西南角，X 东、Y 北，单位 m

### 调整 3D 导览页的设备位置（编辑模式）

在导览页 URL 后加 `?edit` 参数即可进入**编辑模式**，例如：

```
http://localhost:5173/guide?edit          # 本地开发
https://meteopages.pycinrad.cn/guide?edit # 线上（若部署路径不同，请以实际 guide 页地址为准）
```

编辑模式下会多出一条工具条：

- **可以拖动设备**：先点选一台设备，出现箭头后拖拽即可移动（仅沿地面 X/Z 平移，不会抬高）；拖动时场景自动旋转会暂停
- **导出 JSON 按钮**：把当前所有设备的坐标导出为 `devices.json`
  1. 点「导出 JSON」下载文件
  2. 把 `devices.json` 放进 `public/` 目录
  3. 3D 导览页会自动优先加载它（`devices.json` 中没有的设备仍回落到内置坐标）

字段说明（坐标系与场地一致：原点西南角，X 东、Y 北，单位 m）：

```json
[
  { "x": 19.47, "y": 17.16, "id": "th", "label": "百叶箱" }
]
```

不带 `?edit` 时，页面为只读展示态：不能拖动、也不显示导出按钮。

### 页面二维码（/qr）

访问 `/qr`（导航栏「二维码」）可看到**首页、3D 导览页、每台设备页**的二维码，共 `EQUIPMENTS` 数量 + 2 个。

- 二维码内容取自**当前访问站点**（`window.location.origin` + 页面路径），不写死域名：本地预览生成 localhost 链接、线上生成正式域名链接，换域名无需改代码
- 每张卡片可「下载 PNG」（带中文标题的白底图片，适合打印贴牌）、「复制链接」
- 「全部下载（ZIP）」把所有二维码打包为 `meteopages-qrcodes.zip`，内含 `01-home.png`、`02-guide.png`、`03-equipment-xxx.png` … 以及一份链接清单
- 设备列表由 `equipments.ts` 派生，新增设备后二维码页自动同步

依赖：`qrcode`（生成矩阵）、`jszip`（打包 ZIP），均在点击 / 页面加载时按需加载。

### 新增一台设备

1. 在 `equipment/` 下新建 `xxx.md`，复制现有页面的结构
2. 在 `.vitepress/config.ts` 的 `nav` 与 `sidebar` 中添加对应链接
3. （可选）在 `HomeLanding.vue` 的 `items` 数组、`Scene3D.vue` 的 `EQUIPMENTS` 数组中添加该设备，使其出现在首页卡片与 3D 场景中

## 部署

`npm run build` 生成静态文件于 `.vitepress/dist`，可部署到任意静态托管（GitHub Pages、Vercel、对象存储等）。
