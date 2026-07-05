# Frontend Interview

A structured question bank for evaluating Frontend Engineers from Junior to Senior level.
Built around a single **data table** as the central UI scenario so all questions feel grounded and practical rather than abstract.

---

## Why This Approach Exists

### The AI shift changes what we need to measure

In 2024 and beyond, AI tools like GitHub Copilot, Cursor, and ChatGPT can generate syntactically correct code for most common patterns on demand. A developer who does not remember the exact name of an RxJS operator, or who has not memorized the Angular change detection API surface, is no longer necessarily a weak developer. They reach for AI assistance and get a working answer in seconds.

This means **syntax recall and framework API knowledge are increasingly poor signals of actual engineering quality.** Spending 30 minutes of an interview checking whether a candidate remembers the exact parameters of a lifecycle hook is a poor investment of everyone's time.

What AI cannot do is reason about trade-offs on behalf of the engineer. It cannot tell you when to use optimistic update versus pessimistic update, what the failure mode is when two HTTP requests race each other, or why sharing a singleton store between five independent tables on the same page is the wrong architectural decision. Those judgements require experience, mental models, and the ability to think in systems. **That is what this framework measures.**

### One scenario. Many dimensions.

Rather than jumping between disconnected topics, all questions in this framework orbit one concrete artifact. a data table. Every frontend engineer has built or used a table. The scenario is universal and does not favor candidates from any particular company or tech stack.

The table serves as a shared reference point. When you ask "how would you handle race conditions here," both you and the candidate are looking at the same thing. The conversation becomes natural rather than academic.

### Framework agnostic by design

Questions are phrased in terms of concepts and behavior rather than framework-specific APIs. A candidate who has only worked with Vue should be able to answer a question about debouncing a filter just as well as a React or Angular developer. The reasoning is the same. Only the syntax differs, and syntax is the part AI handles well.

---

## Strengths of This Approach

**It rewards systems thinking over memorization.**
Good answers reveal how a candidate models a problem, not just whether they know a specific function name. A senior who says "it depends on the dataset size and whether the API supports projection" when asked about client versus server filtering is demonstrating far more than one who recites the correct operator.

**It scales across levels naturally.**
The same table scenario supports questions ranging from "what do you show while the data loads" at junior level to "how do you version the contract between a Shell and a Remote in a micro-frontend" at senior level. No context switching needed.

**It surfaces the Red Flags column.**
The most underrated part of this framework is not the questions. It is the "Red Flags to Watch For" column in the Excel file. Most interviews end with interviewers comparing subjective impressions. This column documents specific patterns of shallow reasoning so that different interviewers calibrate to the same standard. When a candidate says "frontend enforcement is enough" on a security question, that is not a matter of opinion. It is a documented red flag regardless of who is conducting the interview.

**It is a question bank, not a script.**
150 questions exist so that an interviewer can choose freely based on the candidate, the role, and how the conversation is flowing. No interview should use all 150. Pick 8 to 15 that fit the role level and follow the thread wherever it leads.

---

## Points to Keep in Mind

**The Red Flags column is a guide, not a verdict.**
A candidate who triggers a red flag on one question is not automatically disqualified. Consider the full conversation. Someone who gives a shallow first answer but reasons their way to the correct conclusion when pushed is showing strong learning behaviour. Someone who doubles down on the wrong answer when gently challenged is showing a different signal entirely. Use the column to notice patterns, not to score individual questions in isolation.

**Micro-frontend questions assume specific experience.**
Group 8 covers Module Federation, singleton shared libraries, Remote error boundaries, and contract testing. Not every senior frontend engineer has worked in a micro-frontend architecture. A senior with 8 years in a well-engineered monolith who cannot answer Group 8 questions is not necessarily a weak candidate. Label roles that require micro-frontend experience explicitly before using those questions.

**Some questions benefit from a coding exercise alongside them.**
Reasoning about debounce and request cancellation is good. Actually writing the implementation is better. For mid and senior candidates, consider pairing one or two questions with a short live coding prompt using the same scenario. "You just described how switchMap cancels the previous request. Show me a minimal version of that." This combination is more revealing than either approach alone.

**Adapt language and framing per candidate.**
The question bank uses precise technical vocabulary. With a junior candidate, you may need to rephrase to avoid signalling the answer through the question itself. With a senior candidate, briefer questions open more space for them to define the scope of their answer, which is itself revealing.

---

## Interview Board UI

Open the board via the local server at **http://localhost:3001/interview-board.html**.

The board lets you:

- **Browse all 150+ questions** grouped by category with level indicators.
- **Star questions** you want to focus on. Stars persist across sessions.
- **Highlight rows** during the interview by clicking the card body. The highlighted row turns yellow in the UI and is also written as a yellow row in `Frontend-Interview.xlsx`.
- **Add custom questions** to any group. Additions are saved to the Excel file.
- **Filter by group or level** to quickly find questions appropriate for the candidate.
- **Export your starred set** as plain text to paste into notes.
- **Sync to generator** — click the "Sync to generator" button to write the current question bank (including any custom additions) back into `generate-excel.js` so it can be committed to git.

To reset all stars, highlights, and custom questions, click "Clear Session" in the header.

> **Offline mode.** If the server is not running, the board falls back to the hardcoded question list and saves state to browser localStorage only. Yellow highlighting in Excel will not work in offline mode.

---

## Excel File

### Output file

`Frontend-Interview.xlsx` — created and maintained by the local server.

### Sheet contents

**Sheet 1. Overview.**
Summary of all 12 groups with target level, question count, and key topics.

**Sheet 2. All Questions and Answers.**
Every question with "Key Points to Evaluate" and "Red Flags to Watch For" columns. Rows highlighted in the UI board appear yellow in this sheet. Print this sheet and keep it face-down during the interview.

**Sheet 3. Figma and Design Resources.**
Free Figma Community links for each group with direct URLs and usage notes.

**Sheet 4. InterviewState** (hidden, managed by server).
Stores stars, highlights, and custom questions as JSON so state survives server restarts.

---

## Developer Setup

Requirements: Node.js v18 or later, npm.

### First-time setup

```bash
# 1. Install dependencies
npm install

# 2. Generate Frontend-Interview.xlsx from the question bank
node generate-excel.js
node create-xlsx.js

# 3. Start the local server
node server.js
```

Open **http://localhost:3001/interview-board.html** in your browser.

### Daily use

```bash
node server.js
```

Open **http://localhost:3001/interview-board.html**.

The green **🟢 Server :3001** badge in the header confirms the server is connected. If the badge is missing, the board runs in offline mode (no Excel sync).

### Before committing

1. Click **"Sync to generator"** in the board header — this rewrites the `groups` array in `generate-excel.js` with the latest questions (including any custom ones you added).
2. Commit both `generate-excel.js` **and** `Frontend-Interview.xlsx`.

### New team member after `git pull`

```bash
# 1. Install dependencies
npm install

# 2. Rebuild xlsx from the latest question bank in generate-excel.js
node generate-excel.js
node create-xlsx.js

# 3. Start the server
node server.js
```

### How highlighting works

- **Click the card body** (the question text area, not ⭐) in the board → card turns yellow in UI.
- The server immediately writes a yellow fill to that row in `Frontend-Interview.xlsx`.
- **Excel must be closed** when the server writes, otherwise the file is locked and the write fails silently.
- Reopen Excel after highlighting to see the yellow rows.

---

## Question Groups

| Group | Name | Level |
|---|---|---|
| 1 | Rendering and Basic Display | Junior |
| 2 | Sorting and Filtering | Junior to Mid |
| 3 | Pagination | Mid |
| 4 | Selection and Row Actions | Mid |
| 5 | Performance | Mid to Senior |
| 6 | HTTP and Data Fetching | Mid to Senior |
| 7 | State Management | Mid to Senior |
| 8 | Micro-Frontend | Senior |
| 9 | Accessibility and UX Polish | Mid to Senior |
| 10 | Forms in Table | Mid to Senior |
| 11 | Security | Senior |
| 12 | Testing | Senior |

**Suggested sets by role level.**

Junior. Groups 1 and 2, plus 2 to 3 questions from Group 3.

Mid-level. Groups 3, 4, selected questions from Group 5, and Group 6 focusing on retry, cancel, and cache.

Senior. Groups 6 complete, 7, 8, 9, 11.

Tech Lead. Full Group 8, Group 12, plus an open architecture discussion using the table as the starting point.

---

## Figma Setup (In Development)

The simplest path is **FigJam** at figma.com/figjam.

1. Create a new FigJam board.
2. Open any admin UI in a browser, such as GitHub Issues or Notion, and screenshot the data table area.
3. Paste the screenshot into FigJam.
4. Add sticky notes labelled with group numbers next to the relevant parts of the table.
5. Share your screen during the interview and point to the table as you ask questions.

For a more polished design reference, open the **Material 3 Design Kit** at `figma.com/community/file/1035203688168086460` and click "Open in Figma" to duplicate it for free. It contains table, badge, pagination, filter bar, and modal components ready to use.

---

## Regenerating After Edits

To add or edit questions directly in code, modify the `groups` array in `generate-excel.js` between the `AUTO-GENERATED-GROUPS-START` and `AUTO-GENERATED-GROUPS-END` markers, then run:

```bash
node create-xlsx.js
node server.js
```

Alternatively, use the **"Add Question"** button in the board UI and then click **"Sync to generator"** to push the changes back to `generate-excel.js`.

---

## License

MIT. Use, adapt, and share freely.
