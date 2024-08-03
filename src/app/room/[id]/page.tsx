"use client";

import HostRoom from "@/app/_components/hostRoom";
import UserRoom from "@/app/_components/userRoom";
import { db, Queue, type Room } from "@/lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";

export default function Page({ params }: { params: { id: string } }) {
  const { id } = params;
  const name = useMemo(() => localStorage.getItem("name"), []);

  const [room, setRoom] = useState<Room>();
  const [queue, setQueue] = useState<Queue>();
  const isHost = useMemo(() => room?.hostname === name, [room, name]);

  useEffect(() => {
    return onSnapshot(doc(db, "rooms", id), (snapshot) => {
      console.log(snapshot.data());

      setRoom(snapshot.data() as Room);
    });
  }, [id]);

  useEffect(() => {
    if (!room) return;

    return onSnapshot(doc(db, "queue", room.queueId), (snapshot) => {
      console.log(snapshot.data());

      setQueue(snapshot.data() as Queue);
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room]);

  if (!room) return null;

  if (isHost) {
    return <HostRoom room={room} />;
  } else {
    return <UserRoom room={room} id={id} queue={queue} />;
  }
}
