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
  type ReactFlowInstance,
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
} from '@xyflow/react';
// import { useTheme } from 'next-themes';
import { useCallback, useState } from 'react';

import type { BotWorkflowWithNodesAndEdges } from '~/lib/telegram/bot-service';
import type { NodeType } from '~/server/db/schema';
import { api } from '~/trpc/react';

import { Button } from '../ui/button';
import InputNode from './nodes/InputNode';
import MessageNode from './nodes/MessageNode';

const nodeTypes = {
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
  const [flowInstance, setFlowInstance] = useState<ReactFlowInstance | null>(
    null,
  );
  // const { theme } = useTheme();

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
    if (flowInstance) {
      const flow = flowInstance.toObject();
      console.log(flow);

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
    }
  }, [flowInstance, updateWorkflow, workflow.id]);

  return (
    <div className="flex-1 border border-dashed bg-gray-300">
      <ReactFlow
        // colorMode={theme as 'dark' | 'light'}
        nodes={nodes}
        onInit={setFlowInstance}
        onNodesChange={onNodesChange}
        edges={edges}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
        nodeTypes={nodeTypes}
      >
        <Background />
        <Controls />
        <Panel position="top-right">
          <Button onClick={onSave}>save</Button>
          {/* <Button className="xy-theme__button" onClick={onRestore}>
            restore
          </Button> */}
          {/* <button className="xy-theme__button" onClick={onAdd}>
            add node
          </button> */}
        </Panel>
      </ReactFlow>
    </div>
  );
}
