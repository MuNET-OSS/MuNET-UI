import { defineComponent, PropType, ref, computed, onMounted, reactive } from 'vue';
import { ToastInternal, toasts } from '../../controllers/toastController';
import { useNow, useTimeout, whenever } from '@vueuse/core';

const SHOW_MS = 3000;
const colors = {
  info: 'bg-blue-600',
  success: 'bg-green-600',
  warning: 'bg-yellow-600',
  error: 'bg-red-600',
};

export default defineComponent({
  props: {
    toast: { type: Object as PropType<ToastInternal>, required: true },
  },
  setup(props, { emit }) {
    const now = useNow();
    const since = ref(0);
    onMounted(() => since.value = now.value.getTime());
    const msRemaining = computed(() => SHOW_MS - (now.value.getTime() - since.value));
    const style = computed(() => ({
      width: `${msRemaining.value / SHOW_MS * 100}%`,
    }));
    const extraClasses = ref('h-3.5em opacity-100');
    const remove = () => {
      extraClasses.value = 'h-3em opacity-100';
      setTimeout(() => extraClasses.value = 'h-0 m-t-0! opacity-0!', 500);
      setTimeout(() => toasts.value = toasts.value.filter(it => it.rand !== props.toast.rand), 1000);
    };
    whenever(() => now.value.getTime() - since.value >= SHOW_MS - 200, remove);
    const entered = useTimeout(1100);

    return () => <div
      onClick={remove}
      class={['rd-12px relative bg-toast-bar of-hidden transition-all-500 hover:op-70 m-t-4', !entered.value && 'animate__animated animate__bounceInUp', extraClasses.value]}
    >
      <div class="relative rd-12px z-1002 h-3em bg-toast p-x-10 flex items-center">
        {props.toast.message}
      </div>
      <div
        class={['absolute z-1001 h-1em bottom-0 left-0', colors[props.toast.type]]}
        style={style.value}
      />
    </div>;
  },
});

