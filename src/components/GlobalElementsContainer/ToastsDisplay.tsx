import { defineComponent, PropType, ref, computed } from 'vue';
import { toasts } from '../../controllers/toastController';
import Toast from './Toast';

export default defineComponent({
  // props: {
  // },
  setup(props, { emit }) {
    const toastsDisplay = computed(() => toasts.value.slice(0, 5));

    return () => <div class="flex flex-col-reverse absolute bottom-18 left-0 right-0 items-center">
      {toastsDisplay.value.map((it, idx) => <Toast toast={it} key={it.rand} style={{ zIndex: 100 + idx }} />)}
    </div>;
  },
});

