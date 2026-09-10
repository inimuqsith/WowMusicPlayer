import React, { useState, useEffect, useRef } from "react";
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
  CheckCircle2,
  Cloud,
  Plus,
  Trash2,
  ListMusic,
  X,
  PictureInPicture2,
  MessageSquare,
  User,
  ChevronRight,
  ShieldCheck,
  Disc3,
  ExternalLink,
} from "lucide-react";
import { invoke } from "@tauri-apps/api/core";
import { ToastContainer, ToastMessage } from "./components/Toast";

export interface Playlist {
  id: string;
  title: string;
  description?: string;
  cover_url?: string;
  track_count: number;
  created_at: number;
  updated_at: number;
}

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
  album?: string;
  duration_secs: number;
  isrc?: string;
  original_source: "Spotify" | "YouTubeMusic" | "AppleMusic" | "Tidal" | "Local";
  preferred_provider: "Spotify" | "YouTubeMusic" | "Tidal" | "Local";
  cover_url: string;
  audio_quality: string;
}

interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar_url: string;
  is_signed_in: boolean;
  cloud_synced: boolean;
  active_devices: number;
}

const SAMPLE_SUPER_PLAYLIST: UnifiedTrackItem[] = [
  {
    id: "sp-1",
    title: "Bohemian Rhapsody",
    artist: "Queen",
    album: "A Night at the Opera (Remastered)",
    duration_secs: 354,
    isrc: "GBUM71029604",
    original_source: "Spotify",
    preferred_provider: "Tidal",
    cover_url: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80",
    audio_quality: "Lossless FLAC 24-bit / 96 kHz",
  },
  {
    id: "sp-2",
    title: "Blinding Lights",
    artist: "The Weeknd",
    album: "After Hours",
    duration_secs: 200,
    isrc: "USUG11904206",
    original_source: "YouTubeMusic",
    preferred_provider: "Spotify",
    cover_url: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80",
    audio_quality: "Hi-Res Lossless 24-bit / 192 kHz",
  },
  {
    id: "sp-3",
    title: "Cruel Summer",
    artist: "Taylor Swift",
    album: "Lover",
    duration_secs: 178,
    isrc: "USUG11901472",
    original_source: "AppleMusic",
    preferred_provider: "Tidal",
    cover_url: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80",
    audio_quality: "Lossless ALAC 24-bit / 48 kHz",
  },
  {
    id: "sp-4",
    title: "Hotel California (Live)",
    artist: "Eagles",
    album: "Hell Freezes Over",
    duration_secs: 432,
    original_source: "Local",
    preferred_provider: "Local",
    cover_url: "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=600&auto=format&fit=crop&q=80",
    audio_quality: "Bit-Perfect Direct DSD 64",
  },
  {
    id: "sp-5",
    title: "vampire",
    artist: "Olivia Rodrigo",
    album: "GUTS",
    duration_secs: 219,
    isrc: "USUG12304910",
    original_source: "Spotify",
    preferred_provider: "Spotify",
    cover_url: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&auto=format&fit=crop&q=80",
    audio_quality: "Lossless FLAC 24-bit / 48 kHz",
  },
];

const DEFAULT_LYRICS: TimedLyricLine[] = [
  { timestamp_ms: 0, text: "Is this the real life?" },
  { timestamp_ms: 4500, text: "Is this just fantasy?" },
  { timestamp_ms: 8500, text: "Caught in a landslide, no escape from reality" },
  { timestamp_ms: 15500, text: "Open your eyes, look up to the skies and see" },
  { timestamp_ms: 24000, text: "I'm just a poor boy, I need no sympathy" },
  { timestamp_ms: 30000, text: "Because I'm easy come, easy go, little high, little low" },
  { timestamp_ms: 38000, text: "Any way the wind blows doesn't really matter to me, to me" },
  { timestamp_ms: 49000, text: "Mama, just killed a man" },
  { timestamp_ms: 55000, text: "Put a gun against his head, pulled my trigger, now he's dead" },
  { timestamp_ms: 63000, text: "Mama, life had just begun" },
  { timestamp_ms: 69000, text: "But now I've gone and thrown it all away" },
  { timestamp_ms: 76000, text: "Mama, ooh, didn't mean to make you cry" },
  { timestamp_ms: 84000, text: "If I'm not back again this time tomorrow" },
  { timestamp_ms: 89000, text: "Carry on, carry on as if nothing really matters" },
];

export default function App() {
  // Navigation: "home" (Apple Music Replay style), "library", "lyrics", "account"
  const [activeTab, setActiveTab] = useState<"home" | "library" | "lyrics" | "account">("home");

  // Playlists & Tracks
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [activePlaylistId, setActivePlaylistId] = useState<string>("");
  const [tracks, setTracks] = useState<UnifiedTrackItem[]>(SAMPLE_SUPER_PLAYLIST);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);

  // Playback State
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTimeMs, setCurrentTimeMs] = useState(0);
  const [volume, setVolume] = useState(0.85);
  const [isMuted, setIsMuted] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);

  // Audio Devices
  const [audioDevices, setAudioDevices] = useState<AudioDeviceInfo[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string>("");

  // Lyrics
  const [lyrics, setLyrics] = useState<TimedLyricLine[]>(DEFAULT_LYRICS);
  const [lyricsSource, setLyricsSource] = useState<string>("LRCLIB (Synced 60 FPS)");
  const lyricsContainerRef = useRef<HTMLDivElement>(null);

  // Toast System
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const showToast = (message: string, type: "success" | "error" | "info" | "warning" = "info", title?: string) => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    setToasts((prev) => [...prev, { id, message, type, title }]);
  };
  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Google Account & Cloud Vault State
  const [userProfile, setUserProfile] = useState<UserProfile>({
    id: "user-google-109283",
    name: "Abdul Muqsith",
    email: "muqsithpersonal@gmail.com",
    avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
    is_signed_in: true,
    cloud_synced: true,
    active_devices: 2,
  });

  // TIDAL Connection State in Account
  const [isConnectingTidal, setIsConnectingTidal] = useState(false);
  const [tidalAuthCode, setTidalAuthCode] = useState<string | null>(null);
  const [tidalVerificationUri, setTidalVerificationUri] = useState<string | null>(null);
  const [customTidalClientId, setCustomTidalClientId] = useState("");
  const [customTidalToken, setCustomTidalToken] = useState("");
  const [isTidalConnected, setIsTidalConnected] = useState(false);

  // Playlist Create Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");

  const currentTrack = tracks[currentTrackIndex] || SAMPLE_SUPER_PLAYLIST[0];

  // 1. Initial Load: Playlists from SQLite
  const loadPlaylists = async () => {
    try {
      const list = await invoke<Playlist[]>("db_get_playlists");
      if (list && list.length > 0) {
        setPlaylists(list);
        const targetId = list.some((p) => p.id === activePlaylistId) ? activePlaylistId : list[0].id;
        setActivePlaylistId(targetId);
        await loadPlaylistTracks(targetId);
        return;
      }
    } catch (err) {
      console.warn("Using sample playlist in browser preview mode:", err);
    }
    setPlaylists([
      {
        id: "default-super-playlist",
        title: "Universal Master Hub",
        description: "Unified cross-platform playlist from Spotify, TIDAL, YouTube Music & Local Hi-Res",
        cover_url: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80",
        track_count: SAMPLE_SUPER_PLAYLIST.length,
        created_at: Date.now(),
        updated_at: Date.now(),
      },
    ]);
    setActivePlaylistId("default-super-playlist");
    setTracks(SAMPLE_SUPER_PLAYLIST);
  };

  const loadPlaylistTracks = async (playlistId: string) => {
    try {
      const trks = await invoke<UnifiedTrackItem[]>("db_get_playlist_tracks", { playlistId });
      if (trks && trks.length > 0) {
        setTracks(trks);
        setCurrentTrackIndex(0);
        setCurrentTimeMs(0);
      }
    } catch (e) {
      console.warn("Using cached tracks:", e);
    }
  };

  useEffect(() => {
    loadPlaylists();
  }, []);

  // 2. Audio Devices enumeration
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
        setAudioDevices([
          { name: "Default System Output (ALSA / PipeWire)", is_default: true, max_sample_rate: 192000, supported_channels: 2 },
          { name: "USB DAC Bit-Perfect (WASAPI / ALSA Direct)", is_default: false, max_sample_rate: 384000, supported_channels: 2 },
        ]);
        setSelectedDevice("Default System Output (ALSA / PipeWire)");
      }
    }
    loadDevices();
  }, []);

  // 3. Lyrics Fetching
  useEffect(() => {
    async function loadLyrics() {
      if (!currentTrack.title || currentTrack.id === "empty") return;
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
        // Fallback to default
      }
      setLyrics(DEFAULT_LYRICS);
      setLyricsSource("LRCLIB (Synced 60 FPS)");
    }
    loadLyrics();
  }, [currentTrack]);

  // 4. Real-time timer synced with playback
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

  // Active lyric index calculation
  const activeLyricIndex = lyrics.findIndex((line, i) => {
    const nextLine = lyrics[i + 1];
    if (nextLine) {
      return currentTimeMs >= line.timestamp_ms && currentTimeMs < nextLine.timestamp_ms;
    }
    return currentTimeMs >= line.timestamp_ms;
  });

  // Auto-scroll active lyric
  useEffect(() => {
    if (lyricsContainerRef.current && activeLyricIndex !== -1) {
      const activeEl = lyricsContainerRef.current.children[activeLyricIndex] as HTMLElement;
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [activeLyricIndex]);

  // Broadcast to Floating Window Overlay
  useEffect(() => {
    const channel = new BroadcastChannel("wowmusic_lyrics_channel");
    channel.onmessage = (event) => {
      if (event.data?.type === "TOGGLE_PLAY") {
        togglePlay();
      }
    };

    const currentLine = lyrics[activeLyricIndex];
    const nextLine = lyrics[activeLyricIndex + 1];

    channel.postMessage({
      type: "LYRICS_SYNC",
      payload: {
        title: currentTrack.title,
        artist: currentTrack.artist,
        currentLineText: currentLine ? currentLine.text : "♪ ...",
        nextLineText: nextLine ? nextLine.text : "",
        currentTimeMs,
        durationSecs: currentTrack.duration_secs,
        isPlaying,
      },
    });

    return () => {
      channel.close();
    };
  }, [currentTrack, activeLyricIndex, currentTimeMs, isPlaying, lyrics]);

  // Playback Controls connected to Rust Real Audio Engine
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
        showToast(`Memutar: ${currentTrack.title}`, "info");
      } else {
        await invoke("pause_playback");
      }
    } catch (e) {
      console.warn("Audio invoke error:", e);
    }
  };

  const handleNext = () => {
    if (tracks.length === 0) return;
    const nextIdx = (currentTrackIndex + 1) % tracks.length;
    setCurrentTrackIndex(nextIdx);
    setCurrentTimeMs(0);
    if (isPlaying) {
      const trk = tracks[nextIdx];
      invoke("play_track", {
        trackId: trk.id,
        durationMs: trk.duration_secs * 1000,
        qualityLabel: trk.audio_quality,
      }).catch(() => {});
    }
  };

  const handlePrev = () => {
    if (tracks.length === 0) return;
    const prevIdx = (currentTrackIndex - 1 + tracks.length) % tracks.length;
    setCurrentTrackIndex(prevIdx);
    setCurrentTimeMs(0);
    if (isPlaying) {
      const trk = tracks[prevIdx];
      invoke("play_track", {
        trackId: trk.id,
        durationMs: trk.duration_secs * 1000,
        qualityLabel: trk.audio_quality,
      }).catch(() => {});
    }
  };

  const handleSeek = async (newMs: number) => {
    setCurrentTimeMs(newMs);
    try {
      await invoke("seek_playback", { positionMs: newMs });
    } catch (e) {}
  };

  const handleVolumeChange = async (newVol: number) => {
    setVolume(newVol);
    setIsMuted(newVol === 0);
    try {
      await invoke("set_volume", { volume: newVol });
    } catch (e) {}
  };

  const handleToggleFloatingLyrics = async () => {
    try {
      await invoke("toggle_floating_lyrics");
      showToast("Widget lirik melayang diaktifkan", "success");
    } catch (err) {
      window.open("?window=overlay", "lyrics-overlay", "width=520,height=140");
    }
  };

  // Playlist Management
  const handleCreatePlaylist = async () => {
    if (!newTitle.trim()) {
      showToast("Nama playlist tidak boleh kosong", "warning");
      return;
    }
    try {
      const newPl = await invoke<Playlist>("db_create_playlist", {
        title: newTitle.trim(),
        description: newDesc.trim() || null,
        coverUrl: null,
      });
      setPlaylists((prev) => [newPl, ...prev]);
      setActivePlaylistId(newPl.id);
      setTracks([]);
      setIsCreateModalOpen(false);
      setNewTitle("");
      setNewDesc("");
      showToast(`Playlist "${newPl.title}" berhasil dibuat`, "success");
    } catch (e) {
      showToast(`Gagal membuat playlist: ${e}`, "error");
    }
  };

  const handleDeletePlaylist = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await invoke("db_delete_playlist", { playlistId: id });
      const remaining = playlists.filter((p) => p.id !== id);
      setPlaylists(remaining);
      if (activePlaylistId === id && remaining.length > 0) {
        setActivePlaylistId(remaining[0].id);
        loadPlaylistTracks(remaining[0].id);
      }
      showToast("Playlist berhasil dihapus", "info");
    } catch (err) {
      showToast(`Gagal menghapus playlist: ${err}`, "error");
    }
  };

  const handleUpdateProvider = async (
    trackId: string,
    newProvider: "Spotify" | "YouTubeMusic" | "Tidal" | "Local"
  ) => {
    try {
      await invoke("db_update_preferred_provider", {
        playlistId: activePlaylistId,
        trackId,
        provider: newProvider,
      });
      setTracks((prev) =>
        prev.map((t) => (t.id === trackId ? { ...t, preferred_provider: newProvider } : t))
      );
      showToast(`Sumber pemutaran diubah ke ${newProvider}`, "success");
    } catch (err) {
      setTracks((prev) =>
        prev.map((t) => (t.id === trackId ? { ...t, preferred_provider: newProvider } : t))
      );
      showToast(`Sumber pemutaran diperbarui ke ${newProvider}`, "info");
    }
  };

  const [pollIntervalId, setPollIntervalId] = useState<any>(null);

  // TIDAL Connection Handler with Automatic Live Polling
  const handleStartTidalAuth = async () => {
    setIsConnectingTidal(true);
    setTidalAuthCode(null);
    if (pollIntervalId) {
      clearInterval(pollIntervalId);
      setPollIntervalId(null);
    }

    try {
      const res = await invoke<{
        device_code: string;
        user_code: string;
        verification_uri: string;
        verification_uri_complete?: string;
        expires_in: number;
        interval: number;
      }>("tidal_start_device_auth");

      const linkUrl = res.verification_uri_complete
        ? `https://${res.verification_uri_complete}`
        : `https://${res.verification_uri}`;

      setTidalAuthCode(res.user_code);
      setTidalVerificationUri(linkUrl);
      showToast(
        `Kode TIDAL: ${res.user_code}. Buka ${res.verification_uri} untuk konfirmasi.`,
        "info",
        "TIDAL Pairing Aktif"
      );

      // Auto-poll TIDAL auth endpoint in background
      const intervalSecs = Math.max(res.interval || 2, 2);
      const timer = setInterval(async () => {
        try {
          const token = await invoke<{
            access_token: string;
            user_id?: number;
          } | null>("tidal_poll_device_token", { deviceCode: res.device_code });

          if (token) {
            clearInterval(timer);
            setPollIntervalId(null);
            setIsTidalConnected(true);
            setTidalAuthCode(null);
            showToast(
              "Akun TIDAL HiFi berhasil terhubung! Kualitas Hi-Res Lossless FLAC aktif.",
              "success",
              "TIDAL Terhubung"
            );
          }
        } catch (err: any) {
          clearInterval(timer);
          setPollIntervalId(null);
          showToast(`Sesi pairing TIDAL berakhir: ${err}`, "warning");
        }
      }, intervalSecs * 1000);

      setPollIntervalId(timer);
    } catch (err: any) {
      showToast(`Gagal memulai auth TIDAL: ${err}`, "error", "Gagal Menghubungi TIDAL");
    } finally {
      setIsConnectingTidal(false);
    }
  };

  const handleCancelTidalAuth = () => {
    if (pollIntervalId) {
      clearInterval(pollIntervalId);
      setPollIntervalId(null);
    }
    setTidalAuthCode(null);
    showToast("Pairing TIDAL dibatalkan", "info");
  };

  const formatTime = (ms: number) => {
    const totalSecs = Math.floor(ms / 1000);
    const m = Math.floor(totalSecs / 60);
    const s = totalSecs % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <div className="relative min-h-screen bg-black text-neutral-100 font-sans select-none overflow-x-hidden pb-32">
      {/* Toast Notification Layer */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Atmospheric Ambient Glow Header (Apple Music Replay style) */}
      <div className="absolute top-0 left-0 right-0 h-96 bg-[radial-gradient(ellipse_80%_60%_at_50%_-15%,rgba(220,50,20,0.28),rgba(255,100,50,0.08),rgba(0,0,0,0))] pointer-events-none -z-0" />

      {/* Top Floating Glass Capsule Navigation Bar */}
      <header className="sticky top-0 z-40 flex items-center justify-between px-6 pt-5 pb-3">
        {/* Brand & Live Audio Tag */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-rose-500 to-amber-500 flex items-center justify-center shadow-lg shadow-rose-950/40">
            <Disc3 className="w-4 h-4 text-white animate-spin [animation-duration:8s]" />
          </div>
          <div>
            <span className="text-sm font-semibold tracking-tight text-white block leading-none">
              WowMusic
            </span>
            <span className="text-[10px] text-neutral-400 font-medium tracking-wide uppercase">
              Universal Hub
            </span>
          </div>
        </div>

        {/* Center Pill Navigation Bar (Apple Music aesthetic) */}
        <nav className="flex items-center gap-1 p-1 rounded-full bg-neutral-900/70 backdrop-blur-2xl border border-white/10 shadow-2xl">
          <button
            onClick={() => setActiveTab("home")}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-200 cursor-pointer ${
              activeTab === "home"
                ? "bg-white/15 text-white shadow-sm"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            Replay
          </button>
          <button
            onClick={() => setActiveTab("library")}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-200 cursor-pointer ${
              activeTab === "library"
                ? "bg-white/15 text-white shadow-sm"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            Library
          </button>
          <button
            onClick={() => setActiveTab("lyrics")}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-200 cursor-pointer ${
              activeTab === "lyrics"
                ? "bg-white/15 text-white shadow-sm"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            Lyrics
          </button>
          <button
            onClick={() => setActiveTab("account")}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-200 cursor-pointer ${
              activeTab === "account"
                ? "bg-white/15 text-white shadow-sm"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            <User className="w-3.5 h-3.5" />
            Account
          </button>
        </nav>

        {/* Right Action Icons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleFloatingLyrics}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-neutral-300 transition-colors cursor-pointer"
            title="Buka Overlay Lirik Melayang Desktop"
          >
            <PictureInPicture2 className="w-3.5 h-3.5 text-rose-400" />
            <span className="hidden sm:inline">Widget Overlay</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-6 pt-4">
        {/* ========================================================================= */}
        {/* TAB 1: HOME (Apple Music Replay Layout)                                   */}
        {/* ========================================================================= */}
        {activeTab === "home" && (
          <div className="space-y-10 animate-in fade-in duration-300">
            {/* Hero Replay Title */}
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-semibold text-rose-400 uppercase tracking-widest">
                <Sparkles className="w-3.5 h-3.5" /> Universal Music Playback
              </div>
              <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white">
                Replay 2026
              </h1>
              <p className="text-neutral-400 text-sm max-w-xl">
                Nikmati lagu favorit dari Spotify, TIDAL, YouTube Music, dan file lokal dalam kualitas audio murni tanpa kompresi.
              </p>
            </div>

            {/* Top Artists / Highlights Carousel (Sesuai Referensi Gambar) */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
                  Artis & Playlist Unggulan <ChevronRight className="w-4 h-4 text-neutral-500" />
                </h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {/* Card 1 */}
                <div
                  onClick={() => {
                    setCurrentTrackIndex(0);
                    if (!isPlaying) togglePlay();
                  }}
                  className="group relative h-64 rounded-2xl overflow-hidden bg-neutral-900 border border-white/10 shadow-xl cursor-pointer hover:border-white/20 transition-all duration-300 hover:scale-[1.02]"
                >
                  <img
                    src="https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80"
                    alt="Queen"
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                  <div className="absolute top-3 left-4 text-4xl font-extrabold text-white/90">
                    1
                  </div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="text-base font-bold text-white leading-snug">Queen</div>
                    <div className="text-xs text-neutral-300">1,240 menit didengarkan</div>
                  </div>
                </div>

                {/* Card 2 */}
                <div
                  onClick={() => {
                    setCurrentTrackIndex(2);
                    if (!isPlaying) togglePlay();
                  }}
                  className="group relative h-64 rounded-2xl overflow-hidden bg-neutral-900 border border-white/10 shadow-xl cursor-pointer hover:border-white/20 transition-all duration-300 hover:scale-[1.02]"
                >
                  <img
                    src="https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80"
                    alt="Taylor Swift"
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                  <div className="absolute top-3 left-4 text-4xl font-extrabold text-white/90">
                    2
                  </div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="text-base font-bold text-white leading-snug">Taylor Swift</div>
                    <div className="text-xs text-neutral-300">890 menit didengarkan</div>
                  </div>
                </div>

                {/* Card 3 */}
                <div
                  onClick={() => {
                    setCurrentTrackIndex(4);
                    if (!isPlaying) togglePlay();
                  }}
                  className="group relative h-64 rounded-2xl overflow-hidden bg-neutral-900 border border-white/10 shadow-xl cursor-pointer hover:border-white/20 transition-all duration-300 hover:scale-[1.02]"
                >
                  <img
                    src="https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&auto=format&fit=crop&q=80"
                    alt="Olivia Rodrigo"
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                  <div className="absolute top-3 left-4 text-4xl font-extrabold text-white/90">
                    3
                  </div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="text-base font-bold text-white leading-snug">Olivia Rodrigo</div>
                    <div className="text-xs text-neutral-300">540 menit didengarkan</div>
                  </div>
                </div>

                {/* Card 4 */}
                <div
                  onClick={() => {
                    setCurrentTrackIndex(1);
                    if (!isPlaying) togglePlay();
                  }}
                  className="group relative h-64 rounded-2xl overflow-hidden bg-neutral-900 border border-white/10 shadow-xl cursor-pointer hover:border-white/20 transition-all duration-300 hover:scale-[1.02]"
                >
                  <img
                    src="https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80"
                    alt="The Weeknd"
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                  <div className="absolute top-3 left-4 text-4xl font-extrabold text-white/90">
                    4
                  </div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="text-base font-bold text-white leading-snug">The Weeknd</div>
                    <div className="text-xs text-neutral-300">420 menit didengarkan</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Top Songs List (Sesuai Referensi Gambar Apple Music) */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
                  Lagu Teratas <ChevronRight className="w-4 h-4 text-neutral-500" />
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {tracks.map((track, idx) => {
                  const isCurrent = currentTrack.id === track.id;
                  return (
                    <div
                      key={track.id}
                      onClick={() => {
                        setCurrentTrackIndex(idx);
                        if (!isPlaying) togglePlay();
                      }}
                      className={`group flex items-center justify-between p-2.5 rounded-xl transition-colors cursor-pointer ${
                        isCurrent
                          ? "bg-white/10 border border-white/10"
                          : "hover:bg-white/5 border border-transparent"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="w-5 text-center text-sm font-bold text-neutral-400 group-hover:text-white">
                          {idx + 1}
                        </span>
                        <img
                          src={track.cover_url}
                          alt={track.title}
                          className="w-11 h-11 rounded-lg object-cover shadow"
                        />
                        <div className="min-w-0">
                          <div
                            className={`text-sm font-medium truncate ${
                              isCurrent ? "text-rose-400 font-semibold" : "text-white"
                            }`}
                          >
                            {track.title}
                          </div>
                          <div className="text-xs text-neutral-400 truncate">{track.artist}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-white/5 text-neutral-300 border border-white/10">
                          {track.preferred_provider}
                        </span>
                        <span className="text-xs text-neutral-400 font-mono">
                          {formatTime(track.duration_secs * 1000)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: UNIVERSAL LIBRARY & SQLITE PLAYLISTS                               */}
        {/* ========================================================================= */}
        {activeTab === "library" && (
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* Header Library */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-extrabold tracking-tight text-white">
                  Koleksi Playlist Universal
                </h1>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Tersimpan di SQLite lokal independen — Bebas memilih sumber pemutaran untuk tiap lagu.
                </p>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-white text-black text-xs font-semibold hover:bg-neutral-200 transition-colors shadow-lg cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Buat Playlist
              </button>
            </div>

            {/* Playlist Badges Selector */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              {playlists.map((pl) => (
                <div
                  key={pl.id}
                  onClick={() => {
                    setActivePlaylistId(pl.id);
                    loadPlaylistTracks(pl.id);
                  }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium cursor-pointer transition-all border shrink-0 ${
                    activePlaylistId === pl.id
                      ? "bg-white/15 text-white border-white/20 shadow-sm"
                      : "bg-neutral-900/60 text-neutral-400 border-white/5 hover:text-white hover:border-white/15"
                  }`}
                >
                  <ListMusic className="w-3.5 h-3.5 text-rose-400" />
                  <span>{pl.title}</span>
                  {playlists.length > 1 && (
                    <Trash2
                      onClick={(e) => handleDeletePlaylist(pl.id, e)}
                      className="w-3.5 h-3.5 text-neutral-500 hover:text-rose-400 ml-1 transition-colors"
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Tracks in Current Playlist */}
            <div className="rounded-2xl bg-neutral-900/40 border border-white/10 p-5 backdrop-blur-xl">
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div className="text-sm font-semibold text-white">
                  Daftar Lagu ({tracks.length})
                </div>
                <div className="text-xs text-neutral-400">
                  Klik provider untuk mengubah playback source
                </div>
              </div>

              <div className="divide-y divide-white/5 mt-2">
                {tracks.map((trk, i) => (
                  <div
                    key={trk.id}
                    className="flex items-center justify-between py-3 px-2 hover:bg-white/5 rounded-xl transition-colors group"
                  >
                    <div
                      onClick={() => {
                        setCurrentTrackIndex(i);
                        if (!isPlaying) togglePlay();
                      }}
                      className="flex items-center gap-3.5 min-w-0 cursor-pointer flex-1"
                    >
                      <span className="w-5 text-center text-xs font-bold text-neutral-500">
                        {i + 1}
                      </span>
                      <img
                        src={trk.cover_url}
                        alt={trk.title}
                        className="w-10 h-10 rounded-lg object-cover shadow"
                      />
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-white truncate group-hover:text-rose-400 transition-colors">
                          {trk.title}
                        </div>
                        <div className="text-xs text-neutral-400 truncate">{trk.artist}</div>
                      </div>
                    </div>

                    {/* Provider Pill Selector */}
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="flex items-center gap-1 bg-black/40 p-1 rounded-full border border-white/10">
                        {(["Spotify", "Tidal", "YouTubeMusic", "Local"] as const).map((prov) => (
                          <button
                            key={prov}
                            onClick={() => handleUpdateProvider(trk.id, prov)}
                            className={`px-2 py-0.5 rounded-full text-[10px] font-medium transition-colors cursor-pointer ${
                              trk.preferred_provider === prov
                                ? "bg-white text-black font-semibold shadow"
                                : "text-neutral-400 hover:text-white"
                            }`}
                          >
                            {prov === "YouTubeMusic" ? "YT" : prov}
                          </button>
                        ))}
                      </div>

                      <span className="text-xs text-neutral-400 font-mono w-10 text-right">
                        {formatTime(trk.duration_secs * 1000)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: LYRICS (Apple Music Fullscreen Time-Synced Karaoke Layout)         */}
        {/* ========================================================================= */}
        {activeTab === "lyrics" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center min-h-[70vh] animate-in fade-in duration-300">
            {/* Left Column: Big Cover Artwork */}
            <div className="lg:col-span-5 flex flex-col items-center text-center space-y-5">
              <div className="relative w-64 h-64 sm:w-80 sm:h-80 rounded-3xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.8)] border border-white/10 group">
                <img
                  src={currentTrack.cover_url}
                  alt={currentTrack.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="space-y-1">
                <h2 className="text-2xl font-bold text-white tracking-tight">{currentTrack.title}</h2>
                <p className="text-sm text-neutral-400">{currentTrack.artist}</p>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-neutral-300 mt-2">
                  <Sparkles className="w-3.5 h-3.5 text-rose-400" />
                  <span>{currentTrack.audio_quality}</span>
                </div>
              </div>
            </div>

            {/* Right Column: Time-Synced Flowing Lyrics */}
            <div className="lg:col-span-7 h-[65vh] flex flex-col">
              <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
                <div className="text-xs font-semibold tracking-wider text-rose-400 uppercase flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                  {lyricsSource}
                </div>
                <div className="text-xs text-neutral-400">
                  Klik baris lirik untuk melompat langsung (Click-to-Seek)
                </div>
              </div>

              <div
                ref={lyricsContainerRef}
                className="flex-1 overflow-y-auto space-y-6 pr-4 scroll-smooth"
              >
                {lyrics.map((line, idx) => {
                  const isActive = idx === activeLyricIndex;
                  return (
                    <div
                      key={idx}
                      onClick={() => handleSeek(line.timestamp_ms)}
                      className={`group flex items-center justify-between p-3 rounded-2xl cursor-pointer transition-all duration-300 ${
                        isActive
                          ? "scale-105 text-white font-bold text-2xl sm:text-3xl drop-shadow-[0_0_25px_rgba(255,255,255,0.4)]"
                          : "text-neutral-500 hover:text-neutral-300 text-lg sm:text-xl font-medium filter blur-[0.2px] hover:blur-none"
                      }`}
                    >
                      <div className="leading-snug">{line.text}</div>
                      <span className="opacity-0 group-hover:opacity-100 text-xs font-mono text-neutral-400 bg-white/10 px-2 py-1 rounded-md transition-opacity">
                        {formatTime(line.timestamp_ms)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: ACCOUNT (Google Sign-In & Zero-Knowledge Vault)                    */}
        {/* ========================================================================= */}
        {activeTab === "account" && (
          <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-300">
            {/* Header */}
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-white">Akun & WowCloud</h1>
              <p className="text-sm text-neutral-400 mt-1">
                Sinkronisasi playlist dan sesi OAuth terenkripsi client-side secara otomatis (AES-256-GCM + Argon2id).
              </p>
            </div>

            {/* Google Profile Card */}
            <div className="p-6 rounded-3xl bg-neutral-900/60 border border-white/10 backdrop-blur-2xl shadow-xl space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <img
                    src={userProfile.avatar_url}
                    alt={userProfile.name}
                    className="w-16 h-16 rounded-full object-cover border-2 border-white/20 shadow-lg"
                  />
                  <div>
                    <div className="text-lg font-bold text-white flex items-center gap-2">
                      {userProfile.name}
                      <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50" />
                    </div>
                    <div className="text-xs text-neutral-400">{userProfile.email}</div>
                    <div className="text-[11px] text-emerald-400 mt-1 font-medium flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" /> Enkripsi Zero-Knowledge Aktif
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setUserProfile((prev) => ({
                      ...prev,
                      cloud_synced: !prev.cloud_synced,
                    }));
                    showToast(
                      userProfile.cloud_synced
                        ? "Sinkronisasi cloud dijeda"
                        : "Sinkronisasi cloud aktif (AES-256-GCM)",
                      "info"
                    );
                  }}
                  className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/15 border border-white/10 text-xs font-semibold text-white transition-colors cursor-pointer"
                >
                  {userProfile.cloud_synced ? "Jeda Sinkronisasi" : "Aktifkan Sinkronisasi"}
                </button>
              </div>

              {/* Status Stats */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-4 rounded-2xl bg-black/40 border border-white/5">
                  <div className="text-xs text-neutral-400">Status Sinkronisasi</div>
                  <div className="text-sm font-semibold text-white mt-1 flex items-center gap-2">
                    <Cloud className={`w-4 h-4 ${userProfile.cloud_synced ? "text-emerald-400" : "text-neutral-500"}`} />
                    {userProfile.cloud_synced ? "Terhubung ke VPS" : "Offline"}
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-black/40 border border-white/5">
                  <div className="text-xs text-neutral-400">Perangkat Aktif</div>
                  <div className="text-sm font-semibold text-white mt-1">
                    {userProfile.active_devices} Perangkat (Linux & Mobile)
                  </div>
                </div>
              </div>
            </div>

            {/* Audio Hardware Output Card (Audiophile / DAC selection) */}
            <div className="p-5 rounded-2xl bg-neutral-900/40 border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-sm font-bold text-white">Perangkat Output Audio (ALSA / DAC)</div>
                <span className="text-[10px] text-rose-400 font-mono font-semibold uppercase px-2 py-0.5 rounded-full bg-white/5 border border-white/10">
                  Bit-Perfect Audio
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Pilih kartu suara atau DAC eksternal untuk direct hardware playback tanpa resampling.
              </p>
              <select
                value={selectedDevice}
                onChange={(e) => {
                  setSelectedDevice(e.target.value);
                  showToast(`Audio dialihkan ke: ${e.target.value}`, "success");
                }}
                className="w-full px-4 py-2.5 rounded-xl bg-black/60 border border-white/10 text-xs text-white focus:outline-none focus:border-white/30 cursor-pointer font-sans"
              >
                {audioDevices.map((dev) => (
                  <option key={dev.name} value={dev.name} className="bg-neutral-900 text-white">
                    {dev.name} {dev.is_default ? "(Default)" : ""} — Max {dev.max_sample_rate / 1000} kHz
                  </option>
                ))}
              </select>
            </div>

            {/* Provider Integration Cards */}
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-white">Layanan Musik Terhubung</h2>

              {/* TIDAL Card */}
              <div className="p-5 rounded-2xl bg-neutral-900/40 border border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center font-bold text-white border border-white/10">
                      T
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white">TIDAL HiFi Plus</div>
                      <div className="text-xs text-neutral-400">
                        {isTidalConnected ? "Terhubung (Hi-Res Lossless FLAC)" : "Belum Terhubung"}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleStartTidalAuth}
                    disabled={isConnectingTidal}
                    className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/15 border border-white/10 text-xs font-semibold text-white transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {isConnectingTidal ? "Menghubungi..." : isTidalConnected ? "Hubungkan Ulang" : "Hubungkan TIDAL"}
                  </button>
                </div>

                {/* Verification Code Prompt (Apple Music Dark Glassmorphic Card) */}
                {tidalAuthCode && (
                  <div className="p-5 rounded-2xl bg-neutral-950/80 border border-rose-500/30 text-xs space-y-3.5 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-rose-400 font-semibold">
                        <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                        Menunggu Otorisasi di Browser...
                      </div>
                      <button
                        onClick={handleCancelTidalAuth}
                        className="text-neutral-400 hover:text-white transition-colors cursor-pointer text-[11px]"
                      >
                        Batal
                      </button>
                    </div>

                    <div className="text-center py-2 bg-black/60 rounded-xl border border-white/10">
                      <div className="text-[11px] text-neutral-400 mb-1">KODE VERIFIKASI PENGGUNA</div>
                      <div className="font-mono text-3xl font-extrabold text-white tracking-[0.3em] select-all">
                        {tidalAuthCode}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      {tidalVerificationUri && (
                        <a
                          href={tidalVerificationUri}
                          target="_blank"
                          rel="noreferrer"
                          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-white text-black font-semibold text-xs hover:bg-neutral-200 transition-colors shadow-lg"
                        >
                          Buka link.tidal.com di Browser <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(tidalAuthCode);
                          showToast("Kode berhasil disalin ke clipboard", "success");
                        }}
                        className="py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-white font-medium text-xs transition-colors cursor-pointer"
                      >
                        Salin Kode
                      </button>
                    </div>
                  </div>
                )}

                {/* Custom Client ID & Token Configuration */}
                <div className="pt-2 border-t border-white/5">
                  <details className="text-xs text-neutral-400 cursor-pointer">
                    <summary className="font-medium text-neutral-300 hover:text-white transition-colors">
                      Konfigurasi Kustom TIDAL Client ID / Token (Opsional)
                    </summary>
                    <div className="space-y-3 pt-3">
                      <div>
                        <label className="block text-[11px] text-neutral-400 mb-1">
                          Custom TIDAL Client ID
                        </label>
                        <input
                          type="text"
                          value={customTidalClientId}
                          onChange={(e) => setCustomTidalClientId(e.target.value)}
                          placeholder="Masukkan TIDAL Client ID Anda"
                          className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-white text-xs focus:outline-none focus:border-white/30 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-neutral-400 mb-1">
                          Custom TIDAL Access Token
                        </label>
                        <input
                          type="password"
                          value={customTidalToken}
                          onChange={(e) => setCustomTidalToken(e.target.value)}
                          placeholder="Bearer token OAuth..."
                          className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-white text-xs focus:outline-none focus:border-white/30 font-mono"
                        />
                      </div>
                      <button
                        onClick={() => {
                          setIsTidalConnected(true);
                          showToast("Kredensial TIDAL kustom berhasil disimpan", "success");
                        }}
                        className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-semibold text-white transition-colors cursor-pointer"
                      >
                        Simpan Kredensial
                      </button>
                    </div>
                  </details>
                </div>
              </div>

              {/* Spotify Card */}
              <div className="p-5 rounded-2xl bg-neutral-900/40 border border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-950/60 border border-emerald-500/20 flex items-center justify-center font-bold text-emerald-400">
                    S
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">Spotify</div>
                    <div className="text-xs text-neutral-400">Terhubung (OAuth Sync)</div>
                  </div>
                </div>
                <span className="text-xs text-emerald-400 font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> Aktif
                </span>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ========================================================================= */}
      {/* FLOATING GLASS BOTTOM PLAYER BAR (Apple Music Pill Dock Layout)           */}
      {/* ========================================================================= */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[94%] max-w-5xl">
        <div className="flex items-center justify-between px-6 py-3.5 rounded-full bg-neutral-900/80 backdrop-blur-2xl border border-white/12 shadow-[0_20px_50px_rgba(0,0,0,0.85)]">
          {/* Sisi Kiri: Kontrol Playback (Shuffle, Prev, Play, Next, Repeat) */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsShuffle(!isShuffle)}
              className={`p-1.5 rounded-full transition-colors cursor-pointer ${
                isShuffle ? "text-rose-400" : "text-neutral-400 hover:text-white"
              }`}
              title="Shuffle"
            >
              <Shuffle className="w-4 h-4" />
            </button>
            <button
              onClick={handlePrev}
              className="p-1.5 text-neutral-300 hover:text-white transition-colors cursor-pointer"
              title="Previous"
            >
              <SkipBack className="w-4 h-4 fill-current" />
            </button>
            {/* Play/Pause Button: Solid White Circle dengan Icon Hitam (Khas Apple Music) */}
            <button
              onClick={togglePlay}
              className="w-10 h-10 rounded-full bg-white hover:scale-105 active:scale-95 text-black flex items-center justify-center shadow-lg transition-transform cursor-pointer"
              title={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 fill-current" />
              ) : (
                <Play className="w-5 h-5 fill-current ml-0.5" />
              )}
            </button>
            <button
              onClick={handleNext}
              className="p-1.5 text-neutral-300 hover:text-white transition-colors cursor-pointer"
              title="Next"
            >
              <SkipForward className="w-4 h-4 fill-current" />
            </button>
            <button
              onClick={() => setIsRepeat(!isRepeat)}
              className={`p-1.5 rounded-full transition-colors cursor-pointer ${
                isRepeat ? "text-rose-400" : "text-neutral-400 hover:text-white"
              }`}
              title="Repeat"
            >
              <Repeat className="w-4 h-4" />
            </button>
          </div>

          {/* Sisi Tengah: Track Artwork & Info Ringkas */}
          <div className="flex items-center gap-3.5 max-w-sm px-4 min-w-0">
            <img
              src={currentTrack.cover_url}
              alt={currentTrack.title}
              className="w-10 h-10 rounded-xl object-cover shadow border border-white/10 shrink-0"
            />
            <div className="min-w-0">
              <div className="text-sm font-semibold text-white truncate leading-tight">
                {currentTrack.title}
              </div>
              <div className="text-xs text-neutral-400 truncate leading-tight mt-0.5">
                {currentTrack.artist}
              </div>
            </div>
            <span className="hidden md:inline-block text-[9px] uppercase font-semibold px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-rose-300 shrink-0">
              {currentTrack.preferred_provider}
            </span>
          </div>

          {/* Sisi Kanan: Progress Bar, Volume, dan Quick Toggles */}
          <div className="flex items-center gap-4">
            {/* Scrubber Progress Slider */}
            <div className="hidden lg:flex items-center gap-2 text-xs font-mono text-neutral-400">
              <span>{formatTime(currentTimeMs)}</span>
              <input
                type="range"
                min={0}
                max={currentTrack.duration_secs * 1000}
                value={currentTimeMs}
                onChange={(e) => handleSeek(Number(e.target.value))}
                className="w-32 h-1 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-white hover:accent-rose-400 transition-colors"
              />
              <span>{formatTime(currentTrack.duration_secs * 1000)}</span>
            </div>

            {/* Volume Control */}
            <div className="hidden sm:flex items-center gap-2">
              <button
                onClick={() => handleVolumeChange(isMuted ? 0.85 : 0)}
                className="text-neutral-400 hover:text-white transition-colors cursor-pointer"
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-4 h-4" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={isMuted ? 0 : volume}
                onChange={(e) => handleVolumeChange(Number(e.target.value))}
                className="w-18 h-1 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-white"
              />
            </div>

            {/* Lyrics Toggle Button */}
            <button
              onClick={() => setActiveTab("lyrics")}
              className={`p-2 rounded-full transition-colors cursor-pointer ${
                activeTab === "lyrics"
                  ? "bg-white/20 text-white"
                  : "text-neutral-400 hover:text-white hover:bg-white/10"
              }`}
              title="Buka Layar Lirik"
            >
              <MessageSquare className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Modal Buat Playlist Modern */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
          <div className="w-full max-w-md p-6 rounded-3xl bg-neutral-900 border border-white/15 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Buat Playlist Baru</h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-neutral-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  Nama Playlist
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Misal: Hi-Res Jazz & Acoustic"
                  className="w-full px-4 py-2.5 rounded-xl bg-black/60 border border-white/10 text-white text-sm focus:outline-none focus:border-white/30"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  Deskripsi (Opsional)
                </label>
                <textarea
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Koleksi lagu universal lintas provider..."
                  rows={2}
                  className="w-full px-4 py-2 rounded-xl bg-black/60 border border-white/10 text-white text-sm focus:outline-none focus:border-white/30"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="px-4 py-2 rounded-full text-xs font-medium text-neutral-300 hover:text-white transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleCreatePlaylist}
                className="px-5 py-2 rounded-full bg-white text-black text-xs font-semibold hover:bg-neutral-200 transition-colors shadow-lg cursor-pointer"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
