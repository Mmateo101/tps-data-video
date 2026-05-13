# TPs_data Teleprompter

Sincroniza automáticamente las animaciones de Remotion con la narración en vivo usando la Web Speech API del navegador.

## Setup

```bash
cd video/teleprompter
npm install
```

## Uso

```bash
npm run dev
```

Abre **http://localhost:3001** en Chrome
> Solo funciona en Chrome — la Web Speech API no está disponible en otros navegadores.

## Flujo de grabación

1. Abre el teleprompter en Chrome (`http://localhost:3001`)
2. Abre OBS — captura pantalla completa (1920×1080)
3. Agrega tu cámara como fuente separada en OBS
4. Click **"🎤 Iniciar escucha"** en el teleprompter
5. Lee el script. Las animaciones avanzan solas al detectar las palabras clave.
6. Click **"⏹ Detener"** al terminar
7. Exporta el video desde OBS

## Controles

| Botón | Acción |
|-------|--------|
| ← Anterior | Retrocede al trigger anterior y hace seek |
| ▶ Play / ⏸ Pausa | Reproduce o pausa la animación |
| Siguiente → | Avanza al siguiente trigger |
| 🎤 Iniciar escucha | Activa el reconocimiento de voz |
| ⏹ Detener | Detiene el micrófono y pausa el player |

## Ajuste de keywords

Si una palabra no se detecta bien, edita `src/keyword-map.ts` y agrega variaciones al array `alternatives[]`.

```ts
{
  keyword: 'Isolation Forest',
  alternatives: ['modelo', 'no supervisado', 'aislamiento'],  // ← agrega aquí
  ...
}
```

El español de México puede variar — prueba con variaciones fonéticas si hay falsos negativos (e.g. "aizolation" → agrega como alternativa).

## Notas técnicas

- Web Speech API requiere Chrome y micrófono activo
- El reconocimiento funciona offline después de la primera carga en Chrome
- `lang: 'es-MX'` optimizado para español mexicano
- La detección incluye resultados intermedios (no espera a que termines la oración) para latencia < 400ms
- Un trigger no puede volver a dispararse dentro de 3 segundos (guard anti-falso-positivo)
- Se permiten hasta 2 triggers de lookahead para permitir detecciones ligeramente fuera de orden
