import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Provider } from 'react-redux';
import { ConfigProvider } from 'antd';
import { store } from '@/store';
import ErrorBoundary from '@/components/ErrorBoundary';
import LoadingSpinner from '@/components/LoadingSpinner';
import FirstTimeLoginModal from '@/components/FirstTimeLoginModal';
import Layout from '@/components/Layout';
import EmployeeLayout from '@/components/EmployeeLayout';
import StoreKeeperLayout from '@/components/StoreKeeperLayout';
import ManagerLayout from '@/components/ManagerLayout';
import DeliveryLayout from '@/components/DeliveryLayout';
import Login from '@/pages/Login';
// Lazy load components for better performance
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const Inventory = lazy(() => import('@/pages/Inventory'));
const Categories = lazy(() => import('@/pages/Categories'));
const Stores = lazy(() => import('@/pages/Stores'));
const Suppliers = lazy(() => import('@/pages/Suppliers'));
const Transactions = lazy(() => import('@/pages/Transactions'));
const DamageReports = lazy(() => import('@/pages/DamageReports'));
const Deliveries = lazy(() => import('@/pages/Deliveries'));
const Search = lazy(() => import('@/pages/Search'));
const Audit = lazy(() => import('@/pages/Audit'));
const EmployeeDashboard = lazy(() => import('@/pages/EmployeeDashboard'));
const BorrowItem = lazy(() => import('@/pages/BorrowItem'));
const ReturnItem = lazy(() => import('@/pages/ReturnItem'));
const DamageReport = lazy(() => import('@/pages/DamageReport'));
const StoreKeeperDashboard = lazy(() => import('@/pages/StoreKeeperDashboard'));
const ManageItems = lazy(() => import('@/pages/ManageItems'));
const ApproveRequests = lazy(() => import('@/pages/ApproveRequests'));
const TrackStock = lazy(() => import('@/pages/TrackStock'));
const ManagerDashboard = lazy(() => import('@/pages/ManagerDashboard'));
const ManageUsers = lazy(() => import('@/pages/ManageUsers'));
const Reports = lazy(() => import('@/pages/Reports'));
const DeliveryDashboard = lazy(() => import('@/pages/DeliveryDashboard'));
const AssignedDeliveries = lazy(() => import('@/pages/AssignedDeliveries'));
const UpdateStatus = lazy(() => import('@/pages/UpdateStatus'));
const Profile = lazy(() => import('@/pages/Profile'));
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
  const { isAuthenticated, loading, user, showFirstTimeLogin, hideFirstTimeLogin, completeFirstTimeLogin, error } = useAuth();

  if (loading) {
    return (
      <LoadingSpinner 
        size="large" 
        text="Loading application..." 
        fullScreen 
      />
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
               <Suspense fallback={<LoadingSpinner size="large" text="Loading employee dashboard..." />}>
                 <Routes>
                   <Route path="/" element={<Navigate to="/employee/dashboard" replace />} />
                   <Route path="/employee/dashboard" element={<EmployeeDashboard />} />
                   <Route path="/employee/borrow" element={<BorrowItem />} />
                   <Route path="/employee/return" element={<ReturnItem />} />
                   <Route path="/employee/damage-report" element={<DamageReport />} />
                   <Route path="/employee/profile" element={<Profile />} />
                   <Route path="*" element={<Navigate to="/employee/dashboard" replace />} />
                 </Routes>
               </Suspense>
             </EmployeeLayout>
           );
         }

    if (isStoreKeeper) {
      return (
        <StoreKeeperLayout>
          <Suspense fallback={<LoadingSpinner size="large" text="Loading store keeper dashboard..." />}>
            <Routes>
              <Route path="/" element={<Navigate to="/storekeeper/dashboard" replace />} />
              <Route path="/storekeeper/dashboard" element={<StoreKeeperDashboard />} />
              <Route path="/storekeeper/manage-items" element={<ManageItems />} />
              <Route path="/storekeeper/approve-requests" element={<ApproveRequests />} />
              <Route path="/storekeeper/track-stock" element={<TrackStock />} />
              <Route path="/storekeeper/profile" element={<Profile />} />
              <Route path="*" element={<Navigate to="/storekeeper/dashboard" replace />} />
            </Routes>
          </Suspense>
        </StoreKeeperLayout>
      );
    }

    if (isAdmin) {
      return (
        <ManagerLayout>
          <Suspense fallback={<LoadingSpinner size="large" text="Loading manager dashboard..." />}>
            <Routes>
              <Route path="/" element={<Navigate to="/manager/dashboard" replace />} />
              <Route path="/manager/dashboard" element={<ManagerDashboard />} />
              <Route path="/manager/manage-users" element={<ManageUsers />} />
              <Route path="/manager/manage-items" element={<ManageItems />} />
              <Route path="/manager/reports" element={<Reports />} />
              <Route path="/manager/profile" element={<Profile />} />
              <Route path="*" element={<Navigate to="/manager/dashboard" replace />} />
            </Routes>
          </Suspense>
        </ManagerLayout>
      );
    }

    if (isDeliveryStaff) {
      return (
        <DeliveryLayout>
          <Suspense fallback={<LoadingSpinner size="large" text="Loading delivery dashboard..." />}>
            <Routes>
              <Route path="/" element={<Navigate to="/delivery/dashboard" replace />} />
              <Route path="/delivery/dashboard" element={<DeliveryDashboard />} />
              <Route path="/delivery/assigned-deliveries" element={<AssignedDeliveries />} />
              <Route path="/delivery/update-status" element={<UpdateStatus />} />
              <Route path="/delivery/profile" element={<Profile />} />
              <Route path="*" element={<Navigate to="/delivery/dashboard" replace />} />
            </Routes>
          </Suspense>
        </DeliveryLayout>
      );
    }

    // Default layout for other roles
    return (
      <Layout>
        <Suspense fallback={<LoadingSpinner size="large" text="Loading dashboard..." />}>
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
        </Suspense>
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
    <ErrorBoundary>
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          <ConfigProvider theme={themeConfig}>
            <Router>
              <AppContent />
            </Router>
          </ConfigProvider>
        </QueryClientProvider>
      </Provider>
    </ErrorBoundary>
  );
};

export default App;