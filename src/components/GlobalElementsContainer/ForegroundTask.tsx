import { defineComponent, type MaybeRef, type Ref, ref, Transition } from 'vue';

interface Task {
  id: symbol;
  name: MaybeRef<string>;
  promise: Promise<any>;
  status: 'pending' | 'success' | 'error';
  error?: any;
}

export const foregroundTask = {
  tasks: ref<Task[]>([]),
  showErrorModal: ref(false),
  currentError: ref<any>(null),

  async register<T>(name: MaybeRef<string>, promise: Promise<T>) {
    const task: Task = {
      id: Symbol(),
      name,
      promise,
      status: 'pending',
    };
    foregroundTask.tasks.value.push(task as any);

    try {
      await promise;
      task.status = 'success';
    }
    catch (error) {
      task.status = 'error';
      task.error = error;
      foregroundTask.currentError.value = error;
      console.error(error);
      throw error;
    }
    finally {
      foregroundTask.removeTask(task.id);
    }
    console.log('Task completed:', task.name);
    return await promise;
  },

  removeTask(id: symbol) {
    const index = foregroundTask.tasks.value.findIndex(t => t.id === id);
    if (index !== -1) {
      foregroundTask.tasks.value.splice(index, 1);
    }
  },
};

export default defineComponent({
  setup() {
    return () => (
      <Transition
        duration={{ enter: 500, leave: 500 }}
        leaveActiveClass="transition-opacity duration-500 transition-ease-in-out"
        leaveFromClass="opacity-100"
        leaveToClass="opacity-0"
        enterActiveClass="transition-opacity duration-500 transition-ease-in-out"
        enterToClass="opacity-100"
        enterFromClass="opacity-0"
      >
        {!!foregroundTask.tasks.value.length && <div class="full bg-foregroundTask backdrop-blur-lg flex flex-col items-center justify-center gap-14 z-40">
          {/*<video src={load} autoplay loop controls={false} class="w-50 max-w-90vw" />*/}
          <div class="op-90">{typeof foregroundTask.tasks.value[0].name === 'string' ? foregroundTask.tasks.value[0].name : (foregroundTask.tasks.value[0].name as any).value}</div>
        </div>}
      </Transition>
    );
  },
});

