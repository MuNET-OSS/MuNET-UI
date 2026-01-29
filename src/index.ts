// @munet/ui - 核心 UI 组件库

// 导出主题系统
export * from './themes';

// 导出 i18n
export * from './i18n';

// 导出控制器
export * from './controllers/toastController';

// 导出状态
export * from './states/modal';

// 导出组件
export { default as Button } from './components/Button';
export { default as TextInput } from './components/TextInput';
export { default as CheckBox } from './components/CheckBox';
export { default as FlagCheckBox } from './components/CheckBox/FlagCheckBox';
export { default as Radio } from './components/Radio';
export { default as Modal, modalShowing } from './components/Modal';
export { default as ModalStyles } from './components/Modal/styles.module.sass';
export { default as Window } from './components/Window';
export { default as Section } from './components/Section';
export { default as DateFormat } from './components/DateFormat';
export { default as Qrcode } from './components/Qrcode';
export { default as NumberInput } from './components/NumberInput';
export { default as Select } from './components/Select';
export type { SelectOption, SelectExposed, SelectInstance } from './components/Select';
export { default as TransitionVertical } from './components/TransitionVertical.vue';
export { default as Range } from './components/Range.vue';
export { default as TransitionOpacity } from './components/TransitionOpacity';

// 新迁移的组件
export { default as DropMenu } from './components/DropMenu';
export { default as DropDown } from './components/DropMenu/DropDown';
export { default as GlobalElementsContainer } from './components/GlobalElementsContainer';
export { default as ScrollText } from './components/ScrollText';
export { default as WhateverNaviBar } from './components/SubNaviBar/WhateverNaviBar';
export { default as WarningBackground } from './components/WarningBackground';
export type { NaviItem } from './components/SubNaviBar/WhateverNaviBar';

// 导出 GlobalElementsContainer 的子组件和 hooks
export { foregroundTask } from './components/GlobalElementsContainer/ForegroundTask';
export { showTransactionalDialog } from './components/GlobalElementsContainer/TransactionalDialog';
export { taskManager } from './components/GlobalElementsContainer/TaskManager';

