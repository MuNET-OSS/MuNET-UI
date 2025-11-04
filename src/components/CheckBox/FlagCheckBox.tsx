import { defineComponent, PropType, ref, computed, watch } from 'vue';
import CheckBox from '.';

export default defineComponent({
  props: {
    value: { type: Number, default: 0 },
    flag: { type: Number, default: 0 },
    onChange: Function as PropType<() => void>,
    gap: { type: String, default: '0.5rem' },
  },
  setup(props, { emit, slots }) {

    const value = computed({
      get: () => !!(props.value & props.flag),
      set: (value: boolean) => {
        if (value) {
          emit('update:value', props.value | props.flag);
        } else {
          emit('update:value', props.value & ~props.flag);
        }
        props.onChange?.();
      },
    })

    return () => <CheckBox v-model:value={value.value} onChange={props.onChange} gap={props.gap}>
      {slots.default?.()}
    </CheckBox>;
  },
});
