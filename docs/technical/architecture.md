# Arquitectura Técnica — infovoto-web

## Stack

| Tecnología | Versión | Propósito |
|-----------|---------|-----------|
| Next.js | 14.2.29 | Framework (App Router, SSR) |
| React | 18 | UI |
| TypeScript | 5 | Type safety |
| NextAuth.js | 4.24.11 | Google OAuth |
| TailwindCSS | 3.4.1 | Estilos |
| Framer Motion | 12.38.0 | Animaciones |
| Recharts | 3.8.0 | Gráficas (dashboard admin) |

## Rutas

| Ruta | Tipo | Protección | Descripción |
|------|------|-----------|-------------|
| `/` | Pública | — | Landing page con Voti |
| `/login` | Pública | — | Google OAuth login |
| `/chat` | Viewable | Auth en API | Chat con Voti (login para enviar) |
| `/stats` | Privada | Admin email | Dashboard de métricas |
| `/api/auth/[...nextauth]` | Server | — | NextAuth handler |
| `/api/chat` | Server | Session + API key | Proxy seguro al gateway |

## Estructura de archivos

```
app/
├── page.tsx                    # Landing (composición de secciones)
├── layout.tsx                  # Root layout (SessionProvider, Analytics)
├── globals.css                 # Tailwind imports
├── (auth)/login/page.tsx       # Login con Google
├── chat/page.tsx               # Chat UI con Voti animado
├── stats/page.tsx              # Dashboard admin (recharts)
├── api/
│   ├── auth/[...nextauth]/     # NextAuth handler
│   └── chat/route.ts           # Proxy seguro → gateway
├── components/
│   ├── Navbar.tsx              # Navegación responsive
│   ├── HeroSection.tsx         # Hero con Voti + CTA
│   ├── DemoSection.tsx         # Preguntas demo → /chat?q=
│   ├── FeaturesSection.tsx     # 3 features con mini Voti
│   ├── FeaturesGrid.tsx        # 6-card grid
│   ├── HowItWorksSection.tsx   # Flujo 3 pasos
│   ├── StatsSection.tsx        # Contadores animados
│   ├── TrustSection.tsx        # Confianza + Voti
│   ├── Footer.tsx              # Footer
│   └── VotiSprite.tsx          # Motor de animación spritesheet
├── session-provider.tsx        # NextAuth SessionProvider
└── analytics.tsx               # Google Analytics 4

lib/
├── auth.ts                     # NextAuth config + hashEmail + isAdmin
├── api.ts                      # Cliente gateway (sendMessage, tipos)
└── logger.ts                   # Logger con contexto y colores

public/
├── sprites/                    # 13 spritesheets PNG + JSON
└── bg-pixel-mountains.jpg      # Fondo pixel art

middleware.ts                   # Pass-through (auth en API proxy)
next.config.mjs                 # CSP, CORS, security headers
```

## Puertos (desarrollo)

| Servicio | Puerto local | Puerto Docker |
|----------|-------------|--------------|
| Web | 3000 | 2300 |
| Gateway | 2080 | 2080 |
| MCP | 2900 | 2900 |
| PostgreSQL | 2432 | 2432 |
| Redis | 2379 | 2379 |
