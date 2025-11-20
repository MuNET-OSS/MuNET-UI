import { ref, computed } from 'vue';

/**
 * Modal 实例栈，用于管理多个同时打开的 modal
 * 每个元素包含 modal 的唯一 ID
 */
export const modalStack = ref<symbol[]>([]);

/**
 * 全局 modal 显示状态（向后兼容）
 * 用于控制某些功能（如自动聚焦）在 modal 打开时的行为
 */
export const modalShowing = computed(() => modalStack.value.length > 0);

/**
 * 注册一个 modal 实例
 * @returns modal 的唯一 ID
 */
export const registerModal = (): symbol => {
  const id = Symbol('modal');
  modalStack.value.push(id);
  return id;
};

/**
 * 注销一个 modal 实例
 * @param id modal 的唯一 ID
 */
export const unregisterModal = (id: symbol) => {
  const index = modalStack.value.indexOf(id);
  if (index > -1) {
    modalStack.value.splice(index, 1);
  }
};

/**
 * 获取 modal 在栈中的索引（用于计算 z-index）
 * @param id modal 的唯一 ID
 * @returns 索引，如果不存在返回 -1
 */
export const getModalIndex = (id: symbol): number => {
  return modalStack.value.indexOf(id);
};

/**
 * 检查是否是栈顶的 modal
 * @param id modal 的唯一 ID
 */
export const isTopModal = (id: symbol): boolean => {
  return modalStack.value[modalStack.value.length - 1] === id;
};

