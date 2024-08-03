"use client";

import { db, type Queue, type Room } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { useEffect } from "react";

type UserRoomProps = {
  id: string;
  room: Room;
  queue: Queue | undefined;
};

export default function UserRoom({ room, id, queue }: UserRoomProps) {
  useEffect(() => {
    const name = localStorage.getItem("name");

    const enterRoom = async () => {
      if (!name) return;
      if (room.members.includes(name)) return;

      void updateDoc(doc(db, "rooms", id), {
        members: [...room.members, name],
      });

      return () => {
        void updateDoc(doc(db, "rooms", id), {
          members: room.members.filter((member) => member !== name),
        });
      };
    };

    void enterRoom();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex min-h-screen w-screen flex-col items-center justify-center">
      <div className="space-y-4">
        <h1>User Room</h1>
        <div>
          <p>Members</p>
          {room.members.map((member) => (
            <p key={member}>{member}</p>
          ))}
        </div>
        <div>
          <p>Queue</p>
          {queue?.tracks.map((track) => <p key={track.uri}>{track.name}</p>)}
        </div>
      </div>
    </div>
  );
}
