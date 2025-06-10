'use client';

import { useDroppable } from '@dnd-kit/core';
import { Background, Controls, Panel, ReactFlow } from '@xyflow/react';

import { Button } from '~/components/ui/button';
import { useReactFlowContext } from '~/context/ReactFlowContext';

import DraggableNode from './DraggableNode';
import InputNode from './nodes/InputNode';
import MessageNode from './nodes/MessageNode';

export const nodeTypes = {
  message: MessageNode,
  input: InputNode,
};

export default function Workflow({ isEnabled }: { isEnabled: boolean }) {
  const { setNodeRef: droppableRef } = useDroppable({ id: 'flow' });

  const {
    edges,
    nodes,
    onConnect,
    onEdgesChange,
    onInit,
    onNodesChange,
    onSave,
  } = useReactFlowContext();

  return isEnabled ? (
    <div className="relative flex-1 border border-dashed bg-gray-300">
      <ReactFlow
        nodes={nodes}
        onNodesChange={onNodesChange}
        edges={edges}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
        nodeTypes={nodeTypes}
        ref={droppableRef}
        onInit={onInit}
      >
        <Background />
        <Controls />
        <Panel position="top-right">
          <Button onClick={onSave}>save</Button>
        </Panel>
      </ReactFlow>
      <div className="bg-muted absolute top-4 left-1/2 flex w-3/4 -translate-x-1/2 items-center gap-2 rounded-lg p-4">
        <DraggableNode id="message" label="Message" type="message" />
        <DraggableNode id="input" label="Input" type="input" />
      </div>
    </div>
  ) : (
    <div className="relative flex flex-1 items-center justify-center border border-dashed bg-gray-300">
      <p className="">Create bot before editing workflow!</p>
      <div className="absolute inset-0 blur-md"></div>
    </div>
  );
}
