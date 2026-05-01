import { useEffect, useRef, useState } from 'react';
import {
  Engine,
  Scene,
  ArcRotateCamera,
  Vector3,
  HemisphericLight,
  DirectionalLight,
  MeshBuilder,
  StandardMaterial,
  Color3,
  Color4,
  Camera,
  PointerEventTypes,
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
    pos: [-3, 0, -0.5],
    baseColor: [0.22, 0.38, 0.52],
    emissiveHover: [0.06, 0.12, 0.18],
    screen: 'roster',
    label: 'Barracks',
  },
  room_tavern: {
    pos: [0, 0, 2.2],
    baseColor: [0.44, 0.24, 0.08],
    emissiveHover: [0.16, 0.08, 0.02],
    screen: 'dashboard',
    label: 'Common Room',
  },
  room_forge: {
    pos: [3, 0, -0.5],
    baseColor: [0.52, 0.16, 0.06],
    emissiveHover: [0.18, 0.05, 0.01],
    screen: 'workshop',
    label: 'Forge',
  },
};

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

// ── Pawn state (stored in ref, not React state) ───────────────────────────────

interface PawnData {
  mesh: AbstractMesh;
  target: Vector3;
  idleCountdown: number;
  homeRoomId: string;
  phase: number;
}

// ── Helper: build pawn meshes from mercenaries ────────────────────────────────

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

// ── Component ─────────────────────────────────────────────────────────────────

export function GuildScene() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<Engine | null>(null);
  const sceneRef = useRef<Scene | null>(null);
  // These Maps are mutated by the rooms/mercs effects; the init effect captures
  // the same Map reference so handlers always see the latest meshes/materials.
  const roomMeshesRef = useRef(new Map<string, AbstractMesh>());
  const roomMatsRef = useRef(new Map<string, StandardMaterial>());
  const pawnsRef = useRef(new Map<string, PawnData>());
  const hoveredRoomRef = useRef<string | null>(null);
  const [hoveredRoomId, setHoveredRoomId] = useState<string | null>(null);

  const { guild, mercenaries, setScreen } = useGameStore();
  const hoveredRoom = hoveredRoomId
    ? guild.rooms.find((room) => room.id === hoveredRoomId)
    : null;
  const hoveredCfg = hoveredRoomId ? ROOM_CFG[hoveredRoomId] : null;
  const hoveredLevel = hoveredRoom
    ? hoveredRoom.levels[hoveredRoom.level - 1]
    : null;

  // ── Infrastructure init: engine / scene / camera / lights / handlers ──────
  // setScreen is a Zustand action with a stable identity, so this effect runs
  // exactly once per mount (same as []).  We list it in deps so the linter and
  // React Compiler are satisfied.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const engine = new Engine(canvas, true, {
      preserveDrawingBuffer: false,
      stencil: false,
    });
    engineRef.current = engine;

    const scene = new Scene(engine);
    scene.clearColor = new Color4(0.07, 0.05, 0.04, 1);
    sceneRef.current = scene;

    // Isometric orthographic camera
    const camera = new ArcRotateCamera(
      'isoCam',
      -Math.PI / 4,
      Math.PI / 3,
      20,
      new Vector3(0, 0, 0.6),
      scene,
    );
    camera.mode = Camera.ORTHOGRAPHIC_CAMERA;

    // Lock the camera angle so the scene stays isometric
    camera.lowerAlphaLimit = -Math.PI / 4;
    camera.upperAlphaLimit = -Math.PI / 4;
    camera.lowerBetaLimit = Math.PI / 3;
    camera.upperBetaLimit = Math.PI / 3;

    const updateOrtho = () => {
      const ratio = canvas.clientWidth / Math.max(canvas.clientHeight, 1);
      const half = 5.8;
      camera.orthoTop = half;
      camera.orthoBottom = -half;
      camera.orthoLeft = -half * ratio;
      camera.orthoRight = half * ratio;
    };
    updateOrtho();

    // Lighting
    const hemi = new HemisphericLight('hemi', new Vector3(0.2, 1, 0.4), scene);
    hemi.intensity = 0.85;
    hemi.diffuse = new Color3(1.0, 0.94, 0.82);
    hemi.groundColor = new Color3(0.18, 0.13, 0.09);

    const sun = new DirectionalLight('sun', new Vector3(-0.6, -1, 0.4), scene);
    sun.intensity = 0.55;
    sun.diffuse = new Color3(1.0, 0.88, 0.68);

    // Ground
    const ground = MeshBuilder.CreateGround(
      'ground',
      { width: 13, height: 11 },
      scene,
    );
    ground.position = new Vector3(0, -0.01, 0.6);
    const groundMat = new StandardMaterial('groundMat', scene);
    groundMat.diffuseColor = new Color3(0.14, 0.11, 0.09);
    groundMat.specularColor = Color3.Black();
    ground.material = groundMat;

    // Capture the Maps by reference — rooms/mercs effects will populate them
    const mats = roomMatsRef.current;
    const pawns = pawnsRef.current;

    // ── Per-frame animation ───────────────────────────────────────────────
    scene.onBeforeRenderObservable.add(() => {
      const dt = engine.getDeltaTime() / 1000;
      const t = performance.now() / 1000;

      for (const [, pawn] of pawns) {
        if (pawn.idleCountdown > 0) {
          pawn.idleCountdown -= dt;
          pawn.mesh.position.y = 0.24 + Math.sin(t * 2.2 + pawn.phase) * 0.018;
          continue;
        }

        const pos = pawn.mesh.position;
        const tgt = pawn.target;
        const dx = tgt.x - pos.x;
        const dz = tgt.z - pos.z;
        const dist = Math.sqrt(dx * dx + dz * dz);

        if (dist < 0.06) {
          pawn.idleCountdown = 1.5 + Math.random() * 2.5;
          const cfg = ROOM_CFG[pawn.homeRoomId];
          if (cfg) {
            const a = Math.random() * Math.PI * 2;
            const rad = Math.random() * 0.9;
            pawn.target = new Vector3(
              cfg.pos[0] + Math.cos(a) * rad,
              0.24,
              cfg.pos[2] + Math.sin(a) * rad,
            );
          }
        } else {
          const step = Math.min(1.2 * dt, dist);
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

    // ── Resize ────────────────────────────────────────────────────────────
    const handleResize = () => {
      engine.resize();
      updateOrtho();
    };
    window.addEventListener('resize', handleResize);

    engine.runRenderLoop(() => scene.render());

    return () => {
      window.removeEventListener('resize', handleResize);
      scene.dispose();
      engine.dispose();
      engineRef.current = null;
      sceneRef.current = null;
      mats.clear();
      pawns.clear();
      hoveredRoomRef.current = null;
    };
  }, [setScreen]);

  // ── Create / update room buildings when guild.rooms changes ───────────────
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;
    const roomMeshes = roomMeshesRef.current;
    const roomMats = roomMatsRef.current;

    for (const room of guild.rooms) {
      const cfg = ROOM_CFG[room.id];
      if (!cfg) continue;
      const bHeight = 0.65 + room.level * 0.35;

      let bldg = roomMeshes.get(room.id);
      if (!bldg) {
        // First time: create building body + roof
        bldg = MeshBuilder.CreateBox(
          `bldg_${room.id}`,
          { width: 2.3, height: 1, depth: 2.3 },
          scene,
        );
        bldg.position = new Vector3(cfg.pos[0], bHeight / 2, cfg.pos[2]);
        bldg.metadata = { type: 'room', roomId: room.id };

        const mat = new StandardMaterial(`mat_${room.id}`, scene);
        mat.diffuseColor = new Color3(...cfg.baseColor);
        mat.specularColor = new Color3(0.08, 0.08, 0.08);
        bldg.material = mat;
        roomMeshes.set(room.id, bldg);
        roomMats.set(room.id, mat);

        const roof = MeshBuilder.CreateBox(
          `roof_${room.id}`,
          { width: 2.5, height: 0.11, depth: 2.5 },
          scene,
        );
        roof.position = new Vector3(cfg.pos[0], bHeight + 0.055, cfg.pos[2]);
        roof.metadata = { type: 'room', roomId: room.id };
        const [r, g, b] = cfg.baseColor;
        const roofMat = new StandardMaterial(`roofMat_${room.id}`, scene);
        roofMat.diffuseColor = new Color3(r * 0.65, g * 0.65, b * 0.65);
        roofMat.specularColor = Color3.Black();
        roof.material = roofMat;
      }

      // Always sync height (handles upgrades)
      bldg.scaling.y = bHeight;
      bldg.position.y = bHeight / 2;
      const roof = scene.getMeshByName(`roof_${room.id}`);
      if (roof) roof.position.y = bHeight + 0.055;
    }
  }, [guild.rooms]);

  // ── Rebuild pawns when mercenaries change ────────────────────────────────
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;
    const pawns = pawnsRef.current;

    for (const [, pawn] of pawns) {
      pawn.mesh.dispose();
    }
    pawns.clear();

    buildPawns(scene, mercenaries, pawns);
  }, [mercenaries]);

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        style={{ width: '100%', height: '360px', display: 'block', touchAction: 'none' }}
      />
      <div
        role="status"
        aria-live="polite"
        className="absolute left-3 top-3 max-w-xs rounded-lg border border-stone-700 bg-stone-950/85 px-3 py-2 text-xs text-stone-300 shadow-lg backdrop-blur-sm pointer-events-none"
      >
        {hoveredRoom && hoveredCfg && hoveredLevel ? (
          <>
            <div className="text-sm font-semibold text-amber-300">
              {hoveredRoom.icon} {hoveredRoom.name}
            </div>
            <div className="mt-0.5 text-stone-400">
              Level {hoveredRoom.level}/{hoveredRoom.maxLevel} · click to open {hoveredCfg.label}
            </div>
            <ul className="mt-2 space-y-0.5 text-emerald-400">
              {Object.entries(hoveredLevel.effects).map(([key, val]) => (
                <li key={key}>{roomEffectLabel(hoveredRoom.id, key, val)}</li>
              ))}
            </ul>
          </>
        ) : (
          <>
            <div className="text-sm font-semibold text-amber-300">Guildhall</div>
            <div className="mt-0.5 text-stone-400">Hover a room for details, click to navigate.</div>
          </>
        )}
      </div>
    </div>
  );
}
