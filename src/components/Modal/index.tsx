import { useMagicKeys, useVModel, whenever } from '@vueuse/core';
import { defineComponent, PropType, computed, watch, Transition, Teleport } from 'vue';
import { modalShowing } from '../../states/modal';
import styles from './styles.module.sass';

// 重新导出 modalShowing 以保持兼容性
export { modalShowing };

export default defineComponent({
  props: {
    title: { type: String, required: true },
    show: Boolean,
    onUpdateShow: Function as PropType<(v: boolean) => void>,
    esc: { type: Boolean, default: true },
    width: { type: String, default: 'auto' },
    warn: Boolean,
    innerClass: { type: String, default: '' },
  },
  setup(props, { emit, slots }) {
    const show = computed({
      get: () => props.show,
      set(v) {
        props.onUpdateShow?.(v);
        emit('update:show', v);
      },
    });

    // onBeforeUnmount(() => modalShowing.value = show.value = false);
    watch(() => show.value, (v) => modalShowing.value = v);

    const esc = () => {
      if (!show.value) return;
      if (props.esc) {
        console.log('esc');
        modalShowing.value = false;
        show.value = false;
      }
    };
    const { escape } = useMagicKeys();
    whenever(() => escape.value, esc);

    return () => <Teleport to="#app">
      <Transition
        duration={500}
        enterFromClass={styles.src} leaveToClass={styles.src} enterActiveClass={[styles.progress, styles.in].join(' ')} leaveActiveClass={[styles.progress, styles.out].join(' ')}
      >
        {show.value && <div class="mnui-modal-root">
          <div class={[styles.backdrop]} onClick={esc} />
          <div class={['absolute left-50vw top-50dvh translate--50%', props.esc && styles.modalOut]}>
            <div class={['bg-modal rd-2xl z-60 p-6 flex flex-col max-w-90dvw', styles.modal, props.innerClass]} style={{ width: props.width }}>
              {props.warn && slots.warning?.()}
              <div class="flex flex-col gap-4">
                <div class={['text-1.5em flex items-center justify-center']}>
                  <div class={[styles.title]}>
                    {props.title}
                  </div>
                </div>
                <div class={[styles.content]}>
                  {slots.default?.()}
                </div>
              </div>
              <div class={[styles.actions, 'flex gap-4']}>
                {slots.actions?.()}
              </div>
            </div>
          </div>
        </div>}
      </Transition>
    </Teleport>;
  },
});
