'use client';

import {
  Handle,
  type Node,
  type NodeProps,
  Position,
  useReactFlow,
} from '@xyflow/react';

import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';

export type MessageNode = Node<{ message: string }, 'message'>;

export default function MessageNode({ data, id }: NodeProps<MessageNode>) {
  const flowInstance = useReactFlow();

  // TODO: there is probably way better way of doing this
  const handleMessageChange = (text: string) => {
    flowInstance.setNodes((nodes) =>
      nodes.map((node) =>
        node.id === id ? { ...node, data: { ...data, message: text } } : node,
      ),
    );
  };

  return (
    <>
      <Handle type="target" position={Position.Top} />
      <Card>
        <CardHeader>
          <CardTitle>Message Node</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-1">
          <Label htmlFor="text">Text:</Label>
          <Input
            id="text"
            name="text"
            onChange={(e) => handleMessageChange(e.target.value)}
            value={data.message}
            className="nodrag"
            placeholder="Hello! Place your order:!"
          />
        </CardContent>
      </Card>
      <Handle type="source" position={Position.Bottom} />
    </>
  );
}
