import { defineComponent, PropType, ref, computed, inject, Ref, VNode, Teleport, CSSProperties } from 'vue';
import { useVModel, onClickOutside } from '@vueuse/core';
import styles from './style.module.sass';
import { theme } from '../../themes';
import TransitionVertical from '../TransitionVertical.vue';
import { JSX } from 'vue/jsx-runtime';
import { getUIString } from '../../i18n';

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
      default: undefined,
    },
    disabled: Boolean,
    onChange: Function as PropType<(value: any) => void>,
  },
  setup(props, { emit, expose }) {
    const value = useVModel(props, 'value', emit);
    const disabledInject = inject<Ref<boolean>>('disabled');
    const disabled = computed(() => props.disabled || disabledInject?.value);
    const isOpen = ref(false);
    const selectRef = ref<HTMLDivElement | null>(null);
    const dropdownPosition = ref<'bottom' | 'top'>('bottom');
    const dropdownRef = ref<HTMLDivElement | null>(null);
    const dropdownStyle = ref<CSSProperties>({});
    const placeholderText = getUIString('selectPlaceholder');
    const emptyText = getUIString('selectEmpty');

    const selectedOption = computed(() => {
      return props.options.find(opt => opt.value === value.value);
    });

    const renderLabel = (label: string | number | (() => VNode | string | number)) => {
      return typeof label === 'function' ? label() : label;
    };

    const displayText = computed(() => {
      if (!selectedOption.value) return props.placeholder ?? placeholderText.value;
      const label = selectedOption.value.label;
      return typeof label === 'function' ? label() : label;
    });

    const updateDropdownPosition = () => {
      if (!selectRef.value) return;
      const rect = selectRef.value.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const spaceBelow = viewportHeight - rect.bottom;
      const spaceAbove = rect.top;
      const dropdownMaxHeight = 500;
      const hue = getComputedStyle(selectRef.value).getPropertyValue('--hue');
      const baseStyle: CSSProperties = {
        position: 'fixed',
        left: `${rect.left}px`,
        width: `${rect.width}px`,
        '--hue': hue,
      } as CSSProperties;
      if (spaceBelow < dropdownMaxHeight && spaceAbove > spaceBelow) {
        dropdownPosition.value = 'top';
        dropdownStyle.value = { ...baseStyle, bottom: `${viewportHeight - rect.top + 8}px` };
      } else {
        dropdownPosition.value = 'bottom';
        dropdownStyle.value = { ...baseStyle, top: `${rect.bottom + 8}px` };
      }
    };

    const toggleDropdown = () => {
      if (disabled.value) return;
      if (!isOpen.value) {
        updateDropdownPosition();
      }
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
    }, { ignore: [dropdownRef] });

    expose<SelectExposed>({
      open: () => {
        if (!disabled.value) {
          updateDropdownPosition();
          isOpen.value = true;
        }
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

        <Teleport to="#app">
          <TransitionVertical>
            {isOpen.value && (
              <div
                ref={dropdownRef}
                class={[
                  styles.dropdown,
                  'bg-dropMenu backdrop-blur-8',
                  dropdownPosition.value === 'top' && styles.dropdownTop
                ]}
                style={dropdownStyle.value}
              >
                {props.options.length === 0 ? (
                  <div class={styles.empty}>{emptyText.value}</div>
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
        </Teleport>
      </div>
    );
  },
});

export type SelectInstance = InstanceType<typeof Select> & SelectExposed;

export default Select;

