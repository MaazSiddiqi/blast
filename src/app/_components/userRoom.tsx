"use client";

import { db, type Room } from "@/lib/firebase";
import {
  collection,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { useEffect } from "react";

type UserRoomProps = {
  id: string;
  room: Room;
};

export default function UserRoom({ room, id }: UserRoomProps) {
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
      </div>
    </div>
  );
}
