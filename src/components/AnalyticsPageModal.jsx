// src/components/AnalyticsPageModal.jsx
import { useMemo, useState } from 'react';
import { useSheetStore } from '../store';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { X, BarChart3, TrendingUp, Calendar, PieChart as PieIcon, Layers, Award } from 'lucide-react';

/* ── Date Helpers ─────────────────────────────────── */
function toDate(isoStr) {
  return isoStr ? new Date(isoStr) : null;
}

function getWeekKey(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  // Sunday of week
  const day = d.getDay();
  const diff = d.getDate() - day;
  const sunday = new Date(d.setDate(diff));
  const month = sunday.toLocaleDateString('en-US', { month: 'short' });
  return `Wk of ${month} ${sunday.getDate()}`;
}

function getMonthKey(date) {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
}

/* ── Data Aggregation ─────────────────────────────── */
function computeAnalyticsData(data) {
  const solvedQuestions = [];
  const difficultyCounts = { Easy: 0, Medium: 0, Hard: 0 };
  const difficultyTotals = { Easy: 0, Medium: 0, Hard: 0 };
  const topicStats = [];

  let totalQuestions = 0;
  let totalSolved = 0;

  for (const topic of data) {
    let tSolved = 0;
    let tTotal = 0;

    for (const sub of topic.subTopics) {
      for (const q of sub.questions) {
        totalQuestions++;
        tTotal++;

        const diff = q.difficulty || 'Medium';
        if (difficultyTotals[diff] !== undefined) {
          difficultyTotals[diff]++;
        }

        if (q.isSolved) {
          totalSolved++;
          tSolved++;
          if (difficultyCounts[diff] !== undefined) {
            difficultyCounts[diff]++;
          }
          if (q.solvedAt) {
            solvedQuestions.push({
              ...q,
              topicTitle: topic.title,
              subTitle: sub.title,
              date: toDate(q.solvedAt),
            });
          }
        }
      }
    }

    topicStats.push({
      topic: topic.title.length > 18 ? topic.title.slice(0, 16) + '…' : topic.title,
      fullTitle: topic.title,
      solved: tSolved,
      total: tTotal,
      percent: tTotal === 0 ? 0 : Math.round((tSolved / tTotal) * 100),
    });
  }

  // 1. Solved per week (Last 8 weeks)
  const weekMap = {};
  // Pre-fill last 8 weeks
  const now = new Date();
  for (let i = 7; i >= 0; i--) {
    const d = new Date();
    d.setDate(now.getDate() - i * 7);
    const wk = getWeekKey(d);
    weekMap[wk] = 0;
  }

  solvedQuestions.forEach(q => {
    if (q.date) {
      const wk = getWeekKey(q.date);
      if (weekMap[wk] !== undefined) {
        weekMap[wk]++;
      }
    }
  });

  const weeklyData = Object.entries(weekMap).map(([week, solved]) => ({
    week,
    solved,
  }));

  // 2. Solved per month (Last 6 months)
  const monthMap = {};
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(now.getMonth() - i);
    const mk = getMonthKey(d);
    monthMap[mk] = 0;
  }

  solvedQuestions.forEach(q => {
    if (q.date) {
      const mk = getMonthKey(q.date);
      if (monthMap[mk] !== undefined) {
        monthMap[mk]++;
      }
    }
  });

  const monthlyData = Object.entries(monthMap).map(([month, solved]) => ({
    month,
    solved,
  }));

  // 3. Difficulty Distribution (Pie Chart Data)
  const difficultyData = [
    { name: 'Easy', solved: difficultyCounts.Easy, total: difficultyTotals.Easy, color: '#00b894' },
    { name: 'Medium', solved: difficultyCounts.Medium, total: difficultyTotals.Medium, color: '#fdcb6e' },
    { name: 'Hard', solved: difficultyCounts.Hard, total: difficultyTotals.Hard, color: '#ff7675' },
  ];

  return {
    totalQuestions,
    totalSolved,
    overallPercent: totalQuestions === 0 ? 0 : Math.round((totalSolved / totalQuestions) * 100),
    weeklyData,
    monthlyData,
    difficultyData,
    topicStats,
  };
}

/* ── Custom Dark Tooltip ──────────────────────────── */
function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div className="analytics-tooltip">
        <p className="analytics-tooltip-label">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="analytics-tooltip-value" style={{ color: entry.color || '#ff5e00' }}>
            {entry.name}: <strong>{entry.value}</strong>
          </p>
        ))}
      </div>
    );
  }
  return null;
}

export function AnalyticsPageModal({ isOpen, onClose }) {
  const { data } = useSheetStore();
  const [activeView, setActiveView] = useState('overview'); // 'overview' | 'trends' | 'topics'

  const analytics = useMemo(() => computeAnalyticsData(data), [data]);

  if (!isOpen) return null;

  return (
    <>
      <div className="analytics-modal-backdrop" onClick={onClose} />
      
      <div className="analytics-modal-container" role="dialog">
        {/* Header */}
        <div className="analytics-modal-header">
          <div className="analytics-modal-title">
            <BarChart3 size={22} style={{ color: '#ff5e00' }} />
            <div>
              <h3>Performance Analytics</h3>
              <p>Visual breakdown of your algorithm practice & consistency</p>
            </div>
          </div>

          <div className="analytics-modal-actions">
            {/* Nav Tabs */}
            <div className="analytics-nav-tabs">
              <button
                className={`analytics-nav-btn ${activeView === 'overview' ? 'active' : ''}`}
                onClick={() => setActiveView('overview')}
              >
                Overview
              </button>
              <button
                className={`analytics-nav-btn ${activeView === 'trends' ? 'active' : ''}`}
                onClick={() => setActiveView('trends')}
              >
                Trends
              </button>
              <button
                className={`analytics-nav-btn ${activeView === 'topics' ? 'active' : ''}`}
                onClick={() => setActiveView('topics')}
              >
                Topics
              </button>
            </div>

            <button className="analytics-close-btn" onClick={onClose} title="Close (Esc)">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="analytics-modal-body">

          {/* Metric Summary Cards */}
          <div className="analytics-summary-row">
            <div className="analytics-summary-card">
              <span className="summary-card-icon" style={{ color: '#ff5e00', background: 'rgba(255, 94, 0, 0.1)' }}>
                <Award size={18} />
              </span>
              <div>
                <span className="summary-card-val">{analytics.totalSolved} / {analytics.totalQuestions}</span>
                <span className="summary-card-lbl">Total Solved</span>
              </div>
            </div>

            <div className="analytics-summary-card">
              <span className="summary-card-icon" style={{ color: '#00b894', background: 'rgba(0, 184, 148, 0.1)' }}>
                <TrendingUp size={18} />
              </span>
              <div>
                <span className="summary-card-val">{analytics.overallPercent}%</span>
                <span className="summary-card-lbl">Sheet Progress</span>
              </div>
            </div>

            <div className="analytics-summary-card">
              <span className="summary-card-icon" style={{ color: '#a78bfa', background: 'rgba(167, 139, 250, 0.1)' }}>
                <Calendar size={18} />
              </span>
              <div>
                <span className="summary-card-val">
                  {analytics.weeklyData.reduce((a, b) => a + b.solved, 0)} Qs
                </span>
                <span className="summary-card-lbl">Last 8 Weeks</span>
              </div>
            </div>

            <div className="analytics-summary-card">
              <span className="summary-card-icon" style={{ color: '#fdcb6e', background: 'rgba(253, 203, 110, 0.1)' }}>
                <Layers size={18} />
              </span>
              <div>
                <span className="summary-card-val">{analytics.topicStats.length}</span>
                <span className="summary-card-lbl">Active Topics</span>
              </div>
            </div>
          </div>

          {/* Charts Grid */}
          <div className="analytics-charts-grid">

            {/* 1. Solved per Month (Area Chart) */}
            {(activeView === 'overview' || activeView === 'trends') && (
              <div className="chart-card">
                <div className="chart-card-header">
                  <span className="chart-title">
                    <TrendingUp size={15} style={{ color: '#ff5e00' }} />
                    Solved Per Month
                  </span>
                  <span className="chart-subtitle">Monthly progress trend</span>
                </div>
                <div className="chart-wrapper">
                  <ResponsiveContainer width="100%" height={240}>
                    <AreaChart data={analytics.monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="monthGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ff5e00" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#ff5e00" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
                      <XAxis dataKey="month" stroke="#666" fontSize={11} />
                      <YAxis stroke="#666" fontSize={11} allowDecimals={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Area type="monotone" dataKey="solved" name="Solved" stroke="#ff5e00" strokeWidth={3} fillOpacity={1} fill="url(#monthGrad)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* 2. Solved per Week (Bar Chart) */}
            {(activeView === 'overview' || activeView === 'trends') && (
              <div className="chart-card">
                <div className="chart-card-header">
                  <span className="chart-title">
                    <Calendar size={15} style={{ color: '#a78bfa' }} />
                    Solved Per Week
                  </span>
                  <span className="chart-subtitle">Last 8 weeks activity</span>
                </div>
                <div className="chart-wrapper">
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={analytics.weeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
                      <XAxis dataKey="week" stroke="#666" fontSize={10} interval={0} angle={-15} textAnchor="end" height={40} />
                      <YAxis stroke="#666" fontSize={11} allowDecimals={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="solved" name="Solved" fill="#a78bfa" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* 3. Difficulty Distribution (Pie/Donut Chart) */}
            {(activeView === 'overview' || activeView === 'topics') && (
              <div className="chart-card">
                <div className="chart-card-header">
                  <span className="chart-title">
                    <PieIcon size={15} style={{ color: '#00b894' }} />
                    Difficulty Breakdown
                  </span>
                  <span className="chart-subtitle">Solved by problem difficulty</span>
                </div>
                <div className="chart-wrapper d-flex align-items-center justify-content-center">
                  <ResponsiveContainer width="100%" height={240}>
                    <PieChart>
                      <Pie
                        data={analytics.difficultyData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={5}
                        dataKey="solved"
                        nameKey="name"
                      >
                        {analytics.difficultyData.map((entry) => (
                          <Cell key={entry.name} fill={entry.color} stroke="none" />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                      <Legend
                        verticalAlign="bottom"
                        height={36}
                        formatter={(value, entry) => (
                          <span style={{ color: '#ccc', fontSize: '0.78rem', fontWeight: 600 }}>
                            {value} ({entry.payload.solved})
                          </span>
                        )}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* 4. Topic Distribution (Horizontal Bar Chart) */}
            {(activeView === 'overview' || activeView === 'topics') && (
              <div className="chart-card">
                <div className="chart-card-header">
                  <span className="chart-title">
                    <Layers size={15} style={{ color: '#fdcb6e' }} />
                    Topic Progress
                  </span>
                  <span className="chart-subtitle">Solved count per main topic</span>
                </div>
                <div className="chart-wrapper">
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart layout="vertical" data={analytics.topicStats} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
                      <XAxis type="number" stroke="#666" fontSize={11} allowDecimals={false} />
                      <YAxis type="category" dataKey="topic" stroke="#888" fontSize={10} width={100} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="solved" name="Solved" fill="#ff5e00" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

          </div>

        </div>
      </div>
    </>
  );
}
