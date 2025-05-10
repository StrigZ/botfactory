'use client';

import { useIntersectionObserver } from 'usehooks-ts';

import Header from './Header/Header';
import LandingContent from './LandingContent';

export default function LandingPage() {
  const { isIntersecting, ref } = useIntersectionObserver({
    threshold: 0.5,
  });

  return (
    <>
      <Header shouldBlend={!isIntersecting} />
      <LandingContent observerRef={ref} />
    </>
  );
}
