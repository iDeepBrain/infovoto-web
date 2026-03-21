"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";

interface UserStats {
  user_id: string;
  total_requests: number;
  total_logins: number;
  last_active: string | null;
  avg_request_duration_ms: number;
  requests_today: number;
  requests_last_7_days: number;
}

export default function StatsPage() {
  const { data: session, status } = useSession();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/login");
    }

    if (status === "authenticated" && (session as any)?.id_token) {
      fetchStats();
    }
  }, [status, session]);

  async function fetchStats() {
    try {
      const gatewayUrl = process.env.NEXT_PUBLIC_GATEWAY_URL || "http://localhost:2080";
      const response = await fetch(`${gatewayUrl}/analytics/stats`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${(session as any)?.id_token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch stats");
      }

      const data = await response.json();
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-white">Cargando estadísticas...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-red-400">Error: {error}</div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-white">No hay datos de estadísticas</div>
      </div>
    );
  }

  const lastActive = stats.last_active ? new Date(stats.last_active).toLocaleString("es-PE") : "Nunca";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Tus Estadísticas</h1>
          <p className="text-slate-400">Métricas de uso de InfoVoto</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Total Requests */}
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <div className="text-slate-400 text-sm font-medium mb-2">Total de Consultas</div>
            <div className="text-3xl font-bold text-white">{stats.total_requests}</div>
            <div className="text-xs text-slate-500 mt-2">Todas las preguntas realizadas</div>
          </div>

          {/* Requests Today */}
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <div className="text-slate-400 text-sm font-medium mb-2">Hoy</div>
            <div className="text-3xl font-bold text-blue-400">{stats.requests_today}</div>
            <div className="text-xs text-slate-500 mt-2">Consultas realizadas hoy</div>
          </div>

          {/* Last 7 Days */}
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <div className="text-slate-400 text-sm font-medium mb-2">Últimos 7 Días</div>
            <div className="text-3xl font-bold text-green-400">{stats.requests_last_7_days}</div>
            <div className="text-xs text-slate-500 mt-2">Consultas de la última semana</div>
          </div>

          {/* Logins */}
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <div className="text-slate-400 text-sm font-medium mb-2">Ingresos</div>
            <div className="text-3xl font-bold text-purple-400">{stats.total_logins}</div>
            <div className="text-xs text-slate-500 mt-2">Veces que ingresaste</div>
          </div>

          {/* Avg Duration */}
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <div className="text-slate-400 text-sm font-medium mb-2">Tiempo Promedio</div>
            <div className="text-3xl font-bold text-orange-400">
              {Math.round(stats.avg_request_duration_ms)}ms
            </div>
            <div className="text-xs text-slate-500 mt-2">Duración promedio por consulta</div>
          </div>

          {/* Last Active */}
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <div className="text-slate-400 text-sm font-medium mb-2">Última Actividad</div>
            <div className="text-sm font-mono text-cyan-400">{lastActive}</div>
            <div className="text-xs text-slate-500 mt-2">Cuándo usaste el app por última vez</div>
          </div>
        </div>

        {/* Summary */}
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <h2 className="text-xl font-bold text-white mb-4">Resumen</h2>
          <div className="space-y-2 text-slate-300">
            <p>
              Has realizado <span className="font-bold text-white">{stats.total_requests}</span> consultas en total.
            </p>
            <p>
              Hoy has hecho <span className="font-bold text-white">{stats.requests_today}</span> preguntas.
            </p>
            <p>
              En los últimos 7 días realizaste{" "}
              <span className="font-bold text-white">{stats.requests_last_7_days}</span> consultas.
            </p>
            <p>
              Ingresaste <span className="font-bold text-white">{stats.total_logins}</span> veces.
            </p>
            <p>
              El tiempo promedio por consulta es de{" "}
              <span className="font-bold text-white">{Math.round(stats.avg_request_duration_ms)}ms</span>.
            </p>
          </div>
        </div>

        {/* Back Button */}
        <div className="mt-8">
          <a
            href="/chat"
            className="inline-block px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
          >
            ← Volver al Chat
          </a>
        </div>
      </div>
    </div>
  );
}
