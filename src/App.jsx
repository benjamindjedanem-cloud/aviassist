import { useState, useCallback } from "react";

// ═══════════════════════════════════════════
//  DONNÉES
// ═══════════════════════════════════════════

const EGG_TYPES = {
  poulet: {
    name:"Poulet", icon:"🐓", days:21, mirage:[7,14], stopTurn:18,
    turnsPerDay:3, turnHours:["06h00","14h00","22h00"],
    youngName:"poussins", minRate:70,
    phases:[
      { label:"J1–J18", temp:"37.5–38°C", hum:"55–60%", note:"" },
      { label:"J19–J21", temp:"37°C", hum:"70–75%", note:"↓ Baisser température + ↑ Humidité" },
    ],
    tips:[
      { day:1,  text:"Préchauffer la couveuse/incubateur pendant 24h pour stabiliser la température à 37.5–38°C avant d'introduire les œufs. Vérifier aussi l'humidité (55–60%) et le bon fonctionnement du retournement." },
      { day:7,  text:"1er mirage : retirer les œufs clairs (non fécondés) ou à développement anormal. 📚 Voir le tutoriel de mirage dans la section Formations." },
      { day:14, text:"2e mirage : les œufs sains sont très foncés avec une chambre d'air nette. Retirer tout œuf suspect. 📚 Images de référence dans la section Formations." },
      { day:18, text:"Arrêter le retournement. Baisser la température à 37°C. Augmenter l'humidité à 70–75%. Placer les œufs à plat sur la grille d'éclosion." },
      { day:19, text:"Les poussins commencent à piquer la coquille (pipping). NE PAS ouvrir l'incubateur ! La chute d'humidité colle les membranes et peut tuer les poussins." },
      { day:21, text:"Éclosion ! Laisser les poussins sécher complètement dans l'incubateur pendant 12–24h avant de les sortir. Un poussin encore humide est extrêmement vulnérable." },
    ],
    specialTips:[
      "Un poussin sain est sec, actif, alerte, avec un nombril propre et bien refermé.",
      "Taux d'éclosion acceptable : 70–85%. En dessous de 60%, analyser la stabilité de la température.",
      "📚 Des cours complets sur l'incubation sont disponibles gratuitement dans la section Formations.",
    ],
  },
  caille: {
    name:"Caille", icon:"🪶", days:17, mirage:[7], stopTurn:14,
    turnsPerDay:4, turnHours:["06h00","12h00","18h00","00h00"],
    youngName:"cailleteaux", minRate:60,
    phases:[
      { label:"J1–J14", temp:"37.8°C", hum:"45–55%", note:"" },
      { label:"J15–J17", temp:"37°C", hum:"65–70%", note:"↓ Baisser température + ↑ Humidité" },
    ],
    tips:[
      { day:1,  text:"Préchauffer la couveuse/incubateur pendant 24h pour stabiliser à 37.8°C. Les œufs de caille sont très petits — vérifier que les grilles de retournement sont adaptées. Humidité : 45–55%." },
      { day:1,  text:"Retournement 4× par jour : 06h00, 12h00, 18h00, 00h00. Sur la caille, la régularité est encore plus critique qu'avec le poulet." },
      { day:7,  text:"Mirage : utiliser une lampe adaptée aux petits œufs dans une pièce sombre. Éliminer les œufs clairs. 📚 Voir tutoriel mirage dans la section Formations." },
      { day:14, text:"Arrêter le retournement. Baisser la température à 37°C. Augmenter l'humidité à 65–70%." },
      { day:15, text:"Les cailleteaux commencent à piquer. NE PAS ouvrir l'incubateur ! Toute perte d'humidité à ce stade peut être fatale." },
      { day:17, text:"Éclosion ! Les cailleteaux sont très petits et fragiles. Laisser sécher 12–24h dans l'incubateur avant de transférer." },
    ],
    specialTips:[
      "La caille a un cycle très court (17 jours) — chaque heure d'instabilité a un impact plus fort.",
      "Des grilles adaptées aux petits œufs de caille sont indispensables.",
      "Taux d'éclosion acceptable : 60–80%.",
      "📚 Formation 'Démarrer un élevage de caille rentable' disponible dans la section Formations.",
    ],
  },
  canard: {
    name:"Canard", icon:"🦆", days:28, mirage:[7,14], stopTurn:25,
    turnsPerDay:3, turnHours:["06h00","14h00","22h00"],
    youngName:"canetons", minRate:65,
    phases:[
      { label:"J1–J25", temp:"37.5–38°C", hum:"55–65%", note:"+ Humidification externe quotidienne J7–J24" },
      { label:"J26–J28", temp:"37°C", hum:"75–80%", note:"↓ Baisser température + ↑ Humidité, arrêter humidification externe" },
    ],
    tips:[
      { day:1,  text:"Préchauffer la couveuse/incubateur pendant 24h. Température : 37.5–38°C, humidité : 55–65%. Les œufs de canard produisent plus de chaleur propre en fin d'incubation." },
      { day:7,  text:"1er mirage. 📚 Voir tutoriel dans Formations. À partir d'aujourd'hui : humidification externe quotidienne." },
      { day:7,  text:"🌊 Humidification externe (J7–J24) : sortir les œufs, vaporiser légèrement avec de l'eau tiède (35–37°C), laisser refroidir 15–30 min à l'air libre, puis remettre. Cette étape est unique aux canards." },
      { day:14, text:"2e mirage. Continuer l'humidification externe quotidienne. 📚 Images de référence dans Formations." },
      { day:25, text:"Arrêter le retournement ET l'humidification externe. Baisser la température à 37°C. Augmenter l'humidité à 75–80%." },
      { day:26, text:"Les canetons commencent à piquer. NE PAS ouvrir l'incubateur !" },
      { day:28, text:"Éclosion ! Laisser sécher 12–24h dans l'incubateur avant de transférer." },
    ],
    specialTips:[
      "L'humidification externe quotidienne (J7–J24) est LA particularité des œufs de canard. Ne jamais sauter cette étape.",
      "Taux d'éclosion acceptable : 65–80%.",
      "📚 Consultez la section Formations pour les conseils avancés.",
    ],
  },
  dinde: {
    name:"Dinde", icon:"🦃", days:28, mirage:[10,20], stopTurn:25,
    turnsPerDay:3, turnHours:["06h00","14h00","22h00"],
    youngName:"dindonneaux", minRate:65,
    phases:[
      { label:"J1–J25", temp:"37.5°C", hum:"55–60%", note:"" },
      { label:"J26–J28", temp:"37°C", hum:"65–70%", note:"↓ Baisser température + ↑ Humidité" },
    ],
    tips:[
      { day:1,  text:"Préchauffer la couveuse/incubateur pendant 24h pour stabiliser à 37.5°C. Les œufs de dinde sont grands — vérifier l'espace entre clayettes. Humidité : 55–60%." },
      { day:10, text:"1er mirage : les embryons sont bien visibles à J10. Retirer les œufs clairs. 📚 Voir tutoriel mirage dans Formations." },
      { day:20, text:"2e mirage : la chambre d'air doit occuper environ 1/3 de l'œuf." },
      { day:25, text:"Arrêter le retournement. Baisser la température à 37°C. Augmenter l'humidité à 65–70%." },
      { day:26, text:"Les dindonneaux commencent à piquer. NE PAS ouvrir l'incubateur ! Ne jamais forcer l'éclosion." },
      { day:28, text:"Éclosion ! Laisser sécher 12–24h dans l'incubateur avant de transférer." },
    ],
    specialTips:[
      "Ne jamais aider un dindonneau à sortir de sa coquille.",
      "Taux d'éclosion acceptable : 65–80%.",
      "📚 Consultez la section Formations pour les conseils sur l'élevage de dindes.",
    ],
  },
  pintade: {
    name:"Pintade", icon:"🐦", days:26, mirage:[7,14], stopTurn:23,
    turnsPerDay:3, turnHours:["06h00","14h00","22h00"],
    youngName:"pintadeaux", minRate:50,
    phases:[
      { label:"J1–J23", temp:"37.5°C", hum:"55–60%", note:"" },
      { label:"J24–J26", temp:"37°C", hum:"65–70%", note:"↓ Baisser température + ↑ Humidité" },
    ],
    tips:[
      { day:1,  text:"Préchauffer la couveuse/incubateur pendant 24h. Température : 37.5°C, humidité : 55–60%. La coquille de pintade est épaisse — prévoir des grilles robustes." },
      { day:7,  text:"1er mirage : utiliser une lampe puissante dans une pièce sombre. 📚 Voir tutoriel dans Formations." },
      { day:14, text:"2e mirage : les œufs fécondés doivent être très foncés. 📚 Images de référence dans Formations." },
      { day:23, text:"Arrêter le retournement. Baisser la température à 37°C. Augmenter l'humidité à 65–70%." },
      { day:24, text:"Les pintadeaux commencent à piquer. NE PAS ouvrir l'incubateur ! Ne jamais aider un pintadeau à sortir." },
      { day:26, text:"Éclosion ! Les pintadeaux sont nerveux. Laisser sécher 12–24h. Démarrage dans un environnement calme." },
    ],
    specialTips:[
      "La pintade a naturellement un taux d'éclosion plus bas (50–70%) — c'est normal.",
      "L'humidité en phase d'éclosion est le facteur le plus critique pour la pintade.",
      "📚 Consultez la section Formations pour les conseils spécifiques à la pintade.",
    ],
  },
};

const SYMPTOMS = [
  { id:"diarrhee",   label:"Diarrhée" },
  { id:"resp",       label:"Difficulté respiratoire" },
  { id:"appetit",    label:"Perte d'appétit" },
  { id:"mortalite",  label:"Mortalité soudaine" },
  { id:"paralysie",  label:"Paralysie / Tremblements" },
  { id:"ponte",      label:"Baisse de ponte" },
  { id:"gonflement", label:"Gonflement tête / cou" },
  { id:"plumes",     label:"Chute de plumes" },
  { id:"yeux",       label:"Yeux larmoyants / troubles" },
  { id:"croissance", label:"Retard de croissance" },
];

const DISEASES = [
  { name:"Newcastle", severity:"Critique", color:"#C62828",
    symptoms:["resp","paralysie","mortalite","appetit","gonflement"],
    description:"Maladie virale très contagieuse. Taux de mortalité pouvant atteindre 100%.",
    prevention:"Vaccination obligatoire tous les 3 mois (La Sota, Hitchner). Biosécurité stricte.",
    treatment:"Pas de traitement curatif. Isoler immédiatement les malades. Alerter un vétérinaire en urgence." },
  { name:"Gumboro (IBD)", severity:"Élevée", color:"#E53935",
    symptoms:["diarrhee","appetit","mortalite","plumes"],
    description:"Maladie virale qui détruit le système immunitaire des jeunes oiseaux (2–6 semaines).",
    prevention:"Vaccination à J14 et J28. Maintenir une bonne hygiène du bâtiment.",
    treatment:"Vitamines et électrolytes dans l'eau. Isoler les malades." },
  { name:"Coccidiose", severity:"Modérée", color:"#F57C00",
    symptoms:["diarrhee","appetit","croissance"],
    description:"Parasite intestinal très répandu chez les jeunes volailles. Litière humide = risque élevé.",
    prevention:"Litière toujours sèche. Coccidiostat préventif dans l'aliment.",
    treatment:"Amprolium ou Toltrazuril pendant 5 jours. Vitamines A et K en soutien." },
  { name:"Maladie de Marek", severity:"Élevée", color:"#E53935",
    symptoms:["paralysie","plumes","appetit","croissance"],
    description:"Maladie virale causant paralysie des membres et tumeurs internes.",
    prevention:"Vaccination à l'éclosion. Acheter des poussins vaccinés.",
    treatment:"Pas de traitement. Réformer les oiseaux atteints. Désinfecter le bâtiment." },
  { name:"Mycoplasmose", severity:"Modérée", color:"#F57C00",
    symptoms:["resp","yeux","ponte","appetit"],
    description:"Infection bactérienne chronique des voies respiratoires. Se transmet par l'œuf et l'air.",
    prevention:"Biosécurité, éviter la surpopulation et les courants d'air.",
    treatment:"Tylosine, Enrofloxacine ou Doxycycline selon prescription vétérinaire." },
  { name:"Typhose / Pullorose", severity:"Élevée", color:"#E53935",
    symptoms:["diarrhee","mortalite","appetit"],
    description:"Maladie bactérienne causée par Salmonella. Diarrhée blanche caractéristique.",
    prevention:"Acheter des poussins certifiés. Hygiène stricte.",
    treatment:"Antibiotiques (Tétracyclines, Sulfamides) sur prescription vétérinaire." },
  { name:"Bronchite Infectieuse", severity:"Modérée", color:"#F57C00",
    symptoms:["resp","ponte","yeux"],
    description:"Maladie virale respiratoire. Chute brutale de ponte.",
    prevention:"Vaccination régulière. Bâtiments bien ventilés sans courant d'air.",
    treatment:"Antibiotiques pour prévenir les surinfections bactériennes." },
  { name:"Fowl Pox (Variole aviaire)", severity:"Modérée", color:"#F57C00",
    symptoms:["appetit","ponte","croissance"],
    description:"Maladie virale causant des lésions sur la peau, la crête et les pattes.",
    prevention:"Vaccination préventive. Lutter contre les moustiques (vecteurs).",
    treatment:"Isoler les malades. Solution antiseptique sur les lésions. Vitamines." },
];

const EXPENSE_CATEGORIES = [
  { id:"alimentation",  label:"Alimentation",          icon:"🌾" },
  { id:"vaccination",   label:"Vaccins & Médicaments",  icon:"💉" },
  { id:"transport",     label:"Transport",               icon:"🚛" },
  { id:"energie",       label:"Eau & Électricité",       icon:"💡" },
  { id:"maindoeuvre",   label:"Main d'œuvre",            icon:"👷" },
  { id:"equipement",    label:"Équipements",             icon:"🔧" },
  { id:"desinfection",  label:"Désinfection",            icon:"🧴" },
  { id:"achat_animaux", label:"Achat animaux",           icon:"🐣" },
  { id:"autre",         label:"Autre",                   icon:"📦" },
];

const FORMATIONS = [
  { id:1,  cat:"Incubation",      title:"Maîtriser l'incubation artificielle",          dur:"45 min", type:"Vidéo", premium:false, desc:"Température, humidité, retournement : tous les paramètres pour un taux d'éclosion optimal." },
  { id:2,  cat:"Incubation",      title:"Lecture du mirage et tri des œufs",            dur:"20 min", type:"Vidéo", premium:false, desc:"Technique pratique du mirage pour identifier les œufs infertiles, morts ou malformés." },
  { id:3,  cat:"Vaccination",     title:"Programme de vaccination complet",             dur:"30 min", type:"PDF",   premium:false, desc:"Calendrier de vaccination complet pour poulets chair, pondeuses et cailles." },
  { id:4,  cat:"Poulet de chair", title:"Optimiser la croissance et réduire les coûts", dur:"1h",     type:"Cours", premium:true,  desc:"Alimentation, densité, phases d'élevage pour maximiser le GMQ tout en réduisant les charges." },
  { id:5,  cat:"Ponte",           title:"Gestion professionnelle des pondeuses",        dur:"1h 30",  type:"Cours", premium:true,  desc:"Programme lumineux, alimentation, collecte des œufs, et maintien du pic de ponte." },
  { id:6,  cat:"Alimentation",    title:"Fabriquer sa provende locale",                 dur:"55 min", type:"Vidéo", premium:true,  desc:"Formulation de rations équilibrées avec les matières premières disponibles en Afrique." },
  { id:7,  cat:"Caille",          title:"Démarrer un élevage de caille rentable",       dur:"40 min", type:"Vidéo", premium:false, desc:"Caille japonaise : habitat, alimentation, ponte, commercialisation et rentabilité." },
  { id:8,  cat:"Gestion",         title:"Gestion financière de son élevage",            dur:"35 min", type:"Cours", premium:true,  desc:"Coût de production, seuil de rentabilité, tableaux de bord simples pour aviculteurs." },
  { id:9,  cat:"Biosécurité",     title:"Biosécurité pratique à la ferme",              dur:"25 min", type:"Vidéo", premium:false, desc:"Règles essentielles pour éviter l'introduction et la propagation des maladies." },
  { id:10, cat:"Alimentation",    title:"L'eau en aviculture : souvent négligée",       dur:"20 min", type:"PDF",   premium:false, desc:"Qualité, quantité, hygiène des abreuvoirs. L'eau est le 1er facteur de production." },
];

const POUSSIN_WEEKS = {
  poulet_chair:[
    { w:1, tMin:32, tMax:35, food:"Démarrage 22–24% protéines",  eau:"50 ml/poussin/j",  poids:180,  density:"40/m²", vacc:"J1 : Marek (écloserie)" },
    { w:2, tMin:29, tMax:32, food:"Démarrage 22% protéines",     eau:"80 ml/poussin/j",  poids:400,  density:"30/m²", vacc:"J7–J10 : Gumboro 1ère dose" },
    { w:3, tMin:26, tMax:29, food:"Démarrage → Croissance",      eau:"130 ml/poussin/j", poids:750,  density:"20/m²", vacc:"J14 : Newcastle + Gumboro 2e" },
    { w:4, tMin:23, tMax:26, food:"Croissance 19% protéines",    eau:"170 ml/poussin/j", poids:1100, density:"15/m²", vacc:"J21 : Newcastle rappel" },
    { w:5, tMin:21, tMax:23, food:"Croissance",                  eau:"210 ml/poussin/j", poids:1500, density:"12/m²", vacc:"—" },
    { w:6, tMin:20, tMax:22, food:"Finition 17–18% protéines",   eau:"250 ml/poussin/j", poids:1900, density:"10/m²", vacc:"—" },
  ],
  pondeuse:[
    { w:1, tMin:32, tMax:35, food:"Démarrage poussin 20% prot.", eau:"50 ml/poussin/j",  poids:80,  density:"40/m²", vacc:"J1 : Marek" },
    { w:2, tMin:29, tMax:32, food:"Démarrage 20% protéines",    eau:"70 ml/poussin/j",  poids:140, density:"30/m²", vacc:"J7 : Gumboro 1ère dose" },
    { w:4, tMin:24, tMax:27, food:"Croissance pondeuse",        eau:"120 ml/poussin/j", poids:380, density:"20/m²", vacc:"J28 : Newcastle" },
    { w:8, tMin:20, tMax:22, food:"Croissance 17% protéines",   eau:"160 ml/poussin/j", poids:700, density:"15/m²", vacc:"J56 : rappels selon calendrier" },
  ],
};

// ═══════════════════════════════════════════
//  UTILITAIRES
// ═══════════════════════════════════════════

const addDays = (d,n) => { const r=new Date(d); r.setDate(r.getDate()+n); return r; };
const fmtDate = d => d ? new Date(d).toLocaleDateString("fr-FR",{day:"2-digit",month:"short",year:"numeric"}) : "";
const fmtCFA  = n => new Intl.NumberFormat("fr-FR").format(Math.round(n||0)) + " F";
const genId   = () => Math.random().toString(36).slice(2,11);
const today   = () => new Date().toISOString().split("T")[0];

// ── localStorage hook (remplace window.storage) ──
function useStorage(key, fallback=null) {
  const [data,setData] = useState(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : fallback;
    } catch { return fallback; }
  });
  const save = useCallback(val => {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
    setData(val);
  }, [key]);
  return [data, save, true];
}

// ═══════════════════════════════════════════
//  DESIGN TOKENS
// ═══════════════════════════════════════════

const C = {
  green:"#2A7A40", greenDk:"#1B5229", greenLt:"#E8F5EC",
  orange:"#E8660A", orangeLt:"#FFF3EC",
  red:"#C0392B", redLt:"#FDECEA",
  blue:"#1558A8", blueLt:"#EBF2FC",
  purple:"#6B21A8", purpleLt:"#F4EDFB",
  bg:"#F2F5EE", card:"#FFFFFF", border:"#DDE8D5",
  text:"#18230F", muted:"#5C7052",
};
const card = (x={}) => ({ background:C.card, borderRadius:14, padding:16, marginBottom:10,
  boxShadow:"0 1px 6px rgba(0,0,0,.07)", border:`1px solid ${C.border}`, ...x });
const btn = (bg,color="#fff",x={}) => ({ background:bg, color, border:"none", borderRadius:12,
  padding:"13px 20px", fontSize:14, fontWeight:800, cursor:"pointer", width:"100%",
  fontFamily:"'Nunito',sans-serif", ...x });
const outlineBtn = (color,x={}) => ({ background:"transparent", color, border:`2px solid ${color}`,
  borderRadius:12, padding:"11px 18px", fontSize:14, fontWeight:800, cursor:"pointer", width:"100%",
  fontFamily:"'Nunito',sans-serif", ...x });
const inp = (x={}) => ({ width:"100%", padding:"11px 13px", borderRadius:10,
  border:`1.5px solid ${C.border}`, fontSize:14, fontFamily:"'Nunito',sans-serif",
  outline:"none", background:"#FAFDFA", boxSizing:"border-box", ...x });
const lbl = { fontSize:11, fontWeight:800, color:C.muted, textTransform:"uppercase",
  letterSpacing:".6px", marginBottom:6, display:"block" };
const tag = (bg,color,x={}) => ({ display:"inline-flex", alignItems:"center",
  background:bg, color, borderRadius:20, padding:"3px 10px", fontSize:11, fontWeight:800, ...x });

const BackBtn = ({ onBack, label="Retour" }) => (
  <button onClick={onBack} style={{ background:"rgba(255,255,255,.18)", border:"none", borderRadius:8,
    padding:"6px 12px", color:"#fff", cursor:"pointer", fontSize:13, fontWeight:700,
    fontFamily:"'Nunito',sans-serif", display:"flex", alignItems:"center", gap:5 }}>
    ← {label}
  </button>
);
const Row = ({ label:l, value:v, accent }) => (
  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center",
    padding:"7px 0", borderBottom:`1px solid ${C.border}` }}>
    <span style={{ fontSize:13, color:C.muted }}>{l}</span>
    <span style={{ fontSize:13, fontWeight:800, color:accent?C.orange:C.text }}>{v}</span>
  </div>
);
const Header = ({ bg, emoji, title, subtitle, onBack }) => (
  <div style={{ background:bg, padding:"22px 18px 28px", color:"#fff" }}>
    {onBack && <BackBtn onBack={onBack} />}
    <div style={{ fontWeight:900, fontSize:22, marginTop:onBack?10:0, lineHeight:1.2 }}>{emoji} {title}</div>
    {subtitle && <div style={{ fontSize:13, opacity:.85, marginTop:5 }}>{subtitle}</div>}
  </div>
);
const SubHeader = ({ bg, title, subtitle, onBack, backLabel }) => (
  <div style={{ background:bg, padding:"14px 18px", color:"#fff" }}>
    <BackBtn onBack={onBack} label={backLabel} />
    <div style={{ fontWeight:900, fontSize:17, marginTop:8 }}>{title}</div>
    {subtitle && <div style={{ fontSize:12, opacity:.85, marginTop:3 }}>{subtitle}</div>}
  </div>
);

// ═══════════════════════════════════════════
//  ACCUEIL
// ═══════════════════════════════════════════

function HomeScreen({ go }) {
  const modules = [
    { id:"incubation", icon:"🥚", label:"Incubation",         desc:"Suivez vos incubations",  bg:"#E6F4EA", accent:C.green  },
    { id:"poussins",   icon:"🐣", label:"Démarrage Poussins", desc:"Paramètres par semaine",  bg:"#FEF3E8", accent:C.orange },
    { id:"maladies",   icon:"🩺", label:"Assis. Maladies",    desc:"Identifier et agir vite", bg:"#FDECEA", accent:C.red    },
    { id:"formations", icon:"📚", label:"Formations",          desc:"Cours, vidéos, PDF",      bg:"#EAF1FC", accent:C.blue   },
  ];
  return (
    <div>
      <div style={{ background:`linear-gradient(150deg,${C.green},${C.greenDk})`, padding:"30px 18px 46px", color:"#fff" }}>
        <div style={{ fontSize:11, fontWeight:700, opacity:.7, letterSpacing:1.2, marginBottom:10 }}>ASSISTANT NUMÉRIQUE</div>
        <div style={{ fontSize:30, fontWeight:900, lineHeight:1.15 }}>AviAssist 🐓</div>
        <div style={{ fontSize:14, opacity:.8, marginTop:6 }}>Votre partenaire avicole au quotidien</div>
      </div>
      <div style={{ margin:"0 16px", marginTop:-22, background:C.card, borderRadius:16,
        padding:"14px 10px", boxShadow:"0 6px 20px rgba(0,0,0,.12)", display:"flex", justifyContent:"space-around" }}>
        {[["5","Modules"],["Offline","Fonctionne"],["Gratuit","Accès"]].map(([v,l]) => (
          <div key={l} style={{ textAlign:"center" }}>
            <div style={{ fontSize:18, fontWeight:900, color:C.green }}>{v}</div>
            <div style={{ fontSize:10, fontWeight:700, color:C.muted }}>{l}</div>
          </div>
        ))}
      </div>
      <div style={{ padding:"18px 16px" }}>
        <div style={{ fontSize:11, fontWeight:800, color:C.muted, marginBottom:12, letterSpacing:.8, textTransform:"uppercase" }}>Modules</div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:10 }}>
          {modules.map(m => (
            <button key={m.id} onClick={()=>go(m.id)} style={{ background:m.bg,
              border:`1.5px solid ${m.accent}22`, borderRadius:16, padding:"16px 14px", cursor:"pointer", textAlign:"left" }}>
              <div style={{ fontSize:26, marginBottom:8 }}>{m.icon}</div>
              <div style={{ fontSize:13, fontWeight:900, color:m.accent, lineHeight:1.3, marginBottom:4 }}>{m.label}</div>
              <div style={{ fontSize:11, color:C.muted, lineHeight:1.4 }}>{m.desc}</div>
            </button>
          ))}
        </div>
        <button onClick={()=>go("tresorerie")} style={{ background:"#F5EDFB", border:`1.5px solid ${C.purple}22`,
          borderRadius:16, padding:"16px 18px", cursor:"pointer", width:"100%",
          textAlign:"left", display:"flex", alignItems:"center", gap:16 }}>
          <div style={{ fontSize:34 }}>💰</div>
          <div>
            <div style={{ fontSize:15, fontWeight:900, color:C.purple }}>Trésorerie</div>
            <div style={{ fontSize:12, color:C.muted, marginTop:2 }}>Gestion financière de vos bandes</div>
          </div>
          <div style={{ marginLeft:"auto", fontSize:20, color:C.purple, opacity:.4 }}>›</div>
        </button>
        <div style={{ ...card({ background:C.greenLt, marginTop:14 }) }}>
          <div style={{ fontWeight:800, color:C.green, fontSize:13, marginBottom:6 }}>💡 Conseil du jour</div>
          <div style={{ fontSize:13, color:C.text, lineHeight:1.6 }}>
            Un bon aviculteur observe ses volailles <strong>deux fois par jour</strong> minimum. La détection précoce des problèmes est votre meilleure assurance.
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
//  INCUBATION
// ═══════════════════════════════════════════

function getEclosionFeedback(rate, minRate) {
  if (rate >= 85) return { label:"Excellent ! 🏆", color:C.green, bg:C.greenLt,
    msg:`Félicitations ! Un taux de ${rate}% est exceptionnel. Vos paramètres sont parfaitement maîtrisés.` };
  if (rate >= minRate) return { label:"Bon résultat ✅", color:C.green, bg:C.greenLt,
    msg:`Un taux de ${rate}% est dans les standards. Bon travail ! 📚 Consultez la section Formations pour progresser encore.` };
  if (rate >= 40) return { label:"En dessous des standards ⚠️", color:C.orange, bg:C.orangeLt,
    msg:`Un taux de ${rate}% est en dessous du minimum (${minRate}%). Causes possibles : instabilité de la température, humidité incorrecte, qualité des géniteurs. 📚 La section Formations propose des pistes d'amélioration.` };
  return { label:"Taux très faible ❌", color:C.red, bg:C.redLt,
    msg:`Un taux de ${rate}% est très préoccupant. Vérifier : calibration thermomètre/hygromètre, qualité des reproducteurs, conservation des œufs avant incubation. 📚 La section Formations peut vous aider.` };
}

function IncubationModule({ onBack }) {
  const [screen,setScreen]   = useState("home");
  const [form,setForm]       = useState({ type:"", dateStart:"", qty:"" });
  const [hist,saveHist]      = useStorage("avi:incubation_hist", []);
  const [selHist,setSelHist] = useState(null);
  const [eclosionInput,setEI]= useState("");

  const calculate = () => {
    const egg = EGG_TYPES[form.type];
    if (!egg||!form.dateStart||!form.qty) return;
    const start = new Date(form.dateStart);
    const item = {
      id:genId(), form:{...form},
      eclosion:addDays(start,egg.days).toISOString(),
      mirages:egg.mirage.map(d=>({ day:d, date:addDays(start,d-1).toISOString() })),
      stopDate:addDays(start,egg.stopTurn-1).toISOString(),
      at:new Date().toISOString(),
    };
    saveHist([item,...(hist||[])].slice(0,20));
    setSelHist(item); setScreen("result");
  };

  const saveEclosion = () => {
    if (!selHist||!eclosionInput) return;
    const hatched=parseInt(eclosionInput), total=parseInt(selHist.form.qty);
    const rate=Math.round(hatched/total*100);
    const updated={...selHist, eclosionResult:{hatched,total,rate,savedAt:new Date().toISOString()}};
    saveHist((hist||[]).map(h=>h.id===selHist.id?updated:h));
    setSelHist(updated); setEI(""); setScreen("histDetail");
  };

  if (screen==="eclosionEntry"&&selHist) {
    const egg=EGG_TYPES[selHist.form.type], total=parseInt(selHist.form.qty);
    return (
      <div>
        <SubHeader bg={`linear-gradient(135deg,${C.green},${C.greenDk})`}
          title="Résultat d'éclosion" subtitle={`${egg?.name} · ${total} œufs`}
          onBack={()=>setScreen("histDetail")} backLabel="Détail" />
        <div style={{padding:16}}>
          <div style={{...card({background:C.greenLt})}}>
            <div style={{fontWeight:800,color:C.green,marginBottom:10}}>🐣 Combien d'œufs ont éclos ?</div>
            <span style={lbl}>Nombre de {egg?.youngName||"animaux"} éclos</span>
            <input type="number" placeholder={`Ex: ${Math.round(total*0.75)}`}
              style={{...inp({fontSize:22,fontWeight:700,textAlign:"center"}),marginBottom:8}}
              value={eclosionInput} onChange={e=>setEI(e.target.value.replace(/[^0-9]/g,""))} />
            <div style={{fontSize:12,color:C.muted,textAlign:"center",marginBottom:16}}>sur {total} œufs mis en incubation</div>
            {eclosionInput&&parseInt(eclosionInput)<=total&&(
              <div style={{background:"#fff",borderRadius:10,padding:"10px 12px",marginBottom:16,textAlign:"center"}}>
                <div style={{fontSize:11,color:C.muted}}>Taux calculé</div>
                <div style={{fontSize:30,fontWeight:900,color:C.green}}>{Math.round(parseInt(eclosionInput)/total*100)}%</div>
              </div>
            )}
            <button onClick={saveEclosion}
              style={btn(eclosionInput&&parseInt(eclosionInput)<=total?C.green:"#CCC")}
              disabled={!eclosionInput||parseInt(eclosionInput)>total}>
              ✓ Enregistrer le résultat
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (screen==="histDetail"&&selHist) {
    const egg=EGG_TYPES[selHist.form.type];
    const now=new Date(), ecloDate=new Date(selHist.eclosion);
    const currentDay=Math.floor((now-new Date(selHist.form.dateStart))/86400000)+1;
    const isActive=now<ecloDate, isComplete=!isActive&&!selHist.eclosionResult, hasResult=!!selHist.eclosionResult;
    return (
      <div>
        <div style={{background:`linear-gradient(135deg,${C.green},${C.greenDk})`,padding:"14px 18px",color:"#fff"}}>
          <BackBtn onBack={()=>setScreen("history")} label="Historique" />
          <div style={{fontWeight:900,fontSize:19,marginTop:8}}>{egg?.icon} {egg?.name}</div>
          <div style={{fontSize:13,opacity:.85}}>{selHist.form.qty} œufs</div>
          <div style={{marginTop:8,display:"flex",gap:8,flexWrap:"wrap"}}>
            {isActive&&<span style={{...tag("rgba(255,255,255,.25)","#fff")}}>🔄 J{currentDay} en cours</span>}
            {isComplete&&<span style={{...tag("rgba(255,165,0,.4)","#fff")}}>⏳ Résultat manquant</span>}
            {hasResult&&<span style={{...tag("rgba(255,255,255,.25)","#fff")}}>✅ Résultat enregistré</span>}
          </div>
        </div>
        <div style={{padding:"14px 16px"}}>
          {isActive&&(
            <div style={{...card({background:C.greenLt})}}>
              <div style={{fontWeight:800,color:C.green,marginBottom:8}}>📅 Statut actuel</div>
              <Row label="Aujourd'hui"           value={`Jour ${currentDay} / ${egg?.days}`} accent />
              <Row label="Éclosion prévue"        value={fmtDate(selHist.eclosion)} />
              {currentDay<=(egg?.stopTurn||18)
                ? <Row label="Retournement du jour" value={egg?.turnHours?.join(" – ")||"—"} />
                : <Row label="Retournement"         value="Arrêté ✅" />}
            </div>
          )}
          {hasResult&&(()=>{
            const fb=getEclosionFeedback(selHist.eclosionResult.rate,egg?.minRate||65);
            return (
              <div style={{...card({background:fb.bg})}}>
                <div style={{fontWeight:800,color:fb.color,marginBottom:10,fontSize:15}}>{fb.label}</div>
                <div style={{fontSize:28,fontWeight:900,color:fb.color,marginBottom:4}}>{selHist.eclosionResult.rate}%</div>
                <div style={{fontSize:12,color:C.muted,marginBottom:10}}>
                  {selHist.eclosionResult.hatched} éclos sur {selHist.eclosionResult.total} œufs
                </div>
                <div style={{fontSize:13,lineHeight:1.6,color:C.text}}>{fb.msg}</div>
              </div>
            );
          })()}
          <div style={{...card()}}>
            <div style={{fontWeight:800,fontSize:14,marginBottom:12}}>📅 Dates clés</div>
            <Row label="Mise en incubation" value={fmtDate(selHist.form.dateStart)} />
            {selHist.mirages?.map(m=><Row key={m.day} label={`Mirage (J${m.day})`} value={fmtDate(m.date)} />)}
            <Row label={`Arrêt retournement (J${egg?.stopTurn})`} value={fmtDate(selHist.stopDate)} />
            <Row label={`Éclosion prévue (J${egg?.days})`}        value={fmtDate(selHist.eclosion)} accent />
          </div>
          {isComplete&&(
            <button onClick={()=>{setEI("");setScreen("eclosionEntry");}} style={btn(C.green)}>
              🐣 Enregistrer le résultat d'éclosion
            </button>
          )}
        </div>
      </div>
    );
  }

  if (screen==="history") {
    return (
      <div>
        <SubHeader bg={`linear-gradient(135deg,${C.green},${C.greenDk})`}
          title="Historique" subtitle={`${(hist||[]).length} incubation(s)`}
          onBack={()=>setScreen("home")} backLabel="Incubation" />
        <div style={{padding:16}}>
          {(hist||[]).length===0 ? (
            <div style={{...card(),textAlign:"center",padding:32,color:C.muted}}>
              <div style={{fontSize:40,marginBottom:12}}>📋</div>
              <div style={{fontWeight:700}}>Aucune incubation enregistrée</div>
            </div>
          ) : (hist||[]).map((h,i)=>{
            const egg=EGG_TYPES[h.form?.type];
            const now=new Date(), isActive=now<new Date(h.eclosion), hasResult=!!h.eclosionResult;
            const dayN=Math.floor((now-new Date(h.form?.dateStart))/86400000)+1;
            return (
              <button key={i} onClick={()=>{setSelHist(h);setScreen("histDetail");}}
                style={{...card({cursor:"pointer",width:"100%",textAlign:"left"})}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                  <div style={{fontWeight:800,fontSize:15}}>{egg?.icon} {egg?.name}</div>
                  {isActive ? <span style={{...tag(C.greenLt,C.green)}}>J{dayN} en cours</span>
                    : hasResult ? <span style={{...tag(C.blueLt,C.blue)}}>✅ {h.eclosionResult.rate}%</span>
                    : <span style={{...tag(C.orangeLt,C.orange)}}>⏳ Résultat manquant</span>}
                </div>
                <div style={{fontSize:12,color:C.muted}}>Mise : {fmtDate(h.form?.dateStart)} · {h.form?.qty} œufs</div>
                <div style={{fontSize:12,color:C.muted}}>Éclosion : {fmtDate(h.eclosion)}</div>
                <div style={{fontSize:11,color:C.blue,marginTop:4,fontWeight:700}}>Appuyer pour voir le détail →</div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  if (screen==="new") {
    const egg=EGG_TYPES[form.type];
    return (
      <div>
        <SubHeader bg={`linear-gradient(135deg,${C.green},${C.greenDk})`}
          title="Nouvelle incubation" onBack={()=>setScreen("home")} backLabel="Incubation" />
        <div style={{padding:16}}>
          <div style={{...card()}}>
            <span style={lbl}>Type d'œuf</span>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:14}}>
              {Object.entries(EGG_TYPES).map(([k,e])=>(
                <button key={k} onClick={()=>setForm(f=>({...f,type:k}))}
                  style={{background:form.type===k?C.green:C.bg,color:form.type===k?"#fff":C.text,
                    border:`2px solid ${form.type===k?C.green:C.border}`,borderRadius:10,
                    padding:"10px 8px",cursor:"pointer",fontFamily:"'Nunito',sans-serif",
                    fontWeight:700,fontSize:13,display:"flex",alignItems:"center",gap:6}}>
                  {e.icon} {e.name}
                </button>
              ))}
            </div>
            {egg&&(
              <div style={{background:C.greenLt,borderRadius:10,padding:10,marginBottom:14,fontSize:13,color:C.green}}>
                <strong>{egg.days} jours</strong> · Mirage J{egg.mirage.join(", J")} · Arrêt J{egg.stopTurn} · {egg.turnsPerDay}×/j
              </div>
            )}
            <span style={lbl}>Date de mise en incubation</span>
            <input type="date" style={{...inp(),marginBottom:14}}
              value={form.dateStart} onChange={e=>setForm(f=>({...f,dateStart:e.target.value}))} />
            <span style={lbl}>Nombre d'œufs</span>
            <input type="number" placeholder="Ex: 100" style={{...inp(),marginBottom:20}}
              value={form.qty} onChange={e=>setForm(f=>({...f,qty:e.target.value}))} />
            <button onClick={calculate}
              style={btn(form.type&&form.dateStart&&form.qty?C.green:"#AAC8AA")}
              disabled={!form.type||!form.dateStart||!form.qty}>
              Calculer mon incubation →
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (screen==="result"&&selHist) {
    const egg=EGG_TYPES[selHist.form.type];
    return (
      <div>
        <div style={{background:`linear-gradient(135deg,${C.green},${C.greenDk})`,padding:"14px 18px",color:"#fff"}}>
          <BackBtn onBack={()=>setScreen("new")} label="Modifier" />
          <div style={{fontWeight:900,fontSize:19,marginTop:8}}>{egg.icon} Incubation {egg.name}</div>
          <div style={{fontSize:13,opacity:.85}}>{selHist.form.qty} œufs · {egg.days} jours</div>
        </div>
        <div style={{padding:"14px 16px"}}>
          <div style={{...card({background:C.greenLt})}}>
            <div style={{fontWeight:800,color:C.green,marginBottom:12,fontSize:14}}>📅 Dates clés</div>
            <Row label="Mise en incubation" value={fmtDate(selHist.form.dateStart)} />
            {selHist.mirages.map(m=><Row key={m.day} label={`Mirage (J${m.day})`} value={fmtDate(m.date)} />)}
            <Row label={`Arrêt retournement (J${egg.stopTurn})`} value={fmtDate(selHist.stopDate)} />
            <Row label={`🎉 Éclosion prévue (J${egg.days})`}     value={fmtDate(selHist.eclosion)} accent />
          </div>
          <div style={{...card()}}>
            <div style={{fontWeight:800,fontSize:14,marginBottom:12}}>⚙️ Paramètres par phase</div>
            {egg.phases.map((p,i)=>(
              <div key={i} style={{background:C.bg,borderRadius:10,padding:"10px 12px",marginBottom:8}}>
                <div style={{fontWeight:800,fontSize:12,color:C.green,marginBottom:6}}>{p.label}</div>
                <div style={{display:"flex",gap:14,fontSize:13,flexWrap:"wrap"}}>
                  <span>🌡️ <strong>{p.temp}</strong></span>
                  <span>💧 <strong>{p.hum}</strong></span>
                </div>
                {p.note&&<div style={{fontSize:11,color:C.orange,marginTop:5,fontWeight:700}}>⚠️ {p.note}</div>}
              </div>
            ))}
            <Row label="Retournements / jour" value={`${egg.turnsPerDay}× par jour`} />
            <div style={{padding:"7px 0",fontSize:13}}>
              <span style={{color:C.muted}}>Heures recommandées</span>
              <div style={{display:"flex",gap:6,flexWrap:"wrap",marginTop:6}}>
                {egg.turnHours.map(h=><span key={h} style={{...tag(C.greenLt,C.green)}}>🕐 {h}</span>)}
              </div>
            </div>
          </div>
          <div style={{...card()}}>
            <div style={{fontWeight:800,fontSize:14,marginBottom:12}}>🔔 Rappels importants</div>
            {egg.tips.map((t,i)=>(
              <div key={i} style={{display:"flex",gap:10,padding:"8px 0",
                borderBottom:i<egg.tips.length-1?`1px solid ${C.border}`:"none"}}>
                <span style={{background:C.green,color:"#fff",borderRadius:6,padding:"2px 7px",
                  fontSize:11,fontWeight:900,flexShrink:0,height:"fit-content"}}>J{t.day}</span>
                <span style={{fontSize:13,lineHeight:1.6,color:C.text}}>{t.text}</span>
              </div>
            ))}
          </div>
          <div style={{...card({background:C.greenLt})}}>
            <div style={{fontWeight:800,color:C.green,marginBottom:10}}>💎 À retenir pour cette espèce</div>
            {egg.specialTips.map((t,i)=>(
              <div key={i} style={{display:"flex",gap:8,padding:"5px 0",fontSize:13,lineHeight:1.5,alignItems:"flex-start"}}>
                <span style={{color:C.green,flexShrink:0}}>•</span>{t}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header bg={`linear-gradient(150deg,${C.green},${C.greenDk})`}
        emoji="🥚" title="Incubation des œufs" subtitle="Guidez chaque incubation pas à pas" onBack={onBack} />
      <div style={{padding:16}}>
        <button onClick={()=>{setForm({type:"",dateStart:"",qty:""});setScreen("new");}} style={{...btn(C.green),marginBottom:10}}>
          + Nouvelle incubation
        </button>
        <button onClick={()=>setScreen("history")} style={outlineBtn(C.green)}>
          📋 Historique ({(hist||[]).length})
        </button>
        <div style={{...card({background:C.greenLt,marginTop:14})}}>
          <div style={{fontWeight:800,color:C.green,marginBottom:8}}>💡 Le saviez-vous ?</div>
          <div style={{fontSize:13,lineHeight:1.6}}>
            Un taux d'éclosion de <strong>70–85%</strong> est excellent. <strong>📚 Des formations gratuites</strong> sont disponibles dans la section Formations.
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
//  DÉMARRAGE POUSSINS
// ═══════════════════════════════════════════

function PoussinModule({ onBack }) {
  const [screen,setScreen]=useState("home");
  const [form,setForm]=useState({species:"poulet_chair",age:"",qty:""});
  const [weekData,setWD]=useState(null);

  const search=()=>{
    const ageW=Math.max(1,Math.ceil(parseInt(form.age)/7));
    const weeks=POUSSIN_WEEKS[form.species]||POUSSIN_WEEKS.poulet_chair;
    const closest=weeks.reduce((best,w)=>Math.abs(w.w-ageW)<Math.abs(best.w-ageW)?w:best,weeks[0]);
    setWD({...closest,ageW,species:form.species}); setScreen("result");
  };

  const tips=["Observer les poussins 2× par jour pour détecter tout comportement anormal.",
    "Regroupés sous la chaleur = trop froid. Dispersés et haletants = trop chaud.",
    "L'eau doit être propre et fraîche. Nettoyer les abreuvoirs chaque jour.",
    "Éviter les courants d'air tout en maintenant une bonne ventilation.",
    "Litière toujours sèche. Litière humide = coccidiose et maladies respiratoires."];

  if (screen==="result"&&weekData) {
    const wd=weekData;
    return (
      <div>
        <div style={{background:`linear-gradient(135deg,${C.orange},#B94F08)`,padding:"14px 18px",color:"#fff"}}>
          <BackBtn onBack={()=>setScreen("form")} label="Modifier" />
          <div style={{fontWeight:900,fontSize:19,marginTop:8}}>🐣 Semaine {wd.ageW} · {form.qty} poussins</div>
          <div style={{fontSize:13,opacity:.85}}>{wd.species==="poulet_chair"?"Poulet de chair":"Pondeuse"}</div>
        </div>
        <div style={{padding:"14px 16px"}}>
          <div style={{...card({background:"#FFF3EC"})}}>
            <div style={{fontWeight:800,color:C.orange,marginBottom:6}}>🌡️ Température recommandée</div>
            <div style={{fontSize:28,fontWeight:900,color:"#B94F08"}}>{wd.tMin}–{wd.tMax}°C</div>
            <div style={{fontSize:12,color:C.muted,marginTop:4}}>Mesurée au niveau des poussins</div>
          </div>
          <div style={{...card()}}>
            <div style={{fontWeight:800,fontSize:14,marginBottom:10}}>📊 Paramètres semaine {wd.ageW}</div>
            <Row label="Alimentation"  value={wd.food} />
            <Row label="Eau / poussin" value={wd.eau} />
            <Row label="Densité"       value={wd.density} />
            <Row label="Poids attendu" value={`~${wd.poids}g`} accent />
            <Row label="Vaccination"   value={wd.vacc} />
          </div>
          <div style={{...card({background:C.greenLt})}}>
            <div style={{fontWeight:800,color:C.green,marginBottom:10}}>✅ Conseils pratiques</div>
            {tips.map((t,i)=>(
              <div key={i} style={{display:"flex",gap:8,padding:"5px 0",alignItems:"flex-start",fontSize:13,lineHeight:1.5}}>
                <span style={{color:C.green,fontSize:15,flexShrink:0}}>•</span>{t}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (screen==="form") {
    return (
      <div>
        <SubHeader bg={`linear-gradient(135deg,${C.orange},#B94F08)`}
          title="Paramètres de votre élevage" onBack={()=>setScreen("home")} backLabel="Poussins" />
        <div style={{padding:16}}>
          <div style={{...card()}}>
            <span style={lbl}>Type d'élevage</span>
            <div style={{display:"flex",gap:8,marginBottom:14}}>
              {[["poulet_chair","🐓 Poulet chair"],["pondeuse","🥚 Pondeuse"]].map(([k,l])=>(
                <button key={k} onClick={()=>setForm(f=>({...f,species:k}))}
                  style={{flex:1,background:form.species===k?C.orange:C.bg,color:form.species===k?"#fff":C.text,
                    border:`2px solid ${form.species===k?C.orange:C.border}`,borderRadius:10,
                    padding:12,cursor:"pointer",fontWeight:700,fontFamily:"'Nunito',sans-serif",fontSize:13}}>
                  {l}
                </button>
              ))}
            </div>
            <span style={lbl}>Âge des poussins (jours)</span>
            <input type="number" placeholder="Ex: 7" style={{...inp(),marginBottom:14}}
              value={form.age} onChange={e=>setForm(f=>({...f,age:e.target.value}))} />
            <span style={lbl}>Nombre de poussins</span>
            <input type="number" placeholder="Ex: 500" style={{...inp(),marginBottom:20}}
              value={form.qty} onChange={e=>setForm(f=>({...f,qty:e.target.value}))} />
            <button onClick={search} style={btn(form.age&&form.qty?C.orange:"#CCC")}
              disabled={!form.age||!form.qty}>Voir les paramètres →</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header bg={`linear-gradient(150deg,${C.orange},#B94F08)`}
        emoji="🐣" title="Démarrage Poussins" subtitle="Paramètres et conseils par semaine" onBack={onBack} />
      <div style={{padding:16}}>
        <button onClick={()=>setScreen("form")} style={btn(C.orange)}>Consulter les paramètres</button>
        <div style={{...card({background:"#FFF3EC",marginTop:14})}}>
          <div style={{fontWeight:800,color:C.orange,marginBottom:8}}>⚠️ Règle d'or</div>
          <div style={{fontSize:13,lineHeight:1.6}}>
            Observer le comportement de vos poussins est <strong>plus fiable que tout thermomètre</strong>.
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
//  MALADIES
// ═══════════════════════════════════════════

function MaladiesModule({ onBack }) {
  const [screen,setScreen]     = useState("home");
  const [selected,setSelected] = useState([]);
  const [results,setResults]   = useState([]);
  const [detail,setDetail]     = useState(null);

  const toggle=id=>setSelected(s=>s.includes(id)?s.filter(x=>x!==id):[...s,id]);
  const analyze=()=>{
    const scored=DISEASES.map(d=>{
      const matches=d.symptoms.filter(s=>selected.includes(s)).length;
      return {...d,matches,pct:Math.round(matches/d.symptoms.length*100)};
    }).filter(d=>d.matches>0).sort((a,b)=>b.pct-a.pct);
    setResults(scored); setScreen("results");
  };

  const WarningThenVet = () => (
    <>
      <div style={{...card({background:C.redLt,border:`1px solid ${C.red}33`})}}>
        <div style={{fontWeight:800,color:C.red,fontSize:12,marginBottom:4}}>⚕️ AVERTISSEMENT</div>
        <div style={{fontSize:12,color:C.red,lineHeight:1.5}}>
          Ces informations sont des <strong>conseils préliminaires uniquement</strong>. Elles ne remplacent jamais un diagnostic vétérinaire professionnel.
        </div>
      </div>
      <div style={{...card({background:C.purpleLt,border:`1px solid ${C.purple}33`})}}>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
          <span style={{...tag(C.purple,"#fff")}}>⭐ Premium</span>
          <span style={{fontWeight:800,color:C.purple,fontSize:13}}>Consulter un vétérinaire</span>
        </div>
        <div style={{fontSize:13,color:C.text,lineHeight:1.6,marginBottom:10}}>
          Pour un diagnostic fiable et un traitement adapté, consultez un vétérinaire partenaire AviAssist — réponse en moins de 24h.
        </div>
        <button style={btn(C.purple)}>📞 Demander une consultation</button>
      </div>
    </>
  );

  if (detail) {
    return (
      <div>
        <div style={{background:`linear-gradient(135deg,${C.red},#8B1A1A)`,padding:"14px 18px",color:"#fff"}}>
          <BackBtn onBack={()=>setDetail(null)} label="Résultats" />
          <div style={{fontWeight:900,fontSize:19,marginTop:8}}>{detail.name}</div>
          <span style={{...tag("rgba(255,255,255,.2)","#fff"),marginTop:6}}>⚠️ Gravité : {detail.severity}</span>
        </div>
        <div style={{padding:16}}>
          <div style={{...card()}}><div style={{fontWeight:800,marginBottom:8}}>📋 Description</div><div style={{fontSize:13,lineHeight:1.6}}>{detail.description}</div></div>
          <div style={{...card({background:C.orangeLt})}}><div style={{fontWeight:800,color:C.orange,marginBottom:8}}>🛡️ Prévention</div><div style={{fontSize:13,lineHeight:1.6}}>{detail.prevention}</div></div>
          <div style={{...card({background:C.greenLt})}}><div style={{fontWeight:800,color:C.green,marginBottom:8}}>💊 Traitement recommandé</div><div style={{fontSize:13,lineHeight:1.6}}>{detail.treatment}</div></div>
          <WarningThenVet />
        </div>
      </div>
    );
  }

  if (screen==="results") {
    return (
      <div>
        <SubHeader bg={`linear-gradient(135deg,${C.red},#8B1A1A)`} title="Maladies possibles"
          subtitle={`${selected.length} symptôme(s) · ${results.length} correspondance(s)`}
          onBack={()=>setScreen("symptoms")} backLabel="Symptômes" />
        <div style={{padding:16}}>
          {results.length===0 ? (
            <div style={{...card(),textAlign:"center",padding:32,color:C.muted}}><div style={{fontSize:40}}>🔍</div><div style={{fontWeight:700,marginTop:10}}>Aucune correspondance</div></div>
          ) : results.map((d,i)=>(
            <button key={i} onClick={()=>setDetail(d)}
              style={{...card({cursor:"pointer",width:"100%",textAlign:"left",border:`1.5px solid ${d.color}33`})}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                <div style={{fontWeight:900,fontSize:15}}>{d.name}</div>
                <span style={{...tag(`${d.color}22`,d.color)}}>{d.severity}</span>
              </div>
              <div style={{fontSize:12,color:C.muted,marginBottom:8}}>{d.matches}/{d.symptoms.length} symptômes concordants</div>
              <div style={{background:C.bg,borderRadius:6,height:6,overflow:"hidden"}}>
                <div style={{background:d.color,width:`${d.pct}%`,height:"100%",borderRadius:6}} />
              </div>
              <div style={{fontSize:11,color:C.muted,marginTop:5}}>Appuyer pour voir détail →</div>
            </button>
          ))}
          <WarningThenVet />
        </div>
      </div>
    );
  }

  if (screen==="symptoms") {
    return (
      <div>
        <div style={{background:`linear-gradient(135deg,${C.red},#8B1A1A)`,padding:"14px 18px",color:"#fff"}}>
          <BackBtn onBack={()=>setScreen("home")} label="Maladies" />
          <div style={{fontWeight:900,fontSize:17,marginTop:8}}>Sélectionner les symptômes</div>
          <div style={{fontSize:12,opacity:.85,marginTop:3}}>{selected.length} sélectionné(s)</div>
        </div>
        <div style={{padding:16}}>
          <div style={{...card()}}>
            {SYMPTOMS.map(s=>(
              <button key={s.id} onClick={()=>toggle(s.id)} style={{
                width:"100%",background:selected.includes(s.id)?C.redLt:"transparent",
                border:`1.5px solid ${selected.includes(s.id)?C.red:C.border}`,
                borderRadius:10,padding:"11px 13px",cursor:"pointer",textAlign:"left",
                marginBottom:7,display:"flex",alignItems:"center",gap:12,fontFamily:"'Nunito',sans-serif"}}>
                <div style={{width:20,height:20,borderRadius:5,flexShrink:0,
                  background:selected.includes(s.id)?C.red:"transparent",
                  border:`2px solid ${selected.includes(s.id)?C.red:C.border}`,
                  display:"flex",alignItems:"center",justifyContent:"center"}}>
                  {selected.includes(s.id)&&<span style={{color:"#fff",fontSize:12,fontWeight:900}}>✓</span>}
                </div>
                <span style={{fontSize:14,fontWeight:600,color:C.text}}>{s.label}</span>
              </button>
            ))}
          </div>
          <button onClick={analyze} style={btn(selected.length>0?C.red:"#CCC")} disabled={selected.length===0}>
            Analyser les symptômes ({selected.length}) →
          </button>
        </div>
      </div>
    );
  }

  if (screen==="library") {
    return (
      <div>
        <SubHeader bg={`linear-gradient(135deg,${C.red},#8B1A1A)`} title="Bibliothèque des maladies"
          subtitle={`${DISEASES.length} maladies répertoriées`} onBack={()=>setScreen("home")} backLabel="Maladies" />
        <div style={{padding:16}}>
          {DISEASES.map((d,i)=>(
            <button key={i} onClick={()=>setDetail(d)} style={{...card({cursor:"pointer",width:"100%",textAlign:"left"})}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                <div style={{fontWeight:800,fontSize:14}}>{d.name}</div>
                <span style={{...tag(`${d.color}22`,d.color)}}>{d.severity}</span>
              </div>
              <div style={{fontSize:12,color:C.muted,lineHeight:1.4}}>{d.description}</div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header bg={`linear-gradient(150deg,${C.red},#8B1A1A)`} emoji="🩺" title="Assistance Maladies" subtitle="Identifier et agir rapidement" onBack={onBack} />
      <div style={{padding:16}}>
        <button onClick={()=>{setSelected([]);setScreen("symptoms");}} style={{...btn(C.red),marginBottom:10}}>🔍 Analyser des symptômes</button>
        <button onClick={()=>setScreen("library")} style={outlineBtn(C.red)}>📚 Bibliothèque des maladies ({DISEASES.length})</button>
        <div style={{...card({background:C.redLt,border:`1px solid ${C.red}33`,marginTop:14})}}>
          <div style={{fontWeight:800,color:C.red,marginBottom:8}}>⚕️ Important</div>
          <div style={{fontSize:13,color:C.red,lineHeight:1.6}}>Cet outil propose des <strong>pistes préliminaires</strong>. Il ne remplace jamais un vétérinaire.</div>
        </div>
        <div style={{...card({background:C.purpleLt,border:`1px solid ${C.purple}22`,marginTop:4})}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
            <span style={{...tag(C.purple,"#fff")}}>⭐ Premium</span>
            <span style={{fontWeight:800,color:C.purple,fontSize:13}}>Consulter un vétérinaire</span>
          </div>
          <div style={{fontSize:12,color:C.text,lineHeight:1.5}}>Accédez à nos vétérinaires partenaires pour un diagnostic fiable.</div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
//  FORMATIONS
// ═══════════════════════════════════════════

function FormationsModule({ onBack }) {
  const [cat,setCat]=useState("Tous");
  const [detail,setDetail]=useState(null);
  const cats=["Tous",...new Set(FORMATIONS.map(f=>f.cat))];
  const list=cat==="Tous"?FORMATIONS:FORMATIONS.filter(f=>f.cat===cat);

  if (detail) {
    const typeIcon={Vidéo:"🎬",PDF:"📄",Cours:"📖"}[detail.type]||"📄";
    return (
      <div>
        <div style={{background:`linear-gradient(135deg,${C.blue},#0C3C7A)`,padding:"14px 18px",color:"#fff"}}>
          <BackBtn onBack={()=>setDetail(null)} label="Formations" />
          <div style={{fontWeight:900,fontSize:17,marginTop:8,lineHeight:1.3}}>{detail.title}</div>
          <div style={{display:"flex",gap:8,marginTop:8,flexWrap:"wrap"}}>
            <span style={{...tag("rgba(255,255,255,.2)","#fff")}}>{typeIcon} {detail.type}</span>
            <span style={{...tag("rgba(255,255,255,.2)","#fff")}}>⏱ {detail.dur}</span>
            <span style={{...tag("rgba(255,255,255,.2)","#fff")}}>{detail.cat}</span>
          </div>
        </div>
        <div style={{padding:16}}>
          {detail.premium
            ? <div style={{...card({background:C.orangeLt,border:`1px solid ${C.orange}33`,marginBottom:14})}}><div style={{fontWeight:800,color:C.orange,marginBottom:6}}>⭐ Contenu Premium</div><div style={{fontSize:13}}>Cette formation nécessite un abonnement premium.</div></div>
            : <div style={{...card({background:C.greenLt,marginBottom:14})}}><div style={{fontWeight:800,color:C.green,marginBottom:4}}>✅ Accès gratuit</div><div style={{fontSize:13}}>Cette formation est disponible gratuitement.</div></div>}
          <div style={{...card()}}><div style={{fontWeight:800,marginBottom:8}}>📋 Description</div><div style={{fontSize:14,lineHeight:1.6}}>{detail.desc}</div></div>
          <button style={btn(detail.premium?C.orange:C.blue)} disabled={detail.premium}>
            {detail.premium?"🔒 Débloquer avec Premium":`${typeIcon} Accéder à la formation`}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header bg={`linear-gradient(150deg,${C.blue},#0C3C7A)`} emoji="📚" title="Formations Avicoles" subtitle="Apprenez des experts du secteur" onBack={onBack} />
      <div style={{display:"flex",gap:8,padding:"12px 16px",overflowX:"auto"}}>
        {cats.map(c=>(
          <button key={c} onClick={()=>setCat(c)} style={{
            background:cat===c?C.blue:C.card,color:cat===c?"#fff":C.text,
            border:`1.5px solid ${cat===c?C.blue:C.border}`,borderRadius:20,
            padding:"6px 14px",cursor:"pointer",fontWeight:700,fontSize:12,
            whiteSpace:"nowrap",fontFamily:"'Nunito',sans-serif"}}>{c}</button>
        ))}
      </div>
      <div style={{padding:"0 16px 16px"}}>
        <div style={{fontSize:11,color:C.muted,marginBottom:10,fontWeight:700}}>{list.length} formation(s) · {list.filter(f=>!f.premium).length} gratuites</div>
        {list.map(f=>{
          const typeIcon={Vidéo:"🎬",PDF:"📄",Cours:"📖"}[f.type]||"📄";
          return (
            <button key={f.id} onClick={()=>setDetail(f)} style={{...card({cursor:"pointer",width:"100%",textAlign:"left"})}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6}}>
                <div style={{fontWeight:800,fontSize:14,flex:1,marginRight:8,lineHeight:1.3}}>{f.title}</div>
                {f.premium ? <span style={{...tag(C.orangeLt,C.orange),flexShrink:0}}>⭐ Premium</span>
                  : <span style={{...tag(C.greenLt,C.green),flexShrink:0}}>✅ Gratuit</span>}
              </div>
              <div style={{fontSize:12,color:C.muted,marginBottom:8,lineHeight:1.4}}>{f.desc}</div>
              <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                <span style={{...tag(C.bg,C.muted)}}>{typeIcon} {f.type}</span>
                <span style={{...tag(C.bg,C.muted)}}>⏱ {f.dur}</span>
                <span style={{...tag(C.blueLt,C.blue)}}>{f.cat}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
//  TRÉSORERIE
// ═══════════════════════════════════════════

const emptyDep = () => ({ cat:"", description:"", montant:"", date:today() });
const emptyVen = () => ({ produit:"", qty:"", prixUnit:"", montant:"", date:today(), remarque:"" });

function TresorerieModule({ onBack }) {
  const [bandes,saveBandes] = useStorage("avi:tresorerie_bandes",[]);
  const [screen,setScreen]   = useState("list");
  const [bandeId,setBandeId] = useState(null);
  const [tab,setTab]         = useState("depenses");
  const [confirmTerminer,setCT] = useState(false);
  const [fBande,setFBande]   = useState({nom:"",type:"",date:"",effectif:""});
  const [fDep,setFDep]       = useState(emptyDep());
  const [fVen,setFVen]       = useState(emptyVen());
  const [editDepId,setEditDepId] = useState(null);
  const [editVenId,setEditVenId] = useState(null);

  const list  = bandes||[];
  const bande = list.find(b=>b.id===bandeId)||null;
  const saveBande = u => saveBandes(list.map(b=>b.id===u.id?u:b));
  const totalDep  = b => (b?.depenses||[]).reduce((s,d)=>s+d.montant,0);
  const totalVent = b => (b?.ventes||[]).reduce((s,v)=>s+v.montant,0);
  const benefice  = b => totalVent(b)-totalDep(b);

  const createBande=()=>{
    if (!fBande.nom||!fBande.type||!fBande.date||!fBande.effectif) return;
    const b={id:genId(),...fBande,effectif:parseInt(fBande.effectif),depenses:[],ventes:[],status:"en_cours",createdAt:new Date().toISOString()};
    saveBandes([b,...list]); setBandeId(b.id); setFBande({nom:"",type:"",date:"",effectif:""}); setScreen("detail");
  };
  const terminerBande=()=>{ saveBande({...bande,status:"terminee",termineeAt:new Date().toISOString()}); setCT(false); };

  const addDep=()=>{
    if (!fDep.cat||!fDep.montant||!bande) return;
    const catObj=EXPENSE_CATEGORIES.find(c=>c.id===fDep.cat);
    const d={id:genId(),cat:fDep.cat,nom:catObj?.label||"",description:fDep.description,montant:parseFloat(fDep.montant),date:fDep.date};
    saveBande({...bande,depenses:[...bande.depenses,d]}); setFDep(emptyDep()); setScreen("detail"); setTab("depenses");
  };
  const updateDep=()=>{
    if (!fDep.cat||!fDep.montant||!bande||!editDepId) return;
    const catObj=EXPENSE_CATEGORIES.find(c=>c.id===fDep.cat);
    const d={id:editDepId,cat:fDep.cat,nom:catObj?.label||"",description:fDep.description,montant:parseFloat(fDep.montant),date:fDep.date};
    saveBande({...bande,depenses:bande.depenses.map(x=>x.id===editDepId?d:x)}); setEditDepId(null); setFDep(emptyDep()); setScreen("detail"); setTab("depenses");
  };
  const deleteDep=id=>{ saveBande({...bande,depenses:bande.depenses.filter(d=>d.id!==id)}); };

  const addVen=()=>{
    if (!fVen.produit||!fVen.montant||!bande) return;
    const v={id:genId(),...fVen,montant:parseFloat(fVen.montant)};
    saveBande({...bande,ventes:[...bande.ventes,v]}); setFVen(emptyVen()); setScreen("detail"); setTab("ventes");
  };
  const updateVen=()=>{
    if (!fVen.produit||!fVen.montant||!bande||!editVenId) return;
    const v={id:editVenId,...fVen,montant:parseFloat(fVen.montant)};
    saveBande({...bande,ventes:bande.ventes.map(x=>x.id===editVenId?v:x)}); setEditVenId(null); setFVen(emptyVen()); setScreen("detail"); setTab("ventes");
  };
  const deleteVen=id=>{ saveBande({...bande,ventes:bande.ventes.filter(v=>v.id!==id)}); };

  const autoMont = fVen.qty&&fVen.prixUnit ? (parseFloat(fVen.qty)*parseFloat(fVen.prixUnit)).toFixed(0) : "";

  // BILAN
  if (screen==="bilan"&&bande) {
    const td=totalDep(bande),tv=totalVent(bande),bn=tv-td,positif=bn>=0;
    const byCat=EXPENSE_CATEGORIES.map(c=>({...c,total:bande.depenses.filter(d=>d.cat===c.id).reduce((s,d)=>s+d.montant,0)})).filter(c=>c.total>0);
    return (
      <div>
        <div style={{background:`linear-gradient(135deg,${C.purple},#4A148C)`,padding:"14px 18px",color:"#fff"}}>
          <BackBtn onBack={()=>setScreen("detail")} label="Bande" />
          <div style={{fontWeight:900,fontSize:18,marginTop:8}}>📊 Bilan complet</div>
          <div style={{fontSize:13,opacity:.85}}>{bande.nom}</div>
        </div>
        <div style={{padding:"14px 16px"}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
            <div style={{...card({background:C.redLt,textAlign:"center"})}}>
              <div style={{fontSize:11,fontWeight:800,color:C.red,marginBottom:4}}>TOTAL DÉPENSES</div>
              <div style={{fontSize:17,fontWeight:900,color:C.red}}>{fmtCFA(td)}</div>
              <div style={{fontSize:11,color:C.muted}}>{bande.depenses.length} entrée(s)</div>
            </div>
            <div style={{...card({background:C.greenLt,textAlign:"center"})}}>
              <div style={{fontSize:11,fontWeight:800,color:C.green,marginBottom:4}}>TOTAL RECETTES</div>
              <div style={{fontSize:17,fontWeight:900,color:C.green}}>{fmtCFA(tv)}</div>
              <div style={{fontSize:11,color:C.muted}}>{bande.ventes.length} vente(s)</div>
            </div>
          </div>
          <div style={{...card({background:positif?C.greenLt:C.redLt,textAlign:"center",padding:"20px 16px",marginBottom:10})}}>
            <div style={{fontSize:14,fontWeight:800,color:positif?C.green:C.red,marginBottom:10}}>{positif?"✅ BÉNÉFICE NET":"❌ PERTE NETTE"}</div>
            <div style={{fontSize:32,fontWeight:900,color:positif?C.green:C.red}}>{positif?"+":"−"}{fmtCFA(Math.abs(bn))}</div>
            {td>0&&<div style={{fontSize:13,color:C.muted,marginTop:8}}>Rentabilité : <strong style={{color:positif?C.green:C.red}}>{tv>0?(bn>=0?"+":"")+Math.round(bn/td*100):0}%</strong>{bande.effectif>0&&tv>0&&<> · {fmtCFA(bn/bande.effectif)}/animal</>}</div>}
          </div>
          {td>0&&bande.effectif>0&&(
            <div style={{...card({marginBottom:10})}}>
              <div style={{fontWeight:800,marginBottom:8}}>🧮 Coût de production</div>
              <Row label="Coût total" value={fmtCFA(td)} />
              <Row label="Coût / animal" value={fmtCFA(td/bande.effectif)} />
              <Row label="Effectif initial" value={`${bande.effectif} animaux`} />
            </div>
          )}
          {byCat.length>0&&(
            <div style={{...card({marginBottom:10})}}>
              <div style={{fontWeight:800,marginBottom:10}}>📂 Dépenses par poste</div>
              {byCat.map((c,i)=>(
                <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:i<byCat.length-1?`1px solid ${C.border}`:"none"}}>
                  <span style={{fontSize:13}}>{c.icon} {c.label}</span>
                  <div style={{textAlign:"right"}}>
                    <div style={{fontSize:13,fontWeight:800,color:C.red}}>{fmtCFA(c.total)}</div>
                    <div style={{fontSize:10,color:C.muted}}>{td>0?Math.round(c.total/td*100):0}%</div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {bande.depenses.length>0&&(
            <div style={{...card({marginBottom:10})}}>
              <div style={{fontWeight:800,marginBottom:10}}>🧾 Détail toutes les dépenses</div>
              {[...bande.depenses].reverse().map((d,i)=>{
                const catObj=EXPENSE_CATEGORIES.find(c=>c.id===d.cat);
                return (
                  <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",padding:"8px 0",borderBottom:i<bande.depenses.length-1?`1px solid ${C.border}`:"none"}}>
                    <div><div style={{fontSize:13,fontWeight:800}}>{catObj?.icon} {catObj?.label}</div>{d.description&&<div style={{fontSize:11,color:C.muted,marginTop:1}}>{d.description}</div>}<div style={{fontSize:11,color:C.muted}}>{fmtDate(d.date)}</div></div>
                    <div style={{fontSize:14,fontWeight:900,color:C.red,flexShrink:0}}>{fmtCFA(d.montant)}</div>
                  </div>
                );
              })}
              <div style={{marginTop:10,paddingTop:10,borderTop:`2px solid ${C.border}`,display:"flex",justifyContent:"space-between"}}>
                <span style={{fontWeight:900,fontSize:14}}>Total dépenses</span>
                <span style={{fontWeight:900,fontSize:14,color:C.red}}>{fmtCFA(td)}</span>
              </div>
            </div>
          )}
          {bande.ventes.length>0&&(
            <div style={{...card({marginBottom:10})}}>
              <div style={{fontWeight:800,marginBottom:10}}>💵 Détail toutes les ventes</div>
              {[...bande.ventes].reverse().map((v,i)=>(
                <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",padding:"8px 0",borderBottom:i<bande.ventes.length-1?`1px solid ${C.border}`:"none"}}>
                  <div><div style={{fontSize:13,fontWeight:800}}>{v.produit}</div><div style={{fontSize:11,color:C.muted}}>{v.qty&&`${v.qty} unités · `}{v.prixUnit&&`${fmtCFA(v.prixUnit)}/u · `}{fmtDate(v.date)}</div>{v.remarque&&<div style={{fontSize:11,color:C.muted,fontStyle:"italic"}}>{v.remarque}</div>}</div>
                  <div style={{fontSize:14,fontWeight:900,color:C.green,flexShrink:0}}>{fmtCFA(v.montant)}</div>
                </div>
              ))}
              <div style={{marginTop:10,paddingTop:10,borderTop:`2px solid ${C.border}`,display:"flex",justifyContent:"space-between"}}>
                <span style={{fontWeight:900,fontSize:14}}>Total recettes</span>
                <span style={{fontWeight:900,fontSize:14,color:C.green}}>{fmtCFA(tv)}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // FORM DÉPENSE
  if ((screen==="addDep"||screen==="editDep")&&bande) {
    const isEdit=screen==="editDep";
    const selCat=EXPENSE_CATEGORIES.find(c=>c.id===fDep.cat);
    return (
      <div>
        <div style={{background:`linear-gradient(135deg,${C.red},#8B1A1A)`,padding:"14px 18px",color:"#fff"}}>
          <BackBtn onBack={()=>{setScreen("detail");setEditDepId(null);setFDep(emptyDep());}} label="Bande" />
          <div style={{fontWeight:900,fontSize:17,marginTop:8}}>{isEdit?"✏️ Modifier la dépense":"➕ Ajouter une dépense"}</div>
          <div style={{fontSize:12,opacity:.8}}>{bande.nom}</div>
        </div>
        <div style={{padding:16}}>
          <div style={{...card()}}>
            <span style={lbl}>Catégorie de la dépense</span>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:14}}>
              {EXPENSE_CATEGORIES.map(c=>(
                <button key={c.id} onClick={()=>setFDep(f=>({...f,cat:c.id}))}
                  style={{background:fDep.cat===c.id?C.red:C.bg,color:fDep.cat===c.id?"#fff":C.text,
                    border:`1.5px solid ${fDep.cat===c.id?C.red:C.border}`,borderRadius:10,
                    padding:"10px 8px",cursor:"pointer",fontSize:12,fontWeight:700,
                    fontFamily:"'Nunito',sans-serif",display:"flex",alignItems:"center",gap:6}}>
                  {c.icon} {c.label}
                </button>
              ))}
            </div>
            {selCat&&(
              <div style={{background:C.bg,borderRadius:10,padding:"10px 12px",marginBottom:14,display:"flex",alignItems:"center",gap:8}}>
                <span style={{fontSize:16}}>{selCat.icon}</span>
                <div>
                  <div style={{fontSize:14,fontWeight:800}}>{selCat.label}</div>
                  {fDep.description&&<div style={{fontSize:11,color:C.muted,marginTop:2}}>{fDep.description}</div>}
                </div>
                <span style={{...tag(C.redLt,C.red),marginLeft:"auto",fontSize:10}}>aperçu</span>
              </div>
            )}
            <span style={lbl}>Description <span style={{fontWeight:400,textTransform:"none",letterSpacing:0}}>(optionnel)</span></span>
            <input placeholder="Ex: 50kg sac vert, Livraison fournisseur X..." style={{...inp(),marginBottom:14}}
              value={fDep.description} onChange={e=>setFDep(f=>({...f,description:e.target.value}))} />
            <span style={lbl}>Montant (FCFA)</span>
            <input type="number" placeholder="Ex: 25000" style={{...inp({fontSize:20,fontWeight:700}),marginBottom:14}}
              value={fDep.montant} onChange={e=>setFDep(f=>({...f,montant:e.target.value}))} />
            <span style={lbl}>Date</span>
            <input type="date" style={{...inp(),marginBottom:20}}
              value={fDep.date} onChange={e=>setFDep(f=>({...f,date:e.target.value}))} />
            <button onClick={isEdit?updateDep:addDep} style={btn(fDep.cat&&fDep.montant?C.red:"#CCC")} disabled={!fDep.cat||!fDep.montant}>
              {isEdit?"✓ Enregistrer les modifications":"✓ Enregistrer la dépense"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // FORM VENTE
  if ((screen==="addVen"||screen==="editVen")&&bande) {
    const isEdit=screen==="editVen";
    const mont=fVen.qty&&fVen.prixUnit?(parseFloat(fVen.qty)*parseFloat(fVen.prixUnit)).toFixed(0):fVen.montant;
    return (
      <div>
        <div style={{background:`linear-gradient(135deg,${C.green},${C.greenDk})`,padding:"14px 18px",color:"#fff"}}>
          <BackBtn onBack={()=>{setScreen("detail");setEditVenId(null);setFVen(emptyVen());}} label="Bande" />
          <div style={{fontWeight:900,fontSize:17,marginTop:8}}>{isEdit?"✏️ Modifier la vente":"💵 Enregistrer une vente"}</div>
          <div style={{fontSize:12,opacity:.8}}>{bande.nom}</div>
        </div>
        <div style={{padding:16}}>
          <div style={{...card()}}>
            <span style={lbl}>Produit vendu</span>
            <input placeholder="Ex: Poulets vifs, Œufs..." style={{...inp(),marginBottom:14}}
              value={fVen.produit} onChange={e=>setFVen(f=>({...f,produit:e.target.value}))} />
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
              <div><span style={lbl}>Quantité</span>
                <input type="number" placeholder="50" style={inp()} value={fVen.qty}
                  onChange={e=>setFVen(f=>({...f,qty:e.target.value,montant:e.target.value&&f.prixUnit?(parseFloat(e.target.value)*parseFloat(f.prixUnit)).toFixed(0):f.montant}))} /></div>
              <div><span style={lbl}>Prix unitaire (F)</span>
                <input type="number" placeholder="2500" style={inp()} value={fVen.prixUnit}
                  onChange={e=>setFVen(f=>({...f,prixUnit:e.target.value,montant:e.target.value&&f.qty?(parseFloat(f.qty)*parseFloat(e.target.value)).toFixed(0):f.montant}))} /></div>
            </div>
            <span style={lbl}>Montant total encaissé (F)</span>
            <input type="number" placeholder="Montant total reçu"
              style={{...inp({background:C.greenLt,fontWeight:700,fontSize:18}),marginBottom:14}}
              value={fVen.qty&&fVen.prixUnit?autoMont:fVen.montant}
              onChange={e=>setFVen(f=>({...f,montant:e.target.value}))} />
            <span style={lbl}>Date de vente</span>
            <input type="date" style={{...inp(),marginBottom:14}}
              value={fVen.date} onChange={e=>setFVen(f=>({...f,date:e.target.value}))} />
            <span style={lbl}>Remarque <span style={{fontWeight:400,textTransform:"none",letterSpacing:0}}>(optionnel)</span></span>
            <input placeholder="Acheteur, conditions..." style={{...inp(),marginBottom:20}}
              value={fVen.remarque} onChange={e=>setFVen(f=>({...f,remarque:e.target.value}))} />
            <button onClick={isEdit?updateVen:addVen}
              style={btn(fVen.produit&&(fVen.montant||autoMont)?C.green:"#CCC")}
              disabled={!fVen.produit||(!fVen.montant&&!autoMont)}>
              {isEdit?"✓ Enregistrer les modifications":"✓ Enregistrer la vente"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // DÉTAIL BANDE
  if (screen==="detail"&&bande) {
    const td=totalDep(bande),tv=totalVent(bande),bn=benefice(bande),positif=bn>=0;
    const isTerminee=bande.status==="terminee";
    const handleEditDep=d=>{ setEditDepId(d.id); setFDep({cat:d.cat,description:d.description||"",montant:String(d.montant),date:d.date}); setScreen("editDep"); };
    const handleEditVen=v=>{ setEditVenId(v.id); setFVen({produit:v.produit,qty:v.qty||"",prixUnit:v.prixUnit||"",montant:String(v.montant),date:v.date,remarque:v.remarque||""}); setScreen("editVen"); };
    return (
      <div>
        <div style={{background:`linear-gradient(135deg,${C.purple},#4A148C)`,padding:"14px 18px",color:"#fff"}}>
          <BackBtn onBack={()=>{setCT(false);setScreen("list");}} label="Mes bandes" />
          <div style={{fontWeight:900,fontSize:18,marginTop:8}}>{bande.nom}</div>
          <div style={{fontSize:12,opacity:.8,marginTop:3}}>{bande.type} · {bande.effectif} animaux · {fmtDate(bande.date)}</div>
          <span style={{...tag(isTerminee?"rgba(100,255,150,.3)":"rgba(255,165,0,.3)","#fff"),marginTop:8}}>{isTerminee?"✅ Terminée":"🔄 En cours"}</span>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,padding:"12px 16px 8px"}}>
          {[{lbl:"Dépenses",val:fmtCFA(td),color:C.red,bg:C.redLt},{lbl:"Recettes",val:fmtCFA(tv),color:C.green,bg:C.greenLt},
            {lbl:positif?"Bénéfice":"Perte",val:fmtCFA(Math.abs(bn)),color:positif?C.green:C.red,bg:positif?C.greenLt:C.redLt}
          ].map((s,i)=>(
            <div key={i} style={{background:s.bg,borderRadius:12,padding:"10px 8px",textAlign:"center"}}>
              <div style={{fontSize:10,color:s.color,fontWeight:800,marginBottom:3}}>{s.lbl}</div>
              <div style={{fontSize:11,fontWeight:900,color:s.color}}>{s.val}</div>
            </div>
          ))}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,padding:"0 16px 12px"}}>
          {[{label:"➕ Dépense",bg:C.redLt,color:C.red,action:()=>{setFDep(emptyDep());setScreen("addDep");}},
            {label:"💵 Vente",bg:C.greenLt,color:C.green,action:()=>{setFVen(emptyVen());setScreen("addVen");}},
            {label:"📊 Bilan",bg:`${C.purple}22`,color:C.purple,action:()=>setScreen("bilan")}
          ].map((a,i)=>(
            <button key={i} onClick={a.action} style={{background:a.bg,color:a.color,border:"none",borderRadius:10,padding:"11px 6px",cursor:"pointer",fontWeight:800,fontSize:12,fontFamily:"'Nunito',sans-serif",lineHeight:1.3}}>{a.label}</button>
          ))}
        </div>
        <div style={{display:"flex",margin:"0 16px",background:C.bg,borderRadius:"10px 10px 0 0",overflow:"hidden"}}>
          {["depenses","ventes"].map(t=>(
            <button key={t} onClick={()=>setTab(t)} style={{flex:1,background:tab===t?C.purple:"transparent",color:tab===t?"#fff":C.muted,border:"none",padding:"10px 8px",cursor:"pointer",fontWeight:800,fontSize:13,fontFamily:"'Nunito',sans-serif"}}>
              {t==="depenses"?`🧾 Dépenses (${bande.depenses.length})`:`💵 Ventes (${bande.ventes.length})`}
            </button>
          ))}
        </div>
        <div style={{padding:"12px 16px 8px"}}>
          {tab==="depenses" ? (
            bande.depenses.length===0 ? (
              <div style={{...card({textAlign:"center",padding:28,color:C.muted})}}>
                <div style={{fontSize:32,marginBottom:8}}>🧾</div>
                <div style={{fontWeight:700}}>Aucune dépense encore</div>
                <div style={{fontSize:12,marginTop:5}}>Appuyer sur "➕ Dépense"</div>
              </div>
            ) : (
              <>
                {[...bande.depenses].reverse().map((d,i)=>{
                  const catObj=EXPENSE_CATEGORIES.find(c=>c.id===d.cat);
                  return (
                    <div key={i} style={{...card({display:"flex",justifyContent:"space-between",alignItems:"flex-start"})}}>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontSize:14,fontWeight:800}}>{catObj?.icon} {catObj?.label}</div>
                        {d.description&&<div style={{fontSize:12,color:C.muted,marginTop:2}}>{d.description}</div>}
                        <div style={{fontSize:11,color:C.muted,marginTop:2}}>{fmtDate(d.date)}</div>
                      </div>
                      <div style={{display:"flex",alignItems:"center",gap:6,flexShrink:0,marginLeft:8}}>
                        <div style={{fontSize:15,fontWeight:900,color:C.red}}>{fmtCFA(d.montant)}</div>
                        <button onClick={()=>handleEditDep(d)} style={{background:C.blueLt,border:"none",borderRadius:8,padding:"5px 8px",cursor:"pointer",fontSize:13,fontFamily:"'Nunito',sans-serif",color:C.blue,fontWeight:700}}>✏️</button>
                        <button onClick={()=>deleteDep(d.id)} style={{background:C.redLt,border:"none",borderRadius:8,padding:"5px 8px",cursor:"pointer",fontSize:13,fontFamily:"'Nunito',sans-serif",color:C.red,fontWeight:700}}>🗑</button>
                      </div>
                    </div>
                  );
                })}
                <div style={{background:C.redLt,borderRadius:10,padding:"10px 14px",display:"flex",justifyContent:"space-between",marginBottom:8}}>
                  <span style={{fontWeight:900,fontSize:14}}>Total dépenses</span>
                  <span style={{fontWeight:900,fontSize:14,color:C.red}}>{fmtCFA(td)}</span>
                </div>
              </>
            )
          ) : (
            bande.ventes.length===0 ? (
              <div style={{...card({textAlign:"center",padding:28,color:C.muted})}}>
                <div style={{fontSize:32,marginBottom:8}}>💵</div>
                <div style={{fontWeight:700}}>Aucune vente enregistrée</div>
                <div style={{fontSize:12,marginTop:5}}>Appuyer sur "💵 Vente"</div>
              </div>
            ) : (
              <>
                {[...bande.ventes].reverse().map((v,i)=>(
                  <div key={i} style={{...card({display:"flex",justifyContent:"space-between",alignItems:"flex-start"})}}>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:14,fontWeight:800}}>{v.produit}</div>
                      <div style={{fontSize:11,color:C.muted,marginTop:2}}>{v.qty&&`${v.qty} unités · `}{v.prixUnit&&`${fmtCFA(v.prixUnit)}/u · `}{fmtDate(v.date)}</div>
                      {v.remarque&&<div style={{fontSize:11,color:C.muted,fontStyle:"italic",marginTop:2}}>{v.remarque}</div>}
                    </div>
                    <div style={{display:"flex",alignItems:"center",gap:6,flexShrink:0,marginLeft:8}}>
                      <div style={{fontSize:15,fontWeight:900,color:C.green}}>{fmtCFA(v.montant)}</div>
                      <button onClick={()=>handleEditVen(v)} style={{background:C.blueLt,border:"none",borderRadius:8,padding:"5px 8px",cursor:"pointer",fontSize:13,fontFamily:"'Nunito',sans-serif",color:C.blue,fontWeight:700}}>✏️</button>
                      <button onClick={()=>deleteVen(v.id)} style={{background:C.redLt,border:"none",borderRadius:8,padding:"5px 8px",cursor:"pointer",fontSize:13,fontFamily:"'Nunito',sans-serif",color:C.red,fontWeight:700}}>🗑</button>
                    </div>
                  </div>
                ))}
                <div style={{background:C.greenLt,borderRadius:10,padding:"10px 14px",display:"flex",justifyContent:"space-between",marginBottom:8}}>
                  <span style={{fontWeight:900,fontSize:14}}>Total recettes</span>
                  <span style={{fontWeight:900,fontSize:14,color:C.green}}>{fmtCFA(tv)}</span>
                </div>
              </>
            )
          )}
        </div>
        <div style={{padding:"0 16px 24px"}}>
          {!isTerminee&&!confirmTerminer&&(
            <button onClick={()=>setCT(true)} style={{...outlineBtn("#AAA",{borderColor:"#DDD",color:"#888",fontSize:13})}}>🏁 Terminer cette bande</button>
          )}
          {!isTerminee&&confirmTerminer&&(
            <div style={{...card({background:"#FFF8E1",border:"1px solid #FFC10766"})}}>
              <div style={{fontWeight:800,fontSize:13,marginBottom:8,color:"#856400"}}>⚠️ Confirmer la clôture ?</div>
              <div style={{fontSize:12,color:C.muted,marginBottom:12,lineHeight:1.5}}>Cette bande sera marquée <strong>Terminée</strong>. Le bilan restera consultable.</div>
              <div style={{display:"flex",gap:8}}>
                <button onClick={terminerBande} style={{...btn(C.green,"#fff",{flex:1})}}>✅ Oui, terminer</button>
                <button onClick={()=>setCT(false)} style={{...btn("#EEE",C.text,{flex:1})}}>Annuler</button>
              </div>
            </div>
          )}
          {isTerminee&&(
            <div style={{...card({background:C.greenLt,textAlign:"center"})}}>
              <div style={{fontWeight:800,color:C.green}}>✅ Bande clôturée</div>
              <div style={{fontSize:12,color:C.muted,marginTop:4}}>Terminée le {fmtDate(bande.termineeAt)}</div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // CRÉER BANDE
  if (screen==="create") {
    return (
      <div>
        <SubHeader bg={`linear-gradient(135deg,${C.purple},#4A148C)`} title="Créer une nouvelle bande" onBack={()=>setScreen("list")} backLabel="Trésorerie" />
        <div style={{padding:16}}>
          <div style={{...card()}}>
            <span style={lbl}>Nom de la bande</span>
            <input placeholder="Ex: Bande chair mai 2026" style={{...inp(),marginBottom:14}} value={fBande.nom} onChange={e=>setFBande(f=>({...f,nom:e.target.value}))} />
            <span style={lbl}>Type d'élevage</span>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:14}}>
              {["Poulet de chair","Pondeuse","Caille","Dinde","Pintade","Autre"].map(t=>(
                <button key={t} onClick={()=>setFBande(f=>({...f,type:t}))}
                  style={{background:fBande.type===t?C.purple:C.bg,color:fBande.type===t?"#fff":C.text,border:`1.5px solid ${fBande.type===t?C.purple:C.border}`,borderRadius:10,padding:"9px 8px",cursor:"pointer",fontSize:12,fontWeight:700,fontFamily:"'Nunito',sans-serif"}}>{t}</button>
              ))}
            </div>
            <span style={lbl}>Date de démarrage</span>
            <input type="date" style={{...inp(),marginBottom:14}} value={fBande.date} onChange={e=>setFBande(f=>({...f,date:e.target.value}))} />
            <span style={lbl}>Effectif (nombre d'animaux)</span>
            <input type="number" placeholder="Ex: 500" style={{...inp(),marginBottom:20}} value={fBande.effectif} onChange={e=>setFBande(f=>({...f,effectif:e.target.value}))} />
            <button onClick={createBande} style={btn(fBande.nom&&fBande.type&&fBande.date&&fBande.effectif?C.purple:"#CCC")} disabled={!fBande.nom||!fBande.type||!fBande.date||!fBande.effectif}>✓ Créer la bande</button>
          </div>
        </div>
      </div>
    );
  }

  // LISTE
  const enCours=list.filter(b=>b.status!=="terminee");
  const terminees=list.filter(b=>b.status==="terminee");
  return (
    <div>
      <Header bg={`linear-gradient(150deg,${C.purple},#4A148C)`} emoji="💰" title="Trésorerie" subtitle="Gestion financière de vos bandes" onBack={onBack} />
      <div style={{padding:16}}>
        <button onClick={()=>setScreen("create")} style={{...btn(C.purple),marginBottom:16}}>+ Créer une nouvelle bande</button>
        {list.length===0&&(
          <div style={{...card({textAlign:"center",padding:36})}}>
            <div style={{fontSize:52,marginBottom:14}}>💰</div>
            <div style={{fontWeight:900,fontSize:16,marginBottom:8}}>Aucune bande créée</div>
            <div style={{fontSize:13,color:C.muted,lineHeight:1.6}}>Créez votre première bande pour commencer à suivre dépenses, ventes et bénéfices.</div>
          </div>
        )}
        {enCours.length>0&&(
          <>
            <div style={{fontSize:11,fontWeight:800,color:C.muted,marginBottom:8,letterSpacing:.6,textTransform:"uppercase"}}>🔄 En cours ({enCours.length})</div>
            {enCours.map(b=>{
              const td=totalDep(b),tv=totalVent(b),bn=benefice(b),positif=bn>=0;
              return (
                <button key={b.id} onClick={()=>{setBandeId(b.id);setCT(false);setScreen("detail");setTab("depenses");}}
                  style={{...card({cursor:"pointer",width:"100%",textAlign:"left"})}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
                    <div><div style={{fontSize:16,fontWeight:900}}>{b.nom}</div><div style={{fontSize:12,color:C.muted,marginTop:2}}>{b.type} · {b.effectif} animaux · {fmtDate(b.date)}</div></div>
                    <span style={{...tag(C.orangeLt,C.orange)}}>🔄 En cours</span>
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,borderTop:`1px solid ${C.border}`,paddingTop:10}}>
                    {[{l:"Dépenses",v:fmtCFA(td),c:C.red},{l:"Recettes",v:fmtCFA(tv),c:C.green},{l:positif?"Bénéfice":"Perte",v:fmtCFA(Math.abs(bn)),c:positif?C.green:C.red}].map((s,i)=>(
                      <div key={i}><div style={{fontSize:10,color:C.muted,marginBottom:3}}>{s.l}</div><div style={{fontSize:12,fontWeight:900,color:s.c}}>{s.v}</div></div>
                    ))}
                  </div>
                </button>
              );
            })}
          </>
        )}
        {terminees.length>0&&(
          <>
            <div style={{fontSize:11,fontWeight:800,color:C.muted,margin:"14px 0 8px",letterSpacing:.6,textTransform:"uppercase"}}>✅ Terminées ({terminees.length})</div>
            {terminees.map(b=>{
              const td=totalDep(b),tv=totalVent(b),bn=benefice(b),positif=bn>=0;
              return (
                <button key={b.id} onClick={()=>{setBandeId(b.id);setCT(false);setScreen("detail");setTab("depenses");}}
                  style={{...card({cursor:"pointer",width:"100%",textAlign:"left",opacity:.9})}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
                    <div><div style={{fontSize:16,fontWeight:900}}>{b.nom}</div><div style={{fontSize:12,color:C.muted,marginTop:2}}>{b.type} · {b.effectif} animaux</div></div>
                    <span style={{...tag(C.greenLt,C.green)}}>✅ Terminée</span>
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,borderTop:`1px solid ${C.border}`,paddingTop:10}}>
                    {[{l:"Dépenses",v:fmtCFA(td),c:C.red},{l:"Recettes",v:fmtCFA(tv),c:C.green},{l:positif?"Bénéfice":"Perte",v:fmtCFA(Math.abs(bn)),c:positif?C.green:C.red}].map((s,i)=>(
                      <div key={i}><div style={{fontSize:10,color:C.muted,marginBottom:3}}>{s.l}</div><div style={{fontSize:12,fontWeight:900,color:s.c}}>{s.v}</div></div>
                    ))}
                  </div>
                </button>
              );
            })}
          </>
        )}
        {list.length>0&&(
          <div style={{...card({background:C.purpleLt,marginTop:8})}}>
            <div style={{fontWeight:800,color:C.purple,marginBottom:6}}>📈 Vue globale</div>
            <Row label="Total bandes"    value={`${list.length} (${enCours.length} en cours)`} />
            <Row label="Total investi"   value={fmtCFA(list.reduce((s,b)=>s+totalDep(b),0))} />
            <Row label="Total récolté"   value={fmtCFA(list.reduce((s,b)=>s+totalVent(b),0))} />
            <Row label="Bénéfice global" value={fmtCFA(list.reduce((s,b)=>s+benefice(b),0))} accent />
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
//  APP PRINCIPALE
// ═══════════════════════════════════════════

export default function App() {
  const [screen,setScreen] = useState("home");
  const screens = {
    home:       <HomeScreen go={setScreen} />,
    incubation: <IncubationModule  onBack={()=>setScreen("home")} />,
    poussins:   <PoussinModule     onBack={()=>setScreen("home")} />,
    maladies:   <MaladiesModule    onBack={()=>setScreen("home")} />,
    formations: <FormationsModule  onBack={()=>setScreen("home")} />,
    tresorerie: <TresorerieModule  onBack={()=>setScreen("home")} />,
  };
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        body{background:#C8D4C0;font-family:'Nunito',sans-serif;}
        ::-webkit-scrollbar{display:none;}
        button{transition:transform .1s,opacity .1s;}
        button:active{transform:scale(0.97);opacity:.9;}
        input:focus{border-color:#2A7A40!important;box-shadow:0 0 0 3px rgba(42,122,64,.12);}
      `}</style>
      <div style={{background:"#C8D4C0",minHeight:"100vh",display:"flex",justifyContent:"center",alignItems:"flex-start",padding:"16px 0"}}>
        <div style={{width:"100%",maxWidth:430,background:"#F2F5EE",minHeight:"100vh",boxShadow:"0 8px 40px rgba(0,0,0,.18)",borderRadius:8,overflowY:"auto",overflowX:"hidden"}}>
          {screens[screen]||screens.home}
        </div>
      </div>
    </>
  );
}
