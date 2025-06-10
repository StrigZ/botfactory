'use client';

import { DndContext, type DragEndEvent } from '@dnd-kit/core';
import { type ReactNode, createContext, useCallback } from 'react';

import type { DraggableNodeData } from '~/components/BotPage/Workflow/DraggableNode';
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

      const { clientX, clientY } = activatorEvent as PointerEvent;

      const draggableNodeData = active.data.current as DraggableNodeData;
      if (!draggableNodeData) return;
      createNewFlowNode(draggableNodeData, {
        x: clientX + delta.x,
        y: clientY + delta.y,
      });
    },
    [createNewFlowNode],
  );

  return <DndContext onDragEnd={onDragEnd}>{children}</DndContext>;
}
