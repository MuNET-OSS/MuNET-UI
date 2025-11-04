import { addToast } from '../../controllers/toastController';
import { useVModel } from '@vueuse/core';
import * as _ from 'lodash-es';
import { defineComponent, PropType, ref, computed, useId } from 'vue';

export default defineComponent({
  props: {
    value: Boolean,
    egg: Boolean,
    debounce: Boolean,
    gap: { type: String, default: '0.5rem' },
    onChange: Function as PropType<() => void>,
  },
  setup(props, { emit, slots }) {
    const uuid = useId();
    const value = useVModel(props, 'value', emit);
    const clickCount = ref(0);
    const debounceClear = _.debounce(() => clickCount.value = 0, 500);
    const debounceOnChange = _.debounce(() => props.onChange?.(), 500);

    const onChange = () => {
      if (props.egg) {
        clickCount.value++;
        if (clickCount.value === 16) {
          addToast({
            message: '不要再打了……要坏了………',
            type: 'warning',
          });
        }
        debounceClear();
      }
      if (props.debounce) {
        debounceOnChange();
      }
      else {
        props.onChange?.();
      }
    };

    return () => <div class={'flex items-center'} style={{ gap: props.gap }}>
      <input class="shrink-0" id={uuid} type="checkbox" v-model={value.value} title={props.egg ? '是不是想对着这里打纵连？' : ''} onChange={onChange} />
      <label for={uuid}>
        {slots.default?.()}
      </label>
    </div>;
  },
});
