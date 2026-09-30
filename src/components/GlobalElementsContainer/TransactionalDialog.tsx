import Modal from '../Modal';
import { defineComponent, PropType, ref, computed } from 'vue';
import { getUIString } from '../../i18n';

const show = ref(false);
const titleRef = ref('');
const warn = ref(false);
const text = ref('');
const altLeaveDirection = ref(false);
const buttons = ref<readonly { text: string, action: any, danger?: boolean }[]>([]);
let resolve: (value: any) => void = () => {
};

export const TransactionalDialogConfirmCancelActions = Object.freeze([{ text: getUIString('cancel').value, action: false }, { text: getUIString('confirm').value, action: true }] as const);

export function showTransactionalDialog<T>(title: string, message: string, actions?: readonly { text: string, action: T, danger?: boolean }[], warning = false, $altLeaveDirection = false): Promise<T> {
  actions = actions || [{ text: getUIString('confirm').value, action: Symbol() as any }];
  titleRef.value = title;
  text.value = message;
  buttons.value = actions;
  warn.value = warning;
  show.value = true;
  altLeaveDirection.value = $altLeaveDirection;
  return new Promise<T>(r => {
    resolve = (v => {
      show.value = false;
      r(v);
    });
  });
}

export default defineComponent({
  // props: {
  // },
  setup(props, { emit }) {

    return () => <Modal title={titleRef.value} v-model:show={show.value} width="40em" esc={false} warn={warn.value} altLeaveDirection={altLeaveDirection.value}>{{
      default: () => <div class={'flex gap-2 flex-col ws-pre-wrap'}>
        {text.value}
      </div>,
      actions: () => buttons.value.map(it => <button class={['w-0 grow', it.danger && 'bg-dialogButton-error']} key={it.text} onClick={() => resolve(it.action)}>{it.text}</button>),
    }}</Modal>;
  },
});

