import { useState, useRef, useEffect } from 'react';
import { Droppable, Draggable } from '@hello-pangea/dnd';
import { ChevronDown, ChevronRight, GripVertical, MoreVertical, Edit3, Plus, Trash2, Check, X } from 'lucide-react';
import { SubTopicItem } from './SubTopicItem';
import { useSheetStore } from '../store';

export const TopicItem = ({ 
  topic, 
  index, 
  onOpenAddSubTopic, 
  onOpenAddQuestion, 
  onOpenNotes,
  searchQuery = '',
  filterStatus = 'ALL',
  filterDifficulty = 'ALL',
  filterTag = 'ALL',
}) => {
  const { deleteTopic, editTopicTitle } = useSheetStore();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(topic.title);

  const menuRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    if (!isMenuOpen) return;
    const handleOutsideClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isMenuOpen]);

  const totalQuestions = topic.subTopics.reduce((acc, sub) => acc + sub.questions.length, 0);
  const solvedQuestions = topic.subTopics.reduce((acc, sub) => acc + sub.questions.filter(q => q.isSolved).length, 0);
  const progressPercent = totalQuestions === 0 ? 0 : (solvedQuestions / totalQuestions) * 100;

  const shouldExpand = isExpanded || searchQuery.trim().length > 0 || filterTag !== 'ALL';

  const handleSaveTitle = () => {
    const trimmed = editTitle.trim();
    if (trimmed && trimmed !== topic.title) {
      editTopicTitle(topic.id, trimmed);
    }
    setIsEditing(false);
  };

  const handleDelete = () => {
    setIsMenuOpen(false);
    const confirmed = window.confirm(
      "Are you sure you want to delete this topic? This will also delete all its subtopics and questions."
    );
    if (confirmed) {
      deleteTopic(topic.id);
    }
  };

  return (
    <Draggable draggableId={topic.id} index={index}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className="card card-dark mb-4 shadow-sm"
        >
          <div className="card-header border-0 d-flex align-items-center py-3" style={{ backgroundColor: 'var(--theme-card-secondary-bg)' }}>
            <div {...provided.dragHandleProps} className="text-secondary me-3" style={{ cursor: 'grab' }}>
              <GripVertical size={20} />
            </div>
            
            <button 
              onClick={() => setIsExpanded(!isExpanded)}
              className="btn btn-sm btn-outline-secondary me-3 border-0 rounded-circle p-1 d-flex align-items-center justify-content-center"
              style={{ width: '30px', height: '30px', color: '#60A5FA' }}
            >
              {shouldExpand ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
            </button>

            {isEditing ? (
              <div className="d-flex align-items-center gap-2 flex-grow-1 me-3">
                <input
                  type="text"
                  className="sf-input py-1 px-2"
                  style={{ fontSize: '0.95rem', fontWeight: 'bold' }}
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveTitle();
                    if (e.key === 'Escape') setIsEditing(false);
                  }}
                  autoFocus
                />
                <button
                  onClick={handleSaveTitle}
                  className="btn btn-sm btn-success p-1 d-flex align-items-center justify-content-center"
                  style={{ width: '28px', height: '28px', borderRadius: '6px' }}
                  title="Save Title"
                >
                  <Check size={16} />
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="btn btn-sm btn-outline-secondary p-1 d-flex align-items-center justify-content-center"
                  style={{ width: '28px', height: '28px', borderRadius: '6px' }}
                  title="Cancel"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <h4 className="h5 mb-0 flex-grow-1 fw-bold text-white me-3">{topic.title}</h4>
            )}

            <div className="d-flex align-items-center gap-3">
              <div className="d-none d-sm-block" style={{ width: '130px' }}>
                <div className="d-flex justify-content-between text-white mb-1" style={{ fontSize: '0.75rem', fontWeight: '500' }}>
                  <span>Progress</span>
                  <span>{Math.round(progressPercent)}%</span>
                </div>
                
                <div className="progress" style={{ height: '6px', backgroundColor: 'var(--theme-border)', borderRadius: '99px' }}>
                  <div 
                    className="progress-bar" 
                    role="progressbar" 
                    style={{ width: `${progressPercent}%`, backgroundColor: '#34D399', borderRadius: '99px' }}
                  ></div>
                </div>
              </div>

              {/* Single "More" (⋮) Dropdown Menu */}
              <div ref={menuRef} style={{ position: 'relative' }}>
                <button
                  onClick={() => setIsMenuOpen(v => !v)}
                  className="btn btn-sm text-secondary border-0 p-1 d-flex align-items-center justify-content-center"
                  style={{ width: '32px', height: '32px', borderRadius: '8px', background: isMenuOpen ? 'rgba(255,255,255,0.08)' : 'transparent' }}
                  title="Topic Actions"
                >
                  <MoreVertical size={18} />
                </button>

                {isMenuOpen && (
                  <div className="topic-dropdown-menu">
                    <button
                      className="topic-dropdown-item"
                      onClick={() => {
                        setIsMenuOpen(false);
                        setEditTitle(topic.title);
                        setIsEditing(true);
                      }}
                    >
                      <Edit3 size={14} />
                      Edit Topic Name
                    </button>
                    <button
                      className="topic-dropdown-item"
                      onClick={() => {
                        setIsMenuOpen(false);
                        setIsExpanded(true);
                        onOpenAddSubTopic(topic.id);
                      }}
                    >
                      <Plus size={14} />
                      Add Subtopic
                    </button>
                    <div style={{ height: '1px', background: 'var(--theme-border)', margin: '4px 0' }} />
                    <button
                      className="topic-dropdown-item danger"
                      onClick={handleDelete}
                    >
                      <Trash2 size={14} />
                      Delete Topic
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {shouldExpand && (
            <Droppable droppableId={`subtopics::${topic.id}`} type="SUBTOPIC">
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="card-body pt-0 pb-2"
                >
                  {topic.subTopics.map((sub, idx) => (
                    <SubTopicItem 
                      key={sub.id} 
                      subTopic={sub} 
                      index={idx} 
                      topicId={topic.id}
                      onOpenAddQuestion={onOpenAddQuestion}
                      onOpenNotes={onOpenNotes}
                      searchQuery={searchQuery}
                      filterStatus={filterStatus}
                      filterDifficulty={filterDifficulty}
                      filterTag={filterTag}
                    />
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          )}
        </div>
      )}
    </Draggable>
  );
};
