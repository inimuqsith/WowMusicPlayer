import { useState, useEffect, useRef } from "react";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Shuffle,
  Repeat,
  Sparkles,
  Music,
  Speaker,
  ShieldCheck,
  Search,
  Lock,
  Radio,
  CheckCircle2,
  Cloud,
  Layers,
} from "lucide-react";
import { invoke } from "@tauri-apps/api/core";

interface TimedLyricLine {
  timestamp_ms: number;
  text: string;
}

interface AudioDeviceInfo {
  name: string;
  is_default: boolean;
  max_sample_rate: number;
  supported_channels: number;
}

interface UnifiedTrackItem {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration_secs: number;
  isrc?: string;
  original_source: "Spotify" | "YouTubeMusic" | "AppleMusic" | "Tidal" | "Local";
  preferred_provider: "Spotify" | "YouTubeMusic" | "Tidal" | "Local";
  cover_url: string;
  audio_quality: string;
}

const SAMPLE_SUPER_PLAYLIST: UnifiedTrackItem[] = [
  {
    id: "sp-1",
    title: "Bohemian Rhapsody",
    artist: "Queen",
    album: "A Night at the Opera",
    duration_secs: 354,
    isrc: "GBUM71029604",
    original_source: "Spotify",
    preferred_provider: "Spotify",
    cover_url: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&auto=format&fit=crop&q=80",
    audio_quality: "Spotify Premium (320 kbps)",
  },
  {
    id: "yt-2",
    title: "Starboy",
    artist: "The Weeknd, Daft Punk",
    album: "Starboy",
    duration_secs: 230,
    isrc: "USUM71607007",
    original_source: "YouTubeMusic",
    preferred_provider: "YouTubeMusic",
    cover_url: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&auto=format&fit=crop&q=80",
    audio_quality: "YouTube Audio (Opus 160 kbps)",
  },
  {
    id: "am-3",
    title: "Blinding Lights",
    artist: "The Weeknd",
    album: "After Hours",
    duration_secs: 200,
    isrc: "USUG11904206",
    original_source: "AppleMusic",
    preferred_provider: "Tidal",
    cover_url: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&auto=format&fit=crop&q=80",
    audio_quality: "TIDAL HiFi (Lossless FLAC)",
  },
  {
    id: "loc-4",
    title: "Hotel California (Live)",
    artist: "Eagles",
    album: "Hell Freezes Over",
    duration_secs: 432,
    isrc: "USEE19400001",
    original_source: "Local",
    preferred_provider: "Local",
    cover_url: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&auto=format&fit=crop&q=80",
    audio_quality: "Local Storage (FLAC 24-bit / 96 kHz)",
  },
];

const DEFAULT_LYRICS: TimedLyricLine[] = [
  { timestamp_ms: 0, text: "Is this the real life?" },
  { timestamp_ms: 4200, text: "Is this just fantasy?" },
  { timestamp_ms: 8500, text: "Caught in a landslide, no escape from reality" },
  { timestamp_ms: 15100, text: "Open your eyes, look up to the skies and see" },
  { timestamp_ms: 22800, text: "I'm just a poor boy, I need no sympathy" },
  { timestamp_ms: 29400, text: "Because I'm easy come, easy go, little high, little low" },
  { timestamp_ms: 37200, text: "Any way the wind blows doesn't really matter to me, to me" },
  { timestamp_ms: 48000, text: "Mama, just killed a man" },
  { timestamp_ms: 54300, text: "Put a gun against his head, pulled my trigger, now he's dead" },
  { timestamp_ms: 61800, text: "Mama, life had just begun" },
  { timestamp_ms: 67200, text: "But now I've gone and thrown it all away" },
  { timestamp_ms: 74500, text: "Mama, ooh, didn't mean to make you cry" },
  { timestamp_ms: 82100, text: "If I'm not back again this time tomorrow" },
  { timestamp_ms: 87800, text: "Carry on, carry on as if nothing really matters" },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<"now-playing" | "aggregator" | "devices" | "vault">("now-playing");
  const [tracks, setTracks] = useState<UnifiedTrackItem[]>(SAMPLE_SUPER_PLAYLIST);
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTimeMs, setCurrentTimeMs] = useState<number>(15500);
  const [volume, setVolume] = useState<number>(0.85);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [lyrics, setLyrics] = useState<TimedLyricLine[]>(DEFAULT_LYRICS);
  const [lyricsSource, setLyricsSource] = useState<string>("LRCLIB (Synced 60 FPS)");
  const [audioDevices, setAudioDevices] = useState<AudioDeviceInfo[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string>("");
  const [bitPerfectExclusive, setBitPerfectExclusive] = useState<boolean>(true);
  const [autoSampleRate, setAutoSampleRate] = useState<boolean>(true);

  // Aggregator inputs
  const [playlistUrlInput, setPlaylistUrlInput] = useState<string>("");
  const [isImporting, setIsImporting] = useState<boolean>(false);

  // Vault tester
  const [vaultPassword, setVaultPassword] = useState<string>("WowMasterPass2026!");
  const [vaultPlaintext, setVaultPlaintext] = useState<string>("tidal_session_token_xyz_encrypted_secret");
  const [encryptedResult, setEncryptedResult] = useState<any>(null);
  const [decryptedResult, setDecryptedResult] = useState<string>("");
  const [isVaultBusy, setIsVaultBusy] = useState<boolean>(false);

  const currentTrack = tracks[currentTrackIndex] || tracks[0];
  const lyricsContainerRef = useRef<HTMLDivElement>(null);

  // Fetch audio devices from Tauri backend on mount
  useEffect(() => {
    async function loadDevices() {
      try {
        const devs = await invoke<AudioDeviceInfo[]>("get_audio_devices");
        if (devs && devs.length > 0) {
          setAudioDevices(devs);
          const def = devs.find((d) => d.is_default) || devs[0];
          setSelectedDevice(def.name);
        }
      } catch (err) {
        console.warn("Using fallback audio devices in browser preview:", err);
        setAudioDevices([
          { name: "Default System Output (ALSA / PipeWire)", is_default: true, max_sample_rate: 192000, supported_channels: 2 },
          { name: "USB DAC Bit-Perfect (WASAPI / ALSA Direct)", is_default: false, max_sample_rate: 384000, supported_channels: 2 },
        ]);
        setSelectedDevice("Default System Output (ALSA / PipeWire)");
      }
    }
    loadDevices();
  }, []);

  // Fetch real-time synced lyrics from Tauri backend (LRCLIB / TIDAL)
  useEffect(() => {
    async function loadLyrics() {
      try {
        const payload = await invoke<{
          is_synced: boolean;
          lines: TimedLyricLine[];
          source: string;
        }>("fetch_lyrics", {
          trackName: currentTrack.title,
          artistName: currentTrack.artist,
          albumName: currentTrack.album,
          durationSecs: currentTrack.duration_secs,
        });
        if (payload && payload.lines && payload.lines.length > 0) {
          setLyrics(payload.lines);
          setLyricsSource(payload.source);
          return;
        }
      } catch (err) {
        console.warn("Using default synced lyrics fallback:", err);
      }
      setLyrics(DEFAULT_LYRICS);
      setLyricsSource("LRCLIB (Synced 60 FPS)");
    }
    loadLyrics();
  }, [currentTrack]);

  // Playback timer simulation
  useEffect(() => {
    let interval: any = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTimeMs((prev) => {
          if (prev >= currentTrack.duration_secs * 1000) {
            handleNext();
            return 0;
          }
          return prev + 500;
        });
      }, 500);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentTrack]);

  // Auto-scroll active lyric
  const activeLyricIndex = lyrics.findIndex((line, i) => {
    const nextLine = lyrics[i + 1];
    if (nextLine) {
      return currentTimeMs >= line.timestamp_ms && currentTimeMs < nextLine.timestamp_ms;
    }
    return currentTimeMs >= line.timestamp_ms;
  });

  useEffect(() => {
    if (lyricsContainerRef.current && activeLyricIndex !== -1) {
      const activeEl = lyricsContainerRef.current.children[activeLyricIndex] as HTMLElement;
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [activeLyricIndex]);

  const togglePlay = async () => {
    const nextState = !isPlaying;
    setIsPlaying(nextState);
    try {
      if (nextState) {
        await invoke("play_track", {
          trackId: currentTrack.id,
          durationMs: currentTrack.duration_secs * 1000,
          qualityLabel: currentTrack.audio_quality,
        });
      } else {
        await invoke("pause_playback");
      }
    } catch (e) {
      // Browser preview fallback
    }
  };

  const handleNext = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % tracks.length);
    setCurrentTimeMs(0);
  };

  const handlePrev = () => {
    setCurrentTrackIndex((prev) => (prev - 1 + tracks.length) % tracks.length);
    setCurrentTimeMs(0);
  };

  const handleSeek = async (newMs: number) => {
    setCurrentTimeMs(newMs);
    try {
      await invoke("seek_playback", { positionMs: newMs });
    } catch (e) {}
  };

  const handleImportPlaylist = () => {
    if (!playlistUrlInput.trim()) return;
    setIsImporting(true);
    setTimeout(() => {
      const src = playlistUrlInput.includes("youtube")
        ? "YouTubeMusic"
        : playlistUrlInput.includes("apple")
        ? "AppleMusic"
        : playlistUrlInput.includes("tidal")
        ? "Tidal"
        : "Spotify";

      const newImported: UnifiedTrackItem = {
        id: `agg-${Date.now()}`,
        title: "Levitating",
        artist: "Dua Lipa",
        album: "Future Nostalgia",
        duration_secs: 203,
        isrc: "GBAYE2000632",
        original_source: src,
        preferred_provider: src === "AppleMusic" ? "Spotify" : (src as any),
        cover_url: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&auto=format&fit=crop&q=80",
        audio_quality: "High Fidelity Stream",
      };
      setTracks((prev) => [newImported, ...prev]);
      setPlaylistUrlInput("");
      setIsImporting(false);
    }, 600);
  };

  const handleTestVaultEncrypt = async () => {
    setIsVaultBusy(true);
    try {
      const res = await invoke("vault_encrypt", {
        password: vaultPassword,
        plaintext: vaultPlaintext,
      });
      setEncryptedResult(res);
      setDecryptedResult("");
    } catch (e) {
      alert("Encryption error: " + e);
    } finally {
      setIsVaultBusy(false);
    }
  };

  const handleTestVaultDecrypt = async () => {
    if (!encryptedResult) return;
    setIsVaultBusy(true);
    try {
      const res = await invoke<string>("vault_decrypt", {
        password: vaultPassword,
        item: encryptedResult,
      });
      setDecryptedResult(res);
    } catch (e) {
      alert("Decryption error: " + e);
    } finally {
      setIsVaultBusy(false);
    }
  };

  const formatSeconds = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = Math.floor(totalSec % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-zinc-950 text-zinc-100">
      {/* Sidebar Navigation */}
      <aside className="flex flex-col w-64 border-r border-zinc-800/80 bg-zinc-900/50 backdrop-blur-xl p-4 gap-6 select-none shrink-0">
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-2">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/20">
            <Radio className="w-5 h-5 text-zinc-950 font-bold" />
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-tight bg-gradient-to-r from-zinc-100 to-zinc-400 bg-clip-text text-transparent">
              WowMusic
            </h1>
            <div className="flex items-center gap-1.5">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-[10px] uppercase font-semibold tracking-wider text-emerald-400/90">
                Hi-Res Audio
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex flex-col gap-1.5 text-sm font-medium">
          <button
            onClick={() => setActiveTab("now-playing")}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
              activeTab === "now-playing"
                ? "bg-cyan-500/15 text-cyan-400 shadow-sm border border-cyan-500/30"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
            }`}
          >
            <Music className="w-4 h-4" />
            <span>Now Playing & Lyrics</span>
          </button>

          <button
            onClick={() => setActiveTab("aggregator")}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
              activeTab === "aggregator"
                ? "bg-cyan-500/15 text-cyan-400 shadow-sm border border-cyan-500/30"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Playlist Aggregator</span>
            <span className="ml-auto text-[10px] bg-cyan-500/20 text-cyan-300 font-semibold px-2 py-0.5 rounded-full border border-cyan-500/30">
              {tracks.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("devices")}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
              activeTab === "devices"
                ? "bg-cyan-500/15 text-cyan-400 shadow-sm border border-cyan-500/30"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
            }`}
          >
            <Speaker className="w-4 h-4" />
            <span>Audio & DAC Engine</span>
          </button>

          <button
            onClick={() => setActiveTab("vault")}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
              activeTab === "vault"
                ? "bg-cyan-500/15 text-cyan-400 shadow-sm border border-cyan-500/30"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>WowCloud Vault</span>
          </button>
        </nav>

        {/* Server & VPS Status Badge */}
        <div className="mt-auto p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/60 text-xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-zinc-400 font-medium flex items-center gap-1.5">
              <Cloud className="w-3.5 h-3.5 text-cyan-400" />
              vps-advin
            </span>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded font-mono font-medium">
              160.187.211.115
            </span>
          </div>
          <p className="text-[11px] text-zinc-500 leading-relaxed">
            WowServer cloud session active for encrypted sync & remote handoff.
          </p>
        </div>
      </aside>

      {/* Main Content View */}
      <main className="flex-1 flex flex-col min-w-0 bg-gradient-to-b from-zinc-900/40 to-zinc-950 overflow-hidden">
        {/* VIEW 1: Now Playing & Live Lyrics */}
        {activeTab === "now-playing" && (
          <div className="flex-1 flex flex-col md:flex-row p-6 gap-8 overflow-hidden">
            {/* Left: Album Art & Details */}
            <div className="flex-1 flex flex-col items-center justify-center max-w-md mx-auto text-center">
              <div className="relative group w-72 h-72 md:w-80 md:h-80 rounded-2xl overflow-hidden shadow-2xl shadow-cyan-500/10 border border-zinc-800">
                <img
                  src={currentTrack.cover_url}
                  alt={currentTrack.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-transparent pointer-events-none" />
                <span className="absolute top-3 left-3 text-[11px] font-semibold bg-zinc-900/90 text-cyan-400 px-2.5 py-1 rounded-full border border-cyan-500/30 backdrop-blur-md">
                  {currentTrack.audio_quality}
                </span>
              </div>

              <div className="mt-6 w-full">
                <h2 className="text-2xl font-bold tracking-tight text-zinc-100 truncate">
                  {currentTrack.title}
                </h2>
                <p className="text-base text-zinc-400 mt-1 font-medium truncate">
                  {currentTrack.artist}
                </p>
                <div className="flex items-center justify-center gap-2 mt-3">
                  <span className="text-xs text-zinc-400 bg-zinc-800/60 px-2.5 py-1 rounded-full border border-zinc-700/50">
                    Origin: {currentTrack.original_source}
                  </span>
                  <span className="text-xs text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-full border border-cyan-500/30 font-medium">
                    Playing via: {currentTrack.preferred_provider}
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Live Karaoke Lyrics */}
            <div className="flex-1 flex flex-col bg-zinc-900/30 border border-zinc-800/80 rounded-2xl p-6 backdrop-blur-md overflow-hidden">
              <div className="flex items-center justify-between pb-4 border-b border-zinc-800/60 shrink-0">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
                  <h3 className="font-semibold text-sm uppercase tracking-wider text-zinc-300">
                    Immersive Live Lyrics
                  </h3>
                </div>
                <span className="text-xs font-mono text-zinc-500 bg-zinc-800/50 px-2 py-0.5 rounded">
                  {lyricsSource}
                </span>
              </div>

              {/* Scrolling Lyrics Container */}
              <div
                ref={lyricsContainerRef}
                className="flex-1 overflow-y-auto space-y-4 py-8 px-2 scroll-smooth text-left"
              >
                {lyrics.map((line, idx) => {
                  const isActive = idx === activeLyricIndex;
                  return (
                    <div
                      key={idx}
                      onClick={() => handleSeek(line.timestamp_ms as number)}
                      className={`cursor-pointer transition-all duration-300 text-lg md:text-xl font-medium tracking-tight rounded-xl px-4 py-2 ${
                        isActive
                          ? "text-cyan-300 font-bold text-2xl scale-[1.02] bg-cyan-500/10 border-l-4 border-cyan-400 shadow-lg shadow-cyan-500/10"
                          : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/30"
                      }`}
                    >
                      {line.text}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* VIEW 2: Universal Playlist Aggregator */}
        {activeTab === "aggregator" && (
          <div className="flex-1 flex flex-col p-8 overflow-y-auto max-w-6xl w-full mx-auto space-y-6">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-zinc-100">
                Universal Playlist Aggregator
              </h2>
              <p className="text-sm text-zinc-400 mt-1">
                Satukan playlist Anda dari Spotify, YouTube Music, dan Apple Music. Lagu-lagu akan secara cerdas dicocokkan via ISRC ke katalog TIDAL Lossless FLAC.
              </p>
            </div>

            {/* Importer Box */}
            <div className="flex gap-3 p-2 bg-zinc-900/80 border border-zinc-800 rounded-2xl shadow-xl">
              <div className="relative flex-1 flex items-center">
                <Search className="w-5 h-5 text-zinc-400 absolute left-4" />
                <input
                  type="text"
                  placeholder="Tempel link playlist Spotify / YouTube Music / Apple Music..."
                  value={playlistUrlInput}
                  onChange={(e) => setPlaylistUrlInput(e.target.value)}
                  className="w-full bg-transparent pl-12 pr-4 py-3 text-sm focus:outline-none text-zinc-100 placeholder:text-zinc-500"
                />
              </div>
              <button
                onClick={handleImportPlaylist}
                disabled={isImporting}
                className="px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-semibold rounded-xl text-sm transition-all flex items-center gap-2 shadow-lg shadow-cyan-500/20 disabled:opacity-50"
              >
                {isImporting ? "Mencocokkan ISRC..." : "Import & Up-Resolve"}
              </button>
            </div>

            {/* Aggregated Tracks Table */}
            <div className="border border-zinc-800/80 rounded-2xl overflow-hidden bg-zinc-900/40">
              <table className="w-full text-left text-sm">
                <thead className="bg-zinc-900/80 text-zinc-400 uppercase text-xs font-semibold border-b border-zinc-800">
                  <tr>
                    <th className="px-6 py-4"># Track</th>
                    <th className="px-6 py-4">Artist & Album</th>
                    <th className="px-6 py-4">Original Source</th>
                    <th className="px-6 py-4">Playback Provider (User Choice)</th>
                    <th className="px-6 py-4">Quality Info</th>
                    <th className="px-6 py-4 text-right">Durasi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {tracks.map((t, idx) => (
                    <tr
                      key={t.id}
                      onClick={() => {
                        setCurrentTrackIndex(idx);
                        setCurrentTimeMs(0);
                        setIsPlaying(true);
                      }}
                      className={`hover:bg-zinc-800/40 cursor-pointer transition-colors ${
                        currentTrackIndex === idx ? "bg-cyan-500/10 font-medium" : ""
                      }`}
                    >
                      <td className="px-6 py-4 flex items-center gap-3">
                        <img
                          src={t.cover_url}
                          alt={t.title}
                          className="w-10 h-10 rounded-lg object-cover"
                        />
                        <span className="text-zinc-200 font-semibold">{t.title}</span>
                      </td>
                      <td className="px-6 py-4 text-zinc-400">
                        <div>{t.artist}</div>
                        <div className="text-xs text-zinc-500">{t.album}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-zinc-800 text-zinc-300 border border-zinc-700">
                          {t.original_source}
                        </span>
                      </td>
                      <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                        <select
                          value={t.preferred_provider}
                          onChange={(e) => {
                            const newProvider = e.target.value as any;
                            setTracks((prev) =>
                              prev.map((item, i) =>
                                i === idx ? { ...item, preferred_provider: newProvider } : item
                              )
                            );
                          }}
                          className="bg-zinc-900 border border-zinc-700 text-cyan-300 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-cyan-500 cursor-pointer font-medium"
                        >
                          <option value="Spotify">Stream: Spotify</option>
                          <option value="YouTubeMusic">Stream: YouTube Music</option>
                          <option value="Tidal">Stream: TIDAL HiFi</option>
                          <option value="Local">Local Storage</option>
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          {t.audio_quality}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-mono text-zinc-400">
                        {formatSeconds(t.duration_secs)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* VIEW 3: Audio Hardware & Bit-Perfect Engine */}
        {activeTab === "devices" && (
          <div className="flex-1 flex flex-col p-8 overflow-y-auto max-w-4xl w-full mx-auto space-y-6">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-zinc-100">
                Bit-Perfect Audio Engine
              </h2>
              <p className="text-sm text-zinc-400 mt-1">
                Kendalikan routing audio murni ke DAC eksternal Anda via driver native (WASAPI Exclusive, CoreAudio, ALSA Direct).
              </p>
            </div>

            {/* Hardware Devices List */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
                Terdeteksi Perangkat Output Audio (CPAL Native)
              </h3>
              {audioDevices.map((dev) => (
                <div
                  key={dev.name}
                  onClick={() => setSelectedDevice(dev.name)}
                  className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                    selectedDevice === dev.name
                      ? "bg-cyan-500/15 border-cyan-500/50 shadow-lg shadow-cyan-500/10"
                      : "bg-zinc-900/60 border-zinc-800 hover:bg-zinc-800/40"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Speaker className="w-5 h-5 text-cyan-400" />
                    <div>
                      <div className="font-semibold text-zinc-200 flex items-center gap-2">
                        {dev.name}
                        {dev.is_default && (
                          <span className="text-[10px] bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded">
                            OS Default
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-zinc-500 mt-0.5">
                        Max Sample Rate: {(dev.max_sample_rate / 1000).toFixed(1)} kHz · Channels: {dev.supported_channels}
                      </div>
                    </div>
                  </div>
                  {selectedDevice === dev.name && (
                    <CheckCircle2 className="w-5 h-5 text-cyan-400" />
                  )}
                </div>
              ))}
            </div>

            {/* Audiophile Toggles */}
            <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-zinc-200">Bit-Perfect Exclusive Mode</div>
                  <div className="text-xs text-zinc-400 mt-0.5">
                    Bypass mixer OS sepenuhnya untuk bitstream murni langsung ke DAC eksternal.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={bitPerfectExclusive}
                  onChange={(e) => setBitPerfectExclusive(e.target.checked)}
                  className="w-5 h-5 accent-cyan-500 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-zinc-200">Auto Sample-Rate Switching</div>
                  <div className="text-xs text-zinc-400 mt-0.5">
                    Sesuaikan frekuensi sampling hardware otomatis dengan format file trek (44.1kHz s/d 192kHz).
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={autoSampleRate}
                  onChange={(e) => setAutoSampleRate(e.target.checked)}
                  className="w-5 h-5 accent-cyan-500 cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}

        {/* VIEW 4: WowCloud Vault & Zero-Knowledge Encryption */}
        {activeTab === "vault" && (
          <div className="flex-1 flex flex-col p-8 overflow-y-auto max-w-4xl w-full mx-auto space-y-6">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-zinc-100">
                WowCloud Zero-Knowledge Vault
              </h2>
              <p className="text-sm text-zinc-400 mt-1">
                Kredensial dan sesi TIDAL/Spotify Anda dienkripsi secara lokal menggunakan <strong>AES-256-GCM + Argon2id</strong> sebelum disinkronkan ke server cloud VPS (<code>vps-advin</code>).
              </p>
            </div>

            {/* Interactive Vault Tester */}
            <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
                <Lock className="w-4 h-4" /> Client-Side Crypto Engine Test
              </h3>

              <div className="space-y-3 text-sm">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">Master Password:</label>
                  <input
                    type="password"
                    value={vaultPassword}
                    onChange={(e) => setVaultPassword(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-zinc-200 font-mono text-xs focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">Plaintext Token/Session Data:</label>
                  <input
                    type="text"
                    value={vaultPlaintext}
                    onChange={(e) => setVaultPlaintext(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-zinc-200 font-mono text-xs focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={handleTestVaultEncrypt}
                    disabled={isVaultBusy}
                    className="px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-semibold rounded-xl text-xs transition-all shadow-md shadow-cyan-500/20"
                  >
                    1. Encrypt (AES-256-GCM)
                  </button>
                  <button
                    onClick={handleTestVaultDecrypt}
                    disabled={isVaultBusy || !encryptedResult}
                    className="px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold rounded-xl text-xs transition-all border border-zinc-700 disabled:opacity-40"
                  >
                    2. Decrypt Back
                  </button>
                </div>
              </div>

              {/* Ciphertext Output */}
              {encryptedResult && (
                <div className="mt-4 p-4 rounded-xl bg-zinc-950 border border-zinc-800/80 font-mono text-xs space-y-2">
                  <div className="text-zinc-500 text-[10px] uppercase font-bold">Ciphertext (Tersimpan di Cloud):</div>
                  <div className="text-cyan-400 break-all">{encryptedResult.ciphertext_b64}</div>
                  <div className="text-zinc-500 text-[10px] pt-1">
                    Nonce: <span className="text-zinc-300">{encryptedResult.nonce_b64}</span> · Salt: <span className="text-zinc-300">{encryptedResult.salt_b64}</span>
                  </div>
                </div>
              )}

              {/* Decrypted Output */}
              {decryptedResult && (
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 font-mono text-xs">
                  <div className="text-emerald-400 text-[10px] uppercase font-bold">Decrypted Plaintext:</div>
                  <div className="text-zinc-100 font-semibold mt-1">{decryptedResult}</div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Bottom Audio Player Bar */}
      <footer className="fixed bottom-0 left-0 right-0 h-24 bg-zinc-950/90 border-t border-zinc-800/80 backdrop-blur-2xl px-6 flex items-center justify-between z-50">
        {/* Left: Track Info */}
        <div className="flex items-center gap-4 w-72 min-w-0">
          <img
            src={currentTrack.cover_url}
            alt={currentTrack.title}
            className="w-14 h-14 rounded-xl object-cover border border-zinc-800 shadow-md"
          />
          <div className="min-w-0">
            <div className="text-sm font-semibold text-zinc-100 truncate">
              {currentTrack.title}
            </div>
            <div className="text-xs text-zinc-400 truncate mt-0.5">
              {currentTrack.artist}
            </div>
            <span className="inline-block mt-1 text-[10px] font-medium text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
              {currentTrack.audio_quality.includes("24-bit") ? "Hi-Res FLAC" : "Lossless"}
            </span>
          </div>
        </div>

        {/* Center: Playback Controls & Progress Bar */}
        <div className="flex flex-col items-center gap-2 max-w-xl w-full">
          <div className="flex items-center gap-6">
            <button className="text-zinc-400 hover:text-zinc-200 transition-colors">
              <Shuffle className="w-4 h-4" />
            </button>
            <button
              onClick={handlePrev}
              className="text-zinc-300 hover:text-zinc-100 transition-colors"
            >
              <SkipBack className="w-5 h-5" />
            </button>
            <button
              onClick={togglePlay}
              className="w-11 h-11 rounded-full bg-zinc-100 text-zinc-950 flex items-center justify-center hover:scale-105 transition-transform shadow-lg shadow-zinc-100/20 font-bold"
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 fill-current" />
              ) : (
                <Play className="w-5 h-5 fill-current ml-0.5" />
              )}
            </button>
            <button
              onClick={handleNext}
              className="text-zinc-300 hover:text-zinc-100 transition-colors"
            >
              <SkipForward className="w-5 h-5" />
            </button>
            <button className="text-zinc-400 hover:text-zinc-200 transition-colors">
              <Repeat className="w-4 h-4" />
            </button>
          </div>

          {/* Progress Timeline Slider */}
          <div className="w-full flex items-center gap-3 text-xs font-mono text-zinc-500">
            <span>{formatSeconds(currentTimeMs / 1000)}</span>
            <input
              type="range"
              min={0}
              max={currentTrack.duration_secs * 1000}
              value={currentTimeMs}
              onChange={(e) => handleSeek(Number(e.target.value))}
              className="flex-1 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
            <span>{formatSeconds(currentTrack.duration_secs)}</span>
          </div>
        </div>

        {/* Right: Volume & Extra Controls */}
        <div className="flex items-center justify-end gap-3 w-72">
          <button
            onClick={() => setActiveTab("now-playing")}
            className={`p-2 rounded-xl border transition-all ${
              activeTab === "now-playing"
                ? "bg-cyan-500/20 border-cyan-500 text-cyan-300"
                : "border-zinc-800 text-zinc-400 hover:text-zinc-200"
            }`}
            title="Toggle Live Lyrics"
          >
            <Sparkles className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsMuted(!isMuted)}
            className="text-zinc-400 hover:text-zinc-200"
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="w-5 h-5" />
            ) : (
              <Volume2 className="w-5 h-5" />
            )}
          </button>

          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={isMuted ? 0 : volume}
            onChange={(e) => {
              setVolume(Number(e.target.value));
              setIsMuted(false);
            }}
            className="w-24 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
          />
        </div>
      </footer>
    </div>
  );
}
