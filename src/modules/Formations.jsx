import { useState, useEffect } from "react";
import { GraduationCap, PlayCircle, FileText, BookOpen, Timer, Star, CheckCircle2, Lock, ChevronRight } from "lucide-react";
import { FORMATIONS } from "../data.js";
import { PageHeader, Card, CardTitle, Button, Badge, Callout, IconTile, useScrollTop } from "../ui.jsx";

const TYPE_ICON = { Vidéo: PlayCircle, PDF: FileText, Cours: BookOpen };

export default function FormationsModule({ onBack, registerBack }) {
  const [cat, setCat] = useState("Tous");
  const [detail, setDetail] = useState(null);
  useScrollTop(detail?.id ?? "list");

  useEffect(() => {
    if (detail) registerBack(() => { setDetail(null); return true; });
    else registerBack(null);
  }, [detail, registerBack]);

  const cats = ["Tous", ...new Set(FORMATIONS.map((f) => f.cat))];
  const list = cat === "Tous" ? FORMATIONS : FORMATIONS.filter((f) => f.cat === cat);

  if (detail) {
    const TypeIcon = TYPE_ICON[detail.type] || FileText;
    return (
      <div className="tone-blue">
        <PageHeader tone="blue" icon={TypeIcon} title={detail.title} onBack={() => setDetail(null)} backLabel="Formations"
          meta={<>
            <Badge tone="blue" icon={TypeIcon}>{detail.type}</Badge>
            <Badge tone="slate" icon={Timer}>{detail.dur}</Badge>
            <Badge tone="slate">{detail.cat}</Badge>
            {detail.premium ? <Badge tone="amber" icon={Star}>Premium</Badge> : <Badge tone="green" icon={CheckCircle2}>Gratuit</Badge>}
          </>} />
        <div className="stack-lg narrow">
          <Card><CardTitle icon={BookOpen}>Au programme</CardTitle><div style={{ lineHeight: 1.7 }}>{detail.desc}</div></Card>
          {detail.premium
            ? <Callout tone="amber" icon={Star} title="Contenu Premium">Cette formation nécessite un abonnement Premium.</Callout>
            : <Callout tone="green" icon={CheckCircle2} title="Accès gratuit">Cette formation est disponible gratuitement.</Callout>}
          <Button block tone={detail.premium ? "amber" : "blue"} icon={detail.premium ? Lock : TypeIcon} disabled={detail.premium}>
            {detail.premium ? "Débloquer avec Premium" : "Accéder à la formation"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="tone-blue">
      <PageHeader tone="blue" icon={GraduationCap} title="Formations" subtitle="Apprenez auprès des experts du secteur" onBack={onBack} backLabel="Accueil" />
      <div className="stack-lg">
        <div className="chips">
          {cats.map((c) => <button key={c} className={`chip ${cat === c ? "on" : ""}`} onClick={() => setCat(c)}>{c}</button>)}
        </div>
        <div className="small muted" style={{ marginTop: 12 }}>{list.length} formation{list.length > 1 ? "s" : ""} · {list.filter((f) => !f.premium).length} gratuite{list.filter((f) => !f.premium).length > 1 ? "s" : ""}</div>
        <div className="grid-cards" style={{ marginTop: 10 }}>
          {list.map((f) => {
            const TypeIcon = TYPE_ICON[f.type] || FileText;
            return (
              <Card key={f.id} onClick={() => setDetail(f)}>
                <div className="row" style={{ alignItems: "flex-start" }}>
                  <IconTile icon={TypeIcon} tone={f.premium ? "amber" : "blue"} />
                  <div className="grow">
                    <div className="row-between" style={{ alignItems: "flex-start" }}>
                      <div style={{ fontWeight: 700, lineHeight: 1.35 }}>{f.title}</div>
                      {f.premium ? <Badge tone="amber" icon={Star}>Premium</Badge> : <Badge tone="green">Gratuit</Badge>}
                    </div>
                    <div className="small muted" style={{ margin: "6px 0 10px", lineHeight: 1.5 }}>{f.desc}</div>
                    <div className="row" style={{ gap: 6, flexWrap: "wrap" }}>
                      <Badge tone="slate" icon={TypeIcon}>{f.type}</Badge>
                      <Badge tone="slate" icon={Timer}>{f.dur}</Badge>
                      <Badge tone="blue">{f.cat}</Badge>
                    </div>
                  </div>
                  <ChevronRight size={18} className="muted desktop-only" style={{ alignSelf: "center" }} />
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
