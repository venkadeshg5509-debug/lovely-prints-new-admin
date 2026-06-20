import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import ServicesGrid from './components/ServicesGrid';
import CategoryView from './components/CategoryView';
import ContactSection from './components/ContactSection';
import AdminPanel from './components/AdminPanel';
import { 
  getStoredCategories, 
  getStoredProducts, 
  saveStoredCategory, 
  deleteStoredCategory, 
  saveStoredProduct, 
  deleteStoredProduct,
  isFirebaseConfigured
} from './firebase';
import { Printer, Mail, Phone, MapPin, ArrowRight } from 'lucide-react';

export default function App() {
  const [currentView, setCurrentView] = useState('home'); // 'home' | 'category' | 'admin'
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load database items on mount
  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        const fetchedCats = await getStoredCategories();
        const fetchedProds = await getStoredProducts();
        setCategories(fetchedCats);
        setProducts(fetchedProds);
      } catch (err) {
        console.error("Error loading application data:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const handleCategorySelect = (categoryId) => {
    setSelectedCategoryId(categoryId);
    setCurrentView('category');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToHome = () => {
    setCurrentView('home');
    setSelectedCategoryId(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // --- CRUD triggers ---
  const handleSaveCategory = async (newCat) => {
    await saveStoredCategory(newCat);
    const updated = await getStoredCategories();
    setCategories(updated);
  };

  const handleDeleteCategory = async (catId) => {
    await deleteStoredCategory(catId);
    const updatedCats = await getStoredCategories();
    const updatedProds = await getStoredProducts();
    setCategories(updatedCats);
    setProducts(updatedProds);
  };

  const handleSaveProduct = async (newProd) => {
    await saveStoredProduct(newProd);
    const updated = await getStoredProducts();
    setProducts(updated);
  };

  const handleDeleteProduct = async (prodId) => {
    await deleteStoredProduct(prodId);
    const updated = await getStoredProducts();
    setProducts(updated);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header currentView={currentView} setCurrentView={setCurrentView} />

      {isLoading ? (
        <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px', gap: '1rem' }}>
          <div style={{ width: '40px', height: '40px', border: '4px solid var(--primary-light)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} className="spinner"></div>
          <p style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Loading Lovely Prints...</p>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      ) : (
        <main style={{ flexGrow: 1 }}>
          {currentView === 'home' && (
            <>
              <Hero 
                onExploreClick={() => {
                  const el = document.getElementById('services');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }} 
                onContactClick={() => {
                  const el = document.getElementById('contact');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
              />
              
              <ServicesGrid 
                categories={categories} 
                onCategorySelect={handleCategorySelect} 
              />

              {/* About Us section */}
              <section id="about" style={{ backgroundColor: 'var(--gray-light)', borderTop: '1px solid rgba(124, 58, 237, 0.05)' }}>
                <div className="container" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center' }}>
                  <div>
                    <span className="badge">Our Journey</span>
                    <h2 className="section-title" style={{ textAlign: 'left', marginBottom: '1.5rem' }}>About LOVELY PRINTS</h2>
                    <p style={{ color: 'var(--text-main)', fontSize: '1.05rem', lineHeight: '1.6', marginBottom: '1rem' }}>
                      At Lovely Prints, we believe that premium printing shouldn't be complicated. We specialize in bringing design concepts to life on high-quality wedding and invitation cards, business visiting cards, packaging bags, flyers, and custom apparel prints.
                    </p>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '2rem' }}>
                      Operating with the latest offset and screen-printing technologies, we cater to bulk orders, business houses, event planners, and retail customers. Every printing project undergoes detailed quality checks to ensure color accuracy, sharp typography, and durable paper/material quality.
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                      <div style={{ borderLeft: '3px solid var(--primary)', paddingLeft: '1rem' }}>
                        <h4 style={{ fontSize: '1.5rem', color: 'var(--primary-dark)' }}>100%</h4>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Customer Satisfaction</p>
                      </div>
                      <div style={{ borderLeft: '3px solid var(--primary)', paddingLeft: '1rem' }}>
                        <h4 style={{ fontSize: '1.5rem', color: 'var(--primary-dark)' }}>Fast</h4>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>WhatsApp Quotes & Delivery</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Decorative showcase */}
                  <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
                    <div style={{ width: '100%', maxWidth: '400px', height: '300px', backgroundColor: 'var(--white)', border: '1px solid var(--primary-soft)', borderRadius: 'var(--radius-lg)', padding: '2rem', boxShadow: 'var(--shadow-lg)', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '1.25rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center' }}>
                          <Printer size={20} />
                        </div>
                        <div>
                          <h4 style={{ fontWeight: 600 }}>Precision Printing</h4>
                          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>High-definition details & gold foiling</p>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center' }}>
                          <Mail size={20} />
                        </div>
                        <div>
                          <h4 style={{ fontWeight: 600 }}>Elegant Envelopes</h4>
                          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Custom sizes, textures & colors</p>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center' }}>
                          <MapPin size={20} />
                        </div>
                        <div>
                          <h4 style={{ fontWeight: 600 }}>Local & Nationwide Shipping</h4>
                          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Safe packaging and prompt delivery</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <ContactSection />
            </>
          )}

          {currentView === 'category' && (
            <CategoryView 
              category={categories.find(c => c.id === selectedCategoryId)}
              products={products.filter(p => p.categoryId === selectedCategoryId)}
              onBack={handleBackToHome}
            />
          )}

          {currentView === 'admin' && (
            <AdminPanel 
              categories={categories}
              products={products}
              onSaveCategory={handleSaveCategory}
              onDeleteCategory={handleDeleteCategory}
              onSaveProduct={handleSaveProduct}
              onDeleteProduct={handleDeleteProduct}
            />
          )}
        </main>
      )}

      {/* Footer */}
      <footer>
        <div className="container footer-grid">
          <div>
            <div className="footer-logo">
              <Printer size={24} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
              LOVELY<span> PRINTS</span>
            </div>
            <p className="footer-desc">
              Your one-stop destination for business invitations, notices, visiting cards, bags, and apparel printing.
            </p>
          </div>
          <div>
            <h4 className="footer-title">Our Services</h4>
            <ul className="footer-links">
              {categories.map((c) => (
                <li key={c.id}>
                  <a href="#services" onClick={(e) => { e.preventDefault(); handleCategorySelect(c.id); }}>
                    {c.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="footer-title">Contact Info</h4>
            <ul className="footer-links" style={{ color: '#9ca3af', fontSize: '0.9rem' }}>
              <li style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <Phone size={14} />
                +91 96003 72130
              </li>
              <li style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <Mail size={14} />
                venkadeshg5509@gmail.com
              </li>
              <li style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                <MapPin size={14} style={{ marginTop: '0.2rem', flexShrink: 0 }} />
                Main Bazar Road, Salem, Tamil Nadu, 636001
              </li>
            </ul>
          </div>
        </div>
        <div className="container footer-bottom">
          <p>© {new Date().getFullYear()} Lovely Prints. All Rights Reserved. Developed by Venkadesh.</p>
        </div>
      </footer>
    </div>
  );
}
