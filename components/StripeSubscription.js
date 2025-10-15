import React, { useState } from 'react';

const StripeSubscription = ({ isPremium, setIsPremium }) => {
  const [loading, setLoading] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');

  // Placeholder Stripe subscription logic
  const handleSubscribe = async () => {
    if (!cardNumber || !expiry || !cvv) {
      alert('Please fill in all payment details');
      return;
    }

    setLoading(true);

    // Simulate API call to Stripe
    // In production, this would integrate with Stripe API:
    // const stripe = await loadStripe('your-publishable-key');
    // const { error } = await stripe.confirmCardPayment(clientSecret, {...});
    
    setTimeout(() => {
      setLoading(false);
      setIsPremium(true);
      setShowPaymentForm(false);
      alert('Subscription successful! You are now a Premium member.');
      // Reset form
      setCardNumber('');
      setExpiry('');
      setCvv('');
    }, 2000);
  };

  const handleCancel = () => {
    if (window.confirm('Are you sure you want to cancel your Premium subscription?')) {
      setIsPremium(false);
      alert('Subscription cancelled. You will retain Premium features until the end of your billing period.');
    }
  };

  if (isPremium) {
    return (
      <div style={{ padding: '20px' }}>
        <div
          style={{
            padding: '20px',
            backgroundColor: '#d4edda',
            border: '1px solid #c3e6cb',
            borderRadius: '8px',
            marginBottom: '15px'
          }}
        >
          <h3 style={{ margin: '0 0 10px 0', color: '#155724' }}>✓ Premium Active</h3>
          <p style={{ margin: 0, color: '#155724' }}>
            You have access to all premium features including unlimited assignments and custom timer durations.
          </p>
        </div>

        <div style={{ padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
          <h4 style={{ margin: '0 0 10px 0' }}>Subscription Details</h4>
          <p style={{ margin: '5px 0', color: '#666' }}>Plan: Premium Monthly</p>
          <p style={{ margin: '5px 0', color: '#666' }}>Price: $9.99/month</p>
          <p style={{ margin: '5px 0', color: '#666' }}>Status: Active</p>
          <p style={{ margin: '5px 0', color: '#666' }}>Next billing: {new Date(Date.now() + 30*24*60*60*1000).toLocaleDateString()}</p>
        </div>

        <button
          onClick={handleCancel}
          style={{
            marginTop: '15px',
            padding: '10px 20px',
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          Cancel Subscription
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <div
        style={{
          padding: '20px',
          backgroundColor: '#fff3cd',
          border: '1px solid #ffeaa7',
          borderRadius: '8px',
          marginBottom: '20px'
        }}
      >
        <h3 style={{ margin: '0 0 10px 0', color: '#856404' }}>Upgrade to Premium</h3>
        <p style={{ margin: 0, color: '#856404' }}>
          Unlock unlimited assignments, custom timer durations, and priority support!
        </p>
      </div>

      <div style={{ padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px', marginBottom: '20px' }}>
        <h4 style={{ margin: '0 0 15px 0' }}>Premium Features:</h4>
        <ul style={{ margin: 0, paddingLeft: '20px' }}>
          <li style={{ marginBottom: '8px' }}>Unlimited assignments tracking</li>
          <li style={{ marginBottom: '8px' }}>Custom Pomodoro timer durations (45min, 60min, etc.)</li>
          <li style={{ marginBottom: '8px' }}>Priority customer support</li>
          <li style={{ marginBottom: '8px' }}>Advanced analytics (coming soon)</li>
          <li style={{ marginBottom: '8px' }}>Ad-free experience</li>
        </ul>
      </div>

      {!showPaymentForm ? (
        <button
          onClick={() => setShowPaymentForm(true)}
          style={{
            padding: '12px 30px',
            backgroundColor: '#667eea',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: 'bold'
          }}
        >
          Subscribe for $9.99/month
        </button>
      ) : (
        <div style={{ padding: '20px', backgroundColor: 'white', border: '1px solid #ddd', borderRadius: '8px' }}>
          <h4 style={{ margin: '0 0 15px 0' }}>Payment Details</h4>
          <p style={{ fontSize: '12px', color: '#999', marginBottom: '15px' }}>
            (Placeholder form - In production, use Stripe Elements for secure payment processing)
          </p>
          
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: '500' }}>
              Card Number
            </label>
            <input
              type="text"
              placeholder="1234 5678 9012 3456"
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value)}
              maxLength="19"
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ccc',
                borderRadius: '5px',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: '500' }}>
                Expiry (MM/YY)
              </label>
              <input
                type="text"
                placeholder="12/25"
                value={expiry}
                onChange={(e) => setExpiry(e.target.value)}
                maxLength="5"
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ccc',
                  borderRadius: '5px',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: '500' }}>
                CVV
              </label>
              <input
                type="text"
                placeholder="123"
                value={cvv}
                onChange={(e) => setCvv(e.target.value)}
                maxLength="4"
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ccc',
                  borderRadius: '5px',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={handleSubscribe}
              disabled={loading}
              style={{
                flex: 1,
                padding: '12px',
                backgroundColor: loading ? '#ccc' : '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: 'bold'
              }}
            >
              {loading ? 'Processing...' : 'Complete Subscription'}
            </button>
            <button
              onClick={() => setShowPaymentForm(false)}
              disabled={loading}
              style={{
                flex: 1,
                padding: '12px',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Cancel
            </button>
          </div>

          <p style={{ fontSize: '11px', color: '#999', marginTop: '15px', textAlign: 'center' }}>
            🔒 Secure payment powered by Stripe (placeholder)
          </p>
        </div>
      )}
    </div>
  );
};

export default StripeSubscription;
