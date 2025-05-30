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

import useOnScreen from '~/hooks/use-on-screen';

export type LandingPageSectionId = 'hero' | 'why' | 'how' | 'trust';

type LandingPageContext = {
  activeSectionId: LandingPageSectionId;
  changeActiveSectionId: (sectionId: LandingPageSectionId) => void;
  refs: Record<LandingPageSectionId, RefObject<HTMLElement | null> | null>;
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
  const heroRef = useRef<HTMLElement>(null);
  const whyRef = useRef<HTMLElement>(null);
  const howRef = useRef<HTMLElement>(null);
  const trustRef = useRef<HTMLElement>(null);
  const [activeSectionId, setActiveSectionId] =
    useState<LandingPageContext['activeSectionId']>('hero');

  const changeActiveSectionId: LandingPageContext['changeActiveSectionId'] =
    useCallback((sectionId) => {
      setActiveSectionId(sectionId);
    }, []);

  useOnScreen({
    ref: heroRef,
    onIntersecting: () => changeActiveSectionId('hero'),
  });
  useOnScreen({
    ref: whyRef,
    onIntersecting: () => changeActiveSectionId('why'),
  });
  useOnScreen({
    ref: howRef,
    onIntersecting: () => changeActiveSectionId('how'),
  });
  useOnScreen({
    ref: trustRef,
    onIntersecting: () => changeActiveSectionId('trust'),
  });

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
