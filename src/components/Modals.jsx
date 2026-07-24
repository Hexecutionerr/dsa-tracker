import { useState } from 'react';
import { X, Save, Plus } from 'lucide-react';

export const NotesModal = ({ isOpen, onClose, question, onSave }) => {
  const [noteText, setNoteText] = useState(question?.notes || '');

  if (!isOpen || !question) return null;

  return (
    <div 
      className="modal fade show d-block" 
      tabIndex="-1" 
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.75)', zIndex: 1050 }}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content card-dark border-secondary">
          <div className="modal-header border-secondary py-3">
            <h5 className="modal-title text-white h6 mb-0 d-flex align-items-center gap-2">
              <span>📝 Personal Notes:</span>
              <span className="text-warning text-truncate" style={{ maxWidth: '280px' }}>
                {question.title}
              </span>
            </h5>
            <button 
              type="button" 
              className="btn-close btn-close-white" 
              onClick={onClose}
            ></button>
          </div>
          <div className="modal-body">
            <label className="form-label text-secondary small">
              Write key logic, time complexity (e.g. O(N)), edge cases, or code snippets:
            </label>
            <textarea
              className="form-control bg-dark text-white border-secondary"
              rows={6}
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="e.g. Space: O(1), Time: O(N log N). Key trick: Two pointer approach..."
              style={{ fontFamily: 'monospace', fontSize: '0.875rem' }}
            />
          </div>
          <div className="modal-footer border-secondary py-2">
            <button 
              type="button" 
              className="btn btn-sm btn-outline-secondary" 
              onClick={onClose}
            >
              Cancel
            </button>
            <button 
              type="button" 
              className="btn btn-sm btn-orange d-flex align-items-center gap-1"
              onClick={() => {
                onSave(noteText);
                onClose();
              }}
            >
              <Save size={14} />
              Save Notes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const AddQuestionModal = ({ isOpen, onClose, onAdd }) => {
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [difficulty, setDifficulty] = useState('Easy');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    onAdd({ title: title.trim(), url: url.trim(), difficulty });
    setTitle('');
    setUrl('');
    setDifficulty('Easy');
    onClose();
  };

  return (
    <div 
      className="modal fade show d-block" 
      tabIndex="-1" 
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.75)', zIndex: 1050 }}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content card-dark border-secondary">
          <div className="modal-header border-secondary py-3">
            <h5 className="modal-title text-white h6 mb-0">Add Custom Question</h5>
            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <div className="mb-3">
                <label className="form-label text-secondary small mb-1">Question Title *</label>
                <input 
                  type="text" 
                  required
                  className="form-control bg-dark text-white border-secondary"
                  placeholder="e.g. 2Sum, 3Sum, Valid Palindrome"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="mb-3">
                <label className="form-label text-secondary small mb-1">Problem Link (LeetCode / GFG / Link)</label>
                <input 
                  type="url" 
                  className="form-control bg-dark text-white border-secondary"
                  placeholder="https://leetcode.com/problems/..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />
              </div>

              <div className="mb-3">
                <label className="form-label text-secondary small mb-1">Difficulty</label>
                <select 
                  className="form-select bg-dark text-white border-secondary"
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>
            </div>
            <div className="modal-footer border-secondary py-2">
              <button type="button" className="btn btn-sm btn-outline-secondary" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn btn-sm btn-orange d-flex align-items-center gap-1">
                <Plus size={14} /> Add Question
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export const AddItemModal = ({ isOpen, onClose, onAdd, titleLabel, placeholder }) => {
  const [val, setVal] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!val.trim()) return;
    onAdd(val.trim());
    setVal('');
    onClose();
  };

  return (
    <div 
      className="modal fade show d-block" 
      tabIndex="-1" 
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.75)', zIndex: 1050 }}
    >
      <div className="modal-dialog modal-dialog-centered modal-sm">
        <div className="modal-content card-dark border-secondary">
          <div className="modal-header border-secondary py-3">
            <h5 className="modal-title text-white h6 mb-0">{titleLabel}</h5>
            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <input 
                type="text" 
                autoFocus
                required
                className="form-control bg-dark text-white border-secondary"
                placeholder={placeholder}
                value={val}
                onChange={(e) => setVal(e.target.value)}
              />
            </div>
            <div className="modal-footer border-secondary py-2">
              <button type="button" className="btn btn-sm btn-outline-secondary" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn btn-sm btn-orange">Add</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
