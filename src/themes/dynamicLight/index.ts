import styles from './components.module.scss';
import vars from './vars';
import type { ThemeLayer } from '../base/types';

export const dynamicLightUI: ThemeLayer = {
  root: styles.root,
  styles: styles,
};

export const dynamicLightVars = vars;

