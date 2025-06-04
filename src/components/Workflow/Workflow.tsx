'use client';

import {
  Background,
  Controls,
  type Edge,
  type Node,
  type OnConnect,
  type OnEdgesChange,
  type OnNodesChange,
  Panel,
  ReactFlow,
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  useReactFlow,
} from '@xyflow/react';
import { type DragEvent, useCallback, useState } from 'react';

import { useDnDContext } from '~/context/DnDContext';
import type { BotWorkflowWithNodesAndEdges } from '~/lib/telegram/bot-service';
import type { NodeType } from '~/server/db/schema';
import { api } from '~/trpc/react';

import { Button } from '../ui/button';
import DraggableNode from './DraggableNode';
import InputNode from './nodes/InputNode';
import MessageNode from './nodes/MessageNode';

export const nodeTypes = {
  message: MessageNode,
  input: InputNode,
};

type Props = {
  workflow: BotWorkflowWithNodesAndEdges;
};

const getNodes = (workflow: BotWorkflowWithNodesAndEdges): Node[] =>
  workflow.workflowNodes.map((node) => ({
    id: node.id,
    position: node.position as { x: number; y: number },
    data: node.data as Record<string, string>,
    type: node.type,
  }));

const getEdges = (workflow: BotWorkflowWithNodesAndEdges): Edge[] =>
  workflow.workflowEdges.map((edge) => ({
    id: edge.id,
    source: edge.sourceId,
    target: edge.targetId,
    animated: true,
  }));

export default function Workflow({ workflow }: Props) {
  const [nodes, setNodes] = useState(getNodes(workflow));
  const [edges, setEdges] = useState(getEdges(workflow));

  const { toObject, screenToFlowPosition } = useReactFlow();
  const { type, setType } = useDnDContext();
  const updateWorkflow = api.workflow.update.useMutation();

  const onNodesChange: OnNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    [],
  );
  const onEdgesChange: OnEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    [],
  );

  const onConnect: OnConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [],
  );

  const onSave = useCallback(() => {
    const flow = toObject();

    updateWorkflow.mutate({
      id: workflow.id,
      edges: flow.edges.map((edge) => ({
        sourceId: edge.source,
        targetId: edge.target,
        workflowId: workflow.id,
      })),
      nodes: flow.nodes.map((node) => ({
        name: 'not implemented',
        position: node.position,
        type: node.type as NodeType,
        workflowId: workflow.id,
        data: node.data,
      })),
    });
  }, [toObject, updateWorkflow, workflow.id]);

  const onDrop = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();

      // check if the dropped element is valid
      if (!type) {
        return;
      }

      // project was renamed to screenToFlowPosition
      // and you don't need to subtract the reactFlowBounds.left/top anymore
      // details: https://reactflow.dev/whats-new/2023-11-10
      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      const newNode = {
        id: crypto.randomUUID(),
        type,
        position,
        data: { label: `${type} node` },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [screenToFlowPosition, type],
  );

  const onDragStart = (
    event: DragEvent<HTMLDivElement>,
    nodeType: NodeType,
  ) => {
    setType(nodeType);
    event.dataTransfer.setData('text/plain', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  const onDragOver = useCallback((event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

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
        onDrop={onDrop}
        // onDragStart={onDragStart}
        onDragOver={onDragOver}
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
