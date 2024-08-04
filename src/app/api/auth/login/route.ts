import { env } from "@/env";

const generateRandomString = function (length: number) {
  let text = "";
  const possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

export async function GET(request: Request) {
  const scope =
    "user-modify-playback-state \
    user-read-playback-state \
    app-remote-control \
    user-read-email \
    user-read-private \
    user-top-read \
    streaming";

  const auth_query_parameters = new URLSearchParams({
    response_type: "code",
    client_id: env.SPOTIFY_CLIENT_ID,
    scope: scope,
    redirect_uri: `${process.env.NEXT_PUBLIC_URL}/api/auth/callback`,
    state: generateRandomString(16),
  });

  const auth_url = `https://accounts.spotify.com/authorize?${auth_query_parameters.toString()}`;

  return Response.redirect(auth_url, 302);
}
