import React, { useState } from 'react';

const StripeSubscription = ({ isPremium, setIsPremium }) => {
  const [loading, setLoading] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');

  // Stripe subscription logic for annual Focal Study Premium subscription
  const handleSubscribe = async () => {
    if (!cardNumber || !expiry || !cvv) {
      alert('Please fill in all payment details');
      return;
    }

    setLoading(true);

    try {
      // Call backend API to create Stripe Checkout session
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: 'user-id-placeholder', // Should come from auth context
          email: 'user@example.com', // Should come from auth context
        }),
      });

      const { url, error } = await response.json();
      
      if (error) {
        alert('Failed to create checkout session: ' + error);
        setLoading(false);
        return;
      }

      // Redirect to Stripe Checkout
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      alert('Failed to create checkout session. Please try again.');
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setShowPaymentForm(false);
    setCardNumber('');
    setExpiry('');
    setCvv('');
  };

  const handleManageBilling = async () => {
    setLoading(true);
    
    try {
      // Call backend API to create Billing Portal session
      const response = await fetch('/api/stripe/create-billing-portal-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerId: 'customer-id-placeholder', // Should come from user's stored Stripe customer ID
        }),
      });

      const { url, error } = await response.json();
      
      if (error) {
        alert('Failed to open billing portal: ' + error);
        setLoading(false);
        return;
      }

      // Redirect to Stripe Billing Portal
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error('Error opening billing portal:', error);
      alert('Failed to open billing portal. Please try again.');
      setLoading(false);
    }
  };

  if (isPremium) {
    return (
      <div>
        <p>✅ You are a <strong>Focal Study Premium</strong> member!</p>
        <p>Annual Subscription Active</p>
        <button 
          onClick={handleManageBilling}
          disabled={loading}
          style={{
            padding: '10px 20px',
            backgroundColor: '#0066cc',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'Loading...' : 'Manage Billing'}
        </button>
      </div>
    );
  }

  if (!showPaymentForm) {
    return (
      <div>
        <h3>Upgrade to Focal Study Premium</h3>
        <p><strong>Annual Subscription</strong></p>
        <ul style={{ textAlign: 'left', marginLeft: '20px' }}>
          <li>Customizable Pomodoro intervals</li>
          <li>Unlimited assignments</li>
          <li>Advanced productivity analytics</li>
          <li>Priority support</li>
          <li>Ad-free experience</li>
        </ul>
        <button 
          onClick={() => setShowPaymentForm(true)}
          style={{
            padding: '10px 20px',
            backgroundColor: '#0066cc',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            marginTop: '10px',
          }}
        >
          Subscribe Now
        </button>
      </div>
    );
  }

  return (
    <div>
      <h3>Focal Study Premium - Annual Subscription</h3>
      <form onSubmit={(e) => { e.preventDefault(); handleSubscribe(); }}>
        <div style={{ marginBottom: '10px' }}>
          <label>
            Card Number:
            <input
              type="text"
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value)}
              placeholder="1234 5678 9012 3456"
              maxLength="19"
              style={{ width: '100%', padding: '5px', marginTop: '5px' }}
            />
          </label>
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label>
            Expiry (MM/YY):
            <input
              type="text"
              value={expiry}
              onChange={(e) => setExpiry(e.target.value)}
              placeholder="12/25"
              maxLength="5"
              style={{ width: '100%', padding: '5px', marginTop: '5px' }}
            />
          </label>
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label>
            CVV:
            <input
              type="text"
              value={cvv}
              onChange={(e) => setCvv(e.target.value)}
              placeholder="123"
              maxLength="4"
              style={{ width: '100%', padding: '5px', marginTop: '5px' }}
            />
          </label>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            type="submit"
            disabled={loading}
            style={{
              padding: '10px 20px',
              backgroundColor: loading ? '#ccc' : '#0066cc',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Processing...' : 'Subscribe'}
          </button>
          <button 
            type="button"
            onClick={handleCancel}
            disabled={loading}
            style={{
              padding: '10px 20px',
              backgroundColor: '#666',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default StripeSubscription;
