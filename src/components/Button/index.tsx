import { theme } from '../../themes';
import LoadingBackground from './LoadingBackground';
import { defineComponent, PropType } from 'vue';

export default defineComponent({
  props: {
    onClick: Function as PropType<() => any>,
    onContextmenu: Function as PropType<() => any>,
    disabled: Boolean,
    ing: Boolean,
  },
  setup(props, { emit, slots }) {

    return () => <button class="relative of-hidden" disabled={props.disabled || props.ing} onClick={props.onClick} onContextmenu={props.onContextmenu}>
      <div class="z-2 inline-flex items-center justify-center">{slots.default?.()}</div>
      {props.ing && <LoadingBackground class={['absolute bottom-0 left-0 right-0 top-25% z-1', theme.value.loadingBackground]} />}
    </button>;
  },
});
