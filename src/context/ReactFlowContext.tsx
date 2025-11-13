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
import { useWorkflowMutations } from '~/hooks/use-workflow-mutations';
import { useWorkflowWithNodes } from '~/hooks/use-workflows';
import type { WorkflowWithNodes } from '~/lib/workflow-api-client';

const DEFAULT_NODES: Node[] = [
  {
    id: '1',
    position: { x: 0, y: 0 },
    type: 'message',
    data: {
      message: 'I am the message node!',
    },
  },
  {
    id: '2',
    position: { x: 250, y: 200 },
    type: 'input',
    data: { message: 'I am the input node' },
  },
];
const DEFAULT_EDGES: Edge[] = [{ id: '1-2', source: '1', target: '2' }];

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

export const extractNodesFromWorkflow = (workflow: WorkflowWithNodes): Node[] =>
  workflow.nodes.map((node) => ({
    id: node.id.toString(),
    name: node.name,
    position: node.position,
    data: node.data,
    type: node.node_type,
  }));

export const extractEdgesFromWorkflow = (workflow: WorkflowWithNodes): Edge[] =>
  workflow.edges.map((edge) => ({
    id: edge.id.toString(),
    source: edge.source.toString(),
    target: edge.target.toString(),
    animated: true,
  }));

const getNodes = (workflow?: WorkflowWithNodes) =>
  workflow && workflow.nodes.length
    ? extractNodesFromWorkflow(workflow)
    : DEFAULT_NODES;

const getEdges = (workflow?: WorkflowWithNodes) =>
  workflow && workflow.edges.length
    ? extractEdgesFromWorkflow(workflow)
    : DEFAULT_EDGES;

export default function ReactFlowContextProvider({
  botId,
  children,
}: {
  botId?: string;
  children: ReactNode;
}) {
  const { data: workflow } = useWorkflowWithNodes({ id: botId! });

  const [nodes, setNodes] = useState<ReactFlowContext['nodes']>(
    getNodes(workflow),
  );
  const [edges, setEdges] = useState<ReactFlowContext['edges']>(
    getEdges(workflow),
  );
  const [flowInstance, setFlowInstance] = useState<ReactFlowInstance | null>(
    null,
  );

  const { updateWorkflow } = useWorkflowMutations();

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

    if (!flow || !workflow) {
      return;
    }

    updateWorkflow({
      id: workflow.id.toString(),
      data: {
        edges: flow.edges.map((edge) => ({
          id: +edge.id,
          source: +edge.source,
          target: +edge.target,
          workflow: workflow.id,
        })),
        nodes: flow.nodes.map((node) => ({
          id: +node.id,
          name: (node.data.name as string) ?? '',
          position: node.position,
          node_type: node.type!,
          workflow: +workflow.id,
          data: node.data,
          flowId: node.id,
        })),
      },
    });
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
      <ReactFlowProvider>{children}</ReactFlowProvider>
    </ReactFlowContext.Provider>
  );
}
