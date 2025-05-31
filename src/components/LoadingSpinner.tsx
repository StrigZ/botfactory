import { LoaderPinwheel } from 'lucide-react';

type Props = {};
export default function LoadingSpinner({}: Props) {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <LoaderPinwheel className="animate-spin" size={36} />
    </div>
  );
}
