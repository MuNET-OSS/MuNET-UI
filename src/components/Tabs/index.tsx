import { useVModel } from '@vueuse/core';
import { Comment, computed, defineComponent, Fragment, inject, isVNode, PropType, provide, VNode, watchEffect } from 'vue';

const activeNameKey = Symbol('mnui-tabs-active-name');

const TabPane = defineComponent({
  name: 'TabPane',
  props: {
    name: {
      type: [String, Number] as PropType<string | number>,
      required: true,
    },
    tab: {
      type: String,
      required: true,
    },
    disabled: Boolean,
    color: String,
  },
  setup(props, { slots }) {
    const activeName = inject<ReturnType<typeof computed<string | number | undefined>> | undefined>(activeNameKey, undefined);

    return () => {
      if (!activeName || activeName.value !== props.name) return null;
      return <div>{slots.default?.()}</div>;
    };
  },
});

const collectPanes = (nodes: VNode[]): VNode[] => {
  const panes: VNode[] = [];

  for (const node of nodes) {
    if (!isVNode(node) || node.type === Comment) continue;
    if (node.type === TabPane) {
      panes.push(node);
      continue;
    }
    if (node.type === Fragment && Array.isArray(node.children)) {
      panes.push(...collectPanes(node.children as VNode[]));
    }
  }

  return panes;
};

const Tabs = defineComponent({
  name: 'Tabs',
  props: {
    value: [String, Number] as PropType<string | number>,
    onUpdateValue: Function as PropType<(v: string | number) => void>,
  },
  emits: ['update:value'],
  setup(props, { emit, slots }) {
    const value = useVModel(props, 'value', emit);
    const panes = computed(() => collectPanes((slots.default?.() ?? []) as VNode[]));

    watchEffect(() => {
      const paneList = panes.value;
      if (paneList.length === 0) return;

      const hasCurrent = paneList.some((pane) => pane.props?.name === value.value && !pane.props?.disabled);
      if (hasCurrent) return;

      const firstEnabled = paneList.find((pane) => !pane.props?.disabled);
      if (firstEnabled?.props?.name !== undefined) {
        value.value = firstEnabled.props.name as string | number;
      }
    });

    provide(activeNameKey, computed(() => value.value));

    return () => (
      <div class="flex flex-col gap-3">
        <div class="flex items-center gap-1 rd-xl bg-input p-1">
          {panes.value.map((pane) => {
            const active = pane.props?.name === value.value;
            const color = pane.props?.color as string | undefined;

            return (
              <button
                key={String(pane.props?.name)}
                class={[
                  'px-3 py-1.5 text-sm rd-lg border border-transparent',
                  pane.props?.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
                  active ? 'bg-avatarMenuButton font-600' : 'bg-transparent',
                ]}
                style={active && color ? { color, borderColor: color } : undefined}
                disabled={Boolean(pane.props?.disabled)}
                onClick={() => {
                  if (!pane.props?.disabled && pane.props?.name !== undefined) {
                    value.value = pane.props.name as string | number;
                  }
                }}
              >
                {pane.props?.tab as string}
              </button>
            );
          })}
        </div>
        <div>{slots.default?.()}</div>
      </div>
    );
  },
});

export { TabPane };
export default Tabs;
