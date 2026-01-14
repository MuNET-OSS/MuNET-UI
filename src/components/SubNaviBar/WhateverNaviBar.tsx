import { theme } from '../../themes';
import { defineComponent, PropType, ref, computed, Transition } from 'vue';

export type NaviItem = {
  name: string;
  onClick: () => any;
  selected: boolean;
  icon?: string;
  hidden?: boolean;
  disabled?: boolean;
}

export default defineComponent({
  props: {
    items: { type: Array as PropType<NaviItem[]>, required: true },
  },
  setup(props, { emit }) {
    return () => <Transition mode="out-in" enterActiveClass="transition-all-500" leaveActiveClass="transition-all-500" enterFromClass="op-0 translate-y-100%" leaveToClass="op-0 translate-y--100%">
      <div class={['h-8 flex items-center of-x-auto of-y-hidden gap-2', theme.value.subNaviBar]} key="navi">
{props.items.filter(it => !it.hidden).map(it => <div
          onClick={() => !it.disabled && it.onClick()}
          class={['h-full px-3 py-2 flex items-center rd-md shrink-0 transition-colors', it.selected && theme.value.active, it.disabled && ['op-50 cursor-not-allowed', theme.value.disabled]]}
        >
          {it.icon && <span class={['mr-2', it.icon]} />}
          {it.name}
        </div>)}
      </div>
    </Transition>;
  },
});

