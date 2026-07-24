import { useState, useRef } from 'react';
import { Search, X, Star, CheckCircle2, Circle, Zap, Flame, Trophy, Filter, Tag } from 'lucide-react';
import { MISTAKE_TAGS, PATTERN_TAGS, COMPANY_TAGS } from '../constants/tags';

const STATUS_PILLS = [
  { key: 'ALL',      label: 'All',      icon: Filter,       color: '#a78bfa' },
  { key: 'SOLVED',   label: 'Solved',   icon: CheckCircle2, color: '#00b894' },
  { key: 'UNSOLVED', label: 'Unsolved', icon: Circle,       color: '#94a3b8' },
  { key: 'STARRED',  label: 'Starred',  icon: Star,         color: '#f1c40f' },
];

const DIFFICULTY_PILLS = [
  { key: 'ALL',    label: 'All',    color: '#888' },
  { key: 'Easy',   label: 'Easy',   icon: Zap,    color: '#00b894' },
  { key: 'Medium', label: 'Medium', icon: Flame,  color: '#fdcb6e' },
  { key: 'Hard',   label: 'Hard',   icon: Trophy, color: '#ff7675' },
];

export function SearchFilter({
  searchQuery,
  setSearchQuery,
  filterStatus,
  setFilterStatus,
  filterDifficulty,
  setFilterDifficulty,
  filterTag = 'ALL',
  setFilterTag,
}) {
  const inputRef = useRef(null);
  const [tagCategory, setTagCategory] = useState('All'); // 'All' | 'Mistakes' | 'Patterns' | 'Companies'

  const isFiltered =
    searchQuery.trim().length > 0 ||
    filterStatus !== 'ALL' ||
    filterDifficulty !== 'ALL' ||
    filterTag !== 'ALL';

  const clearAll = () => {
    setSearchQuery('');
    setFilterStatus('ALL');
    setFilterDifficulty('ALL');
    if (setFilterTag) setFilterTag('ALL');
    inputRef.current?.focus();
  };

  const getTagsForSelectedCategory = () => {
    if (tagCategory === 'Mistakes') return MISTAKE_TAGS;
    if (tagCategory === 'Patterns') return PATTERN_TAGS;
    if (tagCategory === 'Companies') return COMPANY_TAGS;
    return [...MISTAKE_TAGS, ...PATTERN_TAGS, ...COMPANY_TAGS];
  };

  return (
    <div className="sf-wrapper">
      {/* Search Row */}
      <div className="sf-search-row">
        <div className="sf-search-box">
          <Search size={15} className="sf-search-icon" />
          <input
            ref={inputRef}
            type="text"
            className="sf-input"
            placeholder="Search questions by title…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoComplete="off"
            spellCheck="false"
          />
          {searchQuery && (
            <button
              className="sf-clear-btn"
              onClick={() => { setSearchQuery(''); inputRef.current?.focus(); }}
              title="Clear search"
            >
              <X size={13} />
            </button>
          )}
        </div>

        {isFiltered && (
          <button className="sf-reset-btn" onClick={clearAll} title="Clear all filters">
            <X size={13} /> Reset
          </button>
        )}
      </div>

      {/* Primary Filter Pills Row (Status + Difficulty) */}
      <div className="sf-pills-row">
        {/* Status pills */}
        <div className="sf-pill-group">
          <span className="sf-pill-label">Status</span>
          {STATUS_PILLS.map(({ key, label, icon: Icon, color }) => {
            const active = filterStatus === key;
            return (
              <button
                key={key}
                className={`sf-pill ${active ? 'sf-pill-active' : ''}`}
                style={active ? { '--pill-color': color } : {}}
                onClick={() => setFilterStatus(key)}
                title={label}
              >
                {Icon && <Icon size={12} style={active ? { color } : {}} />}
                {label}
                {active && key !== 'ALL' && (
                  <span
                    className="sf-pill-dot"
                    style={{ background: color }}
                  />
                )}
              </button>
            );
          })}
        </div>

        <div className="sf-pill-divider" />

        {/* Difficulty pills */}
        <div className="sf-pill-group">
          <span className="sf-pill-label">Difficulty</span>
          {DIFFICULTY_PILLS.map(({ key, label, icon: Icon, color }) => {
            const active = filterDifficulty === key;
            return (
              <button
                key={key}
                className={`sf-pill ${active ? 'sf-pill-active' : ''}`}
                style={active ? { '--pill-color': color } : {}}
                onClick={() => setFilterDifficulty(key)}
                title={label}
              >
                {Icon && <Icon size={12} style={active ? { color } : {}} />}
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Secondary Tags Filter Row */}
      {setFilterTag && (
        <div className="sf-tag-filter-section">
          <div className="sf-tag-category-bar">
            <span className="sf-pill-label d-flex align-items-center gap-1">
              <Tag size={11} /> Tags Filter
            </span>
            <div className="sf-tag-cat-buttons">
              {['All', 'Mistakes', 'Patterns', 'Companies'].map(cat => (
                <button
                  key={cat}
                  className={`sf-tag-cat-btn ${tagCategory === cat ? 'active' : ''}`}
                  onClick={() => setTagCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="sf-pills-row sf-tags-pills-row">
            <button
              className={`sf-pill ${filterTag === 'ALL' ? 'sf-pill-active' : ''}`}
              style={filterTag === 'ALL' ? { '--pill-color': '#888' } : {}}
              onClick={() => setFilterTag('ALL')}
            >
              All Tags
            </button>
            {getTagsForSelectedCategory().map((t) => {
              const active = filterTag === t.name;
              return (
                <button
                  key={t.name}
                  className={`sf-pill ${active ? 'sf-pill-active' : ''}`}
                  style={active ? { '--pill-color': t.color } : {}}
                  onClick={() => setFilterTag(active ? 'ALL' : t.name)}
                  title={`Filter by ${t.name} (${t.category})`}
                >
                  <span className="sf-pill-dot" style={{ background: t.color }} />
                  {t.name}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
