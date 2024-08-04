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
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import logo from "@/assets/blast-logo.png"
import Image from "next/image";


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
    localStorage.setItem("name", name);

    router.push("/api/auth/login");
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-16">
      <div className="flex flex-col items-center justify-center">
        <Image src={logo} alt="logo" className="w-48 h-28" />
        <h1 className="text-4xl font-extrabold italic">Blast!</h1>
      </div>
      <div className="space-y-4 rounded-xl bg-white/20 px-6 py-12 backdrop-blur-3xl">
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
          <Button
            className="w-full"
            onClick={handleCreateRoom}
            disabled={!name}
          >
            create a room
          </Button>
        </div>
      </div>
    </div>
  );
}
