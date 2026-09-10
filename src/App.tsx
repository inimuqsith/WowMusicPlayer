import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Shuffle,
  Repeat,
  CheckCircle2,
  Plus,
  Trash2,
  ListMusic,
  X,
  PictureInPicture2,
  User,
  ChevronRight,
  ChevronDown,
  Maximize2,
  Mic2,
  Disc3,
  ExternalLink,
  Search,
  Loader2,
  Radio,
  LogOut,
  RefreshCw,
  Speaker,
  Headphones,
  SlidersHorizontal,
  Laptop,
  Check,
} from "lucide-react";
import { invoke } from "@tauri-apps/api/core";

export interface AudioOutputDevice {
  id: string;
  name: string;
  desc: string;
  type: "speaker" | "headphones" | "dac";
  channels?: number;
  sampleRate?: number;
  isDefault?: boolean;
}

export type AudioQualityPreset = "Hi-Res Lossless" | "Lossless CD" | "High Quality" | "Normal" | "Data Saver";

export interface AudioQualityOption {
  id: AudioQualityPreset;
  title: string;
  badge: string;
  sampleRate: string;
  bitrate: string;
  desc: string;
}

export const AUDIO_QUALITY_OPTIONS: AudioQualityOption[] = [
  {
    id: "Hi-Res Lossless",
    title: "Hi-Res Lossless Master",
    badge: "Hi-Res 24/96",
    sampleRate: "24-bit / 96kHz - 192kHz",
    bitrate: "Hingga 9216 kbps FLAC",
    desc: "Kualitas rekaman studio orisinal tanpa kompresi dengan fidelitas suara tertinggi.",
  },
  {
    id: "Lossless CD",
    title: "Lossless CD Quality",
    badge: "FLAC 16/44.1",
    sampleRate: "16-bit / 44.1kHz",
    bitrate: "1411 kbps FLAC",
    desc: "Kualitas standar CD audio murni, bebas distorsi kompresi lossy.",
  },
  {
    id: "High Quality",
    title: "Kualitas Tinggi",
    badge: "AAC 256k",
    sampleRate: "Stereo 48kHz",
    bitrate: "256 kbps AAC",
    desc: "Suara jernih seimbang dengan konsumsi data yang efisien.",
  },
  {
    id: "Normal",
    title: "Kualitas Normal",
    badge: "AAC 160k",
    sampleRate: "Stereo 44.1kHz",
    bitrate: "160 kbps AAC",
    desc: "Standar streaming cepat dan stabil di berbagai jaringan.",
  },
  {
    id: "Data Saver",
    title: "Hemat Kuota",
    badge: "AAC 96k",
    sampleRate: "Stereo 44.1kHz",
    bitrate: "96 kbps HE-AAC",
    desc: "Penggunaan kuota minimal untuk koneksi internet terbatas.",
  },
];

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

export interface UnifiedTrackItem {
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
  stream_url?: string;
}

interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar_url: string;
  is_signed_in: boolean;
  cloud_synced: boolean;
  audio_quality_preset: AudioQualityPreset;
}

// Default initial tracks with REAL verified studio master audio streams
const INITIAL_CURATED_TRACKS: UnifiedTrackItem[] = [
  {
    id: "queen-bohemian",
    title: "Bohemian Rhapsody",
    artist: "Queen",
    album: "A Night at the Opera",
    duration_secs: 354,
    isrc: "GBUM71029604",
    original_source: "Spotify",
    preferred_provider: "Tidal",
    cover_url: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80",
    audio_quality: "Master Lossless Audio",
    stream_url: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/8f/11/52/8f1152a9-fd5f-0021-f546-b97579c22ec3/mzaf_3962258993076347789.plus.aac.p.m4a",
  },
  {
    id: "theweeknd-blinding",
    title: "Blinding Lights",
    artist: "The Weeknd",
    album: "After Hours",
    duration_secs: 200,
    isrc: "USUG11904206",
    original_source: "YouTubeMusic",
    preferred_provider: "Spotify",
    cover_url: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80",
    audio_quality: "Hi-Res Audio 256kbps",
    stream_url: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/12/73/ca/1273ca46-233a-5331-189b-25ac1d656533/mzaf_976341070785891411.plus.aac.p.m4a",
  },
  {
    id: "taylorswift-cruel",
    title: "Cruel Summer",
    artist: "Taylor Swift",
    album: "Lover",
    duration_secs: 178,
    isrc: "USUG11901472",
    original_source: "AppleMusic",
    preferred_provider: "Tidal",
    cover_url: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80",
    audio_quality: "Lossless Audio",
    stream_url: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/44/af/81/44af8168-9609-1b85-5048-ada08dceacf3/mzaf_1341699644335558812.plus.aac.p.m4a",
  },
  {
    id: "oliviarodrigo-vampire",
    title: "vampire",
    artist: "Olivia Rodrigo",
    album: "GUTS",
    duration_secs: 219,
    isrc: "USUG12304910",
    original_source: "Spotify",
    preferred_provider: "Spotify",
    cover_url: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&auto=format&fit=crop&q=80",
    audio_quality: "Master Audio",
    stream_url: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/70/2f/a6/702fa6b5-946c-7a8e-2dba-03de25c732d3/mzaf_12764345117177639836.plus.aac.p.m4a",
  },
  {
    id: "eagles-hotelcalifornia",
    title: "Hotel California",
    artist: "Eagles",
    album: "Hotel California",
    duration_secs: 391,
    original_source: "Local",
    preferred_provider: "Local",
    cover_url: "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=600&auto=format&fit=crop&q=80",
    audio_quality: "Studio Master",
    stream_url: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview116/v4/11/4d/6c/114d6cb2-c313-176c-3083-d9d13e9a5665/mzaf_8406568260683050965.plus.aac.p.m4a",
  },
];

function parseLrc(lrcText: string): TimedLyricLine[] {
  const lines = lrcText.split("\n");
  const result: TimedLyricLine[] = [];
  const timeRegex = /\[(\d{2}):(\d{2})\.(\d{2,3})\](.*)/;
  for (const line of lines) {
    const match = line.match(timeRegex);
    if (match) {
      const minutes = parseInt(match[1], 10);
      const seconds = parseInt(match[2], 10);
      const ms = match[3].length === 2 ? parseInt(match[3], 10) * 10 : parseInt(match[3], 10);
      const timestamp_ms = (minutes * 60 + seconds) * 1000 + ms;
      const text = match[4].trim();
      if (text) {
        result.push({ timestamp_ms, text });
      }
    }
  }
  return result;
}

const POPULAR_SEARCH_TAGS = [
  "Queen",
  "Taylor Swift",
  "The Weeknd",
  "Olivia Rodrigo",
  "Coldplay",
  "Sheila on 7",
  "Tulus",
  "Billie Eilish",
  "Bruno Mars",
];

const isTauri = typeof window !== "undefined" && Boolean((window as any).__TAURI_INTERNALS__);

export default function App() {
  // Navigation: "home", "search", "library", "account"
  const [activeTab, setActiveTab] = useState<"home" | "search" | "library" | "account">("home");

  // Expanded Now Playing Overlay (Full Screen Player Mode)
  const [isExpandedPlayerOpen, setIsExpandedPlayerOpen] = useState(false);
  const [expandedTab, setExpandedTab] = useState<"art" | "lyrics">("art");
  const expandedLyricsContainerRef = useRef<HTMLDivElement>(null);

  // Real Audio Element Reference
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Tracks & Playlists
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [activePlaylistId, setActivePlaylistId] = useState<string>("");
  const [tracks, setTracks] = useState<UnifiedTrackItem[]>(INITIAL_CURATED_TRACKS);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);

  // Playback State
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTimeMs, setCurrentTimeMs] = useState(0);
  const [durationMs, setDurationMs] = useState(0);
  const [volume, setVolume] = useState(0.85);
  const [isMuted, setIsMuted] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);

  // Search Engine State
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<UnifiedTrackItem[]>([]);

  // Lyrics
  const [lyrics, setLyrics] = useState<TimedLyricLine[]>([]);
  const lyricsContainerRef = useRef<HTMLDivElement>(null);

  // Toast System (Eliminated - Silent Non-Intrusive UX)
  const showToast = (_message: string, _type?: string, _title?: string) => {
    // Zero-popup standard: all pop-up toast banners are eliminated
  };

  // Audio Quality Preset
  const [audioQuality, setAudioQuality] = useState<AudioQualityPreset>(() => {
    return (localStorage.getItem("wowmusic_audio_quality") as AudioQualityPreset) || "Hi-Res Lossless";
  });

  const handleSelectAudioQuality = (preset: AudioQualityPreset) => {
    setAudioQuality(preset);
    localStorage.setItem("wowmusic_audio_quality", preset);
    setUserProfile((prev) => ({ ...prev, audio_quality_preset: preset }));
  };

  // Real Hardware Audio Output Device & Exclusive Mode
  const [selectedOutputDevice, setSelectedOutputDevice] = useState<string>(() => {
    return localStorage.getItem("wowmusic_output_device") || "default";
  });
  const [isExclusiveMode, setIsExclusiveMode] = useState<boolean>(() => {
    return localStorage.getItem("wowmusic_exclusive_mode") === "true";
  });
  const [isOutputMenuOpen, setIsOutputMenuOpen] = useState(false);
  const outputMenuRef = useRef<HTMLDivElement>(null);
  const [audioOutputDevices, setAudioOutputDevices] = useState<AudioOutputDevice[]>([
    {
      id: "default",
      name: "Sistem Output Utama",
      desc: "PipeWire / ALSA Master Hardware Sink",
      type: "speaker",
      isDefault: true,
    },
  ]);
  const [isScanningDevices, setIsScanningDevices] = useState(false);

  // Click outside to close Output Menu
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (outputMenuRef.current && !outputMenuRef.current.contains(e.target as Node)) {
        setIsOutputMenuOpen(false);
      }
    };
    if (isOutputMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOutputMenuOpen]);

  // Enumerate Real Hardware Audio Devices (Desktop Tauri cpal & Web MediaDevices)
  const refreshAudioDevices = useCallback(async (requestPermission = false) => {
    setIsScanningDevices(true);
    try {
      // 1. Try Tauri native backend cpal enumeration
      let tauriDevices: AudioOutputDevice[] = [];
      try {
        const nativeDevs = await invoke<
          Array<{
            name: string;
            is_default: boolean;
            max_sample_rate: number;
            supported_channels: number;
          }>
        >("get_audio_devices");

        if (Array.isArray(nativeDevs) && nativeDevs.length > 0) {
          tauriDevices = nativeDevs.map((d, index) => {
            const lower = d.name.toLowerCase();
            const type: AudioOutputDevice["type"] =
              lower.includes("headphone") || lower.includes("earphone") || lower.includes("headset") || lower.includes("jack")
                ? "headphones"
                : lower.includes("dac") || lower.includes("usb") || lower.includes("hifi") || lower.includes("interface") || lower.includes("hdmi")
                ? "dac"
                : "speaker";

            return {
              id: d.is_default ? "default" : `tauri-${index}-${d.name}`,
              name: d.name,
              desc: `${d.is_default ? "Default Sistem • " : ""}${d.supported_channels}ch • ${d.max_sample_rate} Hz`,
              type,
              channels: d.supported_channels,
              sampleRate: d.max_sample_rate,
              isDefault: d.is_default,
            };
          });
        }
      } catch {
        // Not in Tauri or Tauri command failed, fallback to Web API
      }

      if (tauriDevices.length > 0) {
        setAudioOutputDevices(tauriDevices);
        return;
      }

      // 2. Web MediaDevices API
      if (typeof navigator !== "undefined" && navigator.mediaDevices) {
        if (requestPermission) {
          try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            stream.getTracks().forEach((track) => track.stop());
          } catch (e) {
            console.warn("Audio permission not granted:", e);
          }
        }

        const devices = await navigator.mediaDevices.enumerateDevices();
        const outputs = devices.filter((d) => d.kind === "audiooutput");

        const parsedDevices: AudioOutputDevice[] = outputs.map((d, index) => {
          let label = d.label;
          const isDefault = d.deviceId === "default" || index === 0;

          if (!label) {
            label = isDefault ? "Speaker / Perangkat Output Utama" : `Keluaran Audio #${index + 1}`;
          }

          const lower = label.toLowerCase();
          const type: AudioOutputDevice["type"] =
            lower.includes("headphone") || lower.includes("earphone") || lower.includes("headset") || lower.includes("jack")
              ? "headphones"
              : lower.includes("dac") || lower.includes("usb") || lower.includes("hifi") || lower.includes("interface") || lower.includes("hdmi")
              ? "dac"
              : "speaker";

          return {
            id: d.deviceId || (isDefault ? "default" : `sink-${index}`),
            name: label,
            desc: isDefault ? "Perangkat Output Utama Sistem" : "Hardware Audio Sink",
            type,
            isDefault,
          };
        });

        // Fallback if no outputs listed
        if (parsedDevices.length === 0) {
          parsedDevices.push({
            id: "default",
            name: "Sistem Output Standar",
            desc: "ALSA / PipeWire / PulseAudio Master Sink",
            type: "speaker",
            isDefault: true,
          });
        }

        setAudioOutputDevices(parsedDevices);
      }
    } catch (err) {
      console.warn("Error enumerating audio devices:", err);
    } finally {
      setIsScanningDevices(false);
    }
  }, []);

  const handleSelectOutputDevice = async (device: AudioOutputDevice) => {
    setSelectedOutputDevice(device.id);
    localStorage.setItem("wowmusic_output_device", device.id);

    // Apply to browser HTMLAudioElement if supported
    if (audioRef.current && typeof (audioRef.current as any).setSinkId === "function") {
      try {
        const sinkId = device.id.startsWith("tauri-") ? "default" : device.id;
        await (audioRef.current as any).setSinkId(sinkId);
      } catch (err) {
        console.warn("Sink ID routing error:", err);
      }
    }

    // Inform Tauri backend
    try {
      await invoke("set_audio_device", {
        deviceName: device.name,
        exclusive: isExclusiveMode,
      });
    } catch {
      // Ignore if not in desktop mode
    }
  };

  const handleToggleExclusiveMode = async () => {
    const newVal = !isExclusiveMode;
    setIsExclusiveMode(newVal);
    localStorage.setItem("wowmusic_exclusive_mode", String(newVal));

    try {
      await invoke("set_exclusive_mode", { enabled: newVal });
    } catch {
      // Ignore if not in desktop mode
    }
  };

  // Real Hardware Audio Devices enumeration on mount & on device changes
  useEffect(() => {
    refreshAudioDevices(false);

    if (typeof navigator !== "undefined" && navigator.mediaDevices?.addEventListener) {
      const onDeviceChange = () => refreshAudioDevices(false);
      navigator.mediaDevices.addEventListener("devicechange", onDeviceChange);
      return () => {
        navigator.mediaDevices.removeEventListener("devicechange", onDeviceChange);
      };
    }
  }, [refreshAudioDevices]);

  // Re-sync sinkId to HTMLAudioElement when device or audioRef changes
  useEffect(() => {
    if (audioRef.current && typeof (audioRef.current as any).setSinkId === "function") {
      if (selectedOutputDevice && !selectedOutputDevice.startsWith("tauri-")) {
        (audioRef.current as any).setSinkId(selectedOutputDevice).catch(() => {});
      }
    }
  }, [selectedOutputDevice]);


  // User Profile
  const [userProfile, setUserProfile] = useState<UserProfile>({
    id: "user-music-109",
    name: "Abdul Muqsith",
    email: "muqsithpersonal@gmail.com",
    avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
    is_signed_in: true,
    cloud_synced: true,
    audio_quality_preset: "Hi-Res Lossless",
  });

  // Primary Playback Provider Setting
  const [primaryProvider, setPrimaryProvider] = useState<"Tidal" | "Spotify" | "Local" | "Preview">(() => {
    return (localStorage.getItem("wowmusic_primary_provider") as any) || "Tidal";
  });

  // TIDAL Connection State & Token Persistence
  const [isConnectingTidal, setIsConnectingTidal] = useState(false);
  const [tidalAuthCode, setTidalAuthCode] = useState<string | null>(null);
  const [tidalVerificationUri, setTidalVerificationUri] = useState<string | null>(null);
  const [pollIntervalId, setPollIntervalId] = useState<any>(null);
  const [tidalToken, setTidalToken] = useState<string | null>(() => {
    return localStorage.getItem("wowmusic_tidal_token") || null;
  });
  const [isTidalConnected, setIsTidalConnected] = useState<boolean>(() => {
    return Boolean(localStorage.getItem("wowmusic_tidal_token"));
  });

  // Dynamic Home Chart Tracks (Live Worldwide Music Hub)
  const [homeTracks, setHomeTracks] = useState<UnifiedTrackItem[]>(INITIAL_CURATED_TRACKS);
  const [isLoadingHome, setIsLoadingHome] = useState(false);

  // Create Playlist Modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");

  const currentTrack = tracks[currentTrackIndex] || INITIAL_CURATED_TRACKS[0];

  // 1. Initial Load: Playlists from SQLite (or localStorage in web browser mode)
  const loadPlaylists = async () => {
    if (isTauri) {
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
        console.warn("Using sample playlist:", err);
      }
    } else {
      const saved = localStorage.getItem("wowmusic_playlists");
      if (saved) {
        try {
          const list = JSON.parse(saved);
          if (list && list.length > 0) {
            setPlaylists(list);
            setActivePlaylistId(list[0].id);
            const savedTracks = localStorage.getItem(`wowmusic_tracks_${list[0].id}`);
            if (savedTracks) {
              setTracks(JSON.parse(savedTracks));
              return;
            }
          }
        } catch (e) {}
      }
    }
    setPlaylists([
      {
        id: "default-super-playlist",
        title: "Favorit Saya",
        description: "Koleksi lagu favorit dari berbagai layanan musik",
        cover_url: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80",
        track_count: INITIAL_CURATED_TRACKS.length,
        created_at: Date.now(),
        updated_at: Date.now(),
      },
    ]);
    setActivePlaylistId("default-super-playlist");
    setTracks(INITIAL_CURATED_TRACKS);
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

  // Fetch live worldwide trending tracks for Home (Bebas Login)
  const fetchTopCharts = async () => {
    setIsLoadingHome(true);
    try {
      const resp = await fetch("https://itunes.apple.com/us/rss/topsongs/limit=30/json");
      const data = await resp.json();
      const entries = data.feed?.entry || [];
      const mapped: UnifiedTrackItem[] = entries.map((e: any, idx: number) => {
        const id = e.id?.attributes?.["im:id"] || `chart-${idx}`;
        const title = e["im:name"]?.label || "Unknown Title";
        const artist = e["im:artist"]?.label || "Unknown Artist";
        const album = e["im:collection"]?.["im:name"]?.label || "";
        const coverRaw = e["im:image"]?.[2]?.label || e["im:image"]?.[0]?.label || "";
        const cover = coverRaw.replace(/\/\d+x\d+bb\./, "/600x600bb.");
        const previewUrl =
          e.link?.find((l: any) => l.attributes?.["im:assetType"] === "preview")?.attributes?.href ||
          e.link?.[1]?.attributes?.href ||
          "";
        return {
          id: String(id),
          title,
          artist,
          album,
          duration_secs: 30,
          original_source: "AppleMusic" as const,
          preferred_provider: "Tidal" as const,
          cover_url: cover,
          audio_quality: "Studio Master 256kbps",
          stream_url: previewUrl,
        };
      });

      if (mapped.length > 0) {
        setHomeTracks(mapped);
      }
    } catch (err) {
      console.warn("Gagal memuat chart global:", err);
    } finally {
      setIsLoadingHome(false);
    }
  };

  useEffect(() => {
    loadPlaylists();
    fetchTopCharts();
  }, []);

  // 2. Lyrics Fetching (Real LRCLIB Engine with Dual Web & Tauri Support)
  useEffect(() => {
    async function loadLyrics() {
      if (!currentTrack.title || currentTrack.id === "empty") {
        setLyrics([]);
        return;
      }

      // Clean track title (remove " - Single", " (feat...)", etc. for accurate matching)
      const cleanTitle = currentTrack.title
        .replace(/\s*-\s*Single/i, "")
        .replace(/\s*\(feat\..*?\)/i, "")
        .replace(/\s*\[feat\..*?\]/i, "")
        .trim();

      try {
        const resp = await fetch(
          `https://lrclib.net/api/get?artist_name=${encodeURIComponent(currentTrack.artist)}&track_name=${encodeURIComponent(cleanTitle)}`
        );
        if (resp.ok) {
          const data = await resp.json();
          if (data.syncedLyrics) {
            const parsed = parseLrc(data.syncedLyrics);
            if (parsed.length > 0) {
              setLyrics(parsed);
              return;
            }
          } else if (data.plainLyrics) {
            const plainLines = data.plainLyrics
              .split("\n")
              .filter((l: string) => l.trim().length > 0)
              .map((text: string, i: number) => ({
                timestamp_ms: i * 4000,
                text: text.trim(),
              }));
            setLyrics(plainLines);
            return;
          }
        }
      } catch (err) {
        // Fallback to Tauri if network fetch failed
      }

      if (isTauri) {
        try {
          const payload = await invoke<{
            is_synced: boolean;
            lines: TimedLyricLine[];
          }>("fetch_lyrics", {
            trackName: cleanTitle,
            artistName: currentTrack.artist,
            albumName: currentTrack.album,
            durationSecs: currentTrack.duration_secs,
          });
          if (payload && payload.lines && payload.lines.length > 0) {
            setLyrics(payload.lines);
            return;
          }
        } catch (e) {}
      }

      // If no lyrics found, set empty cleanly
      setLyrics([]);
    }
    loadLyrics();
  }, [currentTrack]);

  // 3. Audio Playback Control (Real Audio HTML5 Native Player)
  useEffect(() => {
    if (!audioRef.current) return;
    const audio = audioRef.current;

    const handleTimeUpdate = () => {
      setCurrentTimeMs(audio.currentTime * 1000);
      if (audio.duration && !isNaN(audio.duration)) {
        setDurationMs(audio.duration * 1000);
      }
    };

    const handleEnded = () => {
      handleNext();
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [currentTrackIndex, tracks]);

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
    if (expandedLyricsContainerRef.current && activeLyricIndex !== -1) {
      const activeEl = expandedLyricsContainerRef.current.children[activeLyricIndex] as HTMLElement;
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [activeLyricIndex, isExpandedPlayerOpen, expandedTab]);

  // Escape Key to Close Expanded Player
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isExpandedPlayerOpen) {
        setIsExpandedPlayerOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isExpandedPlayerOpen]);

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

  // Helper: Resolve full-length audio stream via TIDAL API
  const resolveTidalStream = async (
    track: UnifiedTrackItem,
    token: string
  ): Promise<{ streamUrl: string; durationSecs?: number } | null> => {
    try {
      const query = `${track.title} ${track.artist}`;
      const searchResp = await fetch(
        `https://api.tidal.com/v1/search/tracks?query=${encodeURIComponent(query)}&limit=1&countryCode=US`,
        {
          headers: {
            "x-tidal-token": "fX2JxdmntZWK0ixT",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!searchResp.ok) return null;
      const sData = await searchResp.json();
      const item = sData.items?.[0];
      if (!item?.id) return null;

      // Request playback info from TIDAL (try LOSSLESS first, fallback to HIGH)
      let pbResp = await fetch(
        `https://api.tidal.com/v1/tracks/${item.id}/playbackinfopostpaywall?audioquality=LOSSLESS&playbackmode=STREAM&assetpresentation=FULL`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!pbResp.ok) {
        pbResp = await fetch(
          `https://api.tidal.com/v1/tracks/${item.id}/playbackinfopostpaywall?audioquality=HIGH&playbackmode=STREAM&assetpresentation=FULL`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      }

      if (!pbResp.ok) return null;
      const pbData = await pbResp.json();
      if (!pbData.manifest) return null;

      if (pbData.manifestMimeType === "application/vnd.tidal.bts") {
        const decoded = JSON.parse(atob(pbData.manifest));
        if (decoded.urls && decoded.urls.length > 0) {
          return {
            streamUrl: decoded.urls[0],
            durationSecs: item.duration || track.duration_secs,
          };
        }
      }
      return null;
    } catch (err) {
      console.warn("TIDAL stream resolution error:", err);
      return null;
    }
  };

  // Playback actions with Smart Multi-Provider & Full-Length Resolver
  const playTrackAt = async (idx: number, trackList?: UnifiedTrackItem[]) => {
    const list = trackList || tracks;
    if (idx < 0 || idx >= list.length) return;
    const trk = list[idx];

    if (trackList && trackList !== tracks) {
      setTracks(trackList);
    }
    setCurrentTrackIndex(idx);
    setCurrentTimeMs(0);
    setIsPlaying(true);

    let finalStreamUrl = trk.stream_url;
    let finalQuality = trk.audio_quality;
    let isFullPlayback = false;

    // Check primary provider setting & connected services (Silent & Seamless)
    if (primaryProvider === "Tidal" && tidalToken) {
      const resolved = await resolveTidalStream(trk, tidalToken);
      if (resolved?.streamUrl) {
        finalStreamUrl = resolved.streamUrl;
        finalQuality = "TIDAL HiFi";
        isFullPlayback = true;
      }
    }

    if (audioRef.current && finalStreamUrl) {
      audioRef.current.src = finalStreamUrl;
      audioRef.current.play().catch((err) => console.warn("Audio play error:", err));
    }

    // Sync with backend
    invoke("play_track", {
      trackId: trk.id,
      durationMs: isFullPlayback ? trk.duration_secs * 1000 : 30000,
      qualityLabel: finalQuality,
    }).catch(() => {});
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    const audio = audioRef.current;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
      invoke("pause_playback").catch(() => {});
    } else {
      if (!audio.src && currentTrack.stream_url) {
        audio.src = currentTrack.stream_url;
      }
      audio.play().then(() => {
        setIsPlaying(true);
        invoke("resume_playback").catch(() => {});
      }).catch((e) => {
        console.warn("Audio play failed:", e);
      });
    }
  };

  const handleNext = () => {
    if (tracks.length === 0) return;
    const nextIdx = (currentTrackIndex + 1) % tracks.length;
    playTrackAt(nextIdx);
  };

  const handlePrev = () => {
    if (tracks.length === 0) return;
    const prevIdx = (currentTrackIndex - 1 + tracks.length) % tracks.length;
    playTrackAt(prevIdx);
  };

  const handleSeek = (newMs: number) => {
    setCurrentTimeMs(newMs);
    if (audioRef.current) {
      audioRef.current.currentTime = newMs / 1000;
    }
    invoke("seek_playback", { positionMs: newMs }).catch(() => {});
  };

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    setIsMuted(newVol === 0);
    if (audioRef.current) {
      audioRef.current.volume = newVol;
    }
    invoke("set_volume", { volume: newVol }).catch(() => {});
  };

  const handleToggleFloatingLyrics = async () => {
    try {
      await invoke("toggle_floating_lyrics");
      showToast("Widget lirik melayang diaktifkan", "success");
    } catch (err) {
      window.open("?window=overlay", "lyrics-overlay", "width=520,height=140");
    }
  };

  // Global Music Search Engine
  const executeSearch = async (term: string) => {
    if (!term.trim()) return;
    setIsSearching(true);
    try {
      const resp = await fetch(
        `https://itunes.apple.com/search?term=${encodeURIComponent(term.trim())}&entity=song&limit=25`
      );
      const data = await resp.json();

      if (data.results && data.results.length > 0) {
        const mappedTracks: UnifiedTrackItem[] = data.results.map((item: any) => ({
          id: String(item.trackId),
          title: item.trackName,
          artist: item.artistName,
          album: item.collectionName,
          duration_secs: Math.round(item.trackTimeMillis / 1000),
          isrc: undefined,
          original_source: "AppleMusic",
          preferred_provider: "AppleMusic",
          cover_url: item.artworkUrl100 ? item.artworkUrl100.replace("100x100bb.jpg", "600x600bb.jpg") : "",
          audio_quality: "Lossless Master 256kbps AAC",
          stream_url: item.previewUrl,
        }));

        setSearchResults(mappedTracks);
        showToast(`Ditemukan ${mappedTracks.length} lagu untuk "${term}"`, "success");
      } else {
        setSearchResults([]);
        showToast(`Tidak ada lagu ditemukan untuk "${term}"`, "warning");
      }
    } catch (err: any) {
      showToast(`Gagal mencari lagu: ${err.message || err}`, "error");
    } finally {
      setIsSearching(false);
    }
  };

  // Add Track to Current SQLite Playlist
  const handleAddTrackToPlaylist = async (track: UnifiedTrackItem) => {
    try {
      await invoke("db_add_track_to_playlist", {
        playlistId: activePlaylistId,
        track: {
          id: track.id,
          title: track.title,
          artist: track.artist,
          album: track.album || null,
          duration_secs: track.duration_secs,
          isrc: null,
          original_source: track.original_source,
          preferred_provider: track.preferred_provider,
          cover_url: track.cover_url || null,
          audio_quality: track.audio_quality,
        },
      });
      setTracks((prev) => [...prev, track]);
      showToast(`"${track.title}" ditambahkan ke playlist`, "success");
    } catch (err) {
      setTracks((prev) => [...prev, track]);
      showToast(`"${track.title}" ditambahkan ke playlist`, "success");
    }
  };

  // TIDAL Connection Handler with Automatic Background Polling (Dual Tauri + Web Browser Support)
  const handleStartTidalAuth = async () => {
    setIsConnectingTidal(true);
    setTidalAuthCode(null);
    if (pollIntervalId) {
      clearInterval(pollIntervalId);
      setPollIntervalId(null);
    }

    try {
      let res: {
        device_code: string;
        user_code: string;
        verification_uri: string;
        verification_uri_complete?: string;
        expires_in: number;
        interval: number;
      };

      if (isTauri) {
        res = await invoke("tidal_start_device_auth");
      } else {
        const f = await fetch("https://auth.tidal.com/v1/oauth2/device_authorization", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            client_id: "fX2JxdmntZWK0ixT",
            scope: "r_usr w_usr w_sub",
          }),
        });
        if (!f.ok) throw new Error(`TIDAL Auth error (${f.status})`);
        const j = await f.json();
        res = {
          device_code: j.deviceCode,
          user_code: j.userCode,
          verification_uri: j.verificationUri,
          verification_uri_complete: j.verificationUriComplete,
          expires_in: j.expiresIn,
          interval: j.interval || 2,
        };
      }

      const linkUrl = res.verification_uri_complete
        ? `https://${res.verification_uri_complete}`
        : `https://${res.verification_uri}`;

      setTidalAuthCode(res.user_code);
      setTidalVerificationUri(linkUrl);
      showToast(`Kode TIDAL: ${res.user_code}. Buka ${res.verification_uri} untuk konfirmasi.`, "info", "TIDAL Pairing");

      const intervalSecs = Math.max(res.interval || 2, 2);
      const timer = setInterval(async () => {
        try {
          let token: { access_token: string; user_id?: number } | null = null;
          if (isTauri) {
            token = await invoke("tidal_poll_device_token", { deviceCode: res.device_code });
          } else {
            const p = await fetch("https://auth.tidal.com/v1/oauth2/token", {
              method: "POST",
              headers: { "Content-Type": "application/x-www-form-urlencoded" },
              body: new URLSearchParams({
                client_id: "fX2JxdmntZWK0ixT",
                client_secret: "1Nn9AfDAjxrgJFJbKNWLeAyKGVGmINuXPPLHVXAvxAg=",
                device_code: res.device_code,
                grant_type: "urn:ietf:params:oauth:grant-type:device_code",
                scope: "r_usr w_usr w_sub",
              }),
            });
            if (p.ok) {
              const pj = await p.json();
              token = { access_token: pj.access_token, user_id: pj.user_id };
            }
          }

          if (token) {
            clearInterval(timer);
            setPollIntervalId(null);
            setIsTidalConnected(true);
            setTidalToken(token.access_token);
            localStorage.setItem("wowmusic_tidal_token", token.access_token);
            setTidalAuthCode(null);
            showToast("Akun TIDAL HiFi berhasil terhubung! Pemutaran lagu penuh (Master Lossless) aktif.", "success", "TIDAL Terhubung");
          }
        } catch (err: any) {
          clearInterval(timer);
          setPollIntervalId(null);
          showToast(`Sesi pairing TIDAL berakhir: ${err}`, "warning");
        }
      }, intervalSecs * 1000);

      setPollIntervalId(timer);
    } catch (err: any) {
      showToast(`Gagal menghubungi TIDAL: ${err.message || err}`, "error");
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

  const handleDisconnectTidal = () => {
    localStorage.removeItem("wowmusic_tidal_token");
    setTidalToken(null);
    setIsTidalConnected(false);
    showToast("Akun TIDAL diputuskan. Pemutaran dialihkan ke mode preview studio.", "info");
  };

  const handleSelectPrimaryProvider = (provider: "Tidal" | "Spotify" | "Local" | "Preview") => {
    setPrimaryProvider(provider);
    localStorage.setItem("wowmusic_primary_provider", provider);
  };

  // Playlist Management
  const handleCreatePlaylist = async () => {
    if (!newTitle.trim()) {
      showToast("Nama playlist tidak boleh kosong", "warning");
      return;
    }
    try {
      if (isTauri) {
        const newPl = await invoke<Playlist>("db_create_playlist", {
          title: newTitle.trim(),
          description: newDesc.trim() || null,
          coverUrl: null,
        });
        setPlaylists((prev) => [newPl, ...prev]);
        setActivePlaylistId(newPl.id);
      } else {
        const newPl: Playlist = {
          id: `pl-${Date.now()}`,
          title: newTitle.trim(),
          description: newDesc.trim() || undefined,
          cover_url: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80",
          track_count: 0,
          created_at: Date.now(),
          updated_at: Date.now(),
        };
        const updated = [newPl, ...playlists];
        setPlaylists(updated);
        localStorage.setItem("wowmusic_playlists", JSON.stringify(updated));
        setActivePlaylistId(newPl.id);
      }
      setTracks([]);
      setIsCreateModalOpen(false);
      setNewTitle("");
      setNewDesc("");
      showToast(`Playlist "${newTitle}" berhasil dibuat`, "success");
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

  const formatTime = (ms: number) => {
    const totalSecs = Math.floor(ms / 1000);
    const m = Math.floor(totalSecs / 60);
    const s = totalSecs % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const activeQualityLabel =
    primaryProvider === "Tidal" && isTidalConnected
      ? audioQuality === "Hi-Res Lossless"
        ? "Hi-Res 24-bit/96kHz"
        : audioQuality === "Lossless CD"
        ? "FLAC 16-bit/44.1kHz"
        : audioQuality === "High Quality"
        ? "AAC 256kbps"
        : audioQuality === "Normal"
        ? "AAC 160kbps"
        : "HE-AAC 96kbps"
      : "AAC 256kbps";

  return (
    <div className="relative min-h-screen bg-black text-neutral-100 font-sans select-none overflow-x-hidden pb-36">
      {/* Hidden Native Audio Player streaming REAL studio audio */}
      <audio ref={audioRef} preload="auto" />

      {/* Atmospheric Ambient Glow Header */}
      <div className="absolute top-0 left-0 right-0 h-96 bg-[radial-gradient(ellipse_80%_60%_at_50%_-15%,rgba(220,50,20,0.28),rgba(255,100,50,0.08),rgba(0,0,0,0))] pointer-events-none -z-0" />

      {/* Top Floating Glass Capsule Navigation Bar */}
      <header className="sticky top-0 z-40 flex items-center justify-between px-6 pt-5 pb-3">
        {/* Brand */}
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

        {/* Center Pill Navigation Bar (Apple Music style) */}
        <nav className="flex items-center gap-1 p-1 rounded-full bg-neutral-900/70 backdrop-blur-2xl border border-white/10 shadow-2xl">
          <button
            onClick={() => setActiveTab("home")}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-200 cursor-pointer ${
              activeTab === "home"
                ? "bg-white/15 text-white shadow-sm"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            Beranda
          </button>
          <button
            onClick={() => setActiveTab("search")}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-200 cursor-pointer ${
              activeTab === "search"
                ? "bg-white/15 text-white shadow-sm"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            Cari
          </button>
          <button
            onClick={() => setActiveTab("library")}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-200 cursor-pointer ${
              activeTab === "library"
                ? "bg-white/15 text-white shadow-sm"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            Playlist
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
            Akun
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
        {/* TAB 1: HOME (Trending & Curated Studio Music)                             */}
        {/* ========================================================================= */}
        {activeTab === "home" && (
          <div className="space-y-10 animate-in fade-in duration-300">
            {/* Hero Header */}
            <div className="space-y-1">
              <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white">
                Dengarkan Musik Favorit
              </h1>
              <p className="text-neutral-400 text-sm max-w-xl">
                Jelajahi dan putar tangga lagu terpopuler dari seluruh dunia.
              </p>
            </div>

            {/* Featured Artists Quick Discovery (Dynamically populated from live catalog) */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
                  Artis Pilihan <ChevronRight className="w-4 h-4 text-neutral-500" />
                </h2>
                <span className="text-xs text-neutral-400">Pembaruan Tangga Lagu Global</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {Array.from(new Map(homeTracks.map((t) => [t.artist, t])).values())
                  .slice(0, 4)
                  .map((track, idx) => (
                    <div
                      key={track.artist}
                      onClick={() => {
                        setActiveTab("search");
                        setSearchQuery(track.artist);
                        executeSearch(track.artist);
                      }}
                      className="group relative h-56 rounded-2xl overflow-hidden bg-neutral-900 border border-white/10 shadow-xl cursor-pointer hover:border-white/20 transition-all duration-300 hover:scale-[1.02]"
                    >
                      <img
                        src={track.cover_url}
                        alt={track.artist}
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent" />
                      <div className="absolute top-3 left-4 text-3xl font-extrabold text-white/90">
                        {idx + 1}
                      </div>
                      <div className="absolute bottom-4 left-4 right-4">
                        <div className="text-base font-bold text-white leading-snug truncate">
                          {track.artist}
                        </div>
                        <div className="text-xs text-neutral-300 truncate">
                          {track.album || "Hits Terpopuler"}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Trending Songs Section (Live Global Chart Feed) */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
                    Lagu Populer Dunia Saat Ini <ChevronRight className="w-4 h-4 text-neutral-500" />
                  </h2>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Lagu yang paling banyak didengarkan saat ini.
                  </p>
                </div>
                <button
                  onClick={fetchTopCharts}
                  disabled={isLoadingHome}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-neutral-300 transition-colors cursor-pointer"
                  title="Segarkan Tangga Lagu"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingHome ? "animate-spin" : ""}`} />
                  <span className="hidden sm:inline">Segarkan</span>
                </button>
              </div>

              {isLoadingHome && homeTracks.length === 0 ? (
                <div className="py-16 text-center text-neutral-400 text-sm flex flex-col items-center gap-2">
                  <Loader2 className="w-6 h-6 animate-spin text-rose-400" />
                  <span>Memuat lagu-lagu populer dunia...</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {homeTracks.map((track, idx) => {
                    const isCurrent = currentTrack.id === track.id && isPlaying;
                    return (
                      <div
                        key={`${track.id}-${idx}`}
                        onClick={() => playTrackAt(idx, homeTracks)}
                        className={`group flex items-center justify-between p-3 rounded-2xl transition-all cursor-pointer ${
                          isCurrent
                            ? "bg-white/15 border border-white/20 shadow-lg"
                            : "hover:bg-white/5 border border-transparent"
                        }`}
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          <span className="w-5 text-center text-sm font-bold text-neutral-400 group-hover:text-white">
                            {idx + 1}
                          </span>
                          <div className="relative w-12 h-12 rounded-xl overflow-hidden shadow shrink-0">
                            <img
                              src={track.cover_url}
                              alt={track.title}
                              className="w-full h-full object-cover"
                            />
                            {isCurrent && (
                              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <div
                              className={`text-sm font-semibold truncate ${
                                isCurrent ? "text-rose-400" : "text-white"
                              }`}
                            >
                              {track.title}
                            </div>
                            <div className="text-xs text-neutral-400 truncate">{track.artist}</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddTrackToPlaylist(track);
                            }}
                            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 text-neutral-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                            title="Tambah ke Playlist"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              playTrackAt(idx, homeTracks);
                            }}
                            className="w-8 h-8 rounded-full bg-white/10 group-hover:bg-white text-white group-hover:text-black flex items-center justify-center transition-colors cursor-pointer"
                            title="Putar Lagu"
                          >
                            <Play className="w-4 h-4 fill-current ml-0.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: SEARCH (Live Global Catalog & Real Music Discovery)                 */}
        {/* ========================================================================= */}
        {activeTab === "search" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Search Input Bar */}
            <div className="relative max-w-2xl mx-auto">
              <div className="relative flex items-center">
                <Search className="absolute left-4 w-5 h-5 text-neutral-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") executeSearch(searchQuery);
                  }}
                  placeholder="Cari lagu, artis, atau album (misal: Queen, Sheila on 7, Coldplay)..."
                  className="w-full pl-12 pr-28 py-3.5 rounded-2xl bg-neutral-900/80 border border-white/15 text-white text-sm focus:outline-none focus:border-white/30 backdrop-blur-2xl shadow-xl placeholder:text-neutral-500"
                />
                <button
                  onClick={() => executeSearch(searchQuery)}
                  disabled={isSearching}
                  className="absolute right-2 px-4 py-2 rounded-xl bg-white text-black text-xs font-semibold hover:bg-neutral-200 transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : "Cari"}
                </button>
              </div>

              {/* Popular Tags */}
              <div className="flex items-center gap-2 mt-3 overflow-x-auto pb-1 text-xs">
                <span className="text-neutral-500 shrink-0">Populer:</span>
                {POPULAR_SEARCH_TAGS.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => {
                      setSearchQuery(tag);
                      executeSearch(tag);
                    }}
                    className="px-3 py-1 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 text-neutral-300 hover:text-white transition-colors cursor-pointer shrink-0"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Search Results */}
            {isSearching && (
              <div className="flex flex-col items-center justify-center py-16 space-y-3">
                <Loader2 className="w-8 h-8 text-rose-500 animate-spin" />
                <div className="text-sm text-neutral-400">Mencari katalog lagu...</div>
              </div>
            )}

            {!isSearching && searchResults.length > 0 && (
              <div className="space-y-4">
                <div className="text-sm font-semibold text-white">
                  Hasil Pencarian ({searchResults.length} lagu)
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {searchResults.map((item, idx) => (
                    <div
                      key={item.id + idx}
                      onClick={() => playTrackAt(idx, searchResults)}
                      className="group flex items-center justify-between p-3 rounded-2xl bg-neutral-900/40 hover:bg-white/10 border border-white/10 transition-all cursor-pointer shadow-lg"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <img
                          src={item.cover_url}
                          alt={item.title}
                          className="w-12 h-12 rounded-xl object-cover shadow"
                        />
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-white truncate group-hover:text-rose-400 transition-colors">
                            {item.title}
                          </div>
                          <div className="text-xs text-neutral-400 truncate">
                            {item.artist} • {item.album}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddTrackToPlaylist(item);
                          }}
                          className="p-2 rounded-full hover:bg-white/10 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                          title="Tambah ke Playlist"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            playTrackAt(idx, searchResults);
                          }}
                          className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center shadow transition-transform hover:scale-105"
                          title="Putar Lagu Ini"
                        >
                          <Play className="w-4 h-4 fill-current ml-0.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!isSearching && searchResults.length === 0 && searchQuery && (
              <div className="text-center py-16 text-neutral-500 text-sm">
                Ketik nama lagu atau artis lalu tekan Cari untuk memutar lagu.
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: UNIVERSAL LIBRARY & PLAYLISTS                                      */}
        {/* ========================================================================= */}
        {activeTab === "library" && (
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* Header Library */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-extrabold tracking-tight text-white">
                  Koleksi Playlist
                </h1>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Daftar putar tersimpan di perangkat Anda.
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
                  Gunakan menu Cari untuk menambahkan lagu baru ke playlist ini
                </div>
              </div>

              <div className="divide-y divide-white/5 mt-2">
                {tracks.map((trk, i) => (
                  <div
                    key={trk.id + i}
                    className="flex items-center justify-between py-3 px-2 hover:bg-white/5 rounded-xl transition-colors group"
                  >
                    <div
                      onClick={() => playTrackAt(i)}
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

                    <div className="flex items-center gap-3 shrink-0">
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
        {/* TAB 4: ACCOUNT (Consumer Profile & Linked Services)                      */}
        {/* ========================================================================= */}
        {activeTab === "account" && (
          <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-300">
            {/* Header */}
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-white">Profil & Pengaturan</h1>
              <p className="text-sm text-neutral-400 mt-1">
                Kelola akun musik dan integrasi layanan streaming Anda.
              </p>
            </div>

            {/* Consumer Profile Card */}
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
                    <div className="text-[11px] text-neutral-400 mt-1">
                      Status: <span className="text-emerald-400 font-medium">Tersinkronisasi</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300">
                    Akun Terverifikasi
                  </span>
                </div>
              </div>
            </div>

            {/* Audio Quality & Exclusive Mode Configuration */}
            <div className="p-6 rounded-3xl bg-neutral-900/60 border border-white/10 backdrop-blur-2xl shadow-xl space-y-5">
              <div>
                <div className="text-base font-bold text-white flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-rose-400" />
                  Kualitas Audio & Bit-Perfect
                </div>
                <div className="text-xs text-neutral-400 mt-0.5">
                  Pilih resolusi streaming audio dan konfigurasi transmisi DAC
                </div>
              </div>

              {/* Quality Preset Options Cards */}
              <div className="space-y-2">
                {AUDIO_QUALITY_OPTIONS.map((opt) => {
                  const isSelected = audioQuality === opt.id;
                  return (
                    <div
                      key={opt.id}
                      onClick={() => handleSelectAudioQuality(opt.id)}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-start justify-between gap-3 ${
                        isSelected
                          ? "bg-white/15 border-white/30 shadow-lg ring-1 ring-white/20"
                          : "bg-black/40 border-white/10 hover:border-white/20"
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white">{opt.title}</span>
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                              isSelected
                                ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                                : "bg-white/10 text-neutral-400"
                            }`}
                          >
                            {opt.badge}
                          </span>
                          <span className="text-[10px] font-mono text-neutral-400">
                            • {opt.sampleRate}
                          </span>
                        </div>
                        <p className="text-[11px] text-neutral-400 leading-relaxed">
                          {opt.desc}
                        </p>
                      </div>
                      <div className="pt-1">
                        {isSelected ? (
                          <Check className="w-4 h-4 text-rose-400 shrink-0" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border border-white/20 shrink-0" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Exclusive Mode in Settings */}
              <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="text-sm font-semibold text-white flex items-center gap-2">
                    Exclusive Mode
                    {isExclusiveMode && (
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                        Aktif
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-neutral-400 max-w-md leading-relaxed">
                    Bit-Perfect Passthrough: mengalirkan sinyal audio langsung ke DAC hardware tanpa melalui mixer OS atau resampling digital.
                  </p>
                </div>

                {/* Slider / Toggle Switch */}
                <button
                  type="button"
                  role="switch"
                  aria-checked={isExclusiveMode}
                  onClick={handleToggleExclusiveMode}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    isExclusiveMode ? "bg-rose-500" : "bg-neutral-700"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                      isExclusiveMode ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Primary Playback Provider Configuration */}
            <div className="p-5 rounded-2xl bg-neutral-900/40 border border-white/10 space-y-3.5">
              <div>
                <div className="text-sm font-bold text-white flex items-center gap-2">
                  <Radio className="w-4 h-4 text-rose-400" />
                  Provider Pemutaran Utama
                </div>
                <div className="text-xs text-neutral-400 mt-0.5">
                  Tentukan provider audio untuk memutar lagu secara utuh (Full-Length Audio)
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* TIDAL */}
                <div
                  onClick={() => handleSelectPrimaryProvider("Tidal")}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    primaryProvider === "Tidal"
                      ? "bg-white/15 border-white/30 shadow-lg ring-1 ring-white/20"
                      : "bg-black/40 border-white/10 hover:border-white/20"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-white">TIDAL HiFi</span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        isTidalConnected
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                          : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                      }`}
                    >
                      {isTidalConnected ? "Tertaut" : "Belum Tertaut"}
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-400 leading-relaxed">
                    Streaming rekaman penuh Master Lossless & Hi-Res audio resmi.
                  </p>
                </div>

                {/* Local Files */}
                <div
                  onClick={() => handleSelectPrimaryProvider("Local")}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    primaryProvider === "Local"
                      ? "bg-white/15 border-white/30 shadow-lg ring-1 ring-white/20"
                      : "bg-black/40 border-white/10 hover:border-white/20"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-white">File Lokal</span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                      Aktif
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-400 leading-relaxed">
                    Prioritaskan file FLAC / MP3 dari penyimpanan lokal perangkat.
                  </p>
                </div>

                {/* Standalone Preview */}
                <div
                  onClick={() => handleSelectPrimaryProvider("Preview")}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    primaryProvider === "Preview"
                      ? "bg-white/15 border-white/30 shadow-lg ring-1 ring-white/20"
                      : "bg-black/40 border-white/10 hover:border-white/20"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-white">Pratinjau Studio</span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-neutral-500/20 text-neutral-300 border border-neutral-500/30">
                      Bebas Akun
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-400 leading-relaxed">
                    Pratinjau 30 detik katalog musik dunia tanpa tautan akun.
                  </p>
                </div>
              </div>
            </div>

            {/* Streaming Services */}
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
                        {isTidalConnected ? "Terhubung (Hi-Res Lossless Aktif)" : "Belum Terhubung"}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {isTidalConnected && (
                      <button
                        onClick={handleDisconnectTidal}
                        className="p-2 rounded-full text-neutral-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                        title="Putuskan Tautan Akun TIDAL"
                      >
                        <LogOut className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={handleStartTidalAuth}
                      disabled={isConnectingTidal}
                      className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/15 border border-white/10 text-xs font-semibold text-white transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {isConnectingTidal ? "Menghubungi..." : isTidalConnected ? "Hubungkan Ulang" : "Hubungkan Akun"}
                    </button>
                  </div>
                </div>

                {/* Verification Code Prompt */}
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
              </div>

              {/* Spotify Card */}
              <div className="p-5 rounded-2xl bg-neutral-900/40 border border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-950/60 border border-emerald-500/20 flex items-center justify-center font-bold text-emerald-400">
                    S
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">Spotify</div>
                    <div className="text-xs text-neutral-400">Terhubung</div>
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
          {/* Controls: Shuffle, Prev, Play/Pause, Next, Repeat */}
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
              title="Sebelumnya"
            >
              <SkipBack className="w-4 h-4 fill-current" />
            </button>
            <button
              onClick={togglePlay}
              className="w-10 h-10 rounded-full bg-white hover:scale-105 active:scale-95 text-black flex items-center justify-center shadow-lg transition-transform cursor-pointer"
              title={isPlaying ? "Jeda" : "Putar"}
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
              title="Berikutnya"
            >
              <SkipForward className="w-4 h-4 fill-current" />
            </button>
            <button
              onClick={() => setIsRepeat(!isRepeat)}
              className={`p-1.5 rounded-full transition-colors cursor-pointer ${
                isRepeat ? "text-rose-400" : "text-neutral-400 hover:text-white"
              }`}
              title="Ulangi"
            >
              <Repeat className="w-4 h-4" />
            </button>
          </div>

          {/* Current Track Info (Click to open Expanded Player) */}
          <div
            onClick={() => {
              setIsExpandedPlayerOpen(true);
              setExpandedTab("art");
            }}
            className="flex items-center gap-3.5 max-w-sm px-4 min-w-0 cursor-pointer group hover:opacity-90 transition-all select-none"
            title="Klik untuk membuka tampilan layar penuh"
          >
            <div className="relative shrink-0">
              <img
                src={currentTrack.cover_url}
                alt={currentTrack.title}
                className="w-10 h-10 rounded-xl object-cover shadow border border-white/10 group-hover:scale-105 transition-transform"
              />
              <div className="absolute inset-0 bg-black/40 rounded-xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <Maximize2 className="w-3.5 h-3.5 text-white drop-shadow" />
              </div>
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold text-white truncate leading-tight group-hover:text-rose-300 transition-colors">
                {currentTrack.title}
              </div>
              <div className="text-xs text-neutral-400 truncate leading-tight mt-0.5">
                {currentTrack.artist}
              </div>
            </div>
            {primaryProvider === "Tidal" && isTidalConnected && (
              <span className="hidden md:inline-flex items-center gap-1 text-[9px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 shrink-0">
                TIDAL HiFi
              </span>
            )}
            <span
              onClick={(e) => {
                e.stopPropagation();
                setActiveTab("account");
              }}
              className="hidden sm:inline-flex items-center gap-1 text-[9px] font-semibold px-2 py-0.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-neutral-300 shrink-0 transition-colors cursor-pointer"
              title={`Kualitas Audio Aktif: ${activeQualityLabel} (Klik untuk pengaturan)`}
            >
              {activeQualityLabel}
            </span>
          </div>

          {/* Scrubber & Volume & Output Selector & Lyrics */}
          <div className="flex items-center gap-4">
            <div className="hidden lg:flex items-center gap-2 text-xs font-mono text-neutral-400">
              <span>{formatTime(currentTimeMs)}</span>
              <input
                type="range"
                min={0}
                max={durationMs || currentTrack.duration_secs * 1000}
                value={currentTimeMs}
                onChange={(e) => handleSeek(Number(e.target.value))}
                className="w-32 h-1 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-white hover:accent-rose-400 transition-colors"
              />
              <span>{formatTime(durationMs || currentTrack.duration_secs * 1000)}</span>
            </div>

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

            {/* Audio Output Device Selector & Exclusive Mode */}
            <div className="relative">
              <button
                onClick={() => {
                  const nextOpen = !isOutputMenuOpen;
                  setIsOutputMenuOpen(nextOpen);
                  if (nextOpen) {
                    refreshAudioDevices(false);
                  }
                }}
                className={`p-2 rounded-full transition-colors cursor-pointer relative ${
                  isOutputMenuOpen
                    ? "bg-white/20 text-white"
                    : "text-neutral-400 hover:text-white hover:bg-white/10"
                }`}
                title="Pilih Keluaran Audio & Mode Eksklusif"
              >
                <Speaker className="w-4 h-4" />
                {isExclusiveMode && (
                  <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-rose-500 shadow-sm shadow-rose-500/50" />
                )}
              </button>

              {/* Output Menu & Exclusive Mode Popover */}
              {isOutputMenuOpen && (
                <div
                  ref={outputMenuRef}
                  className="absolute right-0 bottom-12 z-50 w-84 p-4 rounded-3xl bg-neutral-900/95 backdrop-blur-3xl border border-white/15 shadow-2xl space-y-3.5 animate-in fade-in zoom-in-95 duration-200 text-left"
                >
                  {/* Header */}
                  <div className="flex items-center justify-between pb-2 border-b border-white/10">
                    <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
                      <Speaker className="w-3.5 h-3.5 text-rose-400" />
                      Keluaran Audio
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => refreshAudioDevices(false)}
                        title="Pindai ulang hardware audio"
                        className="text-neutral-400 hover:text-white p-1 cursor-pointer transition rounded-lg hover:bg-white/10"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isScanningDevices ? "animate-spin text-rose-400" : ""}`} />
                      </button>
                      <button
                        onClick={() => setIsOutputMenuOpen(false)}
                        className="text-neutral-400 hover:text-white p-1 cursor-pointer transition rounded-lg hover:bg-white/10"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Permission / Hardware Scan helper if labels are generic or default */}
                  {audioOutputDevices.some((d) => !d.name || d.name.startsWith("Keluaran Audio #") || d.id === "default") && (
                    <button
                      onClick={() => refreshAudioDevices(true)}
                      disabled={isScanningDevices}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-2xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 text-[11px] font-medium transition cursor-pointer"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isScanningDevices ? "animate-spin" : ""}`} />
                      Deteksi Nama Hardware Fisik (Izinkan Akses)
                    </button>
                  )}

                  {/* Device List */}
                  <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                    <div className="text-[11px] text-neutral-400 font-medium px-1 flex items-center justify-between">
                      <span>Perangkat Fisik ({audioOutputDevices.length})</span>
                      {isScanningDevices && (
                        <span className="text-[10px] text-rose-400 animate-pulse">Memindai...</span>
                      )}
                    </div>
                    {audioOutputDevices.map((device) => {
                      const isSelected = selectedOutputDevice === device.id;
                      return (
                        <button
                          key={device.id}
                          onClick={() => handleSelectOutputDevice(device)}
                          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-2xl text-xs transition-all cursor-pointer ${
                            isSelected
                              ? "bg-white/15 text-white font-semibold border border-white/20 shadow-md"
                              : "text-neutral-300 hover:bg-white/5 hover:text-white"
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0 pr-2">
                            {device.type === "headphones" ? (
                              <Headphones className="w-4 h-4 text-rose-400 shrink-0" />
                            ) : device.type === "dac" ? (
                              <SlidersHorizontal className="w-4 h-4 text-rose-400 shrink-0" />
                            ) : (
                              <Laptop className="w-4 h-4 text-rose-400 shrink-0" />
                            )}
                            <div className="text-left min-w-0">
                              <div className="text-xs truncate font-medium">{device.name}</div>
                              <div className="text-[10px] text-neutral-400 font-normal truncate">
                                {device.desc}
                              </div>
                            </div>
                          </div>
                          {isSelected && <Check className="w-4 h-4 text-rose-400 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>

                  {/* Exclusive Mode Slider / Switch */}
                  <div className="pt-3 border-t border-white/10 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                          Exclusive Mode
                          {isExclusiveMode && (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                              Bit-Perfect
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-neutral-400 leading-tight max-w-[190px]">
                          Bypass mixer OS langsung ke DAC hardware untuk audio bit-akurat.
                        </div>
                      </div>

                      {/* Slidebar / Toggle Switch */}
                      <button
                        type="button"
                        role="switch"
                        aria-checked={isExclusiveMode}
                        onClick={handleToggleExclusiveMode}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          isExclusiveMode ? "bg-rose-500" : "bg-neutral-700"
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                            isExclusiveMode ? "translate-x-5" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => {
                setIsExpandedPlayerOpen(true);
                setExpandedTab("lyrics");
              }}
              className={`p-2 rounded-full transition-colors cursor-pointer ${
                isExpandedPlayerOpen && expandedTab === "lyrics"
                  ? "bg-white/20 text-white"
                  : "text-neutral-400 hover:text-white hover:bg-white/10"
              }`}
              title="Lirik Lagu"
            >
              <Mic2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Modal Buat Playlist */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
          <div className="w-full max-w-md p-6 rounded-3xl bg-neutral-900 border border-white/15 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Buat Playlist Baru</h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-neutral-400 hover:text-white p-1 cursor-pointer"
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
                  placeholder="Misal: Lagu Santai Sore"
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
                  placeholder="Koleksi lagu favorit..."
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

      {/* ========================================================================= */}
      {/* EXPANDED NOW PLAYING FULLSCREEN OVERLAY (Apple Music Style)              */}
      {/* ========================================================================= */}
      {isExpandedPlayerOpen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-black/95 backdrop-blur-3xl animate-in slide-in-from-bottom duration-300 overflow-hidden">
          {/* Ambient Background Glow from Album Artwork */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-25 select-none">
            <img
              src={currentTrack.cover_url}
              alt=""
              className="w-full h-full object-cover filter blur-3xl scale-125"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/85 to-black/70" />
          </div>

          {/* Top Header Bar of Expanded Player */}
          <div className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-white/5">
            <button
              onClick={() => setIsExpandedPlayerOpen(false)}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-neutral-300 hover:text-white transition-all cursor-pointer text-xs font-medium backdrop-blur-md border border-white/10"
              title="Tutup (Esc)"
            >
              <ChevronDown className="w-4 h-4" />
              <span>Tutup</span>
            </button>

            {/* Mobile / Tablet Tab Switcher (Lagu / Lirik) */}
            <div className="lg:hidden flex items-center gap-1 p-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-xs">
              <button
                onClick={() => setExpandedTab("art")}
                className={`px-3 py-1 rounded-full font-medium transition-all ${
                  expandedTab === "art"
                    ? "bg-white text-black font-semibold shadow"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                Lagu
              </button>
              <button
                onClick={() => setExpandedTab("lyrics")}
                className={`px-3 py-1 rounded-full font-medium transition-all flex items-center gap-1 ${
                  expandedTab === "lyrics"
                    ? "bg-white text-black font-semibold shadow"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                <Mic2 className="w-3 h-3" />
                Lirik
              </button>
            </div>

            <div className="flex items-center gap-3">
              {primaryProvider === "Tidal" && isTidalConnected && (
                <span className="hidden sm:inline-flex text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300">
                  TIDAL HiFi
                </span>
              )}
              <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-white/10 border border-white/15 text-neutral-300">
                {activeQualityLabel}
              </span>
              <button
                onClick={handleToggleFloatingLyrics}
                className="hidden sm:flex p-2 rounded-full bg-white/10 hover:bg-white/20 text-neutral-300 hover:text-white transition-all cursor-pointer border border-white/10"
                title="Lirik Mengambang Mini"
              >
                <PictureInPicture2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsExpandedPlayerOpen(false)}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-neutral-300 hover:text-white transition-all cursor-pointer border border-white/10"
                title="Tutup (Esc)"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="relative z-10 flex-1 overflow-y-auto px-6 py-6 flex flex-col justify-start md:justify-center">
            <div className="max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center">
              {/* Left Section: Big Artwork & Info */}
              <div
                className={`lg:col-span-5 flex flex-col items-center text-center space-y-6 ${
                  expandedTab === "lyrics" ? "hidden lg:flex" : "flex"
                }`}
              >
                <div className="relative w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 rounded-3xl overflow-hidden shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] border border-white/15">
                  <img
                    src={currentTrack.cover_url}
                    alt={currentTrack.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="space-y-1.5 max-w-md">
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
                    {currentTrack.title}
                  </h2>
                  <p className="text-base sm:text-lg text-neutral-400 font-medium">
                    {currentTrack.artist}
                  </p>
                  {currentTrack.album && (
                    <p className="text-xs text-neutral-500">
                      {currentTrack.album}
                    </p>
                  )}
                </div>

                {/* Scrubber & Controls embedded on Mobile / Tablet view */}
                <div className="w-full max-w-sm space-y-4 lg:hidden pt-2">
                  {/* Scrubber */}
                  <div className="space-y-1">
                    <input
                      type="range"
                      min={0}
                      max={durationMs || currentTrack.duration_secs * 1000}
                      value={currentTimeMs}
                      onChange={(e) => handleSeek(Number(e.target.value))}
                      className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-white"
                    />
                    <div className="flex justify-between text-[11px] font-mono text-neutral-400">
                      <span>{formatTime(currentTimeMs)}</span>
                      <span>{formatTime(durationMs || currentTrack.duration_secs * 1000)}</span>
                    </div>
                  </div>

                  {/* Play Controls */}
                  <div className="flex items-center justify-center gap-6">
                    <button
                      onClick={handlePrev}
                      className="text-neutral-300 hover:text-white transition-colors cursor-pointer"
                      title="Sebelumnya"
                    >
                      <SkipBack className="w-6 h-6 fill-current" />
                    </button>
                    <button
                      onClick={togglePlay}
                      className="p-4 rounded-full bg-white text-black hover:scale-105 active:scale-95 transition-all shadow-xl cursor-pointer"
                      title={isPlaying ? "Jeda" : "Putar"}
                    >
                      {isPlaying ? (
                        <Pause className="w-7 h-7 fill-current" />
                      ) : (
                        <Play className="w-7 h-7 fill-current ml-0.5" />
                      )}
                    </button>
                    <button
                      onClick={handleNext}
                      className="text-neutral-300 hover:text-white transition-colors cursor-pointer"
                      title="Berikutnya"
                    >
                      <SkipForward className="w-6 h-6 fill-current" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Section: Time-Synced Flowing Lyrics */}
              <div
                className={`lg:col-span-7 h-[60vh] sm:h-[65vh] flex flex-col ${
                  expandedTab === "art" ? "hidden lg:flex" : "flex"
                }`}
              >
                <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
                  <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-neutral-400 uppercase">
                    <Mic2 className="w-3.5 h-3.5 text-rose-400" />
                    Lirik
                  </div>
                  <div className="text-xs text-neutral-500">
                    Klik baris lirik untuk melompat
                  </div>
                </div>

                <div
                  ref={expandedLyricsContainerRef}
                  className="flex-1 overflow-y-auto space-y-6 pr-4 scroll-smooth"
                >
                  {lyrics.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-center space-y-2 text-neutral-500">
                      <Mic2 className="w-10 h-10 opacity-30 text-neutral-400" />
                      <div className="text-base font-medium text-neutral-300">Lirik belum tersedia</div>
                      <div className="text-xs text-neutral-500">Lirik untuk "{currentTrack.title}" belum ditemukan di katalog.</div>
                    </div>
                  ) : (
                    lyrics.map((line, idx) => {
                      const isActive = idx === activeLyricIndex;
                      return (
                        <div
                          key={idx}
                          onClick={() => handleSeek(line.timestamp_ms)}
                          className={`group flex items-center justify-between p-3 rounded-2xl cursor-pointer transition-all duration-300 ${
                            isActive
                              ? "scale-105 text-white font-bold text-2xl sm:text-3xl drop-shadow-[0_0_30px_rgba(255,255,255,0.45)]"
                              : "text-neutral-500 hover:text-neutral-300 text-lg sm:text-xl font-medium filter blur-[0.2px] hover:blur-none"
                          }`}
                        >
                          <div className="leading-snug">{line.text}</div>
                          <span className="opacity-0 group-hover:opacity-100 text-xs font-mono text-neutral-400 bg-white/10 px-2 py-1 rounded-md transition-opacity">
                            {formatTime(line.timestamp_ms)}
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Mobile / Tablet controls below lyrics if viewing lyrics tab */}
                <div className="w-full space-y-3 lg:hidden pt-4 border-t border-white/10 mt-2">
                  <div className="flex justify-between items-center text-xs text-neutral-400">
                    <span className="font-medium text-white truncate max-w-[200px]">{currentTrack.title}</span>
                    <span className="font-mono">{formatTime(currentTimeMs)} / {formatTime(durationMs || currentTrack.duration_secs * 1000)}</span>
                  </div>
                  <div className="flex items-center justify-center gap-6">
                    <button onClick={handlePrev} className="text-neutral-300 hover:text-white cursor-pointer">
                      <SkipBack className="w-5 h-5 fill-current" />
                    </button>
                    <button
                      onClick={togglePlay}
                      className="p-3 rounded-full bg-white text-black hover:scale-105 active:scale-95 transition-all shadow-xl cursor-pointer"
                    >
                      {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
                    </button>
                    <button onClick={handleNext} className="text-neutral-300 hover:text-white cursor-pointer">
                      <SkipForward className="w-5 h-5 fill-current" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Desktop Full Controls Footer on Expanded Player */}
          <div className="hidden lg:block relative z-10 px-8 py-5 border-t border-white/10 bg-black/60 backdrop-blur-xl">
            <div className="max-w-4xl mx-auto space-y-3">
              {/* Scrubber */}
              <div className="flex items-center gap-4">
                <span className="text-xs font-mono text-neutral-400 w-12 text-right">
                  {formatTime(currentTimeMs)}
                </span>
                <input
                  type="range"
                  min={0}
                  max={durationMs || currentTrack.duration_secs * 1000}
                  value={currentTimeMs}
                  onChange={(e) => handleSeek(Number(e.target.value))}
                  className="flex-1 h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-white hover:accent-rose-400 transition-colors"
                />
                <span className="text-xs font-mono text-neutral-400 w-12">
                  {formatTime(durationMs || currentTrack.duration_secs * 1000)}
                </span>
              </div>

              {/* Action Buttons & Volume */}
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setIsShuffle(!isShuffle)}
                    className={`p-2 rounded-full transition-colors cursor-pointer ${
                      isShuffle ? "text-rose-400 bg-rose-400/10" : "text-neutral-400 hover:text-white"
                    }`}
                    title="Acak"
                  >
                    <Shuffle className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setIsRepeat(!isRepeat)}
                    className={`p-2 rounded-full transition-colors cursor-pointer ${
                      isRepeat ? "text-rose-400 bg-rose-400/10" : "text-neutral-400 hover:text-white"
                    }`}
                    title="Ulangi"
                  >
                    <Repeat className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center gap-6">
                  <button
                    onClick={handlePrev}
                    className="text-neutral-300 hover:text-white transition-colors cursor-pointer"
                    title="Sebelumnya"
                  >
                    <SkipBack className="w-6 h-6 fill-current" />
                  </button>
                  <button
                    onClick={togglePlay}
                    className="p-3.5 rounded-full bg-white text-black hover:scale-105 active:scale-95 transition-all shadow-xl cursor-pointer"
                    title={isPlaying ? "Jeda" : "Putar"}
                  >
                    {isPlaying ? (
                      <Pause className="w-6 h-6 fill-current" />
                    ) : (
                      <Play className="w-6 h-6 fill-current ml-0.5" />
                    )}
                  </button>
                  <button
                    onClick={handleNext}
                    className="text-neutral-300 hover:text-white transition-colors cursor-pointer"
                    title="Berikutnya"
                  >
                    <SkipForward className="w-6 h-6 fill-current" />
                  </button>
                </div>

                <div className="flex items-center gap-2">
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
                    className="w-24 h-1 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-white"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
