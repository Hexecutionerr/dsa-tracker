// src/components/ResumeModal.jsx
import { useState, useEffect } from 'react';
import { useSheetStore, defaultResumeData } from '../store';
import { 
  X, Mail, Phone, MapPin, ExternalLink, Printer, Briefcase, 
  GraduationCap, Code2, Award, Sparkles, FolderGit2, Edit3, Save, RotateCcw, Plus, Trash2 
} from 'lucide-react';

export function ResumeModal({ isOpen, onClose }) {
  const { resumeData, updateResumeData } = useSheetStore();
  const res = resumeData || defaultResumeData;

  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(res);
  const [savedNotify, setSavedNotify] = useState(false);
  const [prevOpen, setPrevOpen] = useState(false);

  // Sync draft state when modal opens
  if (isOpen && !prevOpen) {
    setPrevOpen(true);
    setDraft(res);
    setIsEditing(false);
  } else if (!isOpen && prevOpen) {
    setPrevOpen(false);
  }

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleSave = () => {
    updateResumeData(draft);
    setIsEditing(false);
    setSavedNotify(true);
    setTimeout(() => setSavedNotify(false), 2500);
  };

  const handleReset = () => {
    if (window.confirm('Reset resume to original default values?')) {
      updateResumeData(defaultResumeData);
      setDraft(defaultResumeData);
      setIsEditing(false);
    }
  };

  return (
    <div className="analytics-modal-backdrop" onClick={onClose}>
      <div 
        className="analytics-modal-container" 
        style={{ maxWidth: '880px', maxHeight: '92vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="analytics-modal-header d-flex align-items-center justify-content-between px-4 py-3" style={{ borderBottom: '1px solid var(--theme-border)' }}>
          <div className="d-flex align-items-center gap-2">
            <span className="analytics-modal-badge" style={{ background: 'rgba(96, 165, 250, 0.15)', color: '#60A5FA', border: '1px solid rgba(96, 165, 250, 0.3)' }}>
              Resume
            </span>
            <h5 className="m-0 fw-bold" style={{ fontSize: '1.1rem', color: 'var(--theme-text-main)' }}>
              {isEditing ? 'Editing Resume Details' : `${res.name || 'Hasnain Khan'} — Full Stack Engineer`}
            </h5>
            {savedNotify && (
              <span className="badge ms-2" style={{ background: 'rgba(52, 211, 153, 0.2)', color: '#34D399', border: '1px solid rgba(52, 211, 153, 0.4)' }}>
                ✓ Saved Successfully!
              </span>
            )}
          </div>

          <div className="d-flex align-items-center gap-2">
            {isEditing ? (
              <>
                <button
                  onClick={handleSave}
                  className="btn btn-sm d-flex align-items-center gap-1.5"
                  style={{ background: '#34D399', color: '#111827', borderRadius: '8px', fontWeight: 700, fontSize: '0.78rem', padding: '5px 14px' }}
                >
                  <Save size={14} /> Save Changes
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="btn btn-sm d-flex align-items-center gap-1"
                  style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid var(--theme-border)', color: 'var(--theme-text-muted)', borderRadius: '8px', fontSize: '0.78rem' }}
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => { setDraft(res); setIsEditing(true); }}
                  className="btn btn-sm d-flex align-items-center gap-1.5"
                  style={{ background: 'rgba(96, 165, 250, 0.15)', border: '1px solid rgba(96, 165, 250, 0.3)', color: '#60A5FA', borderRadius: '8px', fontWeight: 600, fontSize: '0.78rem', padding: '5px 12px' }}
                  title="Edit Resume Information"
                >
                  <Edit3 size={14} /> Edit Resume
                </button>
                <button
                  onClick={handlePrint}
                  className="btn btn-sm d-flex align-items-center gap-1.5"
                  style={{ background: 'rgba(52, 211, 153, 0.15)', border: '1px solid rgba(52, 211, 153, 0.3)', color: '#34D399', borderRadius: '8px', fontWeight: 600, fontSize: '0.78rem', padding: '5px 12px' }}
                  title="Print or Save PDF"
                >
                  <Printer size={14} /> Print PDF
                </button>
              </>
            )}
            <button onClick={onClose} className="analytics-modal-close-btn" title="Close Modal">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="analytics-modal-body p-4" style={{ overflowY: 'auto' }}>
          {isEditing ? (
            /* ── EDIT MODE FORM ────────────────────────────────────────── */
            <div className="d-flex flex-column gap-4">
              {/* Header Info */}
              <div className="p-3" style={{ background: 'var(--theme-card-secondary-bg)', border: '1px solid var(--theme-border)', borderRadius: '12px' }}>
                <h6 className="fw-bold mb-3" style={{ color: '#60A5FA', fontSize: '0.85rem' }}>Personal & Contact Details</h6>
                <div className="row g-2">
                  <div className="col-md-6">
                    <label className="form-label" style={{ fontSize: '0.72rem', color: 'var(--theme-text-muted)' }}>Full Name</label>
                    <input 
                      type="text" 
                      className="sf-input"
                      value={draft.name || ''} 
                      onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label" style={{ fontSize: '0.72rem', color: 'var(--theme-text-muted)' }}>Tagline / Title</label>
                    <input 
                      type="text" 
                      className="sf-input"
                      value={draft.tagline || ''} 
                      onChange={(e) => setDraft({ ...draft, tagline: e.target.value })}
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label" style={{ fontSize: '0.72rem', color: 'var(--theme-text-muted)' }}>Location</label>
                    <input 
                      type="text" 
                      className="sf-input"
                      value={draft.location || ''} 
                      onChange={(e) => setDraft({ ...draft, location: e.target.value })}
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label" style={{ fontSize: '0.72rem', color: 'var(--theme-text-muted)' }}>Phone Number</label>
                    <input 
                      type="text" 
                      className="sf-input"
                      value={draft.phone || ''} 
                      onChange={(e) => setDraft({ ...draft, phone: e.target.value })}
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label" style={{ fontSize: '0.72rem', color: 'var(--theme-text-muted)' }}>Email Address</label>
                    <input 
                      type="email" 
                      className="sf-input"
                      value={draft.email || ''} 
                      onChange={(e) => setDraft({ ...draft, email: e.target.value })}
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label" style={{ fontSize: '0.72rem', color: 'var(--theme-text-muted)' }}>LinkedIn URL</label>
                    <input 
                      type="text" 
                      className="sf-input"
                      value={draft.linkedin || ''} 
                      onChange={(e) => setDraft({ ...draft, linkedin: e.target.value })}
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label" style={{ fontSize: '0.72rem', color: 'var(--theme-text-muted)' }}>GitHub URL</label>
                    <input 
                      type="text" 
                      className="sf-input"
                      value={draft.github || ''} 
                      onChange={(e) => setDraft({ ...draft, github: e.target.value })}
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label" style={{ fontSize: '0.72rem', color: 'var(--theme-text-muted)' }}>LeetCode URL</label>
                    <input 
                      type="text" 
                      className="sf-input"
                      value={draft.leetcode || ''} 
                      onChange={(e) => setDraft({ ...draft, leetcode: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Summary */}
              <div className="p-3" style={{ background: 'var(--theme-card-secondary-bg)', border: '1px solid var(--theme-border)', borderRadius: '12px' }}>
                <h6 className="fw-bold mb-2" style={{ color: '#34D399', fontSize: '0.85rem' }}>Professional Summary</h6>
                <textarea
                  className="sf-input w-100"
                  rows={4}
                  value={draft.summary || ''}
                  onChange={(e) => setDraft({ ...draft, summary: e.target.value })}
                />
              </div>

              {/* Technical Skills */}
              <div className="p-3" style={{ background: 'var(--theme-card-secondary-bg)', border: '1px solid var(--theme-border)', borderRadius: '12px' }}>
                <h6 className="fw-bold mb-3" style={{ color: '#FBBF24', fontSize: '0.85rem' }}>Technical Skills Category List</h6>
                <div className="d-flex flex-column gap-2">
                  {(draft.skills || []).map((sk, idx) => (
                    <div key={idx} className="row g-2 align-items-center">
                      <div className="col-md-4">
                        <input 
                          type="text" 
                          className="sf-input" 
                          value={sk.label}
                          onChange={(e) => {
                            const newSkills = [...draft.skills];
                            newSkills[idx].label = e.target.value;
                            setDraft({ ...draft, skills: newSkills });
                          }}
                        />
                      </div>
                      <div className="col-md-8">
                        <input 
                          type="text" 
                          className="sf-input" 
                          value={sk.val}
                          onChange={(e) => {
                            const newSkills = [...draft.skills];
                            newSkills[idx].val = e.target.value;
                            setDraft({ ...draft, skills: newSkills });
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Education */}
              <div className="p-3" style={{ background: 'var(--theme-card-secondary-bg)', border: '1px solid var(--theme-border)', borderRadius: '12px' }}>
                <h6 className="fw-bold mb-2" style={{ color: '#60A5FA', fontSize: '0.85rem' }}>Education</h6>
                <div className="row g-2">
                  <div className="col-md-5">
                    <label className="form-label" style={{ fontSize: '0.72rem', color: 'var(--theme-text-muted)' }}>Institute Name</label>
                    <input 
                      type="text" 
                      className="sf-input"
                      value={draft.education?.institute || ''} 
                      onChange={(e) => setDraft({ ...draft, education: { ...draft.education, institute: e.target.value } })}
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label" style={{ fontSize: '0.72rem', color: 'var(--theme-text-muted)' }}>Degree / Branch</label>
                    <input 
                      type="text" 
                      className="sf-input"
                      value={draft.education?.degree || ''} 
                      onChange={(e) => setDraft({ ...draft, education: { ...draft.education, degree: e.target.value } })}
                    />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label" style={{ fontSize: '0.72rem', color: 'var(--theme-text-muted)' }}>CGPA</label>
                    <input 
                      type="text" 
                      className="sf-input"
                      value={draft.education?.cgpa || ''} 
                      onChange={(e) => setDraft({ ...draft, education: { ...draft.education, cgpa: e.target.value } })}
                    />
                  </div>
                </div>
              </div>

              {/* Action Bar inside Edit Form */}
              <div className="d-flex align-items-center justify-content-between pt-2">
                <button
                  type="button"
                  onClick={handleReset}
                  className="btn btn-sm d-flex align-items-center gap-1 text-danger"
                  style={{ background: 'rgba(248, 113, 113, 0.1)', border: '1px solid rgba(248, 113, 113, 0.25)', borderRadius: '8px', fontSize: '0.78rem' }}
                >
                  <RotateCcw size={13} /> Reset to Defaults
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  className="btn btn-sm d-flex align-items-center gap-1.5"
                  style={{ background: '#34D399', color: '#111827', borderRadius: '8px', fontWeight: 700, fontSize: '0.82rem', padding: '6px 18px' }}
                >
                  <Save size={15} /> Save All Edits
                </button>
              </div>
            </div>
          ) : (
            /* ── READ / VIEW MODE ───────────────────────────────────────── */
            <>
              {/* Top Header Card */}
              <div 
                className="p-4 mb-4" 
                style={{
                  background: 'var(--theme-card-secondary-bg)',
                  border: '1px solid var(--theme-border)',
                  borderRadius: '14px',
                }}
              >
                <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
                  <div>
                    <h2 className="fw-extrabold m-0" style={{ color: 'var(--theme-text-main)', fontSize: '1.8rem', letterSpacing: '-0.5px' }}>
                      {res.name}
                    </h2>
                    <p className="m-0 mt-1 fw-semibold" style={{ color: '#60A5FA', fontSize: '0.92rem' }}>
                      {res.tagline}
                    </p>
                    <div className="d-flex flex-wrap align-items-center gap-3 mt-2" style={{ color: 'var(--theme-text-muted)', fontSize: '0.8rem' }}>
                      <span className="d-flex align-items-center gap-1"><MapPin size={13} color="#60A5FA" /> {res.location}</span>
                      <span className="d-flex align-items-center gap-1"><Phone size={13} color="#34D399" /> {res.phone}</span>
                      <a href={`mailto:${res.email}`} className="d-flex align-items-center gap-1 text-decoration-none" style={{ color: 'var(--theme-text-muted)' }}>
                        <Mail size={13} color="#FBBF24" /> {res.email}
                      </a>
                    </div>
                  </div>

                  {/* Quick Links Badges */}
                  <div className="d-flex gap-2">
                    {res.linkedin && (
                      <a
                        href={res.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-sm d-flex align-items-center gap-1"
                        style={{ background: 'rgba(96, 165, 250, 0.1)', border: '1px solid rgba(96, 165, 250, 0.3)', color: '#60A5FA', borderRadius: '8px', fontSize: '0.78rem', fontWeight: 600 }}
                      >
                        <ExternalLink size={13} /> LinkedIn
                      </a>
                    )}
                    {res.github && (
                      <a
                        href={res.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-sm d-flex align-items-center gap-1"
                        style={{ background: 'rgba(255, 255, 255, 0.08)', border: '1px solid var(--theme-border)', color: 'var(--theme-text-main)', borderRadius: '8px', fontSize: '0.78rem', fontWeight: 600 }}
                      >
                        <ExternalLink size={13} /> GitHub
                      </a>
                    )}
                    {res.leetcode && (
                      <a
                        href={res.leetcode}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-sm d-flex align-items-center gap-1"
                        style={{ background: 'rgba(251, 191, 36, 0.1)', border: '1px solid rgba(251, 191, 36, 0.3)', color: '#FBBF24', borderRadius: '8px', fontSize: '0.78rem', fontWeight: 600 }}
                      >
                        <ExternalLink size={13} /> LeetCode
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Professional Summary */}
              <div className="mb-4">
                <h6 className="fw-bold d-flex align-items-center gap-2 mb-2" style={{ color: '#60A5FA', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  <Sparkles size={15} /> Professional Summary
                </h6>
                <p className="m-0" style={{ color: 'var(--theme-text-muted)', fontSize: '0.86rem', lineHeight: '1.65' }}>
                  {res.summary}
                </p>
              </div>

              {/* Technical Skills */}
              <div className="mb-4">
                <h6 className="fw-bold d-flex align-items-center gap-2 mb-2" style={{ color: '#34D399', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  <Code2 size={15} /> Technical Skills
                </h6>
                <div className="row g-2">
                  {(res.skills || []).map((skill, idx) => (
                    <div key={idx} className="col-md-6">
                      <div className="p-2.5 h-100" style={{ background: 'var(--theme-card-secondary-bg)', border: '1px solid var(--theme-border)', borderRadius: '10px' }}>
                        <span className="d-block fw-bold" style={{ fontSize: '0.76rem', color: '#60A5FA' }}>{skill.label}</span>
                        <span style={{ fontSize: '0.78rem', color: 'var(--theme-text-muted)' }}>{skill.val}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Projects Section */}
              <div className="mb-4">
                <h6 className="fw-bold d-flex align-items-center gap-2 mb-2.5" style={{ color: '#FBBF24', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  <FolderGit2 size={15} /> Key Projects
                </h6>

                {(res.projects || []).map((proj, pIdx) => (
                  <div key={proj.id || pIdx} className="p-3 mb-3" style={{ background: 'var(--theme-card-secondary-bg)', border: '1px solid var(--theme-border)', borderRadius: '12px' }}>
                    <div className="d-flex align-items-center justify-content-between mb-1.5">
                      <span className="fw-bold" style={{ fontSize: '0.95rem', color: 'var(--theme-text-main)' }}>
                        {proj.title}
                      </span>
                      <span className="badge" style={{ background: 'rgba(96, 165, 250, 0.15)', color: '#60A5FA', fontSize: '0.72rem' }}>{proj.year}</span>
                    </div>
                    {proj.stack && (
                      <p className="m-0 mb-2 font-monospace" style={{ fontSize: '0.75rem', color: '#34D399' }}>
                        Stack: {proj.stack}
                      </p>
                    )}
                    <ul className="m-0 ps-3" style={{ fontSize: '0.82rem', color: 'var(--theme-text-muted)', lineHeight: '1.6' }}>
                      {(proj.bullets || []).map((b, bIdx) => (
                        <li key={bIdx}>{b}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              {/* Work Experience */}
              <div className="mb-4">
                <h6 className="fw-bold d-flex align-items-center gap-2 mb-2.5" style={{ color: '#F87171', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  <Briefcase size={15} /> Work Experience & Training
                </h6>

                {(res.experiences || []).map((exp, eIdx) => (
                  <div key={exp.id || eIdx} className="p-3 mb-2.5" style={{ background: 'var(--theme-card-secondary-bg)', border: '1px solid var(--theme-border)', borderRadius: '12px' }}>
                    <div className="d-flex align-items-center justify-content-between">
                      <div>
                        <span className="fw-bold" style={{ fontSize: '0.9rem', color: 'var(--theme-text-main)' }}>{exp.company}</span>
                        <span className="ms-2" style={{ fontSize: '0.8rem', color: '#60A5FA' }}>— {exp.role}</span>
                      </div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--theme-text-muted)' }}>{exp.date}</span>
                    </div>
                    <ul className="m-0 mt-2 ps-3" style={{ fontSize: '0.82rem', color: 'var(--theme-text-muted)', lineHeight: '1.6' }}>
                      {(exp.bullets || []).map((b, bIdx) => (
                        <li key={bIdx}>{b}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              {/* Education & Certifications */}
              <div className="row g-3">
                {/* Education */}
                <div className="col-md-6">
                  <div className="p-3 h-100" style={{ background: 'var(--theme-card-secondary-bg)', border: '1px solid var(--theme-border)', borderRadius: '12px' }}>
                    <h6 className="fw-bold d-flex align-items-center gap-2 mb-2" style={{ color: '#60A5FA', fontSize: '0.82rem', textTransform: 'uppercase' }}>
                      <GraduationCap size={15} /> Education
                    </h6>
                    <div className="fw-bold" style={{ fontSize: '0.88rem', color: 'var(--theme-text-main)' }}>{res.education?.institute}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--theme-text-muted)' }}>{res.education?.degree}</div>
                    {res.education?.cgpa && (
                      <div className="badge mt-2" style={{ background: 'rgba(52, 211, 153, 0.15)', color: '#34D399', fontSize: '0.75rem' }}>
                        CGPA: {res.education.cgpa}
                      </div>
                    )}
                  </div>
                </div>

                {/* Certifications */}
                <div className="col-md-6">
                  <div className="p-3 h-100" style={{ background: 'var(--theme-card-secondary-bg)', border: '1px solid var(--theme-border)', borderRadius: '12px' }}>
                    <h6 className="fw-bold d-flex align-items-center gap-2 mb-2" style={{ color: '#FBBF24', fontSize: '0.82rem', textTransform: 'uppercase' }}>
                      <Award size={15} /> Certifications
                    </h6>
                    <ul className="m-0 ps-3" style={{ fontSize: '0.78rem', color: 'var(--theme-text-muted)', lineHeight: '1.5' }}>
                      {(res.certifications || []).map((cert, cIdx) => (
                        <li key={cIdx}>{cert}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
