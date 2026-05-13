# Cómo subir tu video a Google Drive

> Guía para cada miembro del equipo TPs_data.

---

## 1. Graba tu segmento

Usa el teleprompter en `http://localhost:3001` (Chrome únicamente).

Graba **solo tu cara** con tu cámara mientras lees el guion.
El teleprompter avanza las animaciones automáticamente al detectar tus palabras clave.

**Escenas por persona:**

| Persona | Rol | Escenas |
|---------|-----|---------|
| Persona 1 | AI & ML Engineer | 3, 4 |
| Persona 2 | Cloud Integration | 5 |
| Persona 3 | Project Manager | 1, 2, 8 |
| Persona 4 | Frontend Engineer | 7 |
| Persona 5 | Backend Engineer | 6 |

Consulta `RECORDING_GUIDE.md` para el guion completo y las palabras clave de tu escena.

---

## 2. Guarda el archivo

Nombra tu archivo **exactamente así** (sin cambiar el nombre):

```
Persona 1  →  persona1.mp4
Persona 2  →  persona2.mp4
Persona 3  →  persona3.mp4
Persona 4  →  persona4.mp4
Persona 5  →  persona5.mp4
```

El nombre importa — el script de descarga lo usa para colocarlo en el lugar correcto.

---

## 3. Súbelo a Google Drive

- Abre la carpeta compartida del equipo en Google Drive:

  > **https://drive.google.com/drive/folders/1wRCiAsws3_8QKuq7vitiQDOR9gP9tpXO?usp=drive_link**

- Sube tu archivo `personaN.mp4` a esa carpeta.

---

## 4. Obtén el link compartido

1. Click derecho en tu archivo en Google Drive → **"Obtener enlace"**
2. Cambia los permisos a **"Cualquier persona con el enlace puede ver"**
3. Copia el enlace generado

El link se ve así:
```
https://drive.google.com/file/d/1AbCdEfGhIjKlMnOpQ.../view?usp=sharing
```

---

## 5. Pega tu link en drive-links.json

Abre `video/drive-links.json` en el repositorio y pega tu link en el campo
`"drive_url"` de tu persona:

```json
{
  "persona1": {
    "name": "Persona 1 — AI & ML Engineer",
    "scenes": "3, 4",
    "drive_url": "https://drive.google.com/file/d/TU_ID_AQUI/view?usp=sharing"
  },
  ...
}
```

Haz **commit y push** de `drive-links.json`. El archivo solo contiene URLs,
no datos grandes — sí va al repositorio.

---

## 6. Para renderizar el video final

Una vez que **todos** han subido sus links a `drive-links.json`:

```bash
cd video
pip install gdown rich      # solo la primera vez
npm run render:full         # descarga + renderiza
```

O por pasos separados:

```bash
npm run download            # solo descarga los MP4s desde Drive
npm run build               # solo renderiza (requiere los MP4s ya descargados)
```

### ¿Qué hace `npm run download`?

1. Lee `drive-links.json` y muestra el estado de cada persona
2. Descarga los MP4s faltantes a `public/videos/`
3. Verifica tamaño y duración de cada archivo
4. Indica si el proyecto está listo para renderizar

---

## Solución de problemas

### "El archivo no se descargó o está vacío"
- Verifica que los permisos del archivo en Drive sean **"Cualquier persona con el enlace puede ver"**
- El link debe ser del archivo directamente, no de la carpeta

### "Error: no-such-file"
- Asegúrate de correr el comando desde la carpeta `video/`
- Verifica que `drive-links.json` exista y tenga JSON válido

### El script descarga pero el video no se ve en Remotion
- El archivo debe ser `.mp4` con códec H.264
- Usa OBS para exportar — por defecto ya exporta en el formato correcto

### ffprobe no está instalado
No es necesario para descargar. Solo sirve para mostrar la duración en el
reporte final. Instala con:
```bash
# macOS
brew install ffmpeg

# Ubuntu/Debian
sudo apt install ffmpeg

# Windows — descarga de https://ffmpeg.org/download.html
```
