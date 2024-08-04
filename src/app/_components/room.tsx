"use client";

import { Button } from "@/_components/ui/button";
import { Card } from "@/_components/ui/card";
import { Input } from "@/_components/ui/input";
import { Separator } from "@/_components/ui/separator";
import { ToastAction } from "@/_components/ui/toast";
import { useToast } from "@/_components/ui/use-toast";
import {
  type Blast,
  db,
  type Track,
  type Queue,
  type Room,
} from "@/lib/firebase";
import {
  pauseSong,
  playSong,
  previousSong,
  searchSong,
  skipSong,
} from "@/lib/spotify";
import { ChevronDownIcon, ChevronUpIcon } from "@radix-ui/react-icons";
import { SkipBack, Pause, SkipForward, PlayIcon } from "lucide-react";
import { Label } from "@radix-ui/react-label";
import axios from "axios";
import { doc, updateDoc } from "firebase/firestore";
import { useEffect, useState } from "react";

type UserRoomProps = {
  id: string;
  room: Room;
  queue: Queue;
  name: string;
  host: boolean;
};

export default function Room({ room, id, queue, name, host }: UserRoomProps) {
  const [newSong, setNewSong] = useState("");
  const [play, setPlay] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const enterRoom = async () => {
      if (!name) return;
      if (room.members.includes(name)) return;

      void updateDoc(doc(db, "rooms", id), {
        members: [...room.members, name],
      });

      return () => {
        void updateDoc(doc(db, "rooms", id), {
          members: room.members.filter((member) => member !== name),
        });
      };
    };

    void enterRoom();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (room.newSuggestion.name && room.newSuggestion.submittedBy !== name) {
      toast({
        title: `New suggestion: ${room.newSuggestion.name}`,
        description: `${room.newSuggestion.submittedBy} added a new song!`,
        action: (
          <div className="space-x-2">
            <ToastAction
              altText="groovy"
              onClick={() => handleUpvote(room.newSuggestion)}
            >
              groovy 💃
            </ToastAction>
            <ToastAction
              altText="blast"
              onClick={() => handleDownvote(room.newSuggestion)}
            >
              blast 💥
            </ToastAction>
          </div>
        ),
      });
    }
  }, [name, room.newSuggestion.name, room.newSuggestion.submittedBy, toast]);

  const Blast = (blast: Blast) => {
    const { name, uri, submittedBy, type } = blast;

    if (type === "like") {
      return (
        <div className="fixed bottom-0 left-0 grid h-screen w-screen place-content-center bg-green-500 text-white">
          <div className="min-h-32 min-w-32">
            <h1>🎉 {name} is a banger!</h1>
            <p>Added by {submittedBy}</p>
          </div>
        </div>
      );
    } else {
      return (
        <div className="fixed bottom-0 left-0 grid h-screen w-screen place-content-center bg-red-500 text-white">
          <div className="min-h-32 min-w-32">
            <h1>It was a valiant try {submittedBy}.</h1>
            <h1>{name}</h1>
            <p>Do better.</p>
            <p>Removing {name}...</p>
          </div>
        </div>
      );
    }

    // return (
    //   <div
    //     className={`fixed bottom-0 left-0 h-screen w-screen ${type === "like" ? "bg-green-500" : "bg-red-500"} grid place-content-center text-white`}
    //   >
    //     <div className="min-h-32 min-w-32">
    //       <h1>It was a valiant try {submittedBy}.</h1>
    //       <h1>{}</h1>
    //       <p>Do better.</p>
    //       <p>Removing {name}...</p>
    //     </div>
    //   </div>
    // );
  };

  const Suggestion = (suggestion: Track) => {
    const { name, uri, submittedBy } = suggestion;

    return (
      <div className="fixed bottom-0 left-0 grid h-screen w-screen place-content-center bg-blue-400">
        <div className="min-h-32 min-w-32">
          <h1>New song suggestion</h1>
          <p>{name}</p>
          <p>Added by {submittedBy}</p>
        </div>
      </div>
    );
  };

  const handleSubmitSong = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newSong) return;

    const newSongExists = queue.tracks.some((track) => track.name === newSong);

    // Get our tokens from firebase
    const res = await axios.get("/api/firebase/tokens", {
      params: { roomId: id },
    });

    // Query for song in Spotify
    const songs = await searchSong({
      search_text: newSong,
      access_token: res.data as string,
    });

    // add the top result selected song uri to the queue
    const song_uri = songs.data.tracks.items[0].uri;

    if (newSongExists) {
      alert("Song already in queue");
      return;
    }

    if (!name) return;

    const song = {
      name: newSong,
      uri: newSong,
      upvotes: [name],
      downvotes: [],
      img: "",
      submittedBy: name,
    } satisfies Track;

    void updateDoc(doc(db, "queue", room.queueId), {
      tracks: [...queue.tracks, song],
    });

    void updateDoc(doc(db, "rooms", id), {
      newSuggestion: {
        name: newSong,
        uri: newSong,
        submittedBy: name,
        downvotes: [],
        upvotes: [name],
        img: "",
      },
    } satisfies Partial<Room>);

    toast({
      title: "✅ New song added!",
      description: `Your song "${newSong}" has been added to the queue.`,
    });

    // clear blast after 10 seconds
    setTimeout(() => {
      void updateDoc(doc(db, "rooms", id), {
        newSuggestion: {
          name: "",
          uri: "",
          submittedBy: "",
          downvotes: [],
          upvotes: [],
          img: "",
        },
      } satisfies Partial<Room>);
    }, 4 * 1000);

    setNewSong("");
  };

  const handleUpvote = (track: Track) => {
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
      track.upvotes.length > room.members.length / 2 &&
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
  const handleDownvote = (track: Track) => {
    if (!name) return;

    if (track.downvotes.includes(name)) return;

    void updateDoc(doc(db, "queue", room.queueId), {
      tracks: queue.tracks.map((t) =>
        t.name === track.name
          ? {
              ...t,
              downvotes: [...t.downvotes, name],
              upvotes: t.upvotes.filter((upvote) => upvote !== name),
            }
          : t,
      ),
    });

    const shouldBlast =
      room.members.length >= 3 &&
      track.downvotes.length >= room.members.length / 2 &&
      !room.blasted.some((t) => t.track.name === track.name);

    if (shouldBlast) {
      void updateDoc(doc(db, "rooms", id), {
        blast: {
          name: track.name,
          uri: track.uri,
          submittedBy: track.submittedBy,
          type: "dislike",
        },
        blasted: [...room.blasted, { track, type: "disliked" }],
      } satisfies Partial<Room>);

      // clear blast after 10 seconds
      setTimeout(() => {
        void updateDoc(doc(db, "rooms", id), {
          blast: {
            name: "",
            uri: "",
            submittedBy: "",
            type: "dislike",
          },
        } satisfies Partial<Room>);
      }, 3 * 1000);
    }
  };

  const handlePrevious = async () => {
    await previousSong({
      device_id: room.deviceId,
      access_token: room.accessToken,
    });
  };

  const handleNext = async () => {
    await skipSong({
      device_id: room.deviceId,
      access_token: room.accessToken,
    });
  };

  // const handlePause = async (curr: boolean) => {
  //   if (curr) {
  //     await pauseSong({
  //       device_id: room.deviceId,
  //       access_token: room.accessToken,
  //     });
  //   } else {
  //     await playSong({
  //       device_id: room.deviceId,
  //       access_token: room.accessToken,
  //     });
  //   }
  // };

  return (
    <div className="relative flex min-h-screen w-screen flex-col">
      <div className="sticky top-0 ml-8 mt-28 flex w-full flex-col md:flex-row md:items-center">
        <div className="space-y-4 p-4">
          <h1 className="w-fit bg-slate-50 px-5 py-6 text-6xl font-extrabold">
            {room.code}
          </h1>
          <h2 className="text-sm">
            hosted by: <strong>{room.hostname}</strong>
          </h2>
        </div>
        <div className="space-y-2 px-4 md:ml-8">
          <p className="text-lg font-bold">now playing</p>
          <div className="flex space-x-2 py-3">
            <div className="h-20 w-20 bg-slate-100 text-slate-100">a</div>
            <div className="">
              <p className="font-bold">song name</p>
              <p>artist</p>
            </div>
            <div className="flex w-52 flex-row items-center justify-around rounded-lg outline-dashed">
              <Button onClick={handlePrevious}>
                <SkipBack />
              </Button>
              <Button onClick={() => setPlay((prevState) => !prevState)}>
                {!play ? <Pause /> : <PlayIcon />}
              </Button>
              <Button onClick={handleNext}>
                <SkipForward />
              </Button>
            </div>
          </div>
        </div>
      </div>
      <Separator />
      <div className="ml-8 p-4">
        <div className="flex space-x-2 py-3">
          <div className="h-20 w-20 bg-slate-100 text-slate-100">a</div>
          <div className="">
            <p className="font-bold">song name</p>
            <p>artist</p>
          </div>
        </div>
        <div className="flex space-x-2 py-3">
          <div className="h-20 w-20 bg-slate-100 text-slate-100">a</div>
          <div className="">
            <p className="font-bold">song name</p>
            <p>artist</p>
          </div>
        </div>
        <div className="flex space-x-2 py-3">
          <div className="h-20 w-20 bg-slate-100 text-slate-100">a</div>
          <div className="">
            <p className="font-bold">song name</p>
            <p>artist</p>
          </div>
        </div>
        {queue.tracks.map((track) => (
          <div key={track.uri} className="flex space-x-2 py-3">
            <div className="h-20 w-20 bg-slate-100 text-slate-100">a</div>
            <div className="">
              <p className="font-bold">song name</p>
              <p>artist</p>
            </div>
          </div>
        ))}
        <div className="fixed bottom-0 left-0 w-screen px-12 py-4">
          <Card className="flex space-x-3 p-3">
            <Input
              value={newSong}
              onChange={(e) => setNewSong(e.target.value)}
            />
            <Button>🚀 Suggest</Button>
          </Card>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen w-screen flex-col items-center justify-center">
      <div className="space-y-4">
        <h1>User Room</h1>
        <div className="flex space-x-4">
          <div>
            <p>Host</p>
            <p>{room.hostname}</p>
          </div>
          <div>
            <p>Room ID</p>
            <p>{id}</p>
          </div>
          <div>
            <p>Code</p>
            <p>{room.code}</p>
          </div>
        </div>
        <div className="flex space-x-4">
          <div className="min-w-96 space-y-4">
            <p>Queue</p>
            <div className="max-h-[50vh] overflow-scroll">
              {queue.tracks.map((track) => {
                const isUpvoted = track.upvotes.includes(name);
                const isDownvoted = track.downvotes.includes(name);
                const blasted = room.blasted.find(
                  (t) => t.track.name === track.name,
                );

                return (
                  <>
                    <div
                      key={track.name}
                      className={`flex justify-between px-3 py-3 ${blasted && "bg-slate-50"}`}
                    >
                      <p className="flex items-center gap-2">
                        {blasted && <LockClosedIcon />} {track.name}
                      </p>
                      {!blasted ? (
                        <div>
                          <Label>
                            <Button
                              variant="ghost"
                              onClick={() => handleUpvote(track)}
                              className={`${isUpvoted ? "text-green-600" : ""}`}
                            >
                              <ChevronUpIcon /> {track.upvotes.length}
                            </Button>
                          </Label>
                          <Label>
                            <Button
                              variant="ghost"
                              onClick={() => handleDownvote(track)}
                              className={`${isDownvoted ? "text-red-600" : ""}`}
                            >
                              <ChevronDownIcon /> {track.downvotes.length}
                            </Button>
                          </Label>
                        </div>
                      ) : (
                        <div className="px-2">
                          {blasted.type === "like" ? "🎉" : "💀"}
                        </div>
                      )}
                    </div>
                    <Separator />
                  </>
                );
              })}
            </div>
            <div>
              <form onSubmit={handleSubmitSong}>
                <div className="flex w-full max-w-sm items-center space-x-2">
                  <Input
                    placeholder="song name"
                    value={newSong}
                    onChange={(e) => setNewSong(e.target.value)}
                  />
                  <Button type="submit">Suggest</Button>
                </div>
              </form>
            </div>
          </div>
          <div>
            <p>Members</p>
            {room.members.map((member) => (
              <p key={member}>{member}</p>
            ))}
          </div>
        </div>
      </div>
      {room.blast.name && <Blast {...room.blast} />}
    </div>
  );
}
