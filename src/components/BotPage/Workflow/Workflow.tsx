'use client';

import { useDroppable } from '@dnd-kit/core';
import { Background, Controls, Panel, ReactFlow } from '@xyflow/react';

import { useReactFlowContext } from '~/context/ReactFlowContext';

import { Button } from '../ui/button';
import DraggableNode from './DraggableNode';
import InputNode from './nodes/InputNode';
import MessageNode from './nodes/MessageNode';

export const nodeTypes = {
  message: MessageNode,
  input: InputNode,
};

export default function Workflow() {
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

  return (
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
  );
}
