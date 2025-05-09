import Link from 'next/link';

type LandingNavItem = { displayText: string; id: string };

const landingNav: LandingNavItem[] = [
  { displayText: 'Why', id: 'why-us' },
  { displayText: 'How', id: 'how-it-works' },
  { displayText: 'Trust', id: 'trust-us' },
];

export default function Navigation() {
  return (
    <nav>
      <ul className="divide-muted-foreground flex [&>li]:px-2 [&>li]:not-last:border-r">
        {landingNav.map(({ displayText, id }) => (
          <li key={id}>
            <Link href={'#' + id}>{displayText} </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
