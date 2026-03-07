// @munet/ui 简单 i18n 系统
// 用于 UI 组件中的核心字符串
import { ref, computed, type Ref } from 'vue';

export interface UIStrings {
  confirm: string;
  cancel: string;
  taskFailed: string;
  unknownError: string;
  selectPlaceholder: string;
  selectEmpty: string;
}

const defaultStrings: UIStrings = {
  confirm: '确认',
  cancel: '取消',
  taskFailed: '任务执行失败',
  unknownError: '发生未知错误',
  selectPlaceholder: '请选择',
  selectEmpty: '暂无选项',
};

const uiStrings = ref<UIStrings>({ ...defaultStrings });

/**
 * 配置 UI 字符串（用于 i18n）
 * @param strings 要覆盖的字符串
 * @example
 * ```ts
 * import { configureUIStrings } from '@munet/ui';
 * import { t } from './locales';
 *
 * configureUIStrings({
 *   confirm: t('common.confirm'),
 *   cancel: t('common.cancel'),
 * });
 * ```
 */
export function configureUIStrings(strings: Partial<UIStrings>) {
  Object.assign(uiStrings.value, strings);
}

/**
 * 获取 UI 字符串（响应式）
 * @param key 字符串键名
 * @returns Ref<string> 响应式字符串引用
 */
export function getUIString<K extends keyof UIStrings>(key: K): Ref<string> {
  return computed(() => uiStrings.value[key]);
}
