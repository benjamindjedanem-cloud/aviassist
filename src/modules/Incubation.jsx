import { useState, useEffect } from "react";
import {
  Egg, Plus, History, CalendarDays, Thermometer, Droplets, RotateCw, Clock, Bell, Sparkles,
  Lightbulb, Flame, Sun, AlertTriangle, GraduationCap, ChevronRight, Check, Trophy, CheckCircle2,
  Hourglass, Settings2, ClipboardList,
} from "lucide-react";
import { EGG_TYPES, AMBIENT_TEMPS, adaptPhases, addDays, fmtDate, genId } from "../data.js";
import { useCollection } from "../store.jsx";
import {
  PageHeader, Card, CardTitle, Button, Badge, Field, Choice, KV, Callout, Empty, IconTile, Stat,
  SPECIES_STYLE, AMBIENT_ICON, AMBIENT_TONE, useScrollTop,
} from "../ui.jsx";

function getEclosionFeedback(rate, minRate) {
  if (rate >= 85) return { label: "Excellent résultat", tone: "green", icon: Trophy, msg: `Félicitations ! Un taux de ${rate}% est exceptionnel. Vos paramètres sont parfaitement maîtrisés.` };
  if (rate >= minRate) return { label: "Bon résultat", tone: "green", icon: CheckCircle2, msg: `Un taux de ${rate}% est dans les standards. Bon travail ! Consultez la section Formations pour progresser encore.` };
  if (rate >= 40) return { label: "En dessous des standards", tone: "orange", icon: AlertTriangle, msg: `Un taux de ${rate}% est en dessous du minimum (${minRate}%). Vérifiez : stabilité de la température, humidité, qualité des géniteurs. La section Formations propose des pistes.` };
  return { label: "Taux très faible", tone: "red", icon: AlertTriangle, msg: `Un taux de ${rate}% est très préoccupant. Vérifiez : calibration thermomètre/hygromètre, qualité des reproducteurs, conservation des œufs. La section Formations peut aider.` };
}

const INCUB_BACK = { result: "new", history: "home", histDetail: "history", eclosionEntry: "histDetail" };
const speciesOf = (type) => SPECIES_STYLE[type] || { icon: Egg, tone: "amber" };

// Dates clés communes au résultat et au détail.
function KeyDates({ item, egg }) {
  return (
    <>
      <KV k="Mise en incubation" v={fmtDate(item.form.dateStart)} />
      {item.mirages?.map((m) => <KV key={m.day} k={`Mirage (J${m.day})`} v={fmtDate(m.date)} />)}
      {egg.humid && <KV k={`Humidification externe (J${egg.humid[0]}–J${egg.humid[1]})`} v={`${fmtDate(item.humidStart)} – ${fmtDate(item.humidEnd)}`} />}
      <KV k={`Arrêt du retournement (J${egg.stopTurn})`} v={fmtDate(item.stopDate)} />
      <KV k={`Début d'éclosion (J${egg.eclosionStart})`} v={fmtDate(item.eclosionStart)} />
      <KV k={`Fenêtre d'éclosion (J${egg.eclosionWindow[0]}–J${egg.eclosionWindow[1]})`} v={`${fmtDate(item.eclosionStart)} – ${fmtDate(item.eclosionEnd)}`} accent />
    </>
  );
}

export default function IncubationModule({ onBack, registerBack }) {
  const [screen, setScreen] = useState("home");
  const [form, setForm] = useState({ type: "", dateStart: "", qty: "", ambientTemp: "" });
  const [hist, saveHist] = useCollection("incubations");
  const [selHist, setSelHist] = useState(null);
  const [eclosionInput, setEI] = useState("");
  useScrollTop(screen);

  useEffect(() => {
    if (screen === "home") registerBack(null);
    else registerBack(() => { setScreen(INCUB_BACK[screen] || "home"); return true; });
  }, [screen, registerBack]);

  const list = hist || [];

  const calculate = () => {
    const egg = EGG_TYPES[form.type];
    if (!egg || !form.dateStart || !form.qty || !form.ambientTemp) return;
    const start = new Date(form.dateStart);
    const item = { id: genId(), form: { ...form }, eclosion: addDays(start, egg.days).toISOString(), eclosionStart: addDays(start, egg.eclosionStart - 1).toISOString(), eclosionEnd: addDays(start, egg.eclosionWindow[1] - 1).toISOString(), mirages: egg.mirage.map((d) => ({ day: d, date: addDays(start, d - 1).toISOString() })), stopDate: addDays(start, egg.stopTurn - 1).toISOString(), humidStart: egg.humid ? addDays(start, egg.humid[0] - 1).toISOString() : null, humidEnd: egg.humid ? addDays(start, egg.humid[1] - 1).toISOString() : null, at: new Date().toISOString() };
    saveHist([item, ...list].slice(0, 20));
    setSelHist(item); setScreen("result");
  };

  const saveEclosion = () => {
    if (!selHist || !eclosionInput) return;
    const hatched = parseInt(eclosionInput), total = parseInt(selHist.form.qty);
    const rate = Math.round(hatched / total * 100);
    const updated = { ...selHist, eclosionResult: { hatched, total, rate, savedAt: new Date().toISOString() } };
    saveHist(list.map((h) => (h.id === selHist.id ? updated : h)));
    setSelHist(updated); setEI(""); setScreen("histDetail");
  };

  const status = (h) => {
    const now = new Date();
    const isActive = now < new Date(h.eclosion);
    const day = Math.floor((now - new Date(h.form?.dateStart)) / 86400000) + 1;
    return { isActive, day, hasResult: !!h.eclosionResult, isComplete: !isActive && !h.eclosionResult };
  };

  // ─── Saisie du résultat d'éclosion ───
  if (screen === "eclosionEntry" && selHist) {
    const egg = EGG_TYPES[selHist.form.type], total = parseInt(selHist.form.qty);
    const n = parseInt(eclosionInput);
    const valid = eclosionInput && n <= total;
    return (
      <div className="tone-amber">
        <PageHeader tone="amber" icon={Egg} title="Résultat d'éclosion" subtitle={`${egg?.name} · ${total} œufs`} onBack={() => setScreen("histDetail")} backLabel="Détail" />
        <Card className="narrow">
          <Field label={`Nombre de ${egg?.youngName || "animaux"} éclos`}>
            <input className="input big center" inputMode="numeric" placeholder={`Ex. : ${Math.round(total * 0.75)}`} value={eclosionInput} onChange={(e) => setEI(e.target.value.replace(/[^0-9]/g, ""))} />
          </Field>
          <div className="small muted" style={{ textAlign: "center", margin: "8px 0 16px" }}>sur {total} œufs mis en incubation</div>
          {valid && (
            <div className="stat tinted tone-amber" style={{ textAlign: "center", marginBottom: 16 }}>
              <div className="stat-label" style={{ justifyContent: "center" }}>Taux d'éclosion</div>
              <div className="hero-number">{Math.round(n / total * 100)}%</div>
            </div>
          )}
          {eclosionInput && n > total && <Callout tone="red" icon={AlertTriangle}>Le nombre d'éclos ne peut pas dépasser {total}.</Callout>}
          <Button block tone="amber" icon={Check} onClick={saveEclosion} disabled={!valid} style={{ marginTop: 12 }}>Enregistrer le résultat</Button>
        </Card>
      </div>
    );
  }

  // ─── Détail d'une incubation ───
  if (screen === "histDetail" && selHist) {
    const egg = EGG_TYPES[selHist.form.type];
    const sp = speciesOf(selHist.form.type);
    const { isActive, day, hasResult, isComplete } = status(selHist);
    const fb = hasResult && getEclosionFeedback(selHist.eclosionResult.rate, egg?.minRate || 65);
    return (
      <div className="tone-amber">
        <PageHeader tone={sp.tone} icon={sp.icon} title={egg?.name} subtitle={`${selHist.form.qty} œufs · mis le ${fmtDate(selHist.form.dateStart)}`} onBack={() => setScreen("history")} backLabel="Historique"
          meta={<>
            {isActive && <Badge tone="green" icon={RotateCw}>Jour {day} en cours</Badge>}
            {isComplete && <Badge tone="orange" icon={Hourglass}>Résultat à saisir</Badge>}
            {hasResult && <Badge tone="blue" icon={CheckCircle2}>Résultat enregistré</Badge>}
          </>} />
        <div className="grid-cards">
          <div className="stack">
            {isActive && (
              <Card tone="green" tinted>
                <CardTitle icon={CalendarDays}>Aujourd'hui</CardTitle>
                <KV k="Avancement" v={`Jour ${day} / ${egg?.days}`} accent />
                <KV k="Éclosion prévue" v={fmtDate(selHist.eclosion)} />
                {day <= (egg?.stopTurn || 18)
                  ? <KV k="Retournements du jour" v={egg?.turnHours?.join(" · ") || "—"} />
                  : <KV k="Retournement" v="Arrêté" />}
              </Card>
            )}
            {fb && (
              <Card tone={fb.tone} tinted>
                <CardTitle icon={fb.icon}>{fb.label}</CardTitle>
                <div className="hero-number">{selHist.eclosionResult.rate}%</div>
                <div className="small muted" style={{ margin: "4px 0 10px" }}>{selHist.eclosionResult.hatched} éclos sur {selHist.eclosionResult.total} œufs</div>
                <div className="small">{fb.msg}</div>
              </Card>
            )}
            {isComplete && <Button block tone="amber" icon={Egg} onClick={() => { setEI(""); setScreen("eclosionEntry"); }}>Enregistrer le résultat d'éclosion</Button>}
          </div>
          <Card tone="amber">
            <CardTitle icon={CalendarDays}>Dates clés</CardTitle>
            {egg && <KeyDates item={selHist} egg={egg} />}
          </Card>
        </div>
      </div>
    );
  }

  // ─── Historique ───
  if (screen === "history") {
    return (
      <div className="tone-amber">
        <PageHeader tone="amber" icon={History} title="Historique" subtitle={`${list.length} incubation${list.length > 1 ? "s" : ""}`} onBack={() => setScreen("home")} backLabel="Incubation" />
        {list.length === 0 ? (
          <Empty icon={ClipboardList} tone="amber" title="Aucune incubation enregistrée" text="Lancez une nouvelle incubation pour obtenir votre calendrier personnalisé." />
        ) : (
          <div className="grid-cards">
            {list.map((h) => {
              const egg = EGG_TYPES[h.form?.type];
              const sp = speciesOf(h.form?.type);
              const st = status(h);
              return (
                <Card key={h.id} onClick={() => { setSelHist(h); setScreen("histDetail"); }}>
                  <div className="row" style={{ alignItems: "flex-start" }}>
                    <IconTile icon={sp.icon} tone={sp.tone} />
                    <div className="grow">
                      <div className="row-between">
                        <div style={{ fontWeight: 700 }}>{egg?.name}</div>
                        {st.isActive ? <Badge tone="green">J{st.day} en cours</Badge> : st.hasResult ? <Badge tone="blue" icon={Check}>{h.eclosionResult.rate}%</Badge> : <Badge tone="orange">Résultat à saisir</Badge>}
                      </div>
                      <div className="small muted" style={{ marginTop: 4 }}>{h.form?.qty} œufs · mis le {fmtDate(h.form?.dateStart)}</div>
                      <div className="small muted">Éclosion : {fmtDate(h.eclosionStart)} – {fmtDate(h.eclosionEnd)}</div>
                    </div>
                    <ChevronRight size={18} className="muted" style={{ alignSelf: "center" }} />
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // ─── Nouvelle incubation ───
  if (screen === "new") {
    const egg = EGG_TYPES[form.type];
    const canCalc = form.type && form.dateStart && form.qty && form.ambientTemp;
    return (
      <div className="tone-amber">
        <PageHeader tone="amber" icon={Plus} title="Nouvelle incubation" subtitle="Renseignez vos œufs, on calcule le calendrier" onBack={() => setScreen("home")} backLabel="Incubation" />
        <Card className="narrow">
          <span className="label">Espèce</span>
          <div className="choices three">
            {Object.entries(EGG_TYPES).map(([k, e]) => {
              const sp = speciesOf(k);
              return <Choice key={k} on={form.type === k} tone="amber" icon={sp.icon} label={e.name} sub={`${e.days} jours`} onClick={() => setForm((f) => ({ ...f, type: k }))} />;
            })}
          </div>
          {egg && (
            <div style={{ marginTop: 12 }}>
              <Callout tone="amber" icon={Lightbulb}><strong>{egg.days} jours</strong> · mirage J{egg.mirage.join(", J")} · arrêt du retournement J{egg.stopTurn} · {egg.turnsPerDay} retournements par jour</Callout>
            </div>
          )}
          <div className="grid-2" style={{ marginTop: 16 }}>
            <Field label="Date de mise en incubation"><input type="date" className="input" value={form.dateStart} onChange={(e) => setForm((f) => ({ ...f, dateStart: e.target.value }))} /></Field>
            <Field label="Nombre d'œufs"><input type="number" inputMode="numeric" className="input" placeholder="Ex. : 100" value={form.qty} onChange={(e) => setForm((f) => ({ ...f, qty: e.target.value }))} /></Field>
          </div>
          <div style={{ marginTop: 16 }}>
            <span className="label">Température de votre salle</span>
            <div className="choices one">
              {AMBIENT_TEMPS.map((a) => (
                <Choice key={a.id} on={form.ambientTemp === a.id} tone={AMBIENT_TONE[a.id]} icon={AMBIENT_ICON[a.id]} label={a.label}
                  sub={a.mode === "chaud" ? "Paramètres ajustés automatiquement" : a.mode === "extreme" ? "Mode forte chaleur" : "Paramètres standards"}
                  onClick={() => setForm((f) => ({ ...f, ambientTemp: a.id }))} />
              ))}
            </div>
          </div>
          <Button block tone="amber" onClick={calculate} disabled={!canCalc} style={{ marginTop: 20 }}>Calculer mon incubation <ChevronRight size={18} /></Button>
        </Card>
      </div>
    );
  }

  // ─── Résultat du calcul ───
  if (screen === "result" && selHist) {
    const egg = EGG_TYPES[selHist.form.type];
    const sp = speciesOf(selHist.form.type);
    const at = AMBIENT_TEMPS.find((a) => a.id === selHist.form.ambientTemp) || AMBIENT_TEMPS[0];
    const AtIcon = AMBIENT_ICON[at.id];
    const adaptedPhases = adaptPhases(egg.phases, at.id);
    return (
      <div className="tone-amber">
        <PageHeader tone={sp.tone} icon={sp.icon} title={`Incubation ${egg.name}`} subtitle={`${selHist.form.qty} œufs · salle ${at.label}`} onBack={() => setScreen("new")} backLabel="Modifier"
          meta={<Badge tone="green" icon={Check}>Enregistrée dans l'historique</Badge>} />
        <div className="stack-lg">
          {at.mode === "chaud" && <Callout tone="orange" icon={Flame} title="Chaleur ambiante (36–38°C)">Paramètres <strong>automatiquement ajustés</strong>. Surveillez la température interne toutes les 2–3 h. Si elle dépasse 37,8°C, ajoutez de l'eau fraîche dans les bacs. Ne versez jamais d'eau froide directement sur les œufs.</Callout>}
          {at.mode === "extreme" && <Callout tone="red" icon={Sun} title="Forte chaleur (39°C et plus)">Le risque de surchauffe embryonnaire devient <strong>critique</strong>. Surveillez toutes les heures et ventilez fortement la salle. Des glaçons dans les bacs peuvent aider — jamais au contact des œufs.</Callout>}

          <div className="grid-cards">
            <Card tone="amber">
              <CardTitle icon={CalendarDays}>Dates clés</CardTitle>
              <KeyDates item={selHist} egg={egg} />
              <div style={{ marginTop: 12 }}><Callout tone="blue" icon={Lightbulb}>La fenêtre d'éclosion peut varier de 1 à 2 jours selon la stabilité de la température.</Callout></div>
            </Card>

            <Card tone="amber">
              <CardTitle icon={Settings2}>Paramètres recommandés</CardTitle>
              {at.id !== "standard" && <div style={{ marginBottom: 10 }}><Badge tone={AMBIENT_TONE[at.id]} icon={AtIcon}>Adaptés à une salle à {at.label}</Badge></div>}
              <div className="stack">
                {adaptedPhases.map((p, i) => (
                  <div key={i} className="stat" style={{ background: "var(--surface-2)" }}>
                    <div style={{ fontWeight: 700, fontSize: 13.5, color: "var(--amber)" }}>{p.label}</div>
                    <div className="row" style={{ gap: 18, marginTop: 6, flexWrap: "wrap" }}>
                      <span className="row" style={{ gap: 6 }}><Thermometer size={16} className="muted" /><strong>{p.temp}</strong></span>
                      <span className="row" style={{ gap: 6 }}><Droplets size={16} className="muted" /><strong>{p.hum}</strong></span>
                    </div>
                    {p.note && <div className="xsmall" style={{ color: "var(--orange)", fontWeight: 600, marginTop: 6 }}>{p.note}</div>}
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 14 }}>
                <KV k="Retournements" v={`${egg.turnsPerDay} par jour`} />
                <div className="row" style={{ gap: 6, flexWrap: "wrap", marginTop: 4 }}>
                  {egg.turnHours.map((h) => <Badge key={h} tone="amber" icon={Clock}>{h}</Badge>)}
                </div>
              </div>
              <div style={{ marginTop: 14 }}><Callout tone="green" icon={Lightbulb} title="En pratique">2 retournements réguliers par jour (matin et soir) donnent aussi de bons résultats. La régularité compte plus que le nombre.</Callout></div>
            </Card>
          </div>

          <div className="grid-cards">
            <Card tone="amber">
              <CardTitle icon={Bell}>Rappels importants</CardTitle>
              <ol className="timeline tone-amber">
                {egg.tips.map((t, i) => <li key={i}><span className="day-chip">J{t.day}</span><span>{t.text}</span></li>)}
              </ol>
            </Card>
            <div className="stack">
              <Card tone="green" tinted>
                <CardTitle icon={Sparkles}>À retenir pour cette espèce</CardTitle>
                <ul className="bullets tone-green">
                  {egg.specialTips.map((t, i) => <li key={i}><Check size={15} strokeWidth={2.6} />{t}</li>)}
                </ul>
              </Card>
              <Callout tone="blue" icon={GraduationCap} title="Formations">Des tutoriels gratuits sur le mirage et le démarrage des poussins sont disponibles dans la section Formations.</Callout>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── Accueil du module ───
  const active = list.filter((h) => status(h).isActive).length;
  const pending = list.filter((h) => status(h).isComplete).length;
  const withRate = list.filter((h) => h.eclosionResult);
  const avg = withRate.length ? Math.round(withRate.reduce((s, h) => s + h.eclosionResult.rate, 0) / withRate.length) : null;
  return (
    <div className="tone-amber">
      <PageHeader tone="amber" icon={Egg} title="Incubation" subtitle="Un calendrier précis pour chaque incubation" onBack={onBack} backLabel="Accueil"
        actions={<Button tone="amber" icon={Plus} onClick={() => { setForm({ type: "", dateStart: "", qty: "", ambientTemp: "" }); setScreen("new"); }}>Nouvelle incubation</Button>} />
      <div className="stack-lg">
        <div className="grid-3">
          <Stat label="En cours" value={active} tone="green" />
          <Stat label="Résultat à saisir" value={pending} tone={pending ? "orange" : undefined} />
          <Stat label="Taux moyen" value={avg === null ? "—" : `${avg}%`} tone="amber" />
        </div>
        <div className="grid-2 mobile-only" style={{ gridTemplateColumns: "1fr" }}>
          <Button block tone="amber" icon={Plus} onClick={() => { setForm({ type: "", dateStart: "", qty: "", ambientTemp: "" }); setScreen("new"); }}>Nouvelle incubation</Button>
        </div>
        <Card onClick={() => setScreen("history")}>
          <div className="row">
            <IconTile icon={History} tone="amber" />
            <div className="grow"><div style={{ fontWeight: 700 }}>Historique des incubations</div><div className="small muted">{list.length} enregistrée{list.length > 1 ? "s" : ""} · dates clés et résultats</div></div>
            <ChevronRight size={18} className="muted" />
          </div>
        </Card>
        <Callout tone="green" icon={Lightbulb} title="Le saviez-vous ?">Un taux d'éclosion de <strong>70–85%</strong> est excellent. L'application adapte automatiquement les paramètres selon la chaleur de votre salle.</Callout>
      </div>
    </div>
  );
}
