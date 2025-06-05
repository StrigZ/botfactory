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

export type InputNode = Node<
  { message: string; variableName: string },
  'input'
>;

export default function InputNode({ data, id }: NodeProps<InputNode>) {
  const flowInstance = useReactFlow();

  // TODO: there is probably way better way of doing this
  const handleMessageChange = (text: string) => {
    flowInstance.setNodes((nodes) =>
      nodes.map((node) =>
        node.id === id ? { ...node, data: { ...data, message: text } } : node,
      ),
    );
  };
  // TODO: there is probably way better way of doing this
  const handleVariableChange = (variable: string) => {
    flowInstance.setNodes((nodes) =>
      nodes.map((node) =>
        node.id === id
          ? { ...node, data: { ...data, variableName: variable } }
          : node,
      ),
    );
  };

  return (
    <>
      <Handle type="target" position={Position.Top} />
      <Card>
        <CardHeader>
          <CardTitle>Input Node</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-1">
          <Label htmlFor="text">Text:</Label>
          <Input
            id="text"
            name="text"
            onChange={(e) => handleMessageChange(e.target.value)}
            value={data.message ?? ''}
            className="nodrag"
            placeholder="What is your name?"
          />
          <Label htmlFor="text">Variable Name:</Label>
          <Input
            id="text"
            name="text"
            onChange={(e) => handleVariableChange(e.target.value)}
            value={data.variableName ?? ''}
            className="nodrag"
            placeholder="userName"
          />
        </CardContent>
      </Card>
      <Handle type="source" position={Position.Bottom} />
    </>
  );
}
