'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import styles from './gallery.module.css';

/* ── CAROUSEL CONSTANTS ── */
const IMAGES = [
  'https://images.unsplash.com/photo-1603871165848-0aa92c869fa1?w=400',
  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400',
  'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400',
  'https://images.unsplash.com/photo-1579548122080-c35fd6820ecb?w=400',
  'https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=400',
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
  'https://images.unsplash.com/photo-1603871165848-0aa92c869fa1?w=400',
  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400',
  'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400',
];

const COUNT = IMAGES.length;
const STEP = 360 / COUNT; // 30 deg between cards
const RADIUS = 840;        // translateZ distance
const SPEED = 0.02;        // deg per frame ≈ one revolution / 18s at 60fps

const FEATURES = [
  {
    title: 'Lightning-Fast Image Generation',
    body: 'Type what you imagine, hit enter, and watch AI bring it to life in moments.',
  },
  {
    title: 'Multiple Styles & Customization',
    body: 'Pick a style and fine-tune details like color, lighting, and mood.',
  },
  {
    title: 'High-Resolution Downloads',
    body: 'Export your creations in high-quality resolution for print, web, or social media.',
  },
];

function GalleryCarousel() {
  const sceneRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const angleRef = useRef(0);
  const pausedRef = useRef(false);
  const rafRef = useRef<number | null>(null);
  const scrollVelocity = useRef(0);

  const [hovered, setHovered] = useState<number | null>(null);
  const hoveredRef = useRef<number | null>(null);
  useEffect(() => {
    hoveredRef.current = hovered;
  }, [hovered]);

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      scrollVelocity.current += e.deltaY * 0.005;
    };
    window.addEventListener('wheel', handleWheel, { passive: true });

    const tick = () => {
      scrollVelocity.current *= 0.92;
      const stepDeg = SPEED + scrollVelocity.current;
      if (!pausedRef.current) {
        angleRef.current += stepDeg;
      }
      const angle = angleRef.current;

      const scene = sceneRef.current;
      if (scene) {
        scene.style.transform = `rotateY(${angle}deg)`;
      }

      const hoveredIdx = hoveredRef.current;
      for (let i = 0; i < COUNT; i++) {
        const el = cardRefs.current[i];
        if (!el) continue;

        const worldAngle = i * STEP + angle;
        const facing = Math.cos((worldAngle * Math.PI) / 180);
        const t = (facing + 1) / 2;
        const depthScale = 0.7 + 0.3 * t;
        const opacity = 0.45 + 0.55 * t;

        const isHovered = hoveredIdx === i;
        const cardScale = isHovered ? 1.45 : depthScale;

        el.style.transform = `rotateY(${i * STEP}deg) translateZ(${-RADIUS}px) scale(${cardScale})`;
        el.style.opacity = String(hoveredIdx === null ? opacity : isHovered ? 1 : opacity);
        el.style.zIndex = String(isHovered ? 10 : Math.round(facing * 100));
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      window.removeEventListener('wheel', handleWheel);
    };
  }, []);

  const handleEnter = (i: number) => {
    pausedRef.current = true;
    setHovered(i);
  };
  const handleLeave = () => {
    pausedRef.current = false;
    setHovered(null);
  };

  return (
    <div className={styles.carouselClip}>
      <div className={styles.carouselWrap}>
        <div className={styles.scene} ref={sceneRef}>
          {IMAGES.map((src, i) => {
            const cardClass = [
              styles.card,
              hovered === i ? styles.hovered : '',
              hovered !== null && hovered !== i ? styles.dimmed : '',
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
              >
                <Image
                  src={src}
                  alt={`Gallery example ${i + 1}`}
                  width={160}
                  height={240}
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
  return (
    <section className={styles.gallerySection} data-nav-theme="dark">
      <div className={styles.glow} aria-hidden="true" />

      <div className={styles.inner}>
        <h2 className={styles.heading}>Create Stunning Images with Just a Prompt</h2>
        <p className={styles.subheading}>
          Turn your ideas into high-quality visuals in seconds, no design skills needed.
        </p>
      </div>

      <GalleryCarousel />

      <div className={styles.inner}>
        <div className={styles.features}>
          {FEATURES.map((f) => (
            <div className={styles.feature} key={f.title}>
              <h3 className={styles.featureTitle}>{f.title}</h3>
              <p className={styles.featureBody}>{f.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
