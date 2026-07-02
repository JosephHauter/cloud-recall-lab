// AWS Practice Exam App Logic

let state = {
  currentView: 'dashboard',
  currentMode: null, // 'practice' | 'exam'
  currentExamType: 'random', // 'random' | 'mock1' | 'mock2'
  currentSection: null, // 1..5, or 'review'
  questionsList: [],
  currentQuestionIndex: 0,
  userAnswers: {}, // Maps index to option letter ('A', 'B', 'C', 'D') OR array of letters for multi-select
  submittedQuestions: new Set(), // Indexes the user has actually submitted (graded). Selections before submit are NOT here.
  markedQuestions: new Set(), // Set of indexes
  examTimeRemaining: 90 * 60, // 90 minutes in seconds
  examDurationSeconds: 90 * 60,
  examStartedAt: null,
  examSubmitted: false,
  timerInterval: null,
  
  // Persistence
  stats: {
    examsTaken: 0,
    examScores: [], // Array of percentages
    totalAnswersCount: 0,
    correctAnswersCount: 0
  },
  wrongAnswers: [], // List of question IDs
  wrongAnswerRules: {}, // Maps question ID to { keyword, confused, rule }
  progress: {
    examHistory: [],
    questionStats: {},
    dailyActivity: {}
  },
  lastExamResult: null,
  readinessSelfChecked: {
    masterMemory: false,
    confusingPairs: false,
    triggerDrills: false,
    officialQs: false
  },
  language: 'en'
};

const MASTER_ITEMS = [
  { service: "IAM", concept: "controls access" },
  { service: "KMS", concept: "controls keys" },
  { service: "Secrets Manager", concept: "rotates secrets" },
  { service: "CloudTrail", concept: "records API actions" },
  { service: "CloudWatch", concept: "watches metrics/logs/alarms" },
  { service: "Config", concept: "tracks resource changes" },
  { service: "GuardDuty", concept: "detects threats" },
  { service: "Inspector", concept: "scans vulnerabilities" },
  { service: "Macie", concept: "finds sensitive S3 data" },
  { service: "WAF", concept: "blocks web attacks" },
  { service: "Shield", concept: "blocks DDoS" },
  { service: "Artifact", concept: "gives compliance reports" },
  { service: "EC2", concept: "virtual servers" },
  { service: "Lambda", concept: "serverless functions" },
  { service: "Fargate", concept: "serverless containers" },
  { service: "Elastic Beanstalk", concept: "deploys apps easily" },
  { service: "CloudFormation", concept: "builds infrastructure from templates" },
  { service: "S3", concept: "stores objects" },
  { service: "EBS", concept: "EC2 disk" },
  { service: "EFS", concept: "shared files" },
  { service: "S3 Glacier", concept: "archive storage" },
  { service: "CloudFront", concept: "CDN / global cache" },
  { service: "Route 53", concept: "DNS" },
  { service: "VPC", concept: "private network" },
  { service: "RDS/Aurora", concept: "relational SQL database" },
  { service: "DynamoDB", concept: "serverless NoSQL database" },
  { service: "DocumentDB", concept: "MongoDB-compatible document DB" },
  { service: "Neptune", concept: "graph database" },
  { service: "ElastiCache", concept: "cache Redis/Memcached" },
  { service: "Athena", concept: "serverless SQL on S3" },
  { service: "Redshift", concept: "data warehouse" },
  { service: "Glue", concept: "serverless ETL and Data Catalog" },
  { service: "QuickSight", concept: "dashboards / BI" },
  { service: "Kinesis", concept: "streaming data" },
  { service: "OpenSearch", concept: "search/logs" },
  { service: "SQS", concept: "queue" },
  { service: "SNS", concept: "notifications" },
  { service: "EventBridge", concept: "events" },
  { service: "Step Functions", concept: "workflow" },
  { service: "DMS", concept: "database migration" },
  { service: "SCT", concept: "schema conversion" },
  { service: "Snow Family", concept: "offline data transfer" },
  { service: "Budgets", concept: "cost/usage alerts" },
  { service: "Cost Explorer", concept: "analyzes spending trends" },
  { service: "Pricing Calculator", concept: "estimates cost" },
  { service: "Cost and Usage Report", concept: "detailed billing" },
  { service: "Trusted Advisor", concept: "recommendations" }
];

let trainerState = {
  currentTab: 'read',
  currentCardIndex: 0,
  matchingSelectedAnswers: {}, // Maps service index to selected concept definition string
  matchingServices: [], // Array of 5 random items
  matchingConcepts: [], // Array of 5 random concepts shuffled
  currentWrongCardIndex: 0,
  flashcardsList: [],
  wrongCardsList: []
};

let plannerState = {
  activePlan: 90, // 90 | 120 | 180
  currentStepIndex: 0,
  timeRemaining: 10 * 60, // in seconds
  isRunning: false,
  intervalId: null,
  plans: {
    90: [
      { name: "Master Memory Page", desc: "Forced active recall of 47 core services.", duration: 10 },
      { name: "Study Today's Section", desc: "Read today's target topics fast.", duration: 25 },
      { name: "Active Recall", desc: "Cover answers and quiz yourself.", duration: 25 },
      { name: "Practice Questions", desc: "Do questions immediately after studying.", duration: 25 },
      { name: "Wrong-Answer Flashcards", desc: "Turn mistakes into points.", duration: 5 }
    ],
    120: [
      { name: "Master Memory Page", desc: "Forced active recall of 47 core services.", duration: 10 },
      { name: "Study Today's Section", desc: "Read today's target topics fast.", duration: 35 },
      { name: "Active Recall", desc: "Cover answers and quiz yourself.", duration: 30 },
      { name: "Practice Questions", desc: "Do questions immediately after studying.", duration: 35 },
      { name: "Wrong-Answer Flashcards", desc: "Turn mistakes into points.", duration: 10 }
    ],
    180: [
      { name: "Master Memory Page", desc: "Forced active recall of 47 core services.", duration: 15 },
      { name: "Study Today's Section", desc: "Read today's target topics fast.", duration: 45 },
      { name: "Active Recall", desc: "Cover answers and quiz yourself.", duration: 45 },
      { name: "Practice Questions", desc: "Do questions immediately after studying.", duration: 60 },
      { name: "Wrong-Answer Flashcards", desc: "Turn mistakes into points.", duration: 15 }
    ]
  }
};

let guidedStudyState = {
  activePlan: 90,
  currentStepIndex: 0,
  timeRemaining: 10 * 60,
  selectedSection: 1,
  isRunning: false,
  timerInterval: null,
  practiceAnswers: {},
  practiceSubmitted: new Set(),
  practiceQuestionsList: [],
  wrongCardsList: []
};


// SVG Icons for clean visuals
const ICONS = {
  check: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>`,
  x: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>`,
  flag: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1zM4 22v-7"/></svg>`,
  alert: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`
};

const STORAGE_KEYS = {
  stats: 'aws_quiz_stats',
  wrong: 'aws_quiz_wrong',
  wrongRules: 'aws_quiz_wrong_rules',
  readiness: 'aws_quiz_readiness_self',
  progress: 'aws_quiz_progress',
  language: 'aws_quiz_language'
};

const SUPPORTED_LANGUAGES = {
  en: { label: 'English', nativeLabel: 'English', htmlLang: 'en' },
  es: { label: 'Espanol', nativeLabel: 'Espanol', htmlLang: 'es' },
  pt: { label: 'Portugues', nativeLabel: 'Portugues', htmlLang: 'pt-BR' },
  fr: { label: 'Francais', nativeLabel: 'Francais', htmlLang: 'fr' },
  de: { label: 'Deutsch', nativeLabel: 'Deutsch', htmlLang: 'de' },
  it: { label: 'Italiano', nativeLabel: 'Italiano', htmlLang: 'it' },
  nl: { label: 'Nederlands', nativeLabel: 'Nederlands', htmlLang: 'nl' },
  hi: { label: 'Hindi', nativeLabel: 'हिन्दी', htmlLang: 'hi' },
  ja: { label: 'Japanese', nativeLabel: '日本語', htmlLang: 'ja' }
};

const I18N = {
  en: {
    navHistory: 'History',
    navAbout: 'About',
    navSettings: 'Settings',
    languageLabel: 'Language',
    languageHelper: 'Interface guidance changes language. AWS service names and practice questions stay in English for exam consistency.',
    heroTitle: 'Cloud Recall Lab',
    heroSubtitle: 'Free CLF-C02 prep with interactive practice, timed mock exams, local progress tracking, and no login wall.',
    stripFree: 'Free forever',
    stripNoAccount: 'No account',
    stripMobile: 'Mobile friendly',
    stripOffline: 'Offline-ready',
    stripLanguages: 'Multilingual UI beta',
    stripPassed: 'Used to pass CLF-C02',
    evidenceBadge: 'Research-backed study loop',
    evidenceTitle: 'Built around active recall, not passive rereading.',
    evidenceBody: 'Practice testing, spaced review, feedback, and exam-like rehearsal are some of the best-supported ways to make facts retrievable under pressure. This app turns those methods into a simple CLF-C02 routine: answer, review, repeat, and track what still needs work.',
    whyBadge: 'Why Cloud Recall Lab',
    whyTitle: 'The free practice layer I wished existed while studying.',
    whyBody: 'Most prep tools either hide useful practice behind a paywall or reveal answers too early. This lab keeps the loop clean: commit to an answer, get feedback, review misses, and build confidence without creating an account.',
    whyProofKicker: 'Personal proof, not a promise',
    whyProofTitle: 'I used this app while preparing and passed CLF-C02 on July 1, 2026.',
    whyProofBody: 'My score report showed Meets Competencies across all four exam domains. That does not guarantee anyone else will pass, but it is real evidence that the study loop can work when paired with current learning materials.',
    whyCredentialLink: 'Verify my AWS credential on Credly',
    whyPillPassed: 'Passed July 1, 2026',
    whyPillDomains: 'Meets Competencies in all domains',
    whyPillCourse: 'Best with a current course or AWS docs',
    whyPillNoDumps: 'Original practice, no braindumps',
    languageBadge: 'Language support beta',
    languageTitle: 'Study guidance in more languages.',
    languageBody: 'Switch the main interface copy between English, Spanish, Portuguese, French, German, Italian, and Dutch. Practice questions stay in English so AWS service names and exam wording remain consistent.',
    mockCardTitle: 'Full Timed Mock Exam',
    mockCardDesc: 'Practice under CLF-C02-style timing with 65 randomized questions in 90 minutes. Answers and explanations are revealed after you submit the exam.',
    mockCardQuestions: '65 Questions',
    startMockButton: 'Start Mock Exam',
    guidedCardTitle: 'Science-Backed Guided Study Block',
    guidedCardDesc: "Practice testing and active recall improve retention more than rereading. Launch a structured study block that guides you step-by-step through today's section with active timers, cheat sheets, quizzes, and wrong-answer review.",
    startDailyBlock: 'Start Daily Block',
    dailyRoutineBadge: 'Daily Routine',
    trainerTitle: 'Master Memory Sentence Trainer',
    trainerDesc: 'Spend 10 minutes today reviewing the core sentence. Use browser-powered Text-to-Speech to listen, flip through interactive 3D flashcards, or test your memory with the active recall game.',
    startTraining: 'Start Training',
    studyGuideBadge: 'Exam Reference',
    studyGuideTitle: 'Study Guide & Cheat Sheets',
    studyGuideDesc: 'Access the interactive study helper. Search core concepts, service trigger words, serverless services, confusing pairs, and the highest-yield exam traps.',
    openStudyGuide: 'Open Study Guide',
    activeRecallBadge: 'Active Recall',
    drillsTitle: 'Rapid Trigger Drills',
    drillsDesc: "Type your answer for 95 rapid scenarios. If you make a mistake, you'll be prompted to write out the trigger word to commit it to memory.",
    startDrills: 'Start Drills',
    examSimulationBadge: 'Exam Simulation',
    miniQuizTitle: '20-Question Mixed Quiz',
    miniQuizDesc: 'Answer 20 fill-in-the-blank questions under exam conditions. No answers or scores will be revealed until the end.',
    startQuiz: 'Start Quiz',
    sectionPracticeTitle: 'Section-Focused Practice (Days 1 - 5)',
    aboutTitle: 'About & Contact',
    aboutSubtitle: 'Why this exists, how to use it responsibly, and where to connect.',
    dashboardButton: 'Dashboard',
    builtBadge: 'Built after passing',
    builtTitle: 'I used this study loop to pass the AWS Cloud Practitioner exam on July 1, 2026.',
    builtBody1: 'I made this because so much useful exam prep sits behind paywalls, even basics like flashcards, and some study tools reveal the answer too early. That ruins the point of active recall: you need to commit first, then see feedback.',
    builtBody2: 'This tool keeps the study loop simple: practice under pressure, hide answers until you choose, review every miss, and keep weak topics visible until they get easier.',
    wiseBadge: 'Use it wisely',
    wiseTitle: 'Free practice, not a promise or a replacement for current materials.',
    wiseBody1: 'AWS can update services, wording, and certification scope over time. Use this as practice and active recall, then cross-check the current AWS exam guide, AWS docs, and a strong course.',
    wiseBody2: 'Udemy was a big help for my own prep, and this app worked best as a companion: use a course to learn, then use this hub to test whether you can actually retrieve the answer.',
    resourceBadge: 'Resource I used',
    resourceTitle: 'The course that helped me learn the material.',
    resourceBody: 'This app is the free practice layer I wished existed. For learning the concepts, the Udemy course below was one of the resources that helped me pass.',
    resourceCourse: 'Udemy course that helped me: Ultimate AWS Certified Cloud Practitioner CLF-C02 2026',
    communityResourceBody: 'For broader community-maintained certification links, the r/AWSCertifications wiki is also useful for pathways, discounts, free learning, and study FAQs. Treat it as community guidance, not official AWS material.',
    communityResourceLink: 'r/AWSCertifications community wiki',
    compatBadge: 'Compatibility',
    compatTitle: 'Built for modern browsers, mobile study, and privacy-first launch.',
    compatBody1: 'The app is designed for current Chrome, Edge, Firefox, and Safari. Offline install works best from an HTTPS-hosted site because it depends on browser service worker support.',
    compatBody2: 'Progress stays in this browser with localStorage. Text-to-speech, native sharing, and install prompts can vary by browser and device.',
    contactBadge: 'Contact',
    contactTitle: 'Connect, contribute, or support the project.',
    contactBody: 'Questions, bug reports, corrections, and new original practice questions are welcome. The project is free and open source so learners can use it without another paywall.',
    footerBuilt: 'Built by Joseph Hauter as a free, no-login study tool.',
    footerDisclaimer: 'This is an independent study tool and is not affiliated with, endorsed by, authored by, or sponsored by Amazon Web Services (AWS). AWS and Amazon Web Services are trademarks of Amazon.com, Inc. or its affiliates. All questions are original educational scenarios, not AWS certification exam materials.',
    randomExamDesc: 'Practice under CLF-C02-style timing with 65 randomly compiled questions from the database.',
    settingsTitle: 'Settings & Data',
    settingsBody: 'Your progress is stored locally in this browser. Export a backup if you want to move progress to another device.',
    languageToast: 'Language updated. Practice questions remain in English for exam consistency.'
  },
  es: {
    navHistory: 'Historial',
    navAbout: 'Acerca de',
    navSettings: 'Ajustes',
    languageLabel: 'Idioma',
    languageHelper: 'La guia de la interfaz cambia de idioma. Los nombres de servicios AWS y las preguntas quedan en ingles para mantener consistencia con el examen.',
    heroTitle: 'Cloud Recall Lab',
    heroSubtitle: 'Preparacion CLF-C02 gratis con practica interactiva, examenes cronometrados, progreso local y sin cuenta.',
    stripFree: 'Gratis siempre',
    stripNoAccount: 'Sin cuenta',
    stripMobile: 'Movil',
    stripOffline: 'Listo offline',
    stripLanguages: 'UI multilingue beta',
    stripPassed: 'Usado para aprobar CLF-C02',
    evidenceBadge: 'Metodo de estudio con investigacion',
    evidenceTitle: 'Creado alrededor del recuerdo activo, no la lectura pasiva.',
    evidenceBody: 'La practica de recuperacion, el repaso espaciado, la retroalimentacion y el ensayo tipo examen ayudan a recuperar hechos bajo presion. Esta app convierte esos metodos en una rutina CLF-C02 simple: responder, revisar, repetir y seguir lo debil.',
    languageBadge: 'Soporte de idiomas beta',
    languageTitle: 'Guia de estudio en mas idiomas.',
    languageBody: 'Cambia la interfaz principal entre ingles, espanol, portugues, frances, aleman, italiano y neerlandes. Las preguntas quedan en ingles para que los nombres de servicios AWS y el estilo del examen sigan consistentes.',
    mockCardTitle: 'Examen simulado cronometrado',
    mockCardDesc: 'Practica con ritmo estilo CLF-C02: 65 preguntas aleatorias en 90 minutos. Las respuestas y explicaciones aparecen despues de entregar.',
    mockCardQuestions: '65 preguntas',
    startMockButton: 'Iniciar examen',
    guidedCardTitle: 'Bloque de estudio guiado',
    guidedCardDesc: 'La practica y el recuerdo activo retienen mejor que releer. Lanza un bloque guiado con temporizadores, apuntes, quizzes y revision de errores.',
    startDailyBlock: 'Iniciar bloque',
    dailyRoutineBadge: 'Rutina diaria',
    trainerTitle: 'Entrenador de memoria maestra',
    trainerDesc: 'Dedica 10 minutos a repasar la frase central. Usa lectura en voz alta, flashcards 3D o el juego de recuerdo activo.',
    startTraining: 'Iniciar entrenamiento',
    studyGuideBadge: 'Referencia de examen',
    studyGuideTitle: 'Guia de estudio y chuletas',
    studyGuideDesc: 'Busca conceptos de nube, responsabilidad compartida, palabras clave por servicio y trampas de alto rendimiento.',
    openStudyGuide: 'Abrir guia',
    activeRecallBadge: 'Recuerdo activo',
    drillsTitle: 'Drills rapidos de triggers',
    drillsDesc: 'Escribe la respuesta para 95 escenarios rapidos. Si fallas, bloquea la palabra clave para recordarla mejor.',
    startDrills: 'Iniciar drills',
    examSimulationBadge: 'Simulacion de examen',
    miniQuizTitle: 'Quiz mixto de 20 preguntas',
    miniQuizDesc: 'Responde 20 preguntas bajo condiciones de examen. Respuestas y puntaje aparecen al final.',
    startQuiz: 'Iniciar quiz',
    sectionPracticeTitle: 'Practica por secciones (Dias 1 - 5)',
    aboutTitle: 'Acerca de y contacto',
    aboutSubtitle: 'Por que existe, como usarlo con cuidado y donde conectar.',
    dashboardButton: 'Panel',
    builtBadge: 'Creado despues de aprobar',
    builtTitle: 'Use este ciclo de estudio para aprobar AWS Cloud Practitioner el 1 de julio de 2026.',
    builtBody1: 'Lo hice porque demasiado material util esta tras paywalls, incluso flashcards basicas, y algunos flujos con IA muestran la respuesta demasiado pronto. Eso arruina el recuerdo activo: primero debes comprometerte, luego ver la explicacion.',
    builtBody2: 'La herramienta mantiene el ciclo simple: practicar bajo presion, ocultar respuestas hasta elegir, revisar errores y mantener visibles los temas debiles.',
    wiseBadge: 'Usalo bien',
    wiseTitle: 'Practica gratis, no una promesa ni reemplazo de materiales actuales.',
    wiseBody1: 'AWS puede cambiar servicios, redaccion y alcance del examen. Usalo como practica y recuerdo activo, y confirma con la guia actual de AWS, la documentacion y un buen curso.',
    wiseBody2: 'Udemy me ayudo mucho. Esta app funciona mejor como companera: aprende con un curso y usa este hub para comprobar si puedes recuperar la respuesta bajo presion.',
    resourceBadge: 'Recurso que use',
    resourceTitle: 'El curso que me ayudo a aprender el material.',
    resourceBody: 'Esta app es la capa de practica gratis que me hubiera gustado tener. Para aprender los conceptos, el curso de Udemy abajo fue uno de los recursos que me ayudo a aprobar.',
    resourceCourse: 'Curso de Udemy que me ayudo: Ultimate AWS Certified Cloud Practitioner CLF-C02 2026',
    compatBadge: 'Compatibilidad',
    compatTitle: 'Creado para navegadores modernos, estudio movil y lanzamiento con privacidad.',
    compatBody1: 'La app esta disenada para Chrome, Edge, Firefox y Safari actuales. La instalacion offline funciona mejor desde un sitio HTTPS porque depende de service workers.',
    compatBody2: 'El progreso queda en este navegador con localStorage. La lectura en voz alta, compartir nativo e instalacion pueden variar por navegador y dispositivo.',
    contactBadge: 'Contacto',
    contactTitle: 'Conecta, contribuye o apoya el proyecto.',
    contactBody: 'Preguntas, bugs, correcciones y nuevas preguntas originales son bienvenidas. El proyecto es gratis y open source para evitar otra barrera de pago.',
    footerBuilt: 'Creado por Joseph Hauter como herramienta gratis sin login.',
    footerDisclaimer: 'Herramienta independiente, no afiliada, respaldada ni patrocinada por Amazon Web Services (AWS). Todas las preguntas son escenarios originales para educacion.',
    randomExamDesc: 'Practica con ritmo estilo CLF-C02 usando 65 preguntas aleatorias de la base.',
    settingsTitle: 'Ajustes y datos',
    settingsBody: 'Tu progreso se guarda localmente en este navegador. Exporta una copia si quieres moverlo a otro dispositivo.',
    languageToast: 'Idioma actualizado. Las preguntas quedan en ingles por consistencia con el examen.'
  },
  pt: {
    navHistory: 'Historico',
    navAbout: 'Sobre',
    navSettings: 'Ajustes',
    languageLabel: 'Idioma',
    languageHelper: 'A orientacao da interface muda de idioma. Nomes de servicos AWS e perguntas ficam em ingles para manter consistencia com o exame.',
    heroTitle: 'Cloud Recall Lab',
    heroSubtitle: 'Preparacao CLF-C02 gratuita com pratica interativa, simulados com tempo, progresso local e sem login.',
    stripFree: 'Gratis sempre',
    stripNoAccount: 'Sem conta',
    stripMobile: 'Mobile friendly',
    stripOffline: 'Funciona offline',
    stripLanguages: 'UI multilingue beta',
    stripPassed: 'Usado para passar CLF-C02',
    evidenceBadge: 'Metodo baseado em pesquisa',
    evidenceTitle: 'Criado para recall ativo, nao releitura passiva.',
    evidenceBody: 'Testes praticos, revisao espacada, feedback e treino parecido com prova ajudam a recuperar fatos sob pressao. A rotina aqui e simples: responder, revisar, repetir e acompanhar pontos fracos.',
    languageBadge: 'Suporte de idiomas beta',
    languageTitle: 'Orientacao de estudo em mais idiomas.',
    languageBody: 'Troque a interface principal entre ingles, espanhol, portugues, frances, alemao, italiano e holandes. As perguntas ficam em ingles para preservar nomes de servicos AWS e estilo do exame.',
    mockCardTitle: 'Simulado completo com tempo',
    mockCardDesc: 'Pratique no ritmo CLF-C02 com 65 perguntas aleatorias em 90 minutos. Respostas e explicacoes aparecem apos enviar.',
    mockCardQuestions: '65 perguntas',
    startMockButton: 'Iniciar simulado',
    guidedCardTitle: 'Bloco de estudo guiado',
    guidedCardDesc: 'Teste pratico e recall ativo retêm melhor do que releitura. Abra um bloco guiado com tempos, resumos, quizzes e revisao de erros.',
    startDailyBlock: 'Iniciar bloco',
    dailyRoutineBadge: 'Rotina diaria',
    trainerTitle: 'Treinador de memoria mestre',
    trainerDesc: 'Passe 10 minutos revendo a frase central. Use leitura em voz alta, flashcards 3D ou o jogo de recall ativo.',
    startTraining: 'Iniciar treino',
    studyGuideBadge: 'Referencia do exame',
    studyGuideTitle: 'Guia de estudo e colas',
    studyGuideDesc: 'Pesquise conceitos de nuvem, responsabilidade compartilhada, palavras-gatilho por servico e armadilhas importantes.',
    openStudyGuide: 'Abrir guia',
    activeRecallBadge: 'Recall ativo',
    drillsTitle: 'Drills rapidos de gatilhos',
    drillsDesc: 'Digite a resposta para 95 cenarios rapidos. Se errar, escreva a palavra-gatilho para fixar.',
    startDrills: 'Iniciar drills',
    examSimulationBadge: 'Simulacao de exame',
    miniQuizTitle: 'Quiz misto de 20 perguntas',
    miniQuizDesc: 'Responda 20 perguntas em condicoes de exame. Respostas e pontuacao aparecem no final.',
    startQuiz: 'Iniciar quiz',
    sectionPracticeTitle: 'Pratica por secoes (Dias 1 - 5)',
    aboutTitle: 'Sobre e contato',
    aboutSubtitle: 'Por que existe, como usar com responsabilidade e onde conectar.',
    dashboardButton: 'Painel',
    builtBadge: 'Criado depois de passar',
    builtTitle: 'Usei este ciclo de estudo para passar no AWS Cloud Practitioner em 1 de julho de 2026.',
    builtBody1: 'Criei porque muito material util fica atras de paywalls, ate flashcards basicos, e alguns fluxos com IA mostram a resposta cedo demais. Isso estraga o recall ativo: voce precisa escolher antes de ver feedback.',
    builtBody2: 'A ferramenta mantem o ciclo simples: praticar sob pressao, esconder respostas ate escolher, revisar erros e manter topicos fracos visiveis.',
    wiseBadge: 'Use com criterio',
    wiseTitle: 'Pratica gratis, nao promessa nem substituto de material atual.',
    wiseBody1: 'A AWS pode mudar servicos, escopo e redacao. Use como pratica e recall ativo, e confira a guia atual da AWS, docs e um bom curso.',
    wiseBody2: 'Udemy ajudou muito na minha preparacao. Esta app funciona melhor como camada de pratica depois de aprender o conteudo.',
    resourceBadge: 'Recurso que usei',
    resourceTitle: 'O curso que me ajudou a aprender o conteudo.',
    resourceBody: 'Esta app e a camada de pratica gratis que eu queria ter encontrado. Para aprender os conceitos, o curso da Udemy abaixo foi um dos recursos que me ajudou a passar.',
    resourceCourse: 'Curso da Udemy que me ajudou: Ultimate AWS Certified Cloud Practitioner CLF-C02 2026',
    compatBadge: 'Compatibilidade',
    compatTitle: 'Criado para navegadores modernos, estudo mobile e privacidade.',
    compatBody1: 'A app foi pensada para Chrome, Edge, Firefox e Safari atuais. A instalacao offline funciona melhor em site HTTPS porque depende de service workers.',
    compatBody2: 'O progresso fica neste navegador com localStorage. Leitura em voz alta, compartilhamento nativo e instalacao podem variar por navegador e dispositivo.',
    contactBadge: 'Contato',
    contactTitle: 'Conecte, contribua ou apoie o projeto.',
    contactBody: 'Perguntas, bugs, correcoes e novas questoes originais sao bem-vindas. O projeto e gratis e open source.',
    footerBuilt: 'Criado por Joseph Hauter como ferramenta gratis sem login.',
    footerDisclaimer: 'Ferramenta independente, nao afiliada, endossada ou patrocinada pela Amazon Web Services (AWS). Todas as perguntas sao cenarios originais educacionais.',
    randomExamDesc: 'Pratique no ritmo CLF-C02 com 65 perguntas aleatorias da base.',
    settingsTitle: 'Ajustes e dados',
    settingsBody: 'Seu progresso fica localmente neste navegador. Exporte um backup para mover para outro dispositivo.',
    languageToast: 'Idioma atualizado. As perguntas ficam em ingles para consistencia com o exame.'
  },
  fr: {
    navHistory: 'Historique',
    navAbout: 'A propos',
    navSettings: 'Reglages',
    languageLabel: 'Langue',
    languageHelper: "Les textes d'interface changent de langue. Les noms de services AWS et les questions restent en anglais pour rester proches de l'examen.",
    heroTitle: 'Cloud Recall Lab',
    heroSubtitle: 'Preparation CLF-C02 gratuite avec pratique interactive, examens chronometres, progres local et sans compte.',
    stripFree: 'Toujours gratuit',
    stripNoAccount: 'Sans compte',
    stripMobile: 'Mobile friendly',
    stripOffline: 'Pret hors ligne',
    stripLanguages: 'UI multilingue beta',
    stripPassed: 'Utilise pour reussir CLF-C02',
    evidenceBadge: 'Methode appuyee par la recherche',
    evidenceTitle: 'Concu pour le rappel actif, pas la relecture passive.',
    evidenceBody: "Les tests pratiques, la repetition espacee, le feedback et l'entrainement type examen aident a retrouver les faits sous pression. La routine: repondre, revoir, repeter et suivre les points faibles.",
    languageBadge: 'Support langues beta',
    languageTitle: "Guidage d'etude en plusieurs langues.",
    languageBody: "Changez l'interface principale entre anglais, espagnol, portugais, francais, allemand, italien et neerlandais. Les questions restent en anglais pour garder les noms AWS et la formulation d'examen coherents.",
    mockCardTitle: 'Examen blanc chronometre',
    mockCardDesc: 'Entrainez-vous au rythme CLF-C02 avec 65 questions aleatoires en 90 minutes. Les reponses et explications apparaissent apres soumission.',
    mockCardQuestions: '65 questions',
    startMockButton: "Lancer l'examen",
    guidedCardTitle: "Bloc d'etude guide",
    guidedCardDesc: "Les tests pratiques et le rappel actif retiennent mieux que la relecture. Lancez un bloc guide avec minuteurs, fiches, quiz et revision des erreurs.",
    startDailyBlock: 'Lancer le bloc',
    dailyRoutineBadge: 'Routine quotidienne',
    trainerTitle: 'Entraineur de memoire',
    trainerDesc: 'Passez 10 minutes sur la phrase centrale. Utilisez la lecture vocale, les flashcards 3D ou le jeu de rappel actif.',
    startTraining: "Lancer l'entrainement",
    studyGuideBadge: "Reference d'examen",
    studyGuideTitle: "Guide d'etude et fiches",
    studyGuideDesc: 'Cherchez les concepts cloud, responsabilite partagee, mots declencheurs par service et pieges importants.',
    openStudyGuide: 'Ouvrir le guide',
    activeRecallBadge: 'Rappel actif',
    drillsTitle: 'Drills rapides',
    drillsDesc: 'Tapez la reponse pour 95 scenarios rapides. En cas derreur, ecrivez le mot declencheur pour le memoriser.',
    startDrills: 'Lancer les drills',
    examSimulationBadge: "Simulation d'examen",
    miniQuizTitle: 'Quiz mixte de 20 questions',
    miniQuizDesc: 'Repondez a 20 questions en conditions dexamen. Reponses et score apparaissent a la fin.',
    startQuiz: 'Lancer le quiz',
    sectionPracticeTitle: 'Pratique par sections (Jours 1 - 5)',
    aboutTitle: 'A propos et contact',
    aboutSubtitle: "Pourquoi cela existe, comment l'utiliser avec prudence et ou me contacter.",
    dashboardButton: 'Tableau de bord',
    builtBadge: 'Cree apres reussite',
    builtTitle: "J'ai utilise cette boucle d'etude pour reussir AWS Cloud Practitioner le 1 juillet 2026.",
    builtBody1: "Je l'ai cree parce que trop de preparation utile est payante, meme les flashcards, et certains outils IA montrent la reponse trop tot. Le rappel actif demande de choisir avant de voir le feedback.",
    builtBody2: "L'outil garde la boucle simple: pratiquer sous pression, cacher les reponses jusqu'au choix, revoir chaque erreur et garder les points faibles visibles.",
    wiseBadge: 'A utiliser avec prudence',
    wiseTitle: 'Pratique gratuite, pas une promesse ni un remplacement des sources actuelles.',
    wiseBody1: "AWS peut modifier services, formulation et perimetre. Utilisez ceci pour pratiquer, puis verifiez avec le guide AWS actuel, la documentation et un bon cours.",
    wiseBody2: "Udemy m'a beaucoup aide. Cette app marche le mieux comme couche de pratique apres avoir appris le contenu.",
    resourceBadge: "Ressource utilisee",
    resourceTitle: "Le cours qui m'a aide a apprendre le contenu.",
    resourceBody: "Cette app est la couche de pratique gratuite que j'aurais aime trouver. Pour apprendre les concepts, le cours Udemy ci-dessous a fait partie des ressources qui m'ont aide a reussir.",
    resourceCourse: "Cours Udemy qui m'a aide: Ultimate AWS Certified Cloud Practitioner CLF-C02 2026",
    compatBadge: 'Compatibilite',
    compatTitle: 'Concu pour les navigateurs modernes, le mobile et la confidentialite.',
    compatBody1: "L'app est concue pour les versions recentes de Chrome, Edge, Firefox et Safari. L'installation hors ligne fonctionne mieux depuis un site HTTPS car elle depend des service workers.",
    compatBody2: "Le progres reste dans ce navigateur avec localStorage. La lecture vocale, le partage natif et les invites d'installation peuvent varier selon le navigateur et l'appareil.",
    contactBadge: 'Contact',
    contactTitle: 'Connecter, contribuer ou soutenir le projet.',
    contactBody: 'Questions, bugs, corrections et nouvelles questions originales sont bienvenus. Le projet est gratuit et open source.',
    footerBuilt: 'Cree par Joseph Hauter comme outil gratuit sans compte.',
    footerDisclaimer: "Outil independant, non affilie, approuve ou sponsorise par Amazon Web Services (AWS). Toutes les questions sont des scenarios originaux educatifs.",
    randomExamDesc: 'Entrainez-vous au rythme CLF-C02 avec 65 questions aleatoires de la base.',
    settingsTitle: 'Reglages et donnees',
    settingsBody: 'Votre progres est stocke localement dans ce navigateur. Exportez une sauvegarde pour changer dappareil.',
    languageToast: "Langue mise a jour. Les questions restent en anglais pour rester coherentes avec l'examen."
  },
  de: {
    navHistory: 'Verlauf',
    navAbout: 'Info',
    navSettings: 'Einstellungen',
    languageLabel: 'Sprache',
    languageHelper: 'Die Interface-Hinweise wechseln die Sprache. AWS-Servicenamen und Praxisfragen bleiben auf Englisch, damit die Pruefungssprache konsistent bleibt.',
    heroTitle: 'Cloud Recall Lab',
    heroSubtitle: 'Kostenlose CLF-C02-Vorbereitung mit interaktiver Praxis, zeitgesteuerten Tests, lokalem Fortschritt und ohne Login.',
    stripFree: 'Immer kostenlos',
    stripNoAccount: 'Kein Konto',
    stripMobile: 'Mobilfreundlich',
    stripOffline: 'Offline bereit',
    stripLanguages: 'Mehrsprachige UI beta',
    stripPassed: 'Zum Bestehen von CLF-C02 genutzt',
    evidenceBadge: 'Lernloop mit Forschung',
    evidenceTitle: 'Gebaut fuer aktiven Abruf, nicht passives Wiederlesen.',
    evidenceBody: 'Practice Testing, verteiltes Wiederholen, Feedback und pruefungsaehnliches Training helfen, Wissen unter Druck abzurufen. Die Routine: antworten, pruefen, wiederholen und Schwachstellen verfolgen.',
    languageBadge: 'Sprachsupport beta',
    languageTitle: 'Lernhinweise in mehr Sprachen.',
    languageBody: 'Wechsle die Hauptoberflaeche zwischen Englisch, Spanisch, Portugiesisch, Franzoesisch, Deutsch, Italienisch und Niederlaendisch. Praxisfragen bleiben auf Englisch, damit AWS-Begriffe und Pruefungsstil konsistent bleiben.',
    mockCardTitle: 'Vollstaendiger Zeit-Test',
    mockCardDesc: 'Uebe im CLF-C02-Stil mit 65 zufaelligen Fragen in 90 Minuten. Antworten und Erklaerungen erscheinen nach dem Absenden.',
    mockCardQuestions: '65 Fragen',
    startMockButton: 'Test starten',
    guidedCardTitle: 'Gefuehrter Lernblock',
    guidedCardDesc: 'Practice Testing und aktiver Abruf behalten mehr als Wiederlesen. Starte einen Lernblock mit Timern, Notizen, Quizzen und Fehlerreview.',
    startDailyBlock: 'Block starten',
    dailyRoutineBadge: 'Tagesroutine',
    trainerTitle: 'Memory-Sentence-Trainer',
    trainerDesc: 'Wiederhole 10 Minuten den Kernsatz. Nutze Vorlesen, 3D-Flashcards oder das Active-Recall-Spiel.',
    startTraining: 'Training starten',
    studyGuideBadge: 'Pruefungsreferenz',
    studyGuideTitle: 'Lernhilfe und Spickzettel',
    studyGuideDesc: 'Durchsuche Cloud-Konzepte, Shared Responsibility, Trigger-Woerter pro Service und wichtige Fallen.',
    openStudyGuide: 'Guide oeffnen',
    activeRecallBadge: 'Aktiver Abruf',
    drillsTitle: 'Schnelle Trigger-Drills',
    drillsDesc: 'Tippe die Antwort fuer 95 schnelle Szenarien. Bei Fehlern schreibst du das Trigger-Wort zum Festigen.',
    startDrills: 'Drills starten',
    examSimulationBadge: 'Pruefungssimulation',
    miniQuizTitle: '20-Fragen-Mix-Quiz',
    miniQuizDesc: 'Beantworte 20 Fragen unter Pruefungsbedingungen. Antworten und Score erscheinen am Ende.',
    startQuiz: 'Quiz starten',
    sectionPracticeTitle: 'Sektionspraxis (Tage 1 - 5)',
    aboutTitle: 'Info und Kontakt',
    aboutSubtitle: 'Warum es existiert, wie man es verantwortungsvoll nutzt und wo man Kontakt aufnimmt.',
    dashboardButton: 'Dashboard',
    builtBadge: 'Nach dem Bestehen gebaut',
    builtTitle: 'Ich habe diesen Lernloop genutzt, um AWS Cloud Practitioner am 1. Juli 2026 zu bestehen.',
    builtBody1: 'Ich habe es gebaut, weil zu viel nuetzliche Vorbereitung hinter Paywalls liegt, sogar Flashcards, und manche KI-Lernflows die Antwort zu frueh zeigen. Aktiver Abruf braucht erst eine Entscheidung, dann Feedback.',
    builtBody2: 'Das Tool haelt den Loop einfach: unter Druck ueben, Antworten bis zur Auswahl verstecken, Fehler pruefen und schwache Themen sichtbar halten.',
    wiseBadge: 'Klug nutzen',
    wiseTitle: 'Kostenlose Praxis, kein Versprechen und kein Ersatz fuer aktuelle Materialien.',
    wiseBody1: 'AWS kann Services, Wortlaut und Pruefungsumfang aendern. Nutze es als Praxis und pruefe dann mit dem aktuellen AWS-Guide, Doku und einem guten Kurs.',
    wiseBody2: 'Udemy war fuer meine Vorbereitung sehr hilfreich. Diese App funktioniert am besten als Praxis-Schicht nach dem Lernen.',
    resourceBadge: 'Ressource, die ich genutzt habe',
    resourceTitle: 'Der Kurs, der mir beim Lernen geholfen hat.',
    resourceBody: 'Diese App ist die kostenlose Praxis-Schicht, die ich mir gewuenscht haette. Zum Lernen der Konzepte war der Udemy-Kurs unten eine der Ressourcen, die mir beim Bestehen geholfen hat.',
    resourceCourse: 'Udemy-Kurs, der mir geholfen hat: Ultimate AWS Certified Cloud Practitioner CLF-C02 2026',
    compatBadge: 'Kompatibilitaet',
    compatTitle: 'Gebaut fuer moderne Browser, mobiles Lernen und Datenschutz.',
    compatBody1: 'Die App ist fuer aktuelle Versionen von Chrome, Edge, Firefox und Safari gedacht. Offline-Installation funktioniert am besten ueber HTTPS, weil sie Service Worker nutzt.',
    compatBody2: 'Fortschritt bleibt mit localStorage in diesem Browser. Vorlesen, natives Teilen und Installationshinweise koennen je nach Browser und Geraet variieren.',
    contactBadge: 'Kontakt',
    contactTitle: 'Verbinden, beitragen oder das Projekt unterstuetzen.',
    contactBody: 'Fragen, Bugs, Korrekturen und neue originale Praxisfragen sind willkommen. Das Projekt ist kostenlos und open source.',
    footerBuilt: 'Gebaut von Joseph Hauter als kostenloses Tool ohne Login.',
    footerDisclaimer: 'Unabhaengiges Lerntool, nicht mit Amazon Web Services (AWS) verbunden, unterstuetzt oder gesponsert. Alle Fragen sind originale Lern-Szenarien.',
    randomExamDesc: 'Uebe im CLF-C02-Stil mit 65 zufaelligen Fragen aus der Datenbank.',
    settingsTitle: 'Einstellungen und Daten',
    settingsBody: 'Dein Fortschritt wird lokal in diesem Browser gespeichert. Exportiere ein Backup, um ihn auf ein anderes Geraet zu verschieben.',
    languageToast: 'Sprache aktualisiert. Praxisfragen bleiben fuer Pruefungskonsistenz auf Englisch.'
  },
  it: {
    navHistory: 'Cronologia',
    navAbout: 'Info',
    navSettings: 'Impostazioni',
    languageLabel: 'Lingua',
    languageHelper: "La guida dell'interfaccia cambia lingua. I nomi dei servizi AWS e le domande restano in inglese per coerenza con l'esame.",
    heroTitle: 'Cloud Recall Lab',
    heroSubtitle: 'Preparazione CLF-C02 gratuita con pratica interattiva, esami a tempo, progresso locale e senza login.',
    stripFree: 'Gratis per sempre',
    stripNoAccount: 'Senza account',
    stripMobile: 'Mobile friendly',
    stripOffline: 'Pronto offline',
    stripLanguages: 'UI multilingue beta',
    stripPassed: 'Usato per passare CLF-C02',
    evidenceBadge: 'Metodo supportato da ricerca',
    evidenceTitle: 'Creato per richiamo attivo, non rilettura passiva.',
    evidenceBody: 'Practice testing, ripasso distribuito, feedback e simulazioni di esame aiutano a recuperare i fatti sotto pressione. La routine resta semplice: rispondi, rivedi, ripeti e traccia i punti deboli.',
    languageBadge: 'Supporto lingue beta',
    languageTitle: 'Guida allo studio in piu lingue.',
    languageBody: "Cambia l'interfaccia tra inglese, spagnolo, portoghese, francese, tedesco, italiano e olandese. Le domande restano in inglese per mantenere coerenti i nomi AWS e il linguaggio dell'esame.",
    mockCardTitle: 'Esame simulato completo',
    mockCardDesc: 'Esercitati con ritmo CLF-C02: 65 domande casuali in 90 minuti. Risposte e spiegazioni appaiono dopo la consegna.',
    mockCardQuestions: '65 domande',
    startMockButton: 'Avvia esame',
    guidedCardTitle: 'Blocco di studio guidato',
    guidedCardDesc: 'Practice testing e richiamo attivo aiutano piu della rilettura. Avvia un blocco con timer, schede, quiz e revisione degli errori.',
    startDailyBlock: 'Avvia blocco',
    dailyRoutineBadge: 'Routine giornaliera',
    trainerTitle: 'Trainer della frase memoria',
    trainerDesc: 'Dedica 10 minuti alla frase principale. Usa lettura vocale, flashcard 3D o il gioco di richiamo attivo.',
    startTraining: 'Avvia training',
    studyGuideBadge: 'Riferimento esame',
    studyGuideTitle: 'Guida di studio e cheat sheet',
    studyGuideDesc: 'Apri la guida interattiva. Cerca concetti cloud, parole trigger dei servizi, servizi serverless, coppie confuse e trappole ad alto rendimento.',
    openStudyGuide: 'Apri guida',
    activeRecallBadge: 'Richiamo attivo',
    drillsTitle: 'Drill rapidi sui trigger',
    drillsDesc: 'Scrivi la risposta per 95 scenari rapidi. Se sbagli, scrivi la parola trigger per fissarla in memoria.',
    startDrills: 'Avvia drill',
    examSimulationBadge: 'Simulazione esame',
    miniQuizTitle: 'Quiz misto da 20 domande',
    miniQuizDesc: 'Rispondi a 20 domande in condizioni di esame. Risposte e punteggio compaiono alla fine.',
    startQuiz: 'Avvia quiz',
    sectionPracticeTitle: 'Pratica per sezioni (Giorni 1 - 5)',
    aboutTitle: 'Info e contatti',
    aboutSubtitle: 'Perche esiste, come usarlo con cura e dove collegarsi.',
    dashboardButton: 'Dashboard',
    builtBadge: 'Creato dopo aver passato',
    builtTitle: "Ho usato questo ciclo di studio per passare AWS Cloud Practitioner il 1 luglio 2026.",
    builtBody1: "L'ho creato perche troppo materiale utile resta dietro paywall, anche le flashcard, e alcuni flussi con AI mostrano la risposta troppo presto. Questo rovina il richiamo attivo: prima devi scegliere, poi vedere il feedback.",
    builtBody2: 'Lo strumento mantiene il ciclo semplice: pratica sotto pressione, risposte nascoste finche scegli, revisione di ogni errore e punti deboli sempre visibili.',
    wiseBadge: 'Usalo bene',
    wiseTitle: 'Pratica gratuita, non una promessa o un sostituto dei materiali aggiornati.',
    wiseBody1: 'AWS puo cambiare servizi, formulazione e scope della certificazione. Usalo come pratica e richiamo attivo, poi controlla la guida AWS attuale, la documentazione e un buon corso.',
    wiseBody2: 'Udemy mi ha aiutato molto. Questa app funziona meglio come compagna: impara con un corso, poi usa il lab per verificare se recuperi le risposte sotto pressione.',
    resourceBadge: 'Risorsa usata',
    resourceTitle: 'Il corso che mi ha aiutato a imparare il materiale.',
    resourceBody: 'Questa app e il livello di pratica gratuito che avrei voluto trovare. Per imparare i concetti, il corso Udemy qui sotto era una delle risorse che mi ha aiutato a passare.',
    resourceCourse: 'Corso Udemy che mi ha aiutato: Ultimate AWS Certified Cloud Practitioner CLF-C02 2026',
    compatBadge: 'Compatibilita',
    compatTitle: 'Creato per browser moderni, studio mobile e lancio privacy-first.',
    compatBody1: "L'app e pensata per versioni attuali di Chrome, Edge, Firefox e Safari. L'installazione offline funziona meglio da un sito HTTPS perche dipende dai service worker.",
    compatBody2: 'Il progresso resta in questo browser con localStorage. Lettura vocale, condivisione nativa e prompt di installazione possono variare per browser e dispositivo.',
    contactBadge: 'Contatto',
    contactTitle: 'Connettiti, contribuisci o supporta il progetto.',
    contactBody: 'Domande, bug, correzioni e nuove domande originali sono benvenute. Il progetto e gratis e open source per evitare un altro paywall.',
    footerBuilt: 'Creato da Joseph Hauter come strumento gratuito senza login.',
    footerDisclaimer: 'Strumento indipendente, non affiliato, approvato o sponsorizzato da Amazon Web Services (AWS). Tutte le domande sono scenari originali per scopi educativi.',
    randomExamDesc: 'Esercitati in stile CLF-C02 con 65 domande casuali dal database.',
    settingsTitle: 'Impostazioni e dati',
    settingsBody: 'Il tuo progresso viene salvato localmente in questo browser. Esporta un backup per spostarlo su un altro dispositivo.',
    languageToast: "Lingua aggiornata. Le domande restano in inglese per coerenza con l'esame."
  },
  nl: {
    navHistory: 'Geschiedenis',
    navAbout: 'Over',
    navSettings: 'Instellingen',
    languageLabel: 'Taal',
    languageHelper: 'De interface-uitleg verandert van taal. AWS-servicenamen en oefenvragen blijven Engels voor consistentie met het examen.',
    heroTitle: 'Cloud Recall Lab',
    heroSubtitle: 'Gratis CLF-C02 voorbereiding met interactieve oefening, getimede examens, lokale voortgang en geen login.',
    stripFree: 'Altijd gratis',
    stripNoAccount: 'Geen account',
    stripMobile: 'Mobiel vriendelijk',
    stripOffline: 'Offline klaar',
    stripLanguages: 'Meertalige UI beta',
    stripPassed: 'Gebruikt om CLF-C02 te halen',
    evidenceBadge: 'Onderbouwde studie-loop',
    evidenceTitle: 'Gebouwd rond active recall, niet passief herlezen.',
    evidenceBody: 'Practice testing, gespreide herhaling, feedback en examenachtige training helpen om feiten onder druk op te halen. De routine is simpel: antwoord, review, herhaal en volg zwakke punten.',
    languageBadge: 'Taalondersteuning beta',
    languageTitle: 'Studiebegeleiding in meer talen.',
    languageBody: 'Schakel de hoofdinterface tussen Engels, Spaans, Portugees, Frans, Duits, Italiaans en Nederlands. Oefenvragen blijven Engels zodat AWS-namen en examenstijl consistent blijven.',
    mockCardTitle: 'Volledig getimed proefexamen',
    mockCardDesc: 'Oefen in CLF-C02-stijl met 65 willekeurige vragen in 90 minuten. Antwoorden en uitleg verschijnen nadat je inlevert.',
    mockCardQuestions: '65 vragen',
    startMockButton: 'Start examen',
    guidedCardTitle: 'Begeleid studieblok',
    guidedCardDesc: 'Practice testing en active recall werken beter dan herlezen. Start een blok met timers, cheatsheets, quizzen en foutreview.',
    startDailyBlock: 'Start blok',
    dailyRoutineBadge: 'Dagelijkse routine',
    trainerTitle: 'Master memory trainer',
    trainerDesc: 'Besteed 10 minuten aan de kernzin. Gebruik voorlezen, 3D-flashcards of het active-recall spel.',
    startTraining: 'Start training',
    studyGuideBadge: 'Examenreferentie',
    studyGuideTitle: 'Studiegids en cheatsheets',
    studyGuideDesc: 'Open de interactieve studiegids. Zoek cloudconcepten, service-triggerwoorden, serverless services, verwarrende paren en belangrijke examenvallen.',
    openStudyGuide: 'Open gids',
    activeRecallBadge: 'Active recall',
    drillsTitle: 'Snelle trigger-drills',
    drillsDesc: 'Typ je antwoord voor 95 snelle scenarios. Als je mist, schrijf je het triggerwoord om het vast te zetten.',
    startDrills: 'Start drills',
    examSimulationBadge: 'Examensimulatie',
    miniQuizTitle: 'Gemengde quiz met 20 vragen',
    miniQuizDesc: 'Beantwoord 20 vragen onder examenomstandigheden. Antwoorden en score verschijnen aan het einde.',
    startQuiz: 'Start quiz',
    sectionPracticeTitle: 'Sectiegerichte oefening (Dag 1 - 5)',
    aboutTitle: 'Over en contact',
    aboutSubtitle: 'Waarom dit bestaat, hoe je het verstandig gebruikt en waar je contact maakt.',
    dashboardButton: 'Dashboard',
    builtBadge: 'Gebouwd na slagen',
    builtTitle: 'Ik gebruikte deze studie-loop om AWS Cloud Practitioner te halen op 1 juli 2026.',
    builtBody1: 'Ik maakte dit omdat te veel nuttige voorbereiding achter paywalls zit, zelfs flashcards, en sommige AI-studieflows het antwoord te vroeg tonen. Dat verpest active recall: je moet eerst kiezen en daarna feedback zien.',
    builtBody2: 'De tool houdt de loop simpel: oefenen onder druk, antwoorden verbergen tot je kiest, elke fout reviewen en zwakke onderwerpen zichtbaar houden.',
    wiseBadge: 'Gebruik het verstandig',
    wiseTitle: 'Gratis oefening, geen belofte en geen vervanging voor actuele materialen.',
    wiseBody1: 'AWS kan services, woordkeuze en certificeringsscope wijzigen. Gebruik dit als oefening en active recall, en controleer daarna de actuele AWS exam guide, AWS docs en een sterke cursus.',
    wiseBody2: 'Udemy hielp mij veel. Deze app werkt het best als oefenlaag: leer met een cursus, gebruik daarna de lab om te testen of je het antwoord onder druk kunt ophalen.',
    resourceBadge: 'Resource die ik gebruikte',
    resourceTitle: 'De cursus die mij hielp het materiaal te leren.',
    resourceBody: 'Deze app is de gratis oefenlaag die ik zelf wilde vinden. Voor het leren van concepten was de Udemy-cursus hieronder een van de resources die mij hielp slagen.',
    resourceCourse: 'Udemy-cursus die mij hielp: Ultimate AWS Certified Cloud Practitioner CLF-C02 2026',
    compatBadge: 'Compatibiliteit',
    compatTitle: 'Gebouwd voor moderne browsers, mobiel studeren en privacy-first launch.',
    compatBody1: 'De app is bedoeld voor huidige Chrome, Edge, Firefox en Safari. Offline installeren werkt het best vanaf een HTTPS-site omdat het service workers gebruikt.',
    compatBody2: 'Voortgang blijft in deze browser met localStorage. Voorlezen, native delen en installatieprompts kunnen verschillen per browser en apparaat.',
    contactBadge: 'Contact',
    contactTitle: 'Verbind, draag bij of steun het project.',
    contactBody: 'Vragen, bug reports, correcties en nieuwe originele oefenvragen zijn welkom. Het project is gratis en open source zodat learners geen extra paywall nodig hebben.',
    footerBuilt: 'Gebouwd door Joseph Hauter als gratis tool zonder login.',
    footerDisclaimer: 'Onafhankelijke studietool, niet verbonden aan, goedgekeurd door of gesponsord door Amazon Web Services (AWS). Alle vragen zijn originele oefenscenarios voor educatie.',
    randomExamDesc: 'Oefen in CLF-C02-stijl met 65 willekeurige vragen uit de database.',
    settingsTitle: 'Instellingen en data',
    settingsBody: 'Je voortgang wordt lokaal in deze browser opgeslagen. Exporteer een backup als je die naar een ander apparaat wilt verplaatsen.',
    languageToast: 'Taal bijgewerkt. Oefenvragen blijven Engels voor examenconsistentie.'
  }
};

const I18N_PATCHES = {
  en: {
    languageBody: 'Switch the main interface copy between English, Spanish, Portuguese, French, German, Italian, Dutch, Hindi, and Japanese. Practice questions stay in English so AWS service names and exam wording remain consistent.',
    practiceModeHint: 'Practice checks single-answer questions instantly; multi-select uses Submit Choices. Timed mocks wait until final submit.',
    readinessPillLabel: 'Ready:',
    readinessCountLabel: 'checks complete',
    sourceMapBadge: 'Official source map',
    sourceMapTitle: 'What this guide is anchored to.',
    sourceMapBody: 'Use these links as the source check before exam week. The app turns the official scope into recall practice; AWS docs remain the truth when wording or services change.',
    officialStudyTitle: 'Study these official anchors',
    officialAvoidTitle: 'Avoid these rabbit holes',
    builtBody2: "This tool keeps the study loop simple: practice under pressure, hide answers until you choose, review every miss, and keep weak topics visible until they get easier. I used Udemy and current learning material to learn the concepts, then used this app's original practice sets instead of buying separate mock exams.",
    officialResourceBody: 'Use the official AWS exam guide as the source of truth for current scope, domain weights, and service coverage. This app turns that scope into recall drills, not a replacement for AWS updates.',
    officialResourceLink: 'Official AWS CLF-C02 exam guide',
    supportButton: 'Support',
    guidePageTitle: 'Study Guide & Cheat Sheets',
    guidePageSubtitle: 'Browse, search, and memorize core AWS concepts, trigger words, and exam traps.',
    exitGuide: 'Exit Guide',
    guideTabConcepts: 'Cloud Concepts',
    guideTabResponsibility: 'Shared Responsibility',
    guideTabDirectory: 'Service Index & Triggers',
    guideTabServerless: 'Serverless Map',
    guideTabTraps: 'Highest-Yield Traps',
    guideTabPairs: 'Confusing Pairs',
    guideTabStrategy: 'Last-Minute Strategy',
    guideTabPassPlan: '7-Day Pass Plan',
    guideConceptsTitle: 'Core Cloud Concepts',
    guideConceptColumn: 'Concept',
    guideMeaningColumn: 'Memory Hook / Meaning',
    guideResponsibilityTitle: 'Shared Responsibility Matrix',
    guideResponsibilityBody: 'Remember: AWS is responsible for security OF the cloud, and the customer is responsible for security IN the cloud.',
    guideAwsResponsibility: 'AWS Responsibility (OF the Cloud)',
    guideCustomerResponsibility: 'Customer Responsibility (IN the Cloud)',
    guideResponsibilityQuestions: 'Common Responsibility Questions',
    guideSearchPlaceholder: 'Search services, trigger words, or descriptions (e.g. S3, SQL, database)...',
    serverlessBadgeTitle: 'Exam shortcut',
    serverlessTitle: 'Serverless services map',
    serverlessBody: 'For CLF-C02, the official Serverless category focuses on Lambda and Fargate. Also recognize serverless-style services and variants where AWS handles capacity and scaling, such as DynamoDB, Athena, Glue, S3, Data Firehose, Aurora Serverless v2, Redshift Serverless, OpenSearch Serverless, and managed AI/app services. You still configure access, data, costs, and service behavior.',
    trapsTitle: 'Highest-Yield Exam Traps',
    trapsBody: 'Recognize these patterns in the exam questions to quickly identify the likely service.',
    trapsQuestionColumn: 'If the question says...',
    trapsAnswerColumn: 'The correct answer is...',
    pairsSearchPlaceholder: 'Search confusing pairs (e.g. CloudWatch, RDS)...',
    pairsIntroBadge: 'Exam decision helper',
    pairsIntroTitle: 'Confusing pairs, cleaned up.',
    pairsIntroBody: 'Scan the decision rule first. Expand a pair only when you need definitions or trigger words for two answers that both feel close.',
    pairCountLabel: '{count} pair checks',
    pairCountOneLabel: '1 pair check',
    pairCompareLabel: 'Compare',
    pairOpenLabel: 'Open',
    pairCloseLabel: 'Close',
    pairTriggerLabel: 'Exam trigger',
    pairDecisionLabel: 'How to choose',
    noPairsResults: 'No confusing pairs found matching "{query}".',
    readinessGateBadge: 'Final readiness gate',
    readinessTitle: 'CLF-C02 Readiness Gate',
    readinessBody: 'Use this before exam day: two checks are measured from your practice history, and four are honest confirmations. It helps expose gaps; it does not guarantee a pass.',
    domainWeightsTitle: 'CLF-C02 Domain Weights',
    officialSourceBadge: 'Official source check',
    officialSourceBody: 'Domain weights and scope should be checked against the current AWS exam guide before exam day.',
    officialSourceLink: 'Open AWS exam guide',
    mustSkipTitle: 'Must-Know vs. Skip Guide',
    mustSkipBody: "Focus your final hours where it counts. Don't waste energy memorizing config details.",
    mustKnowHeading: 'MUST KNOW HARD',
    skipHeading: 'SKIP / KNOW LIGHTLY',
    examDayMethodTitle: 'Final Exam-Day Method',
    lastPageTitle: 'Last-Page Memory Cheat Sheet',
    lastPageBody: 'This super-condensed service summary covers everything you need to review right before entering the exam room.',
    passPlanTitle: '7-Day Pass Plan',
    passPlanBody: 'A focused daily plan weighted toward the highest-scoring domains. About 2-3 hours/day. Each day lists exactly what to do and why it moves your score.',
    passStrategiesTitle: 'How Real People Passed - Proven Strategies',
    passStrategiesBody: 'Synthesized from public study reports and AWS-published guidance. Paraphrased - no confidential or unauthorized exam content.',
    serverlessLabel: 'Serverless',
    serverlessSummaryServices: 'exam-relevant services flagged',
    serverlessSummaryBuckets: 'mental buckets: compute, APIs, data, integration, AI/app',
    serverlessSummaryCaution: 'but IAM, data, cost, and config still matter',
    serverlessServiceCount: '{count} services',
    keyTriggerLabel: 'Key trigger',
    managedServiceFallback: 'Managed AWS service',
    noServiceResults: 'No services found matching "{query}".',
    trapQuestionTemplate: 'If the question says "{term}"...',
    trapAnswerTemplate: 'The correct answer is "{answer}"',
    passPlanDayLabel: 'Day {day}: {focus}',
    passPlanWhyLabel: 'Why',
    selectedPlanSummary: 'Selected: {label}',
    plan90: '90 minutes',
    plan120: '2 hours',
    plan180: '3 hours',
    readinessMockTitle: 'Hit 80%+ on two timed mocks',
    readinessMockAchieved: 'Done: {count} mocks at 80%+.',
    readinessMockProgress: 'Need two mocks at 80%+; current count: {count}.',
    readinessWrongTitle: 'Keep wrong-answer pool under 5',
    readinessWrongAchieved: 'Done: wrong-answer pool is small ({count} items).',
    readinessWrongProgress: 'Keep the wrong-answer pool under 5 after practice; current count: {count}.',
    readinessWrongEmpty: 'Start a quiz first; an empty wrong-answer pool only matters after real attempts.',
    readinessMasterTitle: 'Recall the 47 service anchors without looking',
    readinessMasterInfo: 'Self-check: can you explain the Master Memory Page out loud?',
    readinessPairsTitle: 'Explain the top confusing pairs',
    readinessPairsInfo: 'Self-check: CloudWatch vs CloudTrail, WAF vs Shield vs GuardDuty, SQS vs SNS, and the rest.',
    readinessDrillsTitle: 'Score 80%+ on Rapid Trigger Drills',
    readinessDrillsInfo: 'Self-check: match scenario triggers to services quickly and consistently.',
    readinessOfficialTitle: 'Review official AWS practice questions',
    readinessOfficialInfo: 'Self-check: compare your wording instincts against current AWS materials.',
    readinessAchievedLabel: 'Ready signal',
    readinessProgressLabel: 'Needs work',
    readinessMeasuredLabel: 'Measured',
    readinessSelfCheckLabel: 'Self-check',
    readinessActionMock: 'Take timed mock',
    readinessActionWrongs: 'Review wrong answers',
    readinessActionMaster: 'Open memory trainer',
    readinessActionPairs: 'Open confusing pairs',
    readinessActionDrills: 'Start trigger drills',
    readinessActionOfficial: 'Open AWS guide'
  },
  es: {
    whyBadge: 'Por que Cloud Recall Lab',
    whyTitle: 'La capa de practica gratis que queria mientras estudiaba.',
    whyBody: 'Muchas herramientas esconden practica util tras paywalls o muestran respuestas demasiado pronto. Este lab te obliga a elegir, recibir feedback y revisar errores sin crear cuenta.',
    whyProofKicker: 'Prueba personal, no promesa',
    whyProofTitle: 'Use esta app mientras estudiaba y aprobe CLF-C02 el 1 de julio de 2026.',
    whyProofBody: 'Mi reporte mostro Meets Competencies en los cuatro dominios. No garantiza resultados, pero muestra que el ciclo puede funcionar con materiales actuales.',
    whyCredentialLink: 'Verificar mi credencial AWS en Credly',
    whyPillPassed: 'Aprobado el 1 de julio de 2026',
    whyPillDomains: 'Meets Competencies en todos los dominios',
    whyPillCourse: 'Mejor con curso actual o docs AWS',
    whyPillNoDumps: 'Practica original, sin braindumps',
    languageBody: 'Cambia la interfaz entre ingles, espanol, portugues, frances, aleman, italiano, neerlandes, hindi y japones. Las preguntas quedan en ingles para mantener los terminos AWS consistentes.',
    practiceModeHint: 'La practica corrige preguntas de una respuesta al instante; multi-select usa Submit Choices. Los mocks esperan hasta el envio final.',
    builtBody2: 'La herramienta mantiene el ciclo simple: practicar bajo presion, ocultar respuestas hasta elegir, revisar errores y mantener visibles los temas debiles. No pague por mocks separados; use los sets originales de esta app junto con material actualizado.',
    communityResourceBody: 'Para enlaces mantenidos por la comunidad, la wiki de r/AWSCertifications ayuda con rutas, descuentos, recursos gratis y FAQs. Usala como guia comunitaria, no material oficial AWS.',
    communityResourceLink: 'Wiki comunitaria r/AWSCertifications',
    officialResourceBody: 'Usa la guia oficial de AWS como fuente de verdad para alcance, pesos de dominio y servicios. Esta app convierte ese alcance en practica de recuerdo.',
    officialResourceLink: 'Guia oficial AWS CLF-C02',
    supportButton: 'Apoyar',
    guidePageTitle: 'Guia de estudio y chuletas',
    guidePageSubtitle: 'Busca y memoriza conceptos AWS, palabras trigger y trampas de examen.',
    exitGuide: 'Salir de guia',
    guideTabConcepts: 'Conceptos cloud',
    guideTabResponsibility: 'Responsabilidad compartida',
    guideTabDirectory: 'Indice de servicios',
    guideTabServerless: 'Mapa serverless',
    guideTabTraps: 'Trampas clave',
    guideTabPairs: 'Pares confusos',
    guideTabStrategy: 'Estrategia final',
    guideTabPassPlan: 'Plan de 7 dias',
    guideConceptsTitle: 'Conceptos cloud centrales',
    guideConceptColumn: 'Concepto',
    guideMeaningColumn: 'Gancho / significado',
    guideResponsibilityTitle: 'Matriz de responsabilidad compartida',
    guideResponsibilityBody: 'Recuerda: AWS protege la nube; el cliente protege lo que configura dentro de la nube.',
    guideAwsResponsibility: 'Responsabilidad de AWS',
    guideCustomerResponsibility: 'Responsabilidad del cliente',
    guideResponsibilityQuestions: 'Preguntas comunes de responsabilidad',
    guideSearchPlaceholder: 'Busca servicios, triggers o descripciones (ej. S3, SQL, database)...',
    serverlessBadgeTitle: 'Atajo de examen',
    serverlessTitle: 'Mapa de servicios serverless',
    serverlessBody: 'En CLF-C02, serverless suele significar que AWS maneja capacidad, escalado, disponibilidad y mucha infraestructura. Tu sigues configurando acceso, datos, costos y comportamiento.',
    trapsTitle: 'Trampas de examen clave',
    trapsBody: 'Reconoce estos patrones para identificar rapido el servicio probable.',
    trapsQuestionColumn: 'Si la pregunta dice...',
    trapsAnswerColumn: 'La respuesta correcta es...',
    pairsSearchPlaceholder: 'Busca pares confusos (ej. CloudWatch, RDS)...',
    readinessTitle: 'Auditoria de preparacion CLF-C02',
    readinessBody: 'Completa seis checks antes del examen. Dos se miden con tu historial; cuatro son autoevaluaciones honestas.',
    domainWeightsTitle: 'Pesos de dominio CLF-C02',
    officialSourceBadge: 'Fuente oficial',
    officialSourceBody: 'Antes del examen, confirma pesos y alcance en la guia actual de AWS.',
    officialSourceLink: 'Abrir guia AWS',
    mustSkipTitle: 'Que saber vs. que dejar ligero',
    mustSkipBody: 'Enfoca tus ultimas horas donde cuenta. No memorices detalles de configuracion.',
    mustKnowHeading: 'SABER MUY BIEN',
    skipHeading: 'SALTAR / SABER LIGERO',
    examDayMethodTitle: 'Metodo final de examen',
    lastPageTitle: 'Chuleta final de memoria',
    lastPageBody: 'Resumen condensado para revisar justo antes del examen.',
    passPlanTitle: 'Plan de 7 dias',
    passPlanBody: 'Plan diario enfocado en los dominios con mas peso. Unas 2-3 horas/dia.',
    passStrategiesTitle: 'Estrategias reales de aprobados',
    passStrategiesBody: 'Sintetizado de reportes publicos y guia AWS. Parafraseado, sin contenido filtrado.',
    serverlessLabel: 'Serverless',
    serverlessSummaryServices: 'servicios relevantes marcados',
    serverlessSummaryBuckets: 'grupos mentales: compute, APIs, datos, integracion, AI',
    serverlessSummaryCaution: 'sin servidores, pero IAM, datos, costo y config importan',
    serverlessServiceCount: '{count} servicios',
    keyTriggerLabel: 'Trigger clave',
    managedServiceFallback: 'Servicio AWS administrado',
    noServiceResults: 'No se encontraron servicios para "{query}".',
    trapQuestionTemplate: 'Si la pregunta dice "{term}"...',
    trapAnswerTemplate: 'La respuesta correcta es "{answer}"',
    passPlanDayLabel: 'Dia {day}: {focus}',
    passPlanWhyLabel: 'Por que',
    selectedPlanSummary: 'Seleccionado: {label}',
    plan90: '90 minutos',
    plan120: '2 horas',
    plan180: '3 horas',
    readinessMockTitle: '80%+ en dos mocks cronometrados',
    readinessMockAchieved: 'Listo: {count} mocks con 80%+.',
    readinessMockProgress: 'Necesitas dos mocks con 80%+; actual: {count}.',
    readinessWrongTitle: 'Mantener menos de 5 errores pendientes',
    readinessWrongAchieved: 'Listo: pool de errores pequeno ({count}).',
    readinessWrongProgress: 'Mantén el pool bajo 5; actual: {count}.',
    readinessMasterTitle: 'Recordar los 47 anchors sin mirar',
    readinessMasterInfo: 'Auto-check: puedes explicar la Master Memory Page en voz alta?',
    readinessPairsTitle: 'Explicar los pares confusos principales',
    readinessPairsInfo: 'Auto-check: CloudWatch vs CloudTrail, WAF vs Shield vs GuardDuty, SQS vs SNS, etc.',
    readinessDrillsTitle: '80%+ en Rapid Trigger Drills',
    readinessDrillsInfo: 'Auto-check: empareja triggers con servicios rapido y consistente.',
    readinessOfficialTitle: 'Revisar preguntas oficiales AWS',
    readinessOfficialInfo: 'Auto-check: compara tu intuicion con materiales AWS actuales.',
    readinessAchievedLabel: 'Logrado',
    readinessProgressLabel: 'En progreso'
  },
  pt: {
    whyBadge: 'Por que Cloud Recall Lab',
    whyTitle: 'A camada de pratica gratis que eu queria enquanto estudava.',
    whyBody: 'Muitas ferramentas escondem pratica util atras de paywall ou mostram respostas cedo demais. Este lab faz voce escolher, receber feedback e revisar erros sem conta.',
    whyProofKicker: 'Prova pessoal, nao promessa',
    whyProofTitle: 'Usei esta app na preparacao e passei CLF-C02 em 1 de julho de 2026.',
    whyProofBody: 'Meu relatorio mostrou Meets Competencies nos quatro dominios. Nao garante resultado, mas mostra que o ciclo pode funcionar com materiais atuais.',
    whyCredentialLink: 'Verificar minha credencial AWS no Credly',
    whyPillPassed: 'Passei em 1 de julho de 2026',
    whyPillDomains: 'Meets Competencies em todos os dominios',
    whyPillCourse: 'Melhor com curso atual ou docs AWS',
    whyPillNoDumps: 'Pratica original, sem braindumps',
    languageBody: 'Troque a interface entre ingles, espanhol, portugues, frances, alemao, italiano, holandes, hindi e japones. As perguntas ficam em ingles para preservar termos AWS.',
    practiceModeHint: 'A pratica corrige perguntas de uma resposta na hora; multi-select usa Submit Choices. Simulados com tempo esperam ate o envio final.',
    builtBody2: 'A ferramenta mantem o ciclo simples: praticar sob pressao, esconder respostas ate escolher, revisar erros e manter topicos fracos visiveis. Nao paguei por simulados separados; usei os sets originais da app com material atualizado.',
    communityResourceBody: 'Para links mantidos pela comunidade, a wiki r/AWSCertifications ajuda com caminhos, descontos, recursos gratis e FAQs. Use como guia comunitario, nao material oficial AWS.',
    communityResourceLink: 'Wiki r/AWSCertifications',
    officialResourceBody: 'Use a guia oficial da AWS como fonte de verdade para escopo, pesos dos dominios e servicos. Esta app transforma esse escopo em pratica de recall.',
    officialResourceLink: 'Guia oficial AWS CLF-C02',
    supportButton: 'Apoiar',
    guidePageTitle: 'Guia de estudo e colas',
    guidePageSubtitle: 'Pesquise e memorize conceitos AWS, palavras-gatilho e armadilhas do exame.',
    exitGuide: 'Sair do guia',
    guideTabConcepts: 'Conceitos cloud',
    guideTabResponsibility: 'Responsabilidade compartilhada',
    guideTabDirectory: 'Indice de servicos',
    guideTabServerless: 'Mapa serverless',
    guideTabTraps: 'Armadilhas chave',
    guideTabPairs: 'Pares confusos',
    guideTabStrategy: 'Estrategia final',
    guideTabPassPlan: 'Plano de 7 dias',
    guideConceptsTitle: 'Conceitos cloud principais',
    guideConceptColumn: 'Conceito',
    guideMeaningColumn: 'Gancho / significado',
    guideResponsibilityTitle: 'Matriz de responsabilidade compartilhada',
    guideResponsibilityBody: 'Lembre: AWS protege a nuvem; o cliente protege o que configura dentro dela.',
    guideAwsResponsibility: 'Responsabilidade da AWS',
    guideCustomerResponsibility: 'Responsabilidade do cliente',
    guideResponsibilityQuestions: 'Perguntas comuns de responsabilidade',
    guideSearchPlaceholder: 'Busque servicos, gatilhos ou descricoes (ex. S3, SQL, database)...',
    serverlessBadgeTitle: 'Atalho do exame',
    serverlessTitle: 'Mapa de servicos serverless',
    serverlessBody: 'No CLF-C02, serverless geralmente significa que a AWS cuida de capacidade, escala, disponibilidade e parte da infraestrutura. Voce ainda configura acesso, dados, custos e comportamento.',
    trapsTitle: 'Armadilhas principais do exame',
    trapsBody: 'Reconheca estes padroes para identificar rapidamente o servico provavel.',
    trapsQuestionColumn: 'Se a pergunta diz...',
    trapsAnswerColumn: 'A resposta correta e...',
    pairsSearchPlaceholder: 'Busque pares confusos (ex. CloudWatch, RDS)...',
    readinessTitle: 'Auditoria de preparo CLF-C02',
    readinessBody: 'Complete seis checks antes do exame. Dois vem do historico; quatro sao autoavaliacoes honestas.',
    domainWeightsTitle: 'Pesos dos dominios CLF-C02',
    officialSourceBadge: 'Fonte oficial',
    officialSourceBody: 'Antes do exame, confirme pesos e escopo na guia atual da AWS.',
    officialSourceLink: 'Abrir guia AWS',
    mustSkipTitle: 'Saber bem vs. saber leve',
    mustSkipBody: 'Foque as ultimas horas onde importa. Nao memorize detalhes de configuracao.',
    mustKnowHeading: 'SABER MUITO BEM',
    skipHeading: 'PULAR / SABER LEVE',
    examDayMethodTitle: 'Metodo final de exame',
    lastPageTitle: 'Cola final de memoria',
    lastPageBody: 'Resumo condensado para revisar logo antes da prova.',
    passPlanTitle: 'Plano de 7 dias',
    passPlanBody: 'Plano diario focado nos dominios de maior peso. Cerca de 2-3 horas/dia.',
    passStrategiesTitle: 'Estrategias reais de aprovados',
    passStrategiesBody: 'Sintese de relatos publicos e guia AWS. Parafraseado, sem conteudo vazado.',
    serverlessLabel: 'Serverless',
    serverlessSummaryServices: 'servicos relevantes marcados',
    serverlessSummaryBuckets: 'grupos mentais: compute, APIs, dados, integracao, AI',
    serverlessSummaryCaution: 'sem servidores, mas IAM, dados, custo e config importam',
    serverlessServiceCount: '{count} servicos',
    keyTriggerLabel: 'Gatilho chave',
    managedServiceFallback: 'Servico AWS gerenciado',
    noServiceResults: 'Nenhum servico encontrado para "{query}".',
    trapQuestionTemplate: 'Se a pergunta diz "{term}"...',
    trapAnswerTemplate: 'A resposta correta e "{answer}"',
    passPlanDayLabel: 'Dia {day}: {focus}',
    passPlanWhyLabel: 'Por que',
    selectedPlanSummary: 'Selecionado: {label}',
    plan90: '90 minutos',
    plan120: '2 horas',
    plan180: '3 horas',
    readinessMockTitle: '80%+ em dois simulados cronometrados',
    readinessMockAchieved: 'Feito: {count} simulados com 80%+.',
    readinessMockProgress: 'Precisa de dois simulados com 80%+; atual: {count}.',
    readinessWrongTitle: 'Manter menos de 5 erros pendentes',
    readinessWrongAchieved: 'Feito: pool de erros pequeno ({count}).',
    readinessWrongProgress: 'Mantenha o pool abaixo de 5; atual: {count}.',
    readinessMasterTitle: 'Recordar os 47 anchors sem olhar',
    readinessMasterInfo: 'Auto-check: consegue explicar a Master Memory Page em voz alta?',
    readinessPairsTitle: 'Explicar os principais pares confusos',
    readinessPairsInfo: 'Auto-check: CloudWatch vs CloudTrail, WAF vs Shield vs GuardDuty, SQS vs SNS, etc.',
    readinessDrillsTitle: '80%+ nos Rapid Trigger Drills',
    readinessDrillsInfo: 'Auto-check: ligue gatilhos aos servicos rapido e consistente.',
    readinessOfficialTitle: 'Revisar perguntas oficiais AWS',
    readinessOfficialInfo: 'Auto-check: compare sua intuicao com materiais AWS atuais.',
    readinessAchievedLabel: 'Concluido',
    readinessProgressLabel: 'Em progresso'
  },
  fr: {
    whyBadge: 'Pourquoi Cloud Recall Lab',
    whyTitle: 'La couche de pratique gratuite que je voulais pendant mes revisions.',
    whyBody: "Beaucoup d'outils cachent la pratique utile derriere un paywall ou revelent les reponses trop tot. Ce lab force le choix, puis le feedback et la revision.",
    whyProofKicker: 'Preuve personnelle, pas promesse',
    whyProofTitle: "J'ai utilise cette app pour preparer et reussir CLF-C02 le 1 juillet 2026.",
    whyProofBody: 'Mon rapport indiquait Meets Competencies dans les quatre domaines. Cela ne garantit rien, mais montre que la boucle peut aider avec des ressources actuelles.',
    whyCredentialLink: 'Verifier ma certification AWS sur Credly',
    whyPillPassed: 'Reussi le 1 juillet 2026',
    whyPillDomains: 'Meets Competencies dans tous les domaines',
    whyPillCourse: 'Mieux avec un cours actuel ou docs AWS',
    whyPillNoDumps: 'Pratique originale, pas de braindumps',
    languageBody: "Changez l'interface entre anglais, espagnol, portugais, francais, allemand, italien, neerlandais, hindi et japonais. Les questions restent en anglais pour garder les termes AWS.",
    practiceModeHint: 'La pratique corrige les questions a reponse unique aussitot; multi-select utilise Submit Choices. Les mocks attendent la soumission finale.',
    builtBody2: "L'outil garde la boucle simple: pratique sous pression, reponses cachees jusqu'au choix, revision des erreurs et sujets faibles visibles. Je n'ai pas paye de mocks separes; j'ai utilise les sets originaux de l'app avec du contenu actuel.",
    communityResourceBody: 'Pour les liens communautaires, la wiki r/AWSCertifications aide avec parcours, remises, ressources gratuites et FAQ. A utiliser comme guide communautaire, pas officiel AWS.',
    communityResourceLink: 'Wiki r/AWSCertifications',
    officialResourceBody: "Utilisez le guide officiel AWS comme source de verite pour le perimetre, les poids de domaines et les services. Cette app transforme ce perimetre en pratique de rappel.",
    officialResourceLink: 'Guide officiel AWS CLF-C02',
    supportButton: 'Soutenir',
    guidePageTitle: 'Guide et fiches de revision',
    guidePageSubtitle: 'Cherchez et memorisez concepts AWS, mots-declencheurs et pieges.',
    exitGuide: 'Quitter le guide',
    guideTabConcepts: 'Concepts cloud',
    guideTabResponsibility: 'Responsabilite partagee',
    guideTabDirectory: 'Index services',
    guideTabServerless: 'Carte serverless',
    guideTabTraps: 'Pieges majeurs',
    guideTabPairs: 'Paires confuses',
    guideTabStrategy: 'Strategie finale',
    guideTabPassPlan: 'Plan 7 jours',
    guideConceptsTitle: 'Concepts cloud essentiels',
    guideConceptColumn: 'Concept',
    guideMeaningColumn: 'Memo / signification',
    guideResponsibilityTitle: 'Matrice de responsabilite partagee',
    guideResponsibilityBody: 'Rappel: AWS securise le cloud; le client securise ce qu il configure dans le cloud.',
    guideAwsResponsibility: 'Responsabilite AWS',
    guideCustomerResponsibility: 'Responsabilite client',
    guideResponsibilityQuestions: 'Questions courantes',
    guideSearchPlaceholder: 'Rechercher services, declencheurs ou descriptions (ex. S3, SQL, database)...',
    serverlessBadgeTitle: 'Raccourci examen',
    serverlessTitle: 'Carte des services serverless',
    serverlessBody: "Pour CLF-C02, serverless signifie souvent qu AWS gere capacite, mise a l'echelle, disponibilite et une grande partie de l'infrastructure. Vous configurez encore acces, donnees, couts et comportement.",
    trapsTitle: 'Pieges majeurs de l examen',
    trapsBody: 'Reconnaissez ces motifs pour identifier vite le service probable.',
    trapsQuestionColumn: 'Si la question dit...',
    trapsAnswerColumn: 'La bonne reponse est...',
    pairsSearchPlaceholder: 'Rechercher paires confuses (ex. CloudWatch, RDS)...',
    readinessTitle: 'Audit de preparation CLF-C02',
    readinessBody: 'Completez six checks avant l examen. Deux viennent de l historique; quatre sont des auto-checks honnetes.',
    domainWeightsTitle: 'Poids des domaines CLF-C02',
    officialSourceBadge: 'Source officielle',
    officialSourceBody: 'Avant l examen, verifiez poids et perimetre dans le guide AWS actuel.',
    officialSourceLink: 'Ouvrir guide AWS',
    mustSkipTitle: 'A savoir vs. leger',
    mustSkipBody: 'Concentrez vos dernieres heures. Ne memorisez pas les details de configuration.',
    mustKnowHeading: 'A SAVOIR FORT',
    skipHeading: 'SAUTER / SAVOIR LEGER',
    examDayMethodTitle: 'Methode finale',
    lastPageTitle: 'Fiche memoire finale',
    lastPageBody: 'Resume ultra-condense a relire juste avant l examen.',
    passPlanTitle: 'Plan 7 jours',
    passPlanBody: 'Plan quotidien oriente vers les domaines les plus ponderes. Environ 2-3 h/jour.',
    passStrategiesTitle: 'Strategies de personnes qui ont reussi',
    passStrategiesBody: 'Synthese de rapports publics et de guidance AWS. Paraphrase, sans contenu divulgue.',
    serverlessLabel: 'Serverless',
    serverlessSummaryServices: 'services pertinents marques',
    serverlessSummaryBuckets: 'groupes mentaux: compute, APIs, donnees, integration, AI',
    serverlessSummaryCaution: 'sans serveurs, mais IAM, donnees, couts et config comptent',
    serverlessServiceCount: '{count} services',
    keyTriggerLabel: 'Declencheur cle',
    managedServiceFallback: 'Service AWS gere',
    noServiceResults: 'Aucun service trouve pour "{query}".',
    trapQuestionTemplate: 'Si la question dit "{term}"...',
    trapAnswerTemplate: 'La bonne reponse est "{answer}"',
    passPlanDayLabel: 'Jour {day}: {focus}',
    passPlanWhyLabel: 'Pourquoi',
    selectedPlanSummary: 'Selection: {label}',
    plan90: '90 minutes',
    plan120: '2 heures',
    plan180: '3 heures',
    readinessMockTitle: '80%+ sur deux mocks chronometres',
    readinessMockAchieved: 'Fait: {count} mocks a 80%+.',
    readinessMockProgress: 'Il faut deux mocks a 80%+; actuel: {count}.',
    readinessWrongTitle: 'Garder moins de 5 erreurs',
    readinessWrongAchieved: 'Fait: petite reserve d erreurs ({count}).',
    readinessWrongProgress: 'Gardez la reserve sous 5; actuel: {count}.',
    readinessMasterTitle: 'Rappeler les 47 ancres sans regarder',
    readinessMasterInfo: 'Auto-check: pouvez-vous expliquer la Master Memory Page a voix haute?',
    readinessPairsTitle: 'Expliquer les paires confuses',
    readinessPairsInfo: 'Auto-check: CloudWatch vs CloudTrail, WAF vs Shield vs GuardDuty, SQS vs SNS, etc.',
    readinessDrillsTitle: '80%+ aux Rapid Trigger Drills',
    readinessDrillsInfo: 'Auto-check: relier vite les declencheurs aux services.',
    readinessOfficialTitle: 'Revoir les questions officielles AWS',
    readinessOfficialInfo: 'Auto-check: comparez votre instinct aux supports AWS actuels.',
    readinessAchievedLabel: 'Acquis',
    readinessProgressLabel: 'En cours'
  },
  de: {
    whyBadge: 'Warum Cloud Recall Lab',
    whyTitle: 'Die kostenlose Praxis-Schicht, die ich beim Lernen wollte.',
    whyBody: 'Viele Tools verstecken gute Praxis hinter Paywalls oder zeigen Antworten zu frueh. Dieses Lab zwingt zur Entscheidung, dann Feedback und Fehlerreview.',
    whyProofKicker: 'Persoenlicher Nachweis, kein Versprechen',
    whyProofTitle: 'Ich nutzte diese App in der Vorbereitung und bestand CLF-C02 am 1. Juli 2026.',
    whyProofBody: 'Mein Report zeigte Meets Competencies in allen vier Domains. Das garantiert nichts, zeigt aber, dass der Loop mit aktuellen Materialien funktionieren kann.',
    whyCredentialLink: 'AWS-Credential auf Credly verifizieren',
    whyPillPassed: 'Bestanden am 1. Juli 2026',
    whyPillDomains: 'Meets Competencies in allen Domains',
    whyPillCourse: 'Am besten mit aktuellem Kurs oder AWS Docs',
    whyPillNoDumps: 'Originale Praxis, keine Braindumps',
    languageBody: 'Wechsle die Interface-Texte zwischen Englisch, Spanisch, Portugiesisch, Franzoesisch, Deutsch, Italienisch, Niederlaendisch, Hindi und Japanisch. Fragen bleiben fuer AWS-Begriffe auf Englisch.',
    practiceModeHint: 'Praxis prueft Single-Answer-Fragen sofort; Multi-Select nutzt Submit Choices. Timed Mocks warten bis zur finalen Abgabe.',
    builtBody2: 'Das Tool haelt den Loop einfach: unter Druck ueben, Antworten bis zur Auswahl verstecken, Fehler pruefen und schwache Themen sichtbar halten. Ich habe keine separaten Mock Exams bezahlt; ich nutzte die originalen Sets dieser App plus aktuelles Lernmaterial.',
    communityResourceBody: 'Fuer Community-Links ist die r/AWSCertifications-Wiki hilfreich fuer Pfade, Rabatte, freie Ressourcen und FAQs. Das ist Community-Hilfe, kein offizielles AWS-Material.',
    communityResourceLink: 'r/AWSCertifications Community-Wiki',
    officialResourceBody: 'Nutze den offiziellen AWS Exam Guide als Quelle fuer Scope, Domain-Gewichte und Services. Diese App macht daraus Recall-Praxis.',
    officialResourceLink: 'Offizieller AWS CLF-C02 Guide',
    supportButton: 'Unterstuetzen',
    guidePageTitle: 'Lernhilfe und Spickzettel',
    guidePageSubtitle: 'Suche und merke AWS-Konzepte, Trigger-Woerter und Pruefungsfallen.',
    exitGuide: 'Guide verlassen',
    guideTabConcepts: 'Cloud-Konzepte',
    guideTabResponsibility: 'Shared Responsibility',
    guideTabDirectory: 'Service-Index',
    guideTabServerless: 'Serverless-Karte',
    guideTabTraps: 'Top-Fallen',
    guideTabPairs: 'Verwechslungs-Paare',
    guideTabStrategy: 'Finale Strategie',
    guideTabPassPlan: '7-Tage-Plan',
    guideConceptsTitle: 'Wichtige Cloud-Konzepte',
    guideConceptColumn: 'Konzept',
    guideMeaningColumn: 'Merksatz / Bedeutung',
    guideResponsibilityTitle: 'Shared-Responsibility-Matrix',
    guideResponsibilityBody: 'Merke: AWS schuetzt die Cloud; Kunden schuetzen, was sie in der Cloud konfigurieren.',
    guideAwsResponsibility: 'AWS-Verantwortung',
    guideCustomerResponsibility: 'Kundenverantwortung',
    guideResponsibilityQuestions: 'Typische Fragen',
    guideSearchPlaceholder: 'Services, Trigger oder Beschreibungen suchen (z.B. S3, SQL, database)...',
    serverlessBadgeTitle: 'Pruefungsabkuerzung',
    serverlessTitle: 'Serverless-Service-Karte',
    serverlessBody: 'Fuer CLF-C02 heisst serverless meist: AWS verwaltet Kapazitaet, Skalierung, Verfuegbarkeit und viel Infrastruktur. Zugriff, Daten, Kosten und Verhalten konfigurierst du weiter.',
    trapsTitle: 'Wichtige Pruefungsfallen',
    trapsBody: 'Erkenne diese Muster, um den wahrscheinlichen Service schnell zu finden.',
    trapsQuestionColumn: 'Wenn die Frage sagt...',
    trapsAnswerColumn: 'Die richtige Antwort ist...',
    pairsSearchPlaceholder: 'Verwechslungs-Paare suchen (z.B. CloudWatch, RDS)...',
    readinessTitle: 'CLF-C02 Readiness Audit',
    readinessBody: 'Erledige sechs Checks vor dem Examen. Zwei misst die Historie; vier sind ehrliche Selbstchecks.',
    domainWeightsTitle: 'CLF-C02 Domain-Gewichte',
    officialSourceBadge: 'Offizielle Quelle',
    officialSourceBody: 'Pruefe Gewichte und Scope vor dem Examen im aktuellen AWS Guide.',
    officialSourceLink: 'AWS Guide oeffnen',
    mustSkipTitle: 'Muss wissen vs. leicht wissen',
    mustSkipBody: 'Nutze die letzten Stunden fuer das Wichtige. Keine Config-Details auswendig lernen.',
    mustKnowHeading: 'SEHR GUT WISSEN',
    skipHeading: 'UEBERSPRINGEN / LEICHT WISSEN',
    examDayMethodTitle: 'Finale Examensmethode',
    lastPageTitle: 'Letzte Memory-Cheat-Sheet',
    lastPageBody: 'Stark verdichtete Zusammenfassung fuer direkt vor dem Examen.',
    passPlanTitle: '7-Tage-Plan',
    passPlanBody: 'Taeglicher Plan nach den hoechstgewichteten Domains. Etwa 2-3 Stunden/Tag.',
    passStrategiesTitle: 'Strategien von Leuten, die bestanden haben',
    passStrategiesBody: 'Aus oeffentlichen Berichten und AWS-Guidance zusammengefasst. Paraphrasiert, ohne geleakte Inhalte.',
    serverlessLabel: 'Serverless',
    serverlessSummaryServices: 'relevante Services markiert',
    serverlessSummaryBuckets: 'Denkgruppen: Compute, APIs, Daten, Integration, AI',
    serverlessSummaryCaution: 'keine Server, aber IAM, Daten, Kosten und Config zaehlen',
    serverlessServiceCount: '{count} Services',
    keyTriggerLabel: 'Schluessel-Trigger',
    managedServiceFallback: 'Managed AWS Service',
    noServiceResults: 'Keine Services fuer "{query}" gefunden.',
    trapQuestionTemplate: 'Wenn die Frage "{term}" sagt...',
    trapAnswerTemplate: 'Die richtige Antwort ist "{answer}"',
    passPlanDayLabel: 'Tag {day}: {focus}',
    passPlanWhyLabel: 'Warum',
    selectedPlanSummary: 'Ausgewaehlt: {label}',
    plan90: '90 Minuten',
    plan120: '2 Stunden',
    plan180: '3 Stunden',
    readinessMockTitle: '80%+ in zwei Zeit-Mocks',
    readinessMockAchieved: 'Erledigt: {count} Mocks mit 80%+.',
    readinessMockProgress: 'Du brauchst zwei Mocks mit 80%+; aktuell: {count}.',
    readinessWrongTitle: 'Fehlerpool unter 5 halten',
    readinessWrongAchieved: 'Erledigt: Fehlerpool ist klein ({count}).',
    readinessWrongProgress: 'Halte den Pool unter 5; aktuell: {count}.',
    readinessMasterTitle: '47 Service-Anker ohne Blick abrufen',
    readinessMasterInfo: 'Selbstcheck: kannst du die Master Memory Page laut erklaeren?',
    readinessPairsTitle: 'Top-Verwechslungs-Paare erklaeren',
    readinessPairsInfo: 'Selbstcheck: CloudWatch vs CloudTrail, WAF vs Shield vs GuardDuty, SQS vs SNS, usw.',
    readinessDrillsTitle: '80%+ bei Rapid Trigger Drills',
    readinessDrillsInfo: 'Selbstcheck: Trigger schnell und konsistent Services zuordnen.',
    readinessOfficialTitle: 'Offizielle AWS Praxisfragen reviewen',
    readinessOfficialInfo: 'Selbstcheck: gleiche dein Wortlaut-Gefuehl mit aktuellen AWS-Materialien ab.',
    readinessAchievedLabel: 'Erreicht',
    readinessProgressLabel: 'In Arbeit'
  },
  it: {
    whyBadge: 'Perche Cloud Recall Lab',
    whyTitle: 'Il livello di pratica gratis che avrei voluto mentre studiavo.',
    whyBody: 'Molti strumenti nascondono pratica utile dietro paywall o mostrano risposte troppo presto. Questo lab ti fa scegliere, poi ricevere feedback e rivedere errori.',
    whyProofKicker: 'Prova personale, non promessa',
    whyProofTitle: 'Ho usato questa app durante la preparazione e ho passato CLF-C02 il 1 luglio 2026.',
    whyProofBody: 'Il mio report mostrava Meets Competencies in tutti e quattro i domini. Non garantisce risultati, ma mostra che il ciclo puo funzionare con materiali aggiornati.',
    whyCredentialLink: 'Verifica la mia credenziale AWS su Credly',
    whyPillPassed: 'Passato il 1 luglio 2026',
    whyPillDomains: 'Meets Competencies in tutti i domini',
    whyPillCourse: 'Meglio con corso aggiornato o docs AWS',
    whyPillNoDumps: 'Pratica originale, niente braindump',
    languageBody: 'Cambia interfaccia tra inglese, spagnolo, portoghese, francese, tedesco, italiano, olandese, hindi e giapponese. Le domande restano in inglese per preservare i termini AWS.',
    practiceModeHint: 'La pratica corregge subito le domande a risposta singola; multi-select usa Submit Choices. I mock a tempo aspettano la consegna finale.',
    builtBody2: "Lo strumento mantiene il ciclo semplice: pratica sotto pressione, risposte nascoste finche scegli, revisione degli errori e punti deboli visibili. Non ho pagato mock separati; ho usato i set originali dell'app con materiale aggiornato.",
    communityResourceBody: 'Per link della community, la wiki r/AWSCertifications aiuta con percorsi, sconti, risorse gratis e FAQ. Usala come guida community, non materiale ufficiale AWS.',
    communityResourceLink: 'Wiki r/AWSCertifications',
    officialResourceBody: "Usa la guida ufficiale AWS come fonte per scope, pesi dei domini e servizi. Questa app trasforma quello scope in pratica di richiamo.",
    officialResourceLink: 'Guida ufficiale AWS CLF-C02',
    supportButton: 'Supporta',
    guidePageTitle: 'Guida di studio e cheat sheet',
    guidePageSubtitle: 'Cerca e memorizza concetti AWS, parole trigger e trappole di esame.',
    exitGuide: 'Esci dalla guida',
    guideTabConcepts: 'Concetti cloud',
    guideTabResponsibility: 'Responsabilita condivisa',
    guideTabDirectory: 'Indice servizi',
    guideTabServerless: 'Mappa serverless',
    guideTabTraps: 'Trappole chiave',
    guideTabPairs: 'Coppie confuse',
    guideTabStrategy: 'Strategia finale',
    guideTabPassPlan: 'Piano 7 giorni',
    guideConceptsTitle: 'Concetti cloud principali',
    guideConceptColumn: 'Concetto',
    guideMeaningColumn: 'Gancio / significato',
    guideResponsibilityTitle: 'Matrice responsabilita condivisa',
    guideResponsibilityBody: 'Ricorda: AWS protegge il cloud; il cliente protegge cio che configura nel cloud.',
    guideAwsResponsibility: 'Responsabilita AWS',
    guideCustomerResponsibility: 'Responsabilita cliente',
    guideResponsibilityQuestions: 'Domande comuni',
    guideSearchPlaceholder: 'Cerca servizi, trigger o descrizioni (es. S3, SQL, database)...',
    serverlessBadgeTitle: 'Scorciatoia esame',
    serverlessTitle: 'Mappa servizi serverless',
    serverlessBody: 'Per CLF-C02, serverless di solito significa che AWS gestisce capacita, scalabilita, disponibilita e molta infrastruttura. Tu configuri accesso, dati, costi e comportamento.',
    trapsTitle: 'Trappole chiave di esame',
    trapsBody: 'Riconosci questi pattern per identificare rapidamente il servizio probabile.',
    trapsQuestionColumn: 'Se la domanda dice...',
    trapsAnswerColumn: 'La risposta corretta e...',
    pairsSearchPlaceholder: 'Cerca coppie confuse (es. CloudWatch, RDS)...',
    readinessTitle: 'Audit preparazione CLF-C02',
    readinessBody: 'Completa sei check prima dell esame. Due sono misurati dalla cronologia; quattro sono auto-check onesti.',
    domainWeightsTitle: 'Pesi domini CLF-C02',
    officialSourceBadge: 'Fonte ufficiale',
    officialSourceBody: 'Prima dell esame, controlla pesi e scope nella guida AWS aggiornata.',
    officialSourceLink: 'Apri guida AWS',
    mustSkipTitle: 'Da sapere vs. leggero',
    mustSkipBody: 'Concentra le ultime ore dove conta. Non memorizzare dettagli di configurazione.',
    mustKnowHeading: 'SAPERE MOLTO BENE',
    skipHeading: 'SALTARE / SAPERE POCO',
    examDayMethodTitle: 'Metodo finale esame',
    lastPageTitle: 'Cheat sheet finale',
    lastPageBody: 'Riassunto condensato da rivedere subito prima dell esame.',
    passPlanTitle: 'Piano di 7 giorni',
    passPlanBody: 'Piano giornaliero pesato sui domini piu importanti. Circa 2-3 ore/giorno.',
    passStrategiesTitle: 'Strategie reali di chi ha passato',
    passStrategiesBody: 'Sintesi da report pubblici e guida AWS. Parafrasato, senza contenuti leakati.',
    serverlessLabel: 'Serverless',
    serverlessSummaryServices: 'servizi rilevanti marcati',
    serverlessSummaryBuckets: 'gruppi mentali: compute, API, dati, integrazione, AI',
    serverlessSummaryCaution: 'senza server, ma IAM, dati, costo e config contano',
    serverlessServiceCount: '{count} servizi',
    keyTriggerLabel: 'Trigger chiave',
    managedServiceFallback: 'Servizio AWS gestito',
    noServiceResults: 'Nessun servizio trovato per "{query}".',
    trapQuestionTemplate: 'Se la domanda dice "{term}"...',
    trapAnswerTemplate: 'La risposta corretta e "{answer}"',
    passPlanDayLabel: 'Giorno {day}: {focus}',
    passPlanWhyLabel: 'Perche',
    selectedPlanSummary: 'Selezionato: {label}',
    plan90: '90 minuti',
    plan120: '2 ore',
    plan180: '3 ore',
    readinessMockTitle: '80%+ in due mock cronometrati',
    readinessMockAchieved: 'Fatto: {count} mock con 80%+.',
    readinessMockProgress: 'Servono due mock con 80%+; attuale: {count}.',
    readinessWrongTitle: 'Tenere meno di 5 errori aperti',
    readinessWrongAchieved: 'Fatto: pool errori piccolo ({count}).',
    readinessWrongProgress: 'Tieni il pool sotto 5; attuale: {count}.',
    readinessMasterTitle: 'Ricordare i 47 anchor senza guardare',
    readinessMasterInfo: 'Auto-check: riesci a spiegare la Master Memory Page ad alta voce?',
    readinessPairsTitle: 'Spiegare le coppie confuse principali',
    readinessPairsInfo: 'Auto-check: CloudWatch vs CloudTrail, WAF vs Shield vs GuardDuty, SQS vs SNS, ecc.',
    readinessDrillsTitle: '80%+ nei Rapid Trigger Drills',
    readinessDrillsInfo: 'Auto-check: associa trigger e servizi velocemente e con costanza.',
    readinessOfficialTitle: 'Rivedere domande ufficiali AWS',
    readinessOfficialInfo: 'Auto-check: confronta il tuo istinto con materiali AWS aggiornati.',
    readinessAchievedLabel: 'Raggiunto',
    readinessProgressLabel: 'In corso'
  },
  nl: {
    whyBadge: 'Waarom Cloud Recall Lab',
    whyTitle: 'De gratis oefenlaag die ik wilde tijdens het studeren.',
    whyBody: 'Veel tools verbergen nuttige oefening achter paywalls of tonen antwoorden te vroeg. Dit lab laat je eerst kiezen, daarna feedback krijgen en fouten reviewen.',
    whyProofKicker: 'Persoonlijk bewijs, geen belofte',
    whyProofTitle: 'Ik gebruikte deze app bij mijn voorbereiding en haalde CLF-C02 op 1 juli 2026.',
    whyProofBody: 'Mijn score report liet Meets Competencies zien in alle vier domeinen. Geen garantie, wel bewijs dat de loop kan werken met actuele materialen.',
    whyCredentialLink: 'Verifieer mijn AWS credential op Credly',
    whyPillPassed: 'Geslaagd op 1 juli 2026',
    whyPillDomains: 'Meets Competencies in alle domeinen',
    whyPillCourse: 'Best met actuele cursus of AWS docs',
    whyPillNoDumps: 'Originele oefening, geen braindumps',
    languageBody: 'Schakel de interface tussen Engels, Spaans, Portugees, Frans, Duits, Italiaans, Nederlands, Hindi en Japans. Vragen blijven Engels voor AWS-termen.',
    practiceModeHint: 'Oefenen controleert single-answer vragen meteen; multi-select gebruikt Submit Choices. Getimede mocks wachten tot je definitief inlevert.',
    builtBody2: 'De tool houdt de loop simpel: oefenen onder druk, antwoorden verbergen tot je kiest, fouten reviewen en zwakke onderwerpen zichtbaar houden. Ik betaalde niet voor losse proefexamens; ik gebruikte de originele sets van deze app met actueel leermateriaal.',
    communityResourceBody: 'Voor community-links is de r/AWSCertifications wiki nuttig voor routes, kortingen, gratis resources en FAQs. Zie het als community-gids, niet officieel AWS-materiaal.',
    communityResourceLink: 'r/AWSCertifications community wiki',
    officialResourceBody: 'Gebruik de officiele AWS exam guide als bron voor scope, domeinwegingen en services. Deze app maakt daar recall-practice van.',
    officialResourceLink: 'Officiele AWS CLF-C02 guide',
    supportButton: 'Steun',
    guidePageTitle: 'Studiegids en cheatsheets',
    guidePageSubtitle: 'Zoek en onthoud AWS-concepten, triggerwoorden en examenvallen.',
    exitGuide: 'Gids verlaten',
    guideTabConcepts: 'Cloudconcepten',
    guideTabResponsibility: 'Gedeelde verantwoordelijkheid',
    guideTabDirectory: 'Service-index',
    guideTabServerless: 'Serverless kaart',
    guideTabTraps: 'Belangrijke vallen',
    guideTabPairs: 'Verwarrende paren',
    guideTabStrategy: 'Laatste strategie',
    guideTabPassPlan: '7-dagenplan',
    guideConceptsTitle: 'Kernconcepten cloud',
    guideConceptColumn: 'Concept',
    guideMeaningColumn: 'Geheugensteun / betekenis',
    guideResponsibilityTitle: 'Matrix gedeelde verantwoordelijkheid',
    guideResponsibilityBody: 'Onthoud: AWS beveiligt de cloud; de klant beveiligt wat die in de cloud configureert.',
    guideAwsResponsibility: 'AWS verantwoordelijkheid',
    guideCustomerResponsibility: 'Klantverantwoordelijkheid',
    guideResponsibilityQuestions: 'Veelvoorkomende vragen',
    guideSearchPlaceholder: 'Zoek services, triggers of beschrijvingen (bijv. S3, SQL, database)...',
    serverlessBadgeTitle: 'Examensnelkoppeling',
    serverlessTitle: 'Serverless services kaart',
    serverlessBody: 'Voor CLF-C02 betekent serverless meestal dat AWS capaciteit, schaal, beschikbaarheid en veel infrastructuur beheert. Jij configureert nog steeds toegang, data, kosten en gedrag.',
    trapsTitle: 'Belangrijke examenvallen',
    trapsBody: 'Herken deze patronen om snel de waarschijnlijke service te vinden.',
    trapsQuestionColumn: 'Als de vraag zegt...',
    trapsAnswerColumn: 'Het juiste antwoord is...',
    pairsSearchPlaceholder: 'Zoek verwarrende paren (bijv. CloudWatch, RDS)...',
    readinessTitle: 'CLF-C02 readiness audit',
    readinessBody: 'Rond zes checks af voor examendag. Twee komen uit je historie; vier zijn eerlijke zelfchecks.',
    domainWeightsTitle: 'CLF-C02 domeinwegingen',
    officialSourceBadge: 'Officiele bron',
    officialSourceBody: 'Controleer gewichten en scope voor examendag in de actuele AWS guide.',
    officialSourceLink: 'Open AWS guide',
    mustSkipTitle: 'Moet weten vs. licht weten',
    mustSkipBody: 'Focus je laatste uren waar het telt. Geen configdetails uit je hoofd leren.',
    mustKnowHeading: 'HEEL GOED WETEN',
    skipHeading: 'OVERSLAAN / LICHT WETEN',
    examDayMethodTitle: 'Laatste examenmethode',
    lastPageTitle: 'Laatste geheugen-cheatsheet',
    lastPageBody: 'Zeer compacte service-samenvatting voor vlak voor het examen.',
    passPlanTitle: '7-dagenplan',
    passPlanBody: 'Dagplan gericht op de zwaarste domeinen. Ongeveer 2-3 uur/dag.',
    passStrategiesTitle: 'Strategien van mensen die slaagden',
    passStrategiesBody: 'Samengevat uit openbare reports en AWS guidance. Geparafraseerd, geen gelekte inhoud.',
    serverlessLabel: 'Serverless',
    serverlessSummaryServices: 'relevante services gemarkeerd',
    serverlessSummaryBuckets: 'mentale groepen: compute, APIs, data, integratie, AI',
    serverlessSummaryCaution: 'geen servers, maar IAM, data, kosten en config tellen',
    serverlessServiceCount: '{count} services',
    keyTriggerLabel: 'Belangrijk triggerwoord',
    managedServiceFallback: 'Beheerde AWS service',
    noServiceResults: 'Geen services gevonden voor "{query}".',
    trapQuestionTemplate: 'Als de vraag "{term}" zegt...',
    trapAnswerTemplate: 'Het juiste antwoord is "{answer}"',
    passPlanDayLabel: 'Dag {day}: {focus}',
    passPlanWhyLabel: 'Waarom',
    selectedPlanSummary: 'Geselecteerd: {label}',
    plan90: '90 minuten',
    plan120: '2 uur',
    plan180: '3 uur',
    readinessMockTitle: '80%+ op twee getimede mocks',
    readinessMockAchieved: 'Klaar: {count} mocks met 80%+.',
    readinessMockProgress: 'Je hebt twee mocks met 80%+ nodig; nu: {count}.',
    readinessWrongTitle: 'Minder dan 5 foute antwoorden open',
    readinessWrongAchieved: 'Klaar: foutenpool is klein ({count}).',
    readinessWrongProgress: 'Houd de pool onder 5; nu: {count}.',
    readinessMasterTitle: '47 service-ankers herinneren zonder kijken',
    readinessMasterInfo: 'Zelfcheck: kun je de Master Memory Page hardop uitleggen?',
    readinessPairsTitle: 'Top verwarrende paren uitleggen',
    readinessPairsInfo: 'Zelfcheck: CloudWatch vs CloudTrail, WAF vs Shield vs GuardDuty, SQS vs SNS, enz.',
    readinessDrillsTitle: '80%+ op Rapid Trigger Drills',
    readinessDrillsInfo: 'Zelfcheck: koppel triggers snel en consistent aan services.',
    readinessOfficialTitle: 'Officiele AWS oefenvragen reviewen',
    readinessOfficialInfo: 'Zelfcheck: vergelijk je woordgevoel met actuele AWS-materialen.',
    readinessAchievedLabel: 'Behaald',
    readinessProgressLabel: 'Bezig'
  },
  hi: {
    navHistory: 'History',
    navAbout: 'About',
    navSettings: 'Settings',
    languageLabel: 'Language',
    languageHelper: 'Interface guidance Hindi me badalti hai. AWS service names aur practice questions English me rehte hain taaki exam wording consistent rahe.',
    heroTitle: 'Cloud Recall Lab',
    heroSubtitle: 'Free CLF-C02 prep with practice, timed mocks, local progress, and no login.',
    stripFree: 'Free forever',
    stripNoAccount: 'No account',
    stripMobile: 'Mobile friendly',
    stripOffline: 'Offline-ready',
    stripLanguages: 'Multilingual UI beta',
    stripPassed: 'Used to pass CLF-C02',
    evidenceBadge: 'Research-backed study loop',
    evidenceTitle: 'Active recall ke liye built, passive rereading ke liye nahi.',
    evidenceBody: 'Practice testing, spaced review, feedback, aur exam-like rehearsal recall ko pressure me strong banate hain. App ka loop simple hai: answer, review, repeat.',
    whyBadge: 'Why Cloud Recall Lab',
    whyTitle: 'Free practice layer jo mujhe studying ke time chahiye thi.',
    whyBody: 'Bahut prep tools paywall ke peeche hote hain ya answers jaldi dikha dete hain. Yeh lab pehle answer commit karwata hai, phir feedback deta hai.',
    whyProofKicker: 'Personal proof, promise nahi',
    whyProofTitle: 'Maine is app ko prep me use kiya aur CLF-C02 July 1, 2026 ko pass kiya.',
    whyProofBody: 'Mere score report me four domains me Meets Competencies tha. Yeh guarantee nahi, par real proof hai ki current material ke saath loop kaam kar sakta hai.',
    whyCredentialLink: 'Mera AWS credential Credly par verify karein',
    whyPillPassed: 'Passed July 1, 2026',
    whyPillDomains: 'All domains me Meets Competencies',
    whyPillCourse: 'Current course ya AWS docs ke saath best',
    whyPillNoDumps: 'Original practice, no braindumps',
    languageBadge: 'Language support beta',
    languageTitle: 'Zyada languages me study guidance.',
    languageBody: 'Interface English, Spanish, Portuguese, French, German, Italian, Dutch, Hindi, aur Japanese me switch hota hai. AWS terms aur questions English me rehte hain.',
    practiceModeHint: 'Practice single-answer questions ko turant check karta hai; multi-select Submit Choices use karta hai. Timed mocks final submit tak wait karte hain.',
    mockCardTitle: 'Full Timed Mock Exam',
    mockCardDesc: '65 randomized questions, 90 minutes, CLF-C02-style timing.',
    mockCardQuestions: '65 Questions',
    startMockButton: 'Start Mock Exam',
    guidedCardTitle: 'Science-Backed Guided Study Block',
    guidedCardDesc: 'Practice testing aur active recall rereading se better retention dete hain. Timers, cheat sheets, quizzes, aur wrong-answer review ke saath study block launch karein.',
    startDailyBlock: 'Start Daily Block',
    dailyRoutineBadge: 'Daily Routine',
    trainerTitle: 'Master Memory Sentence Trainer',
    trainerDesc: 'Core sentence ko 10 minutes review karein: TTS, 3D flashcards, ya active recall game.',
    startTraining: 'Start Training',
    studyGuideBadge: 'Exam Reference',
    studyGuideTitle: 'Study Guide & Cheat Sheets',
    studyGuideDesc: 'Core concepts, trigger words, serverless services, confusing pairs, aur high-yield traps search karein.',
    openStudyGuide: 'Open Study Guide',
    activeRecallBadge: 'Active Recall',
    drillsTitle: 'Rapid Trigger Drills',
    drillsDesc: '95 quick scenarios ke liye AWS service type karein. Mistake par trigger word lock in karein.',
    startDrills: 'Start Drills',
    examSimulationBadge: 'Exam Simulation',
    miniQuizTitle: '20-Question Mixed Quiz',
    miniQuizDesc: 'Exam conditions me 20 questions answer karein. Score end me dikhega.',
    startQuiz: 'Start Quiz',
    sectionPracticeTitle: 'Section-Focused Practice (Days 1 - 5)',
    aboutTitle: 'About & Contact',
    aboutSubtitle: 'Yeh kyon bana, responsibly kaise use karein, aur contact links.',
    dashboardButton: 'Dashboard',
    builtBadge: 'Built after passing',
    builtTitle: 'Maine is study loop se AWS Cloud Practitioner July 1, 2026 ko pass kiya.',
    builtBody1: 'Maine yeh banaya kyunki useful prep, flashcards tak, paywalls ke peeche hoti hai, aur kuch study tools answer bahut jaldi dikha dete hain.',
    builtBody2: "Loop simple hai: pressure me practice, answer choose karne tak answer hidden, har miss review, weak topics visible. Maine separate mock exams pay nahi kiye; is app ke original sets aur current learning material use kiya.",
    wiseBadge: 'Use it wisely',
    wiseTitle: 'Free practice, promise nahi aur current materials ka replacement nahi.',
    wiseBody1: 'AWS services, wording, aur certification scope update kar sakta hai. App ko practice ke liye use karein, phir current AWS exam guide/docs/course cross-check karein.',
    wiseBody2: 'Udemy meri prep me helpful tha. Course se learn karein, phir app se test karein ki answer pressure me yaad aa raha hai ya nahi.',
    resourceBadge: 'Resource I used',
    resourceTitle: 'Course jisne material learn karne me help ki.',
    resourceBody: 'Yeh app free practice layer hai jo mujhe chahiye thi. Concepts learn karne ke liye niche Udemy course helpful tha.',
    resourceCourse: 'Udemy course that helped me: Ultimate AWS Certified Cloud Practitioner CLF-C02 2026',
    officialResourceBody: 'Current scope, domain weights, aur service coverage ke liye official AWS exam guide source of truth hai.',
    officialResourceLink: 'Official AWS CLF-C02 exam guide',
    communityResourceBody: 'Community links ke liye r/AWSCertifications wiki useful hai. Isse community guidance samjhein, official AWS material nahi.',
    communityResourceLink: 'r/AWSCertifications community wiki',
    compatBadge: 'Compatibility',
    compatTitle: 'Modern browsers, mobile study, aur privacy-first launch ke liye built.',
    compatBody1: 'App current Chrome, Edge, Firefox, aur Safari ke liye designed hai. Offline install HTTPS par best hai.',
    compatBody2: 'Progress isi browser ke localStorage me rehta hai. TTS/share/install prompts browser aur device par depend karte hain.',
    contactBadge: 'Contact',
    contactTitle: 'Connect, contribute, ya support karein.',
    contactBody: 'Questions, bug reports, corrections, aur original practice questions welcome hain. Project free aur open source hai.',
    footerBuilt: 'Joseph Hauter ne free, no-login study tool ke roop me banaya.',
    footerDisclaimer: 'Independent study tool; Amazon Web Services (AWS) se affiliated, endorsed, ya sponsored nahi. Questions original educational scenarios hain.',
    randomExamDesc: 'CLF-C02-style timing ke saath 65 random database questions practice karein.',
    settingsTitle: 'Settings & Data',
    settingsBody: 'Progress locally is browser me stored hai. Device move karne ke liye backup export karein.',
    languageToast: 'Language updated. Questions exam consistency ke liye English me rehte hain.',
    supportButton: 'Support',
    guidePageTitle: 'Study Guide & Cheat Sheets',
    guidePageSubtitle: 'Core AWS concepts, trigger words, aur exam traps browse/search/memorize karein.',
    exitGuide: 'Exit Guide',
    guideTabConcepts: 'Cloud Concepts',
    guideTabResponsibility: 'Shared Responsibility',
    guideTabDirectory: 'Service Index',
    guideTabServerless: 'Serverless Map',
    guideTabTraps: 'High-Yield Traps',
    guideTabPairs: 'Confusing Pairs',
    guideTabStrategy: 'Last-Minute Strategy',
    guideTabPassPlan: '7-Day Plan',
    guideConceptsTitle: 'Core Cloud Concepts',
    guideConceptColumn: 'Concept',
    guideMeaningColumn: 'Memory Hook / Meaning',
    guideResponsibilityTitle: 'Shared Responsibility Matrix',
    guideResponsibilityBody: 'Yaad rakhein: AWS cloud OF security handle karta hai; customer cloud IN security handle karta hai.',
    guideAwsResponsibility: 'AWS Responsibility',
    guideCustomerResponsibility: 'Customer Responsibility',
    guideResponsibilityQuestions: 'Common Responsibility Questions',
    guideSearchPlaceholder: 'Services, trigger words, ya descriptions search karein (e.g. S3, SQL, database)...',
    serverlessBadgeTitle: 'Exam shortcut',
    serverlessTitle: 'Serverless services map',
    serverlessBody: 'CLF-C02 me serverless usually means AWS capacity, scaling, availability, aur infrastructure management handle karta hai. Access, data, cost, aur behavior aap configure karte hain.',
    trapsTitle: 'Highest-Yield Exam Traps',
    trapsBody: 'In patterns ko pehchanein taaki likely service fast identify ho.',
    trapsQuestionColumn: 'Question agar kehta hai...',
    trapsAnswerColumn: 'Correct answer hai...',
    pairsSearchPlaceholder: 'Confusing pairs search karein (e.g. CloudWatch, RDS)...',
    readinessTitle: 'CLF-C02 Readiness Audit',
    readinessBody: 'Exam day se pehle six checks complete karein. Do history se measured hain; chaar honest self-checks hain.',
    domainWeightsTitle: 'CLF-C02 Domain Weights',
    officialSourceBadge: 'Official source check',
    officialSourceBody: 'Exam se pehle current AWS guide me weights aur scope check karein.',
    officialSourceLink: 'Open AWS exam guide',
    mustSkipTitle: 'Must-Know vs. Skip Guide',
    mustSkipBody: 'Final hours important cheezon par lagayein. Config details memorize na karein.',
    mustKnowHeading: 'MUST KNOW HARD',
    skipHeading: 'SKIP / KNOW LIGHTLY',
    examDayMethodTitle: 'Final Exam-Day Method',
    lastPageTitle: 'Last-Page Memory Cheat Sheet',
    lastPageBody: 'Exam room me enter karne se pehle review karne ke liye condensed summary.',
    passPlanTitle: '7-Day Pass Plan',
    passPlanBody: 'Highest-scoring domains par focused daily plan. About 2-3 hours/day.',
    passStrategiesTitle: 'How Real People Passed',
    passStrategiesBody: 'Public study reports aur AWS guidance se paraphrased. No confidential or unauthorized exam content.',
    serverlessLabel: 'Serverless',
    serverlessSummaryServices: 'exam-relevant services flagged',
    serverlessSummaryBuckets: 'mental buckets: compute, APIs, data, integration, AI',
    serverlessSummaryCaution: 'no servers, but IAM, data, cost, and config matter',
    serverlessServiceCount: '{count} services',
    keyTriggerLabel: 'Key trigger',
    managedServiceFallback: 'Managed AWS service',
    noServiceResults: 'No services found matching "{query}".',
    trapQuestionTemplate: 'Question agar "{term}" kehta hai...',
    trapAnswerTemplate: 'Correct answer "{answer}" hai',
    passPlanDayLabel: 'Day {day}: {focus}',
    passPlanWhyLabel: 'Why',
    selectedPlanSummary: 'Selected: {label}',
    plan90: '90 minutes',
    plan120: '2 hours',
    plan180: '3 hours',
    readinessMockTitle: 'Two timed mocks me 80%+ hit karein',
    readinessMockAchieved: 'Done: {count} mocks at 80%+.',
    readinessMockProgress: '80%+ ke do mocks chahiye; current: {count}.',
    readinessWrongTitle: 'Wrong-answer pool 5 se kam rakhein',
    readinessWrongAchieved: 'Done: wrong-answer pool small hai ({count}).',
    readinessWrongProgress: 'Pool 5 se kam rakhein; current: {count}.',
    readinessMasterTitle: '47 service anchors bina dekhe recall karein',
    readinessMasterInfo: 'Self-check: Master Memory Page ko loud explain kar sakte hain?',
    readinessPairsTitle: 'Top confusing pairs explain karein',
    readinessPairsInfo: 'Self-check: CloudWatch vs CloudTrail, WAF vs Shield vs GuardDuty, SQS vs SNS, etc.',
    readinessDrillsTitle: 'Rapid Trigger Drills me 80%+',
    readinessDrillsInfo: 'Self-check: scenario triggers ko services se fast match karein.',
    readinessOfficialTitle: 'Official AWS practice questions review karein',
    readinessOfficialInfo: 'Self-check: current AWS material se wording instincts compare karein.',
    readinessAchievedLabel: 'Achieved',
    readinessProgressLabel: 'In progress'
  },
  ja: {
    navHistory: 'History',
    navAbout: 'About',
    navSettings: 'Settings',
    languageLabel: 'Language',
    languageHelper: 'Interface guidance changes to Japanese. AWS service names and practice questions stay in English for exam consistency.',
    heroTitle: 'Cloud Recall Lab',
    heroSubtitle: 'Free CLF-C02 prep with practice, timed mocks, local progress, and no login.',
    stripFree: 'Free forever',
    stripNoAccount: 'No account',
    stripMobile: 'Mobile friendly',
    stripOffline: 'Offline-ready',
    stripLanguages: 'Multilingual UI beta',
    stripPassed: 'Used to pass CLF-C02',
    evidenceBadge: 'Research-backed study loop',
    evidenceTitle: 'Active recall focused, not passive rereading.',
    evidenceBody: 'Practice testing, spaced review, feedback, and exam-like rehearsal make facts easier to retrieve under pressure.',
    whyBadge: 'Why Cloud Recall Lab',
    whyTitle: 'The free practice layer I wanted while studying.',
    whyBody: 'Many prep tools hide useful practice behind paywalls or reveal answers too early. This lab makes you commit first, then review feedback.',
    whyProofKicker: 'Personal proof, not a promise',
    whyProofTitle: 'I used this app while preparing and passed CLF-C02 on July 1, 2026.',
    whyProofBody: 'My score report showed Meets Competencies across all four domains. It is not a guarantee, but it is real proof that the loop can help with current material.',
    whyCredentialLink: 'Verify my AWS credential on Credly',
    whyPillPassed: 'Passed July 1, 2026',
    whyPillDomains: 'Meets Competencies in all domains',
    whyPillCourse: 'Best with a current course or AWS docs',
    whyPillNoDumps: 'Original practice, no braindumps',
    languageBadge: 'Language support beta',
    languageTitle: 'Study guidance in more languages.',
    languageBody: 'Switch the interface between English, Spanish, Portuguese, French, German, Italian, Dutch, Hindi, and Japanese. AWS terms and questions stay English.',
    practiceModeHint: 'Practice checks single-answer questions instantly; multi-select uses Submit Choices. Timed mocks wait until final submit.',
    mockCardTitle: 'Full Timed Mock Exam',
    mockCardDesc: 'Practice with 65 randomized questions in 90 minutes.',
    mockCardQuestions: '65 Questions',
    startMockButton: 'Start Mock Exam',
    guidedCardTitle: 'Science-Backed Guided Study Block',
    guidedCardDesc: 'Launch a structured study block with timers, cheat sheets, quizzes, and wrong-answer review.',
    startDailyBlock: 'Start Daily Block',
    dailyRoutineBadge: 'Daily Routine',
    trainerTitle: 'Master Memory Sentence Trainer',
    trainerDesc: 'Review the core sentence with TTS, 3D flashcards, or active recall.',
    startTraining: 'Start Training',
    studyGuideBadge: 'Exam Reference',
    studyGuideTitle: 'Study Guide & Cheat Sheets',
    studyGuideDesc: 'Search core concepts, trigger words, serverless services, confusing pairs, and exam traps.',
    openStudyGuide: 'Open Study Guide',
    activeRecallBadge: 'Active Recall',
    drillsTitle: 'Rapid Trigger Drills',
    drillsDesc: 'Type the AWS service for quick scenarios and lock in trigger words after misses.',
    startDrills: 'Start Drills',
    examSimulationBadge: 'Exam Simulation',
    miniQuizTitle: '20-Question Mixed Quiz',
    miniQuizDesc: 'Answer 20 questions under exam conditions. Score appears at the end.',
    startQuiz: 'Start Quiz',
    sectionPracticeTitle: 'Section-Focused Practice (Days 1 - 5)',
    aboutTitle: 'About & Contact',
    aboutSubtitle: 'Why this exists, how to use it responsibly, and where to connect.',
    dashboardButton: 'Dashboard',
    builtBadge: 'Built after passing',
    builtTitle: 'I used this study loop to pass AWS Cloud Practitioner on July 1, 2026.',
    builtBody1: 'I made this because useful prep often sits behind paywalls, and some study tools reveal answers too early.',
    builtBody2: "The loop is simple: practice under pressure, hide answers until you choose, review every miss, and keep weak topics visible. I used Udemy and current learning material to learn the concepts, then used this app's original sets instead of buying separate mock exams.",
    wiseBadge: 'Use it wisely',
    wiseTitle: 'Free practice, not a promise or a replacement for current materials.',
    wiseBody1: 'AWS can update services, wording, and scope. Use this for practice, then cross-check the current AWS exam guide, docs, and a strong course.',
    wiseBody2: 'Udemy helped my prep. Learn with a course, then use this app to test retrieval under pressure.',
    resourceBadge: 'Resource I used',
    resourceTitle: 'The course that helped me learn the material.',
    resourceBody: 'This app is the free practice layer I wanted. The Udemy course below helped me learn the concepts.',
    resourceCourse: 'Udemy course that helped me: Ultimate AWS Certified Cloud Practitioner CLF-C02 2026',
    officialResourceBody: 'Use the official AWS exam guide as the source of truth for current scope, domain weights, and service coverage.',
    officialResourceLink: 'Official AWS CLF-C02 exam guide',
    communityResourceBody: 'The r/AWSCertifications wiki is useful for community-maintained links. Treat it as community guidance, not official AWS material.',
    communityResourceLink: 'r/AWSCertifications community wiki',
    compatBadge: 'Compatibility',
    compatTitle: 'Built for modern browsers, mobile study, and privacy-first launch.',
    compatBody1: 'Designed for current Chrome, Edge, Firefox, and Safari. Offline install works best on HTTPS.',
    compatBody2: 'Progress stays in localStorage. TTS, sharing, and install prompts vary by browser/device.',
    contactBadge: 'Contact',
    contactTitle: 'Connect, contribute, or support the project.',
    contactBody: 'Questions, bug reports, corrections, and original practice questions are welcome. The project is free and open source.',
    footerBuilt: 'Built by Joseph Hauter as a free, no-login study tool.',
    footerDisclaimer: 'Independent study tool; not affiliated with, endorsed by, authored by, or sponsored by Amazon Web Services (AWS). Questions are original educational scenarios, not AWS certification exam materials.',
    randomExamDesc: 'Practice under CLF-C02-style timing with 65 random database questions.',
    settingsTitle: 'Settings & Data',
    settingsBody: 'Progress is stored locally in this browser. Export a backup to move devices.',
    languageToast: 'Language updated. Questions remain English for exam consistency.',
    supportButton: 'Support',
    guidePageTitle: 'Study Guide & Cheat Sheets',
    guidePageSubtitle: 'Browse, search, and memorize core AWS concepts, trigger words, and exam traps.',
    exitGuide: 'Exit Guide',
    guideTabConcepts: 'Cloud Concepts',
    guideTabResponsibility: 'Shared Responsibility',
    guideTabDirectory: 'Service Index',
    guideTabServerless: 'Serverless Map',
    guideTabTraps: 'High-Yield Traps',
    guideTabPairs: 'Confusing Pairs',
    guideTabStrategy: 'Last-Minute Strategy',
    guideTabPassPlan: '7-Day Plan',
    guideConceptsTitle: 'Core Cloud Concepts',
    guideConceptColumn: 'Concept',
    guideMeaningColumn: 'Memory Hook / Meaning',
    guideResponsibilityTitle: 'Shared Responsibility Matrix',
    guideResponsibilityBody: 'Remember: AWS handles security OF the cloud; the customer handles security IN the cloud.',
    guideAwsResponsibility: 'AWS Responsibility',
    guideCustomerResponsibility: 'Customer Responsibility',
    guideResponsibilityQuestions: 'Common Responsibility Questions',
    guideSearchPlaceholder: 'Search services, trigger words, or descriptions (e.g. S3, SQL, database)...',
    serverlessBadgeTitle: 'Exam shortcut',
    serverlessTitle: 'Serverless services map',
    serverlessBody: 'For CLF-C02, serverless usually means AWS handles capacity, scaling, availability, and much of the infrastructure. You still configure access, data, costs, and behavior.',
    trapsTitle: 'Highest-Yield Exam Traps',
    trapsBody: 'Recognize these patterns to quickly identify the likely service.',
    trapsQuestionColumn: 'If the question says...',
    trapsAnswerColumn: 'The correct answer is...',
    pairsSearchPlaceholder: 'Search confusing pairs (e.g. CloudWatch, RDS)...',
    readinessTitle: 'CLF-C02 Readiness Audit',
    readinessBody: 'Complete these six checks before exam day. Two are measured by your history; four are honest self-checks.',
    domainWeightsTitle: 'CLF-C02 Domain Weights',
    officialSourceBadge: 'Official source check',
    officialSourceBody: 'Check weights and scope against the current AWS exam guide before exam day.',
    officialSourceLink: 'Open AWS exam guide',
    mustSkipTitle: 'Must-Know vs. Skip Guide',
    mustSkipBody: "Focus final hours where it counts. Don't memorize config details.",
    mustKnowHeading: 'MUST KNOW HARD',
    skipHeading: 'SKIP / KNOW LIGHTLY',
    examDayMethodTitle: 'Final Exam-Day Method',
    lastPageTitle: 'Last-Page Memory Cheat Sheet',
    lastPageBody: 'A condensed summary to review right before the exam.',
    passPlanTitle: '7-Day Pass Plan',
    passPlanBody: 'A daily plan weighted toward the highest-scoring domains. About 2-3 hours/day.',
    passStrategiesTitle: 'How Real People Passed',
    passStrategiesBody: 'Paraphrased from public study reports and AWS guidance. No confidential or unauthorized exam content.',
    serverlessLabel: 'Serverless',
    serverlessSummaryServices: 'exam-relevant services flagged',
    serverlessSummaryBuckets: 'mental buckets: compute, APIs, data, integration, AI',
    serverlessSummaryCaution: 'no servers, but IAM, data, cost, and config matter',
    serverlessServiceCount: '{count} services',
    keyTriggerLabel: 'Key trigger',
    managedServiceFallback: 'Managed AWS service',
    noServiceResults: 'No services found matching "{query}".',
    trapQuestionTemplate: 'If the question says "{term}"...',
    trapAnswerTemplate: 'The correct answer is "{answer}"',
    passPlanDayLabel: 'Day {day}: {focus}',
    passPlanWhyLabel: 'Why',
    selectedPlanSummary: 'Selected: {label}',
    plan90: '90 minutes',
    plan120: '2 hours',
    plan180: '3 hours',
    readinessMockTitle: 'Hit 80%+ on two timed mocks',
    readinessMockAchieved: 'Done: {count} mocks at 80%+.',
    readinessMockProgress: 'Need two mocks at 80%+; current count: {count}.',
    readinessWrongTitle: 'Keep wrong-answer pool under 5',
    readinessWrongAchieved: 'Done: wrong-answer pool is small ({count} items).',
    readinessWrongProgress: 'Keep the wrong-answer pool under 5; current count: {count}.',
    readinessMasterTitle: 'Recall the 47 service anchors without looking',
    readinessMasterInfo: 'Self-check: can you explain the Master Memory Page out loud?',
    readinessPairsTitle: 'Explain the top confusing pairs',
    readinessPairsInfo: 'Self-check: CloudWatch vs CloudTrail, WAF vs Shield vs GuardDuty, SQS vs SNS, and the rest.',
    readinessDrillsTitle: 'Score 80%+ on Rapid Trigger Drills',
    readinessDrillsInfo: 'Self-check: match scenario triggers to services quickly and consistently.',
    readinessOfficialTitle: 'Review official AWS practice questions',
    readinessOfficialInfo: 'Self-check: compare your wording instincts against current AWS materials.',
    readinessAchievedLabel: 'Achieved',
    readinessProgressLabel: 'In progress'
  }
};

Object.entries(I18N_PATCHES).forEach(([lang, copy]) => {
  I18N[lang] = { ...(I18N[lang] || {}), ...copy };
});

Object.assign(I18N.hi, {
  navHistory: 'इतिहास',
  navAbout: 'परिचय',
  navSettings: 'सेटिंग्स',
  languageLabel: 'भाषा',
  heroSubtitle: 'मुफ्त CLF-C02 तैयारी: अभ्यास, timed mocks, local progress, और कोई login नहीं.',
  stripFree: 'हमेशा मुफ्त',
  stripNoAccount: 'कोई account नहीं',
  stripMobile: 'मोबाइल friendly',
  stripOffline: 'Offline-ready',
  stripLanguages: 'बहुभाषी UI beta',
  stripPassed: 'CLF-C02 pass करने में इस्तेमाल',
  evidenceBadge: 'Research-backed study loop',
  evidenceTitle: 'Active recall पर बना, passive rereading पर नहीं.',
  languageBadge: 'Language support beta',
  languageTitle: 'और भाषाओं में study guidance.',
  whyBadge: 'क्यों Cloud Recall Lab',
  whyTitle: 'वही मुफ्त practice layer जो मुझे पढ़ते समय चाहिए थी.',
  whyProofKicker: 'Personal proof, promise नहीं',
  mockCardTitle: 'Full Timed Mock Exam',
  startMockButton: 'Mock Exam शुरू करें',
  guidedCardTitle: 'Science-Backed Guided Study Block',
  startDailyBlock: 'Daily Block शुरू करें',
  dailyRoutineBadge: 'Daily Routine',
  trainerTitle: 'Master Memory Sentence Trainer',
  startTraining: 'Training शुरू करें',
  studyGuideBadge: 'Exam Reference',
  studyGuideTitle: 'Study Guide & Cheat Sheets',
  openStudyGuide: 'Study Guide खोलें',
  activeRecallBadge: 'Active Recall',
  drillsTitle: 'Rapid Trigger Drills',
  startDrills: 'Drills शुरू करें',
  examSimulationBadge: 'Exam Simulation',
  miniQuizTitle: '20-Question Mixed Quiz',
  startQuiz: 'Quiz शुरू करें',
  sectionPracticeTitle: 'Section-Focused Practice (Days 1 - 5)',
  aboutTitle: 'About & Contact',
  aboutSubtitle: 'यह क्यों बना, जिम्मेदारी से कैसे use करें, और contact links.',
  dashboardButton: 'Dashboard',
  builtBadge: 'Pass करने के बाद बनाया',
  wiseBadge: 'समझदारी से use करें',
  resourceBadge: 'Resource जो मैंने use किया',
  officialResourceLink: 'Official AWS CLF-C02 exam guide',
  compatBadge: 'Compatibility',
  contactBadge: 'Contact',
  contactTitle: 'Connect, contribute, या support करें.',
  settingsTitle: 'Settings & Data',
  settingsBody: 'Progress इस browser में locally stored है. दूसरे device पर ले जाने के लिए backup export करें.',
  guidePageTitle: 'Study Guide और Cheat Sheets',
  guidePageSubtitle: 'Core AWS concepts, trigger words, और exam traps browse/search/memorize करें.',
  exitGuide: 'Guide बंद करें',
  guideTabConcepts: 'Cloud Concepts',
  guideTabResponsibility: 'Shared Responsibility',
  guideTabDirectory: 'Service Index',
  guideTabServerless: 'Serverless Map',
  guideTabTraps: 'High-Yield Traps',
  guideTabPairs: 'Confusing Pairs',
  guideTabStrategy: 'Last-Minute Strategy',
  guideTabPassPlan: '7-Day Plan',
  guideConceptsTitle: 'Core Cloud Concepts',
  guideConceptColumn: 'Concept',
  guideMeaningColumn: 'Memory Hook / Meaning',
  guideResponsibilityTitle: 'Shared Responsibility Matrix',
  guideAwsResponsibility: 'AWS Responsibility',
  guideCustomerResponsibility: 'Customer Responsibility',
  guideResponsibilityQuestions: 'Common Responsibility Questions',
  guideSearchPlaceholder: 'Services, trigger words, या descriptions search करें (e.g. S3, SQL, database)...',
  serverlessBadgeTitle: 'Exam shortcut',
  serverlessTitle: 'Serverless services map',
  trapsTitle: 'Highest-Yield Exam Traps',
  trapsQuestionColumn: 'Question अगर कहता है...',
  trapsAnswerColumn: 'Correct answer है...',
  pairsSearchPlaceholder: 'Confusing pairs search करें (e.g. CloudWatch, RDS)...',
  readinessTitle: 'CLF-C02 Readiness Audit',
  readinessBody: 'Exam day से पहले ये six checks complete करें. दो history से measured हैं; चार honest self-checks हैं.',
  domainWeightsTitle: 'CLF-C02 Domain Weights',
  officialSourceBadge: 'Official source check',
  officialSourceLink: 'AWS exam guide खोलें',
  mustSkipTitle: 'Must-Know vs. Skip Guide',
  mustKnowHeading: 'MUST KNOW HARD',
  skipHeading: 'SKIP / KNOW LIGHTLY',
  examDayMethodTitle: 'Final Exam-Day Method',
  lastPageTitle: 'Last-Page Memory Cheat Sheet',
  passPlanTitle: '7-Day Pass Plan',
  passStrategiesTitle: 'How Real People Passed',
  keyTriggerLabel: 'Key trigger',
  selectedPlanSummary: 'Selected: {label}',
  readinessAchievedLabel: 'Achieved',
  readinessProgressLabel: 'In progress'
});

Object.assign(I18N.ja, {
  navHistory: '履歴',
  navAbout: '概要',
  navSettings: '設定',
  languageLabel: '言語',
  languageHelper: '画面の案内は日本語に切り替わります。AWS service names と practice questions は試験用語の一貫性のため英語のままです。',
  heroSubtitle: '無料の CLF-C02 対策: practice、timed mocks、local progress、login 不要。',
  stripFree: 'ずっと無料',
  stripNoAccount: 'アカウント不要',
  stripMobile: 'モバイル対応',
  stripOffline: 'オフライン対応',
  stripLanguages: '多言語 UI beta',
  stripPassed: 'CLF-C02 合格に使用',
  evidenceBadge: '研究に基づく学習ループ',
  evidenceTitle: '読み直しではなく active recall のために設計。',
  languageBadge: '言語サポート beta',
  languageTitle: 'より多くの言語で学習ガイド。',
  languageBody: 'UI は英語、スペイン語、ポルトガル語、フランス語、ドイツ語、イタリア語、オランダ語、ヒンディー語、日本語に切り替えできます。AWS terms と questions は英語のままです。',
  whyBadge: 'Cloud Recall Lab の理由',
  whyTitle: '学習中に欲しかった無料の practice layer。',
  whyBody: '多くの prep tools は有用な練習を paywall の後ろに置いたり、答えを早く見せすぎます。この lab は先に回答を決めてから feedback を見ます。',
  whyProofKicker: '個人の証拠、保証ではありません',
  whyProofTitle: 'この app を使って準備し、2026年7月1日に CLF-C02 に合格しました。',
  whyProofBody: 'スコアレポートでは4ドメインすべてで Meets Competencies でした。合格保証ではありませんが、現在の教材と組み合わせればこのループが役立つ証拠です。',
  whyCredentialLink: 'Credly で AWS credential を確認',
  whyPillPassed: '2026年7月1日 合格',
  whyPillDomains: '全ドメイン Meets Competencies',
  whyPillCourse: '最新 course または AWS docs と併用推奨',
  whyPillNoDumps: 'Original practice、braindumps なし',
  mockCardTitle: 'Full Timed Mock Exam',
  mockCardDesc: '65問を90分で解く CLF-C02 形式の timed practice。',
  startMockButton: 'Mock Exam を開始',
  guidedCardTitle: 'Science-Backed Guided Study Block',
  guidedCardDesc: 'Practice testing と active recall を使い、timers、cheat sheets、quizzes、wrong-answer review で学習します。',
  startDailyBlock: 'Daily Block を開始',
  dailyRoutineBadge: 'Daily Routine',
  trainerTitle: 'Master Memory Sentence Trainer',
  trainerDesc: 'TTS、3D flashcards、active recall game で core sentence を復習します。',
  startTraining: 'Training を開始',
  studyGuideBadge: 'Exam Reference',
  studyGuideTitle: 'Study Guide & Cheat Sheets',
  studyGuideDesc: 'Core concepts、trigger words、serverless services、confusing pairs、exam traps を検索できます。',
  openStudyGuide: 'Study Guide を開く',
  activeRecallBadge: 'Active Recall',
  drillsTitle: 'Rapid Trigger Drills',
  drillsDesc: '短い scenario に対して AWS service を入力し、miss した trigger word を復習します。',
  startDrills: 'Drills を開始',
  examSimulationBadge: 'Exam Simulation',
  miniQuizTitle: '20問 Mixed Quiz',
  miniQuizDesc: 'Exam conditions で20問回答します。score は最後に表示されます。',
  startQuiz: 'Quiz を開始',
  sectionPracticeTitle: 'Section-Focused Practice (Days 1 - 5)',
  aboutTitle: '概要 & Contact',
  aboutSubtitle: '作った理由、正しい使い方、contact links。',
  dashboardButton: 'Dashboard',
  builtBadge: '合格後に構築',
  builtTitle: 'この study loop を使って 2026年7月1日に AWS Cloud Practitioner に合格しました。',
  wiseBadge: '賢く使う',
  resourceBadge: '使用した Resource',
  resourceTitle: '教材理解に役立った course。',
  officialResourceBody: '現在の scope、domain weights、service coverage は official AWS exam guide を source of truth としてください。',
  officialResourceLink: 'Official AWS CLF-C02 exam guide',
  communityResourceBody: 'r/AWSCertifications wiki は community-maintained links として便利です。official AWS material ではありません。',
  communityResourceLink: 'r/AWSCertifications community wiki',
  compatBadge: 'Compatibility',
  contactBadge: 'Contact',
  contactTitle: 'Connect、contribute、または support。',
  settingsTitle: 'Settings & Data',
  settingsBody: 'Progress はこの browser に local 保存されます。別 device に移す場合は backup を export してください。',
  languageToast: '言語を更新しました。Practice questions は試験用語のため英語のままです。',
  guidePageTitle: '学習ガイド & Cheat Sheets',
  guidePageSubtitle: 'Core AWS concepts、trigger words、exam traps を browse/search/memorize。',
  exitGuide: 'Guide を閉じる',
  guideTabConcepts: 'Cloud Concepts',
  guideTabResponsibility: 'Shared Responsibility',
  guideTabDirectory: 'Service Index',
  guideTabServerless: 'Serverless Map',
  guideTabTraps: 'High-Yield Traps',
  guideTabPairs: 'Confusing Pairs',
  guideTabStrategy: 'Last-Minute Strategy',
  guideTabPassPlan: '7-Day Plan',
  guideConceptsTitle: 'Core Cloud Concepts',
  guideConceptColumn: 'Concept',
  guideMeaningColumn: 'Memory Hook / Meaning',
  guideResponsibilityTitle: 'Shared Responsibility Matrix',
  guideResponsibilityBody: '覚えるポイント: AWS は cloud OF security、customer は cloud IN security を担当します。',
  guideAwsResponsibility: 'AWS Responsibility',
  guideCustomerResponsibility: 'Customer Responsibility',
  guideResponsibilityQuestions: 'Common Responsibility Questions',
  guideSearchPlaceholder: 'Services、trigger words、descriptions を検索 (例: S3, SQL, database)...',
  serverlessBadgeTitle: 'Exam shortcut',
  serverlessTitle: 'Serverless services map',
  serverlessBody: 'CLF-C02 で serverless は多くの場合、capacity、scaling、availability、infrastructure management を AWS が扱う意味です。access、data、cost、behavior は設定が必要です。',
  trapsTitle: 'Highest-Yield Exam Traps',
  trapsBody: 'この pattern を見つけると、likely service を素早く選べます。',
  trapsQuestionColumn: 'Question says...',
  trapsAnswerColumn: 'Correct answer...',
  pairsSearchPlaceholder: 'Confusing pairs を検索 (例: CloudWatch, RDS)...',
  readinessTitle: 'CLF-C02 Readiness Audit',
  readinessBody: 'Exam day 前に6つの check を完了します。2つは history で測定、4つは honest self-check です。',
  domainWeightsTitle: 'CLF-C02 Domain Weights',
  officialSourceBadge: 'Official source check',
  officialSourceBody: 'Exam day 前に current AWS exam guide で weights と scope を確認してください。',
  officialSourceLink: 'AWS exam guide を開く',
  mustSkipTitle: 'Must-Know vs. Skip Guide',
  mustSkipBody: '最後の時間は重要ポイントに集中。config details の暗記に使いすぎない。',
  mustKnowHeading: 'MUST KNOW HARD',
  skipHeading: 'SKIP / KNOW LIGHTLY',
  examDayMethodTitle: 'Final Exam-Day Method',
  lastPageTitle: 'Last-Page Memory Cheat Sheet',
  lastPageBody: '試験直前に見直す condensed service summary。',
  passPlanTitle: '7-Day Pass Plan',
  passPlanBody: '高配点 domains に寄せた daily plan。1日およそ2-3時間。',
  passStrategiesTitle: 'How Real People Passed',
  passStrategiesBody: 'Paraphrased from public study reports and AWS guidance. No confidential or unauthorized exam content.',
  serverlessLabel: 'Serverless',
  serverlessSummaryServices: 'exam-relevant services flagged',
  serverlessSummaryBuckets: 'mental buckets: compute, APIs, data, integration, AI',
  serverlessSummaryCaution: 'no servers, but IAM, data, cost, and config matter',
  serverlessServiceCount: '{count} services',
  keyTriggerLabel: 'Key trigger',
  noServiceResults: '"{query}" に一致する service はありません。',
  trapQuestionTemplate: 'Question says "{term}"...',
  trapAnswerTemplate: 'Correct answer is "{answer}"',
  passPlanDayLabel: 'Day {day}: {focus}',
  passPlanWhyLabel: 'Why',
  selectedPlanSummary: 'Selected: {label}',
  readinessMockTitle: 'Two timed mocks で 80%+',
  readinessMockAchieved: 'Done: {count} mocks at 80%+.',
  readinessMockProgress: '80%+ mocks が2回必要。current: {count}.',
  readinessWrongTitle: 'Wrong-answer pool を5未満にする',
  readinessWrongAchieved: 'Done: wrong-answer pool は小さいです ({count}).',
  readinessWrongProgress: 'Pool を5未満に保つ。current: {count}.',
  readinessMasterTitle: '47 service anchors を見ずに recall',
  readinessMasterInfo: 'Self-check: Master Memory Page を声に出して説明できますか?',
  readinessPairsTitle: 'Top confusing pairs を説明',
  readinessPairsInfo: 'Self-check: CloudWatch vs CloudTrail, WAF vs Shield vs GuardDuty, SQS vs SNS, etc.',
  readinessDrillsTitle: 'Rapid Trigger Drills で 80%+',
  readinessDrillsInfo: 'Self-check: scenario triggers を services に素早く一致させる。',
  readinessOfficialTitle: 'Official AWS practice questions を review',
  readinessOfficialInfo: 'Self-check: current AWS materials と wording instincts を比較。',
  readinessAchievedLabel: 'Achieved',
  readinessProgressLabel: 'In progress'
});

const PAIR_UI_COPY = {
  es: {
    pairsIntroBadge: 'Ayuda de decision',
    pairsIntroTitle: 'Pares confusos, sin ruido.',
    pairsIntroBody: 'Primero lee la regla de decision. Abre un par solo si necesitas definiciones o triggers.',
    pairCountLabel: '{count} pares',
    pairCountOneLabel: '1 par',
    pairCompareLabel: 'Comparar',
    pairOpenLabel: 'Abrir',
    pairCloseLabel: 'Cerrar',
    pairTriggerLabel: 'Trigger de examen',
    pairDecisionLabel: 'Como elegir',
    noPairsResults: 'No se encontraron pares para "{query}".'
  },
  pt: {
    pairsIntroBadge: 'Ajuda de decisao',
    pairsIntroTitle: 'Pares confusos, sem ruido.',
    pairsIntroBody: 'Leia primeiro a regra de decisao. Abra um par so quando precisar de definicoes ou gatilhos.',
    pairCountLabel: '{count} pares',
    pairCountOneLabel: '1 par',
    pairCompareLabel: 'Comparar',
    pairOpenLabel: 'Abrir',
    pairCloseLabel: 'Fechar',
    pairTriggerLabel: 'Gatilho de prova',
    pairDecisionLabel: 'Como escolher',
    noPairsResults: 'Nenhum par encontrado para "{query}".'
  },
  fr: {
    pairsIntroBadge: 'Aide de decision',
    pairsIntroTitle: 'Paires confuses, clarifiees.',
    pairsIntroBody: 'Lisez dabord la regle de decision. Ouvrez une paire seulement si vous avez besoin des definitions ou des declencheurs.',
    pairCountLabel: '{count} paires',
    pairCountOneLabel: '1 paire',
    pairCompareLabel: 'Comparer',
    pairOpenLabel: 'Ouvrir',
    pairCloseLabel: 'Fermer',
    pairTriggerLabel: 'Declencheur examen',
    pairDecisionLabel: 'Comment choisir',
    noPairsResults: 'Aucune paire trouvee pour "{query}".'
  },
  de: {
    pairsIntroBadge: 'Entscheidungshilfe',
    pairsIntroTitle: 'Verwechslungs-Paare, sauber sortiert.',
    pairsIntroBody: 'Lies zuerst die Auswahlregel. Oeffne ein Paar nur, wenn du Definitionen oder Trigger brauchst.',
    pairCountLabel: '{count} Paare',
    pairCountOneLabel: '1 Paar',
    pairCompareLabel: 'Vergleichen',
    pairOpenLabel: 'Oeffnen',
    pairCloseLabel: 'Schliessen',
    pairTriggerLabel: 'Pruefungs-Trigger',
    pairDecisionLabel: 'Auswahlregel',
    noPairsResults: 'Keine Paare fuer "{query}" gefunden.'
  },
  it: {
    pairsIntroBadge: 'Aiuto decisione',
    pairsIntroTitle: 'Coppie confuse, chiarite.',
    pairsIntroBody: 'Leggi prima la regola di decisione. Apri una coppia solo se servono definizioni o trigger.',
    pairCountLabel: '{count} coppie',
    pairCountOneLabel: '1 coppia',
    pairCompareLabel: 'Confronta',
    pairOpenLabel: 'Apri',
    pairCloseLabel: 'Chiudi',
    pairTriggerLabel: 'Trigger esame',
    pairDecisionLabel: 'Come scegliere',
    noPairsResults: 'Nessuna coppia trovata per "{query}".'
  },
  nl: {
    pairsIntroBadge: 'Beslishulp',
    pairsIntroTitle: 'Verwarrende paren, helder gemaakt.',
    pairsIntroBody: 'Lees eerst de beslisregel. Open een paar alleen als je definities of triggers nodig hebt.',
    pairCountLabel: '{count} paren',
    pairCountOneLabel: '1 paar',
    pairCompareLabel: 'Vergelijk',
    pairOpenLabel: 'Open',
    pairCloseLabel: 'Sluit',
    pairTriggerLabel: 'Examentrigger',
    pairDecisionLabel: 'Hoe kiezen',
    noPairsResults: 'Geen paren gevonden voor "{query}".'
  },
  hi: {
    pairsIntroBadge: 'Decision helper',
    pairsIntroTitle: 'Confusing pairs, clear format.',
    pairsIntroBody: 'Pehle decision rule scan karein. Definitions ya trigger words chahiye tabhi pair open karein.',
    pairCountLabel: '{count} pair checks',
    pairCountOneLabel: '1 pair check',
    pairCompareLabel: 'Compare',
    pairOpenLabel: 'Open',
    pairCloseLabel: 'Close',
    pairTriggerLabel: 'Exam trigger',
    pairDecisionLabel: 'Kaise choose karein',
    noPairsResults: 'No confusing pairs found for "{query}".'
  },
  ja: {
    pairsIntroBadge: 'Decision helper',
    pairsIntroTitle: 'Confusing pairs, clear format.',
    pairsIntroBody: 'Scan the decision rule first. Open a pair only when you need definitions or trigger words.',
    pairCountLabel: '{count} pair checks',
    pairCountOneLabel: '1 pair check',
    pairCompareLabel: 'Compare',
    pairOpenLabel: 'Open',
    pairCloseLabel: 'Close',
    pairTriggerLabel: 'Exam trigger',
    pairDecisionLabel: 'How to choose',
    noPairsResults: 'No confusing pairs found for "{query}".'
  }
};

Object.entries(PAIR_UI_COPY).forEach(([lang, copy]) => {
  I18N[lang] = { ...(I18N[lang] || {}), ...copy };
});

const RESOURCE_UI_COPY = {
  en: {
    resourceFreeBody: 'If you cannot afford Udemy or just want to stay fully free, pair this app with a current free course and the official AWS guide. Learn the concepts first, then use Cloud Recall Lab to practice recall under pressure.',
    resourceFreeCourse: 'Free YouTube course option for Cloud Practitioner learners'
  },
  es: {
    resourceFreeBody: 'Si no puedes pagar Udemy o quieres mantenerlo totalmente gratis, combina esta app con un curso gratuito actual y la guia oficial de AWS. Aprende los conceptos primero y luego usa Cloud Recall Lab para practicar recuerdo bajo presion.',
    resourceFreeCourse: 'Curso gratuito en YouTube para Cloud Practitioner'
  },
  pt: {
    resourceFreeBody: 'Se voce nao puder pagar Udemy ou quiser ficar totalmente gratis, combine esta app com um curso gratuito atual e a guia oficial da AWS. Aprenda os conceitos primeiro e depois use Cloud Recall Lab para praticar recall sob pressao.',
    resourceFreeCourse: 'Curso gratuito no YouTube para Cloud Practitioner'
  },
  fr: {
    resourceFreeBody: 'Si vous ne pouvez pas payer Udemy ou voulez rester entierement gratuit, combinez cette app avec un cours gratuit actuel et le guide officiel AWS. Apprenez les concepts, puis utilisez Cloud Recall Lab pour pratiquer le rappel sous pression.',
    resourceFreeCourse: 'Cours YouTube gratuit pour Cloud Practitioner'
  },
  de: {
    resourceFreeBody: 'Wenn du Udemy nicht bezahlen kannst oder komplett kostenlos bleiben willst, kombiniere diese App mit einem aktuellen kostenlosen Kurs und dem offiziellen AWS Guide. Lerne zuerst die Konzepte, dann uebe Recall unter Druck mit Cloud Recall Lab.',
    resourceFreeCourse: 'Kostenloser YouTube-Kurs fuer Cloud Practitioner'
  },
  it: {
    resourceFreeBody: 'Se non puoi pagare Udemy o vuoi restare completamente gratis, abbina questa app a un corso gratuito aggiornato e alla guida ufficiale AWS. Impara prima i concetti, poi usa Cloud Recall Lab per allenare il richiamo sotto pressione.',
    resourceFreeCourse: 'Corso YouTube gratuito per Cloud Practitioner'
  },
  nl: {
    resourceFreeBody: 'Als je Udemy niet kunt betalen of volledig gratis wilt blijven, combineer deze app dan met een actuele gratis cursus en de officiele AWS guide. Leer eerst de concepten en gebruik Cloud Recall Lab daarna om recall onder druk te oefenen.',
    resourceFreeCourse: 'Gratis YouTube-cursus voor Cloud Practitioner'
  },
  hi: {
    resourceFreeBody: 'Agar Udemy afford nahi kar sakte ya fully free rehna chahte hain, is app ko current free course aur official AWS guide ke saath pair karein. Pehle concepts learn karein, phir Cloud Recall Lab se pressure me recall practice karein.',
    resourceFreeCourse: 'Cloud Practitioner learners ke liye free YouTube course option'
  },
  ja: {
    resourceFreeBody: 'If you cannot afford Udemy or want to stay fully free, pair this app with a current free course and the official AWS guide. Learn the concepts first, then use Cloud Recall Lab for recall practice under pressure.',
    resourceFreeCourse: 'Free YouTube course option for Cloud Practitioner learners'
  }
};

Object.entries(RESOURCE_UI_COPY).forEach(([lang, copy]) => {
  I18N[lang] = { ...(I18N[lang] || {}), ...copy };
});

const INTEGRITY_UI_COPY = {
  en: {
    integrityBadge: 'Exam integrity',
    integrityTitle: 'Built to practice ethically, not to reproduce AWS exam content.',
    integrityBody1: 'All practice questions and explanations are original educational scenarios. They are not copied from AWS certification exams, unauthorized disclosures, braindumps, paid practice products, or confidential materials.',
    integrityBody2: 'Do not submit actual certification exam questions, screenshots, answer dumps, or confidential assessment material in issues, pull requests, messages, or corrections. If something looks like unauthorized exam content, it should be removed.',
    integrityBody3: 'Do not use this app, notes, browser tools, AI tools, screenshots, or any other unauthorized materials during a live AWS exam or credential assessment. Follow the current AWS Certification Program Agreement and testing rules.',
    integrityAgreementLink: 'Read the AWS Certification Program Agreement',
    footerDisclaimer: 'This is an independent study tool and is not affiliated with, endorsed by, authored by, or sponsored by Amazon Web Services (AWS). AWS and Amazon Web Services are trademarks of Amazon.com, Inc. or its affiliates. All questions are original educational scenarios, not AWS certification exam materials.'
  },
  es: {
    integrityBadge: 'Integridad del examen',
    integrityTitle: 'Hecho para practicar con etica, no para reproducir contenido del examen AWS.',
    integrityBody1: 'Todas las preguntas y explicaciones son escenarios educativos originales. No estan copiadas de examenes AWS, divulgaciones no autorizadas, braindumps, productos pagados o material confidencial.',
    integrityBody2: 'No envies preguntas reales de examen, capturas, dumps de respuestas o material confidencial en issues, PRs, mensajes o correcciones. Si algo parece contenido no autorizado, debe eliminarse.',
    integrityBody3: 'No uses esta app, notas, herramientas del navegador, AI, capturas ni materiales no autorizados durante un examen AWS en vivo. Sigue el acuerdo y reglas actuales de AWS Certification.',
    integrityAgreementLink: 'Leer el AWS Certification Program Agreement',
    footerDisclaimer: 'Herramienta independiente, no afiliada, respaldada, creada ni patrocinada por Amazon Web Services (AWS). AWS y Amazon Web Services son marcas de Amazon.com, Inc. o sus afiliadas. Las preguntas son escenarios educativos originales, no materiales de examenes de certificacion AWS.'
  },
  pt: {
    integrityBadge: 'Integridade do exame',
    integrityTitle: 'Feito para praticar com etica, nao para reproduzir conteudo de exames AWS.',
    integrityBody1: 'Todas as perguntas e explicacoes sao cenarios educacionais originais. Nao sao copiadas de exames AWS, divulgacoes nao autorizadas, braindumps, produtos pagos ou material confidencial.',
    integrityBody2: 'Nao envie perguntas reais de exame, capturas, dumps de respostas ou material confidencial em issues, PRs, mensagens ou correcoes. Se algo parecer conteudo nao autorizado, deve ser removido.',
    integrityBody3: 'Nao use esta app, notas, ferramentas do navegador, AI, capturas ou materiais nao autorizados durante um exame AWS ao vivo. Siga o acordo e as regras atuais da AWS Certification.',
    integrityAgreementLink: 'Ler o AWS Certification Program Agreement',
    footerDisclaimer: 'Ferramenta independente, nao afiliada, endossada, criada ou patrocinada pela Amazon Web Services (AWS). AWS e Amazon Web Services sao marcas da Amazon.com, Inc. ou afiliadas. As perguntas sao cenarios educacionais originais, nao materiais de exames de certificacao AWS.'
  },
  fr: {
    integrityBadge: 'Integrite examen',
    integrityTitle: 'Concu pour pratiquer de facon ethique, pas pour reproduire le contenu des examens AWS.',
    integrityBody1: 'Toutes les questions et explications sont des scenarios educatifs originaux. Elles ne viennent pas dexamens AWS, divulgations non autorisees, braindumps, produits payants ou documents confidentiels.',
    integrityBody2: 'Ne soumettez pas de vraies questions dexamen, captures, dumps de reponses ou documents confidentiels dans les issues, PRs, messages ou corrections. Tout contenu non autorise doit etre retire.',
    integrityBody3: 'Nutilisez pas cette app, des notes, outils navigateur, AI, captures ou autres documents non autorises pendant un examen AWS en direct. Respectez le contrat et les regles AWS Certification actuels.',
    integrityAgreementLink: 'Lire le AWS Certification Program Agreement',
    footerDisclaimer: 'Outil independant, non affilie, approuve, cree ou sponsorise par Amazon Web Services (AWS). AWS et Amazon Web Services sont des marques dAmazon.com, Inc. ou de ses filiales. Les questions sont des scenarios educatifs originaux, pas des materiels dexamen de certification AWS.'
  },
  de: {
    integrityBadge: 'Pruefungsintegritaet',
    integrityTitle: 'Zum ethischen Ueben gebaut, nicht zum Reproduzieren von AWS-Pruefungsinhalten.',
    integrityBody1: 'Alle Fragen und Erklaerungen sind originale Lernszenarien. Sie sind nicht aus AWS-Pruefungen, unautorisierten Offenlegungen, Braindumps, bezahlten Produkten oder vertraulichem Material kopiert.',
    integrityBody2: 'Keine echten Pruefungsfragen, Screenshots, Antwort-Dumps oder vertraulichen Materialien in Issues, PRs, Nachrichten oder Korrekturen einreichen. Unautorisierter Inhalt muss entfernt werden.',
    integrityBody3: 'Nutze diese App, Notizen, Browser-Tools, AI, Screenshots oder andere unautorisierte Materialien nicht waehrend einer laufenden AWS-Pruefung. Befolge das aktuelle AWS Certification Agreement und die Testregeln.',
    integrityAgreementLink: 'AWS Certification Program Agreement lesen',
    footerDisclaimer: 'Unabhaengiges Lerntool, nicht mit Amazon Web Services (AWS) verbunden, unterstuetzt, erstellt oder gesponsert. AWS und Amazon Web Services sind Marken von Amazon.com, Inc. oder verbundenen Unternehmen. Alle Fragen sind originale Lernszenarien, keine AWS-Zertifizierungspruefungsmaterialien.'
  },
  it: {
    integrityBadge: 'Integrita esame',
    integrityTitle: 'Creato per praticare in modo etico, non per riprodurre contenuto degli esami AWS.',
    integrityBody1: 'Tutte le domande e spiegazioni sono scenari educativi originali. Non sono copiate da esami AWS, divulgazioni non autorizzate, braindump, prodotti a pagamento o materiali confidenziali.',
    integrityBody2: 'Non inviare domande reali di esame, screenshot, answer dump o materiale confidenziale in issue, PR, messaggi o correzioni. Se qualcosa sembra contenuto non autorizzato, va rimosso.',
    integrityBody3: 'Non usare questa app, note, strumenti browser, AI, screenshot o materiali non autorizzati durante un esame AWS live. Segui laccordo e le regole AWS Certification attuali.',
    integrityAgreementLink: 'Leggi AWS Certification Program Agreement',
    footerDisclaimer: 'Strumento indipendente, non affiliato, approvato, creato o sponsorizzato da Amazon Web Services (AWS). AWS e Amazon Web Services sono marchi di Amazon.com, Inc. o affiliate. Le domande sono scenari educativi originali, non materiali di esami di certificazione AWS.'
  },
  nl: {
    integrityBadge: 'Examenintegriteit',
    integrityTitle: 'Gebouwd om ethisch te oefenen, niet om AWS-examencontent te reproduceren.',
    integrityBody1: 'Alle oefenvragen en uitleg zijn originele educatieve scenarios. Ze zijn niet gekopieerd uit AWS-examens, ongeautoriseerde disclosures, braindumps, betaalde oefenproducten of vertrouwelijk materiaal.',
    integrityBody2: 'Dien geen echte examenvragen, screenshots, antwoord-dumps of vertrouwelijk assessmentmateriaal in via issues, PRs, berichten of correcties. Ongeautoriseerde content moet worden verwijderd.',
    integrityBody3: 'Gebruik deze app, notities, browsertools, AI, screenshots of andere ongeautoriseerde materialen niet tijdens een live AWS-examen. Volg de actuele AWS Certification Program Agreement en testregels.',
    integrityAgreementLink: 'Lees de AWS Certification Program Agreement',
    footerDisclaimer: 'Onafhankelijke studietool, niet verbonden aan, goedgekeurd door, gemaakt door of gesponsord door Amazon Web Services (AWS). AWS en Amazon Web Services zijn handelsmerken van Amazon.com, Inc. of gelieerde ondernemingen. Alle vragen zijn originele educatieve scenarios, geen AWS-certificeringsexamenmateriaal.'
  },
  hi: {
    integrityBadge: 'Exam integrity',
    integrityTitle: 'Ethical practice ke liye built, AWS exam content reproduce karne ke liye nahi.',
    integrityBody1: 'Saare practice questions aur explanations original educational scenarios hain. Yeh AWS certification exams, unauthorized disclosures, braindumps, paid practice products, ya confidential materials se copy nahi kiye gaye.',
    integrityBody2: 'Actual certification exam questions, screenshots, answer dumps, ya confidential assessment material issues, PRs, messages, ya corrections me submit na karein. Unauthorized content dikhe to remove hona chahiye.',
    integrityBody3: 'Live AWS exam ke dauran is app, notes, browser tools, AI tools, screenshots, ya koi unauthorized material use na karein. Current AWS Certification Program Agreement aur testing rules follow karein.',
    integrityAgreementLink: 'AWS Certification Program Agreement padhein',
    footerDisclaimer: 'Independent study tool; Amazon Web Services (AWS) se affiliated, endorsed, authored, ya sponsored nahi. AWS aur Amazon Web Services Amazon.com, Inc. ya affiliates ke trademarks hain. Questions original educational scenarios hain, AWS certification exam materials nahi.'
  },
  ja: {
    integrityBadge: 'Exam integrity',
    integrityTitle: 'Built for ethical practice, not for reproducing AWS exam content.',
    integrityBody1: 'All practice questions and explanations are original educational scenarios. They are not copied from AWS certification exams, unauthorized disclosures, braindumps, paid practice products, or confidential materials.',
    integrityBody2: 'Do not submit actual certification exam questions, screenshots, answer dumps, or confidential assessment material in issues, pull requests, messages, or corrections. Unauthorized exam content should be removed.',
    integrityBody3: 'Do not use this app, notes, browser tools, AI tools, screenshots, or other unauthorized materials during a live AWS exam or credential assessment. Follow current AWS testing rules.',
    integrityAgreementLink: 'Read the AWS Certification Program Agreement',
    footerDisclaimer: 'This is an independent study tool and is not affiliated with, endorsed by, authored by, or sponsored by Amazon Web Services (AWS). AWS and Amazon Web Services are trademarks of Amazon.com, Inc. or its affiliates. All questions are original educational scenarios, not AWS certification exam materials.'
  }
};

Object.entries(INTEGRITY_UI_COPY).forEach(([lang, copy]) => {
  I18N[lang] = { ...(I18N[lang] || {}), ...copy };
});

const CERT_VALUE_COPY = {
  en: {
    certValueBadge: 'Why this cert helps',
    certValueTitle: 'A small credential can be a useful credibility signal.',
    certValueBody: 'Cloud Practitioner is foundational, but that is the point: it proves you can speak AWS basics across engineering, consulting, infrastructure, implementation, and product conversations. In a room of engineers, a verified cert can help you stand out because it is visible proof that you took cloud fundamentals seriously.',
    certValueNote: 'It does not replace hands-on experience, but it can make your resume, project conversations, and internal credibility a little stronger.',
    certValueLink: 'Explore AWS Certifications',
    certRoleCloudEngineers: 'Cloud Engineers',
    certRoleConsultants: 'ICT Consultants',
    certRoleInfrastructure: 'IT Infrastructure Services Analysts',
    certRoleImplementation: 'Technology Implementation Consultants',
    certRoleDesigners: 'UI Designers'
  },
  es: {
    certValueBadge: 'Por que ayuda',
    certValueTitle: 'Una credencial pequena puede ser una senal visible de credibilidad.',
    certValueBody: 'Cloud Practitioner es fundacional, y ese es el valor: demuestra que puedes hablar de conceptos AWS en conversaciones de ingenieria, consultoria, infraestructura, implementacion y producto. En un grupo tecnico, una certificacion verificada puede ayudarte a destacar porque muestra que tomaste en serio los fundamentos cloud.',
    certValueNote: 'No reemplaza la experiencia practica, pero puede fortalecer tu CV, conversaciones de proyecto y credibilidad interna.',
    certValueLink: 'Explorar certificaciones AWS'
  },
  pt: {
    certValueBadge: 'Por que ajuda',
    certValueTitle: 'Uma credencial pequena pode ser um sinal visivel de credibilidade.',
    certValueBody: 'Cloud Practitioner e fundacional, e esse e o ponto: mostra que voce consegue falar de fundamentos AWS em conversas de engenharia, consultoria, infraestrutura, implementacao e produto. Em um grupo tecnico, uma certificacao verificada pode ajudar voce a se destacar porque mostra que levou fundamentos de cloud a serio.',
    certValueNote: 'Nao substitui experiencia pratica, mas pode fortalecer curriculo, conversas de projeto e credibilidade interna.',
    certValueLink: 'Explorar certificacoes AWS'
  },
  fr: {
    certValueBadge: 'Pourquoi ca aide',
    certValueTitle: 'Une petite certification peut devenir un signal visible de credibilite.',
    certValueBody: 'Cloud Practitioner est fondamental, et cest son interet: il montre que vous pouvez parler des bases AWS dans des discussions engineering, consulting, infrastructure, implementation et produit. Dans un groupe technique, une certification verifiee peut vous faire ressortir car elle prouve que vous avez pris les bases cloud au serieux.',
    certValueNote: 'Cela ne remplace pas lexperience pratique, mais peut renforcer le CV, les conversations projet et la credibilite interne.',
    certValueLink: 'Explorer les certifications AWS'
  },
  de: {
    certValueBadge: 'Warum es hilft',
    certValueTitle: 'Ein kleines Credential kann ein sichtbares Glaubwuerdigkeits-Signal sein.',
    certValueBody: 'Cloud Practitioner ist grundlegend, und genau das ist der Wert: Es zeigt, dass du AWS-Basics in Engineering-, Consulting-, Infrastruktur-, Implementierungs- und Produktgespraechen sprechen kannst. In einer Gruppe von Engineers kann ein verifiziertes Zertifikat auffallen, weil es sichtbar macht, dass du Cloud-Grundlagen ernst genommen hast.',
    certValueNote: 'Es ersetzt keine praktische Erfahrung, kann aber Lebenslauf, Projektgespraeche und interne Glaubwuerdigkeit staerken.',
    certValueLink: 'AWS Certifications ansehen'
  },
  it: {
    certValueBadge: 'Perche aiuta',
    certValueTitle: 'Una piccola credenziale puo essere un segnale visibile di credibilita.',
    certValueBody: 'Cloud Practitioner e fondamentale, ed e proprio questo il punto: dimostra che sai parlare delle basi AWS in conversazioni di engineering, consulenza, infrastruttura, implementazione e prodotto. In un gruppo tecnico, una certificazione verificata puo farti emergere perche mostra che hai preso sul serio i fondamenti cloud.',
    certValueNote: 'Non sostituisce esperienza pratica, ma puo rendere piu forti CV, conversazioni di progetto e credibilita interna.',
    certValueLink: 'Esplora certificazioni AWS'
  },
  nl: {
    certValueBadge: 'Waarom dit helpt',
    certValueTitle: 'Een kleine credential kan een zichtbaar geloofwaardigheidssignaal zijn.',
    certValueBody: 'Cloud Practitioner is fundamenteel, en dat is juist de waarde: het laat zien dat je AWS-basiskennis kunt gebruiken in gesprekken over engineering, consulting, infrastructuur, implementatie en product. In een technische groep kan een geverifieerde certificering je laten opvallen omdat het zichtbaar maakt dat je cloudfundamenten serieus nam.',
    certValueNote: 'Het vervangt geen praktijkervaring, maar kan je cv, projectgesprekken en interne geloofwaardigheid sterker maken.',
    certValueLink: 'Bekijk AWS Certifications'
  },
  hi: {
    certValueBadge: 'Why this cert helps',
    certValueTitle: 'Ek small credential bhi credibility signal ban sakta hai.',
    certValueBody: 'Cloud Practitioner foundational hai, aur wahi value hai: yeh dikhata hai ki aap engineering, consulting, infrastructure, implementation, aur product conversations me AWS basics bol sakte hain. Engineers ke group me verified cert aapko stand out kar sakta hai kyunki yeh visible proof hai ki aapne cloud fundamentals seriously liye.',
    certValueNote: 'Yeh hands-on experience replace nahi karta, par resume, project conversations, aur internal credibility ko stronger bana sakta hai.',
    certValueLink: 'Explore AWS Certifications'
  },
  ja: {
    certValueBadge: 'Why this cert helps',
    certValueTitle: 'A small credential can be a useful credibility signal.',
    certValueBody: 'Cloud Practitioner is foundational, and that is the value: it shows you can speak AWS basics across engineering, consulting, infrastructure, implementation, and product conversations. In an engineering group, a verified cert can help you stand out because it is visible proof that you took cloud fundamentals seriously.',
    certValueNote: 'It does not replace hands-on experience, but it can make your resume, project conversations, and internal credibility stronger.',
    certValueLink: 'Explore AWS Certifications'
  }
};

Object.entries(CERT_VALUE_COPY).forEach(([lang, copy]) => {
  I18N[lang] = { ...(I18N[lang] || {}), ...copy };
});

const READINESS_GATE_COPY = {
  es: {
    readinessGateBadge: 'Puerta final de preparacion',
    readinessPillLabel: 'Listo:',
    sourceMapBadge: 'Mapa de fuentes oficiales',
    sourceMapTitle: 'En que se basa esta guia.',
    sourceMapBody: 'Usa estos links como verificacion antes del examen. La app convierte el scope oficial en practica; AWS docs siguen siendo la verdad si cambian servicios o redaccion.',
    officialStudyTitle: 'Estudia estos anchors oficiales',
    officialAvoidTitle: 'Evita estos rabbit holes',
    readinessTitle: 'Puerta de preparacion CLF-C02',
    readinessBody: 'Usa esto antes del examen: dos checks salen de tu historial y cuatro son confirmaciones honestas. Ayuda a encontrar gaps; no garantiza aprobar.',
    readinessCountLabel: 'checks completos',
    readinessWrongEmpty: 'Haz un quiz primero; un pool vacio solo importa despues de intentos reales.',
    readinessAchievedLabel: 'Senal lista',
    readinessProgressLabel: 'Requiere trabajo',
    readinessMeasuredLabel: 'Medido',
    readinessSelfCheckLabel: 'Auto-check',
    readinessActionMock: 'Hacer mock cronometrado',
    readinessActionWrongs: 'Revisar errores',
    readinessActionMaster: 'Abrir memory trainer',
    readinessActionPairs: 'Abrir pares confusos',
    readinessActionDrills: 'Iniciar trigger drills',
    readinessActionOfficial: 'Abrir guia AWS'
  },
  pt: {
    readinessGateBadge: 'Portao final de preparo',
    readinessPillLabel: 'Pronto:',
    sourceMapBadge: 'Mapa de fontes oficiais',
    sourceMapTitle: 'No que esta guia se baseia.',
    sourceMapBody: 'Use estes links como checagem antes do exame. A app transforma o escopo oficial em pratica; docs AWS continuam sendo a verdade quando algo muda.',
    officialStudyTitle: 'Estude estes anchors oficiais',
    officialAvoidTitle: 'Evite estes rabbit holes',
    readinessTitle: 'Portao de preparo CLF-C02',
    readinessBody: 'Use antes do exame: dois checks vem do historico e quatro sao confirmacoes honestas. Ajuda a achar gaps; nao garante aprovacao.',
    readinessCountLabel: 'checks completos',
    readinessWrongEmpty: 'Faca um quiz primeiro; pool vazio so importa depois de tentativas reais.',
    readinessAchievedLabel: 'Sinal pronto',
    readinessProgressLabel: 'Precisa trabalho',
    readinessMeasuredLabel: 'Medido',
    readinessSelfCheckLabel: 'Auto-check',
    readinessActionMock: 'Fazer simulado',
    readinessActionWrongs: 'Revisar erros',
    readinessActionMaster: 'Abrir memory trainer',
    readinessActionPairs: 'Abrir pares confusos',
    readinessActionDrills: 'Iniciar trigger drills',
    readinessActionOfficial: 'Abrir guia AWS'
  },
  fr: {
    readinessGateBadge: 'Gate final de preparation',
    readinessPillLabel: 'Pret:',
    sourceMapBadge: 'Carte des sources officielles',
    sourceMapTitle: 'Ce qui ancre ce guide.',
    sourceMapBody: 'Utilisez ces liens comme verification avant lexamen. Lapp transforme le perimetre officiel en pratique; les docs AWS restent la source de verite.',
    officialStudyTitle: 'Etudier ces ancrages officiels',
    officialAvoidTitle: 'Eviter ces rabbit holes',
    readinessTitle: 'Gate de preparation CLF-C02',
    readinessBody: 'A utiliser avant lexamen: deux checks viennent de lhistorique, quatre sont des confirmations honnetes. Cela expose les gaps; ne garantit pas la reussite.',
    readinessCountLabel: 'checks termines',
    readinessWrongEmpty: 'Faites dabord un quiz; une liste vide compte seulement apres de vraies tentatives.',
    readinessAchievedLabel: 'Signal pret',
    readinessProgressLabel: 'A travailler',
    readinessMeasuredLabel: 'Mesure',
    readinessSelfCheckLabel: 'Auto-check',
    readinessActionMock: 'Faire un mock',
    readinessActionWrongs: 'Revoir erreurs',
    readinessActionMaster: 'Ouvrir memory trainer',
    readinessActionPairs: 'Ouvrir paires confuses',
    readinessActionDrills: 'Lancer trigger drills',
    readinessActionOfficial: 'Ouvrir guide AWS'
  },
  de: {
    readinessGateBadge: 'Finales Readiness-Gate',
    readinessPillLabel: 'Bereit:',
    sourceMapBadge: 'Offizielle Quellenkarte',
    sourceMapTitle: 'Worauf dieser Guide basiert.',
    sourceMapBody: 'Nutze diese Links als Source-Check vor dem Examen. Die App macht aus dem offiziellen Scope Recall-Praxis; AWS Docs bleiben die Wahrheit.',
    officialStudyTitle: 'Diese offiziellen Anker lernen',
    officialAvoidTitle: 'Diese Rabbit Holes vermeiden',
    readinessTitle: 'CLF-C02 Readiness-Gate',
    readinessBody: 'Vor dem Examen nutzen: zwei Checks kommen aus der Historie, vier sind ehrliche Selbstchecks. Es zeigt Luecken; es garantiert kein Bestehen.',
    readinessCountLabel: 'Checks erledigt',
    readinessWrongEmpty: 'Starte erst ein Quiz; ein leerer Fehlerpool zaehlt erst nach echten Versuchen.',
    readinessAchievedLabel: 'Bereit-Signal',
    readinessProgressLabel: 'Braucht Arbeit',
    readinessMeasuredLabel: 'Gemessen',
    readinessSelfCheckLabel: 'Selbstcheck',
    readinessActionMock: 'Timed Mock starten',
    readinessActionWrongs: 'Fehler reviewen',
    readinessActionMaster: 'Memory Trainer',
    readinessActionPairs: 'Verwechslungs-Paare',
    readinessActionDrills: 'Trigger-Drills starten',
    readinessActionOfficial: 'AWS Guide oeffnen'
  },
  it: {
    readinessGateBadge: 'Gate finale di preparazione',
    readinessPillLabel: 'Pronto:',
    sourceMapBadge: 'Mappa fonti ufficiali',
    sourceMapTitle: 'Su cosa si basa questa guida.',
    sourceMapBody: 'Usa questi link come controllo prima dellesame. Lapp trasforma lo scope ufficiale in pratica; i docs AWS restano la fonte vera.',
    officialStudyTitle: 'Studia questi anchor ufficiali',
    officialAvoidTitle: 'Evita questi rabbit holes',
    readinessTitle: 'Gate preparazione CLF-C02',
    readinessBody: 'Usalo prima dellesame: due check vengono dalla cronologia, quattro sono conferme oneste. Espone gap; non garantisce il pass.',
    readinessCountLabel: 'check completati',
    readinessWrongEmpty: 'Fai prima un quiz; un pool vuoto conta solo dopo tentativi reali.',
    readinessAchievedLabel: 'Segnale pronto',
    readinessProgressLabel: 'Da lavorare',
    readinessMeasuredLabel: 'Misurato',
    readinessSelfCheckLabel: 'Auto-check',
    readinessActionMock: 'Fai mock timed',
    readinessActionWrongs: 'Rivedi errori',
    readinessActionMaster: 'Apri memory trainer',
    readinessActionPairs: 'Apri coppie confuse',
    readinessActionDrills: 'Avvia trigger drills',
    readinessActionOfficial: 'Apri guida AWS'
  },
  nl: {
    readinessGateBadge: 'Laatste readiness gate',
    readinessPillLabel: 'Klaar:',
    sourceMapBadge: 'Officiele bronnenkaart',
    sourceMapTitle: 'Waar deze gids op leunt.',
    sourceMapBody: 'Gebruik deze links als broncheck voor examendag. De app maakt recall-practice van de officiele scope; AWS docs blijven de waarheid.',
    officialStudyTitle: 'Bestudeer deze officiele ankers',
    officialAvoidTitle: 'Vermijd deze rabbit holes',
    readinessTitle: 'CLF-C02 readiness gate',
    readinessBody: 'Gebruik dit voor examendag: twee checks komen uit je historie, vier zijn eerlijke zelfchecks. Het toont gaten; het garandeert geen pass.',
    readinessCountLabel: 'checks klaar',
    readinessWrongEmpty: 'Start eerst een quiz; een lege foutenpool telt pas na echte pogingen.',
    readinessAchievedLabel: 'Klaar signaal',
    readinessProgressLabel: 'Nog werk',
    readinessMeasuredLabel: 'Gemeten',
    readinessSelfCheckLabel: 'Zelfcheck',
    readinessActionMock: 'Doe timed mock',
    readinessActionWrongs: 'Review fouten',
    readinessActionMaster: 'Open memory trainer',
    readinessActionPairs: 'Open verwarrende paren',
    readinessActionDrills: 'Start trigger drills',
    readinessActionOfficial: 'Open AWS guide'
  },
  hi: {
    readinessGateBadge: 'Final readiness gate',
    readinessPillLabel: 'Ready:',
    sourceMapBadge: 'Official source map',
    sourceMapTitle: 'Yeh guide kis par anchored hai.',
    sourceMapBody: 'Exam week se pehle in links se source check karein. App official scope ko recall practice banata hai; wording/services change ho to AWS docs truth hain.',
    officialStudyTitle: 'In official anchors ko study karein',
    officialAvoidTitle: 'In rabbit holes se bachein',
    readinessTitle: 'CLF-C02 Readiness Gate',
    readinessBody: 'Exam se pehle use karein: do checks history se measured hain, chaar honest self-checks hain. Gaps dikhata hai; pass guarantee nahi.',
    readinessCountLabel: 'checks complete',
    readinessWrongEmpty: 'Pehle quiz start karein; empty wrong pool real attempts ke baad hi meaningful hai.',
    readinessAchievedLabel: 'Ready signal',
    readinessProgressLabel: 'Needs work',
    readinessMeasuredLabel: 'Measured',
    readinessSelfCheckLabel: 'Self-check',
    readinessActionMock: 'Timed mock lein',
    readinessActionWrongs: 'Wrong answers review',
    readinessActionMaster: 'Memory trainer kholein',
    readinessActionPairs: 'Confusing pairs kholein',
    readinessActionDrills: 'Trigger drills start',
    readinessActionOfficial: 'AWS guide kholein'
  },
  ja: {
    readinessGateBadge: 'Final readiness gate',
    readinessPillLabel: 'Ready:',
    sourceMapBadge: 'Official source map',
    sourceMapTitle: 'この guide の根拠。',
    sourceMapBody: 'Exam week 前にこれらの links で source check してください。App は official scope を recall practice にします。wording/services が変わった場合は AWS docs が truth です。',
    officialStudyTitle: 'Study these official anchors',
    officialAvoidTitle: 'Avoid these rabbit holes',
    readinessTitle: 'CLF-C02 Readiness Gate',
    readinessBody: 'Exam day 前に使用します。2つは history で測定、4つは honest self-check です。gap を見つけるためのものです。pass guarantee ではありません。',
    readinessCountLabel: 'checks complete',
    readinessWrongEmpty: 'まず quiz を開始してください。empty wrong pool は real attempts 後に意味があります。',
    readinessAchievedLabel: 'Ready signal',
    readinessProgressLabel: 'Needs work',
    readinessMeasuredLabel: 'Measured',
    readinessSelfCheckLabel: 'Self-check',
    readinessActionMock: 'Timed mock を受ける',
    readinessActionWrongs: 'Wrong answers を review',
    readinessActionMaster: 'Memory trainer を開く',
    readinessActionPairs: 'Confusing pairs を開く',
    readinessActionDrills: 'Trigger drills を開始',
    readinessActionOfficial: 'AWS guide を開く'
  }
};

Object.entries(READINESS_GATE_COPY).forEach(([lang, copy]) => {
  I18N[lang] = { ...(I18N[lang] || {}), ...copy };
});

const LANGUAGE_SCOPE_COPY = {
  en: {
    stripLanguages: 'Interface language beta',
    languageBadge: 'Interface language beta',
    languageTitle: 'Multilingual interface support, English exam practice.',
    languageBody: 'Switch navigation, controls, and study guidance between English, Spanish, Portuguese, French, German, Italian, Dutch, Hindi, and Japanese. Practice questions, answer choices, explanations, and AWS service names intentionally stay in English to avoid misleading exam-term translations.',
    languageScopeInline: 'Use the language switch for support while studying, not as a localized exam translation.',
    languageHelper: 'Interface guidance changes language. Practice questions, answer choices, explanations, and AWS service names stay in English for exam consistency.',
    languageScopeBadge: 'Translation boundary',
    languageScopeTitle: 'Interface translations, English question bank.',
    languageScopeBody: 'Cloud Recall Lab translates navigation, controls, and study guidance. It does not translate practice questions, answer choices, rationales, or AWS service names because small translation errors can teach the wrong exam clue.',
    languageScopeCheck: 'If any translated UI label feels unclear, switch back to English and verify the concept against the current AWS exam guide or docs.',
    practiceModeHint: 'Practice checks single-answer questions instantly; multi-select uses Submit Choices. Timed mocks wait until final submit. Questions, answer choices, and explanations stay in English for exam wording consistency.',
    examModeHint: 'Timer is active. Answers are sealed until you submit. Questions stay in English for exam wording consistency.',
    languageToast: 'Language updated. The interface changed, but the question bank stays English for exam consistency.'
  },
  es: {
    stripLanguages: 'Interfaz beta',
    languageBadge: 'Idioma de interfaz beta',
    languageTitle: 'Interfaz multilingue, practica de examen en ingles.',
    languageBody: 'Cambia navegacion, controles y guia de estudio entre ingles, espanol, portugues, frances, aleman, italiano, neerlandes, hindi y japones. Las preguntas, opciones, explicaciones y nombres de servicios AWS quedan en ingles para evitar traducciones de terminos de examen que puedan confundir.',
    languageScopeInline: 'Usa el cambio de idioma como apoyo de estudio, no como traduccion localizada del examen.',
    languageHelper: 'La guia de la interfaz cambia de idioma. Preguntas, opciones, explicaciones y nombres de servicios AWS quedan en ingles para mantener consistencia con el examen.',
    languageScopeBadge: 'Limite de traduccion',
    languageScopeTitle: 'Interfaz traducida, banco de preguntas en ingles.',
    languageScopeBody: 'Cloud Recall Lab traduce navegacion, controles y guia de estudio. No traduce preguntas, opciones, razonamientos ni nombres de servicios AWS porque un error pequeno de traduccion puede ensenar una pista incorrecta.',
    languageScopeCheck: 'Si una etiqueta traducida no queda clara, vuelve a ingles y verifica el concepto con la guia o documentacion actual de AWS.',
    practiceModeHint: 'La practica corrige preguntas de una respuesta al instante; multi-select usa Submit Choices. Los mocks esperan hasta el envio final. Preguntas, opciones y explicaciones quedan en ingles.',
    examModeHint: 'El temporizador esta activo. Las respuestas quedan selladas hasta enviar. Las preguntas quedan en ingles para consistencia con el examen.',
    languageToast: 'Idioma actualizado. La interfaz cambio, pero el banco de preguntas queda en ingles.'
  },
  pt: {
    stripLanguages: 'Interface beta',
    languageBadge: 'Idioma da interface beta',
    languageTitle: 'Interface multilingue, pratica de exame em ingles.',
    languageBody: 'Troque navegacao, controles e guia de estudo entre ingles, espanhol, portugues, frances, alemao, italiano, holandes, hindi e japones. Perguntas, opcoes, explicacoes e nomes de servicos AWS ficam em ingles para evitar traducoes de termos de exame que possam confundir.',
    languageScopeInline: 'Use o seletor de idioma como apoio de estudo, nao como traducao localizada do exame.',
    languageHelper: 'A orientacao da interface muda de idioma. Perguntas, opcoes, explicacoes e nomes de servicos AWS ficam em ingles para consistencia com o exame.',
    languageScopeBadge: 'Limite de traducao',
    languageScopeTitle: 'Interface traduzida, banco de perguntas em ingles.',
    languageScopeBody: 'Cloud Recall Lab traduz navegacao, controles e guia de estudo. Nao traduz perguntas, opcoes, explicacoes detalhadas ou nomes de servicos AWS porque pequenos erros podem ensinar a pista errada.',
    languageScopeCheck: 'Se algum rotulo traduzido parecer confuso, volte para ingles e confira o conceito na guia ou docs atuais da AWS.',
    practiceModeHint: 'A pratica corrige perguntas de uma resposta na hora; multi-select usa Submit Choices. Simulados esperam ate o envio final. Perguntas, opcoes e explicacoes ficam em ingles.',
    examModeHint: 'O timer esta ativo. Respostas ficam ocultas ate enviar. Perguntas ficam em ingles para consistencia com o exame.',
    languageToast: 'Idioma atualizado. A interface mudou, mas o banco de perguntas fica em ingles.'
  },
  fr: {
    stripLanguages: 'Interface beta',
    languageBadge: 'Langue dinterface beta',
    languageTitle: 'Interface multilingue, pratique dexamen en anglais.',
    languageBody: 'Changez la navigation, les controles et laide detude entre anglais, espagnol, portugais, francais, allemand, italien, neerlandais, hindi et japonais. Les questions, choix, explications et noms de services AWS restent en anglais pour eviter des traductions de termes dexamen trompeuses.',
    languageScopeInline: 'Utilisez le changement de langue comme aide detude, pas comme traduction localisee de lexamen.',
    languageHelper: 'Laide dinterface change de langue. Les questions, choix, explications et noms de services AWS restent en anglais pour rester coherents avec lexamen.',
    languageScopeBadge: 'Limite de traduction',
    languageScopeTitle: 'Interface traduite, banque de questions en anglais.',
    languageScopeBody: 'Cloud Recall Lab traduit la navigation, les controles et laide detude. Il ne traduit pas les questions, choix, raisonnements ou noms de services AWS, car une petite erreur peut enseigner le mauvais indice dexamen.',
    languageScopeCheck: 'Si une etiquette traduite semble floue, revenez a langlais et verifiez le concept dans le guide ou les docs AWS actuels.',
    practiceModeHint: 'La pratique corrige les questions a reponse unique aussitot; multi-select utilise Submit Choices. Les mocks attendent la soumission finale. Questions, choix et explications restent en anglais.',
    examModeHint: 'Le minuteur est actif. Les reponses restent cachees jusqua soumission. Les questions restent en anglais pour la coherence dexamen.',
    languageToast: 'Langue mise a jour. Linterface a change, mais la banque de questions reste en anglais.'
  },
  de: {
    stripLanguages: 'Interface-Sprachen beta',
    languageBadge: 'Interface-Sprache beta',
    languageTitle: 'Mehrsprachiges Interface, englische Pruefungspraxis.',
    languageBody: 'Wechsle Navigation, Controls und Lernhinweise zwischen Englisch, Spanisch, Portugiesisch, Franzoesisch, Deutsch, Italienisch, Niederlaendisch, Hindi und Japanisch. Fragen, Antwortoptionen, Erklaerungen und AWS-Servicenamen bleiben bewusst Englisch, damit Pruefungsbegriffe nicht irrefuehrend uebersetzt werden.',
    languageScopeInline: 'Nutze die Sprachauswahl als Lernhilfe, nicht als lokalisierte Pruefungsuebersetzung.',
    languageHelper: 'Interface-Hinweise wechseln die Sprache. Fragen, Antwortoptionen, Erklaerungen und AWS-Servicenamen bleiben Englisch fuer Pruefungskonsistenz.',
    languageScopeBadge: 'Uebersetzungsgrenze',
    languageScopeTitle: 'Uebersetztes Interface, englische Fragenbank.',
    languageScopeBody: 'Cloud Recall Lab uebersetzt Navigation, Controls und Lernhinweise. Es uebersetzt keine Fragen, Antwortoptionen, Begruendungen oder AWS-Servicenamen, weil kleine Fehler den falschen Pruefungshinweis lehren koennen.',
    languageScopeCheck: 'Wenn ein uebersetztes UI-Label unklar wirkt, wechsle zu Englisch und pruefe den Begriff mit dem aktuellen AWS Exam Guide oder den Docs.',
    practiceModeHint: 'Praxis prueft Single-Answer-Fragen sofort; Multi-Select nutzt Submit Choices. Timed Mocks warten bis zur finalen Abgabe. Fragen, Optionen und Erklaerungen bleiben Englisch.',
    examModeHint: 'Der Timer laeuft. Antworten bleiben bis zur Abgabe verborgen. Fragen bleiben Englisch fuer konsistente Pruefungssprache.',
    languageToast: 'Sprache aktualisiert. Das Interface wechselte, aber die Fragenbank bleibt Englisch.'
  },
  it: {
    stripLanguages: 'Interfaccia beta',
    languageBadge: 'Lingua interfaccia beta',
    languageTitle: 'Interfaccia multilingue, pratica esame in inglese.',
    languageBody: 'Cambia navigazione, controlli e guida di studio tra inglese, spagnolo, portoghese, francese, tedesco, italiano, olandese, hindi e giapponese. Domande, opzioni, spiegazioni e nomi dei servizi AWS restano intenzionalmente in inglese per evitare traduzioni fuorvianti dei termini desame.',
    languageScopeInline: 'Usa il cambio lingua come supporto allo studio, non come traduzione localizzata dellesame.',
    languageHelper: 'La guida dellinterfaccia cambia lingua. Domande, opzioni, spiegazioni e nomi dei servizi AWS restano in inglese per coerenza con lesame.',
    languageScopeBadge: 'Limite traduzione',
    languageScopeTitle: 'Interfaccia tradotta, domande in inglese.',
    languageScopeBody: 'Cloud Recall Lab traduce navigazione, controlli e guida di studio. Non traduce domande, opzioni, razionali o nomi dei servizi AWS perche un piccolo errore puo insegnare lindizio sbagliato.',
    languageScopeCheck: 'Se una label tradotta non e chiara, torna allinglese e verifica il concetto nella guida o documentazione AWS attuale.',
    practiceModeHint: 'La pratica corregge subito le domande a risposta singola; multi-select usa Submit Choices. I mock aspettano linvio finale. Domande, opzioni e spiegazioni restano in inglese.',
    examModeHint: 'Il timer e attivo. Le risposte restano nascoste fino allinvio. Le domande restano in inglese per coerenza con lesame.',
    languageToast: 'Lingua aggiornata. Linterfaccia e cambiata, ma il banco domande resta in inglese.'
  },
  nl: {
    stripLanguages: 'Interface beta',
    languageBadge: 'Interfacetaal beta',
    languageTitle: 'Meertalige interface, Engelse examenpractice.',
    languageBody: 'Schakel navigatie, bediening en studie-uitleg tussen Engels, Spaans, Portugees, Frans, Duits, Italiaans, Nederlands, Hindi en Japans. Vragen, antwoordopties, uitleg en AWS-servicenamen blijven bewust Engels om misleidende vertalingen van examentermen te voorkomen.',
    languageScopeInline: 'Gebruik de taalkeuze als studiehulp, niet als gelokaliseerde examenvertaling.',
    languageHelper: 'Interface-uitleg verandert van taal. Vragen, antwoordopties, uitleg en AWS-servicenamen blijven Engels voor examenconsistentie.',
    languageScopeBadge: 'Vertaalgrens',
    languageScopeTitle: 'Vertaalde interface, Engelse vragenbank.',
    languageScopeBody: 'Cloud Recall Lab vertaalt navigatie, bediening en studie-uitleg. Het vertaalt geen vragen, antwoordopties, redeneringen of AWS-servicenamen, omdat kleine vertaalfouten de verkeerde examenhint kunnen leren.',
    languageScopeCheck: 'Als een vertaald UI-label onduidelijk voelt, schakel terug naar Engels en controleer het concept in de actuele AWS exam guide of docs.',
    practiceModeHint: 'Oefenen controleert single-answer vragen meteen; multi-select gebruikt Submit Choices. Getimede mocks wachten tot definitieve indiening. Vragen, opties en uitleg blijven Engels.',
    examModeHint: 'De timer loopt. Antwoorden blijven verborgen tot je indient. Vragen blijven Engels voor consistente examentaal.',
    languageToast: 'Taal bijgewerkt. De interface veranderde, maar de vragenbank blijft Engels.'
  },
  hi: {
    stripLanguages: 'Interface language beta',
    languageBadge: 'Interface language beta',
    languageTitle: 'Multilingual interface support, English exam practice.',
    languageBody: 'Navigation, controls, aur study guidance language change hoti hai. Practice questions, answer choices, explanations, aur AWS service names jaan-boojhkar English me rehte hain taaki exam terms galat translate na ho.',
    languageScopeInline: 'Language switch study support ke liye use karein, localized exam translation samajhkar nahi.',
    languageHelper: 'Interface guidance language change karti hai. Questions, answer choices, explanations, aur AWS service names exam consistency ke liye English me rehte hain.',
    languageScopeBadge: 'Translation boundary',
    languageScopeTitle: 'Interface translations, English question bank.',
    languageScopeBody: 'Cloud Recall Lab navigation, controls, aur study guidance translate karta hai. Practice questions, choices, rationales, ya AWS service names translate nahi karta, kyunki chhota translation error wrong exam clue sikha sakta hai.',
    languageScopeCheck: 'Agar translated UI label unclear lage, English par wapas switch karein aur current AWS exam guide/docs se concept verify karein.',
    practiceModeHint: 'Practice single-answer questions turant check karta hai; multi-select Submit Choices use karta hai. Timed mocks final submit tak wait karte hain. Questions, choices, aur explanations English me rehte hain.',
    examModeHint: 'Timer active hai. Answers final submit tak hidden hain. Questions exam wording consistency ke liye English me rehte hain.',
    languageToast: 'Language updated. Interface change hui, par question bank English me rehta hai.'
  },
  ja: {
    stripLanguages: 'Interface language beta',
    languageBadge: 'Interface language beta',
    languageTitle: 'Multilingual interface support, English exam practice.',
    languageBody: 'Navigation, controls, and study guidance can switch languages. Practice questions, answer choices, explanations, and AWS service names intentionally stay English to avoid misleading exam-term translations.',
    languageScopeInline: 'Use the language switch for study support, not as a localized exam translation.',
    languageHelper: 'Interface guidance changes language. Questions, answer choices, explanations, and AWS service names stay in English for exam consistency.',
    languageScopeBadge: 'Translation boundary',
    languageScopeTitle: 'Interface translations, English question bank.',
    languageScopeBody: 'Cloud Recall Lab translates navigation, controls, and study guidance. It does not translate practice questions, answer choices, rationales, or AWS service names because small translation errors can teach the wrong exam clue.',
    languageScopeCheck: 'If any translated UI label feels unclear, switch back to English and verify the concept against the current AWS exam guide or docs.',
    practiceModeHint: 'Practice checks single-answer questions instantly; multi-select uses Submit Choices. Timed mocks wait until final submit. Questions, answer choices, and explanations stay in English for exam wording consistency.',
    examModeHint: 'Timer is active. Answers are sealed until you submit. Questions stay in English for exam wording consistency.',
    languageToast: 'Language updated. The interface changed, but the question bank stays English for exam consistency.'
  }
};

Object.entries(LANGUAGE_SCOPE_COPY).forEach(([lang, copy]) => {
  I18N[lang] = { ...(I18N[lang] || {}), ...copy };
});

const EXAM_LABELS = {
  random: 'Comprehensive Mock',
  mock1: 'Practice Mock Exam 1',
  mock2: 'Practice Mock Exam 2',
  mock3: 'Mock Exam 3 - Final Drill',
  final: 'Final Pressure Test',
  readiness: 'Ultimate Readiness Exam'
};

const SERVERLESS_SERVICE_NAMES = new Set([
  'Lambda',
  'Fargate',
  'DynamoDB',
  'Aurora Serverless v2',
  'Athena',
  'Glue',
  'Redshift Serverless',
  'OpenSearch Serverless',
  'Data Firehose',
  'API Gateway',
  'AppSync',
  'SQS',
  'SNS',
  'EventBridge',
  'Step Functions',
  'S3',
  'QuickSight',
  'Cognito',
  'Comprehend',
  'Rekognition',
  'Textract',
  'Translate',
  'Polly',
  'Transcribe',
  'Kendra',
  'Lex',
  'Amazon Q',
  'Connect',
  'SES',
  'Amplify'
]);

const SERVERLESS_STUDY_GROUPS = [
  {
    title: 'Compute',
    takeaway: 'Run code or containers without managing servers.',
    services: ['Lambda', 'Fargate']
  },
  {
    title: 'APIs and app front doors',
    takeaway: 'Expose HTTP, REST, WebSocket, or GraphQL endpoints without managing API servers.',
    services: ['API Gateway', 'AppSync', 'Cognito']
  },
  {
    title: 'Data and analytics',
    takeaway: 'Store, query, transform, deliver, and visualize data with managed scaling.',
    services: ['S3', 'DynamoDB', 'Aurora Serverless v2', 'Athena', 'Glue', 'Data Firehose', 'Redshift Serverless', 'OpenSearch Serverless', 'QuickSight']
  },
  {
    title: 'Integration',
    takeaway: 'Decouple applications, route events, and coordinate workflows.',
    services: ['SQS', 'SNS', 'EventBridge', 'Step Functions']
  },
  {
    title: 'AI and managed app services',
    takeaway: 'Use managed AI, messaging, contact center, and front-end app capabilities without operating service infrastructure.',
    services: ['Comprehend', 'Rekognition', 'Textract', 'Translate', 'Polly', 'Transcribe', 'Kendra', 'Lex', 'Amazon Q', 'Connect', 'SES', 'Amplify']
  }
];

const DEFAULT_READINESS = {
  masterMemory: false,
  confusingPairs: false,
  triggerDrills: false,
  officialQs: false
};

function getDefaultStats() {
  return {
    examsTaken: 0,
    examScores: [],
    totalAnswersCount: 0,
    correctAnswersCount: 0
  };
}

function getDefaultProgress() {
  return {
    examHistory: [],
    questionStats: {},
    dailyActivity: {}
  };
}

function safeParseStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return structuredCloneSafe(fallback);
    return JSON.parse(raw);
  } catch (error) {
    console.warn(`Resetting unreadable storage key: ${key}`, error);
    try {
      localStorage.removeItem(key);
    } catch (_) {
      // Ignore localStorage access failures.
    }
    return structuredCloneSafe(fallback);
  }
}

function safeSetStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.warn(`Could not save storage key: ${key}`, error);
    showToast('Progress could not be saved in this browser. Export any important work now.', 'warning');
    return false;
  }
}

function safeRemoveStorage(key) {
  try {
    localStorage.removeItem(key);
  } catch (_) {
    // Ignore localStorage access failures.
  }
}

function structuredCloneSafe(value) {
  return JSON.parse(JSON.stringify(value));
}

function normalizeStats(raw) {
  const defaults = getDefaultStats();
  const stats = { ...defaults, ...(raw && typeof raw === 'object' ? raw : {}) };
  stats.examScores = Array.isArray(stats.examScores)
    ? stats.examScores.map(Number).filter(Number.isFinite)
    : [];
  stats.examsTaken = Number(stats.examsTaken) || stats.examScores.length || 0;
  stats.totalAnswersCount = Number(stats.totalAnswersCount) || 0;
  stats.correctAnswersCount = Number(stats.correctAnswersCount) || 0;
  return stats;
}

function normalizeProgress(raw) {
  const defaults = getDefaultProgress();
  const progress = { ...defaults, ...(raw && typeof raw === 'object' ? raw : {}) };
  progress.examHistory = Array.isArray(progress.examHistory) ? progress.examHistory : [];
  progress.questionStats = progress.questionStats && typeof progress.questionStats === 'object'
    ? progress.questionStats
    : {};
  progress.dailyActivity = progress.dailyActivity && typeof progress.dailyActivity === 'object'
    ? progress.dailyActivity
    : {};
  return progress;
}

function normalizeReadiness(raw) {
  return { ...DEFAULT_READINESS, ...(raw && typeof raw === 'object' ? raw : {}) };
}

function normalizeIdList(raw) {
  if (!Array.isArray(raw)) return [];
  return [...new Set(raw.map(Number).filter(Number.isFinite))];
}

function getTodayKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

function recordDailyActivity({ questions = 0, correct = 0, seconds = 0 } = {}) {
  if (!state.progress) state.progress = getDefaultProgress();
  const key = getTodayKey();
  const current = state.progress.dailyActivity[key] || { questionsAnswered: 0, correctAnswers: 0, timeSpent: 0 };
  state.progress.dailyActivity[key] = {
    questionsAnswered: current.questionsAnswered + questions,
    correctAnswers: current.correctAnswers + correct,
    timeSpent: current.timeSpent + seconds
  };
}

function getQuestionSection(q) {
  if (q && q.section) return Number(q.section);
  const found = findQuestionById(q && q.id);
  return found && found.section ? Number(found.section) : null;
}

function recordQuestionProgress(q, isCorrect) {
  if (!q || typeof q.id === 'undefined') return;
  if (!state.progress) state.progress = getDefaultProgress();
  const id = String(q.id);
  const existing = state.progress.questionStats[id] || {
    total: 0,
    correct: 0,
    section: getQuestionSection(q),
    lastAnsweredAt: null
  };
  existing.total += 1;
  if (isCorrect) existing.correct += 1;
  existing.section = getQuestionSection(q) || existing.section;
  existing.lastAnsweredAt = new Date().toISOString();
  state.progress.questionStats[id] = existing;
  recordDailyActivity({ questions: 1, correct: isCorrect ? 1 : 0 });
}

function getSectionProgress(sectionId) {
  const sectionQuestions = QUESTIONS.filter(q => Number(q.section) === Number(sectionId));
  const sectionIds = new Set(sectionQuestions.map(q => String(q.id)));
  const stats = Object.entries(state.progress.questionStats || {})
    .filter(([id, item]) => sectionIds.has(id) || Number(item.section) === Number(sectionId))
    .map(([, item]) => item);

  const totals = stats.reduce((acc, item) => {
    acc.total += Number(item.total) || 0;
    acc.correct += Number(item.correct) || 0;
    return acc;
  }, { total: 0, correct: 0 });

  const practiced = stats.filter(item => Number(item.total) > 0).length;
  const accuracy = totals.total > 0 ? Math.round((totals.correct / totals.total) * 100) : 0;
  const progress = sectionQuestions.length > 0 ? Math.min(100, Math.round((practiced / sectionQuestions.length) * 100)) : 0;

  return {
    practiced,
    totalQuestions: sectionQuestions.length,
    totalAttempts: totals.total,
    correctAttempts: totals.correct,
    accuracy,
    progress
  };
}

function getExamLabel(examType = state.currentExamType) {
  return EXAM_LABELS[examType] || 'Practice Mock Exam';
}

function getPassTargetLabel(examType = state.currentExamType) {
  if (examType === 'mock1' || examType === 'mock2') return 'Target: 40 Qs';
  if (examType === 'mock3') return 'Target: 45 Qs';
  if (examType === 'final') return 'Target: 35 Qs (70%)';
  if (examType === 'readiness') return 'Target: 52 Qs (80%)';
  return 'Target: 70%';
}

function getCurrentSiteUrl() {
  if (window.location.protocol === 'file:') {
    return 'https://github.com/josephhauter';
  }
  return window.location.href.split('#')[0];
}

function getStoredLanguage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.language);
    return SUPPORTED_LANGUAGES[raw] ? raw : 'en';
  } catch (_) {
    return 'en';
  }
}

function saveLanguage(lang) {
  try {
    localStorage.setItem(STORAGE_KEYS.language, lang);
  } catch (_) {
    // Language choice is helpful, not critical.
  }
}

function copyForLanguage(lang = state.language) {
  const safeLang = SUPPORTED_LANGUAGES[lang] ? lang : 'en';
  return { ...I18N.en, ...(I18N[safeLang] || {}) };
}

function formatCopy(template, replacements = {}) {
  return String(template).replace(/\{(\w+)\}/g, (_, key) => {
    return Object.prototype.hasOwnProperty.call(replacements, key)
      ? String(replacements[key])
      : `{${key}}`;
  });
}

function t(key, replacements = {}) {
  const copy = copyForLanguage();
  return formatCopy(copy[key] || I18N.en[key] || key, replacements);
}

function markExamWording(el) {
  if (!el) return;
  el.lang = 'en';
  el.setAttribute('translate', 'no');
}

function applyLanguage(lang = 'en') {
  const safeLang = SUPPORTED_LANGUAGES[lang] ? lang : 'en';
  const copy = copyForLanguage(safeLang);
  state.language = safeLang;
  document.documentElement.lang = SUPPORTED_LANGUAGES[safeLang].htmlLang;

  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (copy[key]) el.textContent = copy[key];
  });

  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (copy[key]) el.setAttribute('placeholder', copy[key]);
  });

  document.querySelectorAll('[data-i18n-aria-label]').forEach(el => {
    const key = el.getAttribute('data-i18n-aria-label');
    if (copy[key]) el.setAttribute('aria-label', copy[key]);
  });

  document.querySelectorAll('#language-select, #settings-language-select').forEach(select => {
    select.value = safeLang;
  });
}

function refreshLocalizedDynamicContent() {
  renderReadinessDashboard();
  if (state.currentView === 'study-view') {
    renderGuideConcepts();
    renderGuideResponsibility();
    renderGuideDirectory(document.getElementById('guide-search-input')?.value.trim() || '');
    renderGuideServerless();
    renderGuideTraps();
    renderGuidePairs(document.getElementById('pairs-search-input')?.value.trim() || '');
    renderGuideStrategy();
    renderGuidePassPlan();
  }
  updateStudyPlanSelection(document.querySelector('.select-plan-btn.active'));
}

function setLanguage(lang, showNotice = true) {
  const safeLang = SUPPORTED_LANGUAGES[lang] ? lang : 'en';
  saveLanguage(safeLang);
  applyLanguage(safeLang);
  refreshLocalizedDynamicContent();
  if (showNotice) {
    showToast(t('languageToast'), 'success');
  }
}

function initLanguageSupport() {
  const storedLanguage = getStoredLanguage();
  applyLanguage(storedLanguage);
  document.querySelectorAll('#language-select, #settings-language-select').forEach(select => {
    select.addEventListener('change', event => setLanguage(event.target.value));
  });
}

// Shuffles an array in place
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// Format seconds into MM:SS or HH:MM:SS
function formatTime(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  
  if (h > 0) {
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

// Display Views
function showView(viewId) {
  state.currentView = viewId;
  document.querySelectorAll('.view-container').forEach(el => el.classList.remove('active'));
  const view = document.getElementById(viewId);
  view.classList.add('active');
  window.scrollTo(0, 0);

  const focusTarget = view.querySelector('h1, h2, [tabindex="-1"]') || document.getElementById('main-content');
  if (focusTarget) {
    focusTarget.setAttribute('tabindex', '-1');
    focusTarget.focus({ preventScroll: true });
  }
}

// Toast System
function showToast(message, type = 'info') {
  const toast = document.getElementById('toast');
  if (!toast) return;
  const safeType = ['success', 'error', 'warning', 'info'].includes(type) ? type : 'info';
  toast.className = `toast toast-${safeType}`;
  toast.innerHTML = `${ICONS.alert} <span>${escapeHtml(message)}</span>`;
  toast.classList.add('active');
  
  setTimeout(() => {
    toast.classList.remove('active');
  }, 3000);
}

// Save/Load Persistent Data
function loadData() {
  state.stats = normalizeStats(safeParseStorage(STORAGE_KEYS.stats, getDefaultStats()));
  state.wrongAnswers = normalizeIdList(safeParseStorage(STORAGE_KEYS.wrong, []));
  state.wrongAnswerRules = safeParseStorage(STORAGE_KEYS.wrongRules, {});
  state.readinessSelfChecked = normalizeReadiness(safeParseStorage(STORAGE_KEYS.readiness, DEFAULT_READINESS));
  state.progress = normalizeProgress(safeParseStorage(STORAGE_KEYS.progress, getDefaultProgress()));
}

function saveData() {
  safeSetStorage(STORAGE_KEYS.stats, normalizeStats(state.stats));
  safeSetStorage(STORAGE_KEYS.wrong, normalizeIdList(state.wrongAnswers));
  safeSetStorage(STORAGE_KEYS.wrongRules, state.wrongAnswerRules || {});
  safeSetStorage(STORAGE_KEYS.readiness, normalizeReadiness(state.readinessSelfChecked));
  safeSetStorage(STORAGE_KEYS.progress, normalizeProgress(state.progress));
}

// Update Dashboard Statistics Display
function updateDashboardStats() {
  loadData();
  
  // Total solved count
  document.getElementById('stat-total-solved').innerText = state.stats.totalAnswersCount;
  
  // Correct answers accuracy
  const accuracy = state.stats.totalAnswersCount > 0 
    ? Math.round((state.stats.correctAnswersCount / state.stats.totalAnswersCount) * 100) 
    : 0;
  document.getElementById('stat-accuracy').innerText = `${accuracy}%`;
  
  // Average exam score
  const avgExam = state.stats.examScores.length > 0
    ? Math.round(state.stats.examScores.reduce((a, b) => a + b, 0) / state.stats.examScores.length)
    : 0;
  document.getElementById('stat-avg-exam').innerText = `${avgExam}%`;
  renderReadinessDashboard();
  
  // Wrong answers count
  const wrongCount = state.wrongAnswers.length;
  document.getElementById('wrong-count-badge').innerText = `${wrongCount} questions`;
  
  // Toggle the wrong answers practice button
  const reviewBtn = document.getElementById('btn-start-review');
  if (wrongCount === 0) {
    reviewBtn.classList.add('btn-disabled');
    reviewBtn.disabled = true;
  } else {
    reviewBtn.classList.remove('btn-disabled');
    reviewBtn.disabled = false;
  }

  // Set individual section progress items
  for (let sId = 1; sId <= 5; sId++) {
    const secQCount = QUESTIONS.filter(q => q.section === sId).length;
    const sectionProgress = getSectionProgress(sId);
    document.getElementById(`sec-count-${sId}`).innerText =
      `${sectionProgress.practiced}/${secQCount} practiced - ${sectionProgress.accuracy}%`;
  }

  if (state.currentView === 'history-view') {
    renderHistoryView();
  }
}

// Render the Practice Player
function startPractice(sectionId) {
  state.currentMode = 'practice';
  state.currentSection = sectionId;
  state.currentQuestionIndex = 0;
  state.userAnswers = {};
  state.submittedQuestions = new Set();
  state.markedQuestions = new Set();
  
  let list = [];
  if (sectionId === 'review') {
    // Load incorrect questions from ALL pools (section practice + mock exams + Final Pressure Test)
    const all = getAllQuestions();
    list = all.filter(q => state.wrongAnswers.includes(q.id));
    if (list.length === 0) {
      showToast("No wrong answers left to review!");
      return;
    }
  } else {
    // Filter questions by section ID
    list = QUESTIONS.filter(q => q.section === parseInt(sectionId));
  }
  
  // Shuffle practice questions AND dynamically shuffle options to guarantee active recall
  state.questionsList = shuffleArray([...list]).map(q => shuffleQuestionOptions(q));
  
  // Update header title
  const titleEl = document.getElementById('practice-title');
  if (sectionId === 'review') {
    titleEl.innerText = "Review Session (Day 7 Focus)";
  } else {
    titleEl.innerText = SECTIONS[sectionId].title;
  }
  
  showView('practice-view');
  renderPracticeQuestion();
}

function renderPracticeQuestion() {
  const idx = state.currentQuestionIndex;
  const q = state.questionsList[idx];

  // Progress Bar
  const percent = ((idx) / state.questionsList.length) * 100;
  document.getElementById('practice-progress-bar').style.width = `${percent}%`;
  document.getElementById('practice-progress-text').innerText = `Question ${idx + 1} of ${state.questionsList.length}`;

  const isMulti = !!q.isMulti;
  const userAns = state.userAnswers[idx];
  // A question is "answered" (locked + graded) only after the user explicitly
  // submitted it. While selecting multi-select options, userAns holds the in-progress
  // selection array but the question is NOT yet answered. This prevents the bug where
  // clicking the first multi-select option immediately locked all options and graded
  // the partial selection as wrong.
  const answered = state.submittedQuestions.has(idx);

  // Question text
  const multiHint = isMulti
    ? `<span style="display:block; font-size:0.85rem; color:var(--warning); margin-top:0.5rem; font-weight:700;">⚠️ Choose exactly ${q.multiCount} answers.</span>`
    : '';
  const qBox = document.getElementById('practice-question-box');
  markExamWording(qBox);
  qBox.innerHTML = `
    <div class="question-number">Question ${idx + 1} (ID #${q.id})</div>
    <div class="question-text">${escapeHtml(q.question)}${multiHint}</div>
    <div class="options-list" id="practice-options"></div>
  `;

  const optionsList = document.getElementById('practice-options');
  const correctLetters = isMulti ? q.answer.split(',') : [q.answer];

  q.options.forEach((opt, oIdx) => {
    const letter = String.fromCharCode(65 + oIdx); // A, B, C, D
    const btn = document.createElement('button');
    btn.className = 'option-btn';

    if (answered) {
      btn.disabled = true;
      const userLetters = Array.isArray(userAns) ? userAns : (userAns ? [userAns] : []);
      const isLetterCorrect = correctLetters.includes(letter);
      const isLetterSelected = userLetters.includes(letter);
      if (isLetterCorrect) {
        btn.classList.add('correct');
      } else if (isLetterSelected) {
        btn.classList.add('incorrect');
      } else {
        btn.classList.add('muted');
      }
    } else if (isMulti) {
      const selections = Array.isArray(userAns) ? userAns : [];
      if (selections.includes(letter)) btn.classList.add('selected');
      btn.addEventListener('click', () => {
        let sel = Array.isArray(state.userAnswers[idx]) ? [...state.userAnswers[idx]] : [];
        if (sel.includes(letter)) {
          sel = sel.filter(l => l !== letter);
        } else {
          if (sel.length >= q.multiCount) sel.shift();
          sel.push(letter);
        }
        state.userAnswers[idx] = sel;
        renderPracticeQuestion();
      });
    } else {
      btn.addEventListener('click', () => submitPracticeAnswer(letter));
    }
    btn.innerHTML = `<span class="option-letter">${letter}</span> <span class="option-text"></span>`;
    btn.querySelector('.option-text').textContent = opt;
    optionsList.appendChild(btn);
  });

  // Multi-select submit control
  if (isMulti && !answered) {
    const selections = Array.isArray(userAns) ? userAns : [];
    const submitBtn = document.createElement('button');
    submitBtn.className = 'btn btn-primary';
    submitBtn.style.marginTop = '1rem';
    submitBtn.style.width = '100%';
    submitBtn.innerText = `Submit Choices (${selections.length}/${q.multiCount})`;
    submitBtn.disabled = selections.length !== q.multiCount;
    submitBtn.addEventListener('click', () => submitPracticeAnswer(state.userAnswers[idx]));
    qBox.appendChild(submitBtn);
  }

  // Explanation panel — with per-option "why wrong / why right" breakdown
  const explanationBox = document.getElementById('practice-explanation');
  markExamWording(explanationBox);
  if (answered) {
    const isCorrect = isMulti
      ? (Array.isArray(userAns) && [...userAns].sort().join(',') === q.answer)
      : userAns === q.answer;
    explanationBox.className = `explanation-box active ${isCorrect ? '' : 'incorrect-explanation'}`;
    explanationBox.innerHTML = `
      <div class="explanation-header ${isCorrect ? 'correct-text' : 'incorrect-text'}">
        ${isCorrect ? ICONS.check : ICONS.x} ${isCorrect ? 'Correct Answer' : 'Incorrect Answer'} (Correct: ${escapeHtml(q.answer)})
      </div>
      <div class="explanation-text">${escapeHtml(q.explanation)}</div>
      ${buildOptionRationaleHtml(q, userAns)}
    `;
    document.getElementById('practice-next-btn').style.display = 'inline-flex';
  } else {
    explanationBox.classList.remove('active');
    document.getElementById('practice-next-btn').style.display = 'none';
  }

  // Back button visibility
  const prevBtn = document.getElementById('practice-prev-btn');
  if (idx > 0) {
    prevBtn.style.display = 'inline-flex';
  } else {
    prevBtn.style.display = 'none';
  }
}

// Build an annotated breakdown of every option: why each wrong option is wrong,
// and why each correct option is right. Uses optional `rationale` array aligned to
// options. Falls back to a short label when rationale data isn't provided.
function buildOptionRationaleHtml(q, userAns) {
  const isMulti = !!q.isMulti;
  const correctLetters = isMulti ? q.answer.split(',') : [q.answer];
  const userLetters = Array.isArray(userAns) ? userAns : (userAns ? [userAns] : []);

  const rows = q.options.map((opt, oIdx) => {
    const letter = String.fromCharCode(65 + oIdx);
    const isCorrect = correctLetters.includes(letter);
    const isSelected = userLetters.includes(letter);
    const reason = (q.rationale && q.rationale[oIdx]) ? q.rationale[oIdx] : '';

    let iconHtml, color, label, text;
    if (isCorrect) {
      iconHtml = ICONS.check;
      color = 'var(--success)';
      label = 'Correct';
      text = reason || q.explanation;
    } else if (isSelected) {
      iconHtml = ICONS.x;
      color = 'var(--error)';
      label = 'Your choice — wrong';
      text = reason || 'Not the best fit for this scenario.';
    } else {
      iconHtml = '';
      color = 'var(--text-muted)';
      label = 'Distractor';
      text = reason;
    }
    if (!text) return ''; // skip undecorated distractors to keep it scannable
    return `
      <div class="rationale-row" style="display:flex; gap:0.6rem; padding:0.5rem 0; border-top:1px solid var(--card-border); align-items:flex-start;">
        <span style="color:${color}; flex-shrink:0; display:flex; align-items:center; height:1.2rem;">${iconHtml}</span>
        <span style="flex-grow:1; font-size:0.82rem; line-height:1.5;">
          <strong style="color:${color};">${letter}.</strong> <span style="color:var(--text-primary);">${escapeHtml(opt)}</span>
          <span style="color:${color}; font-weight:700; margin-left:0.4rem;">${escapeHtml(label)}</span>
          <span style="display:block; color:var(--text-secondary); margin-top:0.15rem;">${escapeHtml(text)}</span>
        </span>
      </div>`;
  }).join('');

  return rows ? `<div class="rationale-block" style="margin-top:0.5rem;">${rows}</div>` : '';
}

function submitPracticeAnswer(answer) {
  const idx = state.currentQuestionIndex;
  const q = state.questionsList[idx];

  state.userAnswers[idx] = answer;
  if (!state.submittedQuestions) state.submittedQuestions = new Set();
  state.submittedQuestions.add(idx);

  const isMulti = !!q.isMulti;
  const isCorrect = isMulti
    ? (Array.isArray(answer) && [...answer].sort().join(',') === q.answer)
    : answer === q.answer;

  // Update overall stats
  state.stats.totalAnswersCount++;
  if (isCorrect) {
    state.stats.correctAnswersCount++;
    // Remove from wrong answers list if it was there
    state.wrongAnswers = state.wrongAnswers.filter(id => id !== q.id);
  } else {
    // Add to wrong answers list if not already present
    if (!state.wrongAnswers.includes(q.id)) {
      state.wrongAnswers.push(q.id);
    }
  }
  recordQuestionProgress(q, isCorrect);

  saveData();
  updateDashboardStats();
  renderPracticeQuestion();
}

// Render the Timed Mock Exam Player
function startExam(examType = 'random') {
  closeExitDialog();
  state.currentMode = 'exam';
  state.currentExamType = examType;
  state.currentQuestionIndex = 0;
  state.userAnswers = {};
  state.markedQuestions = new Set();
  state.examSubmitted = false;
  state.examStartedAt = Date.now();
  
  let list = [];
  if (examType === 'mock1') {
    list = prepareBalancedMockPool(MOCK_EXAM_1, 50);
    state.examTimeRemaining = 70 * 60; // 70 mins
  } else if (examType === 'mock2') {
    list = prepareBalancedMockPool(MOCK_EXAM_2, 50);
    state.examTimeRemaining = 70 * 60; // 70 mins
  } else if (examType === 'mock3') {
    list = [...MOCK_EXAM_3];
    state.examTimeRemaining = 90 * 60; // 90 mins
  } else if (examType === 'final') {
    list = [...FINAL_PRESSURE_TEST];
    state.examTimeRemaining = 90 * 60; // 90 mins
  } else if (examType === 'readiness') {
    list = [...FINAL_READINESS_EXAM];
    state.examTimeRemaining = 90 * 60; // 90 mins
  } else {
    list = prepareComprehensiveMockPool(65);
    state.examTimeRemaining = 90 * 60; // 90 mins
  }
  state.examDurationSeconds = state.examTimeRemaining;
  
  // Shuffle questions AND dynamically shuffle option choices to guarantee active recall
  state.questionsList = shuffleArray([...list]).map(q => shuffleQuestionOptions(q));
  
  // Set exam title text dynamically
  const examTitleText = document.querySelector('#exam-view .quiz-title-text');
  if (examTitleText) {
    examTitleText.innerText = getExamLabel(examType);
  }

  // Reset Timer
  document.getElementById('exam-timer').innerText = formatTime(state.examTimeRemaining);
  clearInterval(state.timerInterval);
  state.timerInterval = setInterval(() => {
    state.examTimeRemaining--;
    document.getElementById('exam-timer').innerText = formatTime(state.examTimeRemaining);
    
    // Warning state when timer is low (less than 5 mins)
    if (state.examTimeRemaining <= 300) {
      document.getElementById('exam-timer').style.color = 'var(--error)';
    } else {
      document.getElementById('exam-timer').style.color = '';
    }
    
    if (state.examTimeRemaining <= 0) {
      clearInterval(state.timerInterval);
      showToast("Time's up! Submitting your exam.");
      submitExam();
    }
  }, 1000);
  
  // Render Sidebar
  renderExamSidebar();
  
  showView('exam-view');
  renderExamQuestion();
}

function renderExamSidebar() {
  const grid = document.getElementById('exam-sidebar-grid');
  grid.innerHTML = '';
  
  state.questionsList.forEach((_, idx) => {
    const item = document.createElement('div');
    item.className = 'grid-item';
    item.innerText = idx + 1;
    
    // Classes based on state
    if (idx === state.currentQuestionIndex) item.classList.add('active');
    
    const q = state.questionsList[idx];
    const userAns = state.userAnswers[idx];
    const isAnswered = q.isMulti 
      ? (Array.isArray(userAns) && userAns.length === q.multiCount)
      : !!userAns;
      
    if (isAnswered) item.classList.add('answered');
    if (state.markedQuestions.has(idx)) item.classList.add('flagged');
    
    item.addEventListener('click', () => {
      state.currentQuestionIndex = idx;
      renderExamQuestion();
      renderExamSidebar();
    });
    
    grid.appendChild(item);
  });
}

function renderExamQuestion() {
  const idx = state.currentQuestionIndex;
  const q = state.questionsList[idx];
  
  // Question box
  const qBox = document.getElementById('exam-question-box');
  markExamWording(qBox);
  const multiText = q.isMulti ? `<span style="display:block; font-size:0.85rem; color:var(--warning); margin-top:0.5rem; font-weight:700;">⚠️ Choose exactly ${q.multiCount} options.</span>` : '';
  
  qBox.innerHTML = `
    <div class="question-number">Question ${idx + 1} of ${state.questionsList.length}</div>
    <div class="question-text">${escapeHtml(q.question)}${multiText}</div>
    <div class="options-list" id="exam-options"></div>
  `;
  
  const optionsList = document.getElementById('exam-options');
  const userAns = state.userAnswers[idx];
  
  q.options.forEach((opt, oIdx) => {
    const letter = String.fromCharCode(65 + oIdx);
    const btn = document.createElement('button');
    btn.className = 'option-btn';
    
    if (q.isMulti) {
      if (Array.isArray(userAns) && userAns.includes(letter)) {
        btn.classList.add('selected');
      }
    } else {
      if (userAns === letter) {
        btn.classList.add('selected');
      }
    }
    
    btn.innerHTML = `<span class="option-letter">${letter}</span> <span class="option-text"></span>`;
    btn.querySelector('.option-text').textContent = opt;
    btn.addEventListener('click', () => {
      if (q.isMulti) {
        let currentSelections = Array.isArray(state.userAnswers[idx]) ? [...state.userAnswers[idx]] : [];
        if (currentSelections.includes(letter)) {
          // Deselect
          currentSelections = currentSelections.filter(l => l !== letter);
        } else {
          // Select
          if (currentSelections.length >= q.multiCount) {
            currentSelections.shift();
          }
          currentSelections.push(letter);
        }
        state.userAnswers[idx] = currentSelections;
      } else {
        state.userAnswers[idx] = letter;
      }
      renderExamQuestion();
      renderExamSidebar();
    });
    optionsList.appendChild(btn);
  });
  
  // Update flag button state
  const flagBtn = document.getElementById('exam-flag-btn');
  if (state.markedQuestions.has(idx)) {
    flagBtn.classList.add('btn-warning');
    flagBtn.classList.remove('btn-secondary');
    flagBtn.innerHTML = `${ICONS.flag} Flagged`;
  } else {
    flagBtn.classList.remove('btn-warning');
    btnSecondaryClass(flagBtn);
  }
  
  // Prev/Next Navigation
  document.getElementById('exam-prev-btn').style.display = idx > 0 ? 'inline-flex' : 'none';
  document.getElementById('exam-next-btn').innerText = idx === state.questionsList.length - 1 ? 'Finish' : 'Next';
}

function btnSecondaryClass(btn) {
  btn.className = 'btn btn-secondary';
  btn.innerHTML = `${ICONS.flag} Mark for Review`;
}

function toggleExamFlag() {
  const idx = state.currentQuestionIndex;
  if (state.markedQuestions.has(idx)) {
    state.markedQuestions.delete(idx);
  } else {
    state.markedQuestions.add(idx);
  }
  renderExamQuestion();
  renderExamSidebar();
}

function resetExamSessionState() {
  clearInterval(state.timerInterval);
  state.timerInterval = null;
  state.currentMode = null;
  state.currentExamType = 'random';
  state.currentQuestionIndex = 0;
  state.questionsList = [];
  state.userAnswers = {};
  state.markedQuestions = new Set();
  state.examStartedAt = null;
  state.examSubmitted = false;
  state.examTimeRemaining = 90 * 60;
  state.examDurationSeconds = 90 * 60;
}

function exitExamEarly() {
  if (state.currentMode !== 'exam') {
    updateDashboardStats();
    showView('dashboard');
    return;
  }
  document.getElementById('confirm-exit-dialog').classList.add('active');
}

function closeExitDialog() {
  document.getElementById('confirm-exit-dialog').classList.remove('active');
}

function confirmExitExam() {
  resetExamSessionState();
  closeExitDialog();
  updateDashboardStats();
  showView('dashboard');
}

function submitExam() {
  if (state.examSubmitted) return;
  state.examSubmitted = true;
  clearInterval(state.timerInterval);
  
  let correctCount = 0;
  let skippedCount = 0;
  const sectionBreakdown = {};
  
  // Calculate results
  state.questionsList.forEach((q, idx) => {
    const uAns = state.userAnswers[idx];
    
    const isCorrect = q.isMulti 
      ? (Array.isArray(uAns) && [...uAns].sort().join(',') === q.answer)
      : uAns === q.answer;
      
    const isSkipped = !uAns || (q.isMulti && Array.isArray(uAns) && uAns.length === 0);
    const sectionId = getQuestionSection(q) || 'unknown';
    if (!sectionBreakdown[sectionId]) {
      sectionBreakdown[sectionId] = { correct: 0, total: 0 };
    }
    sectionBreakdown[sectionId].total++;
    
    if (isSkipped) {
      skippedCount++;
      // Save skipped to wrong list as it was not answered correctly
      if (!state.wrongAnswers.includes(q.id)) {
        state.wrongAnswers.push(q.id);
      }
      recordQuestionProgress(q, false);
    } else if (isCorrect) {
      correctCount++;
      sectionBreakdown[sectionId].correct++;
      // Remove from wrong answers list
      state.wrongAnswers = state.wrongAnswers.filter(id => id !== q.id);
      recordQuestionProgress(q, true);
    } else {
      // Wrong answer
      if (!state.wrongAnswers.includes(q.id)) {
        state.wrongAnswers.push(q.id);
      }
      recordQuestionProgress(q, false);
    }
  });
  
  const totalCount = state.questionsList.length;
  const incorrectCount = totalCount - correctCount - skippedCount;
  const scorePercent = Math.round((correctCount / totalCount) * 100);
  
  let passed = false;
  if (state.currentExamType === 'mock1' || state.currentExamType === 'mock2') {
    passed = correctCount >= 40;
  } else if (state.currentExamType === 'mock3') {
    passed = correctCount >= 45;
  } else if (state.currentExamType === 'final') {
    // Final Pressure Test: pass at 70% (35 of 50) to match real CLF-C02
    passed = scorePercent >= 70;
  } else if (state.currentExamType === 'readiness') {
    // Ultimate Readiness Exam: stricter confidence gate before the real exam.
    passed = scorePercent >= 80;
  } else {
    passed = scorePercent >= 70;
  }
  
  // Update persistence
  state.stats.examsTaken++;
  state.stats.examScores.push(scorePercent);
  // Accumulate total questions practiced
  state.stats.totalAnswersCount += (correctCount + incorrectCount);
  state.stats.correctAnswersCount += correctCount;
  const timeUsedSeconds = Math.max(0, (state.examDurationSeconds || 0) - (state.examTimeRemaining || 0));
  recordDailyActivity({ seconds: timeUsedSeconds });
  saveExamHistory({
    examType: state.currentExamType,
    scorePercent,
    correct: correctCount,
    incorrect: incorrectCount,
    skipped: skippedCount,
    total: totalCount,
    passed,
    timeUsedSeconds,
    sectionBreakdown
  });
  
  saveData();
  
  // Render results
  renderExamResults(scorePercent, correctCount, incorrectCount, skippedCount, passed);
}

function renderExamResults(scorePercent, correct, incorrect, skipped, passed) {
  state.currentMode = 'results';
  // Score Ring
  document.getElementById('res-score-percent').innerText = `${scorePercent}%`;
  
  // Dynamically update passing target hint in scorecard
  const scoreLabel = document.querySelector('.score-label');
  if (scoreLabel) {
    scoreLabel.innerHTML = `${escapeHtml(getPassTargetLabel())}<br>(Got ${correct})`;
  }

  // Grade
  const gradeEl = document.getElementById('res-grade');
  if (passed) {
    gradeEl.className = 'results-grade grade-pass';
    gradeEl.innerText = 'PASS';
  } else {
    gradeEl.className = 'results-grade grade-fail';
    gradeEl.innerText = 'FAIL';
  }
  
  // Breakdown
  document.getElementById('res-correct').innerText = correct;
  document.getElementById('res-incorrect').innerText = incorrect;
  document.getElementById('res-skipped').innerText = skipped;
  
  // Review List
  const reviewList = document.getElementById('results-review-list');
  markExamWording(reviewList);
  reviewList.innerHTML = '';
  
  state.questionsList.forEach((q, idx) => {
    const uAns = state.userAnswers[idx];
    const item = document.createElement('div');
    item.className = 'review-item';
    markExamWording(item);
    
    let badgeClass = '';
    let badgeText = '';
    
    const isCorrect = q.isMulti 
      ? (Array.isArray(uAns) && [...uAns].sort().join(',') === q.answer)
      : uAns === q.answer;
      
    const isSkipped = !uAns || (q.isMulti && Array.isArray(uAns) && uAns.length === 0);

    if (isSkipped) {
      badgeClass = 'review-badge-skipped';
      badgeText = 'Skipped';
    } else if (isCorrect) {
      badgeClass = 'review-badge-correct';
      badgeText = 'Correct';
    } else {
      badgeClass = 'review-badge-incorrect';
      badgeText = 'Incorrect';
    }
    
    // Parse letters
    const correctLetters = q.isMulti ? q.answer.split(',') : [q.answer];
    const userLetters = Array.isArray(uAns) ? uAns : (uAns ? [uAns] : []);
    
    item.innerHTML = `
      <div class="review-item-header">
        <div class="review-item-title">#${idx + 1}. ${escapeHtml(q.question)}</div>
        <span class="review-item-badge ${badgeClass}">${escapeHtml(badgeText)}</span>
      </div>
      <div class="review-options">
        ${q.options.map((opt, oIdx) => {
          const letter = String.fromCharCode(65 + oIdx);
          let itemClass = '';
          const isLetterCorrect = correctLetters.includes(letter);
          const isLetterSelected = userLetters.includes(letter);
          
          if (isLetterCorrect) {
            itemClass = 'correct-option';
          } else if (isLetterSelected) {
            itemClass = 'user-incorrect-option';
          }
          
          return `<div class="review-option ${itemClass}">${letter}. ${escapeHtml(opt)}</div>`;
        }).join('')}
      </div>
      <div class="review-explanation">
        <strong>Why:</strong> ${escapeHtml(q.explanation)}
      </div>
      ${buildOptionRationaleHtml(q, uAns)}
    `;
    
    reviewList.appendChild(item);
  });
  
  showView('results-view');
  if (passed) {
    launchPassCelebration(scorePercent);
  }
}

// Master Memory Sentence Trainer Logic
let ttsUtterance = null;

function startTrainer() {
  state.currentMode = 'trainer';
  trainerState.currentTab = 'read';
  trainerState.currentCardIndex = 0;
  
  // Reset tabs UI
  switchTrainerTab('read');
  
  // Populate interactive read view
  initTrainerRead();
  
  // Populate flashcards
  initTrainerFlashcards();
  
  // Populate matching recall game
  initTrainerMatching();
  
  showView('trainer-view');
}

function switchTrainerTab(tabId) {
  // Cancel TTS if switching tabs
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
  const readBtn = document.getElementById('btn-read-tts');
  if (readBtn) readBtn.innerText = "🔊 Read Out Loud";

  trainerState.currentTab = tabId;
  
  // Update tabs UI
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  document.getElementById(`tab-${tabId}`).classList.add('active');
  
  // Update panes
  document.querySelectorAll('.trainer-pane').forEach(pane => {
    pane.style.display = 'none';
  });
  document.getElementById(`pane-${tabId}`).style.display = 'block';

  if (tabId === 'flashcard') {
    trainerState.flashcardsList = shuffleArray([...MASTER_ITEMS]);
    trainerState.currentCardIndex = 0;
    initTrainerFlashcards();
  }
}

function initTrainerRead() {
  const container = document.getElementById('sentence-interactive-container');
  container.innerHTML = '';
  MASTER_ITEMS.forEach(item => {
    const pair = document.createElement('button');
    pair.type = 'button';
    pair.className = 'sentence-pair sentence-pair-button';
    pair.title = 'Click to hear this specific card.';
    pair.innerHTML = '<span class="sentence-pair-service"></span> = <span class="sentence-pair-concept"></span>';
    pair.querySelector('.sentence-pair-service').textContent = item.service;
    pair.querySelector('.sentence-pair-concept').textContent = item.concept;
    pair.addEventListener('click', () => speakSinglePair(item.service, item.concept));
    container.appendChild(pair);
    container.appendChild(document.createTextNode('. '));
  });
}

function speakSinglePair(service, concept) {
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel();
    const cleanService = service.replace('/', ' or ');
    const text = `${cleanService} is ${concept}`;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    window.speechSynthesis.speak(utterance);
  }
}

function toggleTTS() {
  if (!window.speechSynthesis) {
    showToast("Speech synthesis is not supported in this browser.");
    return;
  }
  
  const readBtn = document.getElementById('btn-read-tts');
  
  if (window.speechSynthesis.speaking) {
    window.speechSynthesis.cancel();
    readBtn.innerText = "🔊 Read Out Loud";
    showToast("TTS Reading stopped.");
  } else {
    readBtn.innerText = "⏹️ Stop Reading";
    
    // Construct full sentence text
    const speechText = MASTER_ITEMS.map(item => {
      const cleanService = item.service.replace('/', ' or ');
      return `${cleanService} is ${item.concept}`;
    }).join(". ");
    
    ttsUtterance = new SpeechSynthesisUtterance(speechText);
    ttsUtterance.rate = 0.9; // Slower pace for easier memorization
    
    ttsUtterance.onend = () => {
      readBtn.innerText = "🔊 Read Out Loud";
    };
    
    ttsUtterance.onerror = () => {
      readBtn.innerText = "🔊 Read Out Loud";
    };
    
    window.speechSynthesis.speak(ttsUtterance);
    showToast("Starting TTS Reading. Read out loud along with it!");
  }
}

function initTrainerFlashcards() {
  const idx = trainerState.currentCardIndex;
  const list = trainerState.flashcardsList && trainerState.flashcardsList.length > 0 
    ? trainerState.flashcardsList 
    : MASTER_ITEMS;
  const item = list[idx];
  
  // Reset card flipped state
  document.getElementById('flashcard-element').classList.remove('flipped');
  
  // Set contents
  document.getElementById('fc-front-text').innerText = item.service;
  document.getElementById('fc-back-text').innerText = item.concept;
  
  // Set counts
  document.getElementById('fc-card-count').innerText = `Card ${idx + 1} of ${list.length}`;
}

function flipFlashcard() {
  document.getElementById('flashcard-element').classList.toggle('flipped');
}

function bindFlipCardKeyboard(elementId) {
  const card = document.getElementById(elementId);
  if (!card) return;
  card.addEventListener('click', () => card.classList.toggle('flipped'));
  card.addEventListener('keydown', event => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      card.classList.toggle('flipped');
    }
  });
}

function nextFlashcard() {
  const list = trainerState.flashcardsList && trainerState.flashcardsList.length > 0 
    ? trainerState.flashcardsList 
    : MASTER_ITEMS;
  if (trainerState.currentCardIndex < list.length - 1) {
    trainerState.currentCardIndex++;
    initTrainerFlashcards();
  } else {
    showToast("You've reached the last card!");
  }
}

function prevFlashcard() {
  if (trainerState.currentCardIndex > 0) {
    trainerState.currentCardIndex--;
    initTrainerFlashcards();
  }
}

function initTrainerMatching() {
  trainerState.matchingSelectedAnswers = {};
  
  // Select 5 random distinct items from MASTER_ITEMS
  const indices = [];
  while (indices.length < 5) {
    const rIdx = Math.floor(Math.random() * MASTER_ITEMS.length);
    if (!indices.includes(rIdx)) {
      indices.push(rIdx);
    }
  }
  
  trainerState.matchingServices = indices.map(idx => ({ ...MASTER_ITEMS[idx], index: idx }));
  
  // Get the concepts and shuffle them
  const conceptsList = trainerState.matchingServices.map(item => item.concept);
  trainerState.matchingConcepts = shuffleArray([...conceptsList]);
  
  // Render
  const container = document.getElementById('matching-game-container');
  container.innerHTML = '';
  
  trainerState.matchingServices.forEach((item, idx) => {
    const row = document.createElement('div');
    row.className = 'matching-pair-row';
    row.id = `matching-row-${idx}`;
    
    row.innerHTML = `
      <div class="matching-service-label">${item.service}</div>
      <div>
        <select class="matching-select" data-index="${idx}">
          <option value="">Choose concept...</option>
          ${trainerState.matchingConcepts.map(c => `<option value="${c}">${c}</option>`).join('')}
        </select>
      </div>
    `;
    
    container.appendChild(row);
  });
  
  // Event listeners on select changes
  container.querySelectorAll('.matching-select').forEach(select => {
    select.addEventListener('change', (e) => {
      const idx = parseInt(e.target.getAttribute('data-index'));
      trainerState.matchingSelectedAnswers[idx] = e.target.value;
    });
  });
}

function checkMatchingAnswers() {
  let allMatched = true;
  let answerGiven = false;
  
  trainerState.matchingServices.forEach((item, idx) => {
    const selectVal = trainerState.matchingSelectedAnswers[idx];
    const row = document.getElementById(`matching-row-${idx}`);
    
    row.classList.remove('matching-correct', 'matching-incorrect');
    
    // Check if answered
    if (selectVal) {
      answerGiven = true;
      const isCorrect = selectVal === item.concept;
      if (isCorrect) {
        row.classList.add('matching-correct');
      } else {
        row.classList.add('matching-incorrect');
        allMatched = false;
        
        // Show correct mapping tip if incorrect
        let selectContainer = row.querySelector('div:last-child');
        let tip = selectContainer.querySelector('.matching-tip');
        if (!tip) {
          tip = document.createElement('div');
          tip.className = 'matching-tip';
          tip.style.fontSize = '0.75rem';
          tip.style.marginTop = '0.25rem';
          tip.style.color = 'var(--error)';
          tip.innerHTML = `Correct: <strong>${escapeHtml(item.concept)}</strong>`;
          selectContainer.appendChild(tip);
        }
      }
    } else {
      row.classList.add('matching-incorrect');
      allMatched = false;
    }
  });
  
  if (!answerGiven) {
    showToast("Please make at least one selection first!");
    return;
  }
  
  if (allMatched) {
    showToast("Amazing! All matches are correct! 🎉", "success");
  } else {
    showToast("Some matches are incorrect. Review the corrections and try again!");
  }
}

// Study Guide & Cheat Sheet Logic
function startGuide(initialTab = 'concepts') {
  state.currentMode = 'guide';
  
  // Render sub-sections
  renderGuideConcepts();
  renderGuideResponsibility();
  renderGuideDirectory();
  renderGuideServerless();
  renderGuideTraps();
  renderGuidePairs();
  renderGuideStrategy();
  renderGuidePassPlan();

  switchGuideTab(initialTab);
  showView('study-view');
}

function switchGuideTab(tabId) {
  let safeTabId = tabId;
  if (!document.getElementById(`tab-guide-${safeTabId}`) || !document.getElementById(`pane-guide-${safeTabId}`)) {
    safeTabId = 'concepts';
  }

  // Update tabs UI
  document.querySelectorAll('.tab-guide-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  document.getElementById(`tab-guide-${safeTabId}`).classList.add('active');
  
  // Update panes
  document.querySelectorAll('.guide-pane').forEach(pane => {
    pane.style.display = 'none';
  });
  document.getElementById(`pane-guide-${safeTabId}`).style.display = 'block';

  if (safeTabId === 'planner') {
    initPlanner();
  }
}

const SERVICE_CATEGORY_LABELS = {
  es: {
    'Security Services': 'Servicios de seguridad',
    'Compute, Containers & Serverless': 'Compute, contenedores y serverless',
    'Storage Services': 'Servicios de almacenamiento',
    'Databases & Analytics': 'Bases de datos y analitica',
    'Networking & Content Delivery': 'Redes y entrega de contenido',
    'Management & Governance': 'Gestion y gobernanza',
    'Application Integration': 'Integracion de aplicaciones',
    'Migration & Transfer': 'Migracion y transferencia',
    'Billing, Pricing & Support': 'Facturacion, precios y soporte',
    'Pricing Models': 'Modelos de precios',
    'Machine Learning & Small Categories': 'Machine Learning y categorias pequenas',
    'Developer Tools & Deployment': 'Herramientas de desarrollo y despliegue'
  },
  pt: {
    'Security Services': 'Servicos de seguranca',
    'Compute, Containers & Serverless': 'Compute, containers e serverless',
    'Storage Services': 'Servicos de armazenamento',
    'Databases & Analytics': 'Bancos de dados e analytics',
    'Networking & Content Delivery': 'Rede e entrega de conteudo',
    'Management & Governance': 'Gestao e governanca',
    'Application Integration': 'Integracao de aplicacoes',
    'Migration & Transfer': 'Migracao e transferencia',
    'Billing, Pricing & Support': 'Faturamento, precos e suporte',
    'Pricing Models': 'Modelos de preco',
    'Machine Learning & Small Categories': 'Machine Learning e categorias menores',
    'Developer Tools & Deployment': 'Ferramentas de desenvolvimento e deploy'
  },
  fr: {
    'Security Services': 'Services de securite',
    'Compute, Containers & Serverless': 'Compute, conteneurs et serverless',
    'Storage Services': 'Services de stockage',
    'Databases & Analytics': 'Bases de donnees et analytics',
    'Networking & Content Delivery': 'Reseau et diffusion de contenu',
    'Management & Governance': 'Gestion et gouvernance',
    'Application Integration': 'Integration applicative',
    'Migration & Transfer': 'Migration et transfert',
    'Billing, Pricing & Support': 'Facturation, tarifs et support',
    'Pricing Models': 'Modeles de tarification',
    'Machine Learning & Small Categories': 'Machine Learning et petites categories',
    'Developer Tools & Deployment': 'Outils developpeur et deploiement'
  },
  de: {
    'Security Services': 'Security-Services',
    'Compute, Containers & Serverless': 'Compute, Container und Serverless',
    'Storage Services': 'Storage-Services',
    'Databases & Analytics': 'Datenbanken und Analytics',
    'Networking & Content Delivery': 'Netzwerk und Content Delivery',
    'Management & Governance': 'Management und Governance',
    'Application Integration': 'Application Integration',
    'Migration & Transfer': 'Migration und Transfer',
    'Billing, Pricing & Support': 'Abrechnung, Preise und Support',
    'Pricing Models': 'Preismodelle',
    'Machine Learning & Small Categories': 'Machine Learning und kleinere Kategorien',
    'Developer Tools & Deployment': 'Developer Tools und Deployment'
  },
  it: {
    'Security Services': 'Servizi di sicurezza',
    'Compute, Containers & Serverless': 'Compute, container e serverless',
    'Storage Services': 'Servizi di storage',
    'Databases & Analytics': 'Database e analytics',
    'Networking & Content Delivery': 'Rete e content delivery',
    'Management & Governance': 'Gestione e governance',
    'Application Integration': 'Integrazione applicativa',
    'Migration & Transfer': 'Migrazione e trasferimento',
    'Billing, Pricing & Support': 'Fatturazione, prezzi e supporto',
    'Pricing Models': 'Modelli di prezzo',
    'Machine Learning & Small Categories': 'Machine Learning e categorie minori',
    'Developer Tools & Deployment': 'Developer tools e deployment'
  },
  nl: {
    'Security Services': 'Security services',
    'Compute, Containers & Serverless': 'Compute, containers en serverless',
    'Storage Services': 'Storage services',
    'Databases & Analytics': 'Databases en analytics',
    'Networking & Content Delivery': 'Netwerk en content delivery',
    'Management & Governance': 'Management en governance',
    'Application Integration': 'Applicatie-integratie',
    'Migration & Transfer': 'Migratie en transfer',
    'Billing, Pricing & Support': 'Facturering, prijzen en support',
    'Pricing Models': 'Prijsmodellen',
    'Machine Learning & Small Categories': 'Machine learning en kleinere categorieen',
    'Developer Tools & Deployment': 'Developer tools en deployment'
  },
  hi: {
    'Security Services': 'Security services',
    'Compute, Containers & Serverless': 'Compute, containers, serverless',
    'Storage Services': 'Storage services',
    'Databases & Analytics': 'Databases aur analytics',
    'Networking & Content Delivery': 'Networking aur content delivery',
    'Management & Governance': 'Management aur governance',
    'Application Integration': 'Application integration',
    'Migration & Transfer': 'Migration aur transfer',
    'Billing, Pricing & Support': 'Billing, pricing aur support',
    'Pricing Models': 'Pricing models',
    'Machine Learning & Small Categories': 'Machine Learning aur small categories',
    'Developer Tools & Deployment': 'Developer tools aur deployment'
  },
  ja: {
    'Security Services': 'Security services',
    'Compute, Containers & Serverless': 'Compute, containers, serverless',
    'Storage Services': 'Storage services',
    'Databases & Analytics': 'Databases and analytics',
    'Networking & Content Delivery': 'Networking and content delivery',
    'Management & Governance': 'Management and governance',
    'Application Integration': 'Application integration',
    'Migration & Transfer': 'Migration and transfer',
    'Billing, Pricing & Support': 'Billing, pricing, and support',
    'Pricing Models': 'Pricing models',
    'Machine Learning & Small Categories': 'Machine learning and small categories',
    'Developer Tools & Deployment': 'Developer tools and deployment'
  }
};

function localizedCategoryLabel(category) {
  return (SERVICE_CATEGORY_LABELS[state.language] && SERVICE_CATEGORY_LABELS[state.language][category]) || category;
}

// Render the 7-Day Pass Plan + proven strategies + exam-day checklist
function renderGuidePassPlan() {
  const daysEl = document.getElementById('pass-plan-days');
  if (daysEl) {
    daysEl.innerHTML = (PASS_PLAN.days || []).map(d => `
      <div class="glass-card" style="padding: 1.25rem 1.5rem;">
        <div style="display: flex; justify-content: space-between; align-items: baseline; gap: 1rem; flex-wrap: wrap; margin-bottom: 0.75rem;">
          <h4 style="font-size: 1rem; font-weight: 800; color: var(--warning); margin: 0;">${escapeHtml(t('passPlanDayLabel', { day: d.day, focus: d.focus }))}</h4>
          <span style="font-size: 0.8rem; color: var(--text-muted); font-weight: 700;">⏱️ ${d.hours}</span>
        </div>
        <ul style="padding-left: 1.1rem; margin: 0 0 0.6rem; font-size: 0.88rem; line-height: 1.7; color: var(--text-secondary);">
          ${d.do.map(t => `<li>${t}</li>`).join('')}
        </ul>
        <div style="font-size: 0.8rem; color: var(--success); border-left: 2px solid var(--success); padding-left: 0.75rem;">
          <strong>${escapeHtml(t('passPlanWhyLabel'))}:</strong> ${d.why}
        </div>
      </div>
    `).join('');
  }

  const stratEl = document.getElementById('pass-plan-strategies');
  if (stratEl) {
    stratEl.innerHTML = (PASS_PLAN.strategies || []).map(s => `
      <div style="background: rgba(255,255,255,0.01); border: 1px solid var(--card-border); border-radius: 12px; padding: 1rem 1.25rem;">
        <div style="font-size: 0.92rem; font-weight: 700; color: var(--secondary); margin-bottom: 0.3rem;">${s.t}</div>
        <div style="font-size: 0.85rem; line-height: 1.6; color: var(--text-secondary);">${s.d}</div>
      </div>
    `).join('');
  }

  const listEl = document.getElementById('pass-plan-checklist');
  if (listEl) {
    listEl.innerHTML = (PASS_PLAN.examDayChecklist || []).map(c => `<li>${c}</li>`).join('');
  }
}

function renderGuideConcepts() {
  const tbody = document.getElementById('table-concepts-body');
  tbody.innerHTML = CONCEPTS.map(item => {
    return `<tr>
      <td style="font-weight: 700; color: var(--secondary);">${item.concept}</td>
      <td>${item.hook}</td>
    </tr>`;
  }).join('');
}

function renderGuideResponsibility() {
  // Lists
  const awsList = document.getElementById('list-aws-resp');
  const custList = document.getElementById('list-customer-resp');
  
  awsList.innerHTML = SHARED_RESPONSIBILITY.map(item => `<li>${item.aws}</li>`).join('');
  custList.innerHTML = SHARED_RESPONSIBILITY.map(item => `<li>${item.customer}</li>`).join('');
  
  // Q&A Grid
  const qaContainer = document.getElementById('responsibility-qa-container');
  qaContainer.innerHTML = RESPONS_QAS.map(item => {
    return `<div class="guide-qa-card">
      <div class="guide-qa-question">${item.q}</div>
      <div class="guide-qa-answer">${item.a}</div>
    </div>`;
  }).join('');
}

function getServiceInfo(serviceName) {
  for (const services of Object.values(SERVICE_DIRECTORY)) {
    const found = services.find(service => service.name === serviceName);
    if (found) return found;
  }
  return null;
}

function isServerlessService(serviceName) {
  return SERVERLESS_SERVICE_NAMES.has(serviceName);
}

function renderServerlessBadge(serviceName) {
  if (!isServerlessService(serviceName)) return '';
  return `<span class="serverless-badge">${escapeHtml(t('serverlessLabel'))}</span>`;
}

function renderGuideServerless() {
  const summary = document.getElementById('serverless-summary-grid');
  if (summary) {
    summary.innerHTML = [
      { value: SERVERLESS_SERVICE_NAMES.size, label: t('serverlessSummaryServices') },
      { value: '5', label: t('serverlessSummaryBuckets') },
      { value: 'No servers', label: t('serverlessSummaryCaution') }
    ].map(item => `
      <div class="serverless-summary-item">
        <strong>${escapeHtml(String(item.value))}</strong>
        <span>${escapeHtml(item.label)}</span>
      </div>
    `).join('');
  }

  const container = document.getElementById('serverless-service-container');
  if (!container) return;

  container.innerHTML = SERVERLESS_STUDY_GROUPS.map(group => `
    <section class="glass-card serverless-group-card">
      <div class="serverless-group-heading">
        <div>
          <span class="card-badge">${escapeHtml(group.title)}</span>
          <h3>${escapeHtml(group.takeaway)}</h3>
        </div>
        <span>${escapeHtml(t('serverlessServiceCount', { count: group.services.length }))}</span>
      </div>
      <div class="serverless-card-grid">
        ${group.services.map(name => {
          const info = getServiceInfo(name);
          return `
            <div class="serverless-service-card">
              <div class="directory-service-name">${escapeHtml(name)} ${renderServerlessBadge(name)}</div>
              <div class="directory-service-desc">${escapeHtml(info ? info.desc : t('managedServiceFallback'))}</div>
              <div class="directory-service-triggers">${escapeHtml(t('keyTriggerLabel'))}: ${escapeHtml(info ? info.triggers : 'serverless')}</div>
            </div>
          `;
        }).join('')}
      </div>
    </section>
  `).join('');
}

function renderGuideDirectory(filterText = '') {
  const container = document.getElementById('service-directory-container');
  container.innerHTML = '';
  
  const query = filterText.toLowerCase();
  
  Object.keys(SERVICE_DIRECTORY).forEach(category => {
    const services = SERVICE_DIRECTORY[category];
    
    // Filter services
    const filtered = services.filter(s => {
      const serverlessText = isServerlessService(s.name) ? 'serverless' : '';
      return s.name.toLowerCase().includes(query) ||
             s.desc.toLowerCase().includes(query) ||
             s.triggers.toLowerCase().includes(query) ||
             serverlessText.includes(query);
    });
    
    if (filtered.length === 0) return; // Hide categories with no matches
    
    const catSection = document.createElement('div');
    catSection.innerHTML = `
      <div class="directory-category-title">${escapeHtml(localizedCategoryLabel(category))} (${filtered.length})</div>
      <div class="directory-grid" id="dir-grid-${category.replace(/[^a-zA-Z0-9]/g, '')}"></div>
    `;
    
    container.appendChild(catSection);
    
    const grid = catSection.querySelector('.directory-grid');
    filtered.forEach(s => {
      const card = document.createElement('div');
      card.className = 'directory-service-card';
      card.innerHTML = `
        <div class="directory-service-header">
          <div class="directory-service-name">${escapeHtml(s.name)}</div>
          ${renderServerlessBadge(s.name)}
        </div>
        <div class="directory-service-desc">${escapeHtml(s.desc)}</div>
        <div class="directory-service-triggers">${escapeHtml(t('keyTriggerLabel'))}: ${escapeHtml(s.triggers)}</div>
      `;
      grid.appendChild(card);
    });
  });
  
  if (container.innerHTML === '') {
    container.innerHTML = `<div style="text-align: center; color: var(--text-muted); margin-top: 2rem;">${escapeHtml(t('noServiceResults', { query: filterText }))}</div>`;
  }
}

function renderGuideTraps() {
  const tbody = document.getElementById('table-traps-body');
  tbody.innerHTML = HIGH_YIELD_TRAPS.map(item => {
    const key = item.question || item.name;
    return `<tr>
      <td style="font-weight: 700; color: var(--text-primary);">${escapeHtml(t('trapQuestionTemplate', { term: key }))}</td>
      <td style="font-weight: 700; color: var(--warning);">${escapeHtml(t('trapAnswerTemplate', { answer: item.answer }))}</td>
    </tr>`;
  }).join('');
}

function renderOfficialSourceMap() {
  const linksContainer = document.getElementById('official-source-links');
  const scopeContainer = document.getElementById('official-scope-list');
  const avoidContainer = document.getElementById('official-avoid-list');

  if (linksContainer) {
    linksContainer.innerHTML = OFFICIAL_SOURCE_LINKS.map(item => `
      <a class="source-map-link" href="${escapeHtml(item.href)}" target="_blank" rel="noopener noreferrer">
        <strong>${escapeHtml(item.title)}</strong>
        <span>${escapeHtml(item.note)}</span>
      </a>
    `).join('');
  }

  if (scopeContainer) {
    scopeContainer.innerHTML = OFFICIAL_SCOPE_ANCHORS.map(item => `<li>${escapeHtml(item)}</li>`).join('');
  }

  if (avoidContainer) {
    avoidContainer.innerHTML = OFFICIAL_AVOID_ANCHORS.map(item => `<li>${escapeHtml(item)}</li>`).join('');
  }
}

function renderGuideStrategy() {
  // Strategy Checklist
  const strategyList = document.getElementById('list-exam-strategy');
  strategyList.innerHTML = EXAM_DAY_STRATEGY.map(item => `<li>${item}</li>`).join('');
  
  // Last-Page Memory Grid
  const memoryContainer = document.getElementById('last-page-memory-container');
  memoryContainer.innerHTML = Object.keys(LAST_PAGE_MEMORY).map(category => {
    const text = LAST_PAGE_MEMORY[category];
    return `
      <div class="glass-card" style="padding: 1.5rem; background: rgba(255,255,255,0.01); border: 1px solid var(--card-border);">
        <h4 style="color: var(--secondary); margin-bottom: 0.75rem; font-weight: 700;">${category}</h4>
        <p style="font-size: 0.85rem; line-height: 1.7; color: var(--text-secondary); text-align: justify;">${text}</p>
      </div>
    `;
  }).join('');

  // Render Domain Weights (NEW)
  const weightsContainer = document.getElementById('domain-weights-container');
  if (weightsContainer) {
    weightsContainer.innerHTML = DOMAIN_WEIGHTS.map(d => {
      return `
        <div>
          <div style="display: flex; justify-content: space-between; font-size: 0.9rem; font-weight: 700; margin-bottom: 0.4rem;">
            <span style="color: var(--text-primary);">${d.name}</span>
            <span style="color: ${d.color};">${d.weight}%</span>
          </div>
          <div style="background: rgba(255, 255, 255, 0.05); height: 10px; border-radius: 9999px; overflow: hidden; border: 1px solid rgba(255,255,255,0.02);">
            <div style="background: ${d.color}; width: ${d.weight}%; height: 100%; border-radius: 9999px; box-shadow: 0 0 10px ${d.color}cc;"></div>
          </div>
        </div>
      `;
    }).join('');
  }

  // Render Must-Know vs Skip (NEW)
  const mustKnowContainer = document.getElementById('must-know-list');
  const skipContainer = document.getElementById('skip-list');
  if (mustKnowContainer && skipContainer) {
    mustKnowContainer.innerHTML = MUST_KNOW_LIST.map(item => `<li style="margin-bottom: 0.5rem;">${item}</li>`).join('');
    skipContainer.innerHTML = SKIP_LIST.map(item => `<li style="margin-bottom: 0.5rem;">${item}</li>`).join('');
  }

  // Render Readiness Audit (NEW)
  renderReadinessAudit();
  renderOfficialSourceMap();
}

function renderGuidePairs(filterText = '') {
  const container = document.getElementById('pairs-directory-container');
  container.innerHTML = '';

  const query = filterText.toLowerCase();
  const filtered = CONFUSING_PAIRS.filter(item => {
    const searchable = [
      item.pair,
      item.category,
      item.decision,
      ...item.services.flatMap(service => [service.name, service.equals, service.clue])
    ].join(' ').toLowerCase();
    return searchable.includes(query);
  });

  const countEl = document.getElementById('pairs-count');
  if (countEl) {
    countEl.textContent = filtered.length === 1
      ? t('pairCountOneLabel')
      : t('pairCountLabel', { count: filtered.length });
  }

  filtered.forEach(item => {
    const card = document.createElement('details');
    const compareClass = item.services.length > 2 ? 'pair-compare-grid is-three' : 'pair-compare-grid';
    card.className = 'pair-card glass-card';
    card.setAttribute('name', 'confusing-pairs');
    if (query && filtered.length <= 6) {
      card.open = true;
    }
    card.addEventListener('toggle', () => {
      if (!card.open) return;
      container.querySelectorAll('.pair-card[open]').forEach(otherCard => {
        if (otherCard !== card) otherCard.open = false;
      });
    });

    card.innerHTML = `
      <summary class="pair-summary">
        <div class="pair-summary-copy">
          <span class="pair-category">${escapeHtml(item.category)}</span>
          <h4>${escapeHtml(item.pair)}</h4>
          <p>${escapeHtml(item.decision)}</p>
        </div>
        <span class="pair-toggle-label" aria-hidden="true">
          <span class="pair-toggle-open">${escapeHtml(t('pairOpenLabel'))}</span>
          <span class="pair-toggle-close">${escapeHtml(t('pairCloseLabel'))}</span>
        </span>
      </summary>
      <div class="pair-card-details">
        <span class="pair-compare-label">${escapeHtml(t('pairCompareLabel'))}</span>
        <div class="${compareClass}">
          ${item.services.map(service => `
            <section class="pair-service-panel">
              <div class="pair-service-name">
                <span>${escapeHtml(service.name)}</span>
                <small>=</small>
              </div>
              <p>${escapeHtml(service.equals)}</p>
              <div class="pair-trigger">
                <span>${escapeHtml(t('pairTriggerLabel'))}</span>
                <strong>${escapeHtml(service.clue)}</strong>
              </div>
            </section>
          `).join('')}
        </div>
        <div class="pair-decision">
          <span>${escapeHtml(t('pairDecisionLabel'))}</span>
          <p>${escapeHtml(item.decision)}</p>
        </div>
      </div>
    `;
    container.appendChild(card);
  });

  if (filtered.length === 0) {
    container.innerHTML = `<div class="pairs-empty-state">${escapeHtml(t('noPairsResults', { query: filterText }))}</div>`;
  }
}

// Rapid Trigger Drills State and Logic
let drillsState = {
  drillsList: [],
  currentDrillIndex: 0
};

function startDrills() {
  state.currentMode = 'drills';
  drillsState.drillsList = shuffleArray([...RAPID_DRILLS]);
  drillsState.currentDrillIndex = 0;
  
  renderDrillScenario();
  showView('drills-view');
}

function renderDrillScenario() {
  const idx = drillsState.currentDrillIndex;
  const drill = drillsState.drillsList[idx];
  
  // Progress Bar
  const percent = (idx / drillsState.drillsList.length) * 100;
  document.getElementById('drills-progress-bar').style.width = `${percent}%`;
  document.getElementById('drills-progress-text').innerText = `Scenario ${idx + 1} of ${drillsState.drillsList.length}`;
  
  // Scenario Card Content
  const drillId = document.getElementById('drills-card-id');
  const drillScenario = document.getElementById('drills-scenario-text');
  markExamWording(drillId);
  markExamWording(drillScenario);
  drillId.innerText = `SCENARIO #${idx + 1}`;
  drillScenario.innerText = drill.scenario;
  
  // Input Reset
  const ansInput = document.getElementById('drills-answer-input');
  ansInput.value = '';
  ansInput.disabled = false;
  
  // Reset Feedback and Lockin Containers
  document.getElementById('drills-feedback-box').classList.remove('active');
  document.getElementById('drills-lockin-container').style.display = 'none';
  document.getElementById('drills-lockin-input').value = '';
  
  // Buttons
  document.getElementById('drills-show-btn').style.display = 'inline-flex';
  document.getElementById('drills-next-btn').style.display = 'none';
  
  setTimeout(() => { ansInput.focus(); }, 100);
}

function checkDrillAnswer() {
  const idx = drillsState.currentDrillIndex;
  const drill = drillsState.drillsList[idx];
  const userInput = document.getElementById('drills-answer-input').value.trim();
  
  if (!userInput) {
    showToast("Please type an answer first!");
    return;
  }
  
  // Compare values case-insensitively, allowing basic equivalents
  const cleanUser = userInput.toLowerCase().replace('amazon', '').replace('aws', '').replace('service', '').replace(/[^a-z0-9]/g, '').trim();
  const cleanAnswer = drill.answer.toLowerCase().replace('amazon', '').replace('aws', '').replace('service', '').replace(/[^a-z0-9]/g, '').trim();
  const isCorrect = cleanUser === cleanAnswer;
  
  const feedbackBox = document.getElementById('drills-feedback-box');
  markExamWording(feedbackBox);
  const showBtn = document.getElementById('drills-show-btn');
  const nextBtn = document.getElementById('drills-next-btn');
  const ansInput = document.getElementById('drills-answer-input');
  
  // Lock input
  ansInput.disabled = true;
  showBtn.style.display = 'none';
  
  if (isCorrect) {
    // Correct
    feedbackBox.className = "explanation-box active";
    feedbackBox.innerHTML = `
      <div class="explanation-header correct-text">${ICONS.check} Correct!</div>
      <div class="explanation-text">AWS Service: <strong>${escapeHtml(drill.answer)}</strong><br>🔑 Trigger Word: <strong>${escapeHtml(drill.trigger)}</strong></div>
    `;
    nextBtn.style.display = 'inline-flex';
    setTimeout(() => { nextBtn.focus(); }, 100);
    showToast("Correct!", "success");
  } else {
    // Incorrect -> Prompt Lock-in of trigger word
    feedbackBox.className = "explanation-box active incorrect-explanation";
    feedbackBox.innerHTML = `
      <div class="explanation-header incorrect-text">${ICONS.x} Incorrect!</div>
      <div class="explanation-text">Correct Service: <strong>${escapeHtml(drill.answer)}</strong></div>
    `;
    
    // Setup lock-in
    document.getElementById('drills-required-trigger').innerText = drill.trigger;
    document.getElementById('drills-lockin-container').style.display = 'block';
    
    const lockinInput = document.getElementById('drills-lockin-input');
    lockinInput.value = '';
    setTimeout(() => { lockinInput.focus(); }, 100);
    
    // Add input event listener to verify trigger word matching
    lockinInput.oninput = (e) => {
      const val = e.target.value.trim().toLowerCase();
      const required = drill.trigger.trim().toLowerCase();
      
      if (val === required) {
        showToast("Trigger word matches! You can now proceed.", "success");
        document.getElementById('drills-lockin-container').style.display = 'none';
        nextBtn.style.display = 'inline-flex';
        setTimeout(() => { nextBtn.focus(); }, 100);
      }
    };
  }
}

function setupDrillsAutocomplete() {
  const input = document.getElementById('drills-answer-input');
  const listContainer = document.getElementById('drills-autocomplete-list');
  
  // Extract all unique service names
  const allServices = Array.from(new Set([
    ...Object.values(SERVICE_DIRECTORY).flat().map(s => s.name),
    ...RAPID_DRILLS.map(d => d.answer),
    ...MINI_MIXED_QUIZ.map(q => q.answer)
  ])).sort();
  
  input.addEventListener('input', (e) => {
    const val = e.target.value.trim().toLowerCase();
    listContainer.innerHTML = '';
    
    if (!val) {
      listContainer.style.display = 'none';
      return;
    }
    
    const filtered = allServices.filter(s => s.toLowerCase().includes(val));
    
    if (filtered.length === 0) {
      listContainer.style.display = 'none';
      return;
    }
    
    filtered.forEach(s => {
      const item = document.createElement('div');
      item.className = 'autocomplete-item';
      item.innerText = s;
      item.addEventListener('click', () => {
        input.value = s;
        listContainer.style.display = 'none';
        input.focus();
      });
      listContainer.appendChild(item);
    });
    
    listContainer.style.display = 'block';
  });
  
  // Close list on blur / click outside
  document.addEventListener('click', (e) => {
    if (e.target !== input && e.target !== listContainer) {
      listContainer.style.display = 'none';
    }
  });
}

// Mini Quiz State and Logic
let miniquizQuestions = [];

function getMiniQuizServiceOptions() {
  return Array.from(new Set([
    ...Object.values(SERVICE_DIRECTORY).flat().map(s => s.name),
    ...RAPID_DRILLS.map(d => d.answer),
    ...MINI_MIXED_QUIZ.map(q => q.answer)
  ])).sort();
}

function ensureAwsServicesDatalist(services) {
  let datalist = document.getElementById('aws-services-datalist');
  if (!datalist) {
    datalist = document.createElement('datalist');
    datalist.id = 'aws-services-datalist';
    document.body.appendChild(datalist);
  }

  datalist.innerHTML = services.map(service => `<option value="${escapeHtml(service)}"></option>`).join('');
}

function buildServicePickerOptions(services) {
  return services.map(service => `<option value="${escapeHtml(service)}">${escapeHtml(service)}</option>`).join('');
}

function startMiniQuiz() {
  state.currentMode = 'miniquiz';
  miniquizQuestions = shuffleArray([...MINI_MIXED_QUIZ]);
  
  const container = document.getElementById('miniquiz-questions-list');
  container.innerHTML = '';
  
  // Reset submit button visibility
  document.getElementById('btn-miniquiz-submit').style.display = 'inline-flex';
  
  const allServices = getMiniQuizServiceOptions();
  const pickerOptions = buildServicePickerOptions(allServices);
  ensureAwsServicesDatalist(allServices);
  
  miniquizQuestions.forEach((q, idx) => {
    const item = document.createElement('div');
    item.className = 'matching-pair-row miniquiz-row';
    markExamWording(item);
    item.id = `miniquiz-row-${idx}`;
    
    item.innerHTML = `
      <div class="miniquiz-number">${idx + 1}.</div>
      <div class="miniquiz-question">${escapeHtml(q.question)}</div>
      <div class="miniquiz-answer-cell">
        <label class="sr-only" for="miniquiz-input-${idx}">Type answer for question ${idx + 1}</label>
        <input id="miniquiz-input-${idx}" type="text" list="aws-services-datalist" class="matching-select miniquiz-input" data-index="${idx}" placeholder="Type AWS service..." autocomplete="off" autocapitalize="words" spellcheck="false">
        <label class="sr-only" for="miniquiz-picker-${idx}">Pick answer for question ${idx + 1}</label>
        <select id="miniquiz-picker-${idx}" class="matching-select miniquiz-picker" data-index="${idx}" aria-label="Pick an AWS service for question ${idx + 1}">
          <option value="">Pick from services...</option>
          ${pickerOptions}
        </select>
      </div>
    `;
    container.appendChild(item);
  });

  container.querySelectorAll('.miniquiz-picker').forEach(select => {
    select.addEventListener('change', event => {
      const idx = event.target.getAttribute('data-index');
      const input = document.querySelector(`.miniquiz-input[data-index="${idx}"]`);
      if (input && event.target.value) input.value = event.target.value;
    });
  });

  container.querySelectorAll('.miniquiz-input').forEach(input => {
    input.addEventListener('input', event => {
      const idx = event.target.getAttribute('data-index');
      const picker = document.querySelector(`.miniquiz-picker[data-index="${idx}"]`);
      if (!picker) return;
      const typed = event.target.value.trim();
      picker.value = allServices.includes(typed) ? typed : '';
    });
  });
  
  showView('mini-quiz-view');
}

function submitMiniQuiz() {
  let score = 0;
  let allAnswered = true;
  const inputs = document.querySelectorAll('.miniquiz-input');
  
  inputs.forEach(input => {
    if (!input.value.trim()) allAnswered = false;
  });
  
  if (!allAnswered) {
    showToast("Please answer all 20 questions before submitting!");
    return;
  }
  
  miniquizQuestions.forEach((q, idx) => {
    const input = document.querySelector(`.miniquiz-input[data-index="${idx}"]`);
    const picker = document.querySelector(`.miniquiz-picker[data-index="${idx}"]`);
    const val = input.value.trim();
    const row = document.getElementById(`miniquiz-row-${idx}`);
    
    row.classList.remove('matching-correct', 'matching-incorrect');
    input.disabled = true;
    if (picker) picker.disabled = true;
    
    // Compare answers case-insensitively, removing AWS/Amazon prefixes
    const cleanUser = val.toLowerCase().replace('amazon', '').replace('aws', '').replace('service', '').replace(/[^a-z0-9]/g, '').trim();
    const cleanAnswer = q.answer.toLowerCase().replace('amazon', '').replace('aws', '').replace('service', '').replace(/[^a-z0-9]/g, '').trim();
    const isCorrect = cleanUser === cleanAnswer;
    
    if (isCorrect) {
      row.classList.add('matching-correct');
      score++;
    } else {
      row.classList.add('matching-incorrect');
      // Show correct answer tip
      const selectContainer = row.querySelector('.miniquiz-answer-cell');
      selectContainer.querySelector('.matching-tip')?.remove();
      const tip = document.createElement('div');
      tip.className = 'matching-tip';
      tip.style.fontSize = '0.75rem';
      tip.style.marginTop = '0.25rem';
      tip.style.color = 'var(--error)';
      tip.innerHTML = `Correct: <strong>${escapeHtml(q.answer)}</strong>`;
      selectContainer.appendChild(tip);
    }
  });
  
  // Show score toast
  showToast(`Mini Quiz Completed! Score: ${score}/20 (${Math.round((score/20)*100)}%)`, score >= 14 ? "success" : "info");
  
  // Hide submit button after submission
  document.getElementById('btn-miniquiz-submit').style.display = 'none';
}

// Helpers for Wrong-Answer Flashcards
// All question pools, in load order. Final Pressure Test is added later and may
// be undefined on first load, so guard with typeof.
function getAllQuestionPools() {
  const pools = [QUESTIONS, MOCK_EXAM_1, MOCK_EXAM_2, MOCK_EXAM_3];
  if (typeof FINAL_PRESSURE_TEST !== 'undefined') pools.push(FINAL_PRESSURE_TEST);
  if (typeof FINAL_READINESS_EXAM !== 'undefined') pools.push(FINAL_READINESS_EXAM);
  return pools;
}

function getAllQuestions() {
  return getAllQuestionPools().flat();
}

function prepareBalancedMockPool(baseList, targetCount = 50) {
  const minimumBySection = { 1: Math.max(8, Math.round(targetCount * 0.2)) };
  const result = [...baseList];
  const usedIds = new Set(result.map(q => Number(q.id)));
  const candidates = getAllQuestions().filter(q => q && q.section && !usedIds.has(Number(q.id)));

  Object.entries(minimumBySection).forEach(([sectionId, minimum]) => {
    while (result.filter(q => Number(q.section) === Number(sectionId)).length < minimum) {
      const candidate = candidates.find(q => Number(q.section) === Number(sectionId) && !usedIds.has(Number(q.id)));
      if (!candidate) break;
      result.push(candidate);
      usedIds.add(Number(candidate.id));
    }
  });

  while (result.length > targetCount) {
    const sectionCounts = result.reduce((acc, q) => {
      const section = Number(q.section) || 0;
      acc[section] = (acc[section] || 0) + 1;
      return acc;
    }, {});
    const removableIndex = result.findIndex(q => {
      const section = Number(q.section) || 0;
      const minimum = minimumBySection[section] || 0;
      return sectionCounts[section] > minimum;
    });
    result.splice(removableIndex >= 0 ? removableIndex : result.length - 1, 1);
  }

  while (result.length < targetCount) {
    const candidate = candidates.find(q => !usedIds.has(Number(q.id)));
    if (!candidate) break;
    result.push(candidate);
    usedIds.add(Number(candidate.id));
  }

  return result.slice(0, targetCount);
}

function prepareComprehensiveMockPool(targetCount = 65) {
  const sectionTargets = { 1: 16, 2: 20, 3: 14, 4: 8, 5: 7 };
  const allQuestions = getAllQuestions();
  const result = [];
  const usedIds = new Set();

  Object.entries(sectionTargets).forEach(([sectionId, count]) => {
    const candidates = shuffleArray(
      allQuestions.filter(q => Number(q.section) === Number(sectionId) && !usedIds.has(Number(q.id)))
    );
    candidates.slice(0, count).forEach(q => {
      result.push(q);
      usedIds.add(Number(q.id));
    });
  });

  if (result.length < targetCount) {
    const leftovers = shuffleArray(allQuestions.filter(q => !usedIds.has(Number(q.id))));
    leftovers.slice(0, targetCount - result.length).forEach(q => result.push(q));
  }

  return result.slice(0, targetCount);
}

function findQuestionById(id) {
  const targetId = Number(id);
  return getAllQuestions().find(q => Number(q.id) === targetId) || null;
}

function saveExamHistory(result) {
  if (!state.progress) state.progress = getDefaultProgress();
  const entry = {
    id: `exam-${Date.now()}`,
    examType: result.examType,
    label: getExamLabel(result.examType),
    date: new Date().toISOString(),
    scorePercent: result.scorePercent,
    correct: result.correct,
    incorrect: result.incorrect,
    skipped: result.skipped,
    total: result.total,
    passed: result.passed,
    timeUsedSeconds: result.timeUsedSeconds,
    sectionBreakdown: result.sectionBreakdown || {}
  };
  state.progress.examHistory.unshift(entry);
  state.progress.examHistory = state.progress.examHistory.slice(0, 100);
  state.lastExamResult = entry;
}

function renderHistoryView() {
  loadData();
  const history = state.progress.examHistory || [];
  const scores = history.map(item => Number(item.scorePercent)).filter(Number.isFinite);
  const best = scores.length ? Math.max(...scores) : 0;
  const average = scores.length ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length) : 0;

  setText('history-best-score', `${best}%`);
  setText('history-average-score', `${average}%`);
  setText('history-exams-taken', history.length);
  setText('history-focus-area', getFocusAreaLabel());
  renderScoreTrend(history);
  renderSectionAccuracy();
  renderExamHistoryTable(history);
}

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.innerText = value;
}

function getFocusAreaLabel() {
  const sections = [1, 2, 3, 4, 5]
    .map(id => ({ id, title: SECTIONS[id].title, ...getSectionProgress(id) }))
    .filter(item => item.totalAttempts > 0);
  if (sections.length === 0) return 'Start practicing';
  sections.sort((a, b) => a.accuracy - b.accuracy);
  return sections[0].title;
}

function renderScoreTrend(history) {
  const canvas = document.getElementById('score-trend-canvas');
  const caption = document.getElementById('history-trend-caption');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;
  ctx.clearRect(0, 0, width, height);

  const ordered = [...history].reverse().slice(-12);
  caption.innerText = ordered.length
    ? `${ordered.length} most recent exam run${ordered.length === 1 ? '' : 's'}`
    : 'Complete a mock exam to draw your first trend.';

  ctx.fillStyle = '#0b1220';
  ctx.fillRect(0, 0, width, height);
  ctx.strokeStyle = 'rgba(148, 163, 184, 0.22)';
  ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i++) {
    const y = 24 + i * ((height - 56) / 4);
    ctx.beginPath();
    ctx.moveTo(44, y);
    ctx.lineTo(width - 24, y);
    ctx.stroke();
  }

  ctx.fillStyle = '#94a3b8';
  ctx.font = '12px Segoe UI, sans-serif';
  [100, 75, 50, 25, 0].forEach((tick, i) => {
    const y = 28 + i * ((height - 56) / 4);
    ctx.fillText(`${tick}%`, 8, y + 4);
  });

  if (ordered.length === 0) {
    ctx.fillStyle = '#94a3b8';
    ctx.font = '16px Segoe UI, sans-serif';
    ctx.fillText('No scores yet. Take a mock exam to start your trend.', 60, height / 2);
    return;
  }

  const plotW = width - 72;
  const plotH = height - 56;
  const xFor = idx => ordered.length === 1 ? 44 + plotW / 2 : 44 + (idx / (ordered.length - 1)) * plotW;
  const yFor = score => 24 + ((100 - score) / 100) * plotH;

  ctx.strokeStyle = '#0ea5e9';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ordered.forEach((item, idx) => {
    const x = xFor(idx);
    const y = yFor(Number(item.scorePercent) || 0);
    if (idx === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.stroke();

  ordered.forEach((item, idx) => {
    const score = Number(item.scorePercent) || 0;
    const x = xFor(idx);
    const y = yFor(score);
    ctx.fillStyle = item.passed ? '#10b981' : '#ef4444';
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f8fafc';
    ctx.font = '11px Segoe UI, sans-serif';
    ctx.fillText(`${score}%`, Math.min(width - 48, x - 12), Math.max(16, y - 10));
  });
}

function renderSectionAccuracy() {
  const container = document.getElementById('section-accuracy-list');
  if (!container) return;
  container.innerHTML = [1, 2, 3, 4, 5].map(sectionId => {
    const progress = getSectionProgress(sectionId);
    const title = SECTIONS[sectionId].title;
    return `
      <div class="section-row">
        <div class="section-row-label">
          <strong>${escapeHtml(title)}</strong>
          <span>${progress.practiced}/${progress.totalQuestions} practiced, ${progress.totalAttempts} attempts</span>
        </div>
        <div class="section-row-score">${progress.accuracy}%</div>
        <div class="section-row-bar"><span style="width:${progress.accuracy}%"></span></div>
      </div>
    `;
  }).join('');
}

function renderExamHistoryTable(history) {
  const tbody = document.getElementById('exam-history-table-body');
  if (!tbody) return;
  if (!history.length) {
    tbody.innerHTML = '<tr><td colspan="5">No exam history yet.</td></tr>';
    return;
  }
  tbody.innerHTML = history.slice(0, 20).map(item => `
    <tr>
      <td><strong>${escapeHtml(item.label || getExamLabel(item.examType))}</strong></td>
      <td>${escapeHtml(formatDateTime(item.date))}</td>
      <td>${Number(item.scorePercent) || 0}% (${Number(item.correct) || 0}/${Number(item.total) || 0})</td>
      <td class="${item.passed ? 'history-pass' : 'history-fail'}">${item.passed ? 'Pass' : 'Keep practicing'}</td>
      <td>${escapeHtml(formatTime(Number(item.timeUsedSeconds) || 0))}</td>
    </tr>
  `).join('');
}

function formatDateTime(isoDate) {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return 'Unknown';
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });
}

function getAnswerText(q) {
  if (!q) return '';
  const letters = q.answer.split(',');
  return letters.map(letter => {
    const idx = letter.charCodeAt(0) - 65;
    if (q.options && q.options[idx]) {
      return `${letter}. ${q.options[idx]}`;
    }
    return letter;
  }).join(' and ');
}

function escapeHtml(str) {
  if (str === null || typeof str === 'undefined') return '';
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function shuffleQuestionOptions(q) {
  if (!q.options) return q;
  const optionsWithIndices = q.options.map((opt, idx) => ({ opt, idx }));
  const shuffled = shuffleArray(optionsWithIndices);
  const newOptions = shuffled.map(item => item.opt);

  const correctLetters = q.answer.split(',');
  const newAnswer = correctLetters.map(letter => {
    const oldIdx = letter.charCodeAt(0) - 65;
    const newIdx = shuffled.findIndex(item => item.idx === oldIdx);
    return String.fromCharCode(65 + newIdx);
  }).sort().join(',');

  // Reorder the per-option rationale array to match the new option positions.
  // rationale was aligned to the ORIGINAL option order; shuffled[i].idx is the
  // original index now sitting at position i, so we pull rationale from there.
  // Without this, the "why each option is wrong/right" text would stay glued to
  // the old positions and describe the wrong option after shuffle.
  const newRationale = Array.isArray(q.rationale)
    ? shuffled.map(item => q.rationale[item.idx])
    : q.rationale;

  return { ...q, options: newOptions, answer: newAnswer, rationale: newRationale };
}

function renderWrongFlashcards() {
  const deck = document.getElementById('wrong-flashcard-deck');
  if (!deck) return;
  markExamWording(deck);

  const list = trainerState.wrongCardsList || [];

  if (list.length === 0) {
    deck.innerHTML = `
      <div class="glass-card" style="padding: 3rem 2rem; text-align: center;">
        <div style="font-size: 3rem; margin-bottom: 1rem;">🎉</div>
        <h3 style="font-size: 1.25rem; margin-bottom: 0.5rem; color: var(--success);">All Mastered!</h3>
        <p style="color: var(--text-secondary); font-size: 0.9rem; line-height: 1.6;">
          You have no wrong answers to review. Great job! Keep practicing and testing yourself.
        </p>
      </div>
    `;
    return;
  }

  // Ensure active index is within bounds
  if (typeof trainerState.currentWrongCardIndex === 'undefined' || trainerState.currentWrongCardIndex >= list.length) {
    trainerState.currentWrongCardIndex = 0;
  }
  if (trainerState.currentWrongCardIndex < 0) {
    trainerState.currentWrongCardIndex = 0;
  }

  const qId = list[trainerState.currentWrongCardIndex];
  const q = findQuestionById(qId);

  if (!q) {
    state.wrongAnswers = state.wrongAnswers.filter(id => id !== qId);
    trainerState.wrongCardsList = trainerState.wrongCardsList.filter(id => id !== qId);
    saveData();
    renderWrongFlashcards();
    updateDashboardStats();
    return;
  }

  if (!state.wrongAnswerRules) {
    state.wrongAnswerRules = {};
  }
  const savedData = state.wrongAnswerRules[qId] || { keyword: '', confused: '', rule: '' };
  const answerText = getAnswerText(q);

  deck.innerHTML = `
    <!-- 3D Flashcard -->
    <div class="flashcard-container" id="wrong-fc-element" tabindex="0" role="button" aria-label="Flip wrong-answer flashcard" style="height: 250px;">
      <div class="flashcard-inner">
        <div class="flashcard-front" style="padding: 1.5rem; justify-content: center; align-items: center; border-color: rgba(239, 68, 68, 0.25);">
          <div class="flashcard-title" style="position: absolute; top: 1rem;">Question Clue</div>
          <div class="flashcard-content" style="font-size: 0.95rem; font-weight: 600; line-height: 1.5; text-align: center; max-height: 160px; overflow-y: auto; color: var(--text-primary);">
            ${escapeHtml(q.question)}
          </div>
          <div class="flashcard-hint" style="position: absolute; bottom: 1rem;">Click to Flip & Reveal Answer</div>
        </div>
        <div class="flashcard-back" style="padding: 1.5rem; justify-content: center; align-items: center; border-color: rgba(16, 185, 129, 0.25);">
          <div class="flashcard-title" style="position: absolute; top: 1rem;">Correct Answer</div>
          <div class="flashcard-content" style="font-size: 1.15rem; font-weight: 800; color: #10b981; line-height: 1.4; text-align: center; max-height: 160px; overflow-y: auto;">
            ${escapeHtml(answerText)}
          </div>
          <div class="flashcard-hint" style="position: absolute; bottom: 1rem;">Click to Flip Back</div>
        </div>
      </div>
    </div>

    <!-- Active Recall Inputs -->
    <div class="glass-card" style="padding: 1.5rem; margin-top: 1rem; border: 1px solid var(--card-border);">
      <h4 style="font-size: 0.95rem; font-weight: 700; color: var(--warning); margin-bottom: 1rem; text-align: center;">
        ✍️ Missed Question Active Recall Drill
      </h4>
      
      <div style="display: flex; flex-direction: column; gap: 1rem;">
        <div>
          <label style="display: block; font-size: 0.8rem; font-weight: 700; color: var(--text-secondary); margin-bottom: 0.25rem;">
            1. What keyword did I miss?
          </label>
          <input type="text" id="w-input-keyword" placeholder="e.g. S3 + SQL + serverless" value="${escapeHtml(savedData.keyword)}" style="width: 100%; padding: 0.6rem 0.8rem; border-radius: 6px; border: 1px solid var(--card-border); background: rgba(0,0,0,0.2); color: white; font-size: 0.9rem; outline: none;">
        </div>

        <div>
          <label style="display: block; font-size: 0.8rem; font-weight: 700; color: var(--text-secondary); margin-bottom: 0.25rem;">
            2. What wrong service did I confuse it with?
          </label>
          <input type="text" id="w-input-confused" placeholder="e.g. Redshift" value="${escapeHtml(savedData.confused)}" style="width: 100%; padding: 0.6rem 0.8rem; border-radius: 6px; border: 1px solid var(--card-border); background: rgba(0,0,0,0.2); color: white; font-size: 0.9rem; outline: none;">
        </div>

        <div>
          <label style="display: block; font-size: 0.8rem; font-weight: 700; color: var(--text-secondary); margin-bottom: 0.25rem;">
            3. What is the one-line rule?
          </label>
          <input type="text" id="w-input-rule" placeholder="e.g. Athena = SQL on S3. Redshift = warehouse." value="${escapeHtml(savedData.rule)}" style="width: 100%; padding: 0.6rem 0.8rem; border-radius: 6px; border: 1px solid var(--card-border); background: rgba(0,0,0,0.2); color: white; font-size: 0.9rem; outline: none;">
        </div>
      </div>

      <div style="display: flex; gap: 1rem; margin-top: 1.5rem; justify-content: space-between; align-items: center;">
        <div style="font-size: 0.8rem; color: var(--text-muted); font-weight: 600;">
          Card ${trainerState.currentWrongCardIndex + 1} of ${list.length}
        </div>
        <button class="btn btn-primary" id="btn-wrong-mastered" style="background: linear-gradient(135deg, var(--success), #059669); color: white; font-size: 0.85rem; padding: 0.5rem 1rem;">
          Mark as Mastered
        </button>
      </div>
    </div>

    <!-- Navigation Buttons -->
    <div style="display: flex; gap: 1rem; width: 100%; margin-top: 1rem;">
      <button class="btn btn-secondary" id="btn-wrong-prev" style="flex: 1;">Previous</button>
      <button class="btn btn-secondary" id="btn-wrong-next" style="flex: 1;">Next</button>
    </div>
  `;

  // Bind input changes to save automatically
  bindFlipCardKeyboard('wrong-fc-element');
  const keywordInput = document.getElementById('w-input-keyword');
  const confusedInput = document.getElementById('w-input-confused');
  const ruleInput = document.getElementById('w-input-rule');

  const saveInputs = () => {
    if (!state.wrongAnswerRules) {
      state.wrongAnswerRules = {};
    }
    state.wrongAnswerRules[qId] = {
      keyword: keywordInput.value.trim(),
      confused: confusedInput.value.trim(),
      rule: ruleInput.value.trim()
    };
    saveData();
  };

  keywordInput.addEventListener('input', saveInputs);
  confusedInput.addEventListener('input', saveInputs);
  ruleInput.addEventListener('input', saveInputs);

  // Bind buttons
  document.getElementById('btn-wrong-mastered').addEventListener('click', () => {
    state.wrongAnswers = state.wrongAnswers.filter(id => id !== qId);
    trainerState.wrongCardsList = trainerState.wrongCardsList.filter(id => id !== qId);
    saveData();
    showToast("Question marked as Mastered and removed from wrong list!", "success");
    renderWrongFlashcards();
    updateDashboardStats();
  });

  document.getElementById('btn-wrong-prev').addEventListener('click', () => {
    if (trainerState.currentWrongCardIndex > 0) {
      trainerState.currentWrongCardIndex--;
      renderWrongFlashcards();
    } else {
      showToast("First card!");
    }
  });

  document.getElementById('btn-wrong-next').addEventListener('click', () => {
    if (trainerState.currentWrongCardIndex < trainerState.wrongCardsList.length - 1) {
      trainerState.currentWrongCardIndex++;
      renderWrongFlashcards();
    } else {
      showToast("Last card!");
    }
  });
}

function renderReadinessAuditLegacy() {
  const container = document.getElementById('readiness-checklist-container');
  if (!container) return;

  // 1. Mock Exam Milestone
  const scoresAbove80 = state.stats.examScores.filter(s => s >= 80).length;
  const mockChecked = scoresAbove80 >= 2;
  const mockText = mockChecked
    ? `<span style="color: var(--success); font-weight: 600;">${escapeHtml(t('readinessAchievedLabel'))}:</span> ${escapeHtml(t('readinessMockAchieved', { count: scoresAbove80 }))}`
    : `<span style="color: var(--text-muted);">${escapeHtml(t('readinessProgressLabel'))}:</span> ${escapeHtml(t('readinessMockProgress', { count: scoresAbove80 }))}`;

  // 2. Weak Area Mastery
  const wrongCount = state.wrongAnswers.length;
  const wrongChecked = wrongCount < 5;
  const wrongText = wrongChecked
    ? `<span style="color: var(--success); font-weight: 600;">${escapeHtml(t('readinessAchievedLabel'))}:</span> ${escapeHtml(t('readinessWrongAchieved', { count: wrongCount }))}`
    : `<span style="color: var(--text-muted);">${escapeHtml(t('readinessProgressLabel'))}:</span> ${escapeHtml(t('readinessWrongProgress', { count: wrongCount }))}`;

  const items = [
    {
      id: 'system-mocks',
      type: 'system',
      checked: mockChecked,
      title: t('readinessMockTitle'),
      info: mockText
    },
    {
      id: 'system-wrongs',
      type: 'system',
      checked: wrongChecked,
      title: t('readinessWrongTitle'),
      info: wrongText
    },
    {
      id: 'masterMemory',
      type: 'self',
      checked: state.readinessSelfChecked.masterMemory,
      title: t('readinessMasterTitle'),
      info: escapeHtml(t('readinessMasterInfo'))
    },
    {
      id: 'confusingPairs',
      type: 'self',
      checked: state.readinessSelfChecked.confusingPairs,
      title: t('readinessPairsTitle'),
      info: escapeHtml(t('readinessPairsInfo'))
    },
    {
      id: 'triggerDrills',
      type: 'self',
      checked: state.readinessSelfChecked.triggerDrills,
      title: t('readinessDrillsTitle'),
      info: escapeHtml(t('readinessDrillsInfo'))
    },
    {
      id: 'officialQs',
      type: 'self',
      checked: state.readinessSelfChecked.officialQs,
      title: t('readinessOfficialTitle'),
      info: escapeHtml(t('readinessOfficialInfo'))
    }
  ];

  container.innerHTML = items.map(item => {
    const icon = item.checked && item.type !== 'self'
      ? `<div style="color: var(--success); display: flex; align-items: center; justify-content: center; width: 22px; height: 22px; border-radius: 50%; background: rgba(16, 185, 129, 0.15); border: 1.5px solid var(--success);">${ICONS.check}</div>`
      : item.type === 'system'
        ? `<div style="color: var(--text-muted); display: flex; align-items: center; justify-content: center; width: 22px; height: 22px; border-radius: 50%; background: rgba(255,255,255,0.05); border: 1.5px solid var(--card-border-hover); font-size: 0.75rem; font-weight: 700;">⏱️</div>`
        : `<input type="checkbox" id="chk-${item.id}" ${item.checked ? 'checked' : ''} style="width: 20px; height: 20px; cursor: pointer; accent-color: var(--success);">`;

    return `
      <div class="glass-card" style="padding: 1rem 1.25rem; display: flex; align-items: center; gap: 1.25rem; background: rgba(255,255,255,0.01); border: 1px solid var(--card-border);">
        <div style="flex-shrink: 0;">
          ${icon}
        </div>
        <div style="flex-grow: 1;">
          <div style="font-size: 0.95rem; font-weight: 700; color: ${item.checked ? 'white' : 'var(--text-primary)'};">
            ${escapeHtml(item.title)}
          </div>
          <div style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 0.15rem;">
            ${item.info}
          </div>
        </div>
      </div>
    `;
  }).join('');

  // Attach event listeners for checkboxes
  items.forEach(item => {
    if (item.type === 'self') {
      const chk = document.getElementById(`chk-${item.id}`);
      if (chk) {
        chk.addEventListener('change', (e) => {
          state.readinessSelfChecked[item.id] = e.target.checked;
          saveData();
          renderReadinessAudit();
        });
      }
    }
  });
}

function hasReadinessPracticeActivity() {
  return (Number(state.stats.totalAnswersCount) || 0) > 0 ||
    (state.progress.examHistory || []).length > 0 ||
    Object.keys(state.progress.questionStats || {}).length > 0;
}

function getReadinessItems() {
  const scoresAbove80 = state.stats.examScores.filter(score => Number(score) >= 80).length;
  const mockChecked = scoresAbove80 >= 2;
  const wrongCount = state.wrongAnswers.length;
  const hasPractice = hasReadinessPracticeActivity();
  const wrongChecked = hasPractice && wrongCount < 5;

  return [
    {
      id: 'system-mocks',
      type: 'system',
      checked: mockChecked,
      title: t('readinessMockTitle'),
      info: mockChecked
        ? t('readinessMockAchieved', { count: scoresAbove80 })
        : t('readinessMockProgress', { count: scoresAbove80 }),
      action: 'mock',
      actionLabel: t('readinessActionMock')
    },
    {
      id: 'system-wrongs',
      type: 'system',
      checked: wrongChecked,
      title: t('readinessWrongTitle'),
      info: !hasPractice
        ? t('readinessWrongEmpty')
        : wrongChecked
          ? t('readinessWrongAchieved', { count: wrongCount })
          : t('readinessWrongProgress', { count: wrongCount }),
      action: 'wrongs',
      actionLabel: t('readinessActionWrongs')
    },
    {
      id: 'masterMemory',
      type: 'self',
      checked: !!state.readinessSelfChecked.masterMemory,
      title: t('readinessMasterTitle'),
      info: t('readinessMasterInfo'),
      action: 'master',
      actionLabel: t('readinessActionMaster')
    },
    {
      id: 'confusingPairs',
      type: 'self',
      checked: !!state.readinessSelfChecked.confusingPairs,
      title: t('readinessPairsTitle'),
      info: t('readinessPairsInfo'),
      action: 'pairs',
      actionLabel: t('readinessActionPairs')
    },
    {
      id: 'triggerDrills',
      type: 'self',
      checked: !!state.readinessSelfChecked.triggerDrills,
      title: t('readinessDrillsTitle'),
      info: t('readinessDrillsInfo'),
      action: 'drills',
      actionLabel: t('readinessActionDrills')
    },
    {
      id: 'officialQs',
      type: 'self',
      checked: !!state.readinessSelfChecked.officialQs,
      title: t('readinessOfficialTitle'),
      info: t('readinessOfficialInfo'),
      action: 'official',
      actionLabel: t('readinessActionOfficial')
    }
  ];
}

function updateReadinessMeters(items) {
  const completeCount = items.filter(item => item.checked).length;
  const totalCount = items.length;
  const percent = totalCount ? Math.round((completeCount / totalCount) * 100) : 0;

  ['stat-readiness', 'readiness-overall-count'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = `${completeCount}/${totalCount}`;
  });

  const readinessPill = document.getElementById('stat-readiness-pill');
  if (readinessPill) {
    readinessPill.setAttribute('aria-label', `Open readiness gate: ${completeCount} of ${totalCount} checks complete`);
  }

  const progressBar = document.getElementById('readiness-progress-bar');
  if (progressBar) progressBar.style.width = `${percent}%`;
}

function renderReadinessDashboard() {
  const items = getReadinessItems();
  updateReadinessMeters(items);
}

function renderReadinessAudit() {
  const container = document.getElementById('readiness-checklist-container');
  if (!container) return;

  const items = getReadinessItems();
  updateReadinessMeters(items);

  container.innerHTML = items.map(item => {
    const marker = item.type === 'self'
      ? `<input type="checkbox" id="chk-${item.id}" ${item.checked ? 'checked' : ''} aria-label="${escapeHtml(item.title)}">`
      : item.checked ? ICONS.check : '!';
    const label = item.type === 'system' ? t('readinessMeasuredLabel') : t('readinessSelfCheckLabel');
    const statusLabel = item.checked ? t('readinessAchievedLabel') : t('readinessProgressLabel');

    return `
      <article class="readiness-check ${item.checked ? 'is-complete' : ''}">
        <div class="readiness-check-marker">${marker}</div>
        <div>
          <span class="readiness-check-label">${escapeHtml(label)}</span>
          <div class="readiness-check-title">${escapeHtml(item.title)}</div>
          <div class="readiness-check-info"><strong>${escapeHtml(statusLabel)}:</strong> ${escapeHtml(item.info)}</div>
          <button class="btn btn-secondary readiness-check-action" type="button" data-readiness-action="${escapeHtml(item.action)}">
            ${escapeHtml(item.actionLabel)}
          </button>
        </div>
      </article>
    `;
  }).join('');

  items.forEach(item => {
    if (item.type === 'self') {
      const chk = document.getElementById(`chk-${item.id}`);
      if (chk) {
        chk.addEventListener('change', event => {
          state.readinessSelfChecked[item.id] = event.target.checked;
          saveData();
          renderReadinessAudit();
          renderReadinessDashboard();
        });
      }
    }
  });

  container.querySelectorAll('[data-readiness-action]').forEach(button => {
    button.addEventListener('click', () => handleReadinessAction(button.getAttribute('data-readiness-action')));
  });
}

function handleReadinessAction(action) {
  if (action === 'mock') {
    document.getElementById('exam-select-dialog').classList.add('active');
    return;
  }
  if (action === 'wrongs') {
    startPractice('review');
    return;
  }
  if (action === 'master') {
    startTrainer();
    return;
  }
  if (action === 'pairs') {
    startGuide('pairs');
    return;
  }
  if (action === 'drills') {
    startDrills();
    return;
  }
  if (action === 'official') {
    window.open('https://docs.aws.amazon.com/aws-certification/latest/cloud-practitioner-02/cloud-practitioner-02.html', '_blank', 'noopener,noreferrer');
  }
}

function openReadinessGate() {
  if (state.currentMode === 'exam') {
    exitExamEarly();
    return;
  }
  startGuide('strategy');
}

// Daily Study Block Planner & Timer Logic
function initPlanner() {
  renderPlannerTimeline();
  updatePlannerTimerDisplay();
}

function renderPlannerTimeline() {
  const container = document.getElementById('planner-timeline');
  if (!container) return;
  
  const steps = plannerState.plans[plannerState.activePlan];
  container.innerHTML = steps.map((step, idx) => {
    const isActive = idx === plannerState.currentStepIndex;
    const isCompleted = idx < plannerState.currentStepIndex;
    let cardStyle = 'background: rgba(255, 255, 255, 0.01); border: 1px solid var(--card-border);';
    let dotColor = 'rgba(255, 255, 255, 0.2)';
    
    if (isActive) {
      cardStyle = 'background: rgba(14, 165, 233, 0.08); border: 1.5px solid var(--secondary); box-shadow: 0 0 15px rgba(14, 165, 233, 0.15);';
      dotColor = 'var(--secondary)';
    } else if (isCompleted) {
      cardStyle = 'background: rgba(16, 185, 129, 0.03); border: 1px solid rgba(16, 185, 129, 0.2); opacity: 0.75;';
      dotColor = 'var(--success)';
    }

    return `
      <div class="glass-card" style="padding: 1.25rem; display: flex; align-items: center; gap: 1rem; transition: all 0.3s; ${cardStyle}">
        <div style="width: 12px; height: 12px; border-radius: 50%; background: ${dotColor}; flex-shrink: 0;"></div>
        <div style="flex-grow: 1;">
          <h4 style="font-size: 0.95rem; font-weight: 700; color: ${isActive ? 'white' : 'var(--text-primary)'}; margin-bottom: 0.15rem;">
            Step ${idx + 1}: ${step.name}
          </h4>
          <p style="font-size: 0.8rem; color: var(--text-secondary); margin: 0;">${step.desc}</p>
        </div>
        <div style="font-weight: 700; font-size: 0.9rem; color: ${isActive ? 'var(--secondary)' : 'var(--text-muted)'};">
          ${step.duration} min
        </div>
      </div>
    `;
  }).join('');
}

// Fullscreen Guided Study Block workspace logic
const GUIDED_SECTION_CATEGORIES = {
  1: ["Cloud Concepts & Global Infrastructure", "Shared Responsibility Model"],
  2: ["Security Services", "Management & Governance"],
  3: ["Compute, Containers & Serverless", "Storage Services", "Networking & Content Delivery"],
  4: ["Databases & Analytics", "Application Integration", "Migration & Transfer"],
  5: ["Billing, Pricing & Support", "Pricing Models", "Machine Learning & Small Categories", "Developer Tools & Deployment"]
};

function startGuidedStudyBlock(planMin, sectionId) {
  state.currentMode = 'guided-study';
  
  const steps = plannerState.plans[planMin];
  guidedStudyState = {
    activePlan: planMin,
    currentStepIndex: 0,
    timeRemaining: steps[0].duration * 60,
    selectedSection: parseInt(sectionId),
    isRunning: false,
    timerInterval: null,
    practiceAnswers: {},
    practiceSubmitted: new Set(),
    practiceQuestionsList: [],
    wrongCardsList: []
  };
  
  // TTS cancel
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
  
  // Set titles in view
  document.getElementById('guided-block-title').innerText = `Guided Study Block (${planMin} Mins)`;
  document.getElementById('guided-block-subtitle').innerText = `Focusing on: Day ${sectionId} - ${SECTIONS[sectionId].title}`;
  
  updateGuidedBlockProgress();
  renderGuidedTimeline();
  renderGuidedWorkspace();
  updateGuidedTimerDisplay();
  
  showView('planner-active-view');
  startGuidedTimer();
}

function renderGuidedWorkspace() {
  const container = document.getElementById('guided-workspace-content');
  if (!container) return;
  
  const stepIdx = guidedStudyState.currentStepIndex;
  const sectionId = guidedStudyState.selectedSection;
  
  if (stepIdx === 0) {
    // STEP 1: Master Memory Page
    container.innerHTML = `
      <div class="glass-card" style="padding: 2rem; margin-bottom: 2rem;">
        <h3 style="margin-bottom: 1.5rem; border-bottom: 1px solid var(--card-border); padding-bottom: 0.5rem; display: flex; align-items: center; gap: 0.5rem;">
          🧠 Active Recall: Master Memory Sentence
          <button class="btn btn-primary" id="btn-guided-tts" style="margin-left: auto; padding: 0.5rem 1rem; font-size: 0.85rem;">🔊 Read Out Loud</button>
        </h3>
        <p style="font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 1.5rem;">
          Read through the core sentence out loud. Click any service-concept pair below to trigger text-to-speech for that specific anchor.
        </p>
        <div id="guided-sentence-container" style="font-size: 1.15rem; font-weight: 500; color: var(--text-primary); text-align: justify; line-height: 2; margin-bottom: 1.5rem;">
          <!-- Interactive master items -->
        </div>
      </div>
    `;
    
    const sContainer = document.getElementById('guided-sentence-container');
    sContainer.innerHTML = '';
    MASTER_ITEMS.forEach(item => {
      const pair = document.createElement('button');
      pair.type = 'button';
      pair.className = 'sentence-pair sentence-pair-button';
      pair.innerHTML = '<strong></strong> = <span></span>';
      pair.querySelector('strong').textContent = item.service;
      pair.querySelector('span').textContent = item.concept;
      pair.addEventListener('click', () => speakSinglePair(item.service, item.concept));
      sContainer.appendChild(pair);
      sContainer.appendChild(document.createTextNode('. '));
    });
    
    document.getElementById('btn-guided-tts').addEventListener('click', toggleGuidedTTS);
    
  } else if (stepIdx === 1) {
    // STEP 2: Read Section Cheat Sheet
    if (sectionId === 1) {
      // Day 1 Foundations
      container.innerHTML = `
        <div class="glass-card" style="padding: 2rem; margin-bottom: 2rem; max-height: 70vh; overflow-y: auto;">
          <h3 style="margin-bottom: 1.5rem; border-bottom: 1px solid var(--card-border); padding-bottom: 0.5rem; color: var(--secondary);">Day 1: Cloud Concepts Foundations</h3>
          <div style="overflow-x: auto; margin-bottom: 2rem;">
            <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.95rem;">
              <thead>
                <tr style="border-bottom: 2px solid var(--card-border-hover); color: var(--secondary);">
                  <th style="padding: 0.5rem;">Concept</th>
                  <th style="padding: 0.5rem;">Meaning / Hook</th>
                </tr>
              </thead>
              <tbody>
                ${CONCEPTS.map(c => `
                  <tr style="border-bottom: 1px solid var(--card-border);">
                    <td style="padding: 0.6rem 0.5rem; font-weight: 700; color: white;">${c.concept}</td>
                    <td style="padding: 0.6rem 0.5rem; color: var(--text-secondary);">${c.hook}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <h3 style="margin-bottom: 1.5rem; border-bottom: 1px solid var(--card-border); padding-bottom: 0.5rem; color: var(--accent-purple);">Shared Responsibility Matrix</h3>
          <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 1rem;">AWS secures the cloud. Customer secures what they put in the cloud.</p>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 2rem;">
            <div style="background: rgba(14, 165, 233, 0.04); border: 1px solid rgba(14, 165, 233, 0.15); border-radius: 8px; padding: 1rem;">
              <h4 style="color: var(--secondary); font-size: 0.9rem; margin-bottom: 0.75rem;">🛡️ AWS (OF the Cloud)</h4>
              <ul style="padding-left: 1rem; font-size: 0.8rem; color: var(--text-secondary); line-height: 1.6;">
                ${SHARED_RESPONSIBILITY.map(r => `<li>${r.aws}</li>`).join('')}
              </ul>
            </div>
            <div style="background: rgba(217, 70, 239, 0.04); border: 1px solid rgba(217, 70, 239, 0.15); border-radius: 8px; padding: 1rem;">
              <h4 style="color: var(--accent-purple); font-size: 0.9rem; margin-bottom: 0.75rem;">🔑 Customer (IN the Cloud)</h4>
              <ul style="padding-left: 1rem; font-size: 0.8rem; color: var(--text-secondary); line-height: 1.6;">
                ${SHARED_RESPONSIBILITY.map(r => `<li>${r.customer}</li>`).join('')}
              </ul>
            </div>
          </div>

          <h3 style="margin-bottom: 1.5rem; border-bottom: 1px solid var(--card-border); padding-bottom: 0.5rem;">Common Scenarios</h3>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem;">
            ${RESPONS_QAS.map(qa => `
              <div class="guide-qa-card" style="padding: 1rem; background: rgba(255,255,255,0.01); border: 1px solid var(--card-border);">
                <div class="guide-qa-question" style="font-size: 0.9rem; color: white;">${qa.q}</div>
                <div class="guide-qa-answer" style="font-size: 0.85rem; color: var(--success); font-weight: 700; margin-top: 0.25rem;">Answer: ${qa.a}</div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    } else {
      // Days 2 to 5 services
      const categories = GUIDED_SECTION_CATEGORIES[sectionId] || [];
      const serviceNames = [];
      
      const cardsHtml = categories.map(cat => {
        const services = SERVICE_DIRECTORY[cat] || [];
        services.forEach(s => serviceNames.push(s.name.toLowerCase()));
        
        return `
          <div style="margin-bottom: 2rem;">
            <h4 style="color: var(--secondary); font-size: 1.1rem; font-weight: 700; margin-bottom: 1rem; border-bottom: 1px solid var(--card-border); padding-bottom: 0.25rem;">
              ${cat}
            </h4>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1rem;">
              ${services.map(s => `
                <div class="directory-service-card" style="padding: 1.25rem;">
                  <div class="directory-service-name" style="font-size: 1.05rem;">${s.name}</div>
                  <div class="directory-service-desc" style="font-size: 0.8rem; margin: 0.5rem 0;">${s.desc}</div>
                  <div class="directory-service-triggers" style="font-size: 0.75rem;">🔑 ${s.triggers}</div>
                </div>
              `).join('')}
            </div>
          </div>
        `;
      }).join('');

      // Filter traps
      const relevantTraps = HIGH_YIELD_TRAPS.filter(t => {
        return serviceNames.some(name => t.answer.toLowerCase().includes(name) || t.question.toLowerCase().includes(name));
      });

      const trapsHtml = relevantTraps.length > 0
        ? `
          <div style="margin-top: 2rem; padding-top: 1.5rem; border-top: 1px solid var(--card-border);">
            <h4 style="color: var(--warning); font-size: 1.1rem; font-weight: 700; margin-bottom: 1rem;">⚠️ Section Triggers & Traps</h4>
            <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.9rem;">
              <tbody>
                ${relevantTraps.map(t => `
                  <tr style="border-bottom: 1px solid var(--card-border);">
                    <td style="padding: 0.5rem; font-weight: 600; color: white;">If question says "${t.question}"</td>
                    <td style="padding: 0.5rem; font-weight: 700; color: var(--warning);">Answer: ${t.answer}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `
        : '';

      container.innerHTML = `
        <div class="glass-card" style="padding: 2rem; margin-bottom: 2rem; max-height: 70vh; overflow-y: auto;">
          <h3 style="margin-bottom: 1.5rem; border-bottom: 1px solid var(--card-border); padding-bottom: 0.5rem; color: var(--secondary);">
            Section Cheat Sheet & Service Index
          </h3>
          ${cardsHtml}
          ${trapsHtml}
        </div>
      `;
    }
    
  } else if (stepIdx === 2) {
    // STEP 3: Active Recall Matching Board
    container.innerHTML = `
      <div class="glass-card" style="padding: 2rem; margin-bottom: 2rem;">
        <h3 style="margin-bottom: 0.5rem; color: var(--secondary);">Active Recall Matching Drill</h3>
        <p style="color: var(--text-secondary); font-size: 0.85rem; margin-bottom: 2rem;">
          Select the correct concept definition for the AWS services below. All services correspond to today's focus section.
        </p>
        <div id="guided-matching-container" style="display: flex; flex-direction: column; gap: 1rem; margin-bottom: 2rem;">
          <!-- Loaded dynamically -->
        </div>
        <div style="display: flex; gap: 1rem; justify-content: flex-end;">
          <button class="btn btn-secondary" id="btn-guided-matching-reset">Reset Board</button>
          <button class="btn btn-primary" id="btn-guided-matching-submit">Check Matches</button>
        </div>
      </div>
    `;
    
    initGuidedMatching();
    
  } else if (stepIdx === 3) {
    // STEP 4: Practice Quiz
    container.innerHTML = `
      <div class="glass-card" style="padding: 2.25rem; margin-bottom: 1rem;" id="guided-practice-box">
        <!-- Practice Question Rendered Here -->
      </div>
      <div class="explanation-box" id="guided-practice-explanation">
        <!-- Rendered on submit -->
      </div>
      <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 1rem;">
        <button class="btn btn-secondary" id="btn-guided-practice-prev" style="display: none;">Previous</button>
        <div style="font-size: 0.85rem; color: var(--text-muted); font-weight: 600;" id="guided-practice-progress-text">
          Question 1 of 10
        </div>
        <button class="btn btn-primary" id="btn-guided-practice-next" style="display: none;">Next Question</button>
      </div>
    `;
    
    initGuidedPracticeQuiz();
    
  } else if (stepIdx === 4) {
    // STEP 5: Wrong-Answer Flashcards
    container.innerHTML = `
      <div style="max-width: 550px; margin: 0 auto; width: 100%;">
        <div id="guided-wrong-flashcard-deck" style="width: 100%;">
          <!-- Rendered dynamically -->
        </div>
      </div>
    `;
    
    // Shuffle wrong cards for this session
    guidedStudyState.wrongCardsList = shuffleArray([...state.wrongAnswers]);
    guidedStudyState.currentWrongCardIndex = 0;
    
    renderGuidedWrongCards();
  }
}

function getSectionMasterItems(sectionId) {
  const serviceNames = [];
  if (sectionId === 1) {
    return MASTER_ITEMS.filter(item => {
      return ["EC2", "Lambda", "Fargate", "Elastic Beanstalk", "S3", "EBS", "EFS", "S3 Glacier", "VPC", "CloudFront", "Route 53", "RDS/Aurora", "DynamoDB", "IAM"].includes(item.service);
    });
  }
  const categories = GUIDED_SECTION_CATEGORIES[sectionId] || [];
  categories.forEach(cat => {
    if (SERVICE_DIRECTORY[cat]) {
      SERVICE_DIRECTORY[cat].forEach(s => serviceNames.push(s.name.toLowerCase()));
    }
  });
  return MASTER_ITEMS.filter(item => serviceNames.includes(item.service.toLowerCase()));
}

let guidedMatchingState = {
  services: [],
  concepts: [],
  selectedAnswers: {}
};

function initGuidedMatching() {
  guidedMatchingState.selectedAnswers = {};
  const sectionItems = getSectionMasterItems(guidedStudyState.selectedSection);
  
  // Choose up to 5 items randomly
  const shuffledItems = shuffleArray([...sectionItems]);
  const chosenItems = shuffledItems.slice(0, Math.min(5, shuffledItems.length));
  
  guidedMatchingState.services = chosenItems.map((item, idx) => ({ ...item, index: idx }));
  guidedMatchingState.concepts = shuffleArray(chosenItems.map(item => item.concept));
  
  const container = document.getElementById('guided-matching-container');
  if (!container) return;
  
  container.innerHTML = guidedMatchingState.services.map((item, idx) => `
    <div class="matching-pair-row" id="guided-matching-row-${idx}" style="grid-template-columns: 150px 1fr; gap: 1rem;">
      <div class="matching-service-label" style="font-weight: 700;">${item.service}</div>
      <div>
        <select class="matching-select guided-matching-select" data-index="${idx}" style="width: 100%; max-width: 450px;">
          <option value="">Choose concept...</option>
          ${guidedMatchingState.concepts.map(c => `<option value="${escapeHtml(c)}">${c}</option>`).join('')}
        </select>
      </div>
    </div>
  `).join('');
  
  container.querySelectorAll('.guided-matching-select').forEach(select => {
    select.addEventListener('change', (e) => {
      const index = parseInt(e.target.getAttribute('data-index'));
      guidedMatchingState.selectedAnswers[index] = e.target.value;
    });
  });
  
  document.getElementById('btn-guided-matching-reset').onclick = initGuidedMatching;
  document.getElementById('btn-guided-matching-submit').onclick = checkGuidedMatchingAnswers;
}

function checkGuidedMatchingAnswers() {
  let allMatched = true;
  let answerGiven = false;
  
  guidedMatchingState.services.forEach((item, idx) => {
    const selectVal = guidedMatchingState.selectedAnswers[idx];
    const row = document.getElementById(`guided-matching-row-${idx}`);
    if (!row) return;
    
    row.classList.remove('matching-correct', 'matching-incorrect');
    
    if (selectVal) {
      answerGiven = true;
      const isCorrect = selectVal === item.concept;
      if (isCorrect) {
        row.classList.add('matching-correct');
      } else {
        row.classList.add('matching-incorrect');
        allMatched = false;
        
        let selectContainer = row.querySelector('div:last-child');
        let tip = selectContainer.querySelector('.matching-tip');
        if (!tip) {
          tip = document.createElement('div');
          tip.className = 'matching-tip';
          tip.style.fontSize = '0.75rem';
          tip.style.marginTop = '0.25rem';
          tip.style.color = 'var(--error)';
          tip.innerHTML = `Correct: <strong>${escapeHtml(item.concept)}</strong>`;
          selectContainer.appendChild(tip);
        }
      }
    } else {
      row.classList.add('matching-incorrect');
      allMatched = false;
    }
  });
  
  if (!answerGiven) {
    showToast("Please make at least one selection first!");
    return;
  }
  
  if (allMatched) {
    showToast("Amazing! All matches are correct! 🎉", "success");
  } else {
    showToast("Some matches are incorrect. Review the corrections and try again!");
  }
}

function initGuidedPracticeQuiz() {
  guidedStudyState.practiceAnswers = {};
  guidedStudyState.practiceSubmitted = new Set();
  guidedStudyState.practiceCurrentIndex = 0;
  
  const list = QUESTIONS.filter(q => Number(q.section) === Number(guidedStudyState.selectedSection));
  const shuffled = shuffleArray([...list]);
  
  guidedStudyState.practiceQuestionsList = shuffled.slice(0, 10).map(q => shuffleQuestionOptions(q));
  
  renderGuidedPracticeQuestion();
}

function renderGuidedPracticeQuestion() {
  const idx = guidedStudyState.practiceCurrentIndex;
  const list = guidedStudyState.practiceQuestionsList;
  
  if (!list || list.length === 0) {
    document.getElementById('guided-practice-box').innerHTML = `
      <div style="text-align: center; padding: 2rem;">
        <h4 style="color: var(--secondary);">No practice questions found for this section!</h4>
      </div>
    `;
    return;
  }
  
  const q = list[idx];
  const userAns = guidedStudyState.practiceAnswers[idx];
  // Answered = explicitly submitted. While selecting multi-select options the
  // question is NOT yet answered, so buttons stay clickable until Submit.
  const answered = guidedStudyState.practiceSubmitted && guidedStudyState.practiceSubmitted.has(idx);

  document.getElementById('guided-practice-progress-text').innerText = `Question ${idx + 1} of ${list.length}`;

  const qBox = document.getElementById('guided-practice-box');
  markExamWording(qBox);
  const multiText = q.isMulti ? `<span style="display:block; font-size:0.85rem; color:var(--warning); margin-top:0.5rem; font-weight:700;">⚠️ Choose exactly ${q.multiCount} options.</span>` : '';
  
  qBox.innerHTML = `
    <div class="question-number" style="color: var(--secondary);">Question ${idx + 1} of ${list.length} (ID #${q.id})</div>
    <div class="question-text">${escapeHtml(q.question)}${multiText}</div>
    <div class="options-list" id="guided-practice-options"></div>
  `;
  
  const optionsList = document.getElementById('guided-practice-options');
  
  q.options.forEach((opt, oIdx) => {
    const letter = String.fromCharCode(65 + oIdx);
    const btn = document.createElement('button');
    btn.className = 'option-btn';

    if (answered) {
      btn.disabled = true;
      const correctLetters = q.isMulti ? q.answer.split(',') : [q.answer];
      const userLetters = Array.isArray(userAns) ? userAns : [userAns];

      const isLetterCorrect = correctLetters.includes(letter);
      const isLetterSelected = userLetters.includes(letter);

      if (isLetterCorrect) {
        btn.classList.add('correct');
      } else if (isLetterSelected) {
        btn.classList.add('incorrect');
      } else {
        btn.classList.add('muted');
      }
    } else {
      btn.addEventListener('click', () => {
        if (q.isMulti) {
          let selections = Array.isArray(guidedStudyState.practiceAnswers[idx]) ? [...guidedStudyState.practiceAnswers[idx]] : [];
          if (selections.includes(letter)) {
            selections = selections.filter(l => l !== letter);
          } else {
            if (selections.length >= q.multiCount) {
              selections.shift();
            }
            selections.push(letter);
          }
          guidedStudyState.practiceAnswers[idx] = selections;
          renderGuidedPracticeQuestion();
        } else {
          submitGuidedPracticeAnswer(letter);
        }
      });
    }

    if (!answered) {
      if (q.isMulti && Array.isArray(guidedStudyState.practiceAnswers[idx]) && guidedStudyState.practiceAnswers[idx].includes(letter)) {
        btn.classList.add('selected');
      } else if (!q.isMulti && guidedStudyState.practiceAnswers[idx] === letter) {
        btn.classList.add('selected');
      }
    }

    btn.innerHTML = `<span class="option-letter">${letter}</span> <span class="option-text"></span>`;
    btn.querySelector('.option-text').textContent = opt;
    optionsList.appendChild(btn);
  });

  if (q.isMulti && !answered) {
    const selections = guidedStudyState.practiceAnswers[idx] || [];
    const submitBtn = document.createElement('button');
    submitBtn.className = 'btn btn-primary';
    submitBtn.style.marginTop = '1rem';
    submitBtn.style.width = '100%';
    submitBtn.innerText = `Submit Choices (${selections.length}/${q.multiCount})`;
    submitBtn.disabled = selections.length !== q.multiCount;
    submitBtn.onclick = () => {
      submitGuidedPracticeAnswer(guidedStudyState.practiceAnswers[idx]);
    };
    qBox.appendChild(submitBtn);
  }

  const explanationBox = document.getElementById('guided-practice-explanation');
  markExamWording(explanationBox);
  if (answered) {
    const isCorrect = q.isMulti
      ? (Array.isArray(userAns) && [...userAns].sort().join(',') === q.answer)
      : userAns === q.answer;

    explanationBox.className = `explanation-box active ${isCorrect ? '' : 'incorrect-explanation'}`;
    explanationBox.innerHTML = `
      <div class="explanation-header ${isCorrect ? 'correct-text' : 'incorrect-text'}">
        ${isCorrect ? ICONS.check : ICONS.x} ${isCorrect ? 'Correct Answer' : 'Incorrect Answer'} (Correct: ${escapeHtml(q.answer)})
      </div>
      <div class="explanation-text">${escapeHtml(q.explanation)}</div>
      ${buildOptionRationaleHtml(q, userAns)}
    `;
    document.getElementById('btn-guided-practice-next').style.display = 'inline-flex';
  } else {
    explanationBox.classList.remove('active');
    document.getElementById('btn-guided-practice-next').style.display = 'none';
  }
  
  document.getElementById('btn-guided-practice-prev').style.display = idx > 0 ? 'inline-flex' : 'none';
  
  document.getElementById('btn-guided-practice-prev').onclick = () => {
    if (guidedStudyState.practiceCurrentIndex > 0) {
      guidedStudyState.practiceCurrentIndex--;
      renderGuidedPracticeQuestion();
    }
  };
  
  document.getElementById('btn-guided-practice-next').onclick = () => {
    if (guidedStudyState.practiceCurrentIndex < list.length - 1) {
      guidedStudyState.practiceCurrentIndex++;
      renderGuidedPracticeQuestion();
    } else {
      showToast("Practice quiz complete! Moving to next step.", "success");
      advanceStudyBlockStep();
    }
  };
}

function submitGuidedPracticeAnswer(ansVal) {
  const idx = guidedStudyState.practiceCurrentIndex;
  const q = guidedStudyState.practiceQuestionsList[idx];

  guidedStudyState.practiceAnswers[idx] = ansVal;
  if (!guidedStudyState.practiceSubmitted) guidedStudyState.practiceSubmitted = new Set();
  guidedStudyState.practiceSubmitted.add(idx);

  const isCorrect = q.isMulti
    ? (Array.isArray(ansVal) && [...ansVal].sort().join(',') === q.answer)
    : ansVal === q.answer;
    
  state.stats.totalAnswersCount++;
  if (isCorrect) {
    state.stats.correctAnswersCount++;
    state.wrongAnswers = state.wrongAnswers.filter(id => id !== q.id);
  } else {
    if (!state.wrongAnswers.includes(q.id)) {
      state.wrongAnswers.push(q.id);
    }
  }
  recordQuestionProgress(q, isCorrect);
  saveData();
  renderGuidedPracticeQuestion();
  updateDashboardStats();
}

function renderGuidedWrongCards() {
  const deck = document.getElementById('guided-wrong-flashcard-deck');
  if (!deck) return;
  markExamWording(deck);
  
  const list = guidedStudyState.wrongCardsList || [];
  
  if (list.length === 0) {
    deck.innerHTML = `
      <div class="glass-card" style="padding: 3rem 2rem; text-align: center;">
        <div style="font-size: 3rem; margin-bottom: 1rem;">🎉</div>
        <h3 style="font-size: 1.25rem; margin-bottom: 0.5rem; color: var(--success);">All Mastered!</h3>
        <p style="color: var(--text-secondary); font-size: 0.9rem; line-height: 1.6;">
          You have no wrong answers to review in this session. Excellent job!
        </p>
      </div>
    `;
    return;
  }
  
  if (guidedStudyState.currentWrongCardIndex >= list.length) {
    guidedStudyState.currentWrongCardIndex = 0;
  }
  if (guidedStudyState.currentWrongCardIndex < 0) {
    guidedStudyState.currentWrongCardIndex = 0;
  }
  
  const qId = list[guidedStudyState.currentWrongCardIndex];
  const q = findQuestionById(qId);
  
  if (!q) {
    state.wrongAnswers = state.wrongAnswers.filter(id => id !== qId);
    guidedStudyState.wrongCardsList = guidedStudyState.wrongCardsList.filter(id => id !== qId);
    saveData();
    renderGuidedWrongCards();
    updateDashboardStats();
    return;
  }
  
  if (!state.wrongAnswerRules) {
    state.wrongAnswerRules = {};
  }
  const savedData = state.wrongAnswerRules[qId] || { keyword: '', confused: '', rule: '' };
  const answerText = getAnswerText(q);
  
  deck.innerHTML = `
    <!-- 3D Flashcard -->
    <div class="flashcard-container" id="guided-wrong-fc-element" tabindex="0" role="button" aria-label="Flip guided wrong-answer flashcard" style="height: 250px;">
      <div class="flashcard-inner">
        <div class="flashcard-front" style="padding: 1.5rem; justify-content: center; align-items: center; border-color: rgba(239, 68, 68, 0.25);">
          <div class="flashcard-title" style="position: absolute; top: 1rem;">Question Clue</div>
          <div class="flashcard-content" style="font-size: 0.95rem; font-weight: 600; line-height: 1.5; text-align: center; max-height: 160px; overflow-y: auto; color: var(--text-primary);">
            ${escapeHtml(q.question)}
          </div>
          <div class="flashcard-hint" style="position: absolute; bottom: 1rem;">Click to Flip & Reveal Answer</div>
        </div>
        <div class="flashcard-back" style="padding: 1.5rem; justify-content: center; align-items: center; border-color: rgba(16, 185, 129, 0.25);">
          <div class="flashcard-title" style="position: absolute; top: 1rem;">Correct Answer</div>
          <div class="flashcard-content" style="font-size: 1.15rem; font-weight: 800; color: #10b981; line-height: 1.4; text-align: center; max-height: 160px; overflow-y: auto;">
            ${escapeHtml(answerText)}
          </div>
          <div class="flashcard-hint" style="position: absolute; bottom: 1rem;">Click to Flip Back</div>
        </div>
      </div>
    </div>

    <!-- Active Recall Inputs -->
    <div class="glass-card" style="padding: 1.5rem; margin-top: 1rem; border: 1px solid var(--card-border);">
      <h4 style="font-size: 0.95rem; font-weight: 700; color: var(--warning); margin-bottom: 1rem; text-align: center;">
        ✍️ Missed Question Active Recall Drill
      </h4>
      
      <div style="display: flex; flex-direction: column; gap: 1rem;">
        <div>
          <label style="display: block; font-size: 0.8rem; font-weight: 700; color: var(--text-secondary); margin-bottom: 0.25rem;">
            1. What keyword did I miss?
          </label>
          <input type="text" id="gw-input-keyword" placeholder="e.g. S3 + SQL + serverless" value="${escapeHtml(savedData.keyword)}" style="width: 100%; padding: 0.6rem 0.8rem; border-radius: 6px; border: 1px solid var(--card-border); background: rgba(0,0,0,0.2); color: white; font-size: 0.9rem; outline: none;">
        </div>

        <div>
          <label style="display: block; font-size: 0.8rem; font-weight: 700; color: var(--text-secondary); margin-bottom: 0.25rem;">
            2. What wrong service did I confuse it with?
          </label>
          <input type="text" id="gw-input-confused" placeholder="e.g. Redshift" value="${escapeHtml(savedData.confused)}" style="width: 100%; padding: 0.6rem 0.8rem; border-radius: 6px; border: 1px solid var(--card-border); background: rgba(0,0,0,0.2); color: white; font-size: 0.9rem; outline: none;">
        </div>

        <div>
          <label style="display: block; font-size: 0.8rem; font-weight: 700; color: var(--text-secondary); margin-bottom: 0.25rem;">
            3. What is the one-line rule?
          </label>
          <input type="text" id="gw-input-rule" placeholder="e.g. Athena = SQL on S3. Redshift = warehouse." value="${escapeHtml(savedData.rule)}" style="width: 100%; padding: 0.6rem 0.8rem; border-radius: 6px; border: 1px solid var(--card-border); background: rgba(0,0,0,0.2); color: white; font-size: 0.9rem; outline: none;">
        </div>
      </div>

      <div style="display: flex; gap: 1rem; margin-top: 1.5rem; justify-content: space-between; align-items: center;">
        <div style="font-size: 0.8rem; color: var(--text-muted); font-weight: 600;">
          Card ${guidedStudyState.currentWrongCardIndex + 1} of ${list.length}
        </div>
        <button class="btn btn-primary" id="btn-guided-wrong-mastered" style="background: linear-gradient(135deg, var(--success), #059669); color: white; font-size: 0.85rem; padding: 0.5rem 1rem;">
          Mark as Mastered
        </button>
      </div>
    </div>

    <!-- Navigation -->
    <div style="display: flex; gap: 1rem; width: 100%; margin-top: 1rem;">
      <button class="btn btn-secondary" id="btn-guided-wrong-prev" style="flex: 1;">Previous</button>
      <button class="btn btn-secondary" id="btn-guided-wrong-next" style="flex: 1;">Next</button>
    </div>
  `;
  
  const keywordInput = document.getElementById('gw-input-keyword');
  bindFlipCardKeyboard('guided-wrong-fc-element');
  const confusedInput = document.getElementById('gw-input-confused');
  const ruleInput = document.getElementById('gw-input-rule');
  
  const saveInputs = () => {
    if (!state.wrongAnswerRules) {
      state.wrongAnswerRules = {};
    }
    state.wrongAnswerRules[qId] = {
      keyword: keywordInput.value.trim(),
      confused: confusedInput.value.trim(),
      rule: ruleInput.value.trim()
    };
    saveData();
  };
  
  keywordInput.addEventListener('input', saveInputs);
  confusedInput.addEventListener('input', saveInputs);
  ruleInput.addEventListener('input', saveInputs);
  
  document.getElementById('btn-guided-wrong-mastered').addEventListener('click', () => {
    state.wrongAnswers = state.wrongAnswers.filter(id => id !== qId);
    guidedStudyState.wrongCardsList = guidedStudyState.wrongCardsList.filter(id => id !== qId);
    saveData();
    showToast("Question marked as Mastered!", "success");
    renderGuidedWrongCards();
    updateDashboardStats();
  });
  
  document.getElementById('btn-guided-wrong-prev').addEventListener('click', () => {
    if (guidedStudyState.currentWrongCardIndex > 0) {
      guidedStudyState.currentWrongCardIndex--;
      renderGuidedWrongCards();
    } else {
      showToast("First card!");
    }
  });
  
  document.getElementById('btn-guided-wrong-next').addEventListener('click', () => {
    if (guidedStudyState.currentWrongCardIndex < guidedStudyState.wrongCardsList.length - 1) {
      guidedStudyState.currentWrongCardIndex++;
      renderGuidedWrongCards();
    } else {
      showToast("Last card!");
    }
  });
}

function renderGuidedTimeline() {
  const container = document.getElementById('guided-timeline-steps');
  if (!container) return;
  
  const steps = plannerState.plans[guidedStudyState.activePlan];
  
  container.innerHTML = steps.map((step, idx) => {
    const isActive = idx === guidedStudyState.currentStepIndex;
    const isCompleted = idx < guidedStudyState.currentStepIndex;
    
    let cardStyle = 'background: rgba(255, 255, 255, 0.01); border: 1px solid var(--card-border); cursor: pointer;';
    let dotColor = 'rgba(255, 255, 255, 0.2)';
    
    if (isActive) {
      cardStyle = 'background: rgba(14, 165, 233, 0.08); border: 1.5px solid var(--secondary); box-shadow: 0 0 15px rgba(14, 165, 233, 0.15); cursor: pointer;';
      dotColor = 'var(--secondary)';
    } else if (isCompleted) {
      cardStyle = 'background: rgba(16, 185, 129, 0.03); border: 1px solid rgba(16, 185, 129, 0.2); opacity: 0.75; cursor: pointer;';
      dotColor = 'var(--success)';
    }
    
    return `
      <div class="glass-card guided-step-card" data-index="${idx}" style="padding: 1rem; display: flex; align-items: center; gap: 0.75rem; transition: all 0.2s; ${cardStyle}">
        <div style="width: 10px; height: 10px; border-radius: 50%; background: ${dotColor}; flex-shrink: 0;"></div>
        <div style="flex-grow: 1;">
          <h4 style="font-size: 0.85rem; font-weight: 700; color: ${isActive ? 'white' : 'var(--text-primary)'}; margin: 0;">
            Step ${idx + 1}: ${step.name}
          </h4>
          <span style="font-size: 0.75rem; color: var(--text-muted);">${step.duration} min</span>
        </div>
      </div>
    `;
  }).join('');
  
  container.querySelectorAll('.guided-step-card').forEach(card => {
    card.addEventListener('click', (e) => {
      const stepCard = e.currentTarget;
      const targetIdx = parseInt(stepCard.getAttribute('data-index'));
      jumpToGuidedStep(targetIdx);
    });
  });
}

function jumpToGuidedStep(targetIdx) {
  if (targetIdx === guidedStudyState.currentStepIndex) return;
  
  pauseGuidedTimer();
  
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
  
  guidedStudyState.currentStepIndex = targetIdx;
  
  const steps = plannerState.plans[guidedStudyState.activePlan];
  guidedStudyState.timeRemaining = steps[targetIdx].duration * 60;
  
  updateGuidedBlockProgress();
  renderGuidedTimeline();
  renderGuidedWorkspace();
  updateGuidedTimerDisplay();
  startGuidedTimer();
}

function updateGuidedBlockProgress() {
  const stepsCount = 5;
  const pct = (guidedStudyState.currentStepIndex / stepsCount) * 100;
  const progressEl = document.getElementById('guided-overall-progress');
  if (progressEl) {
    progressEl.style.width = `${pct}%`;
  }
}

function startGuidedTimer() {
  if (guidedStudyState.isRunning) return;
  
  guidedStudyState.isRunning = true;
  const pauseBtn = document.getElementById('btn-guided-pause');
  if (pauseBtn) pauseBtn.innerText = "Pause";
  
  guidedStudyState.timerInterval = setInterval(() => {
    if (guidedStudyState.timeRemaining > 0) {
      guidedStudyState.timeRemaining--;
      updateGuidedTimerDisplay();
    } else {
      advanceStudyBlockStep();
    }
  }, 1000);
}

function pauseGuidedTimer() {
  guidedStudyState.isRunning = false;
  clearInterval(guidedStudyState.timerInterval);
  const pauseBtn = document.getElementById('btn-guided-pause');
  if (pauseBtn) pauseBtn.innerText = "Resume";
}

function toggleGuidedTimer() {
  if (guidedStudyState.isRunning) {
    pauseGuidedTimer();
  } else {
    startGuidedTimer();
  }
}

function updateGuidedTimerDisplay() {
  const timerEl = document.getElementById('guided-timer-display');
  if (timerEl) {
    timerEl.innerText = formatTime(guidedStudyState.timeRemaining);
  }
  
  if (guidedStudyState.timeRemaining <= 60) {
    document.getElementById('guided-timer-display').style.color = 'var(--error)';
  } else {
    document.getElementById('guided-timer-display').style.color = '';
  }
}

function skipGuidedStep() {
  advanceStudyBlockStep();
}

function exitGuidedBlock() {
  if (confirm("Are you sure you want to exit today's guided study block? Your current session progress will not be saved.")) {
    pauseGuidedTimer();
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    updateDashboardStats();
    showView('dashboard');
  }
}

function advanceStudyBlockStep() {
  pauseGuidedTimer();
  
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
  
  const steps = plannerState.plans[guidedStudyState.activePlan];
  if (guidedStudyState.currentStepIndex < steps.length - 1) {
    guidedStudyState.currentStepIndex++;
    guidedStudyState.timeRemaining = steps[guidedStudyState.currentStepIndex].duration * 60;
    
    showToast(`Step Complete! Moving to Step ${guidedStudyState.currentStepIndex + 1}: ${steps[guidedStudyState.currentStepIndex].name}`, "success");
    playBeepSound();
    
    updateGuidedBlockProgress();
    renderGuidedTimeline();
    renderGuidedWorkspace();
    updateGuidedTimerDisplay();
    startGuidedTimer();
  } else {
    playBeepSound(true);
    showToast("🎉 Congratulations! You completed your daily study block!", "success");
    updateDashboardStats();
    showView('dashboard');
  }
}

let guidedTtsUtterance = null;

function toggleGuidedTTS() {
  if (!window.speechSynthesis) {
    showToast("Speech synthesis is not supported in this browser.");
    return;
  }
  
  const readBtn = document.getElementById('btn-guided-tts');
  if (!readBtn) return;
  
  if (window.speechSynthesis.speaking) {
    window.speechSynthesis.cancel();
    readBtn.innerText = "🔊 Read Out Loud";
    showToast("TTS Reading stopped.");
  } else {
    readBtn.innerText = "⏹️ Stop Reading";
    
    const speechText = MASTER_ITEMS.map(item => {
      const cleanService = item.service.replace('/', ' or ');
      return `${cleanService} is ${item.concept}`;
    }).join(". ");
    
    guidedTtsUtterance = new SpeechSynthesisUtterance(speechText);
    guidedTtsUtterance.rate = 0.9;
    
    guidedTtsUtterance.onend = () => {
      readBtn.innerText = "🔊 Read Out Loud";
    };
    
    guidedTtsUtterance.onerror = () => {
      readBtn.innerText = "🔊 Read Out Loud";
    };
    
    window.speechSynthesis.speak(guidedTtsUtterance);
    showToast("Starting TTS Reading. Read out loud along with it!");
  }
}

function updatePlannerTimerDisplay() {
  const steps = plannerState.plans[plannerState.activePlan];
  const step = steps[plannerState.currentStepIndex];
  
  const titleEl = document.getElementById('planner-step-title');
  if (titleEl) {
    titleEl.innerText = `STEP ${plannerState.currentStepIndex + 1}: ${step.name.toUpperCase()}`;
  }
  
  const timerEl = document.getElementById('planner-timer-display');
  if (timerEl) {
    timerEl.innerText = formatTime(plannerState.timeRemaining);
  }
  
  const progressEl = document.getElementById('planner-step-progress');
  if (progressEl) {
    const totalSec = step.duration * 60;
    const elapsedSec = totalSec - plannerState.timeRemaining;
    const pct = (elapsedSec / totalSec) * 100;
    progressEl.style.width = `${pct}%`;
  }
}

function selectPlannerPlan(planMin) {
  pausePlannerTimer();
  plannerState.activePlan = planMin;
  plannerState.currentStepIndex = 0;
  
  const steps = plannerState.plans[planMin];
  plannerState.timeRemaining = steps[0].duration * 60;
  
  document.querySelectorAll('.planner-select-btn').forEach(btn => {
    if (parseInt(btn.getAttribute('data-plan')) === planMin) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
  
  initPlanner();
}

function startPlannerTimer() {
  if (plannerState.isRunning) return;
  
  plannerState.isRunning = true;
  const startBtn = document.getElementById('btn-planner-start');
  if (startBtn) startBtn.innerText = "Pause";
  
  plannerState.intervalId = setInterval(() => {
    if (plannerState.timeRemaining > 0) {
      plannerState.timeRemaining--;
      updatePlannerTimerDisplay();
    } else {
      advancePlannerStep();
    }
  }, 1000);
}

function pausePlannerTimer() {
  plannerState.isRunning = false;
  clearInterval(plannerState.intervalId);
  const startBtn = document.getElementById('btn-planner-start');
  if (startBtn) startBtn.innerText = "Start Timer";
}

function togglePlannerTimer() {
  if (plannerState.isRunning) {
    pausePlannerTimer();
  } else {
    startPlannerTimer();
  }
}

function resetPlannerTimer() {
  pausePlannerTimer();
  const steps = plannerState.plans[plannerState.activePlan];
  const step = steps[plannerState.currentStepIndex];
  plannerState.timeRemaining = step.duration * 60;
  updatePlannerTimerDisplay();
}

function skipPlannerStep() {
  advancePlannerStep();
}

function advancePlannerStep() {
  pausePlannerTimer();
  
  const steps = plannerState.plans[plannerState.activePlan];
  if (plannerState.currentStepIndex < steps.length - 1) {
    plannerState.currentStepIndex++;
    plannerState.timeRemaining = steps[plannerState.currentStepIndex].duration * 60;
    showToast(`Step Complete! Moving to Step ${plannerState.currentStepIndex + 1}: ${steps[plannerState.currentStepIndex].name}`, "success");
    playBeepSound();
    initPlanner();
  } else {
    playBeepSound(true);
    showToast("🎉 Congratulations! You completed your daily study block!", "success");
    plannerState.currentStepIndex = 0;
    plannerState.timeRemaining = steps[0].duration * 60;
    initPlanner();
  }
}

let sharedAudioContext = null;

function getSharedAudioContext() {
  if (!sharedAudioContext) {
    sharedAudioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (sharedAudioContext.state === 'suspended') {
    sharedAudioContext.resume();
  }
  return sharedAudioContext;
}

function playBeepSound(isDouble = false) {
  try {
    const ctx = getSharedAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, ctx.currentTime);
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.15);
    
    if (isDouble) {
      setTimeout(() => {
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(800, ctx.currentTime);
        gain2.gain.setValueAtTime(0.08, ctx.currentTime);
        osc2.start();
        osc2.stop(ctx.currentTime + 0.2);
      }, 200);
    }
  } catch (e) {
    // Ignore autoplay blocks
  }
}

function getProgressExportPayload() {
  loadData();
  return {
    exportedAt: new Date().toISOString(),
    app: 'cloud-recall-lab',
    version: 1,
    stats: normalizeStats(state.stats),
    wrongAnswers: normalizeIdList(state.wrongAnswers),
    wrongAnswerRules: state.wrongAnswerRules || {},
    readinessSelfChecked: normalizeReadiness(state.readinessSelfChecked),
    progress: normalizeProgress(state.progress)
  };
}

function exportProgressData() {
  const payload = getProgressExportPayload();
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `cloud-practice-progress-${getTodayKey()}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  showToast('Progress export downloaded.', 'success');
}

function importProgressData(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const payload = JSON.parse(reader.result);
      state.stats = normalizeStats(payload.stats);
      state.wrongAnswers = normalizeIdList(payload.wrongAnswers);
      state.wrongAnswerRules = payload.wrongAnswerRules && typeof payload.wrongAnswerRules === 'object'
        ? payload.wrongAnswerRules
        : {};
      state.readinessSelfChecked = normalizeReadiness(payload.readinessSelfChecked);
      state.progress = normalizeProgress(payload.progress);
      saveData();
      updateDashboardStats();
      if (state.currentView === 'history-view') renderHistoryView();
      showToast('Progress imported successfully.', 'success');
    } catch (error) {
      console.warn('Import failed', error);
      showToast('That file could not be imported. Please choose a valid progress export.', 'error');
    }
  };
  reader.readAsText(file);
}

function resetProgress(scope) {
  const labels = {
    all: 'all progress',
    exams: 'exam history',
    wrongs: 'wrong answers',
    readiness: 'readiness checks'
  };
  const label = labels[scope] || 'this data';
  if (!window.confirm(`Reset ${label}? This cannot be undone unless you exported a backup.`)) return;

  if (scope === 'all') {
    state.stats = getDefaultStats();
    state.wrongAnswers = [];
    state.wrongAnswerRules = {};
    state.readinessSelfChecked = { ...DEFAULT_READINESS };
    state.progress = getDefaultProgress();
    Object.values(STORAGE_KEYS).forEach(safeRemoveStorage);
  } else if (scope === 'exams') {
    state.stats.examsTaken = 0;
    state.stats.examScores = [];
    state.progress.examHistory = [];
  } else if (scope === 'wrongs') {
    state.wrongAnswers = [];
    state.wrongAnswerRules = {};
  } else if (scope === 'readiness') {
    state.readinessSelfChecked = { ...DEFAULT_READINESS };
  }

  saveData();
  updateDashboardStats();
  if (state.currentView === 'history-view') renderHistoryView();
  showToast(`Reset ${label}.`, 'success');
}

function getLatestExamResult() {
  loadData();
  return state.lastExamResult || (state.progress.examHistory || [])[0] || null;
}

function launchPassCelebration(scorePercent) {
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const existing = document.querySelector('.confetti-layer');
  if (existing) existing.remove();

  const layer = document.createElement('div');
  layer.className = 'confetti-layer';
  layer.setAttribute('aria-hidden', 'true');
  const colors = ['#22c55e', '#0ea5e9', '#facc15', '#f97316', '#d946ef', '#f43f5e'];

  for (let i = 0; i < 72; i++) {
    const piece = document.createElement('span');
    piece.className = 'confetti-piece';
    piece.style.left = `${Math.random() * 100}%`;
    piece.style.background = colors[i % colors.length];
    piece.style.setProperty('--confetti-x', `${Math.round((Math.random() - 0.5) * 260)}px`);
    piece.style.setProperty('--confetti-delay', `${Math.random() * 0.25}s`);
    piece.style.setProperty('--confetti-duration', `${1.35 + Math.random() * 0.95}s`);
    layer.appendChild(piece);
  }

  document.body.appendChild(layer);
  setTimeout(() => layer.remove(), 2600);
  if (scorePercent >= 90) {
    showToast(`Huge pass: ${scorePercent}%!`, 'success');
  }
}

function drawRoundedRect(ctx, x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + r);
  ctx.lineTo(x + width, y + height - r);
  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  ctx.lineTo(x + r, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function fillPill(ctx, x, y, text, options = {}) {
  const font = options.font || '800 24px Inter, Arial, sans-serif';
  const paddingX = options.paddingX || 22;
  const height = options.height || 46;
  ctx.font = font;
  const width = Math.ceil(ctx.measureText(text).width) + paddingX * 2;
  ctx.fillStyle = options.background || 'rgba(255, 255, 255, 0.08)';
  drawRoundedRect(ctx, x, y, width, height, height / 2);
  ctx.fill();
  ctx.fillStyle = options.color || '#e5e7eb';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, x + paddingX, y + height / 2 + 1);
  return width;
}

function drawScoreCardFeature(ctx, x, y, text) {
  ctx.fillStyle = 'rgba(14, 165, 233, 0.12)';
  drawRoundedRect(ctx, x, y, 250, 48, 14);
  ctx.fill();
  ctx.strokeStyle = 'rgba(125, 211, 252, 0.2)';
  ctx.stroke();
  ctx.fillStyle = '#bae6fd';
  ctx.font = '800 20px Inter, Arial, sans-serif';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, x + 18, y + 25);
}

function formatScoreDate(dateString) {
  const parsed = dateString ? new Date(dateString) : new Date();
  if (Number.isNaN(parsed.getTime())) return new Date().toLocaleDateString();
  return parsed.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

function downloadLatestScoreCard() {
  const latest = getLatestExamResult();
  if (!latest) {
    showToast('Take a mock exam first, then download a score card.', 'warning');
    return;
  }

  const canvas = document.createElement('canvas');
  canvas.width = 1200;
  canvas.height = 630;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    showToast('Your browser could not create the score card.', 'warning');
    return;
  }

  const bg = ctx.createLinearGradient(0, 0, 1200, 630);
  bg.addColorStop(0, '#07111f');
  bg.addColorStop(0.52, '#0b1220');
  bg.addColorStop(1, '#111827');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, 1200, 630);

  ctx.fillStyle = 'rgba(14, 165, 233, 0.18)';
  ctx.beginPath();
  ctx.arc(1020, 88, 220, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(217, 70, 239, 0.13)';
  ctx.beginPath();
  ctx.arc(76, 586, 250, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = 'rgba(148, 163, 184, 0.16)';
  ctx.lineWidth = 2;
  drawRoundedRect(ctx, 48, 42, 1104, 546, 28);
  ctx.stroke();

  fillPill(ctx, 86, 84, 'FREE CLF-C02 PRACTICE', {
    background: 'rgba(34, 197, 94, 0.16)',
    color: '#bbf7d0',
    font: '900 22px Inter, Arial, sans-serif',
    height: 42
  });

  ctx.fillStyle = '#f8fafc';
  ctx.font = '900 58px Inter, Arial, sans-serif';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText('Cloud Recall Lab', 86, 182);

  ctx.fillStyle = '#cbd5e1';
  ctx.font = '500 27px Inter, Arial, sans-serif';
  ctx.fillText('Active recall, timed mocks, flashcards, and local progress.', 88, 228);

  ctx.fillStyle = latest.passed ? '#22c55e' : '#fb7185';
  ctx.font = '900 132px Inter, Arial, sans-serif';
  ctx.fillText(`${Number(latest.scorePercent) || 0}%`, 86, 392);

  fillPill(ctx, 92, 420, latest.passed ? 'PASS' : 'KEEP PRACTICING', {
    background: latest.passed ? 'rgba(34, 197, 94, 0.18)' : 'rgba(244, 63, 94, 0.18)',
    color: latest.passed ? '#bbf7d0' : '#fecdd3',
    font: '900 28px Inter, Arial, sans-serif',
    height: 54
  });

  ctx.fillStyle = '#e2e8f0';
  ctx.font = '800 30px Inter, Arial, sans-serif';
  ctx.fillText(latest.label || 'Practice Mock Exam', 520, 318);

  ctx.fillStyle = '#94a3b8';
  ctx.font = '600 23px Inter, Arial, sans-serif';
  ctx.fillText(`${Number(latest.correct) || 0}/${Number(latest.total) || 0} correct`, 520, 360);
  ctx.fillText(formatScoreDate(latest.date), 520, 398);
  ctx.fillText('No login. No ads. Progress stays in your browser.', 520, 436);

  drawScoreCardFeature(ctx, 520, 470, 'Mock exams');
  drawScoreCardFeature(ctx, 790, 470, 'Flashcards');
  drawScoreCardFeature(ctx, 520, 532, 'Serverless map');
  drawScoreCardFeature(ctx, 790, 532, 'Offline-ready PWA');

  ctx.fillStyle = '#64748b';
  ctx.font = '700 18px Inter, Arial, sans-serif';
  ctx.fillText('Built by Joseph Hauter', 88, 548);

  canvas.toBlob(blob => {
    if (!blob) {
      showToast('Your browser could not export the score card.', 'warning');
      return;
    }
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `cloud-recall-lab-score-card-${new Date().toISOString().slice(0, 10)}.png`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    showToast('Score card downloaded.', 'success');
  }, 'image/png');
}

async function shareLatestScore() {
  const latest = getLatestExamResult();
  const url = getCurrentSiteUrl();
  const text = latest
    ? `I scored ${latest.scorePercent}% on ${latest.label} using Cloud Recall Lab, a free CLF-C02 active-recall study app.`
    : 'I found Cloud Recall Lab, a free CLF-C02 active-recall study app with mock exams, flashcards, serverless cheat sheets, and local progress tracking.';
  const shareData = {
    title: 'Cloud Recall Lab',
    text,
    url
  };

  try {
    if (navigator.share) {
      await navigator.share(shareData);
    } else {
      await navigator.clipboard.writeText(`${text}\n${url}`);
      window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank', 'noopener,noreferrer');
      showToast('Share text copied and LinkedIn opened.', 'success');
    }
  } catch (error) {
    if (error && error.name === 'AbortError') return;
    showToast('Could not open sharing. The score text is still ready in your history.', 'warning');
  }
}

function openHistoryView() {
  renderHistoryView();
  showView('history-view');
}

function openAboutView() {
  closeSettingsDialog();
  updateDashboardStats();
  showView('about-view');
}

function openSettingsDialog() {
  document.getElementById('settings-dialog').classList.add('active');
}

function closeSettingsDialog() {
  document.getElementById('settings-dialog').classList.remove('active');
}

function updateStudyPlanSelection(selectedBtn) {
  if (!selectedBtn) return;
  const selectedPlan = Number(selectedBtn.getAttribute('data-plan')) || 90;
  document.querySelectorAll('.select-plan-btn').forEach(btn => {
    const isSelected = btn === selectedBtn;
    btn.classList.toggle('active', isSelected);
    btn.setAttribute('aria-pressed', String(isSelected));
  });

  const label = selectedPlan === 90
    ? t('plan90')
    : selectedPlan === 120
      ? t('plan120')
      : t('plan180');
  const summary = document.getElementById('selected-plan-summary');
  if (summary) {
    summary.innerText = t('selectedPlanSummary', { label });
  }
}

function registerServiceWorker() {
  if (!('serviceWorker' in navigator) || window.location.protocol === 'file:') return;
  navigator.serviceWorker.register('./service-worker.js').catch(error => {
    console.warn('Service worker registration failed', error);
  });
}

function handleLaunchShortcut() {
  const shortcut = new URLSearchParams(window.location.search).get('shortcut');
  if (!shortcut) return;

  if (shortcut === 'exam') {
    document.getElementById('exam-select-dialog').classList.add('active');
  } else if (shortcut === 'guide') {
    startGuide();
  } else if (shortcut === 'strategy' || shortcut === 'readiness') {
    startGuide('strategy');
  } else if (shortcut === 'history') {
    openHistoryView();
  }
}

// Global Event Listeners & Bootstrapping

document.addEventListener('DOMContentLoaded', () => {
  initLanguageSupport();
  updateDashboardStats();
  registerServiceWorker();
  document.getElementById('btn-open-history').addEventListener('click', openHistoryView);
  document.getElementById('btn-open-about').addEventListener('click', openAboutView);
  document.getElementById('btn-open-settings').addEventListener('click', openSettingsDialog);
  document.getElementById('footer-open-about').addEventListener('click', openAboutView);
  document.getElementById('settings-open-about').addEventListener('click', openAboutView);
  document.getElementById('settings-close-btn').addEventListener('click', closeSettingsDialog);
  document.getElementById('settings-export-btn').addEventListener('click', exportProgressData);
  document.getElementById('settings-import-btn').addEventListener('click', () => {
    document.getElementById('settings-import-input').click();
  });
  document.getElementById('settings-import-input').addEventListener('change', event => {
    importProgressData(event.target.files[0]);
    event.target.value = '';
  });
  document.getElementById('settings-reset-exams-btn').addEventListener('click', () => resetProgress('exams'));
  document.getElementById('settings-reset-wrongs-btn').addEventListener('click', () => resetProgress('wrongs'));
  document.getElementById('settings-reset-readiness-btn').addEventListener('click', () => resetProgress('readiness'));
  document.getElementById('settings-reset-all-btn').addEventListener('click', () => resetProgress('all'));
  document.getElementById('history-share-btn').addEventListener('click', shareLatestScore);
  document.getElementById('history-back-btn').addEventListener('click', () => {
    updateDashboardStats();
    showView('dashboard');
  });
  document.getElementById('about-back-btn').addEventListener('click', () => {
    updateDashboardStats();
    showView('dashboard');
  });
  
  // Dashboard card clicks
  document.querySelectorAll('.section-card').forEach(card => {
    card.addEventListener('click', () => {
      const sectionId = card.getAttribute('data-section');
      startPractice(sectionId);
    });
  });
  
  document.getElementById('card-start-exam').addEventListener('click', () => {
    document.getElementById('exam-select-dialog').classList.add('active');
  });

  document.getElementById('stat-readiness-pill').addEventListener('click', openReadinessGate);

  document.getElementById('dialog-close-exam-select').addEventListener('click', () => {
    document.getElementById('exam-select-dialog').classList.remove('active');
  });

  document.getElementById('select-exam-random').addEventListener('click', () => {
    document.getElementById('exam-select-dialog').classList.remove('active');
    startExam('random');
  });

  document.getElementById('select-exam-mock1').addEventListener('click', () => {
    document.getElementById('exam-select-dialog').classList.remove('active');
    startExam('mock1');
  });

  document.getElementById('select-exam-mock2').addEventListener('click', () => {
    document.getElementById('exam-select-dialog').classList.remove('active');
    startExam('mock2');
  });

  document.getElementById('select-exam-mock3').addEventListener('click', () => {
    document.getElementById('exam-select-dialog').classList.remove('active');
    startExam('mock3');
  });

  document.getElementById('select-exam-final').addEventListener('click', () => {
    document.getElementById('exam-select-dialog').classList.remove('active');
    startExam('final');
  });

  document.getElementById('select-exam-readiness').addEventListener('click', () => {
    document.getElementById('exam-select-dialog').classList.remove('active');
    startExam('readiness');
  });

  document.getElementById('card-start-trainer').addEventListener('click', startTrainer);
  
  document.getElementById('btn-start-review').addEventListener('click', () => {
    startPractice('review');
  });
  
  // Brand / Back-to-Home controls
  document.querySelectorAll('.btn-home').forEach(btn => {
    btn.addEventListener('click', () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      if (state.currentMode === 'exam') {
        exitExamEarly();
      } else {
        updateDashboardStats();
        showView('dashboard');
      }
    });
  });
  
  // Practice controls
  document.getElementById('practice-prev-btn').addEventListener('click', () => {
    if (state.currentQuestionIndex > 0) {
      state.currentQuestionIndex--;
      renderPracticeQuestion();
    }
  });
  
  document.getElementById('practice-next-btn').addEventListener('click', () => {
    if (state.currentQuestionIndex < state.questionsList.length - 1) {
      state.currentQuestionIndex++;
      renderPracticeQuestion();
    } else {
      updateDashboardStats();
      showView('dashboard');
      showToast("Practice session completed!");
    }
  });
  
  // Exam controls
  document.getElementById('exam-submit-btn').addEventListener('click', submitExam);
  document.getElementById('exam-prev-btn').addEventListener('click', () => {
    if (state.currentQuestionIndex > 0) {
      state.currentQuestionIndex--;
      renderExamQuestion();
      renderExamSidebar();
    }
  });
  
  document.getElementById('exam-next-btn').addEventListener('click', () => {
    if (state.currentQuestionIndex < state.questionsList.length - 1) {
      state.currentQuestionIndex++;
      renderExamQuestion();
      renderExamSidebar();
    } else {
      // Finish exam
      // Show confirmation dialog before submitting
      submitExam();
    }
  });
  
  document.getElementById('exam-flag-btn').addEventListener('click', toggleExamFlag);
  document.getElementById('exam-exit-btn').addEventListener('click', exitExamEarly);
  
  // Dialog confirmation
  document.getElementById('dialog-cancel-exit').addEventListener('click', closeExitDialog);
  document.getElementById('dialog-confirm-exit').addEventListener('click', confirmExitExam);
  
  // Results view close
  document.getElementById('results-close-btn').addEventListener('click', () => {
    updateDashboardStats();
    showView('dashboard');
  });
  document.getElementById('results-history-btn').addEventListener('click', openHistoryView);
  document.getElementById('results-share-btn').addEventListener('click', shareLatestScore);
  document.getElementById('results-download-card-btn').addEventListener('click', downloadLatestScoreCard);

  // Trainer Tab bindings
  document.getElementById('tab-read').addEventListener('click', () => switchTrainerTab('read'));
  document.getElementById('tab-flashcard').addEventListener('click', () => switchTrainerTab('flashcard'));
  document.getElementById('tab-matching').addEventListener('click', () => switchTrainerTab('matching'));
  document.getElementById('tab-wrong-flashcards').addEventListener('click', () => {
    switchTrainerTab('wrong-flashcards');
    trainerState.wrongCardsList = shuffleArray([...state.wrongAnswers]);
    trainerState.currentWrongCardIndex = 0;
    renderWrongFlashcards();
  });

  // Read TTS bindings
  document.getElementById('btn-read-tts').addEventListener('click', toggleTTS);

  // Flashcard bindings
  document.getElementById('flashcard-element').addEventListener('click', flipFlashcard);
  document.getElementById('flashcard-element').addEventListener('keydown', event => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      flipFlashcard();
    }
  });
  document.getElementById('fc-flip-btn').addEventListener('click', flipFlashcard);
  document.getElementById('fc-next-btn').addEventListener('click', nextFlashcard);
  document.getElementById('fc-prev-btn').addEventListener('click', prevFlashcard);

  // Matching bindings
  document.getElementById('btn-matching-submit').addEventListener('click', checkMatchingAnswers);
  document.getElementById('btn-matching-reset').addEventListener('click', initTrainerMatching);
  // Guide bindings
  document.getElementById('card-start-guide').addEventListener('click', startGuide);

  document.getElementById('tab-guide-concepts').addEventListener('click', () => switchGuideTab('concepts'));
  document.getElementById('tab-guide-responsibility').addEventListener('click', () => switchGuideTab('responsibility'));
  document.getElementById('tab-guide-directory').addEventListener('click', () => switchGuideTab('directory'));
  document.getElementById('tab-guide-serverless').addEventListener('click', () => switchGuideTab('serverless'));
  document.getElementById('tab-guide-traps').addEventListener('click', () => switchGuideTab('traps'));
  document.getElementById('tab-guide-pairs').addEventListener('click', () => switchGuideTab('pairs'));
  document.getElementById('tab-guide-strategy').addEventListener('click', () => switchGuideTab('strategy'));
  document.getElementById('tab-guide-passplan').addEventListener('click', () => switchGuideTab('passplan'));
  // Guided Study launcher card
  document.getElementById('card-start-planner').addEventListener('click', () => {
    document.getElementById('study-block-select-dialog').classList.add('active');
  });

  document.getElementById('dialog-close-study-block').addEventListener('click', () => {
    document.getElementById('study-block-select-dialog').classList.remove('active');
  });

  // Select plan buttons in setup dialog
  document.querySelectorAll('.select-plan-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      updateStudyPlanSelection(e.currentTarget);
    });
  });
  updateStudyPlanSelection(document.querySelector('.select-plan-btn.active'));

  // Start guided workout button
  document.getElementById('btn-launch-guided-study').addEventListener('click', () => {
    const activeBtn = document.querySelector('.select-plan-btn.active');
    const selectedPlan = activeBtn ? parseInt(activeBtn.getAttribute('data-plan')) : 90;
    const selectedSection = document.getElementById('study-block-section-select').value;
    
    document.getElementById('study-block-select-dialog').classList.remove('active');
    startGuidedStudyBlock(selectedPlan, selectedSection);
  });

  // Guided workout active controls
  document.getElementById('btn-guided-exit').addEventListener('click', exitGuidedBlock);
  document.getElementById('btn-guided-pause').addEventListener('click', toggleGuidedTimer);
  document.getElementById('btn-guided-skip').addEventListener('click', skipGuidedStep);

  // Directory search binding
  document.getElementById('guide-search-input').addEventListener('input', (e) => {
    renderGuideDirectory(e.target.value.trim());
  });

  // Confusing pairs search binding
  document.getElementById('pairs-search-input').addEventListener('input', (e) => {
    renderGuidePairs(e.target.value.trim());
  });

  // Drills bindings
  document.getElementById('card-start-drills').addEventListener('click', startDrills);
  document.getElementById('drills-show-btn').addEventListener('click', checkDrillAnswer);
  document.getElementById('drills-next-btn').addEventListener('click', () => {
    if (drillsState.currentDrillIndex < drillsState.drillsList.length - 1) {
      drillsState.currentDrillIndex++;
      renderDrillScenario();
    } else {
      updateDashboardStats();
      showView('dashboard');
      showToast("Drills session completed!", "success");
    }
  });

  // Autocomplete init
  setupDrillsAutocomplete();

  // Mini Quiz bindings
  document.getElementById('miniquiz-form').addEventListener('submit', event => event.preventDefault());
  document.getElementById('card-start-miniquiz').addEventListener('click', startMiniQuiz);
  document.getElementById('btn-miniquiz-submit').addEventListener('click', submitMiniQuiz);
  document.getElementById('btn-miniquiz-reset').addEventListener('click', startMiniQuiz);
  handleLaunchShortcut();
});
