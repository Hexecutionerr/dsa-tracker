// src/components/ContributionHeatmap.jsx
import { useMemo, useState, useRef } from 'react';
import { useSheetStore } from '../store';
import { Activity, TrendingUp, Zap, Calendar } from 'lucide-react';

/* ── Helpers ─────────────────────────────────── */
function toDateStr(d) {
  // Returns 'YYYY-MM-DD' in local time (not UTC)
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                     'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const RANGE_OPTIONS = [
  { label: '3M', weeks: 13 },
  { label: '6M', weeks: 26 },
  { label: '1Y', weeks: 52 },
];

/* ── Build daily solved map from Zustand data ── */
function buildDailyMap(data) {
  const map = {}; // 'YYYY-MM-DD' → count
  for (const topic of data) {
    for (const sub of topic.subTopics) {
      for (const q of sub.questions) {
        if (q.isSolved && q.solvedAt) {
          // Convert ISO to local date string
          const localDate = toDateStr(new Date(q.solvedAt));
          map[localDate] = (map[localDate] || 0) + 1;
        }
      }
    }
  }
  return map;
}

/* ── Build a grid of week columns ── */
function buildWeeks(numWeeks) {
  const today = new Date();
  today.setHours(23, 59, 59, 0);

  // Start from Sunday of the week that is `numWeeks` ago
  const startDate = addDays(today, -(numWeeks * 7 - 1));
  // Snap to the Sunday of that week
  const startDay = startDate.getDay(); // 0=Sun
  const gridStart = addDays(startDate, -startDay);

  const weeks = [];
  let cursor = new Date(gridStart);

  while (cursor <= today) {
    const week = [];
    for (let d = 0; d < 7; d++) {
      const dayDate = new Date(cursor);
      week.push({
        date: toDateStr(dayDate),
        jsDate: new Date(dayDate),
        future: dayDate > today,
      });
      cursor = addDays(cursor, 1);
    }
    weeks.push(week);
  }
  return weeks;
}

/* ── Color level based on count ─────────────── */
function getLevel(count) {
  if (!count || count === 0) return 0;
  if (count === 1)           return 1;
  if (count <= 3)            return 2;
  if (count <= 6)            return 3;
  return 4;
}

const LEVEL_COLORS = [
  'rgba(255,255,255,0.04)',  // 0 - empty
  'rgba(255,94,0,0.25)',     // 1 - light
  'rgba(255,94,0,0.50)',     // 2 - medium
  'rgba(255,94,0,0.80)',     // 3 - strong
  '#ff5e00',                  // 4 - full
];

/* ── Compute stats ────────────────────────────── */
function computeStats(dailyMap) {
  const entries = Object.entries(dailyMap).sort(([a], [b]) => a.localeCompare(b));
  if (entries.length === 0) return { totalYear: 0, streak: 0, bestStreak: 0, bestDay: null, activeDays: 0 };

  const thisYear = new Date().getFullYear();
  let totalYear = 0;
  let activeDays = 0;

  entries.forEach(([date, count]) => {
    if (new Date(date).getFullYear() === thisYear) totalYear += count;
    activeDays++;
  });

  // Current streak
  let streak = 0;
  const today = toDateStr(new Date());
  let check = new Date();
  while (true) {
    const ds = toDateStr(check);
    if (dailyMap[ds]) {
      streak++;
      check = addDays(check, -1);
    } else if (ds === today) {
      // Today not solved yet — look at yesterday
      check = addDays(check, -1);
      const ys = toDateStr(check);
      if (dailyMap[ys]) { streak++; check = addDays(check, -1); }
      else break;
    } else {
      break;
    }
  }

  // Best streak
  let bestStreak = 0;
  let cur = 0;
  let prevDate = null;
  for (const [date] of entries) {
    if (!prevDate) { cur = 1; }
    else {
      const diff = (new Date(date) - new Date(prevDate)) / 86400000;
      if (diff === 1) cur++;
      else cur = 1;
    }
    bestStreak = Math.max(bestStreak, cur);
    prevDate = date;
  }

  // Best day
  const bestEntry = entries.reduce((a, b) => (b[1] > a[1] ? b : a), entries[0]);
  const bestDay = bestEntry ? { date: bestEntry[0], count: bestEntry[1] } : null;

  return { totalYear, streak, bestStreak, bestDay, activeDays };
}

/* ── Tooltip ───────────────────────────────── */
function Tooltip({ visible, x, y, date, count }) {
  if (!visible) return null;
  const label = count
    ? `${count} question${count > 1 ? 's' : ''} solved`
    : 'No questions solved';
  const d = new Date(date + 'T12:00:00'); // noon local avoids TZ issues
  const formatted = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  return (
    <div
      className="hm-tooltip"
      style={{ left: x, top: y }}
    >
      <strong>{label}</strong>
      <span>{formatted}</span>
    </div>
  );
}

/* ── Month label bar ─────────────────────────── */
function MonthLabels({ weeks }) {
  const labels = [];
  let lastMonth = null;
  weeks.forEach((week, wi) => {
    const month = week[0].jsDate.getMonth();
    if (month !== lastMonth) {
      labels.push({ wi, label: MONTH_NAMES[month] });
      lastMonth = month;
    }
  });
  return (
    <div className="hm-month-labels" style={{ gridTemplateColumns: `repeat(${weeks.length}, 14px)` }}>
      {labels.map(({ wi, label }) => (
        <span key={wi} style={{ gridColumn: wi + 1 }} className="hm-month-label">
          {label}
        </span>
      ))}
    </div>
  );
}

/* ── Main Component ──────────────────────────── */
export function ContributionHeatmap() {
  const { data } = useSheetStore();
  const [rangeIdx, setRangeIdx] = useState(2); // default 1Y
  const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, date: '', count: 0 });
  const containerRef = useRef(null);

  const numWeeks = RANGE_OPTIONS[rangeIdx].weeks;

  const dailyMap = useMemo(() => buildDailyMap(data), [data]);
  const weeks    = useMemo(() => buildWeeks(numWeeks), [numWeeks]);
  const stats    = useMemo(() => computeStats(dailyMap), [dailyMap]);

  // Weekly totals for the bottom bar
  const weeklyTotals = useMemo(() =>
    weeks.map(week => week.reduce((sum, day) => sum + (dailyMap[day.date] || 0), 0)),
    [weeks, dailyMap]
  );

  // Monthly totals for summary
  const monthlyMap = useMemo(() => {
    const m = {};
    for (const [date, count] of Object.entries(dailyMap)) {
      const key = date.slice(0, 7); // 'YYYY-MM'
      m[key] = (m[key] || 0) + count;
    }
    return m;
  }, [dailyMap]);

  const showTooltip = (e, day) => {
    const rect = containerRef.current?.getBoundingClientRect() ?? { left: 0, top: 0 };
    const cellRect = e.currentTarget.getBoundingClientRect();
    setTooltip({
      visible: true,
      x: cellRect.left - rect.left + 7,
      y: cellRect.top - rect.top - 46,
      date: day.date,
      count: dailyMap[day.date] || 0,
    });
  };

  const hideTooltip = () => setTooltip(t => ({ ...t, visible: false }));

  const today = toDateStr(new Date());

  return (
    <div className="hm-card">
      {/* Header */}
      <div className="hm-header">
        <div className="hm-header-left">
          <Activity size={16} style={{ color: '#ff5e00' }} />
          <span className="hm-title">Contribution Activity</span>
          <span className="hm-year-tag">{new Date().getFullYear()}</span>
        </div>
        <div className="hm-range-pills">
          {RANGE_OPTIONS.map((opt, i) => (
            <button
              key={opt.label}
              className={`hm-range-pill ${rangeIdx === i ? 'hm-range-active' : ''}`}
              onClick={() => setRangeIdx(i)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats row */}
      <div className="hm-stats-row">
        <div className="hm-stat">
          <TrendingUp size={13} style={{ color: '#ff5e00' }} />
          <span className="hm-stat-val">{stats.totalYear}</span>
          <span className="hm-stat-lbl">This Year</span>
        </div>
        <div className="hm-stat">
          <Zap size={13} style={{ color: '#fdcb6e' }} />
          <span className="hm-stat-val">{stats.streak}</span>
          <span className="hm-stat-lbl">Day Streak</span>
        </div>
        <div className="hm-stat">
          <Activity size={13} style={{ color: '#a78bfa' }} />
          <span className="hm-stat-val">{stats.bestStreak}</span>
          <span className="hm-stat-lbl">Best Streak</span>
        </div>
        <div className="hm-stat">
          <Calendar size={13} style={{ color: '#00b894' }} />
          <span className="hm-stat-val">{stats.activeDays}</span>
          <span className="hm-stat-lbl">Active Days</span>
        </div>
        {stats.bestDay && (
          <div className="hm-stat">
            <span className="hm-stat-val" style={{ color: '#ff5e00' }}>{stats.bestDay.count}</span>
            <span className="hm-stat-lbl">Best Day</span>
          </div>
        )}
      </div>

      {/* Heatmap grid */}
      <div className="hm-scroll-wrap">
        <div className="hm-grid-wrap" ref={containerRef}>
          <Tooltip {...tooltip} />

          {/* Month labels */}
          <MonthLabels weeks={weeks} />

          {/* Day labels + grid */}
          <div className="hm-body">
            {/* Day of week labels */}
            <div className="hm-day-labels">
              {DAY_LABELS.map((d, i) => (
                <span key={d} className="hm-day-label" style={{ opacity: i % 2 === 0 ? 1 : 0 }}>
                  {d[0]}
                </span>
              ))}
            </div>

            {/* Columns (weeks) */}
            <div
              className="hm-columns"
              style={{ gridTemplateColumns: `repeat(${weeks.length}, 14px)` }}
            >
              {weeks.map((week, wi) => (
                <div key={wi} className="hm-week-col">
                  {week.map((day) => {
                    const count = dailyMap[day.date] || 0;
                    const level = day.future ? -1 : getLevel(count);
                    const isToday = day.date === today;
                    return (
                      <div
                        key={day.date}
                        className={`hm-cell ${isToday ? 'hm-cell-today' : ''} ${day.future ? 'hm-cell-future' : ''}`}
                        style={{
                          backgroundColor: day.future ? 'transparent' : LEVEL_COLORS[level] ?? LEVEL_COLORS[0],
                          outline: isToday ? '1px solid rgba(255,94,0,0.6)' : 'none',
                        }}
                        onMouseEnter={(e) => !day.future && showTooltip(e, day)}
                        onMouseLeave={hideTooltip}
                        title={`${day.date}: ${count} solved`}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="hm-legend">
            <span className="hm-legend-label">Less</span>
            {LEVEL_COLORS.map((c, i) => (
              <div key={i} className="hm-legend-cell" style={{ backgroundColor: c }} />
            ))}
            <span className="hm-legend-label">More</span>
          </div>
        </div>
      </div>

      {/* Weekly summary bar chart */}
      <div className="hm-weekly-bar">
        <div className="hm-weekly-title">Weekly activity</div>
        <div className="hm-weekly-bars">
          {weeklyTotals.slice(-13).map((total, i) => {
            const maxVal = Math.max(...weeklyTotals, 1);
            const h = Math.max(2, Math.round((total / maxVal) * 48));
            return (
              <div
                key={i}
                className="hm-wbar"
                title={`${total} this week`}
              >
                <div
                  className="hm-wbar-fill"
                  style={{ height: `${h}px`, opacity: total ? 1 : 0.2 }}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Monthly summary */}
      {Object.keys(monthlyMap).length > 0 && (
        <div className="hm-monthly-row">
          {Object.entries(monthlyMap)
            .sort(([a], [b]) => a.localeCompare(b))
            .slice(-6)
            .map(([key, count]) => {
              const [, mo] = key.split('-');
              return (
                <div key={key} className="hm-month-chip">
                  <span className="hm-month-name">{MONTH_NAMES[parseInt(mo, 10) - 1]}</span>
                  <span className="hm-month-count">{count}</span>
                </div>
              );
            })
          }
        </div>
      )}
    </div>
  );
}
