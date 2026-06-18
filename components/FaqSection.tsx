'use client';

import { useState } from 'react';
import styles from './faq.module.css';

export interface FaqItem {
  q: string;
  a: string;
}

interface Props {
  items: FaqItem[];
  lede?: string;
}

export default function FaqSection({ items, lede }: Props) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (i: number) => setOpenIndex((prev) => (prev === i ? null : i));

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches) return;
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const maxTilt = 4;
    const percentX = (x - centerX) / centerX;
    const percentY = (y - centerY) / centerY;
    card.style.setProperty('--rx', `${-percentY * maxTilt}deg`);
    card.style.setProperty('--ry', `${percentX * maxTilt}deg`);
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    e.currentTarget.style.setProperty('--rx', '0deg');
    e.currentTarget.style.setProperty('--ry', '0deg');
    setOpenIndex(null);
  };

  return (
    <section className={styles.section} data-nav-theme="light">
      <div className={styles.faq}>
        <div className={styles.intro}>
          <h2 className={styles.title}>FAQ</h2>
          {lede && <p className={styles.lede}>{lede}</p>}
          <button type="button" className={styles.ask}>
            <span>Ask a question</span>
          </button>
        </div>

        <div className={styles.list}>
          {items.map((item, i) => {
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
