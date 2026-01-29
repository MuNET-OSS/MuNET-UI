import { useMagicKeys, useTimeout, useVModel, whenever } from '@vueuse/core';
import { defineComponent, PropType, computed, watch, Transition, Teleport, onBeforeUnmount, ref, inject } from 'vue';
import { modalShowing, registerModal, unregisterModal, getModalIndex, isTopModal } from '../../states/modal';
import styles from './styles.module.sass';
import WarningBackground from '../WarningBackground';

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
    actionDelay: { type: Number, default: 0 },
  },
  setup(props, { emit, slots, expose }) {
    const modalId = ref<symbol | null>(null);

    const show = computed({
      get: () => props.show,
      set(v) {
        props.onUpdateShow?.(v);
        emit('update:show', v);
      },
    });

    // 管理 modal 的注册和注销
    watch(() => show.value, (v) => {
      if (v && !modalId.value) {
        // 打开时注册
        modalId.value = registerModal();
      } else if (!v && modalId.value) {
        // 关闭时注销
        unregisterModal(modalId.value);
        modalId.value = null;
      }
    }, { immediate: true });

    // 组件卸载时确保清理
    onBeforeUnmount(() => {
      if (modalId.value) {
        unregisterModal(modalId.value);
        modalId.value = null;
      }
    });

    // 计算当前 modal 的 z-index
    const zIndex = computed(() => {
      if (!modalId.value) return 58;
      const index = getModalIndex(modalId.value);
      return 58 + index * 3; // 每个 modal 占用 3 层（backdrop, container, content）
    });

    const esc = () => {
      if (!show.value) return;
      // 只有最顶层的 modal 才响应 ESC
      if (modalId.value && !isTopModal(modalId.value)) return;
      if (props.esc) {
        console.log('esc');
        show.value = false;
      }
    };
    const { escape } = useMagicKeys();
    whenever(() => escape.value, esc);
    // 用于 noron，对话框只在下半屏出现
    const positionClass = inject('modalPosition', "absolute left-0 right-0 bottom-0 top-0")

    const actionDelayOver = ref(false);
    watch(() => show.value, v => {
      if (!v) {
        actionDelayOver.value = true;
        return;
      }
      actionDelayOver.value = false;
      setTimeout(() => {
        actionDelayOver.value = true;
      }, props.actionDelay + 500);
    }, { immediate: true });
    const actionDelay = computed(() => actionDelayOver.value ? 0 : props.actionDelay);

    return () => <Teleport to="#app">
      <Transition
        duration={500 + actionDelay.value}
        enterFromClass={styles.src} leaveToClass={styles.src} enterActiveClass={[styles.progress, styles.in].join(' ')} leaveActiveClass={[styles.progress, styles.out].join(' ')}
      >
        {show.value && <div class="mnui-modal-root" style={{ '--action-delay': actionDelay.value + 'ms' }}>
          <div class={styles.backdrop} style={{ zIndex: zIndex.value }} onClick={esc} />
          <div class={positionClass}>
            <div class={['absolute left-50% top-50% translate--50%', props.esc && styles.modalOut]} style={{ zIndex: zIndex.value + 1 }}>
              <div class={['bg-modal rd-2xl p-6 flex flex-col max-w-90dvw', styles.modal, props.innerClass]} style={{ width: props.width, zIndex: zIndex.value + 2 }}>
                {props.warn && (slots.warning?.() || <WarningBackground class="absolute top-0 left-0 right-0 h-12 rd-t-2xl" />)}
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
          </div>
        </div>}
      </Transition>
    </Teleport>;
  },
});
