// Données et calculs d'AviAssist (sans interface).

import { useCollection, useSyncStatus, clearLocalUserData } from "./store.jsx";
import { supabase } from "./supabase.js";
import { farmNameOf } from "./Auth.jsx";

// ═══════════════════════════════════════════
//  DONNÉES — INCUBATION
// ═══════════════════════════════════════════

const EGG_TYPES = {
  poulet:{ name:"Poulet",icon:"",days:21,mirage:[7,14],stopTurn:18,turnsPerDay:3,turnHours:["06h00","14h00","22h00"],youngName:"poussins",minRate:70,eclosionStart:21,eclosionWindow:[21,23],
    phases:[{label:"J1–J18",temp:"37.2–37.7°C",hum:"55–60%",note:""},{label:"J19–J21",temp:"37.0–37.5°C",hum:"65–70%",note:"↓ Baisser température + ↑ Humidité"}],
    tips:[
      {day:1,text:"Préchauffer la couveuse/incubateur pendant 24h pour stabiliser à 37.2–37.7°C. Vérifier l'humidité (55–60%) et le bon fonctionnement du retournement."},
      {day:7,text:"1er mirage : retirer les œufs clairs ou à développement anormal. Voir tutoriel mirage dans Formations."},
      {day:14,text:"2e mirage : les œufs sains sont très foncés avec une chambre d'air nette. Images de référence dans Formations."},
      {day:18,text:"Arrêter le retournement. Baisser la température à 37.0–37.5°C. Augmenter l'humidité à 65–70%. Placer les œufs à plat."},
      {day:19,text:"Les poussins commencent à piquer (pipping). NE PAS ouvrir l'incubateur ! La chute d'humidité colle les membranes."},
      {day:21,text:"Éclosion ! Laisser les poussins sécher 12–24h dans l'incubateur avant de les sortir."},
    ],
    specialTips:["Un poussin sain est sec, actif, alerte, avec un nombril propre.","Taux d'éclosion acceptable : 70–85%.","Cours complets disponibles dans la section Formations."],
  },
  caille:{ name:"Caille",icon:"",days:17,mirage:[7],stopTurn:14,turnsPerDay:4,turnHours:["06h00","12h00","18h00","00h00"],youngName:"cailleteaux",minRate:60,eclosionStart:16,eclosionWindow:[16,18],
    phases:[{label:"J1–J14",temp:"37.5–37.8°C",hum:"45–55%",note:""},{label:"J15–J17",temp:"37.0–37.5°C",hum:"65–70%",note:"↓ Baisser température + ↑ Humidité"}],
    tips:[
      {day:1,text:"Préchauffer pendant 24h à 37.5–37.8°C. Les œufs de caille sont très petits — vérifier que les grilles de retournement sont adaptées. Humidité : 45–55%."},
      {day:1,text:"Retournement 4× par jour : 06h00, 12h00, 18h00, 00h00. Sur la caille, la régularité est encore plus critique."},
      {day:7,text:"Mirage : utiliser une lampe adaptée aux petits œufs. Éliminer les œufs clairs. Voir tutoriel dans Formations."},
      {day:14,text:"Arrêter le retournement. Baisser à 37.0–37.5°C. Augmenter l'humidité à 65–70%."},
      {day:15,text:"Les cailleteaux commencent à piquer. NE PAS ouvrir l'incubateur !"},
      {day:17,text:"Éclosion ! Laisser sécher 12–24h. Les cailleteaux sont très petits — agir avec précaution."},
    ],
    specialTips:["Cycle très court (17 jours) — chaque heure d'instabilité a un impact plus fort.","Taux d'éclosion acceptable : 60–80%.","Formation 'Démarrer un élevage de caille rentable' dans Formations."],
  },
  canard:{ name:"Canard colvert / domestique",icon:"",days:28,mirage:[7,14],stopTurn:25,turnsPerDay:3,turnHours:["06h00","14h00","22h00"],youngName:"canetons",minRate:65,eclosionStart:28,eclosionWindow:[28,30],humid:[7,24],
    phases:[{label:"J1–J25",temp:"37.2–37.7°C",hum:"55–65%",note:"+ Humidification externe quotidienne J7–J24"},{label:"J26–J28",temp:"37.0–37.5°C",hum:"70–75%",note:"↓ Baisser température + ↑ Humidité, arrêter humidification externe"}],
    tips:[
      {day:1,text:"Préchauffer pendant 24h. Température : 37.2–37.7°C, humidité : 55–65%. Les œufs de canard produisent plus de chaleur en fin d'incubation."},
      {day:7,text:"1er mirage. À partir d'aujourd'hui : commencer l'humidification externe quotidienne. Voir tutoriel dans Formations."},
      {day:7,text:"Humidification externe (J7–J24, chaque jour) : vaporiser légèrement avec de l'eau tiède (35–37°C), laisser refroidir 15–30 min à l'air libre, puis remettre."},
      {day:14,text:"2e mirage. Continuer l'humidification externe. Images de référence dans Formations."},
      {day:25,text:"Arrêter le retournement ET l'humidification externe. Baisser à 37.0–37.5°C. Augmenter l'humidité à 70–75%."},
      {day:26,text:"Les canetons commencent à piquer. NE PAS ouvrir l'incubateur !"},
      {day:28,text:"Éclosion ! Laisser sécher 12–24h dans l'incubateur."},
    ],
    specialTips:["L'humidification externe (J7–J24) est LA particularité des œufs de canard. Ne jamais sauter cette étape.","Taux d'éclosion acceptable : 65–80%."],
  },
  canard_barbarie:{ name:"Canard de Barbarie",icon:"",days:35,mirage:[10,21],stopTurn:32,turnsPerDay:3,turnHours:["06h00","14h00","22h00"],youngName:"canetons",minRate:60,eclosionStart:35,eclosionWindow:[35,37],humid:[10,31],
    phases:[{label:"J1–J32",temp:"37.2–37.7°C",hum:"55–65%",note:"+ Humidification externe quotidienne J10–J31"},{label:"J33–J35",temp:"37.0–37.5°C",hum:"70–75%",note:"↓ Baisser température + ↑ Humidité"}],
    tips:[
      {day:1,text:"Le Barbarie dure 35 jours, pas 28 comme le canard domestique. Ne pas confondre ! Préchauffer 24h à 37.2–37.7°C, humidité 55–65%."},
      {day:10,text:"1er mirage. Commencer l'humidification externe quotidienne."},
      {day:10,text:"Humidification externe (J10–J31) : vaporiser avec de l'eau tiède, laisser refroidir 15–30 min à l'air, puis remettre."},
      {day:21,text:"2e mirage. Continuer l'humidification externe."},
      {day:32,text:"Arrêter le retournement ET l'humidification externe. Baisser à 37.0–37.5°C. Augmenter l'humidité à 70–75%."},
      {day:33,text:"Les canetons commencent à piquer. NE PAS ouvrir l'incubateur !"},
      {day:35,text:"Éclosion ! Laisser sécher 12–24h."},
    ],
    specialTips:["35 jours d'incubation — ne pas confondre avec le canard domestique (28 jours) !","Taux d'éclosion acceptable : 60–75%."],
  },
  dinde:{ name:"Dinde",icon:"",days:28,mirage:[10,20],stopTurn:25,turnsPerDay:3,turnHours:["06h00","14h00","22h00"],youngName:"dindonneaux",minRate:65,eclosionStart:28,eclosionWindow:[28,30],
    phases:[{label:"J1–J25",temp:"37.2–37.7°C",hum:"55–60%",note:""},{label:"J26–J28",temp:"37.0–37.5°C",hum:"65–70%",note:"↓ Baisser température + ↑ Humidité"}],
    tips:[
      {day:1,text:"Préchauffer 24h à 37.2–37.7°C. Les œufs de dinde sont grands — vérifier l'espace entre clayettes. Humidité : 55–60%."},
      {day:10,text:"1er mirage : les embryons sont bien visibles à J10. Retirer les œufs clairs. Voir tutoriel dans Formations."},
      {day:20,text:"2e mirage : la chambre d'air doit occuper environ 1/3 de l'œuf."},
      {day:25,text:"Arrêter le retournement. Baisser à 37.0–37.5°C. Augmenter l'humidité à 65–70%."},
      {day:26,text:"Les dindonneaux commencent à piquer. NE PAS ouvrir l'incubateur ! Ne jamais forcer l'éclosion."},
      {day:28,text:"Éclosion ! Laisser sécher 12–24h dans l'incubateur."},
    ],
    specialTips:["Ne jamais aider un dindonneau à sortir de sa coquille.","Taux d'éclosion acceptable : 65–80%."],
  },
  pintade:{ name:"Pintade",icon:"",days:26,mirage:[7,14],stopTurn:23,turnsPerDay:3,turnHours:["06h00","14h00","22h00"],youngName:"pintadeaux",minRate:50,eclosionStart:26,eclosionWindow:[26,28],
    phases:[{label:"J1–J23",temp:"37.2–37.7°C",hum:"55–60%",note:""},{label:"J24–J26",temp:"37.0–37.5°C",hum:"65–70%",note:"↓ Baisser température + ↑ Humidité"}],
    tips:[
      {day:1,text:"Préchauffer 24h à 37.2–37.7°C. La coquille de pintade est épaisse — prévoir des grilles robustes. Humidité : 55–60%."},
      {day:7,text:"1er mirage : utiliser une lampe puissante dans une pièce sombre. Voir tutoriel dans Formations."},
      {day:14,text:"2e mirage : les œufs fécondés doivent être très foncés."},
      {day:23,text:"Arrêter le retournement. Baisser à 37.0–37.5°C. Augmenter l'humidité à 65–70%."},
      {day:24,text:"Les pintadeaux commencent à piquer. NE PAS ouvrir l'incubateur ! Ne jamais aider un pintadeau à sortir."},
      {day:26,text:"Éclosion ! Laisser sécher 12–24h. Démarrage dans un environnement calme."},
    ],
    specialTips:["Taux d'éclosion naturellement plus bas (50–70%) — c'est normal.","L'humidité en phase d'éclosion est le facteur le plus critique pour la pintade."],
  },
};

const AMBIENT_TEMPS = [
  {id:"standard",label:"35°C et moins",icon:"",color:"#1558A8",bg:"#EBF2FC",tempDelta:0,humDelta:0,mode:null},
  {id:"chaud",label:"36–38°C",icon:"",color:"#E8660A",bg:"#FFF3EC",tempDelta:-0.3,humDelta:4,mode:"chaud"},
  {id:"extreme",label:"39°C et plus",icon:"",color:"#C0392B",bg:"#FDECEA",tempDelta:-0.5,humDelta:5,mode:"extreme"},
];

function adaptTemp(str,delta){ if(!delta)return str; const s=str.replace("°C","").trim(); if(s.includes("–")){const[a,b]=s.split("–");return`${(parseFloat(a)+delta).toFixed(1)}–${(parseFloat(b)+delta).toFixed(1)}°C`;}return`${(parseFloat(s)+delta).toFixed(1)}°C`; }
function adaptHum(str,delta){ if(!delta)return str; const s=str.replace("%","").trim(); if(s.includes("–")){const[a,b]=s.split("–");return`${Math.round(parseFloat(a)+delta)}–${Math.round(parseFloat(b)+delta)}%`;}return`${Math.round(parseFloat(s)+delta)}%`; }
function adaptPhases(phases,ambientId){ const at=AMBIENT_TEMPS.find(a=>a.id===ambientId); if(!at||!at.tempDelta)return phases; return phases.map(p=>({...p,temp:adaptTemp(p.temp,at.tempDelta),hum:adaptHum(p.hum,at.humDelta)})); }

// ═══════════════════════════════════════════
//  DONNÉES — MALADIES
// ═══════════════════════════════════════════

const SYMPTOM_CATS=[
  {id:"digestifs",label:"Digestifs"},
  {id:"respiratoires",label:"Respiratoires"},
  {id:"neurologiques",label:"Neurologiques"},
  {id:"generaux",label:"Généraux"},
  {id:"yeux_tete",label:"Yeux / Tête"},
  {id:"ponte",label:"Ponte"},
  {id:"peau_bec",label:"Peau / Bec"},
];
const SYMPTOMS_V2=[
  {id:"diarrhee",label:"Diarrhée",cat:"digestifs"},{id:"diarrhee_sanglante",label:"Diarrhée sanglante",cat:"digestifs"},
  {id:"diarrhee_blanche",label:"Diarrhée blanche",cat:"digestifs"},{id:"diarrhee_verte",label:"Diarrhée verte",cat:"digestifs"},
  {id:"diarrhee_jaune",label:"Diarrhée jaune-verte",cat:"digestifs"},{id:"perte_appetit",label:"Perte d'appétit",cat:"digestifs"},
  {id:"resp",label:"Difficulté respiratoire",cat:"respiratoires"},{id:"ecoulement_nasal",label:"Écoulement nasal",cat:"respiratoires"},
  {id:"eternuements",label:"Éternuements",cat:"respiratoires"},{id:"toux",label:"Toux",cat:"respiratoires"},
  {id:"resp_bouche",label:"Respiration bouche ouverte",cat:"respiratoires"},{id:"craquements",label:"Craquements / sifflements",cat:"respiratoires"},
  {id:"paralysie",label:"Paralysie / Tremblements",cat:"neurologiques"},{id:"boiterie",label:"Boiterie",cat:"neurologiques"},
  {id:"mortalite_soudaine",label:"Mortalités soudaines",cat:"neurologiques"},{id:"mort_masse",label:"Mort en masse",cat:"neurologiques"},
  {id:"plumes_eboriffees",label:"Plumes ébouriffées",cat:"generaux"},{id:"amaigrissement",label:"Amaigrissement",cat:"generaux"},
  {id:"retard_croissance",label:"Retard de croissance",cat:"generaux"},{id:"deshydratation",label:"Déshydratation",cat:"generaux"},
  {id:"abattement",label:"Abattement / faiblesse",cat:"generaux"},
  {id:"yeux_larmoyants",label:"Yeux larmoyants / troubles",cat:"yeux_tete"},{id:"yeux_gonfles",label:"Yeux gonflés / collés",cat:"yeux_tete"},
  {id:"gonflement_tete",label:"Gonflement tête / cou",cat:"yeux_tete"},{id:"crete_bleue",label:"Crête bleue / noire",cat:"yeux_tete"},
  {id:"baisse_ponte",label:"Baisse de ponte",cat:"ponte"},{id:"oeufs_deformes",label:"Œufs déformés / coquilles molles",cat:"ponte"},
  {id:"lesions_peau",label:"Lésions / croûtes peau-crête-bec",cat:"peau_bec"},{id:"difficulte_manger",label:"Difficulté à manger / avaler",cat:"peau_bec"},
  {id:"chute_plumes",label:"Chute de plumes localisée",cat:"peau_bec"},
];
const DISEASES_V2=[
  {id:"newcastle",name:"Newcastle",severity:"Critique",color:"#C62828",special:null,
    symptoms:[{id:"mort_masse",w:10},{id:"diarrhee_verte",w:10},{id:"paralysie",w:5},{id:"resp",w:5},{id:"crete_bleue",w:5},{id:"mortalite_soudaine",w:2}],
    incompatible:[{id:"lesions_peau",p:5}],
    description:"C'est une maladie virale extrêmement contagieuse qui peut tuer la quasi-totalité d'un élevage en quelques jours. Elle se transmet facilement par contact direct, par l'air, les fientes ou le matériel contaminé. Elle touche toutes les volailles sans exception.",
    prevention:"Vacciner régulièrement (La Sota, Hitchner B1). Maintenir une biosécurité stricte.",
    actions:["Isoler immédiatement tous les oiseaux malades","Éviter tout mouvement d'animaux hors de l'élevage","Désinfecter le matériel et les locaux","Surveiller attentivement les oiseaux apparemment sains"],
    treatment:"Des vitamines et des électrolytes peuvent soutenir les oiseaux encore debout. Il n'existe pas de traitement curatif contre le virus.",
    vet_for:"Confirmer le diagnostic, évaluer l'étendue de la contamination et définir un protocole d'urgence adapté."},
  {id:"grippe_aviaire",name:"Grippe Aviaire",severity:"Critique",color:"#B71C1C",special:"grippe",
    symptoms:[{id:"mort_masse",w:10},{id:"crete_bleue",w:10},{id:"gonflement_tete",w:10},{id:"mortalite_soudaine",w:5},{id:"resp",w:5},{id:"diarrhee_verte",w:2}],
    incompatible:[{id:"lesions_peau",p:5}],
    description:"C'est une maladie virale très grave et très contagieuse. Elle peut provoquer la mort brutale de nombreux oiseaux en très peu de temps, parfois sans aucun signe visible préalable.",
    prevention:"Éviter tout contact avec les oiseaux sauvages. Biosécurité maximale.",
    actions:["Isoler immédiatement tous les oiseaux malades","Ne toucher les cadavres qu'avec gants et masque","Éviter tout mouvement d'animaux","Contacter immédiatement un vétérinaire"],
    treatment:"Il n'existe pas de traitement curatif. Des vitamines peuvent soutenir les oiseaux les moins atteints.",
    vet_for:"Confirmer le diagnostic et prendre les dispositions nécessaires pour votre élevage."},
  {id:"gumboro",name:"Gumboro (IBD)",severity:"Élevée",color:"#E53935",special:null,
    symptoms:[{id:"diarrhee_blanche",w:10},{id:"perte_appetit",w:5},{id:"plumes_eboriffees",w:5},{id:"amaigrissement",w:2},{id:"retard_croissance",w:2}],
    incompatible:[{id:"lesions_peau",p:5},{id:"gonflement_tete",p:5}],
    description:"C'est une maladie virale qui détruit le système immunitaire des jeunes poussins entre 2 et 6 semaines d'âge. Un oiseau qui a eu Gumboro devient très fragile et attrape facilement d'autres maladies.",
    prevention:"Vacciner à J14 et J28. Maintenir une hygiène stricte.",
    actions:["Isoler les oiseaux malades","Améliorer la ventilation","Donner de l'eau propre en permanence"],
    treatment:"Vitamines et électrolytes dans l'eau. Il n'existe pas de traitement direct contre le virus.",
    vet_for:"Confirmer le diagnostic et définir un plan de vaccination adapté."},
  {id:"coccidiose",name:"Coccidiose",severity:"Modérée",color:"#F57C00",special:null,
    symptoms:[{id:"diarrhee_sanglante",w:10},{id:"amaigrissement",w:5},{id:"deshydratation",w:5},{id:"diarrhee",w:2},{id:"retard_croissance",w:2}],
    incompatible:[{id:"ecoulement_nasal",p:4},{id:"gonflement_tete",p:4}],
    description:"C'est une maladie parasitaire très courante qui touche l'intestin des volailles. Elle se développe dans les litières humides et mal entretenues. La diarrhée sanglante est le signe le plus caractéristique.",
    prevention:"Garder la litière toujours sèche. Utiliser un coccidiostat préventif.",
    actions:["Assainir et sécher la litière immédiatement","Isoler les oiseaux très affaiblis","Ajouter des vitamines A et K dans l'eau"],
    treatment:"Administrer de l'Amprolium ou du Toltrazuril pendant 5 jours.",
    vet_for:"Confirmer le diagnostic, choisir le bon anticoccidien et déterminer la durée du traitement."},
  {id:"marek",name:"Maladie de Marek",severity:"Élevée",color:"#E53935",special:null,
    symptoms:[{id:"paralysie",w:10},{id:"amaigrissement",w:10},{id:"yeux_larmoyants",w:5},{id:"boiterie",w:5},{id:"retard_croissance",w:2}],
    incompatible:[{id:"gonflement_tete",p:5},{id:"ecoulement_nasal",p:4}],
    description:"C'est une maladie virale qui provoque la paralysie progressive des pattes, des ailes ou du cou. Elle peut aussi causer des tumeurs internes. Elle touche surtout les jeunes oiseaux non vaccinés.",
    prevention:"Vacciner tous les poussins dès l'éclosion. Toujours acheter des poussins vaccinés.",
    actions:["Isoler les oiseaux paralysés","Faciliter l'accès à l'eau et à la nourriture"],
    treatment:"Des vitamines du groupe B peuvent soutenir le système nerveux. Il n'existe pas de traitement curatif.",
    vet_for:"Confirmer le diagnostic et évaluer si un abattage sanitaire partiel est nécessaire."},
  {id:"pullorose",name:"Pullorose / Typhose",severity:"Élevée",color:"#E53935",special:null,
    symptoms:[{id:"diarrhee_blanche",w:10},{id:"mortalite_soudaine",w:10},{id:"boiterie",w:5},{id:"perte_appetit",w:5},{id:"amaigrissement",w:2}],
    incompatible:[{id:"lesions_peau",p:5}],
    description:"C'est une infection bactérienne causée par une Salmonella. Elle touche surtout les jeunes poussins et se reconnaît par la diarrhée blanche caractéristique. Elle se transmet par les œufs ou la litière contaminée.",
    prevention:"Acheter des poussins certifiés sains. Hygiène stricte des locaux.",
    actions:["Isoler immédiatement les oiseaux malades","Désinfecter les locaux et le matériel"],
    treatment:"Administrer des antibiotiques sous prescription vétérinaire.",
    vet_for:"Identifier la bactérie, choisir l'antibiotique le plus efficace et définir la durée du traitement."},
  {id:"mycoplasmose",name:"Mycoplasmose",severity:"Modérée",color:"#F57C00",special:null,
    symptoms:[{id:"ecoulement_nasal",w:10},{id:"eternuements",w:10},{id:"toux",w:5},{id:"resp",w:5},{id:"yeux_larmoyants",w:2},{id:"baisse_ponte",w:2}],
    incompatible:[{id:"diarrhee_sanglante",p:4},{id:"paralysie",p:4}],
    description:"C'est une infection bactérienne chronique des voies respiratoires. Elle s'installe progressivement et affaiblit durablement l'élevage. Les oiseaux éternuent, ont le nez qui coule et respirent difficilement.",
    prevention:"Assurer une bonne ventilation sans courant d'air. Éviter la surpopulation.",
    actions:["Améliorer immédiatement la ventilation","Réduire la densité si possible","Ajouter des vitamines dans l'eau"],
    treatment:"Administrer des antibiotiques sous prescription (Tylosine, Enrofloxacine ou Doxycycline).",
    vet_for:"Identifier la souche et choisir l'antibiotique le plus efficace."},
  {id:"coryza",name:"Coryza Infectieux",severity:"Élevée",color:"#E53935",special:null,
    symptoms:[{id:"gonflement_tete",w:10},{id:"yeux_gonfles",w:10},{id:"ecoulement_nasal",w:10},{id:"eternuements",w:5},{id:"resp",w:5}],
    incompatible:[{id:"paralysie",p:5},{id:"diarrhee_sanglante",p:5}],
    description:"C'est une infection bactérienne respiratoire très contagieuse. Le gonflement du visage, les yeux collés et l'écoulement nasal parfois malodorant sont les signes les plus caractéristiques.",
    prevention:"Mettre en quarantaine tout nouvel oiseau. Bonne ventilation.",
    actions:["Isoler immédiatement les oiseaux malades","Nettoyer les yeux et le bec avec de l'eau tiède propre"],
    treatment:"Administrer des antibiotiques sous prescription vétérinaire.",
    vet_for:"Identifier la bactérie, choisir l'antibiotique et évaluer si une vaccination est envisageable."},
  {id:"bronchite",name:"Bronchite Infectieuse",severity:"Modérée",color:"#F57C00",special:null,
    symptoms:[{id:"baisse_ponte",w:10},{id:"toux",w:10},{id:"resp",w:5},{id:"eternuements",w:5},{id:"oeufs_deformes",w:5},{id:"ecoulement_nasal",w:2}],
    incompatible:[{id:"diarrhee_sanglante",p:4},{id:"paralysie",p:4}],
    description:"C'est une maladie virale respiratoire qui provoque une chute brutale de la ponte. Les œufs produits sont souvent déformés, à coquille molle.",
    prevention:"Vacciner régulièrement. Ventilation sans courant d'air.",
    actions:["Améliorer la ventilation","Réduire le stress","Donner des vitamines dans l'eau"],
    treatment:"Des vitamines pour soutenir les oiseaux. Antibiotiques pour prévenir les infections secondaires.",
    vet_for:"Confirmer le diagnostic et établir un plan de vaccination."},
  {id:"variole",name:"Variole Aviaire",severity:"Modérée",color:"#F57C00",special:null,
    symptoms:[{id:"lesions_peau",w:10},{id:"difficulte_manger",w:5},{id:"chute_plumes",w:2},{id:"baisse_ponte",w:2}],
    incompatible:[{id:"diarrhee_sanglante",p:5},{id:"paralysie",p:5}],
    description:"C'est une maladie virale qui provoque des croûtes visibles sur la peau, la crête et parfois à l'intérieur du bec. Elle se transmet via les moustiques.",
    prevention:"Vacciner préventivement. Lutter contre les moustiques.",
    actions:["Isoler les oiseaux atteints","Appliquer un antiseptique sur les croûtes","Donner des vitamines"],
    treatment:"Solution antiseptique sur les lésions. Vitamines A et E.",
    vet_for:"Confirmer le diagnostic et traiter les formes internes (diphtérique)."},
  {id:"cholera",name:"Choléra Aviaire",severity:"Élevée",color:"#E53935",special:null,
    symptoms:[{id:"mortalite_soudaine",w:10},{id:"mort_masse",w:10},{id:"diarrhee_verte",w:5},{id:"resp",w:5},{id:"crete_bleue",w:5}],
    incompatible:[{id:"lesions_peau",p:5}],
    description:"C'est une maladie bactérienne grave qui peut provoquer des morts brutales et en grand nombre. Elle touche toutes les volailles et se transmet par l'eau contaminée.",
    prevention:"Biosécurité stricte. Contrôle des rongeurs.",
    actions:["Isoler les malades et ramasser les cadavres avec gants","Désinfecter immédiatement","Contrôler les rongeurs"],
    treatment:"Administrer des antibiotiques sous prescription vétérinaire.",
    vet_for:"Confirmer le diagnostic et définir d'urgence un protocole antibiotique."},
  {id:"aspergillose",name:"Aspergillose",severity:"Élevée",color:"#E53935",special:null,
    symptoms:[{id:"resp_bouche",w:10},{id:"craquements",w:10},{id:"resp",w:5},{id:"amaigrissement",w:2}],
    incompatible:[{id:"diarrhee_sanglante",p:5},{id:"lesions_peau",p:5}],
    description:"C'est une infection causée par des champignons qui se développent dans les litières humides et moisies ou les aliments mal conservés. Elle n'est pas contagieuse d'un oiseau à l'autre.",
    prevention:"Ne jamais utiliser de litière moisie. Bien conserver les aliments au sec.",
    actions:["Retirer et remplacer toute litière suspecte","Éliminer les aliments potentiellement contaminés","Améliorer la ventilation"],
    treatment:"L'assainissement total de l'environnement est la priorité absolue.",
    vet_for:"Confirmer le diagnostic et évaluer si un traitement antifongique est envisageable."},
  {id:"colibacillose",name:"Colibacillose",severity:"Modérée",color:"#F57C00",special:null,
    symptoms:[{id:"resp",w:5},{id:"diarrhee",w:5},{id:"perte_appetit",w:2},{id:"abattement",w:2},{id:"baisse_ponte",w:2}],
    incompatible:[{id:"paralysie",p:4},{id:"lesions_peau",p:4}],
    description:"C'est une infection bactérienne très fréquente causée par la bactérie E. coli. Elle survient souvent quand les oiseaux sont stressés ou dans de mauvaises conditions d'hygiène.",
    prevention:"Hygiène stricte des locaux. Réduire le stress.",
    actions:["Améliorer l'hygiène générale","Réduire les sources de stress","Donner de l'eau propre et fraîche"],
    treatment:"Administrer des antibiotiques sous prescription vétérinaire.",
    vet_for:"Identifier la souche d'E. coli et définir le traitement le plus adapté."},
  {id:"enterite",name:"Entérite Ulcéreuse",severity:"Critique",color:"#C62828",special:null,
    symptoms:[{id:"mortalite_soudaine",w:10},{id:"diarrhee",w:5},{id:"plumes_eboriffees",w:5},{id:"amaigrissement",w:2}],
    incompatible:[{id:"ecoulement_nasal",p:4},{id:"gonflement_tete",p:4}],
    description:"C'est une maladie bactérienne grave qui touche l'intestin des volailles, particulièrement les cailles. Elle peut provoquer des morts soudaines et en série.",
    prevention:"Réduire le stress. Hygiène stricte. Éviter la surpopulation.",
    actions:["Isoler les oiseaux malades","Améliorer l'hygiène","Réduire le stress"],
    treatment:"Administrer des antibiotiques sous prescription vétérinaire.",
    vet_for:"Confirmer le diagnostic et définir un protocole urgent."},
  {id:"histomonose",name:"Histomonose",severity:"Élevée",color:"#E53935",special:null,
    symptoms:[{id:"diarrhee_jaune",w:10},{id:"abattement",w:5},{id:"amaigrissement",w:5},{id:"mortalite_soudaine",w:2}],
    incompatible:[{id:"ecoulement_nasal",p:4},{id:"lesions_peau",p:4}],
    description:"C'est une maladie parasitaire grave qui touche surtout les cailles et les dindes. La diarrhée jaune-verte et l'abattement profond sont les signes les plus caractéristiques.",
    prevention:"Séparer les cailles des dindes. Hygiène stricte de la litière.",
    actions:["Isoler immédiatement les oiseaux malades","Séparer les espèces si mélangées"],
    treatment:"Isolement strict. Traitement selon la réglementation vétérinaire locale.",
    vet_for:"Confirmer le diagnostic et définir un traitement antiparasitaire adapté."},
];

function diagnose(selected){
  if(!selected.length)return[];
  return DISEASES_V2.map(d=>{
    let score=0; const maxScore=d.symptoms.reduce((s,sym)=>s+sym.w,0);
    d.symptoms.forEach(sym=>{if(selected.includes(sym.id))score+=sym.w;});
    d.incompatible?.forEach(inc=>{if(selected.includes(inc.id))score-=inc.p;});
    score=Math.max(0,score);
    const pct=maxScore>0?Math.round(score/maxScore*100):0;
    return{...d,score,maxScore,pct};
  }).filter(d=>d.score>0&&d.pct>=10).sort((a,b)=>b.pct-a.pct).slice(0,3);
}

// ═══════════════════════════════════════════
//  DONNÉES — FORMULE ALIMENTAIRE
// ═══════════════════════════════════════════

const INGREDIENT_CATS=[
  {id:"energetique",label:"Énergétiques",color:"#E8660A"},
  {id:"proteine_veg",label:"Protéiques végétaux",color:"#2A7A40"},
  {id:"proteine_ani",label:"Protéiques animaux",color:"#1558A8"},
  {id:"mineral",label:"Minéraux",color:"#6B21A8"},
  {id:"additif",label:"Additifs",color:"#5C7052"},
  {id:"concentre",label:"Concentrés",color:"#B8560A"},
];

const INGREDIENTS=[
  // Energétiques
  {id:"mais",name:"Maïs",family:"energetique",protein:8.5,energy:3300,calcium:0.02,phosphorus:0.30,methionine:0.1,lysine:0.24,maxPct:100,defaultPct:null},
  {id:"sorgho",name:"Sorgho",family:"energetique",protein:10,energy:3310,calcium:0.03,phosphorus:0.30,methionine:0.14,lysine:0.20,maxPct:100,defaultPct:null},
  {id:"son_ble",name:"Son de blé",family:"energetique",protein:15.99,energy:1440,calcium:0.14,phosphorus:1.3,methionine:0.23,lysine:0.58,maxPct:15,defaultPct:null},
  {id:"son_riz",name:"Son de riz",family:"energetique",protein:9.7,energy:2950,calcium:0.07,phosphorus:1.4,methionine:0.22,lysine:0.56,maxPct:15,defaultPct:null},
  {id:"son_mais",name:"Son de maïs",family:"energetique",protein:10.01,energy:2228,calcium:0.03,phosphorus:0.23,methionine:0.5,lysine:0.25,maxPct:15,defaultPct:null},
  {id:"mil",name:"Mil",family:"energetique",protein:10.5,energy:3100,calcium:0.03,phosphorus:0.30,methionine:0.19,lysine:0.24,maxPct:100,defaultPct:null},
  {id:"manioc",name:"Manioc (farine)",family:"energetique",protein:2.5,energy:3300,calcium:0.10,phosphorus:0.10,methionine:0.02,lysine:0.10,maxPct:100,defaultPct:null},
  {id:"huile_vegetale",name:"Huile végétale",family:"energetique",protein:0,energy:8800,calcium:0,phosphorus:0,methionine:0,lysine:0,maxPct:5,defaultPct:null},
  {id:"huile_rouge",name:"Huile rouge (palme)",family:"energetique",protein:0,energy:7040,calcium:0,phosphorus:0,methionine:0,lysine:0,maxPct:5,defaultPct:null},
  // Protéiques végétaux
  {id:"tourteau_soja",name:"Tourteau de soja (42–44%)",family:"proteine_veg",protein:43,energy:2420,calcium:0.34,phosphorus:0.7,methionine:0.6,lysine:2.7,maxPct:30,defaultPct:null},
  {id:"tourteau_arachide",name:"Tourteau d'arachide",family:"proteine_veg",protein:46,energy:2600,calcium:0.20,phosphorus:0.60,methionine:0.45,lysine:1.55,maxPct:15,defaultPct:null},
  {id:"tourteau_coton",name:"Tourteau de coton",family:"proteine_veg",protein:39,energy:2100,calcium:0.20,phosphorus:1.10,methionine:0.55,lysine:1.65,maxPct:10,defaultPct:null},
  {id:"tourteau_palmiste",name:"Tourteau de palmiste",family:"proteine_veg",protein:16,energy:2368,calcium:0.3,phosphorus:0.6,methionine:0.3,lysine:0.6,maxPct:10,defaultPct:null},
  {id:"tourteau_tournesol",name:"Tourteau de tournesol",family:"proteine_veg",protein:30,energy:1900,calcium:0.40,phosphorus:1.00,methionine:0.65,lysine:1.05,maxPct:10,defaultPct:null},
  {id:"niebe",name:"Niébé (haricot local)",family:"proteine_veg",protein:23,energy:3100,calcium:0.10,phosphorus:0.40,methionine:0.30,lysine:1.50,maxPct:10,defaultPct:null},
  {id:"soja_torrefie",name:"Soja graine torréfié",family:"proteine_veg",protein:37,energy:3900,calcium:0.25,phosphorus:0.57,methionine:0.52,lysine:2.35,maxPct:20,defaultPct:null},
  // Protéiques animaux
  {id:"farine_poisson_60",name:"Farine de poisson (60%)",family:"proteine_ani",protein:62,energy:3000,calcium:3.50,phosphorus:2.50,methionine:1.70,lysine:4.70,maxPct:10,defaultPct:null},
  {id:"farine_poisson_50",name:"Farine de poisson (50%)",family:"proteine_ani",protein:50,energy:2800,calcium:4.00,phosphorus:2.80,methionine:1.40,lysine:3.80,maxPct:10,defaultPct:null},
  {id:"farine_poisson_artisanale",name:"Farine de poisson artisanale (résidus)",family:"proteine_ani",protein:46,energy:2820,calcium:5,phosphorus:2.6,methionine:1.3,lysine:3.5,maxPct:8,defaultPct:null},
  {id:"farine_viande",name:"Farine de viande et os",family:"proteine_ani",protein:47,energy:2350,calcium:9.00,phosphorus:4.50,methionine:0.65,lysine:2.50,maxPct:5,defaultPct:null},
  // Minéraux
  {id:"coquilles",name:"Coquilles d'huîtres",family:"mineral",protein:0,energy:0,calcium:38,phosphorus:0.05,methionine:0,lysine:0,maxPct:8,defaultPct:null},
  {id:"calcaire",name:"Calcaire agricole",family:"mineral",protein:0,energy:0,calcium:37,phosphorus:0.02,methionine:0,lysine:0,maxPct:8,defaultPct:null},
  {id:"farine_os",name:"Farine d'os",family:"mineral",protein:0,energy:0,calcium:26,phosphorus:13,methionine:0,lysine:0,maxPct:3,defaultPct:null},
  {id:"phosphate_bi",name:"Phosphate bicalcique",family:"mineral",protein:0,energy:0,calcium:18,phosphorus:18,methionine:0,lysine:0,maxPct:2,defaultPct:null},
  // Concentrés
  {id:"concentre_chair",name:"Concentré chair",family:"concentre",protein:45,energy:2400,calcium:7,phosphorus:4.5,methionine:2,lysine:3,maxPct:5,defaultPct:null},
  {id:"concentre_ponte",name:"Concentré ponte",family:"concentre",protein:45,energy:2300,calcium:7,phosphorus:4.5,methionine:1.7,lysine:2.5,maxPct:5,defaultPct:null},
  // Additifs
  {id:"premix",name:"Prémix vitamines-minéraux",family:"additif",protein:0,energy:0,calcium:0,phosphorus:0,methionine:0,lysine:0,maxPct:0.5,defaultPct:0.5},
  {id:"sel",name:"Sel (NaCl)",family:"additif",protein:0,energy:0,calcium:0,phosphorus:0,methionine:0,lysine:0,maxPct:0.3,defaultPct:0.25},
  {id:"methionine",name:"Méthionine",family:"additif",protein:58.7,energy:4950,calcium:0.02,phosphorus:0,methionine:99,lysine:0,maxPct:0.2,defaultPct:null},
  {id:"lysine",name:"Lysine",family:"additif",protein:95.6,energy:3870,calcium:0.04,phosphorus:0,methionine:0,lysine:78.4,maxPct:0.3,defaultPct:null},
];

const FEED_TARGETS={
  poulet_chair_demarrage:{label:"Poulet de chair — Démarrage (0–3 semaines)",protein:23,energy:3100,calcium:1.0,phosphorus:0.45,methionine:0.50,lysine:1.10},
  poulet_chair_croissance:{label:"Poulet de chair — Croissance (3–6 semaines)",protein:20,energy:3200,calcium:0.9,phosphorus:0.40,methionine:0.42,lysine:0.95},
  poulet_chair_finition:{label:"Poulet de chair — Finition (6+ semaines)",protein:18,energy:3300,calcium:0.8,phosphorus:0.35,methionine:0.38,lysine:0.85},
  pondeuse_demarrage:{label:"Pondeuse — Démarrage poussin (0–8 sem.)",protein:21,energy:3000,calcium:0.9,phosphorus:0.40,methionine:0.45,lysine:1.00},
  pondeuse_poulette:{label:"Pondeuse — Poulette (8–18 sem.)",protein:16,energy:2800,calcium:0.9,phosphorus:0.35,methionine:0.32,lysine:0.68},
  pondeuse_ponte:{label:"Pondeuse — Ponte",protein:17,energy:2800,calcium:3.8,phosphorus:0.35,methionine:0.38,lysine:0.75},
  // Caille — Chair (extrapolation raisonnée, pas de source terrain spécifique)
  caille_chair_demarrage:{label:"Caille chair — Démarrage (0–3 sem.)",protein:25,energy:3000,calcium:0.8,phosphorus:0.45,methionine:0.55,lysine:1.25},
  caille_chair_croissance:{label:"Caille chair — Croissance (3–6 sem.)",protein:22,energy:3050,calcium:0.75,phosphorus:0.42,methionine:0.48,lysine:1.05},
  caille_chair_finition:{label:"Caille chair — Finition (6 sem.+)",protein:20,energy:3100,calcium:0.7,phosphorus:0.40,methionine:0.42,lysine:0.90},
  // Caille — Ponte (extrapolation raisonnée)
  caille_ponte_demarrage:{label:"Caille ponte — Démarrage ponte (0–6 sem.)",protein:25,energy:3000,calcium:0.8,phosphorus:0.45,methionine:0.55,lysine:1.25},
  caille_ponte_croissance:{label:"Caille ponte — Croissance ponte (7–17 sem.)",protein:18,energy:2950,calcium:1.5,phosphorus:0.38,methionine:0.35,lysine:0.70},
  caille_ponte_aliment:{label:"Caille ponte — Aliment ponte (18 sem.+)",protein:21,energy:2900,calcium:2.75,phosphorus:0.35,methionine:0.42,lysine:0.90},
  // Goliath — Chair (source : recherche recoupée youtube/scribd/facebook)
  goliath_chair_demarrage:{label:"Goliath chair — Démarrage (1–4 sem.)",protein:22.5,energy:3100,calcium:1.05,phosphorus:0.525,methionine:0.46,lysine:1.07},
  goliath_chair_croissance:{label:"Goliath chair — Croissance (5–8 sem.)",protein:20,energy:3190,calcium:0.95,phosphorus:0.45,methionine:0.40,lysine:0.90},
  goliath_chair_finition:{label:"Goliath chair — Finition (9–12 sem.)",protein:18.5,energy:3300,calcium:0.85,phosphorus:0.40,methionine:0.35,lysine:0.75},
  // Goliath — Ponte (énergie/protéines : données terrain éleveur spécialisé ; calcium/phosphore/lysine/méthionine : recherche recoupée)
  goliath_ponte_demarrage:{label:"Goliath ponte — Démarrage ponte (0–6 sem.)",protein:20,energy:2970,calcium:1.05,phosphorus:0.525,methionine:0.46,lysine:1.07},
  goliath_ponte_croissance:{label:"Goliath ponte — Croissance ponte (7–20 sem.)",protein:13.5,energy:2826,calcium:1.45,phosphorus:0.45,methionine:0.375,lysine:0.85},
  goliath_ponte_aliment:{label:"Goliath ponte — Aliment ponte (21–72 sem.)",protein:16,energy:1900,calcium:3.75,phosphorus:0.475,methionine:0.515,lysine:0.89},
};

const FEED_TYPE_PHASES={
  poulet_chair:{label:"Poulet de chair",phases:[{id:"poulet_chair_demarrage",label:"Démarrage (0–3 sem.)"},{id:"poulet_chair_croissance",label:"Croissance (3–6 sem.)"},{id:"poulet_chair_finition",label:"Finition (6+ sem.)"}]},
  pondeuse:{label:"Pondeuse",phases:[{id:"pondeuse_demarrage",label:"Démarrage poussin (0–8 sem.)"},{id:"pondeuse_poulette",label:"Poulette (8–18 sem.)"},{id:"pondeuse_ponte",label:"Ponte"}]},
  caille_chair:{label:"Caille chair",phases:[{id:"caille_chair_demarrage",label:"Démarrage (0–3 sem.)"},{id:"caille_chair_croissance",label:"Croissance (3–6 sem.)"},{id:"caille_chair_finition",label:"Finition (6 sem.+)"}]},
  caille_ponte:{label:"Caille ponte",phases:[{id:"caille_ponte_demarrage",label:"Démarrage ponte (0–6 sem.)"},{id:"caille_ponte_croissance",label:"Croissance ponte (7–17 sem.)"},{id:"caille_ponte_aliment",label:"Aliment ponte (18 sem.+)"}]},
  goliath_chair:{label:"Goliath chair",phases:[{id:"goliath_chair_demarrage",label:"Démarrage (1–4 sem.)"},{id:"goliath_chair_croissance",label:"Croissance (5–8 sem.)"},{id:"goliath_chair_finition",label:"Finition (9–12 sem.)"}]},
  goliath_ponte:{label:"Goliath ponte",phases:[{id:"goliath_ponte_demarrage",label:"Démarrage ponte (0–6 sem.)"},{id:"goliath_ponte_croissance",label:"Croissance ponte (7–20 sem.)"},{id:"goliath_ponte_aliment",label:"Aliment ponte (21–72 sem.)"}]},
};

// Teneur maximale théorique d'un nutriment atteignable avec les ingrédients
// sélectionnés. Par défaut, chacun est poussé jusqu'à son dosage maximal
// recommandé (les plus concentrés étant priorisés). Les ingrédients listés
// dans relaxIds (naturels : protéiques, minéraux) peuvent être poussés
// jusqu'à 100% pour évaluer la limite physique absolue — jamais les additifs
// de synthèse (prémix, sel, méthionine/lysine pures), dont le dosage reste
// un plafond de sécurité strict.
function theoreticalMaxNutrient(ingredients,key,relaxIds=EMPTY_SET){
  const sorted=[...ingredients].sort((a,b)=>(b[key]||0)-(a[key]||0));
  let budget=100,total=0;
  for(const ing of sorted){
    if(budget<=0)break;
    const cap=relaxIds.has(ing.id)?100:ing.maxPct;
    const take=Math.min(cap,budget);
    total+=take*(ing[key]||0)/100;
    budget-=take;
  }
  return total;
}
const EMPTY_SET=new Set();

// Un paramètre de FEED_TARGETS peut être soit une valeur unique (nombre),
// soit un intervalle {min,max} quand la source fournit une vraie fourchette.
// Ces trois utilitaires centralisent la lecture pour que le reste du code
// (alertes, affichage) n'ait pas à tester le type à chaque fois.
const isRange=v=>v!==null&&typeof v==="object";
const targetMin=v=>isRange(v)?v.min:v;
const targetMax=v=>isRange(v)?v.max:v;
const fmtTarget=(v,unit,dec=0)=>isRange(v)?`${targetMin(v).toFixed(dec).replace(/\.0+$/,"").replace(".",",")}–${targetMax(v).toFixed(dec).replace(/\.0+$/,"").replace(".",",")}${unit}`:`${v}${unit}`;

// Répartit un ensemble d'ingrédients pour atteindre une cible de nutriment,
// en priorisant les plus concentrés, dans la limite de leur dosage déjà
// utilisé (already), et en respectant le plafond recommandé sauf pour les
// ingrédients assouplissables (relaxIds).
function allocateForTarget(ingredients,key,targetPct,already={},relaxIds=EMPTY_SET){
  const sorted=[...ingredients].sort((a,b)=>(b[key]||0)-(a[key]||0));
  let achieved=0;
  const allocations={};
  for(const ing of sorted){
    const cap=relaxIds.has(ing.id)?100:ing.maxPct;
    const headroom=Math.max(0,cap-(already[ing.id]||0));
    if(achieved>=targetPct||headroom<=0)continue;
    const gap=targetPct-achieved;
    if(!(ing[key]>0))continue;
    const rawTake=gap*100/ing[key];
    // Ingrédient trop peu concentré pour combler l'écart restant dans son
    // dosage disponible : le pousser jusqu'à son plafond n'apporterait
    // qu'une contribution négligeable au nutriment visé, au prix d'un effet
    // de bord disproportionné sur ses autres teneurs (ex. une coquille très
    // calcique saturée pour un besoin résiduel de phosphore, qui fait
    // exploser le calcium sans réellement combler le phosphore). On l'ignore
    // dans ce cas plutôt que de la saturer inutilement.
    if(rawTake>headroom&&ing[key]<1)continue;
    const take=Math.min(headroom,rawTake);
    if(take>0){allocations[ing.id]=Math.round(take*100)/100;achieved+=take*(ing[key]||0)/100;}
  }
  return{allocations,achieved};
}

// Construit un mélange protéines + énergie pour une "part protéique" donnée
// (protShare = % du total consacré aux ingrédients protéiques). Les
// ingrédients protéiques listés dans relaxIds peuvent dépasser leur dosage
// recommandé si besoin (avec avertissement généré plus haut dans formuler()).
function buildProteinEnergyBlend(ani,veg,eng,protShare,totalBudget,relaxIds=EMPTY_SET){
  const protBudget=Math.max(0,Math.min(protShare,totalBudget));
  const protAlloc={};
  let protUsed=0;
  // Les protéines animales restent plafonnées à ~35% de la part protéique
  // (coût et disponibilité réels en petit élevage) — ce plafond d'équilibre
  // n'est pas assoupli, contrairement au dosage max par ingrédient.
  const aniCap=protBudget*0.35;
  let aniUsed=0;
  [...ani].sort((a,b)=>b.protein-a.protein).forEach(ing=>{
    if(aniUsed>=aniCap)return;
    const cap=relaxIds.has(ing.id)?100:ing.maxPct;
    const take=Math.min(cap,aniCap-aniUsed,protBudget-protUsed);
    if(take>0){protAlloc[ing.id]=Math.round(take*100)/100;aniUsed+=take;protUsed+=take;}
  });
  [...veg].sort((a,b)=>b.protein-a.protein).forEach(ing=>{
    if(protUsed>=protBudget)return;
    const cap=relaxIds.has(ing.id)?100:ing.maxPct;
    const take=Math.min(cap,protBudget-protUsed);
    if(take>0){protAlloc[ing.id]=Math.round(take*100)/100;protUsed+=take;}
  });
  const engBudget=Math.max(0,totalBudget-protUsed);
  const mainEng=eng.find(i=>i.id==="mais")||eng.find(i=>i.id==="sorgho")||eng.find(i=>i.id==="mil")||eng[0];
  // Seuls les énergétiques PLUS concentrés que le principal reçoivent
  // automatiquement une part du budget ici (ex. huile, en complément du
  // maïs). Un ingrédient moins énergétique que le principal (ex. son de riz
  // face au maïs) ne doit pas lui voler du budget : ça diluerait l'énergie
  // du mélange au lieu de la renforcer.
  const otherEng=[...eng.filter(i=>i.id!==mainEng.id&&i.energy>mainEng.energy)].sort((a,b)=>b.energy-a.energy);
  const engAlloc={};
  let otherUsed=0;
  otherEng.forEach(ing=>{
    const take=Math.min(ing.maxPct,engBudget*0.25,engBudget-otherUsed);
    if(take>0){engAlloc[ing.id]=Math.round(take*100)/100;otherUsed+=take;}
  });
  const mainTake=Math.max(0,Math.min(engBudget-otherUsed,mainEng.maxPct));
  engAlloc[mainEng.id]=Math.round(mainTake*100)/100;
  return{protAlloc,engAlloc,mainEngId:mainEng.id};
}

function blendProteinPct(protAlloc,engAlloc,allIngById){
  let p=0;
  Object.entries({...protAlloc,...engAlloc}).forEach(([id,pct])=>{p+=pct*(allIngById[id]?.protein||0)/100;});
  return p;
}

// Recherche par dichotomie de la part protéique du mélange qui approche au
// mieux la cible de protéines, sous contrainte des dosages max de chaque
// ingrédient (ou assoupli pour relaxIds). C'est le cœur de l'algorithme
// d'optimisation automatique des proportions : au lieu d'une formule fermée
// unique, on converge itérativement.
function optimizeProtShare(ani,veg,eng,targetProtein,totalBudget,allIngById,relaxIds=EMPTY_SET){
  let lo=0,hi=totalBudget;
  for(let it=0;it<20;it++){
    const mid=(lo+hi)/2;
    const{protAlloc,engAlloc}=buildProteinEnergyBlend(ani,veg,eng,mid,totalBudget,relaxIds);
    const p=blendProteinPct(protAlloc,engAlloc,allIngById);
    if(p<targetProtein)lo=mid;else hi=mid;
  }
  return hi;
}

function formuler(selectedIds, targetKey, quantityKg){
  const target=FEED_TARGETS[targetKey];
  const selected=INGREDIENTS.filter(i=>selectedIds.includes(i.id));
  const allIngById=Object.fromEntries(selected.map(i=>[i.id,i]));
  const byFam={
    energetique:selected.filter(i=>i.family==="energetique"),
    proteine_veg:selected.filter(i=>i.family==="proteine_veg"),
    proteine_ani:selected.filter(i=>i.family==="proteine_ani"),
    mineral:selected.filter(i=>i.family==="mineral"),
    additif:selected.filter(i=>i.family==="additif"),
    concentre:selected.filter(i=>i.family==="concentre"),
  };
  // Les concentrés (mélanges commerciaux tout-en-un) sont traités comme des
  // protéiques végétaux dans l'optimisation : pas de sous-plafond "animal",
  // simplement une source de protéines/minéraux supplémentaire à répartir.
  const vegLike=[...byFam.proteine_veg,...byFam.concentre];
  const allProteins=[...byFam.proteine_ani,...vegLike];
  const fixedAdditives=byFam.additif.filter(a=>a.id!=="methionine"&&a.id!=="lysine");
  const aminoAdditives={methionine:byFam.additif.find(a=>a.id==="methionine"),lysine:byFam.additif.find(a=>a.id==="lysine")};
  const alerts=[];

  // --- Blocages structurels : sans ces familles, aucune formule n'est possible ---
  if(!byFam.energetique.length){
    alerts.push({level:"critique",msg:"Aucune source d'énergie sélectionnée.",action:"Ajoutez au moins un ingrédient de la catégorie Énergétiques (maïs, sorgho, mil...).",consequence:"La formule ne peut pas être établie sans base énergétique."});
    return{formula:null,alerts,target};
  }
  if(!allProteins.length&&targetMin(target.protein)>14){
    alerts.push({level:"critique",msg:`Cette ration requiert ${fmtTarget(target.protein,"%",1)} de protéines.`,action:"Ajoutez au moins un ingrédient de la catégorie Protéiques végétaux, Protéiques animaux ou Concentrés.",consequence:"Retard de croissance sévère, mauvais indice de consommation, mortalité élevée."});
    return{formula:null,alerts,target};
  }

  // --- Vérification mathématique de faisabilité, en deux paliers ---
  // 1) Dans la limite du dosage RECOMMANDÉ de chaque ingrédient → si ça
  //    suffit, rien à signaler. 2) Sinon, en poussant les ingrédients
  //    naturels concernés jusqu'à 100% → si ça suffit, la cible reste
  //    atteignable mais au prix d'un dépassement du dosage recommandé
  //    (avertissement non bloquant). 3) Si même ça ne suffit pas, la cible
  //    est réellement hors de portée avec cette sélection (blocage).
  const relaxableProtein=new Set([...byFam.proteine_ani,...vegLike].map(i=>i.id));
  const relaxableMineral=new Set(byFam.mineral.map(i=>i.id));
  const relaxableEnergy=new Set(byFam.energetique.map(i=>i.id));
  const nutrientChecks=[
    {key:"protein",label:"Protéines",unit:"%",dec:1,relax:relaxableProtein,cat:"Protéiques végétaux ou Protéiques animaux"},
    {key:"energy",label:"Énergie",unit:" kcal/kg",dec:0,relax:relaxableEnergy,cat:"Énergétiques (ex. huile végétale)"},
    {key:"calcium",label:"Calcium",unit:"%",dec:2,relax:relaxableMineral,cat:"Minéraux"},
    {key:"phosphorus",label:"Phosphore",unit:"%",dec:2,relax:relaxableMineral,cat:"Minéraux"},
    {key:"methionine",label:"Méthionine",unit:"%",dec:2,relax:relaxableProtein,cat:"Protéiques animaux ou Additif Méthionine"},
    {key:"lysine",label:"Lysine",unit:"%",dec:2,relax:relaxableProtein,cat:"Protéiques animaux ou Additif Lysine"},
  ];
  const relaxNeeded=new Set();
  nutrientChecks.forEach(nc=>{
    const rawTarget=target[nc.key];
    if(!rawTarget)return;
    // Pour un intervalle, atteindre le minimum suffit à être "dans la cible" ;
    // c'est donc le minimum qui sert de seuil de faisabilité.
    const targetVal=targetMin(rawTarget);
    const recommendedMax=theoreticalMaxNutrient(selected,nc.key);
    if(recommendedMax>=targetVal*0.98)return;
    const absoluteMax=theoreticalMaxNutrient(selected,nc.key,nc.relax);
    if(absoluteMax<targetVal*0.98){
      alerts.push({level:"critique",msg:`Cible de ${nc.label} (${fmtTarget(rawTarget,nc.unit,nc.dec)}) mathématiquement inatteignable avec les ingrédients sélectionnés (maximum possible, même en dosage élevé : ${absoluteMax.toFixed(nc.dec)}${nc.unit}).`,action:`Ajoutez un ingrédient plus riche en ${nc.label.toLowerCase()} — catégorie ${nc.cat}.`,consequence:"Aucune répartition des proportions ne peut combler cet écart."});
    }else{
      nc.relax.forEach(id=>relaxNeeded.add(id));
    }
  });
  if(alerts.some(a=>a.level==="critique"))return{formula:null,alerts,target};

  // --- Budget : additifs fixes (prémix, sel...) ---
  const usedPct={};
  fixedAdditives.forEach(ing=>{usedPct[ing.id]=ing.defaultPct||0.25;});
  const afterFixed=100-Object.values(usedPct).reduce((s,p)=>s+p,0);

  // --- Minéraux, dosés pour atteindre le calcium cible (assoupli si nécessaire) ---
  const caAlloc=allocateForTarget(byFam.mineral,"calcium",targetMin(target.calcium||0),{},relaxNeeded);
  Object.entries(caAlloc.allocations).forEach(([id,pct])=>{usedPct[id]=(usedPct[id]||0)+pct;});

  // --- Protéines + énergie, optimisées par dichotomie (assoupli si nécessaire) ---
  const proteinBudget=Math.max(0,afterFixed-Object.values(caAlloc.allocations).reduce((s,p)=>s+p,0));
  const protShare=optimizeProtShare(byFam.proteine_ani,vegLike,byFam.energetique,targetMin(target.protein),proteinBudget,allIngById,relaxNeeded);
  const{protAlloc,engAlloc,mainEngId}=buildProteinEnergyBlend(byFam.proteine_ani,vegLike,byFam.energetique,protShare,proteinBudget,relaxNeeded);
  Object.entries(protAlloc).forEach(([id,pct])=>{usedPct[id]=(usedPct[id]||0)+pct;});
  Object.entries(engAlloc).forEach(([id,pct])=>{usedPct[id]=(usedPct[id]||0)+pct;});

  // --- Réconciliation énergie : recherche itérative locale entre l'ingrédient
  // principal (maïs/sorgho/mil) et l'énergétique le plus concentré
  // (typiquement l'huile) pour se rapprocher de la cible énergétique, DANS
  // LES DEUX SENS. Avant, seul un déficit déclenchait une correction (on
  // poussait l'huile) — un excès la laissait plafonnée à son maximum sans
  // jamais la redescendre. Maintenant, si l'énergie dépasse la cible, on
  // réduit l'ingrédient le plus concentré et on redonne la place au
  // principal, jusqu'à revenir dans la fourchette ou à 0% de dépassement.
  if(target.energy){
    const lo=targetMin(target.energy);
    const hi=isRange(target.energy)?targetMax(target.energy):target.energy*1.10;
    const mid=(lo+hi)/2;
    const mainEnergy=allIngById[mainEngId]?.energy||0;
    // Candidats : énergétiques plus concentrés que le principal (huile...),
    // triés du plus concentré au moins concentré — on ajuste le plus
    // "puissant" en premier, c'est lui qui a le plus d'effet par point de %.
    const candidates=[...byFam.energetique].filter(i=>i.id!==mainEngId&&i.energy>mainEnergy).sort((a,b)=>b.energy-a.energy);
    const energyNow=()=>Object.entries(usedPct).reduce((s,[id,pct])=>s+pct*(allIngById[id]?.energy||0)/100,0);
    for(const cand of candidates){
      for(const step of[2,0.5,0.1]){
        let guard=0;
        while(guard<300){
          guard++;
          const cur=energyNow();
          if(cur>=lo&&cur<=hi)break; // déjà dans la fourchette, rien à faire
          const candPct=usedPct[cand.id]||0;
          const mainPct=usedPct[mainEngId]||0;
          if(cur>hi){
            // Excès : redescend le candidat, redonne la place au principal.
            if(candPct<step)break;
            usedPct[cand.id]=Math.round((candPct-step)*100)/100;
            usedPct[mainEngId]=Math.round((mainPct+step)*100)/100;
            if(Math.abs(energyNow()-mid)>=Math.abs(cur-mid)){usedPct[cand.id]=candPct;usedPct[mainEngId]=mainPct;break;}
          }else{
            // Déficit : monte le candidat (au-delà de son maxPct si besoin,
            // dans la limite de 100%), retire au principal.
            if(mainPct<step||candPct+step>100)break;
            usedPct[cand.id]=Math.round((candPct+step)*100)/100;
            usedPct[mainEngId]=Math.round((mainPct-step)*100)/100;
            if(Math.abs(energyNow()-mid)>=Math.abs(cur-mid)){usedPct[cand.id]=candPct;usedPct[mainEngId]=mainPct;break;}
          }
        }
      }
    }
    candidates.forEach(cand=>{
      if((usedPct[cand.id]||0)>cand.maxPct+0.05){
        alerts.push({level:"important",msg:`${cand.name} est dosée à ${usedPct[cand.id]}% pour atteindre la cible énergétique, au-delà du dosage recommandé (${cand.maxPct}%).`,action:"Surveillez la tolérance digestive des animaux (fientes grasses), surtout chez les jeunes sujets, à ce niveau de dosage.",consequence:"Au-delà du seuil digestif recommandé, le risque de troubles digestifs augmente."});
      }
    });
  }

  // --- Complément phosphore si les minéraux calciques n'y suffisent pas ---
  const phosphorusSoFar=Object.entries(usedPct).reduce((s,[id,pct])=>s+pct*(allIngById[id]?.phosphorus||0)/100,0);
  const phosphorusTargetMin=targetMin(target.phosphorus||0);
  if(target.phosphorus&&phosphorusSoFar<phosphorusTargetMin){
    const pAlloc=allocateForTarget(byFam.mineral,"phosphorus",phosphorusTargetMin-phosphorusSoFar,usedPct,relaxNeeded);
    Object.entries(pAlloc.allocations).forEach(([id,pct])=>{usedPct[id]=(usedPct[id]||0)+pct;});
  }

  // --- Complément méthionine / lysine via les acides aminés purs si sélectionnés ---
  ["methionine","lysine"].forEach(key=>{
    const targetVal=target[key];
    if(!targetVal)return;
    const soFar=Object.entries(usedPct).reduce((s,[id,pct])=>s+pct*(allIngById[id]?.[key]||0)/100,0);
    const additive=aminoAdditives[key];
    if(soFar<targetVal&&additive){
      const gap=targetVal-soFar;
      const headroom=additive.maxPct-(usedPct[additive.id]||0);
      const take=additive[key]>0?Math.min(headroom,gap*100/additive[key]):0;
      if(take>0)usedPct[additive.id]=(usedPct[additive.id]||0)+Math.round(take*100)/100;
    }
  });

  // --- Réduction des excès (économie) : jusqu'ici, chaque étape ci-dessus
  // ne fait qu'AJOUTER de la matière si une cible n'est pas atteinte — rien
  // ne réduit un ingrédient qui apporte largement plus que nécessaire. Or
  // les sources de protéines animales / concentrés (farine de viande et os,
  // farine de poisson, concentré...) sont souvent très riches en calcium et
  // phosphore : elles peuvent largement dépasser ces cibles "en bonus" sans
  // que rien ne le corrige, ce qui gaspille de la matière première chère
  // pour rien. Cette passe teste, petit pas par petit pas, si réduire un
  // ingrédient concentré (protéines animales/végétales, minéraux,
  // concentrés) au profit de l'ingrédient principal bon marché (maïs/
  // sorgho/mil) rapproche l'ENSEMBLE des nutriments de leurs cibles — sans
  // jamais accepter un mouvement qui ferait retomber un nutriment sous son
  // minimum. Les énergétiques (huile) sont déjà traités séparément
  // ci-dessus et les additifs de synthèse (prémix, sel, acides aminés purs)
  // ne sont jamais touchés.
  {
    const NUTRIENT_KEYS=["protein","energy","calcium","phosphorus","methionine","lysine"];
    const computeAchieved=()=>{
      const a={protein:0,energy:0,calcium:0,phosphorus:0,methionine:0,lysine:0};
      Object.entries(usedPct).forEach(([id,pct])=>{
        const ing=allIngById[id];if(!ing)return;
        NUTRIENT_KEYS.forEach(k=>{a[k]+=pct*(ing[k]||0)/100;});
      });
      return a;
    };
    // Coût d'un écart : très pénalisé sous le minimum — un terme fixe dès le
    // franchissement du seuil (et non seulement un terme qui croît depuis
    // zéro à la frontière) pour que la recherche s'arrête net à la cible
    // plutôt que de la franchir légèrement quand ça permet de gagner
    // beaucoup ailleurs. Au-dessus du minimum, coût léger mais continu (le
    // "gaspillage" qu'on veut réduire), et coût fort au-delà d'un vrai
    // maximum quand la source fournit un intervalle.
    const penalty=a=>{
      let p=0;
      NUTRIENT_KEYS.forEach(key=>{
        const t=target[key];if(!t)return;
        const lo=targetMin(t);
        const val=a[key];
        if(val<lo){p+=5+50*((lo-val)/lo)**2;}
        else if(isRange(t)){const hi=targetMax(t);if(val>hi)p+=((val-hi)/hi)**2;}
        else{p+=0.6*((val-lo)/lo)**2;}
      });
      return p;
    };
    // Les énergétiques secondaires (huile...) sont inclus ici aussi : l'huile
    // qui reste à son plafond juste parce que l'énergie est "dans la
    // fourchette tolérée" (±10%) n'est pas forcément nécessaire — si la
    // redonner au maïs permet de rester quand même au-dessus du minimum,
    // c'est une économie, exactement comme pour le calcium/phosphore/
    // protéines. Seul l'ingrédient principal (maïs/sorgho/mil) n'est jamais
    // un candidat, puisque c'est justement lui qui récupère la place libérée.
    const trimFamilies=new Set(["mineral","proteine_ani","proteine_veg","concentre","energetique"]);
    const candidates=Object.keys(usedPct).filter(id=>id!==mainEngId&&trimFamilies.has(allIngById[id]?.family)&&(usedPct[id]||0)>0);
    for(const step of[3,1,0.25,0.05]){
      let improved=true,guard=0;
      while(improved&&guard<400){
        improved=false;guard++;
        for(const id of candidates){
          const pct=usedPct[id]||0;
          if(pct<step)continue;
          const mainPct=usedPct[mainEngId]||0;
          const before=penalty(computeAchieved());
          usedPct[id]=Math.round((pct-step)*100)/100;
          usedPct[mainEngId]=Math.round((mainPct+step)*100)/100;
          const after=penalty(computeAchieved());
          if(after<before-1e-9){improved=true;}
          else{usedPct[id]=pct;usedPct[mainEngId]=mainPct;}
        }
      }
    }
  }

  // --- Normalisation finale à 100%, ajustée sur l'ingrédient énergétique principal ---
  const total=Object.values(usedPct).reduce((s,p)=>s+p,0);
  const diff=Math.round((100-total)*100)/100;
  usedPct[mainEngId]=Math.max(0,Math.round(((usedPct[mainEngId]||0)+diff)*100)/100);

  // --- Construction de la formule finale ---
  const formula=Object.entries(usedPct).filter(([,pct])=>pct>0.001).map(([id,pct])=>({...allIngById[id],pct,qtyKg:Math.round(pct/100*quantityKg*100)/100}));

  // --- Avertissement (non bloquant) pour tout ingrédient poussé au-delà de
  // son dosage recommandé afin d'atteindre les cibles nutritionnelles ---
  const dosageRisk={proteine_veg:"peut apporter des facteurs antinutritionnels ou un risque accru d'aflatoxines à haute dose",proteine_ani:"peut présenter un risque sanitaire (qualité variable, excès de sel) à haute dose",mineral:"peut déséquilibrer le rapport calcium/phosphore à haute dose",concentre:"peut créer un déséquilibre vitaminique/minéral par surdosage si combiné à d'autres sources concentrées"};
  const huileIds=new Set(["huile_vegetale","huile_rouge"]);
  formula.forEach(ing=>{
    if(huileIds.has(ing.id))return; // avertissement spécifique (tolérance digestive) ci-dessous
    if(relaxNeeded.has(ing.id)&&ing.pct>ing.maxPct+0.05){
      alerts.push({level:"important",msg:`${ing.name} est dosé à ${ing.pct}% pour atteindre les cibles nutritionnelles, au-delà du maximum habituellement recommandé (${ing.maxPct}%).`,action:`Vérifiez la qualité de cet ingrédient et surveillez les animaux ; un ingrédient complémentaire de la même catégorie permettrait de réduire ce dosage.`,consequence:`Au-delà du dosage recommandé, cet ingrédient ${dosageRisk[ing.family]||"peut présenter un risque à haute dose"}.`});
    }
  });
  // --- Avertissement spécifique aux huiles : le plafond est une limite de
  // tolérance digestive (fientes grasses, surtout chez les jeunes), pas une
  // toxicité. On avertit déjà en s'approchant du seuil, pas seulement au
  // dépassement. (Le dépassement lui-même, s'il vient du complément
  // d'énergie ci-dessus, a déjà généré son propre avertissement "Important" ;
  // on évite ici de le dupliquer.)
  formula.forEach(ing=>{
    if(!huileIds.has(ing.id))return;
    const alreadyWarned=alerts.some(a=>a.msg.startsWith(ing.name)&&a.msg.includes("déficit énergétique"));
    if(ing.pct>ing.maxPct+0.05&&!alreadyWarned){
      alerts.push({level:"important",msg:`${ing.name} est dosée à ${ing.pct}%, au-delà du seuil de tolérance digestive recommandé (${ing.maxPct}%).`,action:"Surveillez l'aspect des fientes (grasses/luisantes), en particulier chez les jeunes sujets ; réduisez si des signes apparaissent.",consequence:"Au-delà de ce seuil, le risque de troubles digestifs augmente, surtout chez les jeunes animaux."});
    }else if(ing.pct>=ing.maxPct*0.8&&ing.pct<=ing.maxPct+0.05){
      alerts.push({level:"warning",msg:`${ing.name} est dosée à ${ing.pct}%, proche du seuil de tolérance digestive (${ing.maxPct}%).`,action:"Aucune action requise dans l'immédiat, mais surveillez l'aspect des fientes si ce dosage venait à augmenter.",consequence:"Un dosage plus élevé pourrait entraîner des fientes grasses, surtout chez les jeunes sujets."});
    }
  });

  const achieved={
    protein:formula.reduce((s,i)=>s+(i.protein/100)*(i.pct/100)*100,0),
    energy:formula.reduce((s,i)=>s+i.energy*(i.pct/100),0),
    calcium:formula.reduce((s,i)=>s+(i.calcium/100)*(i.pct/100)*100,0),
    phosphorus:formula.reduce((s,i)=>s+(i.phosphorus/100)*(i.pct/100)*100,0),
    methionine:formula.reduce((s,i)=>s+(i.methionine/100)*(i.pct/100)*100,0),
    lysine:formula.reduce((s,i)=>s+(i.lysine/100)*(i.pct/100)*100,0),
  };

  // --- Contrôle final honnête : la répartition retenue par l'algorithme
  // (centrée sur la cible de protéines) peut laisser un léger écart sur un
  // autre paramètre même quand la cible était théoriquement atteignable.
  // On le signale ici plutôt que de le laisser passer silencieusement.
  const finalChecks=[
    {key:"energy",label:"Énergie",unit:" kcal/kg",dec:0,cat:"Énergétiques (ex. huile végétale)"},
    {key:"calcium",label:"Calcium",unit:"%",dec:2,cat:"Minéraux"},
    {key:"phosphorus",label:"Phosphore",unit:"%",dec:2,cat:"Minéraux"},
    {key:"methionine",label:"Méthionine",unit:"%",dec:2,cat:"Protéiques animaux ou Additif Méthionine"},
    {key:"lysine",label:"Lysine",unit:"%",dec:2,cat:"Protéiques animaux ou Additif Lysine"},
  ];
  finalChecks.forEach(fc=>{
    const rawTarget=target[fc.key];
    if(!rawTarget)return;
    const a=achieved[fc.key];
    // Intervalle réel {min,max} : on n'alerte que si le résultat sort de la
    // fourchette (sous le min ou au-dessus du max). Valeur unique : on garde
    // la tolérance ±8-10% déjà en place, faute d'une vraie fourchette source.
    const lo=isRange(rawTarget)?targetMin(rawTarget):rawTarget*0.92;
    if(a<lo&&!alerts.some(al=>al.msg.includes(fc.label))){
      alerts.push({level:"important",msg:`${fc.label} atteint(e) avec cette répartition : ${a.toFixed(fc.dec)}${fc.unit} pour une cible de ${fmtTarget(rawTarget,fc.unit,fc.dec)}.`,action:`Ajoutez ou augmentez un ingrédient riche en ${fc.label.toLowerCase()} — catégorie ${fc.cat}.`,consequence:`Un écart prolongé en ${fc.label.toLowerCase()} peut ralentir la croissance ou la production.`});
    }else if(isRange(rawTarget)&&a>targetMax(rawTarget)&&!alerts.some(al=>al.msg.includes(fc.label))){
      alerts.push({level:"important",msg:`${fc.label} atteint(e) avec cette répartition : ${a.toFixed(fc.dec)}${fc.unit}, au-dessus de la fourchette cible (${fmtTarget(rawTarget,fc.unit,fc.dec)}) pour cette phase.`,action:`Réduisez la part d'ingrédients riches en ${fc.label.toLowerCase()}.`,consequence:`Un excès prolongé en ${fc.label.toLowerCase()} peut aussi nuire à la croissance ou à la production.`});
    }
  });

  // --- Cas particulier de l'énergie : contrairement aux autres paramètres à
  // valeur unique, un EXCÈS peut aussi poser problème même hors intervalle
  // déclaré (ex. sujets ponte volontairement maintenus en dessous de
  // l'énergie de croissance pour éviter un excès de poids qui réduit la
  // ponte). On signale donc aussi le dépassement au-delà de +10%, sauf si
  // c'est déjà couvert par une vraie fourchette ci-dessus.
  if(target.energy&&!isRange(target.energy)&&achieved.energy>target.energy*1.10){
    alerts.push({level:"important",msg:`Énergie atteinte avec cette répartition : ${Math.round(achieved.energy)} kcal/kg, au-dessus de la cible de ${target.energy} kcal/kg pour cette phase.`,action:"Réduisez la part d'ingrédients très énergétiques (huiles, manioc) ou ajoutez un ingrédient plus fibreux/moins énergétique pour diluer.",consequence:"Un excès d'énergie prolongé peut entraîner une prise de poids excessive, particulièrement pénalisante sur une phase où l'énergie est volontairement limitée (ex. ponte)."});
  }

  return{formula:formula.sort((a,b)=>b.pct-a.pct),alerts,target,achieved};
}

// ═══════════════════════════════════════════
//  DONNÉES — FORMATIONS
// ═══════════════════════════════════════════

const FORMATIONS=[
  {id:1,cat:"Incubation",title:"Maîtriser l'incubation artificielle",dur:"45 min",type:"Vidéo",premium:false,desc:"Température, humidité, retournement : tous les paramètres pour un taux d'éclosion optimal."},
  {id:2,cat:"Incubation",title:"Lecture du mirage et tri des œufs",dur:"20 min",type:"Vidéo",premium:false,desc:"Technique pratique du mirage pour identifier les œufs infertiles, morts ou malformés."},
  {id:11,cat:"Démarrage",title:"Comment bien préparer l'arrivée de ses poussins",dur:"25 min",type:"Vidéo",premium:false,desc:"Tout ce qu'il faut préparer avant même l'arrivée de vos poussins : brooder, litière, eau, température et matériel."},
  {id:12,cat:"Démarrage",title:"Comprendre le comportement de ses poussins",dur:"20 min",type:"Vidéo",premium:false,desc:"Apprenez à lire le comportement de vos poussins pour ajuster la température, l'espace et l'alimentation au quotidien."},
  {id:13,cat:"Démarrage",title:"Réussir sa phase poussinière",dur:"30 min",type:"Vidéo",premium:false,desc:"Les clés d'une phase poussinière réussie : température, ventilation, densité, eau, aliment et surveillance quotidienne."},
  {id:14,cat:"Démarrage",title:"Tout savoir sur le démarrage des poussins de chair",dur:"45 min",type:"Cours",premium:true,desc:"Guide complet semaine par semaine pour un démarrage optimal des poussins de chair : paramètres, alimentation, vaccination et suivi."},
  {id:15,cat:"Démarrage",title:"Tout savoir sur le démarrage des pondeuses",dur:"45 min",type:"Cours",premium:true,desc:"Démarrage des futures pondeuses : alimentation spécifique, programme lumineux progressif, densité et préparation à la ponte."},
  {id:16,cat:"Démarrage",title:"Réussir le démarrage des cailleteaux",dur:"35 min",type:"Cours",premium:true,desc:"Spécificités du démarrage de la caille : fragilité des cailleteaux, température, alimentation riche en protéines et premières semaines critiques."},
  {id:3,cat:"Vaccination",title:"Programme de vaccination complet",dur:"30 min",type:"PDF",premium:false,desc:"Calendrier de vaccination complet pour poulets chair, pondeuses et cailles."},
  {id:4,cat:"Poulet de chair",title:"Optimiser la croissance et réduire les coûts",dur:"1h",type:"Cours",premium:true,desc:"Alimentation, densité, phases d'élevage pour maximiser le GMQ tout en réduisant les charges."},
  {id:5,cat:"Ponte",title:"Gestion professionnelle des pondeuses",dur:"1h 30",type:"Cours",premium:true,desc:"Programme lumineux, alimentation, collecte des œufs, et maintien du pic de ponte."},
  {id:6,cat:"Alimentation",title:"Fabriquer sa provende locale",dur:"55 min",type:"Vidéo",premium:true,desc:"Formulation de rations équilibrées avec les matières premières disponibles en Afrique."},
  {id:7,cat:"Caille",title:"Démarrer un élevage de caille rentable",dur:"40 min",type:"Vidéo",premium:false,desc:"Caille japonaise : habitat, alimentation, ponte, commercialisation et rentabilité."},
  {id:8,cat:"Gestion",title:"Gestion financière de son élevage",dur:"35 min",type:"Cours",premium:true,desc:"Coût de production, seuil de rentabilité, tableaux de bord simples pour aviculteurs."},
  {id:9,cat:"Biosécurité",title:"Biosécurité pratique à la ferme",dur:"25 min",type:"Vidéo",premium:false,desc:"Règles essentielles pour éviter l'introduction et la propagation des maladies."},
  {id:10,cat:"Alimentation",title:"L'eau en aviculture : souvent négligée",dur:"20 min",type:"PDF",premium:false,desc:"Qualité, quantité, hygiène des abreuvoirs. L'eau est le 1er facteur de production."},
];

// ═══════════════════════════════════════════
//  DONNÉES — TRÉSORERIE & TIPS
// ═══════════════════════════════════════════

const EXPENSE_CATEGORIES=[
  {id:"alimentation",label:"Alimentation",icon:""},{id:"vaccination",label:"Vaccins & Médicaments",icon:""},
  {id:"transport",label:"Transport",icon:""},{id:"energie",label:"Eau & Électricité",icon:""},
  {id:"maindoeuvre",label:"Main d'œuvre",icon:""},{id:"equipement",label:"Équipements",icon:""},
  {id:"desinfection",label:"Désinfection",icon:""},{id:"achat_animaux",label:"Achat animaux",icon:""},
  {id:"autre",label:"Autre",icon:""},
];

const DAILY_TIPS=[
  "L'eau est le premier aliment de vos volailles. Un oiseau déshydraté mange moins, grandit moins vite et tombe plus facilement malade.",
  "Observez vos volailles deux fois par jour. Un oiseau isolé du groupe ou qui ne mange plus est souvent le premier signe d'un problème.",
  "La litière humide est l'ennemi numéro un de vos poussins. Une litière sèche prévient la coccidiose et les maladies respiratoires.",
  "La vaccination ne protège que si elle est faite au bon moment et correctement conservée. Vérifiez toujours la chaîne du froid.",
  "Un bon taux d'éclosion commence par des géniteurs en bonne santé. La qualité de l'œuf dépend de la qualité de la poule.",
  "La surpopulation est une cause majeure de stress et de maladies. Respectez la densité recommandée selon l'âge de vos oiseaux.",
  "Désinfecter son élevage entre deux bandes n'est pas optionnel — c'est la base d'un élevage sain et rentable.",
  "Un incubateur mal calibré peut faire perdre toute une incubation. Vérifiez votre thermomètre avec un instrument de référence.",
  "Les pertes dues aux maladies coûtent toujours plus cher que la prévention. Investir dans la vaccination, c'est protéger ses bénéfices.",
  "La biosécurité commence à l'entrée de votre élevage. Limitez les visites et désinfectez les chaussures avant d'entrer.",
  "Pour les poussins : regroupés = froid, dispersés et haletants = chaud, bien répartis = confort.",
  "Les rongeurs transmettent des maladies graves. Contrôlez-les activement dans votre élevage.",
  "Ne mélangez jamais des oiseaux d'âges ou d'origines différentes sans une période de quarantaine d'au moins 2 semaines.",
  "Un œuf pour l'incubation doit être collecté dans les 7 jours, propre, et conservé à 12–15°C.",
  "L'alimentation représente 60 à 70% du coût d'un élevage. Optimiser la ration, c'est améliorer directement la rentabilité.",
  "Les moustiques transmettent la variole aviaire. Protégez vos locaux avec des filets.",
  "Un vétérinaire consulté tôt coûte moins cher qu'un élevage décimé. N'attendez pas que les pertes soient importantes.",
  "Ne jamais ouvrir l'incubateur pendant la phase d'éclosion — chaque ouverture peut tuer des poussins.",
  "Calculez votre coût de production par animal à chaque bande. C'est la seule façon de savoir si vous êtes rentable.",
  "Les élevages qui réussissent tiennent des registres. Notez vos dépenses, ventes et observations chaque semaine.",
  "La caille pond dès 6–7 semaines. Prévoir la transition alimentation démarrage → ponte avant ce stade.",
  "Un bâtiment bien ventilé mais sans courant d'air direct est la base d'un bon démarrage de poussins.",
  "Le retournement des œufs évite que l'embryon colle à la membrane. Ne jamais arrêter avant J18 pour le poulet.",
  "Une bonne biosécurité vaut mieux que tous les traitements. Empêcher une maladie d'entrer est toujours plus simple que de la combattre.",
  "Les aliments mal stockés peuvent causer l'aspergillose. Toujours conserver la provende au sec, à l'abri de l'humidité.",
  "Le mirage à J7 permet d'éliminer les œufs non fécondés et d'améliorer les conditions des œufs restants.",
  "Un bon aviculteur sait lire le comportement de ses oiseaux mieux qu'un thermomètre.",
  "La gestion financière est aussi importante que la gestion technique. Un élevage bien suivi financièrement résiste mieux aux difficultés.",
  "Acheter des poussins vaccinés coûte un peu plus cher mais peut éviter des pertes catastrophiques.",
  "Après chaque bande, faites le bilan : taux de mortalité, coût de production, marge. C'est en analysant qu'on progresse.",
];

function getDailyTip(){ const now=new Date(); const start=new Date(now.getFullYear(),0,0); const day=Math.floor((now-start)/86400000); return DAILY_TIPS[day%DAILY_TIPS.length]; }

// ═══════════════════════════════════════════
//  UTILITAIRES
// ═══════════════════════════════════════════

const addDays=(d,n)=>{const r=new Date(d);r.setDate(r.getDate()+n);return r;};
const fmtDate=d=>d?new Date(d).toLocaleDateString("fr-FR",{day:"2-digit",month:"short",year:"numeric"}):"";
// Espace insécable classique : certaines polices n'ont pas l'espace fine du format français.
const fmtCFA=n=>new Intl.NumberFormat("fr-FR").format(Math.round(n||0)).replace(/ /g," ")+" F";
const genId=()=>Math.random().toString(36).slice(2,11);
const fmtQty=kg=>{const g=kg*1000;return g<100?`${Math.round(g)} g`:`${kg} kg`;};
const today=()=>new Date().toISOString().split("T")[0];

export {
  AMBIENT_TEMPS,
  DAILY_TIPS,
  DISEASES_V2,
  EGG_TYPES,
  EMPTY_SET,
  EXPENSE_CATEGORIES,
  FEED_TARGETS,
  FEED_TYPE_PHASES,
  FORMATIONS,
  INGREDIENTS,
  INGREDIENT_CATS,
  SYMPTOMS_V2,
  SYMPTOM_CATS,
  adaptHum,
  adaptPhases,
  adaptTemp,
  addDays,
  allocateForTarget,
  blendProteinPct,
  buildProteinEnergyBlend,
  diagnose,
  fmtCFA,
  fmtDate,
  fmtQty,
  fmtTarget,
  formuler,
  genId,
  getDailyTip,
  isRange,
  optimizeProtShare,
  targetMax,
  targetMin,
  theoreticalMaxNutrient,
  today,
};
