import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const params = new URL(request.url).searchParams;
  const roomId = params.get("roomId")!;
  const roomRef = doc(db, "rooms", roomId)
  const roomSnap = await getDoc(roomRef);
  return NextResponse.json(roomSnap.data()?.accessToken);
}
