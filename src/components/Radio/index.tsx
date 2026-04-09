import { defineComponent, PropType, useId } from 'vue';

export default defineComponent({
  props: {
    onClick: Function as PropType<() => any>,
    value: [String, Number, Boolean, Symbol],
    k: { type: [String, Number, Boolean, Symbol], required: true },
    disabled: Boolean,
  },
  setup(props, { emit, slots }) {
    const id = useId();

    return () => <div class="flex gap-2 items-center">
      <input
        type="radio" id={id}
        checked={props.value === props.k}
        disabled={props.disabled}
        onClick={(e: Event) => {
          e.preventDefault();
          if (props.disabled) return;
          emit('update:value', props.k);
          props.onClick?.();
        }}
      />
      <label for={id}>{slots.default?.()}</label>
    </div>;
  },
});
