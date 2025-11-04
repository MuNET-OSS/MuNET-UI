import { useDateFormat } from '@vueuse/core';
import { defineComponent, PropType, ref, computed, watch } from 'vue';

export default defineComponent({
  props: {
    value: { type: [String, Number, Date], required: true },
    format: { type: String, default: 'YYYY/MM/DD HH:mm:ss' },
  },
  setup(props, { emit }) {
    const date = useDateFormat(props.value, props.format);
    return () => date.value;
  },
});
