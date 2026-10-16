import React, { useEffect, useState } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { AuthScreen, NewPasswordScreen } from './Auth.jsx'
import { DataProvider, clearLegacyData } from './store.jsx'
import { supabase } from './supabase.js'

// Les données enregistrées avant les comptes n'étaient que des tests : on les efface.
clearLegacyData()

// Choisit l'écran selon la session : connexion, nouveau mot de passe, ou l'app.
function Root() {
  const [session, setSession] = useState(undefined) // undefined = en cours de lecture
  const [recovery, setRecovery] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: sub } = supabase.auth.onAuthStateChange((event, s) => {
      if (event === 'PASSWORD_RECOVERY') setRecovery(true)
      setSession(s)
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  if (session === undefined) {
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F2F5EE', color: '#5C7052', fontFamily: "'Nunito',sans-serif", fontWeight: 800 }}>Chargement…</div>
  }
  if (session && recovery) return <NewPasswordScreen onDone={() => setRecovery(false)} />
  if (!session) return <AuthScreen />
  // key : changer de compte repart d'un état propre.
  return (
    <DataProvider key={session.user.id} userId={session.user.id}>
      <App user={session.user} />
    </DataProvider>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode><Root /></React.StrictMode>
)

// En dev, le service worker mettrait en cache des fichiers en cours de modification.
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {})
  })
}
