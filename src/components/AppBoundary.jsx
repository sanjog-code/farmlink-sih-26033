import React from 'react';

export default class AppBoundary extends React.Component {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(error) { console.error('FarmLink view failed:', error); }
  render() {
    if (!this.state.failed) return this.props.children;
    return <main className="page recovery-page"><h1>Let’s reopen FarmLink</h1><p>This screen could not finish loading. Your saved orders and listings are still in your account.</p><button className="primary" onClick={() => window.location.reload()}>Reload FarmLink</button></main>;
  }
}
