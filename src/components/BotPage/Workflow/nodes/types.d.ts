import type { Node } from '@xyflow/react';

type NodeBaseData = { name: string };
type BaseNode<
  NodeData extends Record<string, unknown> = Record<string, unknown>,
  NodeType extends string = string,
> = Node<NodeBaseData & NodeData, NodeType>;

type InputNodeData = { message: string; variableName: string };
type MessageNodeData = { message: string };

export type InputNode = BaseNode<InputNodeData, 'input'>;
export type MessageNode = BaseNode<MessageNodeData, 'message'>;
