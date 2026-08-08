import { useState, useEffect, useCallback, useRef } from "react";

// ═══════════════════════════════════════════
//  DONNÉES — INCUBATION
// ═══════════════════════════════════════════

const EGG_TYPES = {
  poulet:{ name:"Poulet",icon:"🐓",days:21,mirage:[7,14],stopTurn:18,turnsPerDay:3,turnHours:["06h00","14h00","22h00"],youngName:"poussins",minRate:70,eclosionStart:21,eclosionWindow:[21,23],
    phases:[{label:"J1–J18",temp:"37.2–37.7°C",hum:"55–60%",note:""},{label:"J19–J21",temp:"37.0–37.5°C",hum:"65–70%",note:"↓ Baisser température + ↑ Humidité"}],
    tips:[
      {day:1,text:"Préchauffer la couveuse/incubateur pendant 24h pour stabiliser à 37.2–37.7°C. Vérifier l'humidité (55–60%) et le bon fonctionnement du retournement."},
      {day:7,text:"1er mirage : retirer les œufs clairs ou à développement anormal. 📚 Voir tutoriel mirage dans Formations."},
      {day:14,text:"2e mirage : les œufs sains sont très foncés avec une chambre d'air nette. 📚 Images de référence dans Formations."},
      {day:18,text:"Arrêter le retournement. Baisser la température à 37.0–37.5°C. Augmenter l'humidité à 65–70%. Placer les œufs à plat."},
      {day:19,text:"Les poussins commencent à piquer (pipping). NE PAS ouvrir l'incubateur ! La chute d'humidité colle les membranes."},
      {day:21,text:"Éclosion ! Laisser les poussins sécher 12–24h dans l'incubateur avant de les sortir."},
    ],
    specialTips:["Un poussin sain est sec, actif, alerte, avec un nombril propre.","Taux d'éclosion acceptable : 70–85%.","📚 Cours complets disponibles dans la section Formations."],
  },
  caille:{ name:"Caille",icon:"🪶",days:17,mirage:[7],stopTurn:14,turnsPerDay:4,turnHours:["06h00","12h00","18h00","00h00"],youngName:"cailleteaux",minRate:60,eclosionStart:16,eclosionWindow:[16,18],
    phases:[{label:"J1–J14",temp:"37.5–37.8°C",hum:"45–55%",note:""},{label:"J15–J17",temp:"37.0–37.5°C",hum:"65–70%",note:"↓ Baisser température + ↑ Humidité"}],
    tips:[
      {day:1,text:"Préchauffer pendant 24h à 37.5–37.8°C. Les œufs de caille sont très petits — vérifier que les grilles de retournement sont adaptées. Humidité : 45–55%."},
      {day:1,text:"Retournement 4× par jour : 06h00, 12h00, 18h00, 00h00. Sur la caille, la régularité est encore plus critique."},
      {day:7,text:"Mirage : utiliser une lampe adaptée aux petits œufs. Éliminer les œufs clairs. 📚 Voir tutoriel dans Formations."},
      {day:14,text:"Arrêter le retournement. Baisser à 37.0–37.5°C. Augmenter l'humidité à 65–70%."},
      {day:15,text:"Les cailleteaux commencent à piquer. NE PAS ouvrir l'incubateur !"},
      {day:17,text:"Éclosion ! Laisser sécher 12–24h. Les cailleteaux sont très petits — agir avec précaution."},
    ],
    specialTips:["Cycle très court (17 jours) — chaque heure d'instabilité a un impact plus fort.","Taux d'éclosion acceptable : 60–80%.","📚 Formation 'Démarrer un élevage de caille rentable' dans Formations."],
  },
  canard:{ name:"Canard colvert / domestique",icon:"🦆",days:28,mirage:[7,14],stopTurn:25,turnsPerDay:3,turnHours:["06h00","14h00","22h00"],youngName:"canetons",minRate:65,eclosionStart:28,eclosionWindow:[28,30],humid:[7,24],
    phases:[{label:"J1–J25",temp:"37.2–37.7°C",hum:"55–65%",note:"+ Humidification externe quotidienne J7–J24"},{label:"J26–J28",temp:"37.0–37.5°C",hum:"70–75%",note:"↓ Baisser température + ↑ Humidité, arrêter humidification externe"}],
    tips:[
      {day:1,text:"Préchauffer pendant 24h. Température : 37.2–37.7°C, humidité : 55–65%. Les œufs de canard produisent plus de chaleur en fin d'incubation."},
      {day:7,text:"1er mirage. À partir d'aujourd'hui : commencer l'humidification externe quotidienne. 📚 Voir tutoriel dans Formations."},
      {day:7,text:"🌊 Humidification externe (J7–J24, chaque jour) : vaporiser légèrement avec de l'eau tiède (35–37°C), laisser refroidir 15–30 min à l'air libre, puis remettre."},
      {day:14,text:"2e mirage. Continuer l'humidification externe. 📚 Images de référence dans Formations."},
      {day:25,text:"Arrêter le retournement ET l'humidification externe. Baisser à 37.0–37.5°C. Augmenter l'humidité à 70–75%."},
      {day:26,text:"Les canetons commencent à piquer. NE PAS ouvrir l'incubateur !"},
      {day:28,text:"Éclosion ! Laisser sécher 12–24h dans l'incubateur."},
    ],
    specialTips:["L'humidification externe (J7–J24) est LA particularité des œufs de canard. Ne jamais sauter cette étape.","Taux d'éclosion acceptable : 65–80%."],
  },
  canard_barbarie:{ name:"Canard de Barbarie",icon:"🦢",days:35,mirage:[10,21],stopTurn:32,turnsPerDay:3,turnHours:["06h00","14h00","22h00"],youngName:"canetons",minRate:60,eclosionStart:35,eclosionWindow:[35,37],humid:[10,31],
    phases:[{label:"J1–J32",temp:"37.2–37.7°C",hum:"55–65%",note:"+ Humidification externe quotidienne J10–J31"},{label:"J33–J35",temp:"37.0–37.5°C",hum:"70–75%",note:"↓ Baisser température + ↑ Humidité"}],
    tips:[
      {day:1,text:"⚠️ Le Barbarie dure 35 jours, pas 28 comme le canard domestique. Ne pas confondre ! Préchauffer 24h à 37.2–37.7°C, humidité 55–65%."},
      {day:10,text:"1er mirage. Commencer l'humidification externe quotidienne."},
      {day:10,text:"🌊 Humidification externe (J10–J31) : vaporiser avec de l'eau tiède, laisser refroidir 15–30 min à l'air, puis remettre."},
      {day:21,text:"2e mirage. Continuer l'humidification externe."},
      {day:32,text:"Arrêter le retournement ET l'humidification externe. Baisser à 37.0–37.5°C. Augmenter l'humidité à 70–75%."},
      {day:33,text:"Les canetons commencent à piquer. NE PAS ouvrir l'incubateur !"},
      {day:35,text:"Éclosion ! Laisser sécher 12–24h."},
    ],
    specialTips:["35 jours d'incubation — ne pas confondre avec le canard domestique (28 jours) !","Taux d'éclosion acceptable : 60–75%."],
  },
  dinde:{ name:"Dinde",icon:"🦃",days:28,mirage:[10,20],stopTurn:25,turnsPerDay:3,turnHours:["06h00","14h00","22h00"],youngName:"dindonneaux",minRate:65,eclosionStart:28,eclosionWindow:[28,30],
    phases:[{label:"J1–J25",temp:"37.2–37.7°C",hum:"55–60%",note:""},{label:"J26–J28",temp:"37.0–37.5°C",hum:"65–70%",note:"↓ Baisser température + ↑ Humidité"}],
    tips:[
      {day:1,text:"Préchauffer 24h à 37.2–37.7°C. Les œufs de dinde sont grands — vérifier l'espace entre clayettes. Humidité : 55–60%."},
      {day:10,text:"1er mirage : les embryons sont bien visibles à J10. Retirer les œufs clairs. 📚 Voir tutoriel dans Formations."},
      {day:20,text:"2e mirage : la chambre d'air doit occuper environ 1/3 de l'œuf."},
      {day:25,text:"Arrêter le retournement. Baisser à 37.0–37.5°C. Augmenter l'humidité à 65–70%."},
      {day:26,text:"Les dindonneaux commencent à piquer. NE PAS ouvrir l'incubateur ! Ne jamais forcer l'éclosion."},
      {day:28,text:"Éclosion ! Laisser sécher 12–24h dans l'incubateur."},
    ],
    specialTips:["Ne jamais aider un dindonneau à sortir de sa coquille.","Taux d'éclosion acceptable : 65–80%."],
  },
  pintade:{ name:"Pintade",icon:"🐦",days:26,mirage:[7,14],stopTurn:23,turnsPerDay:3,turnHours:["06h00","14h00","22h00"],youngName:"pintadeaux",minRate:50,eclosionStart:26,eclosionWindow:[26,28],
    phases:[{label:"J1–J23",temp:"37.2–37.7°C",hum:"55–60%",note:""},{label:"J24–J26",temp:"37.0–37.5°C",hum:"65–70%",note:"↓ Baisser température + ↑ Humidité"}],
    tips:[
      {day:1,text:"Préchauffer 24h à 37.2–37.7°C. La coquille de pintade est épaisse — prévoir des grilles robustes. Humidité : 55–60%."},
      {day:7,text:"1er mirage : utiliser une lampe puissante dans une pièce sombre. 📚 Voir tutoriel dans Formations."},
      {day:14,text:"2e mirage : les œufs fécondés doivent être très foncés."},
      {day:23,text:"Arrêter le retournement. Baisser à 37.0–37.5°C. Augmenter l'humidité à 65–70%."},
      {day:24,text:"Les pintadeaux commencent à piquer. NE PAS ouvrir l'incubateur ! Ne jamais aider un pintadeau à sortir."},
      {day:26,text:"Éclosion ! Laisser sécher 12–24h. Démarrage dans un environnement calme."},
    ],
    specialTips:["Taux d'éclosion naturellement plus bas (50–70%) — c'est normal.","L'humidité en phase d'éclosion est le facteur le plus critique pour la pintade."],
  },
};

const AMBIENT_TEMPS = [
  {id:"standard",label:"35°C et moins",icon:"❄️",color:"#1558A8",bg:"#EBF2FC",tempDelta:0,humDelta:0,mode:null},
  {id:"chaud",label:"36–38°C",icon:"🔥",color:"#E8660A",bg:"#FFF3EC",tempDelta:-0.3,humDelta:4,mode:"chaud"},
  {id:"extreme",label:"39°C et plus",icon:"☀️",color:"#C0392B",bg:"#FDECEA",tempDelta:-0.5,humDelta:5,mode:"extreme"},
];

function adaptTemp(str,delta){ if(!delta)return str; const s=str.replace("°C","").trim(); if(s.includes("–")){const[a,b]=s.split("–");return`${(parseFloat(a)+delta).toFixed(1)}–${(parseFloat(b)+delta).toFixed(1)}°C`;}return`${(parseFloat(s)+delta).toFixed(1)}°C`; }
function adaptHum(str,delta){ if(!delta)return str; const s=str.replace("%","").trim(); if(s.includes("–")){const[a,b]=s.split("–");return`${Math.round(parseFloat(a)+delta)}–${Math.round(parseFloat(b)+delta)}%`;}return`${Math.round(parseFloat(s)+delta)}%`; }
function adaptPhases(phases,ambientId){ const at=AMBIENT_TEMPS.find(a=>a.id===ambientId); if(!at||!at.tempDelta)return phases; return phases.map(p=>({...p,temp:adaptTemp(p.temp,at.tempDelta),hum:adaptHum(p.hum,at.humDelta)})); }

// ═══════════════════════════════════════════
//  DONNÉES — MALADIES
// ═══════════════════════════════════════════

const SYMPTOM_CATS=[
  {id:"digestifs",label:"🍃 Digestifs"},
  {id:"respiratoires",label:"🫁 Respiratoires"},
  {id:"neurologiques",label:"🧠 Neurologiques"},
  {id:"generaux",label:"⚡ Généraux"},
  {id:"yeux_tete",label:"👁 Yeux / Tête"},
  {id:"ponte",label:"🥚 Ponte"},
  {id:"peau_bec",label:"🐾 Peau / Bec"},
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
  {id:"energetique",label:"🌽 Énergétiques",color:"#E8660A"},
  {id:"proteine_veg",label:"🌿 Protéiques végétaux",color:"#2A7A40"},
  {id:"proteine_ani",label:"🐟 Protéiques animaux",color:"#1558A8"},
  {id:"mineral",label:"🦴 Minéraux",color:"#6B21A8"},
  {id:"additif",label:"⚗️ Additifs",color:"#5C7052"},
  {id:"concentre",label:"🧪 Concentrés",color:"#B8560A"},
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
    alerts.push({level:"critique",msg:"Aucune source d'énergie sélectionnée.",action:"Ajoutez au moins un ingrédient de la catégorie 🌽 Énergétiques (maïs, sorgho, mil...).",consequence:"La formule ne peut pas être établie sans base énergétique."});
    return{formula:null,alerts,target};
  }
  if(!allProteins.length&&targetMin(target.protein)>14){
    alerts.push({level:"critique",msg:`Cette ration requiert ${fmtTarget(target.protein,"%",1)} de protéines.`,action:"Ajoutez au moins un ingrédient de la catégorie 🌿 Protéiques végétaux, 🐟 Protéiques animaux ou 🧪 Concentrés.",consequence:"Retard de croissance sévère, mauvais indice de consommation, mortalité élevée."});
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
    {key:"protein",label:"Protéines",unit:"%",dec:1,relax:relaxableProtein,cat:"🌿 Protéiques végétaux ou 🐟 Protéiques animaux"},
    {key:"energy",label:"Énergie",unit:" kcal/kg",dec:0,relax:relaxableEnergy,cat:"🌽 Énergétiques (ex. huile végétale)"},
    {key:"calcium",label:"Calcium",unit:"%",dec:2,relax:relaxableMineral,cat:"🦴 Minéraux"},
    {key:"phosphorus",label:"Phosphore",unit:"%",dec:2,relax:relaxableMineral,cat:"🦴 Minéraux"},
    {key:"methionine",label:"Méthionine",unit:"%",dec:2,relax:relaxableProtein,cat:"🐟 Protéiques animaux ou ⚗️ Additif Méthionine"},
    {key:"lysine",label:"Lysine",unit:"%",dec:2,relax:relaxableProtein,cat:"🐟 Protéiques animaux ou ⚗️ Additif Lysine"},
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
    {key:"energy",label:"Énergie",unit:" kcal/kg",dec:0,cat:"🌽 Énergétiques (ex. huile végétale)"},
    {key:"calcium",label:"Calcium",unit:"%",dec:2,cat:"🦴 Minéraux"},
    {key:"phosphorus",label:"Phosphore",unit:"%",dec:2,cat:"🦴 Minéraux"},
    {key:"methionine",label:"Méthionine",unit:"%",dec:2,cat:"🐟 Protéiques animaux ou ⚗️ Additif Méthionine"},
    {key:"lysine",label:"Lysine",unit:"%",dec:2,cat:"🐟 Protéiques animaux ou ⚗️ Additif Lysine"},
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
  {id:"alimentation",label:"Alimentation",icon:"🌾"},{id:"vaccination",label:"Vaccins & Médicaments",icon:"💉"},
  {id:"transport",label:"Transport",icon:"🚛"},{id:"energie",label:"Eau & Électricité",icon:"💡"},
  {id:"maindoeuvre",label:"Main d'œuvre",icon:"👷"},{id:"equipement",label:"Équipements",icon:"🔧"},
  {id:"desinfection",label:"Désinfection",icon:"🧴"},{id:"achat_animaux",label:"Achat animaux",icon:"🐣"},
  {id:"autre",label:"Autre",icon:"📦"},
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
const fmtCFA=n=>new Intl.NumberFormat("fr-FR").format(Math.round(n||0))+" F";
const genId=()=>Math.random().toString(36).slice(2,11);
const fmtQty=kg=>{const g=kg*1000;return g<100?`${Math.round(g)} g`:`${kg} kg`;};
const today=()=>new Date().toISOString().split("T")[0];

function useStorage(key,fallback=null){
  const[data,setData]=useState(()=>{try{const i=localStorage.getItem(key);return i?JSON.parse(i):fallback;}catch{return fallback;}});
  const save=useCallback(val=>{try{localStorage.setItem(key,JSON.stringify(val));}catch{}setData(val);},[key]);
  return[data,save,true];
}

// ═══════════════════════════════════════════
//  DESIGN TOKENS
// ═══════════════════════════════════════════

const C={green:"#2A7A40",greenDk:"#1B5229",greenLt:"#E8F5EC",orange:"#E8660A",orangeLt:"#FFF3EC",red:"#C0392B",redLt:"#FDECEA",blue:"#1558A8",blueLt:"#EBF2FC",purple:"#6B21A8",purpleLt:"#F4EDFB",bg:"#F2F5EE",card:"#FFFFFF",border:"#DDE8D5",text:"#18230F",muted:"#5C7052"};
const card=(x={})=>({background:C.card,borderRadius:14,padding:16,marginBottom:10,boxShadow:"0 1px 6px rgba(0,0,0,.07)",border:`1px solid ${C.border}`,...x});
const btn=(bg,color="#fff",x={})=>({background:bg,color,border:"none",borderRadius:12,padding:"13px 20px",fontSize:14,fontWeight:800,cursor:"pointer",width:"100%",fontFamily:"'Nunito',sans-serif",...x});
const outlineBtn=(color,x={})=>({background:"transparent",color,border:`2px solid ${color}`,borderRadius:12,padding:"11px 18px",fontSize:14,fontWeight:800,cursor:"pointer",width:"100%",fontFamily:"'Nunito',sans-serif",...x});
const inp=(x={})=>({width:"100%",padding:"11px 13px",borderRadius:10,border:`1.5px solid ${C.border}`,fontSize:14,fontFamily:"'Nunito',sans-serif",outline:"none",background:"#FAFDFA",boxSizing:"border-box",...x});
const lbl={fontSize:11,fontWeight:800,color:C.muted,textTransform:"uppercase",letterSpacing:".6px",marginBottom:6,display:"block"};
const tag=(bg,color,x={})=>({display:"inline-flex",alignItems:"center",background:bg,color,borderRadius:20,padding:"3px 10px",fontSize:11,fontWeight:800,...x});

const BackBtn=({onBack,label="Retour"})=>(<button onClick={onBack} style={{background:"rgba(255,255,255,.18)",border:"none",borderRadius:8,padding:"6px 12px",color:"#fff",cursor:"pointer",fontSize:13,fontWeight:700,fontFamily:"'Nunito',sans-serif",display:"flex",alignItems:"center",gap:5}}>← {label}</button>);
const Row=({label:l,value:v,accent})=>(<div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"7px 0",borderBottom:`1px solid ${C.border}`}}><span style={{fontSize:13,color:C.muted}}>{l}</span><span style={{fontSize:13,fontWeight:800,color:accent?C.orange:C.text}}>{v}</span></div>);
const Header=({bg,emoji,title,subtitle,onBack})=>(<div style={{background:bg,padding:"22px 18px 28px",color:"#fff"}}>{onBack&&<BackBtn onBack={onBack}/>}<div style={{fontWeight:900,fontSize:22,marginTop:onBack?10:0,lineHeight:1.2}}>{emoji} {title}</div>{subtitle&&<div style={{fontSize:13,opacity:.85,marginTop:5}}>{subtitle}</div>}</div>);
const SubHeader=({bg,title,subtitle,onBack,backLabel})=>(<div style={{background:bg,padding:"14px 18px",color:"#fff"}}><BackBtn onBack={onBack} label={backLabel}/><div style={{fontWeight:900,fontSize:17,marginTop:8}}>{title}</div>{subtitle&&<div style={{fontSize:12,opacity:.85,marginTop:3}}>{subtitle}</div>}</div>);
const VetBtn=()=>(<button style={btn(C.purple)}>📞 Consulter un vétérinaire ⭐</button>);
const FormationBtn=()=>(<button style={{...btn(C.blue,"#fff",{marginTop:8})}}>📚 Voir les formations liées</button>);

// ═══════════════════════════════════════════
//  ACCUEIL
// ═══════════════════════════════════════════

function HomeScreen({go}){
  const modules=[
    {id:"incubation",icon:"🥚",label:"Incubation",desc:"Suivez vos incubations",bg:"#E6F4EA",accent:C.green},
    {id:"formule",icon:"🌾",label:"Formule Alimentaire",desc:"Calculez votre provende",bg:"#FEF3E8",accent:C.orange},
    {id:"maladies",icon:"🩺",label:"Assis. Maladies",desc:"Identifier et agir vite",bg:"#FDECEA",accent:C.red},
    {id:"formations",icon:"📚",label:"Formations",desc:"Cours, vidéos, PDF",bg:"#EAF1FC",accent:C.blue},
  ];
  return(
    <div>
      <div style={{background:`linear-gradient(150deg,${C.green},${C.greenDk})`,padding:"30px 18px 46px",color:"#fff"}}>
        <div style={{fontSize:11,fontWeight:700,opacity:.7,letterSpacing:1.2,marginBottom:10}}>ASSISTANT NUMÉRIQUE</div>
        <div style={{fontSize:30,fontWeight:900,lineHeight:1.15}}>AviAssist 🐓</div>
        <div style={{fontSize:14,opacity:.8,marginTop:6}}>Votre partenaire avicole au quotidien</div>
      </div>
      <div style={{margin:"0 16px",marginTop:-22,background:C.card,borderRadius:16,padding:"14px 10px",boxShadow:"0 6px 20px rgba(0,0,0,.12)",display:"flex",justifyContent:"space-around"}}>
        {[["5","Modules"],["Offline","Fonctionne"],["Gratuit","Accès"]].map(([v,l])=>(<div key={l} style={{textAlign:"center"}}><div style={{fontSize:18,fontWeight:900,color:C.green}}>{v}</div><div style={{fontSize:10,fontWeight:700,color:C.muted}}>{l}</div></div>))}
      </div>
      <div style={{padding:"18px 16px"}}>
        <div style={{fontSize:11,fontWeight:800,color:C.muted,marginBottom:12,letterSpacing:.8,textTransform:"uppercase"}}>Modules</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
          {modules.map(m=>(<button key={m.id} onClick={()=>go(m.id)} style={{background:m.bg,border:`1.5px solid ${m.accent}22`,borderRadius:16,padding:"16px 14px",cursor:"pointer",textAlign:"left"}}><div style={{fontSize:26,marginBottom:8}}>{m.icon}</div><div style={{fontSize:13,fontWeight:900,color:m.accent,lineHeight:1.3,marginBottom:4}}>{m.label}</div><div style={{fontSize:11,color:C.muted,lineHeight:1.4}}>{m.desc}</div></button>))}
        </div>
        <button onClick={()=>go("tresorerie")} style={{background:"#F5EDFB",border:`1.5px solid ${C.purple}22`,borderRadius:16,padding:"16px 18px",cursor:"pointer",width:"100%",textAlign:"left",display:"flex",alignItems:"center",gap:16}}>
          <div style={{fontSize:34}}>💰</div>
          <div><div style={{fontSize:15,fontWeight:900,color:C.purple}}>Trésorerie</div><div style={{fontSize:12,color:C.muted,marginTop:2}}>Gestion financière de vos bandes</div></div>
          <div style={{marginLeft:"auto",fontSize:20,color:C.purple,opacity:.4}}>›</div>
        </button>
        <div style={{...card({background:C.greenLt,marginTop:14})}}>
          <div style={{fontWeight:800,color:C.green,fontSize:13,marginBottom:6}}>💡 Conseil du jour</div>
          <div style={{fontSize:13,color:C.text,lineHeight:1.6}}>{getDailyTip()}</div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
//  INCUBATION
// ═══════════════════════════════════════════

function getEclosionFeedback(rate,minRate){
  if(rate>=85)return{label:"Excellent ! 🏆",color:C.green,bg:C.greenLt,msg:`Félicitations ! Un taux de ${rate}% est exceptionnel. Vos paramètres sont parfaitement maîtrisés.`};
  if(rate>=minRate)return{label:"Bon résultat ✅",color:C.green,bg:C.greenLt,msg:`Un taux de ${rate}% est dans les standards. Bon travail ! 📚 Consultez la section Formations pour progresser encore.`};
  if(rate>=40)return{label:"En dessous des standards ⚠️",color:C.orange,bg:C.orangeLt,msg:`Un taux de ${rate}% est en dessous du minimum (${minRate}%). Vérifiez : stabilité de la température, humidité, qualité des géniteurs. 📚 La section Formations propose des pistes.`};
  return{label:"Taux très faible ❌",color:C.red,bg:C.redLt,msg:`Un taux de ${rate}% est très préoccupant. Vérifier : calibration thermomètre/hygromètre, qualité des reproducteurs, conservation des œufs. 📚 La section Formations peut aider.`};
}

// Back screen map pour navigation interne
const INCUB_BACK={result:"new",history:"home",histDetail:"history",eclosionEntry:"histDetail"};

function IncubationModule({onBack,registerBack}){
  const[screen,setScreen]=useState("home");
  const[form,setForm]=useState({type:"",dateStart:"",qty:"",ambientTemp:""});
  const[hist,saveHist]=useStorage("avi:incubation_hist",[]);
  const[selHist,setSelHist]=useState(null);
  const[eclosionInput,setEI]=useState("");

  // Enregistrer le back handler
  useEffect(()=>{
    if(screen==="home"){registerBack(null);}
    else{registerBack(()=>{setScreen(INCUB_BACK[screen]||"home");return true;});}
  },[screen,registerBack]);

  const calculate=()=>{
    const egg=EGG_TYPES[form.type];
    if(!egg||!form.dateStart||!form.qty||!form.ambientTemp)return;
    const start=new Date(form.dateStart);
    const item={id:genId(),form:{...form},eclosion:addDays(start,egg.days).toISOString(),eclosionStart:addDays(start,egg.eclosionStart-1).toISOString(),eclosionEnd:addDays(start,egg.eclosionWindow[1]-1).toISOString(),mirages:egg.mirage.map(d=>({day:d,date:addDays(start,d-1).toISOString()})),stopDate:addDays(start,egg.stopTurn-1).toISOString(),humidStart:egg.humid?addDays(start,egg.humid[0]-1).toISOString():null,humidEnd:egg.humid?addDays(start,egg.humid[1]-1).toISOString():null,at:new Date().toISOString()};
    saveHist([item,...(hist||[])].slice(0,20));
    setSelHist(item);setScreen("result");
  };

  const saveEclosion=()=>{
    if(!selHist||!eclosionInput)return;
    const hatched=parseInt(eclosionInput),total=parseInt(selHist.form.qty);
    const rate=Math.round(hatched/total*100);
    const updated={...selHist,eclosionResult:{hatched,total,rate,savedAt:new Date().toISOString()}};
    saveHist((hist||[]).map(h=>h.id===selHist.id?updated:h));
    setSelHist(updated);setEI("");setScreen("histDetail");
  };

  if(screen==="eclosionEntry"&&selHist){
    const egg=EGG_TYPES[selHist.form.type],total=parseInt(selHist.form.qty);
    return(<div>
      <SubHeader bg={`linear-gradient(135deg,${C.green},${C.greenDk})`} title="Résultat d'éclosion" subtitle={`${egg?.name} · ${total} œufs`} onBack={()=>setScreen("histDetail")} backLabel="Détail"/>
      <div style={{padding:16}}>
        <div style={{...card({background:C.greenLt})}}>
          <div style={{fontWeight:800,color:C.green,marginBottom:10}}>🐣 Combien d'œufs ont éclos ?</div>
          <span style={lbl}>Nombre de {egg?.youngName||"animaux"} éclos</span>
          <input type="number" placeholder={`Ex: ${Math.round(total*0.75)}`} style={{...inp({fontSize:22,fontWeight:700,textAlign:"center"}),marginBottom:8}} value={eclosionInput} onChange={e=>setEI(e.target.value.replace(/[^0-9]/g,""))}/>
          <div style={{fontSize:12,color:C.muted,textAlign:"center",marginBottom:16}}>sur {total} œufs mis en incubation</div>
          {eclosionInput&&parseInt(eclosionInput)<=total&&(<div style={{background:"#fff",borderRadius:10,padding:"10px 12px",marginBottom:16,textAlign:"center"}}><div style={{fontSize:11,color:C.muted}}>Taux calculé</div><div style={{fontSize:30,fontWeight:900,color:C.green}}>{Math.round(parseInt(eclosionInput)/total*100)}%</div></div>)}
          <button onClick={saveEclosion} style={btn(eclosionInput&&parseInt(eclosionInput)<=total?C.green:"#CCC")} disabled={!eclosionInput||parseInt(eclosionInput)>total}>✓ Enregistrer le résultat</button>
        </div>
      </div>
    </div>);
  }

  if(screen==="histDetail"&&selHist){
    const egg=EGG_TYPES[selHist.form.type];
    const now=new Date(),ecloDate=new Date(selHist.eclosion);
    const currentDay=Math.floor((now-new Date(selHist.form.dateStart))/86400000)+1;
    const isActive=now<ecloDate,isComplete=!isActive&&!selHist.eclosionResult,hasResult=!!selHist.eclosionResult;
    return(<div>
      <div style={{background:`linear-gradient(135deg,${C.green},${C.greenDk})`,padding:"14px 18px",color:"#fff"}}>
        <BackBtn onBack={()=>setScreen("history")} label="Historique"/>
        <div style={{fontWeight:900,fontSize:19,marginTop:8}}>{egg?.icon} {egg?.name}</div>
        <div style={{fontSize:13,opacity:.85}}>{selHist.form.qty} œufs</div>
        <div style={{marginTop:8,display:"flex",gap:8,flexWrap:"wrap"}}>
          {isActive&&<span style={{...tag("rgba(255,255,255,.25)","#fff")}}>🔄 J{currentDay} en cours</span>}
          {isComplete&&<span style={{...tag("rgba(255,165,0,.4)","#fff")}}>⏳ Résultat manquant</span>}
          {hasResult&&<span style={{...tag("rgba(255,255,255,.25)","#fff")}}>✅ Résultat enregistré</span>}
        </div>
      </div>
      <div style={{padding:"14px 16px"}}>
        {isActive&&(<div style={{...card({background:C.greenLt})}}>
          <div style={{fontWeight:800,color:C.green,marginBottom:8}}>📅 Statut actuel</div>
          <Row label="Aujourd'hui" value={`Jour ${currentDay} / ${egg?.days}`} accent/>
          <Row label="Éclosion prévue" value={fmtDate(selHist.eclosion)}/>
          {currentDay<=(egg?.stopTurn||18)?<Row label="Retournement du jour" value={egg?.turnHours?.join(" – ")||"—"}/>:<Row label="Retournement" value="Arrêté ✅"/>}
        </div>)}
        {hasResult&&(()=>{const fb=getEclosionFeedback(selHist.eclosionResult.rate,egg?.minRate||65);return(<div style={{...card({background:fb.bg})}}>
          <div style={{fontWeight:800,color:fb.color,marginBottom:10,fontSize:15}}>{fb.label}</div>
          <div style={{fontSize:28,fontWeight:900,color:fb.color,marginBottom:4}}>{selHist.eclosionResult.rate}%</div>
          <div style={{fontSize:12,color:C.muted,marginBottom:10}}>{selHist.eclosionResult.hatched} éclos sur {selHist.eclosionResult.total} œufs</div>
          <div style={{fontSize:13,lineHeight:1.6,color:C.text}}>{fb.msg}</div>
        </div>);})()}
        <div style={{...card()}}>
          <div style={{fontWeight:800,fontSize:14,marginBottom:12}}>📅 Dates clés</div>
          <Row label="Mise en incubation" value={fmtDate(selHist.form.dateStart)}/>
          {selHist.mirages?.map(m=><Row key={m.day} label={`Mirage (J${m.day})`} value={fmtDate(m.date)}/>)}
          {egg?.humid&&<Row label={`Humidification externe (J${egg.humid[0]}–J${egg.humid[1]})`} value={`${fmtDate(selHist.humidStart)} – ${fmtDate(selHist.humidEnd)}`}/>}
          <Row label={`Arrêt retournement (J${egg?.stopTurn})`} value={fmtDate(selHist.stopDate)}/>
          <Row label={`Début d'éclosion (J${egg?.eclosionStart})`} value={fmtDate(selHist.eclosionStart)}/>
          <Row label={`Fenêtre (J${egg?.eclosionWindow[0]}–J${egg?.eclosionWindow[1]})`} value={`${fmtDate(selHist.eclosionStart)} – ${fmtDate(selHist.eclosionEnd)}`} accent/>
        </div>
        {isComplete&&(<button onClick={()=>{setEI("");setScreen("eclosionEntry");}} style={btn(C.green)}>🐣 Enregistrer le résultat d'éclosion</button>)}
      </div>
    </div>);
  }

  if(screen==="history"){
    return(<div>
      <SubHeader bg={`linear-gradient(135deg,${C.green},${C.greenDk})`} title="Historique" subtitle={`${(hist||[]).length} incubation(s)`} onBack={()=>setScreen("home")} backLabel="Incubation"/>
      <div style={{padding:16}}>
        {(hist||[]).length===0?(<div style={{...card(),textAlign:"center",padding:32,color:C.muted}}><div style={{fontSize:40,marginBottom:12}}>📋</div><div style={{fontWeight:700}}>Aucune incubation enregistrée</div></div>)
        :(hist||[]).map((h,i)=>{
          const egg=EGG_TYPES[h.form?.type];
          const now=new Date(),isActive=now<new Date(h.eclosion),hasResult=!!h.eclosionResult;
          const dayN=Math.floor((now-new Date(h.form?.dateStart))/86400000)+1;
          return(<button key={i} onClick={()=>{setSelHist(h);setScreen("histDetail");}} style={{...card({cursor:"pointer",width:"100%",textAlign:"left"})}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
              <div style={{fontWeight:800,fontSize:15}}>{egg?.icon} {egg?.name}</div>
              {isActive?<span style={{...tag(C.greenLt,C.green)}}>J{dayN} en cours</span>:hasResult?<span style={{...tag(C.blueLt,C.blue)}}>✅ {h.eclosionResult.rate}%</span>:<span style={{...tag(C.orangeLt,C.orange)}}>⏳ Résultat manquant</span>}
            </div>
            <div style={{fontSize:12,color:C.muted}}>Mise : {fmtDate(h.form?.dateStart)} · {h.form?.qty} œufs</div>
            <div style={{fontSize:12,color:C.muted}}>Fenêtre : {fmtDate(h.eclosionStart)} – {fmtDate(h.eclosionEnd)}</div>
            <div style={{fontSize:11,color:C.blue,marginTop:4,fontWeight:700}}>Appuyer pour voir le détail →</div>
          </button>);
        })}
      </div>
    </div>);
  }

  if(screen==="new"){
    const egg=EGG_TYPES[form.type];
    const canCalc=form.type&&form.dateStart&&form.qty&&form.ambientTemp;
    return(<div>
      <SubHeader bg={`linear-gradient(135deg,${C.green},${C.greenDk})`} title="Nouvelle incubation" onBack={()=>setScreen("home")} backLabel="Incubation"/>
      <div style={{padding:16}}>
        <div style={{...card()}}>
          <span style={lbl}>Type d'œuf</span>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:14}}>
            {Object.entries(EGG_TYPES).map(([k,e])=>(<button key={k} onClick={()=>setForm(f=>({...f,type:k}))} style={{background:form.type===k?C.green:C.bg,color:form.type===k?"#fff":C.text,border:`2px solid ${form.type===k?C.green:C.border}`,borderRadius:10,padding:"10px 8px",cursor:"pointer",fontFamily:"'Nunito',sans-serif",fontWeight:700,fontSize:12,display:"flex",alignItems:"center",gap:6}}>{e.icon} {e.name}</button>))}
          </div>
          {egg&&(<div style={{background:C.greenLt,borderRadius:10,padding:10,marginBottom:14,fontSize:13,color:C.green}}><strong>{egg.days} jours</strong> · Mirage J{egg.mirage.join(", J")} · Arrêt J{egg.stopTurn} · {egg.turnsPerDay}×/j</div>)}
          <span style={lbl}>Date de mise en incubation</span>
          <input type="date" style={{...inp(),marginBottom:14}} value={form.dateStart} onChange={e=>setForm(f=>({...f,dateStart:e.target.value}))}/>
          <span style={lbl}>Nombre d'œufs</span>
          <input type="number" placeholder="Ex: 100" style={{...inp(),marginBottom:16}} value={form.qty} onChange={e=>setForm(f=>({...f,qty:e.target.value}))}/>
          <span style={lbl}>🌡️ Température approximative de votre salle</span>
          <div style={{display:"grid",gridTemplateColumns:"1fr",gap:8,marginBottom:20}}>
            {AMBIENT_TEMPS.map(a=>(<button key={a.id} onClick={()=>setForm(f=>({...f,ambientTemp:a.id}))} style={{background:form.ambientTemp===a.id?a.color:C.bg,color:form.ambientTemp===a.id?"#fff":C.text,border:`2px solid ${form.ambientTemp===a.id?a.color:C.border}`,borderRadius:10,padding:"11px 14px",cursor:"pointer",fontFamily:"'Nunito',sans-serif",fontWeight:700,fontSize:14,textAlign:"left",display:"flex",alignItems:"center",gap:10}}><span style={{fontSize:20}}>{a.icon}</span><span>{a.label}</span>{form.ambientTemp===a.id&&a.mode&&(<span style={{marginLeft:"auto",fontSize:11,opacity:.8}}>{a.mode==="chaud"?"Paramètres ajustés":"⚠️ Mode forte chaleur"}</span>)}</button>))}
          </div>
          <button onClick={calculate} style={btn(canCalc?C.green:"#AAC8AA")} disabled={!canCalc}>Calculer mon incubation →</button>
        </div>
      </div>
    </div>);
  }

  if(screen==="result"&&selHist){
    const egg=EGG_TYPES[selHist.form.type];
    const at=AMBIENT_TEMPS.find(a=>a.id===selHist.form.ambientTemp)||AMBIENT_TEMPS[0];
    const adaptedPhases=adaptPhases(egg.phases,at.id);
    const isAdapted=at.id!=="standard";
    return(<div>
      <div style={{background:`linear-gradient(135deg,${C.green},${C.greenDk})`,padding:"14px 18px",color:"#fff"}}>
        <BackBtn onBack={()=>setScreen("new")} label="Modifier"/>
        <div style={{fontWeight:900,fontSize:19,marginTop:8}}>{egg.icon} Incubation {egg.name}</div>
        <div style={{fontSize:13,opacity:.85}}>{selHist.form.qty} œufs · {at.icon} {at.label}</div>
      </div>
      <div style={{padding:"14px 16px"}}>
        {at.mode==="chaud"&&(<div style={{...card({background:C.orangeLt,border:`1px solid ${C.orange}44`})}}>
          <div style={{fontWeight:800,color:C.orange,marginBottom:6}}>🔥 Chaleur ambiante détectée (36–38°C)</div>
          <div style={{fontSize:13,lineHeight:1.6}}>Paramètres <strong>automatiquement ajustés</strong>. Surveillez la température interne toutes les 2–3h. Si elle dépasse 37.8°C, ajoutez de l'eau fraîche dans les bacs. Ne jamais verser d'eau froide directement sur les œufs.</div>
        </div>)}
        {at.mode==="extreme"&&(<div style={{...card({background:C.redLt,border:`1px solid ${C.red}44`})}}>
          <div style={{fontWeight:800,color:C.red,marginBottom:6}}>☀️ ⚠️ Mode forte chaleur (39°C et plus)</div>
          <div style={{fontSize:13,lineHeight:1.6}}>À partir de 39°C ambiants, le risque de surchauffe embryonnaire devient <strong>critique</strong>. Surveiller toutes les heures. Ventiler fortement la salle. Des glaçons dans les bacs peuvent aider — jamais au contact des œufs.</div>
        </div>)}
        <div style={{...card({background:C.greenLt})}}>
          <div style={{fontWeight:800,color:C.green,marginBottom:12,fontSize:14}}>📅 Dates clés</div>
          <Row label="Mise en incubation" value={fmtDate(selHist.form.dateStart)}/>
          {selHist.mirages.map(m=><Row key={m.day} label={`Mirage (J${m.day})`} value={fmtDate(m.date)}/>)}
          {egg.humid&&<Row label={`Humidification externe (J${egg.humid[0]}–J${egg.humid[1]})`} value={`${fmtDate(selHist.humidStart)} – ${fmtDate(selHist.humidEnd)}`}/>}
          <Row label={`Arrêt retournement (J${egg.stopTurn})`} value={fmtDate(selHist.stopDate)}/>
          <Row label={`Début d'éclosion (J${egg.eclosionStart})`} value={fmtDate(selHist.eclosionStart)}/>
          <Row label={`Fenêtre (J${egg.eclosionWindow[0]}–J${egg.eclosionWindow[1]})`} value={`${fmtDate(selHist.eclosionStart)} – ${fmtDate(selHist.eclosionEnd)}`} accent/>
        </div>
        <div style={{...card({background:"#F0F4FF",border:`1px solid ${C.blue}22`,padding:"10px 14px",marginTop:-4})}}>
          <div style={{fontSize:12,color:C.blue,lineHeight:1.5}}>💡 La fenêtre d'éclosion peut varier de 1 à 2 jours selon la stabilité de la température. Ne vous inquiétez pas si les premiers œufs piquent un peu avant ou après.</div>
        </div>
        <div style={{...card()}}>
          <div style={{fontWeight:800,fontSize:14,marginBottom:6}}>⚙️ Paramètres recommandés</div>
          {isAdapted&&(<div style={{background:`${at.color}15`,borderRadius:8,padding:"6px 10px",marginBottom:10,fontSize:11,color:at.color,fontWeight:700}}>{at.icon} Paramètres adaptés à la chaleur ambiante {at.label}</div>)}
          {adaptedPhases.map((p,i)=>(<div key={i} style={{background:C.bg,borderRadius:10,padding:"10px 12px",marginBottom:8}}>
            <div style={{fontWeight:800,fontSize:12,color:C.green,marginBottom:6}}>{p.label}</div>
            <div style={{display:"flex",gap:14,fontSize:13,flexWrap:"wrap"}}><span>🌡️ <strong>{p.temp}</strong></span><span>💧 <strong>{p.hum}</strong></span></div>
            {p.note&&<div style={{fontSize:11,color:C.orange,marginTop:5,fontWeight:700}}>⚠️ {p.note}</div>}
          </div>))}
          <Row label="Retournements / jour" value={`${egg.turnsPerDay}× par jour`}/>
          <div style={{padding:"7px 0",fontSize:13}}>
            <span style={{color:C.muted}}>Heures recommandées</span>
            <div style={{display:"flex",gap:6,flexWrap:"wrap",marginTop:6}}>{egg.turnHours.map(h=><span key={h} style={{...tag(C.greenLt,C.green)}}>🕐 {h}</span>)}</div>
          </div>
          <div style={{background:C.greenLt,borderRadius:10,padding:"10px 12px",marginTop:8,fontSize:12,color:C.green,lineHeight:1.6}}>
            💡 <strong>En pratique</strong>, 2 retournements par jour (matin et soir) donnent aussi de bons résultats. L'essentiel est la régularité — mieux vaut 2× réguliers que 3× irréguliers.
          </div>
        </div>
        <div style={{...card()}}>
          <div style={{fontWeight:800,fontSize:14,marginBottom:12}}>🔔 Rappels importants</div>
          {egg.tips.map((t,i)=>(<div key={i} style={{display:"flex",gap:10,padding:"8px 0",borderBottom:i<egg.tips.length-1?`1px solid ${C.border}`:"none"}}>
            <span style={{background:C.green,color:"#fff",borderRadius:6,padding:"2px 7px",fontSize:11,fontWeight:900,flexShrink:0,height:"fit-content"}}>J{t.day}</span>
            <span style={{fontSize:13,lineHeight:1.6,color:C.text}}>{t.text}</span>
          </div>))}
        </div>
        <div style={{...card({background:C.greenLt})}}>
          <div style={{fontWeight:800,color:C.green,marginBottom:10}}>💎 À retenir pour cette espèce</div>
          {egg.specialTips.map((t,i)=>(<div key={i} style={{display:"flex",gap:8,padding:"5px 0",fontSize:13,lineHeight:1.5,alignItems:"flex-start"}}><span style={{color:C.green,flexShrink:0}}>•</span>{t}</div>))}
        </div>
        <div style={{...card({background:C.orangeLt})}}>
          <div style={{fontWeight:800,color:C.orange,fontSize:12,marginBottom:4}}>📚 Section Formations</div>
          <div style={{fontSize:12,lineHeight:1.5}}>Des tutoriels gratuits sur le mirage et le démarrage sont disponibles dans la section <strong>Formations</strong>.</div>
        </div>
      </div>
    </div>);
  }

  return(<div>
    <Header bg={`linear-gradient(150deg,${C.green},${C.greenDk})`} emoji="🥚" title="Incubation des œufs" subtitle="Guidez chaque incubation pas à pas" onBack={onBack}/>
    <div style={{padding:16}}>
      <button onClick={()=>{setForm({type:"",dateStart:"",qty:"",ambientTemp:""});setScreen("new");}} style={{...btn(C.green),marginBottom:10}}>+ Nouvelle incubation</button>
      <button onClick={()=>setScreen("history")} style={outlineBtn(C.green)}>📋 Historique ({(hist||[]).length})</button>
      <div style={{...card({background:C.greenLt,marginTop:14})}}>
        <div style={{fontWeight:800,color:C.green,marginBottom:8}}>💡 Le saviez-vous ?</div>
        <div style={{fontSize:13,lineHeight:1.6}}>Un taux d'éclosion de <strong>70–85%</strong> est excellent. L'application adapte automatiquement les paramètres selon la chaleur de votre salle d'incubation.</div>
      </div>
    </div>
  </div>);
}

// ═══════════════════════════════════════════
//  FORMULE ALIMENTAIRE
// ═══════════════════════════════════════════

const FORM_BACK={ingredients:"type",result:"ingredients"};

function FormuleModule({onBack,registerBack}){
  const[screen,setScreen]=useState("home");
  const[animalType,setAnimalType]=useState("");
  const[phase,setPhase]=useState("");
  const[selectedIds,setSelectedIds]=useState([]);
  const[openCat,setOpenCat]=useState("energetique");
  const[quantity,setQuantity]=useState("");
  const[result,setResult]=useState(null);

  useEffect(()=>{
    if(screen==="home"){registerBack(null);}
    else{registerBack(()=>{setScreen(FORM_BACK[screen]||"home");return true;});}
  },[screen,registerBack]);

  const toggleIng=id=>setSelectedIds(s=>s.includes(id)?s.filter(x=>x!==id):[...s,id]);

  const calculate=()=>{
    if(!phase||!quantity||!selectedIds.length)return;
    const res=formuler(selectedIds,phase,parseFloat(quantity));
    setResult(res);setScreen("result");
  };

  if(screen==="result"&&result){
    const targetInfo=FEED_TARGETS[phase];
    const hasCritique=result.alerts.some(a=>a.level==="critique");
    return(<div>
      <div style={{background:`linear-gradient(135deg,${C.orange},#B94F08)`,padding:"14px 18px",color:"#fff"}}>
        <BackBtn onBack={()=>setScreen("ingredients")} label="Modifier"/>
        <div style={{fontWeight:900,fontSize:18,marginTop:8}}>🌾 Formule calculée</div>
        <div style={{fontSize:12,opacity:.85}}>{targetInfo?.label} · {quantity} kg</div>
      </div>
      <div style={{padding:"14px 16px"}}>
        {/* Alertes */}
        {result.alerts.map((a,i)=>{
          const colors={critique:{bg:C.redLt,color:C.red,icon:"🚨"},important:{bg:C.orangeLt,color:C.orange,icon:"⚠️"},warning:{bg:"#FFF9E6",color:"#856400",icon:"💡"}};
          const c=colors[a.level]||colors.warning;
          return(<div key={i} style={{...card({background:c.bg,border:`1px solid ${c.color}33`,marginBottom:8})}}>
            <div style={{fontWeight:800,color:c.color,marginBottom:4}}>{c.icon} {a.level==="critique"?"Bloquant":a.level==="important"?"Important":"Conseil"}</div>
            <div style={{fontSize:13,lineHeight:1.6,marginBottom:6}}>{a.msg}</div>
            <div style={{fontSize:12,background:"rgba(0,0,0,.05)",borderRadius:8,padding:"6px 10px",lineHeight:1.5,color:c.color}}>👉 {a.action}</div>
            {a.consequence&&<div style={{fontSize:11,color:c.color,marginTop:6,fontStyle:"italic"}}>Sans action : {a.consequence}</div>}
          </div>);
        })}

        {/* Formule */}
        {!hasCritique&&result.formula&&(<>
          <div style={{...card()}}>
            <div style={{fontWeight:800,fontSize:14,marginBottom:4}}>📋 Formule pour {quantity} kg de provende</div>
            <div style={{fontSize:11,color:C.muted,marginBottom:12}}>Triée par proportion décroissante</div>
            <div style={{background:C.bg,borderRadius:10,overflow:"hidden"}}>
              {/* Header */}
              <div style={{display:"grid",gridTemplateColumns:"1fr 60px 70px",gap:8,padding:"8px 12px",background:"#E8E8E8"}}>
                <div style={{fontSize:11,fontWeight:800,color:C.muted}}>INGRÉDIENT</div>
                <div style={{fontSize:11,fontWeight:800,color:C.muted,textAlign:"center"}}>%</div>
                <div style={{fontSize:11,fontWeight:800,color:C.muted,textAlign:"right"}}>QTÉ</div>
              </div>
              {result.formula.map((ing,i)=>{
                const catColor=INGREDIENT_CATS.find(c=>c.id===ing.family)?.color||C.muted;
                return(<div key={i} style={{display:"grid",gridTemplateColumns:"1fr 60px 70px",gap:8,padding:"10px 12px",borderBottom:i<result.formula.length-1?`1px solid ${C.border}`:"none",background:i%2===0?"#fff":"#FAFAFA"}}>
                  <div>
                    <div style={{fontSize:13,fontWeight:700}}>{ing.name}</div>
                    <div style={{fontSize:10,color:catColor,fontWeight:700,marginTop:1}}>{INGREDIENT_CATS.find(c=>c.id===ing.family)?.label}</div>
                  </div>
                  <div style={{textAlign:"center",fontSize:14,fontWeight:900,color:C.text}}>{ing.pct}%</div>
                  <div style={{textAlign:"right",fontSize:14,fontWeight:900,color:C.green}}>{fmtQty(ing.qtyKg)}</div>
                </div>);
              })}
              {/* Total */}
              <div style={{display:"grid",gridTemplateColumns:"1fr 60px 70px",gap:8,padding:"10px 12px",background:"#E8F5EC",borderTop:`2px solid ${C.green}`}}>
                <div style={{fontSize:13,fontWeight:900}}>TOTAL</div>
                <div style={{textAlign:"center",fontSize:14,fontWeight:900,color:C.green}}>100%</div>
                <div style={{textAlign:"right",fontSize:14,fontWeight:900,color:C.green}}>{fmtQty(parseFloat(quantity))}</div>
              </div>
            </div>
          </div>

          {/* Valeurs nutritionnelles atteintes */}
          <div style={{...card({background:C.greenLt})}}>
            <div style={{fontWeight:800,color:C.green,marginBottom:10}}>📊 Valeurs nutritionnelles estimées</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
              {[
                {label:"Énergie",achieved:Math.round(result.achieved.energy)+" kcal/kg",raw:result.target.energy,unit:" kcal/kg",dec:0,ok:result.achieved.energy>=targetMin(result.target.energy)*0.9&&result.achieved.energy<=(isRange(result.target.energy)?targetMax(result.target.energy):Infinity)},
                {label:"Protéines",achieved:result.achieved.protein.toFixed(1)+"%",raw:result.target.protein,unit:"%",dec:1,ok:result.achieved.protein>=targetMin(result.target.protein)*0.9},
                {label:"Calcium",achieved:result.achieved.calcium.toFixed(2)+"%",raw:result.target.calcium,unit:"%",dec:2,ok:result.achieved.calcium>=targetMin(result.target.calcium)*0.9},
                {label:"Phosphore",achieved:result.achieved.phosphorus.toFixed(2)+"%",raw:result.target.phosphorus,unit:"%",dec:2,ok:result.achieved.phosphorus>=targetMin(result.target.phosphorus)*0.9},
                {label:"Méthionine",achieved:result.achieved.methionine.toFixed(2)+"%",raw:result.target.methionine||0,unit:"%",dec:2,ok:result.achieved.methionine>=targetMin(result.target.methionine||0)*0.9},
                {label:"Lysine",achieved:result.achieved.lysine.toFixed(2)+"%",raw:result.target.lysine||0,unit:"%",dec:2,ok:result.achieved.lysine>=targetMin(result.target.lysine||0)*0.9},
              ].map((v,i)=>(<div key={i} style={{background:v.ok?"#fff":C.orangeLt,borderRadius:10,padding:"10px 12px",border:`1px solid ${v.ok?C.border:C.orange}22`}}>
                <div style={{fontSize:11,color:C.muted,marginBottom:4}}>{v.label}</div>
                <div style={{fontSize:16,fontWeight:900,color:v.ok?C.green:C.orange}}>{v.achieved}</div>
                <div style={{fontSize:10,color:C.muted}}>Cible : {fmtTarget(v.raw,v.unit,v.dec)}</div>
              </div>))}
            </div>
          </div>

          <div style={{...card({background:C.orangeLt})}}>
            <div style={{fontWeight:800,color:C.orange,fontSize:12,marginBottom:4}}>⚠️ Important</div>
            <div style={{fontSize:12,lineHeight:1.5}}>Cette formule est une <strong>estimation de base</strong>. Les valeurs réelles dépendent de la qualité de vos ingrédients. Faites valider par un technicien ou un vétérinaire avant utilisation à grande échelle.</div>
          </div>

          <button onClick={()=>{setSelectedIds([]);setPhase("");setAnimalType("");setQuantity("");setScreen("type");}} style={btn(C.orange)}>+ Calculer une nouvelle formule</button>
        </>)}

        {hasCritique&&(<button onClick={()=>setScreen("ingredients")} style={btn(C.orange,undefined,{marginTop:8})}>← Corriger ma sélection</button>)}
      </div>
    </div>);
  }

  if(screen==="ingredients"){
    return(<div>
      <div style={{background:`linear-gradient(135deg,${C.orange},#B94F08)`,padding:"14px 18px",color:"#fff"}}>
        <BackBtn onBack={()=>setScreen("type")} label="Retour"/>
        <div style={{fontWeight:900,fontSize:17,marginTop:8}}>Sélectionner les ingrédients</div>
        <div style={{fontSize:12,opacity:.85,marginTop:3}}>{FEED_TARGETS[phase]?.label} · {selectedIds.length} ingrédient(s)</div>
      </div>
      <div style={{padding:16}}>
        <div style={{...card({background:C.orangeLt,marginBottom:12})}}>
          <div style={{fontSize:12,color:C.orange,lineHeight:1.5}}>💡 Cochez uniquement les ingrédients <strong>disponibles dans votre localité</strong>. L'outil adaptera automatiquement les proportions.</div>
        </div>

        {INGREDIENT_CATS.map(cat=>{
          const catIngs=INGREDIENTS.filter(i=>i.family===cat.id);
          const selected=catIngs.filter(i=>selectedIds.includes(i.id)).length;
          return(<div key={cat.id} style={{marginBottom:8}}>
            <button onClick={()=>setOpenCat(openCat===cat.id?null:cat.id)} style={{width:"100%",background:openCat===cat.id?cat.color:C.bg,color:openCat===cat.id?"#fff":C.text,border:`1.5px solid ${openCat===cat.id?cat.color:C.border}`,borderRadius:10,padding:"10px 14px",cursor:"pointer",textAlign:"left",fontWeight:700,fontSize:13,fontFamily:"'Nunito',sans-serif",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span>{cat.label}</span>
              <span style={{fontSize:11,opacity:.8}}>{selected}/{catIngs.length} · {openCat===cat.id?"▲":"▼"}</span>
            </button>
            {openCat===cat.id&&(<div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:"0 0 10px 10px",overflow:"hidden"}}>
              {catIngs.map(ing=>(<button key={ing.id} onClick={()=>toggleIng(ing.id)} style={{width:"100%",background:selectedIds.includes(ing.id)?"#FFF3EC":"transparent",border:"none",borderBottom:`1px solid ${C.border}`,padding:"11px 14px",cursor:"pointer",textAlign:"left",display:"flex",alignItems:"center",gap:12,fontFamily:"'Nunito',sans-serif"}}>
                <div style={{width:20,height:20,borderRadius:5,flexShrink:0,background:selectedIds.includes(ing.id)?C.orange:"transparent",border:`2px solid ${selectedIds.includes(ing.id)?C.orange:C.border}`,display:"flex",alignItems:"center",justifyContent:"center"}}>
                  {selectedIds.includes(ing.id)&&<span style={{color:"#fff",fontSize:12,fontWeight:900}}>✓</span>}
                </div>
                <div style={{flex:1}}>
                  <div style={{fontSize:13,fontWeight:600,color:selectedIds.includes(ing.id)?C.orange:C.text}}>{ing.name}</div>
                  <div style={{fontSize:10,color:C.muted}}>Protéines : {ing.protein}% · Max recommandé : {ing.maxPct}%</div>
                </div>
              </button>))}
            </div>)}
          </div>);
        })}

        {selectedIds.length>0&&(<div style={{...card({background:C.greenLt,marginTop:4})}}>
          <span style={lbl}>Quantité à produire (kg)</span>
          <input type="number" placeholder="Ex: 50" style={{...inp({fontSize:18,fontWeight:700}),marginBottom:14}} value={quantity} onChange={e=>setQuantity(e.target.value)}/>
          <button onClick={calculate} style={btn(quantity?C.orange:"#CCC")} disabled={!quantity}>Calculer la formule →</button>
        </div>)}
      </div>
    </div>);
  }

  if(screen==="type"){
    return(<div>
      <SubHeader bg={`linear-gradient(135deg,${C.orange},#B94F08)`} title="Type d'élevage et phase" onBack={()=>setScreen("home")} backLabel="Formule"/>
      <div style={{padding:16}}>
        <div style={{...card()}}>
          <span style={lbl}>Type d'animal</span>
          <div style={{display:"grid",gridTemplateColumns:"1fr",gap:8,marginBottom:16}}>
            {Object.entries(FEED_TYPE_PHASES).map(([k,t])=>(<button key={k} onClick={()=>{setAnimalType(k);setPhase("");}} style={{background:animalType===k?C.orange:C.bg,color:animalType===k?"#fff":C.text,border:`2px solid ${animalType===k?C.orange:C.border}`,borderRadius:10,padding:"12px 14px",cursor:"pointer",fontFamily:"'Nunito',sans-serif",fontWeight:700,fontSize:14,textAlign:"left"}}>{t.label}</button>))}
          </div>
          {animalType&&(<>
            <span style={lbl}>Phase d'élevage</span>
            <div style={{display:"grid",gridTemplateColumns:"1fr",gap:8,marginBottom:20}}>
              {FEED_TYPE_PHASES[animalType].phases.map(p=>(<button key={p.id} onClick={()=>setPhase(p.id)} style={{background:phase===p.id?C.orange:C.bg,color:phase===p.id?"#fff":C.text,border:`2px solid ${phase===p.id?C.orange:C.border}`,borderRadius:10,padding:"12px 14px",cursor:"pointer",fontFamily:"'Nunito',sans-serif",fontWeight:700,fontSize:13,textAlign:"left",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span>{p.label}</span>
                {phase===p.id&&<span style={{fontSize:11,opacity:.8}}>Protéines cible : {fmtTarget(FEED_TARGETS[p.id]?.protein,"%",1)}</span>}
              </button>))}
            </div>
          </>)}
          <button onClick={()=>setScreen("ingredients")} style={btn(phase?C.orange:"#CCC")} disabled={!phase}>Choisir les ingrédients →</button>
        </div>
      </div>
    </div>);
  }

  return(<div>
    <Header bg={`linear-gradient(150deg,${C.orange},#B94F08)`} emoji="🌾" title="Formule Alimentaire" subtitle="Calculez votre provende maison" onBack={onBack}/>
    <div style={{padding:16}}>
      <button onClick={()=>setScreen("type")} style={btn(C.orange)}>Calculer une formule</button>
      <div style={{...card({background:C.orangeLt,marginTop:14})}}>
        <div style={{fontWeight:800,color:C.orange,marginBottom:8}}>💡 Comment ça marche ?</div>
        <div style={{fontSize:13,lineHeight:1.8}}>
          1️⃣ Choisissez le type d'animal et la phase{"\n"}
          2️⃣ Cochez les ingrédients disponibles chez vous{"\n"}
          3️⃣ Indiquez la quantité à produire{"\n"}
          4️⃣ L'application calcule automatiquement votre formule en kg
        </div>
      </div>
      <div style={{...card({marginTop:4})}}>
        <div style={{fontWeight:800,marginBottom:8}}>📊 Rations disponibles</div>
        {Object.values(FEED_TYPE_PHASES).map((t,i)=>(<div key={i} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:`1px solid ${C.border}`,fontSize:13}}>
          <span>{t.label}</span><span style={{color:C.muted}}>{t.phases.length} phases</span>
        </div>))}
      </div>
    </div>
  </div>);
}

// ═══════════════════════════════════════════
//  MALADIES
// ═══════════════════════════════════════════

const MAL_BACK={symptoms:"home",results:"symptoms",library:"home"};

function MaladiesModule({onBack,registerBack}){
  const[screen,setScreen]=useState("home");
  const[selected,setSelected]=useState([]);
  const[results,setResults]=useState([]);
  const[detail,setDetail]=useState(null);
  const[openCat,setOpenCat]=useState("digestifs");

  useEffect(()=>{
    if(detail){registerBack(()=>{setDetail(null);return true;});}
    else if(screen==="home"){registerBack(null);}
    else{registerBack(()=>{setScreen(MAL_BACK[screen]||"home");return true;});}
  },[screen,detail,registerBack]);

  const toggle=id=>setSelected(s=>s.includes(id)?s.filter(x=>x!==id):[...s,id]);
  const analyze=()=>{setResults(diagnose(selected));setScreen("results");};

  const WarningVet=()=>(<>
    <div style={{...card({background:C.redLt,border:`1px solid ${C.red}33`,marginBottom:8})}}>
      <div style={{fontWeight:800,color:C.red,fontSize:12,marginBottom:4}}>⚕️ AVERTISSEMENT</div>
      <div style={{fontSize:12,color:C.red,lineHeight:1.5}}>Ces informations sont des <strong>conseils préliminaires uniquement</strong>. Elles ne remplacent jamais un diagnostic vétérinaire professionnel.</div>
    </div>
    <div style={{...card({background:C.purpleLt,border:`1px solid ${C.purple}33`})}}>
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}><span style={{...tag(C.purple,"#fff")}}>⭐ Premium</span><span style={{fontWeight:800,color:C.purple,fontSize:13}}>Consulter un vétérinaire</span></div>
      <div style={{fontSize:13,lineHeight:1.6,marginBottom:10}}>Pour un diagnostic fiable et un traitement adapté, consultez un vétérinaire partenaire AviAssist — réponse en moins de 24h.</div>
      <VetBtn/>
    </div>
  </>);

  if(detail){return(<div>
    <div style={{background:`linear-gradient(135deg,${C.red},#8B1A1A)`,padding:"14px 18px",color:"#fff"}}>
      <BackBtn onBack={()=>setDetail(null)} label="Résultats"/>
      <div style={{fontWeight:900,fontSize:19,marginTop:8}}>{detail.name}</div>
      <span style={{...tag(`${detail.color}44`,"#fff"),marginTop:6}}>⚠️ Gravité : {detail.severity}</span>
    </div>
    <div style={{padding:16}}>
      {detail.special==="grippe"&&(<div style={{...card({background:"#FFF0F0",border:`2px solid ${C.red}`,marginBottom:10})}}>
        <div style={{fontWeight:800,color:C.red,fontSize:13,marginBottom:6}}>🚨 CAS URGENT</div>
        <div style={{fontSize:13,color:C.red,lineHeight:1.6}}>⚠️ Cas potentiellement grave. Contactez immédiatement un vétérinaire — il prendra les dispositions nécessaires pour votre élevage et vous guidera sur les étapes à suivre.</div>
      </div>)}
      <div style={{...card()}}><div style={{fontWeight:800,marginBottom:8}}>📋 Description</div><div style={{fontSize:13,lineHeight:1.6}}>{detail.description}</div></div>
      <div style={{...card({background:C.orangeLt})}}><div style={{fontWeight:800,color:C.orange,marginBottom:8}}>🛡️ Prévention</div><div style={{fontSize:13,lineHeight:1.6}}>{detail.prevention}</div></div>
      <div style={{...card({background:C.greenLt})}}>
        <div style={{fontWeight:800,color:C.green,marginBottom:10}}>⚡ Actions immédiates</div>
        {detail.actions.map((a,i)=>(<div key={i} style={{display:"flex",gap:8,padding:"4px 0",fontSize:13,lineHeight:1.5,alignItems:"flex-start"}}><span style={{color:C.green,fontWeight:900,flexShrink:0}}>✓</span>{a}</div>))}
      </div>
      <div style={{...card()}}>
        <div style={{fontWeight:800,marginBottom:8}}>💊 Soutien recommandé</div>
        <div style={{fontSize:13,lineHeight:1.6,marginBottom:10}}>{detail.treatment}</div>
        <div style={{background:C.orangeLt,borderRadius:10,padding:"10px 12px"}}>
          <div style={{fontWeight:800,color:C.orange,fontSize:12,marginBottom:4}}>⚕️ Consultez un vétérinaire pour :</div>
          <div style={{fontSize:12,lineHeight:1.6}}>{detail.vet_for}</div>
        </div>
      </div>
      <div style={{...card({background:C.purpleLt,border:`1px solid ${C.purple}33`})}}>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}><span style={{...tag(C.purple,"#fff")}}>⭐ Premium</span><span style={{fontWeight:800,color:C.purple,fontSize:13}}>Consulter un vétérinaire</span></div>
        <div style={{fontSize:12,lineHeight:1.5,marginBottom:10}}>Nos vétérinaires partenaires peuvent vous aider à confirmer ce diagnostic et définir un traitement adapté.</div>
        <VetBtn/><FormationBtn/>
      </div>
      <div style={{...card({background:C.redLt,border:`1px solid ${C.red}33`})}}>
        <div style={{fontWeight:800,color:C.red,fontSize:12,marginBottom:4}}>⚕️ AVERTISSEMENT</div>
        <div style={{fontSize:12,color:C.red,lineHeight:1.5}}>Ces informations sont des <strong>conseils préliminaires uniquement</strong>. Elles ne remplacent jamais un diagnostic vétérinaire professionnel.</div>
      </div>
    </div>
  </div>);}

  if(screen==="results"){return(<div>
    <SubHeader bg={`linear-gradient(135deg,${C.red},#8B1A1A)`} title="Maladies probables" subtitle={`${selected.length} symptôme(s) · ${results.length} correspondance(s)`} onBack={()=>setScreen("symptoms")} backLabel="Symptômes"/>
    <div style={{padding:16}}>
      {results.length===0?(<div style={{...card(),textAlign:"center",padding:32,color:C.muted}}><div style={{fontSize:40}}>🔍</div><div style={{fontWeight:700,marginTop:10}}>Aucune correspondance directe</div></div>)
      :results.map((d,i)=>(<button key={i} onClick={()=>setDetail(d)} style={{...card({cursor:"pointer",width:"100%",textAlign:"left",border:`1.5px solid ${d.color}33`})}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}><div style={{fontWeight:900,fontSize:15}}>{d.name}</div><span style={{...tag(`${d.color}22`,d.color)}}>{d.severity}</span></div>
        <div style={{fontSize:12,color:C.muted,marginBottom:8}}>{d.score}/{d.maxScore} pts · {d.pct}% de correspondance</div>
        <div style={{background:C.bg,borderRadius:6,height:8,overflow:"hidden"}}><div style={{background:d.color,width:`${d.pct}%`,height:"100%",borderRadius:6}}/></div>
        <div style={{fontSize:11,color:C.muted,marginTop:5}}>Appuyer pour voir détail et traitement →</div>
      </button>))}
      <WarningVet/>
    </div>
  </div>);}

  if(screen==="symptoms"){
    const catSymptoms=cat=>SYMPTOMS_V2.filter(s=>s.cat===cat);
    return(<div>
      <div style={{background:`linear-gradient(135deg,${C.red},#8B1A1A)`,padding:"14px 18px",color:"#fff"}}>
        <BackBtn onBack={()=>setScreen("home")} label="Maladies"/>
        <div style={{fontWeight:900,fontSize:17,marginTop:8}}>Sélectionner les symptômes</div>
        <div style={{fontSize:12,opacity:.85,marginTop:3}}>{selected.length} symptôme(s) sélectionné(s)</div>
      </div>
      <div style={{padding:16}}>
        {SYMPTOM_CATS.map(cat=>(<div key={cat.id} style={{marginBottom:8}}>
          <button onClick={()=>setOpenCat(openCat===cat.id?null:cat.id)} style={{width:"100%",background:openCat===cat.id?C.red:C.bg,color:openCat===cat.id?"#fff":C.text,border:`1.5px solid ${openCat===cat.id?C.red:C.border}`,borderRadius:10,padding:"10px 14px",cursor:"pointer",textAlign:"left",fontWeight:700,fontSize:13,fontFamily:"'Nunito',sans-serif",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <span>{cat.label}</span>
            <span style={{fontSize:11,opacity:.7}}>{catSymptoms(cat.id).filter(s=>selected.includes(s.id)).length}/{catSymptoms(cat.id).length} · {openCat===cat.id?"▲":"▼"}</span>
          </button>
          {openCat===cat.id&&(<div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:"0 0 10px 10px",overflow:"hidden"}}>
            {catSymptoms(cat.id).map(s=>(<button key={s.id} onClick={()=>toggle(s.id)} style={{width:"100%",background:selected.includes(s.id)?C.redLt:"transparent",border:"none",borderBottom:`1px solid ${C.border}`,padding:"11px 14px",cursor:"pointer",textAlign:"left",display:"flex",alignItems:"center",gap:12,fontFamily:"'Nunito',sans-serif"}}>
              <div style={{width:20,height:20,borderRadius:5,flexShrink:0,background:selected.includes(s.id)?C.red:"transparent",border:`2px solid ${selected.includes(s.id)?C.red:C.border}`,display:"flex",alignItems:"center",justifyContent:"center"}}>{selected.includes(s.id)&&<span style={{color:"#fff",fontSize:12,fontWeight:900}}>✓</span>}</div>
              <span style={{fontSize:13,fontWeight:600,color:selected.includes(s.id)?C.red:C.text}}>{s.label}</span>
            </button>))}
          </div>)}
        </div>))}
        {selected.length>0&&<button onClick={analyze} style={btn(C.red)}>Analyser {selected.length} symptôme(s) →</button>}
      </div>
    </div>);
  }

  if(screen==="library"){return(<div>
    <SubHeader bg={`linear-gradient(135deg,${C.red},#8B1A1A)`} title="Bibliothèque des maladies" subtitle={`${DISEASES_V2.length} maladies répertoriées`} onBack={()=>setScreen("home")} backLabel="Maladies"/>
    <div style={{padding:16}}>
      {DISEASES_V2.map((d,i)=>(<button key={i} onClick={()=>setDetail(d)} style={{...card({cursor:"pointer",width:"100%",textAlign:"left"})}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><div style={{fontWeight:800,fontSize:14}}>{d.name}</div><span style={{...tag(`${d.color}22`,d.color)}}>{d.severity}</span></div>
        <div style={{fontSize:12,color:C.muted,lineHeight:1.4}}>{d.description.slice(0,90)}...</div>
      </button>))}
    </div>
  </div>);}

  return(<div>
    <Header bg={`linear-gradient(150deg,${C.red},#8B1A1A)`} emoji="🩺" title="Assistance Maladies" subtitle="Identifier et agir rapidement" onBack={onBack}/>
    <div style={{padding:16}}>
      <button onClick={()=>{setSelected([]);setOpenCat("digestifs");setScreen("symptoms");}} style={{...btn(C.red),marginBottom:10}}>🔍 Analyser des symptômes</button>
      <button onClick={()=>setScreen("library")} style={outlineBtn(C.red)}>📚 Bibliothèque des maladies ({DISEASES_V2.length})</button>
      <div style={{...card({background:C.redLt,border:`1px solid ${C.red}33`,marginTop:14})}}>
        <div style={{fontWeight:800,color:C.red,marginBottom:8}}>⚕️ Important</div>
        <div style={{fontSize:13,color:C.red,lineHeight:1.6}}>Cet outil propose des <strong>pistes préliminaires</strong>. Il ne remplace jamais un vétérinaire.</div>
      </div>
      <div style={{...card({background:C.purpleLt,border:`1px solid ${C.purple}22`,marginTop:4})}}>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}><span style={{...tag(C.purple,"#fff")}}>⭐ Premium</span><span style={{fontWeight:800,color:C.purple,fontSize:13}}>Consulter un vétérinaire</span></div>
        <div style={{fontSize:12,lineHeight:1.5}}>Accédez à nos vétérinaires partenaires pour un diagnostic fiable et un traitement sur mesure.</div>
      </div>
    </div>
  </div>);
}

// ═══════════════════════════════════════════
//  FORMATIONS
// ═══════════════════════════════════════════

function FormationsModule({onBack,registerBack}){
  const[cat,setCat]=useState("Tous");
  const[detail,setDetail]=useState(null);

  useEffect(()=>{
    if(detail){registerBack(()=>{setDetail(null);return true;});}
    else{registerBack(null);}
  },[detail,registerBack]);

  const cats=["Tous",...new Set(FORMATIONS.map(f=>f.cat))];
  const list=cat==="Tous"?FORMATIONS:FORMATIONS.filter(f=>f.cat===cat);

  if(detail){
    const typeIcon={Vidéo:"🎬",PDF:"📄",Cours:"📖"}[detail.type]||"📄";
    return(<div>
      <div style={{background:`linear-gradient(135deg,${C.blue},#0C3C7A)`,padding:"14px 18px",color:"#fff"}}>
        <BackBtn onBack={()=>setDetail(null)} label="Formations"/>
        <div style={{fontWeight:900,fontSize:17,marginTop:8,lineHeight:1.3}}>{detail.title}</div>
        <div style={{display:"flex",gap:8,marginTop:8,flexWrap:"wrap"}}>
          <span style={{...tag("rgba(255,255,255,.2)","#fff")}}>{typeIcon} {detail.type}</span>
          <span style={{...tag("rgba(255,255,255,.2)","#fff")}}>⏱ {detail.dur}</span>
          <span style={{...tag("rgba(255,255,255,.2)","#fff")}}>{detail.cat}</span>
        </div>
      </div>
      <div style={{padding:16}}>
        {detail.premium?<div style={{...card({background:C.orangeLt,border:`1px solid ${C.orange}33`,marginBottom:14})}}><div style={{fontWeight:800,color:C.orange,marginBottom:6}}>⭐ Contenu Premium</div><div style={{fontSize:13}}>Cette formation nécessite un abonnement premium.</div></div>
        :<div style={{...card({background:C.greenLt,marginBottom:14})}}><div style={{fontWeight:800,color:C.green,marginBottom:4}}>✅ Accès gratuit</div><div style={{fontSize:13}}>Cette formation est disponible gratuitement.</div></div>}
        <div style={{...card()}}><div style={{fontWeight:800,marginBottom:8}}>📋 Description</div><div style={{fontSize:14,lineHeight:1.6}}>{detail.desc}</div></div>
        <button style={btn(detail.premium?C.orange:C.blue)} disabled={detail.premium}>{detail.premium?"🔒 Débloquer avec Premium":`${typeIcon} Accéder à la formation`}</button>
      </div>
    </div>);
  }

  return(<div>
    <Header bg={`linear-gradient(150deg,${C.blue},#0C3C7A)`} emoji="📚" title="Formations Avicoles" subtitle="Apprenez des experts du secteur" onBack={onBack}/>
    <div style={{display:"flex",gap:8,padding:"12px 16px",overflowX:"auto"}}>
      {cats.map(c=>(<button key={c} onClick={()=>setCat(c)} style={{background:cat===c?C.blue:C.card,color:cat===c?"#fff":C.text,border:`1.5px solid ${cat===c?C.blue:C.border}`,borderRadius:20,padding:"6px 14px",cursor:"pointer",fontWeight:700,fontSize:12,whiteSpace:"nowrap",fontFamily:"'Nunito',sans-serif"}}>{c}</button>))}
    </div>
    <div style={{padding:"0 16px 16px"}}>
      <div style={{fontSize:11,color:C.muted,marginBottom:10,fontWeight:700}}>{list.length} formation(s) · {list.filter(f=>!f.premium).length} gratuites</div>
      {list.map(f=>{
        const typeIcon={Vidéo:"🎬",PDF:"📄",Cours:"📖"}[f.type]||"📄";
        return(<button key={f.id} onClick={()=>setDetail(f)} style={{...card({cursor:"pointer",width:"100%",textAlign:"left"})}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6}}>
            <div style={{fontWeight:800,fontSize:14,flex:1,marginRight:8,lineHeight:1.3}}>{f.title}</div>
            {f.premium?<span style={{...tag(C.orangeLt,C.orange),flexShrink:0}}>⭐ Premium</span>:<span style={{...tag(C.greenLt,C.green),flexShrink:0}}>✅ Gratuit</span>}
          </div>
          <div style={{fontSize:12,color:C.muted,marginBottom:8,lineHeight:1.4}}>{f.desc}</div>
          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
            <span style={{...tag(C.bg,C.muted)}}>{typeIcon} {f.type}</span>
            <span style={{...tag(C.bg,C.muted)}}>⏱ {f.dur}</span>
            <span style={{...tag(C.blueLt,C.blue)}}>{f.cat}</span>
          </div>
        </button>);
      })}
    </div>
  </div>);
}

// ═══════════════════════════════════════════
//  TRÉSORERIE
// ═══════════════════════════════════════════

const emptyDep=()=>({cat:"",description:"",montant:"",date:today()});
const emptyVen=()=>({produit:"",qty:"",prixUnit:"",montant:"",date:today(),remarque:""});

const TRES_BACK={create:"list",detail:"list",addDep:"detail",editDep:"detail",addVen:"detail",editVen:"detail",bilan:"detail"};

function TresorerieModule({onBack,registerBack}){
  const[bandes,saveBandes]=useStorage("avi:tresorerie_bandes",[]);
  const[screen,setScreen]=useState("list");
  const[bandeId,setBandeId]=useState(null);
  const[tab,setTab]=useState("depenses");
  const[confirmTerminer,setCT]=useState(false);
  const[fBande,setFBande]=useState({nom:"",type:"",date:"",effectif:""});
  const[fDep,setFDep]=useState(emptyDep());
  const[fVen,setFVen]=useState(emptyVen());
  const[editDepId,setEditDepId]=useState(null);
  const[editVenId,setEditVenId]=useState(null);

  useEffect(()=>{
    if(screen==="list"){registerBack(null);}
    else{registerBack(()=>{setScreen(TRES_BACK[screen]||"list");setCT(false);return true;});}
  },[screen,registerBack]);

  const list=bandes||[];
  const bande=list.find(b=>b.id===bandeId)||null;
  const isTerminee=bande?.status==="terminee";
  const saveBande=u=>saveBandes(list.map(b=>b.id===u.id?u:b));
  const totalDep=b=>(b?.depenses||[]).reduce((s,d)=>s+d.montant,0);
  const totalVent=b=>(b?.ventes||[]).reduce((s,v)=>s+v.montant,0);
  const benefice=b=>totalVent(b)-totalDep(b);

  const createBande=()=>{
    if(!fBande.nom||!fBande.type||!fBande.date||!fBande.effectif)return;
    const b={id:genId(),...fBande,effectif:parseInt(fBande.effectif),depenses:[],ventes:[],status:"en_cours",createdAt:new Date().toISOString()};
    saveBandes([b,...list]);setBandeId(b.id);setFBande({nom:"",type:"",date:"",effectif:""});setScreen("detail");
  };
  const terminerBande=()=>{saveBande({...bande,status:"terminee",termineeAt:new Date().toISOString()});setCT(false);};

  const addDep=()=>{
    if(!fDep.cat||!fDep.montant||!bande||isTerminee)return;
    const catObj=EXPENSE_CATEGORIES.find(c=>c.id===fDep.cat);
    const d={id:genId(),cat:fDep.cat,nom:catObj?.label||"",description:fDep.description,montant:parseFloat(fDep.montant),date:fDep.date};
    saveBande({...bande,depenses:[...bande.depenses,d]});setFDep(emptyDep());setScreen("detail");setTab("depenses");
  };
  const updateDep=()=>{
    if(!fDep.cat||!fDep.montant||!bande||!editDepId||isTerminee)return;
    const catObj=EXPENSE_CATEGORIES.find(c=>c.id===fDep.cat);
    const d={id:editDepId,cat:fDep.cat,nom:catObj?.label||"",description:fDep.description,montant:parseFloat(fDep.montant),date:fDep.date};
    saveBande({...bande,depenses:bande.depenses.map(x=>x.id===editDepId?d:x)});setEditDepId(null);setFDep(emptyDep());setScreen("detail");setTab("depenses");
  };
  const deleteDep=id=>{if(!isTerminee)saveBande({...bande,depenses:bande.depenses.filter(d=>d.id!==id)});};
  const addVen=()=>{
    if(!fVen.produit||!fVen.montant||!bande||isTerminee)return;
    const v={id:genId(),...fVen,montant:parseFloat(fVen.montant)};
    saveBande({...bande,ventes:[...bande.ventes,v]});setFVen(emptyVen());setScreen("detail");setTab("ventes");
  };
  const updateVen=()=>{
    if(!fVen.produit||!fVen.montant||!bande||!editVenId||isTerminee)return;
    const v={id:editVenId,...fVen,montant:parseFloat(fVen.montant)};
    saveBande({...bande,ventes:bande.ventes.map(x=>x.id===editVenId?v:x)});setEditVenId(null);setFVen(emptyVen());setScreen("detail");setTab("ventes");
  };
  const deleteVen=id=>{if(!isTerminee)saveBande({...bande,ventes:bande.ventes.filter(v=>v.id!==id)});};
  const autoMont=fVen.qty&&fVen.prixUnit?(parseFloat(fVen.qty)*parseFloat(fVen.prixUnit)).toFixed(0):"";

  if(screen==="bilan"&&bande){
    const td=totalDep(bande),tv=totalVent(bande),bn=tv-td,positif=bn>=0;
    const byCat=EXPENSE_CATEGORIES.map(c=>({...c,total:bande.depenses.filter(d=>d.cat===c.id).reduce((s,d)=>s+d.montant,0)})).filter(c=>c.total>0);
    return(<div>
      <div style={{background:`linear-gradient(135deg,${C.purple},#4A148C)`,padding:"14px 18px",color:"#fff"}}>
        <BackBtn onBack={()=>setScreen("detail")} label="Bande"/>
        <div style={{fontWeight:900,fontSize:18,marginTop:8}}>📊 Bilan complet</div>
        <div style={{fontSize:13,opacity:.85}}>{bande.nom}</div>
        {isTerminee&&<span style={{...tag("rgba(100,255,150,.3)","#fff"),marginTop:6}}>✅ Terminée</span>}
      </div>
      <div style={{padding:"14px 16px"}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
          <div style={{...card({background:C.redLt,textAlign:"center"})}}><div style={{fontSize:11,fontWeight:800,color:C.red,marginBottom:4}}>TOTAL DÉPENSES</div><div style={{fontSize:17,fontWeight:900,color:C.red}}>{fmtCFA(td)}</div><div style={{fontSize:11,color:C.muted}}>{bande.depenses.length} entrée(s)</div></div>
          <div style={{...card({background:C.greenLt,textAlign:"center"})}}><div style={{fontSize:11,fontWeight:800,color:C.green,marginBottom:4}}>TOTAL RECETTES</div><div style={{fontSize:17,fontWeight:900,color:C.green}}>{fmtCFA(tv)}</div><div style={{fontSize:11,color:C.muted}}>{bande.ventes.length} vente(s)</div></div>
        </div>
        <div style={{...card({background:positif?C.greenLt:C.redLt,textAlign:"center",padding:"20px 16px",marginBottom:10})}}>
          <div style={{fontSize:14,fontWeight:800,color:positif?C.green:C.red,marginBottom:10}}>{positif?"✅ BÉNÉFICE NET":"❌ PERTE NETTE"}</div>
          <div style={{fontSize:32,fontWeight:900,color:positif?C.green:C.red}}>{positif?"+":"−"}{fmtCFA(Math.abs(bn))}</div>
          {td>0&&<div style={{fontSize:13,color:C.muted,marginTop:8}}>Rentabilité : <strong style={{color:positif?C.green:C.red}}>{tv>0?(bn>=0?"+":"")+Math.round(bn/td*100):0}%</strong>{bande.effectif>0&&tv>0&&<> · {fmtCFA(bn/bande.effectif)}/animal</>}</div>}
        </div>
        {td>0&&bande.effectif>0&&(<div style={{...card({marginBottom:10})}}><div style={{fontWeight:800,marginBottom:8}}>🧮 Coût de production</div><Row label="Coût total" value={fmtCFA(td)}/><Row label="Coût / animal" value={fmtCFA(td/bande.effectif)}/><Row label="Effectif initial" value={`${bande.effectif} animaux`}/></div>)}
        {byCat.length>0&&(<div style={{...card({marginBottom:10})}}><div style={{fontWeight:800,marginBottom:10}}>📂 Dépenses par poste</div>{byCat.map((c,i)=>(<div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:i<byCat.length-1?`1px solid ${C.border}`:"none"}}><span style={{fontSize:13}}>{c.icon} {c.label}</span><div style={{textAlign:"right"}}><div style={{fontSize:13,fontWeight:800,color:C.red}}>{fmtCFA(c.total)}</div><div style={{fontSize:10,color:C.muted}}>{td>0?Math.round(c.total/td*100):0}%</div></div></div>))}</div>)}
        {bande.depenses.length>0&&(<div style={{...card({marginBottom:10})}}><div style={{fontWeight:800,marginBottom:10}}>🧾 Détail toutes les dépenses</div>
          {[...bande.depenses].reverse().map((d,i)=>{const catObj=EXPENSE_CATEGORIES.find(c=>c.id===d.cat);return(<div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",padding:"8px 0",borderBottom:i<bande.depenses.length-1?`1px solid ${C.border}`:"none"}}><div><div style={{fontSize:13,fontWeight:800}}>{catObj?.icon} {catObj?.label}</div>{d.description&&<div style={{fontSize:11,color:C.muted,marginTop:1}}>{d.description}</div>}<div style={{fontSize:11,color:C.muted}}>{fmtDate(d.date)}</div></div><div style={{fontSize:14,fontWeight:900,color:C.red,flexShrink:0}}>{fmtCFA(d.montant)}</div></div>);})}
          <div style={{marginTop:10,paddingTop:10,borderTop:`2px solid ${C.border}`,display:"flex",justifyContent:"space-between"}}><span style={{fontWeight:900,fontSize:14}}>Total dépenses</span><span style={{fontWeight:900,fontSize:14,color:C.red}}>{fmtCFA(td)}</span></div>
        </div>)}
        {bande.ventes.length>0&&(<div style={{...card({marginBottom:10})}}><div style={{fontWeight:800,marginBottom:10}}>💵 Détail toutes les ventes</div>
          {[...bande.ventes].reverse().map((v,i)=>(<div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",padding:"8px 0",borderBottom:i<bande.ventes.length-1?`1px solid ${C.border}`:"none"}}><div><div style={{fontSize:13,fontWeight:800}}>{v.produit}</div><div style={{fontSize:11,color:C.muted}}>{v.qty&&`${v.qty} unités · `}{v.prixUnit&&`${fmtCFA(v.prixUnit)}/u · `}{fmtDate(v.date)}</div>{v.remarque&&<div style={{fontSize:11,color:C.muted,fontStyle:"italic"}}>{v.remarque}</div>}</div><div style={{fontSize:14,fontWeight:900,color:C.green,flexShrink:0}}>{fmtCFA(v.montant)}</div></div>))}
          <div style={{marginTop:10,paddingTop:10,borderTop:`2px solid ${C.border}`,display:"flex",justifyContent:"space-between"}}><span style={{fontWeight:900,fontSize:14}}>Total recettes</span><span style={{fontWeight:900,fontSize:14,color:C.green}}>{fmtCFA(tv)}</span></div>
        </div>)}
      </div>
    </div>);
  }

  if((screen==="addDep"||screen==="editDep")&&bande&&!isTerminee){
    const isEdit=screen==="editDep";
    const selCat=EXPENSE_CATEGORIES.find(c=>c.id===fDep.cat);
    return(<div>
      <div style={{background:`linear-gradient(135deg,${C.red},#8B1A1A)`,padding:"14px 18px",color:"#fff"}}>
        <BackBtn onBack={()=>{setScreen("detail");setEditDepId(null);setFDep(emptyDep());}} label="Bande"/>
        <div style={{fontWeight:900,fontSize:17,marginTop:8}}>{isEdit?"✏️ Modifier la dépense":"➕ Ajouter une dépense"}</div>
        <div style={{fontSize:12,opacity:.8}}>{bande.nom}</div>
      </div>
      <div style={{padding:16}}>
        <div style={{...card()}}>
          <span style={lbl}>Catégorie de la dépense</span>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:14}}>
            {EXPENSE_CATEGORIES.map(c=>(<button key={c.id} onClick={()=>setFDep(f=>({...f,cat:c.id}))} style={{background:fDep.cat===c.id?C.red:C.bg,color:fDep.cat===c.id?"#fff":C.text,border:`1.5px solid ${fDep.cat===c.id?C.red:C.border}`,borderRadius:10,padding:"10px 8px",cursor:"pointer",fontSize:12,fontWeight:700,fontFamily:"'Nunito',sans-serif",display:"flex",alignItems:"center",gap:6}}>{c.icon} {c.label}</button>))}
          </div>
          {selCat&&(<div style={{background:C.bg,borderRadius:10,padding:"10px 12px",marginBottom:14,display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:16}}>{selCat.icon}</span><div><div style={{fontSize:14,fontWeight:800}}>{selCat.label}</div>{fDep.description&&<div style={{fontSize:11,color:C.muted,marginTop:2}}>{fDep.description}</div>}</div><span style={{...tag(C.redLt,C.red),marginLeft:"auto",fontSize:10}}>aperçu</span></div>)}
          <span style={lbl}>Description <span style={{fontWeight:400,textTransform:"none",letterSpacing:0}}>(optionnel)</span></span>
          <input placeholder="Ex: 50kg sac vert, Livraison fournisseur X..." style={{...inp(),marginBottom:14}} value={fDep.description} onChange={e=>setFDep(f=>({...f,description:e.target.value}))}/>
          <span style={lbl}>Montant (FCFA)</span>
          <input type="number" placeholder="Ex: 25000" style={{...inp({fontSize:20,fontWeight:700}),marginBottom:14}} value={fDep.montant} onChange={e=>setFDep(f=>({...f,montant:e.target.value}))}/>
          <span style={lbl}>Date</span>
          <input type="date" style={{...inp(),marginBottom:20}} value={fDep.date} onChange={e=>setFDep(f=>({...f,date:e.target.value}))}/>
          <button onClick={isEdit?updateDep:addDep} style={btn(fDep.cat&&fDep.montant?C.red:"#CCC")} disabled={!fDep.cat||!fDep.montant}>{isEdit?"✓ Enregistrer les modifications":"✓ Enregistrer la dépense"}</button>
        </div>
      </div>
    </div>);
  }

  if((screen==="addVen"||screen==="editVen")&&bande&&!isTerminee){
    const isEdit=screen==="editVen";
    return(<div>
      <div style={{background:`linear-gradient(135deg,${C.green},${C.greenDk})`,padding:"14px 18px",color:"#fff"}}>
        <BackBtn onBack={()=>{setScreen("detail");setEditVenId(null);setFVen(emptyVen());}} label="Bande"/>
        <div style={{fontWeight:900,fontSize:17,marginTop:8}}>{isEdit?"✏️ Modifier la vente":"💵 Enregistrer une vente"}</div>
        <div style={{fontSize:12,opacity:.8}}>{bande.nom}</div>
      </div>
      <div style={{padding:16}}>
        <div style={{...card()}}>
          <span style={lbl}>Produit vendu</span>
          <input placeholder="Ex: Poulets vifs, Œufs..." style={{...inp(),marginBottom:14}} value={fVen.produit} onChange={e=>setFVen(f=>({...f,produit:e.target.value}))}/>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
            <div><span style={lbl}>Quantité</span><input type="number" placeholder="50" style={inp()} value={fVen.qty} onChange={e=>setFVen(f=>({...f,qty:e.target.value,montant:e.target.value&&f.prixUnit?(parseFloat(e.target.value)*parseFloat(f.prixUnit)).toFixed(0):f.montant}))}/></div>
            <div><span style={lbl}>Prix unitaire (F)</span><input type="number" placeholder="2500" style={inp()} value={fVen.prixUnit} onChange={e=>setFVen(f=>({...f,prixUnit:e.target.value,montant:e.target.value&&f.qty?(parseFloat(f.qty)*parseFloat(e.target.value)).toFixed(0):f.montant}))}/></div>
          </div>
          <span style={lbl}>Montant total encaissé (F)</span>
          <input type="number" placeholder="Montant total reçu" style={{...inp({background:C.greenLt,fontWeight:700,fontSize:18}),marginBottom:14}} value={fVen.qty&&fVen.prixUnit?autoMont:fVen.montant} onChange={e=>setFVen(f=>({...f,montant:e.target.value}))}/>
          <span style={lbl}>Date de vente</span>
          <input type="date" style={{...inp(),marginBottom:14}} value={fVen.date} onChange={e=>setFVen(f=>({...f,date:e.target.value}))}/>
          <span style={lbl}>Remarque <span style={{fontWeight:400,textTransform:"none",letterSpacing:0}}>(optionnel)</span></span>
          <input placeholder="Acheteur, conditions..." style={{...inp(),marginBottom:20}} value={fVen.remarque} onChange={e=>setFVen(f=>({...f,remarque:e.target.value}))}/>
          <button onClick={isEdit?updateVen:addVen} style={btn(fVen.produit&&(fVen.montant||autoMont)?C.green:"#CCC")} disabled={!fVen.produit||(!fVen.montant&&!autoMont)}>{isEdit?"✓ Enregistrer les modifications":"✓ Enregistrer la vente"}</button>
        </div>
      </div>
    </div>);
  }

  if(screen==="detail"&&bande){
    const td=totalDep(bande),tv=totalVent(bande),bn=benefice(bande),positif=bn>=0;
    const handleEditDep=d=>{setEditDepId(d.id);setFDep({cat:d.cat,description:d.description||"",montant:String(d.montant),date:d.date});setScreen("editDep");};
    const handleEditVen=v=>{setEditVenId(v.id);setFVen({produit:v.produit,qty:v.qty||"",prixUnit:v.prixUnit||"",montant:String(v.montant),date:v.date,remarque:v.remarque||""});setScreen("editVen");};
    return(<div>
      <div style={{background:`linear-gradient(135deg,${C.purple},#4A148C)`,padding:"14px 18px",color:"#fff"}}>
        <BackBtn onBack={()=>{setCT(false);setScreen("list");}} label="Mes bandes"/>
        <div style={{fontWeight:900,fontSize:18,marginTop:8}}>{bande.nom}</div>
        <div style={{fontSize:12,opacity:.8,marginTop:3}}>{bande.type} · {bande.effectif} animaux · {fmtDate(bande.date)}</div>
        {/* Badge — juste "✅ Terminée" sans "Lecture seule" */}
        <span style={{...tag(isTerminee?"rgba(100,255,150,.3)":"rgba(255,165,0,.3)","#fff"),marginTop:8}}>{isTerminee?"✅ Terminée":"🔄 En cours"}</span>
      </div>
      {isTerminee&&(<div style={{background:"#F0FFF4",borderBottom:`1px solid ${C.green}33`,padding:"10px 16px",display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:16}}>🔒</span><span style={{fontSize:12,color:C.green,fontWeight:700}}>Bande clôturée — Les données sont archivées et ne peuvent plus être modifiées.</span></div>)}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,padding:"12px 16px 8px"}}>
        {[{lbl:"Dépenses",val:fmtCFA(td),color:C.red,bg:C.redLt},{lbl:"Recettes",val:fmtCFA(tv),color:C.green,bg:C.greenLt},{lbl:positif?"Bénéfice":"Perte",val:fmtCFA(Math.abs(bn)),color:positif?C.green:C.red,bg:positif?C.greenLt:C.redLt}].map((s,i)=>(<div key={i} style={{background:s.bg,borderRadius:12,padding:"10px 8px",textAlign:"center"}}><div style={{fontSize:10,color:s.color,fontWeight:800,marginBottom:3}}>{s.lbl}</div><div style={{fontSize:11,fontWeight:900,color:s.color}}>{s.val}</div></div>))}
      </div>
      {!isTerminee&&(<div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,padding:"0 16px 12px"}}>
        {[{label:"➕ Dépense",bg:C.redLt,color:C.red,action:()=>{setFDep(emptyDep());setScreen("addDep");}},{label:"💵 Vente",bg:C.greenLt,color:C.green,action:()=>{setFVen(emptyVen());setScreen("addVen");}},{label:"📊 Bilan",bg:`${C.purple}22`,color:C.purple,action:()=>setScreen("bilan")}].map((a,i)=>(<button key={i} onClick={a.action} style={{background:a.bg,color:a.color,border:"none",borderRadius:10,padding:"11px 6px",cursor:"pointer",fontWeight:800,fontSize:12,fontFamily:"'Nunito',sans-serif",lineHeight:1.3}}>{a.label}</button>))}
      </div>)}
      {isTerminee&&(<div style={{padding:"0 16px 12px"}}><button onClick={()=>setScreen("bilan")} style={btn(C.purple)}>📊 Voir le bilan complet</button></div>)}
      <div style={{display:"flex",margin:"0 16px",background:C.bg,borderRadius:"10px 10px 0 0",overflow:"hidden"}}>
        {["depenses","ventes"].map(t=>(<button key={t} onClick={()=>setTab(t)} style={{flex:1,background:tab===t?C.purple:"transparent",color:tab===t?"#fff":C.muted,border:"none",padding:"10px 8px",cursor:"pointer",fontWeight:800,fontSize:13,fontFamily:"'Nunito',sans-serif"}}>{t==="depenses"?`🧾 Dépenses (${bande.depenses.length})`:`💵 Ventes (${bande.ventes.length})`}</button>))}
      </div>
      <div style={{padding:"12px 16px 8px"}}>
        {tab==="depenses"?(
          bande.depenses.length===0?(<div style={{...card({textAlign:"center",padding:28,color:C.muted})}}>
            <div style={{fontSize:32,marginBottom:8}}>🧾</div><div style={{fontWeight:700}}>Aucune dépense enregistrée</div>{!isTerminee&&<div style={{fontSize:12,marginTop:5}}>Appuyer sur "➕ Dépense"</div>}
          </div>):(
            <>{[...bande.depenses].reverse().map((d,i)=>{const catObj=EXPENSE_CATEGORIES.find(c=>c.id===d.cat);return(<div key={i} style={{...card({display:"flex",justifyContent:"space-between",alignItems:"flex-start"})}}>
              <div style={{flex:1,minWidth:0}}><div style={{fontSize:14,fontWeight:800}}>{catObj?.icon} {catObj?.label}</div>{d.description&&<div style={{fontSize:12,color:C.muted,marginTop:2}}>{d.description}</div>}<div style={{fontSize:11,color:C.muted,marginTop:2}}>{fmtDate(d.date)}</div></div>
              <div style={{display:"flex",alignItems:"center",gap:6,flexShrink:0,marginLeft:8}}>
                <div style={{fontSize:15,fontWeight:900,color:C.red}}>{fmtCFA(d.montant)}</div>
                {!isTerminee&&<><button onClick={()=>handleEditDep(d)} style={{background:C.blueLt,border:"none",borderRadius:8,padding:"5px 8px",cursor:"pointer",fontSize:13,fontFamily:"'Nunito',sans-serif",color:C.blue,fontWeight:700}}>✏️</button><button onClick={()=>deleteDep(d.id)} style={{background:C.redLt,border:"none",borderRadius:8,padding:"5px 8px",cursor:"pointer",fontSize:13,fontFamily:"'Nunito',sans-serif",color:C.red,fontWeight:700}}>🗑</button></>}
              </div>
            </div>);})}
            <div style={{background:C.redLt,borderRadius:10,padding:"10px 14px",display:"flex",justifyContent:"space-between",marginBottom:8}}><span style={{fontWeight:900,fontSize:14}}>Total dépenses</span><span style={{fontWeight:900,fontSize:14,color:C.red}}>{fmtCFA(td)}</span></div>
            </>)
        ):(
          bande.ventes.length===0?(<div style={{...card({textAlign:"center",padding:28,color:C.muted})}}>
            <div style={{fontSize:32,marginBottom:8}}>💵</div><div style={{fontWeight:700}}>Aucune vente enregistrée</div>{!isTerminee&&<div style={{fontSize:12,marginTop:5}}>Appuyer sur "💵 Vente"</div>}
          </div>):(
            <>{[...bande.ventes].reverse().map((v,i)=>(<div key={i} style={{...card({display:"flex",justifyContent:"space-between",alignItems:"flex-start"})}}>
              <div style={{flex:1,minWidth:0}}><div style={{fontSize:14,fontWeight:800}}>{v.produit}</div><div style={{fontSize:11,color:C.muted,marginTop:2}}>{v.qty&&`${v.qty} unités · `}{v.prixUnit&&`${fmtCFA(v.prixUnit)}/u · `}{fmtDate(v.date)}</div>{v.remarque&&<div style={{fontSize:11,color:C.muted,fontStyle:"italic",marginTop:2}}>{v.remarque}</div>}</div>
              <div style={{display:"flex",alignItems:"center",gap:6,flexShrink:0,marginLeft:8}}>
                <div style={{fontSize:15,fontWeight:900,color:C.green}}>{fmtCFA(v.montant)}</div>
                {!isTerminee&&<><button onClick={()=>handleEditVen(v)} style={{background:C.blueLt,border:"none",borderRadius:8,padding:"5px 8px",cursor:"pointer",fontSize:13,fontFamily:"'Nunito',sans-serif",color:C.blue,fontWeight:700}}>✏️</button><button onClick={()=>deleteVen(v.id)} style={{background:C.redLt,border:"none",borderRadius:8,padding:"5px 8px",cursor:"pointer",fontSize:13,fontFamily:"'Nunito',sans-serif",color:C.red,fontWeight:700}}>🗑</button></>}
              </div>
            </div>))}
            <div style={{background:C.greenLt,borderRadius:10,padding:"10px 14px",display:"flex",justifyContent:"space-between",marginBottom:8}}><span style={{fontWeight:900,fontSize:14}}>Total recettes</span><span style={{fontWeight:900,fontSize:14,color:C.green}}>{fmtCFA(tv)}</span></div>
            </>)
        )}
      </div>
      <div style={{padding:"0 16px 24px"}}>
        {!isTerminee&&!confirmTerminer&&(<button onClick={()=>setCT(true)} style={{...outlineBtn("#AAA",{borderColor:"#DDD",color:"#888",fontSize:13})}}>🏁 Terminer cette bande</button>)}
        {!isTerminee&&confirmTerminer&&(<div style={{...card({background:"#FFF8E1",border:"1px solid #FFC10766"})}}>
          <div style={{fontWeight:800,fontSize:13,marginBottom:8,color:"#856400"}}>⚠️ Confirmer la clôture ?</div>
          <div style={{fontSize:12,color:C.muted,marginBottom:12,lineHeight:1.5}}>Cette bande sera marquée <strong>Terminée</strong> et les données seront <strong>verrouillées</strong>. Le bilan restera consultable.</div>
          <div style={{display:"flex",gap:8}}><button onClick={terminerBande} style={{...btn(C.green,"#fff",{flex:1})}}>✅ Oui, terminer</button><button onClick={()=>setCT(false)} style={{...btn("#EEE",C.text,{flex:1})}}>Annuler</button></div>
        </div>)}
        {isTerminee&&(<div style={{...card({background:C.greenLt,textAlign:"center"})}}><div style={{fontWeight:800,color:C.green}}>🔒 Bande archivée</div><div style={{fontSize:12,color:C.muted,marginTop:4}}>Terminée le {fmtDate(bande.termineeAt)}</div></div>)}
      </div>
    </div>);
  }

  if(screen==="create"){
    return(<div>
      <SubHeader bg={`linear-gradient(135deg,${C.purple},#4A148C)`} title="Créer une nouvelle bande" onBack={()=>setScreen("list")} backLabel="Trésorerie"/>
      <div style={{padding:16}}>
        <div style={{...card()}}>
          <span style={lbl}>Nom de la bande</span>
          <input placeholder="Ex: Bande chair mai 2026" style={{...inp(),marginBottom:14}} value={fBande.nom} onChange={e=>setFBande(f=>({...f,nom:e.target.value}))}/>
          <span style={lbl}>Type d'élevage</span>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:14}}>
            {["Poulet de chair","Pondeuse","Caille","Dinde","Pintade","Autre"].map(t=>(<button key={t} onClick={()=>setFBande(f=>({...f,type:t}))} style={{background:fBande.type===t?C.purple:C.bg,color:fBande.type===t?"#fff":C.text,border:`1.5px solid ${fBande.type===t?C.purple:C.border}`,borderRadius:10,padding:"9px 8px",cursor:"pointer",fontSize:12,fontWeight:700,fontFamily:"'Nunito',sans-serif"}}>{t}</button>))}
          </div>
          <span style={lbl}>Date de démarrage</span>
          <input type="date" style={{...inp(),marginBottom:14}} value={fBande.date} onChange={e=>setFBande(f=>({...f,date:e.target.value}))}/>
          <span style={lbl}>Effectif (nombre d'animaux)</span>
          <input type="number" placeholder="Ex: 500" style={{...inp(),marginBottom:20}} value={fBande.effectif} onChange={e=>setFBande(f=>({...f,effectif:e.target.value}))}/>
          <button onClick={createBande} style={btn(fBande.nom&&fBande.type&&fBande.date&&fBande.effectif?C.purple:"#CCC")} disabled={!fBande.nom||!fBande.type||!fBande.date||!fBande.effectif}>✓ Créer la bande</button>
        </div>
      </div>
    </div>);
  }

  const enCours=list.filter(b=>b.status!=="terminee");
  const terminees=list.filter(b=>b.status==="terminee");
  return(<div>
    <Header bg={`linear-gradient(150deg,${C.purple},#4A148C)`} emoji="💰" title="Trésorerie" subtitle="Gestion financière de vos bandes" onBack={onBack}/>
    <div style={{padding:16}}>
      <button onClick={()=>setScreen("create")} style={{...btn(C.purple),marginBottom:16}}>+ Créer une nouvelle bande</button>
      {list.length===0&&(<div style={{...card({textAlign:"center",padding:36})}}>
        <div style={{fontSize:52,marginBottom:14}}>💰</div>
        <div style={{fontWeight:900,fontSize:16,marginBottom:8}}>Aucune bande créée</div>
        <div style={{fontSize:13,color:C.muted,lineHeight:1.6}}>Créez votre première bande pour commencer à suivre dépenses, ventes et bénéfices.</div>
      </div>)}
      {enCours.length>0&&(<>
        <div style={{fontSize:11,fontWeight:800,color:C.muted,marginBottom:8,letterSpacing:.6,textTransform:"uppercase"}}>🔄 En cours ({enCours.length})</div>
        {enCours.map(b=>{const td=totalDep(b),tv=totalVent(b),bn=benefice(b),positif=bn>=0;return(<button key={b.id} onClick={()=>{setBandeId(b.id);setCT(false);setScreen("detail");setTab("depenses");}} style={{...card({cursor:"pointer",width:"100%",textAlign:"left"})}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}><div><div style={{fontSize:16,fontWeight:900}}>{b.nom}</div><div style={{fontSize:12,color:C.muted,marginTop:2}}>{b.type} · {b.effectif} animaux · {fmtDate(b.date)}</div></div><span style={{...tag(C.orangeLt,C.orange)}}>🔄 En cours</span></div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,borderTop:`1px solid ${C.border}`,paddingTop:10}}>{[{l:"Dépenses",v:fmtCFA(td),c:C.red},{l:"Recettes",v:fmtCFA(tv),c:C.green},{l:positif?"Bénéfice":"Perte",v:fmtCFA(Math.abs(bn)),c:positif?C.green:C.red}].map((s,i)=>(<div key={i}><div style={{fontSize:10,color:C.muted,marginBottom:3}}>{s.l}</div><div style={{fontSize:12,fontWeight:900,color:s.c}}>{s.v}</div></div>))}</div>
        </button>);})}
      </>)}
      {terminees.length>0&&(<>
        <div style={{fontSize:11,fontWeight:800,color:C.muted,margin:"14px 0 8px",letterSpacing:.6,textTransform:"uppercase"}}>✅ Terminées ({terminees.length})</div>
        {terminees.map(b=>{const td=totalDep(b),tv=totalVent(b),bn=benefice(b),positif=bn>=0;return(<button key={b.id} onClick={()=>{setBandeId(b.id);setCT(false);setScreen("detail");setTab("depenses");}} style={{...card({cursor:"pointer",width:"100%",textAlign:"left",opacity:.9})}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}><div><div style={{fontSize:16,fontWeight:900}}>{b.nom}</div><div style={{fontSize:12,color:C.muted,marginTop:2}}>{b.type} · {b.effectif} animaux</div></div><span style={{...tag(C.greenLt,C.green)}}>✅ Terminée</span></div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,borderTop:`1px solid ${C.border}`,paddingTop:10}}>{[{l:"Dépenses",v:fmtCFA(td),c:C.red},{l:"Recettes",v:fmtCFA(tv),c:C.green},{l:positif?"Bénéfice":"Perte",v:fmtCFA(Math.abs(bn)),c:positif?C.green:C.red}].map((s,i)=>(<div key={i}><div style={{fontSize:10,color:C.muted,marginBottom:3}}>{s.l}</div><div style={{fontSize:12,fontWeight:900,color:s.c}}>{s.v}</div></div>))}</div>
        </button>);})}
      </>)}
      {list.length>0&&(<div style={{...card({background:C.purpleLt,marginTop:8})}}>
        <div style={{fontWeight:800,color:C.purple,marginBottom:6}}>📈 Vue globale</div>
        <Row label="Total bandes" value={`${list.length} (${enCours.length} en cours)`}/>
        <Row label="Total investi" value={fmtCFA(list.reduce((s,b)=>s+totalDep(b),0))}/>
        <Row label="Total récolté" value={fmtCFA(list.reduce((s,b)=>s+totalVent(b),0))}/>
        <Row label="Bénéfice global" value={fmtCFA(list.reduce((s,b)=>s+benefice(b),0))} accent/>
      </div>)}
    </div>
  </div>);
}

// ═══════════════════════════════════════════
//  APPLICATION PRINCIPALE + BACK BUTTON
// ═══════════════════════════════════════════

export default function App(){
  const[screen,setScreen]=useState("home");
  const[exitToast,setExitToast]=useState(false);
  const moduleBackRef=useRef(null);
  const exitTimerRef=useRef(null);
  // Refs toujours à jour : le listener popstate est enregistré une seule
  // fois (voir plus bas) et ne doit jamais lire un état "screen"/"exitToast"
  // périmé issu d'une closure obsolète.
  const screenRef=useRef(screen);
  const exitToastRef=useRef(exitToast);
  screenRef.current=screen;
  exitToastRef.current=exitToast;

  const registerBack=useCallback(handler=>{moduleBackRef.current=handler;},[]);

  const goTo=useCallback(s=>{
    setScreen(s);
    history.pushState({screen:s},"");
  },[]);

  // Retour direct à l'accueil (bouton "Retour" affiché dans l'UI d'un module).
  // Contrairement à goTo(), on REMPLACE l'entrée d'historique du module au
  // lieu d'en empiler une nouvelle : sinon, des entrées "accueil" s'accumulent
  // à chaque aller-retour dans un module, et le bouton retour physique
  // d'Android finit par quitter l'application avant d'être repassé par
  // l'accueil (bug de l'avant-dernière page).
  const goHome=useCallback(()=>{
    moduleBackRef.current=null;
    setScreen("home");
    history.replaceState({screen:"home"},"");
  },[]);

  useEffect(()=>{
    // On empile un état tampon dès le montage (en plus du replaceState) afin
    // qu'un popstate se déclenche systématiquement, y compris au tout premier
    // appui sur "retour" depuis l'accueil — sinon, sur certains WebView
    // Android, l'absence d'un deuxième niveau d'historique fait quitter
    // l'application immédiatement sans jamais passer par notre gestionnaire.
    history.replaceState({screen:"home"},"");
    history.pushState({screen:"home"},"");

    const handlePop=()=>{
      const curScreen=screenRef.current;
      if(curScreen==="home"){
        if(exitToastRef.current){
          // Deuxième appui confirmé : on laisse la sortie se faire, sans
          // réempiler d'état tampon.
          return;
        }
        history.pushState({screen:"home"},"");
        setExitToast(true);
        if(exitTimerRef.current)clearTimeout(exitTimerRef.current);
        exitTimerRef.current=setTimeout(()=>setExitToast(false),2500);
      }else{
        // Dans un module : on maintient systématiquement la profondeur
        // d'historique, puis on délègue au back handler du module.
        history.pushState({screen:curScreen},"");
        if(moduleBackRef.current){
          const handled=moduleBackRef.current();
          if(!handled){
            setScreen("home");
            moduleBackRef.current=null;
          }
        }else{
          setScreen("home");
        }
      }
    };

    window.addEventListener("popstate",handlePop);
    return()=>{
      window.removeEventListener("popstate",handlePop);
      if(exitTimerRef.current)clearTimeout(exitTimerRef.current);
    };
  },[]);

  const moduleProps={registerBack};

  const screens={
    home:<HomeScreen go={goTo}/>,
    incubation:<IncubationModule onBack={goHome} {...moduleProps}/>,
    formule:<FormuleModule onBack={goHome} {...moduleProps}/>,
    maladies:<MaladiesModule onBack={goHome} {...moduleProps}/>,
    formations:<FormationsModule onBack={goHome} {...moduleProps}/>,
    tresorerie:<TresorerieModule onBack={goHome} {...moduleProps}/>,
  };

  return(<>
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
      <div style={{width:"100%",maxWidth:430,background:"#F2F5EE",minHeight:"100vh",boxShadow:"0 8px 40px rgba(0,0,0,.18)",borderRadius:8,overflowY:"auto",overflowX:"hidden",position:"relative"}}>
        {screens[screen]||screens.home}
        {/* Toast "Appuyez encore pour quitter" */}
        {exitToast&&(<div style={{position:"fixed",bottom:32,left:"50%",transform:"translateX(-50%)",background:"rgba(0,0,0,.82)",color:"#fff",borderRadius:24,padding:"10px 20px",fontSize:13,fontWeight:700,zIndex:9999,whiteSpace:"nowrap",boxShadow:"0 4px 20px rgba(0,0,0,.3)"}}>Appuyez encore pour quitter</div>)}
      </div>
    </div>
  </>);
}
