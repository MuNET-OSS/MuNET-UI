import { theme } from '../../themes';
import LoadingBackground from './LoadingBackground';
import { defineComponent, PropType } from 'vue';

export default defineComponent({
  props: {
    onClick: Function as PropType<() => any>,
    onContextmenu: Function as PropType<() => any>,
    disabled: Boolean,
    ing: Boolean,
    variant: String as PropType<'primary' | 'secondary' | 'ghost'>,
    danger: Boolean,
    size: String as PropType<'small' | 'medium'>,
  },
  setup(props, { emit, slots }) {
    const getVariantClass = () => {
      if (props.danger) {
        // if (props.variant === 'primary') {
        //   return 'bg-red-600! border-red-600! text-white!';
        // }
        return 'text-red-4 hover:bg-red-4/10!';
      }

      switch (props.variant) {
        // case 'primary':
        //   return 'bg-[var(--link-color)]! border-[var(--link-color)]! text-white!';
        // case 'secondary':
        //   return 'bg-transparent! border-[var(--link-color)]! text-[var(--link-color)]!';
        // case 'ghost':
        //   return 'bg-transparent! border-transparent! text-[var(--link-color)]! hover:bg-[var(--link-color)]/12! active:bg-[var(--link-color)]/18!';
        default:
          return '';
      }
    };

    const getSizeClass = () => {
      if (props.size === 'small') {
        return 'h-8 text-sm px-2';
      }
      if (props.size === 'medium') {
        return 'h-10 text-base px-4';
      }
      return '';
    };

    return () => <button class={['relative of-hidden', getVariantClass(), getSizeClass()]} disabled={props.disabled || props.ing} onClick={props.onClick} onContextmenu={props.onContextmenu}>
      <div class="z-2 inline-flex items-center justify-center">{slots.default?.()}</div>
      {props.ing && <LoadingBackground class={['absolute bottom-0 left-0 right-0 top-25% z-1', theme.value.loadingBackground]} />}
    </button>;
  },
});
