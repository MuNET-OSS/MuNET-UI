import { useVModel } from '@vueuse/core';
import { defineComponent, PropType, ref, computed, watch, shallowRef } from 'vue';
import TextInput, { TextInputInstance } from './TextInput';
import * as _ from 'lodash-es';

export default defineComponent({
  props: {
    min: { type: Number, default: -Infinity },
    max: { type: Number, default: Infinity },
    step: { type: Number, default: 1 },
    decimal: { type: Number, default: 0 },
    value: { type: Number, default: 0 },
    disabled: Boolean,
    onChange: Function as PropType<() => void>,
    onFocus: Function as PropType<() => void>,
    innerClass: { type: String, default: 'min-h-12 cst' },
  },
  setup(props, { emit }) {
    const value = useVModel(props, 'value', emit);
    const display = ref('');
    const wrap = computed({
      get: () => display.value,
      set: (v: string) => {
        display.value = v;
        value.value = _.clamp(Number(v), props.min, props.max);
      },
    });
    const refresh = ()=>{
      display.value = (value.value ?? 0).toFixed(props.decimal);
    }
    const commitChange = () => {
      refresh();
      props.onChange?.();
    };
    const inputRef = shallowRef<TextInputInstance>();
    watch(()=>props.value, ()=>{
      if(inputRef?.value?.focused){
        console.log('focused, not refresh');
        return;
      }
      refresh();
    }, { immediate: true });

    return () => <TextInput ref={inputRef} v-model:value={wrap.value} type="number" step={props.step} disabled={props.disabled} onBlur={commitChange} onEnterPressed={commitChange} onFocus={props.onFocus} innerClass={props.innerClass} />;
  },
});
