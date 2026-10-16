import { useState } from 'react';
import { supabase } from './supabase.js';

// ═══════════════════════════════════════════
//  ÉCRANS DE COMPTE : connexion, inscription, mot de passe oublié,
//  et choix d'un nouveau mot de passe (après le lien reçu par e-mail).
// ═══════════════════════════════════════════

const C = { green: '#2A7A40', greenDk: '#1B5229', greenLt: '#E8F5EC', red: '#C0392B', redLt: '#FDECEA', bg: '#F2F5EE', card: '#FFFFFF', border: '#DDE8D5', text: '#18230F', muted: '#5C7052' };
const font = "'Nunito',sans-serif";
const inputStyle = { width: '100%', padding: '12px 13px', borderRadius: 10, border: `1.5px solid ${C.border}`, fontSize: 15, fontFamily: font, outline: 'none', background: '#FAFDFA', boxSizing: 'border-box', color: C.text };

// Messages d'erreur Supabase traduits pour l'utilisateur.
function messageErreur(error) {
  const m = (error?.message || '').toLowerCase();
  if (m.includes('invalid login credentials')) return 'E-mail ou mot de passe incorrect.';
  if (m.includes('email not confirmed')) return 'Confirmez d’abord votre adresse : ouvrez le lien reçu par e-mail.';
  if (m.includes('already registered') || m.includes('already been registered')) return 'Un compte existe déjà avec cet e-mail. Connectez-vous.';
  if (m.includes('password should be at least') || m.includes('weak')) return 'Mot de passe trop court : 6 caractères minimum.';
  if (m.includes('rate limit') || m.includes('security purposes')) return 'Trop de tentatives. Patientez une minute puis réessayez.';
  if (m.includes('invalid email') || m.includes('unable to validate email')) return 'Adresse e-mail invalide.';
  if (m.includes('failed to fetch') || m.includes('network')) return 'Pas de connexion internet. Réessayez une fois connecté.';
  return error?.message || 'Une erreur est survenue.';
}

function Shell({ title, subtitle, children }) {
  return (
    <div style={{ background: '#C8D4C0', minHeight: '100vh', display: 'flex', justifyContent: 'center', fontFamily: font }}>
      <div style={{ width: '100%', maxWidth: 430, background: C.bg, minHeight: '100vh' }}>
        <div style={{ background: `linear-gradient(150deg,${C.green},${C.greenDk})`, padding: '30px 18px 46px', color: '#fff' }}>
          <div style={{ fontSize: 11, fontWeight: 700, opacity: 0.7, letterSpacing: 1.2, marginBottom: 10 }}>ASSISTANT NUMÉRIQUE</div>
          <div style={{ fontSize: 30, fontWeight: 900, lineHeight: 1.15 }}>AviAssist 🐓</div>
          <div style={{ fontSize: 14, opacity: 0.8, marginTop: 6 }}>Votre partenaire avicole au quotidien</div>
        </div>
        <div style={{ margin: '-22px 16px 0', background: C.card, borderRadius: 16, padding: 20, boxShadow: '0 6px 20px rgba(0,0,0,.12)' }}>
          <div style={{ fontSize: 22, fontWeight: 900, color: C.text }}>{title}</div>
          {subtitle && <div style={{ fontSize: 13, color: C.muted, marginTop: 4, marginBottom: 16, lineHeight: 1.5 }}>{subtitle}</div>}
          {children}
        </div>
      </div>
    </div>
  );
}

function Field({ label, ...props }) {
  return (
    <label style={{ display: 'block', marginBottom: 12 }}>
      <span style={{ display: 'block', fontSize: 11, fontWeight: 800, color: C.muted, textTransform: 'uppercase', letterSpacing: '.6px', marginBottom: 6 }}>{label}</span>
      <input {...props} style={inputStyle} />
    </label>
  );
}

function Notice({ tone, children }) {
  const s = tone === 'error' ? { bg: C.redLt, fg: C.red } : { bg: C.greenLt, fg: C.green };
  return <div style={{ fontSize: 13, fontWeight: 700, padding: '10px 12px', borderRadius: 10, marginBottom: 12, background: s.bg, color: s.fg, lineHeight: 1.5 }}>{children}</div>;
}

function SubmitButton({ busy, children }) {
  return (
    <button type="submit" disabled={busy} style={{ background: C.green, color: '#fff', border: 'none', borderRadius: 12, padding: '13px 20px', fontSize: 15, fontWeight: 800, cursor: 'pointer', width: '100%', fontFamily: font, opacity: busy ? 0.6 : 1 }}>
      {busy ? 'Patientez…' : children}
    </button>
  );
}

function LinkButton({ onClick, children }) {
  return <button type="button" onClick={onClick} style={{ background: 'none', border: 'none', color: C.green, fontSize: 14, fontWeight: 800, cursor: 'pointer', fontFamily: font }}>{children}</button>;
}

export function AuthScreen() {
  const [mode, setMode] = useState('login'); // 'login' | 'signup' | 'forgot'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  const go = (m) => { setMode(m); setError(''); setInfo(''); };
  // Adresse de retour des liens envoyés par e-mail : l'app elle-même.
  const redirectTo = window.location.origin + window.location.pathname;

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setError(''); setInfo('');
    try {
      if (mode === 'login') {
        const { error: err } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (err) throw err;
      } else if (mode === 'signup') {
        const { data, error: err } = await supabase.auth.signUp({ email: email.trim(), password, options: { emailRedirectTo: redirectTo } });
        if (err) throw err;
        // Sans session, la confirmation par e-mail est requise.
        if (!data.session) setInfo('Compte créé ! Ouvrez le lien reçu par e-mail pour l’activer, puis connectez-vous.');
      } else {
        const { error: err } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo });
        if (err) throw err;
        setInfo('Si un compte existe pour cette adresse, un e-mail de réinitialisation vient d’être envoyé.');
      }
    } catch (err) {
      setError(messageErreur(err));
    } finally {
      setBusy(false);
    }
  };

  const titles = {
    login: ['Connexion', 'Retrouvez vos incubations et vos bandes sur n’importe quel téléphone.'],
    signup: ['Créer un compte', 'Vos données seront sauvegardées en ligne et liées à ce compte.'],
    forgot: ['Mot de passe oublié', 'Recevez un lien par e-mail pour en choisir un nouveau.'],
  };

  return (
    <Shell title={titles[mode][0]} subtitle={titles[mode][1]}>
      <form onSubmit={submit}>
        {error && <Notice tone="error">{error}</Notice>}
        {info && <Notice>{info}</Notice>}
        <Field label="Adresse e-mail" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="vous@exemple.com" />
        {mode !== 'forgot' && (
          <Field label="Mot de passe" type="password" autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder={mode === 'signup' ? '6 caractères minimum' : ''} />
        )}
        <div style={{ marginTop: 6 }}>
          <SubmitButton busy={busy}>{mode === 'login' ? 'Se connecter' : mode === 'signup' ? 'Créer mon compte' : 'Envoyer le lien'}</SubmitButton>
        </div>
      </form>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, marginTop: 18 }}>
        {mode === 'login' && <>
          <LinkButton onClick={() => go('signup')}>Pas encore de compte ? Créer un compte</LinkButton>
          <LinkButton onClick={() => go('forgot')}>Mot de passe oublié ?</LinkButton>
        </>}
        {mode !== 'login' && <LinkButton onClick={() => go('login')}>J’ai déjà un compte — me connecter</LinkButton>}
      </div>
    </Shell>
  );
}

// Affiché après un clic sur le lien « réinitialiser le mot de passe ».
export function NewPasswordScreen({ onDone }) {
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setError('');
    const { error: err } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (err) setError(messageErreur(err));
    else onDone();
  };

  return (
    <Shell title="Nouveau mot de passe" subtitle="Choisissez le mot de passe que vous utiliserez désormais.">
      <form onSubmit={submit}>
        {error && <Notice tone="error">{error}</Notice>}
        <Field label="Nouveau mot de passe" type="password" autoComplete="new-password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="6 caractères minimum" />
        <div style={{ marginTop: 6 }}><SubmitButton busy={busy}>Enregistrer</SubmitButton></div>
      </form>
    </Shell>
  );
}
