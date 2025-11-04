import { ref } from 'vue';

/**
 * 全局 modal 显示状态
 * 用于控制某些功能（如自动聚焦）在 modal 打开时的行为
 */
export const modalShowing = ref(false);

