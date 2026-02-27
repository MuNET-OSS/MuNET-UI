// @munet/ui 主题系统
import { ref, computed, watch } from 'vue';
import { usePreferredDark, useStorage, useCssVar } from '@vueuse/core';
import globalStyles from './global.module.sass';
import { dynamicLightUI, dynamicLightVars } from './dynamicLight';
import { aquadxUI, aquadxVars } from './aquadx';
import { composeThemeStyles, composeThemeRoots } from './base/composer';
import type { ThemeLayer } from './base/types';

// 导出类型
export * from './base/types';
export * from './base/composer';

// 主题枚举
export enum UIThemes {
  Auto,
  DynamicLight,
  AquaDX,
}

// 全局主题层（跨主题共享）
const globalTheme: ThemeLayer = {
  root: globalStyles.root,
  styles: globalStyles,
};

const isOklchSupport = CSS.supports("color", "oklch(0.5 0.1 200)");

// 主题配置
export const selectedThemeName = useStorage('theme', UIThemes.Auto);
export const selectedThemeHue = useStorage<number>('theme-hue', null as any);

const preferDark = usePreferredDark();

export const realThemeName = computed<number>(() => {
  if (!isOklchSupport) {
    return UIThemes.AquaDX;
  }

  if (selectedThemeName.value === UIThemes.Auto) {
    return preferDark.value ? UIThemes.AquaDX : UIThemes.DynamicLight;
  }
  return selectedThemeName.value;
});

const emptyLayer: ThemeLayer = {
  root: '',
  styles: {},
};

// 当前 UI 主题层
const currentUITheme = computed<ThemeLayer>(() => {
  switch (realThemeName.value) {
    case UIThemes.AquaDX:
      return aquadxUI;
    case UIThemes.DynamicLight:
      return dynamicLightUI;
    default:
      return emptyLayer;
  }
});

// 当前主题变量
export const currentThemeVars = computed(() => {
  switch (realThemeName.value) {
    case UIThemes.AquaDX:
      return aquadxVars;
    case UIThemes.DynamicLight:
    default:
      return dynamicLightVars;
  }
});

// 业务主题注册表
const appThemeRegistry = ref(new Map<number, ThemeLayer>());

/**
 * 注册业务主题扩展
 * @param uiTheme 对应的 UI 主题，应该是一个 extend uiTheme 的 enum
 * @param appTheme 业务主题层
 */
export function registerAppTheme(uiTheme: number, appTheme: ThemeLayer) {
  appThemeRegistry.value.set(uiTheme, appTheme);
}

/**
 * 清除所有注册的业务主题
 */
export function clearAppThemes() {
  appThemeRegistry.value.clear();
}

/**
 * 初始化主题默认值（在应用入口调用）
 * 仅在值未设置时生效，不会覆盖用户已有的选择
 */
export function initThemeDefaults(defaults: { hue?: number; theme?: UIThemes } = {}) {
  if (selectedThemeHue.value == null) {
    selectedThemeHue.value = defaults.hue ?? 300;
  }
  if (defaults.theme != null && selectedThemeName.value == null) {
    selectedThemeName.value = defaults.theme;
  }
}

// 当前业务主题层
const currentAppTheme = computed<ThemeLayer | undefined>(() => {
  if (!isOklchSupport) {
    return appThemeRegistry.value.get(UIThemes.AquaDX);
  }
  // 获取实际使用的主题类型
  let actualTheme = selectedThemeName.value;
  if (actualTheme === UIThemes.Auto) {
    actualTheme = preferDark.value ? UIThemes.AquaDX : UIThemes.DynamicLight;
  }

  return appThemeRegistry.value.get(actualTheme);
});

// 最终导出：合并 Global + UI + App 三层
// 直接传递 computed，composer 会自动追踪变化
export const theme = composeThemeStyles(
  globalTheme,
  currentUITheme,
  currentAppTheme,
);

export const themeClasses = composeThemeRoots(
  globalTheme,
  currentUITheme,
  currentAppTheme,
);

// 初始化色调
const cssHue = useCssVar('--hue', document.body);
watch(selectedThemeHue, (newVal) => {
  cssHue.value = newVal.toString();
}, { immediate: true });

// 辅助变量
export const isLightTheme = computed(() => {
  return currentUITheme.value === dynamicLightUI;
});

// 导出主题层（供外部使用）
export { dynamicLightUI, dynamicLightVars } from './dynamicLight';
export { aquadxUI, aquadxVars } from './aquadx';

