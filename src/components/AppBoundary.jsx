import React from 'react';

export default class AppBoundary extends React.Component {
  state = { failed: false, error: null };
  static getDerivedStateFromError(error) { return { failed: true, error }; }
  componentDidCatch(error, info) { console.error('FarmLink view failed:', error, info); }
  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <main className="page recovery-page">
        <h1>Let’s reopen FarmLink</h1>
        <p>This screen could not finish loading. Your saved orders and listings are still in your account.</p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '16px' }}>
          <button className="primary" onClick={() => window.location.reload()}>Reload FarmLink</button>
          <button className="secondary" onClick={() => { window.location.href = '/'; }}>Return to Home</button>
        </div>
      </main>
    );
  }
}
