import ForegroundTask from './ForegroundTask';
import TransactionalDialog from './TransactionalDialog';
import { defineComponent } from 'vue';
import ToastsDisplay from './ToastsDisplay';
import TaskManager from './TaskManager';
import { theme } from '../../themes';

export default defineComponent({
  // props: {
  // },
  setup() {
    return () => (
      <>
        <ToastsDisplay />
        <TaskManager />
        <ForegroundTask />
        <TransactionalDialog />
        <div class={theme.value.root} />
      </>
    );
  },
});

