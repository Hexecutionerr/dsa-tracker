import { useState, useMemo, useEffect } from 'react';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import { useSheetStore } from './store';
import { TopicItem } from './components/TopicItem';
import { Plus, Github, Linkedin, Calendar, FileText, ExternalLink, CalendarClock, BarChart3, Database, Sun, Moon } from 'lucide-react';
import { Analytics } from '@vercel/analytics/react';
import { AddQuestionModal, AddItemModal } from './components/Modals';
import { NotesDrawer } from './components/NotesDrawer';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { SearchFilter } from './components/SearchFilter';
import { RevisionPanel } from './components/RevisionPanel';
import { DailyGoal } from './components/DailyGoal';
import { ContributionHeatmap } from './components/ContributionHeatmap';
import { StreakWidget } from './components/StreakWidget';
import { AnalyticsPageModal } from './components/AnalyticsPageModal';
import { DataManagementModal } from './components/DataManagementModal';
import { ResumeModal } from './components/ResumeModal';

function App() {
  const { 
    data, 
    reorder, 
    addTopic, 
    addSubTopic, 
    addQuestion, 
    themeMode,
    toggleThemeMode,
  } = useSheetStore();

  // Apply theme attribute to document element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', themeMode || 'dark');
  }, [themeMode]);

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL'); // ALL, SOLVED, UNSOLVED, STARRED
  const [filterDifficulty, setFilterDifficulty] = useState('ALL'); // ALL, Easy, Medium, Hard
  const [filterTag, setFilterTag] = useState('ALL');

  // Modals States
  const [isTopicModalOpen, setIsTopicModalOpen] = useState(false);
  const [activeTopicForSub, setActiveTopicForSub] = useState(null);
  const [activeSubForQuestion, setActiveSubForQuestion] = useState(null); // { topicId, subTopicId }
  const [activeQuestionForNotes, setActiveQuestionForNotes] = useState(null);
  const [isRevisionOpen, setIsRevisionOpen] = useState(false);
  const [isAnalyticsPageOpen, setIsAnalyticsPageOpen] = useState(false);
  const [isDataModalOpen, setIsDataModalOpen] = useState(false);
  const [isResumeModalOpen, setIsResumeModalOpen] = useState(false);

  // Count pending revisions for badge
  const pendingRevisions = useMemo(() => {
    let count = 0;
    data.forEach(t => t.subTopics.forEach(s => s.questions.forEach(q => {
      if (q.revisionDate && !q.revisionDoneAt) count++;
    })));
    return count;
  }, [data]);

  const handleDragEnd = (result) => {
    reorder(result);
  };

  // Compute Overall Stats
  const stats = useMemo(() => {
    let total = 0;
    let solved = 0;
    let easy = 0;
    let easySolved = 0;
    let medium = 0;
    let mediumSolved = 0;
    let hard = 0;
    let hardSolved = 0;
    let starred = 0;

    data.forEach(topic => {
      topic.subTopics.forEach(sub => {
        sub.questions.forEach(q => {
          total++;
          if (q.isSolved) solved++;
          if (q.isStarred) starred++;

          if (q.difficulty === 'Easy') {
            easy++;
            if (q.isSolved) easySolved++;
          } else if (q.difficulty === 'Hard') {
            hard++;
            if (q.isSolved) hardSolved++;
          } else {
            medium++;
            if (q.isSolved) mediumSolved++;
          }
        });
      });
    });

    const percent = total === 0 ? 0 : Math.round((solved / total) * 100);
    return { total, solved, percent, easy, easySolved, medium, mediumSolved, hard, hardSolved, starred };
  }, [data]);

  // Motivational quotes — picked once per mount
  const QUOTES = [
    "First, solve the problem. Then, write the code. — John Johnson",
    "Code is like humor. When you have to explain it, it's bad. — Cory House",
    "The best way to predict the future is to implement it. — David Heinemeier Hansson",
    "Every expert was once a beginner. Keep grinding.",
    "Consistency beats talent when talent doesn't work consistently.",
    "One algorithm a day keeps the interviewer away.",
    "Big-O complexity is a compass, not a destination.",
    "Debug your code like you debug your life — one step at a time.",
    "The secret of getting ahead is getting started. — Mark Twain",
    "Data structures are the backbone of every great solution.",
  ];
  // useMemo so the quote doesn't change on re-renders within the same session
  const dailyQuote = useMemo(() => {
    const dayIndex = new Date().getDay() + new Date().getDate();
    return QUOTES[dayIndex % QUOTES.length];
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const todayDate = new Date().toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
  });

  return (
    <>
      <div className="min-vh-100 py-5">
        <div className="container" style={{ maxWidth: '950px' }}>
          
          {/* ── Premium Glassmorphism Header ── */}
          <div className="header-glass">
            <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center gap-3">

              {/* Avatar */}
              <a
                href="https://github.com/Hexecutionerr"
                target="_blank"
                rel="noopener noreferrer"
                title="Hasnain Khan on GitHub"
                className="hk-avatar"
              >
                HK
              </a>

              {/* Title + Quote + Date */}
              <div className="flex-grow-1 min-w-0">
                <div className="d-flex flex-wrap align-items-center gap-2 mb-1">
                  <h1 className="header-title-main text-white mb-0">
                    Hasnain's&nbsp;<span className="header-title-accent">DSA Tracker</span>
                  </h1>
                  <span className="header-date-badge">
                    <Calendar size={11} />
                    {todayDate}
                  </span>
                </div>
                <p className="header-quote mb-0">
                  &ldquo;{dailyQuote}&rdquo;
                </p>
              </div>

              {/* Social Links + New Topic — right side */}
              <div className="d-flex flex-wrap gap-2 align-items-center mt-2 mt-md-0">
                <a
                  href="https://github.com/Hexecutionerr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="header-social-btn github"
                  title="GitHub"
                >
                  <Github size={14} /> GitHub
                </a>

                <a
                  href="https://www.linkedin.com/in/hasnain-khan-0ab3b2320"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="header-social-btn linkedin"
                  title="LinkedIn"
                >
                  <Linkedin size={14} /> LinkedIn
                </a>

                <a
                  href="https://leetcode.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="header-social-btn leetcode"
                  title="LeetCode Profile"
                >
                  <ExternalLink size={13} /> LeetCode
                </a>

                <button
                  className="header-social-btn resume border-0 cursor-pointer"
                  title="View / Print Hasnain's Resume"
                  onClick={() => setIsResumeModalOpen(true)}
                  style={{ cursor: 'pointer' }}
                >
                  <FileText size={14} /> Resume
                </button>

                {/* Theme Mode Toggle Button */}
                <button
                  onClick={toggleThemeMode}
                  className="btn d-flex align-items-center gap-2"
                  style={{
                    borderRadius: '8px', fontWeight: 600, fontSize: '0.85rem',
                    background: themeMode === 'light' ? 'rgba(255, 153, 0, 0.15)' : 'rgba(255, 255, 255, 0.08)',
                    border: themeMode === 'light' ? '1px solid rgba(255, 153, 0, 0.3)' : '1px solid rgba(255, 255, 255, 0.15)',
                    color: themeMode === 'light' ? '#e67e22' : '#fdcb6e',
                  }}
                  title={themeMode === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
                >
                  {themeMode === 'light' ? <Moon size={15} /> : <Sun size={15} />}
                  {themeMode === 'light' ? 'Dark' : 'Light'}
                </button>

                <button
                  onClick={() => setIsDataModalOpen(true)}
                  className="btn d-flex align-items-center gap-2"
                  style={{
                    borderRadius: '8px', fontWeight: 600, fontSize: '0.85rem',
                    background: 'rgba(0, 184, 148, 0.12)',
                    border: '1px solid rgba(0, 184, 148, 0.3)',
                    color: '#00b894',
                  }}
                  title="Export, Import or Reset Data"
                >
                  <Database size={15} />
                  Data
                </button>

                <button
                  onClick={() => setIsAnalyticsPageOpen(true)}
                  className="btn d-flex align-items-center gap-2"
                  style={{
                    borderRadius: '8px', fontWeight: 600, fontSize: '0.85rem',
                    background: 'rgba(255, 94, 0, 0.12)',
                    border: '1px solid rgba(255, 94, 0, 0.3)',
                    color: '#ff5e00',
                  }}
                  title="Open Analytics Page"
                >
                  <BarChart3 size={15} />
                  Analytics
                </button>

                <button
                  onClick={() => setIsRevisionOpen(true)}
                  className="btn d-flex align-items-center gap-2 position-relative"
                  style={{
                    borderRadius: '8px', fontWeight: 600, fontSize: '0.85rem',
                    background: 'rgba(167,139,250,0.12)',
                    border: '1px solid rgba(167,139,250,0.3)',
                    color: '#a78bfa',
                  }}
                  title="Open Revision Queue"
                >
                  <CalendarClock size={15} />
                  Revision
                  {pendingRevisions > 0 && (
                    <span style={{
                      position: 'absolute', top: '-6px', right: '-6px',
                      background: '#ff5e00', color: '#fff',
                      fontSize: '0.6rem', fontWeight: 800,
                      borderRadius: '99px', padding: '1px 5px', minWidth: '16px',
                      lineHeight: '14px', textAlign: 'center',
                    }}>
                      {pendingRevisions}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setIsTopicModalOpen(true)}
                  className="btn btn-orange d-flex align-items-center gap-2 shadow-lg"
                  style={{ borderRadius: '8px', fontWeight: 600, fontSize: '0.85rem' }}
                >
                  <Plus size={16} />
                  New Topic
                </button>
              </div>

            </div>
          </div>

          {/* Analytics Dashboard */}
          <AnalyticsDashboard stats={stats} />

          {/* Daily Goal */}
          <DailyGoal />

          {/* Streak System */}
          <StreakWidget />

          {/* Contribution Heatmap */}
          <ContributionHeatmap />

          {/* Search & Filter */}
          <SearchFilter
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            filterStatus={filterStatus}
            setFilterStatus={setFilterStatus}
            filterDifficulty={filterDifficulty}
            setFilterDifficulty={setFilterDifficulty}
            filterTag={filterTag}
            setFilterTag={setFilterTag}
          />

          {/* Main Content (Topic List) */}
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="all-topics" type="TOPIC">
              {(provided) => (
                <div ref={provided.innerRef} {...provided.droppableProps}>
                  {data.map((topic, index) => (
                    <TopicItem 
                      key={topic.id} 
                      topic={topic} 
                      index={index} 
                      onOpenAddSubTopic={(topicId) => setActiveTopicForSub(topicId)}
                      onOpenAddQuestion={(topicId, subTopicId) => setActiveSubForQuestion({ topicId, subTopicId })}
                      onOpenNotes={(q) => setActiveQuestionForNotes(q)}
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
          </DragDropContext>

          {data.length === 0 && (
            <div className="text-center py-5 text-secondary border border-dashed border-secondary rounded mt-4">
              <p className="lead mb-0">No topics found. Start your grind!</p>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <AddItemModal
        isOpen={isTopicModalOpen}
        onClose={() => setIsTopicModalOpen(false)}
        onAdd={(title) => addTopic(title)}
        titleLabel="Add New Main Topic"
        placeholder="e.g. Dynamic Programming, Graphs"
      />

      <AddItemModal
        isOpen={Boolean(activeTopicForSub)}
        onClose={() => setActiveTopicForSub(null)}
        onAdd={(title) => {
          if (activeTopicForSub) addSubTopic(activeTopicForSub, title);
        }}
        titleLabel="Add New Sub-Topic"
        placeholder="e.g. 2D DP, Binary Search Trees"
      />

      <AddQuestionModal
        isOpen={Boolean(activeSubForQuestion)}
        onClose={() => setActiveSubForQuestion(null)}
        onAdd={(qData) => {
          if (activeSubForQuestion) {
            addQuestion(activeSubForQuestion.topicId, activeSubForQuestion.subTopicId, qData);
          }
        }}
      />

      <NotesDrawer
        questionId={activeQuestionForNotes?.id ?? null}
        onClose={() => setActiveQuestionForNotes(null)}
      />

      {isRevisionOpen && (
        <RevisionPanel onClose={() => setIsRevisionOpen(false)} />
      )}

      <AnalyticsPageModal
        isOpen={isAnalyticsPageOpen}
        onClose={() => setIsAnalyticsPageOpen(false)}
      />

      <DataManagementModal
        isOpen={isDataModalOpen}
        onClose={() => setIsDataModalOpen(false)}
      />

      <ResumeModal
        isOpen={isResumeModalOpen}
        onClose={() => setIsResumeModalOpen(false)}
      />

      <Analytics />
    </>
  );
}

export default App;
