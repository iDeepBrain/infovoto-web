# Componentes — infovoto-web

Todos los componentes reutilizables viven en `app/components/`. La página `/chat` tiene además `VotiAvatar` definido inline (solo se usa ahí).

---

## VotiSprite

**Archivo:** `app/components/VotiSprite.tsx`

Motor de animación de sprites. Lee el JSON de Aseprite, parsea los frames y los cicla con `requestAnimationFrame`.

```typescript
interface VotiSpriteProps {
  sprite: string;      // nombre del sprite: "voti_idle_half_blink", "voti_happy_talking", etc.
  width?: number;      // ancho en px (altura se calcula por ratio 470×625)
  playing?: boolean;   // default true
  onHoverSprite?: string; // sprite alternativo al hacer hover
}
```

**Cómo funciona:**
1. Fetch `{ASSETS_URL}/sprites/{sprite}.json` → parsea frames con `normalizeFrames()`
2. Cicla frames con `requestAnimationFrame` respetando `duration` por frame (ms de Aseprite)
3. Renderiza en `<canvas>` usando `drawImage()` con offset del spritesheet PNG
4. `onHoverSprite` → cambia el JSON cargado al hacer hover, vuelve al original al salir

**Uso típico:**
```tsx
<VotiSprite sprite="voti_idle_half_blink" width={108} />
<VotiSprite sprite="voti_happy_talking" width={200} onHoverSprite="voti_celebrating" />
```

Ver detalle completo en [voti-sprite-system.md](voti-sprite-system.md).

---

## Navbar

**Archivo:** `app/components/Navbar.tsx`

Barra de navegación sticky y responsive. Muestra logo, links y botón de login/logout.

- Sticky top con `backdrop-blur`
- En mobile: menú hamburguesa
- Detecta sesión de NextAuth para mostrar "Salir" vs "Iniciar sesión"

---

## HeroSection

**Archivo:** `app/components/HeroSection.tsx`

Primera sección del landing. Titular, subtítulo, dos CTAs y Voti animado.

- Voti: `idle_half_blink` en reposo → `happy_talking` al hacer hover (via `onHoverSprite`)
- CTA primario: "Consultar ahora" → `/chat`
- CTA secundario: "¿Cómo funciona?" → scroll a sección

---

## DemoSection

**Archivo:** `app/components/DemoSection.tsx`

6 preguntas de ejemplo en cards clicables.

- Click en una pregunta → navega a `/chat?q={pregunta}`
- La página de chat lee el `?q=` param y pre-rellena el input

**Preguntas incluidas:**
- Candidatos presidenciales 2026
- Propuestas de partidos
- Fechas electorales
- Patrimonio de candidatos
- Multa por no votar
- Comparación de propuestas

---

## FeaturesGrid

**Archivo:** `app/components/FeaturesGrid.tsx`

6 cards de features con íconos y hover effects.

| Feature | Descripción |
|---------|-------------|
| Candidatos | Perfiles y trayectoria |
| Propuestas | Planes de gobierno |
| Comparación | Candidato vs candidato |
| Historial | Votaciones del Congreso |
| Transparencia | Declaraciones juradas |
| Acción | Dónde y cómo votar |

---

## FeaturesSection

**Archivo:** `app/components/FeaturesSection.tsx`

Alternativa visual a FeaturesGrid. Usa diferentes estados de Voti para ilustrar cada feature:

| Estado Voti | Feature |
|-------------|---------|
| `happy_talking` | Candidatos |
| `thinking_squint` | Propuestas |
| `explaining_talking` | Comparación |

---

## VotiStorySection

**Archivo:** `app/components/VotiStorySection.tsx`

Narrativa de marca de Voti — quién es, por qué existe, misión.

---

## StatsSection

**Archivo:** `app/components/StatsSection.tsx`

3 contadores animados (count-up con Framer Motion):
- Candidatos indexados
- Propuestas analizadas
- Fuentes verificadas

---

## TrustSection

**Archivo:** `app/components/TrustSection.tsx`

Mensaje de transparencia y limitaciones del sistema. Voti aparece con `voti_idle_half_blink`.

- Disclaimer sobre IA y verificación en JNE/ONPE
- Links a fuentes oficiales

---

## HowItWorksSection

**Archivo:** `app/components/HowItWorksSection.tsx`

Flujo de 3 pasos visual:
1. Escribe tu pregunta
2. Voti consulta fuentes oficiales
3. Recibe respuesta con fuentes

---

## Footer

**Archivo:** `app/components/Footer.tsx`

Pie de página con:
- Disclaimer legal (herramienta educativa, no oficial)
- Links: JNE, ONPE, Voto Informado, Privacidad, Términos
- Copyright InfoVoto Perú 2026

---

## VotiAvatar (inline en chat)

**Archivo:** `app/chat/page.tsx` (componente local, no exportado)

Wrapper de `VotiSprite` para los mensajes del chat. Muestra el sprite dentro de un círculo.

```typescript
function VotiAvatar({ size = 40, sprite = "voti_idle_half_blink" }: {
  size?: number;
  sprite?: string;
})
```

**Sprites por estado del chat:**

| Estado | Sprite |
|--------|--------|
| Idle / bienvenida | `voti_idle_half_blink` |
| Enviando / cargando | `voti_thinking_squint` |
| Respuesta normal | `voti_explaining_talking` |
| Error | `voti_loading_worried` |
