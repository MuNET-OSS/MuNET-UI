import { defineComponent, PropType, ref, computed, inject, Ref, VNode } from 'vue';
import { useVModel, onClickOutside } from '@vueuse/core';
import styles from './style.module.sass';
import { theme } from '../../themes';
import TransitionVertical from '../TransitionVertical.vue';
import { JSX } from 'vue/jsx-runtime';

export interface SelectOption {
  label: string | number | (() => VNode | string | number | JSX.Element);
  value: string | number;
  disabled?: boolean;
}

export interface SelectExposed {
  open: () => void;
  close: () => void;
}

const Select = defineComponent({
  props: {
    value: [String, Number],
    options: {
      type: Array as PropType<SelectOption[]>,
      default: () => [],
    },
    placeholder: {
      type: String,
      default: '请选择',
    },
    disabled: Boolean,
    onChange: Function as PropType<(value: string | number) => void>,
  },
  setup(props, { emit, expose }) {
    const value = useVModel(props, 'value', emit);
    const disabledInject = inject<Ref<boolean>>('disabled');
    const disabled = computed(() => props.disabled || disabledInject?.value);
    const isOpen = ref(false);
    const selectRef = ref<HTMLDivElement | null>(null);

    const selectedOption = computed(() => {
      return props.options.find(opt => opt.value === value.value);
    });

    const renderLabel = (label: string | (() => VNode | string)) => {
      return typeof label === 'function' ? label() : label;
    };

    const displayText = computed(() => {
      if (!selectedOption.value) return props.placeholder;
      const label = selectedOption.value.label;
      return typeof label === 'function' ? label() : label;
    });

    const toggleDropdown = () => {
      if (disabled.value) return;
      isOpen.value = !isOpen.value;
    };

    const selectOption = (option: SelectOption) => {
      if (option.disabled || disabled.value) return;
      value.value = option.value;
      isOpen.value = false;
      props.onChange?.(option.value);
    };

    onClickOutside(selectRef, () => {
      isOpen.value = false;
    });

    expose<SelectExposed>({
      open: () => {
        if (!disabled.value) isOpen.value = true;
      },
      close: () => {
        isOpen.value = false;
      },
    });

    return () => (
      <div
        ref={selectRef}
        class={[
          styles.select,
          theme.value.textInput,
          disabled.value && styles.disabled,
          isOpen.value && styles.open,
        ]}
      >
        <div
          class={[styles.trigger, !selectedOption.value && styles.placeholder]}
          onClick={toggleDropdown}
        >
          <span class={styles.text}>{displayText.value}</span>
          <span class={[styles.arrow, isOpen.value && styles.arrowOpen, 'i-solar:alt-arrow-down-linear']} />
        </div>

        <TransitionVertical>
          {isOpen.value && (
            <div class={[styles.dropdown, 'bg-dropMenu backdrop-blur-8']}>
              {props.options.length === 0 ? (
                <div class={styles.empty}>暂无选项</div>
              ) : (
                props.options.map((option) => (
                  <div
                    key={option.value}
                    class={[
                      styles.option,
                      'bg-avatarMenuButton',
                      option.value === value.value && styles.selected,
                      option.disabled && styles.optionDisabled,
                    ]}
                    onClick={() => selectOption(option)}
                  >
                    {renderLabel(option.label)}
                  </div>
                ))
              )}
            </div>
          )}
        </TransitionVertical>
      </div>
    );
  },
});

export type SelectInstance = InstanceType<typeof Select> & SelectExposed;

export default Select;

