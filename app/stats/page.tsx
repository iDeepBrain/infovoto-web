"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar,
} from "recharts";

const ADMIN_EMAIL = "cristian2023ml@gmail.com";

interface UserStats {
  user_id: string;
  total_requests: number;
  total_logins: number;
  last_active: string | null;
  avg_request_duration_ms: number;
  requests_today: number;
  requests_last_7_days: number;
  // Token data (optional — populated if gateway returns it)
  total_tokens_input?: number;
  total_tokens_output?: number;
}

// Gemini 2.0 Flash pricing (USD per 1M tokens)
const GEMINI_PRICE_INPUT = 0.075;
const GEMINI_PRICE_OUTPUT = 0.30;

function calcGeminiCost(tokensIn: number, tokensOut: number): number {
  return (tokensIn * GEMINI_PRICE_INPUT + tokensOut * GEMINI_PRICE_OUTPUT) / 1_000_000;
}

const FIXED_COSTS = [
  { label: "voti.pe", amount: "$35/año", note: "Dominio" },
  { label: "voti.com.pe", amount: "$35/año", note: "Dominio" },
  { label: "infovoto.com", amount: "$15/año", note: "Dominio (comprado)" },
  { label: "Claude Code Max", amount: "$100/mes", note: "Dev tooling" },
  { label: "GCP", amount: "$300 créditos", note: "Free tier disponible" },
  { label: "Supabase", amount: "Gratis", note: "Free tier" },
];

interface DailyStats {
  date: string;
  count: number;
}

export default function StatsPage() {
  const { data: session, status } = useSession();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [dailyData, setDailyData] = useState<DailyStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isAdmin = (session as any)?.user?.email === ADMIN_EMAIL;

  useEffect(() => {
    if (status === "authenticated" && (session as any)?.id_token) {
      fetchAllData();
    }
    if (status === "unauthenticated") {
      setLoading(false);
    }
  }, [status, session]);

  async function fetchAllData() {
    const gatewayUrl = process.env.NEXT_PUBLIC_GATEWAY_URL || "http://localhost:2080";
    const headers = { Authorization: `Bearer ${(session as any)?.id_token}` };

    try {
      const [statsRes, dailyRes] = await Promise.allSettled([
        fetch(`${gatewayUrl}/analytics/stats`, { headers }),
        fetch(`${gatewayUrl}/analytics/daily-stats?days=30`, { headers }),
      ]);

      if (statsRes.status === "fulfilled" && statsRes.value.ok) {
        setStats(await statsRes.value.json());
      }
      if (dailyRes.status === "fulfilled" && dailyRes.value.ok) {
        const raw = await dailyRes.value.json();
        setDailyData(Array.isArray(raw) ? raw : raw.data || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error cargando datos");
    } finally {
      setLoading(false);
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-[#0a0f1a] flex items-center justify-center">
        <div className="text-gray-400">Cargando estadísticas...</div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen bg-[#0a0f1a] flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 mb-4">Inicia sesión para ver estadísticas</p>
          <Link href="/login" className="px-6 py-2 bg-amber-500 text-[#0a0f1a] rounded-lg font-bold">
            Iniciar sesión
          </Link>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#0a0f1a] flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 mb-4">Acceso restringido a administradores</p>
          <Link href="/chat" className="px-6 py-2 bg-[#1e293b] text-white rounded-lg border border-[#334155]">
            ← Volver al Chat
          </Link>
        </div>
      </div>
    );
  }

  const lastActive = stats?.last_active ? new Date(stats.last_active).toLocaleString("es-PE") : "—";

  return (
    <div className="min-h-screen bg-[#0a0f1a] relative">
      {/* Pixel art bg */}
      <div
        className="fixed inset-0 opacity-[0.08] pointer-events-none"
        style={{ backgroundImage: `url('${process.env.NEXT_PUBLIC_ASSETS_URL || ""}/bg-pixel-mountains.jpg')`, backgroundSize: "cover", imageRendering: "pixelated" }}
      />

      <div className="relative z-10 p-6 md:p-8 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Dashboard Admin</h1>
            <p className="text-gray-400 text-sm mt-1">Métricas de Voti</p>
          </div>
          <Link href="/chat" className="px-4 py-2 bg-[#1e293b] text-gray-300 rounded-lg border border-[#334155] text-sm hover:bg-[#334155] transition">
            ← Chat
          </Link>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-900/30 border border-red-800/50 rounded-lg text-red-300 text-sm">
            {error}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <StatCard label="Total consultas" value={stats?.total_requests ?? 0} color="text-white" />
          <StatCard label="Hoy" value={stats?.requests_today ?? 0} color="text-amber-400" />
          <StatCard label="Últimos 7 días" value={stats?.requests_last_7_days ?? 0} color="text-green-400" />
          <StatCard label="Ingresos" value={stats?.total_logins ?? 0} color="text-blue-400" />
          <StatCard label="Promedio (ms)" value={Math.round(stats?.avg_request_duration_ms ?? 0)} color="text-purple-400" />
          <StatCard label="Última actividad" value={lastActive} color="text-gray-300" small />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Line Chart: Requests per day */}
          <div className="bg-[#111827] border border-[#1e293b] rounded-xl p-5">
            <h3 className="text-white font-bold text-sm mb-4">Consultas por día (30 días)</h3>
            {dailyData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="date" tick={{ fill: "#64748b", fontSize: 10 }} tickFormatter={(v) => v.slice(5)} />
                  <YAxis tick={{ fill: "#64748b", fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: 8 }}
                    labelStyle={{ color: "#f8fafc" }}
                    itemStyle={{ color: "#f59e0b" }}
                  />
                  <Line type="monotone" dataKey="count" stroke="#f59e0b" strokeWidth={2} dot={{ fill: "#f59e0b", r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-gray-500 text-sm">
                Sin datos. Conecta el gateway para ver gráficas.
              </div>
            )}
          </div>

          {/* Bar Chart: same data as bar */}
          <div className="bg-[#111827] border border-[#1e293b] rounded-xl p-5">
            <h3 className="text-white font-bold text-sm mb-4">Distribución diaria</h3>
            {dailyData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="date" tick={{ fill: "#64748b", fontSize: 10 }} tickFormatter={(v) => v.slice(5)} />
                  <YAxis tick={{ fill: "#64748b", fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: 8 }}
                    labelStyle={{ color: "#f8fafc" }}
                    itemStyle={{ color: "#3b82f6" }}
                  />
                  <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-gray-500 text-sm">
                Sin datos aún.
              </div>
            )}
          </div>
        </div>

        {/* Cost Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Gemini API Cost */}
          <div className="bg-[#111827] border border-[#1e293b] rounded-xl p-5">
            <h3 className="text-white font-bold text-sm mb-4">💸 Costo Gemini estimado</h3>
            {stats?.total_tokens_input != null || stats?.total_tokens_output != null ? (
              <>
                <div className="text-3xl font-bold text-emerald-400 mb-4">
                  ${calcGeminiCost(stats?.total_tokens_input ?? 0, stats?.total_tokens_output ?? 0).toFixed(4)} USD
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-gray-400">
                    <span>Tokens input ({(stats?.total_tokens_input ?? 0).toLocaleString()})</span>
                    <span className="text-blue-400">
                      ${((stats?.total_tokens_input ?? 0) * GEMINI_PRICE_INPUT / 1_000_000).toFixed(4)}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>Tokens output ({(stats?.total_tokens_output ?? 0).toLocaleString()})</span>
                    <span className="text-orange-400">
                      ${((stats?.total_tokens_output ?? 0) * GEMINI_PRICE_OUTPUT / 1_000_000).toFixed(4)}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-[#1e293b] text-xs text-gray-500">
                    Gemini 2.0 Flash: $0.075/M input · $0.30/M output
                  </div>
                </div>
              </>
            ) : (
              <div className="text-gray-500 text-sm">
                <p>Sin datos de tokens aún.</p>
                <p className="mt-2 text-xs">El gateway necesita retornar <code className="text-amber-400">total_tokens_input</code> y <code className="text-amber-400">total_tokens_output</code> en <code className="text-amber-400">/analytics/stats</code>.</p>
              </div>
            )}
          </div>

          {/* Fixed Costs */}
          <div className="bg-[#111827] border border-[#1e293b] rounded-xl p-5">
            <h3 className="text-white font-bold text-sm mb-4">📋 Costos fijos del proyecto</h3>
            <div className="space-y-2">
              {FIXED_COSTS.map((item) => (
                <div key={item.label} className="flex items-center justify-between text-sm">
                  <div>
                    <span className="text-gray-300 font-medium">{item.label}</span>
                    <span className="text-gray-500 text-xs ml-2">{item.note}</span>
                  </div>
                  <span className="text-amber-400 font-mono text-xs">{item.amount}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-3 border-t border-[#1e293b] text-xs text-gray-500">
              Inversión objetivo: ~$100 en las 2 semanas pre-elecciones (abril 2026)
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="bg-[#111827] border border-[#1e293b] rounded-xl p-5">
          <h3 className="text-white font-bold text-sm mb-3">Notas</h3>
          <ul className="text-gray-400 text-sm space-y-1">
            <li>• Los datos provienen del endpoint <code className="text-amber-400">/analytics/stats</code> del gateway</li>
            <li>• Emails hasheados con SHA-256 (no se almacenan en claro)</li>
            <li>• Dashboard visible solo para: <code className="text-amber-400">{ADMIN_EMAIL}</code></li>
            <li>• Para stats globales (todos los usuarios), se requiere endpoint admin en el gateway</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, color, small }: { label: string; value: string | number; color: string; small?: boolean }) {
  return (
    <div className="bg-[#111827] border border-[#1e293b] rounded-xl p-4">
      <div className="text-gray-400 text-xs mb-1">{label}</div>
      <div className={`${small ? "text-xs font-mono" : "text-2xl font-bold"} ${color}`}>{value}</div>
    </div>
  );
}
