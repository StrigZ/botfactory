'use client';

import { Handle, type Node, type NodeProps, Position } from '@xyflow/react';
import { useState } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';

export type InputNode = Node<
  { message: string; variableName: string },
  'input'
>;

export default function InputNode({ data }: NodeProps<InputNode>) {
  const [message, setMessage] = useState(data.message);
  const [variableName, setVariableName] = useState(data.variableName);

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
            onChange={(e) => setMessage(e.target.value)}
            value={message}
            className="nodrag"
            placeholder="What is your name?"
          />
          <Label htmlFor="text">Variable Name:</Label>
          <Input
            id="text"
            name="text"
            onChange={(e) => setVariableName(e.target.value)}
            value={variableName}
            className="nodrag"
            placeholder="userName"
          />
        </CardContent>
      </Card>
      <Handle type="source" position={Position.Bottom} />
    </>
  );
}
