'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import ThemeSelector from './ThemeSelector';

export default function Header() {
  const pathname = usePathname();

  const linkClass = (href: string) =>
    `text-sm font-medium transition-colors hover:text-accent-400 ${
      pathname === href ? 'text-accent-400' : 'text-slate-300'
    }`;

  return (
    <header className="sticky top-0 z-50 border-b border-slate-700/60 bg-slate-900/95 backdrop-blur supports-[backdrop-filter]:bg-slate-900/80">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-extrabold tracking-tight text-accent-400">T20</span>
          <span className="text-lg font-bold text-white">Sheet</span>
        </Link>
        <nav className="flex items-center gap-4">
          <Link href="/" className={linkClass('/')}>Personagens</Link>
          <Link href="/about" className={linkClass('/about')}>Sobre</Link>
          <ThemeSelector />
        </nav>
      </div>
    </header>
  );
}
