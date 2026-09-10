import { useState, useEffect } from "react";
import { Play, Pause, X, GripHorizontal } from "lucide-react";
import { invoke } from "@tauri-apps/api/core";

export interface LyricsSyncPayload {
  title: string;
  artist: string;
  currentLineText: string;
  nextLineText: string;
  currentTimeMs: number;
  durationSecs: number;
  isPlaying: boolean;
}

export default function FloatingLyrics() {
  const [syncData, setSyncData] = useState<LyricsSyncPayload>({
    title: "WowMusic",
    artist: "Playing Audio",
    currentLineText: "♪ Menunggu lirik disinkronkan...",
    nextLineText: "",
    currentTimeMs: 0,
    durationSecs: 0,
    isPlaying: false,
  });

  useEffect(() => {
    const channel = new BroadcastChannel("wowmusic_lyrics_channel");

    channel.onmessage = (event) => {
      if (event.data && event.data.type === "LYRICS_SYNC") {
        setSyncData(event.data.payload);
      }
    };

    return () => {
      channel.close();
    };
  }, []);

  const handleTogglePlay = () => {
    const channel = new BroadcastChannel("wowmusic_lyrics_channel");
    channel.postMessage({ type: "TOGGLE_PLAY" });
    channel.close();
  };

  const handleClose = async () => {
    try {
      await invoke("toggle_floating_lyrics");
    } catch {
      window.close();
    }
  };

  return (
    <div
      data-tauri-drag-region
      className="w-screen h-screen flex flex-col justify-between bg-zinc-950/85 backdrop-blur-2xl border border-cyan-500/30 text-zinc-100 p-3 rounded-2xl shadow-2xl select-none overflow-hidden cursor-move"
    >
      {/* Top Header Bar */}
      <div data-tauri-drag-region className="flex items-center justify-between text-xs pb-1 border-b border-zinc-800/80 shrink-0">
        <div data-tauri-drag-region className="flex items-center gap-2 truncate pr-2">
          <GripHorizontal className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shrink-0" />
          <span className="font-semibold text-zinc-200 truncate text-[11px]">
            {syncData.title}
          </span>
          <span className="text-[10px] text-zinc-500 truncate hidden sm:inline">
            · {syncData.artist}
          </span>
        </div>

        <div className="flex items-center gap-1 shrink-0" data-tauri-drag-region="false">
          <button
            onClick={handleTogglePlay}
            className="p-1 hover:bg-zinc-800 text-zinc-300 hover:text-cyan-400 rounded-md transition-colors"
            title={syncData.isPlaying ? "Pause" : "Play"}
          >
            {syncData.isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-red-500/20 text-zinc-500 hover:text-red-400 rounded-md transition-colors"
            title="Tutup Widget Desktop"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Center Karaoke Lyrics */}
      <div data-tauri-drag-region className="flex-1 flex flex-col justify-center py-1 overflow-hidden text-center">
        <div className="text-sm font-bold text-cyan-300 tracking-tight leading-snug drop-shadow-[0_0_12px_rgba(34,211,238,0.45)] truncate px-2">
          {syncData.currentLineText}
        </div>
        {syncData.nextLineText && (
          <div className="text-[11px] text-zinc-500 font-medium truncate mt-0.5 px-4 opacity-80">
            {syncData.nextLineText}
          </div>
        )}
      </div>

      {/* Mini Progress Line */}
      <div className="w-full h-0.5 bg-zinc-800 rounded-full overflow-hidden shrink-0">
        <div
          className="h-full bg-cyan-400 transition-all duration-300"
          style={{
            width: `${
              syncData.durationSecs > 0
                ? Math.min(100, (syncData.currentTimeMs / (syncData.durationSecs * 1000)) * 100)
                : 0
            }%`,
          }}
        />
      </div>
    </div>
  );
}
