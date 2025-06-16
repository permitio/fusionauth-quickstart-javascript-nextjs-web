import { getServerSession } from 'next-auth/next'
import { authOptions } from '../api/auth/[...nextauth]/route'

async function DebugPage() {
  const session = await getServerSession(authOptions)
  
  // If not logged in
  if (!session) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Debug Page</h1>
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4">
          <p>You need to be logged in to view debug information.</p>
        </div>
        <a href="/api/auth/signin" className="text-blue-500 hover:underline">
          Sign in
        </a>
      </div>
    )
  }
  
  // Parse JWT if available
  let jwtData = null
  if (session.accessToken) {
    try {
      const parts = session.accessToken.split('.')
      if (parts.length === 3) {
        const payload = Buffer.from(parts[1], 'base64').toString()
        jwtData = JSON.parse(payload)
      }
    } catch (error) {
      console.error('Error parsing JWT:', error)
    }
  }
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Debug Page</h1>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Session Data</h2>
        <div className="bg-gray-100 p-4 rounded-md overflow-auto">
          <pre>{JSON.stringify({
            user: session.user,
            hasAccessToken: !!session.accessToken,
            error: session.error,
            userSyncedWithPermit: session.userSyncedWithPermit
          }, null, 2)}</pre>
        </div>
      </div>
      
      {jwtData && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-2">JWT Payload</h2>
          <div className="bg-gray-100 p-4 rounded-md overflow-auto">
            <pre>{JSON.stringify(jwtData, null, 2)}</pre>
          </div>
        </div>
      )}
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Roles Information</h2>
        <div className="bg-gray-100 p-4 rounded-md">
          <h3 className="font-medium mb-2">From Session:</h3>
          {session.user.roles && session.user.roles.length > 0 ? (
            <ul className="list-disc list-inside">
              {session.user.roles.map((role, index) => (
                <li key={index}>{role}</li>
              ))}
            </ul>
          ) : (
            <p className="text-red-500">No roles found in session</p>
          )}
          
          <h3 className="font-medium mt-4 mb-2">From JWT:</h3>
          {jwtData && jwtData.roles && jwtData.roles.length > 0 ? (
            <ul className="list-disc list-inside">
              {jwtData.roles.map((role: string, index: number) => (
                <li key={index}>{role}</li>
              ))}
            </ul>
          ) : (
            <p className="text-red-500">No roles found in JWT</p>
          )}
        </div>
      </div>
      
      <div>
        <a href="/api/auth/signout" className="text-blue-500 hover:underline mr-4">
          Sign out
        </a>
        <a href="/" className="text-blue-500 hover:underline">
          Back to home
        </a>
      </div>
    </div>
  )
}

export default DebugPage 