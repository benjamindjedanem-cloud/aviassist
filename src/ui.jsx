import { useEffect, useId } from "react";
import {
  ChevronLeft, Check, Egg, Wheat, Stethoscope, GraduationCap, Wallet, Bird, Feather,
  Snowflake, Flame, Sun, Leaf, Wind, Brain, Activity, Eye, Sprout, Fish, Bone, FlaskConical,
  TestTube, Syringe, Truck, Zap, HardHat, Wrench, SprayCan, Package,
} from "lucide-react";

// ═══════════════════════════════════════════
//  COMPOSANTS D'INTERFACE PARTAGÉS
//  Le style vit dans styles.css ; ici, uniquement la structure.
// ═══════════════════════════════════════════

const cx = (...c) => c.filter(Boolean).join(" ");

// Logo AviAssist : un œuf et une pousse, dans une pastille verte.
export function Logo({ size = 36 }) {
  // Identifiant unique : un logo dans une zone masquée ne doit pas casser les autres.
  const gid = `avi-g-${useId().replace(/:/g, "")}`;
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#2A9558" />
          <stop offset="1" stopColor="#12502C" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="16" fill={`url(#${gid})`} />
      <path d="M32 13c-8.6 0-15.5 12.3-15.5 22.4C16.5 44.6 23.4 51 32 51s15.5-6.4 15.5-15.6C47.5 25.3 40.6 13 32 13z" fill="#fff" />
      <path d="M32 44V33.5" stroke="#1E7A46" strokeWidth="3" strokeLinecap="round" />
      <path d="M32 35.5c0-4.6 3.3-7.6 8-7.6 0 4.6-3.3 7.6-8 7.6z" fill="#1E7A46" />
      <path d="M32 38.5c0-4-2.9-6.6-7-6.6 0 4 2.9 6.6 7 6.6z" fill="#3FAE6B" />
    </svg>
  );
}

// ─── Icônes des données ───
export const MODULES = [
  { id: "incubation", label: "Incubation", desc: "Suivez vos incubations jour par jour", icon: Egg, tone: "amber" },
  { id: "formule", label: "Formule alimentaire", desc: "Calculez votre provende maison", icon: Wheat, tone: "orange" },
  { id: "maladies", label: "Santé & maladies", desc: "Identifier les symptômes et agir vite", icon: Stethoscope, tone: "red" },
  { id: "formations", label: "Formations", desc: "Cours, vidéos et fiches pratiques", icon: GraduationCap, tone: "blue" },
  { id: "tresorerie", label: "Trésorerie", desc: "Dépenses, ventes et bénéfice par bande", icon: Wallet, tone: "purple" },
];
export const moduleById = Object.fromEntries(MODULES.map((m) => [m.id, m]));

export const SPECIES_STYLE = {
  poulet: { icon: Bird, tone: "amber" },
  caille: { icon: Feather, tone: "orange" },
  canard: { icon: Bird, tone: "blue" },
  canard_barbarie: { icon: Bird, tone: "slate" },
  dinde: { icon: Bird, tone: "red" },
  pintade: { icon: Feather, tone: "purple" },
};
export const AMBIENT_ICON = { standard: Snowflake, chaud: Flame, extreme: Sun };
export const AMBIENT_TONE = { standard: "blue", chaud: "orange", extreme: "red" };
export const SYMPTOM_ICON = { digestifs: Leaf, respiratoires: Wind, neurologiques: Brain, generaux: Activity, yeux_tete: Eye, ponte: Egg, peau_bec: Feather };
export const INGREDIENT_ICON = { energetique: Wheat, proteine_veg: Sprout, proteine_ani: Fish, mineral: Bone, additif: FlaskConical, concentre: TestTube };
export const EXPENSE_ICON = { alimentation: Wheat, vaccination: Syringe, transport: Truck, energie: Zap, maindoeuvre: HardHat, equipement: Wrench, desinfection: SprayCan, achat_animaux: Bird, autre: Package };

// Remonte en haut de page à chaque changement d'écran.
export function useScrollTop(dep) {
  useEffect(() => { window.scrollTo(0, 0); }, [dep]);
}

// ─── Briques ───
export function IconTile({ icon: I, tone = "green", size = "md", className }) {
  const px = { sm: 17, md: 20, lg: 24, xl: 30 }[size];
  return <span className={cx("ic", size !== "md" && size, `tone-${tone}`, className)}><I size={px} strokeWidth={2} /></span>;
}

export function PageHeader({ icon, tone = "green", title, subtitle, onBack, backLabel = "Retour", meta, actions }) {
  return (
    <header className={cx("page-head", `tone-${tone}`)}>
      {onBack && <button className="back" onClick={onBack}><ChevronLeft size={18} />{backLabel}</button>}
      <div className="row-between" style={{ alignItems: "flex-start" }}>
        <div className="page-title-row grow">
          {icon && <IconTile icon={icon} tone={tone} size="lg" />}
          <div className="grow">
            <h1 className="page-title">{title}</h1>
            {subtitle && <div className="page-sub">{subtitle}</div>}
          </div>
        </div>
        {actions && <div className="row desktop-only">{actions}</div>}
      </div>
      {meta && <div className="page-meta">{meta}</div>}
    </header>
  );
}

export function Card({ tone, tinted, flush, className, children, onClick, style }) {
  const cls = cx("card", tinted && "tinted", flush && "flush", tone && `tone-${tone}`, className);
  if (onClick) return <button className={cls} onClick={onClick} style={style}>{children}</button>;
  return <div className={cls} style={style}>{children}</div>;
}

export function CardTitle({ icon: I, children, right }) {
  return (
    <div className="card-title">
      {I && <I size={18} />}
      <span className="grow">{children}</span>
      {right}
    </div>
  );
}

export function Button({ variant, tone, icon: I, children, block, size, className, ...props }) {
  return (
    <button className={cx("btn", variant, block && "block", size, tone && `tone-${tone}`, className)} {...props}>
      {I && <I size={size === "sm" ? 16 : 18} strokeWidth={2.2} />}
      {children}
    </button>
  );
}

export function Badge({ tone = "slate", icon: I, solid, children }) {
  return <span className={cx("badge", solid && "solid", `tone-${tone}`)}>{I && <I size={13} strokeWidth={2.4} />}{children}</span>;
}

export function Field({ label, optional, children, style }) {
  return (
    <label className="field" style={style}>
      <span className="label">{label}{optional && <span className="opt"> (optionnel)</span>}</span>
      {children}
    </label>
  );
}

export function Choice({ on, onClick, icon: I, tone, label, sub, right }) {
  return (
    <button type="button" className={cx("choice", on && "on", tone && `tone-${tone}`)} onClick={onClick}>
      {I && <I size={18} />}
      <span className="grow">
        <span style={{ display: "block" }}>{label}</span>
        {sub && <span className="choice-sub">{sub}</span>}
      </span>
      {right}
      {on && !right && <Check className="tick" size={17} strokeWidth={2.6} />}
    </button>
  );
}

export function Stat({ label, value, sub, tone, tinted, icon: I }) {
  return (
    <div className={cx("stat", tinted && "tinted", tone && `tone-${tone}`)}>
      <div className="stat-label">{I && <I size={14} />}{label}</div>
      <div className="stat-value">{value}</div>
      {sub && <div className="stat-sub">{sub}</div>}
    </div>
  );
}

export function KV({ k, v, accent }) {
  return <div className="kv"><span className="k">{k}</span><span className={cx("v", accent && "accent")}>{v}</span></div>;
}

export function Callout({ tone = "green", icon: I, title, children }) {
  return (
    <div className={cx("callout", `tone-${tone}`)}>
      {I && <I size={19} />}
      <div className="grow">
        {title && <div className="callout-title">{title}</div>}
        <div>{children}</div>
      </div>
    </div>
  );
}

export function Empty({ icon, tone = "slate", title, text, children }) {
  return (
    <Card className="empty">
      <IconTile icon={icon} tone={tone} size="xl" />
      <div className="empty-title">{title}</div>
      {text && <div className="empty-text">{text}</div>}
      {children && <div style={{ marginTop: 16 }}>{children}</div>}
    </Card>
  );
}

// Liste dépliante d'éléments à cocher (symptômes, ingrédients).
export function CheckGroup({ open, onToggle, icon: I, title, count, total, tone, children }) {
  return (
    <div className={cx("acc", open && "open", `tone-${tone}`)}>
      <button type="button" className="acc-head" onClick={onToggle}>
        {I && <IconTile icon={I} tone={tone} size="sm" />}
        <span>{title}</span>
        <span className={cx("acc-count", count > 0 && "has")}>{count}/{total}</span>
        <ChevronLeft size={18} style={{ transform: open ? "rotate(90deg)" : "rotate(-90deg)", transition: "transform .15s", color: "var(--muted)" }} />
      </button>
      {open && <div className="acc-body cols">{children}</div>}
    </div>
  );
}

export function CheckRow({ on, onClick, title, sub }) {
  return (
    <button type="button" className={cx("check-row", on && "on")} onClick={onClick}>
      <span className="box">{on && <Check size={14} strokeWidth={3} />}</span>
      <span className="grow">
        <span className="ttl" style={{ display: "block" }}>{title}</span>
        {sub && <span className="xsmall muted">{sub}</span>}
      </span>
    </button>
  );
}
