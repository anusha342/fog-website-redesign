// ════════════════════════════════════════════
//  THREE.JS — FUTURISTIC HERO v2
//  Hex grid · Orb structure · Particle field
//  Speed streaks · Scan beam · Camera parallax
// ════════════════════════════════════════════
(function () {
  try {
    const canvas = document.getElementById('hero-canvas');

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.setClearColor(0x080808, 1);

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x080808, 0.011);

    const cam = new THREE.PerspectiveCamera(55, canvas.clientWidth / canvas.clientHeight, 0.1, 500);
    cam.position.set(0, 2, 32);
    cam.lookAt(0, 0, 0);

    const clock = new THREE.Clock();

    // ── MERGED HEX GRID BACKGROUND ──────────────────
    (function () {
      const hexR = 3.2;
      const hexW = Math.sqrt(3) * hexR;
      const hexH  = 1.5 * hexR;
      const verts = [];

      for (let row = -9; row <= 9; row++) {
        for (let col = -17; col <= 17; col++) {
          const cx = col * hexW + (Math.abs(row % 2) === 1 ? hexW / 2 : 0);
          const cy = row * hexH;
          for (let e = 0; e < 6; e++) {
            const a1 = (Math.PI / 3) * e      + Math.PI / 6;
            const a2 = (Math.PI / 3) * (e + 1) + Math.PI / 6;
            verts.push(
              cx + hexR * Math.cos(a1), cy + hexR * Math.sin(a1), 0,
              cx + hexR * Math.cos(a2), cy + hexR * Math.sin(a2), 0
            );
          }
        }
      }

      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(verts), 3));
      const mesh = new THREE.LineSegments(geo,
        new THREE.LineBasicMaterial({ color: 0x181818, transparent: true, opacity: 0.85 })
      );
      mesh.position.z = -38;
      scene.add(mesh);
    }());

    // ── PERSPECTIVE GRID FLOOR ───────────────────────
    const gridMesh = (function () {
      const COLS = 24, ROWS = 38, GW = 120, GD = 240;
      const v = [];
      for (let i = 0; i <= ROWS; i++) {
        const z = -GD + (i / ROWS) * GD;
        v.push(-GW / 2, 0, z,  GW / 2, 0, z);
      }
      for (let i = 0; i <= COLS; i++) {
        const x = -GW / 2 + (i / COLS) * GW;
        v.push(x, 0, -GD,  x, 0, 0);
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(v), 3));
      const mesh = new THREE.LineSegments(geo,
        new THREE.LineBasicMaterial({ color: 0xF05023, transparent: true, opacity: 0.15 })
      );
      mesh.position.set(0, -17, 10);
      scene.add(mesh);
      return mesh;
    }());

    // ── CENTRAL ORB STRUCTURE (right-of-center) ──────
    const ORB = new THREE.Vector3(15, 0, -10);

    const outerOrb = new THREE.Mesh(
      new THREE.IcosahedronGeometry(8, 2),
      new THREE.MeshBasicMaterial({ color: 0xF05023, wireframe: true, transparent: true, opacity: 0.10 })
    );
    outerOrb.position.copy(ORB);
    scene.add(outerOrb);

    const midOrb = new THREE.Mesh(
      new THREE.IcosahedronGeometry(5, 1),
      new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true, transparent: true, opacity: 0.06 })
    );
    midOrb.position.copy(ORB);
    scene.add(midOrb);

    const coreOrb = new THREE.Mesh(
      new THREE.SphereGeometry(1.1, 20, 20),
      new THREE.MeshBasicMaterial({ color: 0xF05023 })
    );
    coreOrb.position.copy(ORB);
    scene.add(coreOrb);

    // inner accent ring (flat disc glow feel)
    const discMesh = new THREE.Mesh(
      new THREE.RingGeometry(1.3, 1.8, 64),
      new THREE.MeshBasicMaterial({ color: 0xF05023, transparent: true, opacity: 0.5, side: THREE.DoubleSide })
    );
    discMesh.position.copy(ORB);
    scene.add(discMesh);

    const rings = [];
    [
      { r: 6,   tube: 0.04, col: 0xF05023, op: 0.75, rx:  0.3, ry: 0,   rz:  0.1, sx: 0.006, sy: 0.004, sz: 0 },
      { r: 7.5, tube: 0.025,col: 0xffffff, op: 0.22, rx:  1.1, ry: 0.5, rz:  0,   sx: 0,     sy: 0.003, sz: 0.005 },
      { r: 9.2, tube: 0.018,col: 0xF05023, op: 0.15, rx:  0.1, ry: 0.9, rz:  1.5, sx: 0.003, sy: 0,     sz: 0.004 },
      { r: 11,  tube: 0.012,col: 0xffffff, op: 0.08, rx: -0.5, ry: 1.2, rz: -0.3, sx: 0.002, sy: 0.003, sz: 0.001 },
    ].forEach(c => {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(c.r, c.tube, 6, 120),
        new THREE.MeshBasicMaterial({ color: c.col, transparent: true, opacity: c.op })
      );
      ring.position.copy(ORB);
      ring.rotation.set(c.rx, c.ry, c.rz);
      scene.add(ring);
      rings.push({ mesh: ring, sx: c.sx, sy: c.sy, sz: c.sz });
    });

    // secondary mini-orb (left side for balance)
    const miniOrb = new THREE.Mesh(
      new THREE.OctahedronGeometry(3, 1),
      new THREE.MeshBasicMaterial({ color: 0xF05023, wireframe: true, transparent: true, opacity: 0.12 })
    );
    miniOrb.position.set(-18, -4, -14);
    scene.add(miniOrb);

    // ── FLOATING DEBRIS ──────────────────────────────
    const floaters = [];
    const fGeos = [
      new THREE.OctahedronGeometry(1, 0),
      new THREE.TetrahedronGeometry(0.9, 0),
      new THREE.IcosahedronGeometry(0.8, 0),
      new THREE.BoxGeometry(1.4, 1.4, 1.4),
    ];

    for (let i = 0; i < 22; i++) {
      const isAccent = i % 3 === 0;
      const m = new THREE.Mesh(
        fGeos[i % fGeos.length],
        new THREE.MeshBasicMaterial({
          color: isAccent ? 0xF05023 : 0xffffff,
          wireframe: true,
          transparent: true,
          opacity: 0.05 + Math.random() * 0.18,
        })
      );
      const a = Math.random() * Math.PI * 2;
      const d = 20 + Math.random() * 35;
      m.position.set(
        Math.cos(a) * d,
        (Math.random() - 0.5) * 38,
        -10 - Math.random() * 40
      );
      m.scale.setScalar(0.6 + Math.random() * 3);
      scene.add(m);
      floaters.push({
        mesh: m,
        rx: (Math.random() - 0.5) * 0.013,
        ry: (Math.random() - 0.5) * 0.019,
        rz: (Math.random() - 0.5) * 0.009,
        baseY: m.position.y,
        fSpeed: 0.3 + Math.random() * 0.7,
        fAmp:   0.6 + Math.random() * 2.2,
        fPhase: Math.random() * Math.PI * 2,
      });
    }

    // ── PARTICLE FIELD ───────────────────────────────
    const PC = 1800;
    const pPos = new Float32Array(PC * 3);
    const pCol = new Float32Array(PC * 3);
    const pSpd = new Float32Array(PC);

    for (let i = 0; i < PC; i++) {
      pPos[i * 3]     = (Math.random() - 0.5) * 240;
      pPos[i * 3 + 1] = (Math.random() - 0.5) * 140;
      pPos[i * 3 + 2] = (Math.random() - 0.5) * 160 - 20;
      pSpd[i] = 0.006 + Math.random() * 0.022;

      if (Math.random() < 0.16) {
        pCol[i*3]=0.94; pCol[i*3+1]=0.31; pCol[i*3+2]=0.14;
      } else {
        const v = 0.08 + Math.random() * 0.42;
        pCol[i*3]=v; pCol[i*3+1]=v; pCol[i*3+2]=v;
      }
    }

    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    pGeo.setAttribute('color',    new THREE.BufferAttribute(pCol, 3));
    scene.add(new THREE.Points(pGeo, new THREE.PointsMaterial({
      size: 0.09, vertexColors: true, transparent: true, opacity: 0.9, sizeAttenuation: true
    })));

    // ── SPEED STREAKS ────────────────────────────────
    const streaks = [];
    let streakTimer = 0;

    function spawnStreak() {
      const y   = (Math.random() - 0.5) * 55;
      const z   = -4 + Math.random() * 16;
      const len = 5 + Math.random() * 22;
      const v   = new Float32Array([-70, y, z,  -70 + len, y, z]);
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(v, 3));
      const mat = new THREE.LineBasicMaterial({
        color:       Math.random() < 0.38 ? 0xF05023 : 0xffffff,
        transparent: true,
        opacity:     0.45 + Math.random() * 0.55,
      });
      const line = new THREE.LineSegments(geo, mat);
      scene.add(line);
      streaks.push({ line, geo, mat, speed: 1.8 + Math.random() * 5.5 });
    }

    // ── HORIZONTAL SCAN BEAM ─────────────────────────
    const scanBeam = new THREE.Mesh(
      new THREE.PlaneGeometry(320, 0.07),
      new THREE.MeshBasicMaterial({ color: 0xF05023, transparent: true, opacity: 0.28, side: THREE.DoubleSide })
    );
    scanBeam.position.set(0, 0, 7);
    scene.add(scanBeam);

    // ── DATA COLUMNS (vertical accent lines) ─────────
    (function () {
      const cols = [-32, -18, 18, 32];
      cols.forEach(x => {
        const v = new Float32Array([x, -60, -20,  x, 60, -20]);
        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.BufferAttribute(v, 3));
        scene.add(new THREE.LineSegments(geo,
          new THREE.LineBasicMaterial({ color: 0xF05023, transparent: true, opacity: 0.06 })
        ));
      });
    }());

    // ── MOUSE ────────────────────────────────────────
    let mx = 0, my = 0;
    document.getElementById('hero').addEventListener('mousemove', e => {
      mx = (e.clientX / window.innerWidth  - 0.5) * 2;
      my = -(e.clientY / window.innerHeight - 0.5) * 2;
    });

    // ── ANIMATE ──────────────────────────────────────
    function animate() {
      requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      // Grid forward drift
      gridMesh.position.z = 10 + (t * 2.8) % 7;

      // Orb
      outerOrb.rotation.x += 0.0025;
      outerOrb.rotation.y += 0.005;
      midOrb.rotation.x   -= 0.004;
      midOrb.rotation.z   += 0.006;
      discMesh.rotation.z  = t * 0.8;

      const pulse = 1 + 0.22 * Math.sin(t * 2.6);
      coreOrb.scale.setScalar(pulse);

      rings.forEach(r => {
        r.mesh.rotation.x += r.sx;
        r.mesh.rotation.y += r.sy;
        r.mesh.rotation.z += r.sz;
      });

      miniOrb.rotation.x += 0.007;
      miniOrb.rotation.y -= 0.009;

      // Floaters
      floaters.forEach(f => {
        f.mesh.rotation.x += f.rx;
        f.mesh.rotation.y += f.ry;
        f.mesh.rotation.z += f.rz;
        f.mesh.position.y  = f.baseY + Math.sin(t * f.fSpeed + f.fPhase) * f.fAmp;
      });

      // Particles drift upward
      for (let i = 0; i < PC; i++) {
        pPos[i * 3 + 1] += pSpd[i];
        if (pPos[i * 3 + 1] > 70) pPos[i * 3 + 1] = -70;
      }
      pGeo.attributes.position.needsUpdate = true;

      // Streaks
      streakTimer += 0.016;
      if (streakTimer > 0.32) { streakTimer = 0; spawnStreak(); }
      for (let i = streaks.length - 1; i >= 0; i--) {
        streaks[i].line.position.x += streaks[i].speed;
        if (streaks[i].line.position.x > 120) {
          scene.remove(streaks[i].line);
          streaks[i].geo.dispose();
          streaks[i].mat.dispose();
          streaks.splice(i, 1);
        }
      }

      // Scan beam sweep
      scanBeam.position.y  = 26 * Math.sin(t * 0.32);
      scanBeam.material.opacity = 0.1 + 0.22 * Math.abs(Math.cos(t * 0.32));

      // Camera parallax
      cam.position.x += (mx * 4   - cam.position.x) * 0.038;
      cam.position.y += (my * 2.2 + 2 - cam.position.y) * 0.038;
      cam.lookAt(0, 0, 0);

      renderer.render(scene, cam);
    }
    animate();

    window.addEventListener('resize', () => {
      const w = canvas.clientWidth, h = canvas.clientHeight;
      cam.aspect = w / h;
      cam.updateProjectionMatrix();
      renderer.setSize(w, h);
    });

  } catch (e) {
    document.getElementById('hero').style.background = '#080808';
    console.warn('WebGL unavailable', e);
  }
}());
