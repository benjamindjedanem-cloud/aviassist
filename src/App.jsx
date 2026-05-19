import { useState, useEffect, useCallback, useRef } from "react";

// ═══════════════════════════════════════════════════════
//  DONNÉES — INCUBATION
// ═══════════════════════════════════════════════════════

const EGG_TYPES = {
  poulet: {
    name:"Poulet", icon:"🐓", days:21, mirage:[7,14], stopTurn:18,
    turnsPerDay:3, turnHours:["06h00","14h00","22h00"],
    youngName:"poussins", minRate:70,
    eclosionStart:21, eclosionWindow:[21,23],
    phases:[
      { label:"J1–J18", temp:"37.2–37.7°C", hum:"55–60%", note:"" },
      { label:"J19–J21", temp:"37.0–37.5°C", hum:"65–70%", note:"↓ Baisser température + ↑ Humidité" },
    ],
    tips:[
      { day:1,  text:"Préchauffer la couveuse/incubateur pendant 24h pour stabiliser à 37.2–37.7°C avant d'introduire les œufs. Vérifier l'humidité (55–60%) et le bon fonctionnement du retournement." },
      { day:7,  text:"1er mirage : retirer les œufs clairs (non fécondés) ou à développement anormal. 📚 Voir tutoriel mirage dans la section Formations." },
      { day:14, text:"2e mirage : les œufs sains sont très foncés avec une chambre d'air bien nette. Retirer tout œuf suspect. 📚 Images de référence dans la section Formations." },
      { day:18, text:"Arrêter le retournement. Baisser la température à 37.0–37.5°C. Augmenter l'humidité à 65–70%. Placer les œufs à plat sur la grille d'éclosion." },
      { day:19, text:"Les poussins commencent à piquer la coquille (pipping). NE PAS ouvrir l'incubateur ! La chute d'humidité colle les membranes et peut tuer les poussins." },
      { day:21, text:"Éclosion ! Laisser les poussins sécher complètement dans l'incubateur pendant 12–24h avant de les sortir. Un poussin encore humide est extrêmement vulnérable." },
    ],
    specialTips:[
      "Un poussin sain est sec, actif, alerte, avec un nombril propre et bien refermé.",
      "Taux d'éclosion acceptable : 70–85%. En dessous de 60%, analyser la stabilité de la température et la qualité des géniteurs.",
      "📚 Des cours complets sur l'incubation sont disponibles gratuitement dans la section Formations.",
    ],
  },
  caille: {
    name:"Caille", icon:"🪶", days:17, mirage:[7], stopTurn:14,
    turnsPerDay:4, turnHours:["06h00","12h00","18h00","00h00"],
    youngName:"cailleteaux", minRate:60,
    eclosionStart:16, eclosionWindow:[16,18],
    phases:[
      { label:"J1–J14", temp:"37.5–37.8°C", hum:"45–55%", note:"" },
      { label:"J15–J17", temp:"37.0–37.5°C", hum:"65–70%", note:"↓ Baisser température + ↑ Humidité" },
    ],
    tips:[
      { day:1,  text:"Préchauffer la couveuse/incubateur pendant 24h pour stabiliser à 37.5–37.8°C. Les œufs de caille sont très petits — vérifier que les grilles de retournement sont adaptées à leur taille. Humidité : 45–55%." },
      { day:1,  text:"Retournement 4× par jour : 06h00, 12h00, 18h00, 00h00. Sur la caille, la régularité est encore plus critique qu'avec le poulet." },
      { day:7,  text:"Mirage : utiliser une lampe adaptée aux petits œufs dans une pièce sombre. Éliminer les œufs clairs. 📚 Voir tutoriel mirage dans la section Formations." },
      { day:14, text:"Arrêter le retournement. Baisser la température à 37.0–37.5°C. Augmenter l'humidité à 65–70%. Placer les œufs à plat sur la grille d'éclosion." },
      { day:15, text:"Les cailleteaux commencent à piquer. NE PAS ouvrir l'incubateur ! Toute perte d'humidité à ce stade peut être fatale." },
      { day:17, text:"Éclosion ! Les cailleteaux sont très petits et fragiles. Laisser sécher 12–24h dans l'incubateur avant de transférer. Agir avec une extrême précaution." },
    ],
    specialTips:[
      "La caille a un cycle très court (17 jours) — chaque heure d'instabilité a un impact plus fort que chez le poulet.",
      "Des grilles adaptées aux petits œufs de caille sont indispensables.",
      "Taux d'éclosion acceptable : 60–80%.",
      "📚 Formation 'Démarrer un élevage de caille rentable' disponible dans la section Formations.",
    ],
  },
  canard: {
    name:"Canard colvert / domestique", icon:"🦆", days:28, mirage:[7,14], stopTurn:25,
    turnsPerDay:3, turnHours:["06h00","14h00","22h00"],
    youngName:"canetons", minRate:65,
    eclosionStart:28, eclosionWindow:[28,30],
    phases:[
      { label:"J1–J25", temp:"37.2–37.7°C", hum:"55–65%", note:"+ Humidification externe quotidienne J7–J24" },
      { label:"J26–J28", temp:"37.0–37.5°C", hum:"70–75%", note:"↓ Baisser température + ↑ Humidité, arrêter humidification externe" },
    ],
    tips:[
      { day:1,  text:"Préchauffer la couveuse/incubateur pendant 24h. Température : 37.2–37.7°C, humidité : 55–65%. Les œufs de canard produisent plus de chaleur propre en fin d'incubation — surveiller de près." },
      { day:7,  text:"1er mirage. 📚 Voir tutoriel dans Formations. À partir d'aujourd'hui : commencer l'humidification externe quotidienne." },
      { day:7,  text:"🌊 Humidification externe (J7–J24, chaque jour) : sortir les œufs, vaporiser légèrement avec de l'eau tiède (35–37°C), laisser refroidir 15–30 min à l'air libre, puis remettre. Cette étape est unique aux canards et améliore significativement le taux d'éclosion." },
      { day:14, text:"2e mirage. Continuer l'humidification externe quotidienne. 📚 Images de référence dans Formations." },
      { day:25, text:"Arrêter le retournement ET l'humidification externe. Baisser la température à 37.0–37.5°C. Augmenter l'humidité à 70–75%. Ne plus ouvrir l'incubateur." },
      { day:26, text:"Les canetons commencent à piquer. NE PAS ouvrir l'incubateur ! Sans humidité élevée, les canetons se collent aux membranes." },
      { day:28, text:"Éclosion ! Laisser sécher 12–24h dans l'incubateur avant de transférer." },
    ],
    specialTips:[
      "L'humidification externe quotidienne (J7–J24) est LA particularité des œufs de canard. Ne jamais sauter cette étape.",
      "Taux d'éclosion acceptable : 65–80%.",
      "📚 Consultez la section Formations pour les conseils avancés sur l'incubation des palmipèdes.",
    ],
  },
  canard_barbarie: {
    name:"Canard de Barbarie", icon:"🦢", days:35, mirage:[10,21], stopTurn:32,
    turnsPerDay:3, turnHours:["06h00","14h00","22h00"],
    youngName:"canetons", minRate:60,
    eclosionStart:35, eclosionWindow:[35,37],
    phases:[
      { label:"J1–J32", temp:"37.2–37.7°C", hum:"55–65%", note:"+ Humidification externe quotidienne J10–J31" },
      { label:"J33–J35", temp:"37.0–37.5°C", hum:"70–75%", note:"↓ Baisser température + ↑ Humidité, arrêter humidification externe" },
    ],
    tips:[
      { day:1,  text:"Préchauffer la couveuse/incubateur pendant 24h. Température : 37.2–37.7°C, humidité : 55–65%. Attention : le Barbarie a une durée d'incubation de 35 jours, bien plus longue que le canard domestique (28 jours). Ne pas confondre les deux !" },
      { day:10, text:"1er mirage. À partir d'aujourd'hui : commencer l'humidification externe quotidienne." },
      { day:10, text:"🌊 Humidification externe (J10–J31, chaque jour) : sortir les œufs, vaporiser légèrement avec de l'eau tiède (35–37°C), laisser refroidir 15–30 min à l'air libre, puis remettre." },
      { day:21, text:"2e mirage. Continuer l'humidification externe quotidienne. 📚 Images de référence dans Formations." },
      { day:32, text:"Arrêter le retournement ET l'humidification externe. Baisser la température à 37.0–37.5°C. Augmenter l'humidité à 70–75%." },
      { day:33, text:"Les canetons commencent à piquer. NE PAS ouvrir l'incubateur !" },
      { day:35, text:"Éclosion ! Laisser sécher 12–24h dans l'incubateur avant de transférer." },
    ],
    specialTips:[
      "Le Canard de Barbarie a un cycle de 35 jours — ne pas confondre avec le canard domestique (28 jours) !",
      "L'humidification externe (J10–J31) est indispensable, comme pour le canard domestique.",
      "Taux d'éclosion acceptable : 60–75%.",
      "📚 Consultez la section Formations pour les conseils avancés.",
    ],
  },
  dinde: {
    name:"Dinde", icon:"🦃", days:28, mirage:[10,20], stopTurn:25,
    turnsPerDay:3, turnHours:["06h00","14h00","22h00"],
    youngName:"dindonneaux", minRate:65,
    eclosionStart:28, eclosionWindow:[28,30],
    phases:[
      { label:"J1–J25", temp:"37.2–37.7°C", hum:"55–60%", note:"" },
      { label:"J26–J28", temp:"37.0–37.5°C", hum:"65–70%", note:"↓ Baisser température + ↑ Humidité" },
    ],
    tips:[
      { day:1,  text:"Préchauffer la couveuse/incubateur pendant 24h pour stabiliser à 37.2–37.7°C. Les œufs de dinde sont grands — vérifier l'espace entre les clayettes. Humidité : 55–60%." },
      { day:10, text:"1er mirage : les embryons sont bien visibles à J10. Retirer les œufs clairs. 📚 Voir tutoriel mirage dans Formations." },
      { day:20, text:"2e mirage : la chambre d'air doit occuper environ 1/3 de l'œuf." },
      { day:25, text:"Arrêter le retournement. Baisser la température à 37.0–37.5°C. Augmenter l'humidité à 65–70%. Gros bout légèrement surélevé." },
      { day:26, text:"Les dindonneaux commencent à piquer. NE PAS ouvrir l'incubateur ! Ne jamais forcer l'éclosion." },
      { day:28, text:"Éclosion ! Laisser sécher 12–24h dans l'incubateur avant de transférer." },
    ],
    specialTips:[
      "Ne jamais aider un dindonneau à sortir de sa coquille — s'il n'y arrive pas seul, il n'est souvent pas viable.",
      "Taux d'éclosion acceptable : 65–80%.",
      "📚 Consultez la section Formations pour les conseils sur l'élevage de dindes.",
    ],
  },
  pintade: {
    name:"Pintade", icon:"🐦", days:26, mirage:[7,14], stopTurn:23,
    turnsPerDay:3, turnHours:["06h00","14h00","22h00"],
    youngName:"pintadeaux", minRate:50,
    eclosionStart:26, eclosionWindow:[26,28],
    phases:[
      { label:"J1–J23", temp:"37.2–37.7°C", hum:"55–60%", note:"" },
      { label:"J24–J26", temp:"37.0–37.5°C", hum:"65–70%", note:"↓ Baisser température + ↑ Humidité" },
    ],
    tips:[
      { day:1,  text:"Préchauffer la couveuse/incubateur pendant 24h. Température : 37.2–37.7°C, humidité : 55–60%. La coquille de pintade est plus épaisse — prévoir des grilles robustes." },
      { day:7,  text:"1er mirage : utiliser une lampe puissante dans une pièce sombre. 📚 Voir tutoriel dans la section Formations." },
      { day:14, text:"2e mirage : les œufs fécondés doivent être très foncés. 📚 Images de référence dans Formations." },
      { day:23, text:"Arrêter le retournement. Baisser la température à 37.0–37.5°C. Augmenter l'humidité à 65–70%. L'humidité est la clé pour la pintade." },
      { day:24, text:"Les pintadeaux commencent à piquer. NE PAS ouvrir l'incubateur ! Ne jamais aider un pintadeau à sortir." },
      { day:26, text:"Éclosion ! Les pintadeaux sont nerveux. Laisser sécher 12–24h. Démarrage dans un environnement calme." },
    ],
    specialTips:[
      "La pintade a naturellement un taux d'éclosion plus bas (50–70%) — c'est normal et attendu.",
      "L'humidité en phase d'éclosion est le facteur le plus critique pour la pintade.",
      "📚 Consultez la section Formations pour les conseils spécifiques à la pintade.",
    ],
  },
};

// ── Température ambiante ──────────────────────────────

const AMBIENT_TEMPS = [
  { id:"standard", label:"35°C et moins", icon:"❄️", color:"#1558A8", bg:"#EBF2FC",
    tempDelta:0, humDelta:0, mode:null },
  { id:"chaud",    label:"36 – 38°C",     icon:"🔥", color:"#E8660A", bg:"#FFF3EC",
    tempDelta:-0.3, humDelta:4, mode:"chaud" },
  { id:"extreme",  label:"39°C et plus",  icon:"☀️", color:"#C0392B", bg:"#FDECEA",
    tempDelta:-0.5, humDelta:5, mode:"extreme" },
];

function adaptTemp(str, delta) {
  if (delta === 0) return str;
  const s = str.replace("°C","").trim();
  if (s.includes("–")) {
    const [a,b] = s.split("–");
    return `${(parseFloat(a)+delta).toFixed(1)}–${(parseFloat(b)+delta).toFixed(1)}°C`;
  }
  return `${(parseFloat(s)+delta).toFixed(1)}°C`;
}
function adaptHum(str, delta) {
  if (delta === 0) return str;
  const s = str.replace("%","").trim();
  if (s.includes("–")) {
    const [a,b] = s.split("–");
    return `${Math.round(parseFloat(a)+delta)}–${Math.round(parseFloat(b)+delta)}%`;
  }
  return `${Math.round(parseFloat(s)+delta)}%`;
}
function adaptPhases(phases, ambientId) {
  const at = AMBIENT_TEMPS.find(a=>a.id===ambientId);
  if (!at || at.tempDelta===0) return phases;
  return phases.map(p => ({
    ...p,
    temp: adaptTemp(p.temp, at.tempDelta),
    hum:  adaptHum(p.hum,  at.humDelta),
  }));
}

// ═══════════════════════════════════════════════════════
//  DONNÉES — MALADIES (nouveau moteur)
// ═══════════════════════════════════════════════════════

const SYMPTOM_CATS = [
  { id:"digestifs",      label:"🍃 Digestifs" },
  { id:"respiratoires",  label:"🫁 Respiratoires" },
  { id:"neurologiques",  label:"🧠 Neurologiques" },
  { id:"generaux",       label:"⚡ Généraux" },
  { id:"yeux_tete",      label:"👁 Yeux / Tête" },
  { id:"ponte",          label:"🥚 Ponte" },
  { id:"peau_bec",       label:"🐾 Peau / Bec" },
];

const SYMPTOMS_V2 = [
  // Digestifs
  { id:"diarrhee",           label:"Diarrhée",                          cat:"digestifs" },
  { id:"diarrhee_sanglante", label:"Diarrhée sanglante",                cat:"digestifs" },
  { id:"diarrhee_blanche",   label:"Diarrhée blanche",                  cat:"digestifs" },
  { id:"diarrhee_verte",     label:"Diarrhée verte",                    cat:"digestifs" },
  { id:"diarrhee_jaune",     label:"Diarrhée jaune-verte",              cat:"digestifs" },
  { id:"perte_appetit",      label:"Perte d'appétit",                   cat:"digestifs" },
  // Respiratoires
  { id:"resp",               label:"Difficulté respiratoire",           cat:"respiratoires" },
  { id:"ecoulement_nasal",   label:"Écoulement nasal",                  cat:"respiratoires" },
  { id:"eternuements",       label:"Éternuements",                      cat:"respiratoires" },
  { id:"toux",               label:"Toux",                              cat:"respiratoires" },
  { id:"resp_bouche",        label:"Respiration bouche ouverte",        cat:"respiratoires" },
  { id:"craquements",        label:"Craquements / sifflements",         cat:"respiratoires" },
  // Neurologiques
  { id:"paralysie",          label:"Paralysie / Tremblements",          cat:"neurologiques" },
  { id:"boiterie",           label:"Boiterie",                          cat:"neurologiques" },
  { id:"mortalite_soudaine", label:"Mortalités soudaines",              cat:"neurologiques" },
  { id:"mort_masse",         label:"Mort en masse",                     cat:"neurologiques" },
  // Généraux
  { id:"plumes_eboriffees",  label:"Plumes ébouriffées",                cat:"generaux" },
  { id:"amaigrissement",     label:"Amaigrissement",                    cat:"generaux" },
  { id:"retard_croissance",  label:"Retard de croissance",              cat:"generaux" },
  { id:"deshydratation",     label:"Déshydratation",                    cat:"generaux" },
  { id:"abattement",         label:"Abattement / faiblesse",            cat:"generaux" },
  // Yeux / Tête
  { id:"yeux_larmoyants",    label:"Yeux larmoyants / troubles",        cat:"yeux_tete" },
  { id:"yeux_gonfles",       label:"Yeux gonflés / collés",             cat:"yeux_tete" },
  { id:"gonflement_tete",    label:"Gonflement tête / cou",             cat:"yeux_tete" },
  { id:"crete_bleue",        label:"Crête bleue / noire",               cat:"yeux_tete" },
  // Ponte
  { id:"baisse_ponte",       label:"Baisse de ponte",                   cat:"ponte" },
  { id:"oeufs_deformes",     label:"Œufs déformés / coquilles molles",  cat:"ponte" },
  // Peau / Bec
  { id:"lesions_peau",       label:"Lésions / croûtes peau-crête-bec", cat:"peau_bec" },
  { id:"difficulte_manger",  label:"Difficulté à manger / avaler",      cat:"peau_bec" },
  { id:"chute_plumes",       label:"Chute de plumes localisée",         cat:"peau_bec" },
];

const DISEASES_V2 = [
  {
    id:"newcastle", name:"Newcastle", severity:"Critique", color:"#C62828", special:null,
    symptoms:[
      {id:"mort_masse",w:10},{id:"diarrhee_verte",w:10},{id:"paralysie",w:5},
      {id:"resp",w:5},{id:"crete_bleue",w:5},{id:"mortalite_soudaine",w:2},
    ],
    incompatible:[{id:"lesions_peau",p:5}],
    description:"C'est une maladie virale extrêmement contagieuse qui peut tuer la quasi-totalité d'un élevage en quelques jours. Elle se transmet facilement par contact direct, par l'air, les fientes ou le matériel contaminé. Elle touche toutes les volailles sans exception.",
    prevention:"Vacciner régulièrement (La Sota, Hitchner B1). Maintenir une biosécurité stricte : limiter les visiteurs, désinfecter le matériel, éviter tout contact avec des volailles étrangères.",
    actions:["Isoler immédiatement tous les oiseaux malades","Éviter tout mouvement d'animaux hors de l'élevage","Désinfecter le matériel et les locaux","Surveiller attentivement les oiseaux apparemment sains"],
    treatment:"Des vitamines et des électrolytes peuvent aider à soutenir les oiseaux encore debout. Il n'existe pas de traitement curatif contre le virus.",
    vet_for:"Confirmer le diagnostic, évaluer l'étendue de la contamination et définir un protocole d'urgence adapté.",
  },
  {
    id:"grippe_aviaire", name:"Grippe Aviaire", severity:"Critique", color:"#B71C1C", special:"grippe",
    symptoms:[
      {id:"mort_masse",w:10},{id:"crete_bleue",w:10},{id:"gonflement_tete",w:10},
      {id:"mortalite_soudaine",w:5},{id:"resp",w:5},{id:"diarrhee_verte",w:2},
    ],
    incompatible:[{id:"lesions_peau",p:5}],
    description:"C'est une maladie virale très grave et très contagieuse. Elle peut provoquer la mort brutale de nombreux oiseaux en très peu de temps, parfois sans aucun signe préalable visible. Dans certains cas rares, elle peut aussi toucher l'être humain.",
    prevention:"Éviter tout contact avec les oiseaux sauvages. Biosécurité maximale : filets de protection, désinfection systématique, interdiction d'accès aux personnes extérieures.",
    actions:["Isoler immédiatement tous les oiseaux malades","Ne toucher les cadavres qu'avec des gants et un masque","Éviter tout mouvement d'animaux dans ou hors de l'élevage","Contacter immédiatement un vétérinaire"],
    treatment:"Il n'existe pas de traitement curatif. Des vitamines peuvent soutenir les oiseaux les moins atteints.",
    vet_for:"Confirmer le diagnostic et prendre les dispositions nécessaires pour votre élevage.",
  },
  {
    id:"gumboro", name:"Gumboro (IBD)", severity:"Élevée", color:"#E53935", special:null,
    symptoms:[
      {id:"diarrhee_blanche",w:10},{id:"perte_appetit",w:5},{id:"plumes_eboriffees",w:5},
      {id:"amaigrissement",w:2},{id:"retard_croissance",w:2},
    ],
    incompatible:[{id:"lesions_peau",p:5},{id:"gonflement_tete",p:5}],
    description:"C'est une maladie virale qui détruit le système immunitaire des jeunes poussins, généralement entre 2 et 6 semaines d'âge. Un oiseau qui a eu Gumboro devient très fragile et attrape facilement d'autres maladies par la suite.",
    prevention:"Vacciner à J14 et J28. Maintenir une hygiène stricte dans les bâtiments. Vider et désinfecter complètement entre chaque bande.",
    actions:["Isoler les oiseaux malades","Améliorer la ventilation du bâtiment","Donner de l'eau propre et fraîche en permanence","Réduire le stress dans l'élevage"],
    treatment:"Des vitamines et des électrolytes dans l'eau de boisson aident à soutenir les oiseaux. Il n'existe pas de traitement direct contre le virus.",
    vet_for:"Confirmer le diagnostic, évaluer l'atteinte immunitaire et définir un plan de vaccination adapté.",
  },
  {
    id:"coccidiose", name:"Coccidiose", severity:"Modérée", color:"#F57C00", special:null,
    symptoms:[
      {id:"diarrhee_sanglante",w:10},{id:"amaigrissement",w:5},{id:"deshydratation",w:5},
      {id:"diarrhee",w:2},{id:"retard_croissance",w:2},
    ],
    incompatible:[{id:"ecoulement_nasal",p:4},{id:"gonflement_tete",p:4}],
    description:"C'est une maladie parasitaire très courante qui touche l'intestin des volailles. Elle se développe rapidement dans les litières humides et mal entretenues. La diarrhée sanglante est le signe le plus caractéristique. Elle peut provoquer des pertes importantes si elle n'est pas traitée rapidement.",
    prevention:"Garder la litière toujours sèche. Utiliser un coccidiostat préventif dans l'aliment. Éviter la surpopulation.",
    actions:["Assainir et sécher la litière immédiatement","Isoler les oiseaux très affaiblis","Donner de l'eau propre et fraîche","Ajouter des vitamines A et K dans l'eau"],
    treatment:"Administrer de l'Amprolium ou du Toltrazuril pendant 5 jours. Vitamines A et K en soutien.",
    vet_for:"Confirmer le diagnostic, choisir le bon anticoccidien et déterminer la durée exacte du traitement.",
  },
  {
    id:"marek", name:"Maladie de Marek", severity:"Élevée", color:"#E53935", special:null,
    symptoms:[
      {id:"paralysie",w:10},{id:"amaigrissement",w:10},{id:"yeux_larmoyants",w:5},
      {id:"boiterie",w:5},{id:"retard_croissance",w:2},
    ],
    incompatible:[{id:"gonflement_tete",p:5},{id:"ecoulement_nasal",p:4}],
    description:"C'est une maladie virale qui provoque la paralysie progressive des pattes, des ailes ou du cou. Elle peut aussi causer des tumeurs internes. Elle touche surtout les jeunes oiseaux non vaccinés. Une fois les symptômes visibles, il n'y a généralement plus rien à faire.",
    prevention:"Vacciner tous les poussins dès l'éclosion. Toujours acheter des poussins garantis vaccinés. Hygiène stricte des locaux.",
    actions:["Isoler les oiseaux paralysés","Faciliter l'accès à l'eau et à la nourriture pour les malades","Éviter toute source de stress","Surveiller la propagation aux autres oiseaux"],
    treatment:"Des vitamines du groupe B peuvent aider à soutenir le système nerveux. Il n'existe pas de traitement curatif.",
    vet_for:"Confirmer le diagnostic et évaluer si un abattage sanitaire partiel est nécessaire.",
  },
  {
    id:"pullorose", name:"Pullorose / Typhose", severity:"Élevée", color:"#E53935", special:null,
    symptoms:[
      {id:"diarrhee_blanche",w:10},{id:"mortalite_soudaine",w:10},{id:"boiterie",w:5},
      {id:"perte_appetit",w:5},{id:"amaigrissement",w:2},
    ],
    incompatible:[{id:"lesions_peau",p:5}],
    description:"C'est une infection bactérienne causée par une Salmonella. Elle touche surtout les jeunes poussins et se reconnaît facilement par la diarrhée blanche caractéristique. Elle se transmet par les œufs ou la litière contaminée. Elle peut causer des pertes importantes chez les poussins.",
    prevention:"Acheter des poussins certifiés sains. Hygiène stricte des locaux. Éviter le contact avec des oiseaux sauvages ou des rongeurs.",
    actions:["Isoler immédiatement les oiseaux malades","Désinfecter les locaux et tout le matériel","Améliorer l'hygiène de la litière","Surveiller tous les autres oiseaux"],
    treatment:"Administrer des antibiotiques sous prescription vétérinaire (Tétracyclines ou Sulfamides).",
    vet_for:"Identifier la bactérie exacte, choisir l'antibiotique le plus efficace et définir la durée du traitement.",
  },
  {
    id:"mycoplasmose", name:"Mycoplasmose", severity:"Modérée", color:"#F57C00", special:null,
    symptoms:[
      {id:"ecoulement_nasal",w:10},{id:"eternuements",w:10},{id:"toux",w:5},
      {id:"resp",w:5},{id:"yeux_larmoyants",w:2},{id:"baisse_ponte",w:2},
    ],
    incompatible:[{id:"diarrhee_sanglante",p:4},{id:"paralysie",p:4}],
    description:"C'est une infection bactérienne chronique des voies respiratoires qui s'installe progressivement et peut affaiblir durablement un élevage. Elle se transmet facilement par l'air, les fientes ou directement de la mère à l'œuf. Les oiseaux éternuent, ont le nez qui coule et respirent difficilement.",
    prevention:"Assurer une bonne ventilation sans courant d'air. Éviter la surpopulation. Réduire le stress dans l'élevage.",
    actions:["Améliorer immédiatement la ventilation du bâtiment","Réduire la densité des oiseaux si possible","Isoler les oiseaux les plus atteints","Ajouter des vitamines dans l'eau"],
    treatment:"Administrer des antibiotiques sous prescription vétérinaire (Tylosine, Enrofloxacine ou Doxycycline).",
    vet_for:"Identifier la souche de mycoplasme et choisir l'antibiotique le plus efficace.",
  },
  {
    id:"bronchite", name:"Bronchite Infectieuse", severity:"Modérée", color:"#F57C00", special:null,
    symptoms:[
      {id:"baisse_ponte",w:10},{id:"toux",w:10},{id:"resp",w:5},
      {id:"eternuements",w:5},{id:"oeufs_deformes",w:5},{id:"ecoulement_nasal",w:2},
    ],
    incompatible:[{id:"diarrhee_sanglante",p:4},{id:"paralysie",p:4}],
    description:"C'est une maladie virale respiratoire qui provoque une chute brutale et importante de la ponte. Les oiseaux toussent, éternuent et ont du mal à respirer. Les œufs produits pendant l'infection sont souvent déformés, à coquille molle ou de mauvaise qualité.",
    prevention:"Vacciner régulièrement. Maintenir une bonne ventilation sans courant d'air. Éviter les variations brusques de température.",
    actions:["Améliorer la ventilation du bâtiment","Réduire le stress au maximum","Donner des vitamines dans l'eau","Surveiller la ponte et la qualité des œufs"],
    treatment:"Administrer des vitamines pour soutenir les oiseaux. Des antibiotiques peuvent être donnés pour prévenir les infections secondaires.",
    vet_for:"Confirmer le diagnostic, choisir les antibiotiques préventifs adaptés et établir un plan de vaccination.",
  },
  {
    id:"variole", name:"Variole Aviaire", severity:"Modérée", color:"#F57C00", special:null,
    symptoms:[
      {id:"lesions_peau",w:10},{id:"difficulte_manger",w:5},
      {id:"chute_plumes",w:2},{id:"baisse_ponte",w:2},
    ],
    incompatible:[{id:"diarrhee_sanglante",p:5},{id:"paralysie",p:5}],
    description:"C'est une maladie virale qui provoque des croûtes et des lésions visibles sur la peau, la crête, les barbillons et parfois à l'intérieur du bec. Elle se transmet par contact direct entre oiseaux ou via les moustiques. Elle n'est généralement pas mortelle mais affaiblit fortement les oiseaux.",
    prevention:"Vacciner préventivement. Lutter activement contre les moustiques, vecteurs importants de la maladie. Éviter les blessures entre oiseaux.",
    actions:["Isoler les oiseaux atteints","Nettoyer délicatement les lésions cutanées","Appliquer un antiseptique sur les croûtes","Donner des vitamines pour soutenir l'immunité"],
    treatment:"Appliquer une solution antiseptique sur les lésions. Administrer des vitamines A et E.",
    vet_for:"Confirmer le diagnostic, traiter les formes internes (diphtérique) et définir un plan de vaccination.",
  },
  {
    id:"coryza", name:"Coryza Infectieux", severity:"Élevée", color:"#E53935", special:null,
    symptoms:[
      {id:"gonflement_tete",w:10},{id:"yeux_gonfles",w:10},{id:"ecoulement_nasal",w:10},
      {id:"eternuements",w:5},{id:"resp",w:5},
    ],
    incompatible:[{id:"paralysie",p:5},{id:"diarrhee_sanglante",p:5}],
    description:"C'est une infection bactérienne respiratoire très contagieuse et facilement reconnaissable. Le gonflement du visage, les yeux collés et l'écoulement nasal parfois malodorant sont les signes les plus caractéristiques. Elle se propage vite dans les élevages denses ou mal ventilés.",
    prevention:"Mettre en quarantaine tout nouvel oiseau avant de l'introduire dans l'élevage. Bonne ventilation. Éviter les mélanges d'oiseaux venant de sources différentes.",
    actions:["Isoler immédiatement les oiseaux malades","Améliorer la ventilation","Nettoyer les yeux et le bec des malades avec de l'eau tiède propre","Surveiller tous les autres oiseaux"],
    treatment:"Administrer des antibiotiques sous prescription vétérinaire.",
    vet_for:"Identifier la bactérie, choisir l'antibiotique approprié et évaluer si une vaccination est envisageable.",
  },
  {
    id:"cholera", name:"Choléra Aviaire", severity:"Élevée", color:"#E53935", special:null,
    symptoms:[
      {id:"mortalite_soudaine",w:10},{id:"mort_masse",w:10},{id:"diarrhee_verte",w:5},
      {id:"resp",w:5},{id:"crete_bleue",w:5},
    ],
    incompatible:[{id:"lesions_peau",p:5}],
    description:"C'est une maladie bactérienne grave qui peut provoquer des morts brutales et en grand nombre, parfois sans signe préalable visible. Elle touche toutes les volailles et se transmet facilement par l'eau contaminée, la nourriture ou le contact avec des oiseaux ou des rongeurs malades.",
    prevention:"Biosécurité stricte. Contrôle des rongeurs qui sont souvent porteurs. Éviter les points d'eau stagnante à proximité de l'élevage.",
    actions:["Isoler les malades et ramasser les cadavres avec des gants","Désinfecter immédiatement les locaux et le matériel","Contrôler et éliminer les rongeurs","Bloquer tous les mouvements d'animaux"],
    treatment:"Administrer des antibiotiques sous prescription vétérinaire.",
    vet_for:"Confirmer le diagnostic et définir d'urgence un protocole antibiotique adapté à votre élevage.",
  },
  {
    id:"enterite", name:"Entérite Ulcéreuse", severity:"Critique", color:"#C62828", special:null,
    symptoms:[
      {id:"mortalite_soudaine",w:10},{id:"diarrhee",w:5},
      {id:"plumes_eboriffees",w:5},{id:"amaigrissement",w:2},
    ],
    incompatible:[{id:"ecoulement_nasal",p:4},{id:"gonflement_tete",p:4}],
    description:"C'est une maladie bactérienne grave qui touche l'intestin des volailles, et particulièrement les cailles. Elle peut provoquer des morts soudaines et en série sans signes préalables très visibles. Le stress, la surpopulation et la mauvaise hygiène favorisent fortement son apparition.",
    prevention:"Réduire le stress au maximum. Hygiène stricte de la litière et des abreuvoirs. Éviter la surpopulation et les brusques changements d'alimentation.",
    actions:["Isoler les oiseaux malades","Améliorer immédiatement l'hygiène des locaux","Réduire toutes les sources de stress","Ramasser et éliminer les cadavres avec des gants"],
    treatment:"Administrer des antibiotiques sous prescription vétérinaire.",
    vet_for:"Confirmer le diagnostic et définir un protocole de traitement urgent adapté.",
  },
  {
    id:"aspergillose", name:"Aspergillose", severity:"Élevée", color:"#E53935", special:null,
    symptoms:[
      {id:"resp_bouche",w:10},{id:"craquements",w:10},
      {id:"resp",w:5},{id:"amaigrissement",w:2},
    ],
    incompatible:[{id:"diarrhee_sanglante",p:5},{id:"lesions_peau",p:5}],
    description:"C'est une infection causée par des champignons qui se développent dans les litières humides et moisies ou dans les aliments mal conservés. Elle touche les poumons des oiseaux et provoque de graves difficultés respiratoires. Elle n'est pas contagieuse d'un oiseau à l'autre.",
    prevention:"Ne jamais utiliser de litière moisie ou humide. Bien conserver les aliments à l'abri de l'humidité. Assurer une très bonne ventilation des locaux.",
    actions:["Retirer et remplacer toute litière suspecte immédiatement","Éliminer tous les aliments potentiellement contaminés","Améliorer fortement la ventilation","Nettoyer et désinfecter les locaux à fond"],
    treatment:"Il n'existe pas de traitement simple. L'assainissement total de l'environnement est la priorité absolue.",
    vet_for:"Confirmer le diagnostic et évaluer si un traitement antifongique est envisageable.",
  },
  {
    id:"colibacillose", name:"Colibacillose", severity:"Modérée", color:"#F57C00", special:null,
    symptoms:[
      {id:"resp",w:5},{id:"diarrhee",w:5},{id:"perte_appetit",w:2},
      {id:"abattement",w:2},{id:"baisse_ponte",w:2},
    ],
    incompatible:[{id:"paralysie",p:4},{id:"lesions_peau",p:4}],
    description:"C'est une infection bactérienne très fréquente causée par la bactérie E. coli. Elle peut affecter le système respiratoire, digestif ou reproducteur selon les cas. Elle survient souvent quand les oiseaux sont stressés, mal nourris ou dans de mauvaises conditions d'hygiène.",
    prevention:"Hygiène stricte des locaux et du matériel. Réduire le stress. Éviter la surpopulation et la mauvaise qualité de l'air.",
    actions:["Améliorer l'hygiène générale de l'élevage","Réduire les sources de stress","Donner de l'eau propre et fraîche","Ajouter des vitamines dans l'eau de boisson"],
    treatment:"Administrer des antibiotiques sous prescription vétérinaire.",
    vet_for:"Identifier la souche d'E. coli, tester sa résistance aux antibiotiques et définir le traitement le plus adapté.",
  },
  {
    id:"histomonose", name:"Histomonose", severity:"Élevée", color:"#E53935", special:null,
    symptoms:[
      {id:"diarrhee_jaune",w:10},{id:"abattement",w:5},
      {id:"amaigrissement",w:5},{id:"mortalite_soudaine",w:2},
    ],
    incompatible:[{id:"ecoulement_nasal",p:4},{id:"lesions_peau",p:4}],
    description:"C'est une maladie parasitaire grave qui touche surtout les cailles et les dindes. Elle provoque des lésions sérieuses du foie et des intestins. La diarrhée jaune-verte et l'abattement profond sont les signes les plus caractéristiques. Elle se transmet souvent par les vers de terre présents dans le sol.",
    prevention:"Toujours séparer les cailles des dindes. Contrôler la présence de vers de terre dans les zones d'élevage. Hygiène stricte de la litière.",
    actions:["Isoler immédiatement les oiseaux malades","Séparer les espèces si elles sont mélangées","Améliorer l'hygiène de la litière","Réduire le stress"],
    treatment:"Isolement strict des malades. Traitement selon la réglementation vétérinaire locale.",
    vet_for:"Confirmer le diagnostic et définir un traitement antiparasitaire adapté et légal dans votre pays.",
  },
];

function diagnose(selected) {
  if (!selected.length) return [];
  return DISEASES_V2.map(d => {
    let score = 0;
    const maxScore = d.symptoms.reduce((s,sym) => s+sym.w, 0);
    d.symptoms.forEach(sym => { if (selected.includes(sym.id)) score += sym.w; });
    d.incompatible?.forEach(inc => { if (selected.includes(inc.id)) score -= inc.p; });
    score = Math.max(0, score);
    const pct = maxScore > 0 ? Math.round(score/maxScore*100) : 0;
    return { ...d, score, maxScore, pct };
  })
  .filter(d => d.score > 0 && d.pct >= 10)
  .sort((a,b) => b.pct - a.pct)
  .slice(0, 3);
}

// ═══════════════════════════════════════════════════════
//  DONNÉES — AUTRES MODULES
// ═══════════════════════════════════════════════════════

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

// ── Conseils du jour ──────────────────────────────────

const DAILY_TIPS = [
  "L'eau est le premier aliment de vos volailles. Un oiseau déshydraté mange moins, grandit moins vite et tombe plus facilement malade.",
  "Observez vos volailles deux fois par jour. Un oiseau isolé du groupe ou qui ne mange plus est souvent le premier signe d'un problème.",
  "La litière humide est l'ennemi numéro un de vos poussins. Une litière sèche prévient la coccidiose et les maladies respiratoires.",
  "La vaccination ne protège que si elle est faite au bon moment et correctement conservée. Vérifiez toujours la chaîne du froid.",
  "Un bon taux d'éclosion commence par des géniteurs en bonne santé. La qualité de l'œuf dépend de la qualité de la poule qui l'a pondu.",
  "La surpopulation est une cause majeure de stress et de maladies. Respectez la densité recommandée selon l'âge de vos oiseaux.",
  "Désinfecter son élevage entre deux bandes n'est pas optionnel — c'est la base d'un élevage sain et rentable.",
  "Un incubateur mal calibré peut faire perdre toute une incubation. Vérifiez votre thermomètre avec un instrument de référence.",
  "Les pertes dues aux maladies coûtent toujours plus cher que la prévention. Investir dans la vaccination, c'est protéger ses bénéfices.",
  "La biosécurité commence à l'entrée de votre élevage. Limitez les visites et désinfectez les chaussures avant d'entrer dans les locaux.",
  "Pour les poussins, le comportement dit tout : regroupés = froid, dispersés et haletants = chaud, bien répartis = confort.",
  "Les rongeurs transmettent des maladies graves comme le Choléra ou la Pullorose. Contrôlez-les activement dans votre élevage.",
  "Ne mélangez jamais des oiseaux d'âges ou d'origines différentes sans une période de quarantaine d'au moins 2 semaines.",
  "Un œuf de bonne qualité pour l'incubation doit être collecté dans les 7 jours, propre, et conservé à 12–15°C.",
  "L'alimentation représente 60 à 70% du coût d'un élevage. Optimiser la ration alimentaire, c'est améliorer directement la rentabilité.",
  "Les moustiques transmettent la variole aviaire. Protégez vos locaux avec des filets et éliminez les eaux stagnantes autour de l'élevage.",
  "Un vétérinaire consulté tôt coûte moins cher qu'un élevage décimé. N'attendez pas que les pertes soient importantes pour agir.",
  "L'humidité lors de l'éclosion est critique. Ne jamais ouvrir l'incubateur pendant la phase d'éclosion — chaque ouverture peut tuer des poussins.",
  "Calculez votre coût de production par animal à chaque bande. C'est la seule façon de savoir si votre élevage est vraiment rentable.",
  "Les élevages qui réussissent sont ceux qui tiennent des registres. Notez vos dépenses, vos ventes et vos observations chaque semaine.",
  "La caille pond dès 6–7 semaines. Prévoir la transition alimentation démarrage → ponte avant ce stade pour ne pas perturber la production.",
  "Un bâtiment bien ventilé mais sans courant d'air direct est la base d'un bon démarrage de poussins.",
  "Le retournement des œufs en incubation évite que l'embryon colle à la membrane. Ne jamais arrêter avant J18 pour le poulet.",
  "Une bonne biosécurité vaut mieux que tous les traitements. Il est toujours plus facile d'empêcher une maladie d'entrer que de la combattre.",
  "Les aliments mal stockés peuvent causer l'aspergillose. Toujours conserver la provende au sec, à l'abri de l'humidité et des rongeurs.",
  "Le mirage à J7 est une étape essentielle. Il permet d'éliminer les œufs non fécondés et d'améliorer les conditions des œufs restants.",
  "Un bon aviculteur sait lire le comportement de ses oiseaux mieux qu'un thermomètre. Observez, notez, comparez d'une semaine à l'autre.",
  "La gestion financière est aussi importante que la gestion technique. Un élevage bien suivi financièrement résiste mieux aux difficultés.",
  "Acheter des poussins vaccinés coûte un peu plus cher mais peut éviter des pertes catastrophiques sur toute la bande.",
  "Après chaque bande, faites le bilan : taux de mortalité, coût de production, marge. C'est en analysant qu'on progresse d'une bande à l'autre.",
];

function getDailyTip() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((now - start) / 86400000);
  return DAILY_TIPS[dayOfYear % DAILY_TIPS.length];
}

// ═══════════════════════════════════════════════════════
//  UTILITAIRES
// ═══════════════════════════════════════════════════════

const addDays = (d,n) => { const r=new Date(d); r.setDate(r.getDate()+n); return r; };
const fmtDate = d => d ? new Date(d).toLocaleDateString("fr-FR",{day:"2-digit",month:"short",year:"numeric"}) : "";
const fmtCFA  = n => new Intl.NumberFormat("fr-FR").format(Math.round(n||0)) + " F";
const genId   = () => Math.random().toString(36).slice(2,11);
const today   = () => new Date().toISOString().split("T")[0];

function useStorage(key, fallback=null) {
  const [data,setData] = useState(() => {
    try { const i=localStorage.getItem(key); return i?JSON.parse(i):fallback; } catch { return fallback; }
  });
  const save = useCallback(val => {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
    setData(val);
  }, [key]);
  return [data, save, true];
}

// ═══════════════════════════════════════════════════════
//  DESIGN TOKENS
// ═══════════════════════════════════════════════════════

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
const VetBtn = () => (
  <button style={btn(C.purple)}>📞 Consulter un vétérinaire ⭐</button>
);
const FormationBtn = () => (
  <button style={{ ...btn(C.blue, "#fff", {marginTop:8}) }}>📚 Voir les formations liées</button>
);

// ═══════════════════════════════════════════════════════
//  ACCUEIL
// ═══════════════════════════════════════════════════════

function HomeScreen({ go }) {
  const dailyTip = getDailyTip();
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

        {/* Conseil du jour rotatif */}
        <div style={{ ...card({ background:C.greenLt, marginTop:14 }) }}>
          <div style={{ fontWeight:800, color:C.green, fontSize:13, marginBottom:6 }}>💡 Conseil du jour</div>
          <div style={{ fontSize:13, color:C.text, lineHeight:1.6 }}>{dailyTip}</div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
//  INCUBATION
// ═══════════════════════════════════════════════════════

function getEclosionFeedback(rate, minRate) {
  if (rate >= 85) return { label:"Excellent ! 🏆", color:C.green, bg:C.greenLt,
    msg:`Félicitations ! Un taux de ${rate}% est exceptionnel. Vos paramètres sont parfaitement maîtrisés.` };
  if (rate >= minRate) return { label:"Bon résultat ✅", color:C.green, bg:C.greenLt,
    msg:`Un taux de ${rate}% est dans les standards. Bon travail ! 📚 Consultez la section Formations pour progresser encore.` };
  if (rate >= 40) return { label:"En dessous des standards ⚠️", color:C.orange, bg:C.orangeLt,
    msg:`Un taux de ${rate}% est en dessous du minimum acceptable (${minRate}%). Causes possibles : instabilité de la température, humidité incorrecte, qualité des géniteurs. 📚 La section Formations propose des pistes d'amélioration.` };
  return { label:"Taux très faible ❌", color:C.red, bg:C.redLt,
    msg:`Un taux de ${rate}% est très préoccupant. Vérifier en priorité : calibration thermomètre/hygromètre, qualité des reproducteurs, conservation des œufs avant incubation. 📚 La section Formations peut vous aider.` };
}

function IncubationModule({ onBack }) {
  const [screen,setScreen]   = useState("home");
  const [form,setForm]       = useState({ type:"", dateStart:"", qty:"", ambientTemp:"" });
  const [hist,saveHist]      = useStorage("avi:incubation_hist", []);
  const [selHist,setSelHist] = useState(null);
  const [eclosionInput,setEI]= useState("");

  const calculate = () => {
    const egg = EGG_TYPES[form.type];
    if (!egg||!form.dateStart||!form.qty||!form.ambientTemp) return;
    const start = new Date(form.dateStart);
    const item = {
      id:genId(), form:{...form},
      eclosion:addDays(start,egg.days).toISOString(),
      eclosionStart:addDays(start,egg.eclosionStart-1).toISOString(),
      eclosionEnd:addDays(start,egg.eclosionWindow[1]-1).toISOString(),
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

  // Eclosion entry
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

  // History detail
  if (screen==="histDetail"&&selHist) {
    const egg=EGG_TYPES[selHist.form.type];
    const at=AMBIENT_TEMPS.find(a=>a.id===selHist.form.ambientTemp)||AMBIENT_TEMPS[0];
    const now=new Date(), ecloDate=new Date(selHist.eclosion);
    const currentDay=Math.floor((now-new Date(selHist.form.dateStart))/86400000)+1;
    const isActive=now<ecloDate, isComplete=!isActive&&!selHist.eclosionResult, hasResult=!!selHist.eclosionResult;
    return (
      <div>
        <div style={{background:`linear-gradient(135deg,${C.green},${C.greenDk})`,padding:"14px 18px",color:"#fff"}}>
          <BackBtn onBack={()=>setScreen("history")} label="Historique" />
          <div style={{fontWeight:900,fontSize:19,marginTop:8}}>{egg?.icon} {egg?.name}</div>
          <div style={{fontSize:13,opacity:.85}}>{selHist.form.qty} œufs · {at.icon} {at.label}</div>
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
            <Row label="Mise en incubation"                value={fmtDate(selHist.form.dateStart)} />
            {selHist.mirages?.map(m=><Row key={m.day} label={`Mirage (J${m.day})`} value={fmtDate(m.date)} />)}
            <Row label={`Arrêt retournement (J${egg?.stopTurn})`} value={fmtDate(selHist.stopDate)} />
            <Row label="Début d'éclosion probable"         value={fmtDate(selHist.eclosionStart)} />
            <Row label="Fenêtre d'éclosion"                value={`${fmtDate(selHist.eclosionStart)} – ${fmtDate(selHist.eclosionEnd)}`} accent />
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

  // History list
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
                <div style={{fontSize:12,color:C.muted}}>Fenêtre éclosion : {fmtDate(h.eclosionStart)} – {fmtDate(h.eclosionEnd)}</div>
                <div style={{fontSize:11,color:C.blue,marginTop:4,fontWeight:700}}>Appuyer pour voir le détail →</div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // New incubation form
  if (screen==="new") {
    const egg=EGG_TYPES[form.type];
    const at=AMBIENT_TEMPS.find(a=>a.id===form.ambientTemp);
    const canCalc = form.type&&form.dateStart&&form.qty&&form.ambientTemp;
    return (
      <div>
        <SubHeader bg={`linear-gradient(135deg,${C.green},${C.greenDk})`}
          title="Nouvelle incubation" onBack={()=>setScreen("home")} backLabel="Incubation" />
        <div style={{padding:16}}>
          <div style={{...card()}}>
            {/* Type d'œuf */}
            <span style={lbl}>Type d'œuf</span>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:14}}>
              {Object.entries(EGG_TYPES).map(([k,e])=>(
                <button key={k} onClick={()=>setForm(f=>({...f,type:k}))}
                  style={{background:form.type===k?C.green:C.bg,color:form.type===k?"#fff":C.text,
                    border:`2px solid ${form.type===k?C.green:C.border}`,borderRadius:10,
                    padding:"10px 8px",cursor:"pointer",fontFamily:"'Nunito',sans-serif",
                    fontWeight:700,fontSize:12,display:"flex",alignItems:"center",gap:6}}>
                  {e.icon} {e.name}
                </button>
              ))}
            </div>
            {egg&&(
              <div style={{background:C.greenLt,borderRadius:10,padding:10,marginBottom:14,fontSize:13,color:C.green}}>
                <strong>{egg.days} jours</strong> · Mirage J{egg.mirage.join(", J")} · Arrêt J{egg.stopTurn} · {egg.turnsPerDay}×/j
              </div>
            )}

            {/* Date et quantité */}
            <span style={lbl}>Date de mise en incubation</span>
            <input type="date" style={{...inp(),marginBottom:14}}
              value={form.dateStart} onChange={e=>setForm(f=>({...f,dateStart:e.target.value}))} />
            <span style={lbl}>Nombre d'œufs</span>
            <input type="number" placeholder="Ex: 100" style={{...inp(),marginBottom:16}}
              value={form.qty} onChange={e=>setForm(f=>({...f,qty:e.target.value}))} />

            {/* Température ambiante */}
            <span style={lbl}>🌡️ Température approximative de votre salle d'incubation</span>
            <div style={{display:"grid",gridTemplateColumns:"1fr",gap:8,marginBottom:20}}>
              {AMBIENT_TEMPS.map(a=>(
                <button key={a.id} onClick={()=>setForm(f=>({...f,ambientTemp:a.id}))}
                  style={{background:form.ambientTemp===a.id?a.color:C.bg,
                    color:form.ambientTemp===a.id?"#fff":C.text,
                    border:`2px solid ${form.ambientTemp===a.id?a.color:C.border}`,
                    borderRadius:10,padding:"11px 14px",cursor:"pointer",
                    fontFamily:"'Nunito',sans-serif",fontWeight:700,fontSize:14,
                    textAlign:"left",display:"flex",alignItems:"center",gap:10}}>
                  <span style={{fontSize:20}}>{a.icon}</span>
                  <span>{a.label}</span>
                  {form.ambientTemp===a.id&&a.mode&&(
                    <span style={{marginLeft:"auto",fontSize:11,opacity:.8}}>
                      {a.mode==="chaud"?"Paramètres ajustés":"⚠️ Mode forte chaleur"}
                    </span>
                  )}
                </button>
              ))}
            </div>

            <button onClick={calculate} style={btn(canCalc?C.green:"#AAC8AA")} disabled={!canCalc}>
              Calculer mon incubation →
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Result screen
  if (screen==="result"&&selHist) {
    const egg=EGG_TYPES[selHist.form.type];
    const at=AMBIENT_TEMPS.find(a=>a.id===selHist.form.ambientTemp)||AMBIENT_TEMPS[0];
    const adaptedPhases = adaptPhases(egg.phases, at.id);
    const isAdapted = at.id !== "standard";

    return (
      <div>
        <div style={{background:`linear-gradient(135deg,${C.green},${C.greenDk})`,padding:"14px 18px",color:"#fff"}}>
          <BackBtn onBack={()=>setScreen("new")} label="Modifier" />
          <div style={{fontWeight:900,fontSize:19,marginTop:8}}>{egg.icon} Incubation {egg.name}</div>
          <div style={{fontSize:13,opacity:.85}}>{selHist.form.qty} œufs · {at.icon} {at.label}</div>
        </div>
        <div style={{padding:"14px 16px"}}>

          {/* Alerte température ambiante */}
          {at.mode==="chaud"&&(
            <div style={{...card({background:C.orangeLt,border:`1px solid ${C.orange}44`,marginBottom:10})}}>
              <div style={{fontWeight:800,color:C.orange,marginBottom:6}}>🔥 Chaleur ambiante détectée</div>
              <div style={{fontSize:13,color:C.text,lineHeight:1.6}}>
                Les paramètres ci-dessous ont été <strong>automatiquement ajustés</strong> pour votre environnement (36–38°C). Surveillez la température interne de votre couveuse toutes les 2–3h. Si elle dépasse 37.8°C de manière prolongée, ajoutez de l'eau fraîche dans les bacs d'humidité. Ne jamais verser d'eau froide directement sur les œufs.
              </div>
            </div>
          )}
          {at.mode==="extreme"&&(
            <div style={{...card({background:C.redLt,border:`1px solid ${C.red}44`,marginBottom:10})}}>
              <div style={{fontWeight:800,color:C.red,marginBottom:6}}>☀️ ⚠️ Mode forte chaleur activé</div>
              <div style={{fontSize:13,color:C.text,lineHeight:1.6}}>
                Les paramètres ont été <strong>fortement ajustés</strong>. À partir de 39°C ambiants, le risque de surchauffe embryonnaire devient critique. Surveiller la température interne <strong>toutes les heures</strong>. Ventiler fortement la salle. Des glaçons dans les bacs d'humidité peuvent aider — jamais au contact direct des œufs.
              </div>
            </div>
          )}

          {/* Dates clés */}
          <div style={{...card({background:C.greenLt})}}>
            <div style={{fontWeight:800,color:C.green,marginBottom:12,fontSize:14}}>📅 Dates clés</div>
            <Row label="Mise en incubation"                value={fmtDate(selHist.form.dateStart)} />
            {selHist.mirages.map(m=><Row key={m.day} label={`Mirage (J${m.day})`} value={fmtDate(m.date)} />)}
            <Row label={`Arrêt retournement (J${egg.stopTurn})`} value={fmtDate(selHist.stopDate)} />
            <Row label={`Début d'éclosion (J${egg.eclosionStart})`} value={fmtDate(selHist.eclosionStart)} />
            <Row label={`Fenêtre d'éclosion (J${egg.eclosionWindow[0]}–J${egg.eclosionWindow[1]})`}
              value={`${fmtDate(selHist.eclosionStart)} – ${fmtDate(selHist.eclosionEnd)}`} accent />
          </div>

          {/* Note éclosion */}
          <div style={{...card({background:"#F0F4FF",border:`1px solid ${C.blue}22`,marginTop:-4,padding:"10px 14px"})}}>
            <div style={{fontSize:12,color:C.blue,lineHeight:1.5}}>
              💡 La fenêtre d'éclosion peut varier de 1 à 2 jours selon la stabilité de la température d'incubation. Ne vous inquiétez pas si les premiers œufs commencent à piquer un peu avant ou après — c'est tout à fait normal.
            </div>
          </div>

          {/* Paramètres par phase */}
          <div style={{...card()}}>
            <div style={{fontWeight:800,fontSize:14,marginBottom:6}}>⚙️ Paramètres recommandés</div>
            {isAdapted&&(
              <div style={{background:`${at.color}15`,borderRadius:8,padding:"6px 10px",marginBottom:10,fontSize:11,color:at.color,fontWeight:700}}>
                {at.icon} Paramètres adaptés à la chaleur ambiante {at.label}
              </div>
            )}
            {adaptedPhases.map((p,i)=>(
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

          {/* Rappels */}
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

          {/* Tips spéciaux espèce */}
          <div style={{...card({background:C.greenLt})}}>
            <div style={{fontWeight:800,color:C.green,marginBottom:10}}>💎 À retenir pour cette espèce</div>
            {egg.specialTips.map((t,i)=>(
              <div key={i} style={{display:"flex",gap:8,padding:"5px 0",fontSize:13,lineHeight:1.5,alignItems:"flex-start"}}>
                <span style={{color:C.green,flexShrink:0}}>•</span>{t}
              </div>
            ))}
          </div>

          <div style={{...card({background:C.orangeLt})}}>
            <div style={{fontWeight:800,color:C.orange,fontSize:12,marginBottom:4}}>📚 Section Formations</div>
            <div style={{fontSize:12,color:C.text,lineHeight:1.5}}>
              Des tutoriels vidéo gratuits sur le mirage et le démarrage sont disponibles dans la section <strong>Formations</strong>.
            </div>
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
        <button onClick={()=>{setForm({type:"",dateStart:"",qty:"",ambientTemp:""});setScreen("new");}} style={{...btn(C.green),marginBottom:10}}>
          + Nouvelle incubation
        </button>
        <button onClick={()=>setScreen("history")} style={outlineBtn(C.green)}>
          📋 Historique ({(hist||[]).length})
        </button>
        <div style={{...card({background:C.greenLt,marginTop:14})}}>
          <div style={{fontWeight:800,color:C.green,marginBottom:8}}>💡 Le saviez-vous ?</div>
          <div style={{fontSize:13,lineHeight:1.6}}>
            Un taux d'éclosion de <strong>70–85%</strong> est excellent. La chaleur ambiante de votre salle influence les paramètres — l'application s'adapte automatiquement selon votre situation.
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
//  DÉMARRAGE POUSSINS
// ═══════════════════════════════════════════════════════

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
          <div style={{...card({background:C.orangeLt})}}>
            <div style={{fontSize:12,color:C.orange,fontWeight:700}}>
              📚 Des formations sur l'alimentation et la vaccination sont disponibles dans la section <strong>Formations</strong>.
            </div>
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

// ═══════════════════════════════════════════════════════
//  MALADIES — nouveau moteur complet
// ═══════════════════════════════════════════════════════

function MaladiesModule({ onBack }) {
  const [screen,setScreen]     = useState("home");
  const [selected,setSelected] = useState([]);
  const [results,setResults]   = useState([]);
  const [detail,setDetail]     = useState(null);
  const [openCat,setOpenCat]   = useState("digestifs");

  const toggle=id=>setSelected(s=>s.includes(id)?s.filter(x=>x!==id):[...s,id]);

  const analyze=()=>{
    setResults(diagnose(selected));
    setScreen("results");
  };

  // Bloc avertissement + vétérinaire
  const WarningVet = () => (
    <>
      <div style={{...card({background:C.redLt,border:`1px solid ${C.red}33`,marginBottom:8})}}>
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
          Pour un diagnostic fiable et un traitement adapté à votre élevage, consultez un vétérinaire partenaire AviAssist — réponse en moins de 24h.
        </div>
        <VetBtn />
      </div>
    </>
  );

  // Détail maladie
  if (detail) {
    const isGrippe = detail.special === "grippe";
    return (
      <div>
        <div style={{background:`linear-gradient(135deg,${C.red},#8B1A1A)`,padding:"14px 18px",color:"#fff"}}>
          <BackBtn onBack={()=>setDetail(null)} label="Résultats" />
          <div style={{fontWeight:900,fontSize:19,marginTop:8}}>{detail.name}</div>
          <span style={{...tag(`${detail.color}44`,"#fff"),marginTop:6}}>⚠️ Gravité : {detail.severity}</span>
        </div>
        <div style={{padding:16}}>

          {/* Alerte spéciale grippe aviaire */}
          {isGrippe&&(
            <div style={{...card({background:"#FFF0F0",border:`2px solid ${C.red}`,marginBottom:10})}}>
              <div style={{fontWeight:800,color:C.red,fontSize:13,marginBottom:6}}>🚨 CAS URGENT</div>
              <div style={{fontSize:13,color:C.red,lineHeight:1.6}}>
                ⚠️ Cas potentiellement grave. Contactez immédiatement un vétérinaire — il prendra les dispositions nécessaires pour votre élevage et vous guidera sur les étapes à suivre.
              </div>
            </div>
          )}

          <div style={{...card()}}>
            <div style={{fontWeight:800,marginBottom:8}}>📋 Description</div>
            <div style={{fontSize:13,lineHeight:1.6,color:C.text}}>{detail.description}</div>
          </div>

          <div style={{...card({background:C.orangeLt})}}>
            <div style={{fontWeight:800,color:C.orange,marginBottom:8}}>🛡️ Prévention</div>
            <div style={{fontSize:13,lineHeight:1.6}}>{detail.prevention}</div>
          </div>

          {/* Actions immédiates */}
          <div style={{...card({background:C.greenLt})}}>
            <div style={{fontWeight:800,color:C.green,marginBottom:10}}>⚡ Actions immédiates</div>
            {detail.actions.map((a,i)=>(
              <div key={i} style={{display:"flex",gap:8,padding:"4px 0",fontSize:13,lineHeight:1.5,alignItems:"flex-start"}}>
                <span style={{color:C.green,fontWeight:900,flexShrink:0}}>✓</span>{a}
              </div>
            ))}
          </div>

          {/* Soutien recommandé */}
          <div style={{...card()}}>
            <div style={{fontWeight:800,marginBottom:8}}>💊 Soutien recommandé</div>
            <div style={{fontSize:13,lineHeight:1.6,marginBottom:10,color:C.text}}>{detail.treatment}</div>
            <div style={{background:C.orangeLt,borderRadius:10,padding:"10px 12px"}}>
              <div style={{fontWeight:800,color:C.orange,fontSize:12,marginBottom:4}}>⚕️ Consultez un vétérinaire pour :</div>
              <div style={{fontSize:12,color:C.text,lineHeight:1.6}}>{detail.vet_for}</div>
            </div>
          </div>

          {/* CTA vétérinaire + formations */}
          <div style={{...card({background:C.purpleLt,border:`1px solid ${C.purple}33`})}}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
              <span style={{...tag(C.purple,"#fff")}}>⭐ Premium</span>
              <span style={{fontWeight:800,color:C.purple,fontSize:13}}>Consulter un vétérinaire</span>
            </div>
            <div style={{fontSize:12,color:C.text,lineHeight:1.5,marginBottom:10}}>
              Nos vétérinaires partenaires peuvent vous aider à confirmer ce diagnostic et définir un traitement adapté à votre élevage.
            </div>
            <VetBtn />
            <FormationBtn />
          </div>

          <div style={{...card({background:C.redLt,border:`1px solid ${C.red}33`})}}>
            <div style={{fontWeight:800,color:C.red,fontSize:12,marginBottom:4}}>⚕️ AVERTISSEMENT</div>
            <div style={{fontSize:12,color:C.red,lineHeight:1.5}}>
              Ces informations sont des <strong>conseils préliminaires uniquement</strong>. Elles ne remplacent jamais un diagnostic vétérinaire professionnel.
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Résultats
  if (screen==="results") {
    return (
      <div>
        <SubHeader bg={`linear-gradient(135deg,${C.red},#8B1A1A)`}
          title="Maladies probables"
          subtitle={`${selected.length} symptôme(s) · ${results.length} correspondance(s)`}
          onBack={()=>setScreen("symptoms")} backLabel="Symptômes" />
        <div style={{padding:16}}>
          {results.length===0 ? (
            <div style={{...card(),textAlign:"center",padding:32,color:C.muted}}>
              <div style={{fontSize:40}}>🔍</div>
              <div style={{fontWeight:700,marginTop:10}}>Aucune correspondance directe</div>
              <div style={{fontSize:12,marginTop:6}}>Essayez d'ajouter d'autres symptômes</div>
            </div>
          ) : results.map((d,i)=>(
            <button key={i} onClick={()=>setDetail(d)}
              style={{...card({cursor:"pointer",width:"100%",textAlign:"left",border:`1.5px solid ${d.color}33`})}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                <div style={{fontWeight:900,fontSize:15}}>{d.name}</div>
                <span style={{...tag(`${d.color}22`,d.color)}}>{d.severity}</span>
              </div>
              <div style={{fontSize:12,color:C.muted,marginBottom:8}}>
                {d.score}/{d.maxScore} pts · {d.pct}% de correspondance
              </div>
              <div style={{background:C.bg,borderRadius:6,height:8,overflow:"hidden"}}>
                <div style={{background:d.color,width:`${d.pct}%`,height:"100%",borderRadius:6,
                  transition:"width .4s"}} />
              </div>
              <div style={{fontSize:11,color:C.muted,marginTop:5}}>Appuyer pour voir détail et traitement →</div>
            </button>
          ))}
          <WarningVet />
        </div>
      </div>
    );
  }

  // Sélection symptômes
  if (screen==="symptoms") {
    const catSymptoms = cat => SYMPTOMS_V2.filter(s=>s.cat===cat);
    return (
      <div>
        <div style={{background:`linear-gradient(135deg,${C.red},#8B1A1A)`,padding:"14px 18px",color:"#fff"}}>
          <BackBtn onBack={()=>setScreen("home")} label="Maladies" />
          <div style={{fontWeight:900,fontSize:17,marginTop:8}}>Sélectionner les symptômes</div>
          <div style={{fontSize:12,opacity:.85,marginTop:3}}>{selected.length} symptôme(s) sélectionné(s)</div>
        </div>
        <div style={{padding:16}}>
          {SYMPTOM_CATS.map(cat=>(
            <div key={cat.id} style={{marginBottom:8}}>
              {/* Catégorie header */}
              <button onClick={()=>setOpenCat(openCat===cat.id?null:cat.id)}
                style={{width:"100%",background:openCat===cat.id?C.red:C.bg,
                  color:openCat===cat.id?"#fff":C.text,border:`1.5px solid ${openCat===cat.id?C.red:C.border}`,
                  borderRadius:10,padding:"10px 14px",cursor:"pointer",textAlign:"left",
                  fontWeight:700,fontSize:13,fontFamily:"'Nunito',sans-serif",
                  display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span>{cat.label}</span>
                <span style={{fontSize:11,opacity:.7}}>
                  {catSymptoms(cat.id).filter(s=>selected.includes(s.id)).length}/{catSymptoms(cat.id).length} · {openCat===cat.id?"▲":"▼"}
                </span>
              </button>
              {openCat===cat.id&&(
                <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:"0 0 10px 10px",overflow:"hidden"}}>
                  {catSymptoms(cat.id).map(s=>(
                    <button key={s.id} onClick={()=>toggle(s.id)} style={{
                      width:"100%",background:selected.includes(s.id)?C.redLt:"transparent",
                      border:"none",borderBottom:`1px solid ${C.border}`,
                      padding:"11px 14px",cursor:"pointer",textAlign:"left",
                      display:"flex",alignItems:"center",gap:12,fontFamily:"'Nunito',sans-serif"}}>
                      <div style={{width:20,height:20,borderRadius:5,flexShrink:0,
                        background:selected.includes(s.id)?C.red:"transparent",
                        border:`2px solid ${selected.includes(s.id)?C.red:C.border}`,
                        display:"flex",alignItems:"center",justifyContent:"center"}}>
                        {selected.includes(s.id)&&<span style={{color:"#fff",fontSize:12,fontWeight:900}}>✓</span>}
                      </div>
                      <span style={{fontSize:13,fontWeight:600,color:selected.includes(s.id)?C.red:C.text}}>
                        {s.label}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
          {selected.length > 0 && (
            <button onClick={analyze} style={btn(C.red)}>
              Analyser {selected.length} symptôme(s) →
            </button>
          )}
        </div>
      </div>
    );
  }

  // Bibliothèque
  if (screen==="library") {
    return (
      <div>
        <SubHeader bg={`linear-gradient(135deg,${C.red},#8B1A1A)`}
          title="Bibliothèque des maladies" subtitle={`${DISEASES_V2.length} maladies répertoriées`}
          onBack={()=>setScreen("home")} backLabel="Maladies" />
        <div style={{padding:16}}>
          {DISEASES_V2.map((d,i)=>(
            <button key={i} onClick={()=>setDetail(d)}
              style={{...card({cursor:"pointer",width:"100%",textAlign:"left"})}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                <div style={{fontWeight:800,fontSize:14}}>{d.name}</div>
                <span style={{...tag(`${d.color}22`,d.color)}}>{d.severity}</span>
              </div>
              <div style={{fontSize:12,color:C.muted,lineHeight:1.4}}>{d.description.slice(0,90)}...</div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header bg={`linear-gradient(150deg,${C.red},#8B1A1A)`}
        emoji="🩺" title="Assistance Maladies" subtitle="Identifier et agir rapidement" onBack={onBack} />
      <div style={{padding:16}}>
        <button onClick={()=>{setSelected([]);setOpenCat("digestifs");setScreen("symptoms");}}
          style={{...btn(C.red),marginBottom:10}}>
          🔍 Analyser des symptômes
        </button>
        <button onClick={()=>setScreen("library")} style={outlineBtn(C.red)}>
          📚 Bibliothèque des maladies ({DISEASES_V2.length})
        </button>
        <div style={{...card({background:C.redLt,border:`1px solid ${C.red}33`,marginTop:14})}}>
          <div style={{fontWeight:800,color:C.red,marginBottom:8}}>⚕️ Important</div>
          <div style={{fontSize:13,color:C.red,lineHeight:1.6}}>
            Cet outil propose des <strong>pistes préliminaires</strong>. Il ne remplace jamais un vétérinaire. En cas de mortalité soudaine, <strong>agissez immédiatement</strong>.
          </div>
        </div>
        <div style={{...card({background:C.purpleLt,border:`1px solid ${C.purple}22`,marginTop:4})}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
            <span style={{...tag(C.purple,"#fff")}}>⭐ Premium</span>
            <span style={{fontWeight:800,color:C.purple,fontSize:13}}>Consulter un vétérinaire</span>
          </div>
          <div style={{fontSize:12,color:C.text,lineHeight:1.5}}>
            Accédez à nos vétérinaires partenaires pour un diagnostic fiable et un traitement sur mesure.
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
//  FORMATIONS
// ═══════════════════════════════════════════════════════

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
            ? <div style={{...card({background:C.orangeLt,border:`1px solid ${C.orange}33`,marginBottom:14})}}>
                <div style={{fontWeight:800,color:C.orange,marginBottom:6}}>⭐ Contenu Premium</div>
                <div style={{fontSize:13}}>Cette formation nécessite un abonnement premium.</div>
              </div>
            : <div style={{...card({background:C.greenLt,marginBottom:14})}}>
                <div style={{fontWeight:800,color:C.green,marginBottom:4}}>✅ Accès gratuit</div>
                <div style={{fontSize:13}}>Cette formation est disponible gratuitement.</div>
              </div>}
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
                {f.premium?<span style={{...tag(C.orangeLt,C.orange),flexShrink:0}}>⭐ Premium</span>
                  :<span style={{...tag(C.greenLt,C.green),flexShrink:0}}>✅ Gratuit</span>}
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

// ═══════════════════════════════════════════════════════
//  TRÉSORERIE — bande terminée = lecture seule
// ═══════════════════════════════════════════════════════

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
  const isTerminee = bande?.status==="terminee";

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
    if (!fDep.cat||!fDep.montant||!bande||isTerminee) return;
    const catObj=EXPENSE_CATEGORIES.find(c=>c.id===fDep.cat);
    const d={id:genId(),cat:fDep.cat,nom:catObj?.label||"",description:fDep.description,montant:parseFloat(fDep.montant),date:fDep.date};
    saveBande({...bande,depenses:[...bande.depenses,d]}); setFDep(emptyDep()); setScreen("detail"); setTab("depenses");
  };
  const updateDep=()=>{
    if (!fDep.cat||!fDep.montant||!bande||!editDepId||isTerminee) return;
    const catObj=EXPENSE_CATEGORIES.find(c=>c.id===fDep.cat);
    const d={id:editDepId,cat:fDep.cat,nom:catObj?.label||"",description:fDep.description,montant:parseFloat(fDep.montant),date:fDep.date};
    saveBande({...bande,depenses:bande.depenses.map(x=>x.id===editDepId?d:x)}); setEditDepId(null); setFDep(emptyDep()); setScreen("detail"); setTab("depenses");
  };
  const deleteDep=id=>{ if (!isTerminee) saveBande({...bande,depenses:bande.depenses.filter(d=>d.id!==id)}); };

  const addVen=()=>{
    if (!fVen.produit||!fVen.montant||!bande||isTerminee) return;
    const v={id:genId(),...fVen,montant:parseFloat(fVen.montant)};
    saveBande({...bande,ventes:[...bande.ventes,v]}); setFVen(emptyVen()); setScreen("detail"); setTab("ventes");
  };
  const updateVen=()=>{
    if (!fVen.produit||!fVen.montant||!bande||!editVenId||isTerminee) return;
    const v={id:editVenId,...fVen,montant:parseFloat(fVen.montant)};
    saveBande({...bande,ventes:bande.ventes.map(x=>x.id===editVenId?v:x)}); setEditVenId(null); setFVen(emptyVen()); setScreen("detail"); setTab("ventes");
  };
  const deleteVen=id=>{ if (!isTerminee) saveBande({...bande,ventes:bande.ventes.filter(v=>v.id!==id)}); };

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
          {isTerminee&&<span style={{...tag("rgba(100,255,150,.3)","#fff"),marginTop:6}}>✅ Bande terminée</span>}
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
            {td>0&&<div style={{fontSize:13,color:C.muted,marginTop:8}}>
              Rentabilité : <strong style={{color:positif?C.green:C.red}}>{tv>0?(bn>=0?"+":"")+Math.round(bn/td*100):0}%</strong>
              {bande.effectif>0&&tv>0&&<> · {fmtCFA(bn/bande.effectif)}/animal</>}
            </div>}
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
                    <div><div style={{fontSize:13,fontWeight:800}}>{catObj?.icon} {catObj?.label}</div>
                      {d.description&&<div style={{fontSize:11,color:C.muted,marginTop:1}}>{d.description}</div>}
                      <div style={{fontSize:11,color:C.muted}}>{fmtDate(d.date)}</div>
                    </div>
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
                  <div><div style={{fontSize:13,fontWeight:800}}>{v.produit}</div>
                    <div style={{fontSize:11,color:C.muted}}>{v.qty&&`${v.qty} unités · `}{v.prixUnit&&`${fmtCFA(v.prixUnit)}/u · `}{fmtDate(v.date)}</div>
                    {v.remarque&&<div style={{fontSize:11,color:C.muted,fontStyle:"italic"}}>{v.remarque}</div>}
                  </div>
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
  if ((screen==="addDep"||screen==="editDep")&&bande&&!isTerminee) {
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
                <div><div style={{fontSize:14,fontWeight:800}}>{selCat.label}</div>
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
  if ((screen==="addVen"||screen==="editVen")&&bande&&!isTerminee) {
    const isEdit=screen==="editVen";
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

    const handleEditDep=d=>{ setEditDepId(d.id); setFDep({cat:d.cat,description:d.description||"",montant:String(d.montant),date:d.date}); setScreen("editDep"); };
    const handleEditVen=v=>{ setEditVenId(v.id); setFVen({produit:v.produit,qty:v.qty||"",prixUnit:v.prixUnit||"",montant:String(v.montant),date:v.date,remarque:v.remarque||""}); setScreen("editVen"); };

    return (
      <div>
        <div style={{background:`linear-gradient(135deg,${C.purple},#4A148C)`,padding:"14px 18px",color:"#fff"}}>
          <BackBtn onBack={()=>{setCT(false);setScreen("list");}} label="Mes bandes" />
          <div style={{fontWeight:900,fontSize:18,marginTop:8}}>{bande.nom}</div>
          <div style={{fontSize:12,opacity:.8,marginTop:3}}>{bande.type} · {bande.effectif} animaux · {fmtDate(bande.date)}</div>
          <span style={{...tag(isTerminee?"rgba(100,255,150,.3)":"rgba(255,165,0,.3)","#fff"),marginTop:8}}>
            {isTerminee?"✅ Terminée — Lecture seule":"🔄 En cours"}
          </span>
        </div>

        {/* Alerte lecture seule */}
        {isTerminee&&(
          <div style={{background:"#F0FFF4",borderBottom:`1px solid ${C.green}33`,padding:"10px 16px",
            display:"flex",alignItems:"center",gap:8}}>
            <span style={{fontSize:16}}>🔒</span>
            <span style={{fontSize:12,color:C.green,fontWeight:700}}>
              Bande clôturée — Les données sont archivées et ne peuvent plus être modifiées.
            </span>
          </div>
        )}

        {/* Mini résumé */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,padding:"12px 16px 8px"}}>
          {[{lbl:"Dépenses",val:fmtCFA(td),color:C.red,bg:C.redLt},
            {lbl:"Recettes",val:fmtCFA(tv),color:C.green,bg:C.greenLt},
            {lbl:positif?"Bénéfice":"Perte",val:fmtCFA(Math.abs(bn)),color:positif?C.green:C.red,bg:positif?C.greenLt:C.redLt}
          ].map((s,i)=>(
            <div key={i} style={{background:s.bg,borderRadius:12,padding:"10px 8px",textAlign:"center"}}>
              <div style={{fontSize:10,color:s.color,fontWeight:800,marginBottom:3}}>{s.lbl}</div>
              <div style={{fontSize:11,fontWeight:900,color:s.color}}>{s.val}</div>
            </div>
          ))}
        </div>

        {/* Boutons action — masqués si terminée */}
        {!isTerminee&&(
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,padding:"0 16px 12px"}}>
            {[{label:"➕ Dépense",bg:C.redLt,color:C.red,action:()=>{setFDep(emptyDep());setScreen("addDep");}},
              {label:"💵 Vente",bg:C.greenLt,color:C.green,action:()=>{setFVen(emptyVen());setScreen("addVen");}},
              {label:"📊 Bilan",bg:`${C.purple}22`,color:C.purple,action:()=>setScreen("bilan")}
            ].map((a,i)=>(
              <button key={i} onClick={a.action} style={{background:a.bg,color:a.color,border:"none",
                borderRadius:10,padding:"11px 6px",cursor:"pointer",fontWeight:800,fontSize:12,
                fontFamily:"'Nunito',sans-serif",lineHeight:1.3}}>{a.label}</button>
            ))}
          </div>
        )}
        {isTerminee&&(
          <div style={{padding:"0 16px 12px"}}>
            <button onClick={()=>setScreen("bilan")} style={{...btn(C.purple)}}>📊 Voir le bilan complet</button>
          </div>
        )}

        {/* Tabs */}
        <div style={{display:"flex",margin:"0 16px",background:C.bg,borderRadius:"10px 10px 0 0",overflow:"hidden"}}>
          {["depenses","ventes"].map(t=>(
            <button key={t} onClick={()=>setTab(t)} style={{flex:1,
              background:tab===t?C.purple:"transparent",color:tab===t?"#fff":C.muted,
              border:"none",padding:"10px 8px",cursor:"pointer",fontWeight:800,
              fontSize:13,fontFamily:"'Nunito',sans-serif"}}>
              {t==="depenses"?`🧾 Dépenses (${bande.depenses.length})`:`💵 Ventes (${bande.ventes.length})`}
            </button>
          ))}
        </div>

        <div style={{padding:"12px 16px 8px"}}>
          {tab==="depenses" ? (
            bande.depenses.length===0 ? (
              <div style={{...card({textAlign:"center",padding:28,color:C.muted})}}>
                <div style={{fontSize:32,marginBottom:8}}>🧾</div>
                <div style={{fontWeight:700}}>Aucune dépense enregistrée</div>
                {!isTerminee&&<div style={{fontSize:12,marginTop:5}}>Appuyer sur "➕ Dépense"</div>}
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
                        {/* Boutons edit/delete — masqués si terminée */}
                        {!isTerminee&&(
                          <>
                            <button onClick={()=>handleEditDep(d)} style={{background:C.blueLt,border:"none",borderRadius:8,padding:"5px 8px",cursor:"pointer",fontSize:13,fontFamily:"'Nunito',sans-serif",color:C.blue,fontWeight:700}}>✏️</button>
                            <button onClick={()=>deleteDep(d.id)} style={{background:C.redLt,border:"none",borderRadius:8,padding:"5px 8px",cursor:"pointer",fontSize:13,fontFamily:"'Nunito',sans-serif",color:C.red,fontWeight:700}}>🗑</button>
                          </>
                        )}
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
                {!isTerminee&&<div style={{fontSize:12,marginTop:5}}>Appuyer sur "💵 Vente"</div>}
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
                      {!isTerminee&&(
                        <>
                          <button onClick={()=>handleEditVen(v)} style={{background:C.blueLt,border:"none",borderRadius:8,padding:"5px 8px",cursor:"pointer",fontSize:13,fontFamily:"'Nunito',sans-serif",color:C.blue,fontWeight:700}}>✏️</button>
                          <button onClick={()=>deleteVen(v.id)} style={{background:C.redLt,border:"none",borderRadius:8,padding:"5px 8px",cursor:"pointer",fontSize:13,fontFamily:"'Nunito',sans-serif",color:C.red,fontWeight:700}}>🗑</button>
                        </>
                      )}
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

        {/* Terminer la bande */}
        <div style={{padding:"0 16px 24px"}}>
          {!isTerminee&&!confirmTerminer&&(
            <button onClick={()=>setCT(true)} style={{...outlineBtn("#AAA",{borderColor:"#DDD",color:"#888",fontSize:13})}}>
              🏁 Terminer cette bande
            </button>
          )}
          {!isTerminee&&confirmTerminer&&(
            <div style={{...card({background:"#FFF8E1",border:"1px solid #FFC10766"})}}>
              <div style={{fontWeight:800,fontSize:13,marginBottom:8,color:"#856400"}}>⚠️ Confirmer la clôture ?</div>
              <div style={{fontSize:12,color:C.muted,marginBottom:12,lineHeight:1.5}}>
                Cette bande sera marquée <strong>Terminée</strong> et les données seront <strong>verrouillées en lecture seule</strong>. Le bilan restera toujours consultable.
              </div>
              <div style={{display:"flex",gap:8}}>
                <button onClick={terminerBande} style={{...btn(C.green,"#fff",{flex:1})}}>✅ Oui, terminer</button>
                <button onClick={()=>setCT(false)} style={{...btn("#EEE",C.text,{flex:1})}}>Annuler</button>
              </div>
            </div>
          )}
          {isTerminee&&(
            <div style={{...card({background:C.greenLt,textAlign:"center"})}}>
              <div style={{fontWeight:800,color:C.green}}>🔒 Bande archivée</div>
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
            <button onClick={createBande} style={btn(fBande.nom&&fBande.type&&fBande.date&&fBande.effectif?C.purple:"#CCC")}
              disabled={!fBande.nom||!fBande.type||!fBande.date||!fBande.effectif}>✓ Créer la bande</button>
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

// ═══════════════════════════════════════════════════════
//  APPLICATION PRINCIPALE + BACK BUTTON ANDROID
// ═══════════════════════════════════════════════════════

export default function App() {
  const [screen,setScreen]     = useState("home");
  const [exitConfirm,setExitC] = useState(false);
  const exitTimer = useRef(null);

  // Navigation avec push state
  const goTo = useCallback(s => {
    setScreen(s);
    history.pushState({ screen:s }, '');
  }, []);

  // Bouton retour Android
  useEffect(() => {
    history.pushState({ screen:"home" }, '');

    const handlePop = () => {
      setScreen(prev => {
        if (prev !== "home") {
          history.pushState({ screen:"home" }, '');
          return "home";
        } else {
          // Sur l'accueil : confirmation de sortie
          setExitC(ec => {
            if (ec) {
              // Deuxième appui → laisser sortir
              return ec;
            } else {
              // Premier appui → afficher message
              history.pushState({ screen:"home" }, '');
              if (exitTimer.current) clearTimeout(exitTimer.current);
              exitTimer.current = setTimeout(() => setExitC(false), 2500);
              return true;
            }
          });
          return prev;
        }
      });
    };

    window.addEventListener('popstate', handlePop);
    return () => {
      window.removeEventListener('popstate', handlePop);
      if (exitTimer.current) clearTimeout(exitTimer.current);
    };
  }, []);

  const screens = {
    home:       <HomeScreen go={goTo} />,
    incubation: <IncubationModule  onBack={()=>goTo("home")} />,
    poussins:   <PoussinModule     onBack={()=>goTo("home")} />,
    maladies:   <MaladiesModule    onBack={()=>goTo("home")} />,
    formations: <FormationsModule  onBack={()=>goTo("home")} />,
    tresorerie: <TresorerieModule  onBack={()=>goTo("home")} />,
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
        <div style={{width:"100%",maxWidth:430,background:"#F2F5EE",minHeight:"100vh",
          boxShadow:"0 8px 40px rgba(0,0,0,.18)",borderRadius:8,overflowY:"auto",overflowX:"hidden",position:"relative"}}>
          {screens[screen]||screens.home}

          {/* Toast "Appuyer encore pour quitter" */}
          {exitConfirm&&(
            <div style={{position:"fixed",bottom:32,left:"50%",transform:"translateX(-50%)",
              background:"rgba(0,0,0,.82)",color:"#fff",borderRadius:24,padding:"10px 20px",
              fontSize:13,fontWeight:700,zIndex:9999,whiteSpace:"nowrap",
              boxShadow:"0 4px 20px rgba(0,0,0,.3)"}}>
              Appuyez encore pour quitter
            </div>
          )}
        </div>
      </div>
    </>
  );
}
