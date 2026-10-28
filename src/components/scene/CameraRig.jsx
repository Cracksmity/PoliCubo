/**
 * CameraRig.jsx
 * Toda la lógica de cámara de PoliCubo:
 * - OrbitControls con autorrotación que se pausa al interactuar
 * - Órdenes del store: centrar vista y vistas predefinidas (3D, X–Y, X–Z, Y–Z)
 * - Viaje de la cámara al nodo seleccionado
 * - Distancia adaptada a pantallas verticales (móvil)
 * - Desplazamiento del encuadre para que el cubo quede en la zona visible
 *   cuando el panel o el test tapan parte de la pantalla
 */
import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

import { useStore } from '../../store';

/** Posiciones de cámara (antes de escalar) de cada vista predefinida */
const VIEWS = {
  iso: [2.8, 1.8, 2.8],
  xy: [0, 0, 4.3],       // Frontal: brújula política clásica (Económico × Social)
  xz: [0, 4.3, 0.001],   // Planta: Económico × Pluralidad
  yz: [-4.3, 0, 0],      // Lateral: Pluralidad × Social
};

const PANEL_WIDTH = 320;          // panel lateral (280px + márgenes)
const TEST_DOCK_MIN_WIDTH = 1100; // a partir de aquí el test se acopla a la izquierda
const MOBILE_SHEET_RATIO = 0.7;   // la hoja inferior ocupa el 70 % del alto

export default function CameraRig({ nodes }) {
  const controlsRef = useRef();
  const { camera, size } = useThree();

  const cameraCommand = useStore((s) => s.cameraCommand);
  const selectedId = useStore((s) => s.selectedId);
  const panelOpen = useStore((s) => s.panelOpen);
  const isMobile = useStore((s) => s.isMobile);
  const isTesting = useStore((s) => s.isTesting);

  // En pantallas verticales el campo de visión horizontal es estrecho:
  // alejamos la cámara para que el cubo quepa a lo ancho
  const camScale = THREE.MathUtils.clamp(0.8 / (size.width / size.height), 1, 1.8);
  const appliedCamScale = useRef(1);

  // Animación en curso: { position, target } hacia los que interpolar
  const flight = useRef(null);
  const resumeTimer = useRef(null);
  const viewOffset = useRef({ x: 0, y: 0 });

  const setAutoRotate = (on) => {
    if (controlsRef.current) controlsRef.current.autoRotate = on;
  };

  // Al cambiar la escala (montaje, giro del móvil) se ajusta solo la distancia, sin perder la vista
  useEffect(() => {
    const target = controlsRef.current ? controlsRef.current.target : new THREE.Vector3();
    camera.position.sub(target).multiplyScalar(camScale / appliedCamScale.current).add(target);
    appliedCamScale.current = camScale;
    controlsRef.current?.update();
  }, [camScale, camera]);

  // Órdenes de cámara: centrar o cambiar de vista
  useEffect(() => {
    if (!cameraCommand) return;
    const view = cameraCommand.type === 'reset' ? 'iso' : cameraCommand.view;
    const [x, y, z] = VIEWS[view] || VIEWS.iso;
    flight.current = {
      position: new THREE.Vector3(x, y, z).multiplyScalar(camScale),
      target: new THREE.Vector3(0, 0, 0),
    };
    // Solo la vista 3D rota sola; las vistas planas se quedan quietas para poder leerlas
    setAutoRotate(view === 'iso');
    // camScale se lee en el momento de la orden; no debe relanzarla
  }, [cameraCommand]);

  // Viaje al nodo seleccionado
  useEffect(() => {
    if (!selectedId) return;
    const node = nodes.find((n) => n.id === selectedId);
    if (!node) return;
    const pos = new THREE.Vector3(node.coords.x, node.coords.y, node.coords.z);
    // Prevención de vectores en cero que causan NaN
    const dir = pos.lengthSq() === 0 ? new THREE.Vector3(1, 0.4, 1) : pos.clone().normalize();
    // Siempre algo por encima del nodo: desde abajo el cubo se ve del revés
    dir.y = Math.max(dir.y, 0.35);
    dir.normalize();
    flight.current = {
      position: pos.clone().add(dir.multiplyScalar(2.5 * camScale)),
      target: pos,
    };
    setAutoRotate(false);
    // Solo al cambiar de selección (no cuando el nodo provisional se mueve)
  }, [selectedId]);

  useEffect(() => () => clearTimeout(resumeTimer.current), []);

  useFrame((state, delta) => {
    const controls = controlsRef.current;
    if (!controls) return;

    if (flight.current) {
      // Limitado a 1: con fotogramas lentos (pestaña en segundo plano, móvil modesto)
      // un factor > 1 sobrepasa el objetivo y la cámara sale disparada
      const t = Math.min(1, delta * 3);
      state.camera.position.lerp(flight.current.position, t);
      controls.target.lerp(flight.current.target, t);
      controls.update();
      if (state.camera.position.distanceTo(flight.current.position) < 0.02) flight.current = null;
    }

    // Encuadre: desplaza el centro de la imagen hacia la zona que queda libre
    let ox = 0;
    let oy = 0;
    if (isMobile) {
      if (panelOpen && !isTesting) oy = (size.height * MOBILE_SHEET_RATIO) / 2;
    } else {
      const right = panelOpen ? PANEL_WIDTH : 0;
      const left = isTesting && size.width >= TEST_DOCK_MIN_WIDTH ? Math.min(560, size.width * 0.44) + 24 : 0;
      ox = (right - left) / 2;
    }
    const k = Math.min(1, delta * 4);
    const off = viewOffset.current;
    off.x += (ox - off.x) * k;
    off.y += (oy - off.y) * k;
    if (Math.abs(off.x) < 0.5 && Math.abs(off.y) < 0.5 && ox === 0 && oy === 0) {
      if (camera.view?.enabled) camera.clearViewOffset();
    } else {
      camera.setViewOffset(size.width, size.height, off.x, off.y, size.width, size.height);
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      enablePan
      enableZoom
      enableRotate
      minDistance={1.2}
      maxDistance={5.5 * camScale}
      autoRotate
      autoRotateSpeed={0.4}
      // Se permite mirar desde arriba (vista X–Z); nunca voltear la vista por debajo
      minPolarAngle={0}
      maxPolarAngle={Math.PI * 0.72}
      // Paneo más lento para no sacar el cubo de la vista
      panSpeed={0.4}
      // Detener autorotación o animación al interactuar; reanudar 3 s después
      // solo si estamos en la vista 3D sin nada seleccionado
      onStart={() => {
        flight.current = null;
        clearTimeout(resumeTimer.current);
        setAutoRotate(false);
        // Rotar a mano saca de una vista plana: deja de marcarse como activa
        if (useStore.getState().activeView !== 'iso') useStore.setState({ activeView: 'custom' });
      }}
      onEnd={() => {
        clearTimeout(resumeTimer.current);
        resumeTimer.current = setTimeout(() => {
          const { activeView, selectedId: sel } = useStore.getState();
          if (activeView === 'iso' && !sel) setAutoRotate(true);
        }, 3000);
      }}
      dampingFactor={0.06}
      enableDamping
      target={[0, 0, 0]}
    />
  );
}
