import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Provider } from 'react-redux';
import { ConfigProvider } from 'antd';
import { store } from '@/store';
import FirstTimeLoginModal from '@/components/FirstTimeLoginModal';
import Layout from '@/components/Layout';
import EmployeeLayout from '@/components/EmployeeLayout';
import StoreKeeperLayout from '@/components/StoreKeeperLayout';
import ManagerLayout from '@/components/ManagerLayout';
import DeliveryLayout from '@/components/DeliveryLayout';
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
import EmployeeDashboard from '@/pages/EmployeeDashboard';
import BorrowItem from '@/pages/BorrowItem';
import ReturnItem from '@/pages/ReturnItem';
import DamageReport from '@/pages/DamageReport';
import StoreKeeperDashboard from '@/pages/StoreKeeperDashboard';
import ManageItems from '@/pages/ManageItems';
import ApproveRequests from '@/pages/ApproveRequests';
import TrackStock from '@/pages/TrackStock';
import ManagerDashboard from '@/pages/ManagerDashboard';
import ManageUsers from '@/pages/ManageUsers';
import Reports from '@/pages/Reports';
import DeliveryDashboard from '@/pages/DeliveryDashboard';
import AssignedDeliveries from '@/pages/AssignedDeliveries';
import UpdateStatus from '@/pages/UpdateStatus';
import Profile from '@/pages/Profile';
import { useAuth } from '@/hooks/useAuth';
import { themeConfig } from '@/theme';
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


const AppContent: React.FC = () => {
  const { isAuthenticated, loading, user, showFirstTimeLogin, hideFirstTimeLogin, completeFirstTimeLogin } = useAuth();

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

  // Role-based routing
  const isEmployee = user?.role === 'Employee';
  const isStoreKeeper = user?.role === 'Store Keeper';
  const isAdmin = user?.role === 'Admin';
  const isDeliveryStaff = user?.role === 'Delivery Staff';

  // Render role-based routes with first-time login modal
  const renderRoleRoutes = () => {
    if (isEmployee) {
           return (
             <EmployeeLayout>
               <Routes>
                 <Route path="/" element={<Navigate to="/employee/dashboard" replace />} />
                 <Route path="/employee/dashboard" element={<EmployeeDashboard />} />
                 <Route path="/employee/borrow" element={<BorrowItem />} />
                 <Route path="/employee/return" element={<ReturnItem />} />
                 <Route path="/employee/damage-report" element={<DamageReport />} />
                 <Route path="/employee/profile" element={<Profile />} />
                 <Route path="*" element={<Navigate to="/employee/dashboard" replace />} />
               </Routes>
             </EmployeeLayout>
           );
         }

    if (isStoreKeeper) {
      return (
        <StoreKeeperLayout>
          <Routes>
            <Route path="/" element={<Navigate to="/storekeeper/dashboard" replace />} />
            <Route path="/storekeeper/dashboard" element={<StoreKeeperDashboard />} />
            <Route path="/storekeeper/manage-items" element={<ManageItems />} />
            <Route path="/storekeeper/approve-requests" element={<ApproveRequests />} />
            <Route path="/storekeeper/track-stock" element={<TrackStock />} />
            <Route path="/storekeeper/profile" element={<Profile />} />
            <Route path="*" element={<Navigate to="/storekeeper/dashboard" replace />} />
          </Routes>
        </StoreKeeperLayout>
      );
    }

    if (isAdmin) {
      return (
        <ManagerLayout>
          <Routes>
            <Route path="/" element={<Navigate to="/manager/dashboard" replace />} />
            <Route path="/manager/dashboard" element={<ManagerDashboard />} />
            <Route path="/manager/manage-users" element={<ManageUsers />} />
            <Route path="/manager/manage-items" element={<ManageItems />} />
            <Route path="/manager/reports" element={<Reports />} />
            <Route path="/manager/profile" element={<Profile />} />
            <Route path="*" element={<Navigate to="/manager/dashboard" replace />} />
          </Routes>
        </ManagerLayout>
      );
    }

    if (isDeliveryStaff) {
      return (
        <DeliveryLayout>
          <Routes>
            <Route path="/" element={<Navigate to="/delivery/dashboard" replace />} />
            <Route path="/delivery/dashboard" element={<DeliveryDashboard />} />
            <Route path="/delivery/assigned-deliveries" element={<AssignedDeliveries />} />
            <Route path="/delivery/update-status" element={<UpdateStatus />} />
            <Route path="/delivery/profile" element={<Profile />} />
            <Route path="*" element={<Navigate to="/delivery/dashboard" replace />} />
          </Routes>
        </DeliveryLayout>
      );
    }

    // Default layout for other roles
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
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Layout>
    );
  };

  return (
    <>
      {renderRoleRoutes()}
      <FirstTimeLoginModal
        visible={showFirstTimeLogin}
        userEmail={user?.email || ''}
        onSuccess={completeFirstTimeLogin}
        onCancel={hideFirstTimeLogin}
      />
    </>
  );
};

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
<<<<<<< HEAD
        <ConfigProvider theme={theme}>
          <AppContent />
=======
        <ConfigProvider theme={themeConfig}>
          <Router>
            <AppContent />
          </Router>
>>>>>>> 35e97bf7a8598053700e0d128c9fb0f86e0022ea
        </ConfigProvider>
      </QueryClientProvider>
    </Provider>
  );
};

export default App;
