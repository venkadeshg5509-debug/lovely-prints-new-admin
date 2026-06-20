import React, { useState } from 'react';
import { ArrowLeft, MessageSquare, X } from 'lucide-react';

export default function CategoryView({ category, products, onBack }) {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const whatsappNumber = "919600372130";

  const getWhatsAppProductLink = (productName) => {
    const text = `Hi Lovely Prints! I am interested in "${productName}" under the "${category.name}" category. Can you please share price and order details?`;
    return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(text)}`;
  };

  const handleEnquiryClick = (e, productName) => {
    e.stopPropagation(); // Prevent opening modal when clicking button
    const url = getWhatsAppProductLink(productName);
    window.open(url, '_blank');
  };

  return (
    <div>
      {/* Back Banner */}
      <div className="back-banner">
        <div className="container">
          <button className="back-btn" onClick={onBack}>
            <ArrowLeft size={18} />
            Back to Home Page
          </button>
        </div>
      </div>

      {/* Category Header */}
      <div className="category-header">
        <div className="container category-info-grid">
          <div>
            <span className="badge" style={{ marginBottom: '1rem' }}>Category</span>
            <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: 'var(--primary-dark)' }}>{category.name}</h1>
            <p style={{ color: 'var(--text-main)', fontSize: '1.1rem', lineHeight: '1.6' }}>{category.description}</p>
          </div>
          <div>
            <img 
              src={category.imageUrl} 
              alt={category.name} 
              className="category-banner-img"
            />
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="container">
        {products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '6rem 0', color: 'var(--text-muted)' }}>
            <h3>No products found in this category yet.</h3>
            <p style={{ marginTop: '0.5rem' }}>Check back later or contact us for custom orders.</p>
          </div>
        ) : (
          <div className="products-grid">
            {products.map((product) => (
              <div 
                key={product.id} 
                className="product-card"
                onClick={() => setSelectedProduct(product)}
              >
                <div className="product-img-wrapper">
                  <img 
                    src={product.imageUrl} 
                    alt={product.name} 
                    className="product-img"
                    loading="lazy"
                  />
                </div>
                <div className="product-info">
                  <h3 className="product-name">{product.name}</h3>
                  <span className="product-price">{product.price || 'Contact for price'}</span>
                  <p className="product-desc-short">{product.description}</p>
                  
                  <button 
                    className="product-enquiry-btn"
                    onClick={(e) => handleEnquiryClick(e, product.name)}
                  >
                    <MessageSquare size={16} fill="white" />
                    Enquire on WhatsApp
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <div className="modal-overlay" onClick={() => setSelectedProduct(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedProduct(null)}>
              <X size={20} />
            </button>
            <div className="modal-grid">
              <div className="modal-img-container">
                <img 
                  src={selectedProduct.imageUrl} 
                  alt={selectedProduct.name} 
                />
              </div>
              <div className="modal-body">
                <span className="modal-category">{category.name}</span>
                <h2 className="modal-title">{selectedProduct.name}</h2>
                <div className="modal-price">{selectedProduct.price || 'Contact for price'}</div>
                <p className="modal-desc">{selectedProduct.description}</p>
                <div className="modal-actions">
                  <a 
                    href={getWhatsAppProductLink(selectedProduct.name)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-whatsapp-large"
                  >
                    <MessageSquare size={20} fill="white" />
                    Send WhatsApp Enquiry
                  </a>
                  <button 
                    className="btn-secondary" 
                    onClick={() => setSelectedProduct(null)}
                    style={{ justifyContent: 'center' }}
                  >
                    Close Window
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
