# Window 窗口组件

一个功能完整的可拖动窗口组件，支持移动、调整大小、最小化和关闭等操作。

## 功能特性

- ✅ **拖动移动**: 点击标题栏可以拖动窗口到任意位置
- ✅ **边界限制**: 自动防止窗口完全移出屏幕，始终保持标题栏至少有一条边可见
- ✅ **调整大小**: 拖动窗口边缘和角落可以调整窗口尺寸
- ✅ **最小化**: 最小化后变成圆形图标，仍然可以拖动
- ✅ **关闭**: 支持关闭窗口功能
- ✅ **灵活配置**: 所有功能都可以通过 props 开启或关闭
- ✅ **插槽支持**: 通过默认插槽传入自定义内容
- ✅ **响应式**: 支持暗色主题自动适配

## 使用方法

### 基本用法

```tsx
import Window from '@/components/Window';

<Window
  title="我的窗口"
  closable={true}
  minimizable={true}
  resizable={true}
  defaultWidth={40}
  defaultHeight={50}
  defaultX={10}
  defaultY={10}
  onClose={() => console.log('窗口关闭')}
>
  <div>这里是窗口内容</div>
</Window>
```

## Props 属性

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `title` | `string` | `'窗口'` | 窗口标题，显示在标题栏 |
| `closable` | `boolean` | `true` | 是否显示关闭按钮 |
| `minimizable` | `boolean` | `true` | 是否显示最小化按钮 |
| `resizable` | `boolean` | `true` | 是否允许调整窗口大小 |
| `defaultWidth` | `number` | `40` | 窗口初始宽度（屏幕宽度百分比） |
| `defaultHeight` | `number` | `50` | 窗口初始高度（屏幕高度百分比） |
| `defaultX` | `number` | `10` | 窗口初始 X 坐标（屏幕宽度百分比） |
| `defaultY` | `number` | `10` | 窗口初始 Y 坐标（屏幕高度百分比） |
| `onClose` | `() => void` | - | 窗口关闭时的回调函数 |

## Events 事件

| 事件名 | 说明 | 参数 |
|--------|------|------|
| `close` | 窗口关闭时触发 | - |

## Slots 插槽

| 插槽名 | 说明 |
|--------|------|
| `default` | 窗口的主要内容区域 |

## 使用示例

### 示例 1: 全功能窗口

```tsx
<Window
  title="完整功能窗口"
  closable={true}
  minimizable={true}
  resizable={true}
>
  <div>
    <h2>窗口内容</h2>
    <p>这是一个支持所有功能的窗口</p>
  </div>
</Window>
```

### 示例 2: 固定大小窗口

```tsx
<Window
  title="固定大小"
  resizable={false}
  defaultWidth={30}
  defaultHeight={40}
>
  <div>这个窗口不能调整大小</div>
</Window>
```

### 示例 3: 简单对话框

```tsx
<Window
  title="提示"
  minimizable={false}
  resizable={false}
  defaultWidth={25}
  defaultHeight={30}
  onClose={() => setShowDialog(false)}
>
  <div>
    <p>确定要执行此操作吗？</p>
    <button onClick={handleConfirm}>确定</button>
  </div>
</Window>
```

### 示例 4: 条件显示窗口

```tsx
import { ref } from 'vue';
import Window from '@/components/Window';

export default defineComponent({
  setup() {
    const showWindow = ref(true);

    return () => (
      <div>
        <button onClick={() => showWindow.value = true}>
          打开窗口
        </button>

        {showWindow.value && (
          <Window
            title="可关闭窗口"
            onClose={() => showWindow.value = false}
          >
            <div>窗口内容</div>
          </Window>
        )}
      </div>
    );
  },
});
```

## 样式定制

窗口组件使用 CSS 模块，你可以通过修改 `styles.module.sass` 来定制样式。

主要样式变量：

- 标题栏背景渐变: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`
- 窗口圆角: `12px`
- 阴影效果: `0 8px 32px rgba(0, 0, 0, 0.15)`
- 最小化图标大小: `60px`
- 控制按钮尺寸: `28px`

## 注意事项

1. 窗口使用 `position: fixed` 定位，相对于浏览器视口
2. 所有位置和尺寸参数均使用屏幕宽高的百分比，更好地适配不同分辨率
3. 调整大小时有最小尺寸限制（宽度 200px，高度 150px，会自动转换为相应百分比）
4. **智能边界限制**：窗口标题栏始终保持至少 5% 的区域在屏幕内可见，防止窗口完全移出屏幕
5. 最小化后的圆形图标固定为 60px，方便点击
6. 窗口的 z-index 为 1000，确保不会被其他元素遮挡
7. 支持暗色主题自动适配

## 键盘操作

目前不支持键盘操作，后续可以添加：
- `Esc` 关闭窗口
- `F11` 全屏
- 方向键移动窗口

## 浏览器兼容性

支持所有现代浏览器：
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## License

MIT

