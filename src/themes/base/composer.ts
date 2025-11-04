import { computed, ComputedRef, toValue, MaybeRefOrGetter } from 'vue';
import type { ThemeLayer, StylesModule } from './types';

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
  return computed(() => {
    const result: StylesModule = {};
    const keyMap = new Map<string, string[]>();

    // 收集所有层的样式（使用 toValue 自动解包 ref/computed/getter）
    for (const layerRef of layers) {
      const layer = toValue(layerRef);
      if (!layer) continue;

      for (const [key, className] of Object.entries(layer.styles)) {
        if (!keyMap.has(key)) {
          keyMap.set(key, []);
        }
        keyMap.get(key)!.push(className);
      }
    }

    // 合并：同 key 的类名用空格连接
    for (const [key, classNames] of keyMap.entries()) {
      result[key] = classNames.join(' ');
    }

    return result;
  });
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

