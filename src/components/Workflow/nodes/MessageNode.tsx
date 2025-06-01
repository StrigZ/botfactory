'use client';

import { Handle, type Node, type NodeProps, Position } from '@xyflow/react';
import { type ChangeEvent, useCallback } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';

const handleStyle = { left: 10 };

export type MessageNode = Node<{ data: Record<string, string> }, 'number'>;

export default function MessageNode({ data }: NodeProps<MessageNode>) {
  const onChange = useCallback((evt: ChangeEvent<HTMLInputElement>) => {
    console.log(evt.target.value);
  }, []);

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
            onChange={onChange}
            className="nodrag"
            placeholder="Hello! Place your order:!"
          />
        </CardContent>
      </Card>
      <Handle type="source" position={Position.Bottom} id="a" />
      <Handle
        type="source"
        position={Position.Bottom}
        id="b"
        style={handleStyle}
      />
    </>
  );
}
