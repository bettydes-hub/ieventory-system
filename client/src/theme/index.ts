import type { ThemeConfig } from 'antd';

// Brand colors
export const brandColors = {
  primary: '#1890ff',
  primaryHover: '#40a9ff',
  primaryActive: '#096dd9',
  success: '#52c41a',
  warning: '#faad14',
  error: '#ff4d4f',
  info: '#1890ff',
};

// Ant Design theme configuration
export const themeConfig: ThemeConfig = {
  token: {
    // Brand colors
    colorPrimary: brandColors.primary,
    colorSuccess: brandColors.success,
    colorWarning: brandColors.warning,
    colorError: brandColors.error,
    colorInfo: brandColors.info,
    
    // Layout colors
    colorBgContainer: '#ffffff',
    colorBgLayout: '#f5f5f5',
    colorBgElevated: '#ffffff',
    
    // Text colors
    colorText: '#262626',
    colorTextSecondary: '#8c8c8c',
    colorTextTertiary: '#bfbfbf',
    colorTextQuaternary: '#d9d9d9',
    
    // Border colors
    colorBorder: '#d9d9d9',
    colorBorderSecondary: '#f0f0f0',
    
    // Component specific
    borderRadius: 6,
    borderRadiusLG: 8,
    borderRadiusSM: 4,
    
    // Typography
    fontSize: 14,
    fontSizeLG: 16,
    fontSizeSM: 12,
    fontSizeXL: 20,
    
    // Spacing
    padding: 16,
    paddingLG: 24,
    paddingSM: 12,
    paddingXS: 8,
    
    // Shadows
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
    boxShadowSecondary: '0 1px 4px rgba(0, 0, 0, 0.08)',
  },
  components: {
    Layout: {
      headerBg: '#ffffff',
      siderBg: '#001529',
      bodyBg: '#f5f5f5',
    },
    Menu: {
      darkItemBg: '#001529',
      darkItemSelectedBg: '#1890ff',
      darkItemHoverBg: '#1890ff',
      darkItemColor: '#ffffff',
      darkItemSelectedColor: '#ffffff',
      darkItemHoverColor: '#ffffff',
    },
    Button: {
      primaryShadow: '0 2px 0 rgba(24, 144, 255, 0.1)',
    },
    Card: {
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
      boxShadowTertiary: '0 1px 4px rgba(0, 0, 0, 0.08)',
    },
    Table: {
      headerBg: '#fafafa',
      headerColor: '#262626',
      rowHoverBg: '#f5f5f5',
    },
    Badge: {
      textFontSize: 12,
    },
    Avatar: {
      colorBgContainer: brandColors.primary,
    },
  },
};

// Responsive breakpoints
export const breakpoints = {
  xs: 480,
  sm: 576,
  md: 768,
  lg: 992,
  xl: 1200,
  xxl: 1600,
};

// Common styles
export const commonStyles = {
  shadow: {
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
  },
  shadowHover: {
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
  },
  borderRadius: {
    borderRadius: 6,
  },
  transition: {
    transition: 'all 0.2s ease-in-out',
  },
};
