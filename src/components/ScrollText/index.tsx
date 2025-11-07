import { defineComponent, PropType, ref, computed } from 'vue';
import styles from './styles.module.sass';

export default defineComponent({
  props: {
    title: String
  },
  setup(props, { emit, slots }) {

    return () => <div title={props.title}>
      <div class={styles.wrap}>
        <div class={styles.item}>
          {slots.default?.()}
        </div>
      </div>
    </div>;
  },
});

