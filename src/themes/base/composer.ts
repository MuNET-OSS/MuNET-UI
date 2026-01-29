import { computed, ComputedRef, toValue, MaybeRefOrGetter } from 'vue';
import type { StylesModule, ThemeLayer } from './types';

export function mergeStyles(...styles: StylesModule[]): StylesModule {
  const result: Record<string, string[]> = {};
  for (const style of styles) {
    for (let [key, value] of Object.entries(style)) {
      if (typeof value === 'string') {
        value = [value];
      }
      if (result[key]) {
        result[key].push(...value);
      } else {
        result[key] = [...value];
      }
    }
  }
  return result;
}

/**
 * 合并多层主题的样式
 * 如果同一个 key 在多层都存在，会合并为 "class1 class2 class3"
 * 后面的层优先级更高（CSS 特异性：多个类 > 单个类）
 *
 * @param layers 主题层数组，可以是普通值或 ref/computed/getter（按优先级从低到高：global -> ui -> app）
 * @returns 合并后的样式对象
 */
export function composeThemeStyles(
  ...layers: MaybeRefOrGetter<ThemeLayer | undefined>[]
): ComputedRef<StylesModule> {
  return computed(() => mergeStyles(...layers.map(layerRef => toValue(layerRef)).filter(layer => layer && layer.styles).map(layer => layer!.styles)));
}

/**
 * 生成激活主题的根类名（空格分隔）
 *
 * @param layers 主题层数组，可以是普通值或 ref/computed/getter
 * @returns 合并后的根类名字符串
 */
export function composeThemeRoots(
  ...layers: MaybeRefOrGetter<ThemeLayer | undefined>[]
): ComputedRef<string> {
  return computed(() => {
    return layers
      .map(layerRef => toValue(layerRef))
      .filter(layer => layer && layer.root)
      .map(layer => layer!.root)
      .join(' ');
  });
}

