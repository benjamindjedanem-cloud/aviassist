import { useState, useEffect } from "react";
import {
  Wallet, Plus, Receipt, Banknote, BarChart3, Pencil, Trash2, Flag, Lock, RotateCw, CheckCircle2,
  AlertTriangle, Calculator, FolderOpen, TrendingUp, TrendingDown, ChevronRight, Check, Layers,
} from "lucide-react";
import { EXPENSE_CATEGORIES, fmtCFA, fmtDate, genId, today } from "../data.js";
import { useCollection } from "../store.jsx";
import { PageHeader, Card, CardTitle, Button, Badge, Field, Choice, Stat, KV, Callout, Empty, IconTile, EXPENSE_ICON, useScrollTop } from "../ui.jsx";

const emptyDep = () => ({ cat: "", description: "", montant: "", date: today() });
const emptyVen = () => ({ produit: "", qty: "", prixUnit: "", montant: "", date: today(), remarque: "" });
const TRES_BACK = { create: "list", detail: "list", addDep: "detail", editDep: "detail", addVen: "detail", editVen: "detail", bilan: "detail" };
const BANDE_TYPES = ["Poulet de chair", "Pondeuse", "Caille", "Dinde", "Pintade", "Autre"];
const catOf = (id) => EXPENSE_CATEGORIES.find((c) => c.id === id);

const totalDep = (b) => (b?.depenses || []).reduce((s, d) => s + d.montant, 0);
const totalVent = (b) => (b?.ventes || []).reduce((s, v) => s + v.montant, 0);
const benefice = (b) => totalVent(b) - totalDep(b);

// Trois chiffres d'une bande : dépenses, recettes, bénéfice/perte.
function Totals({ b, tinted }) {
  const td = totalDep(b), tv = totalVent(b), bn = tv - td, pos = bn >= 0;
  return (
    <div className="grid-3">
      <Stat tinted={tinted} tone="red" icon={Receipt} label="Dépenses" value={fmtCFA(td)} />
      <Stat tinted={tinted} tone="green" icon={Banknote} label="Recettes" value={fmtCFA(tv)} />
      <Stat tinted={tinted} tone={pos ? "green" : "red"} icon={pos ? TrendingUp : TrendingDown} label={pos ? "Bénéfice" : "Perte"} value={fmtCFA(Math.abs(bn))} />
    </div>
  );
}

function BandeCard({ b, onClick }) {
  const done = b.status === "terminee";
  return (
    <Card onClick={onClick}>
      <div className="row-between" style={{ alignItems: "flex-start", marginBottom: 12 }}>
        <div className="row" style={{ alignItems: "flex-start" }}>
          <IconTile icon={Layers} tone={done ? "slate" : "purple"} />
          <div>
            <div style={{ fontWeight: 700, fontSize: 15.5 }}>{b.nom}</div>
            <div className="small muted">{b.type} · {b.effectif} animaux · {fmtDate(b.date)}</div>
          </div>
        </div>
        {done ? <Badge tone="green" icon={CheckCircle2}>Terminée</Badge> : <Badge tone="orange" icon={RotateCw}>En cours</Badge>}
      </div>
      <Totals b={b} />
    </Card>
  );
}

export default function TresorerieModule({ onBack, registerBack }) {
  const [bandes, saveBandes] = useCollection("bandes");
  const [screen, setScreen] = useState("list");
  const [bandeId, setBandeId] = useState(null);
  const [tab, setTab] = useState("depenses");
  const [confirmTerminer, setCT] = useState(false);
  const [fBande, setFBande] = useState({ nom: "", type: "", date: "", effectif: "" });
  const [fDep, setFDep] = useState(emptyDep());
  const [fVen, setFVen] = useState(emptyVen());
  const [editDepId, setEditDepId] = useState(null);
  const [editVenId, setEditVenId] = useState(null);
  useScrollTop(screen);

  useEffect(() => {
    if (screen === "list") registerBack(null);
    else registerBack(() => { setScreen(TRES_BACK[screen] || "list"); setCT(false); return true; });
  }, [screen, registerBack]);

  const list = bandes || [];
  const bande = list.find((b) => b.id === bandeId) || null;
  const isTerminee = bande?.status === "terminee";
  const saveBande = (u) => saveBandes(list.map((b) => (b.id === u.id ? u : b)));

  const createBande = () => {
    if (!fBande.nom || !fBande.type || !fBande.date || !fBande.effectif) return;
    const b = { id: genId(), ...fBande, effectif: parseInt(fBande.effectif), depenses: [], ventes: [], status: "en_cours", createdAt: new Date().toISOString() };
    saveBandes([b, ...list]); setBandeId(b.id); setFBande({ nom: "", type: "", date: "", effectif: "" }); setScreen("detail");
  };
  const terminerBande = () => { saveBande({ ...bande, status: "terminee", termineeAt: new Date().toISOString() }); setCT(false); };

  const depFromForm = (id) => ({ id, cat: fDep.cat, nom: catOf(fDep.cat)?.label || "", description: fDep.description, montant: parseFloat(fDep.montant), date: fDep.date });
  const addDep = () => {
    if (!fDep.cat || !fDep.montant || !bande || isTerminee) return;
    saveBande({ ...bande, depenses: [...bande.depenses, depFromForm(genId())] }); setFDep(emptyDep()); setScreen("detail"); setTab("depenses");
  };
  const updateDep = () => {
    if (!fDep.cat || !fDep.montant || !bande || !editDepId || isTerminee) return;
    saveBande({ ...bande, depenses: bande.depenses.map((x) => (x.id === editDepId ? depFromForm(editDepId) : x)) }); setEditDepId(null); setFDep(emptyDep()); setScreen("detail"); setTab("depenses");
  };
  const deleteDep = (d) => {
    if (isTerminee || !window.confirm(`Supprimer cette dépense de ${fmtCFA(d.montant)} ?`)) return;
    saveBande({ ...bande, depenses: bande.depenses.filter((x) => x.id !== d.id) });
  };
  const autoMont = fVen.qty && fVen.prixUnit ? (parseFloat(fVen.qty) * parseFloat(fVen.prixUnit)).toFixed(0) : "";
  const venFromForm = (id) => ({ id, ...fVen, montant: parseFloat(fVen.qty && fVen.prixUnit ? autoMont : fVen.montant) });
  const addVen = () => {
    if (!fVen.produit || !(fVen.montant || autoMont) || !bande || isTerminee) return;
    saveBande({ ...bande, ventes: [...bande.ventes, venFromForm(genId())] }); setFVen(emptyVen()); setScreen("detail"); setTab("ventes");
  };
  const updateVen = () => {
    if (!fVen.produit || !(fVen.montant || autoMont) || !bande || !editVenId || isTerminee) return;
    saveBande({ ...bande, ventes: bande.ventes.map((x) => (x.id === editVenId ? venFromForm(editVenId) : x)) }); setEditVenId(null); setFVen(emptyVen()); setScreen("detail"); setTab("ventes");
  };
  const deleteVen = (v) => {
    if (isTerminee || !window.confirm(`Supprimer cette vente de ${fmtCFA(v.montant)} ?`)) return;
    saveBande({ ...bande, ventes: bande.ventes.filter((x) => x.id !== v.id) });
  };

  // ─── Bilan ───
  if (screen === "bilan" && bande) {
    const td = totalDep(bande), tv = totalVent(bande), bn = tv - td, pos = bn >= 0;
    const byCat = EXPENSE_CATEGORIES.map((c) => ({ ...c, total: bande.depenses.filter((d) => d.cat === c.id).reduce((s, d) => s + d.montant, 0) })).filter((c) => c.total > 0).sort((a, b) => b.total - a.total);
    return (
      <div className="tone-purple">
        <PageHeader tone="purple" icon={BarChart3} title="Bilan complet" subtitle={bande.nom} onBack={() => setScreen("detail")} backLabel="Bande"
          meta={isTerminee && <Badge tone="green" icon={CheckCircle2}>Terminée</Badge>} />
        <div className="stack-lg">
          <Card tone={pos ? "green" : "red"} tinted style={{ textAlign: "center" }}>
            <div className="row" style={{ justifyContent: "center", fontWeight: 700, color: "var(--t)" }}>{pos ? <TrendingUp size={18} /> : <TrendingDown size={18} />}{pos ? "Bénéfice net" : "Perte nette"}</div>
            <div className="hero-number" style={{ margin: "8px 0" }}>{pos ? "+" : "−"}{fmtCFA(Math.abs(bn))}</div>
            {td > 0 && <div className="small muted">Rentabilité : <strong style={{ color: "var(--t)" }}>{tv > 0 ? (bn >= 0 ? "+" : "") + Math.round(bn / td * 100) : 0}%</strong>{bande.effectif > 0 && tv > 0 && <> · {fmtCFA(bn / bande.effectif)} par animal</>}</div>}
          </Card>
          <div className="grid-2">
            <Stat tinted tone="red" icon={Receipt} label="Total dépenses" value={fmtCFA(td)} sub={`${bande.depenses.length} dépense${bande.depenses.length > 1 ? "s" : ""}`} />
            <Stat tinted tone="green" icon={Banknote} label="Total recettes" value={fmtCFA(tv)} sub={`${bande.ventes.length} vente${bande.ventes.length > 1 ? "s" : ""}`} />
          </div>
          <div className="grid-cards">
            {td > 0 && bande.effectif > 0 && (
              <Card><CardTitle icon={Calculator}>Coût de production</CardTitle>
                <KV k="Coût total" v={fmtCFA(td)} /><KV k="Coût par animal" v={fmtCFA(td / bande.effectif)} accent /><KV k="Effectif initial" v={`${bande.effectif} animaux`} />
              </Card>
            )}
            {byCat.length > 0 && (
              <Card><CardTitle icon={FolderOpen}>Dépenses par poste</CardTitle>
                <div className="stack">
                  {byCat.map((c) => {
                    const I = EXPENSE_ICON[c.id];
                    const pct = td > 0 ? Math.round(c.total / td * 100) : 0;
                    return (
                      <div key={c.id}>
                        <div className="row-between small"><span className="row" style={{ gap: 8 }}><I size={16} className="muted" />{c.label}</span><span><strong>{fmtCFA(c.total)}</strong> <span className="muted">· {pct}%</span></span></div>
                        <div className="bar tone-red" style={{ marginTop: 6 }}><span style={{ width: `${pct}%` }} /></div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            )}
          </div>
          <div className="grid-cards">
            {bande.depenses.length > 0 && (
              <Card flush tone="red">
                <div style={{ padding: "16px 16px 4px" }}><CardTitle icon={Receipt}>Toutes les dépenses</CardTitle></div>
                {[...bande.depenses].reverse().map((d) => <TxRow key={d.id} title={catOf(d.cat)?.label} icon={EXPENSE_ICON[d.cat]} sub={[d.description, fmtDate(d.date)].filter(Boolean).join(" · ")} amount={fmtCFA(d.montant)} tone="red" />)}
                <div className="tx-total"><span>Total dépenses</span><span>{fmtCFA(td)}</span></div>
              </Card>
            )}
            {bande.ventes.length > 0 && (
              <Card flush tone="green">
                <div style={{ padding: "16px 16px 4px" }}><CardTitle icon={Banknote}>Toutes les ventes</CardTitle></div>
                {[...bande.ventes].reverse().map((v) => <TxRow key={v.id} title={v.produit} icon={Banknote} sub={venteSub(v)} amount={fmtCFA(v.montant)} tone="green" />)}
                <div className="tx-total"><span>Total recettes</span><span>{fmtCFA(tv)}</span></div>
              </Card>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ─── Ajouter / modifier une dépense ───
  if ((screen === "addDep" || screen === "editDep") && bande && !isTerminee) {
    const isEdit = screen === "editDep";
    const cancel = () => { setScreen("detail"); setEditDepId(null); setFDep(emptyDep()); };
    return (
      <div className="tone-red">
        <PageHeader tone="red" icon={Receipt} title={isEdit ? "Modifier la dépense" : "Nouvelle dépense"} subtitle={bande.nom} onBack={cancel} backLabel="Bande" />
        <Card className="narrow">
          <span className="label">Catégorie</span>
          <div className="choices three">
            {EXPENSE_CATEGORIES.map((c) => <Choice key={c.id} tone="red" icon={EXPENSE_ICON[c.id]} on={fDep.cat === c.id} label={c.label} onClick={() => setFDep((f) => ({ ...f, cat: c.id }))} />)}
          </div>
          <Field label="Description" optional style={{ marginTop: 16 }}>
            <input className="input" placeholder="Ex. : sac de 50 kg, livraison fournisseur…" value={fDep.description} onChange={(e) => setFDep((f) => ({ ...f, description: e.target.value }))} />
          </Field>
          <div className="grid-2" style={{ marginTop: 16 }}>
            <Field label="Montant (FCFA)"><input type="number" inputMode="numeric" className="input" placeholder="Ex. : 25000" value={fDep.montant} onChange={(e) => setFDep((f) => ({ ...f, montant: e.target.value }))} /></Field>
            <Field label="Date"><input type="date" className="input" value={fDep.date} onChange={(e) => setFDep((f) => ({ ...f, date: e.target.value }))} /></Field>
          </div>
          <Button block tone="red" icon={Check} onClick={isEdit ? updateDep : addDep} disabled={!fDep.cat || !fDep.montant} style={{ marginTop: 20 }}>{isEdit ? "Enregistrer les modifications" : "Enregistrer la dépense"}</Button>
        </Card>
      </div>
    );
  }

  // ─── Ajouter / modifier une vente ───
  if ((screen === "addVen" || screen === "editVen") && bande && !isTerminee) {
    const isEdit = screen === "editVen";
    const cancel = () => { setScreen("detail"); setEditVenId(null); setFVen(emptyVen()); };
    const setQty = (q) => setFVen((f) => ({ ...f, qty: q }));
    const setPrix = (p) => setFVen((f) => ({ ...f, prixUnit: p }));
    return (
      <div className="tone-green">
        <PageHeader tone="green" icon={Banknote} title={isEdit ? "Modifier la vente" : "Nouvelle vente"} subtitle={bande.nom} onBack={cancel} backLabel="Bande" />
        <Card className="narrow">
          <Field label="Produit vendu"><input className="input" placeholder="Ex. : poulets vifs, œufs…" value={fVen.produit} onChange={(e) => setFVen((f) => ({ ...f, produit: e.target.value }))} /></Field>
          <div className="grid-2" style={{ marginTop: 16 }}>
            <Field label="Quantité" optional><input type="number" inputMode="numeric" className="input" placeholder="50" value={fVen.qty} onChange={(e) => setQty(e.target.value)} /></Field>
            <Field label="Prix unitaire (F)" optional><input type="number" inputMode="numeric" className="input" placeholder="2500" value={fVen.prixUnit} onChange={(e) => setPrix(e.target.value)} /></Field>
          </div>
          <Field label="Montant total encaissé (F)" style={{ marginTop: 16 }}>
            <input type="number" inputMode="numeric" className="input tinted" placeholder="Montant total reçu" value={autoMont || fVen.montant} readOnly={!!autoMont} onChange={(e) => setFVen((f) => ({ ...f, montant: e.target.value }))} />
          </Field>
          {autoMont && <div className="xsmall muted" style={{ marginTop: 6 }}>Calculé automatiquement : quantité × prix unitaire.</div>}
          <div className="grid-2" style={{ marginTop: 16 }}>
            <Field label="Date de vente"><input type="date" className="input" value={fVen.date} onChange={(e) => setFVen((f) => ({ ...f, date: e.target.value }))} /></Field>
            <Field label="Remarque" optional><input className="input" placeholder="Acheteur, conditions…" value={fVen.remarque} onChange={(e) => setFVen((f) => ({ ...f, remarque: e.target.value }))} /></Field>
          </div>
          <Button block tone="green" icon={Check} onClick={isEdit ? updateVen : addVen} disabled={!fVen.produit || (!fVen.montant && !autoMont)} style={{ marginTop: 20 }}>{isEdit ? "Enregistrer les modifications" : "Enregistrer la vente"}</Button>
        </Card>
      </div>
    );
  }

  // ─── Détail d'une bande ───
  if (screen === "detail" && bande) {
    const td = totalDep(bande), tv = totalVent(bande);
    const editDep = (d) => { setEditDepId(d.id); setFDep({ cat: d.cat, description: d.description || "", montant: String(d.montant), date: d.date }); setScreen("editDep"); };
    const editVen = (v) => { setEditVenId(v.id); setFVen({ produit: v.produit, qty: v.qty || "", prixUnit: v.prixUnit || "", montant: String(v.montant), date: v.date, remarque: v.remarque || "" }); setScreen("editVen"); };
    const isDep = tab === "depenses";
    const rows = isDep ? bande.depenses : bande.ventes;
    return (
      <div className="tone-purple">
        <PageHeader tone="purple" icon={Layers} title={bande.nom} subtitle={`${bande.type} · ${bande.effectif} animaux · démarrée le ${fmtDate(bande.date)}`} onBack={() => { setCT(false); setScreen("list"); }} backLabel="Mes bandes"
          meta={isTerminee ? <Badge tone="green" icon={CheckCircle2}>Terminée</Badge> : <Badge tone="orange" icon={RotateCw}>En cours</Badge>}
          actions={<Button variant="secondary" tone="purple" icon={BarChart3} onClick={() => setScreen("bilan")}>Bilan complet</Button>} />
        <div className="stack-lg">
          {isTerminee && <Callout tone="green" icon={Lock}>Bande clôturée : les données sont archivées et ne peuvent plus être modifiées.</Callout>}
          <Totals b={bande} tinted />
          <div className="action-row">
            {!isTerminee && <Button tone="red" icon={Plus} onClick={() => { setFDep(emptyDep()); setScreen("addDep"); }}>Dépense</Button>}
            {!isTerminee && <Button tone="green" icon={Plus} onClick={() => { setFVen(emptyVen()); setScreen("addVen"); }}>Vente</Button>}
            <Button variant="secondary" tone="purple" icon={BarChart3} className="mobile-only" onClick={() => setScreen("bilan")}>Bilan</Button>
          </div>

          <div className="tabs tone-purple">
            <button className={`tab ${isDep ? "on" : ""}`} onClick={() => setTab("depenses")}><Receipt size={16} />Dépenses ({bande.depenses.length})</button>
            <button className={`tab ${!isDep ? "on" : ""}`} onClick={() => setTab("ventes")}><Banknote size={16} />Ventes ({bande.ventes.length})</button>
          </div>

          {rows.length === 0 ? (
            <Empty icon={isDep ? Receipt : Banknote} tone={isDep ? "red" : "green"} title={isDep ? "Aucune dépense enregistrée" : "Aucune vente enregistrée"} text={!isTerminee ? `Appuyez sur « ${isDep ? "Dépense" : "Vente"} » pour en ajouter une.` : undefined} />
          ) : (
            <Card flush tone={isDep ? "red" : "green"}>
              {[...rows].reverse().map((r) => isDep
                ? <TxRow key={r.id} title={catOf(r.cat)?.label} icon={EXPENSE_ICON[r.cat]} sub={[r.description, fmtDate(r.date)].filter(Boolean).join(" · ")} amount={fmtCFA(r.montant)} tone="red" onEdit={!isTerminee && (() => editDep(r))} onDelete={!isTerminee && (() => deleteDep(r))} />
                : <TxRow key={r.id} title={r.produit} icon={Banknote} sub={venteSub(r)} amount={fmtCFA(r.montant)} tone="green" onEdit={!isTerminee && (() => editVen(r))} onDelete={!isTerminee && (() => deleteVen(r))} />)}
              <div className="tx-total"><span>{isDep ? "Total dépenses" : "Total recettes"}</span><span>{fmtCFA(isDep ? td : tv)}</span></div>
            </Card>
          )}

          {!isTerminee && !confirmTerminer && <div><Button variant="ghost" icon={Flag} onClick={() => setCT(true)}>Terminer cette bande</Button></div>}
          {!isTerminee && confirmTerminer && (
            <Card tone="amber" tinted className="narrow">
              <CardTitle icon={AlertTriangle}>Clôturer cette bande ?</CardTitle>
              <div className="small" style={{ marginBottom: 14 }}>Elle sera marquée <strong>Terminée</strong> et ses données seront <strong>verrouillées</strong>. Le bilan restera consultable.</div>
              <div className="row" style={{ gap: 8 }}>
                <Button tone="green" icon={Check} onClick={terminerBande} className="grow">Oui, terminer</Button>
                <Button variant="secondary" tone="slate" onClick={() => setCT(false)} className="grow">Annuler</Button>
              </div>
            </Card>
          )}
          {isTerminee && <div className="small muted row" style={{ gap: 6 }}><Lock size={14} />Bande archivée le {fmtDate(bande.termineeAt)}</div>}
        </div>
      </div>
    );
  }

  // ─── Créer une bande ───
  if (screen === "create") {
    const ok = fBande.nom && fBande.type && fBande.date && fBande.effectif;
    return (
      <div className="tone-purple">
        <PageHeader tone="purple" icon={Plus} title="Nouvelle bande" subtitle="Un lot d'animaux élevés ensemble" onBack={() => setScreen("list")} backLabel="Trésorerie" />
        <Card className="narrow">
          <Field label="Nom de la bande"><input className="input" placeholder="Ex. : Bande chair mai 2026" value={fBande.nom} onChange={(e) => setFBande((f) => ({ ...f, nom: e.target.value }))} /></Field>
          <div style={{ marginTop: 16 }}>
            <span className="label">Type d'élevage</span>
            <div className="choices three">
              {BANDE_TYPES.map((t) => <Choice key={t} tone="purple" on={fBande.type === t} label={t} onClick={() => setFBande((f) => ({ ...f, type: t }))} />)}
            </div>
          </div>
          <div className="grid-2" style={{ marginTop: 16 }}>
            <Field label="Date de démarrage"><input type="date" className="input" value={fBande.date} onChange={(e) => setFBande((f) => ({ ...f, date: e.target.value }))} /></Field>
            <Field label="Effectif (animaux)"><input type="number" inputMode="numeric" className="input" placeholder="Ex. : 500" value={fBande.effectif} onChange={(e) => setFBande((f) => ({ ...f, effectif: e.target.value }))} /></Field>
          </div>
          <Button block tone="purple" icon={Check} onClick={createBande} disabled={!ok} style={{ marginTop: 20 }}>Créer la bande</Button>
        </Card>
      </div>
    );
  }

  // ─── Liste des bandes ───
  const enCours = list.filter((b) => b.status !== "terminee");
  const terminees = list.filter((b) => b.status === "terminee");
  const open = (b) => { setBandeId(b.id); setCT(false); setScreen("detail"); setTab("depenses"); };
  const global = { dep: list.reduce((s, b) => s + totalDep(b), 0), ven: list.reduce((s, b) => s + totalVent(b), 0) };
  const gb = global.ven - global.dep;
  return (
    <div className="tone-purple">
      <PageHeader tone="purple" icon={Wallet} title="Trésorerie" subtitle="Dépenses, ventes et bénéfice de chaque bande" onBack={onBack} backLabel="Accueil"
        actions={<Button tone="purple" icon={Plus} onClick={() => setScreen("create")}>Nouvelle bande</Button>} />
      <div className="stack-lg">
        <div className="mobile-only"><Button block tone="purple" icon={Plus} onClick={() => setScreen("create")}>Nouvelle bande</Button></div>
        {list.length === 0 ? (
          <Empty icon={Wallet} tone="purple" title="Aucune bande pour l'instant" text="Créez votre première bande pour suivre ses dépenses, ses ventes et son bénéfice." />
        ) : (
          <>
            <div className="grid-3">
              <Stat icon={Receipt} tone="red" label="Total investi" value={fmtCFA(global.dep)} />
              <Stat icon={Banknote} tone="green" label="Total récolté" value={fmtCFA(global.ven)} />
              <Stat icon={gb >= 0 ? TrendingUp : TrendingDown} tone={gb >= 0 ? "green" : "red"} label={gb >= 0 ? "Bénéfice global" : "Perte globale"} value={fmtCFA(Math.abs(gb))} />
            </div>
            {enCours.length > 0 && (
              <section>
                <div className="section-label">En cours · {enCours.length}</div>
                <div className="grid-cards">{enCours.map((b) => <BandeCard key={b.id} b={b} onClick={() => open(b)} />)}</div>
              </section>
            )}
            {terminees.length > 0 && (
              <section>
                <div className="section-label">Terminées · {terminees.length}</div>
                <div className="grid-cards">{terminees.map((b) => <BandeCard key={b.id} b={b} onClick={() => open(b)} />)}</div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}

const venteSub = (v) => [v.qty && `${v.qty} unités`, v.prixUnit && `${fmtCFA(v.prixUnit)}/u`, fmtDate(v.date), v.remarque].filter(Boolean).join(" · ");

function TxRow({ icon: I = Receipt, title, sub, amount, tone, onEdit, onDelete }) {
  return (
    <div className={`tx tone-${tone}`}>
      <IconTile icon={I} tone={tone} size="sm" />
      <div className="grow">
        <div className="tx-title">{title}</div>
        {sub && <div className="tx-sub">{sub}</div>}
      </div>
      <div className="tx-right">
        <div className="tx-amount">{amount}</div>
        {(onEdit || onDelete) && (
          <div className="row" style={{ gap: 2 }}>
            {onEdit && <button className="icon-btn edit" title="Modifier" onClick={onEdit}><Pencil size={16} /></button>}
            {onDelete && <button className="icon-btn danger" title="Supprimer" onClick={onDelete}><Trash2 size={16} /></button>}
          </div>
        )}
      </div>
    </div>
  );
}
