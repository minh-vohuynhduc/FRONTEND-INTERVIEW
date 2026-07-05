'use strict';
/**
 * create-xlsx.js — Generate Frontend-Interview.xlsx using exceljs
 * Run: node create-xlsx.js
 *
 * Reads question data from generate-excel.js (using AUTO-GENERATED markers)
 * and produces a properly formatted xlsx file that server.js can read and write.
 */

const ExcelJS = require('exceljs');
const path    = require('path');

// Read question data from generate-excel.js by extracting the groups and figmaResources arrays.
// generate-excel.js is not a module, so we read the file and eval the relevant sections.
const fs = require('fs');

const genContent = fs.readFileSync(path.join(__dirname, 'generate-excel.js'), 'utf-8');

// Extract groups using markers (regex handles \r\n and \n)
const groupsMatch = genContent.match(/\/\/ AUTO-GENERATED-GROUPS-START[\s\S]*?(const groups\s*=\s*[\s\S]*?\];)\s*\/\/ AUTO-GENERATED-GROUPS-END/);
if (!groupsMatch) { console.error('Markers not found in generate-excel.js'); process.exit(1); }
const groupsCode = groupsMatch[1].trim();

// Extract figmaResources (everything from 'const figmaResources' to the first ']; followed by blank line + comment')
const figMatch = genContent.match(/(const figmaResources\s*=\s*\[[\s\S]*?\];)/);
if (!figMatch) { console.error('figmaResources not found in generate-excel.js'); process.exit(1); }
const figCode = figMatch[1].trim();

// Evaluate using Function (avoids eval block-scope issues)
let groups = [];
let figmaResources = [];
try {
  groups         = (new Function(groupsCode + '; return groups;'))();
  figmaResources = (new Function(figCode    + '; return figmaResources;'))();
  console.log(`Parsed: ${groups.length} groups, ${figmaResources.length} figma resources`);
} catch(err) {
  console.error('Parse error:', err.message);
  process.exit(1);
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const HDR_FILL  = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1A3A5C' } };
const HDR_FONT  = { bold: true, color: { argb: 'FFFFFFFF' }, size: 10, name: 'Calibri' };
const BODY_FONT = { size: 9, name: 'Calibri' };
const BORDER    = {
  top:    { style: 'thin', color: { argb: 'FFCCD6E3' } },
  left:   { style: 'thin', color: { argb: 'FFCCD6E3' } },
  bottom: { style: 'thin', color: { argb: 'FFCCD6E3' } },
  right:  { style: 'thin', color: { argb: 'FFCCD6E3' } }
};

function styleHdr(row) {
  row.height = 22;
  row.eachCell(cell => {
    cell.fill      = HDR_FILL;
    cell.font      = HDR_FONT;
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    cell.border    = BORDER;
  });
}

function styleBody(row) {
  row.height = 80;
  row.eachCell({ includeEmpty: true }, cell => {
    cell.font      = BODY_FONT;
    cell.alignment = { vertical: 'top', wrapText: true };
    cell.border    = BORDER;
  });
}

// ─── Build workbook ───────────────────────────────────────────────────────────
async function build() {
  const wb = new ExcelJS.Workbook();
  wb.creator  = 'Frontend Interview Board';
  wb.created  = new Date();

  // ── Sheet 1: Overview ──────────────────────────────────────────────────────
  const ov = wb.addWorksheet('Overview');
  ov.columns = [
    { width: 8  }, { width: 28 }, { width: 16 },
    { width: 16 }, { width: 28 }, { width: 60 }
  ];
  const topicMap = [
    'Data binding, loading state, empty state, error state, format functions, event delegation, SSR vs CSR, reflow and repaint',
    'Debounce vs throttle, race conditions, composed predicates, filter persistence via URL, multi-column sort, saved search',
    'Offset vs cursor pagination, IntersectionObserver, virtual scroll, page size side effects, prefetch, unknown total count',
    'Selection Set, indeterminate checkbox, bulk operations with progress, inline edit lifecycle, drag and drop, clipboard API',
    'Core Web Vitals, trackBy, OnPush immutability, Web Workers, requestAnimationFrame, code splitting, lazy image loading',
    'switchMap vs mergeMap, exponential backoff, cache with TTL, optimistic rollback, polling vs WebSocket, CORS, Service Worker',
    'Component vs store scope, undo and redo with history stack, factory-scoped stores, localStorage versioning, isLoading race condition',
    'Singleton shared libs, URL params communication, CustomEvent bus, Remote error boundary, contract testing, bundle deduplication',
    'aria-sort, aria-live, focus trap, skip link, prefers-reduced-motion, color contrast, SPA route announcements',
    'Cross-field validation, CanDeactivate guard, dynamic form from schema, async validator debounce, add row inline',
    'Defense in depth, CSV injection, XSS prevention, HTTPS and CSP, supply chain attacks, token storage security',
    'Pure function extraction, parameterized tests, test doubles, snapshot testing, coverage quality vs quantity, test isolation'
  ];
  const hdr1 = ov.addRow(['Group', 'Group Name', 'Target Level', 'Question Count', 'Figma Resource', 'Key Topics']);
  styleHdr(hdr1);
  groups.forEach((g, i) => {
    const r = ov.addRow([g.id, g.name, g.level, g.questions.length, 'Yes. See Figma sheet', topicMap[i] || '']);
    styleBody(r);
  });
  const total = groups.reduce((s, g) => s + g.questions.length, 0);
  const sumR = ov.addRow(['', '', '', `Total: ${total} questions`, '', '']);
  styleBody(sumR);
  ov.views = [{ state: 'frozen', ySplit: 1 }];

  // ── Sheet 2: All Questions and Answers ─────────────────────────────────────
  const qa = wb.addWorksheet('All Questions and Answers');
  qa.columns = [
    { width: 8  }, { width: 24 }, { width: 16 },
    { width: 55 }, { width: 60 }, { width: 55 }
  ];
  const hdr2 = qa.addRow(['Group', 'Group Name', 'Level', 'Question', 'Key Points to Evaluate', 'Red Flags to Watch For']);
  styleHdr(hdr2);
  groups.forEach(g => {
    g.questions.forEach(q => {
      const r = qa.addRow([g.id, g.name, g.level, q.q, q.k, q.r]);
      styleBody(r);
    });
  });
  qa.views = [{ state: 'frozen', ySplit: 1 }];

  // ── Sheet 3: Figma Resources ───────────────────────────────────────────────
  const fg = wb.addWorksheet('Figma and Design Resources');
  fg.columns = [{ width: 40 }, { width: 60 }, { width: 55 }, { width: 55 }, { width: 18 }];
  const hdr3 = fg.addRow(['Resource Name', 'URL', 'What It Covers', 'How to Use It', 'Groups']);
  styleHdr(hdr3);
  figmaResources.forEach(f => {
    const r = fg.addRow([f.name, f.url, f.covers, f.note, f.groups]);
    styleBody(r);
  });
  fg.views = [{ state: 'frozen', ySplit: 1 }];

  // ── Write ──────────────────────────────────────────────────────────────────
  const OUT = path.join(__dirname, 'Frontend-Interview.xlsx');
  await wb.xlsx.writeFile(OUT);
  console.log(`✓ Created: ${OUT}`);
  console.log(`  ${total} questions across ${groups.length} groups`);
}

build().catch(err => { console.error('Error:', err.message); process.exit(1); });
