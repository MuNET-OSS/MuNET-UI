import { defineComponent, PropType, ref, computed, useId } from 'vue';
import { useVModel } from '@vueuse/core';

export default defineComponent({
  props: {
    onClick: Function as PropType<() => any>,
    value: [String, Number, Boolean, Symbol],
    k: { type: [String, Number, Boolean, Symbol], required: true },
  },
  setup(props, { emit, slots }) {
    const id = useId();
    const value = useVModel(props, 'value', emit);

    return () => <div class="flex gap-2 items-center">
      <input
        type="radio" id={id} value={props.k} checked={value.value === props.k}
        onChange={() => {
          console.log('radio changed', props.k);
          value.value = props.k;
          props.onClick?.();
        }}
      />
      <label for={id}>{slots.default?.()}</label>
    </div>;
  },
});
