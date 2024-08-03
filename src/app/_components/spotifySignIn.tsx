"use client";

import { Button } from "@/_components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SpotifySignIn() {
  return <Link href={"/api/auth/login"}>Sign in with Spotify</Link>;
}
