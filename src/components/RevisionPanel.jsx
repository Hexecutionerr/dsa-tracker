// src/components/RevisionPanel.jsx
import { X, CheckCircle2, Circle, CalendarClock, Trash2, Star, RotateCcw, Clock } from 'lucide-react';
import { useSheetStore } from '../store';

/* ── Date Helpers ─────────────────────────────────── */
function toDateStr(d) {
  return d.toISOString().split('T')[0]; // 'YYYY-MM-DD'
}

function getDateStr(offsetDays) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return toDateStr(d);
}

// Returns which bucket a question falls into
function getBucket(q) {
  if (q.revisionDoneAt) return 'completed';
  if (!q.revisionDate)  return null;

  const today    = getDateStr(0);
  const tomorrow = getDateStr(1);
  const weekEnd  = getDateStr(7);

  if (q.revisionDate < today)    return 'overdue';
  if (q.revisionDate === today)  return 'today';
  if (q.revisionDate === tomorrow) return 'tomorrow';
  if (q.revisionDate <= weekEnd) return 'this_week';
  return 'later';
}

// Collects all revision-scheduled questions from the Zustand tree
function collectRevisionItems(data) {
  const items = [];
  for (const topic of data) {
    for (const sub of topic.subTopics) {
      for (const q of sub.questions) {
        if (q.revisionDate || q.revisionDoneAt) {
          items.push({ q, topicId: topic.id, subTopicId: sub.id, topicTitle: topic.title, subTitle: sub.title });
        }
      }
    }
  }
  return items;
}

const diffColors = {
  Easy:   { color: '#00b894', bg: '#00b89415' },
  Medium: { color: '#fdcb6e', bg: '#fdcb6e15' },
  Hard:   { color: '#ff7675', bg: '#ff767515' },
};

function RevisionCard({ item, onComplete, onRemove, onReschedule }) {
  const { q, topicTitle, subTitle } = item;
  const dc = diffColors[q.difficulty] || diffColors.Medium;
  const isDone = Boolean(q.revisionDoneAt);

  return (
    <div className={`rv-card ${isDone ? 'rv-card-done' : ''}`}>
      <div className="rv-card-main">
        {/* Completion toggle */}
        <button
          className="rv-check-btn"
          onClick={onComplete}
          title={isDone ? 'Mark pending' : 'Mark done'}
        >
          {isDone
            ? <CheckCircle2 size={18} color="#00b894" fill="#00b89420" />
            : <Circle size={18} color="#555" />
          }
        </button>

        <div className="rv-card-info">
          <span className={`rv-card-title ${isDone ? 'rv-card-title-done' : ''}`}>
            {q.isStarred && <Star size={11} color="#f1c40f" fill="#f1c40f" style={{ marginRight: 4 }} />}
            {q.title}
          </span>
          <span className="rv-card-meta">
            {topicTitle} → {subTitle}
          </span>
        </div>

        <span
          className="rv-diff-badge"
          style={{ color: dc.color, background: dc.bg }}
        >
          {q.difficulty}
        </span>
      </div>

      <div className="rv-card-actions">
        <button className="rv-action-btn" onClick={() => onReschedule('today')}    title="Move to Today">Today</button>
        <button className="rv-action-btn" onClick={() => onReschedule('tomorrow')} title="Move to Tomorrow">Tomorrow</button>
        <button className="rv-action-btn" onClick={() => onReschedule('week')}     title="Move to This Week">Week</button>
        <button className="rv-action-btn rv-action-remove" onClick={onRemove} title="Remove from queue">
          <Trash2 size={12} />
        </button>
      </div>
    </div>
  );
}

function BucketSection({ label, icon, color, items, onComplete, onRemove, onReschedule, emptyMsg }) {
  if (items.length === 0 && !emptyMsg) return null;
  const Icon = icon;

  return (
    <div className="rv-section">
      <div className="rv-section-header" style={{ borderColor: color }}>
        <Icon size={14} style={{ color }} />
        <span style={{ color }}>{label}</span>
        {items.length > 0 && (
          <span className="rv-section-count" style={{ background: color + '20', color }}>
            {items.length}
          </span>
        )}
      </div>

      {items.length === 0 && emptyMsg ? (
        <p className="rv-empty-hint">{emptyMsg}</p>
      ) : (
        items.map(item => (
          <RevisionCard
            key={item.q.id}
            item={item}
            onComplete={() => onComplete(item)}
            onRemove={() => onRemove(item)}
            onReschedule={(when) => onReschedule(item, when)}
          />
        ))
      )}
    </div>
  );
}

/* ── Main Panel ───────────────────────────────────── */
export function RevisionPanel({ onClose }) {
  const { data, scheduleRevision, completeRevision, removeRevision } = useSheetStore();

  const allItems = collectRevisionItems(data);

  // Bucket items
  const overdue   = allItems.filter(i => getBucket(i.q) === 'overdue');
  const today     = allItems.filter(i => getBucket(i.q) === 'today');
  const tomorrow  = allItems.filter(i => getBucket(i.q) === 'tomorrow');
  const thisWeek  = allItems.filter(i => getBucket(i.q) === 'this_week');
  const completed = allItems.filter(i => getBucket(i.q) === 'completed').slice(0, 20); // cap display

  const totalPending = overdue.length + today.length + tomorrow.length + thisWeek.length;

  // Action handlers
  function handleComplete(item) {
    if (item.q.revisionDoneAt) {
      // Toggle back to pending: restore original revisionDate
      scheduleRevision(item.topicId, item.subTopicId, item.q.id, item.q.revisionDate || getDateStr(0));
    } else {
      completeRevision(item.topicId, item.subTopicId, item.q.id);
    }
  }

  function handleRemove(item) {
    removeRevision(item.topicId, item.subTopicId, item.q.id);
  }

  function handleReschedule(item, when) {
    const dateMap = { today: getDateStr(0), tomorrow: getDateStr(1), week: getDateStr(7) };
    scheduleRevision(item.topicId, item.subTopicId, item.q.id, dateMap[when]);
  }

  // Esc key close
  const handleKeyDown = (e) => { if (e.key === 'Escape') onClose(); };

  return (
    <>
      <div className="rv-backdrop" onClick={onClose} />
      <div className="rv-panel" onKeyDown={handleKeyDown} tabIndex={-1} role="dialog">

        {/* Header */}
        <div className="rv-header">
          <div className="rv-header-left">
            <CalendarClock size={18} style={{ color: '#a78bfa' }} />
            <div>
              <div className="rv-header-title">Revision Queue</div>
              <div className="rv-header-sub">
                {totalPending > 0
                  ? `${totalPending} pending · ${completed.length} completed`
                  : 'No pending revisions'}
              </div>
            </div>
          </div>
          <button className="rv-close-btn" onClick={onClose} title="Close (Esc)">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="rv-body">
          {allItems.length === 0 ? (
            <div className="rv-empty-state">
              <CalendarClock size={48} style={{ color: '#2a2a2a', marginBottom: '1rem' }} />
              <p className="rv-empty-title">Queue is empty</p>
              <p className="rv-empty-desc">
                Use the <span style={{ color: '#a78bfa' }}>📅</span> button on any question
                to schedule it for revision.
              </p>
            </div>
          ) : (
            <>
              <BucketSection
                label="Overdue"
                icon={RotateCcw}
                color="#ff7675"
                items={overdue}
                onComplete={handleComplete}
                onRemove={handleRemove}
                onReschedule={handleReschedule}
              />
              <BucketSection
                label="Today"
                icon={Clock}
                color="#ff5e00"
                items={today}
                emptyMsg={overdue.length === 0 ? "Nothing scheduled for today." : null}
                onComplete={handleComplete}
                onRemove={handleRemove}
                onReschedule={handleReschedule}
              />
              <BucketSection
                label="Tomorrow"
                icon={CalendarClock}
                color="#fdcb6e"
                items={tomorrow}
                onComplete={handleComplete}
                onRemove={handleRemove}
                onReschedule={handleReschedule}
              />
              <BucketSection
                label="This Week"
                icon={CalendarClock}
                color="#a78bfa"
                items={thisWeek}
                onComplete={handleComplete}
                onRemove={handleRemove}
                onReschedule={handleReschedule}
              />
              <BucketSection
                label="Completed"
                icon={CheckCircle2}
                color="#00b894"
                items={completed}
                onComplete={handleComplete}
                onRemove={handleRemove}
                onReschedule={handleReschedule}
              />
            </>
          )}
        </div>

        <div className="rv-footer">
          Schedule questions from the revision (📅) button on each question row.
        </div>
      </div>
    </>
  );
}
