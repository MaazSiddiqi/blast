import { initializeApp } from "firebase/app";
import { doc, getFirestore, updateDoc } from "firebase/firestore";

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
    submittedBy: "",
    downvotes: [] as string[],
    upvotes: [] as string[],
    img: "",
  } satisfies Track,
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

const handleUpvote = (
  id: Number,
  name: string,
  track: Track,
  room: Room,
  queue: Queue,
) => {
  if (!name) return;

  if (track.upvotes.includes(name)) return;

  void updateDoc(doc(db, "queue", room.queueId), {
    tracks: queue.tracks.map((t) =>
      t.name === track.name
        ? {
            ...t,
            upvotes: [...t.upvotes, name],
            downvotes: t.downvotes.filter((downvote) => downvote !== name),
          }
        : t,
    ),
  });

  const shouldBlast =
    room.members.length >= 3 &&
    track.upvotes.length >= room.members.length / 2 &&
    !room.blasted.some((t) => t.track.name === track.name);

  if (shouldBlast) {
    void updateDoc(doc(db, "rooms", id), {
      blast: {
        name: track.name,
        uri: track.uri,
        submittedBy: track.submittedBy,
        type: "like",
      },
      blasted: [...room.blasted, { track, type: "like" }],
    } satisfies Partial<Room>);

    // clear blast after 10 seconds
    setTimeout(() => {
      void updateDoc(doc(db, "rooms", id), {
        blast: {
          name: "",
          uri: "",
          submittedBy: "",
          type: "like",
        },
      } satisfies Partial<Room>);
    }, 3 * 1000);
  }
};
