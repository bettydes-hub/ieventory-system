import React from 'react';
import { Card, Row, Col } from 'antd';
import { useMediaQuery } from 'react-responsive';

interface ResponsiveCardProps {
  children: React.ReactNode;
  title?: string;
  extra?: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
}

const ResponsiveCard: React.FC<ResponsiveCardProps> = ({ 
  children, 
  title, 
  extra, 
  style, 
  className 
}) => {
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const isTablet = useMediaQuery({ maxWidth: 1024 });

  const cardStyle = {
    ...style,
    marginBottom: isMobile ? 16 : 24,
  };

  return (
    <Card
      title={title}
      extra={extra}
      style={cardStyle}
      className={className}
      bodyStyle={{
        padding: isMobile ? 12 : 16,
      }}
    >
      {children}
    </Card>
  );
};

export default ResponsiveCard;
