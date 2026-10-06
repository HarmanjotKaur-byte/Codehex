import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import Header from './components/Header.jsx';
import NavBar from './components/NavBar.jsx';

// Auth Pages
import LoginPage from './pages/auth/LoginPage.jsx';
import RegisterPage from './pages/auth/RegisterPage.jsx';
import VerificationPendingPage from './pages/auth/VerificationPendingPage.jsx';

// Farmer pages
import Dashboard from './pages/Dashboard.jsx';
import StubbleEstimate from './pages/StubbleEstimate.jsx';
import BurningRisk from './pages/BurningRisk.jsx';
import BuyerMatching from './pages/BuyerMatching.jsx';

// Buyer pages
import BuyerDashboard from './pages/buyer/BuyerDashboard.jsx';
import AvailableStubble from './pages/buyer/AvailableStubble.jsx';
import BuyerPreferences from './pages/buyer/BuyerPreferences.jsx';

// Government pages
import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import BurningRiskMonitoring from './pages/admin/BurningRiskMonitoring.jsx';
import StubbleAvailability from './pages/admin/StubbleAvailability.jsx';
import ModelInformation from './pages/admin/ModelInformation.jsx';

// Super Admin page
import SuperAdminDashboard from './pages/admin/SuperAdminDashboard.jsx';

function MainApp() {
  const { currentUser, isAuthenticated, loading } = useAuth();
  const [authView, setAuthView] = useState('login'); // 'login' | 'register'
  const [tab, setTab] = useState('dashboard');

  // Shared farmer state preserved for session
  const [stubbleResult, setStubbleResult] = useState(null);
  const [farmerLat, setFarmerLat] = useState(null);
  const [farmerLon, setFarmerLon] = useState(null);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>🌾</div>
          <div style={{ fontWeight: 700, color: 'var(--green-800)' }}>Initializing ParaliPay Secure Session…</div>
        </div>
      </div>
    );
  }

  // 1. Unauthenticated -> Show Login / Register
  if (!isAuthenticated || !currentUser) {
    return authView === 'login' ? (
      <LoginPage onSwitchToRegister={() => setAuthView('register')} />
    ) : (
      <RegisterPage onSwitchToLogin={() => setAuthView('login')} />
    );
  }

  // 2. Government User Pending / Rejected Gate
  if (currentUser.role === 'GOVERNMENT' && currentUser.verification_status !== 'VERIFIED') {
    return (
      <>
        <Header />
        <main className="page-wrapper">
          <VerificationPendingPage />
        </main>
      </>
    );
  }

  // 3. Render Dashboard based on role
  const renderPage = () => {
    const role = currentUser.role;

    // FARMER
    if (role === 'FARMER') {
      switch (tab) {
        case 'dashboard':
          return <Dashboard />;
        case 'stubble':
          return <StubbleEstimate onResult={(r) => setStubbleResult(r)} />;
        case 'risk':
          return (
            <BurningRisk
              farmerLat={farmerLat}
              farmerLon={farmerLon}
              onLocation={(lat, lon) => {
                setFarmerLat(lat);
                setFarmerLon(lon);
              }}
            />
          );
        case 'buyers':
          return (
            <BuyerMatching
              stubbleResult={stubbleResult}
              farmerLat={farmerLat}
              farmerLon={farmerLon}
            />
          );
        default:
          return <Dashboard />;
      }
    }

    // BUYER
    if (role === 'BUYER') {
      switch (tab) {
        case 'dashboard':
          return <BuyerDashboard />;
        case 'stubble':
          return <AvailableStubble />;
        case 'preferences':
          return <BuyerPreferences />;
        default:
          return <BuyerDashboard />;
      }
    }

    // GOVERNMENT (VERIFIED)
    if (role === 'GOVERNMENT') {
      switch (tab) {
        case 'dashboard':
          return <AdminDashboard />;
        case 'risk':
          return <BurningRiskMonitoring />;
        case 'availability':
          return <StubbleAvailability />;
        case 'models':
          return <ModelInformation />;
        default:
          return <AdminDashboard />;
      }
    }

    // SUPER_ADMIN
    if (role === 'SUPER_ADMIN') {
      switch (tab) {
        case 'dashboard':
          return <SuperAdminDashboard />;
        case 'risk':
          return <BurningRiskMonitoring />;
        case 'availability':
          return <StubbleAvailability />;
        case 'models':
          return <ModelInformation />;
        default:
          return <SuperAdminDashboard />;
      }
    }

    return <div>Access Denied: Unrecognized Role</div>;
  };

  return (
    <>
      <Header />
      <NavBar role={currentUser.role} active={tab} onChange={setTab} />
      <main className="page-wrapper">{renderPage()}</main>
      <footer className="site-footer">
        ParaliPay — AI Stubble Management & Verified Marketplace · PostgreSQL Database & JWT RBAC Enabled ·
        Hackathon 2026
      </footer>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
