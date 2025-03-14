import { getServerSession } from 'next-auth';
import Image from 'next/image';
import { authOptions } from '../api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import { checkUserPermission } from '../../utils/server-permit';
import AccountActions from '../../components/AccountActions';

export default async function Account() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/');
  }

  // Check if the user is allowed to view the account balance
  const canViewBalance = await checkUserPermission('view', 'balance');

  return (
    <section>
      <div style={{ flex: '1' }}>
        <div className="column-container">
          <div className="app-container">
            <h3>Your Account</h3>
            
            {canViewBalance ? (
              <>
                <h4>Your Balance</h4>
                <div className="balance">$1,250.00</div>
              </>
            ) : (
              <div className="permission-denied" style={{ color: 'red' }}>
                You do not have permission to view your account balance.
              </div>
            )}

            <div className="account-info">
              <h4>Account Information</h4>
              <p>Email: {session.user.email}</p>
              <p>User ID: {session.user.id}</p>
            </div>

            <hr style={{ margin: '20px 0', border: '0', borderTop: '1px solid #eee' }} />
            
            {/* Client-side component with permission check */}
            <AccountActions />
          </div>
        </div>
      </div>
    </section>
  );
}
