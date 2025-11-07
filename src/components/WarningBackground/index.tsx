import { theme } from '../../themes';
import { defineComponent, PropType, ref, computed } from 'vue';
import styles from './index.module.sass';

export default defineComponent({
  props: {
    animate: {
      type: Boolean,
      default: true,
    },
  },
  setup(props, { emit, slots }) {

    return () => <div class={[styles.warning, theme.value.warningBackground, props.animate && styles.animate]}>
      {slots.default?.()}
    </div>;
  },
});

