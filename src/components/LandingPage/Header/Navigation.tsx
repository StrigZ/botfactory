import { Button } from '~/components/ui/button';
import {
  type LandingPageSectionId,
  useLandingPageContext,
} from '~/context/LandingPageContext';
import { cn } from '~/lib/utils';

type LandingNavItem = { displayText: string; id: LandingPageSectionId };

const landingNav: LandingNavItem[] = [
  { displayText: 'Hero', id: 'hero' },
  { displayText: 'Why', id: 'why' },
  { displayText: 'How', id: 'how' },
  { displayText: 'Trust', id: 'trust' },
];

export default function Navigation() {
  const { refs, activeSectionId, changeActiveSectionId } =
    useLandingPageContext();
  return (
    <nav>
      <ul className="divide-muted-foreground flex [&>li]:px-2 [&>li]:not-last:border-r">
        {landingNav.map(({ displayText, id }) => (
          <li key={id}>
            <Button
              onClick={() => {
                console.log(refs[id]);
                if (refs[id]?.current) {
                  changeActiveSectionId(id);
                  refs[id]?.current.scrollIntoView({
                    behavior: 'smooth',
                  });
                }
              }}
              variant="link"
              className={cn('cursor-pointer text-white', {
                underline: activeSectionId === id,
              })}
            >
              {displayText}
            </Button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
