import { computed, defineComponent, inject, PropType, Ref, useId } from 'vue';

export default defineComponent({
  props: {
    onClick: Function as PropType<() => any>,
    value: [String, Number, Boolean, Symbol],
    k: { type: [String, Number, Boolean, Symbol], required: true },
    disabled: Boolean,
  },
  setup(props, { emit, slots }) {
    const id = useId();
    const disabledInject = inject<Ref<boolean>>('disabled');
    const disabled = computed(() => props.disabled || disabledInject?.value);

    return () => <div class="flex gap-2 items-center" style={{ opacity: disabled.value ? 0.5 : undefined }}>
      <input
        type="radio" id={id}
        checked={props.value === props.k}
        disabled={disabled.value}
        onClick={(e: Event) => {
          e.preventDefault();
          if (disabled.value) return;
          emit('update:value', props.k);
          props.onClick?.();
        }}
      />
      <label for={id}>{slots.default?.()}</label>
    </div>;
  },
});
