import { defineComponent, PropType, ref, computed, CSSProperties, Teleport, onBeforeUnmount } from 'vue';
import { onClickOutside } from '@vueuse/core';
import TransitionVertical from '../TransitionVertical.vue';
import Button from '../Button';

export default defineComponent({
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
  setup(props, { emit, slots, expose }) {
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
      const spaceBelow = viewportHeight - rect.bottom;
      const spaceAbove = rect.top;

      const baseStyle: CSSProperties = {
        position: 'fixed',
        zIndex: 100,
      };
      if (props.align === 'right') {
        baseStyle.right = `${window.innerWidth - rect.right}px`;
      } else if (props.align === 'left') {
        baseStyle.left = `${rect.left}px`;
      } else {
        baseStyle.left = `${rect.left + rect.width / 2}px`;
        baseStyle.transform = 'translateX(-50%)';
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
      <div class="relative" ref={menuRef}>
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
