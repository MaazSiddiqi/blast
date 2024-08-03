import { env } from "@/env";
import { type NextRequest, NextResponse } from "next/server";
import request from "request";
import { setDoc, doc} from "firebase/firestore";
import { db } from "@/lib/firebase";

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

  console.log({ body: authOptions.form });

  request.post(authOptions, function (error, response, body) {
    if (!error && response.statusCode === 200) {
      const { access_token } = body as { access_token: string };
      console.log(access_token);
    } 
  });

  return NextResponse.redirect(new URL("/", req.url));
}
