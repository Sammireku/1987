import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { FurnitureItem, MaterialOption } from '../types/furniture';

interface ThreeCanvasProps {
  product: FurnitureItem;
  woodMaterial: MaterialOption;
  fabricMaterial: MaterialOption;
  metalMaterial: MaterialOption;
  customWidthCm: number;
  customDepthCm: number;
  customHeightCm: number;
  showDimensions?: boolean;
  explodedAmount?: number; // 0 to 1
  wireframeMode?: boolean;
  autoRotate?: boolean;
  cameraPreset?: string;
  onCameraPresetChange?: (preset: string) => void;
  className?: string;
  isARMode?: boolean;
  contactShadowEnabled?: boolean;
  lightIntensity?: number;
  canvasId?: string;
}

export const ThreeCanvas: React.FC<ThreeCanvasProps> = ({
  product,
  woodMaterial,
  fabricMaterial,
  metalMaterial,
  customWidthCm,
  customDepthCm,
  customHeightCm,
  showDimensions = false,
  explodedAmount = 0,
  wireframeMode = false,
  autoRotate = false,
  cameraPreset = 'perspective',
  onCameraPresetChange,
  className = '',
  isARMode = false,
  contactShadowEnabled = true,
  lightIntensity = 1.0,
  canvasId,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const rootGroupRef = useRef<THREE.Group | null>(null);
  const furnitureGroupRef = useRef<THREE.Group | null>(null);
  const dimensionsGroupRef = useRef<THREE.Group | null>(null);
  const shadowMeshRef = useRef<THREE.Mesh | null>(null);
  const keyLightRef = useRef<THREE.DirectionalLight | null>(null);
  const fillLightRef = useRef<THREE.DirectionalLight | null>(null);
  const rimLightRef = useRef<THREE.DirectionalLight | null>(null);
  const ambientLightRef = useRef<THREE.HemisphereLight | null>(null);
  const requestRef = useRef<number | null>(null);

  // Interaction state
  const isDraggingRef = useRef(false);
  const isPanningRef = useRef(false);
  const prevPointerPosition = useRef({ x: 0, y: 0 });
  const cameraRotation = useRef({ theta: Math.PI / 4, phi: Math.PI / 6, radius: 3.2 });
  const cameraTarget = useRef(new THREE.Vector3(0, 0.45, 0));

  const [activeCameraPreset, setActiveCameraPreset] = useState<string>('iso');

  // Helper to generate dynamic wood texture with grain
  const createWoodTexture = useCallback((hexColor: string) => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = hexColor;
      ctx.fillRect(0, 0, 512, 512);

      // Fine grain lines
      ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
      for (let i = 0; i < 512; i += 3) {
        const h = Math.sin(i * 0.05) * 4;
        ctx.fillRect(0, i + h, 512, 1.2);
      }

      // Medullary rays and subtle grain variations
      ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
      for (let j = 0; j < 30; j++) {
        const y = Math.random() * 512;
        ctx.fillRect(0, y, 512, Math.random() * 8 + 2);
      }
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(2, 2);
    return texture;
  }, []);

  // Helper to generate fabric weave bump texture
  const createFabricBumpTexture = useCallback(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#808080';
      ctx.fillRect(0, 0, 256, 256);

      ctx.fillStyle = '#A0A0A0';
      for (let x = 0; x < 256; x += 4) {
        for (let y = 0; y < 256; y += 4) {
          if ((x + y) % 8 === 0) {
            ctx.fillRect(x, y, 3, 3);
          }
        }
      }
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(8, 8);
    return texture;
  }, []);

  // Helper to create rounded box geometry
  const createRoundedBox = (width: number, height: number, depth: number, radius = 0.02, smoothness = 2) => {
    const shape = new THREE.Shape();
    const eps = 0.00001;
    const radiusClamped = Math.min(radius, width / 2 - eps, height / 2 - eps);

    shape.absarc(-width / 2 + radiusClamped, -height / 2 + radiusClamped, radiusClamped, Math.PI, 1.5 * Math.PI, true);
    shape.absarc(width / 2 - radiusClamped, -height / 2 + radiusClamped, radiusClamped, 1.5 * Math.PI, 2 * Math.PI, true);
    shape.absarc(width / 2 - radiusClamped, height / 2 - radiusClamped, radiusClamped, 0, 0.5 * Math.PI, true);
    shape.absarc(-width / 2 + radiusClamped, height / 2 - radiusClamped, radiusClamped, 0.5 * Math.PI, Math.PI, true);

    const extrudeSettings: THREE.ExtrudeGeometryOptions = {
      depth: depth - radiusClamped * 2,
      bevelEnabled: true,
      bevelSegments: smoothness * 2,
      steps: 1,
      bevelSize: radiusClamped,
      bevelThickness: radiusClamped,
      curveSegments: smoothness * 2,
    };

    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geometry.center();
    return geometry;
  };

  // Build Procedural 3D Furniture Hierarchy
  const buildFurnitureMesh = useCallback(() => {
    if (!furnitureGroupRef.current) return;
    const group = furnitureGroupRef.current;

    // Clear previous children
    while (group.children.length > 0) {
      const obj = group.children[0];
      group.remove(obj);
      if (obj instanceof THREE.Mesh) {
        obj.geometry.dispose();
        if (Array.isArray(obj.material)) {
          obj.material.forEach(m => m.dispose());
        } else {
          obj.material.dispose();
        }
      }
    }

    // Normalized scale based on real-world dimensions (cm converted to Three.js units, e.g., 100cm = 1.0 unit)
    const scaleX = customWidthCm / 100;
    const scaleY = customHeightCm / 100;
    const scaleZ = customDepthCm / 100;

    // Materials
    const woodTex = createWoodTexture(woodMaterial.colorHex);
    const fabricBump = createFabricBumpTexture();

    const woodMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(woodMaterial.colorHex),
      map: woodTex,
      roughness: woodMaterial.roughness,
      metalness: woodMaterial.metalness,
      wireframe: wireframeMode,
    });

    const fabricMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(fabricMaterial.colorHex),
      bumpMap: fabricBump,
      bumpScale: 0.003,
      roughness: fabricMaterial.roughness,
      metalness: fabricMaterial.metalness,
      wireframe: wireframeMode,
    });

    const metalMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(metalMaterial.colorHex),
      roughness: metalMaterial.roughness,
      metalness: metalMaterial.metalness,
      wireframe: wireframeMode,
    });

    const explode = explodedAmount || 0;

    // Category / Archetype Builders
    const category = product.geometryType;

    if (category === 'armchair') {
      // 1. Solid Timber Base & Legs
      const legRadius = 0.024;
      const legHeight = scaleY * 0.45;
      const legGeo = new THREE.CylinderGeometry(legRadius * 0.8, legRadius * 1.1, legHeight, 16);
      const ferruleGeo = new THREE.CylinderGeometry(legRadius * 1.12, legRadius * 1.12, 0.04, 16);

      const halfW = (scaleX * 0.85) / 2;
      const halfD = (scaleZ * 0.85) / 2;

      // 4 Tapered Legs with brass tips
      const legPositions = [
        { x: -halfW, z: -halfD, rotZ: 0.08, rotX: -0.08 },
        { x: halfW, z: -halfD, rotZ: -0.08, rotX: -0.08 },
        { x: -halfW, z: halfD, rotZ: 0.08, rotX: 0.08 },
        { x: halfW, z: halfD, rotZ: -0.08, rotX: 0.08 },
      ];

      legPositions.forEach((pos, i) => {
        const legMesh = new THREE.Mesh(legGeo, woodMat);
        const explodeDir = new THREE.Vector3(pos.x, 0, pos.z).normalize().multiplyScalar(explode * 0.35);
        legMesh.position.set(pos.x + explodeDir.x, legHeight / 2 - (explode * 0.1), pos.z + explodeDir.z);
        legMesh.rotation.z = pos.rotZ;
        legMesh.rotation.x = pos.rotX;
        legMesh.castShadow = true;
        legMesh.receiveShadow = true;
        group.add(legMesh);

        // Brass ferrule accents
        const ferrule = new THREE.Mesh(ferruleGeo, metalMat);
        ferrule.position.set(0, -legHeight / 2 + 0.02, 0);
        legMesh.add(ferrule);
      });

      // Timber seat perimeter apron & supports
      const apronGeo = createRoundedBox(scaleX * 0.88, 0.045, scaleZ * 0.88, 0.01);
      const apronMesh = new THREE.Mesh(apronGeo, woodMat);
      apronMesh.position.set(0, legHeight, 0);
      apronMesh.castShadow = true;
      group.add(apronMesh);

      // Sculpted Armrests
      const armLength = scaleZ * 0.82;
      const armWidth = 0.065;
      const armThickness = 0.035;
      const armGeo = createRoundedBox(armWidth, armThickness, armLength, 0.015);

      const leftArm = new THREE.Mesh(armGeo, woodMat);
      leftArm.position.set(-scaleX / 2 + 0.03 - (explode * 0.2), legHeight + scaleY * 0.35, -0.02);
      leftArm.rotation.x = -0.05;
      leftArm.castShadow = true;
      group.add(leftArm);

      const rightArm = new THREE.Mesh(armGeo, woodMat);
      rightArm.position.set(scaleX / 2 - 0.03 + (explode * 0.2), legHeight + scaleY * 0.35, -0.02);
      rightArm.rotation.x = -0.05;
      rightArm.castShadow = true;
      group.add(rightArm);

      // Arm vertical upright stiles
      const stileGeo = new THREE.CylinderGeometry(0.018, 0.022, scaleY * 0.35, 12);
      [-1, 1].forEach((dir) => {
        const stile = new THREE.Mesh(stileGeo, woodMat);
        stile.position.set(dir * (scaleX / 2 - 0.03) + (dir * explode * 0.2), legHeight + (scaleY * 0.35) / 2, 0.12);
        group.add(stile);
      });

      // Generous Deep Seat Cushion
      const cushionW = scaleX * 0.84;
      const cushionD = scaleZ * 0.80;
      const cushionH = scaleY * 0.18;
      const seatCushionGeo = createRoundedBox(cushionW, cushionH, cushionD, 0.035, 3);
      const seatCushion = new THREE.Mesh(seatCushionGeo, fabricMat);
      seatCushion.position.set(0, legHeight + cushionH / 2 + 0.025 + (explode * 0.25), 0.02);
      seatCushion.castShadow = true;
      group.add(seatCushion);

      // Angled Backrest Cushion
      const backW = scaleX * 0.82;
      const backH = scaleY * 0.52;
      const backD = 0.14;
      const backCushionGeo = createRoundedBox(backW, backH, backD, 0.04, 3);
      const backCushion = new THREE.Mesh(backCushionGeo, fabricMat);
      backCushion.position.set(0, legHeight + cushionH + backH / 2 - 0.03 + (explode * 0.4), -scaleZ * 0.32 - (explode * 0.2));
      backCushion.rotation.x = 0.18; // Relaxed recline angle
      backCushion.castShadow = true;
      group.add(backCushion);

      // Back Timber Frame Spindles
      const backFrameGeo = createRoundedBox(scaleX * 0.78, 0.035, 0.04, 0.01);
      const backRail = new THREE.Mesh(backFrameGeo, woodMat);
      backRail.position.set(0, legHeight + backH + 0.05, -scaleZ * 0.38 - (explode * 0.1));
      group.add(backRail);

    } else if (category === 'sectional_sofa') {
      // 2. Sovereign Low-Profile Sectional Plinth & Modular Cushions
      const plinthH = 0.06;
      const plinthGeo = createRoundedBox(scaleX, plinthH, scaleZ, 0.015);
      const plinth = new THREE.Mesh(plinthGeo, woodMat);
      plinth.position.set(0, plinthH / 2, 0);
      plinth.castShadow = true;
      group.add(plinth);

      // Recessed feet with metal bracket accents
      const bracketGeo = new THREE.BoxGeometry(0.04, plinthH, 0.08);
      [-0.45, 0.45].forEach(xRel => {
        [-0.45, 0.45].forEach(zRel => {
          const bracket = new THREE.Mesh(bracketGeo, metalMat);
          bracket.position.set(scaleX * xRel, plinthH / 2, scaleZ * zRel);
          group.add(bracket);
        });
      });

      // Main Sofa Base Platform
      const seatH = scaleY * 0.22;
      const sofaBodyGeo = createRoundedBox(scaleX * 0.98, seatH, scaleZ * 0.94, 0.03);
      const sofaBody = new THREE.Mesh(sofaBodyGeo, fabricMat);
      sofaBody.position.set(0, plinthH + seatH / 2 + (explode * 0.15), 0);
      sofaBody.castShadow = true;
      group.add(sofaBody);

      // Modular Seat Cushions (3 segments)
      const segW = (scaleX * 0.92) / 3;
      const cushionH = scaleY * 0.16;
      const cushionD = scaleZ * 0.76;
      const cushionGeo = createRoundedBox(segW * 0.95, cushionH, cushionD, 0.03, 3);

      for (let i = 0; i < 3; i++) {
        const seg = new THREE.Mesh(cushionGeo, fabricMat);
        const xOffset = -scaleX * 0.46 + segW / 2 + i * segW;
        seg.position.set(xOffset, plinthH + seatH + cushionH / 2 + (explode * 0.3), 0.06);
        seg.castShadow = true;
        group.add(seg);
      }

      // Backrest Structure & Channel Cushions
      const backH = scaleY * 0.55;
      const backGeo = createRoundedBox(scaleX * 0.96, backH, 0.22, 0.04);
      const back = new THREE.Mesh(backGeo, fabricMat);
      back.position.set(0, plinthH + backH / 2 + 0.1, -scaleZ / 2 + 0.12 - (explode * 0.25));
      back.castShadow = true;
      group.add(back);

      // Side Arms
      const armW = 0.18;
      const armH = scaleY * 0.42;
      const armGeo = createRoundedBox(armW, armH, scaleZ * 0.88, 0.03);
      [-1, 1].forEach(dir => {
        const arm = new THREE.Mesh(armGeo, fabricMat);
        arm.position.set(dir * (scaleX / 2 - armW / 2) + (dir * explode * 0.25), plinthH + armH / 2, 0.02);
        arm.castShadow = true;
        group.add(arm);
      });

    } else if (category === 'dining_table') {
      // 3. Monolith Architectural Dining Table
      const topThick = 0.052;
      const topGeo = createRoundedBox(scaleX, topThick, scaleZ, 0.02, 3);
      const topMesh = new THREE.Mesh(topGeo, woodMat);
      topMesh.position.set(0, scaleY - topThick / 2 + (explode * 0.35), 0);
      topMesh.castShadow = true;
      group.add(topMesh);

      // Chamfered underside frame
      const subFrameGeo = createRoundedBox(scaleX * 0.86, 0.03, scaleZ * 0.75, 0.01);
      const subFrame = new THREE.Mesh(subFrameGeo, woodMat);
      subFrame.position.set(0, scaleY - topThick - 0.015, 0);
      group.add(subFrame);

      // Two Sculptural Trestle Pedestals (Architectural Fins)
      const pedestalW = 0.07;
      const pedestalD = scaleZ * 0.72;
      const pedestalH = scaleY - topThick - 0.03;
      const pedestalGeo = createRoundedBox(pedestalW, pedestalH, pedestalD, 0.02);

      const pedDist = scaleX * 0.30;
      [-1, 1].forEach(dir => {
        const ped = new THREE.Mesh(pedestalGeo, woodMat);
        ped.position.set(dir * pedDist + (dir * explode * 0.2), pedestalH / 2, 0);
        ped.castShadow = true;
        group.add(ped);

        // Splayed foot plinth
        const footGeo = createRoundedBox(0.14, 0.04, scaleZ * 0.80, 0.015);
        const foot = new THREE.Mesh(footGeo, woodMat);
        foot.position.set(dir * pedDist + (dir * explode * 0.2), 0.02, 0);
        foot.castShadow = true;
        group.add(foot);
      });

      // Central Metal Tension Tie Rod with Turnbuckles
      const rodGeo = new THREE.CylinderGeometry(0.014, 0.014, pedDist * 2, 16);
      const rod = new THREE.Mesh(rodGeo, metalMat);
      rod.position.set(0, pedestalH * 0.45, 0);
      rod.rotation.z = Math.PI / 2;
      rod.castShadow = true;
      group.add(rod);

      // Brass turnbuckle hardware in center
      const buckleGeo = new THREE.CylinderGeometry(0.028, 0.028, 0.12, 16);
      const buckle = new THREE.Mesh(buckleGeo, metalMat);
      buckle.position.set(0, pedestalH * 0.45, 0);
      buckle.rotation.z = Math.PI / 2;
      group.add(buckle);

    } else if (category === 'credenza') {
      // 4. Kyoto Slatted Credenza / Sideboard
      const cabinetH = scaleY * 0.78;
      const bodyGeo = createRoundedBox(scaleX, cabinetH, scaleZ, 0.02);
      const body = new THREE.Mesh(bodyGeo, woodMat);
      body.position.set(0, scaleY - cabinetH / 2, 0);
      body.castShadow = true;
      group.add(body);

      // Plinth / Tapered legs base
      const legH = scaleY - cabinetH;
      const legGeo = new THREE.CylinderGeometry(0.022, 0.016, legH, 12);
      const legPos = [
        { x: -scaleX * 0.44, z: -scaleZ * 0.4 },
        { x: scaleX * 0.44, z: -scaleZ * 0.4 },
        { x: -scaleX * 0.44, z: scaleZ * 0.4 },
        { x: scaleX * 0.44, z: scaleZ * 0.4 },
        { x: 0, z: 0 },
      ];
      legPos.forEach(p => {
        const leg = new THREE.Mesh(legGeo, woodMat);
        leg.position.set(p.x, legH / 2, p.z);
        leg.castShadow = true;
        group.add(leg);

        // Brass ferrule tip
        const ferrule = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.03, 12), metalMat);
        ferrule.position.set(0, -legH / 2 + 0.015, 0);
        leg.add(ferrule);
      });

      // Front Face Slatted Tambour Doors (Parametric Slat Array)
      const slatCount = 38;
      const slatW = (scaleX * 0.94) / slatCount;
      const slatGeo = new THREE.BoxGeometry(slatW * 0.7, cabinetH * 0.92, 0.018);
      for (let s = 0; s < slatCount; s++) {
        const slat = new THREE.Mesh(slatGeo, woodMat);
        const xPos = -scaleX * 0.47 + slatW / 2 + s * slatW;
        slat.position.set(xPos, scaleY - cabinetH / 2, scaleZ / 2 + 0.01 + (explode * 0.25));
        group.add(slat);
      }

      // Turned Cast Brass Cylinder Pulls
      const pullGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.08, 16);
      [-0.12, 0.12].forEach(x => {
        const pull = new THREE.Mesh(pullGeo, metalMat);
        pull.position.set(x, scaleY - cabinetH / 2, scaleZ / 2 + 0.035 + (explode * 0.35));
        pull.rotation.x = Math.PI / 2;
        group.add(pull);
      });

    } else if (category === 'executive_desk') {
      // 5. Atelier Cantilever Executive Desk
      const topThick = 0.042;
      const topGeo = createRoundedBox(scaleX, topThick, scaleZ, 0.018);
      const deskTop = new THREE.Mesh(topGeo, woodMat);
      deskTop.position.set(0, scaleY - topThick / 2 + (explode * 0.2), 0);
      deskTop.castShadow = true;
      group.add(deskTop);

      // Inset Fine Leather Writing Blotter
      const blotterGeo = createRoundedBox(scaleX * 0.58, 0.005, scaleZ * 0.65, 0.01);
      const blotter = new THREE.Mesh(blotterGeo, fabricMat);
      blotter.position.set(-scaleX * 0.05, scaleY + 0.002 + (explode * 0.25), 0.02);
      group.add(blotter);

      // Brass cable grommet
      const grommetGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.01, 24);
      const grommet = new THREE.Mesh(grommetGeo, metalMat);
      grommet.position.set(scaleX * 0.35, scaleY + 0.003 + (explode * 0.25), -scaleZ * 0.32);
      group.add(grommet);

      // Right-hand dual drawer pedestal
      const pedW = scaleX * 0.32;
      const pedH = scaleY * 0.62;
      const pedD = scaleZ * 0.88;
      const pedGeo = createRoundedBox(pedW, pedH, pedD, 0.015);
      const pedestal = new THREE.Mesh(pedGeo, woodMat);
      pedestal.position.set(scaleX * 0.32 + (explode * 0.25), pedH / 2 + 0.08, 0);
      pedestal.castShadow = true;
      group.add(pedestal);

      // Brass horizontal handles on drawers
      const handleGeo = new THREE.BoxGeometry(0.18, 0.018, 0.018);
      [-0.12, 0.12].forEach(yRel => {
        const handle = new THREE.Mesh(handleGeo, metalMat);
        handle.position.set(scaleX * 0.32 + (explode * 0.32), pedH / 2 + 0.08 + yRel, pedD / 2 + 0.015);
        group.add(handle);
      });

      // Left-hand architectural cantilever metal leg
      const legFrameGeo = new THREE.BoxGeometry(0.04, scaleY - topThick, scaleZ * 0.82);
      const metalLeg = new THREE.Mesh(legFrameGeo, metalMat);
      metalLeg.position.set(-scaleX * 0.42 - (explode * 0.2), (scaleY - topThick) / 2, 0);
      metalLeg.castShadow = true;
      group.add(metalLeg);

    } else {
      // 6. Pavilion Sculptural Coffee Table / Custom AI Archetype
      const topThick = 0.04;
      const topGeo = createRoundedBox(scaleX, topThick, scaleZ, 0.04, 3);
      const coffeeTop = new THREE.Mesh(topGeo, woodMat);
      coffeeTop.position.set(0, scaleY - topThick / 2 + (explode * 0.25), 0);
      coffeeTop.castShadow = true;
      group.add(coffeeTop);

      // Tri-Radial Organic Arch Plinth Base
      const archH = scaleY - topThick;
      const archRadius = Math.min(scaleX, scaleZ) * 0.28;
      const archGeo = new THREE.TorusGeometry(archRadius, 0.035, 16, 32, Math.PI);

      for (let a = 0; a < 3; a++) {
        const angle = (a * 2 * Math.PI) / 3;
        const arch = new THREE.Mesh(archGeo, woodMat);
        const radiusDist = 0.15;
        arch.position.set(
          Math.cos(angle) * radiusDist + Math.cos(angle) * (explode * 0.25),
          0.02,
          Math.sin(angle) * radiusDist + Math.sin(angle) * (explode * 0.25)
        );
        arch.rotation.y = angle + Math.PI / 2;
        arch.rotation.x = -Math.PI / 2;
        arch.castShadow = true;
        group.add(arch);

        // Brass joinery pins
        const pinGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.08, 12);
        const pin = new THREE.Mesh(pinGeo, metalMat);
        pin.position.set(Math.cos(angle) * radiusDist * 1.5, archH * 0.7, Math.sin(angle) * radiusDist * 1.5);
        group.add(pin);
      }
    }

    // Dynamic ground shadow scaling to match custom dimensions
    if (shadowMeshRef.current) {
      shadowMeshRef.current.scale.set(scaleX * 1.35, scaleZ * 1.35, 1);
    }

    // Rebuild Dimension Lines if active
    updateDimensionLines();
  }, [
    product.geometryType,
    customWidthCm,
    customHeightCm,
    customDepthCm,
    woodMaterial,
    fabricMaterial,
    metalMaterial,
    wireframeMode,
    explodedAmount,
    createWoodTexture,
    createFabricBumpTexture,
  ]);

  // Dimension Markers / Caliper Line Overlays in 3D
  const updateDimensionLines = useCallback(() => {
    if (!dimensionsGroupRef.current) return;
    const group = dimensionsGroupRef.current;

    while (group.children.length > 0) {
      const obj = group.children[0];
      group.remove(obj);
      if (obj instanceof THREE.Mesh || obj instanceof THREE.Line) {
        obj.geometry.dispose();
      }
    }

    if (!showDimensions) return;

    const scaleX = customWidthCm / 100;
    const scaleY = customHeightCm / 100;
    const scaleZ = customDepthCm / 100;

    const caliperColor = 0xC5A880; // Warm artisanal brass tone
    const caliperMat = new THREE.LineBasicMaterial({ color: caliperColor, linewidth: 2 });
    const textMat = new THREE.MeshBasicMaterial({ color: caliperColor });

    // Helper for 3D caliper arrows
    const createCaliper = (p1: THREE.Vector3, p2: THREE.Vector3, labelText: string) => {
      const points = [p1, p2];
      const geo = new THREE.BufferGeometry().setFromPoints(points);
      const line = new THREE.Line(geo, caliperMat);
      group.add(line);

      // End tick marks
      const tickLength = 0.04;
      const isHorizontal = Math.abs(p1.y - p2.y) < 0.01;
      const tickDir = isHorizontal ? new THREE.Vector3(0, tickLength, 0) : new THREE.Vector3(tickLength, 0, 0);

      [p1, p2].forEach(p => {
        const tickGeo = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3().copy(p).sub(tickDir),
          new THREE.Vector3().copy(p).add(tickDir),
        ]);
        group.add(new THREE.Line(tickGeo, caliperMat));
      });

      // Floating billboard label sprite
      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 64;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = 'rgba(34, 32, 29, 0.85)';
        ctx.roundRect(0, 0, 256, 64, 16);
        ctx.fill();
        ctx.strokeStyle = '#C5A880';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.font = 'bold 26px "Plus Jakarta Sans", sans-serif';
        ctx.fillStyle = '#FAF7F2';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(labelText, 128, 32);
      }
      const texture = new THREE.CanvasTexture(canvas);
      const spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true });
      const sprite = new THREE.Sprite(spriteMat);
      sprite.scale.set(0.35, 0.09, 1);
      const midPoint = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
      if (isHorizontal) midPoint.y += 0.06;
      else midPoint.x += 0.08;
      sprite.position.copy(midPoint);
      group.add(sprite);
    };

    // Width (along X axis in front)
    const yFront = 0.02;
    const zFront = scaleZ / 2 + 0.18;
    createCaliper(
      new THREE.Vector3(-scaleX / 2, yFront, zFront),
      new THREE.Vector3(scaleX / 2, yFront, zFront),
      `W: ${customWidthCm} cm (${(customWidthCm / 2.54).toFixed(1)}")`
    );

    // Depth (along Z axis on right)
    const xRight = scaleX / 2 + 0.18;
    createCaliper(
      new THREE.Vector3(xRight, yFront, -scaleZ / 2),
      new THREE.Vector3(xRight, yFront, scaleZ / 2),
      `D: ${customDepthCm} cm (${(customDepthCm / 2.54).toFixed(1)}")`
    );

    // Height (along Y axis on left rear)
    const xLeft = -scaleX / 2 - 0.18;
    const zRear = 0;
    createCaliper(
      new THREE.Vector3(xLeft, 0, zRear),
      new THREE.Vector3(xLeft, scaleY, zRear),
      `H: ${customHeightCm} cm (${(customHeightCm / 2.54).toFixed(1)}")`
    );
  }, [showDimensions, customWidthCm, customHeightCm, customDepthCm]);

  // Initial Scene Setup
  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth || 600;
    const height = container.clientHeight || 500;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = isARMode ? null : new THREE.Color(0xF5F3EF); // Studio off-white warm canvas

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    cameraRef.current = camera;
    updateCameraPosition();

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true, 
      powerPreference: 'high-performance',
      preserveDrawingBuffer: true 
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05 * Math.sqrt(lightIntensity);
    renderer.domElement.id = canvasId || (isARMode ? 'ar-three-canvas' : 'studio-three-canvas');
    rendererRef.current = renderer;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 4. Lighting Rig (Luxury Atelier Photo Studio)
    // Key Light
    const keyLight = new THREE.DirectionalLight(0xFFFBF5, 1.4 * lightIntensity);
    keyLight.position.set(3.5, 4.8, 4.0);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 15;
    keyLight.shadow.bias = -0.0001;
    keyLight.shadow.radius = 3;
    scene.add(keyLight);
    keyLightRef.current = keyLight;

    // Fill Light (Cool daylight balancing warm key)
    const fillLight = new THREE.DirectionalLight(0xE6F0FA, 0.7 * lightIntensity);
    fillLight.position.set(-4, 3, 2);
    scene.add(fillLight);
    fillLightRef.current = fillLight;

    // Rim / Backlight for specular rim highlights on wood & brass
    const rimLight = new THREE.DirectionalLight(0xFFE8D6, 0.9 * lightIntensity);
    rimLight.position.set(0, 3.5, -4.5);
    scene.add(rimLight);
    rimLightRef.current = rimLight;

    // Soft Ambient Studio Bounce
    const ambientLight = new THREE.HemisphereLight(0xFFFAF2, 0xDED7CD, 0.65 * lightIntensity);
    scene.add(ambientLight);
    ambientLightRef.current = ambientLight;

    // 5. Contact Shadow Ground Plane (Radial blurred shadow texture)
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 512;
    shadowCanvas.height = 512;
    const sCtx = shadowCanvas.getContext('2d');
    if (sCtx) {
      const grad = sCtx.createRadialGradient(256, 256, 30, 256, 256, 230);
      grad.addColorStop(0, 'rgba(30, 25, 20, 0.38)');
      grad.addColorStop(0.5, 'rgba(40, 35, 30, 0.18)');
      grad.addColorStop(0.85, 'rgba(50, 45, 40, 0.05)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      sCtx.fillStyle = grad;
      sCtx.fillRect(0, 0, 512, 512);
    }
    const shadowTex = new THREE.CanvasTexture(shadowCanvas);
    const shadowGeo = new THREE.PlaneGeometry(2.6, 2.6);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      depthWrite: false,
    });
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.y = 0.001;
    shadowMesh.visible = contactShadowEnabled !== false;
    scene.add(shadowMesh);
    shadowMeshRef.current = shadowMesh;

    // Architectural Studio Grid Floor (Subtle craftsmanship reference)
    if (!isARMode) {
      const grid = new THREE.GridHelper(6, 30, 0xD4AF37, 0xE2DDD5);
      grid.position.y = 0;
      scene.add(grid);
    }

    // 6. Hierarchical Object Groups
    const rootGroup = new THREE.Group();
    scene.add(rootGroup);
    rootGroupRef.current = rootGroup;

    const furnitureGroup = new THREE.Group();
    rootGroup.add(furnitureGroup);
    furnitureGroupRef.current = furnitureGroup;

    const dimensionsGroup = new THREE.Group();
    rootGroup.add(dimensionsGroup);
    dimensionsGroupRef.current = dimensionsGroup;

    // Resize Observer
    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        const { width: newW, height: newH } = entry.contentRect;
        if (newW > 0 && newH > 0 && cameraRef.current && rendererRef.current) {
          cameraRef.current.aspect = newW / newH;
          cameraRef.current.updateProjectionMatrix();
          rendererRef.current.setSize(newW, newH);
        }
      }
    });
    resizeObserver.observe(container);

    // Animation Render Loop
    let lastTime = performance.now();
    const animate = (time: number) => {
      const delta = (time - lastTime) / 1000;
      lastTime = time;

      if (autoRotate && rootGroupRef.current && !isDraggingRef.current) {
        rootGroupRef.current.rotation.y += delta * 0.45;
      }

      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
      requestRef.current = requestAnimationFrame(animate);
    };
    requestRef.current = requestAnimationFrame(animate);

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      resizeObserver.disconnect();
      renderer.dispose();
      container.innerHTML = '';
    };
  }, [isARMode]);

  // Dynamic updates for Lighting Intensity & Contact Shadow Toggle
  useEffect(() => {
    if (shadowMeshRef.current) {
      shadowMeshRef.current.visible = contactShadowEnabled !== false;
    }
    if (keyLightRef.current) {
      keyLightRef.current.intensity = 1.4 * (lightIntensity ?? 1.0);
    }
    if (fillLightRef.current) {
      fillLightRef.current.intensity = 0.7 * (lightIntensity ?? 1.0);
    }
    if (rimLightRef.current) {
      rimLightRef.current.intensity = 0.9 * (lightIntensity ?? 1.0);
    }
    if (ambientLightRef.current) {
      ambientLightRef.current.intensity = 0.65 * (lightIntensity ?? 1.0);
    }
    if (rendererRef.current) {
      rendererRef.current.toneMappingExposure = 1.05 * Math.sqrt(Math.max(0.2, lightIntensity ?? 1.0));
    }
  }, [lightIntensity, contactShadowEnabled]);

  // Update camera coordinates based on spherical rotation
  const updateCameraPosition = () => {
    if (!cameraRef.current) return;
    const { theta, phi, radius } = cameraRotation.current;
    const x = radius * Math.sin(phi) * Math.sin(theta);
    const y = radius * Math.cos(phi);
    const z = radius * Math.sin(phi) * Math.cos(theta);

    cameraRef.current.position.set(
      cameraTarget.current.x + x,
      cameraTarget.current.y + y,
      cameraTarget.current.z + z
    );
    cameraRef.current.lookAt(cameraTarget.current);
  };

  // Preset Camera Angles
  const setPresetAngle = (preset: 'iso' | 'front' | 'top' | 'side' | 'detail') => {
    setActiveCameraPreset(preset);
    if (onCameraPresetChange) onCameraPresetChange(preset);

    if (preset === 'iso') {
      cameraRotation.current = { theta: Math.PI / 4, phi: Math.PI / 3.2, radius: 3.2 };
      cameraTarget.current.set(0, 0.45, 0);
    } else if (preset === 'front') {
      cameraRotation.current = { theta: 0, phi: Math.PI / 2.1, radius: 2.8 };
      cameraTarget.current.set(0, 0.45, 0);
    } else if (preset === 'top') {
      cameraRotation.current = { theta: 0.001, phi: 0.08, radius: 3.0 };
      cameraTarget.current.set(0, 0.2, 0);
    } else if (preset === 'side') {
      cameraRotation.current = { theta: Math.PI / 2, phi: Math.PI / 2.1, radius: 2.8 };
      cameraTarget.current.set(0, 0.45, 0);
    } else if (preset === 'detail') {
      cameraRotation.current = { theta: Math.PI / 5, phi: Math.PI / 2.6, radius: 1.4 };
      cameraTarget.current.set(0, 0.55, 0);
    }
    updateCameraPosition();
  };

  useEffect(() => {
    if (cameraPreset === 'perspective' || cameraPreset === 'iso') setPresetAngle('iso');
    else if (cameraPreset === 'front') setPresetAngle('front');
    else if (cameraPreset === 'side') setPresetAngle('side');
    else if (cameraPreset === 'top') setPresetAngle('top');
  }, [cameraPreset]);

  // Pointer Interaction Handlers (Rotate, Pan, Zoom)
  const handlePointerDown = (e: React.PointerEvent) => {
    isDraggingRef.current = true;
    isPanningRef.current = e.button === 2 || e.shiftKey;
    prevPointerPosition.current = { x: e.clientX, y: e.clientY };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - prevPointerPosition.current.x;
    const dy = e.clientY - prevPointerPosition.current.y;
    prevPointerPosition.current = { x: e.clientX, y: e.clientY };

    if (isPanningRef.current) {
      // Pan camera target
      const factor = 0.0025 * cameraRotation.current.radius;
      cameraTarget.current.y += dy * factor;
      const right = new THREE.Vector3(Math.cos(cameraRotation.current.theta), 0, -Math.sin(cameraRotation.current.theta));
      cameraTarget.current.addScaledVector(right, -dx * factor);
    } else {
      // Orbit rotate
      cameraRotation.current.theta -= dx * 0.008;
      cameraRotation.current.phi = Math.max(0.12, Math.min(Math.PI / 2 - 0.04, cameraRotation.current.phi - dy * 0.008));
    }
    updateCameraPosition();
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    isDraggingRef.current = false;
    isPanningRef.current = false;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY * 0.0018;
    cameraRotation.current.radius = Math.max(1.1, Math.min(6.5, cameraRotation.current.radius + zoomFactor));
    updateCameraPosition();
  };

  // Rebuild mesh when model attributes, materials, or dimensions change
  useEffect(() => {
    buildFurnitureMesh();
  }, [buildFurnitureMesh]);

  return (
    <div className={`relative w-full h-full select-none overflow-hidden ${className}`}>
      {/* 3D Canvas Mount Element */}
      <div
        ref={containerRef}
        className="w-full h-full cursor-grab active:cursor-grabbing touch-none"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onWheel={handleWheel}
        onContextMenu={(e) => e.preventDefault()}
      />

      {/* Camera Angle Presets Toolbar */}
      <div className="absolute top-4 left-4 flex items-center bg-[#22201D]/80 backdrop-blur-md rounded-full p-1 border border-[#C5A880]/30 shadow-lg text-xs z-10">
        <span className="text-[#A79F93] px-2.5 font-medium uppercase tracking-wider text-[10px]">View</span>
        {[
          { id: 'iso', label: '3D 45°' },
          { id: 'front', label: 'Front' },
          { id: 'side', label: 'Side' },
          { id: 'top', label: 'Plan' },
          { id: 'detail', label: 'Joinery' },
        ].map(p => (
          <button
            key={p.id}
            id={`camera-preset-${p.id}`}
            onClick={() => setPresetAngle(p.id as any)}
            className={`px-2.5 py-1 rounded-full transition-all duration-200 font-medium ${
              activeCameraPreset === p.id
                ? 'bg-[#C5A880] text-[#22201D] shadow-sm font-semibold'
                : 'text-[#FAF7F2]/80 hover:text-white hover:bg-white/10'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Interaction Hint Overlay */}
      <div className="absolute bottom-4 left-4 text-[11px] text-[#22201D]/60 bg-white/75 backdrop-blur-sm px-3 py-1.5 rounded-md border border-[#22201D]/10 pointer-events-none flex items-center gap-2 font-mono">
        <span className="w-1.5 h-1.5 rounded-full bg-[#C5A880] animate-pulse"></span>
        Drag to orbit · Scroll to zoom · Shift+drag to pan
      </div>

      {/* Scale & Dimensions Indicator Badge */}
      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3.5 py-2 rounded-lg border border-[#22201D]/10 shadow-sm text-right z-10">
        <div className="text-[10px] font-bold text-[#8C4B23] uppercase tracking-wider">True Metric Scale 1:1</div>
        <div className="text-xs font-semibold text-[#22201D]">
          {customWidthCm} × {customDepthCm} × {customHeightCm} <span className="text-[10px] text-[#766E65] font-normal">cm</span>
        </div>
        <div className="text-[10px] text-[#766E65]">
          {(customWidthCm / 2.54).toFixed(1)}" × {(customDepthCm / 2.54).toFixed(1)}" × {(customHeightCm / 2.54).toFixed(1)}"
        </div>
      </div>
    </div>
  );
};
