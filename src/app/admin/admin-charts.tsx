"use client";

import { Card } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const PIE_COLORS = ["#00D4FF", "#C89B3C", "#00FF87", "#FF4655", "#64748B", "#8B5CF6", "#F59E0B", "#EC4899", "#06B6D4", "#84CC16"];

interface AdminChartsProps {
  dailyData: Array<{ date: string; volume: number }>;
  leagueData: Array<{ name: string; value: number }>;
}

function AdminCharts({ dailyData, leagueData }: AdminChartsProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Bar chart — daily volume */}
      <Card>
        <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4">
          Volume des paris (30 derniers jours)
        </h3>
        {dailyData.length > 0 ? (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis
                dataKey="date"
                tick={{ fill: "#64748B", fontSize: 11 }}
                axisLine={{ stroke: "rgba(255,255,255,0.06)" }}
              />
              <YAxis
                tick={{ fill: "#64748B", fontSize: 11 }}
                axisLine={{ stroke: "rgba(255,255,255,0.06)" }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#111827",
                  border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: "8px",
                  color: "#E2E8F0",
                  fontSize: "13px",
                }}
                formatter={(value) => [`${Number(value).toFixed(2)} €`, "Volume"]}
              />
              <Bar dataKey="volume" fill="#00D4FF" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[280px] flex items-center justify-center">
            <p className="text-sm text-[var(--text-muted)]">Aucune donnée</p>
          </div>
        )}
      </Card>

      {/* Pie chart — league distribution */}
      <Card>
        <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4">
          Répartition par ligue
        </h3>
        {leagueData.length > 0 ? (
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={leagueData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={90}
                label={(props: { name?: string; percent?: number }) =>
                  `${props.name ?? ""} ${((props.percent ?? 0) * 100).toFixed(0)}%`
                }
                labelLine={{ stroke: "#64748B" }}
              >
                {leagueData.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "#111827",
                  border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: "8px",
                  color: "#E2E8F0",
                  fontSize: "13px",
                }}
                formatter={(value) => [`${Number(value).toFixed(2)} €`, "Volume"]}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[280px] flex items-center justify-center">
            <p className="text-sm text-[var(--text-muted)]">Aucune donnée</p>
          </div>
        )}
      </Card>
    </div>
  );
}

export { AdminCharts };
