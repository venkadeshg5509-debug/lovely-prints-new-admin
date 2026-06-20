import React from 'react';
import { ArrowRight } from 'lucide-react';

export default function ServicesGrid({ categories, onCategorySelect }) {
  return (
    <section id="services" style={{ backgroundColor: 'var(--white)' }}>
      <div className="container">
        <div className="section-header">
          <span className="badge" style={{ marginBottom: '1rem' }}>Our Specialties</span>
          <h2 className="section-title">Our Printing Services</h2>
          <p className="section-desc">
            Select a category to view all product designs, templates, and printing formats we offer. 
            Click on any item to send a direct WhatsApp enquiry!
          </p>
        </div>

        <div className="services-grid">
          {categories.map((category) => (
            <div key={category.id} className="service-card">
              <div className="service-img-container">
                <img 
                  src={category.imageUrl} 
                  alt={category.name} 
                  className="service-img"
                  loading="lazy"
                />
              </div>
              <div className="service-body">
                <h3 className="service-card-title">{category.name}</h3>
                <p className="service-card-desc">{category.description}</p>
                <div 
                  className="service-btn"
                  onClick={() => onCategorySelect(category.id)}
                >
                  View Designs
                  <ArrowRight size={16} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
