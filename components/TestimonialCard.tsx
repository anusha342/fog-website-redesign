import Image from 'next/image';
import type { Testimonial } from '@/lib/testimonials';
import styles from './testimonial-card.module.css';

interface Props {
  testimonial: Testimonial;
}

export default function TestimonialCard({ testimonial }: Props) {
  const { name, company, designation, rating, avatar, product, body } = testimonial;

  return (
    <figure className={styles.card}>

      {/* Stars */}
      <div className={styles.stars} aria-label={`${rating} out of 5 stars`}>
        {Array.from({ length: 5 }).map((_, i) => (
          <span
            key={i}
            className={`${styles.star} ${i < rating ? styles.starFilled : ''}`}
            aria-hidden="true"
          >
            &#9733;
          </span>
        ))}
      </div>

      {/* Quote mark */}
      <div className={styles.quoteMark} aria-hidden="true">&ldquo;</div>

      {/* Testimonial body */}
      <blockquote className={styles.body}>{body}</blockquote>

      <div className={styles.divider} aria-hidden="true" />

      {/* Author */}
      <figcaption className={styles.author}>
        {avatar && (
          <div className={styles.avatar}>
            <Image
              src={avatar}
              alt={name}
              fill
              sizes="48px"
            />
          </div>
        )}
        <div className={styles.authorInfo}>
          <span className={styles.name}>{name}</span>
          <span className={styles.role}>
            {designation}{company ? `, ${company}` : ''}
          </span>
          {product && <span className={styles.product}>{product}</span>}
        </div>
      </figcaption>

    </figure>
  );
}
