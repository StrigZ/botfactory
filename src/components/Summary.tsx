type Props = {};
export default function Summary({}: Props) {
  return (
    <div className="grid grid-cols-4 divide-x rounded-lg border text-center [&>div]:p-4">
      <div className="flex flex-col gap-2">
        <span>Active bots</span> <span>2/3</span>
      </div>
      <div className="col-span-2 flex flex-col gap-2">
        <span>Messages sent</span> <span>9999</span>
      </div>
      <div className="flex flex-col gap-2">
        <span>Messages received</span> <span>9999</span>
      </div>
    </div>
  );
}
