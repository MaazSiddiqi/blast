"use client";

import { ToastAction } from "@/_components/ui/toast";
import { useToast } from "@/_components/ui/use-toast";
import BlastRoom from "@/app/_components/room";
import { db, Room, type Queue } from "@/lib/firebase";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

export default function Page({ params }: { params: { id: string } }) {
  const { id } = params;
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const router = useRouter();

  const name = useMemo(() => {
    const _name = localStorage.getItem("name");

    if (searchParams.get("host")) {
      void updateDoc(doc(db, "rooms", id), {
        hostname: _name ?? "",
        members: [_name ?? ""],
      });
    }

    return _name;
  }, []);

  const [room, setRoom] = useState<Room>();
  const [queue, setQueue] = useState<Queue>();
  const isHost = useMemo(
    () => !!searchParams.get("host") || room?.hostname === name,
    [room, name],
  );

  useEffect(() => {
    return onSnapshot(doc(db, "rooms", id), (snapshot) => {
      const data = snapshot.data() as Room;
      if (!data) {
        toast({
          variant: "destructive",
          title: "Uh oh! Something went wrong.",
          description: "There was a problem with your request.",
        });

        router.replace("/");
        return;
      }

      setRoom(data);
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

  return (
    <BlastRoom room={room} id={id} queue={queue} name={name} host={isHost} />
  );
}
