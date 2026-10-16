import { supabase } from './supabase.js';

// ═══════════════════════════════════════════
//  ÉCHANGES AVEC SUPABASE
//  Chaque élément (une incubation, une bande avec ses dépenses et ventes)
//  est stocké tel quel dans une colonne JSON `data`, une ligne par élément.
// ═══════════════════════════════════════════

// table : nom de la table Supabase · sortKey : date servant à garder l'ordre (récent en premier)
export const COLLECTIONS = {
  incubations: { table: 'incubations', sortKey: (x) => x.at || '' },
  bandes: { table: 'bandes', sortKey: (x) => x.createdAt || '' },
};
export const COLLECTION_NAMES = Object.keys(COLLECTIONS);

const byRecentFirst = (name) => (a, b) => {
  const k = COLLECTIONS[name].sortKey;
  return k(b).localeCompare(k(a));
};
export const sortCollection = (name, list) => [...list].sort(byRecentFirst(name));

// Erreur réseau (à retenter plus tard) ou refus définitif de la base ?
function isNetworkError(error) {
  return !error?.code || /fetch|network/i.test(error?.message || '');
}

// Toutes les lignes de l'utilisateur (la RLS filtre côté serveur).
// PostgREST limite chaque réponse à 1000 lignes : on pagine.
async function fetchAll(table) {
  const PAGE = 1000;
  const rows = [];
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await supabase.from(table).select('id,data').order('id').range(from, from + PAGE - 1);
    if (error) throw error;
    rows.push(...data);
    if (data.length < PAGE) return rows;
  }
}

export async function pullAll() {
  const lists = await Promise.all(COLLECTION_NAMES.map((n) => fetchAll(COLLECTIONS[n].table)));
  const out = {};
  COLLECTION_NAMES.forEach((n, i) => { out[n] = sortCollection(n, lists[i].map((r) => ({ ...r.data, id: r.id }))); });
  return out;
}

const toRow = (name, item, userId) => ({
  user_id: userId,
  id: item.id,
  data: item,
  sort_key: COLLECTIONS[name].sortKey(item) || null,
  updated_at: new Date().toISOString(),
});

// Envoie un lot d'opérations en attente. Renvoie { done, error } : `done` liste les
// clés traitées (envoyées, ou rejetées définitivement par la base) ; le reste reste en attente.
export async function pushOps(ops, userId) {
  const done = [];
  try {
    for (const name of COLLECTION_NAMES) {
      const { table } = COLLECTIONS[name];
      const upserts = ops.filter((o) => o.coll === name && o.op === 'upsert');
      const deletes = ops.filter((o) => o.coll === name && o.op === 'delete');

      if (upserts.length) {
        const { error } = await supabase.from(table).upsert(upserts.map((o) => toRow(name, o.row, userId)), { onConflict: 'user_id,id' });
        if (error && isNetworkError(error)) throw error;
        if (error) {
          // Lot refusé : ligne par ligne pour isoler celle qui pose problème.
          for (const o of upserts) {
            const { error: e } = await supabase.from(table).upsert(toRow(name, o.row, userId), { onConflict: 'user_id,id' });
            if (e && isNetworkError(e)) throw e;
            if (e) console.warn(`Ligne ${table}/${o.id} ignorée par la base :`, e.message);
            done.push(o.key);
          }
        } else {
          done.push(...upserts.map((o) => o.key));
        }
      }

      if (deletes.length) {
        const { error } = await supabase.from(table).delete().eq('user_id', userId).in('id', deletes.map((o) => o.id));
        if (error) throw error;
        done.push(...deletes.map((o) => o.key));
      }
    }
    return { done, error: null };
  } catch (error) {
    return { done, error };
  }
}
