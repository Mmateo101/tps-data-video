# Guía de Grabación — TPs_data

Guión completo del video. Una sola persona lee todo de corrido (~5 minutos).
El teleprompter avanza las animaciones automáticamente al detectar las palabras clave.

---

## Antes de grabar

```bash
cd teleprompter && npm run dev   # abre http://localhost:3001 en Chrome
```

- Configura OBS: captura de pantalla completa (1920×1080) + cámara en esquina inferior derecha
- Click **"🎤 Iniciar escucha"** justo antes de empezar
- Si una palabra no se detecta: presiona **ESPACIO** para avanzar

---

## ESCENA 1 — Introducción · 0:00–0:40

> **Lee este texto:**

"En SAP, un sistema ERP maneja finanzas, operaciones y datos críticos de negocio.
Cuando ocurre un **ataque** y nadie lo detecta a tiempo, el daño ya está hecho."

"La **industria** tarda en promedio **287** días en detectar una brecha.
Cada incidente cuesta 4.45 millones de dólares.
Y el 43% de los ataques apuntan directamente a infraestructura ERP."

"Nosotros construimos un SOC — un Security Operations Center — que lo detecta
en **milisegundos**. Esto es TPs_data."

| # | Palabra clave | Alternativas | Frame | Animación |
|---|--------------|-------------|-------|-----------|
| 1 | **ataque** | ocurre, detecta | 0 | Pregunta aparece |
| 2 | **industria** | promedio, 287 | 80 | Tarjetas de estadísticas |
| 3 | **milisegundos** | detectamos, TPs_data | 300 | Línea final + equipo |

---

## ESCENA 2 — Arquitectura · 0:40–1:20

> **Lee este texto:**

"Nuestra **arquitectura** corre completamente en SAP BTP. El flujo empieza en la API de SAP,
donde un fetcher asíncrono jalamos logs de seguridad de forma paginada cada 30 segundos."

"Esos logs pasan por un **pipeline** de FastAPI con asyncio, llegan al modelo de Machine Learning,
y el resultado va a tres **destinos** simultáneos: SAP HANA para persistencia,
el Webhook de SAP para alertas, y nuestro dashboard para visualización en tiempo real."

"Todo el stack vive dentro del ecosistema SAP — cero dependencias externas."

| # | Palabra clave | Alternativas | Frame | Animación |
|---|--------------|-------------|-------|-----------|
| 4 | **arquitectura** | BTP, corre | 1200 | SAP API aparece |
| 5 | **pipeline** | FastAPI, asyncio | 1340 | Pipeline + ML Model |
| 6 | **destinos** | HANA, simultáneos | 1460 | HANA + Webhook + Dashboard |

---

## ESCENA 3 — OBSERVE · 1:20–2:00

> **Lee este texto:**

"El primer paso del pipeline es **OBSERVE**. El módulo sap_log_fetcher.py hace llamadas
asíncronas y paginadas a la API de SAP, o en modo local lee CSVs de muestra.
La respuesta cruda pasa por log_parser.py, que **normaliza** los nombres de columnas
y valida que el schema sea correcto."

"El output es un **DataFrame** de pandas con columnas estandarizadas:
datetime, source_ip, event_type, status y response_time."

"Ya desde aquí podemos ver **patrones**: esta IP está generando múltiples errores 403 en milisegundos."

| # | Palabra clave | Alternativas | Frame | Animación |
|---|--------------|-------------|-------|-----------|
| 7 | **OBSERVE** | primer paso, fetcher | 2400 | Label OBSERVE + flujo |
| 8 | **normaliza** | parser, schema | 2530 | log_parser.py aparece |
| 9 | **DataFrame** | output, pandas | 2600 | Tabla de logs |
| 10 | **patrones** | IP, errores | 2850 | Filas sospechosas se iluminan |

> Pronuncia OBSERVE y ANALYZE en español: "ob-ser-ve", "a-na-li-se".

---

## ESCENA 4 — ANALYZE & DETECT · 2:00–2:40

> **Lee este texto:**

"En la fase **ANALYZE**, el módulo features.py agrupa los logs por IP y extrae
13 métricas de comportamiento. Entre las más importantes: error_rate y brute_force_score."

"Esas features entran al **Isolation Forest** — un modelo no supervisado
que aprendió cómo se ve el tráfico normal."

"Esta IP obtuvo -0.82. Nuestro **umbral** está en -0.50.
El modelo la clasifica automáticamente como severidad Alta."

| # | Palabra clave | Alternativas | Frame | Animación |
|---|--------------|-------------|-------|-----------|
| 11 | **ANALYZE** | features, métricas | 3600 | Features aparecen |
| 12 | **Isolation Forest** | modelo, supervisado | 3860 | Label DETECT + score animado |
| 13 | **umbral** | severidad, Alta | 4080 | Alerta ALTA aparece |

> "Isolation Forest" son dos palabras — di ambas claramente en inglés.

---

## ESCENA 5 — Cloud & BTP · 2:40–3:20

> **Lee este texto:**

"Todo corre en SAP BTP **Cloud Foundry**. Dentro de la aplicación tenemos tres componentes:
el servidor FastAPI, el pipeline asyncio, y el modelo de ML."

"Hacia afuera, nos conectamos a SAP HANA Cloud usando un **connection pool**.
El Webhook de SAP recibe un POST por cada anomalía de alta severidad."

"El sistema lleva corriendo en BTP desde el 4 de **mayo** sin interrupciones."

| # | Palabra clave | Alternativas | Frame | Animación |
|---|--------------|-------------|-------|-----------|
| 14 | **Cloud Foundry** | BTP, corremos | 4800 | Contenedor BTP aparece |
| 15 | **connection pool** | HANA, latencia | 5060 | Conexiones externas |
| 16 | **mayo** | corriendo, interrupciones | 5300 | Badge Live en BTP |

> "Cloud Foundry" y "connection pool" — di en inglés, claro y pausado.

---

## ESCENA 6 — Flujo de Ataque Real · 3:20–4:00

> **Lee este texto:**

"Déjenme mostrarles el **flujo completo** de un ataque real."

"A t+0 milisegundos, la IP 192.168.4.77 genera **847** requests en un solo ciclo."

"A los 112ms, el extractor detecta error_rate de 0.73 y brute_force_score de 0.91.
A los 180ms, el Isolation Forest devuelve un score **negativo** de -0.82."

"Se genera el **Incident Report**, se dispara el Webhook,
y el registro queda persistido en HANA."

"**MTTD** total del pipeline: 245 milisegundos."

| # | Palabra clave | Alternativas | Frame | Animación |
|---|--------------|-------------|-------|-----------|
| 17 | **flujo completo** | ataque real | 6000 | Línea de tiempo aparece |
| 18 | **847** | requests, ciclo | 6080 | Paso t+0ms |
| 19 | **negativo** | score, 0.82 | 6320 | Paso t+180ms — score |
| 20 | **Incident Report** | Webhook, HANA | 6480 | Pasos t+210ms–t+241ms |
| 21 | **MTTD** | 245, total | 6750 | MTTD 245ms aparece |

> "MTTD" — deletrea las letras: em-te-te-de.

---

## ESCENA 7 — Dashboard · 4:00–4:30

> **Lee este texto:**

"El **dashboard** de operaciones corre en Streamlit y se actualiza cada 5 segundos."

"Abajo tenemos dos **gráficas** en tiempo real: anomalías por hora y evolución del score."

"Y el **feed** de logs en vivo muestra cada IP flaggeada con su score y nivel de severidad."

| # | Palabra clave | Alternativas | Frame | Animación |
|---|--------------|-------------|-------|-----------|
| 22 | **dashboard** | Streamlit, KPIs | 7200 | Dashboard + KPIs aparecen |
| 23 | **gráficas** | anomalías, evolución | 7400 | Gráficas aparecen |
| 24 | **feed** | analista, severidad | 7600 | Log feed aparece |

---

## ESCENA 8 — Impacto de Negocio · 4:30–5:00

> **Lee este texto:**

"¿Qué **significa** esto para SAP? Pasamos de 287 días a 245 milisegundos."

"Segundo, usamos aprendizaje no supervisado — el modelo no necesita ejemplos **etiquetados**."

"Tercero, corre **nativamente** en BTP, sin fricción."

"Menos tiempo detectando. Más tiempo **respondiendo**."

| # | Palabra clave | Alternativas | Frame | Animación |
|---|--------------|-------------|-------|-----------|
| 25 | **significa** | SAP, impacto | 8100 | Tarjeta MTTD aparece |
| 26 | **etiquetados** | supervisado, aprende | 8300 | Tarjeta no supervisado |
| 27 | **nativamente** | fricción, ecosistema | 8450 | Tarjeta nativo BTP |
| 28 | **respondiendo** | detectando, tiempo | 8700 | Frase final aparece |

---

## Después de grabar

Guarda el archivo como `persona1.mp4` y súbelo a Google Drive:
[https://drive.google.com/drive/folders/1wRCiAsws3_8QKuq7vitiQDOR9gP9tpXO?usp=drive_link](https://drive.google.com/drive/folders/1wRCiAsws3_8QKuq7vitiQDOR9gP9tpXO?usp=drive_link)

Pega el link de tu archivo en `drive-links.json` bajo `"persona1"` y luego:

```bash
cd ..
npm run render:full
```

---

## Consejos

### Si una keyword no se detecta
- Presiona **ESPACIO** para avanzar — nunca te quedas atascado
- Habla despacio y articulado en las palabras clave
- Agrega variantes en `teleprompter/src/keyword-map.ts` → campo `alternatives[]`

### OBS — Configuración recomendada
```
Resolución: 1920×1080 · FPS: 30 · Bitrate: 8000 Kbps CBR
Codificador: x264 o NVENC · Audio: 320 Kbps AAC, 48kHz
```
