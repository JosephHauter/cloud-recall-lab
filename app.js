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
  en: { label: 'English', htmlLang: 'en' },
  es: { label: 'Espanol', htmlLang: 'es' },
  pt: { label: 'Portugues', htmlLang: 'pt-BR' },
  fr: { label: 'Francais', htmlLang: 'fr' },
  de: { label: 'Deutsch', htmlLang: 'de' },
  it: { label: 'Italiano', htmlLang: 'it' },
  nl: { label: 'Nederlands', htmlLang: 'nl' }
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
    builtBody1: 'I made this because so much useful exam prep sits behind paywalls, even basics like flashcards, and some generic AI/chat study workflows reveal the answer too early. That ruins the point of active recall: you need to commit first, then see feedback.',
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
    footerDisclaimer: 'This is an independent study tool and is not affiliated with, endorsed by, or sponsored by Amazon Web Services (AWS). AWS, Amazon, and the AWS logo are trademarks of Amazon.com, Inc. All questions are original practice scenarios created for educational purposes.',
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
  'Athena',
  'Glue',
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
  'Transcribe'
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
    takeaway: 'Store, query, transform, and visualize data with managed scaling.',
    services: ['S3', 'DynamoDB', 'Athena', 'Glue', 'QuickSight']
  },
  {
    title: 'Integration',
    takeaway: 'Decouple applications, route events, and coordinate workflows.',
    services: ['SQS', 'SNS', 'EventBridge', 'Step Functions']
  },
  {
    title: 'AI services',
    takeaway: 'Use managed ML capabilities without training or hosting your own model infrastructure.',
    services: ['Comprehend', 'Rekognition', 'Textract', 'Translate', 'Polly', 'Transcribe']
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

function applyLanguage(lang = 'en') {
  const safeLang = SUPPORTED_LANGUAGES[lang] ? lang : 'en';
  const copy = { ...I18N.en, ...(I18N[safeLang] || {}) };
  state.language = safeLang;
  document.documentElement.lang = SUPPORTED_LANGUAGES[safeLang].htmlLang;

  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (copy[key]) el.textContent = copy[key];
  });

  document.querySelectorAll('#language-select, #settings-language-select').forEach(select => {
    select.value = safeLang;
  });
}

function setLanguage(lang, showNotice = true) {
  const safeLang = SUPPORTED_LANGUAGES[lang] ? lang : 'en';
  saveLanguage(safeLang);
  applyLanguage(safeLang);
  if (showNotice) {
    showToast((I18N[safeLang] && I18N[safeLang].languageToast) || I18N.en.languageToast, 'success');
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

function exitExamEarly() {
  document.getElementById('confirm-exit-dialog').classList.add('active');
}

function closeExitDialog() {
  document.getElementById('confirm-exit-dialog').classList.remove('active');
}

function confirmExitExam() {
  clearInterval(state.timerInterval);
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
  reviewList.innerHTML = '';
  
  state.questionsList.forEach((q, idx) => {
    const uAns = state.userAnswers[idx];
    const item = document.createElement('div');
    item.className = 'review-item';
    
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
function startGuide() {
  state.currentMode = 'guide';
  
  // Reset tabs UI
  switchGuideTab('concepts');
  
  // Render sub-sections
  renderGuideConcepts();
  renderGuideResponsibility();
  renderGuideDirectory();
  renderGuideServerless();
  renderGuideTraps();
  renderGuidePairs();
  renderGuideStrategy();
  renderGuidePassPlan();

  showView('study-view');
}

function switchGuideTab(tabId) {
  // Update tabs UI
  document.querySelectorAll('.tab-guide-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  document.getElementById(`tab-guide-${tabId}`).classList.add('active');
  
  // Update panes
  document.querySelectorAll('.guide-pane').forEach(pane => {
    pane.style.display = 'none';
  });
  document.getElementById(`pane-guide-${tabId}`).style.display = 'block';

  if (tabId === 'planner') {
    initPlanner();
  }
}

// Render the 7-Day Pass Plan + proven strategies + exam-day checklist
function renderGuidePassPlan() {
  const daysEl = document.getElementById('pass-plan-days');
  if (daysEl) {
    daysEl.innerHTML = (PASS_PLAN.days || []).map(d => `
      <div class="glass-card" style="padding: 1.25rem 1.5rem;">
        <div style="display: flex; justify-content: space-between; align-items: baseline; gap: 1rem; flex-wrap: wrap; margin-bottom: 0.75rem;">
          <h4 style="font-size: 1rem; font-weight: 800; color: var(--warning); margin: 0;">Day ${d.day}: ${d.focus}</h4>
          <span style="font-size: 0.8rem; color: var(--text-muted); font-weight: 700;">⏱️ ${d.hours}</span>
        </div>
        <ul style="padding-left: 1.1rem; margin: 0 0 0.6rem; font-size: 0.88rem; line-height: 1.7; color: var(--text-secondary);">
          ${d.do.map(t => `<li>${t}</li>`).join('')}
        </ul>
        <div style="font-size: 0.8rem; color: var(--success); border-left: 2px solid var(--success); padding-left: 0.75rem;">
          <strong>Why:</strong> ${d.why}
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
  return isServerlessService(serviceName)
    ? '<span class="serverless-badge">Serverless</span>'
    : '';
}

function renderGuideServerless() {
  const summary = document.getElementById('serverless-summary-grid');
  if (summary) {
    summary.innerHTML = [
      { value: SERVERLESS_SERVICE_NAMES.size, label: 'exam-relevant services flagged' },
      { value: '5', label: 'mental buckets: compute, APIs, data, integration, AI' },
      { value: 'No servers', label: 'but IAM, data, cost, and config still matter' }
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
        <span>${group.services.length} services</span>
      </div>
      <div class="serverless-card-grid">
        ${group.services.map(name => {
          const info = getServiceInfo(name);
          return `
            <div class="serverless-service-card">
              <div class="directory-service-name">${escapeHtml(name)} ${renderServerlessBadge(name)}</div>
              <div class="directory-service-desc">${escapeHtml(info ? info.desc : 'Managed AWS service')}</div>
              <div class="directory-service-triggers">Key trigger: ${escapeHtml(info ? info.triggers : 'serverless')}</div>
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
      <div class="directory-category-title">${category} (${filtered.length})</div>
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
        <div class="directory-service-triggers">Key trigger: ${escapeHtml(s.triggers)}</div>
      `;
      grid.appendChild(card);
    });
  });
  
  if (container.innerHTML === '') {
    container.innerHTML = `<div style="text-align: center; color: var(--text-muted); margin-top: 2rem;">No services found matching "${escapeHtml(filterText)}".</div>`;
  }
}

function renderGuideTraps() {
  const tbody = document.getElementById('table-traps-body');
  tbody.innerHTML = HIGH_YIELD_TRAPS.map(item => {
    const key = item.question || item.name;
    return `<tr>
      <td style="font-weight: 700; color: var(--text-primary);">If the question says "${key}"...</td>
      <td style="font-weight: 700; color: var(--warning);">The correct answer is "${item.answer}"</td>
    </tr>`;
  }).join('');
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
}

function renderGuidePairs(filterText = '') {
  const container = document.getElementById('pairs-directory-container');
  container.innerHTML = '';
  
  const query = filterText.toLowerCase();
  
  const filtered = CONFUSING_PAIRS.filter(item => {
    return item.pair.toLowerCase().includes(query) || 
           item.hook.toLowerCase().includes(query);
  });
  
  filtered.forEach(item => {
    const card = document.createElement('div');
    card.className = 'glass-card';
    card.style.padding = '1.5rem';
    card.style.display = 'flex';
    card.style.flexDirection = 'column';
    card.style.gap = '0.75rem';
    card.style.border = '1px solid var(--card-border)';
    
    card.innerHTML = `
      <h4 style="color: var(--secondary); font-size: 1.15rem; font-weight: 800; border-bottom: 1px solid var(--card-border); padding-bottom: 0.5rem; display: flex; align-items: center; gap: 0.5rem;">
        🔄 ${item.pair}
      </h4>
      <p style="font-size: 0.9rem; line-height: 1.7; color: var(--text-secondary); text-align: justify;">
        ${item.hook.replace('How to choose:', '<strong>How to choose:</strong>')}
      </p>
    `;
    container.appendChild(card);
  });
  
  if (filtered.length === 0) {
    container.innerHTML = `<div style="text-align: center; color: var(--text-muted); margin-top: 2rem; grid-column: 1 / -1;">No confusing pairs found matching "${escapeHtml(filterText)}".</div>`;
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
  document.getElementById('drills-card-id').innerText = `SCENARIO #${idx + 1}`;
  document.getElementById('drills-scenario-text').innerText = drill.scenario;
  
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

function startMiniQuiz() {
  state.currentMode = 'miniquiz';
  miniquizQuestions = shuffleArray([...MINI_MIXED_QUIZ]);
  
  const container = document.getElementById('miniquiz-questions-list');
  container.innerHTML = '';
  
  // Reset submit button visibility
  document.getElementById('btn-miniquiz-submit').style.display = 'inline-flex';
  
  // Create all service options for datalist if it doesn't exist
  let datalist = document.getElementById('aws-services-datalist');
  if (!datalist) {
    datalist = document.createElement('datalist');
    datalist.id = 'aws-services-datalist';
    const allServices = Array.from(new Set([
      ...Object.values(SERVICE_DIRECTORY).flat().map(s => s.name),
      ...RAPID_DRILLS.map(d => d.answer),
      ...MINI_MIXED_QUIZ.map(q => q.answer)
    ])).sort();
    
    allServices.forEach(service => {
      const option = document.createElement('option');
      option.value = service;
      datalist.appendChild(option);
    });
    document.body.appendChild(datalist);
  }
  
  miniquizQuestions.forEach((q, idx) => {
    const item = document.createElement('div');
    item.className = 'matching-pair-row';
    item.id = `miniquiz-row-${idx}`;
    item.style.gridTemplateColumns = '25px 1fr 200px';
    
    item.innerHTML = `
      <div style="font-weight: 700; color: var(--text-muted);">${idx + 1}.</div>
      <div style="font-weight: 600; color: var(--text-primary); font-size: 0.95rem;">${escapeHtml(q.question)}</div>
      <div>
        <input type="text" list="aws-services-datalist" class="matching-select miniquiz-input" data-index="${idx}" placeholder="AWS Service..." style="background: rgba(11, 15, 25, 0.6); border: 1px solid var(--card-border-hover); padding: 0.5rem 0.75rem; border-radius: 6px; color: white; width: 100%;" autocomplete="off">
      </div>
    `;
    container.appendChild(item);
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
    const val = input.value.trim();
    const row = document.getElementById(`miniquiz-row-${idx}`);
    
    row.classList.remove('matching-correct', 'matching-incorrect');
    input.disabled = true;
    
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
      const selectContainer = row.querySelector('div:last-child');
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

function renderReadinessAudit() {
  const container = document.getElementById('readiness-checklist-container');
  if (!container) return;

  // 1. Mock Exam Milestone
  const scoresAbove80 = state.stats.examScores.filter(s => s >= 80).length;
  const mockChecked = scoresAbove80 >= 2;
  const mockText = mockChecked
    ? `<span style="color: var(--success); font-weight: 600;">Achieved!</span> You scored 80%+ on ${scoresAbove80} mocks.`
    : `<span style="color: var(--text-muted);">In Progress:</span> Need 80%+ on 2 mocks (Currently: ${scoresAbove80}).`;

  // 2. Weak Area Mastery
  const wrongCount = state.wrongAnswers.length;
  const wrongChecked = wrongCount < 5;
  const wrongText = wrongChecked
    ? `<span style="color: var(--success); font-weight: 600;">Achieved!</span> Wrong-answer pool is small (${wrongCount} items).`
    : `<span style="color: var(--text-muted);">In Progress:</span> Keep wrong-answer pool under 5 (Currently: ${wrongCount}).`;

  const items = [
    {
      id: 'system-mocks',
      type: 'system',
      checked: mockChecked,
      title: "Score 80%+ on at least 2 mocks",
      info: mockText
    },
    {
      id: 'system-wrongs',
      type: 'system',
      checked: wrongChecked,
      title: "Maintain a small wrong-answers pool",
      info: wrongText
    },
    {
      id: 'masterMemory',
      type: 'self',
      checked: state.readinessSelfChecked.masterMemory,
      title: "Explain the Master Memory Page without looking",
      info: "Self-Check: Can you recall the 47 service anchors easily?"
    },
    {
      id: 'confusingPairs',
      type: 'self',
      checked: state.readinessSelfChecked.confusingPairs,
      title: "Instantly distinguish the top confusing pairs",
      info: "Self-Check: CloudWatch vs CloudTrail, WAF vs Shield vs GuardDuty, SQS vs SNS, etc."
    },
    {
      id: 'triggerDrills',
      type: 'self',
      checked: state.readinessSelfChecked.triggerDrills,
      title: "Score 80%+ on the Rapid Trigger Drills",
      info: "Self-Check: Practice matching scenarios to their triggers in under 2 seconds."
    },
    {
      id: 'officialQs',
      type: 'self',
      checked: state.readinessSelfChecked.officialQs,
      title: "Complete the official AWS practice questions",
      info: "Self-Check: Go through official practice materials to align with the final wording."
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
            ${item.title}
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
    app: 'cloud-practitioner-practice-hub',
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
    ? '90 minutes'
    : selectedPlan === 120
      ? '2 hours'
      : '3 hours';
  const summary = document.getElementById('selected-plan-summary');
  if (summary) {
    summary.innerText = `Selected: ${label}`;
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
  
  // Logo / Back-to-Home controls
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
