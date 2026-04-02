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

interface BetData {
  amount: number;
  status: string;
  created_at: string;
}

interface AdminChartsProps {
  bets: BetData[];
}

function AdminCharts({ bets }: AdminChartsProps) {
  // Group bets by day
  const dailyVolume = bets.reduce<Record<string, number>>((acc, bet) => {
    const day = new Date(bet.created_at).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
    });
    acc[day] = (acc[day] ?? 0) + bet.amount;
    return acc;
  }, {});

  const barData = Object.entries(dailyVolume)
    .map(([date, volume]) => ({ date, volume }))
    .reverse()
    .slice(0, 14);

  // Bet status distribution
  const statusCounts = bets.reduce<Record<string, number>>((acc, bet) => {
    acc[bet.status] = (acc[bet.status] ?? 0) + 1;
    return acc;
  }, {});

  const pieData = Object.entries(statusCounts).map(([name, value]) => ({
    name: { pending: "En attente", won: "Gagné", lost: "Perdu", cancelled: "Annulé", refunded: "Remboursé" }[name] ?? name,
    value,
  }));

  const PIE_COLORS = ["#00D4FF", "#00FF87", "#FF4655", "#64748B", "#C89B3C"];

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <h3 className="text-sm font-semibold text-[#E2E8F0] mb-4">Volume quotidien (€)</h3>
        {barData.length > 0 ? (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="date" tick={{ fill: "#64748B", fontSize: 11 }} />
              <YAxis tick={{ fill: "#64748B", fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#111827",
                  border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: "8px",
                  color: "#E2E8F0",
                }}
              />
              <Bar dataKey="volume" fill="#00D4FF" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-center text-[#64748B] py-8">Pas de données</p>
        )}
      </Card>

      <Card>
        <h3 className="text-sm font-semibold text-[#E2E8F0] mb-4">Répartition des paris</h3>
        {pieData.length > 0 ? (
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={(props: { name?: string; percent?: number }) =>
                  `${props.name ?? ""} ${((props.percent ?? 0) * 100).toFixed(0)}%`
                }
              >
                {pieData.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "#111827",
                  border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: "8px",
                  color: "#E2E8F0",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-center text-[#64748B] py-8">Pas de données</p>
        )}
      </Card>
    </div>
  );
}

export { AdminCharts };
