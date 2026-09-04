import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './context/AuthContext';

// Common Components
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';

// Public Pages
import { HomePage } from './pages/public/HomePage';
import { SchedulePage } from './pages/public/SchedulePage';
import { TrainersPage } from './pages/public/TrainersPage';
import { MembershipPage } from './pages/public/MembershipPage';
import { AboutPage } from './pages/public/AboutPage';
import { ContactPage } from './pages/public/ContactPage';
import { LoginPage } from './pages/public/LoginPage';
import { RegisterPage } from './pages/public/RegisterPage';

// Customer Portal
import { AccountDashboardPage } from './pages/account/AccountDashboardPage';

// Admin Control Center
import { AdminLayout } from './pages/admin/AdminLayout';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminSchedulePage } from './pages/admin/AdminSchedulePage';
import { AdminSlotsPage } from './pages/admin/AdminSlotsPage';
import { AdminBookingsPage } from './pages/admin/AdminBookingsPage';
import { AdminTrainersPage } from './pages/admin/AdminTrainersPage';
import { AdminCustomersPage } from './pages/admin/AdminCustomersPage';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage';
import { AdminAuditLogsPage } from './pages/admin/AdminAuditLogsPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 15, // 15 seconds
      retry: 1,
    },
  },
});

// Layout for Public Pages (Navbar + Content + Footer)
const PublicLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#080808]">
      <Navbar />
      <div className="flex-1">
        <Outlet />
      </div>
      <Footer />
    </div>
  );
};

// Route guard for customer account
const ProtectedCustomerRoute: React.FC = () => {
  const { user, isLoading } = useAuth();
  if (isLoading) {
    return <div className="min-h-screen bg-[#080808] flex items-center justify-center text-[#CCFF00]">Loading...</div>;
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#080808]">
      <Navbar />
      <div className="flex-1">
        <Outlet />
      </div>
      <Footer />
    </div>
  );
};

// Route guard for admin portal
const ProtectedAdminRoute: React.FC = () => {
  const { user, isAdmin, isLoading } = useAuth();
  if (isLoading) {
    return <div className="min-h-screen bg-[#070707] flex items-center justify-center text-[#CCFF00]">Verifying Admin Credentials...</div>;
  }
  if (!user || !isAdmin) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
};

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Website Routes */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/schedule" element={<SchedulePage />} />
              <Route path="/trainers" element={<TrainersPage />} />
              <Route path="/membership" element={<MembershipPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
            </Route>

            {/* Customer Account Portal */}
            <Route element={<ProtectedCustomerRoute />}>
              <Route path="/account" element={<AccountDashboardPage />} />
            </Route>

            {/* Gym Owner / Admin Control Center */}
            <Route element={<ProtectedAdminRoute />}>
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminDashboardPage />} />
                <Route path="schedule" element={<AdminSchedulePage />} />
                <Route path="slots" element={<AdminSlotsPage />} />
                <Route path="bookings" element={<AdminBookingsPage />} />
                <Route path="trainers" element={<AdminTrainersPage />} />
                <Route path="customers" element={<AdminCustomersPage />} />
                <Route path="settings" element={<AdminSettingsPage />} />
                <Route path="audit-logs" element={<AdminAuditLogsPage />} />
              </Route>
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
