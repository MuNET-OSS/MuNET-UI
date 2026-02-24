import { defineComponent, PropType, computed } from 'vue';

const Progress = defineComponent({
  props: {
    percentage: {
      type: Number,
      default: 0,
    },
    status: {
      type: String as PropType<'default' | 'success' | 'error'>,
      default: 'default',
    },
    showIndicator: {
      type: Boolean,
      default: false,
    },
  },
  setup(props) {
    const barColor = computed(() => {
      if (props.status === 'success') return 'bg-green-500';
      if (props.status === 'error') return 'bg-red-500';
      return 'bg-blue-500';
    });

    const clampedPct = computed(() => Math.min(100, Math.max(0, props.percentage)));

    return () => (
      <div class="flex items-center gap-2 w-full">
        <div class="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            class={[barColor.value, 'h-full rounded-full']}
            style={{ width: `${clampedPct.value}%` }}
          />
        </div>
        {props.showIndicator && (
          <span class="text-sm text-gray-600 min-w-10 text-right">
            {clampedPct.value}%
          </span>
        )}
      </div>
    );
  },
});

export default Progress;
