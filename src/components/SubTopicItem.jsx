import { useState } from 'react';
import { Droppable, Draggable } from '@hello-pangea/dnd';
import { ChevronDown, ChevronRight, Plus } from 'lucide-react';
import { QuestionItem } from './QuestionItem';
import { useSheetStore } from '../store';

export const SubTopicItem = ({ 
  subTopic, 
  index, 
  topicId, 
  onOpenAddQuestion, 
  onOpenNotes,
  searchQuery = '',
  filterStatus = 'ALL',
  filterDifficulty = 'ALL',
  filterTag = 'ALL',
}) => {
  const { toggleQuestionStatus, deleteQuestion, toggleStarQuestion, scheduleRevision, removeRevision, toggleQuestionTag } = useSheetStore();
  const [isExpanded, setIsExpanded] = useState(false);

  // Filter questions based on search and filters
  const filteredQuestions = subTopic.questions.filter((q) => {
    // Search matching
    if (searchQuery && !q.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    // Status filter
    if (filterStatus === 'SOLVED' && !q.isSolved) return false;
    if (filterStatus === 'UNSOLVED' && q.isSolved) return false;
    if (filterStatus === 'STARRED' && !q.isStarred) return false;
    // Difficulty filter
    if (filterDifficulty !== 'ALL' && q.difficulty !== filterDifficulty) return false;
    // Tag filter
    if (filterTag !== 'ALL') {
      const tags = Array.isArray(q.tags) ? q.tags : [];
      if (!tags.includes(filterTag)) return false;
    }

    return true;
  });

  const solvedCount = subTopic.questions.filter(q => q.isSolved).length;

  return (
    <Draggable draggableId={subTopic.id} index={index}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className="ms-md-4 ps-3 border-start mb-4 mt-3"
          style={{ borderColor: '#333' }}
        >
          <div className="d-flex align-items-center justify-content-between mb-3 ps-2">
            <div className="d-flex align-items-center gap-2">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="btn btn-sm btn-outline-secondary border-0 rounded-circle p-1 d-flex align-items-center justify-content-center"
                style={{ width: '24px', height: '24px', color: '#ff5e00' }}
              >
                {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </button>
              <h5 
                {...provided.dragHandleProps}
                className="mb-0 fw-bold" 
                style={{ cursor: 'grab', fontSize: '0.95rem', color: '#ccc' }}
              >
                {subTopic.title}
              </h5>
            </div>
            
            <div className="d-flex align-items-center gap-2">
              <button
                onClick={() => {
                  setIsExpanded(true);
                  onOpenAddQuestion(topicId, subTopic.id);
                }}
                className="btn btn-sm btn-outline-secondary border-secondary text-secondary p-1 px-2 d-flex align-items-center gap-1"
                style={{ fontSize: '0.7rem' }}
                title="Add Question to Subtopic"
              >
                <Plus size={12} /> Question
              </button>
              <span className="badge bg-dark border border-secondary text-secondary" style={{ fontSize: '0.7rem' }}>
                {solvedCount} / {subTopic.questions.length}
              </span>
            </div>
          </div>

          {(isExpanded || searchQuery.trim().length > 0) && (
            <Droppable droppableId={`questions::${topicId}::${subTopic.id}`} type="QUESTION">
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="ps-2"
                >
                  {filteredQuestions.map((q, idx) => (
                    <QuestionItem 
                      key={q.id} 
                      question={q} 
                      index={idx} 
                      topicId={topicId}
                      subTopicId={subTopic.id}
                      toggleStatus={toggleQuestionStatus}
                      onDelete={deleteQuestion}
                      onToggleStar={toggleStarQuestion}
                      onOpenNotes={onOpenNotes}
                      onScheduleRevision={scheduleRevision}
                      onRemoveRevision={removeRevision}
                      onToggleTag={toggleQuestionTag}
                    />
                  ))}
                  {provided.placeholder}
                  {filteredQuestions.length === 0 && (
                    <p className="text-secondary small italic py-2 ps-2 mb-0" style={{ fontSize: '0.8rem' }}>
                      {subTopic.questions.length === 0 ? "No questions yet." : "No questions match filter."}
                    </p>
                  )}
                </div>
              )}
            </Droppable>
          )}
        </div>
      )}
    </Draggable>
  );
};
