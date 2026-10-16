import { useState, useEffect } from "react";
import { Stethoscope, Search, Library, ShieldAlert, ShieldCheck, Zap, Pill, Siren, FileText, Phone, Star, GraduationCap, ChevronRight, Check, AlertTriangle, SearchX } from "lucide-react";
import { SYMPTOM_CATS, SYMPTOMS_V2, DISEASES_V2, diagnose } from "../data.js";
import { PageHeader, Card, CardTitle, Button, Badge, Callout, CheckGroup, CheckRow, Empty, IconTile, SYMPTOM_ICON, useScrollTop } from "../ui.jsx";

const MAL_BACK = { symptoms: "home", results: "symptoms", library: "home" };

// Gravité → ton de couleur (le libellé exact vient des données).
const severityTone = (s = "") => {
  const v = s.toLowerCase();
  if (v.includes("critique")) return "red";
  if (v.includes("élev")) return "orange";
  return "amber";
};

function Disclaimer() {
  return <Callout tone="red" icon={ShieldAlert} title="Avertissement">Ces informations sont des <strong>conseils préliminaires</strong>. Elles ne remplacent jamais un diagnostic vétérinaire professionnel.</Callout>;
}

function VetCard({ text }) {
  return (
    <Card tone="purple" tinted>
      <div className="row" style={{ marginBottom: 8 }}>
        <Badge tone="purple" solid icon={Star}>Premium</Badge>
        <span style={{ fontWeight: 700, color: "var(--purple)" }}>Consulter un vétérinaire</span>
      </div>
      <div className="small" style={{ marginBottom: 14 }}>{text}</div>
      <Button block tone="purple" icon={Phone}>Contacter un vétérinaire</Button>
    </Card>
  );
}

export default function MaladiesModule({ onBack, registerBack }) {
  const [screen, setScreen] = useState("home");
  const [selected, setSelected] = useState([]);
  const [results, setResults] = useState([]);
  const [detail, setDetail] = useState(null);
  const [openCat, setOpenCat] = useState("digestifs");
  useScrollTop(detail ? `d-${detail.name}` : screen);

  useEffect(() => {
    if (detail) registerBack(() => { setDetail(null); return true; });
    else if (screen === "home") registerBack(null);
    else registerBack(() => { setScreen(MAL_BACK[screen] || "home"); return true; });
  }, [screen, detail, registerBack]);

  const toggle = (id) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  const analyze = () => { setResults(diagnose(selected)); setScreen("results"); };

  // ─── Fiche maladie ───
  if (detail) {
    const tone = severityTone(detail.severity);
    return (
      <div className="tone-red">
        <PageHeader tone="red" icon={Stethoscope} title={detail.name} onBack={() => setDetail(null)} backLabel={screen === "library" ? "Bibliothèque" : "Résultats"}
          meta={<Badge tone={tone} icon={AlertTriangle}>Gravité : {detail.severity}</Badge>} />
        <div className="stack-lg">
          {detail.special === "grippe" && <Callout tone="red" icon={Siren} title="Cas urgent">Cas potentiellement grave. Contactez immédiatement un vétérinaire : il prendra les dispositions nécessaires pour votre élevage et vous guidera sur les étapes à suivre.</Callout>}
          <div className="grid-cards">
            <div className="stack">
              <Card><CardTitle icon={FileText}>Description</CardTitle><div className="small" style={{ lineHeight: 1.65 }}>{detail.description}</div></Card>
              <Card tone="green" tinted>
                <CardTitle icon={Zap}>Actions immédiates</CardTitle>
                <ul className="bullets tone-green">{detail.actions.map((a, i) => <li key={i}><Check size={15} strokeWidth={2.6} />{a}</li>)}</ul>
              </Card>
            </div>
            <div className="stack">
              <Card tone="orange" tinted><CardTitle icon={ShieldCheck}>Prévention</CardTitle><div className="small" style={{ lineHeight: 1.65 }}>{detail.prevention}</div></Card>
              <Card>
                <CardTitle icon={Pill}>Soutien recommandé</CardTitle>
                <div className="small" style={{ lineHeight: 1.65, marginBottom: 12 }}>{detail.treatment}</div>
                <Callout tone="orange" icon={Stethoscope} title="Consultez un vétérinaire pour :">{detail.vet_for}</Callout>
              </Card>
            </div>
          </div>
          <div className="grid-cards">
            <VetCard text="Nos vétérinaires partenaires peuvent vous aider à confirmer ce diagnostic et définir un traitement adapté." />
            <div className="stack"><Disclaimer /><Button block variant="secondary" tone="blue" icon={GraduationCap}>Voir les formations liées</Button></div>
          </div>
        </div>
      </div>
    );
  }

  // ─── Résultats de l'analyse ───
  if (screen === "results") {
    return (
      <div className="tone-red">
        <PageHeader tone="red" icon={Search} title="Maladies probables" subtitle={`${selected.length} symptôme${selected.length > 1 ? "s" : ""} · ${results.length} correspondance${results.length > 1 ? "s" : ""}`} onBack={() => setScreen("symptoms")} backLabel="Symptômes" />
        <div className="stack-lg">
          {results.length === 0 ? (
            <Empty icon={SearchX} title="Aucune correspondance directe" text="Essayez d'ajouter ou de retirer des symptômes, ou consultez un vétérinaire." />
          ) : (
            <div className="grid-cards">
              {results.map((d, i) => {
                const tone = severityTone(d.severity);
                return (
                  <Card key={i} onClick={() => setDetail(d)}>
                    <div className="row-between" style={{ marginBottom: 8 }}>
                      <div style={{ fontWeight: 700, fontSize: 15.5 }}>{d.name}</div>
                      <Badge tone={tone}>{d.severity}</Badge>
                    </div>
                    <div className={`bar tone-${tone}`}><span style={{ width: `${d.pct}%` }} /></div>
                    <div className="row-between xsmall muted" style={{ marginTop: 8 }}>
                      <span>{d.pct}% de correspondance · {d.score}/{d.maxScore} pts</span>
                      <span className="row" style={{ gap: 2, color: "var(--red)", fontWeight: 700 }}>Détail <ChevronRight size={14} /></span>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
          <div className="grid-cards">
            <Disclaimer />
            <VetCard text="Pour un diagnostic fiable et un traitement adapté, consultez un vétérinaire partenaire AviAssist — réponse en moins de 24 h." />
          </div>
        </div>
      </div>
    );
  }

  // ─── Sélection des symptômes ───
  if (screen === "symptoms") {
    const catSymptoms = (cat) => SYMPTOMS_V2.filter((s) => s.cat === cat);
    return (
      <div className="tone-red">
        <PageHeader tone="red" icon={Search} title="Sélectionner les symptômes" subtitle={`${selected.length} symptôme${selected.length > 1 ? "s" : ""} sélectionné${selected.length > 1 ? "s" : ""}`} onBack={() => setScreen("home")} backLabel="Santé"
          actions={selected.length > 0 && <Button tone="red" onClick={analyze}>Analyser <ChevronRight size={18} /></Button>} />
        <div className="stack-lg">
          <div>
            {SYMPTOM_CATS.map((cat) => {
              const list = catSymptoms(cat.id);
              return (
                <CheckGroup key={cat.id} tone="red" icon={SYMPTOM_ICON[cat.id] || Stethoscope} title={cat.label}
                  count={list.filter((s) => selected.includes(s.id)).length} total={list.length}
                  open={openCat === cat.id} onToggle={() => setOpenCat(openCat === cat.id ? null : cat.id)}>
                  {list.map((s) => <CheckRow key={s.id} on={selected.includes(s.id)} onClick={() => toggle(s.id)} title={s.label} />)}
                </CheckGroup>
              );
            })}
          </div>
          {selected.length > 0 && <Button block tone="red" onClick={analyze}>Analyser {selected.length} symptôme{selected.length > 1 ? "s" : ""} <ChevronRight size={18} /></Button>}
        </div>
      </div>
    );
  }

  // ─── Bibliothèque ───
  if (screen === "library") {
    return (
      <div className="tone-red">
        <PageHeader tone="red" icon={Library} title="Bibliothèque des maladies" subtitle={`${DISEASES_V2.length} maladies répertoriées`} onBack={() => setScreen("home")} backLabel="Santé" />
        <div className="grid-cards">
          {DISEASES_V2.map((d, i) => (
            <Card key={i} onClick={() => setDetail(d)}>
              <div className="row-between" style={{ marginBottom: 6, alignItems: "flex-start" }}>
                <div style={{ fontWeight: 700 }}>{d.name}</div>
                <Badge tone={severityTone(d.severity)}>{d.severity}</Badge>
              </div>
              <div className="small muted" style={{ lineHeight: 1.5 }}>{d.description.slice(0, 110)}…</div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // ─── Accueil du module ───
  return (
    <div className="tone-red">
      <PageHeader tone="red" icon={Stethoscope} title="Santé & maladies" subtitle="Identifiez les symptômes et agissez rapidement" onBack={onBack} backLabel="Accueil" />
      <div className="stack-lg">
        <div className="grid-cards">
          <Card onClick={() => { setSelected([]); setOpenCat("digestifs"); setScreen("symptoms"); }}>
            <div className="row">
              <IconTile icon={Search} tone="red" size="lg" />
              <div className="grow"><div style={{ fontWeight: 700, fontSize: 16 }}>Analyser des symptômes</div><div className="small muted">Cochez ce que vous observez, obtenez les maladies probables</div></div>
              <ChevronRight size={18} className="muted" />
            </div>
          </Card>
          <Card onClick={() => setScreen("library")}>
            <div className="row">
              <IconTile icon={Library} tone="slate" size="lg" />
              <div className="grow"><div style={{ fontWeight: 700, fontSize: 16 }}>Bibliothèque des maladies</div><div className="small muted">{DISEASES_V2.length} fiches : description, prévention, actions</div></div>
              <ChevronRight size={18} className="muted" />
            </div>
          </Card>
        </div>
        <div className="grid-cards">
          <Callout tone="red" icon={ShieldAlert} title="Important">Cet outil propose des <strong>pistes préliminaires</strong>. Il ne remplace jamais un vétérinaire.</Callout>
          <VetCard text="Accédez à nos vétérinaires partenaires pour un diagnostic fiable et un traitement sur mesure." />
        </div>
      </div>
    </div>
  );
}
