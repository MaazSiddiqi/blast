"use client";

import { db, Room } from "@/lib/firebase";
import { doc, type DocumentData, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";

export default function Page({ params }: { params: { id: string } }) {
  const { id } = params;

  const [room, setRoom] = useState<Room>();

  useEffect(() => {
    return onSnapshot(doc(db, "rooms", id), (snapshot) => {
      console.log(snapshot.data());

      setRoom(snapshot.data() as Room);
    });
  }, [id]);

  if (!room) return null;

  return <div className="min-h-screen w-screen bg-slate-200">{room.code}</div>;
}
