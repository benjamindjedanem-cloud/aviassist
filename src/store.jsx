import { createContext, useContext, useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { COLLECTION_NAMES, pullAll, pushOps, sortCollection } from './sync.js';

// ═══════════════════════════════════════════
//  COUCHE DONNÉES
//  Les données vivent sur le téléphone (l'app marche hors ligne) et sont
//  synchronisées avec Supabase dès que le réseau est disponible.
//  Les modules lisent/écrivent via useCollection(nom), qui remplace useStorage.
// ═══════════════════════════════════════════

// Copie locale, une par compte : deux personnes sur le même téléphone
// ne voient jamais les données l'une de l'autre.
const dataKey = (userId) => `avi:data:${userId}`;
// Modifications faites sur ce téléphone et pas encore envoyées à Supabase.
const pendingKey = (userId) => `avi:pending:${userId}`;

// Données d'avant les comptes : uniquement des tests, on les efface sans les importer.
const LEGACY_KEYS = ['avi:incubation_hist', 'avi:tresorerie_bandes'];
export function clearLegacyData() {
  try { LEGACY_KEYS.forEach((k) => localStorage.removeItem(k)); } catch { /* rien à faire */ }
}

const EMPTY = Object.fromEntries(COLLECTION_NAMES.map((n) => [n, []]));

function readJSON(key) {
  try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : null; } catch { return null; }
}

const opKey = (coll, id) => `${coll}:${id}`;

// Opérations pour passer de `prev` à `next`. Les mises à jour étant immuables,
// un élément inchangé garde la même référence : la comparaison est rapide.
function diffOps(prev, next) {
  const ops = [];
  for (const coll of COLLECTION_NAMES) {
    const before = new Map((prev[coll] || []).map((r) => [r.id, r]));
    const afterIds = new Set();
    for (const row of next[coll] || []) {
      afterIds.add(row.id);
      if (before.get(row.id) !== row) ops.push({ key: opKey(coll, row.id), coll, op: 'upsert', id: row.id, row });
    }
    for (const id of before.keys()) {
      if (!afterIds.has(id)) ops.push({ key: opKey(coll, id), coll, op: 'delete', id });
    }
  }
  return ops;
}

// Données du serveur + modifications locales pas encore envoyées.
function overlay(remote, pendingOps) {
  const out = {};
  for (const coll of COLLECTION_NAMES) {
    const rows = new Map(remote[coll].map((r) => [r.id, r]));
    for (const o of pendingOps) {
      if (o.coll !== coll) continue;
      if (o.op === 'upsert') rows.set(o.id, o.row); else rows.delete(o.id);
    }
    out[coll] = sortCollection(coll, [...rows.values()]);
  }
  return out;
}

// Efface la copie locale d'un compte (à la déconnexion).
export function clearLocalUserData(userId) {
  try { localStorage.removeItem(dataKey(userId)); localStorage.removeItem(pendingKey(userId)); } catch { /* rien à faire */ }
}

// syncStatus : 'syncing' | 'synced' | 'offline' | 'error'
function useSyncedData(userId) {
  const [initial] = useState(() => ({
    data: { ...EMPTY, ...(readJSON(dataKey(userId)) || {}) },
    pending: readJSON(pendingKey(userId)) || {},
  }));
  const [data, setData] = useState(initial.data);
  const [syncStatus, setSyncStatus] = useState('syncing');
  const [pendingCount, setPendingCount] = useState(Object.keys(initial.pending).length);
  const pendingRef = useRef(initial.pending);
  const lastSeenRef = useRef(initial.data); // dernier état déjà pris en compte pour la synchro
  const syncingRef = useRef(false);
  const syncAgainRef = useRef(false);
  const timerRef = useRef(null);

  const savePending = () => {
    setPendingCount(Object.keys(pendingRef.current).length);
    try { localStorage.setItem(pendingKey(userId), JSON.stringify(pendingRef.current)); } catch { /* stockage plein */ }
  };

  const syncRef = useRef(null);
  syncRef.current = async () => {
    if (syncingRef.current) { syncAgainRef.current = true; return; }
    if (!navigator.onLine) { setSyncStatus('offline'); return; }
    syncingRef.current = true;
    setSyncStatus('syncing');
    try {
      const ops = Object.values(pendingRef.current);
      if (ops.length) {
        const { done, error } = await pushOps(ops, userId);
        const sent = new Map(ops.map((o) => [o.key, o]));
        // On ne retire que les opérations restées identiques pendant l'envoi.
        for (const key of done) if (pendingRef.current[key] === sent.get(key)) delete pendingRef.current[key];
        savePending();
        if (error) throw error;
      }
      const remote = await pullAll();
      const next = overlay(remote, Object.values(pendingRef.current));
      const expected = lastSeenRef.current;
      setData((prev) => {
        // Une modification locale n'a pas encore été prise en compte : on ne l'écrase
        // pas ; elle déclenchera elle-même une nouvelle synchro.
        if (prev !== expected) return prev;
        lastSeenRef.current = next; // état venant du serveur : rien à renvoyer
        return next;
      });
      setSyncStatus('synced');
    } catch (e) {
      console.warn('Synchronisation impossible :', e?.message || e);
      setSyncStatus(navigator.onLine ? 'error' : 'offline');
    } finally {
      syncingRef.current = false;
      if (syncAgainRef.current) { syncAgainRef.current = false; syncRef.current(); }
    }
  };

  // Chaque modification locale : copie sur le téléphone + mise en file d'attente.
  useEffect(() => {
    try { localStorage.setItem(dataKey(userId), JSON.stringify(data)); } catch { /* stockage plein */ }
    if (data === lastSeenRef.current) return;
    for (const o of diffOps(lastSeenRef.current, data)) pendingRef.current[o.key] = o;
    lastSeenRef.current = data;
    savePending();
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => syncRef.current(), 600);
  }, [data, userId]);

  // Synchro au démarrage, au retour du réseau et quand l'app revient au premier plan.
  useEffect(() => {
    syncRef.current();
    const onOnline = () => syncRef.current();
    const onOffline = () => setSyncStatus('offline');
    const onVisible = () => { if (document.visibilityState === 'visible') syncRef.current(); };
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      clearTimeout(timerRef.current);
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [userId]);

  const saveCollection = useCallback((coll, list) => setData((prev) => ({ ...prev, [coll]: list })), []);
  const syncNow = useCallback(() => syncRef.current(), []);
  return { data, saveCollection, syncStatus, pendingCount, syncNow };
}

const DataContext = createContext(null);

export function DataProvider({ userId, children }) {
  const store = useSyncedData(userId);
  return <DataContext.Provider value={store}>{children}</DataContext.Provider>;
}

// Même forme que l'ancien useStorage : [liste, enregistrer(nouvelleListe)].
export function useCollection(coll) {
  const { data, saveCollection } = useContext(DataContext);
  const save = useCallback((list) => saveCollection(coll, list), [coll, saveCollection]);
  return useMemo(() => [data[coll], save], [data, coll, save]);
}

export function useSyncStatus() {
  const { syncStatus, pendingCount, syncNow } = useContext(DataContext);
  return { syncStatus, pendingCount, syncNow };
}
