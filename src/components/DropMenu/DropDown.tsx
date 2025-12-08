import { defineComponent, PropType, ref, computed, CSSProperties } from 'vue';
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
  },
  setup(props, { emit, slots, expose }) {
    const show = ref(false);
    const menuRef = ref<HTMLDivElement | null>(null);
    const position = ref<'bottom' | 'top'>('bottom');

    onClickOutside(menuRef, event => show.value = false);

    const updatePosition = () => {
      if (!props.autoPosition || !menuRef.value) return;

      const rect = menuRef.value.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const spaceBelow = viewportHeight - rect.bottom;
      const spaceAbove = rect.top;

      // 如果下方空间不足且上方空间更充足，则向上展开
      if (spaceBelow < props.maxHeight && spaceAbove > spaceBelow) {
        position.value = 'top';
      } else {
        position.value = 'bottom';
      }
    };

    const toggle = (val?: boolean) => {
      const next = typeof val === 'boolean' ? val : !show.value;
      if (next) {
        updatePosition();
      }
      show.value = next;
    };

    expose({
      setShow: (s: boolean) => {
        toggle(s);
      },
    });

    const dropdownStyle = computed(() => {
      const base = props.innerStyle || {};
      if (!props.autoPosition) return base;

      const posStyle: CSSProperties = {
        position: 'absolute',
        zIndex: 100,
      };

      if (position.value === 'bottom') {
        posStyle.top = `calc(100% + ${props.gap}px)`;
        posStyle.transformOrigin = 'top center';
      } else {
        posStyle.bottom = `calc(100% + ${props.gap}px)`;
        posStyle.top = 'auto';
        posStyle.transformOrigin = 'bottom center';
      }

      return { ...base, ...posStyle };
    });

    return () => <div class="relative" ref={menuRef}>
      {slots.trigger ? slots.trigger(toggle) :
        <Button ing={props.buttonIng} onClick={() => toggle()}>{props.buttonText}</Button>}
      <TransitionVertical>
        {show.value &&
          <div
            class={props.innerClass}
            style={dropdownStyle.value}
          >
            {slots.default?.()}
          </div>
        }
      </TransitionVertical>
    </div>;
  },
});
