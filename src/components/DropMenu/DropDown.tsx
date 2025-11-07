import { defineComponent, PropType, ref, computed } from 'vue';
import { onClickOutside } from '@vueuse/core';
import TransitionVertical from '../TransitionVertical.vue';
import Button from '../Button';

export default defineComponent({
  props: {
    innerClass: [String, Array],
    innerStyle: Object,
    buttonText: { type: String as PropType<string>, default: 'Menu' },
    buttonIng: Boolean,
  },
  setup(props, { emit, slots, expose }) {
    const show = ref(false);
    const menuRef = ref<HTMLDivElement | null>(null);
    onClickOutside(menuRef, event => show.value = false);

    expose({
      setShow: (s: boolean) => {
        show.value = s;
      },
    });

    return () => <div class="flex">
      <div class="relative" ref={menuRef}>
        {slots.trigger ? slots.trigger(() => show.value = !show.value) :
          <Button ing={props.buttonIng} onClick={() => show.value = !show.value}>{props.buttonText}</Button>}
        <TransitionVertical>
          {show.value &&
            <div
              class={props.innerClass}
              style={props.innerStyle}
            >
              {slots.default?.()}
            </div>
          }
        </TransitionVertical>
      </div>
    </div>;
  },
});

