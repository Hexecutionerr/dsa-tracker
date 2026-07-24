// src/components/QuestionItem.jsx
import { Draggable } from '@hello-pangea/dnd';
import { GripVertical, Trash2, Circle, CheckCircle2, Star, FileText, ExternalLink } from 'lucide-react';
import classNames from 'classnames';

const difficultyStyle = {
  Easy: { color: '#34D399', border: '1px solid rgba(52, 211, 153, 0.3)', bg: 'rgba(52, 211, 153, 0.1)' },
  Medium: { color: '#FBBF24', border: '1px solid rgba(251, 191, 36, 0.3)', bg: 'rgba(251, 191, 36, 0.1)' },
  Hard: { color: '#F87171', border: '1px solid rgba(248, 113, 113, 0.3)', bg: 'rgba(248, 113, 113, 0.1)' },
};

const getFavicon = (url) => {
  try {
    if (!url) return null;
    const domain = new URL(url).hostname;
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
  } catch {
    return null;
  }
};

export const QuestionItem = ({
  question, index, topicId, subTopicId,
  toggleStatus, onDelete, onToggleStar, onOpenNotes,
}) => {
  const diffStyle  = difficultyStyle[question.difficulty] || difficultyStyle.Medium;
  const platformLogo = getFavicon(question.url);
  const hasNotes   = Boolean(question.notes && question.notes.trim().length > 0);

  return (
    <Draggable draggableId={question.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={classNames('question-item d-flex align-items-center p-3 mb-2 rounded', {
            solved: question.isSolved,
            'shadow-lg': snapshot.isDragging,
          })}
          style={{ ...provided.draggableProps.style }}
        >
          {/* Drag handle */}
          <div {...provided.dragHandleProps} className="text-secondary me-3 opacity-50" style={{ cursor: 'grab' }}>
            <GripVertical size={16} />
          </div>

          {/* Solve Checkbox */}
          <button
            onClick={() => toggleStatus(topicId, subTopicId, question.id)}
            className="btn btn-link p-0 me-3 text-decoration-none"
            style={{ border: 'none' }}
            title={question.isSolved ? "Mark as Unsolved" : "Mark as Solved"}
          >
            {question.isSolved
              ? <CheckCircle2 size={22} color="#34D399" fill="rgba(52, 211, 153, 0.15)" />
              : <Circle size={22} color="var(--theme-text-muted)" />
            }
          </button>

          {/* Title */}
          <div className="flex-grow-1 me-3 overflow-hidden">
            <h6
              className={classNames('question-title mb-0 text-truncate', {
                'text-white': !question.isSolved,
                'text-secondary': question.isSolved,
              })}
              style={{ fontSize: '0.9rem', fontWeight: 600 }}
            >
              {question.title}
            </h6>
          </div>

          {/* Platform link icon */}
          {question.url && question.url !== '#' && (
            <a
              href={question.url}
              target="_blank"
              rel="noreferrer"
              className="me-3 d-flex align-items-center justify-content-center p-1 rounded text-decoration-none"
              style={{ width: '30px', height: '30px', backgroundColor: 'var(--theme-input-bg)', border: '1px solid var(--theme-border)' }}
              title="Open Problem Link"
            >
              {platformLogo
                ? <img src={platformLogo} alt="Platform" style={{ width: '16px', height: '16px', borderRadius: '2px' }} />
                : <ExternalLink size={14} color="var(--theme-text-muted)" />
              }
            </a>
          )}

          {/* Difficulty Badge */}
          <span
            className="badge me-3 fw-normal d-none d-sm-inline-block"
            style={{
              backgroundColor: diffStyle.bg,
              color: diffStyle.color,
              border: diffStyle.border,
              minWidth: '60px',
              padding: '5px 10px',
              borderRadius: '6px',
            }}
          >
            {question.difficulty}
          </span>

          {/* ── QUESTION ACTION BAR (Only 3 Action Icons) ── */}
          <div className="d-flex align-items-center gap-2">
            {/* 1. ⭐ Star (Revision) */}
            <button
              onClick={() => onToggleStar(topicId, subTopicId, question.id)}
              className="btn btn-link p-1 text-decoration-none d-flex align-items-center justify-content-center"
              title={question.isStarred ? 'Unstar Question' : 'Star for Revision'}
              style={{ border: 'none', background: 'transparent' }}
            >
              <Star
                size={18}
                color={question.isStarred ? '#FBBF24' : 'var(--theme-text-muted)'}
                fill={question.isStarred ? '#FBBF24' : 'none'}
              />
            </button>

            {/* 2. 📝 Notes (Slide Drawer) */}
            <button
              onClick={() => onOpenNotes(question)}
              className="btn btn-link p-1 text-decoration-none position-relative d-flex align-items-center justify-content-center"
              title={hasNotes ? 'Notes Available' : 'Notes & Logic Notebook'}
              style={{ border: 'none', background: 'transparent' }}
            >
              <FileText 
                size={18} 
                color={hasNotes ? '#60A5FA' : 'var(--theme-text-muted)'} 
              />
              {hasNotes && (
                <span
                  className="position-absolute top-0 start-100 translate-middle p-1 rounded-circle"
                  style={{ width: '7px', height: '7px', background: '#60A5FA', boxShadow: '0 0 6px #60A5FA' }}
                  title="Notes Available"
                />
              )}
            </button>

            {/* 3. 🗑 Delete */}
            <button
              onClick={() => onDelete(topicId, subTopicId, question.id)}
              className="btn btn-link p-1 text-decoration-none d-flex align-items-center justify-content-center"
              title="Delete Question"
              style={{ border: 'none', background: 'transparent' }}
            >
              <Trash2 size={18} color="#F87171" />
            </button>
          </div>
        </div>
      )}
    </Draggable>
  );
};
