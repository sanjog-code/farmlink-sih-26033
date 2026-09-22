import React, { useState } from 'react';
import { supabase } from '../supabase';

export default function PasswordRecovery({ onComplete }) {
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const submit = async event => {
    event.preventDefault();
    if (password.length < 8 || password !== confirmation) return setMessage('Use at least eight characters and enter the same password twice.');
    setBusy(true);
    try {
      const { data } = await supabase.auth.getSession();
      if (!data.session) throw new Error('This link has expired. Request a new password reset from the sign-in page.');
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      window.history.replaceState({}, '', window.location.pathname);
      onComplete();
    } catch (error) { setMessage(error.message || 'The password could not be updated. Please request a new link.'); }
    finally { setBusy(false); }
  };
  return <section className="page recovery-page"><p className="eyebrow green">ACCOUNT RECOVERY</p><h1>Choose a new password</h1><p>Your reset link returns you securely to FarmLink.</p><form onSubmit={submit}><label>New password<input autoComplete="new-password" type="password" required minLength={8} value={password} onChange={event => setPassword(event.target.value)}/></label><label>Confirm password<input autoComplete="new-password" type="password" required minLength={8} value={confirmation} onChange={event => setConfirmation(event.target.value)}/></label>{message && <p role="alert">{message}</p>}<button className="primary" disabled={busy}>{busy ? 'Updating…' : 'Update password'}</button><button className="secondary" type="button" onClick={onComplete}>Return to FarmLink</button></form></section>;
}
