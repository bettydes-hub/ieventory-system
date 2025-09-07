import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Provider } from 'react-redux';
import { ConfigProvider } from 'antd';
import { store } from '@/store';
import Layout from '@/components/Layout';
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import Inventory from '@/pages/Inventory';
import Categories from '@/pages/Categories';
import Stores from '@/pages/Stores';
import Suppliers from '@/pages/Suppliers';
import Transactions from '@/pages/Transactions';
import DamageReports from '@/pages/DamageReports';
import Deliveries from '@/pages/Deliveries';
import Search from '@/pages/Search';
import Audit from '@/pages/Audit';
import { useAuth } from '@/hooks/useAuth';
import 'antd/dist/reset.css';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Ant Design theme configuration
const theme = {
  token: {
    colorPrimary: '#1890ff',
    colorSuccess: '#52c41a',
    colorWarning: '#faad14',
    colorError: '#ff4d4f',
    borderRadius: 6,
  },
};

const AppContent: React.FC = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <div>Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/stores" element={<Stores />} />
        <Route path="/suppliers" element={<Suppliers />} />
        <Route path="/transactions" element={<Transactions />} />
        <Route path="/damage-reports" element={<DamageReports />} />
        <Route path="/deliveries" element={<Deliveries />} />
        <Route path="/search" element={<Search />} />
        <Route path="/audit" element={<Audit />} />
      </Routes>
    </Layout>
  );
};

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <ConfigProvider theme={theme}>
          <Router>
            <AppContent />
          </Router>
        </ConfigProvider>
      </QueryClientProvider>
    </Provider>
  );
};

export default App;