# UI 组件库知识库

## 概览

`@munet/ui` - 通用 UI 组件库，1918 行代码，14 个组件，三层主题架构。

## 结构

```
packages/ui/src/
├── index.ts               # 主入口，导出所有组件和控制器
├── components/            # 基础组件（14个）
│   ├── Button/
│   ├── TextInput/
│   ├── CheckBox/
│   ├── Radio/
│   ├── Select/
│   ├── Modal/
│   ├── Section/
│   ├── Window/
│   └── ...
├── controllers/           # 全局控制器
│   └── toastController.ts
├── states/                # 全局状态
│   └── modal.ts
├── themes/                # 主题系统
│   ├── index.ts           # 主题核心
│   ├── global.module.sass # 全局层
│   ├── dynamicLight/      # DynamicLight 主题
│   └── aquadx/            # AquaDX 主题
└── utils/                 # 工具函数
```

## 核心组件

### 表单组件
- **Button** - 按钮，支持 `ing` 加载状态
- **TextInput** - 文本输入框，支持 v-model
- **CheckBox** - 复选框
- **FlagCheckBox** - 位标志复选框（用于隐私设置）
- **Radio** - 单选框
- **Select** - 下拉选择
- **NumberInput** - 数字输入
- **Range** - 滑块

### 布局组件
- **Modal** - 模态框，支持多层堆叠
- **Window** - 窗口容器
- **Section** - 可折叠区块
- **DropMenu/DropDown** - 下拉菜单

### 展示组件
- **DateFormat** - 日期格式化
- **Qrcode** - 二维码生成
- **ScrollText** - 滚动文本
- **WarningBackground** - 警告背景

### 动画组件
- **TransitionVertical** - 垂直过渡动画
- **TransitionOpacity** - 透明度过渡

### 全局容器
- **GlobalElementsContainer** - 全局元素容器
  - Toast 通知
  - Modal 堆栈
  - ForegroundTask（全屏遮罩）
  - TaskManager（右下角通知）
  - TransactionalDialog（事务性对话框）

## 控制器

### toastController
```tsx
import { addToast } from '@munet/ui';

addToast({ type: 'success', message: '保存成功' });
addToast({ type: 'error', message: '操作失败' });
addToast({ type: 'warning', message: '请注意' });
addToast({ type: 'info', message: '提示信息' });
```

### taskManager
```tsx
import { taskManager } from '@munet/ui';

// 后台任务（右下角通知）
const result = await taskManager.register('获取数据…', apiCall());
```

### foregroundTask
```tsx
import { foregroundTask } from '@munet/ui';

// 前台任务（全屏遮罩）
const result = await foregroundTask.register('正在导入…', apiCall());
```

### showTransactionalDialog
```tsx
import { showTransactionalDialog } from '@munet/ui';

await showTransactionalDialog(
  '操作成功',
  '已完成导入',
  [{ text: '确定', action: Symbol() }]
);
```

## 主题系统

### 三层架构

1. **Global 层** (`global.module.sass`)
   - 跨主题共享的基础样式结构
   - 不包含颜色、字体等可变样式

2. **UI 层** (`themes/{themeName}/`)
   - UI 组件的主题样式
   - 包含 DynamicLight 和 AquaDX 两个主题

3. **App 层** (`apps/MuFront/src/themes/{themeName}/`)
   - 业务特定的主题扩展
   - 由主应用提供

### 使用主题
```tsx
import { theme } from '@munet/ui/themes';

<div class={theme.value.textInput} />
<button class={theme.value.button} />
```

### 主题切换
```tsx
import { selectedThemeName, UIThemes } from '@munet/ui/themes';

selectedThemeName.value = UIThemes.DynamicLight;
selectedThemeName.value = UIThemes.AquaDX;
selectedThemeName.value = UIThemes.Auto; // 跟随系统
```

### 主题色调
```tsx
import { selectedThemeHue } from '@munet/ui/themes';

selectedThemeHue.value = 300; // 紫色
selectedThemeHue.value = 200; // 蓝色
```

## Modal 堆栈管理

```tsx
import { modalShowing } from '@munet/ui';

// Modal 会自动注册到堆栈
<Modal v-model:show={showModal.value}>
  内容
</Modal>

// 检查是否有 Modal 显示
if (modalShowing.value) {
  // 有 Modal 打开
}
```

## 组件使用示例

### Button
```tsx
<Button ing={loading.value} onClick={handleClick}>
  保存
</Button>
```

### TextInput
```tsx
<TextInput 
  v-model={username.value}
  placeholder="请输入用户名"
/>
```

### Modal
```tsx
<Modal title="确认操作" v-model:show={showModal.value} width="40em">
  {{
    default: () => <div>内容区域</div>,
    actions: () => (
      <>
        <button onClick={() => showModal.value = false}>取消</button>
        <button onClick={handleConfirm}>确认</button>
      </>
    ),
  }}
</Modal>
```

### Section
```tsx
<Section title="基本信息" defaultOpen={true}>
  <div>内容</div>
</Section>
```

## 构建配置

### 库模式
- 格式：ESM only
- 外部化：vue, @vueuse/core, lodash-es
- 保留模块结构：`preserveModules: true`

### CSS Modules
- 命名：camelCase
- 格式：`[name]_[hash:base64:5]`

### 导出路径
```json
{
  ".": "./src/index.ts",
  "./themes": "./src/themes/index.ts",
  "./components/*": "./src/components/*/index.ts",
  "./controllers/*": "./src/controllers/*.ts"
}
```

## 开发指南

### 添加新组件
1. 在 `components/` 下创建目录
2. 创建 `index.tsx` 使用 `defineComponent`
3. 在 `src/index.ts` 中导出
4. 添加主题样式到 `themes/{themeName}/`

### 添加新主题
1. 在 `themes/` 下创建目录
2. 创建 `index.ts` 和样式文件
3. 在 `themes/index.ts` 中注册
4. 在主应用的 `themes/` 中添加 App 层扩展

## 注意事项

- 组件使用 **defineComponent + JSX**，无 SFC
- 样式使用 **CSS Modules + SASS**
- 主题样式必须包裹在 `body:has(.root)` 中
- 使用 **OKLCH 色彩空间** + `--hue` 变量
- Toast/Modal 等全局元素由 `GlobalElementsContainer` 统一管理
