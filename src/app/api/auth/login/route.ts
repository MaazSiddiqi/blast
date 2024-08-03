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
    "app-remote-control \
    user-read-email \
    user-read-private \
    streaming";

  const auth_query_parameters = new URLSearchParams({
    response_type: "code",
    client_id: env.SPOTIFY_CLIENT_ID,
    scope: scope,
    redirect_uri: "http://localhost:3000/api/auth/callback",
    state: generateRandomString(16),
  });

  const auth_url = `https://accounts.spotify.com/authorize?${auth_query_parameters.toString()}`;

  return Response.redirect(auth_url, 302);
}
