import React, { useState } from 'react';
import { Printer, Lock, Menu, X, Database } from 'lucide-react';
import { isFirebaseConfigured } from '../firebase';

export default function Header({ currentView, setCurrentView, onNavigate }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (view, sectionId) => {
    setMobileMenuOpen(false);
    setCurrentView(view);
    if (sectionId) {
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  };

  return (
    <header>
      <div className="container header-container">
        <div className="logo" onClick={() => handleNavClick('home')}>
          <Printer size={28} className="logo-icon" strokeWidth={2.5} />
          <span>LOVELY PRINTS</span>
        </div>

        {/* Desktop Navigation */}
        <nav className="nav-links">
          <span 
            className={`nav-link ${currentView === 'home' ? 'active' : ''}`}
            onClick={() => handleNavClick('home')}
          >
            Home
          </span>
          <span 
            className="nav-link"
            onClick={() => handleNavClick('home', 'services')}
          >
            Services
          </span>
          <span 
            className="nav-link"
            onClick={() => handleNavClick('home', 'contact')}
          >
            Contact
          </span>
          
          <button 
            className={`btn-admin ${currentView === 'admin' ? 'active' : ''}`}
            onClick={() => handleNavClick('admin')}
          >
            {currentView === 'admin' ? (
              <>
                <Database size={16} />
                Dashboard
              </>
            ) : (
              <>
                <Lock size={16} />
                Admin Panel
              </>
            )}
          </button>
        </nav>

        {/* Mobile Navigation Toggle */}
        <button 
          className="mobile-nav-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <nav className="nav-links mobile-open">
            <span 
              className={`nav-link ${currentView === 'home' ? 'active' : ''}`}
              onClick={() => handleNavClick('home')}
            >
              Home
            </span>
            <span 
              className="nav-link"
              onClick={() => handleNavClick('home', 'services')}
            >
              Services
            </span>
            <span 
              className="nav-link"
              onClick={() => handleNavClick('home', 'contact')}
            >
              Contact
            </span>
            
            <button 
              className="btn-admin"
              onClick={() => handleNavClick('admin')}
              style={{ width: '100%', justifyContent: 'center' }}
            >
              {currentView === 'admin' ? (
                <>
                  <Database size={16} />
                  Dashboard
                </>
              ) : (
                <>
                  <Lock size={16} />
                  Admin Panel
                </>
              )}
            </button>
          </nav>
        )}
      </div>
    </header>
  );
}
