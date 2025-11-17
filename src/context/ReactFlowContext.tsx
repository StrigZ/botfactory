'use client';

import {
  type Edge,
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
import type { BaseNode } from '~/components/BotPage/Workflow/nodes/types';
import { useWorkflowMutations } from '~/hooks/use-workflow-mutations';
import type { WorkflowWithNodes } from '~/lib/workflow-api-client';

type ReactFlowContext = {
  nodes: BaseNode[];
  edges: Edge[];
  flowInstance: ReactFlowInstance<BaseNode> | null;
  onInit: (instance: ReactFlowInstance<BaseNode>) => void;
  onNodesChange: OnNodesChange<BaseNode>;
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

export const extractNodesFromWorkflow = (
  workflow: WorkflowWithNodes,
): BaseNode[] =>
  workflow.nodes.map((node) => ({
    id: node.id,
    position: node.position,
    data: { ...node.data, name: node.name },
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
  workflow,
  children,
}: {
  workflow: WorkflowWithNodes;
  children: ReactNode;
}) {
  const [nodes, setNodes] = useState<ReactFlowContext['nodes']>(
    extractNodesFromWorkflow(workflow),
  );
  const [edges, setEdges] = useState<ReactFlowContext['edges']>(
    extractEdgesFromWorkflow(workflow),
  );
  const [flowInstance, setFlowInstance] = useState<
    ReactFlowContext['flowInstance'] | null
  >(null);

  const { updateWorkflow } = useWorkflowMutations();

  const onInit: ReactFlowContext['onInit'] = useCallback(
    (instance) => setFlowInstance(instance),
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
    if (!flowInstance) {
      return;
    }

    const flowInstanceObject = flowInstance.toObject();

    updateWorkflow({
      id: workflow.workflow.id,
      edges: flowInstanceObject.edges.map((edge) => ({
        id: edge.id,
        source_id: edge.source,
        target_id: edge.target,
      })),
      nodes: flowInstanceObject.nodes.map((node) => ({
        id: node.id,
        name: node.data.name,
        position: node.position,
        node_type: node.type!,
        data: (({ name: _name, ...rest }) => rest)(node.data),
        flowId: node.id,
      })),
    });
  }, [flowInstance, updateWorkflow, workflow]);

  const createNewFlowNode: ReactFlowContext['createNewFlowNode'] = useCallback(
    (data, position) => {
      if (!flowInstance) return;

      const flowPosition = flowInstance.screenToFlowPosition(position);

      const newFlowNode: BaseNode = {
        id: crypto.randomUUID(),
        data: { name: 'New Node' },
        type: data.type,
        position: flowPosition,
      };

      flowInstance.setNodes((nds) => nds.concat(newFlowNode));
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
