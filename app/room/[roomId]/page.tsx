import RoomView from "@/components/room-view"

export default function RoomPage({ params }: { params: { roomId: string } }) {
  return <RoomView roomId={params.roomId} />
}
