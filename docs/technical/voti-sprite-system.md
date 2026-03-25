# Sistema de Sprites — Voti

## Componente: VotiSprite.tsx

Motor de animación que renderiza spritesheets de Aseprite en el browser.

### Cómo funciona

1. Carga JSON metadata desde `/public/sprites/{name}.json`
2. Parsea frames (soporta formato array y object)
3. Renderiza PNG spritesheet como `background-image`
4. Anima frame-by-frame con `setTimeout` (respeta duración por frame)
5. `overflow: hidden` + `translateX` para mostrar solo el frame actual
6. `imageRendering: pixelated` para look retro nítido

### Props

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `sprite` | string | required | Nombre del sprite (ej: "voti_idle_half_blink") |
| `width` | number | 400 | Ancho del frame en px |
| `loop` | boolean | true | Repetir animación |
| `playing` | boolean | true | Controlar reproducción |
| `onHoverSprite` | string | — | Sprite alternativo al hover |
| `className` | string | "" | CSS classes |
| `style` | CSSProperties | — | Estilos inline |

### Sprites disponibles (13)

| Sprite | Frames | Duración | Dirección | Uso |
|--------|--------|----------|-----------|-----|
| `voti_idle_half_blink` | 6 | 180ms | pingpong | Estado neutral, parpadeo |
| `voti_happy_talking` | 6 | 150ms | forward | Hablando feliz |
| `voti_happy_celebrating` | 6 | 130ms | pingpong | Celebración |
| `voti_thinking_squint` | 6 | 200ms | pingpong | Pensando |
| `voti_thinking_worried` | 6 | 200ms | pingpong | Preocupado pensando |
| `voti_explaining_talking` | 6 | 150ms | forward | Explicando activamente |
| `voti_explaining_side` | 6 | 150ms | forward | Explicando de lado |
| `voti_loading_patient` | 6 | 160ms | forward | Cargando paciente |
| `voti_loading_worried` | 6 | 160ms | forward | Error/preocupación |
| `voti_open_eyes_neutral` | 6 | 170ms | pingpong | Neutral ojos abiertos |
| `voti_body_turnaround` | 16 | 150ms | forward | Rotación cuerpo completo |
| `voti_head_turnaround` | 16 | 150ms | forward | Rotación cabeza |

### Mapeo de estados en el chat

```
Header avatar:
  normal    → voti_idle_half_blink
  loading   → voti_thinking_squint

Message avatars:
  respuesta → voti_explaining_talking
  error     → voti_loading_worried

Loading indicator:
  buscando  → voti_thinking_squint

Empty state:
  bienvenida → voti_idle_half_blink

Landing hover states:
  Hero:     idle_half_blink → happy_talking
  Trust:    open_eyes_neutral → happy_celebrating
  Features: explaining_talking, thinking_squint, explaining_side
```

### VotiAvatar (wrapper para chat)

```tsx
function VotiAvatar({ size = 40, sprite }) {
  const spriteWidth = Math.round(size * 0.75); // fit portrait ratio
  return (
    <div className="rounded-full overflow-hidden flex items-center justify-center"
         style={{ width: size, height: size }}>
      <VotiSprite sprite={sprite} width={spriteWidth} />
    </div>
  );
}
```

**Cálculo del tamaño:** Frame es 470×625 (ratio 0.752). Para caber en círculo de `size` px: `width = size * 0.75` → `height ≈ size`.

### Pipeline de assets

```
Gemini (generación) → v2/ (frames crudos)
  → rembg (remove_bg.py) → v2_nobg/ (sin fondo)
  → OpenCV Otsu+morph (crop_to_bbox.py) → v2_nobg_cut/ (recortados)
  → pixel-mcp + Aseprite (rebuild_all.lua) → public/sprites/ (spritesheets)
```

### Formato del JSON

```json
{
  "frames": {
    "sprite-xxx 0.aseprite": {
      "frame": { "x": 0, "y": 0, "w": 470, "h": 625 },
      "duration": 180
    }
  },
  "meta": {
    "image": "voti_idle_half_blink.png",
    "size": { "w": 2820, "h": 625 }
  }
}
```

### Paleta unificada (22 colores)

```
#070B17 #101727 #2A303E #3D3D4D #5A2526 #632B31
#A43F3A #69B1A4 #5C5E63 #5D656A #7F8588 #8C8F91
#979A9C #B6B4B0 #C4BDAE #C5C6C7 #CDCDCE #E7E1D2
#EBE6D4 #F1F1EC #F4F3EC #FFFFFF
```

Ver diagrama: [sprite-pipeline.mmd](diagrams/mermaid/sprite-pipeline.mmd)
