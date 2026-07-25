import { useState } from 'react';
import axios from 'axios';
import './LandingPage.css';

const LandingPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    budget_range: '',
    source: '',
    message: ''
  });
  const [status, setStatus] = useState('idle'); // idle, submitting, success, error
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('submitting');
    setErrorMessage('');

    try {
      await axios.post('http://localhost:5000/api/leads', formData);
      setStatus('success');
      setFormData({ name: '', email: '', budget_range: '', source: '', message: '' });
    } catch (error) {
      setStatus('error');
      setErrorMessage(error.response?.data?.errors?.[0]?.message || 'Failed to submit form. Please try again.');
    }
  };

  return (
    <div className="landing-container">
      {/* Background decoration */}
      <div className="bg-shape shape-1"></div>
      <div className="bg-shape shape-2"></div>

      <div className="hero-section animate-fade-in">
        <h1 className="title">
          Grow Your Business with <span className="highlight">Digital Heroes</span>
        </h1>
        <p className="subtitle">
          We help visionary e-commerce brands scale through exceptional design and Shopify development. Let's build your next big thing.
        </p>
      </div>

      <div className="form-section animate-fade-in" style={{ animationDelay: '0.2s' }}>
        <div className="glass-panel form-container">
          <h2>Start Your Project</h2>
          
          {status === 'success' ? (
            <div className="success-message">
              <div className="success-icon">✓</div>
              <h3>Thank You!</h3>
              <p>We've received your request and will be in touch shortly.</p>
              <button className="btn-secondary" onClick={() => setStatus('idle')}>Submit another request</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="lead-form">
              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <input 
                  type="text" 
                  id="name" 
                  name="name" 
                  required 
                  placeholder="Jane Doe"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input 
                  type="email" 
                  id="email" 
                  name="email" 
                  required 
                  placeholder="jane@example.com"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="budget_range">Budget Range</label>
                <select 
                  id="budget_range" 
                  name="budget_range" 
                  required
                  value={formData.budget_range}
                  onChange={handleChange}
                >
                  <option value="" disabled>Select your budget</option>
                  <option value="<$5k">Less than $5,000</option>
                  <option value="$5k-$10k">$5,000 - $10,000</option>
                  <option value="$10k-$25k">$10,000 - $25,000</option>
                  <option value="$25k+">$25,000+</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="source">How did you hear about us?</label>
                <select 
                  id="source" 
                  name="source" 
                  required
                  value={formData.source}
                  onChange={handleChange}
                >
                  <option value="" disabled>Please select one</option>
                  <option value="Google Search">Google Search</option>
                  <option value="Social Media">Social Media</option>
                  <option value="Friend/Referral">Friend / Referral</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="message">Project Details</label>
                <textarea 
                  id="message" 
                  name="message" 
                  required 
                  rows="4" 
                  placeholder="Tell us about your goals..."
                  value={formData.message}
                  onChange={handleChange}
                ></textarea>
              </div>

              {status === 'error' && <p className="error-text">{errorMessage}</p>}

              <button 
                type="submit" 
                className="btn-primary submit-btn" 
                disabled={status === 'submitting'}
              >
                {status === 'submitting' ? 'Sending...' : 'Request Consultation'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
