import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";

// Mocked DB
interface Post {
  id: number;
  name: string;
}
const posts: Post[] = [
  {
    id: 1,
    name: "Hello World",
  },
];

export const authRouter = createTRPCRouter({});
