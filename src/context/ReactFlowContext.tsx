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

import type { DraggableNodeData } from '~/components/BotPage/Workflow/DraggableNode';
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
    data: DraggableNodeData,
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

const defaultNodes = [
  {
    id: '1', // required
    position: { x: 0, y: 0 }, // required
    type: 'message',
    data: {
      message: 'I am the message node!',
    },
  },
  {
    id: '2', // required
    position: { x: 250, y: 200 }, // required
    type: 'input',
    data: { message: 'I am the input node' }, // required
  },
];
const defaultEdges = [{ id: '1-2', source: '1', target: '2' }];

export const getNodes = (workflow?: BotWorkflowWithNodesAndEdges): Node[] =>
  workflow && workflow.workflowNodes.length > 0
    ? workflow.workflowNodes.map((node) => ({
        id: node.id,
        position: node.position as { x: number; y: number },
        data: node.data as Record<string, string>,
        type: node.type,
      }))
    : defaultNodes;

export const getEdges = (workflow?: BotWorkflowWithNodesAndEdges): Edge[] =>
  workflow && workflow.workflowNodes.length > 0
    ? workflow.workflowEdges.map((edge) => ({
        id: edge.id,
        source: edge.sourceId,
        target: edge.targetId,
        animated: true,
      }))
    : defaultEdges;

export default function ReactFlowContextProvider({
  botId,
  children,
}: {
  botId?: string;
  children: ReactNode;
}) {
  const { data: workflow } = api.workflow.getByBotId.useQuery(
    {
      id: botId!,
    },
    { enabled: !!botId },
  );

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
    if (workflow) {
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
    }
  }, [flowInstance, updateWorkflow, workflow]);

  const createNewFlowNode: ReactFlowContext['createNewFlowNode'] = useCallback(
    (data, position) => {
      const flowPosition = flowInstance?.screenToFlowPosition(position);
      if (!flowPosition) return;

      const newFlowNode: Node = {
        id: crypto.randomUUID(),
        data: {},
        type: data.type,
        position: flowPosition,
      };

      flowInstance?.setNodes((nds) => nds.concat(newFlowNode));
    },
    [flowInstance],
  );
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
