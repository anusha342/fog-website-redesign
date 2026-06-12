'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Image from 'next/image';
import styles from './gallery.module.css';

/* ── CAROUSEL DATA (12 GAME ROOM IMAGES) ── */
const GALLERY_DATA = [
  {
    src: 'https://images.unsplash.com/photo-1603871165848-0aa92c869fa1?w=400',
    category: 'Laser Navigation',
    title: 'Precision Grid Crawl',
    desc: 'Teammates crouch and slide underneath low-lying static infrared beam grids during the Ship Escape challenge.'
  },
  {
    src: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
    category: 'Speed Run',
    title: 'Checkpoint Sprint',
    desc: 'A player sprints down the laser-free corridor, aiming to hit the target node before the security grid reactivates.'
  },
  {
    src: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400',
    category: 'Multiplayer Co-Op',
    title: 'Dual-Emitter Defuse',
    desc: 'Coordinating beam blocks to bypass the mainframe firewall gate and unlock the central vault door.'
  },
  {
    src: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400',
    category: 'Tactical Reflexes',
    title: 'Sweeping Beam Leap',
    desc: 'Timing a perfect hurdle over a moving beam array as the system transitions into high-alert grid mode.'
  },
  {
    src: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400',
    category: 'Strategy Play',
    title: 'Shield Deflection',
    desc: 'Redirecting the laser emitter array using a handheld tactical mirror shield to trigger the target sensor.'
  },
  {
    src: 'https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=400',
    category: 'Security Breach',
    title: 'Laser Lab Infiltration',
    desc: 'Navigating an ultra-dense cluster of dynamic scanning laser corridors inside the chaotic scientist theme room.'
  },
  {
    src: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
    category: 'Pre-Game briefing',
    title: 'Strategic Map Study',
    desc: 'Teammates review the beam configurations and node positions on the external entry screen before starting their run.'
  },
  {
    src: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
    category: 'Precision Control',
    title: 'Infrared Matrix Dodge',
    desc: 'Carefully stepping through a multi-tiered array of lasers to reach the secondary checkpoint button.'
  },
  {
    src: 'https://images.unsplash.com/photo-1603871165848-0aa92c869fa1?w=400',
    category: 'System Diagnostics',
    title: 'Leaderboard Victory',
    desc: 'Checking the leaderboard stats at the terminal panel to review the final score and verify a successful run.'
  },
  {
    src: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
    category: 'Tactical Maneuver',
    title: 'Mainframe Bypass',
    desc: 'Using absolute coordination to cover sensor units in sync while negotiating active laser columns.'
  },
  {
    src: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400',
    category: 'Laser Sweep',
    title: 'Sweep Grid Jump',
    desc: 'Jumping over a dynamically oscillating laser emitter that sweeps across the floor plane in real-time.'
  },
  {
    src: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400',
    category: 'Co-Op Support',
    title: 'Teammate Target Cover',
    desc: 'An operator player holds a override gate panel open while their teammate maneuvers through the security sector.'
  }
];

const COUNT = GALLERY_DATA.length;
const STEP = 360 / COUNT;
const SPEED = 0.02;

interface GalleryCarouselProps {
  activeIdx: number;
  setActiveIdx: (idx: number) => void;
}

function GalleryCarousel({ activeIdx, setActiveIdx }: GalleryCarouselProps) {
  const sceneRef = useRef<HTMLDivElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  
  const angleRef = useRef(0);
  const targetAngleRef = useRef(0);
  const pausedRef = useRef(false);
  const rafRef = useRef<number | null>(null);

  // Drag state
  const [isDragging, setIsDragging] = useState(false);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const startAngleRef = useRef(0);

  const [hovered, setHovered] = useState<number | null>(null);
  const hoveredRef = useRef<number | null>(null);

  const activeIdxRef = useRef(activeIdx);
  const radiusRef = useRef(540);

  useEffect(() => {
    const handleResize = () => {
      radiusRef.current = window.innerWidth < 768 ? 320 : 540;
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Add scroll/wheel listener to support horizontal scrolling rotation
  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;

    const handleWheel = (e: WheelEvent) => {
      const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      // Scroll down/right rotates next cards in (decreases angle)
      targetAngleRef.current -= delta * 0.15;
      e.preventDefault();
    };

    wrap.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      wrap.removeEventListener('wheel', handleWheel);
    };
  }, []);

  useEffect(() => {
    activeIdxRef.current = activeIdx;
  }, [activeIdx]);

  useEffect(() => {
    hoveredRef.current = hovered;
  }, [hovered]);

  const handleCardClick = useCallback((i: number) => {
    if (isDraggingRef.current) return;
    const currentAngle = angleRef.current;
    const targetCardAngle = -i * STEP;
    
    // Normalize target angle to rotate the shortest path
    let diff = (targetCardAngle - currentAngle) % 360;
    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;
    
    targetAngleRef.current = currentAngle + diff;
    setActiveIdx(i);
  }, [setActiveIdx]);

  // Drag handlers
  const handleDragStart = (clientX: number) => {
    isDraggingRef.current = true;
    setIsDragging(true);
    startXRef.current = clientX;
    startAngleRef.current = targetAngleRef.current;
    pausedRef.current = true;
  };

  const handleDragMove = (clientX: number) => {
    if (!isDraggingRef.current) return;
    const deltaX = clientX - startXRef.current;
    // Convex layout drag direction: dragging left (negative deltaX) should rotate front face left (decrease target angle)
    const angleChange = deltaX * 0.28;
    targetAngleRef.current = startAngleRef.current + angleChange;
  };

  const handleDragEnd = () => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    setIsDragging(false);
    pausedRef.current = false;
  };

  // 3D Cylinder Loop Tick
  useEffect(() => {
    const tick = () => {
      const currentActiveIdx = activeIdxRef.current;

      // Progress auto-rotation target if not paused and not dragging (reverse for convex layout visual consistency)
      if (!pausedRef.current && !isDraggingRef.current) {
        targetAngleRef.current -= SPEED;
      }

      const diff = targetAngleRef.current - angleRef.current;
      angleRef.current += diff * 0.08;
      const angle = angleRef.current;

      const scene = sceneRef.current;
      if (scene) {
        scene.style.transform = 'none';
      }

      // Calculate which card is in front
      let maxFacing = -2;
      let centerIdx = 0;
      for (let i = 0; i < COUNT; i++) {
        const worldAngle = i * STEP + angle;
        const facing = Math.cos((worldAngle * Math.PI) / 180);
        if (facing > maxFacing) {
          maxFacing = facing;
          centerIdx = i;
        }
      }

      if (lastCenterIdxRef.current !== centerIdx) {
        lastCenterIdxRef.current = centerIdx;
        setActiveIdx(centerIdx);
      }

      const hoveredIdx = hoveredRef.current;
      for (let i = 0; i < COUNT; i++) {
        const el = cardRefs.current[i];
        if (!el) continue;

        const worldAngle = i * STEP + angle;
        let relAngle = worldAngle % 360;
        if (relAngle > 180) relAngle -= 360;
        if (relAngle < -180) relAngle += 360;

        const compression = 0.8;
        const theta = relAngle * (Math.PI / 180) * compression;
        const radius = radiusRef.current;
        
        const x = Math.sin(theta) * radius;
        const z = Math.cos(theta) * radius;
        const rotY = relAngle * compression;

        // Show center card + exactly 3 cards on left/right sides
        const stepDiff = Math.min(
          Math.abs(i - centerIdx),
          COUNT - Math.abs(i - centerIdx)
        );
        const isVisible = stepDiff <= 3;

        const isCenter = centerIdx === i;
        const isHovered = hoveredIdx === i && isCenter;
        
        // Active center card scales up to 1.25, side cards scale down to 0.85
        const cardScale = isHovered ? 1.35 : (isCenter ? 1.25 : 0.85);

        el.style.transform = `translate3d(${x}px, 0px, ${z}px) rotateY(${rotY}deg) scale(${cardScale})`;
        el.style.opacity = String(isVisible ? (isCenter ? 1 : 0.6) : 0);
        el.style.zIndex = String(isCenter ? 15 : 10 - stepDiff);
        el.style.pointerEvents = isVisible ? 'auto' : 'none';
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    const lastCenterIdxRef = { current: 0 };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [setActiveIdx]);

  const handleEnter = (i: number) => {
    // Only pause and scale-up when hovering the active centered photo
    if (activeIdx === i && !isDraggingRef.current) {
      pausedRef.current = true;
      setHovered(i);
    }
  };

  const handleLeave = () => {
    if (!isDraggingRef.current) {
      pausedRef.current = false;
      setHovered(null);
    }
  };

  return (
    <div className={styles.carouselClip}>
      <div 
        ref={wrapRef}
        className={styles.carouselWrap}
        onMouseDown={(e) => handleDragStart(e.clientX)}
        onMouseMove={(e) => handleDragMove(e.clientX)}
        onMouseUp={handleDragEnd}
        onMouseLeave={handleDragEnd}
        onTouchStart={(e) => handleDragStart(e.touches[0].clientX)}
        onTouchMove={(e) => handleDragMove(e.touches[0].clientX)}
        onTouchEnd={handleDragEnd}
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      >
        <div className={styles.scene} ref={sceneRef}>
          {GALLERY_DATA.map((item, i) => {
            const isCenter = activeIdx === i;
            const cardClass = [
              styles.card,
              hovered === i ? styles.hovered : '',
              isCenter ? styles.active : '',
              hovered !== null && hovered !== i && !isCenter ? styles.dimmed : '',
            ]
              .filter(Boolean)
              .join(' ');

            return (
              <div
                key={i}
                ref={(el) => { cardRefs.current[i] = el; }}
                className={cardClass}
                onMouseEnter={() => handleEnter(i)}
                onMouseLeave={handleLeave}
                onClick={() => handleCardClick(i)}
              >
                <Image
                  src={item.src}
                  alt={item.title}
                  width={170}
                  height={170}
                  className={styles.image}
                  unoptimized
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function GallerySection() {
  const [activeIdx, setActiveIdx] = useState(0);
  const activeData = GALLERY_DATA[activeIdx] || GALLERY_DATA[0];

  return (
    <section className={styles.gallerySection} data-nav-theme="dark">
      <div className={styles.glow} aria-hidden="true" />

      <div className={styles.inner}>
        <h2 className={styles.heading}>Create Stunning Images with Just a Prompt</h2>
        <p className={styles.subheading}>
          Turn your ideas into high-quality visuals in seconds, no design skills needed.
        </p>
      </div>

      <GalleryCarousel activeIdx={activeIdx} setActiveIdx={setActiveIdx} />

      {/* Centered Caption Text synced with active photo (matching user image layout style) */}
      <div className={styles.captionContainer}>
        <h3 className={styles.captionTitle}>{activeData.title}</h3>
        <p className={styles.captionCategory}>{activeData.category}</p>
        <p className={styles.captionDesc}>{activeData.desc}</p>
      </div>
    </section>
  );
}
