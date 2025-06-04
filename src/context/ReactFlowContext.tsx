'use client';

import {
  type Edge,
  type Node,
  type OnConnect,
  type OnEdgesChange,
  type OnNodesChange,
  type ReactFlowInstance,
  ReactFlowProvider,
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
} from '@xyflow/react';
import {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';

import type { BotWorkflowWithNodesAndEdges } from '~/lib/telegram/bot-service';
import type { NodeType } from '~/server/db/schema';
import { api } from '~/trpc/react';

type ReactFlowContext = {
  nodes: Node[];
  edges: Edge[];
  flowInstance: ReactFlowInstance | null;
  onInit: (instance: ReactFlowInstance) => void;
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  onSave: () => void;
  createNewFlowNode: (
    data: {
      data: { type: NodeType; data: Node };
      position: { x: number; y: number };
    },
    position: { x: number; y: number },
  ) => void;
};

const ReactFlowContext = createContext<ReactFlowContext>({
  edges: [],
  nodes: [],
  flowInstance: null,
  onInit: () => {
    //
  },
  onConnect: () => {
    //
  },
  onEdgesChange: () => {
    //
  },
  onNodesChange: () => {
    //
  },
  onSave: () => {
    //
  },
  createNewFlowNode: () => {
    //
  },
});

export const useReactFlowContext = () => useContext(ReactFlowContext);

export const getNodes = (workflow: BotWorkflowWithNodesAndEdges): Node[] =>
  workflow.workflowNodes.map((node) => ({
    id: node.id,
    position: node.position as { x: number; y: number },
    data: node.data as Record<string, string>,
    type: node.type,
  }));

export const getEdges = (workflow: BotWorkflowWithNodesAndEdges): Edge[] =>
  workflow.workflowEdges.map((edge) => ({
    id: edge.id,
    source: edge.sourceId,
    target: edge.targetId,
    animated: true,
  }));

export default function ReactFlowContextProvider({
  botId,
  children,
}: {
  botId: string;
  children: ReactNode;
}) {
  const [workflow] = api.workflow.getByBotId.useSuspenseQuery({
    id: botId,
  });
  const createNode = api.workflow.createNode.useMutation();

  const [nodes, setNodes] = useState<ReactFlowContext['nodes']>(
    getNodes(workflow),
  );
  const [edges, setEdges] = useState<ReactFlowContext['edges']>(
    getEdges(workflow),
  );
  const [flowInstance, setFlowInstance] = useState<ReactFlowInstance | null>(
    null,
  );

  const updateWorkflow = api.workflow.update.useMutation();

  const onInit: ReactFlowContext['onInit'] = useCallback(
    (instance: ReactFlowInstance) => setFlowInstance(instance),
    [],
  );

  const onNodesChange: ReactFlowContext['onNodesChange'] = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    [],
  );
  const onEdgesChange: ReactFlowContext['onEdgesChange'] = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    [],
  );

  const onConnect: ReactFlowContext['onConnect'] = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [],
  );

  const onSave: ReactFlowContext['onSave'] = useCallback(() => {
    const flow = flowInstance?.toObject();

    if (!flow) {
      return;
    }
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
        flowId: node.id,
      })),
    });
  }, [flowInstance, updateWorkflow, workflow.id]);

  const createNewFlowNode = useCallback(
    async (data: Node, position: { x: number; y: number }) => {
      const flowPosition = flowInstance?.screenToFlowPosition(position);
      if (!flowPosition) return;

      const newFlowNode: Node = {
        id: crypto.randomUUID(),
        data: { ...data.data, message: '' },
        type: data.type,
        position: flowPosition,
      };

      flowInstance?.setNodes((nds) => nds.concat(newFlowNode));
    },
    [flowInstance],
  );
  // TODO:
  // @ts-expect-error Figure out how to type draggable object's data
  const value: ReactFlowContext = useMemo(
    () => ({
      edges,
      flowInstance,
      setFlowInstance,
      nodes,
      onConnect,
      onEdgesChange,
      onNodesChange,
      onSave,
      onInit,
      createNewFlowNode,
    }),
    [
      edges,
      flowInstance,
      nodes,
      onConnect,
      onEdgesChange,
      onInit,
      onNodesChange,
      onSave,
      createNewFlowNode,
    ],
  );

  return (
    <ReactFlowContext.Provider value={value}>
      <ReactFlowProvider>{children}</ReactFlowProvider>;
    </ReactFlowContext.Provider>
  );
}
