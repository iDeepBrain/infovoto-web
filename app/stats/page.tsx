"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar,
} from "recharts";

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL || "";

type Lang = "es" | "en";

const t: Record<Lang, Record<string, string>> = {
  es: {
    title: "Dashboard Admin",
    subtitle: "Métricas de Voti",
    chat: "← Chat",
    loading: "Cargando estadísticas...",
    loginPrompt: "Inicia sesión para ver estadísticas",
    loginBtn: "Iniciar sesión",
    restricted: "Acceso restringido a administradores",
    back: "← Volver al Chat",
    uniqueUsers: "Usuarios únicos",
    totalQueries: "Consultas totales",
    queriesPerUser: "Consultas/usuario",
    avgLatency: "Latencia promedio",
    queriesPerDay: "Consultas por día",
    usersPerDay: "Usuarios únicos por día",
    last30: "Últimos 30 días",
    geminiCost: "Costo Gemini estimado",
    noTokens: "Sin datos de tokens aún.",
    tokensInput: "Tokens input",
    tokensOutput: "Tokens output",
    costPerQuery: "Costo por consulta",
    fixedCosts: "Costos fijos del proyecto",
    investmentGoal: "Inversión objetivo: ~$100 en las 2 semanas pre-elecciones (abril 2026)",
    byCountry: "Consultas por país",
    byCity: "Consultas por ciudad",
    noGeoData: "Aún no hay datos de geolocalización.",
    queries: "consultas",
  },
  en: {
    title: "Admin Dashboard",
    subtitle: "Voti Metrics",
    chat: "← Chat",
    loading: "Loading stats...",
    loginPrompt: "Sign in to view statistics",
    loginBtn: "Sign in",
    restricted: "Restricted to administrators",
    back: "← Back to Chat",
    uniqueUsers: "Unique users",
    totalQueries: "Total queries",
    queriesPerUser: "Queries/user",
    avgLatency: "Avg latency",
    queriesPerDay: "Queries per day",
    usersPerDay: "Unique users per day",
    last30: "Last 30 days",
    geminiCost: "Estimated Gemini cost",
    noTokens: "No token data yet.",
    tokensInput: "Input tokens",
    tokensOutput: "Output tokens",
    costPerQuery: "Cost per query",
    fixedCosts: "Project fixed costs",
    investmentGoal: "Target spend: ~$100 in the 2 weeks before elections (April 2026)",
    byCountry: "Queries by country",
    byCity: "Queries by city",
    noGeoData: "No geolocation data yet.",
    queries: "queries",
  },
};

interface UserStats {
  user_id: string;
  total_requests: number;
  total_logins: number;
  last_active: string | null;
  avg_request_duration_ms: number;
  requests_today: number;
  requests_last_7_days: number;
  // Platform-wide stats (admin only)
  total_unique_users?: number;
  total_platform_requests?: number;
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

const FIXED_COSTS: Record<Lang, { label: string; amount: string; note: string }[]> = {
  es: [
    { label: "voti.pe", amount: "$35/año", note: "Dominio" },
    { label: "voti.com.pe", amount: "$35/año", note: "Dominio" },
    { label: "infovoto.com", amount: "$15/año", note: "Dominio (comprado)" },
    { label: "Claude Code Max", amount: "$100/mes", note: "Dev tooling" },
    { label: "GCP", amount: "$300 créditos", note: "Free tier disponible" },
    { label: "Supabase", amount: "Gratis", note: "Free tier" },
    { label: "Redis (Upstash)", amount: "Gratis", note: "Free tier" },
  ],
  en: [
    { label: "voti.pe", amount: "$35/yr", note: "Domain" },
    { label: "voti.com.pe", amount: "$35/yr", note: "Domain" },
    { label: "infovoto.com", amount: "$15/yr", note: "Domain (purchased)" },
    { label: "Claude Code Max", amount: "$100/mo", note: "Dev tooling" },
    { label: "GCP", amount: "$300 credits", note: "Free tier available" },
    { label: "Supabase", amount: "Free", note: "Free tier" },
    { label: "Redis (Upstash)", amount: "Free", note: "Free tier" },
  ],
};

interface GeoStat {
  country_code: string;
  country_name: string;
  city: string;
  count: number;
}

interface DailyStats {
  date: string;
  count: number;          // mapped from gateway's total_requests
  unique_users: number;   // mapped from gateway's unique_users
}

export default function StatsPage() {
  const { data: session, status } = useSession();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [dailyData, setDailyData] = useState<DailyStats[]>([]);
  const [geoData, setGeoData] = useState<GeoStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lang, setLang] = useState<Lang>("es");

  const l = t[lang];
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
    try {
      const [statsRes, dailyRes, geoRes] = await Promise.allSettled([
        fetch("/api/analytics/stats"),
        fetch("/api/analytics/daily-stats?days=30"),
        fetch("/api/analytics/geo-stats"),
      ]);

      // /analytics/stats
      if (statsRes.status === "fulfilled") {
        if (statsRes.value.ok) {
          setStats(await statsRes.value.json());
        } else {
          const errText = await statsRes.value.text();
          setError(`Error ${statsRes.value.status}: ${errText}`);
        }
      } else {
        setError(`No se pudo conectar al gateway: ${statsRes.reason}`);
      }

      // /analytics/daily-stats — map gateway field names to frontend
      if (dailyRes.status === "fulfilled") {
        if (dailyRes.value.ok) {
          const raw = await dailyRes.value.json();
          const arr: any[] = Array.isArray(raw) ? raw : raw.data || [];
          setDailyData(
            arr.map((d: any) => ({
              date: d.date,
              count: d.total_requests ?? d.count ?? 0,
              unique_users: d.unique_users ?? 0,
            })),
          );
        } else {
          console.error("daily-stats failed:", dailyRes.value.status);
        }
      }
      // /analytics/geo-stats
      if (geoRes.status === "fulfilled" && geoRes.value.ok) {
        const raw = await geoRes.value.json();
        setGeoData(Array.isArray(raw) ? raw : []);
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
        <div className="text-gray-400">{t[lang].loading}</div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen bg-[#0a0f1a] flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 mb-4">{t[lang].loginPrompt}</p>
          <Link href="/login" className="px-6 py-2 bg-amber-500 text-[#0a0f1a] rounded-lg font-bold">
            {t[lang].loginBtn}
          </Link>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#0a0f1a] flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 mb-4">{l.restricted}</p>
          <Link href="/chat" className="px-6 py-2 bg-[#1e293b] text-white rounded-lg border border-[#334155]">
            {l.back}
          </Link>
        </div>
      </div>
    );
  }

  // Derived metrics
  const avgPerUser =
    stats?.total_unique_users && stats?.total_platform_requests
      ? (stats.total_platform_requests / stats.total_unique_users).toFixed(1)
      : "—";

  const latencyLabel = stats?.avg_request_duration_ms
    ? (stats.avg_request_duration_ms / 1000).toFixed(1) + "s"
    : "—";

  const geminiCost = calcGeminiCost(
    stats?.total_tokens_input ?? 0,
    stats?.total_tokens_output ?? 0,
  );

  const costPerQuery =
    stats?.total_requests && stats.total_requests > 0 && geminiCost > 0
      ? "$" + (geminiCost / stats.total_requests).toFixed(6)
      : "—";

  const hasQueryData = dailyData.length > 0 && dailyData.some((d) => d.count > 0);
  const hasUserData = dailyData.length > 0 && dailyData.some((d) => d.unique_users != null);

  // Aggregate geo data: by country and by city
  const countryData = Object.values(
    geoData.reduce<Record<string, { name: string; count: number }>>((acc, g) => {
      const key = g.country_code;
      if (!acc[key]) acc[key] = { name: g.country_name || key, count: 0 };
      acc[key].count += g.count;
      return acc;
    }, {}),
  ).sort((a, b) => b.count - a.count);

  const cityData = geoData
    .map((g) => ({ name: `${g.city}, ${g.country_code}`, count: g.count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 15);

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
            <h1 className="text-2xl font-bold text-white">{l.title}</h1>
            <p className="text-gray-400 text-sm mt-1">{l.subtitle}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setLang(lang === "es" ? "en" : "es")}
              className="px-3 py-2 bg-[#1e293b] text-gray-300 rounded-lg border border-[#334155] text-xs hover:bg-[#334155] transition font-mono"
            >
              {lang === "es" ? "EN" : "ES"}
            </button>
            <Link href="/chat" className="px-4 py-2 bg-[#1e293b] text-gray-300 rounded-lg border border-[#334155] text-sm hover:bg-[#334155] transition">
              {l.chat}
            </Link>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-900/30 border border-red-800/50 rounded-lg text-red-300 text-sm">
            {error}
          </div>
        )}

        {/* Adopción KPIs — 4 cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard label={l.uniqueUsers} value={stats?.total_unique_users ?? 0} color="text-emerald-400" />
          <StatCard label={l.totalQueries} value={stats?.total_platform_requests ?? 0} color="text-sky-400" />
          <StatCard label={l.queriesPerUser} value={avgPerUser} color="text-purple-400" />
          <StatCard label={l.avgLatency} value={latencyLabel} color="text-amber-400" />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Line Chart: Consultas por día */}
          <div className="bg-[#111827] border border-[#1e293b] rounded-xl p-5">
            <h3 className="text-white font-bold text-sm mb-1">{l.queriesPerDay}</h3>
            <p className="text-gray-500 text-xs mb-4">{l.last30}</p>
            {hasQueryData ? (
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
              <div className="h-[250px] flex items-center justify-center text-center text-gray-500 text-sm px-6">
                El gateway necesita retornar <code className="text-amber-400 mx-1">count</code> en{" "}
                <code className="text-amber-400">/analytics/daily-stats</code>
              </div>
            )}
          </div>

          {/* Line Chart: Usuarios únicos por día */}
          <div className="bg-[#111827] border border-[#1e293b] rounded-xl p-5">
            <h3 className="text-white font-bold text-sm mb-1">{l.usersPerDay}</h3>
            <p className="text-gray-500 text-xs mb-4">{l.last30}</p>
            {hasUserData ? (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="date" tick={{ fill: "#64748b", fontSize: 10 }} tickFormatter={(v) => v.slice(5)} />
                  <YAxis tick={{ fill: "#64748b", fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: 8 }}
                    labelStyle={{ color: "#f8fafc" }}
                    itemStyle={{ color: "#34d399" }}
                  />
                  <Line type="monotone" dataKey="unique_users" stroke="#34d399" strokeWidth={2} dot={{ fill: "#34d399", r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-center text-gray-500 text-sm px-6">
                El gateway necesita retornar <code className="text-amber-400 mx-1">unique_users</code> en{" "}
                <code className="text-amber-400">/analytics/daily-stats</code>
              </div>
            )}
          </div>
        </div>

        {/* Geo Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* By Country */}
          <div className="bg-[#111827] border border-[#1e293b] rounded-xl p-5">
            <h3 className="text-white font-bold text-sm mb-4">{l.byCountry}</h3>
            {countryData.length > 0 ? (
              <ResponsiveContainer width="100%" height={Math.max(150, countryData.length * 36)}>
                <BarChart data={countryData} layout="vertical" margin={{ left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                  <XAxis type="number" tick={{ fill: "#64748b", fontSize: 10 }} />
                  <YAxis type="category" dataKey="name" tick={{ fill: "#cbd5e1", fontSize: 11 }} width={80} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: 8 }}
                    labelStyle={{ color: "#f8fafc" }}
                    formatter={(value) => [`${value} ${l.queries}`, ""]}
                  />
                  <Bar dataKey="count" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[120px] flex items-center justify-center text-gray-500 text-sm">
                {l.noGeoData}
              </div>
            )}
          </div>

          {/* By City */}
          <div className="bg-[#111827] border border-[#1e293b] rounded-xl p-5">
            <h3 className="text-white font-bold text-sm mb-4">{l.byCity}</h3>
            {cityData.length > 0 ? (
              <ResponsiveContainer width="100%" height={Math.max(150, cityData.length * 36)}>
                <BarChart data={cityData} layout="vertical" margin={{ left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                  <XAxis type="number" tick={{ fill: "#64748b", fontSize: 10 }} />
                  <YAxis type="category" dataKey="name" tick={{ fill: "#cbd5e1", fontSize: 11 }} width={100} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: 8 }}
                    labelStyle={{ color: "#f8fafc" }}
                    formatter={(value) => [`${value} ${l.queries}`, ""]}
                  />
                  <Bar dataKey="count" fill="#06b6d4" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[120px] flex items-center justify-center text-gray-500 text-sm">
                {l.noGeoData}
              </div>
            )}
          </div>
        </div>

        {/* Cost Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Gemini API Cost */}
          <div className="bg-[#111827] border border-[#1e293b] rounded-xl p-5">
            <h3 className="text-white font-bold text-sm mb-4">{l.geminiCost}</h3>
            {stats?.total_tokens_input != null || stats?.total_tokens_output != null ? (
              <>
                <div className="text-3xl font-bold text-emerald-400 mb-4">
                  ${geminiCost.toFixed(4)} USD
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-gray-400">
                    <span>{l.tokensInput} ({(stats?.total_tokens_input ?? 0).toLocaleString()})</span>
                    <span className="text-blue-400">
                      ${((stats?.total_tokens_input ?? 0) * GEMINI_PRICE_INPUT / 1_000_000).toFixed(4)}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>{l.tokensOutput} ({(stats?.total_tokens_output ?? 0).toLocaleString()})</span>
                    <span className="text-orange-400">
                      ${((stats?.total_tokens_output ?? 0) * GEMINI_PRICE_OUTPUT / 1_000_000).toFixed(4)}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>{l.costPerQuery}</span>
                    <span className="text-purple-400">{costPerQuery}</span>
                  </div>
                  <div className="pt-2 border-t border-[#1e293b] text-xs text-gray-500">
                    Gemini 2.0 Flash: $0.075/M input · $0.30/M output
                  </div>
                </div>
              </>
            ) : (
              <div className="text-gray-500 text-sm">
                <p>{l.noTokens}</p>
                <p className="mt-2 text-xs">El gateway necesita retornar <code className="text-amber-400">total_tokens_input</code> y <code className="text-amber-400">total_tokens_output</code> en <code className="text-amber-400">/analytics/stats</code>.</p>
              </div>
            )}
          </div>

          {/* Fixed Costs */}
          <div className="bg-[#111827] border border-[#1e293b] rounded-xl p-5">
            <h3 className="text-white font-bold text-sm mb-4">{l.fixedCosts}</h3>
            <div className="space-y-2">
              {FIXED_COSTS[lang].map((item) => (
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
              {l.investmentGoal}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div className="bg-[#111827] border border-[#1e293b] rounded-xl p-4">
      <div className="text-gray-400 text-xs mb-1">{label}</div>
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
    </div>
  );
}
