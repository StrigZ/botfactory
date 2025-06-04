'use client';

import {
  type ReactNode,
  createContext,
  useContext,
  useMemo,
  useState,
} from 'react';

import type { NodeType } from '~/server/db/schema';

type DnDContext = { type: NodeType | null; setType: (type: NodeType) => void };

const DnDContext = createContext<DnDContext>({
  type: null,
  setType: () => {
    //
  },
});

export const useDnDContext = () => useContext(DnDContext);

export const DnDContextProvider = ({ children }: { children: ReactNode }) => {
  const [type, setType] = useState<DnDContext['type']>(null);

  const value: DnDContext = useMemo(() => ({ type, setType }), [type]);

  return <DnDContext.Provider value={value}>{children}</DnDContext.Provider>;
};

export default DnDContext;
