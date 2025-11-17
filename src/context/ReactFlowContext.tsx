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
  useEffect,
  useMemo,
  useState,
} from 'react';

import type { DraggableNodeData } from '~/components/BotPage/Workflow/DraggableNode';
import { useWorkflowMutations } from '~/hooks/use-workflow-mutations';
import { useWorkflowWithNodes } from '~/hooks/use-workflows';
import type { WorkflowWithNodes } from '~/lib/workflow-api-client';

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
    id: node.id,
    name: node.name,
    position: node.position,
    data: node.data,
    type: node.node_type,
  }));

export const extractEdgesFromWorkflow = (workflow: WorkflowWithNodes): Edge[] =>
  workflow.edges.map((edge) => ({
    id: edge.id,
    source: edge.source_id,
    target: edge.target_id,
    animated: true,
  }));

export default function ReactFlowContextProvider({
  botId,
  children,
}: {
  botId?: string;
  children: ReactNode;
}) {
  const { data: workflow } = useWorkflowWithNodes({ id: botId! });

  const [nodes, setNodes] = useState<ReactFlowContext['nodes']>([]);
  const [edges, setEdges] = useState<ReactFlowContext['edges']>([]);
  const [flowInstance, setFlowInstance] = useState<ReactFlowInstance | null>(
    null,
  );

  useEffect(() => {
    if (!workflow) {
      return;
    }

    setNodes(extractNodesFromWorkflow(workflow));
    setEdges(extractEdgesFromWorkflow(workflow));
  }, [workflow]);

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
      id: workflow.workflow.id,
      edges: flow.edges.map((edge) => ({
        id: edge.id,
        source_id: edge.source,
        target_id: edge.target,
      })),
      nodes: flow.nodes.map((node) => ({
        id: node.id,
        name: (node.data.name as string) ?? '',
        position: node.position,
        node_type: node.type!,
        data: node.data,
        flowId: node.id,
      })),
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
