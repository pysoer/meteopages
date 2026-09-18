# 气象观测场设备数字导览

基于 **VitePress** + **Three.js** 的地面气象观测场设备介绍站点。包含科技感首页、可交互的 **3D 观测场导览**，以及温湿度、风向风速、雨量、蒸发、气压、能见度等设备的独立介绍页（文字 + 示意图 + 演示视频位）。

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
│           └── VideoBlock.vue     # 演示视频区块
├── index.md                      # 首页（使用 HomeLanding）
├── guide.md                      # 3D 导览页（使用 Scene3D）
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

1. 将图片放入 `public/images/`，例如 `public/images/th.jpg`
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

### 新增一台设备

1. 在 `equipment/` 下新建 `xxx.md`，复制现有页面的结构
2. 在 `.vitepress/config.ts` 的 `nav` 与 `sidebar` 中添加对应链接
3. （可选）在 `HomeLanding.vue` 的 `items` 数组、`Scene3D.vue` 的 `EQUIPMENTS` 数组中添加该设备，使其出现在首页卡片与 3D 场景中

## 部署

`npm run build` 生成静态文件于 `.vitepress/dist`，可部署到任意静态托管（GitHub Pages、Vercel、对象存储等）。
