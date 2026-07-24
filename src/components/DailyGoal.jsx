// src/components/DailyGoal.jsx
import { useState, useMemo } from 'react';
import { Target, Flame, CheckCircle2, Pencil, Check, Minus, Plus } from 'lucide-react';
import { useSheetStore } from '../store';

function todayStr() {
  return new Date().toISOString().split('T')[0]; // 'YYYY-MM-DD'
}

const PRESETS = [3, 5, 10, 15, 20];

export function DailyGoal() {
  const { data, dailyGoal, setDailyGoal } = useSheetStore();
  const [editing, setEditing]   = useState(false);
  const [draft, setDraft]       = useState(String(dailyGoal.target));

  // Compute how many questions were solved today
  const solvedToday = useMemo(() => {
    const today = todayStr();
    let count = 0;
    data.forEach(t =>
      t.subTopics.forEach(s =>
        s.questions.forEach(q => {
          if (q.isSolved && q.solvedAt && q.solvedAt.startsWith(today)) count++;
        })
      )
    );
    return count;
  }, [data]);

  const target    = dailyGoal.target;
  const remaining = Math.max(0, target - solvedToday);
  const percent   = Math.min(100, Math.round((solvedToday / target) * 100));
  const done      = solvedToday >= target;

  const saveGoal = (val) => {
    const n = parseInt(val, 10);
    if (!isNaN(n) && n >= 1) {
      setDailyGoal(n);
      setDraft(String(n));
    }
    setEditing(false);
  };

  const nudge = (delta) => {
    const n = Math.max(1, (parseInt(draft, 10) || target) + delta);
    setDraft(String(n));
  };

  // Dynamic status label
  const statusLabel = done
    ? '🎉 Goal smashed!'
    : solvedToday === 0
    ? 'Start solving!'
    : `${remaining} to go — keep it up!`;

  // Bar segment colors
  const barColor = done ? '#00b894' : percent >= 50 ? '#fdcb6e' : '#ff5e00';

  return (
    <div className="dg-card">
      {/* Top shimmer */}
      <div className="dg-shimmer" style={{ background: barColor }} />

      {/* Header row */}
      <div className="dg-header">
        <div className="dg-header-left">
          <span className="dg-icon-wrap" style={{ color: barColor, boxShadow: `0 0 12px ${barColor}30` }}>
            {done ? <CheckCircle2 size={17} /> : <Target size={17} />}
          </span>
          <div>
            <div className="dg-title">Daily Goal</div>
            <div className="dg-date">
              {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
            </div>
          </div>
        </div>

        {/* Streak flame */}
        <div className="dg-streak">
          <Flame size={15} color={done ? '#fdcb6e' : '#333'} fill={done ? '#fdcb6e' : 'none'} />
          <span style={{ color: done ? '#fdcb6e' : '#333' }}>
            {done ? 'Complete!' : 'Active'}
          </span>
        </div>
      </div>

      {/* Big numbers */}
      <div className="dg-numbers">
        <span className="dg-solved" style={{ color: barColor }}>{solvedToday}</span>
        <span className="dg-sep">/</span>
        {editing ? (
          <div className="dg-edit-row">
            <button className="dg-nudge" onClick={() => nudge(-1)}><Minus size={12} /></button>
            <input
              className="dg-input"
              type="number"
              min="1"
              max="99"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') saveGoal(draft); if (e.key === 'Escape') setEditing(false); }}
              autoFocus
            />
            <button className="dg-nudge" onClick={() => nudge(1)}><Plus size={12} /></button>
            <button className="dg-save-btn" onClick={() => saveGoal(draft)} title="Save">
              <Check size={14} />
            </button>
          </div>
        ) : (
          <span
            className="dg-target"
            onClick={() => { setDraft(String(target)); setEditing(true); }}
            title="Click to change goal"
          >
            {target}
            <Pencil size={11} className="dg-pencil" />
          </span>
        )}
      </div>
      <div className="dg-status-label">{statusLabel}</div>

      {/* Progress bar */}
      <div className="dg-bar-track">
        <div
          className="dg-bar-fill"
          style={{ width: `${percent}%`, background: `linear-gradient(90deg, ${barColor}aa, ${barColor})` }}
        />
      </div>

      {/* Stat chips */}
      <div className="dg-chips">
        <div className="dg-chip">
          <span className="dg-chip-val" style={{ color: barColor }}>{solvedToday}</span>
          <span className="dg-chip-lbl">Solved</span>
        </div>
        <div className="dg-chip-divider" />
        <div className="dg-chip">
          <span className="dg-chip-val">{remaining}</span>
          <span className="dg-chip-lbl">Remaining</span>
        </div>
        <div className="dg-chip-divider" />
        <div className="dg-chip">
          <span className="dg-chip-val" style={{ color: percent === 100 ? '#00b894' : '#ccc' }}>{percent}%</span>
          <span className="dg-chip-lbl">Done</span>
        </div>
      </div>

      {/* Goal presets */}
      {!editing && (
        <div className="dg-presets">
          <span className="dg-presets-label">Quick set:</span>
          {PRESETS.map(p => (
            <button
              key={p}
              className={`dg-preset-btn ${target === p ? 'dg-preset-active' : ''}`}
              onClick={() => setDailyGoal(p)}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
