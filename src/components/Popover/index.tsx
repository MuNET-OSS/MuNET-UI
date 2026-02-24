import {
  computed,
  defineComponent,
  nextTick,
  onBeforeUnmount,
  PropType,
  ref,
  Teleport,
} from 'vue';

type TriggerType = 'hover' | 'click';

export default defineComponent({
  props: {
    trigger: {
      type: String as PropType<TriggerType>,
      default: 'hover',
    },
    offset: {
      type: Number,
      default: 8,
    },
  },
  setup(props, { slots }) {
    const isOpen = ref(false);
    const position = ref<'bottom' | 'top'>('bottom');
    const top = ref(0);
    const left = ref(0);
    const triggerRef = ref<HTMLDivElement | null>(null);
    const popoverRef = ref<HTMLDivElement | null>(null);
    const hideTimer = ref<number | null>(null);
    const isHoverTrigger = computed(() => props.trigger === 'hover');

    const clearHideTimer = () => {
      if (hideTimer.value !== null) {
        window.clearTimeout(hideTimer.value);
        hideTimer.value = null;
      }
    };

    const updatePosition = () => {
      if (!triggerRef.value || !popoverRef.value) return;

      const triggerRect = triggerRef.value.getBoundingClientRect();
      const popoverRect = popoverRef.value.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;
      const spaceBelow = viewportHeight - triggerRect.bottom;
      const spaceAbove = triggerRect.top;

      if (spaceBelow < popoverRect.height + props.offset && spaceAbove > spaceBelow) {
        position.value = 'top';
        top.value = Math.max(8, triggerRect.top - popoverRect.height - props.offset);
      } else {
        position.value = 'bottom';
        top.value = Math.min(
          viewportHeight - popoverRect.height - 8,
          triggerRect.bottom + props.offset,
        );
      }

      const preferredLeft = triggerRect.left;
      left.value = Math.min(
        Math.max(8, preferredLeft),
        Math.max(8, viewportWidth - popoverRect.width - 8),
      );
    };

    const open = () => {
      clearHideTimer();
      if (isOpen.value) {
        updatePosition();
        return;
      }

      isOpen.value = true;
      nextTick(() => {
        updatePosition();
      });
    };

    const close = () => {
      clearHideTimer();
      isOpen.value = false;
    };

    const scheduleClose = () => {
      clearHideTimer();
      hideTimer.value = window.setTimeout(() => {
        isOpen.value = false;
      }, 120);
    };

    const toggle = () => {
      if (isOpen.value) {
        close();
      } else {
        open();
      }
    };

    const handleWindowUpdate = () => {
      if (!isOpen.value) return;
      updatePosition();
    };

    const handleDocumentClick = (event: MouseEvent) => {
      if (props.trigger !== 'click' || !isOpen.value) return;

      const target = event.target as Node | null;
      if (!target) return;

      if (triggerRef.value?.contains(target) || popoverRef.value?.contains(target)) {
        return;
      }

      close();
    };

    window.addEventListener('resize', handleWindowUpdate);
    window.addEventListener('scroll', handleWindowUpdate, true);
    document.addEventListener('click', handleDocumentClick, true);

    onBeforeUnmount(() => {
      clearHideTimer();
      window.removeEventListener('resize', handleWindowUpdate);
      window.removeEventListener('scroll', handleWindowUpdate, true);
      document.removeEventListener('click', handleDocumentClick, true);
    });

    return () => (
      <>
        <div
          ref={triggerRef}
          class="inline-flex"
          onMouseenter={() => isHoverTrigger.value && open()}
          onMouseleave={() => isHoverTrigger.value && scheduleClose()}
          onClick={() => props.trigger === 'click' && toggle()}
        >
          {slots.trigger?.()}
        </div>

        <Teleport to="#app">
          {isOpen.value && (
            <div
              ref={popoverRef}
              class="fixed z-80 max-w-90vw rd-2 bg-dropMenu p-2 text-sm shadow-lg backdrop-blur-8"
              style={{ top: `${top.value}px`, left: `${left.value}px` }}
              onMouseenter={() => isHoverTrigger.value && clearHideTimer()}
              onMouseleave={() => isHoverTrigger.value && scheduleClose()}
            >
              {slots.default?.()}
            </div>
          )}
        </Teleport>
      </>
    );
  },
});
