import { useState, useEffect, useCallback, useRef } from "react";
import { LayoutDashboard, LogOut, Cloud, CloudOff, RefreshCw, AlertCircle, Pencil, ChevronRight, Lightbulb, Egg, Layers, TrendingUp, TrendingDown, ArrowRight } from "lucide-react";
import { useCollection, useSyncStatus, clearLocalUserData } from "./store.jsx";
import { supabase } from "./supabase.js";
import { farmNameOf } from "./Auth.jsx";
import { getDailyTip, fmtCFA } from "./data.js";
import { Logo, MODULES, IconTile, Card, Stat, Callout, useScrollTop } from "./ui.jsx";
import IncubationModule from "./modules/Incubation.jsx";
import FormuleModule from "./modules/Formule.jsx";
import MaladiesModule from "./modules/Maladies.jsx";
import FormationsModule from "./modules/Formations.jsx";
import TresorerieModule from "./modules/Tresorerie.jsx";

const SCREENS = { incubation: IncubationModule, formule: FormuleModule, maladies: MaladiesModule, formations: FormationsModule, tresorerie: TresorerieModule };

// ═══════════════════════════════════════════
//  COMPTE : nom de la ferme, sauvegarde, déconnexion
// ═══════════════════════════════════════════

const SYNC = {
  synced: { icon: Cloud, label: "Sauvegardé" },
  syncing: { icon: RefreshCw, label: "Synchronisation…" },
  offline: { icon: CloudOff, label: "Hors ligne" },
  error: { icon: AlertCircle, label: "Erreur · réessayer" },
};

function useAccount(user) {
  const { syncStatus, pendingCount, syncNow } = useSyncStatus();
  const farmName = farmNameOf(user);
  const renameFarm = async () => {
    const name = window.prompt("Nom de votre ferme :", farmName);
    if (name === null || !name.trim() || name.trim() === farmName) return;
    const { error } = await supabase.auth.updateUser({ data: { farm_name: name.trim().slice(0, 60) } });
    if (error) window.alert("Impossible d'enregistrer le nom pour l'instant. Vérifiez votre connexion internet.");
  };
  const logout = async () => {
    if (pendingCount > 0 && !window.confirm(`${pendingCount} modification(s) ne sont pas encore sauvegardées en ligne et seront perdues. Se déconnecter quand même ?`)) return;
    await supabase.auth.signOut();
    clearLocalUserData(user.id);
  };
  return { farmName, renameFarm, logout, syncStatus, pendingCount, syncNow };
}

function SyncBadge({ status, pending, onClick }) {
  const s = SYNC[status] || SYNC.syncing;
  const I = s.icon;
  const label = status === "offline" && pending > 0 ? `Hors ligne · ${pending} en attente` : s.label;
  return <button className={`sync ${status}`} onClick={onClick} title={`${label} — synchroniser maintenant`}><I size={13} strokeWidth={2.4} /><span className="sync-label">{label}</span></button>;
}

const initials = (name) => (name || "?").trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join("").toUpperCase();

function FarmButton({ account, user }) {
  return (
    <button className="farm" onClick={account.renameFarm} title="Modifier le nom de la ferme">
      <span className="farm-avatar">{account.farmName ? initials(account.farmName) : <Pencil size={16} />}</span>
      <span className="grow" style={{ textAlign: "left" }}>
        <span className="farm-name ellipsis" style={{ display: "block" }}>{account.farmName || "Nommer ma ferme"}</span>
        <span className="farm-sub ellipsis" style={{ display: "block" }}>{user.email}</span>
      </span>
    </button>
  );
}

// ═══════════════════════════════════════════
//  MENU LATÉRAL (ordinateur) & BARRE DU HAUT (téléphone)
// ═══════════════════════════════════════════

function Sidebar({ screen, navigate, account, user }) {
  const items = [{ id: "home", label: "Tableau de bord", icon: LayoutDashboard, tone: "green" }, ...MODULES];
  return (
    <aside className="sidebar">
      <div className="brand">
        <Logo size={38} />
        <div><div className="brand-name">AviAssist</div><div className="brand-tag">Assistant avicole</div></div>
      </div>
      <nav className="nav">
        {items.map((m) => {
          const I = m.icon;
          return (
            <button key={m.id} className={`nav-item tone-${m.tone} ${screen === m.id ? "active" : ""}`} onClick={() => navigate(m.id)}>
              <span className="nav-ic"><I size={18} /></span>{m.label}
            </button>
          );
        })}
      </nav>
      <div className="sidebar-foot">
        <FarmButton account={account} user={user} />
        <div className="row-between" style={{ marginTop: 10, padding: "0 4px" }}>
          <SyncBadge status={account.syncStatus} pending={account.pendingCount} onClick={account.syncNow} />
          <button className="icon-btn danger" onClick={account.logout} title="Se déconnecter"><LogOut size={17} /></button>
        </div>
      </div>
    </aside>
  );
}

function TopBar({ account }) {
  return (
    <div className="topbar mobile-only">
      <Logo size={34} />
      <button className="grow" style={{ textAlign: "left", minWidth: 0 }} onClick={account.renameFarm} title="Modifier le nom de la ferme">
        <div style={{ fontWeight: 800, fontSize: 16, letterSpacing: "-.01em" }}>AviAssist</div>
        <div className="xsmall muted ellipsis row" style={{ gap: 4 }}>{account.farmName || "Nommer ma ferme"}<Pencil size={11} /></div>
      </button>
      <SyncBadge status={account.syncStatus} pending={account.pendingCount} onClick={account.syncNow} />
      <button className="icon-btn danger" onClick={account.logout} title="Se déconnecter"><LogOut size={18} /></button>
    </div>
  );
}

// ═══════════════════════════════════════════
//  TABLEAU DE BORD
// ═══════════════════════════════════════════

function HomeScreen({ go, account }) {
  const [incubations] = useCollection("incubations");
  const [bandes] = useCollection("bandes");
  useScrollTop("home");
  const now = new Date();
  const activeIncub = (incubations || []).filter((h) => now < new Date(h.eclosion)).length;
  const activeBandes = (bandes || []).filter((b) => b.status !== "terminee").length;
  const sum = (arr, k) => arr.reduce((s, x) => s + (x[k] || 0), 0);
  const profit = (bandes || []).reduce((s, b) => s + sum(b.ventes || [], "montant") - sum(b.depenses || [], "montant"), 0);
  const hour = now.getHours();
  const hello = hour < 12 ? "Bonjour" : hour < 18 ? "Bon après-midi" : "Bonsoir";

  return (
    <div>
      <header className="page-head">
        <div className="page-sub" style={{ marginTop: 0 }}>{hello},</div>
        <h1 className="page-title" style={{ marginTop: 2 }}>{account.farmName || "Votre ferme"}</h1>
      </header>
      <div className="stack-lg">
        <div className="grid-3">
          <Stat icon={Egg} tone="amber" label="Incubations en cours" value={activeIncub} />
          <Stat icon={Layers} tone="purple" label="Bandes en cours" value={activeBandes} />
          <Stat icon={profit >= 0 ? TrendingUp : TrendingDown} tone={profit >= 0 ? "green" : "red"} label={profit >= 0 ? "Bénéfice global" : "Perte globale"} value={fmtCFA(Math.abs(profit))} />
        </div>
        <section>
          <div className="section-label">Modules</div>
          <div className="modules">
            {MODULES.map((m) => (
              <Card key={m.id} className={`module-card tone-${m.tone} ${m.id === "tresorerie" ? "wide" : ""}`} onClick={() => go(m.id)}>
                <IconTile icon={m.icon} tone={m.tone} size="lg" />
                <div>
                  <div className="mc-title">{m.label}</div>
                  <div className="mc-desc">{m.desc}</div>
                </div>
                <div className="mc-go desktop-only">Ouvrir <ArrowRight size={14} /></div>
              </Card>
            ))}
            <Card tinted tone="green" className="module-card tip">
              <IconTile icon={Lightbulb} tone="green" size="lg" />
              <div>
                <div className="mc-title" style={{ color: "var(--green)" }}>Conseil du jour</div>
                <div className="small" style={{ marginTop: 4, lineHeight: 1.55 }}>{getDailyTip()}</div>
              </div>
            </Card>
          </div>
        </section>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
//  APPLICATION + BOUTON RETOUR D'ANDROID
// ═══════════════════════════════════════════

export default function App({ user }) {
  const [screen, setScreen] = useState("home");
  const [navKey, setNavKey] = useState(0); // force un module à repartir de son accueil
  const [exitToast, setExitToast] = useState(false);
  const moduleBackRef = useRef(null);
  const exitTimerRef = useRef(null);
  // Refs toujours à jour : le listener popstate est enregistré une seule fois
  // et ne doit jamais lire un état périmé issu d'une closure obsolète.
  const screenRef = useRef(screen);
  const exitToastRef = useRef(exitToast);
  screenRef.current = screen;
  exitToastRef.current = exitToast;
  const account = useAccount(user);

  const registerBack = useCallback((handler) => { moduleBackRef.current = handler; }, []);

  // Navigation : depuis l'accueil on empile une entrée d'historique ; entre deux
  // modules (menu latéral) on la remplace, pour que le bouton retour revienne
  // toujours à l'accueil sans faire quitter l'application.
  const navigate = useCallback((s) => {
    moduleBackRef.current = null;
    setNavKey((k) => k + 1);
    if (s === "home") { setScreen("home"); history.replaceState({ screen: "home" }, ""); return; }
    if (screenRef.current === "home") history.pushState({ screen: s }, "");
    else history.replaceState({ screen: s }, "");
    setScreen(s);
  }, []);
  const goHome = useCallback(() => navigate("home"), [navigate]);

  useEffect(() => {
    // État tampon dès le montage : un popstate se déclenche ainsi au tout premier
    // appui sur « retour » (sinon certains WebView Android quittent directement).
    history.replaceState({ screen: "home" }, "");
    history.pushState({ screen: "home" }, "");

    const handlePop = () => {
      const cur = screenRef.current;
      if (cur === "home") {
        if (exitToastRef.current) return; // deuxième appui : on laisse sortir
        history.pushState({ screen: "home" }, "");
        setExitToast(true);
        clearTimeout(exitTimerRef.current);
        exitTimerRef.current = setTimeout(() => setExitToast(false), 2500);
      } else {
        history.pushState({ screen: cur }, "");
        const handled = moduleBackRef.current ? moduleBackRef.current() : false;
        if (!handled) { moduleBackRef.current = null; setScreen("home"); }
      }
    };
    window.addEventListener("popstate", handlePop);
    return () => { window.removeEventListener("popstate", handlePop); clearTimeout(exitTimerRef.current); };
  }, []);

  const Module = SCREENS[screen];

  return (
    <div className="app">
      <Sidebar screen={screen} navigate={navigate} account={account} user={user} />
      <div className="main">
        <TopBar account={account} />
        <main className="content">
          {Module
            ? <Module key={navKey} onBack={goHome} registerBack={registerBack} />
            : <HomeScreen go={navigate} account={account} />}
        </main>
      </div>
      {exitToast && <div className="toast">Appuyez encore pour quitter</div>}
    </div>
  );
}
