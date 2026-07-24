// src/components/AnalyticsDashboard.jsx
import { useEffect, useRef, useState } from 'react';
import {
  CheckCircle2,
  Circle,
  ListTodo,
  Trophy,
  Flame,
  TrendingUp,
  Zap,
  Target,
} from 'lucide-react';

/* ─── Animated Counter Hook ─────────────────────────────────── */
function useAnimatedCounter(target, duration = 900) {
  const [count, setCount] = useState(target);
  const prevTarget = useRef(target);

  useEffect(() => {
    if (prevTarget.current === target) return;
    const start = prevTarget.current;
    prevTarget.current = target;

    const startTime = performance.now();

    const step = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(start + (target - start) * eased));
      if (progress < 1) requestAnimationFrame(step);
    };

    requestAnimationFrame(step);
  }, [target, duration]);

  return count;
}

/* ─── Single Stat Card ───────────────────────────────────────── */
function StatCard({
  label,
  value,
  total,
  color,
  icon,
  showBar = false,
  suffix = '',
}) {
  const Icon = icon;
  const animated = useAnimatedCounter(value);
  const percent = total > 0 ? Math.round((value / total) * 100) : 0;

  return (
    <div className="analytics-card">
      {/* top shimmer accent line */}
      <div className="analytics-card-accent" style={{ background: color }} />

      <div className="analytics-card-header">
        <span className="analytics-label">{label}</span>
        <span className="analytics-icon-wrap" style={{ color, boxShadow: `0 0 12px ${color}30` }}>
          <Icon size={16} />
        </span>
      </div>

      <div className="analytics-value" style={{ color }}>
        {animated}{suffix}
        {total !== undefined && total !== value && (
          <span className="analytics-of-total"> / {total}</span>
        )}
      </div>

      {showBar && (
        <div className="analytics-bar-track">
          <div
            className="analytics-bar-fill"
            style={{
              width: `${percent}%`,
              background: `linear-gradient(90deg, ${color}aa, ${color})`,
            }}
          />
        </div>
      )}

      {showBar && (
        <span className="analytics-pct">{percent}% done</span>
      )}
    </div>
  );
}

/* ─── Main Dashboard ─────────────────────────────────────────── */
export function AnalyticsDashboard({ stats }) {
  const completionAnimated = useAnimatedCounter(stats.percent);

  const cards = [
    {
      label: 'Total Questions',
      value: stats.total,
      color: '#a78bfa',
      icon: ListTodo,
    },
    {
      label: 'Solved',
      value: stats.solved,
      total: stats.total,
      color: '#ff5e00',
      icon: CheckCircle2,
      showBar: true,
    },
    {
      label: 'Remaining',
      value: stats.total - stats.solved,
      total: stats.total,
      color: '#94a3b8',
      icon: Circle,
      accentClass: true,
    },
    {
      label: 'Easy Solved',
      value: stats.easySolved,
      total: stats.easy,
      color: '#00b894',
      icon: Zap,
      accentClass: true,
    },
    {
      label: 'Medium Solved',
      value: stats.mediumSolved,
      total: stats.medium,
      color: '#fdcb6e',
      icon: Flame,
      accentClass: true,
    },
    {
      label: 'Hard Solved',
      value: stats.hardSolved,
      total: stats.hard,
      color: '#ff7675',
      icon: Trophy,
      accentClass: true,
    },
  ];

  return (
    <div className="analytics-dashboard">
      {/* Completion Hero */}
      <div className="analytics-hero">
        <div className="analytics-hero-inner">
          <div className="analytics-ring-wrap">
            <svg viewBox="0 0 80 80" className="analytics-ring-svg">
              {/* track */}
              <circle
                cx="40" cy="40" r="32"
                fill="none"
                stroke="rgba(255,94,0,0.12)"
                strokeWidth="7"
              />
              {/* fill */}
              <circle
                cx="40" cy="40" r="32"
                fill="none"
                stroke="#ff5e00"
                strokeWidth="7"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 32}`}
                strokeDashoffset={`${2 * Math.PI * 32 * (1 - stats.percent / 100)}`}
                transform="rotate(-90 40 40)"
                style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.4,0,0.2,1)' }}
              />
            </svg>
            <div className="analytics-ring-label">
              <span className="analytics-ring-pct">{completionAnimated}%</span>
              <span className="analytics-ring-sub">Done</span>
            </div>
          </div>

          <div className="analytics-hero-text">
            <div className="analytics-hero-title">
              <TrendingUp size={15} style={{ color: '#ff5e00' }} />
              Overall Progress
            </div>
            <div className="analytics-hero-nums">
              <span style={{ color: '#ff5e00', fontWeight: 700 }}>{stats.solved}</span>
              <span style={{ color: '#555' }}> / </span>
              <span style={{ color: '#ccc' }}>{stats.total}</span>
              <span style={{ color: '#555', fontSize: '0.75rem' }}> questions</span>
            </div>
            <div className="analytics-hero-breakdown">
              <span style={{ color: '#00b894' }}>
                <Zap size={11} /> {stats.easySolved}/{stats.easy} Easy
              </span>
              <span style={{ color: '#fdcb6e' }}>
                <Flame size={11} /> {stats.mediumSolved}/{stats.medium} Med
              </span>
              <span style={{ color: '#ff7675' }}>
                <Trophy size={11} /> {stats.hardSolved}/{stats.hard} Hard
              </span>
            </div>
            {stats.solved > 0 && (
              <div className="analytics-hero-streak">
                <Target size={11} />
                {stats.total - stats.solved} questions to go — keep pushing!
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stat Cards Grid */}
      <div className="analytics-grid">
        {cards.map((c) => (
          <StatCard key={c.label} {...c} />
        ))}
      </div>
    </div>
  );
}
