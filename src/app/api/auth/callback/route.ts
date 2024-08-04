import { env } from "@/env";
import { db, NEW_ROOM_SCHEMA } from "@/lib/firebase";
import axios from "axios";
import { addDoc, collection } from "firebase/firestore";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const params = new URLSearchParams(req.nextUrl.search);
  const code = params.get("code");

  const authOptions = {
    url: "https://accounts.spotify.com/api/token",
    form: {
      code: code,
      redirect_uri: "http://localhost:3000/api/auth/callback",
      grant_type: "authorization_code",
    },
    headers: {
      Authorization:
        "Basic " +
        Buffer.from(
          env.SPOTIFY_CLIENT_ID + ":" + env.SPOTIFY_CLIENT_SECRET,
        ).toString("base64"),
      "content-type": "application/x-www-form-urlencoded",
    },
    json: true,
  };

  const access_token = await axios
    .post<{ access_token: string }>(authOptions.url, authOptions.form, {
      headers: authOptions.headers,
    })
    .then((response) => {
      return response.data.access_token;
    });

  const device_id = await axios
    .get<{ devices: { id: string }[] }>(
      "https://api.spotify.com/v1/me/player/devices",
      {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${access_token}`,
          "Content-Type": "application/json",
        },
      },
    )
    .then((response) => {
      // response.data.devices[0].get("id");
      return response.data.devices[0]?.id;
    });

  const roomCode = Math.floor(100000 + Math.random() * 900000);

  const res = await addDoc(collection(db, "rooms"), {
    ...NEW_ROOM_SCHEMA,
    code: roomCode,
    accessToken: access_token,
    deviceId: device_id,
  });

  return NextResponse.redirect(new URL(`/room/${res.id}`, req.url));
}
