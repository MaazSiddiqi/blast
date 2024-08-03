"use client";

import HostRoom from "@/app/_components/hostRoom";
import UserRoom from "@/app/_components/userRoom";
import { db, type Room } from "@/lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";

export default function Page({ params }: { params: { id: string } }) {
  const { id } = params;
  const name = useMemo(() => localStorage.getItem("name"), []);

  const [room, setRoom] = useState<Room>();
  const isHost = useMemo(() => room?.hostname === name, [room, name]);

  useEffect(() => {
    return onSnapshot(doc(db, "rooms", id), (snapshot) => {
      console.log(snapshot.data());

      setRoom(snapshot.data() as Room);
    });
  }, [id]);

  if (!room) return null;

  // return <div className="min-h-screen w-screen bg-slate-200">{room.code}</div>;

  if (isHost) {
    return <HostRoom room={room} />;
  } else {
    return <UserRoom room={room} id={id} />;
  }
}
