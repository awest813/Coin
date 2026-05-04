import { useEffect, useRef, useState } from 'react';
import {
  Engine,
  Scene,
  ArcRotateCamera,
  Vector3,
  HemisphericLight,
  DirectionalLight,
  PointLight,
  MeshBuilder,
  StandardMaterial,
  Color3,
  Color4,
  Camera,
  PointerEventTypes,
  ParticleSystem,
  Texture,
  Animation,
  type AbstractMesh,
} from '@babylonjs/core';
import { useGameStore, type ActiveScreen } from '~/store/gameStore';
import type { Mercenary } from '~/types/mercenary';

// ── Room layout config ────────────────────────────────────────────────────────

interface RoomCfg {
  pos: readonly [number, number, number];
  baseColor: readonly [number, number, number];
  emissiveHover: readonly [number, number, number];
  screen: ActiveScreen;
  label: string;
}

const ROOM_CFG: Record<string, RoomCfg> = {
  room_barracks: {
    pos: [-3.5, 0, -0.5],
    baseColor: [0.12, 0.12, 0.15],
    emissiveHover: [0.08, 0.05, 0.02],
    screen: 'roster',
    label: 'Barracks',
  },
  room_tavern: {
    pos: [0, 0, 2.5],
    baseColor: [0.15, 0.12, 0.12],
    emissiveHover: [0.12, 0.08, 0.04],
    screen: 'dashboard',
    label: 'Common Room',
  },
  room_forge: {
    pos: [3.5, 0, -0.5],
    baseColor: [0.12, 0.15, 0.12],
    emissiveHover: [0.15, 0.05, 0.01],
    screen: 'workshop',
    label: 'Forge',
  },
};

const HOVER_CARD_CLASS =
  'absolute left-4 top-4 max-w-xs rounded-3xl border border-white/10 bg-stone-950/40 p-6 text-xs text-stone-300 shadow-2xl backdrop-blur-xl pointer-events-none animate-in fade-in zoom-in-95 duration-300';

const ROOM_EFFECT_LABELS: Record<string, Record<string, (val: number) => string>> = {
  room_barracks: {
    rosterCap: (val) => `Roster cap: ${val} mercenaries`,
    recoveryBonus: (val) => (val > 0 ? `+${val} recovery speed` : 'Standard recovery'),
  },
  room_tavern: {
    moraleBonus: (val) => (val > 0 ? `+${val} morale after missions` : 'Morale stable'),
    eventChance: (val) => (val > 0 ? `+${val} event frequency` : 'Standard event rate'),
  },
  room_forge: {
    lootBonus: (val) => (val > 0 ? `+${val} extra loot on success` : 'Standard loot'),
    forgeLevel: (val) => `Forge level ${val}`,
  },
};

function roomEffectLabel(roomId: string, key: string, val: number): string {
  return ROOM_EFFECT_LABELS[roomId]?.[key]?.(val) ?? `${key}: ${val}`;
}

// ── Pawn state ───────────────────────────────────────────────────────────────

interface PawnData {
  mesh: AbstractMesh;
  target: Vector3;
  idleCountdown: number;
  homeRoomId: string;
  phase: number;
}

function buildPawns(
  scene: Scene,
  mercs: readonly Mercenary[],
  pawnsMap: Map<string, PawnData>,
): void {
  const roomIds = Object.keys(ROOM_CFG);

  mercs.forEach((merc, i) => {
    let homeRoomId: string;
    if (merc.isInjured) {
      homeRoomId = 'room_barracks';
    } else if (merc.isFatigued) {
      homeRoomId = 'room_tavern';
    } else {
      homeRoomId = roomIds[i % roomIds.length];
    }

    const cfg = ROOM_CFG[homeRoomId];
    if (!cfg) return;

    const startAngle = Math.random() * Math.PI * 2;
    const startR = Math.random() * 0.8;

    const mesh = MeshBuilder.CreateCapsule(
      `pawn_${merc.id}`,
      { height: 0.48, radius: 0.1, capSubdivisions: 5, subdivisions: 2 },
      scene,
    );
    mesh.position = new Vector3(
      cfg.pos[0] + Math.cos(startAngle) * startR,
      0.24,
      cfg.pos[2] + Math.sin(startAngle) * startR,
    );

    const mat = new StandardMaterial(`pawnMat_${merc.id}`, scene);
    if (merc.isInjured) {
      mat.diffuseColor = new Color3(0.78, 0.18, 0.18);
      mat.emissiveColor = new Color3(0.1, 0, 0);
    } else if (merc.isFatigued) {
      mat.diffuseColor = new Color3(0.72, 0.60, 0.10);
    } else {
      mat.diffuseColor = new Color3(0.28, 0.60, 0.28);
    }
    mat.specularColor = new Color3(0.05, 0.05, 0.05);
    mesh.material = mat;

    const tAngle = Math.random() * Math.PI * 2;
    const tR = Math.random() * 0.9;
    pawnsMap.set(merc.id, {
      mesh,
      target: new Vector3(
        cfg.pos[0] + Math.cos(tAngle) * tR,
        0.24,
        cfg.pos[2] + Math.sin(tAngle) * tR,
      ),
      idleCountdown: Math.random() * 2,
      homeRoomId,
      phase: Math.random() * Math.PI * 2,
    });
  });
}

// ── Particle Helpers ────────────────────────────────────────────────────────

function createForgeSmoke(scene: Scene, position: Vector3) {
  const particleSystem = new ParticleSystem("forgeSmoke", 200, scene);
  particleSystem.particleTexture = new Texture("https://www.babylonjs-playground.com/textures/cloud.png", scene);
  particleSystem.emitter = position;
  particleSystem.minEmitBox = new Vector3(-0.2, 0, -0.2);
  particleSystem.maxEmitBox = new Vector3(0.2, 0, 0.2);
  particleSystem.color1 = new Color4(0.2, 0.2, 0.2, 0.5);
  particleSystem.color2 = new Color4(0.1, 0.1, 0.1, 0.2);
  particleSystem.colorDead = new Color4(0, 0, 0, 0);
  particleSystem.minSize = 0.1;
  particleSystem.maxSize = 0.4;
  particleSystem.minLifeTime = 0.5;
  particleSystem.maxLifeTime = 1.5;
  particleSystem.emitRate = 30;
  particleSystem.gravity = new Vector3(0, 2, 0);
  particleSystem.direction1 = new Vector3(-0.5, 2, -0.5);
  particleSystem.direction2 = new Vector3(0.5, 2, 0.5);
  particleSystem.minAngularSpeed = 0;
  particleSystem.maxAngularSpeed = Math.PI;
  particleSystem.start();
  return particleSystem;
}

function createForgeSparks(scene: Scene, position: Vector3) {
  const ps = new ParticleSystem("forgeSparks", 100, scene);
  ps.particleTexture = new Texture("https://www.babylonjs-playground.com/textures/flare.png", scene);
  ps.emitter = position;
  ps.minEmitBox = new Vector3(-0.1, 0.5, -0.1);
  ps.maxEmitBox = new Vector3(0.1, 0.6, 0.1);
  ps.color1 = new Color4(1, 0.5, 0, 1);
  ps.color2 = new Color4(1, 0.2, 0, 1);
  ps.colorDead = new Color4(0, 0, 0, 0);
  ps.minSize = 0.02;
  ps.maxSize = 0.05;
  ps.minLifeTime = 0.1;
  ps.maxLifeTime = 0.3;
  ps.emitRate = 50;
  ps.gravity = new Vector3(0, -9.81, 0);
  ps.direction1 = new Vector3(-1, 4, -1);
  ps.direction2 = new Vector3(1, 6, 1);
  ps.start();
  return ps;
}

export function GuildScene() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<Engine | null>(null);
  const sceneRef = useRef<Scene | null>(null);
  const roomMeshesRef = useRef(new Map<string, AbstractMesh>());
  const roomMatsRef = useRef(new Map<string, StandardMaterial>());
  const pawnsRef = useRef(new Map<string, PawnData>());
  const hoveredRoomRef = useRef<string | null>(null);
  const [hoveredRoomId, setHoveredRoomId] = useState<string | null>(null);

  const { guild, mercenaries, setScreen } = useGameStore();
  const { currentWeather, unlockedPropIds } = guild;

  const hoveredRoom = hoveredRoomId
    ? guild.rooms.find((room) => room.id === hoveredRoomId)
    : null;
  const hoveredCfg = hoveredRoomId ? ROOM_CFG[hoveredRoomId] : null;
  const hoveredLevel = hoveredRoom
    ? hoveredRoom.levels[hoveredRoom.level - 1]
    : null;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const engine = new Engine(canvas, true, {
      preserveDrawingBuffer: false,
      stencil: false,
      antialias: true,
    });
    engineRef.current = engine;

    const scene = new Scene(engine);
    
    // Dynamic Clear Color
    const isNight = currentWeather === 'night' || currentWeather === 'storm';
    scene.clearColor = isNight ? new Color4(0.01, 0.01, 0.02, 1) : new Color4(0.04, 0.03, 0.03, 1);
    sceneRef.current = scene;

    // Isometric orthographic camera
    const camera = new ArcRotateCamera(
      'isoCam',
      -Math.PI / 4,
      Math.PI / 3,
      20,
      new Vector3(0, 0, 0.8),
      scene,
    );
    camera.mode = Camera.ORTHOGRAPHIC_CAMERA;
    camera.lowerAlphaLimit = camera.upperAlphaLimit = -Math.PI / 4;
    camera.lowerBetaLimit = camera.upperBetaLimit = Math.PI / 3;

    const updateOrtho = () => {
      const ratio = canvas.clientWidth / Math.max(canvas.clientHeight, 1);
      const half = 6.2;
      camera.orthoTop = half;
      camera.orthoBottom = -half;
      camera.orthoLeft = -half * ratio;
      camera.orthoRight = half * ratio;
    };
    updateOrtho();

    // Lighting
    const hemi = new HemisphericLight('hemi', new Vector3(0.2, 1, 0.4), scene);
    hemi.intensity = isNight ? 0.2 : 0.6;
    hemi.diffuse = isNight ? new Color3(0.5, 0.5, 0.8) : new Color3(1.0, 0.95, 0.85);
    hemi.groundColor = new Color3(0.1, 0.08, 0.06);

    const sun = new DirectionalLight('sun', new Vector3(-0.6, -1, 0.4), scene);
    sun.intensity = isNight ? 0.1 : 0.4;
    sun.diffuse = isNight ? new Color3(0.4, 0.4, 0.7) : new Color3(1.0, 0.9, 0.7);

    // Forge Pulse Light
    const forgeLight = new PointLight("forgeLight", new Vector3(3.5, 1, -0.5), scene);
    forgeLight.diffuse = new Color3(1, 0.4, 0.1);
    forgeLight.intensity = 0.8;
    
    // Tavern Glow
    const tavernLight = new PointLight("tavernLight", new Vector3(0, 1, 2.5), scene);
    tavernLight.diffuse = new Color3(1, 0.8, 0.2);
    tavernLight.intensity = 0.5;

    // Weather Particle Systems
    let weatherPS: ParticleSystem | null = null;
    if (currentWeather === 'rain' || currentWeather === 'storm') {
      weatherPS = new ParticleSystem("rain", 2000, scene);
      weatherPS.particleTexture = new Texture("https://www.babylonjs-playground.com/textures/flare.png", scene);
      weatherPS.emitter = new Vector3(0, 10, 0);
      weatherPS.minEmitBox = new Vector3(-10, 0, -10);
      weatherPS.maxEmitBox = new Vector3(10, 0, 10);
      weatherPS.color1 = new Color4(0.7, 0.8, 1, 0.3);
      weatherPS.minSize = 0.05;
      weatherPS.maxSize = 0.1;
      weatherPS.minLifeTime = 1;
      weatherPS.maxLifeTime = 1.5;
      weatherPS.emitRate = currentWeather === 'storm' ? 1000 : 500;
      weatherPS.gravity = new Vector3(0, -9.81, 0);
      weatherPS.direction1 = new Vector3(0, -1, 0);
      weatherPS.start();
    } else if (currentWeather === 'snow') {
      weatherPS = new ParticleSystem("snow", 1000, scene);
      weatherPS.particleTexture = new Texture("https://www.babylonjs-playground.com/textures/flare.png", scene);
      weatherPS.emitter = new Vector3(0, 10, 0);
      weatherPS.minEmitBox = new Vector3(-10, 0, -10);
      weatherPS.maxEmitBox = new Vector3(10, 0, 10);
      weatherPS.color1 = new Color4(1, 1, 1, 0.6);
      weatherPS.minSize = 0.05;
      weatherPS.maxSize = 0.15;
      weatherPS.minLifeTime = 2;
      weatherPS.maxLifeTime = 4;
      weatherPS.emitRate = 200;
      weatherPS.gravity = new Vector3(0, -1, 0);
      weatherPS.direction1 = new Vector3(-1, -1, -1);
      weatherPS.direction2 = new Vector3(1, -1, 1);
      weatherPS.start();
    }

    // Render Custom Props
    unlockedPropIds.forEach(propId => {
      const prop = DIORAMA_PROPS.find(p => p.id === propId);
      if (!prop) return;
      
      let mesh;
      if (prop.modelType === 'statue') {
        mesh = MeshBuilder.CreateBox(prop.id, { size: 0.8 }, scene);
      } else if (prop.modelType === 'pit') {
        mesh = MeshBuilder.CreateCylinder(prop.id, { diameter: 1.5, height: 0.1 }, scene);
      } else {
        mesh = MeshBuilder.CreateSphere(prop.id, { diameter: 0.6 }, scene);
      }
      mesh.position = new Vector3(...prop.position);
      const mat = new StandardMaterial(prop.id + "Mat", scene);
      mat.diffuseColor = isNight ? new Color3(0.2, 0.2, 0.3) : new Color3(0.4, 0.4, 0.4);
      mesh.material = mat;
    });

    // Ground
    const ground = MeshBuilder.CreateGround('ground', { width: 14, height: 12 }, scene);
    ground.position = new Vector3(0, -0.01, 0.8);
    const groundMat = new StandardMaterial('groundMat', scene);
    groundMat.diffuseColor = new Color3(0.12, 0.09, 0.07);
    groundMat.specularColor = Color3.Black();
    ground.material = groundMat;

    // Grid lines for premium feel
    const gridLines = MeshBuilder.CreateGround('grid', { width: 14, height: 12, subdivisions: 14 }, scene);
    gridLines.position = new Vector3(0, 0, 0.8);
    const gridMat = new StandardMaterial('gridMat', scene);
    gridMat.diffuseColor = new Color3(1, 1, 1);
    gridMat.alpha = 0.03;
    gridMat.wireframe = true;
    gridLines.material = gridMat;

    const mats = roomMatsRef.current;
    const pawns = pawnsRef.current;

    // ── Per-frame animation ───────────────────────────────────────────────
    scene.onBeforeRenderObservable.add(() => {
      const dt = engine.getDeltaTime() / 1000;
      const t = performance.now() / 1000;

      // Pulse Forge light
      forgeLight.intensity = 0.6 + Math.sin(t * 3) * 0.4;
      tavernLight.intensity = 0.4 + Math.sin(t * 1.5) * 0.15;

      for (const [, pawn] of pawns) {
        if (pawn.idleCountdown > 0) {
          pawn.idleCountdown -= dt;
          pawn.mesh.position.y = 0.24 + Math.sin(t * 2.5 + pawn.phase) * 0.02;
          continue;
        }

        const pos = pawn.mesh.position;
        const tgt = pawn.target;
        const dx = tgt.x - pos.x;
        const dz = tgt.z - pos.z;
        const dist = Math.sqrt(dx * dx + dz * dz);

        if (dist < 0.06) {
          pawn.idleCountdown = 1.5 + Math.random() * 3;
          const cfg = ROOM_CFG[pawn.homeRoomId];
          if (cfg) {
            const a = Math.random() * Math.PI * 2;
            const rad = Math.random() * 1.2;
            pawn.target = new Vector3(
              cfg.pos[0] + Math.cos(a) * rad,
              0.24,
              cfg.pos[2] + Math.sin(a) * rad,
            );
          }
        } else {
          const step = Math.min(1.4 * dt, dist);
          pos.x += (dx / dist) * step;
          pos.z += (dz / dist) * step;
          pos.y = 0.24;
          pawn.mesh.rotation.y = Math.atan2(dx, dz);
        }
      }
    });

    // ── Hover & click picking ─────────────────────────────────────────────
    scene.onPointerObservable.add((info) => {
      const pick = scene.pick(scene.pointerX, scene.pointerY);
      const hitRoomId: string | null =
        pick.hit && pick.pickedMesh?.metadata?.type === 'room'
          ? (pick.pickedMesh.metadata.roomId as string)
          : null;

      if (info.type === PointerEventTypes.POINTERMOVE) {
        const prev = hoveredRoomRef.current;
        if (prev !== hitRoomId) {
          if (prev) {
            const m = mats.get(prev);
            if (m) m.emissiveColor = Color3.Black();
          }
          if (hitRoomId) {
            const cfg = ROOM_CFG[hitRoomId];
            const m = mats.get(hitRoomId);
            if (m && cfg) m.emissiveColor = new Color3(...cfg.emissiveHover);
          }
          hoveredRoomRef.current = hitRoomId;
          setHoveredRoomId(hitRoomId);
          canvas.style.cursor = hitRoomId ? 'pointer' : 'default';
        }
      }

      if (info.type === PointerEventTypes.POINTERTAP && hitRoomId) {
        const cfg = ROOM_CFG[hitRoomId];
        if (cfg) setScreen(cfg.screen);
      }
    });

    const handleResize = () => {
      engine.resize();
      updateOrtho();
    };
    window.addEventListener('resize', handleResize);

    engine.runRenderLoop(() => scene.render());

    // Particles for Forge
    const forgePos = new Vector3(...ROOM_CFG.room_forge.pos);
    const smoke = createForgeSmoke(scene, forgePos.add(new Vector3(0.6, 1.2, 0.6)));
    const sparks = createForgeSparks(scene, forgePos.add(new Vector3(0, 0, 0)));

    return () => {
      window.removeEventListener('resize', handleResize);
      smoke.stop();
      sparks.stop();
      if (weatherPS) weatherPS.stop();
      scene.dispose();
      engine.dispose();
      engineRef.current = null;
      sceneRef.current = null;
      mats.clear();
      pawns.clear();
      hoveredRoomRef.current = null;
    };
  }, [setScreen, currentWeather, unlockedPropIds]);

  // ── Room Buildings & Upgrade Props ───────────────────────────────────────
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;
    const roomMeshes = roomMeshesRef.current;
    const roomMats = roomMatsRef.current;

    for (const room of guild.rooms) {
      const cfg = ROOM_CFG[room.id];
      if (!cfg) continue;
      const bHeight = 0.8 + room.level * 0.4;

      let bldg = roomMeshes.get(room.id);
      if (!bldg) {
        // Create Building Base
        bldg = MeshBuilder.CreateBox(`bldg_${room.id}`, { width: 2.6, height: 1, depth: 2.6 }, scene);
        bldg.position = new Vector3(cfg.pos[0], bHeight / 2, cfg.pos[2]);
        bldg.metadata = { type: 'room', roomId: room.id };

        const mat = new StandardMaterial(`mat_${room.id}`, scene);
        mat.diffuseColor = new Color3(...cfg.baseColor);
        mat.specularColor = new Color3(0.1, 0.1, 0.1);
        bldg.material = mat;
        roomMeshes.set(room.id, bldg);
        roomMats.set(room.id, mat);

        // Roof
        const roof = MeshBuilder.CreateBox(`roof_${room.id}`, { width: 2.8, height: 0.15, depth: 2.8 }, scene);
        roof.position = new Vector3(cfg.pos[0], bHeight + 0.075, cfg.pos[2]);
        roof.metadata = { type: 'room', roomId: room.id };
        const roofMat = new StandardMaterial(`roofMat_${room.id}`, scene);
        const [r, g, b] = cfg.baseColor;
        roofMat.diffuseColor = new Color3(r * 0.7, g * 0.7, b * 0.7);
        roof.material = roofMat;

        // Add Level Indicators (Windows)
        for (let l = 1; l <= room.maxLevel; l++) {
          const window = MeshBuilder.CreatePlane(`win_${room.id}_${l}`, { size: 0.3 }, scene);
          window.position = new Vector3(
            cfg.pos[0] + (l % 2 === 0 ? 1.31 : -1.31), 
            0.5 + (l * 0.4), 
            cfg.pos[2] + (l > 2 ? 0.5 : -0.5)
          );
          window.rotation.y = l % 2 === 0 ? Math.PI / 2 : -Math.PI / 2;
          const winMat = new StandardMaterial(`winMat_${room.id}_${l}`, scene);
          winMat.emissiveColor = new Color3(1, 0.8, 0.2);
          winMat.alpha = 0.1;
          window.material = winMat;
          window.parent = bldg;
          window.setEnabled(room.level >= l);
        }

        // Room Props (Level 2+)
        if (room.id === 'room_barracks') {
          const dummy = MeshBuilder.CreateCylinder("dummy", { height: 0.6, diameter: 0.2 }, scene);
          dummy.position = new Vector3(cfg.pos[0] - 1.8, 0.3, cfg.pos[2]);
          const dummyMat = new StandardMaterial("dummyMat", scene);
          dummyMat.diffuseColor = new Color3(0.4, 0.3, 0.2);
          dummy.material = dummyMat;
          dummy.setEnabled(room.level >= 2);
        }
      }

      // Update geometry for existing buildings
      bldg.scaling.y = bHeight;
      bldg.position.y = bHeight / 2;
      const roof = scene.getMeshByName(`roof_${room.id}`);
      if (roof) roof.position.y = bHeight + 0.075;
      
      // Update Props visibility
      for (let l = 1; l <= room.maxLevel; l++) {
        const win = scene.getMeshByName(`win_${room.id}_${l}`);
        if (win) win.setEnabled(room.level >= l);
      }
      
      const dummy = scene.getMeshByName("dummy");
      if (dummy && room.id === 'room_barracks') dummy.setEnabled(room.level >= 2);

      // Add a Banner for high level rooms
      if (room.level >= 3 && !scene.getMeshByName(`banner_${room.id}`)) {
        const banner = MeshBuilder.CreateBox(`banner_${room.id}`, { width: 0.1, height: 1.2, depth: 0.6 }, scene);
        banner.position = new Vector3(cfg.pos[0] + 1.4, bHeight - 0.5, cfg.pos[2]);
        const banMat = new StandardMaterial(`banMat_${room.id}`, scene);
        banMat.diffuseColor = new Color3(0.8, 0.1, 0.1);
        banner.material = banMat;
      }
    }
  }, [guild.rooms]);

  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;
    const pawns = pawnsRef.current;
    for (const [, pawn] of pawns) pawn.mesh.dispose();
    pawns.clear();
    buildPawns(scene, mercenaries, pawns);
  }, [mercenaries]);

  return (
    <div className="relative group/scene">
      <canvas
        ref={canvasRef}
        className="w-full h-[420px] block touch-none cursor-default transition-opacity duration-1000"
      />
      
      {/* Dynamic Overlay Info */}
      <div className={HOVER_CARD_CLASS}>
        {hoveredRoom && hoveredCfg && hoveredLevel ? (
          <div className="animate-in fade-in slide-in-from-left-4 duration-500">
            <div className="flex items-center gap-3 mb-4">
              <div className="text-3xl filter drop-shadow-lg">{hoveredRoom.icon}</div>
              <div>
                <h3 className="text-lg font-bold text-white font-heading tracking-tight">
                  {hoveredRoom.name}
                </h3>
                <div className="text-[10px] text-primary font-black uppercase tracking-widest">
                  Tier {hoveredRoom.level} Installation
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-stone-400 italic font-serif leading-relaxed">
                "Modernized facilities ensure maximum efficiency in guild operations."
              </p>
              
              <div className="space-y-2">
                <div className="text-[10px] text-stone-500 font-bold uppercase tracking-widest border-b border-white/5 pb-1">Active Protocols</div>
                <ul className="space-y-1.5">
                  {Object.entries(hoveredLevel.effects).map(([key, val]) => (
                    <li key={key} className="flex items-center gap-2 text-emerald-400 font-bold uppercase text-[9px] tracking-tighter">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                      {roomEffectLabel(hoveredRoom.id, key, val)}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-4 border-t border-white/5 text-[9px] text-stone-600 font-bold uppercase tracking-[0.2em] animate-pulse">
                Click to manage facility
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-4">
            <div className="text-stone-500 font-black uppercase tracking-[0.3em] text-[10px] mb-1">Guild Enclave</div>
            <div className="text-stone-600 italic font-serif">Surveying facilities...</div>
          </div>
        )}
      </div>
    </div>
  );
}
