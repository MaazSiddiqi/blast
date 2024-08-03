"use client";

import { Button } from "@/_components/ui/button";
import { Input } from "@/_components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/_components/ui/input-otp";
import { Label } from "@/_components/ui/label";
import { Separator } from "@/_components/ui/separator";
import {
  db,
  NEW_QUEUE_SCHEMA,
  NEW_ROOM_SCHEMA,
  Queue,
  Room,
} from "@/lib/firebase";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";

export default function InitForm() {
  const router = useRouter();

  const [code, setCode] = useState("");
  const [name, setName] = useState("");

  const handleJoinRoom = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    localStorage.setItem("name", name);
    console.log({ code });

    const res = await getDocs(
      query(collection(db, "rooms"), where("code", "==", parseInt(code))),
    );

    console.log({ res });

    if (res.empty) return;
    const Doc = res.docs[0];
    if (!Doc?.exists()) return;

    router.push(`/room/${Doc.id}`);
  };

  const handleCreateRoom = async () => {
    const roomCode = Math.floor(100000 + Math.random() * 900000);
    localStorage.setItem("name", name);

    const queueRes = await addDoc(collection(db, "queue"), {
      ...NEW_QUEUE_SCHEMA,
    } satisfies Queue);

    const res = await addDoc(collection(db, "rooms"), {
      ...NEW_ROOM_SCHEMA,
      code: roomCode,
      hostname: name,
      members: [name],
      queueId: queueRes.id,
    } satisfies Room);

    router.push(`/room/${res.id}`);
  };

  return (
    <div className="space-y-4">
      <form
        onSubmit={handleJoinRoom}
        className="grid place-content-center gap-16"
      >
        <div className="space-y-2">
          <Label>Name</Label>
          <Input
            placeholder="bob ross"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="w-full space-y-2">
          <InputOTP
            disabled={!name}
            maxLength={6}
            value={code}
            onChange={(val) => setCode(val)}
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
            </InputOTPGroup>
            <InputOTPSeparator />
            <InputOTPGroup>
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
          <Button type="submit" className="w-full" disabled={!name}>
            join room
          </Button>
        </div>
      </form>
      <Separator />

      <div className="grid w-full place-items-center">
        <Button className="w-full" onClick={handleCreateRoom} disabled={!name}>
          create a room
        </Button>
      </div>
    </div>
  );
}
