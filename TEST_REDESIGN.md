# 🎨 Test del Rediseño de Landing Page

## Inicio Rápido

### 1️⃣ Dev Server
```bash
cd infovoto-web
npm run dev
# Abre: http://localhost:3000
```

### 2️⃣ Ver el Nuevo Diseño
```
✨ Navbar sticky con gradient
✨ Hero section con animaciones
✨ Features grid (6 cards)
✨ Stats section con contadores animados
✨ Footer profesional con legal disclaimer
```

---

## Testing Visual con Playwright

### Opción A: Capture Screenshots (sin UI)
```bash
npm run test:visual
# Genera screenshots en: ./screenshots/
# - landing-desktop.png (1920x1080)
# - landing-mobile.png (375x667)
# - landing-tablet.png (768x1024)
```

### Opción B: Browser UI (ver tests en tiempo real)
```bash
npm run test:visual:headed
# Abre navegador y ejecuta tests visualmente
```

### Opción C: Modo interactivo
```bash
npm run test:visual:ui
# Abre interfaz interactiva de Playwright
```

---

## Qué Testear

### ✅ Navbar
- [ ] Logo visible y clickeable
- [ ] Links (Inicio, Características)
- [ ] Botón "Iniciar Sesión" visible
- [ ] Mobile: hamburger menu aparece en <768px
- [ ] Mobile: menu se abre/cierra

### ✅ Hero Section
- [ ] Título "Tu Voz, Informada" visible
- [ ] Descripción visible
- [ ] Botones CTA: "Empezar Ahora" y "Saber Más"
- [ ] Background gradiente animado
- [ ] Stats preview (12.5M+, 50+, Real-time)
- [ ] Responsive en mobile/tablet

### ✅ Features Grid
- [ ] 6 cards visibles (Candidatos, Propuestas, etc)
- [ ] Hover effect: cards levantarse y sombra
- [ ] Icons animados en hover
- [ ] Responsive: 1 col mobile, 2 cols tablet, 3 cols desktop

### ✅ Stats Section
- [ ] Background oscuro (slate-900)
- [ ] Contadores animados (count-up effect)
- [ ] CTA "Comienza Ahora" visible
- [ ] Responsive

### ✅ Footer
- [ ] Legal disclaimer en blue box
- [ ] Links a JNE, ONPE
- [ ] Copyright visible
- [ ] Social links

---

## Análisis Visual con VLM (Claude Vision)

### Captura Screenshots
```bash
npm run test:visual
# Espera a que terminen los tests
# Revisa ./screenshots/
```

### Análisis Manual
Abre screenshots en tu IDE o visor de imágenes para revisar:
1. **Diseño general** — ¿Se ve profesional?
2. **Colores** — ¿Gradientes bien balanceados?
3. **Espaciado** — ¿Buena distribución?
4. **Typography** — ¿Textos legibles?
5. **Mobile** — ¿Responsive funciona bien?

---

## Checklist de UX

### Naveg ación
- [ ] Logo es clickeable a home
- [ ] Links claros
- [ ] Botón login visible y accesible
- [ ] Menu mobile funciona

### Hero
- [ ] Headline clara y atractiva
- [ ] CTA primario (**Empezar**) vs secundario (Saber Más)
- [ ] Visual interesting (animaciones, gradientes)

### Features
- [ ] Cada feature tiene icon + titulo + descripción
- [ ] Icons son claros y representativos
- [ ] Hover feedback visual

### Stats
- [ ] Números impactantes
- [ ] Animación smooth de contadores
- [ ] CTA repetido ("Comienza Ahora")

### Footer
- [ ] Legal disclaimer clara
- [ ] Links útiles (JNE, ONPE)
- [ ] Copyright

---

## Performance

### Lighthouse
```bash
npm run build
npm run start
# Luego abre: http://localhost:3000
# Abre DevTools → Lighthouse → Analyze
```

**Target:**
- Performance: > 85
- Accessibility: > 90
- Best Practices: > 90
- SEO: > 85

### Core Web Vitals
- LCP (Largest Contentful Paint): < 2.5s
- FID (First Input Delay): < 100ms
- CLS (Cumulative Layout Shift): < 0.1

---

## Próximos Pasos

1. ✅ **Ahora:** Revisar screenshots y feedback visual
2. ⏳ **Después:** Agregar Google Auth visual (botón de login)
3. ⏳ **Después:** Mejorar chat page con mismo diseño
4. ⏳ **Después:** Deploy a GCP y testear en producción

---

## Comandos Útiles

```bash
# Dev completo
npm run dev

# Build + análisis
npm run build && npm run start

# Tests
npm run test           # Vitest (unit tests)
npm run test:visual    # Playwright screenshots
npm run test:visual:headed  # Playwright con navegador

# Lint
npm run lint
```

---

## Troubleshooting

### "Port 3000 already in use"
```bash
# Mata el proceso anterior
lsof -i :3000
kill -9 <PID>

# O usa otro puerto
npm run dev -- -p 3001
```

### "Screenshots directory not found"
```bash
mkdir -p ./screenshots
```

### "Playwright tests fail - connection refused"
```bash
# Asegúrate que el dev server está corriendo
npm run dev   # En otra terminal
npm run test:visual
```

---

## VLM Analysis (Futura)

Una vez tengas screenshots, puedes usar Claude Vision API para análisis automático:

```python
# Pseudocódigo (próximamente)
import anthropic

client = anthropic.Anthropic()

with open("screenshots/landing-desktop.png", "rb") as img:
    image_data = base64.b64encode(img.read()).decode("utf-8")

response = client.messages.create(
    model="claude-3-5-sonnet-20241022",
    max_tokens=1024,
    messages=[
        {
            "role": "user",
            "content": [
                {
                    "type": "image",
                    "source": {
                        "type": "base64",
                        "media_type": "image/png",
                        "data": image_data,
                    },
                },
                {
                    "type": "text",
                    "text": "Analiza esta landing page. ¿Qué mejorías visuales sugieren desde UX?"
                }
            ],
        }
    ],
)

print(response.content[0].text)
```
