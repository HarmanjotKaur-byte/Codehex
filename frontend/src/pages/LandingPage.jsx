import React, { useState } from 'react';
import { 
  ArrowRight, 
  Leaf, 
  Users, 
  Sprout, 
  ShieldCheck, 
  Calculator, 
  Flame, 
  PackagePlus, 
  Banknote, 
  MapPin, 
  Search, 
  Handshake, 
  Truck, 
  Phone, 
  Mail, 
  MapPinIcon, 
  Sparkles
} from 'lucide-react';
import heroFarmerImg from '../assets/hero_farmer_hd.jpg';
import '../styles/LandingPage.css';

export default function LandingPage({ onGetStarted }) {
  const [activeNav, setActiveNav] = useState('home');
  const [featuresRole, setFeaturesRole] = useState('farmer'); // 'farmer' | 'buyer'

  const scrollTo = (id) => {
    setActiveNav(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="paralipay-landing">
      {/* ========================================================================
          STICKY NAVBAR
          ======================================================================== */}
      <header className="landing-nav">
        <div className="landing-nav-logo" onClick={() => scrollTo('home')}>
          {/* Precision 2-Tone Brand Leaf Mark */}
          <svg width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path 
              d="M6 26C6 26 8 15 16.5 9.5C24.5 4.5 28 6 28 6C28 6 26.5 15.5 19.5 22.5C13 29 6 26 6 26Z" 
              fill="#15803d" 
            />
            <path 
              d="M12.5 24.5C12.5 24.5 16.5 18.5 22.5 14.5C28 10.5 28 6 28 6C28 6 24 14 18 20.5C12.5 26.5 12.5 24.5 12.5 24.5Z" 
              fill="#4ade80" 
              opacity="0.85" 
            />
            <path 
              d="M6 26C11 20.5 17 14.5 27 7" 
              stroke="#0f382c" 
              strokeWidth="1.8" 
              strokeLinecap="round" 
            />
          </svg>
          <span className="landing-logo-text">ParaliPay</span>
        </div>

        <nav className="landing-nav-links">
          <a 
            href="#home" 
            className={`landing-nav-link ${activeNav === 'home' ? 'active' : ''}`}
            onClick={(e) => { e.preventDefault(); scrollTo('home'); }}
          >
            Home
          </a>
          <a 
            href="#about" 
            className={`landing-nav-link ${activeNav === 'about' ? 'active' : ''}`}
            onClick={(e) => { e.preventDefault(); scrollTo('about'); }}
          >
            About
          </a>
          <a 
            href="#features" 
            className={`landing-nav-link ${activeNav === 'features' ? 'active' : ''}`}
            onClick={(e) => { e.preventDefault(); scrollTo('features'); }}
          >
            Features
          </a>
          <a 
            href="#contact" 
            className={`landing-nav-link ${activeNav === 'contact' ? 'active' : ''}`}
            onClick={(e) => { e.preventDefault(); scrollTo('contact'); }}
          >
            Contact
          </a>
        </nav>

        <button 
          type="button" 
          className="landing-nav-btn"
          onClick={onGetStarted}
        >
          Get Started
        </button>
      </header>

      {/* ========================================================================
          HERO SECTION (MATCHING EXACT VISUAL REFERENCE)
          ======================================================================== */}
      <section className="landing-hero" id="home">
        {/* Left Column: Typography, CTA, Highlights */}
        <div className="hero-content-col">
          <h1 className="hero-main-title">
            Turning Crop Residue<br />
            into Opportunity
          </h1>

          <p className="hero-sub-text">
            Connect farmers and buyers for a cleaner environment and a sustainable future.
          </p>

          <button 
            type="button" 
            className="hero-cta-btn"
            onClick={onGetStarted}
          >
            <span>Get Started</span>
            <ArrowRight size={18} />
          </button>

          {/* Bottom 3 Exact Feature Highlights */}
          <div className="hero-highlights-row">
            {/* Highlight 1: Reduce Stubble Burning */}
            <div className="hero-highlight-item">
              <div className="highlight-icon-box">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/>
                  <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>
                </svg>
              </div>
              <div className="highlight-text-box">
                <span>Reduce</span>
                <span>Stubble Burning</span>
              </div>
            </div>

            {/* Highlight 2: Support Farmers */}
            <div className="hero-highlight-item">
              <div className="highlight-icon-box">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              </div>
              <div className="highlight-text-box">
                <span>Support</span>
                <span>Farmers</span>
              </div>
            </div>

            {/* Highlight 3: Build a Greener Future */}
            <div className="hero-highlight-item">
              <div className="highlight-icon-box">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M7 20h10"/>
                  <path d="M10 20c5.5-2.5.8-6.4 3-10"/>
                  <path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8z"/>
                  <path d="M14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1-1 1.6-2.3 1.7-4.6-2.7.1-4 1-4.9 2z"/>
                </svg>
              </div>
              <div className="highlight-text-box">
                <span>Build a</span>
                <span>Greener Future</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Real High-Res Farmer & Floating Leaves */}
        <div className="hero-visual-col">
          {/* Floating botanical leaf vectors matching mockup */}
          <div className="decorative-leaf-left" aria-hidden="true">
            <svg width="90" height="90" viewBox="0 0 100 100" fill="none">
              <path d="M15 85C15 85 25 35 55 18C85 0 95 10 95 10C95 10 88 50 62 75C36 100 15 85 15 85Z" fill="#86efac" />
              <path d="M15 85C35 65 55 45 85 20" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>

          <div className="decorative-leaf-right" aria-hidden="true">
            <svg width="95" height="95" viewBox="0 0 100 100" fill="none">
              <path d="M15 85C15 85 25 35 55 18C85 0 95 10 95 10C95 10 88 50 62 75C36 100 15 85 15 85Z" fill="#4ade80" />
              <path d="M15 85C35 65 55 45 85 20" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>

          <div className="decorative-leaf-right-2" aria-hidden="true">
            <svg width="75" height="75" viewBox="0 0 100 100" fill="none">
              <path d="M15 85C15 85 25 35 55 18C85 0 95 10 95 10C95 10 88 50 62 75C36 100 15 85 15 85Z" fill="#86efac" />
            </svg>
          </div>

          <img 
            src={heroFarmerImg} 
            alt="Smiling Indian farmer holding harvested paddy straw in sunlit golden agricultural field" 
            className="hero-farmer-photo" 
          />
        </div>
      </section>

      {/* ========================================================================
          ANIMATED ABOUT SECTION (#about)
          ======================================================================== */}
      <section className="landing-about-section" id="about">
        <div className="about-header-wrap">
          <span className="about-badge-tag">ABOUT PARALIPAY</span>
          <h2 className="about-headline">
            About Our Platform
          </h2>
          <div className="about-concise-box">
            <p className="about-intro-line">
              ParaliPay is an AI-powered biomass exchange connecting farmers directly with certified industrial buyers to eliminate paddy stubble burning.
            </p>
            <p className="about-intro-line">
              We transform agricultural crop residue into high-value clean energy raw material for bio-CNG plants, green power refineries, and eco-packaging producers.
            </p>
            <p className="about-intro-line">
              Farmers earn guaranteed direct income for their harvested stubble, while industries secure a transparent and dependable clean-fuel supply chain.
            </p>
          </div>
        </div>
      </section>

      {/* ========================================================================
          ANIMATED FEATURES SECTION (#features)
          ======================================================================== */}
      <section className="landing-features-section" id="features">
        <div className="features-header-wrap">
          <span className="features-badge-tag">POWERFUL FEATURES</span>
          <h2 className="features-headline">
            Tailored Tools for Farmers & Biomass Buyers
          </h2>
          <p className="features-intro-text">
            Choose your role to explore the purpose-built capabilities powering the ParaliPay marketplace ecosystem.
          </p>
        </div>

        {/* Role Toggle Switcher */}
        <div className="features-role-switcher">
          <button
            type="button"
            className={`role-switcher-tab ${featuresRole === 'farmer' ? 'active' : ''}`}
            onClick={() => setFeaturesRole('farmer')}
          >
            <span>🌾 Features for Farmers</span>
          </button>
          <button
            type="button"
            className={`role-switcher-tab ${featuresRole === 'buyer' ? 'active' : ''}`}
            onClick={() => setFeaturesRole('buyer')}
          >
            <span>🏭 Features for Buyers</span>
          </button>
        </div>

        {/* Farmers Features Grid */}
        {featuresRole === 'farmer' && (
          <div className="features-grid">
            <div className="feature-box-card">
              <div className="feature-box-icon" style={{ backgroundColor: '#dcfce7', color: '#166534' }}>
                <Calculator size={26} />
              </div>
              <h3 className="feature-box-title">AI Stubble Estimation</h3>
              <p className="feature-box-desc">
                Accurately estimate total paddy straw tonnage before harvest based on your land acreage, soil type, and crop variety.
              </p>
              <div className="feature-box-link" onClick={onGetStarted}>
                Calculate Yield →
              </div>
            </div>

            <div className="feature-box-card">
              <div className="feature-box-icon" style={{ backgroundColor: '#fee2e2', color: '#991b1b' }}>
                <Flame size={26} />
              </div>
              <h3 className="feature-box-title">Satellite Burning Risk AI</h3>
              <p className="feature-box-desc">
                Monitor real-time active fire grids in your region and check burning risk advisories powered by VIIRS satellite telemetry.
              </p>
              <div className="feature-box-link" onClick={onGetStarted}>
                Check Local Risk →
              </div>
            </div>

            <div className="feature-box-card">
              <div className="feature-box-icon" style={{ backgroundColor: '#fef3c7', color: '#b45309' }}>
                <PackagePlus size={26} />
              </div>
              <h3 className="feature-box-title">Zero-Fee Marketplace</h3>
              <p className="feature-box-desc">
                Create listings in under 60 seconds. Direct discovery connects you with industrial buyers looking for immediate procurement.
              </p>
              <div className="feature-box-link" onClick={onGetStarted}>
                Create Listing →
              </div>
            </div>

            <div className="feature-box-card">
              <div className="feature-box-icon" style={{ backgroundColor: '#e0e7ff', color: '#3730a3' }}>
                <Banknote size={26} />
              </div>
              <h3 className="feature-box-title">Guaranteed Direct Payouts</h3>
              <p className="feature-box-desc">
                Transparent price per quintal with contract protection. Receive instant direct transfers upon residue collection and baling.
              </p>
              <div className="feature-box-link" onClick={onGetStarted}>
                Explore Payouts →
              </div>
            </div>
          </div>
        )}

        {/* Buyers Features Grid */}
        {featuresRole === 'buyer' && (
          <div className="features-grid">
            <div className="feature-box-card">
              <div className="feature-box-icon" style={{ backgroundColor: '#e0f2fe', color: '#0369a1' }}>
                <Search size={26} />
              </div>
              <h3 className="feature-box-title">Browse Verified Listings</h3>
              <p className="feature-box-desc">
                Access a live statewide catalog of paddy straw, mustard husk, and biomass bales from verified and authenticated farmers.
              </p>
              <div className="feature-box-link" onClick={onGetStarted}>
                Browse Inventory →
              </div>
            </div>

            <div className="feature-box-card">
              <div className="feature-box-icon" style={{ backgroundColor: '#fce7f3', color: '#be185d' }}>
                <MapPin size={26} />
              </div>
              <h3 className="feature-box-title">Nearby Radius Sourcing</h3>
              <p className="feature-box-desc">
                Filter by custom kilometer radius and GPS location to discover nearest farms and dramatically cut logistics transit expenses.
              </p>
              <div className="feature-box-link" onClick={onGetStarted}>
                Find Nearby →
              </div>
            </div>

            <div className="feature-box-card">
              <div className="feature-box-icon" style={{ backgroundColor: '#dcfce7', color: '#166534' }}>
                <Handshake size={26} />
              </div>
              <h3 className="feature-box-title">Deals & Procurement Hub</h3>
              <p className="feature-box-desc">
                Manage all farmer inquiries, confirmed transactions, contracts, and delivery schedules from an intuitive centralized dashboard.
              </p>
              <div className="feature-box-link" onClick={onGetStarted}>
                Manage Deals →
              </div>
            </div>

            <div className="feature-box-card">
              <div className="feature-box-icon" style={{ backgroundColor: '#ede9fe', color: '#6d28d9' }}>
                <Truck size={26} />
              </div>
              <h3 className="feature-box-title">Certified Buyer Registry</h3>
              <p className="feature-box-desc">
                Register certified procurement requirements so matching farmers across districts can discover and sell directly to you.
              </p>
              <div className="feature-box-link" onClick={onGetStarted}>
                Register Interest →
              </div>
            </div>
          </div>
        )}
      </section>

      {/* ========================================================================
          CALL TO ACTION BANNER
          ======================================================================== */}
      <section className="landing-cta-banner-section">
        <div className="cta-banner-wrap">
          <h2 className="cta-banner-title">
            Ready to Transform Agricultural Waste into Wealth?
          </h2>
          <p className="cta-banner-desc">
            Join thousands of progressive farmers and leading biomass energy producers making northern India clean and prosperous.
          </p>
          <button 
            type="button" 
            className="cta-banner-btn"
            onClick={onGetStarted}
          >
            <span>Get Started with ParaliPay</span>
            <ArrowRight size={20} />
          </button>
        </div>
      </section>

      {/* ========================================================================
          FULL WEBSITE FOOTER (#contact)
          ======================================================================== */}
      <footer className="landing-footer" id="contact">
        <div className="footer-top-grid">
          {/* Column 1: Brand & Mission */}
          <div className="footer-brand-col">
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <svg width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 26C6 26 8 15 16.5 9.5C24.5 4.5 28 6 28 6C28 6 26.5 15.5 19.5 22.5C13 29 6 26 6 26Z" fill="#22c55e" />
                <path d="M12.5 24.5C12.5 24.5 16.5 18.5 22.5 14.5C28 10.5 28 6 28 6C28 6 24 14 18 20.5C12.5 26.5 12.5 24.5 12.5 24.5Z" fill="#86efac" opacity="0.85" />
              </svg>
              <span className="footer-brand-logo-text">ParaliPay</span>
            </div>
            <p className="footer-brand-desc">
              India's first AI-enabled biomass marketplace platform connecting progressive farmers with clean-energy buyers to eliminate paddy stubble burning and empower rural livelihoods.
            </p>
            <div className="footer-eco-badge">
              <Sparkles size={14} />
              <span>Certified Sustainable Agri-Tech</span>
            </div>
          </div>

          {/* Column 2: Farmer Quick Links */}
          <div>
            <h4 className="footer-col-title">For Farmers</h4>
            <ul className="footer-links-list">
              <li><span className="footer-link-item" onClick={onGetStarted}>Stubble Estimation</span></li>
              <li><span className="footer-link-item" onClick={onGetStarted}>Burning Risk AI</span></li>
              <li><span className="footer-link-item" onClick={onGetStarted}>Create New Listing</span></li>
              <li><span className="footer-link-item" onClick={onGetStarted}>Find Nearby Buyers</span></li>
              <li><span className="footer-link-item" onClick={onGetStarted}>Kisan Support Portal</span></li>
            </ul>
          </div>

          {/* Column 3: Buyer Quick Links */}
          <div>
            <h4 className="footer-col-title">For Biomass Buyers</h4>
            <ul className="footer-links-list">
              <li><span className="footer-link-item" onClick={onGetStarted}>Browse All Listings</span></li>
              <li><span className="footer-link-item" onClick={onGetStarted}>Nearby Radius Search</span></li>
              <li><span className="footer-link-item" onClick={onGetStarted}>Procurement Contracts</span></li>
              <li><span className="footer-link-item" onClick={onGetStarted}>Register Bio-Demand</span></li>
              <li><span className="footer-link-item" onClick={onGetStarted}>Enterprise Sourcing</span></li>
            </ul>
          </div>

          {/* Column 4: Contact & Regional Headquarters */}
          <div>
            <h4 className="footer-col-title">Contact & Support</h4>
            <div className="footer-contact-list">
              <div className="footer-contact-row">
                <MapPinIcon size={18} />
                <span>Kisan Bhawan, Sector 35-A, Chandigarh, Punjab 160035</span>
              </div>
              <div className="footer-contact-row">
                <Phone size={18} />
                <span>Toll-Free Helpline: 1800-PARALI-PAY (1800-727-2547)</span>
              </div>
              <div className="footer-contact-row">
                <Mail size={18} />
                <span>support@paralipay.in / contact@paralipay.in</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Legal */}
        <div className="footer-bottom-bar">
          <div>
            &copy; 2026 ParaliPay Technologies Inc. Empowering Farmers, Greening the Future.
          </div>
          <div className="footer-legal-links">
            <span className="footer-legal-link">Privacy Policy</span>
            <span className="footer-legal-link">Terms of Service</span>
            <span className="footer-legal-link">Environmental Audit</span>
            <span className="footer-legal-link">Security</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
