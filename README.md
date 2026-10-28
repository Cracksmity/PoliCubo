<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset=".github/logo-dark.svg">
    <img src=".github/logo.svg" alt="PoliCubo" width="120">
  </picture>
</p>

# PoliticaCubo 3D 🧊
[![Deploy Status](https://img.shields.io/badge/Deploy-Live-success?style=for-the-badge&logo=vercel)](https://policubo.space/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

> Explora tu espectro político en un entorno 3D interactivo. Descubre, analiza y conversa sobre ideologías políticas con Inteligencia Artificial.

🌐 **Enlace al proyecto en vivo:** [https://policubo.space/](https://policubo.space/)

## 📖 Acerca del Proyecto

**PoliticaCubo** es una aplicación web interactiva que lleva el tradicional test de coordenadas políticas a una nueva dimensión. Utilizando tecnologías web 3D y procesamiento de lenguaje natural impulsado por IA, la plataforma permite a los usuarios descubrir su posición política en un cubo tridimensional, interactuar con un agente conversacional para profundizar en sus ideas, y visualizar el espectro ideológico de una manera completamente inmersiva.

**¿Qué problema resuelve?**
Tradicionalmente, los tests políticos son cuestionarios estáticos y bidimensionales. PoliticaCubo rompe esta barrera ofreciendo una experiencia dinámica donde la IA analiza tus respuestas de forma conversacional y te sitúa en un espacio 3D, facilitando una mejor comprensión de las complejas corrientes políticas modernas.

## 📑 Tabla de Contenidos
- [Características Principales](#-características-principales)
- [Tecnologías Utilizadas](#-tecnologías-utilizadas)
- [Instalación Local](#-instalación-local)
- [Cómo Contribuir](#-cómo-contribuir)
- [Licencia](#-licencia)

## ✨ Características Principales
- **Visualización 3D Interactiva**: Navega por el espectro político en un entorno tridimensional fluido, con vistas predefinidas (3D, la brújula clásica X–Y, X–Z e Y–Z).
- **50 corrientes de referencia** agrupadas en 9 familias (el color indica la familia), con ficha propia: descripción, referentes, corrientes más cercanas y relacionadas.
- **Exploración**: buscador sin tildes, filtros por familia y por rango en los tres ejes.
- **Tres modos de test**, y en todos tu punto se mueve por el cubo mientras respondes:
  - **Clásico**: 24 afirmaciones con escala de acuerdo. Rápido, gratis y sin IA.
  - **Guiado** (IA): situaciones cotidianas con opciones rápidas. Ideal para principiantes.
  - **Libre** (IA): argumenta de forma abierta tus posturas, o pega un manifiesto. Para expertos.
- **Resultado explicable**: la IA puntúa cada respuesta por eje con una confianza y la app calcula la media ponderada, así que puedes ver exactamente cómo se obtuvo tu posición. Incluye las corrientes más cercanas con su % de afinidad.
- **Compartir y comparar**: enlace con tus coordenadas (quien lo abre ve tu punto en su cubo), tarjeta en imagen descargable e historial de resultados guardado en tu navegador.
- **Interfaz Moderna y accesible**: responsiva (hoja inferior en móvil), *glassmorphism*, bloom, navegación con teclado y contraste AA.

## 🛠 Tecnologías Utilizadas

### Frontend
- **[React](https://react.dev/)**: Librería principal para la construcción de interfaces.
- **[Three.js](https://threejs.org/) & [React Three Fiber](https://docs.pmnd.rs/react-three-fiber)**: Motor de renderizado 3D y su integración declarativa en React.
- **[Vite](https://vitejs.dev/)**: Empaquetador y servidor de desarrollo ultrarrápido.

### Backend
- **[Node.js](https://nodejs.org/) & [Express](https://expressjs.com/)**: Servidor backend para gestionar la API y la comunicación con servicios externos.
- **[OpenAI API](https://openai.com/)**: Integración de modelos de lenguaje para el procesamiento de la lógica del bot conversacional.

## 🚀 Instalación Local

Sigue estos pasos para correr el proyecto en tu entorno local:

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/Cracksmity/PoliCubo.git
   cd PoliticaCubo
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar las variables de entorno**
   Asegúrate de que tienes tu archivo `.env` en la raíz del proyecto configurado.
   ```env
   OPENAI_API_KEY=tu_clave_de_api_aqui

   # Opcionales
   OPENAI_MODEL=gpt-6-luna        # modelo para los tests con IA
   OPENAI_TEMPERATURE=            # vacío = la del modelo (algunos solo admiten la de por defecto)
   RATE_LIMIT_MAX=40              # peticiones al test por IP cada 15 minutos
   TRUST_PROXY=loopback           # de quién fiarse para X-Forwarded-For (nginx en la misma máquina)
   PORT=3001
   ```
   Sin `OPENAI_API_KEY` la app funciona igual: el test clásico no usa IA y los modos con IA responden 503.

4. **Ejecutar el servidor de desarrollo**
   El proyecto utiliza `concurrently` para correr el frontend y el backend al mismo tiempo:
   ```bash
   npm run dev
   ```
   
5. **Abrir la aplicación**
   Visita la URL local que devuelva Vite (usualmente `http://localhost:5173`) en tu navegador.

## 🤝 Cómo Contribuir

¡Las contribuciones son bienvenidas! Si tienes ideas para mejorar la experiencia, corregir bugs o añadir nuevas funcionalidades:

1. Haz un Fork del proyecto.
2. Crea tu rama de características (`git checkout -b feature/NuevaCaracteristica`).
3. Haz commit de tus cambios (`git commit -m 'Añade una nueva característica'`).
4. Haz push a la rama (`git push origin feature/NuevaCaracteristica`).
5. Abre un Pull Request.

## 📄 Licencia

Este proyecto está bajo la Licencia [MIT](LICENSE). Siéntete libre de usar, modificar y distribuir el código.
