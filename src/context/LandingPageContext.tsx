'use client';

import {
  type ReactNode,
  type RefObject,
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react';

export type LandingPageSectionId = 'hero' | 'why' | 'how' | 'trust';

type LandingPageContext = {
  activeSectionId: LandingPageSectionId;
  changeActiveSectionId: (sectionId: LandingPageSectionId) => void;
  refs: Record<LandingPageSectionId, RefObject<HTMLDivElement | null> | null>;
};
const LandingPageContext = createContext<LandingPageContext>({
  activeSectionId: 'hero',
  changeActiveSectionId: () => {
    //
  },
  refs: { hero: null, how: null, why: null, trust: null },
});

export const useLandingPageContext = () => useContext(LandingPageContext);

type Props = { children: ReactNode };
export default function LandingPageContextProvider({ children }: Props) {
  const heroRef = useRef<HTMLDivElement>(null);
  const whyRef = useRef<HTMLDivElement>(null);
  const howRef = useRef<HTMLDivElement>(null);
  const trustRef = useRef<HTMLDivElement>(null);
  const [activeSectionId, setActiveSectionId] =
    useState<LandingPageContext['activeSectionId']>('hero');

  const changeActiveSectionId: LandingPageContext['changeActiveSectionId'] =
    useCallback((sectionId) => {
      setActiveSectionId(sectionId);
    }, []);

  const value: LandingPageContext = useMemo(
    () => ({
      activeSectionId,
      changeActiveSectionId,
      refs: { hero: heroRef, why: whyRef, how: howRef, trust: trustRef },
    }),
    [activeSectionId, changeActiveSectionId],
  );
  return (
    <LandingPageContext.Provider value={value}>
      {children}
    </LandingPageContext.Provider>
  );
}
