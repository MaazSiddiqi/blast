"use client";

import { Button } from "@/_components/ui/button";
import { Card } from "@/_components/ui/card";
import { Input } from "@/_components/ui/input";
import { Separator } from "@/_components/ui/separator";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/_components/ui/sheet";
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
  addQueue,
  pauseSong,
  playbackState,
  playSong,
  previousSong,
  searchSong,
  skipSong,
} from "@/lib/spotify";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  LockClosedIcon,
  PauseIcon,
  PlayIcon,
} from "@radix-ui/react-icons";
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

  // poll spotify track progress every 3 seconds
  // useEffect(() => {
  //   if (!host) return;

  //   const interval = setInterval(
  //     () => {
  //       const state = async () => {
  //         const pop = queue.tracks[0];

  //         void updateDoc(doc(db, "queue", room.queueId), {
  //           tracks: queue.tracks.slice(1),
  //         });

  //         void addQueue({
  //           access_token: room.accessToken,
  //           device_id: room.deviceId,
  //           uri: pop!.uri,
  //         });
  //       };

  //       void state();
  //     },
  //     60 * 2.5 * 1000,
  //   );

  //   return () => clearInterval(interval);
  // }, [room.deviceId, room.accessToken, host, room.queueId, queue.tracks]);

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
    const songs = (await searchSong({
      search_text: newSong,
      access_token: res.data as string,
    })) as {
      data: {
        tracks: {
          items: {
            uri: string;
            name: string;
            album: {
              images: { url: string }[];
            };
          }[];
        };
      };
    };

    if (songs.data.tracks.items.length === 0) {
      alert("Song not found");
      return;
    }

    // add the top result selected song uri to the queue
    const song_uri = songs.data.tracks.items[0]!.uri;
    const song_img = songs.data.tracks.items[0]!.album.images[1].url;
    const song_name = songs.data.tracks.items[0]!.name;

    if (newSongExists) {
      alert("Song already in queue");
      return;
    }

    if (!name) return;

    const song = {
      name: song_name,
      uri: song_uri,
      upvotes: [name],
      downvotes: [],
      img: song_img,
      submittedBy: name,
    } satisfies Track;

    if (room.currentTrack.name === "") {
      void addQueue({
        access_token: room.accessToken,
        device_id: room.deviceId,
        uri: song.uri,
      }).then(() => {
        void skipSong({
          access_token: room.accessToken,
          device_id: room.deviceId,
        });
      });

      void updateDoc(doc(db, "rooms", id), {
        currentTrack: song,
      } satisfies Partial<Room>);

      toast({
        title: "✅ New song added!",
        description: `Your song "${newSong}" has been added directly to the queue.`,
      });

      setNewSong("");
      return;
    }

    void updateDoc(doc(db, "queue", room.queueId), {
      tracks: [...queue.tracks, song],
    });

    void updateDoc(doc(db, "rooms", id), {
      newSuggestion: song,
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

    const shouldSkip = queue.tracks.length === 0;

    void updateDoc(doc(db, "queue", room.queueId), {
      tracks: queue.tracks.map((t) =>
        t.name === track.name
          ? {
              ...t,
              upvotes: [...t.upvotes, name],
              downvotes: t.downvotes.filter(
                (downvote) => downvote !== name && room.members.includes(name),
              ),
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

      // add it to spotify queue
      void addQueue({
        access_token: room.accessToken,
        device_id: room.deviceId,
        uri: track.uri,
      });

      // void updateDoc(doc(db, "queue", room.queueId), {
      //   tracks: queue.tracks.slice(1),
      // });

      if (shouldSkip) {
        void skipSong({
          access_token: room.accessToken,
          device_id: room.deviceId,
        });
      }

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
              upvotes: t.upvotes.filter(
                (upvote) => upvote !== name && room.members.includes(name),
              ),
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

      // void updateDoc(doc(db, "queue", room.queueId), {
      //   tracks: queue.tracks.filter((t) => t.name !== track.name),
      // });

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

  const handlePlay = async () => {
    void playSong({
      access_token: room.accessToken,
      device_id: room.deviceId,
    });
  };

  const handlePause = async () => {
    void pauseSong({
      access_token: room.accessToken,
      device_id: room.deviceId,
    });
  };

  const handleSkip = async () => {
    void skipSong({
      access_token: room.accessToken,
      device_id: room.deviceId,
    });
  };

  return (
    <div className="relative flex min-h-screen w-screen flex-col">
      <div className="ml-8 mt-28 flex w-full flex-col bg-white md:flex-row md:items-center">
        <div className="space-y-4 p-4">
          <h1 className="w-fit bg-slate-50 px-5 py-6 text-6xl font-extrabold">
            {room.code}
          </h1>
          <h2 className="text-sm">
            hosted by: <strong>{room.hostname}</strong>
          </h2>
        </div>
        {host && (
          <div>
            <div className="space-y-2 px-4 md:ml-8">
              <p className="text-lg font-bold">now playing</p>
              <div className="flex space-x-2 py-3">
                <div className="h-20 w-20 bg-slate-100 text-slate-100">
                  <div>
                    <img
                      src={
                        room.currentTrack.img ||
                        "https://www.shutterstock.com/image-vector/blank-avatar-photo-place-holder-600nw-1114445501.jpg"
                      }
                      alt="Album cover"
                    />
                  </div>
                </div>
                <div className="">
                  <p className="font-bold">
                    {room.currentTrack.name || "no track playing"}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex space-x-4 p-4">
              <Button variant={"outline"}>Previous</Button>
              <Button variant={"outline"} onClick={handlePlay}>
                <PlayIcon />
              </Button>
              <Button variant={"outline"} onClick={handlePause}>
                <PauseIcon />
              </Button>
              <Button variant={"outline"} onClick={handleSkip}>
                Skip
              </Button>
            </div>
          </div>
        )}

        {!host && room.currentTrack.name && (
          <div className="space-y-2 px-4 md:ml-8">
            <p className="text-lg font-bold">now playing</p>
            <div className="flex space-x-2 py-3">
              <div className="h-20 w-20">
                <img src={room.currentTrack.img} alt="Album Cover" />
              </div>
              <div className="">
                <p className="font-bold">{room.currentTrack.name}</p>
              </div>
            </div>
          </div>
        )}
      </div>
      <Separator />
      <div className="flex w-full space-x-4 divide-y">
        <div className="mb-20 ml-8 grow p-4">
          {queue.tracks.length === 0 && (
            <div className="flex h-96 items-center justify-center">
              <p className="text-lg">No songs in queue</p>
            </div>
          )}
          {queue.tracks.map((track) => {
            const blasted = room.blasted.find(
              (t) => t.track.name === track.name,
            );

            return (
              <div
                key={track.uri}
                className="flex justify-between space-x-2 px-3 py-3 odd:bg-slate-50"
              >
                <div className="flex space-x-2">
                  <div className="h-20 w-20">
                    <img src={track.img} alt="Album cover" />
                  </div>
                  <div className="">
                    <p className="max-w-[70%] font-bold">{track.name}</p>
                    <p>
                      Submitted by <strong>{track.submittedBy}</strong>
                    </p>
                  </div>
                </div>
                {!blasted ? (
                  <div className="flex">
                    <Button
                      variant="ghost"
                      onClick={() => handleUpvote(track)}
                      className={`${track.upvotes.includes(name) ? "text-green-600" : ""}`}
                    >
                      🙌 {track.upvotes.length}
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => handleDownvote(track)}
                      className={`${track.downvotes.includes(name) ? "text-red-600" : ""}`}
                    >
                      🚫 {track.downvotes.length}
                    </Button>
                  </div>
                ) : (
                  <div className="px-2">
                    {blasted.type === "like" ? "🎉" : "💀"}
                  </div>
                )}
              </div>
            );
          })}
          <div className="fixed bottom-0 left-0 w-screen px-12 py-4">
            <form
              onSubmit={handleSubmitSong}
              className="flex space-x-3 rounded-xl bg-white p-3"
            >
              <Input
                value={newSong}
                onChange={(e) => setNewSong(e.target.value)}
              />
              <Button type="submit">🚀 Suggest</Button>
            </form>
          </div>
        </div>
        <div className="hidden w-1/4 space-y-2 py-4 md:block">
          <h3 className="font-bold">members</h3>
          {room.members.map((member) => (
            <div key={member}>
              <p>{member}</p>
            </div>
          ))}
        </div>
        <div className="fixed right-8 top-8 md:hidden">
          <Sheet>
            <SheetTrigger className="m-4">
              <Button>members</Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>members</SheetTitle>
                <SheetDescription>
                  {room.members.map((member) => (
                    <div key={member}>
                      <p>{member}</p>
                    </div>
                  ))}
                </SheetDescription>
              </SheetHeader>
            </SheetContent>
          </Sheet>
        </div>
        {room.blast.name && <Blast {...room.blast} />}
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
