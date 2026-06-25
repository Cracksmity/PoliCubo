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
- **Visualización 3D Interactiva**: Navega por el espectro político en un entorno tridimensional fluido.
- **Agente Conversacional con IA**: Realiza el test interactuando con un bot inteligente (potenciado por OpenAI) que analiza tus posturas políticas.
- **Resultados Dinámicos**: Ubicación precisa en los ejes políticos (Económico, Social, Autoritarismo/Libertarismo).
- **Interfaz Moderna**: Diseño minimalista, responsivo y fácil de usar.

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
   # Otras variables necesarias
   ```

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
