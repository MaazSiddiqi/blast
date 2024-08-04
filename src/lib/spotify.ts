import axios from "axios";

interface SpotifyFunctionProps {
  uri?: string;
  device_id?: string;
  access_token?: string;
  search_text?: string;
}

const addQueue = async ({
  uri,
  device_id,
  access_token,
}: SpotifyFunctionProps) => {
  await axios.post(
    "https://api.spotify.com/v1/me/player/queue",
    { uri: uri, device_id: device_id },
    { headers: { Authorization: `Bearer ${access_token}` } },
  );
};

const playSong = async ({ device_id, access_token }: SpotifyFunctionProps) => {
  await axios.put(
    "https://api.spotify.com/v1/me/player/play",
    { device_id: device_id },
    { headers: { Authorization: `Bearer ${access_token}` } },
  );
};

const pauseSong = async ({ device_id, access_token }: SpotifyFunctionProps) => {
  await axios.put(
    "https://api.spotify.com/v1/me/player/pause",
    { device_id: device_id },
    { headers: { Authorization: `Bearer ${access_token}` } },
  );
};

const skipSong = async ({ device_id, access_token }: SpotifyFunctionProps) => {
  await axios.post(
    "https://api.spotify.com/v1/me/player/next",
    { device_id: device_id },
    { headers: { Authorization: `Bearer ${access_token}` } },
  );
};

const previousSong = async ({
  device_id,
  access_token,
}: SpotifyFunctionProps) => {
  await axios.post(
    "https://api.spotify.com/v1/me/player/previous",
    { device_id: device_id },
    { headers: { Authorization: `Bearer ${access_token}` } },
  );
};

const searchSong = async ({
  search_text,
  access_token,
}: SpotifyFunctionProps) => {
  return await axios.get(
    "https://api.spotify.com/v1/search?q=" +
      search_text +
      "&type=track&limit=5",
    {
      headers: { Authorization: `Bearer ${access_token}` },
    },
  );
};
export { addQueue, playSong, pauseSong, skipSong, previousSong, searchSong };
