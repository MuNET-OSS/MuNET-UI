import { defineComponent, ref, onMounted, onBeforeUnmount, watch, nextTick } from 'vue';
import styles from './styles.module.sass';

export default defineComponent({
  props: {
    title: String
  },
  setup(props, { slots }) {
    const wrapRef = ref<HTMLDivElement>();
    const itemRef = ref<HTMLDivElement>();
    const shouldScroll = ref(false);
    const wrapWidth = ref(0);

    let resizeObserver: ResizeObserver | null = null;

    const checkOverflow = () => {
      if (!wrapRef.value || !itemRef.value) return;

      wrapWidth.value = wrapRef.value.offsetWidth;
      const itemWidth = itemRef.value.scrollWidth;

      if (itemRef.value.innerText.includes('でらっくす譜面'))
        console.log(wrapWidth.value, itemWidth);

      shouldScroll.value = itemWidth > wrapWidth.value;
    };

    onMounted(() => {
      nextTick(() => {
        checkOverflow();

        // 监听尺寸变化
        if (wrapRef.value && typeof ResizeObserver !== 'undefined') {
          resizeObserver = new ResizeObserver(() => {
            checkOverflow();
          });
          resizeObserver.observe(wrapRef.value);
        }
      });
    });

    onBeforeUnmount(() => {
      if (resizeObserver) {
        resizeObserver.disconnect();
        resizeObserver = null;
      }
    });

    // 监听插槽内容变化
    watch(() => slots.default?.(), () => {
      nextTick(() => {
        checkOverflow();
      });
    }, { flush: 'post' });

    return () => (
      <div title={props.title}>
        <div ref={wrapRef} class={styles.wrap}>
          <div ref={itemRef} class={[
            styles.item,
            shouldScroll.value && styles.scrolling,
          ]} style={{ '--wrap-width': wrapWidth.value + 'px' }}>
            {slots.default?.()}
          </div>
        </div>
      </div>
    );
  },
});

