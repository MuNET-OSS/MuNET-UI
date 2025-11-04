import { defineComponent } from 'vue';
import styles from './index.module.sass';

export default defineComponent({
  setup(props, { slots }) {
    // Note: loadingBackground theme class should be applied by parent
    return () => <div class={styles.loading}>
      {slots.default?.()}
    </div>;
  },
});
