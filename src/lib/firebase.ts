import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC9Qc1P2ZJ55OlmptWtXRTvqq7EhBvF62Q",
  authDomain: "blast-6972f.firebaseapp.com",
  projectId: "blast-6972f",
  storageBucket: "blast-6972f.appspot.com",
  messagingSenderId: "713020958017",
  appId: "1:713020958017:web:232957caabdd7098cb6dc0",
  measurementId: "G-HKLE242VJX",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };

export const NEW_ROOM_SCHEMA = {
  code: -1,
  members: [] as string[],
  hostname: "",
  accessToken: "",
  deviceId: "",
  currentTrack: {
    name: "",
    uri: "",
  },
  playback_time: 0,
  queueId: "",

  newSuggestion: {
    name: "",
    uri: "",
    submittedBy: "",
    downvotes: [] as string[],
    upvotes: [] as string[],
    img: "",
  } satisfies Track,
  blast: {
    name: "",
    uri: "",
    submittedBy: "",
    type: "dislike" as "like" | "dislike",
  } satisfies Blast,
  blasted: [] as { track: Track; type: "like" | "disliked" }[],
};

export const NEW_QUEUE_SCHEMA = {
  tracks: [] as Track[],
};

export type Room = typeof NEW_ROOM_SCHEMA;
export type Queue = typeof NEW_QUEUE_SCHEMA;
export type Track = {
  name: string;
  uri: string;
  upvotes: string[];
  downvotes: string[];
  img: string;
  submittedBy: string;
};

export type Blast = {
  name: string;
  uri: string;
  submittedBy: string;
  type: "like" | "dislike";
};
