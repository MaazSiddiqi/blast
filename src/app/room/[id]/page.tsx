"use client";

import HostRoom from "@/app/_components/hostRoom";
import UserRoom from "@/app/_components/userRoom";
import { db, type Queue, type Room } from "@/lib/firebase";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

export default function Page({ params }: { params: { id: string } }) {
  const { id } = params;
  const searchParams = useSearchParams();

  const name = useMemo(() => {
    const _name = localStorage.getItem("name");

    if (searchParams.get("host")) {
      updateDoc(doc(db, "rooms", id), {
        hostname: _name || "",
        members: [_name || ""],
      });
    }

    return _name;
  }, []);

  const [room, setRoom] = useState<Room>();
  const [queue, setQueue] = useState<Queue>();
  const isHost = useMemo(
    () => searchParams.get("host") || room?.hostname === name,
    [room, name],
  );

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

  if (!room || !queue || !name) return null;

  if (isHost) {
    return <HostRoom room={room} />;
  } else {
    return <UserRoom room={room} id={id} queue={queue} name={name} />;
  }
}
