import React from 'react';
import { ArrowRight, MessageSquare } from 'lucide-react';

export default function Hero({ onExploreClick, onContactClick }) {
  return (
    <section className="hero">
      <div className="container hero-grid">
        <div className="hero-content">
          <span className="badge">Premium Printing Services</span>
          <h1 className="hero-title">
            Your Vision, Printed Perfectly at <span>LOVELY PRINTS</span>
          </h1>
          <p className="hero-desc">
            We deliver top-quality custom printing for invitation cards, paper notices, 
            professional business cards, customized shopping bags, and premium screen-printed t-shirts. 
            Designed to elevate your brand and celebrations.
          </p>
          <div className="hero-ctas">
            <button className="btn-primary" onClick={onExploreClick}>
              Explore Services
              <ArrowRight size={18} />
            </button>
            <button className="btn-secondary" onClick={onContactClick}>
              <MessageSquare size={18} />
              Enquire Now
            </button>
          </div>
        </div>
        <div className="hero-image-wrapper">
          <div className="hero-image-backdrop"></div>
          <img 
            src="/hero.png" 
            alt="Lovely Prints custom wedding invites, business cards, t-shirts, and paper bags mockup" 
            className="hero-image"
          />
        </div>
      </div>
    </section>
  );
}
