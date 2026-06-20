import React from 'react';
import { Phone, MessageSquare, Mail, MapPin } from 'lucide-react';

export default function ContactSection() {
  const whatsappNumber = "919600372130"; // Country code 91 for India + 9600372130
  const normalPhone = "+919600372130";
  const emailAddress = "VENKADESHG5509@GMAIL.COM";
  const physicalAddress = "Lovely Prints, Main Bazar Road, Salem, Tamil Nadu - 636001";

  const getWhatsAppLink = (message) => {
    return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
  };

  return (
    <section id="contact" className="contact-section">
      <div className="container">
        <div className="section-header">
          <span className="badge" style={{ marginBottom: '1rem' }}>Get in Touch</span>
          <h2 className="section-title">Contact Us</h2>
          <p className="section-desc">
            Have questions about pricing, bulk orders, or custom designs? Reach out to us via any channel 
            below, or click the WhatsApp button to chat instantly.
          </p>
        </div>

        <div className="contact-grid">
          {/* Left Cards */}
          <div className="contact-info-cards">
            {/* Phone */}
            <div className="contact-card">
              <div className="contact-icon-wrapper">
                <Phone size={24} />
              </div>
              <h3 className="contact-card-title">Call Us</h3>
              <a href={`tel:${normalPhone}`} className="contact-card-detail">
                {normalPhone}
              </a>
            </div>

            {/* WhatsApp */}
            <div className="contact-card">
              <div className="contact-icon-wrapper" style={{ color: '#25d366' }}>
                <MessageSquare size={24} />
              </div>
              <h3 className="contact-card-title">WhatsApp</h3>
              <a 
                href={getWhatsAppLink("Hello Lovely Prints, I have an enquiry regarding your printing services.")} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="contact-card-detail"
              >
                +91 96003 72130
              </a>
            </div>

            {/* Email */}
            <div className="contact-card">
              <div className="contact-icon-wrapper">
                <Mail size={24} />
              </div>
              <h3 className="contact-card-title">Email Us</h3>
              <a href={`mailto:${emailAddress}`} className="contact-card-detail">
                {emailAddress.toLowerCase()}
              </a>
            </div>

            {/* Address */}
            <div className="contact-card">
              <div className="contact-icon-wrapper">
                <MapPin size={24} />
              </div>
              <h3 className="contact-card-title">Our Shop</h3>
              <p className="contact-card-detail" style={{ lineHeight: '1.4' }}>
                {physicalAddress}
              </p>
            </div>
          </div>

          {/* Right Direct CTA Box */}
          <div className="contact-cta-wrapper">
            <h3 className="contact-cta-title">Direct Inquiry</h3>
            <p className="contact-cta-desc">
              Send us your requirements, design size, quantity, and reference images. We will give you a custom quote in minutes.
            </p>
            <a 
              href={getWhatsAppLink("Hi Lovely Prints! I would like to get a quote for a custom printing job.")}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-whatsapp-large"
            >
              <MessageSquare size={22} fill="white" />
              Chat on WhatsApp
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
