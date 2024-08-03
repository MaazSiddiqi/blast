"use client";

import { type Room } from "@/lib/firebase";

type HostRoomProps = {
  room: Room;
};

export default function HostRoom({ room }: HostRoomProps) {
  return (
    <div className="flex min-h-screen w-screen items-center justify-center bg-red-50">
      <h1>Host Room</h1>
      <p>{room.code}</p>
      {room.members.map((member) => (
        <p key={member}>{member}</p>
      ))}
    </div>
  );
}
