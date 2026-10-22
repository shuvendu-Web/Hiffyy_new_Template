import React, { useEffect, useRef, useState } from 'react';

export interface RevealSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  delay?: number; // delay in milliseconds
  duration?: number; // animation duration in milliseconds
  direction?: 'up' | 'down' | 'left' | 'right' | 'fade' | 'zoom';
  distance?: number; // travel distance in pixels
  threshold?: number; // intersection observer threshold
  once?: boolean; // animate only once or on every scroll entry
  as?: React.ElementType;
}

/**
 * RevealSection
 * High-performance, GPU-accelerated on-scroll reveal component.
 * Automatically animates sections smoothly when they enter the viewport.
 */
export const RevealSection: React.FC<RevealSectionProps> = ({
  children,
  className = '',
  delay = 0,
  duration = 800,
  direction = 'up',
  distance = 32,
  threshold = 0.12,
  once = true,
  as: Component = 'div',
  style,
  ...rest
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Respect user's motion preferences
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setIsVisible(true);
      return;
    }

    const el = elementRef.current;
    if (!el) return;

    if (typeof IntersectionObserver === 'undefined') {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (once) {
            observer.unobserve(el);
          }
        } else if (!once) {
          setIsVisible(false);
        }
      },
      {
        threshold,
        rootMargin: '0px 0px -50px 0px',
      }
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
    };
  }, [threshold, once]);

  const getTransform = () => {
    if (isVisible) return 'translate3d(0, 0, 0) scale(1)';
    switch (direction) {
      case 'up':
        return `translate3d(0, ${distance}px, 0)`;
      case 'down':
        return `translate3d(0, -${distance}px, 0)`;
      case 'left':
        return `translate3d(${distance}px, 0, 0)`;
      case 'right':
        return `translate3d(-${distance}px, 0, 0)`;
      case 'zoom':
        return 'translate3d(0, 0, 0) scale(0.96)';
      case 'fade':
      default:
        return 'translate3d(0, 0, 0)';
    }
  };

  return (
    <Component
      ref={elementRef}
      className={`reveal-section ${isVisible ? 'is-visible' : ''} ${className}`}
      style={{
        ...style,
        opacity: isVisible ? 1 : 0,
        transform: getTransform(),
        transitionProperty: 'opacity, transform',
        transitionDuration: `${duration}ms`,
        transitionDelay: `${delay}ms`,
        transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
        willChange: 'opacity, transform',
      }}
      {...rest}
    >
      {children}
    </Component>
  );
};

/**
 * useScrollReveal hook for custom components that need visible state
 */
export function useScrollReveal(options: { threshold?: number; once?: boolean } = {}) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setIsVisible(true);
      return;
    }

    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (options.once ?? true) observer.unobserve(el);
        } else if (!(options.once ?? true)) {
          setIsVisible(false);
        }
      },
      {
        threshold: options.threshold ?? 0.12,
        rootMargin: '0px 0px -50px 0px',
      }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [options.threshold, options.once]);

  return { ref, isVisible };
}
