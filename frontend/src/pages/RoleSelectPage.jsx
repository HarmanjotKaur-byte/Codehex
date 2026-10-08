import React from 'react';
import { ArrowRight, ArrowLeft, Check } from 'lucide-react';
import farmerRoleImg from '../assets/farmer_role_visual_hd.png';
import sellerRoleImg from '../assets/seller_role_visual_hd.png';
import topLeafImg from '../assets/bg_leaf_top_right.png';
import bottomLeafImg from '../assets/bg_leaf_bottom_left.png';
import '../styles/RoleSelectPage.css';

export default function RoleSelectPage({ onSelectRole, onBack }) {
  return (
    <div className="role-select-page">
      {/* Decorative Corner Leaf Watermarks */}
      <img 
        src={topLeafImg} 
        alt="" 
        className="role-decor-leaf-top-right" 
        aria-hidden="true" 
      />
      <img 
        src={bottomLeafImg} 
        alt="" 
        className="role-decor-leaf-bottom-left" 
        aria-hidden="true" 
      />

      {/* Header Bar */}
      <header className="role-select-header">
        <div className="role-header-left" onClick={onBack}>
          {/* Exact Brand Leaf Mark */}
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
          <span style={{ fontSize: '24px', fontWeight: 800, color: '#0f382c', letterSpacing: '-0.4px' }}>
            ParaliPay
          </span>
        </div>

        <div className="role-header-right">
          <button 
            type="button" 
            className="role-back-link-btn"
            onClick={onBack}
          >
            <ArrowLeft size={16} />
            <span>Back to Home</span>
          </button>

          <button 
            type="button" 
            className="role-header-signin-btn"
            onClick={() => onSelectRole('FARMER')}
          >
            Sign In
          </button>
        </div>
      </header>

      {/* Main Viewport Content */}
      <main className="role-select-main">
        <div className="role-select-wrapper">
          <h1 className="role-select-title">
            Choose how you want to use ParaliPay
          </h1>
          <p className="role-select-subtitle">
            Select your role to continue to the marketplace portal.
          </p>

          {/* Symmetrical Two-Role Cards Grid */}
          <div className="role-cards-grid">
            {/* Card 1: Farmer */}
            <div 
              className="role-card"
              onClick={() => onSelectRole('FARMER')}
            >
              <div className="role-visual-wrapper">
                <img 
                  src={farmerRoleImg} 
                  alt="Farmer holding tablet" 
                  className="role-visual-img" 
                />
              </div>

              <h2 className="role-card-title">Enter as a Farmer</h2>
              <p className="role-card-desc">
                List your crop residue and connect with buyers.
              </p>

              <ul className="role-card-features">
                <li className="role-card-feature-item">
                  <span className="role-feature-check"><Check size={12} strokeWidth={3} /></span>
                  <span>Free paddy stubble tonnage estimation</span>
                </li>
                <li className="role-card-feature-item">
                  <span className="role-feature-check"><Check size={12} strokeWidth={3} /></span>
                  <span>List residue & get discoverable by verified buyers</span>
                </li>
                <li className="role-card-feature-item">
                  <span className="role-feature-check"><Check size={12} strokeWidth={3} /></span>
                  <span>Guaranteed direct payment & transparent pricing</span>
                </li>
              </ul>

              <button 
                type="button" 
                className="role-card-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectRole('FARMER');
                }}
              >
                <span>Enter as Farmer</span>
                <ArrowRight size={18} />
              </button>
            </div>

            {/* Card 2: Buyer */}
            <div 
              className="role-card"
              onClick={() => onSelectRole('BUYER')}
            >
              <div className="role-visual-wrapper">
                <img 
                  src={sellerRoleImg} 
                  alt="Businessman / Buyer holding tablet" 
                  className="role-visual-img" 
                />
              </div>

              <h2 className="role-card-title">Enter as a Buyer</h2>
              <p className="role-card-desc">
                Find crop residue and connect with farmers.
              </p>

              <ul className="role-card-features">
                <li className="role-card-feature-item">
                  <span className="role-feature-check"><Check size={12} strokeWidth={3} /></span>
                  <span>Search active residue listings across all regions</span>
                </li>
                <li className="role-card-feature-item">
                  <span className="role-feature-check"><Check size={12} strokeWidth={3} /></span>
                  <span>Direct contact with nearby verified farmers</span>
                </li>
                <li className="role-card-feature-item">
                  <span className="role-feature-check"><Check size={12} strokeWidth={3} /></span>
                  <span>Reliable seasonal biomass procurement pipeline</span>
                </li>
              </ul>

              <button 
                type="button" 
                className="role-card-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectRole('BUYER');
                }}
              >
                <span>Enter as Buyer</span>
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="role-select-footer">
        <p className="role-select-footer-text">
          &copy; 2026 ParaliPay. Empowering Farmers, Greening the Future. Secure & Verified Platform.
        </p>
      </footer>
    </div>
  );
}
