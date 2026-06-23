import { defineComponent, PropType, ref, computed, inject, Ref, VNode, Teleport, CSSProperties, watch, nextTick } from 'vue';
import { useVModel, onClickOutside } from '@vueuse/core';
import styles from './style.module.sass';
import { theme } from '../../themes';
import TransitionVertical from '../TransitionVertical.vue';
import { JSX } from 'vue/jsx-runtime';
import { getUIString } from '../../i18n';

// 请 AI Agents 注意：传值请用 v-model:value 而不是 v-model

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
    // 下拉框宽度按内容自适应（不小于触发器宽度），且选项文字不换行
    dropdownFit: Boolean,
    // 紧凑触发器：更小的字号、高度与内边距
    small: Boolean,
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
      const viewportWidth = window.innerWidth;
      const spaceBelow = viewportHeight - rect.bottom;
      const spaceAbove = rect.top;
      const dropdownMaxHeight = 500;
      const hue = getComputedStyle(selectRef.value).getPropertyValue('--hue');

      // 默认用 transform 让下拉与 trigger 中心对齐（无需预知下拉宽度，避免首帧跳动）；
      // 下拉已挂载且居中会溢出视口时，夹取到边界内并改用明确 left
      let horizontal: CSSProperties;
      if (props.dropdownFit) {
        const center = rect.left + rect.width / 2;
        horizontal = { left: `${center}px`, transform: 'translateX(-50%)' };
        if (dropdownRef.value) {
          const margin = 8;
          const dropdownWidth = dropdownRef.value.offsetWidth;
          const centeredLeft = center - dropdownWidth / 2;
          const maxLeft = viewportWidth - dropdownWidth - margin;
          const clampedLeft = Math.min(Math.max(centeredLeft, margin), Math.max(margin, maxLeft));
          if (clampedLeft !== centeredLeft) {
            horizontal = { left: `${clampedLeft}px`, transform: 'none' };
          }
        }
      } else {
        horizontal = { left: `${rect.left}px` };
      }

      const baseStyle: CSSProperties = {
        position: 'fixed',
        ...horizontal,
        ...(props.dropdownFit
          ? { width: 'max-content', minWidth: `${rect.width}px`, maxWidth: '90vw' }
          : { width: `${rect.width}px` }),
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

    // 首次渲染后下拉真实宽度才可测量，故再定位一次以完成居中/边界夹取
    watch(isOpen, async (open) => {
      if (!open) return;
      await nextTick();
      updateDropdownPosition();
    });

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
          props.small && styles.small,
          theme.value.textInput,
          disabled.value && styles.disabled,
          isOpen.value && styles.open,
        ]}
      >
        <div
          class={[styles.trigger, props.small && styles.small, !selectedOption.value && styles.placeholder]}
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
                      style={props.dropdownFit ? { whiteSpace: 'nowrap' } : undefined}
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

