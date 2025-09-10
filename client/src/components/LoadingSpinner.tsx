import React from 'react';
import { Spin, Typography } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

const { Text } = Typography;

interface LoadingSpinnerProps {
  readonly size?: 'small' | 'default' | 'large';
  readonly text?: string;
  readonly fullScreen?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'default', 
  text = 'Loading...', 
  fullScreen = false 
}) => {
  const spinner = (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column',
      alignItems: 'center', 
      justifyContent: 'center',
      gap: 16,
      ...(fullScreen && {
        height: '100vh',
        width: '100vw',
        position: 'fixed',
        top: 0,
        left: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        zIndex: 9999
      })
    }}>
      <Spin 
        indicator={<LoadingOutlined style={{ fontSize: size === 'large' ? 32 : size === 'small' ? 16 : 24 }} spin />} 
        size={size}
      />
      {text && (
        <Text type="secondary" style={{ fontSize: size === 'large' ? 16 : 14 }}>
          {text}
        </Text>
      )}
    </div>
  );

  return spinner;
};

export default LoadingSpinner;
