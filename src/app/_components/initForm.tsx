"use client";

import { Button } from "@/_components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/_components/ui/input-otp";
import { Separator } from "@/_components/ui/separator";
import { db, NEW_ROOM_SCHEMA } from "@/lib/firebase";
import { addDoc, collection } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function InitForm() {
  const router = useRouter();

  const [code, setCode] = useState("");

  const handleJoinRoom = () => {
    console.log("Joining room with code " + code);
  };

  const handleCreateRoom = async () => {
    const roomCode = Math.floor(100000 + Math.random() * 900000);

    const res = await addDoc(collection(db, "rooms"), {
      ...NEW_ROOM_SCHEMA,
      code: roomCode,
    });

    router.push(`/room/${res.id}`);
  };

  return (
    <div className="space-y-4">
      <form
        onSubmit={handleJoinRoom}
        className="grid place-content-center gap-2"
      >
        <InputOTP maxLength={6} value={code} onChange={(val) => setCode(val)}>
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
        <Button type="submit">join room</Button>
      </form>
      <Separator />

      <div className="grid w-full place-items-center">
        <Button className="w-full" onClick={handleCreateRoom}>
          create a room
        </Button>
      </div>
    </div>
  );
}
