import { defineComponent, PropType, ref, CSSProperties, HTMLAttributes, Teleport, onBeforeUnmount, watch, nextTick } from 'vue';
import { onClickOutside } from '@vueuse/core';
import TransitionVertical from '../TransitionVertical.vue';
import Button from '../Button';

export default defineComponent({
  inheritAttrs: false,
  props: {
    innerClass: [String, Array],
    innerStyle: [Object, String] as PropType<CSSProperties>,
    buttonText: { type: String as PropType<string>, default: 'Menu' },
    buttonIng: Boolean,
    gap: { type: Number, default: 8 },
    autoPosition: { type: Boolean, default: true },
    maxHeight: { type: Number, default: 200 },
    align: { type: String as PropType<'center' | 'left' | 'right'>, default: 'center' },
  },
  setup(props, { attrs, slots, expose }) {
    const show = ref(false);
    const menuRef = ref<HTMLDivElement | null>(null);
    const dropdownRef = ref<HTMLDivElement | null>(null);
    const position = ref<'bottom' | 'top'>('bottom');
    const dropdownStyle = ref<CSSProperties>({});

    onClickOutside(menuRef, event => show.value = false, { ignore: [dropdownRef] });

    const updatePosition = () => {
      if (!props.autoPosition || !menuRef.value) return;

      const rect = menuRef.value.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;
      const spaceBelow = viewportHeight - rect.bottom;
      const spaceAbove = rect.top;
      const margin = 8;
      const dropdownWidth = dropdownRef.value?.offsetWidth ?? 0;

      const baseStyle: CSSProperties = {
        position: 'fixed',
        zIndex: 100,
      };
      if (props.align === 'right') {
        const rightOffset = Math.max(margin, viewportWidth - rect.right);
        if (dropdownWidth > 0 && viewportWidth - rightOffset - dropdownWidth < margin) {
          baseStyle.left = `${margin}px`;
          baseStyle.transform = 'none';
        } else {
          baseStyle.right = `${rightOffset}px`;
        }
      } else if (props.align === 'left') {
        const preferredLeft = Math.max(margin, rect.left);
        if (dropdownWidth > 0 && preferredLeft + dropdownWidth > viewportWidth - margin) {
          if (dropdownWidth + margin * 2 <= viewportWidth) {
            baseStyle.right = `${margin}px`;
          } else {
            baseStyle.left = `${margin}px`;
          }
          baseStyle.transform = 'none';
        } else {
          baseStyle.left = `${preferredLeft}px`;
        }
      } else {
        const center = rect.left + rect.width / 2;
        if (dropdownWidth > 0) {
          const centeredLeft = center - dropdownWidth / 2;
          const centeredRight = center + dropdownWidth / 2;
          if (centeredLeft < margin || dropdownWidth + margin * 2 > viewportWidth) {
            baseStyle.left = `${margin}px`;
            baseStyle.transform = 'none';
          } else if (centeredRight > viewportWidth - margin) {
            baseStyle.right = `${margin}px`;
            baseStyle.transform = 'none';
          } else if (center > viewportWidth / 2) {
            baseStyle.right = `${viewportWidth - center}px`;
            baseStyle.transform = 'translateX(50%)';
          } else {
            baseStyle.left = `${center}px`;
            baseStyle.transform = 'translateX(-50%)';
          }
        } else if (center > viewportWidth / 2) {
          baseStyle.right = `${viewportWidth - center}px`;
          baseStyle.transform = 'translateX(50%)';
        } else {
          baseStyle.left = `${center}px`;
          baseStyle.transform = 'translateX(-50%)';
        }
      }

      // 如果下方空间不足且上方空间更充足，则向上展开
      if (spaceBelow < props.maxHeight && spaceAbove > spaceBelow) {
        position.value = 'top';
        baseStyle.bottom = `${viewportHeight - rect.top + props.gap}px`;
        baseStyle.transformOrigin = 'bottom center';
      } else {
        position.value = 'bottom';
        baseStyle.top = `${rect.bottom + props.gap}px`;
        baseStyle.transformOrigin = 'top center';
      }

      dropdownStyle.value = { ...(props.innerStyle || {}), ...baseStyle };
    };

    const toggle = (val?: boolean) => {
      const next = typeof val === 'boolean' ? val : !show.value;
      if (next) {
        updatePosition();
      }
      show.value = next;
    };

    // 首次渲染后下拉真实宽度才可测量，故再定位一次以完成边界夹取
    watch(show, async (open) => {
      if (!open) return;
      await nextTick();
      if (!show.value) return;
      updatePosition();
    });

    watch(() => props.align, () => {
      if (show.value) updatePosition();
    });

    const handleWindowUpdate = () => {
      if (!show.value) return;
      updatePosition();
    };

    window.addEventListener('resize', handleWindowUpdate);
    window.addEventListener('scroll', handleWindowUpdate, true);

    onBeforeUnmount(() => {
      window.removeEventListener('resize', handleWindowUpdate);
      window.removeEventListener('scroll', handleWindowUpdate, true);
    });

    expose({
      setShow: (s: boolean) => {
        toggle(s);
      },
    });


    return () => <>
      <div class="relative" {...(attrs as HTMLAttributes)} ref={menuRef}>
        {slots.trigger ? slots.trigger(toggle) :
          <Button ing={props.buttonIng} onClick={() => toggle()}>{props.buttonText}</Button>}
      </div>
      <Teleport to="#app">
        <TransitionVertical>
          {show.value &&
            <div
              ref={dropdownRef}
              class={props.innerClass}
              style={dropdownStyle.value}
            >
              {slots.default?.()}
            </div>
          }
        </TransitionVertical>
      </Teleport>
    </>;
  },
});
