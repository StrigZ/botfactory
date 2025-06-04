'use client';

import { useDnDContext } from '~/context/DnDContext';

import type { nodeTypes } from './Workflow';

export type DraggableNodeProps = {
  id: string;
  type: keyof typeof nodeTypes;
  label: string;
};
export default function DraggableNode({ id, type, label }: DraggableNodeProps) {
  const { setType } = useDnDContext();
  return (
    <div
      className="mb-2 cursor-move rounded border p-3"
      onDragStart={(e) => {
        setType(type);
        e.dataTransfer.effectAllowed = 'move';
      }}
    >
      {label}
    </div>
  );
}
