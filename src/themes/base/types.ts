import { ComputedRef } from 'vue';

/**
 * CSS Modules 导出的样式对象
 * key: 样式名, value: 哈希后的类名
 */
export type StylesModule = Record<string, string>;

/**
 * 主题层
 */
export interface ThemeLayer {
  /** 用于激活主题的根类（已被 CSS Modules 哈希化） */
  root: string;
  /** CSS Modules 导出的所有样式 */
  styles: StylesModule;
}

/**
 * 可扩展主题（包含 UI 和 App 两层）
 */
export interface ExtendableTheme {
  ui: ThemeLayer;
  app?: ThemeLayer;
}

