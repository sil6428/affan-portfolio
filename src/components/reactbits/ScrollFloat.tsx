// Vendored from ReactBits (reactbits.dev) — TextAnimations/ScrollFloat, TS + Tailwind variant.
// Local changes: `id` prop; the real text is exposed once (sr-only) with the split letters aria-hidden;
// letters are grouped per word so lines wrap between words; the scroll-scrubbed tween + ScrollTrigger are killed on unmount (they leaked across route changes);
// no static will-change on the letters (it kept dozens of composited layers alive after the heading settled).
import React, { useEffect, useMemo, useRef, type ReactNode, type RefObject } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from '@/lib/scrolltrigger';

gsap.registerPlugin(ScrollTrigger);

interface ScrollFloatProps {
  children: ReactNode;
  scrollContainerRef?: RefObject<HTMLElement>;
  containerClassName?: string;
  textClassName?: string;
  animationDuration?: number;
  ease?: string;
  scrollStart?: string;
  scrollEnd?: string;
  stagger?: number;
  id?: string;
}

const ScrollFloat: React.FC<ScrollFloatProps> = ({
  children,
  scrollContainerRef,
  containerClassName = '',
  textClassName = '',
  animationDuration = 1,
  ease = 'back.inOut(2)',
  scrollStart = 'center bottom+=50%',
  scrollEnd = 'bottom bottom-=40%',
  stagger = 0.03,
  id
}) => {
  const containerRef = useRef<HTMLHeadingElement>(null);

  const text = typeof children === 'string' ? children : '';
  // Letters are grouped per word (nowrap) so headings wrap between words, never mid-word.
  const splitText = useMemo(() => {
    const words = text.split(' ');
    return words.map((word, w) => (
      <React.Fragment key={w}>
        <span className="whitespace-nowrap">
          {word.split('').map((char, index) => (
            <span className="inline-block word sf-char" key={index}>
              {char}
            </span>
          ))}
        </span>
        {w < words.length - 1 ? ' ' : null}
      </React.Fragment>
    ));
  }, [text]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const scroller = scrollContainerRef && scrollContainerRef.current ? scrollContainerRef.current : window;

    const charElements = el.querySelectorAll('.sf-char');

    const tween = gsap.fromTo(
      charElements,
      {
        opacity: 0,
        yPercent: 120,
        scaleY: 2.3,
        scaleX: 0.7,
        transformOrigin: '50% 0%'
      },
      {
        duration: animationDuration,
        ease: ease,
        opacity: 1,
        yPercent: 0,
        scaleY: 1,
        scaleX: 1,
        stagger: stagger,
        scrollTrigger: {
          trigger: el,
          scroller,
          start: scrollStart,
          end: scrollEnd,
          scrub: true
        }
      }
    );
    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [scrollContainerRef, animationDuration, ease, scrollStart, scrollEnd, stagger]);

  return (
    <h2 ref={containerRef} id={id} className={`my-5 overflow-hidden ${containerClassName}`}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true" className={`inline-block text-[clamp(1.6rem,4vw,3rem)] leading-[1.5] ${textClassName}`}>{splitText}</span>
    </h2>
  );
};

export default ScrollFloat;
