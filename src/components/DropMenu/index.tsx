import { defineComponent, PropType, ref, computed } from 'vue';
import DropDown from './DropDown';

export default defineComponent({
  props: {
    buttonText: { type: String as PropType<string>, default: 'Menu' },
    width: { type: String as PropType<string>, default: 'max-context' },
    row: Boolean,
    options: { type: Array as PropType<{ label: string, desc?: string, icon?: string, disabled?: boolean, action: () => any }[]>, default: () => [] },
    innerClass: { type: String as PropType<string>, default: '' },
    align: { type: String as PropType<'center' | 'left' | 'right'>, default: 'center' },
  },
  setup(props, { slots }) {
    const dd = ref<any>();

    return () => <DropDown
      buttonText={props.buttonText} innerStyle={{ width: props.width }} ref={dd} align={props.align}
      innerClass={['bg-dropMenu rounded-lg p-2 flex gap-2 backdrop-blur-8', !props.row && 'flex-col', props.innerClass]}
    >
      {{
        default: () => props.options.map((option, index) => (
          <div
            key={index}
            class={['w-full min-w-max flex items-center px-4 py-2 rounded-lg bg-avatarMenuButton transition-colors gap-2', option.disabled && 'op-50 cursor-not-allowed']}
            onClick={() => {
              if (option.disabled) return;
              dd.value?.setShow(false);
              option.action();
            }}
          >
            {option.icon && <span class={[option.icon, 'text-lg shrink-0']} />}
            <div class="flex flex-col">
              <span>{option.label}</span>
              {option.desc && <span class="text-xs op-60">{option.desc}</span>}
            </div>
          </div>
        )),
        trigger: slots.trigger,
      }}
    </DropDown>;
  },
});

