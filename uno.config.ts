import { defineConfig, presetIcons, presetTypography, presetAttributify, transformerVariantGroup, transformerDirectives } from 'unocss';
import presetUno from '@unocss/preset-wind3';

export default defineConfig({
  presets: [
    presetUno(),
    presetTypography(),
    presetIcons(),
    presetAttributify(),
  ],
  transformers: [
    transformerDirectives({
      applyVariable: ['--at-apply'],
    }),
    transformerVariantGroup(),
  ],
});
