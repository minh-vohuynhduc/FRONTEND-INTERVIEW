'use strict';

/**
 * Frontend Interview Board — Local Server
 *
 * Setup (first time):
 *   npm install
 *   node generate-excel.js && .\zip.ps1   (creates Frontend-Interview.xlsx)
 *   node server.js                         (starts server on port 3000)
 *
 * Before committing changes made via the UI:
 *   Click "Sync to generator" button in the board to update generate-excel.js
 *   Then commit both files: generate-excel.js + Frontend-Interview.xlsx
 *
 * New team member setup:
 *   git pull
 *   npm install
 *   node generate-excel.js && .\zip.ps1
 *   node server.js
 */

const express = require('express');
const ExcelJS = require('exceljs');
const path    = require('path');
const fs      = require('fs');

const app  = express();
const PORT = process.env.PORT || 3001;
const XLSX_PATH = path.join(__dirname, 'Frontend-Interview.xlsx');
const GEN_PATH  = path.join(__dirname, 'generate-excel.js');

app.use(express.json());
app.use(express.static(__dirname));

// ─────────────────────────────────────────────────────────────────────────────
// In-memory state
// ─────────────────────────────────────────────────────────────────────────────
let groups = [];  // [{ id, name, level, questions:[{q,k,r}], customs:[{q,k,r}] }]
let appState = { stars: [], highlights: [], customs: {}, figmaLinks: {}, qEdits: {} };

// ─────────────────────────────────────────────────────────────────────────────
// LOAD from xlsx
// ─────────────────────────────────────────────────────────────────────────────
function normalizeLevel(raw) {
  const l = String(raw || '').toLowerCase();
  if (l === 'junior') return 'junior';
  if (l.includes('senior') && !l.includes('mid')) return 'senior';
  return 'mid';
}

async function loadFromXlsx() {
  if (!fs.existsSync(XLSX_PATH)) {
    throw new Error(
      `"Frontend-Interview.xlsx" not found.\n` +
      `Run: node generate-excel.js && .\\zip.ps1`
    );
  }

  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(XLSX_PATH);

  // ── Read questions from "All Questions and Answers" sheet ──────────────────
  const qaSheet = wb.getWorksheet('All Questions and Answers') || wb.worksheets[1];
  if (!qaSheet) throw new Error('Cannot find questions sheet in xlsx');

  const groupMap = new Map();
  const qGroupCounters = {};
  qaSheet.eachRow((row, rowNum) => {
    if (rowNum === 1) return; // skip header
    const gid   = parseInt(row.getCell(1).value);
    const gname = String(row.getCell(2).value || '').trim();
    const level = normalizeLevel(row.getCell(3).value);
    const q     = String(row.getCell(4).value || '').trim();
    const k     = String(row.getCell(5).value || '').trim();
    const r     = String(row.getCell(6).value || '').trim();
    const figma = String(row.getCell(7).value || '').trim();
    if (!gid || !q) return;
    if (!groupMap.has(gid)) groupMap.set(gid, { id: gid, name: gname, level, questions: [], customs: [] });
    if (!qGroupCounters[gid]) qGroupCounters[gid] = 0;
    const qId = `g${gid}_q${qGroupCounters[gid]++}`;
    if (figma) appState.figmaLinks[qId] = figma;
    const why = String(row.getCell(8).value || '').trim();
    if (why) {
      if (!appState.qEdits) appState.qEdits = {};
      if (!appState.qEdits[qId]) appState.qEdits[qId] = {};
      appState.qEdits[qId].w = why;
    }
    groupMap.get(gid).questions.push({ q, k, r });
  });

  groups = [...groupMap.values()].sort((a, b) => a.id - b.id);

  // ── Read saved state from "InterviewState" sheet (if exists) ──────────────
  const stateSheet = wb.getWorksheet('InterviewState');
  if (stateSheet) {
    try {
      const json = stateSheet.getCell('A1').value;
      if (json) {
        appState = JSON.parse(String(json));
        // Merge customs into groups
        Object.entries(appState.customs || {}).forEach(([gid, cqs]) => {
          const g = groups.find(x => x.id === parseInt(gid));
          if (g) g.customs = Array.isArray(cqs) ? cqs : [];
        });
      }
    } catch (e) {
      console.warn('Could not parse saved state:', e.message);
    }
  }

  const total = groups.reduce((s, g) => s + g.questions.length, 0);
  console.log(`✓ Loaded ${total} questions across ${groups.length} groups`);
  console.log(`  Stars: ${appState.stars.length}, Highlights: ${appState.highlights.length}`);

  // Re-apply yellow fills to xlsx so the file is always up-to-date on startup
  if (appState.highlights.length > 0) {
    await saveToXlsx();
    console.log(`  ✓ Applied ${appState.highlights.length} highlight(s) to xlsx`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SAVE to xlsx
// ─────────────────────────────────────────────────────────────────────────────
async function saveToXlsx() {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(XLSX_PATH);

  // 1. Persist state in InterviewState sheet
  let stateSheet = wb.getWorksheet('InterviewState');
  if (!stateSheet) stateSheet = wb.addWorksheet('InterviewState');
  stateSheet.getCell('A1').value = JSON.stringify(appState);

  // 2. Rebuild Q&A sheet data rows (delete all rows after header, re-add with fills)
  const BODY_FONT = { size: 9, name: 'Calibri' };
  const BORDER    = {
    top:    { style: 'thin', color: { argb: 'FFCCD6E3' } },
    left:   { style: 'thin', color: { argb: 'FFCCD6E3' } },
    bottom: { style: 'thin', color: { argb: 'FFCCD6E3' } },
    right:  { style: 'thin', color: { argb: 'FFCCD6E3' } }
  };
  const YELLOW = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFF00' } };
  const NONE   = { type: 'pattern', pattern: 'none' };

  const qaSheet = wb.getWorksheet('All Questions and Answers') || wb.worksheets[1];
  const lastRowNum = qaSheet.lastRow ? qaSheet.lastRow.number : 1;

  // Remove existing data rows (keep header row 1)
  for (let r = lastRowNum; r >= 2; r--) qaSheet.spliceRows(r, 1);

  // Ensure header row has Figma Link column
  const headerRow = qaSheet.getRow(1);
  if (!headerRow.getCell(7).value) {
    const HDR_FONT = { size: 10, bold: true, color: { argb: 'FFFFFFFF' }, name: 'Calibri' };
    const HDR_FILL = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1A3A5C' } };
    ['Figma Link', 'Why This Question?'].forEach((label, i) => {
      const cell = headerRow.getCell(7 + i);
      if (!cell.value) {
        cell.value     = label;
        cell.font      = HDR_FONT;
        cell.fill      = HDR_FILL;
        cell.alignment = { horizontal: 'center', vertical: 'center', wrapText: true };
        cell.border    = BORDER;
      }
    });
  }

  // Re-add all rows with correct fills
  const qCounters = {};
  groups.forEach(g => {
    if (!qCounters[g.id]) qCounters[g.id] = 0;
    const allQ = [...g.questions, ...(g.customs || []).map((q, i) => ({ ...q, _customIdx: i }))];
    allQ.forEach(q => {
      const idx = q._customIdx != null ? 1000 + q._customIdx : qCounters[g.id]++;
      const qId = `g${g.id}_q${idx}`;
      const fill = appState.highlights.includes(qId) ? YELLOW : NONE;
      const figmaUrl = (appState.figmaLinks || {})[qId] || '';
      const whyText  = (appState.qEdits    || {})[qId]?.w || '';
      const row  = qaSheet.addRow([g.id, g.name, g.level, q.q, q.k, q.r, figmaUrl, whyText]);
      row.height = 80;
      row.eachCell({ includeEmpty: true }, cell => {
        cell.fill      = fill;
        cell.font      = BODY_FONT;
        cell.alignment = { vertical: 'top', wrapText: true };
        cell.border    = BORDER;
      });
    });
  });

  await wb.xlsx.writeFile(XLSX_PATH);
}

// ─────────────────────────────────────────────────────────────────────────────
// API ENDPOINTS
// ─────────────────────────────────────────────────────────────────────────────

// GET /api/health — quick check that server is alive
app.get('/api/health', (_req, res) => res.json({ ok: true, port: PORT }));

// GET /api/data — return all groups + current state
app.get('/api/data', (_req, res) => {
  res.json({
    groups: groups.map(g => ({
      id:        g.id,
      name:      g.name,
      level:     g.level,
      questions: g.questions,
      customs:   g.customs || []
    })),
    stars:      appState.stars,
    highlights: appState.highlights,
    figmaLinks: appState.figmaLinks || {},
    qEdits:     appState.qEdits     || {}
  });
});

// POST /api/save — receive full state from browser, persist to xlsx
app.post('/api/save', async (req, res) => {
  try {
    const { stars, highlights, customs, figmaLinks, qEdits } = req.body;
    appState.stars      = Array.isArray(stars)      ? stars      : [];
    appState.highlights = Array.isArray(highlights) ? highlights : [];
    appState.customs    = (customs    && typeof customs    === 'object') ? customs    : {};
    appState.figmaLinks = (figmaLinks && typeof figmaLinks === 'object') ? figmaLinks : {};
    appState.qEdits     = (qEdits     && typeof qEdits     === 'object') ? qEdits     : {};

    // Update in-memory groups customs
    groups.forEach(g => {
      g.customs = appState.customs[g.id] || [];
    });

    await saveToXlsx();
    res.json({ ok: true });
  } catch (e) {
    console.error('Save error:', e.message);
    res.status(500).json({ error: e.message });
  }
});

// POST /api/sync-generator — rewrite GROUPS array in generate-excel.js
app.post('/api/sync-generator', (_req, res) => {
  try {
    let content = fs.readFileSync(GEN_PATH, 'utf-8');
    const START = '// AUTO-GENERATED-GROUPS-START';
    const END   = '// AUTO-GENERATED-GROUPS-END';

    if (!content.includes(START) || !content.includes(END)) {
      return res.status(400).json({
        error: 'Markers not found in generate-excel.js.\n' +
               'Add "// AUTO-GENERATED-GROUPS-START" before and "// AUTO-GENERATED-GROUPS-END" after the groups array.'
      });
    }

    const newCode = buildGroupsJsCode();
    const s = content.indexOf(START);
    const e = content.indexOf(END) + END.length;
    content = content.slice(0, s) + START + '\n' + newCode + '\n' + END + content.slice(e);
    fs.writeFileSync(GEN_PATH, content, 'utf-8');

    console.log('✓ generate-excel.js synced');
    res.json({ ok: true });
  } catch (e) {
    console.error('Sync error:', e.message);
    res.status(500).json({ error: e.message });
  }
});

function buildGroupsJsCode() {
  const lines = ['const groups = ['];
  groups.forEach(g => {
    const allQ = [...g.questions, ...(g.customs || [])];
    lines.push(`  { id: ${g.id}, name: ${JSON.stringify(g.name)}, level: ${JSON.stringify(g.level)}, questions: [`);
    allQ.forEach(q => {
      lines.push(`    { q: ${JSON.stringify(q.q)}, k: ${JSON.stringify(q.k)}, r: ${JSON.stringify(q.r)} },`);
    });
    lines.push(`  ]},`);
  });
  lines.push('];');
  return lines.join('\n');
}

// ─────────────────────────────────────────────────────────────────────────────
// START
// ─────────────────────────────────────────────────────────────────────────────
loadFromXlsx()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`\n✓ Frontend Interview Board → http://localhost:${PORT}`);
      console.log(`  Open http://localhost:${PORT}/interview-board.html in your browser\n`);
    });
  })
  .catch(err => {
    console.error(`\n✗ Startup failed: ${err.message}\n`);
    process.exit(1);
  });
