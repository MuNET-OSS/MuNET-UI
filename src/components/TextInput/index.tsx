import { modalShowing } from '../../states/modal';
import { defineComponent, PropType, ref, computed, inject, Ref, Transition } from 'vue';
import { onStartTyping, useElementSize, useVModel } from '@vueuse/core';
import styles from './style.module.sass';
import Button from '../Button';
import { theme } from '../../themes';

export default defineComponent({
  props: {
    value: String,
    type: String,
    placeholder: String,
    disabled: Boolean,
    textarea: Boolean,
    height: String,
    saveButtonText: String,
    typeFocus: Boolean,
    limit: Number,
    ing: Boolean,
    onSaveButtonClick: Function as PropType<() => void>,
    onEnterPressed: Function as PropType<() => void>,
    onBlur: Function as PropType<() => void>,
    onFocus: Function as PropType<() => void>,
  },
  setup(props, { emit, expose }) {
    const value = useVModel(props, 'value', emit);
    const disabledInject = inject<Ref<boolean>>('disabled');
    const disabled = computed(() => props.disabled || disabledInject?.value);
    const inputRef = ref<HTMLInputElement | HTMLTextAreaElement | null>(null);
    const onKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !disabled.value) {
        e.preventDefault();
        if (props.onEnterPressed) {
          props.onEnterPressed();
          return;
        }
        if (!props.saveButtonText) {
          return;
        }
        props.onSaveButtonClick?.();
      }
    };

    expose({
      insertText: (text: string) => {
        if (inputRef.value) {
          const inputElement = inputRef.value as HTMLInputElement | HTMLTextAreaElement;
          const start = inputElement.selectionStart || 0;
          const end = inputElement.selectionEnd || 0;
          const currentValue = inputElement.value;
          inputElement.value = currentValue.slice(0, start) + text + currentValue.slice(end);
          inputElement.setSelectionRange(start + text.length, start + text.length);
          value.value = inputElement.value; // Update the v-model value
          inputElement.focus(); // Keep the focus on the input
        }
      },
    });

    onStartTyping(() => {
      if (!props.typeFocus) return;
      if (modalShowing.value) return;
      inputRef.value?.focus();
    });

    const isLimitExceeded = computed(() => {
      if (!props.limit) return false;
      return (value.value?.length || 0) >= props.limit;
    });
    const showSaveButton = computed(() => {
      if (!props.saveButtonText) return false;
      return !isLimitExceeded.value;
    });
    const saveButton = ref<InstanceType<typeof Button> | null>(null);
    const { width: saveButtonWidth } = useElementSize(saveButton);
    const limitTextRight = computed(() => {
      if (!showSaveButton.value) return '0.5rem';
      return `calc(${saveButtonWidth.value}px + 3.2rem)`;
    });

    return () => <div class={['flex', styles.wrapper, theme.value.textInput, disabled.value && styles.disabled]}>
      {props.textarea ?
        <textarea ref={inputRef} v-model={value.value} placeholder={props.placeholder} disabled={disabled.value} onBlur={props.onBlur} onFocus={props.onFocus} style={{ height: props.height }} class="min-h-12 cst" />
        :
        <input ref={inputRef} v-model={value.value} type={props.type} placeholder={props.placeholder} disabled={disabled.value} onBlur={props.onBlur} onFocus={props.onFocus} onKeypress={onKeyPress} class="min-h-12" />
      }
      {props.limit && <div style={{ right: limitTextRight.value }} class={['absolute bottom-1 text-2.5 op-60 pointer-events-none transition-right', isLimitExceeded.value && 'c-red-5 font-bold']}>
        {props.limit - (value.value?.length || 0)}
      </div>}
      <Transition
        enterActiveClass={styles.active} leaveActiveClass={styles.active} enterFromClass={styles.from}
        enterToClass={styles.to} leaveFromClass={styles.to} leaveToClass={styles.from}
      >
        {showSaveButton.value &&
          <Button ref={saveButton} ing={props.ing} class={['absolute! right-1', styles.save, !props.textarea && 'top-0 bottom-0 m-auto', props.textarea && 'bottom-1']} onClick={props.onSaveButtonClick}>
            {props.saveButtonText}
          </Button>}
      </Transition>
    </div>;
  },
});
