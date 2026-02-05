<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'

// https://github.com/moeru-ai/airi/blob/main/packages/ui/src/components/Form/Range/Range.vue

const props = withDefaults(defineProps<{
  min?: number
  max?: number
  step?: number
  disabled?: boolean
  thumbColor?: string
  trackColor?: string
  trackValueColor?: string
  origin?: number // 基准值，深色区域从这里开始延伸到当前值，默认为 min
}>(), {
  min: 0,
  max: 100,
  step: 1,
  disabled: false,
  thumbColor: '#9090906e',
  trackColor: 'gray',
  trackValueColor: 'red',
  origin: undefined,
})

const modelValue = defineModel<number>({ required: true })

const scaledMin = computed(() => props.min * 10000)
const scaledMax = computed(() => props.max * 10000)
const scaledStep = computed(() => props.step * 10000)
const effectiveOrigin = computed(() => props.origin ?? props.min)

const sliderRef = ref<HTMLInputElement>()
const sliderValue = computed({
  get: () => modelValue.value * 10000,
  set: (value: number) => {
    modelValue.value = value / 10000
    updateTrackColor()
  },
})

onMounted(() => updateTrackColor())
watch(sliderValue, () => updateTrackColor(), { immediate: true })
watch([scaledMin, scaledMax, scaledStep, effectiveOrigin], () => updateTrackColor(), { immediate: true })

function updateTrackColor() {
  if (!sliderRef.value) {
    return
  }

  const min = props.min
  const max = props.max
  const value = modelValue.value
  const origin = effectiveOrigin.value

  sliderRef.value.style.setProperty('--value', sliderValue.value.toString())
  sliderRef.value.style.setProperty('--min', min.toString())
  sliderRef.value.style.setProperty('--max', max.toString())
  
  // 计算 origin 和 value 在滑块上的位置百分比
  const range = max - min
  const originRatio = (origin - min) / range
  const valueRatio = (value - min) / range
  
  // 深色区域的起始和结束位置
  const fillStart = Math.min(originRatio, valueRatio)
  const fillEnd = Math.max(originRatio, valueRatio)
  
  sliderRef.value.style.setProperty('--fill-start', `${fillStart * 100}%`)
  sliderRef.value.style.setProperty('--fill-end', `${fillEnd * 100}%`)
}

function handleInput(e: Event) {
  const target = e.target as HTMLInputElement
  target.style.setProperty('--value', target.value)
}
</script>

<template>
  <input
    ref="sliderRef"
    v-model.number="sliderValue"
    type="range"
    :min="scaledMin"
    :max="scaledMax"
    :step="scaledStep"
    class="slider-progress form_input-range"
    @input="handleInput"
  >
</template>

<style scoped>
/*generated with Input range slider CSS style generator (version 20211225)
https://toughengineer.github.io/demo/slider-styler*/
.form_input-range {
  --height: 1.5em;

  min-height: var(--height);
  appearance: none;
  background: transparent;
  border-radius: 4px;
  transition: background-color 0.2s ease;

  --thumb-width: 4px;
  --thumb-height: var(--height);
  --thumb-box-shadow: 0 0 0px #e6e6e6;
  --thumb-border: none;
  --thumb-border-radius: 999px;
  --thumb-background: oklch(80% 0.07 calc(var(--hue) + 0));
  --thumb-background-hover: oklch(90% 0.07 calc(var(--hue) + 0));
  --thumb-background-active: oklch(70% 0.07 calc(var(--hue) + 0));

  --track-height: calc(var(--height) - var(--track-value-padding) * 2);
  --track-box-shadow: none;
  --track-border: solid 2px oklch(0.95 0.01 var(--hue));
  --track-border-radius: 6px;
  --track-background: oklch(0.97 0.006 var(--hue));
  --track-background-hover: oklch(0.97 0.006 var(--hue));
  --track-background-active: oklch(0.97 0.006 var(--hue));

  --track-value-background: rgb(255, 255, 255);
  --track-value-background-hover: rgb(255, 255, 255);
  --track-value-background-active: rgb(255, 255, 255);
  --track-value-padding: 2px;
}

/*progress support*/
.form_input-range.slider-progress {
  --range: calc(var(--max) - var(--min));
  --ratio: calc((var(--value) - var(--min)) / var(--range));
  --sx: calc(0.5 * 0em + var(--ratio) * (100% - 0em));
  /* 支持 origin 基准值：深色区域从 fill-start 到 fill-end */
  --fill-start: 0%;
  --fill-end: var(--sx);
}

.form_input-range:focus {
  outline: none;
}

/*webkit*/
.form_input-range::-webkit-slider-thumb {
  appearance: none;
  width: var(--thumb-width);
  height: var(--thumb-height);
  border-radius: var(--thumb-border-radius);
  background: var(--thumb-background);
  border: var(--thumb-border);
  box-shadow: var(--thumb-box-shadow);
  margin-top: calc(var(--track-height) * 0.5 - var(--thumb-height) * 0.5 - 2px);
  margin-left: calc(0 - var(--track-value-padding));
  cursor: col-resize;
  transition:
    background 0.2s ease-in-out,
    box-shadow 0.2s ease-in-out,
    border-color 0.2s ease-in-out,
    transform 0.2s cubic-bezier(0.165, 0.84, 0.44, 1),
    width 0.2s cubic-bezier(0.165, 0.84, 0.44, 1);
}

.form_input-range::-webkit-slider-runnable-track {
  height: var(--track-height);
  border: var(--track-border);
  border-radius: var(--track-border-radius);
  background: var(--track-background);
  backdrop-filter: blur(8px);
  box-shadow: var(--track-box-shadow);
  position: relative;
  cursor: col-resize;
  transition:
    box-shadow 0.2s ease-in-out,
    border-color 0.2s ease-in-out;
}

.form_input-range::-webkit-slider-thumb:hover {
  background: var(--thumb-background-hover);

  width: calc(var(--thumb-width) * 1.6);
  transform: scaleY(1.2);
}

.form_input-range:hover::-webkit-slider-runnable-track {
  background: var(--track-background-hover);
}

.form_input-range::-webkit-slider-thumb:active {
  background: var(--thumb-background-active);
}

.form_input-range:active::-webkit-slider-runnable-track {
  background: var(--track-background-active);
}

.form_input-range.slider-progress::-webkit-slider-runnable-track {
  /* margin-left: var(--track-value-padding); */
  margin-right: calc(0 - var(--track-value-padding));
  background:
    linear-gradient(to right,
      transparent var(--fill-start),
      var(--track-value-background) var(--fill-start),
      var(--track-value-background) var(--fill-end),
      transparent var(--fill-end)
    ),
    var(--track-background);
}

.form_input-range.slider-progress:hover::-webkit-slider-runnable-track {
  background:
    linear-gradient(to right,
      transparent var(--fill-start),
      var(--track-value-background-hover) var(--fill-start),
      var(--track-value-background-hover) var(--fill-end),
      transparent var(--fill-end)
    ),
    var(--track-background-hover);
}

.form_input-range.slider-progress:active::-webkit-slider-runnable-track {
  background:
    linear-gradient(to right,
      transparent var(--fill-start),
      var(--track-value-background-active) var(--fill-start),
      var(--track-value-background-active) var(--fill-end),
      transparent var(--fill-end)
    ),
    var(--track-background-active);
}

/*mozilla*/
.form_input-range::-moz-range-thumb {
  width: var(--thumb-width);
  height: var(--thumb-height);
  border-radius: var(--thumb-border-radius);
  background: var(--thumb-background);
  border: none;
  box-shadow: var(--thumb-box-shadow);
  cursor: col-resize;
  margin-left: calc(0 - var(--track-value-padding));
  transition:
    background 0.2s ease-in-out,
    box-shadow 0.2s ease-in-out,
    border-color 0.2s ease-in-out,
    transform 0.2s cubic-bezier(0.165, 0.84, 0.44, 1),
    width 0.2s cubic-bezier(0.165, 0.84, 0.44, 1);
}

.form_input-range::-moz-range-track {
  height: var(--track-height);
  border: var(--track-border);
  border-radius: var(--track-border-radius);
  background: var(--track-background);
  backdrop-filter: blur(8px);
  box-shadow: var(--track-box-shadow);
  cursor: col-resize;
  /* Trim left and right paddings of track */
  width: calc(100% - var(--track-value-padding) * 2);
}

.form_input-range::-moz-range-thumb:hover {
  background: var(--thumb-background-hover);

  width: calc(var(--thumb-width) * 1.6);
  transform: scaleY(1.2);
}

.form_input-range:hover::-moz-range-track {
  background: var(--track-background-hover);
}

.form_input-range::-moz-range-thumb:active {
  background: var(--thumb-background-active);
}

.form_input-range:active::-moz-range-track {
  background: var(--track-background-active);
}

.form_input-range.slider-progress::-moz-range-track {
  background:
    linear-gradient(to right,
      transparent var(--fill-start),
      var(--track-value-background) var(--fill-start),
      var(--track-value-background) var(--fill-end),
      transparent var(--fill-end)
    ),
    var(--track-background);
}

.form_input-range.slider-progress:hover::-moz-range-track {
  background:
    linear-gradient(to right,
      transparent var(--fill-start),
      var(--track-value-background-hover) var(--fill-start),
      var(--track-value-background-hover) var(--fill-end),
      transparent var(--fill-end)
    ),
    var(--track-background-hover);
}

.form_input-range.slider-progress:active::-moz-range-track {
  background:
    linear-gradient(to right,
      transparent var(--fill-start),
      var(--track-value-background-active) var(--fill-start),
      var(--track-value-background-active) var(--fill-end),
      transparent var(--fill-end)
    ),
    var(--track-background-active);
}

/*ms*/
.form_input-range::-ms-fill-upper {
  background: transparent;
  border-color: transparent;
}

.form_input-range::-ms-fill-lower {
  background: transparent;
  border-color: transparent;
}

.form_input-range::-ms-thumb {
  width: var(--thumb-width);
  height: var(--thumb-height);
  border-radius: var(--thumb-border-radius);
  background: var(--thumb-background);
  border: var(--thumb-border);
  box-shadow: var(--thumb-box-shadow);
  /** Center thumb */
  margin-top: 0;
  /** Shift left thumb */
  margin-left: calc(0 - var(--track-value-padding));
  box-sizing: border-box;
  cursor: col-resize;

  transition:
    background 0.2s ease-in-out,
    box-shadow 0.2s ease-in-out,
    border-color 0.2s ease-in-out,
    transform 0.2s cubic-bezier(0.165, 0.84, 0.44, 1),
    width 0.2s cubic-bezier(0.165, 0.84, 0.44, 1);
}

.form_input-range::-ms-track {
  height: var(--track-height);
  border-radius: var(--track-border-radius);
  background: var(--track-background);
  backdrop-filter: blur(8px);
  border: var(--track-border);
  box-shadow: var(--track-box-shadow);
  box-sizing: border-box;
  cursor: col-resize;
}

.form_input-range::-ms-thumb:hover {
  background: var(--thumb-background-hover);

  width: calc(var(--thumb-width) * 1.6);
  transform: scaleY(1.2);
}

.form_input-range:hover::-ms-track {
  background: var(--track-background-hover);
}

.form_input-range::-ms-thumb:active {
  background: var(--thumb-background-active);
}

.form_input-range:active::-ms-track {
  background: var(--track-background-active);
}

.form_input-range.slider-progress::-ms-fill-lower {
  height: var(--track-height);
  border-radius: var(--track-border-radius) 0 0 var(--track-border-radius);
  margin: 0;
  background: var(--track-value-background);
  border: none;
  border-right-width: 0;
  /** Shift left thumb */
  margin-left: calc(var(--track-value-padding));
  /** Shift right thumb */
  margin-right: calc(0 - var(--track-value-padding));
}

.form_input-range.slider-progress:hover::-ms-fill-lower {
  background: var(--track-value-background-hover);
}

.form_input-range.slider-progress:active::-ms-fill-lower {
  background: var(--track-value-background-active);
}
</style>