import { defineComponent, ref } from 'vue';
// @ts-ignore
import TransitionVertical from '../TransitionVertical.vue';
import { theme } from '../../themes';

export default defineComponent({
  props: {
    title: String,
    icon: String,
    expend: Boolean,
  },
  setup(props, { emit, slots }) {
    const isExpend = ref(props.expend || false);

    return () => <div class={[theme.value.section, isExpend.value && theme.value.expend]}>
      <div class={['w-full flex items-center justify-between rounded-12px px-4 py-3 outline-none transition-colors', theme.value.trigger]} onClick={() => isExpend.value = !isExpend.value}>
        <div class={['flex gap-1.5']}>
          <div class={['text-6', props.icon]} />
          {props.title}
        </div>
        <div class={['i-solar:alt-arrow-down-linear transform duration-250', isExpend.value && 'rotate-180']} />
      </div>
      <TransitionVertical>
        <div class="grid gap-2 p-4" v-show={isExpend.value}>
          {slots.default?.(isExpend)}
        </div>
      </TransitionVertical>
    </div>;
  },
});
