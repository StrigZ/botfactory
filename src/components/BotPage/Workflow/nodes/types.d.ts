import type { Node } from '@xyflow/react';

type InputNodeData = { text: string; variableName: string };
type MessageNodeData = { text: string };

export type InputNode = Node<InputNodeData, 'input'>;
export type MessageNode = Node<MessageNodeData, 'message'>;
