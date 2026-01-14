// @munet/ui 简单 i18n 系统
// 用于 UI 组件中的核心字符串

export interface UIStrings {
  confirm: string;
  cancel: string;
  taskFailed: string;
  unknownError: string;
}

const defaultStrings: UIStrings = {
  confirm: '确认',
  cancel: '取消',
  taskFailed: '任务执行失败',
  unknownError: '发生未知错误',
};

let currentStrings: UIStrings = { ...defaultStrings };

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
  currentStrings = { ...currentStrings, ...strings };
}

/**
 * 获取 UI 字符串
 * @param key 字符串键名
 */
export function getUIString(key: keyof UIStrings): string {
  return currentStrings[key];
}
