// src/components/StreakWidget.jsx
import { useMemo } from 'react';
import { useSheetStore } from '../store';
import { Flame, Trophy, CalendarX, CheckCircle2, Clock, Zap } from 'lucide-react';

/* ── Date Helpers ─────────────────────────────────── */
function toDateStr(d) {
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

/* ── Extract Solved Dates Map from Zustand ────────── */
function getSolvedDatesMap(data) {
  const map = {}; // 'YYYY-MM-DD' -> number of solved
  for (const topic of data) {
    for (const sub of topic.subTopics) {
      for (const q of sub.questions) {
        if (q.isSolved && q.solvedAt) {
          const dStr = toDateStr(new Date(q.solvedAt));
          map[dStr] = (map[dStr] || 0) + 1;
        }
      }
    }
  }
  return map;
}

/* ── Compute Complete Streak Analytics ────────────── */
function calculateStreakMetrics(solvedMap) {
  const today = new Date();
  const todayStr = toDateStr(today);

  const solvedDates = Object.keys(solvedMap).sort();

  if (solvedDates.length === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      missedDays30: 30,
      solvedToday: 0,
      isStreakActive: false,
      last7Days: Array.from({ length: 7 }, (_, i) => {
        const d = addDays(today, -(6 - i));
        return {
          dateStr: toDateStr(d),
          dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
          dayNum: d.getDate(),
          solved: 0,
          isToday: toDateStr(d) === todayStr,
        };
      }),
    };
  }

  // 1. Solved today count
  const solvedToday = solvedMap[todayStr] || 0;

  // 2. Current Streak Calculation
  let currentStreak = 0;
  let cursor = new Date();
  
  // Check if today has activity
  if (!solvedMap[todayStr]) {
    // If today has no activity yet, streak can still be alive if yesterday was solved
    cursor = addDays(today, -1);
  }

  while (true) {
    const dStr = toDateStr(cursor);
    if (solvedMap[dStr] > 0) {
      currentStreak++;
      cursor = addDays(cursor, -1);
    } else {
      break;
    }
  }

  // 3. Longest Streak Calculation
  let longestStreak = 0;
  let tempStreak = 0;
  let prevDate = null;

  for (const dStr of solvedDates) {
    if (!prevDate) {
      tempStreak = 1;
    } else {
      const diff = Math.round((new Date(dStr) - new Date(prevDate)) / 86400000);
      if (diff === 1) {
        tempStreak++;
      } else {
        tempStreak = 1;
      }
    }
    if (tempStreak > longestStreak) {
      longestStreak = tempStreak;
    }
    prevDate = dStr;
  }

  // Ensure longest is at least current
  if (currentStreak > longestStreak) {
    longestStreak = currentStreak;
  }

  // 4. Missed Days in Last 30 Days
  let missedDays30 = 0;
  for (let i = 0; i < 30; i++) {
    const dStr = toDateStr(addDays(today, -i));
    if (!solvedMap[dStr]) {
      missedDays30++;
    }
  }

  // 5. Last 7 Days Breakdown
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = addDays(today, -(6 - i));
    const dStr = toDateStr(d);
    return {
      dateStr: dStr,
      dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
      dayNum: d.getDate(),
      solved: solvedMap[dStr] || 0,
      isToday: dStr === todayStr,
    };
  });

  const isStreakActive = currentStreak > 0;

  return {
    currentStreak,
    longestStreak,
    missedDays30,
    solvedToday,
    isStreakActive,
    last7Days,
  };
}

export function StreakWidget() {
  const { data } = useSheetStore();

  const solvedMap = useMemo(() => getSolvedDatesMap(data), [data]);
  const metrics = useMemo(() => calculateStreakMetrics(solvedMap), [solvedMap]);

  return (
    <div className="streak-widget-card">
      {/* Background Glow */}
      <div className={`streak-glow ${metrics.isStreakActive ? 'active' : ''}`} />

      {/* Main Content Row */}
      <div className="streak-header-row">
        {/* Left: Fire Icon & Main Counter */}
        <div className="streak-fire-wrap">
          <div className={`fire-container ${metrics.isStreakActive ? 'ignited' : 'dull'}`}>
            <Flame className="fire-icon" size={32} />
            <div className="fire-particles">
              <span className="p1" />
              <span className="p2" />
              <span className="p3" />
            </div>
          </div>
          <div className="streak-count-block">
            <div className="streak-num">
              {metrics.currentStreak}
              <span className="streak-unit">Days</span>
            </div>
            <div className="streak-title">
              {metrics.isStreakActive ? 'Active Streak 🔥' : 'Streak Inactive ❄️'}
            </div>
          </div>
        </div>

        {/* Right Stats Pills */}
        <div className="streak-metrics-grid">
          {/* Longest Streak */}
          <div className="streak-metric-item">
            <div className="streak-metric-icon trophy">
              <Trophy size={14} />
            </div>
            <div className="streak-metric-content">
              <span className="streak-metric-val">{metrics.longestStreak} Days</span>
              <span className="streak-metric-lbl">Best Streak</span>
            </div>
          </div>

          {/* Missed Days */}
          <div className="streak-metric-item">
            <div className="streak-metric-icon missed">
              <CalendarX size={14} />
            </div>
            <div className="streak-metric-content">
              <span className="streak-metric-val">{metrics.missedDays30} Days</span>
              <span className="streak-metric-lbl">Missed (30d)</span>
            </div>
          </div>

          {/* Solved Today */}
          <div className="streak-metric-item">
            <div className={`streak-metric-icon ${metrics.solvedToday > 0 ? 'solved' : 'pending'}`}>
              {metrics.solvedToday > 0 ? <CheckCircle2 size={14} /> : <Clock size={14} />}
            </div>
            <div className="streak-metric-content">
              <span className="streak-metric-val">{metrics.solvedToday} Qs</span>
              <span className="streak-metric-lbl">Today's Status</span>
            </div>
          </div>
        </div>
      </div>

      {/* 7-Day Activity Strip */}
      <div className="streak-7day-strip">
        <div className="strip-title">
          <Zap size={12} style={{ color: '#ff5e00' }} />
          <span>Last 7 Days Status</span>
        </div>

        <div className="strip-days">
          {metrics.last7Days.map((d) => (
            <div
              key={d.dateStr}
              className={`strip-day-col ${d.isToday ? 'today' : ''} ${d.solved > 0 ? 'done' : 'miss'}`}
              title={`${d.dateStr}: ${d.solved} solved`}
            >
              <span className="strip-day-name">{d.dayName}</span>
              <div className="strip-day-badge">
                {d.solved > 0 ? (
                  <Flame size={12} className="strip-flame" />
                ) : (
                  <span className="strip-dot" />
                )}
              </div>
              <span className="strip-day-num">{d.solved > 0 ? `+${d.solved}` : '0'}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
