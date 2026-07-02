const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const fail = [];
const warn = [];

function read(file) {
  return fs.readFileSync(path.join(root, file), 'utf8');
}

function assert(condition, message) {
  if (!condition) fail.push(message);
}

function note(condition, message) {
  if (!condition) warn.push(message);
}

function runQuestionFiles() {
  const ctx = vm.createContext({ console });
  ['questions.js', 'mock_exams.js', 'final_exam.js'].forEach(file => {
    vm.runInContext(read(file), ctx, { filename: file });
  });
  return {
    QUESTIONS: vm.runInContext('QUESTIONS', ctx),
    MOCK_EXAM_1: vm.runInContext('MOCK_EXAM_1', ctx),
    MOCK_EXAM_2: vm.runInContext('MOCK_EXAM_2', ctx),
    MOCK_EXAM_3: vm.runInContext('MOCK_EXAM_3', ctx),
    FINAL_PRESSURE_TEST: vm.runInContext('FINAL_PRESSURE_TEST', ctx),
    FINAL_READINESS_EXAM: vm.runInContext('FINAL_READINESS_EXAM', ctx)
  };
}

function answerLetters(q) {
  const raw = Array.isArray(q.answers) ? q.answers : String(q.answer || '').split(/[^A-D]/i);
  return raw.map(value => String(value).trim().toUpperCase()).filter(Boolean);
}

function auditQuestionPools(pools) {
  const globalIds = new Map();
  const expectedCounts = {
    MOCK_EXAM_1: 50,
    MOCK_EXAM_2: 50,
    MOCK_EXAM_3: 65,
    FINAL_PRESSURE_TEST: 50,
    FINAL_READINESS_EXAM: 65
  };

  Object.entries(pools).forEach(([name, list]) => {
    assert(Array.isArray(list), `${name} must be an array`);
    if (!Array.isArray(list)) return;

    const ids = new Set();
    const sections = {};
    const answers = {};
    let multi = 0;

    list.forEach((q, index) => {
      const id = Number(q && q.id);
      const loc = `${name}[${index}] id=${q && q.id}`;
      assert(Number.isFinite(id), `${loc}: missing numeric id`);
      assert(!ids.has(id), `${loc}: duplicate id inside ${name}`);
      ids.add(id);
      assert(!globalIds.has(id), `${loc}: duplicate global id also in ${globalIds.get(id)}`);
      globalIds.set(id, name);

      assert(typeof q.question === 'string' && q.question.trim().length > 12, `${loc}: question text is missing/too short`);
      assert(Array.isArray(q.options) && q.options.length >= 4, `${loc}: expected at least 4 options`);
      assert(typeof q.explanation === 'string' && q.explanation.trim().length > 8, `${loc}: explanation is missing/too short`);

      const letters = answerLetters(q);
      assert(letters.length > 0, `${loc}: missing answer`);
      if (letters.length > 1 || q.isMulti) multi++;
      letters.forEach(letter => {
        const optionIndex = letter.charCodeAt(0) - 65;
        assert(optionIndex >= 0 && q.options && optionIndex < q.options.length, `${loc}: answer ${letter} outside options`);
        answers[letter] = (answers[letter] || 0) + 1;
      });

      sections[q.section || 'none'] = (sections[q.section || 'none'] || 0) + 1;
    });

    if (expectedCounts[name]) {
      assert(list.length === expectedCounts[name], `${name} expected ${expectedCounts[name]} questions, found ${list.length}`);
    }
    if (name === 'MOCK_EXAM_1' || name === 'MOCK_EXAM_2') {
      assert((sections[1] || 0) >= 10, `${name} should include at least 10 Cloud Concepts questions`);
    }
    if (name === 'FINAL_PRESSURE_TEST') {
      note(multi >= 8, `${name} has fewer multi-select questions than expected`);
    }

    console.log(`${name}: count=${list.length} sections=${JSON.stringify(sections)} answers=${JSON.stringify(answers)} multi=${multi}`);
  });

  const totalPracticeItems = Object.values(pools).reduce((sum, list) => sum + list.length, 0);
  assert(totalPracticeItems >= 380, `README claims 380+ questions, but audit counted ${totalPracticeItems}`);
}

function auditStaticFiles() {
  const index = read('index.html');
  const app = read('app.js');
  const study = read('study_data.js');
  const sw = read('service-worker.js');
  const readme = read('README.md');
  const manifest = JSON.parse(read('manifest.json'));

  assert(!/on(click|submit|change|input)=/i.test(index), 'index.html should not contain inline event handlers');
  assert(!/Perfect Pass Pack/i.test(index + app + readme), 'Remove outdated "Perfect Pass Pack" copy');
  assert(!/70 randomized questions|70 randomly compiled questions|70 Questions|70 Qs/i.test(index), 'Comprehensive mock copy should not say 70 questions');
  assert(index.includes('Cloud Recall Lab') && readme.includes('Cloud Recall Lab'), 'Cloud Recall Lab branding is missing');
  assert(index.includes('why-card') && index.includes('Meets Competencies'), 'Why/proof homepage section is missing');
  assert(index.includes('id="stat-readiness-pill"') && index.includes('id="stat-readiness"'), 'Header readiness pill is missing');
  assert(!index.includes('readiness-summary-card'), 'Readiness should stay out of the homepage card stack');
  assert(index.includes('https://www.credly.com/badges/c52c14ed-17c7-4b4f-9c18-a0b8fc22ff6c/public_url'), 'Credly verification link is missing');
  assert(index.includes('id="language-select"'), 'Header language selector is missing');
  assert(index.includes('id="settings-language-select"'), 'Settings language selector is missing');
  assert(index.includes('value="it"') && index.includes('value="nl"') && index.includes('value="hi"') && index.includes('value="ja"'), 'Expanded language options are missing');
  assert(index.includes('data-i18n'), 'Translated UI markers are missing');
  assert(index.includes('data-i18n-placeholder'), 'Translated placeholder markers are missing');
  assert(index.includes('id="tab-guide-serverless"'), 'Serverless map tab is missing');
  assert(index.includes('guideTabServerless') && index.includes('readinessTitle') && index.includes('readiness-gate-card'), 'Study guide readiness gate is missing');
  assert(index.includes('source-map-card') && index.includes('official-source-links'), 'Official source map section is missing');
  assert(index.includes('id="selected-plan-summary"') && index.includes('aria-pressed="true"'), 'Guided study duration selection feedback is missing');
  assert(app.includes('SERVERLESS_SERVICE_NAMES'), 'Serverless service list is missing');
  assert(study.includes('Aurora Serverless v2') && app.includes('Aurora Serverless v2'), 'Serverless map should include Aurora Serverless v2 without marking plain Aurora as serverless');
  assert(app.includes('Redshift Serverless') && app.includes('OpenSearch Serverless') && app.includes('Data Firehose'), 'Serverless map should include key serverless analytics variants');
  assert(study.includes('services: [') && study.includes('decision:') && app.includes('pair-service-panel'), 'Confusing pairs should use structured comparison cards');
  assert(app.includes("item.checked && item.type !== 'self'"), 'Readiness self-checks should remain toggleable checkboxes');
  assert(app.includes('renderGuideServerless'), 'Serverless map renderer is missing');
  assert(app.includes('resetExamSessionState'), 'Exam exit should clear stale exam state');
  assert(/function confirmExitExam\(\)\s*\{[\s\S]*?resetExamSessionState\(\);[\s\S]*?\}/.test(app), 'Confirming exam exit should reset exam session state');
  assert(/function exitExamEarly\(\)\s*\{[\s\S]*?state\.currentMode !== 'exam'[\s\S]*?\}/.test(app), 'Exam exit should not prompt after exam mode is already cleared');
  assert(app.includes('SERVICE_CATEGORY_LABELS'), 'Localized service category labels are missing');
  assert(index.includes('id="results-download-card-btn"'), 'Score-card download button is missing');
  assert(app.includes('downloadLatestScoreCard'), 'Score-card download generator is missing');
  assert(app.includes('launchPassCelebration'), 'Pass celebration polish is missing');
  assert(app.includes('prepareComprehensiveMockPool(65)'), 'Random comprehensive mock should use 65 questions');
  assert(app.includes('SUPPORTED_LANGUAGES'), 'Language support dictionary is missing');
  assert(sw.includes('cloud-recall-lab-v19'), 'Service worker cache should be bumped to v19');
  assert(sw.includes("caches.match('./index.html')"), 'Service worker should fall back to the app shell offline');
  assert(sw.includes('RUNTIME_CACHE_ORIGINS'), 'Service worker should restrict runtime third-party cache origins');
  assert(index.includes('https://cdnjs.buymeacoffee.com'), 'Buy Me a Coffee script host missing from CSP/page');
  assert(!index.includes('bmc-header-button') && !index.includes('bmc-footer-button') && !index.includes('bmc-settings-button'), 'Buy Me a Coffee button should appear only in About/Contact');
  assert(index.includes('https://fonts.googleapis.com') && index.includes('https://fonts.gstatic.com'), 'CSP should allow the BMC font stylesheet/font hosts');
  assert(index.includes('https://www.udemy.com/share/103a093'), 'Udemy resource link is missing from the About page');
  assert(index.includes('cert-value-card') && app.includes('certValueBody') && index.includes('https://aws.amazon.com/certification/'), 'Certification value section is missing');
  assert(index.includes('https://aws.amazon.com/certification/certification-agreement/'), 'AWS Certification Program Agreement link is missing');
  assert(index.includes('integrity-card') && app.includes('integrityBody3'), 'Exam integrity policy is missing from the site');
  assert(index.includes('not AWS certification exam materials') && readme.includes('Exam Integrity'), 'Certification integrity disclaimers are incomplete');
  assert(index.includes('https://docs.aws.amazon.com/aws-certification/latest/cloud-practitioner-02/cloud-practitioner-02.html'), 'Official AWS exam guide link is missing');
  assert(study.includes('OFFICIAL_SOURCE_LINKS') && study.includes('OFFICIAL_SCOPE_ANCHORS') && study.includes('OFFICIAL_AVOID_ANCHORS'), 'Official source/boundary data is missing');
  assert(readme.includes('clf-technologies-concepts.html') && readme.includes('clf-02-in-scope-services.html') && readme.includes('clf-02-out-of-scope-services.html'), 'README official AWS source links are incomplete');
  assert(index.includes('rel="canonical"'), 'Canonical URL is missing');
  assert(index.includes('apple-touch-icon'), 'Apple touch icon is missing');
  assert(app.includes('handleLaunchShortcut'), 'PWA launch shortcut handler is missing');

  assert(manifest.id === './', 'Manifest id should be set for install identity');
  assert(manifest.display === 'standalone', 'Manifest display should be standalone');
  assert(Array.isArray(manifest.categories) && manifest.categories.includes('education'), 'Manifest should include education category');
  assert(Array.isArray(manifest.screenshots) && manifest.screenshots.length > 0, 'Manifest screenshots are missing');
  assert(Array.isArray(manifest.shortcuts) && manifest.shortcuts.length >= 3, 'Manifest shortcuts are missing');
  assert((manifest.icons || []).some(icon => icon.sizes === '192x192' && /maskable/.test(icon.purpose || '')), 'Manifest 192 maskable icon missing');
  assert((manifest.icons || []).some(icon => icon.sizes === '512x512' && /maskable/.test(icon.purpose || '')), 'Manifest 512 maskable icon missing');

  [
    'CODE_OF_CONDUCT.md',
    'COMMUNITY.md',
    'ROADMAP.md',
    'SECURITY.md',
    '.github/PULL_REQUEST_TEMPLATE.md',
    '.github/ISSUE_TEMPLATE/bug_report.yml',
    '.github/ISSUE_TEMPLATE/feature_request.yml',
    '.github/ISSUE_TEMPLATE/question_correction.yml'
  ].forEach(file => assert(fs.existsSync(path.join(root, file)), `Missing community file: ${file}`));

  const ids = [...index.matchAll(/\sid="([^"]+)"/g)].map(match => match[1]);
  const duplicates = ids.filter((id, idx) => ids.indexOf(id) !== idx);
  assert(duplicates.length === 0, `Duplicate HTML ids found: ${[...new Set(duplicates)].join(', ')}`);

  const scriptFiles = [...index.matchAll(/<script src="([^"]+)"/g)]
    .map(match => match[1])
    .filter(src => !/^https?:\/\//.test(src));
  scriptFiles.forEach(file => assert(fs.existsSync(path.join(root, file)), `Missing script file: ${file}`));

  const localAssets = [
    ...[...index.matchAll(/(?:href|src|content)="([^"]+\.(?:css|json|svg|png|js))"/g)].map(match => match[1]),
    ...[...sw.matchAll(/'(\.\/[^']+)'/g)].map(match => match[1].replace(/^\.\//, ''))
  ].filter(asset => !asset.startsWith('http') && !asset.startsWith('data:'));

  [...new Set(localAssets)].forEach(asset => {
    const clean = asset.replace(/^\.\//, '');
    assert(fs.existsSync(path.join(root, clean)), `Missing local asset: ${asset}`);
  });
}

function main() {
  auditQuestionPools(runQuestionFiles());
  auditStaticFiles();

  if (warn.length) {
    console.warn('\nWarnings:');
    warn.forEach(message => console.warn(`- ${message}`));
  }

  if (fail.length) {
    console.error('\nRelease audit failed:');
    fail.forEach(message => console.error(`- ${message}`));
    process.exit(1);
  }

  console.log('\nRelease audit passed.');
}

main();
