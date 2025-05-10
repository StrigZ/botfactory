'use client';

import { cn } from '~/lib/utils';

import AuthButton from './AuthButton';
import Logo from './Logo';
import Navigation from './Navigation';

export default function Header({ shouldBlend }: { shouldBlend: boolean }) {
  return (
    <header
      className={cn('fixed top-4 z-10 w-screen text-xl text-white', {
        'mix-blend-difference': shouldBlend,
      })}
    >
      <div className="container mx-auto flex items-center justify-between gap-12 p-4">
        <Logo />
        <Navigation />
        <AuthButton />
      </div>
    </header>
  );
}
