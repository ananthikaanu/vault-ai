import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useAppSelector } from "../hooks/redux";
import { CATEGORY_CONFIG } from "../utils/constants";
import type { ThoughtCategory } from "../types";

const CHART_COLORS = ["#7c6af7", "#f59e0b", "#10b981", "#ec4899", "#56cfb2", "#06b6d4", "#8b5cf6"];

function generateDailyData(items: { createdAt: string }[]) {
  const days: Record<string, number> = {};
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    days[key] = 0;
  }
  items.forEach((item) => {
    const key = new Date(item.createdAt).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
    if (key in days) days[key]++;
  });
  return Object.entries(days)
    .filter((_, i) => i % 5 === 0 || i === Object.keys(days).length - 1)
    .map(([date, count]) => ({ date, count }));
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="chart-tooltip">
        <p className="chart-tooltip__label">{label}</p>
        <p className="chart-tooltip__value">{payload[0].value} thoughts</p>
      </div>
    );
  }
  return null;
};

export function InsightsSection() {
  const { items, stats } = useAppSelector((s) => s.thoughts);

  const chartData = generateDailyData(items);

  const categoryData = Object.entries(stats?.categories || {}).map(
    ([cat, count]) => ({
      name: CATEGORY_CONFIG[cat as ThoughtCategory]?.label || cat,
      value: count,
      color: CATEGORY_CONFIG[cat as ThoughtCategory]?.color || "#888",
    })
  );

  const total = categoryData.reduce((s, d) => s + d.value, 0);

  return (
    <div className="insights-section">
      <div className="section-header">
        <h3>Your Insights</h3>
        <span className="section-badge">This Month</span>
      </div>

      <div className="insights-grid">
        {/* Line chart */}
        <div className="insight-card">
          <p className="insight-card__label">Thoughts Over Time</p>
          <ResponsiveContainer width="100%" height={115}>
            <AreaChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7c6af7" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#7c6af7" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: "#6b7494" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "#6b7494" }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="count"
                stroke="#7c6af7"
                fill="url(#areaGrad)"
                strokeWidth={2}
                dot={{ r: 3, fill: "#7c6af7", strokeWidth: 0 }}
                activeDot={{ r: 5, fill: "#7c6af7" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Donut chart */}
        <div className="insight-card">
          <p className="insight-card__label">Thought Categories</p>
          {categoryData.length === 0 ? (
            <div className="insight-empty">No data yet</div>
          ) : (
            <div className="donut-wrap">
              <ResponsiveContainer width="50%" height={115}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={34}
                    outerRadius={50}
                    dataKey="value"
                    startAngle={90}
                    endAngle={-270}
                    paddingAngle={2}
                  >
                    {categoryData.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(v, n) => [`${Math.round(((v as number) / total) * 100)}%`, n as string]}
                    contentStyle={{
                      background: "#1c2430",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="donut-legend">
                {categoryData.slice(0, 4).map((d, i) => (
                  <div key={d.name} className="donut-legend__item">
                    <span
                      className="donut-legend__dot"
                      style={{ background: CHART_COLORS[i % CHART_COLORS.length] }}
                    />
                    <span className="donut-legend__name">{d.name}</span>
                    <span className="donut-legend__pct">
                      {Math.round((d.value / total) * 100)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
