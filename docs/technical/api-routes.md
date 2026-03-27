# API Routes — infovoto-web

Las rutas de Next.js actúan como proxies server-side: agregan la API key del gateway (nunca visible en el browser) y validan la sesión antes de reenviar.

```
Browser → /api/* (Next.js proxy) → Gateway (con Bearer + X-API-Key)
```

---

## POST /api/chat

**Archivo:** `app/api/chat/route.ts`

Proxy principal del chat. Agrega `Authorization`, `X-API-Key` y `X-Real-IP` al reenvío.

### Request

```
POST /api/chat
Content-Type: application/json

{ "message": "¿Quiénes postulan a la presidencia en 2026?" }
```

### Validaciones (orden de ejecución)

| Paso | Validación | Respuesta si falla |
|------|-----------|-------------------|
| 1 | Sesión NextAuth válida + `id_token` presente | `401 Not authenticated` |
| 2 | Body parseable + campo `message` presente | `400 Message required` |
| 3 | Forward al gateway (timeout 20s) | `504 Gateway timeout` / `502 Gateway unavailable` |

### Headers al gateway

| Header | Valor | Propósito |
|--------|-------|-----------|
| `Authorization` | `Bearer {id_token}` | Identificar usuario (Google sub) |
| `X-API-Key` | `GATEWAY_API_KEY_WEB` | Autenticar el servicio web |
| `X-Real-IP` | IP del cliente (x-forwarded-for) | Rate limiting por IP en gateway |

### Response

Pasa directamente el JSON y status code del gateway:

```typescript
interface ChatResponse {
  reply: string;
  sources?: SourceMetadata[];
  warnings?: Warning[];
  session_id?: string;
  cached?: boolean;
}

interface SourceMetadata {
  name: string;
  url?: string;
  last_updated?: string;
  data_type: string; // "oficial" | "declaracion_jurada" | "plan_gobierno" | "ia_interpretacion"
}

interface Warning {
  type: string; // "declaracion_jurada" | "ia_interpretacion" | "datos_incompletos" | "sesgo_detectado"
  message: string;
}
```

### Códigos de respuesta

| Código | Motivo |
|--------|--------|
| 200 | Respuesta exitosa |
| 400 | Mensaje faltante o malformado |
| 401 | Sesión inválida o expirada |
| 429 | Rate limit excedido (propagado desde gateway) |
| 502 | Gateway no disponible |
| 504 | Gateway tardó > 20s |

**Timeouts:** 20s server-side (`AbortSignal.timeout`), 15s client-side (`AbortController` en `lib/api.ts`).

---

## GET /api/analytics/stats

**Archivo:** `app/api/analytics/stats/route.ts`

Métricas globales de la plataforma. Restringido al email en `ADMIN_EMAIL`.

### Auth

| Check | Respuesta si falla |
|-------|-------------------|
| Sesión válida + `id_token` | `401 Not authenticated` |
| `session.user.email === ADMIN_EMAIL` | `403 Forbidden` |

### Forward al gateway

```
GET {GATEWAY_URL}/analytics/stats
Authorization: Bearer {id_token}
```

Timeout: 10s.

### Response

```typescript
interface UserStats {
  user_id: string;
  total_requests: number;
  total_logins: number;
  last_active: string | null;
  avg_request_duration_ms: number;
  requests_today: number;
  requests_last_7_days: number;
  total_unique_users?: number;        // platform-wide
  total_platform_requests?: number;  // platform-wide
  total_tokens_input?: number;
  total_tokens_output?: number;
}
```

---

## GET /api/analytics/daily-stats

**Archivo:** `app/api/analytics/daily-stats/route.ts`

Desglose diario de últimos N días. Parámetro `?days=30` (default).

### Forward al gateway

```
GET {GATEWAY_URL}/analytics/daily-stats?days=30
Authorization: Bearer {id_token}
```

### Response

```typescript
// Array o { data: Array }
interface DailyStats {
  date: string;           // "YYYY-MM-DD"
  total_requests: number; // mapeado a "count" en el frontend
  unique_users: number;
}
```

---

## GET /api/analytics/geo-stats

**Archivo:** `app/api/analytics/geo-stats/route.ts`

Distribución geográfica de consultas.

### Forward al gateway

```
GET {GATEWAY_URL}/analytics/geo-stats
Authorization: Bearer {id_token}
```

### Response

```typescript
interface GeoStat {
  country_code: string;
  country_name: string;
  city: string;
  count: number;
}
```

---

## Notas de seguridad

- `GATEWAY_API_KEY_WEB` vive solo en el servidor — nunca en variables `NEXT_PUBLIC_*`
- `id_token` se extrae del JWT de NextAuth en el servidor — el browser no lo maneja directamente
- Todos los proxies usan `getServerSession()` — no se confía en headers del request
- El streaming (`/api/chat/stream`) aún va directo al gateway desde el cliente (TODO: crear proxy)
