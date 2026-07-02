# Contributing

Thanks for helping improve Cloud Practitioner Practice Hub.

## Good Contributions

- Original CLF-C02 practice questions
- Clearer explanations and per-option rationale
- Accessibility, mobile, or browser compatibility fixes
- Bug fixes with a short reproduction note
- Documentation improvements

## Question Quality Rules

- Do not copy real exam questions, braindumps, or paid course material.
- Make questions scenario-based, not trivia-only.
- Keep all options plausible.
- Randomize correct answer positions.
- Include a clear explanation.
- Add `rationale` entries when possible so learners understand why distractors are wrong.
- Use factual AWS service names descriptively. Do not imply AWS endorsement.

## Data Format

Questions belong in `questions.js`, `mock_exams.js`, or `final_exam.js`. Keep IDs unique across all pools.

```js
{
  id: 9999,
  section: 3,
  question: "A company needs ... Which service should they choose?",
  options: ["A. ...", "B. ...", "C. ...", "D. ..."],
  answer: "C",
  explanation: "C is correct because ...",
  rationale: [
    "A: ...",
    "B: ...",
    "C: ...",
    "D: ..."
  ]
}
```

## Before Opening a PR

- Run the app locally and click through the changed flow.
- Check the browser console for errors.
- Confirm mobile width around 390px does not overflow.
- Confirm no new external scripts or trackers were added.
- Run `node tools/release-audit.js`.
- Use the PR template and include screenshots or notes for UI changes.

## Community Expectations

- Be kind and specific when reporting problems.
- Flag outdated AWS wording with a source link when possible.
- Do not ask for or share real exam questions.
- Prefer GitHub issues for bugs, corrections, and feature requests so the project stays searchable.
