import { type NextRequest } from "next/server";

export const token = {
  current: undefined,
} as { current: string | undefined };

export async function GET(request: NextRequest) {
  return new Response(JSON.stringify(token.current), {
    headers: {
      "content-type": "application/json",
    },
  });
}
