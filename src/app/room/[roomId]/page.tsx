import { Room } from "@/components/Room";
import { Whiteboard } from "@/components/Whiteboard";

export default ({ params }: { params: { roomId: string } }): JSX.Element => {
  return (
    <Room roomId={params.roomId}>
      <Whiteboard />
    </Room>
  );
};
