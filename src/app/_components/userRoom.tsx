"use client";

import { Button } from "@/_components/ui/button";
import { Input } from "@/_components/ui/input";
import { Separator } from "@/_components/ui/separator";
import { db, Track, type Queue, type Room } from "@/lib/firebase";
import { ChevronDownIcon, ChevronUpIcon } from "@radix-ui/react-icons";
import { Label } from "@radix-ui/react-label";
import { doc, updateDoc } from "firebase/firestore";
import { useEffect, useState } from "react";

type UserRoomProps = {
  id: string;
  room: Room;
  queue: Queue;
};

export default function UserRoom({ room, id, queue }: UserRoomProps) {
  const [newSong, setNewSong] = useState("");
  const name = localStorage.getItem("name");

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

  const handleSubmitSong = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newSong) return;

    const newSongExists = queue.tracks.some((track) => track.name === newSong);

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
  };

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
        </div>
        <div className="flex space-x-4">
          <div className="min-w-96 space-y-4">
            <p>Queue</p>
            <div className="max-h-[50vh] overflow-scroll">
              {queue.tracks.map((track) => {
                const isUpvoted = track.upvotes.includes(name);

                const isDownvoted = track.downvotes.includes(
                  localStorage.getItem("name"),
                );

                return (
                  <>
                    <div key={track.name} className="flex justify-between py-3">
                      <p>{track.name}</p>
                      <div>
                        <Label>
                          <Button
                            variant="ghost"
                            onClick={() => handleUpvote(track)}
                          >
                            <ChevronUpIcon /> {track.upvotes.length}
                          </Button>
                        </Label>
                        <Label>
                          <Button
                            variant="ghost"
                            onClick={() => handleDownvote(track)}
                          >
                            <ChevronDownIcon /> {track.downvotes.length}
                          </Button>
                        </Label>
                      </div>
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
    </div>
  );
}
