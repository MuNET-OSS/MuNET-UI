import { defineComponent, PropType, ref, computed } from 'vue';
import DropDown from './DropDown';

export default defineComponent({
  props: {
    buttonText: { type: String as PropType<string>, default: 'Menu' },
    width: { type: String as PropType<string>, default: 'max-context' },
    row: Boolean,
    options: { type: Array as PropType<{ label: string, action: () => any }[]>, default: () => [] },
  },
  setup(props, { slots }) {
    const dd = ref<any>();

    return () => <DropDown
      buttonText={props.buttonText} innerStyle={{ width: props.width }} ref={dd}
      innerClass={['absolute top-full left-50% bg-dropMenu rounded-lg p-2 z-10 flex gap-2 translate-x--50% backdrop-blur-8', !props.row && 'flex-col']}
    >
      {{
        default: () => props.options.map((option, index) => (
          <div
            key={index}
            class="w-full min-w-max flex items-center justify-center px-4 py-2 rounded-lg bg-avatarMenuButton transition-colors"
            onClick={() => {
              dd.value?.setShow(false);
              option.action();
            }}
          >
            {option.label}
          </div>
        )),
        trigger: slots.trigger,
      }}
    </DropDown>;
  },
});

