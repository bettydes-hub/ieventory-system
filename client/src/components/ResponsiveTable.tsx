import React from 'react';
import { Table, Card, Space, Tag, Button, Typography } from 'antd';
import { useMediaQuery } from 'react-responsive';
import type { ColumnsType, TableProps } from 'antd/es/table';

const { Text } = Typography;

interface ResponsiveTableProps<T> extends Omit<TableProps<T>, 'columns'> {
  columns: ColumnsType<T>;
  mobileCardRender?: (record: T) => React.ReactNode;
}

function ResponsiveTable<T extends Record<string, any>>({
  columns,
  mobileCardRender,
  ...tableProps
}: ResponsiveTableProps<T>) {
  const isMobile = useMediaQuery({ maxWidth: 768 });

  if (isMobile && mobileCardRender) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {tableProps.dataSource?.map((record, index) => (
          <Card key={index} size="small">
            {mobileCardRender(record)}
          </Card>
        ))}
      </div>
    );
  }

  return <Table columns={columns} {...tableProps} />;
}

export default ResponsiveTable;
