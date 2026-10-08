with open('frontend/src/styles/index.css', 'a', encoding='utf-8') as f:
    f.write("""

/* =========================================================
   Modern Application Layout (Sidebar & Header)
   ========================================================= */
.app-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
}

.main-container {
  display: flex;
  flex: 1;
  overflow: hidden;
  position: relative;
}

.content-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  background-color: var(--gray-50);
}

.page-wrapper {
  flex: 1;
  padding: 32px 40px 60px;
  max-width: 1400px;
  width: 100%;
  margin: 0 auto;
}

/* Sidebar Styles */
.site-sidebar {
  width: 260px;
  background-color: var(--white);
  border-right: 1px solid var(--gray-200);
  display: flex;
  flex-direction: column;
  transition: transform 0.3s ease;
  z-index: 40;
  overflow-y: auto;
}

.sidebar-nav {
  padding: 20px 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.sidebar-link {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border: none;
  background: transparent;
  color: var(--gray-600);
  font-size: 0.95rem;
  font-weight: 500;
  border-radius: var(--radius);
  cursor: pointer;
  text-align: left;
  transition: all 0.2s ease;
}

.sidebar-link:hover {
  background-color: var(--gray-50);
  color: var(--green-700);
}

.sidebar-link.active {
  background-color: var(--green-50);
  color: var(--green-700);
  font-weight: 600;
}

.sidebar-icon {
  opacity: 0.7;
}

.sidebar-link.active .sidebar-icon {
  opacity: 1;
  color: var(--green-600);
}

/* Header Revamp */
.site-header {
  background: var(--white);
  border-bottom: 1px solid var(--gray-200);
  color: var(--gray-800);
  padding: 0 24px;
  height: 70px;
  z-index: 50;
  display: flex;
  align-items: center;
}

.header-inner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.header-left, .header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
  color: var(--green-700);
}

.logo-text-group {
  display: flex;
  flex-direction: column;
}

.logo-title {
  font-size: 1.25rem;
  font-weight: 800;
  letter-spacing: -0.5px;
  line-height: 1.2;
}

.logo-tagline {
  font-size: 0.7rem;
  font-weight: 500;
  color: var(--gray-500);
  line-height: 1.2;
}

.header-user-info {
  display: flex;
  align-items: center;
  gap: 12px;
  border-left: 1px solid var(--gray-200);
  padding-left: 16px;
  margin-left: 8px;
}

.user-name {
  font-size: 0.9rem;
  font-weight: 600;
}

.logout-header-btn {
  padding: 8px 12px;
  background: var(--gray-100);
  color: var(--gray-700);
  border-radius: var(--radius-sm);
}

.mobile-menu-btn, .sidebar-header {
  display: none;
}

/* Auth Pages Styling Fixes */
.auth-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 150px);
}

/* Mobile Responsive */
@media (max-width: 992px) {
  .site-sidebar {
    position: fixed;
    top: 0;
    left: 0;
    height: 100vh;
    transform: translateX(-100%);
  }
  
  .site-sidebar.open {
    transform: translateX(0);
  }
  
  .sidebar-overlay {
    display: none;
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0,0,0,0.5);
    z-index: 35;
  }
  
  .sidebar-overlay.show {
    display: block;
  }
  
  .mobile-menu-btn, .sidebar-header {
    display: flex;
  }
  
  .mobile-menu-btn {
    background: none;
    border: none;
    color: var(--gray-700);
    cursor: pointer;
  }
  
  .sidebar-header {
    padding: 20px;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid var(--gray-200);
  }
  
  .close-sidebar-btn {
    background: none;
    border: none;
    cursor: pointer;
    color: var(--gray-500);
  }
  
  .header-user-info .user-name, .logo-tagline, .logout-text {
    display: none;
  }
  
  .page-wrapper {
    padding: 20px 16px 60px;
  }
}

/* Button & Shadow Enhancements */
.btn {
  box-shadow: var(--shadow-sm);
}

.btn-primary {
  background-color: var(--green-600);
}

.card {
  box-shadow: var(--shadow-sm);
  transition: box-shadow 0.2s ease;
}

.card:hover {
  box-shadow: var(--shadow);
}
""")
print("CSS injected")
