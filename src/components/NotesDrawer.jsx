// src/components/NotesDrawer.jsx
import { useState, useEffect, useRef, useCallback } from 'react';
import { X, FileText, Eye, Edit3, Clock, Hash, ExternalLink, Check, Save } from 'lucide-react';
import { marked } from 'marked';
import { useSheetStore } from '../store';

/* ── O(N) Single-Pass Syntax Highlighting Engine ────── */
function formatCodeSyntax(code) {
  if (!code) return '';

  // 1. HTML Escape
  const html = String(code)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // 2. Tokenize in a single pass so generated HTML tags are never re-processed
  const tokenRegex = /(\/\/[^\n]*|\/\*[\s\S]*?\*\/|#[^\n]*)|("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)|(\b(?:class|public|private|protected|static|void|int|double|float|long|boolean|char|String|return|if|else|for|while|do|break|continue|new|import|package|try|catch|finally|throw|throws|interface|extends|implements|enum|final|null|true|false|const|let|var|function|def|self|lambda|auto|struct|include|using|namespace|std)\b)|(\b(?:Math|System|out|println|print|length|size|add|push|pop|get|set|contains|put|min|max|abs|sqrt|pow|console|log|vector|map|set|list|dict|range|len|enumerate|Arrays|Collections)\b)|(\b\d+(?:\.\d+)?\b)/g;

  return html.replace(tokenRegex, (match, comment, string, keyword, builtin, number) => {
    if (comment) return `<span class="code-cmnt">${comment}</span>`;
    if (string) return `<span class="code-str">${string}</span>`;
    if (keyword) return `<span class="code-kw">${keyword}</span>`;
    if (builtin) return `<span class="code-bltn">${builtin}</span>`;
    if (number) return `<span class="code-num">${number}</span>`;
    return match;
  });
}

/* ── Auto-wrap Raw Code into Fenced Code Blocks ─ */
function prepareTextForMarkdown(raw) {
  if (!raw) return '';

  // If text already has fenced ``` code blocks, leave it intact
  if (raw.includes('```')) {
    return raw;
  }

  // Check if raw text looks like un-fenced raw code (Java, C++, JS, Python)
  const lines = raw.split('\n');
  const hasCodeKeywords = lines.some(line => 
    /^\s*(public\s+|private\s+|protected\s+|class\s+|interface\s+|enum\s+|import\s+|#include|using\s+namespace|def\s+\w+|function\s+\w+|const\s+\w+\s*=|let\s+\w+\s*=|var\s+\w+\s*=|for\s*\(|while\s*\(|if\s*\()/i.test(line)
  );

  const hasMarkdownHeadings = lines.some(line => /^\s*(#+\s+|- \s+|\*\s+|\d+\.\s+)/.test(line));

  if (hasCodeKeywords && !hasMarkdownHeadings) {
    return '```java\n' + raw + '\n```';
  }

  return raw;
}

/* ── Configure marked renderer ──────────────── */
const renderer = new marked.Renderer();

renderer.code = (codeArg, languageArg) => {
  const codeText = typeof codeArg === 'object' && codeArg !== null 
    ? (codeArg.text || '') 
    : String(codeArg || '');

  const langName = typeof codeArg === 'object' && codeArg !== null 
    ? (codeArg.lang || languageArg || 'code') 
    : (languageArg || 'code');

  const highlighted = formatCodeSyntax(codeText);
  return `
    <div style="background: #111827; border: 1px solid #374151; border-radius: 10px; margin: 1rem 0; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.3);">
      <div style="background: #1F2937; padding: 6px 12px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #374151; font-size: 0.72rem; color: #9CA3AF; font-family: monospace;">
        <span style="display: flex; align-items: center; gap: 6px; font-weight: 700; color: #60A5FA;">
          <span style="width: 8px; height: 8px; border-radius: 50%; background: #60A5FA; display: inline-block;"></span>
          ${langName.toUpperCase()}
        </span>
        <span style="color: #64748B;">VS Code Dark</span>
      </div>
      <pre style="margin: 0; padding: 1.1rem; overflow-x: auto; background: transparent;"><code style="font-family: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace; font-size: 0.85rem; line-height: 1.65; color: #F3F4F6;">${highlighted}</code></pre>
    </div>
  `;
};

marked.use({
  breaks: true,
  gfm: true,
  renderer,
});

/* ── Helpers ──────────────────────────────────── */
function formatTimestamp(isoStr) {
  if (!isoStr) return null;
  const d = new Date(isoStr);
  return d.toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function findQLocation(data, questionId) {
  for (const t of data) {
    for (const s of t.subTopics) {
      const q = s.questions.find(q => q.id === questionId);
      if (q) return { topicId: t.id, subTopicId: s.id, question: q };
    }
  }
  return null;
}

const difficultyStyle = {
  Easy: { color: '#34D399', bg: 'rgba(52, 211, 153, 0.12)', border: '1px solid rgba(52, 211, 153, 0.3)' },
  Medium: { color: '#FBBF24', bg: 'rgba(251, 191, 36, 0.12)', border: '1px solid rgba(251, 191, 36, 0.3)' },
  Hard: { color: '#F87171', bg: 'rgba(248, 113, 113, 0.12)', border: '1px solid rgba(248, 113, 113, 0.3)' },
};

/* ── Drawer Component ─────────────────────────── */
export function NotesDrawer({ questionId, onClose }) {
  const { data, updateQuestionNote } = useSheetStore();

  // Resolve live question from store
  const loc = questionId ? findQLocation(data, questionId) : null;
  const question = loc?.question ?? null;

  const [text, setText] = useState(question?.notes || '');
  const [prevQId, setPrevQId] = useState(question?.id);
  const [activeTab, setActiveTab] = useState('write'); // 'write' | 'preview'
  const [savedAt, setSavedAt] = useState(question?.noteEditedAt || null);
  const [isSaving, setIsSaving] = useState(false);
  const [showSavedToast, setShowSavedToast] = useState(false);
  
  const autosaveTimer = useRef(null);
  const textareaRef = useRef(null);

  // Sync text when a new question is opened
  if (question && question.id !== prevQId) {
    setPrevQId(question.id);
    setText(question.notes || '');
    setSavedAt(question.noteEditedAt || null);
    setActiveTab('write');
  }

  // Autosave function
  const save = useCallback((value) => {
    if (!loc) return;
    updateQuestionNote(loc.topicId, loc.subTopicId, questionId, value);
    setSavedAt(new Date().toISOString());
    setIsSaving(false);
  }, [loc, questionId, updateQuestionNote]);

  // Debounced autosave
  useEffect(() => {
    if (!question) return;
    if (text === (question.notes || '')) return;

    clearTimeout(autosaveTimer.current);
    autosaveTimer.current = setTimeout(() => {
      setIsSaving(true);
      save(text);
    }, 800);

    return () => clearTimeout(autosaveTimer.current);
  }, [text, question, save]);

  // Keyboard shortcut: Escape closes
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  if (!questionId) return null;

  const diffBadge = difficultyStyle[question?.difficulty] || difficultyStyle.Medium;
  const charCount = text.length;
  const hasNotes = text.trim().length > 0;

  // Safe markdown generation with error fallback
  let previewHtml = '<p class="nd-preview-empty" style="color: var(--theme-text-muted); font-style: italic;">Nothing to preview yet. Write your notes or code in the Edit tab.</p>';
  if (hasNotes) {
    try {
      const preparedMarkdown = prepareTextForMarkdown(text);
      previewHtml = marked.parse(preparedMarkdown);
    } catch {
      previewHtml = `<pre style="background: #111827; border: 1px solid #374151; padding: 1rem; border-radius: 10px; color: #F3F4F6; font-family: monospace;"><code>${formatCodeSyntax(text)}</code></pre>`;
    }
  }

  const handleManualSave = () => {
    save(text);
    setShowSavedToast(true);
    setTimeout(() => setShowSavedToast(false), 2000);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="nd-backdrop"
        onClick={onClose}
        aria-label="Close notes drawer"
      />

      {/* Drawer Panel */}
      <div className="nd-panel" role="dialog" aria-label="Notes drawer">
        {/* Header */}
        <div className="nd-header border-bottom py-3 px-4" style={{ borderColor: 'var(--theme-border)', background: 'var(--theme-card-secondary-bg)' }}>
          <div className="d-flex align-items-center justify-content-between mb-2">
            <div className="d-flex align-items-center gap-2">
              <span className="badge" style={{ background: 'rgba(96, 165, 250, 0.15)', color: '#60A5FA', border: '1px solid rgba(96, 165, 250, 0.3)', fontSize: '0.72rem' }}>
                Revision Notebook
              </span>
              {question?.difficulty && (
                <span className="badge" style={{ backgroundColor: diffBadge.bg, color: diffBadge.color, border: diffBadge.border, fontSize: '0.72rem' }}>
                  {question.difficulty}
                </span>
              )}
            </div>

            <div className="d-flex align-items-center gap-2">
              {question?.url && question.url !== '#' && (
                <a
                  href={question.url}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-sm d-flex align-items-center gap-1 text-decoration-none"
                  style={{ background: 'var(--theme-input-bg)', border: '1px solid var(--theme-border)', color: 'var(--theme-text-main)', fontSize: '0.75rem', borderRadius: '8px' }}
                  title="Open Problem Link"
                >
                  <ExternalLink size={13} /> Open Problem
                </a>
              )}
              <button className="nd-close-btn" onClick={onClose} title="Close (Esc)">
                <X size={18} />
              </button>
            </div>
          </div>

          <h5 className="m-0 fw-bold text-white text-truncate" title={question?.title} style={{ fontSize: '1.05rem' }}>
            {question?.title ?? 'Loading…'}
          </h5>
        </div>

        {/* Tab Bar & Status */}
        <div className="nd-tabs px-4 py-2 d-flex align-items-center justify-content-between" style={{ background: 'var(--theme-bg)', borderBottom: '1px solid var(--theme-border)' }}>
          <div className="d-flex gap-2">
            <button
              className={`nd-tab ${activeTab === 'write' ? 'nd-tab-active' : ''}`}
              onClick={() => setActiveTab('write')}
            >
              <Edit3 size={13} /> Edit Notes
            </button>
            <button
              className={`nd-tab ${activeTab === 'preview' ? 'nd-tab-active' : ''}`}
              onClick={() => setActiveTab('preview')}
            >
              <Eye size={13} /> Preview Solution
            </button>
          </div>

          <div className="d-flex align-items-center gap-3" style={{ fontSize: '0.75rem' }}>
            <span style={{ color: 'var(--theme-text-muted)' }}>
              <Hash size={12} className="me-1" />
              {charCount} chars
            </span>

            <span className="d-flex align-items-center gap-1 fw-semibold" style={{ color: isSaving ? '#FBBF24' : '#34D399' }}>
              {isSaving ? (
                <>Saving…</>
              ) : (
                <><Check size={13} /> Auto Saved</>
              )}
            </span>
          </div>
        </div>

        {/* Main Editor Body */}
        <div className="nd-body p-0 flex-grow-1 d-flex flex-column" style={{ background: '#0F172A' }}>
          {activeTab === 'write' ? (
            <textarea
              ref={textareaRef}
              className="nd-textarea w-100 flex-grow-1"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onBlur={() => save(text)}
              placeholder={`Write your code, approach, complexities, and interview notes here...\n\n## 💡 Approach\nExplain your logic step-by-step.\n\n## ⏱️ Complexity\n- Time Complexity: O(N log N)\n- Space Complexity: O(1)\n\n## 💻 Java Code\n\`\`\`java\npublic class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        // ...\n    }\n}\n\`\`\``}
              spellCheck="false"
              style={{
                background: '#0F172A',
                color: '#F3F4F6',
                fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
                fontSize: '0.88rem',
                lineHeight: '1.7',
                padding: '1.25rem',
                border: 'none',
                outline: 'none',
                resize: 'none',
                minHeight: '420px',
              }}
            />
          ) : (
            <div
              className="nd-preview p-4 flex-grow-1"
              dangerouslySetInnerHTML={{ __html: previewHtml }}
              style={{ background: '#0F172A', color: '#F3F4F6', overflowY: 'auto' }}
            />
          )}
        </div>

        {/* Info Bar */}
        <div className="px-4 py-2 d-flex align-items-center justify-content-between" style={{ background: 'var(--theme-card-secondary-bg)', borderTop: '1px solid var(--theme-border)', fontSize: '0.75rem', color: 'var(--theme-text-muted)' }}>
          {savedAt ? (
            <span className="d-flex align-items-center gap-1">
              <Clock size={12} color="#60A5FA" />
              Last edited: {formatTimestamp(savedAt)}
            </span>
          ) : (
            <span>Ready for notes</span>
          )}

          <span>Formatted with Linear Code Syntax Highlighting</span>
        </div>

        {/* Footer */}
        <div className="nd-footer px-4 py-3 d-flex align-items-center justify-content-between" style={{ background: 'var(--theme-card-bg)', borderTop: '1px solid var(--theme-border)' }}>
          <div className="d-flex align-items-center gap-2">
            <button
              onClick={handleManualSave}
              className="btn btn-sm d-flex align-items-center gap-1.5"
              style={{ background: '#34D399', color: '#111827', borderRadius: '8px', fontWeight: 700, fontSize: '0.8rem', padding: '6px 16px' }}
            >
              <Save size={14} /> {showSavedToast ? 'Saved!' : 'Save Notes'}
            </button>
          </div>

          <button
            onClick={onClose}
            className="btn btn-sm btn-outline-secondary"
            style={{ borderRadius: '8px', fontSize: '0.8rem', padding: '6px 16px' }}
          >
            Close (Esc)
          </button>
        </div>
      </div>
    </>
  );
}
