import { useState, useEffect } from "react";
import { Wheat, ChevronRight, ChevronLeft, Lightbulb, BarChart3, ClipboardList, AlertTriangle, Siren, ArrowRight, Plus, Calculator, ListChecks } from "lucide-react";
import { INGREDIENT_CATS, INGREDIENTS, FEED_TARGETS, FEED_TYPE_PHASES, formuler, targetMin, targetMax, isRange, fmtTarget, fmtQty } from "../data.js";
import { PageHeader, Card, CardTitle, Button, Field, Choice, Callout, CheckGroup, CheckRow, Badge, INGREDIENT_ICON, useScrollTop } from "../ui.jsx";

const FORM_BACK = { ingredients: "type", result: "ingredients" };
const ALERT_STYLE = {
  critique: { tone: "red", icon: Siren, title: "Bloquant" },
  important: { tone: "orange", icon: AlertTriangle, title: "Important" },
  warning: { tone: "amber", icon: Lightbulb, title: "Conseil" },
};
const catOf = (id) => INGREDIENT_CATS.find((c) => c.id === id);

export default function FormuleModule({ onBack, registerBack }) {
  const [screen, setScreen] = useState("home");
  const [animalType, setAnimalType] = useState("");
  const [phase, setPhase] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [openCat, setOpenCat] = useState("energetique");
  const [quantity, setQuantity] = useState("");
  const [result, setResult] = useState(null);
  useScrollTop(screen);

  useEffect(() => {
    if (screen === "home") registerBack(null);
    else registerBack(() => { setScreen(FORM_BACK[screen] || "home"); return true; });
  }, [screen, registerBack]);

  const toggleIng = (id) => setSelectedIds((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  const calculate = () => {
    if (!phase || !quantity || !selectedIds.length) return;
    setResult(formuler(selectedIds, phase, parseFloat(quantity)));
    setScreen("result");
  };
  const restart = () => { setSelectedIds([]); setPhase(""); setAnimalType(""); setQuantity(""); setScreen("type"); };

  // ─── Résultat ───
  if (screen === "result" && result) {
    const targetInfo = FEED_TARGETS[phase];
    const hasCritique = result.alerts.some((a) => a.level === "critique");
    const a = result.achieved, t = result.target;
    const values = [
      { label: "Énergie", achieved: Math.round(a.energy) + " kcal/kg", raw: t.energy, unit: " kcal/kg", dec: 0, ok: a.energy >= targetMin(t.energy) * 0.9 && a.energy <= (isRange(t.energy) ? targetMax(t.energy) : Infinity) },
      { label: "Protéines", achieved: a.protein.toFixed(1) + "%", raw: t.protein, unit: "%", dec: 1, ok: a.protein >= targetMin(t.protein) * 0.9 },
      { label: "Calcium", achieved: a.calcium.toFixed(2) + "%", raw: t.calcium, unit: "%", dec: 2, ok: a.calcium >= targetMin(t.calcium) * 0.9 },
      { label: "Phosphore", achieved: a.phosphorus.toFixed(2) + "%", raw: t.phosphorus, unit: "%", dec: 2, ok: a.phosphorus >= targetMin(t.phosphorus) * 0.9 },
      { label: "Méthionine", achieved: a.methionine.toFixed(2) + "%", raw: t.methionine || 0, unit: "%", dec: 2, ok: a.methionine >= targetMin(t.methionine || 0) * 0.9 },
      { label: "Lysine", achieved: a.lysine.toFixed(2) + "%", raw: t.lysine || 0, unit: "%", dec: 2, ok: a.lysine >= targetMin(t.lysine || 0) * 0.9 },
    ];
    return (
      <div className="tone-orange">
        <PageHeader tone="orange" icon={Calculator} title="Formule calculée" subtitle={`${targetInfo?.label} · ${quantity} kg`} onBack={() => setScreen("ingredients")} backLabel="Modifier" />
        <div className="stack-lg">
          {result.alerts.length > 0 && (
            <div className="stack">
              {result.alerts.map((al, i) => {
                const s = ALERT_STYLE[al.level] || ALERT_STYLE.warning;
                return (
                  <Callout key={i} tone={s.tone} icon={s.icon} title={s.title}>
                    <div>{al.msg}</div>
                    <div className="row" style={{ gap: 6, marginTop: 6, fontWeight: 600, alignItems: "flex-start" }}><ArrowRight size={15} style={{ marginTop: 3, color: "var(--t)" }} /><span>{al.action}</span></div>
                    {al.consequence && <div className="xsmall muted" style={{ marginTop: 6, fontStyle: "italic" }}>Sans action : {al.consequence}</div>}
                  </Callout>
                );
              })}
            </div>
          )}

          {!hasCritique && result.formula && (
            <>
              <div className="grid-cards">
                <Card flush>
                  <div style={{ padding: "16px 16px 4px" }}>
                    <CardTitle icon={ClipboardList}>Formule pour {quantity} kg de provende</CardTitle>
                  </div>
                  <table className="table">
                    <thead><tr><th>Ingrédient</th><th className="num">%</th><th className="num">Quantité</th></tr></thead>
                    <tbody>
                      {result.formula.map((ing, i) => {
                        const cat = catOf(ing.family);
                        return (
                          <tr key={i}>
                            <td><div style={{ fontWeight: 700 }}>{ing.name}</div><div className="xsmall" style={{ color: cat?.color, fontWeight: 600 }}>{cat?.label}</div></td>
                            <td className="num">{ing.pct}%</td>
                            <td className="num" style={{ color: "var(--green)" }}>{fmtQty(ing.qtyKg)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot><tr><td>Total</td><td className="num">100%</td><td className="num" style={{ color: "var(--green)" }}>{fmtQty(parseFloat(quantity))}</td></tr></tfoot>
                  </table>
                </Card>

                <Card>
                  <CardTitle icon={BarChart3}>Valeurs nutritionnelles estimées</CardTitle>
                  <div className="grid-2">
                    {values.map((v, i) => (
                      <div key={i} className={`stat ${v.ok ? "tone-green" : "tinted tone-orange"}`}>
                        <div className="stat-label">{v.label}</div>
                        <div className="stat-value">{v.achieved}</div>
                        <div className="stat-sub">Cible : {fmtTarget(v.raw, v.unit, v.dec)}</div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
              <Callout tone="orange" icon={AlertTriangle} title="Important">Cette formule est une <strong>estimation de base</strong>. Les valeurs réelles dépendent de la qualité de vos ingrédients. Faites-la valider par un technicien ou un vétérinaire avant une utilisation à grande échelle.</Callout>
              <Button tone="orange" icon={Plus} onClick={restart}>Calculer une nouvelle formule</Button>
            </>
          )}
          {hasCritique && <Button tone="orange" icon={ChevronLeft} onClick={() => setScreen("ingredients")}>Corriger ma sélection</Button>}
        </div>
      </div>
    );
  }

  // ─── Ingrédients ───
  if (screen === "ingredients") {
    return (
      <div className="tone-orange">
        <PageHeader tone="orange" icon={ListChecks} title="Ingrédients disponibles" subtitle={`${FEED_TARGETS[phase]?.label} · ${selectedIds.length} sélectionné${selectedIds.length > 1 ? "s" : ""}`} onBack={() => setScreen("type")} />
        <div className="stack-lg">
          <Callout tone="orange" icon={Lightbulb}>Cochez uniquement les ingrédients <strong>disponibles dans votre localité</strong>. L'outil adapte automatiquement les proportions.</Callout>
          <div>
            {INGREDIENT_CATS.map((cat) => {
              const ings = INGREDIENTS.filter((i) => i.family === cat.id);
              return (
                <CheckGroup key={cat.id} tone="orange" icon={INGREDIENT_ICON[cat.id] || Wheat} title={cat.label}
                  count={ings.filter((i) => selectedIds.includes(i.id)).length} total={ings.length}
                  open={openCat === cat.id} onToggle={() => setOpenCat(openCat === cat.id ? null : cat.id)}>
                  {ings.map((ing) => <CheckRow key={ing.id} on={selectedIds.includes(ing.id)} onClick={() => toggleIng(ing.id)} title={ing.name} sub={`Protéines ${ing.protein}% · max. ${ing.maxPct}%`} />)}
                </CheckGroup>
              );
            })}
          </div>
          {selectedIds.length > 0 && (
            <Card tone="orange" className="narrow">
              <Field label="Quantité à produire (kg)">
                <input type="number" inputMode="decimal" className="input big" placeholder="Ex. : 50" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
              </Field>
              <Button block tone="orange" onClick={calculate} disabled={!quantity} style={{ marginTop: 16 }}>Calculer la formule <ChevronRight size={18} /></Button>
            </Card>
          )}
        </div>
      </div>
    );
  }

  // ─── Type d'élevage ───
  if (screen === "type") {
    return (
      <div className="tone-orange">
        <PageHeader tone="orange" icon={Wheat} title="Type d'élevage et phase" subtitle="Étape 1 sur 3" onBack={() => setScreen("home")} backLabel="Formule" />
        <Card className="narrow">
          <span className="label">Type d'animal</span>
          <div className="choices">
            {Object.entries(FEED_TYPE_PHASES).map(([k, t]) => <Choice key={k} tone="orange" on={animalType === k} label={t.label} onClick={() => { setAnimalType(k); setPhase(""); }} />)}
          </div>
          {animalType && (
            <div style={{ marginTop: 18 }}>
              <span className="label">Phase d'élevage</span>
              <div className="choices one">
                {FEED_TYPE_PHASES[animalType].phases.map((p) => (
                  <Choice key={p.id} tone="orange" on={phase === p.id} label={p.label} sub={`Protéines cible : ${fmtTarget(FEED_TARGETS[p.id]?.protein, "%", 1)}`} onClick={() => setPhase(p.id)} />
                ))}
              </div>
            </div>
          )}
          <Button block tone="orange" onClick={() => setScreen("ingredients")} disabled={!phase} style={{ marginTop: 20 }}>Choisir les ingrédients <ChevronRight size={18} /></Button>
        </Card>
      </div>
    );
  }

  // ─── Accueil du module ───
  const steps = ["Choisissez le type d'animal et la phase d'élevage", "Cochez les ingrédients disponibles chez vous", "Indiquez la quantité à produire", "L'application calcule votre formule en kg"];
  return (
    <div className="tone-orange">
      <PageHeader tone="orange" icon={Wheat} title="Formule alimentaire" subtitle="Calculez votre provende maison avec vos ingrédients" onBack={onBack} backLabel="Accueil"
        actions={<Button tone="orange" icon={Calculator} onClick={() => setScreen("type")}>Calculer une formule</Button>} />
      <div className="stack-lg">
        <div className="mobile-only"><Button block tone="orange" icon={Calculator} onClick={() => setScreen("type")}>Calculer une formule</Button></div>
        <div className="grid-cards">
          <Card>
            <CardTitle icon={Lightbulb}>Comment ça marche ?</CardTitle>
            <ol className="timeline tone-orange">
              {steps.map((s, i) => <li key={i}><span className="day-chip" style={{ minWidth: 24 }}>{i + 1}</span><span>{s}</span></li>)}
            </ol>
          </Card>
          <Card>
            <CardTitle icon={BarChart3}>Rations disponibles</CardTitle>
            {Object.values(FEED_TYPE_PHASES).map((t, i) => (
              <div key={i} className="kv"><span>{t.label}</span><Badge tone="orange">{t.phases.length} phases</Badge></div>
            ))}
          </Card>
        </div>
      </div>
    </div>
  );
}
