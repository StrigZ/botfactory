'use client';

import { DndContext, type DragEndEvent } from '@dnd-kit/core';
import { type Node } from '@xyflow/react';
import { type ReactNode, createContext, useCallback } from 'react';

import type { NodeType } from '~/server/db/schema';

import { useReactFlowContext } from './ReactFlowContext';

type DnDContext = {
  draggedNodeType: NodeType | null;
  setDraggedNodeType: (type: NodeType) => void;
};

const DnDContext = createContext<DnDContext>({
  draggedNodeType: null,
  setDraggedNodeType: () => {
    //
  },
});

export default function DnDContextProvider({
  children,
}: {
  children: ReactNode;
}) {
  const { createNewFlowNode } = useReactFlowContext();

  const onDragEnd = useCallback(
    (e: DragEndEvent) => {
      const { active, over, activatorEvent, delta } = e;
      if (!active.data.current || !over) return;

      // add new node to the flow, but how???
      // Check if activatorEvent is a pointer/mouse event

      if (
        activatorEvent &&
        'clientX' in activatorEvent &&
        'clientY' in activatorEvent
      ) {
        const clientX = activatorEvent.clientX as number;
        const clientY = activatorEvent.clientY as number;
        const data = active.data.current as { data: Node; type: NodeType };
        if (!data) return;
        createNewFlowNode(
          // TODO:
          // @ts-expect-error Figure out how to type draggable object's data
          { type: data.type, data: data.data },
          { x: clientX + delta.x, y: clientY + delta.y },
        );
      }
    },
    [createNewFlowNode],
  );

  return <DndContext onDragEnd={onDragEnd}>{children}</DndContext>;
}
