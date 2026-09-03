import React from "react";
import { Priority } from "../../types";
import { Star, Inbox } from "lucide-react";

/**
 * 1. Empty Chart State
 */
export const EmptyChartState: React.FC<{ message?: string; height?: string }> = ({
  message = "No data available for the selected filters",
  height = "h-48",
}) => (
  <div className={`flex flex-col items-center justify-center ${height} text-center p-6 space-y-2`}>
    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
      <Inbox className="w-5 h-5" />
    </div>
    <p className="text-xs font-semibold text-slate-600">{message}</p>
    <p className="text-[11px] text-slate-400">Try broadening your date range or removing filters.</p>
  </div>
);

/**
 * 2. Monthly Trend Chart (Responsive SVG Dual-Line)
 */
export interface MonthlyTrendItem {
  month: string;
  submitted: number;
  resolved: number;
}

export const MonthlyTrendChart: React.FC<{ data: MonthlyTrendItem[] }> = ({ data }) => {
  if (!data || data.length === 0 || data.every((d) => d.submitted === 0 && d.resolved === 0)) {
    return <EmptyChartState message="No monthly intake activity recorded in this window" />;
  }

  const maxVal = Math.max(...data.map((d) => Math.max(d.submitted, d.resolved)), 5);
  const chartHeight = 160;
  const chartWidth = 500;
  const paddingX = 40;
  const paddingY = 20;

  const pointsSubmitted = data.map((d, idx) => {
    const x = paddingX + (idx / (data.length - 1 || 1)) * (chartWidth - paddingX * 2);
    const y = chartHeight - paddingY - (d.submitted / maxVal) * (chartHeight - paddingY * 2);
    return { x, y, val: d.submitted, label: d.month };
  });

  const pointsResolved = data.map((d, idx) => {
    const x = paddingX + (idx / (data.length - 1 || 1)) * (chartWidth - paddingX * 2);
    const y = chartHeight - paddingY - (d.resolved / maxVal) * (chartHeight - paddingY * 2);
    return { x, y, val: d.resolved, label: d.month };
  });

  const pathSubmitted = pointsSubmitted.reduce(
    (acc, p, i) => `${acc} ${i === 0 ? "M" : "L"} ${p.x},${p.y}`,
    ""
  );

  const pathResolved = pointsResolved.reduce(
    (acc, p, i) => `${acc} ${i === 0 ? "M" : "L"} ${p.x},${p.y}`,
    ""
  );

  return (
    <div className="space-y-4 w-full">
      {/* Legend */}
      <div className="flex items-center justify-end gap-5 text-xs font-semibold">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-blue-600" />
          <span className="text-slate-700">Submitted Complaints</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-emerald-500" />
          <span className="text-slate-700">Resolved & Closed</span>
        </div>
      </div>

      {/* SVG Chart */}
      <div className="w-full overflow-x-auto">
        <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-48 overflow-visible">
          {/* Grid lines */}
          {[0, 0.5, 1].map((ratio, i) => {
            const y = chartHeight - paddingY - ratio * (chartHeight - paddingY * 2);
            return (
              <g key={i}>
                <line
                  x1={paddingX}
                  y1={y}
                  x2={chartWidth - paddingX}
                  y2={y}
                  stroke="#E2E8F0"
                  strokeDasharray="4 4"
                />
                <text
                  x={paddingX - 8}
                  y={y + 3}
                  textAnchor="end"
                  className="text-[9px] fill-slate-400 font-mono"
                >
                  {Math.round(ratio * maxVal)}
                </text>
              </g>
            );
          })}

          {/* Lines */}
          <path d={pathSubmitted} fill="none" stroke="#2563EB" strokeWidth="2.5" strokeLinecap="round" />
          <path d={pathResolved} fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" />

          {/* Data Points */}
          {pointsSubmitted.map((p, i) => (
            <g key={`sub-${i}`}>
              <circle cx={p.x} cy={p.y} r="4" fill="#2563EB" className="transition hover:r-6" />
              <text x={p.x} y={chartHeight - 4} textAnchor="middle" className="text-[10px] fill-slate-500 font-medium">
                {p.label}
              </text>
            </g>
          ))}

          {pointsResolved.map((p, i) => (
            <circle key={`res-${i}`} cx={p.x} cy={p.y} r="4" fill="#10B981" className="transition hover:r-6" />
          ))}
        </svg>
      </div>
    </div>
  );
};

/**
 * 3. Priority Distribution Breakdown
 */
export const PriorityDistributionChart: React.FC<{
  data: Array<{ priority: Priority; count: number; percentage: number }>;
}> = ({ data }) => {
  const getPriorityColor = (p: Priority) => {
    switch (p) {
      case "CRITICAL":
        return { bg: "bg-rose-500", text: "text-rose-700", border: "border-rose-200" };
      case "HIGH":
        return { bg: "bg-amber-500", text: "text-amber-700", border: "border-amber-200" };
      case "MEDIUM":
        return { bg: "bg-blue-500", text: "text-blue-700", border: "border-blue-200" };
      case "LOW":
        return { bg: "bg-slate-400", text: "text-slate-700", border: "border-slate-200" };
      default:
        return { bg: "bg-purple-400", text: "text-purple-700", border: "border-purple-200" };
    }
  };

  const total = data.reduce((acc, d) => acc + d.count, 0);
  if (total === 0) return <EmptyChartState message="No priority data in current selection" />;

  return (
    <div className="space-y-4">
      {/* Stacked Percentage Bar */}
      <div className="h-3 w-full bg-slate-100 rounded-full flex overflow-hidden">
        {data.map((item) => {
          const color = getPriorityColor(item.priority);
          return (
            <div
              key={item.priority}
              style={{ width: `${item.percentage}%` }}
              className={`${color.bg} transition-all duration-500`}
              title={`${item.priority}: ${item.count} (${item.percentage}%)`}
            />
          );
        })}
      </div>

      {/* Priority Legend Cards */}
      <div className="grid grid-cols-2 gap-2">
        {data.map((item) => {
          const color = getPriorityColor(item.priority);
          return (
            <div
              key={item.priority}
              className={`p-3 rounded-xl border ${color.border} bg-white flex items-center justify-between shadow-xs`}
            >
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${color.bg}`} />
                <span className="text-xs font-bold text-slate-800">{item.priority}</span>
              </div>
              <div className="text-right">
                <span className="font-mono font-bold text-xs text-slate-900">{item.count}</span>
                <span className="text-[10px] text-slate-400 block">({item.percentage}%)</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/**
 * 4. Citizen Satisfaction & Star Ratings Gauge
 */
export const CitizenSatisfactionWidget: React.FC<{
  averageRating: number;
  totalRatings: number;
  ratingBreakdown: Record<number, number>;
  satisfiedPercentage: number;
}> = ({ averageRating, totalRatings, ratingBreakdown, satisfiedPercentage }) => {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between bg-purple-50/60 p-4 rounded-2xl border border-purple-100">
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-purple-950 font-mono">{averageRating.toFixed(1)}</span>
            <span className="text-xs text-slate-500 font-medium">/ 5.0</span>
          </div>
          <div className="flex items-center gap-1 text-amber-400 mt-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                className={`w-4 h-4 ${
                  s <= Math.round(averageRating) ? "fill-amber-400 text-amber-400" : "text-slate-200"
                }`}
              />
            ))}
          </div>
        </div>

        <div className="text-right">
          <p className="text-xs font-bold text-emerald-800 font-mono">{satisfiedPercentage}%</p>
          <p className="text-[10px] text-slate-500">Citizen Satisfaction Score</p>
          <p className="text-[10px] text-slate-400 font-mono mt-0.5">{totalRatings} total ratings</p>
        </div>
      </div>

      {/* 5-Star Breakdown Bars */}
      <div className="space-y-2">
        {[5, 4, 3, 2, 1].map((stars) => {
          const count = ratingBreakdown[stars] || 0;
          const percent = totalRatings > 0 ? Math.round((count / totalRatings) * 100) : stars >= 4 ? 45 : 5;

          return (
            <div key={stars} className="flex items-center gap-3 text-xs">
              <span className="w-8 font-bold text-slate-600 font-mono flex items-center gap-0.5">
                {stars} <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              </span>
              <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-400 rounded-full transition-all duration-500"
                  style={{ width: `${percent}%` }}
                />
              </div>
              <span className="w-10 text-right font-mono text-[11px] text-slate-500">{count}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
