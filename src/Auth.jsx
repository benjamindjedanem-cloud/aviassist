import { useState } from 'react';
import { supabase } from './supabase.js';
import { Egg, Wallet, Cloud, Mail, Check } from 'lucide-react';
import { Logo } from './ui.jsx';

// ═══════════════════════════════════════════
//  ÉCRANS DE COMPTE : connexion, inscription, mot de passe oublié,
//  et choix d'un nouveau mot de passe (après le lien reçu par e-mail).
// ═══════════════════════════════════════════

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

const FEATURES = [
  { icon: Egg, text: 'Calendrier d’incubation jour par jour' },
  { icon: Wallet, text: 'Dépenses, ventes et bénéfice par bande' },
  { icon: Cloud, text: 'Données sauvegardées en ligne, même hors connexion' },
];

function Shell({ title, subtitle, children }) {
  return (
    <div className="auth">
      <aside className="auth-aside">
        <div className="row" style={{ gap: 12 }}>
          <Logo size={42} />
          <span style={{ fontSize: 20, fontWeight: 800 }}>AviAssist</span>
        </div>
        <div>
          <h2>Votre assistant avicole au quotidien.</h2>
          <p>Incubation, alimentation, santé et trésorerie : tout votre élevage au même endroit, sur téléphone comme sur ordinateur.</p>
          <div className="auth-feats">
            {FEATURES.map(({ icon: I, text }) => <div key={text} className="auth-feat"><span className="ic"><I size={20} /></span>{text}</div>)}
          </div>
        </div>
        <div style={{ fontSize: 13, opacity: .6 }}>© AviAssist</div>
      </aside>
      <main className="auth-main">
        <div className="auth-card">
          <div className="auth-brand mobile-brand">
            <Logo size={42} />
            <div><div className="brand-name">AviAssist</div><div className="brand-tag">Votre assistant avicole</div></div>
          </div>
          <h1 className="auth-title">{title}</h1>
          {subtitle && <p className="auth-sub">{subtitle}</p>}
          {children}
        </div>
      </main>
    </div>
  );
}

function Field({ label, ...props }) {
  return (
    <label className="field">
      <span className="label">{label}</span>
      <input className="input" {...props} />
    </label>
  );
}

function Notice({ tone, children }) {
  return <div className={`notice ${tone === 'error' ? 'error' : 'ok'}`}>{children}</div>;
}

function SubmitButton({ busy, children }) {
  return <button type="submit" disabled={busy} className="btn block" style={{ marginTop: 22 }}>{busy ? 'Patientez…' : children}</button>;
}

function LinkButton({ onClick, children }) {
  return <button type="button" onClick={onClick} className="link">{children}</button>;
}

// Nom de la ferme, affiché dans l'app à la place de l'adresse e-mail.
export const farmNameOf = (user) => (user?.user_metadata?.farm_name || '').trim();

// Après l'inscription : page dédiée pour ne pas laisser la personne recliquer sur « Créer mon compte ».
function CheckEmailScreen({ email, redirectTo, onLogin }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  const resend = async () => {
    setBusy(true); setError(''); setInfo('');
    const { error: err } = await supabase.auth.resend({ type: 'signup', email, options: { emailRedirectTo: redirectTo } });
    setBusy(false);
    if (err) setError(messageErreur(err));
    else setInfo('E-mail renvoyé. Pensez à regarder dans les spams.');
  };

  const steps = ['Ouvrez votre boîte mail (regardez aussi dans les spams).', 'Cliquez sur le lien « Confirm your mail ».', 'Revenez ici et connectez-vous.'];
  return (
    <Shell title="Vérifiez votre e-mail" subtitle="Votre compte est créé. Il reste une étape pour l’activer.">
      {error && <Notice tone="error">{error}</Notice>}
      {info && <Notice>{info}</Notice>}
      <div className="callout tone-green" style={{ marginBottom: 18 }}>
        <Mail size={20} />
        <div>Lien de confirmation envoyé à<br /><strong style={{ wordBreak: 'break-all' }}>{email}</strong></div>
      </div>
      <ol className="timeline tone-green" style={{ marginBottom: 22 }}>
        {steps.map((t, i) => <li key={i}><span className="day-chip" style={{ minWidth: 24 }}>{i + 1}</span><span>{t}</span></li>)}
      </ol>
      <button type="button" onClick={onLogin} className="btn block"><Check size={18} />J’ai confirmé — me connecter</button>
      <div className="auth-links">
        <LinkButton onClick={resend}>{busy ? 'Envoi…' : 'Je n’ai rien reçu — renvoyer l’e-mail'}</LinkButton>
      </div>
    </Shell>
  );
}

export function AuthScreen() {
  const [mode, setMode] = useState('login'); // 'login' | 'signup' | 'forgot' | 'checkEmail'
  const [farmName, setFarmName] = useState('');
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
        const { data, error: err } = await supabase.auth.signUp({ email: email.trim(), password, options: { emailRedirectTo: redirectTo, data: { farm_name: farmName.trim() } } });
        if (err) throw err;
        // Sans session, la confirmation par e-mail est requise.
        if (!data.session) { setPassword(''); setMode('checkEmail'); }
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

  if (mode === 'checkEmail') return <CheckEmailScreen email={email.trim()} redirectTo={redirectTo} onLogin={() => go('login')} />;

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
        {mode === 'signup' && (
          <Field label="Nom de votre ferme" type="text" autoComplete="organization" required maxLength={60} value={farmName} onChange={(e) => setFarmName(e.target.value)} placeholder="Ex. : Ferme Avicole du Soleil" />
        )}
        <Field label="Adresse e-mail" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="vous@exemple.com" />
        {mode !== 'forgot' && (
          <Field label="Mot de passe" type="password" autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder={mode === 'signup' ? '6 caractères minimum' : ''} />
        )}
        <div>
          <SubmitButton busy={busy}>{mode === 'login' ? 'Se connecter' : mode === 'signup' ? 'Créer mon compte' : 'Envoyer le lien'}</SubmitButton>
        </div>
      </form>
      <div className="auth-links">
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
        <div><SubmitButton busy={busy}>Enregistrer</SubmitButton></div>
      </form>
    </Shell>
  );
}
