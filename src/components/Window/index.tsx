import { defineComponent, PropType, ref, onMounted, onUnmounted } from 'vue';
import styles from './styles.module.sass';
import { waitOneFrame } from '../../utils/animation';
import { theme } from '../../themes';

export default defineComponent({
  props: {
    title: { type: String, default: '窗口' },
    closable: { type: Boolean, default: true },
    minimizable: { type: Boolean, default: true },
    resizable: { type: Boolean, default: true },
    defaultWidth: { type: Number, default: 40 }, // 百分比
    defaultHeight: { type: Number, default: 50 }, // 百分比
    defaultX: { type: Number, default: 10 }, // 百分比
    defaultY: { type: Number, default: 10 }, // 百分比
    icon: { type: String, default: 'i-carbon:unknown' },
    onClose: Function as PropType<() => void>,
  },
  setup(props, { emit, slots }) {
    // 窗口状态
    const isMinimized = ref(false);
    const windowRef = ref<HTMLElement>();

    // 窗口位置和尺寸（使用百分比）
    const x = ref(props.defaultX);
    const y = ref(props.defaultY);
    const width = ref(props.defaultWidth);
    const height = ref(props.defaultHeight);

    // 拖动状态
    const isDragging = ref(false);
    const dragStartX = ref(0);
    const dragStartY = ref(0);
    const dragStartPosX = ref(0);
    const dragStartPosY = ref(0);
    const isDragged = ref(false);

    // 调整大小状态
    const isResizing = ref(false);
    const resizeDirection = ref('');
    const resizeStartX = ref(0);
    const resizeStartY = ref(0);
    const resizeStartWidth = ref(0);
    const resizeStartHeight = ref(0);
    const resizeStartPosX = ref(0);
    const resizeStartPosY = ref(0);

    // 限制窗口位置在屏幕边界内（确保标题栏至少有一条边可见）
    const constrainPosition = (xPos: number, yPos: number, w: number, h: number) => {
      const titleBarMinVisible = 5; // 标题栏至少保留 5% 可见

      // 左边界：窗口最多可以向左移出 (width - titleBarMinVisible)%
      const minX = -(w - titleBarMinVisible);
      // 右边界：窗口最多可以向右移出，但要保留 titleBarMinVisible% 在屏幕内
      const maxX = 100 - titleBarMinVisible;
      // 上边界：标题栏不能移出屏幕上方
      const minY = 0;
      // 下边界：标题栏可以部分移出屏幕下方，但至少保留一点可见
      const maxY = 100 - titleBarMinVisible;

      return {
        x: Math.max(minX, Math.min(maxX, xPos)),
        y: Math.max(minY, Math.min(maxY, yPos)),
      };
    };

    // 开始拖动标题栏
    const startDrag = (e: MouseEvent) => {
      if (isResizing.value) return;
      isDragging.value = true;
      dragStartX.value = e.clientX;
      dragStartY.value = e.clientY;
      dragStartPosX.value = x.value;
      dragStartPosY.value = y.value;
      e.preventDefault();
    };

    // 开始调整大小
    const startResize = (e: MouseEvent, direction: string) => {
      if (!props.resizable) return;
      isResizing.value = true;
      resizeDirection.value = direction;
      resizeStartX.value = e.clientX;
      resizeStartY.value = e.clientY;
      resizeStartWidth.value = width.value;
      resizeStartHeight.value = height.value;
      resizeStartPosX.value = x.value;
      resizeStartPosY.value = y.value;
      e.preventDefault();
      e.stopPropagation();
    };

    // 鼠标移动处理
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging.value) {
        const deltaX = e.clientX - dragStartX.value;
        const deltaY = e.clientY - dragStartY.value;
        // 转换为百分比
        const deltaXPercent = (deltaX / window.innerWidth) * 100;
        const deltaYPercent = (deltaY / window.innerHeight) * 100;
        const newX = dragStartPosX.value + deltaXPercent;
        const newY = dragStartPosY.value + deltaYPercent;

        // 应用边界限制
        const constrained = constrainPosition(newX, newY, width.value, height.value);
        x.value = constrained.x;
        y.value = constrained.y;
        isDragged.value = true;
      } else if (isResizing.value) {
        const deltaX = e.clientX - resizeStartX.value;
        const deltaY = e.clientY - resizeStartY.value;
        // 转换为百分比
        const deltaXPercent = (deltaX / window.innerWidth) * 100;
        const deltaYPercent = (deltaY / window.innerHeight) * 100;

        const dir = resizeDirection.value;
        const minWidthPercent = (200 / window.innerWidth) * 100; // 最小宽度百分比
        const minHeightPercent = (150 / window.innerHeight) * 100; // 最小高度百分比

        let newX = x.value;
        let newY = y.value;
        let newWidth = width.value;
        let newHeight = height.value;

        if (dir.includes('e')) {
          newWidth = Math.max(minWidthPercent, resizeStartWidth.value + deltaXPercent);
        }
        if (dir.includes('s')) {
          newHeight = Math.max(minHeightPercent, resizeStartHeight.value + deltaYPercent);
        }
        if (dir.includes('w')) {
          const calculatedWidth = Math.max(minWidthPercent, resizeStartWidth.value - deltaXPercent);
          if (calculatedWidth > minWidthPercent) {
            newX = resizeStartPosX.value + deltaXPercent;
            newWidth = calculatedWidth;
          }
        }
        if (dir.includes('n')) {
          const calculatedHeight = Math.max(minHeightPercent, resizeStartHeight.value - deltaYPercent);
          if (calculatedHeight > minHeightPercent) {
            newY = resizeStartPosY.value + deltaYPercent;
            newHeight = calculatedHeight;
          }
        }

        // 应用边界限制
        const constrained = constrainPosition(newX, newY, newWidth, newHeight);
        x.value = constrained.x;
        y.value = constrained.y;
        width.value = newWidth;
        height.value = newHeight;
      }
    };

    // 停止拖动/调整大小
    const handleMouseUp = async () => {
      isDragging.value = false;
      isResizing.value = false;
      await waitOneFrame();
      isDragged.value = false;
    };

    // 切换最小化
    const toggleMinimize = () => {
      if (isDragged.value) return;
      isMinimized.value = !isMinimized.value;
    };

    // 关闭窗口
    const closeWindow = () => {
      props.onClose?.();
    };

    // 双击最大化/恢复（可选功能）
    const handleTitleDoubleClick = () => {
      // 这里可以实现最大化功能
    };

    onMounted(() => {
      // 确保初始位置在边界内
      const constrained = constrainPosition(x.value, y.value, width.value, height.value);
      x.value = constrained.x;
      y.value = constrained.y;

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    });

    onUnmounted(() => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    });

    return () => (
      <div
        ref={windowRef}
        class={[
          styles.window,
          theme.value.floatWindow,
          isMinimized.value && styles.minimized,
          isDragging.value && styles.dragging,
          isResizing.value && styles.resizing,
        ]}
        style={{
          left: `${x.value}%`,
          top: `${y.value}%`,
          width: isMinimized.value ? '60px' : `${width.value}%`,
          height: isMinimized.value ? '60px' : `${height.value}%`,
        }}
      >
        {/* 标题栏 */}
        <div
          class={[styles.titleBar, theme.value.titleBar]}
          onMousedown={startDrag}
          onDblclick={handleTitleDoubleClick}
        >
          {!isMinimized.value && (
            <>
              <div class={styles.title}>{props.title}</div>
              <div class={styles.controls}>
                {props.minimizable && (
                  <button
                    class={[styles.controlBtn, styles.minimizeBtn]}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleMinimize();
                    }}
                    onMousedown={(e) => {
                      e.stopPropagation();
                    }}
                    title="最小化"
                  >
                    <div class={styles.minimizeIcon} />
                  </button>
                )}
                {props.closable && (
                  <button
                    class={[styles.controlBtn, styles.closeBtn]}
                    onClick={(e) => {
                      e.stopPropagation();
                      closeWindow();
                    }}
                    onMousedown={(e) => {
                      e.stopPropagation();
                    }}
                    title="关闭"
                  >
                    <div class={styles.closeIcon} />
                  </button>
                )}
              </div>
            </>
          )}
          {isMinimized.value && (
            <div class={styles.minimizedIcon} onClick={toggleMinimize}>
              <span class={props.icon} />
            </div>
          )}
        </div>

        {/* 内容区域 */}
        {!isMinimized.value && (
          <div class={styles.content}>
            {slots.default?.()}
          </div>
        )}

        {/* 调整大小手柄 */}
        {!isMinimized.value && props.resizable && (
          <>
            <div class={[styles.resizeHandle, styles.resizeN]} onMousedown={(e) => startResize(e, 'n')} />
            <div class={[styles.resizeHandle, styles.resizeS]} onMousedown={(e) => startResize(e, 's')} />
            <div class={[styles.resizeHandle, styles.resizeW]} onMousedown={(e) => startResize(e, 'w')} />
            <div class={[styles.resizeHandle, styles.resizeE]} onMousedown={(e) => startResize(e, 'e')} />
            <div class={[styles.resizeHandle, styles.resizeNw]} onMousedown={(e) => startResize(e, 'nw')} />
            <div class={[styles.resizeHandle, styles.resizeNe]} onMousedown={(e) => startResize(e, 'ne')} />
            <div class={[styles.resizeHandle, styles.resizeSw]} onMousedown={(e) => startResize(e, 'sw')} />
            <div class={[styles.resizeHandle, styles.resizeSe]} onMousedown={(e) => startResize(e, 'se')} />
          </>
        )}
      </div>
    );
  },
});
