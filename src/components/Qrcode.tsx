import { defineComponent } from 'vue';
import QrcodeInternal from '@chenfengyuan/vue-qrcode';
import { currentThemeVars } from '../themes';

export default defineComponent({
  props: {
    value: { type: String, required: true },
    color: { type: String }, // 可选：自定义颜色
  },
  setup(props) {
    return () =>
      <QrcodeInternal
        tag="svg" value={props.value} options={{
        color: {
          light: '#00000000',
          dark: props.color || currentThemeVars.value.qrcodeColor,
        },
      }}
      />;
  },
});
