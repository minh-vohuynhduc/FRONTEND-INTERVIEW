# Frontend Interview Framework

A structured interview framework for evaluating Frontend Engineers from Junior to Senior level. Built around a single **data table** as the central UI scenario so that all questions feel grounded and practical, not abstract.

## Philosophy

Technical knowledge questions alone do not effectively distinguish levels. This framework instead probes **reasoning and mindset** by presenting a realistic scenario (a data table) and asking how the candidate would approach it. There are no "correct" framework-specific answers. The goal is to hear how candidates think about trade-offs.

## What Is Inside

| File | Purpose |
|---|---|
| `generate-excel.js` | Node.js script that generates the Excel workbook |
| `Frontend-Interview-Framework.xlsx` | Generated output. Ready to print or present |
| `zip.ps1` | Auto-generated helper to package the XML into xlsx format |
| `xlsx-source/` | Auto-generated intermediate XML files |

## How to Generate the Excel File

Requirements. Node.js v16 or later. No npm packages needed.

```bash
node generate-excel.js
.\zip.ps1
```

The output file `Frontend-Interview-Framework.xlsx` will be created in this folder.

## Excel File Structure

**Sheet 1. Overview**

A summary table of all 12 groups with target level, question count, and key topics.

**Sheet 2. All Questions and Answers**

Every interview question with two evaluation columns.

- "Key Points to Evaluate" describes the reasoning and mindset expected from a good answer.
- "Red Flags to Watch For" describes common shallow or incorrect thinking patterns.

**Sheet 3. Figma and Design Resources**

A curated list of free Figma Community resources for each group, with direct URLs and usage instructions. No Figma design skills required to use these.

## Interview Groups

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

## How to Use in an Interview

1. Open the Figma file (see Sheet 3 for links). Use the Material 3 Design Kit or search Figma Community for "admin dashboard table" and duplicate any free file.
2. Pick the groups that match the target level for the role.
3. For each question, do not show the candidate the "Key Points" answer. Listen for whether the reasoning emerges naturally.
4. Use "Red Flags" to quickly identify shallow answers.
5. A candidate who cannot answer across multiple groups at their level is likely over-stated in experience.

**Suggested group sets by role level:**

- Junior. Groups 1, 2, and selected questions from Group 3.
- Mid-level. Groups 3, 4, 5 basics, and Group 6 (retry, cancel, cache).
- Senior. Groups 6 complete, 7, 8 (Micro-Frontend), 9, 11.
- Tech Lead. Full Group 8, Group 12, plus architecture trade-off discussion.

## Figma Setup (No Design Experience Needed)

The simplest approach is **FigJam** at figma.com/figjam.

1. Create a new FigJam board.
2. Open any browser, go to any admin dashboard like GitHub Issues or Notion, and take a screenshot of a data table.
3. Paste the screenshot into FigJam.
4. Use sticky notes to annotate the table regions with question group labels.
5. During the interview, share your screen and point to the table sections as you ask questions.

Alternatively, open the Material 3 Design Kit at `figma.com/community/file/1035203688168086460` and duplicate it for free. It contains table, pagination, filter, and badge components.

## Regenerating After Edits

Edit the `groups` array in `generate-excel.js` to add, remove, or modify questions. Run the two commands again to regenerate the Excel file. The PowerShell zip script is regenerated automatically each time.

## License

MIT. Use, adapt, and share freely.
