'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import ContactForm from '@/components/ContactForm';
import TestimonialsCarousel from '@/components/TestimonialsCarousel';
import type { Testimonial } from '@/lib/testimonials';
import styles from './home.module.css';

// ── CDN globals ──────────────────────────────────────────────────────────────
declare const THREE: any;
declare const am5: any;
declare const am5map: any;
declare const am5geodata_worldLow: any;
declare const am5themes_Animated: any;

// ── Script loader util ───────────────────────────────────────────────────────
function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) { resolve(); return; }
    const s = document.createElement('script');
    s.src = src;
    s.onload = () => resolve();
    s.onerror = reject;
    document.head.appendChild(s);
  });
}


const PRODUCTS = [
  {
    id: 'hypergrid',
    num: '01',
    name: 'HyperGrid',
    extraNameCls: '',
    navTheme: 'light',
    desc: 'A fully modular, grid-based attraction system designed to transform any space into an immersive multiplayer playground.',
    href: '/products/hyper-grid',
    sectionCls: styles.prodHypergrid,
    thumbs: [
      { bg: '/images/hyper-grid/hyper-grid-1.png', pos: 'center', alt: 'HyperGrid arena view 1' },
      { bg: '/images/hyper-grid/hyper-grid-2.png', pos: 'center', alt: 'HyperGrid arena view 2' },
      { bg: '/images/hyper-grid/hyper-grid-3.png', pos: 'center', alt: 'HyperGrid arena view 3' },
    ],
  },
  {
    id: 'lasertag',
    num: '02',
    name: 'Laser Tag',
    extraNameCls: '',
    navTheme: 'light',
    desc: 'Next-gen laser combat. Full tracking. Full immersion. Zero compromise.',
    href: '/products/laser-tag',
    sectionCls: styles.prodLasertag,
    thumbs: [
      { bg: '/images/laser-tag/laser-tag-1.png', pos: 'center top', alt: 'Laser Tag arena' },
      { bg: '/images/laser-tag/laser-tag-1.png', pos: 'center center', alt: 'Laser Tag gameplay' },
      { bg: '/images/laser-tag/laser-tag-1.png', pos: 'center bottom', alt: 'Laser Tag action' },
    ],
  },
  {
    id: 'lasermaze',
    num: '03',
    name: 'Laser Spy',
    extraNameCls: '',
    navTheme: undefined,
    desc: 'A stealth challenge every player wants to beat. Then beat again.',
    href: '/products/laser-spy',
    sectionCls: styles.prodLasermaze,
    thumbs: [
      { bg: '/images/laser-spy/laser-spy-1.jpg', pos: 'center top', alt: 'Laser Maze entrance' },
      { bg: '/images/laser-spy/laser-spy-1.jpg', pos: 'center center', alt: 'Laser Maze beams' },
      { bg: '/images/laser-spy/laser-spy-1.jpg', pos: 'right center', alt: 'Laser Maze challenge' },
    ],
  },
];

interface BlogPost {
  id: string;
  title: string;
  category: string;
  date: string;
  readTime: number;
  image?: string;
  excerpt: string;
}

// ── Component ────────────────────────────────────────────────────────────────
export default function HomeClient({
  initialPosts,
  initialTestimonials,
}: {
  initialPosts: BlogPost[];
  initialTestimonials: Testimonial[];
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const globeRef = useRef<HTMLDivElement>(null);
  const aboutRef = useRef<HTMLElement>(null);
  const mbBreakRef = useRef<HTMLElement>(null);

  // FOG text state
  const [glitchIdx, setGlitchIdx] = useState<number | null>(null);
  const [fogExiting, setFogExiting] = useState(false);
  const isHoveringRef = useRef(false);
  const hazeRef = useRef<HTMLDivElement>(null);

  // Hero phase: 'fog' = logo + FOG letters, 'future' = FUTURE OF GAMING + buttons
  const [heroPhase, setHeroPhase] = useState<'fog' | 'future'>('fog');
  const [heroTransitioning, setHeroTransitioning] = useState(false);
  const [fogRevealKey, setFogRevealKey] = useState(0);

  // Moments AI Break
  const [mbActivated, setMbActivated] = useState(false);

  // Product thumb state
  const [activeThumbs, setActiveThumbs] = useState<Record<string, number>>({
    hypergrid: 0, lasertag: 0, lasermaze: 0,
  });
  const [bgStates, setBgStates] = useState<Record<string, { bg: string; pos: string }>>({
    hypergrid: { bg: '/images/hyper-grid/hyper-grid-1.png', pos: 'center' },
    lasertag: { bg: '/images/laser-tag/laser-tag-1.png', pos: 'center top' },
    lasermaze: { bg: '/images/laser-spy/laser-spy-1.jpg', pos: 'center top' },
  });

  // Counts
  const [counts, setCounts] = useState({ dailyPlayers: 0, repeatRate: 0, countries: 0 });
  const countsTriggered = useRef(false);

  // (testimonials carousel delegated to shared TestimonialsCarousel component)

  // Blog
  const blogPosts = initialPosts;

  // ── Lenis smooth scroll ──────────────────────────────────────────────────
  useEffect(() => {
    let animId: number;
    loadScript('https://unpkg.com/@studio-freight/lenis@1.0.42/dist/lenis.min.js')
      .then(() => {
        const LenisClass = (window as any).Lenis;
        if (!LenisClass) return;
        const lenis = new LenisClass({ lerp: 0.075, smoothWheel: true });
        function raf(time: number) { lenis.raf(time); animId = requestAnimationFrame(raf); }
        animId = requestAnimationFrame(raf);
        (window as any).__fogLenis = lenis;
      })
      .catch(() => { });
    return () => {
      cancelAnimationFrame(animId);
      (window as any).__fogLenis?.destroy?.();
    };
  }, []);

  // ── Scroll reveal ────────────────────────────────────────────────────────
  useEffect(() => {
    const els = document.querySelectorAll('[data-reveal]');
    if (!els.length) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            (e.target as HTMLElement).classList.add('is-revealed');
            obs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  // ── Nav theme (data-nav-theme) ───────────────────────────────────────────
  useEffect(() => {
    const navbar = document.getElementById('navbar');
    if (!navbar) return;
    const sections = document.querySelectorAll('[data-nav-theme]');
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const theme = (entry.target as HTMLElement).dataset.navTheme || 'dark';
            navbar.setAttribute('data-theme', theme);
          }
        });
      },
      { threshold: 0.4, rootMargin: '-60px 0px 0px 0px' }
    );
    sections.forEach((s) => obs.observe(s));
    return () => obs.disconnect();
  }, []);

  // ── Three.js hero ────────────────────────────────────────────────────────
  /* THREE.JS ANIMATION COMMENTED OUT
  useEffect(() => {
    const canvas = canvasRef.current;
    const hero   = heroRef.current;
    if (!canvas || !hero) return;

    let disposed = false;
    let animId: number;

    loadScript('https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js')
      .then(() => {
        if (disposed) return;
        try {
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

          // Hex grid background
          (() => {
            const hexR = 3.2, hexW = Math.sqrt(3) * hexR, hexH = 1.5 * hexR;
            const verts: number[] = [];
            for (let row = -9; row <= 9; row++) {
              for (let col = -17; col <= 17; col++) {
                const cx = col * hexW + (Math.abs(row % 2) === 1 ? hexW / 2 : 0);
                const cy = row * hexH;
                for (let e = 0; e < 6; e++) {
                  const a1 = (Math.PI / 3) * e + Math.PI / 6;
                  const a2 = (Math.PI / 3) * (e + 1) + Math.PI / 6;
                  verts.push(cx + hexR * Math.cos(a1), cy + hexR * Math.sin(a1), 0,
                             cx + hexR * Math.cos(a2), cy + hexR * Math.sin(a2), 0);
                }
              }
            }
            const geo = new THREE.BufferGeometry();
            geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(verts), 3));
            const mesh = new THREE.LineSegments(geo,
              new THREE.LineBasicMaterial({ color: 0x181818, transparent: true, opacity: 0.85 }));
            mesh.position.z = -38;
            scene.add(mesh);
          })();

          // Perspective grid floor
          const gridMesh = (() => {
            const COLS = 24, ROWS = 38, GW = 120, GD = 240;
            const v: number[] = [];
            for (let i = 0; i <= ROWS; i++) { const z = -GD + (i / ROWS) * GD; v.push(-GW/2, 0, z, GW/2, 0, z); }
            for (let i = 0; i <= COLS; i++) { const x = -GW/2 + (i / COLS) * GW; v.push(x, 0, -GD, x, 0, 0); }
            const geo = new THREE.BufferGeometry();
            geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(v), 3));
            const mesh = new THREE.LineSegments(geo,
              new THREE.LineBasicMaterial({ color: 0xF05023, transparent: true, opacity: 0.15 }));
            mesh.position.set(0, -17, 10);
            scene.add(mesh);
            return mesh;
          })();

          // Central orb
          const ORB = new THREE.Vector3(15, 0, -10);
          const outerOrb = new THREE.Mesh(new THREE.IcosahedronGeometry(8, 2),
            new THREE.MeshBasicMaterial({ color: 0xF05023, wireframe: true, transparent: true, opacity: 0.10 }));
          outerOrb.position.copy(ORB); scene.add(outerOrb);

          const midOrb = new THREE.Mesh(new THREE.IcosahedronGeometry(5, 1),
            new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true, transparent: true, opacity: 0.06 }));
          midOrb.position.copy(ORB); scene.add(midOrb);

          const coreOrb = new THREE.Mesh(new THREE.SphereGeometry(1.1, 20, 20),
            new THREE.MeshBasicMaterial({ color: 0xF05023 }));
          coreOrb.position.copy(ORB); scene.add(coreOrb);

          const discMesh = new THREE.Mesh(new THREE.RingGeometry(1.3, 1.8, 64),
            new THREE.MeshBasicMaterial({ color: 0xF05023, transparent: true, opacity: 0.5, side: THREE.DoubleSide }));
          discMesh.position.copy(ORB); scene.add(discMesh);

          const rings: { mesh: any; sx: number; sy: number; sz: number }[] = [];
          [
            { r: 6,   tube: 0.04,  col: 0xF05023, op: 0.75, rx:  0.3, ry: 0,   rz:  0.1, sx: 0.006, sy: 0.004, sz: 0 },
            { r: 7.5, tube: 0.025, col: 0xffffff, op: 0.22, rx:  1.1, ry: 0.5, rz:  0,   sx: 0,     sy: 0.003, sz: 0.005 },
            { r: 9.2, tube: 0.018, col: 0xF05023, op: 0.15, rx:  0.1, ry: 0.9, rz:  1.5, sx: 0.003, sy: 0,     sz: 0.004 },
            { r: 11,  tube: 0.012, col: 0xffffff, op: 0.08, rx: -0.5, ry: 1.2, rz: -0.3, sx: 0.002, sy: 0.003, sz: 0.001 },
          ].forEach((c) => {
            const ring = new THREE.Mesh(new THREE.TorusGeometry(c.r, c.tube, 6, 120),
              new THREE.MeshBasicMaterial({ color: c.col, transparent: true, opacity: c.op }));
            ring.position.copy(ORB);
            ring.rotation.set(c.rx, c.ry, c.rz);
            scene.add(ring);
            rings.push({ mesh: ring, sx: c.sx, sy: c.sy, sz: c.sz });
          });

          const miniOrb = new THREE.Mesh(new THREE.OctahedronGeometry(3, 1),
            new THREE.MeshBasicMaterial({ color: 0xF05023, wireframe: true, transparent: true, opacity: 0.12 }));
          miniOrb.position.set(-18, -4, -14); scene.add(miniOrb);

          // Floating debris
          const floaters: any[] = [];
          const fGeos = [
            new THREE.OctahedronGeometry(1, 0),
            new THREE.TetrahedronGeometry(0.9, 0),
            new THREE.IcosahedronGeometry(0.8, 0),
            new THREE.BoxGeometry(1.4, 1.4, 1.4),
          ];
          for (let i = 0; i < 22; i++) {
            const isAccent = i % 3 === 0;
            const m = new THREE.Mesh(fGeos[i % fGeos.length],
              new THREE.MeshBasicMaterial({ color: isAccent ? 0xF05023 : 0xffffff, wireframe: true, transparent: true, opacity: 0.05 + Math.random() * 0.18 }));
            const a = Math.random() * Math.PI * 2, d = 20 + Math.random() * 35;
            m.position.set(Math.cos(a) * d, (Math.random() - 0.5) * 38, -10 - Math.random() * 40);
            m.scale.setScalar(0.6 + Math.random() * 3);
            scene.add(m);
            floaters.push({ mesh: m, rx: (Math.random() - 0.5) * 0.013, ry: (Math.random() - 0.5) * 0.019, rz: (Math.random() - 0.5) * 0.009, baseY: m.position.y, fSpeed: 0.3 + Math.random() * 0.7, fAmp: 0.6 + Math.random() * 2.2, fPhase: Math.random() * Math.PI * 2 });
          }

          // Particle field
          const PC = 1800;
          const pPos = new Float32Array(PC * 3), pCol = new Float32Array(PC * 3), pSpd = new Float32Array(PC);
          for (let i = 0; i < PC; i++) {
            pPos[i*3] = (Math.random() - 0.5) * 240;
            pPos[i*3+1] = (Math.random() - 0.5) * 140;
            pPos[i*3+2] = (Math.random() - 0.5) * 160 - 20;
            pSpd[i] = 0.006 + Math.random() * 0.022;
            if (Math.random() < 0.16) { pCol[i*3]=0.94; pCol[i*3+1]=0.31; pCol[i*3+2]=0.14; }
            else { const v = 0.08 + Math.random() * 0.42; pCol[i*3]=v; pCol[i*3+1]=v; pCol[i*3+2]=v; }
          }
          const pGeo = new THREE.BufferGeometry();
          pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
          pGeo.setAttribute('color', new THREE.BufferAttribute(pCol, 3));
          scene.add(new THREE.Points(pGeo, new THREE.PointsMaterial({ size: 0.09, vertexColors: true, transparent: true, opacity: 0.9, sizeAttenuation: true })));

          // Speed streaks
          const streaks: any[] = [];
          let streakTimer = 0;
          function spawnStreak() {
            const y = (Math.random() - 0.5) * 55, z = -4 + Math.random() * 16, len = 5 + Math.random() * 22;
            const v = new Float32Array([-70, y, z, -70 + len, y, z]);
            const geo = new THREE.BufferGeometry();
            geo.setAttribute('position', new THREE.BufferAttribute(v, 3));
            const mat = new THREE.LineBasicMaterial({ color: Math.random() < 0.38 ? 0xF05023 : 0xffffff, transparent: true, opacity: 0.45 + Math.random() * 0.55 });
            const line = new THREE.LineSegments(geo, mat);
            scene.add(line);
            streaks.push({ line, geo, mat, speed: 1.8 + Math.random() * 5.5 });
          }

          // Scan beam
          const scanBeam = new THREE.Mesh(new THREE.PlaneGeometry(320, 0.07),
            new THREE.MeshBasicMaterial({ color: 0xF05023, transparent: true, opacity: 0.28, side: THREE.DoubleSide }));
          scanBeam.position.set(0, 0, 7); scene.add(scanBeam);

          // Data columns
          [-32, -18, 18, 32].forEach((x) => {
            const v = new Float32Array([x, -60, -20, x, 60, -20]);
            const geo = new THREE.BufferGeometry();
            geo.setAttribute('position', new THREE.BufferAttribute(v, 3));
            scene.add(new THREE.LineSegments(geo,
              new THREE.LineBasicMaterial({ color: 0xF05023, transparent: true, opacity: 0.06 })));
          });

          // Mouse parallax
          let mx = 0, my = 0;
          const onMouseMove = (e: MouseEvent) => {
            mx = (e.clientX / window.innerWidth - 0.5) * 2;
            my = -(e.clientY / window.innerHeight - 0.5) * 2;
          };
          hero.addEventListener('mousemove', onMouseMove);

          // Animation loop
          function animate() {
            if (disposed) return;
            animId = requestAnimationFrame(animate);
            const t = clock.getElapsedTime();

            gridMesh.position.z = 10 + (t * 2.8) % 7;
            outerOrb.rotation.x += 0.0025; outerOrb.rotation.y += 0.005;
            midOrb.rotation.x -= 0.004; midOrb.rotation.z += 0.006;
            discMesh.rotation.z = t * 0.8;
            coreOrb.scale.setScalar(1 + 0.22 * Math.sin(t * 2.6));
            rings.forEach((r) => { r.mesh.rotation.x += r.sx; r.mesh.rotation.y += r.sy; r.mesh.rotation.z += r.sz; });
            miniOrb.rotation.x += 0.007; miniOrb.rotation.y -= 0.009;
            floaters.forEach((f) => { f.mesh.rotation.x += f.rx; f.mesh.rotation.y += f.ry; f.mesh.rotation.z += f.rz; f.mesh.position.y = f.baseY + Math.sin(t * f.fSpeed + f.fPhase) * f.fAmp; });
            for (let i = 0; i < PC; i++) { pPos[i*3+1] += pSpd[i]; if (pPos[i*3+1] > 70) pPos[i*3+1] = -70; }
            pGeo.attributes.position.needsUpdate = true;
            streakTimer += 0.016;
            if (streakTimer > 0.32) { streakTimer = 0; spawnStreak(); }
            for (let i = streaks.length - 1; i >= 0; i--) {
              streaks[i].line.position.x += streaks[i].speed;
              if (streaks[i].line.position.x > 120) { scene.remove(streaks[i].line); streaks[i].geo.dispose(); streaks[i].mat.dispose(); streaks.splice(i, 1); }
            }
            scanBeam.position.y = 26 * Math.sin(t * 0.32);
            (scanBeam.material as any).opacity = 0.1 + 0.22 * Math.abs(Math.cos(t * 0.32));
            cam.position.x += (mx * 4 - cam.position.x) * 0.038;
            cam.position.y += (my * 2.2 + 2 - cam.position.y) * 0.038;
            cam.lookAt(0, 0, 0);
            renderer.render(scene, cam);
          }
          animate();

          const onResize = () => {
            const w = canvas.clientWidth, h = canvas.clientHeight;
            cam.aspect = w / h; cam.updateProjectionMatrix(); renderer.setSize(w, h);
          };
          window.addEventListener('resize', onResize);

          // Store cleanup in closure
          (renderer as any).__dispose = () => {
            hero.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('resize', onResize);
            renderer.dispose();
          };
        } catch (e) {
          console.warn('WebGL unavailable', e);
        }
      })
      .catch((e) => console.warn('Three.js load failed', e));

    return () => {
      disposed = true;
      cancelAnimationFrame(animId);
      const r = (canvasRef.current as any)?.__renderer;
      if (r?.__dispose) r.__dispose();
    };
  }, []);
  THREE.JS ANIMATION COMMENTED OUT */

  // ── Periodic glitch on FOG letters ───────────────────────────────────────
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    function schedule() {
      timer = setTimeout(() => {
        setGlitchIdx(Math.floor(Math.random() * 3));
        setTimeout(() => setGlitchIdx(null), 180);
        schedule();
      }, 3000 + Math.random() * 4000);
    }
    schedule();
    return () => clearTimeout(timer);
  }, []);

  const cycleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Auto-cycle: FOG (4s) ↔ FUTURE OF GAMING (4s), pauses on hover ──────────
  const scheduleSwitch = useCallback((currentPhase: 'fog' | 'future') => {
    if (cycleTimerRef.current) clearTimeout(cycleTimerRef.current);
    cycleTimerRef.current = setTimeout(() => {
      if (isHoveringRef.current) return; // paused — resume happens on mouse leave
      const next = currentPhase === 'fog' ? 'future' : 'fog';
      setHeroTransitioning(true);
      setTimeout(() => {
        setHeroPhase(next);
        if (next === 'fog') setFogRevealKey(k => k + 1);
        setHeroTransitioning(false);
        scheduleSwitch(next);
      }, 400);
    }, 4000);
  }, []);

  useEffect(() => {
    scheduleSwitch('fog');
    return () => { if (cycleTimerRef.current) clearTimeout(cycleTimerRef.current); };
  }, [scheduleSwitch]);

  // ── Haze mouse parallax ───────────────────────────────────────────────────
  useEffect(() => {
    const hero = heroRef.current;
    const haze = hazeRef.current;
    if (!hero || !haze) return;
    function onMove(e: MouseEvent) {
      const { left, top, width, height } = hero!.getBoundingClientRect();
      const nx = (e.clientX - left) / width  - 0.5;
      const ny = (e.clientY - top)  / height - 0.5;
      haze!.style.transform = `translate(${nx * -30}px, ${ny * -20}px)`;
    }
    hero.addEventListener('mousemove', onMove);
    return () => hero.removeEventListener('mousemove', onMove);
  }, []);

  // ── Hover: pause cycle while cursor is over the hero text ────────────────
  function handleFogHoverEnter() {
    if (typeof window !== 'undefined' && !window.matchMedia('(hover: hover)').matches) return;
    isHoveringRef.current = true;
    if (cycleTimerRef.current) clearTimeout(cycleTimerRef.current);
  }

  function handleFutureHoverLeave() {
    if (typeof window !== 'undefined' && !window.matchMedia('(hover: hover)').matches) return;
    isHoveringRef.current = false;
    // resume cycle from current phase
    scheduleSwitch(heroPhase);
  }


  // ── Count-up ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const section = aboutRef.current;
    if (!section) return;

    function countUp(target: number, duration: number, key: keyof typeof counts) {
      const start = performance.now();
      function update(now: number) {
        const p = Math.min((now - start) / duration, 1);
        const ease = 1 - Math.pow(1 - p, 3);
        setCounts((prev) => ({ ...prev, [key]: Math.round(ease * target) }));
        if (p < 1) requestAnimationFrame(update);
      }
      requestAnimationFrame(update);
    }

    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !countsTriggered.current) {
          countsTriggered.current = true;
          countUp(10, 1800, 'dailyPlayers');
          countUp(70, 1800, 'repeatRate');
          countUp(10, 1800, 'countries');
          obs.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    obs.observe(section);
    return () => obs.disconnect();
  }, []);

  // ── Cards reveal ─────────────────────────────────────────────────────────
  useEffect(() => {
    const section = aboutRef.current;
    if (!section) return;
    const cards = section.querySelectorAll(`.${styles.anCard}`);
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          cards.forEach((c, i) => {
            setTimeout(() => c.classList.add(styles.visible ?? 'visible'), i * 120);
          });
          obs.disconnect();
        }
      },
      { threshold: 0.25 }
    );
    obs.observe(section);
    return () => obs.disconnect();
  }, []);

  // ── Moments AI Break observer ────────────────────────────────────────────
  useEffect(() => {
    const section = mbBreakRef.current;
    if (!section) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) { setMbActivated(true); obs.disconnect(); }
      },
      { threshold: 0.35 }
    );
    obs.observe(section);
    return () => obs.disconnect();
  }, []);

  // ── Product thumb auto-advance ───────────────────────────────────────────
  useEffect(() => {
    const timers = PRODUCTS.map((prod) => {
      if (prod.thumbs.length <= 1) return null;
      let idx = 0;
      return setInterval(() => {
        idx = (idx + 1) % prod.thumbs.length;
        setActiveThumbs((prev) => ({ ...prev, [prod.id]: idx }));
        setBgStates((prev) => ({
          ...prev,
          [prod.id]: { bg: prod.thumbs[idx].bg, pos: prod.thumbs[idx].pos },
        }));
      }, 6000);
    });
    return () => timers.forEach((t) => { if (t) clearInterval(t); });
  }, []);


  // ── amCharts globe ───────────────────────────────────────────────────────
  useEffect(() => {
    const el = globeRef.current;
    if (!el) return;
    let root: any;

    Promise.all([
      loadScript('https://cdn.amcharts.com/lib/5/index.js'),
    ])
      .then(() => loadScript('https://cdn.amcharts.com/lib/5/map.js'))
      .then(() => loadScript('https://cdn.amcharts.com/lib/5/geodata/worldLow.js'))
      .then(() => loadScript('https://cdn.amcharts.com/lib/5/themes/Animated.js'))
      .then(() => {
        if (!el.isConnected) return;
        try {
          // Dispose existing root if it exists on the element
          const existingRoot = (el as any)._am5root;
          if (existingRoot) {
            existingRoot.dispose();
          }

          root = am5.Root.new(el);
          (el as any)._am5root = root; // Store root reference on the element

          root.setThemes([am5themes_Animated.new(root)]);

          const chart = root.container.children.push(am5map.MapChart.new(root, {
            panX: 'rotateX', panY: 'rotateY',
            projection: am5map.geoOrthographic(),
            paddingBottom: 20, paddingTop: 20, paddingLeft: 20, paddingRight: 20,
            wheelY: 'none', wheelX: 'none', pinchZoom: false,
          }));

          const polygonSeries = chart.series.push(am5map.MapPolygonSeries.new(root, { geoJSON: am5geodata_worldLow }));
          polygonSeries.mapPolygons.template.setAll({
            fill: am5.color(0xFFFFFF), fillOpacity: 0.9,
            stroke: am5.color(0x131313), strokeWidth: 0.3,
            tooltipText: '{name}', toggleKey: 'active', interactive: true,
          });
          polygonSeries.mapPolygons.template.states.create('hover', {
            fill: am5.color(0xF05023), fillOpacity: 0.85,
          });

          const bgSeries = chart.series.push(am5map.MapPolygonSeries.new(root, {}));
          bgSeries.mapPolygons.template.setAll({
            fill: root.interfaceColors.get('alternativeBackground'), fillOpacity: 0.1, strokeOpacity: 0,
          });
          bgSeries.data.push({ geometry: am5map.getGeoRectangle(90, 180, -90, -180) });

          const graticuleSeries = chart.series.push(am5map.GraticuleSeries.new(root, {}));
          graticuleSeries.mapLines.template.setAll({
            strokeOpacity: 0.1, stroke: root.interfaceColors.get('alternativeBackground'),
          });

          const pointSeries = chart.series.push(am5map.MapPointSeries.new(root, {}));
          pointSeries.bullets.push(() => {
            const circle = am5.Circle.new(root, { radius: 6, fill: am5.color(0xF05023), strokeOpacity: 0, tooltipText: '{title}' });
            circle.animate({ key: 'radius', from: 6, to: 12, duration: 1200, easing: am5.ease.out(am5.ease.cubic), loops: Infinity, alternating: true });
            circle.animate({ key: 'opacity', from: 1, to: 0.3, duration: 1200, easing: am5.ease.out(am5.ease.cubic), loops: Infinity, alternating: true });
            return am5.Bullet.new(root, { sprite: circle });
          });

          pointSeries.data.setAll([
            { title: 'India', latitude: 20.5, longitude: 78.9 },
            { title: 'Bangalore', latitude: 12.9, longitude: 77.5 },
            { title: 'Mumbai', latitude: 19.0, longitude: 72.8 },
            { title: 'Delhi', latitude: 28.6, longitude: 77.2 },
            { title: 'Hyderabad', latitude: 17.3, longitude: 78.4 },
            { title: 'Sydney', latitude: -33.8, longitude: 151.2 },
            { title: 'Melbourne', latitude: -37.8, longitude: 144.9 },
            { title: 'Singapore', latitude: 1.35, longitude: 103.8 },
            { title: 'Dubai', latitude: 25.2, longitude: 55.2 },
            { title: 'London', latitude: 51.5, longitude: -0.1 },
          ]);

          let rotAnim: any = null;
          function startRotation() {
            const currentX = chart.get('rotationX') || 0;
            if (rotAnim) rotAnim.stop();
            rotAnim = chart.animate({ key: 'rotationX', from: currentX, to: currentX + 360, duration: 8000, loops: Infinity });
          }
          startRotation();

          el.addEventListener('mouseenter', () => { if (rotAnim) rotAnim.pause(); });
          el.addEventListener('mouseleave', () => startRotation());

          chart.appear(1000, 100);
        } catch (e) { console.warn('amCharts error', e); }
      })
      .catch((e) => console.warn('amCharts load failed', e));

    return () => { try { root?.dispose(); } catch (_) { } };
  }, []);

  // ── Helpers ──────────────────────────────────────────────────────────────
  function formatDate(iso: string) {
    try { return new Date(iso).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }); }
    catch { return iso; }
  }

  function handleThumbClick(prodId: string, idx: number) {
    setActiveThumbs((prev) => ({ ...prev, [prodId]: idx }));
    const prod = PRODUCTS.find((p) => p.id === prodId)!;
    setBgStates((prev) => ({
      ...prev,
      [prodId]: { bg: prod.thumbs[idx].bg, pos: prod.thumbs[idx].pos },
    }));
  }

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <>
      {/* ── HERO ──────────────────────────────────────────────────────── */}
      <section id="hero" className={styles.hero} ref={heroRef} aria-label="Hero">
        <h1 className="sr-only">FOG Technologies — Future of Gaming</h1>
        
        {/* Three interactive product panels */}
        <div className={styles.heroPanels}>
          
          {/* Panel 1: Laser Spy */}
          <div className={styles.heroPanel}>
            <Image 
              src="/images/Landing Page/spy.jpg" 
              alt="Laser Spy attraction" 
              fill 
              style={{ objectFit: 'cover' }}
              sizes="(max-width: 768px) 100vw, 33vw"
              priority
            />
            <div className={styles.panelOverlay} />
          </div>

          {/* Panel 2: HyperGrid */}
          <div className={styles.heroPanel}>
            <Image 
              src="/images/Landing Page/hypergrid.png" 
              alt="HyperGrid attraction" 
              fill 
              style={{ objectFit: 'cover' }}
              sizes="(max-width: 768px) 100vw, 33vw"
              priority
            />
            <div className={styles.panelOverlay} />
          </div>

          {/* Panel 3: Laser Tag */}
          <div className={styles.heroPanel}>
            <Image 
              src="/images/Landing Page/lasertag.png" 
              alt="Laser Tag attraction" 
              fill 
              style={{ objectFit: 'cover' }}
              sizes="(max-width: 768px) 100vw, 33vw"
              priority
            />
            <div className={styles.panelOverlay} />
          </div>

        </div>
        
        {/* L1: Premium color tint grading filter */}
        <div className={styles.heroFilter} aria-hidden="true" />
        <div className={styles.heroOverlay} aria-hidden="true" />

        {/* Hero text overlay - aligned left, style inspired by Bolt */}
        <div className={styles.heroTextContainer}>
          <h2 className={styles.heroHeadline}>
            <span className={styles.revealLine} style={{ animationDelay: '0.2s' }}>Future of</span> <br />
            <span className={`${styles.revealLine} ${styles.highlightText}`} style={{ animationDelay: '0.5s' }}>Gaming</span>
          </h2>
        </div>

        {/* ── LOGO STRIP — pinned to bottom of hero ── */}
        <div className={styles.logoStripInHero} aria-label="Our venues">
          <span className={styles.logoStripLabel}>TRUSTED BY</span>
          <div className={styles.logoStripDivider} aria-hidden="true" />
          <div className={styles.marqueeWrap} aria-label="Venue partners">
            <div className={styles.marqueeTrack} aria-hidden="true">
              {[...Array(4)].flatMap(() => [
                { src: '/images/gamezones_logo/skyjumper-logo.png', alt: 'Sky Jumper' },
                { src: '/images/gamezones_logo/timezone-logo.png', alt: 'Timezone' },
                { src: '/images/gamezones_logo/xplore-logo.png', alt: 'Xplore' },
                { src: '/images/gamezones_logo/rebounce-logo.png', alt: 'Rebounce' },
                { src: '/images/gamezones_logo/hopup-logo.png', alt: 'Hopup' },
                { src: '/images/gamezones_logo/mastizone-logo.png', alt: 'Mastizone' },
              ]).map((logo, i) => (
                <Image
                  key={i}
                  src={logo.src}
                  alt={logo.alt}
                  width={200}
                  height={120}
                  className={logo.alt === 'Xplore' ? styles.xploreLogo : undefined}
                  style={{ objectFit: 'contain' }}
                  loading="lazy"
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── ABOUT & NUMBERS ───────────────────────────────────────────── */}
      <section
        id="about"
        className={styles.aboutNumbers}
        ref={aboutRef}
        aria-label="About FOG"
        data-nav-theme="light"
      >
        <div className={styles.aboutNumbersInner}>
          <div className={styles.anHeader}>
            <div className={styles.anHeaderLeft}>
              <span className={styles.anLabel} data-reveal />
              <h2 className={styles.anHeadline} data-reveal>
                Getting to know FOG
              </h2>
            </div>
            <div className={styles.anBodyCol} data-reveal data-reveal-delay="0.1">
              <p className={styles.anBody}>
                Operators invest in FOG products for the ROI. Their players return for the experience.
                That gap between investment and love — that&rsquo;s what we build.
              </p>
            </div>
          </div>

          <div className={styles.anStats}>
            <div className={`${styles.anCard} ${styles.anCardOrange}`}>
              <div className={styles.anNumRow}>
                <span className={styles.anNum}>
                  <span>{counts.dailyPlayers}</span>K+
                </span>
                <span className={styles.anUnit}>Daily Players</span>
              </div>
              <p className={styles.anDesc}>
                Over 10,000 players across all active FOG venues globally
              </p>
            </div>

            <div className={`${styles.anCard} ${styles.anCardDark}`}>
              <div className={styles.anNumRow}>
                <span className={styles.anNum}>
                  <span>{counts.repeatRate}</span>%
                </span>
              </div>
              <p className={styles.anDesc}>
                Average repeat players rate across all FOG venues
              </p>
            </div>

            <div className={`${styles.anCard} ${styles.anCardLight}`}>
              <div className={styles.anNumRow}>
                <span className={styles.anNum}>
                  <span>{counts.countries}</span>+
                </span>
              </div>
              <p className={styles.anDesc}>
                Countries spanning 3 continents and growing
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── PRODUCTS STICKY STACK ─────────────────────────────────────── */}
      <div id="products-wrapper" className={styles.productsWrapper}>

        {PRODUCTS.map((prod) => {
          const bg = bgStates[prod.id];
          return (
            <section
              key={prod.id}
              id={`prod-${prod.id}`}
              className={`${styles.productSection} ${prod.sectionCls}`}
              aria-label={`${prod.name} product`}
              {...(prod.navTheme ? { 'data-nav-theme': prod.navTheme } : {})}
            >
              <div
                className={styles.prodBg}
                style={{ backgroundImage: `url('${bg.bg}')`, backgroundPosition: bg.pos }}
                aria-hidden="true"
              />
              <div className={styles.prodOverlay} aria-hidden="true" />
              <div className={styles.prodText}>
                {/* <span className={styles.prodNum}>{prod.num}</span> */}
                <h2 className={`${styles.prodName} ${prod.extraNameCls}`}>{prod.name}</h2>
                <p className={styles.prodDesc}>{prod.desc}</p>
                <Link href={prod.href} className={styles.prodBtn}>
                  Learn More &rarr;
                </Link>
              </div>
              <div
                className={styles.prodThumbs}
                role="group"
                aria-label={`${prod.name} images`}
              >
                {prod.thumbs.map((thumb, i) => (
                  <button
                    key={i}
                    className={`${styles.prodThumb} ${activeThumbs[prod.id] === i ? styles.prodThumbActive : ''}`}
                    aria-label={`View ${prod.name} image ${i + 1}`}
                    onClick={() => handleThumbClick(prod.id, i)}
                  >
                    <Image
                      src={thumb.bg}
                      alt={thumb.alt}
                      width={116}
                      height={72}
                      style={{ objectFit: 'cover', objectPosition: thumb.pos }}
                      loading="lazy"
                    />
                  </button>
                ))}
              </div>
            </section>
          );
        })}

        {/* ── Moments AI Break ──────────────────────────────────────────── */}
        <section
          id="prod-moments-break"
          className={`${styles.productSection} ${styles.prodMomentsBreak} ${mbActivated ? styles.mbActivated : ''}`}
          aria-label="Powered by Moments AI"
          ref={mbBreakRef as any}
        >
          <div className={styles.mbBg} aria-hidden="true" />
          <div className={styles.mbSweep} aria-hidden="true" />
          <div className={`${styles.mbRule} ${styles.mbRuleL}`} aria-hidden="true" />
          <div className={`${styles.mbRule} ${styles.mbRuleR}`} aria-hidden="true" />

          <div className={styles.mbInner}>
            <div className={styles.mbEyebrowWrap} aria-hidden="true">
              <span className={styles.mbDash}>&mdash;</span>
              <p className={styles.mbEyebrow}>
                {['P', 'O', 'W', 'E', 'R', 'E', 'D', ' ', ' ', 'B', 'Y'].map((ch, i) => (
                  <span key={i} style={{ ['--i' as string]: i }}>{ch === ' ' ? '\u00A0\u00A0' : ch}</span>
                ))}
              </p>
              <span className={styles.mbDash}>&mdash;</span>
            </div>

            <h2 className={styles.mbHeadline}>
              <span className={styles.mbMoments}>MOMENTS</span>
              <span className={styles.mbAiWrap}>
                <span className={styles.mbAi}>AI</span>
              </span>
            </h2>

            <p className={styles.mbSub}>
              Our proprietary AI system that
              <br />delivers every player&rsquo;s best moment automatically.
            </p>

            {/* <div className={styles.mbTags} aria-hidden="true">
              <span className={styles.mbTag}>Real-Time Capture</span>
              <span className={styles.mbTagDot}>&middot;</span>
              <span className={styles.mbTag}>AI Scoring</span>
              <span className={styles.mbTagDot}>&middot;</span>
              <span className={styles.mbTag}>Instant Delivery</span>
            </div> */}
          </div>
        </section>

        {/* ── Moments product ───────────────────────────────────────────── */}
        <section
          id="prod-moments"
          className={`${styles.productSection} ${styles.prodMoments}`}
          aria-label="Moments product"
        >
          <div className={styles.momentsBg} aria-hidden="true" />
          <div className={styles.prodOverlayMoments} aria-hidden="true" />
          <div className={styles.prodText}>
            {/* <span className={styles.prodNum}>04</span> */}
            <h2 className={styles.prodName}>Moments</h2>
            <p className={styles.prodDesc}>AI-powered highlight capture. <br /> Every player leaves with their story.</p>
            {/* <Link href="/products/moments" className={styles.prodBtn}>
              Learn More &#x2192;
            </Link> */}
          </div>
          <div className={styles.momentsVideoStrip} aria-label="Moments highlights reel">
            <div className={styles.momentsVideoTrack} aria-hidden="true">
              {[...Array(2)].flatMap((_, outerIdx) =>
                ['clip1.mp4', 'clip2.mp4', 'clip3.mp4', 'clip4.mp4', 'clip5.mp4'].map((clip, innerIdx) => (
                  <div key={`${outerIdx}-${clip}-${innerIdx}`} className={styles.momentsVideoCard}>
                    <video autoPlay muted loop playsInline>
                      <source src={`/videos/${clip}`} type="video/mp4" />
                    </video>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

      </div>{/* /#products-wrapper */}

      {/* ── TESTIMONIALS ── */}
      <TestimonialsCarousel testimonials={initialTestimonials} />

      {/* ── GLOBE ─────────────────────────────────────────────────────── */}
      <section id="globe-section" className={styles.globeSection} aria-label="Global footprint">
        <div className={styles.globeInner}>
          <div ref={globeRef} className={styles.chartdiv} aria-hidden="true" />
          <div className={styles.globeText}>
            <h2 className={styles.globeHeadline} data-reveal>
              Our<br />Locations
            </h2>
            <p className={styles.globeSub} data-reveal data-reveal-delay="0.1">
              100+ active venues. 10+ countries. One platform that scales with your business.
            </p>
            <div className={styles.globePill} data-reveal data-reveal-delay="0.2">
              <span className={styles.pulseDot}>&#x25CF;</span> Live in 10+ Countries
            </div>
          </div>
        </div>
      </section>

      {/* ── BLOG ──────────────────────────────────────────────────────── */}
      <section id="blog" className={styles.blog} aria-labelledby="blog-heading" data-nav-theme="surface">
        <div className={styles.blogInner}>
          <div className={styles.blogHeader}>
            <div>
              <h2 id="blog-heading" className={styles.blogHeaderTitle} data-reveal>
                Insights &amp; Updates
              </h2>
            </div>
            <Link href="/blog" className={styles.blogViewAll} data-reveal data-reveal-delay="0.1">
              View All &#x2192;
            </Link>
          </div>
          <div className={styles.blogGrid}>
            {blogPosts.map((post, i) => (
              <article
                key={post.id}
                className={styles.blogCard}
                tabIndex={0}
                data-reveal
                data-reveal-delay={String(i * 0.12)}
              >
                <Link
                  href={`/blog/${post.id}`}
                  className={styles.blogCardLink}
                  aria-label={`Read: ${post.title}`}
                >
                  <div className={styles.blogImg}>
                    {post.image ? (
                      <Image
                        src={post.image}
                        alt={post.title}
                        fill
                        style={{ objectFit: 'cover' }}
                        sizes="(max-width: 767px) 100vw, (max-width: 1199px) 50vw, 33vw"
                      />
                    ) : (
                      <div style={{ width: '100%', height: '100%', background: '#1c1c1c' }} />
                    )}
                  </div>
                  <div className={styles.blogBody}>
                    <p className={styles.blogCat}>{post.category}</p>
                    <h3 className={styles.blogTitle}>{post.title}</h3>
                    <p className={styles.blogDate}>
                      {formatDate(post.date)} &middot; {post.readTime} min read
                    </p>
                    <p className={styles.blogExcerpt}>{post.excerpt}</p>
                    <span className={styles.blogRead}>Read More</span>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── CONTACT FORM ──────────────────────────────────────────────── */}
      <ContactForm />
    </>
  );
}
