'use client';

import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

import type { nodeTypes } from './Workflow';

export type DraggableNodeProps = {
  id: string;
  type: keyof typeof nodeTypes;
  label: string;
};
export default function DraggableNode({ id, type, label }: DraggableNodeProps) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id,
    data: { id, type, label },
  });
  const style = {
    transform: CSS.Translate.toString(transform),
  };
  return (
    <div
      className="mb-2 cursor-move rounded border p-3 select-none"
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
    >
      {label}
    </div>
  );
}
