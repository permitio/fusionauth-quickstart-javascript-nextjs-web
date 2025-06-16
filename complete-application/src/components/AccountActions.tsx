'use client';

import { useState } from 'react';
import { usePermit } from '../hooks/usePermit';

export default function AccountActions() {
  const [message, setMessage] = useState('');
  const { isAllowed, isLoading, error } = usePermit({
    action: 'manage',
    resource: 'account',
  });

  const handleTransferFunds = () => {
    if (!isAllowed) {
      setMessage('You do not have permission to transfer funds.');
      return;
    }
    setMessage('Funds transfer initiated successfully!');
  };

  const handleCloseAccount = () => {
    if (!isAllowed) {
      setMessage('You do not have permission to close your account.');
      return;
    }
    setMessage('Account closure request submitted.');
  };

  if (isLoading) {
    return <div>Loading account actions...</div>;
  }

  if (error) {
    return <div style={{ color: 'red' }}>Error checking permissions: {error.message}</div>;
  }

  return (
    <div className="account-actions">
      <h4>Account Actions</h4>
      
      {!isAllowed && (
        <div style={{ color: 'red', marginBottom: '10px' }}>
          You do not have permission to manage this account.
        </div>
      )}
      
      {message && (
        <div className="action-message" style={{ marginBottom: '10px' }}>
          {message}
        </div>
      )}
      
      <div className="action-buttons">
        <button 
          onClick={handleTransferFunds} 
          disabled={!isAllowed}
          className="action-button"
          style={{ 
            marginRight: '10px', 
            padding: '8px 16px',
            backgroundColor: isAllowed ? '#4CAF50' : '#cccccc',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isAllowed ? 'pointer' : 'not-allowed'
          }}
        >
          Transfer Funds
        </button>
        
        <button 
          onClick={handleCloseAccount} 
          disabled={!isAllowed}
          className="action-button"
          style={{ 
            padding: '8px 16px',
            backgroundColor: isAllowed ? '#f44336' : '#cccccc',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isAllowed ? 'pointer' : 'not-allowed'
          }}
        >
          Close Account
        </button>
      </div>
    </div>
  );
} 