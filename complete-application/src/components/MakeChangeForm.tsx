'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

// Define currency systems just for the UI display and selection
const currencySystems = {
  USD: {
    symbol: '$',
    name: 'US Dollar',
    coins: {} // Empty as we don't need the coin values client-side anymore
  },
  CAD: {
    symbol: 'C$',
    name: 'Canadian Dollar',
    coins: {}
  },
  GBP: {
    symbol: '£',
    name: 'British Pound',
    coins: {}
  },
  ILS: {
    symbol: '₪',
    name: 'Israeli Shekel',
    coins: {}
  },
  JPY: {
    symbol: '¥',
    name: 'Japanese Yen',
    coins: {}
  },
  AUD: {
    symbol: 'A$',
    name: 'Australian Dollar',
    coins: {}
  }
};

// Available countries for selection
const countries = [
  { code: 'US', name: 'United States' },
  { code: 'CA', name: 'Canada' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
  { code: 'JP', name: 'Japan' },
  { code: 'IL', name: 'Israel' },
  { code: 'AU', name: 'Australia' },
];

export default function MakeChangeForm() {
  const { data: session, status } = useSession();
  const [message, setMessage] = useState('');
  const [amount, setAmount] = useState(0);
  const [currency, setCurrency] = useState('USD');
  const [country, setCountry] = useState('US');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isUnauthorized, setIsUnauthorized] = useState(false);

  useEffect(() => {
    setMessage('');
    setAmount(0);
    setIsUnauthorized(false);
    
    // Initialize country from localStorage if available
    if (typeof window !== 'undefined') {
      const savedCountry = localStorage.getItem('selectedCountry');
      if (savedCountry) {
        setCountry(savedCountry);
      }
    }
  }, []);
  
  // Save country to localStorage when it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('selectedCountry', country);
    }
  }, [country]);

  // Display a message if the user hasn't been synced with Permit.io
  useEffect(() => {
    if (status === 'authenticated' && session && session.userSyncedWithPermit === false) {
      console.warn('User was not successfully synced with Permit.io');
    }
  }, [session, status]);

  const onMakeChange = async (event: any) => {
    event.preventDefault();
    
    if (!session?.user) {
      setMessage('You must be logged in to make change.');
      setIsUnauthorized(true);
      return;
    }
    
    setLoading(true);
    setError(null);
    setIsUnauthorized(false);

    try {
      // Call the server-side API to make change
      const response = await fetch('/api/makechange', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          currency,
          country
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        if (response.status === 403) {
          // Permission denied
          setIsUnauthorized(true);
          setMessage(data.error || 'You are not authorized to make change.');
        } else {
          throw new Error(data.error || 'An error occurred while making change.');
        }
        return;
      }

      // Set the message from the server response
      setMessage(data.message);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      setMessage('There was a problem processing your request.');
    } finally {
      setLoading(false);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <section className="change-section">
        <div style={{ flex: '1' }}>
          <div className="column-container">
            <div className="app-container change-container" style={{ maxWidth: '650px', margin: '0 auto', boxShadow: '0 3px 10px rgba(0,0,0,0.1)', borderRadius: '8px', padding: '25px' }}>
              <h3 style={{ textAlign: 'center', marginTop: '0', color: '#2c3e50', fontSize: '1.8rem', marginBottom: '20px' }}>We Make Change</h3>
              <div className="change-message" style={{ 
                padding: '30px 15px', 
                textAlign: 'center',
                color: '#3498db',
                fontSize: '1.1rem',
                backgroundColor: '#f8f9fa',
                borderRadius: '6px'
              }}>
                <div style={{ marginBottom: '15px' }}>
                  <svg width="40" height="40" viewBox="0 0 24 24" style={{ animation: 'spin 1.5s linear infinite' }}>
                    <style>{`
                      @keyframes spin {
                        from { transform: rotate(0deg); }
                        to { transform: rotate(360deg); }
                      }
                    `}</style>
                    <circle cx="12" cy="12" r="10" stroke="#3498db" strokeWidth="2" fill="none" strokeDasharray="30 10" />
                  </svg>
                </div>
                Processing your request...
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Show error state
  if (error) {
    return (
      <section className="change-section">
        <div style={{ flex: '1' }}>
          <div className="column-container">
            <div className="app-container change-container" style={{ maxWidth: '650px', margin: '0 auto', boxShadow: '0 3px 10px rgba(0,0,0,0.1)', borderRadius: '8px', padding: '25px' }}>
              <h3 style={{ textAlign: 'center', marginTop: '0', color: '#2c3e50', fontSize: '1.8rem', marginBottom: '20px' }}>We Make Change</h3>
              <div className="change-message" style={{ 
                padding: '20px 15px', 
                textAlign: 'center',
                color: '#e74c3c',
                backgroundColor: '#ffebee',
                borderRadius: '6px',
                border: '1px solid #ffcdd2'
              }}>
                <div style={{ marginBottom: '10px', fontSize: '1.5rem' }}>⚠️</div>
                <strong>Error:</strong> {error.message}
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const selectedCurrency = currencySystems[currency as keyof typeof currencySystems];

  return (
    <section className="change-section">
      <div style={{ flex: '1' }}>
        <div className="column-container">
          <div className="app-container change-container" style={{ maxWidth: '650px', margin: '0 auto', boxShadow: '0 3px 10px rgba(0,0,0,0.1)', borderRadius: '8px', padding: '25px' }}>
            <h3 style={{ textAlign: 'center', marginTop: '0', color: '#2c3e50', fontSize: '1.8rem', marginBottom: '20px' }}>We Make Change</h3>
            
            {/* Combined Guidance Section */}
            <div className="user-guide" style={{ 
              marginBottom: '25px', 
              padding: '15px', 
              backgroundColor: '#f5f9fc', 
              borderRadius: '8px', 
              border: '1px solid #e1ecf7',
              fontSize: '0.95rem',
              color: '#2c3e50'
            }}>
              <h4 style={{ marginTop: '0', marginBottom: '12px', color: '#3498db', fontSize: '1.2rem', display: 'flex', alignItems: 'center' }}>
                <span style={{ marginRight: '8px', fontSize: '1.3rem' }}>💡</span>
                How To Use This App
              </h4>
              
              <p style={{ marginBottom: '12px', lineHeight: '1.5' }}>
                This application demonstrates real-time authorization using Permit.io. Follow these steps:
              </p>
              
              <ol style={{ paddingLeft: '25px', margin: '0 0 12px 0', lineHeight: '1.5' }}>
                <li>Select your <strong>location</strong> in the simulator below</li>
                <li>Choose a <strong>currency</strong> from the dropdown</li>
                <li>Enter an <strong>amount</strong> to convert into smaller denominations</li>
                <li>Click <strong>Make Change</strong> to see the results</li>
              </ol>
              
              <div style={{ backgroundColor: '#e8f4fd', padding: '12px', borderRadius: '6px', marginBottom: '12px' }}>
                <p style={{ margin: '0 0 8px 0', fontWeight: '500' }}>Permission Rules:</p>
                <ul style={{ paddingLeft: '20px', margin: '0', lineHeight: '1.5' }}>
                  <li><strong>Members</strong> can make change up to $1000, but only in the same country they are located in</li>
                  <li><strong>Admins</strong> can make change anywhere regardless of location</li>
                </ul>
              </div>
              
              <p style={{ margin: '0', fontStyle: 'italic', color: '#5d6778' }}>
                The policy has been decoupled from the code. Permit.io handles authorization decisions in real-time based on your role and context.
              </p>
            </div>
            
            {status === 'authenticated' && session?.userSyncedWithPermit === false && (
              <div className="change-message" style={{ color: '#e67e22', marginBottom: '15px', padding: '10px', backgroundColor: '#fff3e0', borderRadius: '6px', fontSize: '0.9rem' }}>
                <strong>Warning:</strong> Your user account was not properly synced with our permission system.
              </div>
            )}
            
            {/* Location simulator section */}
            <div className="location-simulator" style={{ marginBottom: '25px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '6px', border: '1px solid #e9ecef' }}>
              <h4 style={{ marginTop: '0', marginBottom: '10px', color: '#2c3e50', fontSize: '1.1rem' }}>
                <span style={{ marginRight: '8px' }}>📍</span>
                Location Simulator
              </h4>
              <p style={{ fontSize: '0.9rem', marginBottom: '12px', color: '#5d6778' }}>
                This simulates your physical location for permission checking.
              </p>
              <div className="form-group" style={{ marginBottom: '0' }}>
                <label htmlFor="country-select" style={{ fontWeight: '500', marginRight: '10px', color: '#2c3e50' }}>Your Location: </label>
                <select
                  id="country-select"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="country-select"
                  style={{ padding: '8px 12px', borderRadius: '4px', border: '1px solid #cfd8dc', backgroundColor: 'white', width: '200px', fontSize: '0.95rem' }}
                >
                  {countries.map((countryInfo) => (
                    <option key={countryInfo.code} value={countryInfo.code}>
                      {countryInfo.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="change-message" style={{ 
              color: isUnauthorized ? '#e74c3c' : '#2ecc71', 
              marginBottom: '20px', 
              padding: message ? '12px' : '0', 
              backgroundColor: message ? (isUnauthorized ? '#ffebee' : '#e8f5e9') : 'transparent',
              borderRadius: '6px',
              textAlign: 'center',
              fontWeight: message ? '500' : 'normal',
              minHeight: message ? 'auto' : '0'
            }}>
              {message}
            </div>
            
            <form onSubmit={onMakeChange} style={{ backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '6px', border: '1px solid #e9ecef' }}>
              <div className="form-group" style={{ marginBottom: '15px' }}>
                <label htmlFor="currency-select" style={{ fontWeight: '500', marginRight: '10px', color: '#2c3e50', display: 'block', marginBottom: '8px' }}>Currency: </label>
                <select
                  id="currency-select"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="currency-select"
                  style={{ padding: '10px 12px', borderRadius: '4px', border: '1px solid #cfd8dc', backgroundColor: 'white', width: '100%', fontSize: '0.95rem' }}
                >
                  {Object.entries(currencySystems).map(([code, currencyInfo]) => (
                    <option key={code} value={code}>
                      {currencyInfo.symbol} - {currencyInfo.name}
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <div style={{ flexGrow: '1', minWidth: '200px' }}>
                  <div className="change-label" style={{ fontWeight: '500', marginBottom: '8px', color: '#2c3e50' }}>Amount in {selectedCurrency.name}: {selectedCurrency.symbol}</div>
                  <input
                    className="change-input"
                    type="number"
                    step={currency === 'JPY' ? 1 : currency === 'ILS' ? 0.1 : 0.01}
                    min={0}
                    name="amount"
                    value={amount}
                    onChange={(e) => setAmount(+e.target.value)}
                    style={{ padding: '10px 12px', borderRadius: '4px', border: '1px solid #cfd8dc', width: '100%', fontSize: '0.95rem' }}
                  />
                </div>
                <div style={{ marginTop: '24px' }}>
                  <input
                    className="change-submit"
                    type="submit"
                    value="Make Change"
                    style={{ 
                      padding: '10px 20px', 
                      backgroundColor: '#3498db', 
                      color: 'white', 
                      border: 'none', 
                      borderRadius: '4px', 
                      cursor: 'pointer',
                      fontWeight: '500',
                      fontSize: '0.95rem',
                      transition: 'background-color 0.2s' 
                    }}
                    onMouseOver={(e) => (e.target as HTMLInputElement).style.backgroundColor = '#2980b9'}
                    onMouseOut={(e) => (e.target as HTMLInputElement).style.backgroundColor = '#3498db'}
                  />
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
