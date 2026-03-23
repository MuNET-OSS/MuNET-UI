import { defineComponent, type MaybeRef, type Ref, ref } from 'vue';
import { TransitionGroup } from 'vue';
import Modal from '../Modal';
import styles from './TaskManager.module.sass';
import { getUIString } from '../../i18n';

interface Task {
  id: symbol;
  name: MaybeRef<string>;
  promise: Promise<any>;
  startTime: number;
  status: 'pending' | 'success' | 'error';
  error?: any;
  showTimer?: number;
}

export const taskManager = {
  tasks: ref<Task[]>([]),
  showErrorModal: ref(false),
  currentError: ref<any>(null),

  async register<T>(name: MaybeRef<string>, promise: Promise<T>) {
    const task: Task = {
      id: Symbol(),
      name,
      promise,
      startTime: Date.now(),
      status: 'pending',
    };

    // 设置1秒后显示任务
    task.showTimer = window.setTimeout(() => {
      taskManager.tasks.value.push(task as any);
    }, 1000);

    try {
      await promise;
      // 如果任务在1秒内完成，清除定时器
      if (task.showTimer) {
        clearTimeout(task.showTimer);
        task.showTimer = undefined;
      }
      task.status = 'success';
    }
    catch (error) {
      // 如果任务出错，确保清除定时器
      if (task.showTimer) {
        clearTimeout(task.showTimer);
        task.showTimer = undefined;
      }
      task.status = 'error';
      task.error = error;
      taskManager.currentError.value = error;
      // taskManager.showErrorModal.value = true;
      console.error(error);
    }
    finally {
      taskManager.removeTask(task.id);
    }
    return await promise;
  },

  removeTask(id: symbol) {
    const index = taskManager.tasks.value.findIndex(t => t.id === id);
    if (index !== -1) {
      taskManager.tasks.value.splice(index, 1);
    }
  },
};

export default defineComponent({
  setup() {
    return () => (
      <>
        <div class="fixed left-4 bottom-4 z-50">
          <TransitionGroup
            enterActiveClass={styles.active}
            leaveActiveClass={styles.active}
            enterFromClass={styles.from}
            leaveToClass={styles.from}
            tag="div"
            // @ts-ignore
            class="flex flex-col gap-2"
          >
            {taskManager.tasks.value.map(task => (
              <div
                key={task.id}
                class={[
                  'bg-taskManager backdrop-blur-sm rounded-lg p-3',
                  'flex items-center gap-2 min-w-48',
                  'shadow-lg',
                ]}
              >
                <div class="animate-spin">
                  <svg class="w-5 h-5 c-taskManager-spin" viewBox="0 0 24 24">
                    <circle
                      class="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      stroke-width="4"
                      fill="none"
                    />
                    <path
                      class="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                </div>
                <span class="c-taskManager-text text-sm">{(typeof task.name === 'string') ? task.name : (task.name as any).value}</span>
              </div>
            ))}
          </TransitionGroup>
        </div>

        <Modal
          title={getUIString('taskFailed').value}
          width="400px"
          v-model:show={taskManager.showErrorModal.value}
        >{{
          default: () => taskManager.currentError.value?.message || getUIString('unknownError').value,
          actions: () => <button
            onClick={() => taskManager.showErrorModal.value = false}
          >
            {getUIString('confirm').value}
          </button>,
        }}</Modal>
      </>
    );
  },
});

