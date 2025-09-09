import React from 'react';
import { Modal, Descriptions, Image, Tag, Typography, Space, Divider } from 'antd';
import { Item } from '@/types';
import { brandColors } from '@/theme';

const { Title, Text } = Typography;

interface ItemDetailModalProps {
  visible: boolean;
  onClose: () => void;
  item: Item | null;
}

const ItemDetailModal: React.FC<ItemDetailModalProps> = ({ visible, onClose, item }) => {
  if (!item) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Available':
        return 'success';
      case 'Borrowed':
        return 'processing';
      case 'Maintenance':
        return 'warning';
      case 'Damaged':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Modal
      title={
        <Space>
          <Title level={4} style={{ margin: 0 }}>
            {item.name}
          </Title>
          <Tag color={getStatusColor(item.status)}>
            {item.status}
          </Tag>
        </Space>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      width={800}
      style={{ top: 20 }}
    >
      <div style={{ display: 'flex', gap: 24 }}>
        {/* Image Section */}
        <div style={{ flex: '0 0 300px' }}>
          {item.imageUrl ? (
            <Image
              src={item.imageUrl}
              alt={item.name}
              style={{
                width: '100%',
                height: 200,
                objectFit: 'cover',
                borderRadius: 8,
                border: `2px solid ${brandColors.primary}`,
              }}
              placeholder={
                <div style={{
                  width: '100%',
                  height: 200,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: '#f5f5f5',
                  borderRadius: 8,
                  color: '#999'
                }}>
                  Loading...
                </div>
              }
            />
          ) : (
            <div style={{
              width: '100%',
              height: 200,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#f5f5f5',
              borderRadius: 8,
              border: '2px dashed #d9d9d9',
              color: '#999'
            }}>
              No Image Available
            </div>
          )}
        </div>

        {/* Details Section */}
        <div style={{ flex: 1 }}>
          <Descriptions
            column={1}
            size="small"
            labelStyle={{ fontWeight: 600, color: brandColors.primary }}
            contentStyle={{ marginBottom: 8 }}
          >
            <Descriptions.Item label="Description">
              <Text>{item.description}</Text>
            </Descriptions.Item>
            
            <Descriptions.Item label="Category">
              <Tag color="blue">{item.category}</Tag>
            </Descriptions.Item>
            
            <Descriptions.Item label="Quantity">
              <Text strong style={{ color: item.quantity < 5 ? brandColors.error : brandColors.success }}>
                {item.quantity} {item.quantity === 1 ? 'item' : 'items'}
              </Text>
            </Descriptions.Item>
            
            <Descriptions.Item label="Location">
              <Text>{item.location}</Text>
            </Descriptions.Item>
            
            <Descriptions.Item label="Status">
              <Tag color={getStatusColor(item.status)}>
                {item.status}
              </Tag>
            </Descriptions.Item>
          </Descriptions>

          {/* Specifications */}
          {item.specifications && (
            <>
              <Divider orientation="left" style={{ margin: '16px 0 8px 0' }}>
                <Text strong>Specifications</Text>
              </Divider>
              <Descriptions
                column={1}
                size="small"
                labelStyle={{ fontWeight: 600, color: brandColors.primary }}
                contentStyle={{ marginBottom: 8 }}
              >
                {item.specifications.brand && (
                  <Descriptions.Item label="Brand">
                    <Text>{item.specifications.brand}</Text>
                  </Descriptions.Item>
                )}
                {item.specifications.model && (
                  <Descriptions.Item label="Model">
                    <Text>{item.specifications.model}</Text>
                  </Descriptions.Item>
                )}
                {item.specifications.serialNumber && (
                  <Descriptions.Item label="Serial Number">
                    <Text code>{item.specifications.serialNumber}</Text>
                  </Descriptions.Item>
                )}
                {item.specifications.purchaseDate && (
                  <Descriptions.Item label="Purchase Date">
                    <Text>{new Date(item.specifications.purchaseDate).toLocaleDateString()}</Text>
                  </Descriptions.Item>
                )}
                {item.specifications.warrantyExpiry && (
                  <Descriptions.Item label="Warranty Expiry">
                    <Text>{new Date(item.specifications.warrantyExpiry).toLocaleDateString()}</Text>
                  </Descriptions.Item>
                )}
                {item.specifications.condition && (
                  <Descriptions.Item label="Condition">
                    <Tag color="green">{item.specifications.condition}</Tag>
                  </Descriptions.Item>
                )}
              </Descriptions>
            </>
          )}

          <Divider orientation="left" style={{ margin: '16px 0 8px 0' }}>
            <Text strong>Timestamps</Text>
          </Divider>
          <Descriptions
            column={1}
            size="small"
            labelStyle={{ fontWeight: 600, color: brandColors.primary }}
            contentStyle={{ marginBottom: 8 }}
          >
            <Descriptions.Item label="Created">
              <Text>{new Date(item.createdAt).toLocaleString()}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Last Updated">
              <Text>{new Date(item.updatedAt).toLocaleString()}</Text>
            </Descriptions.Item>
          </Descriptions>
        </div>
      </div>
    </Modal>
  );
};

export default ItemDetailModal;
