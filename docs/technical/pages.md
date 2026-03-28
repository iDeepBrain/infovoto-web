# Páginas — infovoto-web

Descripción de las páginas protegidas y con lógica compleja. El landing (`/`) es composición de componentes — ver [components.md](components.md).

---

## /chat — Chat con Voti

**Archivo:** `app/chat/page.tsx`
**Protección:** `middleware.ts` redirige a `/login` si no hay sesión

### Estados de la página

```
                    ┌─────────────────┐
                    │  status=loading  │  → spinner "Cargando..."
                    └────────┬────────┘
                             ↓
              ┌──────────────┴──────────────┐
              │ authenticated + id_token?   │
              └──────────┬──────────────────┘
                    NO ↙       ↘ SÍ
          Muestra botón      Estado vacío
          "Inicia sesión"    con sugerencias
                                  ↓
                          Usuario escribe
                          y envía mensaje
                                  ↓
                    ┌─────────────────────┐
                    │  handleSend()        │
                    │  - validar token     │
                    │  - setLoading(true)  │
                    │  - sendMessage()     │
                    └──────────┬──────────┘
                               ↓
              ┌────────────────┴────────────────┐
              │       ¿Resultado?                │
              └──────┬──────────────┬───────────┘
                 ok  ↓          error ↓
          Agrega mensaje    Clasifica error
          con reply +       y muestra mensaje
          sources +         amigable
          warnings
```

### Tipos de error

| Error | Clase | Mensaje al usuario | Acción extra |
|-------|-------|--------------------|--------------|
| Token expirado (pre-check) | — | "Tu sesión expiró. Por favor inicia sesión de nuevo." | — |
| 401 del gateway | `AuthError` | "Tu sesión expiró. Por favor inicia sesión de nuevo." | `signOut()` + redirect `/login` (2s delay) |
| 429 del gateway | `RateLimitError` | "Alcanzaste el límite de consultas. Por favor intenta más tarde." | — |
| Timeout 15s | `TimeoutError` | "La solicitud tomó demasiado tiempo. Intenta nuevamente." | — |
| fetch falló | `Error` (mensaje con "fetch") | "No se puede conectar con el servidor. Verifica tu conexión." | — |
| Otros | `GatewayError` | "Lo siento, hubo un error. Por favor intenta de nuevo." | — |

### Mensaje tipo `Message`

```typescript
interface Message {
  role: "user" | "assistant";
  content: string;
  sources?: SourceMetadata[];
  warnings?: Warning[];
  isError?: boolean;
  errorType?: "auth" | "rate_limit" | "timeout" | "server" | "network";
}
```

### Warnings del gateway

Los warnings se muestran como banners ámbar encima del contenido:

| Tipo | Significado |
|------|-------------|
| `declaracion_jurada` | Dato proviene de declaración jurada (auto-declarado) |
| `ia_interpretacion` | El agente interpretó / no hay dato oficial directo |
| `datos_incompletos` | Información parcial disponible |
| `sesgo_detectado` | Posible sesgo en la respuesta |

### Sources (fuentes)

Chips de colores según `data_type`:

| `data_type` | Color |
|-------------|-------|
| `oficial` | Verde esmeralda |
| `declaracion_jurada` | Ámbar |
| `plan_gobierno` | Azul |
| otros | Verde (default) |

### Preguntas sugeridas

8 preguntas predefinidas en `PREGUNTAS_SUGERIDAS`. Al cargar, se muestran 4 aleatorias. Click → pre-rellena el input.

Las preguntas también pueden venir por URL: `/chat?q=¿Quién...?` (desde el landing).

### Restricciones de input

- Máximo 1,000 caracteres
- Contador visual aparece cuando supera el 80% (800 chars)
- Borde rojo al llegar al límite
- Botón de envío deshabilitado cuando: `loading || !input.trim() || input.length > MAX`

### Sprites de Voti en el chat

| Momento | Sprite |
|---------|--------|
| Header (idle) | `voti_idle_half_blink` |
| Header (loading) | `voti_thinking_squint` |
| Estado vacío (bienvenida) | `voti_idle_half_blink` |
| Respuesta normal | `voti_explaining_talking` |
| Respuesta con error | `voti_loading_worried` |
| Loading bubble | `voti_thinking_squint` |

### Consent banner

Banner informativo ("Tus consultas se almacenan de forma anónima") con botón de dismiss. Estado persiste en `localStorage` con key `voti_consent`.

---

## /stats — Dashboard Admin

**Archivo:** `app/stats/page.tsx`
**Restricción:** Solo el email en `ADMIN_EMAIL` (env var). El proxy `app/api/analytics/stats/route.ts` devuelve `403` para otros usuarios.

### Flujo de carga

```
useEffect (status=authenticated) → fetchAllData()
    ↓
Promise.allSettled([
    GET /api/analytics/stats        → UserStats
    GET /api/analytics/daily-stats  → DailyStats[]
    GET /api/analytics/geo-stats    → GeoStat[]
])
```

Los 3 fetches van en paralelo. Si `/stats` devuelve 403 → muestra pantalla "Acceso restringido".

### KPIs (4 tarjetas)

| Métrica | Campo | Color |
|---------|-------|-------|
| Usuarios únicos | `total_unique_users` | Esmeralda |
| Consultas totales | `total_platform_requests` | Azul |
| Consultas/usuario | calculado | Violeta |
| Latencia promedio | `avg_request_duration_ms` | Ámbar |

### Gráficas (Recharts)

| Gráfica | Tipo | Datos | Color |
|---------|------|-------|-------|
| Consultas por día | LineChart | `daily-stats.count` | Ámbar |
| Usuarios únicos por día | LineChart | `daily-stats.unique_users` | Verde |
| Por país | BarChart horizontal | `geo-stats` agregado por country_code | Violeta |
| Por ciudad | BarChart horizontal | `geo-stats` top 15 ciudades | Cian |

### Costo Gemini

Calculado en cliente con precios Gemini 2.0 Flash:
- Input: $0.075 / 1M tokens
- Output: $0.30 / 1M tokens

```typescript
function calcGeminiCost(tokensIn: number, tokensOut: number): number {
  return (tokensIn * 0.075 + tokensOut * 0.30) / 1_000_000;
}
```

### Bilingüe ES/EN

Toggle ES ↔ EN en el header. Textos en objeto `t: Record<Lang, Record<string, string>>` — no hay i18n library, es solo un objeto local.

### Estados de la página

| Condición | UI |
|-----------|----|
| `status === "loading"` | Spinner |
| `status === "unauthenticated"` | Pantalla con botón de login |
| `forbidden === true` | "Acceso restringido a administradores" |
| `error !== null` | Banner rojo con mensaje de error |
| Todo OK | Dashboard completo |
