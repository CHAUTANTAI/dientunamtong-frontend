/**
 * Root Page
 * Middleware handles all redirects automatically
 * This page should never be rendered as middleware redirects "/" immediately
 */
export default function Home() {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
      }}
    >
      <p>Redirecting...</p>
    </div>
  );
}
