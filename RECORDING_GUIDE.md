# Guía de Grabación — TPs_data

Instrucciones paso a paso para cada presentador. Lee tu sección completa antes de grabar.

---

## Configuración General (todos)

### Antes de empezar

1. **Instala el teleprompter:**
   ```bash
   cd teleprompter
   npm install
   npm run dev
   ```
2. Abre **Chrome** y ve a `http://localhost:3001`
3. Configura OBS:
   - Fuente: Captura de pantalla completa (1920×1080)
   - Agrega tu cámara como fuente separada (esquina inferior derecha recomendada)
   - Audio: micrófono de tu computadora o headset
4. Haz una prueba de 30 segundos para verificar audio y video
5. Click **"🎤 Iniciar escucha"** justo antes de empezar a leer

### Cómo funciona

El teleprompter escucha tu voz en tiempo real. Cuando dices una **palabra clave**, la animación avanza automáticamente al keyframe correcto y se reproduce durante la duración indicada.

- **Panel izquierdo:** tu script (la línea actual aparece resaltada en verde)
- **Panel derecho:** la animación que verá la audiencia
- **Si una palabra no se detecta:** usa `← Anterior` / `Siguiente →` para avanzar manualmente

---

## Persona 3 — Escenas 1, 2 y 8 (Project Manager)

**Color:** Naranja `#ff6b35`

### Escena 1 — Introducción (frames 0–1199, 40 segundos)

| # | Di esta línea | Palabra clave que activa la animación |
|---|--------------|---------------------------------------|
| 1 | *"¿Qué pasa cuando un **ataque** ocurre en SAP?"* | **ataque** |
| 2 | *"La **industria** tarda en promedio 287 días en detectar un breach."* | **industria** |
| 3 | *"Nosotros lo detectamos en **milisegundos**. Esto es TPs_data."* | **milisegundos** |

**Animación activada:** Pregunta → Tarjetas estadísticas → Línea final con el equipo

---

### Escena 2 — Arquitectura (frames 1200–2399, 40 segundos)

| # | Di esta línea | Palabra clave |
|---|--------------|---------------|
| 4 | *"Nuestra **arquitectura** corre completamente en SAP BTP."* | **arquitectura** |
| 5 | *"Esos logs pasan por un **pipeline** de FastAPI con asyncio..."* | **pipeline** |
| 6 | *"...y el resultado va a tres **destinos** simultáneos: HANA, Webhook y Dashboard."* | **destinos** |

**Animación activada:** Nodo SAP API → Pipeline + ML Model → HANA + Webhook + Dashboard

---

### Escena 8 — Impacto de Negocio (frames 8100–8999, 30 segundos)

| # | Di esta línea | Palabra clave |
|---|--------------|---------------|
| 24 | *"¿Qué **significa** esto para SAP?"* | **significa** |
| 25 | *"Usamos aprendizaje no supervisado — no necesitamos datos **etiquetados**."* | **etiquetados** |
| 26 | *"Tercero, corre **nativamente** en BTP, sin fricción con el ecosistema SAP."* | **nativamente** |
| 27 | *"Menos tiempo detectando. Más tiempo **respondiendo**."* | **respondiendo** |

**Animación activada:** Tarjeta MTTD → Tarjeta no supervisado → Tarjeta nativo BTP → Frase final

---

## Persona 1 — Escenas 3 y 4 (AI & ML Engineer)

**Color:** Morado `#a855f7`

### Escena 3 — OBSERVE (frames 2400–3599, 40 segundos)

| # | Di esta línea | Palabra clave |
|---|--------------|---------------|
| 7 | *"El primer paso del pipeline es **OBSERVE**."* | **OBSERVE** |
| 8 | *"...que **normaliza** los nombres de columnas y valida el schema."* | **normaliza** |
| 9 | *"El output es un **DataFrame** de pandas..."* | **DataFrame** |
| 10 | *"Ya desde aquí podemos ver **patrones**: IPs con muchos errores, actividad sospechosa."* | **patrones** |

**Animación activada:** Label OBSERVE → log_parser.py → Tabla de logs → Filas sospechosas iluminadas

---

### Escena 4 — ANALYZE & DETECT (frames 3600–4799, 40 segundos)

| # | Di esta línea | Palabra clave |
|---|--------------|---------------|
| 11 | *"En la fase **ANALYZE**, el módulo features.py extrae métricas por IP."* | **ANALYZE** |
| 12 | *"Esas features entran al **Isolation Forest**, un modelo no supervisado."* | **Isolation Forest** |
| 13 | *"El modelo la clasifica automáticamente según el **umbral**: severidad Alta."* | **umbral** |

**Animación activada:** Features con métricas → Label DETECT + score animado → Alerta ALTA

> **Nota:** "Isolation Forest" son dos palabras — di ambas claramente.

---

## Persona 2 — Escena 5 (Cloud Integration)

**Color:** Azul `#3b82f6`

### Escena 5 — Cloud & BTP (frames 4800–5999, 40 segundos)

| # | Di esta línea | Palabra clave |
|---|--------------|---------------|
| 14 | *"Todo corre en SAP BTP **Cloud Foundry**."* | **Cloud Foundry** |
| 15 | *"Hacia afuera nos conectamos usando **connection pool** a SAP HANA Cloud..."* | **connection pool** |
| 16 | *"El sistema lleva corriendo en BTP desde el 4 de **mayo**."* | **mayo** |

**Animación activada:** Contenedor BTP → Conexiones externas → Badge "Live"

> **Nota:** "connection pool" — di en inglés, claro y pausado.

---

## Persona 5 — Escena 6 (Backend Engineer)

**Color:** Cyan `#00d4ff`

### Escena 6 — Flujo de Ataque Real (frames 6000–7199, 40 segundos)

| # | Di esta línea | Palabra clave |
|---|--------------|---------------|
| 17 | *"Déjenme mostrarles el **flujo completo** de un ataque real."* | **flujo completo** |
| 18 | *"La IP 192.168.4.77 genera **847** requests en un solo ciclo."* | **847** |
| 19 | *"El extractor de features detecta **error rate** de 0.73..."* | **error rate** |
| 20 | *"El Isolation Forest devuelve un score **negativo**: -0.82."* | **negativo** |
| 21 | *"Se genera el **Incident Report**, se dispara el Webhook y queda persistido en HANA."* | **Incident Report** |
| 22 | *"**MTTD** total del pipeline: 245 milisegundos."* | **MTTD** |

**Animación activada:** Línea de tiempo → t+0ms → t+45/112ms → t+180ms → t+210–241ms → MTTD 245ms

> **Nota:** "error rate" en inglés. "MTTD" — deletrea las letras: em-te-te-de.

---

## Persona 4 — Escena 7 (Frontend Engineer)

**Color:** Rosa `#ec4899`

### Escena 7 — Dashboard (frames 7200–8099, 30 segundos)

| # | Di esta línea | Palabra clave |
|---|--------------|---------------|
| 23 | *"El **dashboard** de operaciones corre en Streamlit y muestra KPIs en tiempo real."* | **dashboard** |
| 24 | *"Abajo tenemos dos **gráficas**: anomalías por hora y evolución del score."* | **gráficas** |
| 25 | *"Y el **feed** de logs en vivo muestra cada IP flaggeada al analista."* | **feed** |

**Animación activada:** Dashboard + KPIs → Gráficas → Log feed

---

## Consejos para Todos

### Si una keyword no se detecta
- Usa los botones **← Anterior** / **Siguiente →** para avanzar manualmente
- Habla un poco más despacio y articulado al llegar a las palabras clave
- Edita `teleprompter/src/keyword-map.ts` y agrega variantes fonéticas en `alternatives[]`

### Antes de cada take
- Verifica que el indicador de estado diga **"🟢 Escuchando..."**
- Haz una prueba diciendo la primera keyword de tu escena

### Palabras en inglés
Las siguientes palabras deben decirse en inglés para ser detectadas correctamente:
- **Cloud Foundry** — /klaʊd ˈfaʊndri/
- **connection pool** — /kəˈnɛkʃən puːl/
- **pipeline** — /ˈpaɪplaɪn/
- **Isolation Forest** — /ˌaɪsəˈleɪʃən ˈfɒrɪst/
- **DataFrame** — /ˈdeɪtəfreɪm/
- **error rate** — /ˈɛrər reɪt/
- **feed** — /fiːd/
- **dashboard** — /ˈdæʃbɔːrd/
- **MTTD** — deletrea: M-T-T-D
- **OBSERVE** / **ANALYZE** — en mayúsculas conceptuales, pronúncialas en español: "ob-ser-ve", "a-na-li-se"

### OBS — Configuración recomendada
```
Resolución de salida: 1920×1080
FPS: 30
Bitrate video: 8000 Kbps (CBR)
Codificador: x264 o NVENC
Audio: 320 Kbps AAC, 48kHz
```
