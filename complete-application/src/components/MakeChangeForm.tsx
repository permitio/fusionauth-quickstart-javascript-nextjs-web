'use client';

import { useEffect, useState } from 'react';
import { usePermit } from '../hooks/usePermit';
import { useSession } from 'next-auth/react';

var coins = {
  quarters: 0.25,
  dimes: 0.1,
  nickels: 0.05,
  pennies: 0.01,
};

export default function MakeChangeForm() {
  const { data: session, status } = useSession();
  const [message, setMessage] = useState('');
  const [amount, setAmount] = useState(0);
  const { isAllowed, isLoading, error } = usePermit({
    action: 'make',
    resource: 'change',
  });

  useEffect(() => {
    setMessage('');
    setAmount(0);
  }, []);

  // Display a message if the user hasn't been synced with Permit.io
  useEffect(() => {
    if (status === 'authenticated' && session && session.userSyncedWithPermit === false) {
      console.warn('User was not successfully synced with Permit.io');
    }
  }, [session, status]);

  const onMakeChange = (event: any) => {
    event.preventDefault();

    // Check if user is allowed to make change
    if (!isAllowed) {
      setMessage('You are not authorized to make change.');
      return;
    }

    try {
      // Convert amount to cents to avoid floating point issues
      let remainingCents = Math.round(amount * 100);
      const changeResults = [];

      // Calculate the number of each coin
      for (const [name, nominal] of Object.entries(coins)) {
        // Convert nominal to cents
        const nominalCents = Math.round(nominal * 100);
        // Calculate how many of this coin we need
        const count = Math.floor(remainingCents / nominalCents);
        // Update remaining amount
        remainingCents = remainingCents % nominalCents;
        
        // Only add to results if we have at least one of this coin
        if (count > 0) {
          changeResults.push(`${count} ${name}`);
        }
      }

      // Check if we have any remaining cents (should be 0 if logic is correct)
      if (remainingCents > 0) {
        console.warn(`Unexpected remaining cents: ${remainingCents}`);
      }

      // Format the message
      if (changeResults.length === 0) {
        setMessage('No change needed for $0.00');
      } else {
        const formattedAmount = amount.toFixed(2);
        setMessage(`We can make change for $${formattedAmount} with: ${changeResults.join(', ')}`);
      }
    } catch (ex: any) {
      setMessage(
        `There was a problem converting the amount submitted. ${ex.message}`
      );
    }
  };

  // Show loading state while checking permissions
  if (isLoading) {
    return (
      <section>
        <div style={{ flex: '1' }}>
          <div className="column-container">
            <div className="app-container change-container">
              <h3>We Make Change</h3>
              <div className="change-message">Checking permissions...</div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Show error state if permission check failed
  if (error) {
    return (
      <section>
        <div style={{ flex: '1' }}>
          <div className="column-container">
            <div className="app-container change-container">
              <h3>We Make Change</h3>
              <div className="change-message">Error checking permissions: {error.message}</div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section>
      <div style={{ flex: '1' }}>
        <div className="column-container">
          <div className="app-container change-container">
            <h3>We Make Change</h3>
            {status === 'authenticated' && session?.userSyncedWithPermit === false && (
              <div className="change-message" style={{ color: 'orange' }}>
                Warning: Your user account was not properly synced with our permission system.
              </div>
            )}
            {!isAllowed && (
              <div className="change-message" style={{ color: 'red' }}>
                You do not have permission to make change.
              </div>
            )}
            <div className="change-message">{message}</div>
            <form onSubmit={onMakeChange}>
              <div className="h-row">
                <div className="change-label">Amount in USD: $</div>
                <input
                  className="change-input"
                  type="number"
                  step={0.01}
                  name="amount"
                  value={amount}
                  onChange={(e) => setAmount(+e.target.value)}
                  disabled={!isAllowed}
                />
                <input
                  className="change-submit"
                  type="submit"
                  value="Make Change"
                  disabled={!isAllowed}
                />
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
