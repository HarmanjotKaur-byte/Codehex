import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { LanguageProvider, useLanguage } from './context/LanguageContext.jsx';
import Header from './components/Header.jsx';
import NavBar from './components/NavBar.jsx';
import LoadingSpinner from './components/LoadingSpinner.jsx';

// Auth Pages
import LandingPage from './pages/LandingPage.jsx';
import RoleSelectPage from './pages/RoleSelectPage.jsx';
import FarmerLoginPage from './pages/auth/FarmerLoginPage.jsx';
import BuyerLoginPage from './pages/auth/BuyerLoginPage.jsx';
import LoginPage from './pages/auth/LoginPage.jsx';
import RegisterPage from './pages/auth/RegisterPage.jsx';

// Farmer pages
import Dashboard from './pages/Dashboard.jsx';
import StubbleEstimate from './pages/StubbleEstimate.jsx';
import BurningRisk from './pages/BurningRisk.jsx';
import BuyerMatching from './pages/BuyerMatching.jsx';
import FarmerActivity from './pages/FarmerActivity.jsx';
import CreateListing from './pages/CreateListing.jsx';

// Buyer pages

import FindResidue from './pages/buyer/FindResidue.jsx';
import NearbyListings from './pages/buyer/NearbyListings.jsx';
import BrowseAllListings from './pages/buyer/BrowseAllListings.jsx';
import MyDeals from './pages/buyer/MyDeals.jsx';
import SavedListings from './pages/buyer/SavedListings.jsx';
import RegisterInterest from './pages/buyer/RegisterInterest.jsx';

import BuyerDashboard from './pages/buyer/BuyerDashboard.jsx';
import AvailableStubble from './pages/buyer/AvailableStubble.jsx';
import BuyerPreferences from './pages/buyer/BuyerPreferences.jsx';
import BuyerActivity from './pages/buyer/BuyerActivity.jsx';
import BuyerMyActivity from './pages/buyer/BuyerMyActivity.jsx';



function MainApp() {
  const { currentUser, isAuthenticated, loading } = useAuth();
  const { t } = useLanguage();
  const [authView, setAuthView] = useState('landing'); // 'landing' | 'role_select' | 'login' | 'register'
  const [selectedRole, setSelectedRole] = useState('FARMER');
  const [tab, setTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Shared farmer state (passed between farmer pages)
  const [stubbleResult, setStubbleResult] = useState(null);
  const [farmerLat, setFarmerLat] = useState(null);
  const [farmerLon, setFarmerLon] = useState(null);

  if (loading) {
    return (
      <div className="auth-container">
        <LoadingSpinner message={t('common.loading')} />
      </div>
    );
  }

  // Unauthenticated flow
  if (!isAuthenticated || !currentUser) {
    if (authView === 'landing') {
      return (
        <LandingPage 
          onGetStarted={() => setAuthView('role_select')} 
        />
      );
    }

    if (authView === 'role_select') {
      return (
        <RoleSelectPage 
          onBack={() => setAuthView('landing')}
          onSelectRole={(role) => {
            setSelectedRole(role);
            setAuthView('login');
          }}
        />
      );
    }

    if (authView === 'login' && selectedRole === 'FARMER') {
      return (
        <FarmerLoginPage 
          onNavigateRegister={() => setAuthView('register')}
          onNavigateBack={() => setAuthView('role_select')}
        />
      );
    }

    if (authView === 'login' && (selectedRole === 'BUYER' || selectedRole === 'buyer')) {
      return (
        <BuyerLoginPage 
          onNavigateRegister={() => setAuthView('register')}
          onNavigateBack={() => setAuthView('role_select')}
        />
      );
    }

    return (
      <div className="app-root">
        <Header />
        <main className="page-wrapper">
          {authView === 'login' ? (
            <LoginPage 
              initialRole={selectedRole}
              onNavigateRegister={() => setAuthView('register')} 
              onNavigateBack={() => setAuthView('role_select')}
            />
          ) : (
            <RegisterPage 
              initialRole={selectedRole}
              onNavigateLogin={() => setAuthView('login')} 
              onNavigateBack={() => setAuthView('role_select')}
            />
          )}
        </main>
      </div>
    );
  }

  const renderPage = () => {
    // 1. Farmer Role
    if (currentUser.role === 'FARMER') {
      switch (tab) {
        case 'dashboard':
          return <Dashboard setTab={setTab} />;
        case 'stubble':
          return <StubbleEstimate onResult={(r) => setStubbleResult(r)} onNavigateBuyers={() => setTab('buyers')} />;
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
        case 'create-listing': return <CreateListing stubbleResult={stubbleResult} />;
        case 'activity':
          return <FarmerActivity />;
        default:
          return <Dashboard setTab={setTab} />;
      }
    }

    // 2. Buyer Role
    if (currentUser.role === 'BUYER') {
      switch (tab) {
        case 'dashboard':
          return <BuyerDashboard setTab={setTab} />;
        case 'find_residue':
          return <FindResidue />;
        case 'nearby':
          return <NearbyListings />;
        case 'browse_all':
          return <BrowseAllListings />;
        case 'my_deals':
          return <MyDeals />;
        case 'saved':
          return <SavedListings />;
        case 'register_interest':
          return <RegisterInterest />;
        case 'my_activity':
          return <BuyerMyActivity />;
        default:
          return <BuyerDashboard setTab={setTab} />;
      }
    }

    return <div>Access Denied. Unknown role: {currentUser.role}</div>;
  };

  
    return (
      <div className="app-layout">
        <Header onMenuToggle={() => setSidebarOpen(!sidebarOpen)} isSidebarOpen={sidebarOpen} />
        <div className="main-container">
          <NavBar role={currentUser.role} active={tab} onChange={setTab} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
          <div className="content-area">
            <main className="page-wrapper">{renderPage()}</main>
          </div>
        </div>
        <footer className="site-footer" style={{width: '100%', zIndex: 1000}}>
          ParaliPay - Empowering Farmers, Greening the Future &copy; 2026
        </footer>
      </div>
    );

}

import ErrorBoundary from './components/ErrorBoundary.jsx';

export default function App() {
  return (
    <ErrorBoundary>
      <LanguageProvider>
        <AuthProvider>
          <MainApp />
        </AuthProvider>
      </LanguageProvider>
    </ErrorBoundary>
  );
}
