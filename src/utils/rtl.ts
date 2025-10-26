import { I18nManager } from 'react-native';
import i18n from './i18n';

export const isRTL = () => {
  return i18n.language === 'ar' || I18nManager.isRTL;
};

// Helper to get text alignment based on RTL
export const textAlign = () => {
  return isRTL() ? 'right' : 'left';
};

// Helper to get flex direction based on RTL
export const flexDirection = () => {
  return isRTL() ? 'row-reverse' : 'row';
};

// Helper for padding/margin left/right
export const paddingStart = (value: number) => {
  return isRTL() ? { paddingRight: value } : { paddingLeft: value };
};

export const paddingEnd = (value: number) => {
  return isRTL() ? { paddingLeft: value } : { paddingRight: value };
};

export const marginStart = (value: number) => {
  return isRTL() ? { marginRight: value } : { marginLeft: value };
};

export const marginEnd = (value: number) => {
  return isRTL() ? { marginLeft: value } : { marginRight: value };
};

