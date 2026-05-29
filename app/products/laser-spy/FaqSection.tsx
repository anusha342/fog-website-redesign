'use client';

import { useState } from 'react';
import styles from './faq.module.css';

const FAQ_ITEMS = [
  {
    q: "What\u2019s your process for designing and developing a new website?",
    a: "I start by understanding your brand and goals, then create a tailored design that reflects your vision. Once the design is approved, I develop the site with clean, scalable code and ensure it\u2019s fully tested before launch.",
  },
  {
    q: "What if I need to make changes or add features in the future?",
    a: "Absolutely. The site is built to be flexible, so adding new pages, sections, or features later is straightforward. Reach out any time and I\u2019ll scope the update and integrate it without disrupting what\u2019s already live.",
  },
  {
    q: "Do you offer SEO services?",
    a: "Yes. Every site is built with SEO best practices baked in \u2014 clean markup, fast load times, and a proper meta structure. I can also handle keyword research and on-page optimisation to help you rank for the terms that matter.",
  },
  {
    q: "How long does it typically take to see results from my brand\u2019s new website?",
    a: "It varies by goal, but most clients start seeing meaningful traction within the first few months as the site gains authority and your content compounds. SEO is a long game, but the foundation we build pays off steadily.",
  },
  {
    q: "How do you ensure the website is mobile-friendly?",
    a: "Every site is designed mobile-first and tested across real devices and screen sizes. Layouts, typography, and interactions are tuned to feel just as polished on a phone as they do on desktop.",
  },
];

function AskArrow() {
  return (
    <svg
      className={styles.askArrow}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#f06955"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 4 V11.5 a3 3 0 0 0 3 3 H18" />
      <path d="M14.5 10.5 L19 14.5 L14.5 18.5" />
    </svg>
  );
}

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (i: number) => setOpenIndex((prev) => (prev === i ? null : i));

  return (
    <section className={styles.section} data-nav-theme="light">
      <div className={styles.faq}>
        <div className={styles.intro}>
          <h2 className={styles.title}>FAQ</h2>
          <p className={styles.lede}>
            We&rsquo;ve heard it all. Here&rsquo;s everything you need to know
            before working with us.
          </p>
          <button type="button" className={styles.ask}>
            <AskArrow />
            <span>Ask a question</span>
          </button>
        </div>

        <div className={styles.list}>
          {FAQ_ITEMS.map((item, i) => {
            const open = openIndex === i;
            return (
              <div
                key={i}
                className={`${styles.item} ${open ? styles.itemOpen : ''}`}
              >
                <button
                  type="button"
                  className={styles.head}
                  aria-expanded={open}
                  onClick={() => toggle(i)}
                >
                  <span className={styles.q}>{item.q}</span>
                  <span className={styles.icon} aria-hidden="true">
                    <span className={`${styles.bar} ${styles.barH}`} />
                    <span className={`${styles.bar} ${styles.barV}`} />
                  </span>
                </button>

                <div className={styles.answer}>
                  <div className={styles.answerClip}>
                    <p className={styles.a}>{item.a}</p>
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
