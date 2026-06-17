'use client';

import { useState } from 'react';
import styles from './faq.module.css';

const FAQ_ITEMS = [
  {
    q: "How much space does Laser Spy require?",
    a: "Laser Spy is highly modular. The ideal room size is 200 to 1,200 sq ft, with 300 to 600 sq ft being the standard layout. A minimum ceiling height of 8.5 ft is recommended to accommodate the overhead sensor arrays and laser grid mounts.",
  },
  {
    q: "Does it need a dedicated operator to run?",
    a: "No. Laser Spy is designed as a fully autonomous attraction. The integrated entry kiosk handles ticketing, game mode selection (Recruit to Elite), safety briefings, and automatic startup without requiring any active floor staff.",
  },
  {
    q: "Can we customize the laser layouts and difficulty?",
    a: "Yes. Through the FOG Control Suite, operators can customize individual laser paths, timing configurations, and game modes. We provide 4 standard themes (Laser Wars, Laser Ship, Laser Lab, and Laser Spy) pre-installed.",
  },
  {
    q: "How do players get their highlight videos?",
    a: "Our overhead AI-driven cameras track the player's movement in real-time, auto-cutting a high-definition 30-second action clip. At the exit, players simply scan the kiosk QR code to instantly share their video on Instagram, TikTok, or YouTube.",
  },
  {
    q: "What support and hardware warranty are included?",
    a: "We provide a 3-year warranty on all laser modules and sensor hardware, lifetime software updates, and 24/7 remote technical support. All key components are hot-swappable, allowing swaps in under 15 minutes to prevent downtime.",
  },
];

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (i: number) => setOpenIndex((prev) => (prev === i ? null : i));

  // 3D Card Tilt Effect
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches) return;
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const maxTilt = 4; // Max tilt angle in degrees
    const percentX = (x - centerX) / centerX;
    const percentY = (y - centerY) / centerY;
    const tiltX = -percentY * maxTilt;
    const tiltY = percentX * maxTilt;
    card.style.setProperty('--rx', `${tiltX}deg`);
    card.style.setProperty('--ry', `${tiltY}deg`);
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    card.style.setProperty('--rx', '0deg');
    card.style.setProperty('--ry', '0deg');
    setOpenIndex(null);
  };

  return (
    <section className={styles.section} data-nav-theme="light">
      <div className={styles.faq}>
        <div className={styles.intro}>
          <h2 className={styles.title}>FAQ</h2>
          <p className={styles.lede}>
            Everything you need to know before installing the Laser Spy attraction at your venue.
          </p>
          <button type="button" className={styles.ask}>
            <span>Ask a question</span>
          </button>
        </div>

        <div className={styles.list}>
          {FAQ_ITEMS.map((item, i) => {
            const open = openIndex === i;
            return (
              <div key={i} className={styles.itemContainer}>
                <div
                  className={`${styles.item} ${open ? styles.itemOpen : ''}`}
                  onMouseEnter={() => setOpenIndex(i)}
                  onMouseMove={handleMouseMove}
                  onMouseLeave={handleMouseLeave}
                >
                  <div className={styles.itemInner}>
                    <button
                      type="button"
                      className={styles.head}
                      aria-expanded={open}
                      onClick={() => toggle(i)}
                    >
                      <span className={styles.q}>{item.q}</span>
                    </button>

                    <div className={styles.answer}>
                      <div className={styles.answerClip}>
                        <p className={styles.a}>{item.a}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
