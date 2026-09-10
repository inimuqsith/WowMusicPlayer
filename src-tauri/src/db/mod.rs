use parking_lot::Mutex;
use rusqlite::{params, Connection, Result};
use serde::{Deserialize, Serialize};
use std::path::Path;
use std::sync::Arc;
use std::time::{SystemTime, UNIX_EPOCH};
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Playlist {
    pub id: String,
    pub title: String,
    pub description: Option<String>,
    pub cover_url: Option<String>,
    pub track_count: usize,
    pub created_at: i64,
    pub updated_at: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TrackItem {
    pub id: String,
    pub title: String,
    pub artist: String,
    pub album: Option<String>,
    pub duration_secs: u32,
    pub isrc: Option<String>,
    pub original_source: String, // "Spotify", "YouTubeMusic", "AppleMusic", "Tidal", "Local"
    pub preferred_provider: String, // "Spotify", "YouTubeMusic", "Tidal", "Local"
    pub cover_url: Option<String>,
    pub audio_quality: Option<String>,
    pub local_path: Option<String>,
}

pub struct Database {
    conn: Arc<Mutex<Connection>>,
}

impl Database {
    pub fn new_in_memory() -> Result<Self> {
        let conn = Connection::open_in_memory()?;
        let db = Self {
            conn: Arc::new(Mutex::new(conn)),
        };
        db.init_tables()?;
        Ok(db)
    }

    pub fn new_at_path<P: AsRef<Path>>(path: P) -> Result<Self> {
        let conn = Connection::open(path)?;
        let db = Self {
            conn: Arc::new(Mutex::new(conn)),
        };
        db.init_tables()?;
        Ok(db)
    }

    fn init_tables(&self) -> Result<()> {
        let conn = self.conn.lock();
        conn.execute_batch(
            "
            PRAGMA foreign_keys = ON;

            CREATE TABLE IF NOT EXISTS playlists (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                description TEXT,
                cover_url TEXT,
                created_at INTEGER NOT NULL,
                updated_at INTEGER NOT NULL
            );

            CREATE TABLE IF NOT EXISTS tracks (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                artist TEXT NOT NULL,
                album TEXT,
                duration_secs INTEGER NOT NULL,
                isrc TEXT,
                original_source TEXT NOT NULL,
                preferred_provider TEXT NOT NULL,
                cover_url TEXT,
                audio_quality TEXT,
                local_path TEXT
            );

            CREATE TABLE IF NOT EXISTS playlist_tracks (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                playlist_id TEXT NOT NULL REFERENCES playlists(id) ON DELETE CASCADE,
                track_id TEXT NOT NULL REFERENCES tracks(id) ON DELETE CASCADE,
                position INTEGER NOT NULL,
                UNIQUE(playlist_id, track_id)
            );
            ",
        )?;
        Ok(())
    }

    pub fn seed_defaults_if_empty(&self) -> Result<()> {
        let conn = self.conn.lock();
        let mut stmt = conn.prepare("SELECT COUNT(*) FROM playlists")?;
        let count: i64 = stmt.query_row([], |row| row.get(0))?;

        if count == 0 {
            let now = SystemTime::now()
                .duration_since(UNIX_EPOCH)
                .unwrap_or_default()
                .as_secs() as i64;
            let playlist_id = "default-super-playlist";

            conn.execute(
                "INSERT INTO playlists (id, title, description, cover_url, created_at, updated_at)
                 VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
                params![
                    playlist_id,
                    "Universal Master Hub",
                    "A multi-source universal playlist with tracks from Spotify, YouTube Music, TIDAL, and Local FLAC",
                    "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80",
                    now,
                    now
                ],
            )?;

            let sample_tracks = [
                TrackItem {
                    id: "sp-1".to_string(),
                    title: "Bohemian Rhapsody".to_string(),
                    artist: "Queen".to_string(),
                    album: Some("A Night at the Opera".to_string()),
                    duration_secs: 354,
                    isrc: Some("GBUM71029604".to_string()),
                    original_source: "Spotify".to_string(),
                    preferred_provider: "Spotify".to_string(),
                    cover_url: Some("https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&auto=format&fit=crop&q=80".to_string()),
                    audio_quality: Some("Spotify Premium (320 kbps)".to_string()),
                    local_path: None,
                },
                TrackItem {
                    id: "yt-2".to_string(),
                    title: "Starboy".to_string(),
                    artist: "The Weeknd, Daft Punk".to_string(),
                    album: Some("Starboy".to_string()),
                    duration_secs: 230,
                    isrc: Some("USUM71607007".to_string()),
                    original_source: "YouTubeMusic".to_string(),
                    preferred_provider: "YouTubeMusic".to_string(),
                    cover_url: Some("https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&auto=format&fit=crop&q=80".to_string()),
                    audio_quality: Some("YouTube Audio (Opus 160 kbps)".to_string()),
                    local_path: None,
                },
                TrackItem {
                    id: "am-3".to_string(),
                    title: "Blinding Lights".to_string(),
                    artist: "The Weeknd".to_string(),
                    album: Some("After Hours".to_string()),
                    duration_secs: 200,
                    isrc: Some("USUG11904206".to_string()),
                    original_source: "AppleMusic".to_string(),
                    preferred_provider: "Tidal".to_string(),
                    cover_url: Some("https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&auto=format&fit=crop&q=80".to_string()),
                    audio_quality: Some("TIDAL HiFi (Lossless FLAC)".to_string()),
                    local_path: None,
                },
                TrackItem {
                    id: "loc-4".to_string(),
                    title: "Hotel California (Live)".to_string(),
                    artist: "Eagles".to_string(),
                    album: Some("Hell Freezes Over".to_string()),
                    duration_secs: 432,
                    isrc: Some("USEE19400001".to_string()),
                    original_source: "Local".to_string(),
                    preferred_provider: "Local".to_string(),
                    cover_url: Some("https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&auto=format&fit=crop&q=80".to_string()),
                    audio_quality: Some("Local Storage (FLAC 24-bit / 96 kHz)".to_string()),
                    local_path: Some("/home/music/Hotel_California.flac".to_string()),
                },
            ];

            for (pos, track) in sample_tracks.iter().enumerate() {
                conn.execute(
                    "INSERT INTO tracks (id, title, artist, album, duration_secs, isrc, original_source, preferred_provider, cover_url, audio_quality, local_path)
                     VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11)
                     ON CONFLICT(id) DO UPDATE SET
                        title=excluded.title,
                        artist=excluded.artist,
                        album=excluded.album,
                        duration_secs=excluded.duration_secs,
                        preferred_provider=excluded.preferred_provider",
                    params![
                        track.id,
                        track.title,
                        track.artist,
                        track.album,
                        track.duration_secs,
                        track.isrc,
                        track.original_source,
                        track.preferred_provider,
                        track.cover_url,
                        track.audio_quality,
                        track.local_path,
                    ],
                )?;

                conn.execute(
                    "INSERT INTO playlist_tracks (playlist_id, track_id, position)
                     VALUES (?1, ?2, ?3)
                     ON CONFLICT(playlist_id, track_id) DO NOTHING",
                    params![playlist_id, track.id, pos as i32],
                )?;
            }
        }
        Ok(())
    }

    pub fn create_playlist(&self, title: &str, description: Option<&str>, cover_url: Option<&str>) -> Result<Playlist> {
        let conn = self.conn.lock();
        let id = Uuid::new_v4().to_string();
        let now = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap_or_default()
            .as_secs() as i64;

        conn.execute(
            "INSERT INTO playlists (id, title, description, cover_url, created_at, updated_at)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
            params![id, title, description, cover_url, now, now],
        )?;

        Ok(Playlist {
            id,
            title: title.to_string(),
            description: description.map(|s| s.to_string()),
            cover_url: cover_url.map(|s| s.to_string()),
            track_count: 0,
            created_at: now,
            updated_at: now,
        })
    }

    pub fn get_playlists(&self) -> Result<Vec<Playlist>> {
        let conn = self.conn.lock();
        let mut stmt = conn.prepare(
            "
            SELECT p.id, p.title, p.description, p.cover_url, p.created_at, p.updated_at,
                   COUNT(pt.track_id) AS track_count
            FROM playlists p
            LEFT JOIN playlist_tracks pt ON p.id = pt.playlist_id
            GROUP BY p.id
            ORDER BY p.created_at DESC
            ",
        )?;

        let playlist_iter = stmt.query_map([], |row| {
            let track_count: i64 = row.get(6)?;
            Ok(Playlist {
                id: row.get(0)?,
                title: row.get(1)?,
                description: row.get(2)?,
                cover_url: row.get(3)?,
                created_at: row.get(4)?,
                updated_at: row.get(5)?,
                track_count: track_count as usize,
            })
        })?;

        let mut list = Vec::new();
        for pl in playlist_iter {
            list.push(pl?);
        }
        Ok(list)
    }

    pub fn delete_playlist(&self, playlist_id: &str) -> Result<bool> {
        let conn = self.conn.lock();
        let affected = conn.execute("DELETE FROM playlists WHERE id = ?1", params![playlist_id])?;
        Ok(affected > 0)
    }

    pub fn get_playlist_tracks(&self, playlist_id: &str) -> Result<Vec<TrackItem>> {
        let conn = self.conn.lock();
        let mut stmt = conn.prepare(
            "
            SELECT t.id, t.title, t.artist, t.album, t.duration_secs, t.isrc,
                   t.original_source, t.preferred_provider, t.cover_url, t.audio_quality, t.local_path
            FROM tracks t
            INNER JOIN playlist_tracks pt ON t.id = pt.track_id
            WHERE pt.playlist_id = ?1
            ORDER BY pt.position ASC
            ",
        )?;

        let track_iter = stmt.query_map(params![playlist_id], |row| {
            Ok(TrackItem {
                id: row.get(0)?,
                title: row.get(1)?,
                artist: row.get(2)?,
                album: row.get(3)?,
                duration_secs: row.get(4)?,
                isrc: row.get(5)?,
                original_source: row.get(6)?,
                preferred_provider: row.get(7)?,
                cover_url: row.get(8)?,
                audio_quality: row.get(9)?,
                local_path: row.get(10)?,
            })
        })?;

        let mut tracks = Vec::new();
        for track in track_iter {
            tracks.push(track?);
        }
        Ok(tracks)
    }

    pub fn add_track_to_playlist(&self, playlist_id: &str, track: &TrackItem) -> Result<()> {
        let conn = self.conn.lock();

        // 1. Insert or update the track
        conn.execute(
            "INSERT INTO tracks (id, title, artist, album, duration_secs, isrc, original_source, preferred_provider, cover_url, audio_quality, local_path)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11)
             ON CONFLICT(id) DO UPDATE SET
                title=excluded.title,
                artist=excluded.artist,
                album=excluded.album,
                duration_secs=excluded.duration_secs,
                isrc=coalesce(excluded.isrc, tracks.isrc),
                cover_url=coalesce(excluded.cover_url, tracks.cover_url)",
            params![
                track.id,
                track.title,
                track.artist,
                track.album,
                track.duration_secs,
                track.isrc,
                track.original_source,
                track.preferred_provider,
                track.cover_url,
                track.audio_quality,
                track.local_path,
            ],
        )?;

        // 2. Determine next position
        let mut pos_stmt = conn.prepare("SELECT COALESCE(MAX(position), -1) + 1 FROM playlist_tracks WHERE playlist_id = ?1")?;
        let next_pos: i32 = pos_stmt.query_row(params![playlist_id], |row| row.get(0))?;

        // 3. Insert into playlist_tracks
        conn.execute(
            "INSERT INTO playlist_tracks (playlist_id, track_id, position)
             VALUES (?1, ?2, ?3)
             ON CONFLICT(playlist_id, track_id) DO UPDATE SET position=excluded.position",
            params![playlist_id, track.id, next_pos],
        )?;

        // 4. Update playlist updated_at
        let now = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap_or_default()
            .as_secs() as i64;
        conn.execute("UPDATE playlists SET updated_at = ?1 WHERE id = ?2", params![now, playlist_id])?;

        Ok(())
    }

    pub fn remove_track_from_playlist(&self, playlist_id: &str, track_id: &str) -> Result<()> {
        let conn = self.conn.lock();
        conn.execute(
            "DELETE FROM playlist_tracks WHERE playlist_id = ?1 AND track_id = ?2",
            params![playlist_id, track_id],
        )?;

        let now = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap_or_default()
            .as_secs() as i64;
        conn.execute("UPDATE playlists SET updated_at = ?1 WHERE id = ?2", params![now, playlist_id])?;
        Ok(())
    }

    pub fn update_preferred_provider(&self, track_id: &str, preferred_provider: &str) -> Result<()> {
        let conn = self.conn.lock();
        conn.execute(
            "UPDATE tracks SET preferred_provider = ?1 WHERE id = ?2",
            params![preferred_provider, track_id],
        )?;
        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_playlist_crud_and_tracks() {
        let db = Database::new_in_memory().expect("failed to init db");

        // 1. Create playlist
        let playlist = db
            .create_playlist("My Jazz Playlist", Some("Smooth Late Night Jazz"), None)
            .expect("create playlist failed");
        assert_eq!(playlist.title, "My Jazz Playlist");

        // 2. List playlists
        let list = db.get_playlists().expect("get playlists failed");
        assert_eq!(list.len(), 1);
        assert_eq!(list[0].track_count, 0);

        // 3. Add track
        let track = TrackItem {
            id: "trk-1".to_string(),
            title: "Take Five".to_string(),
            artist: "Dave Brubeck".to_string(),
            album: Some("Time Out".to_string()),
            duration_secs: 324,
            isrc: Some("USCO15900001".to_string()),
            original_source: "Spotify".to_string(),
            preferred_provider: "Tidal".to_string(),
            cover_url: None,
            audio_quality: Some("HiFi FLAC".to_string()),
            local_path: None,
        };
        db.add_track_to_playlist(&playlist.id, &track)
            .expect("add track failed");

        // 4. Verify track list and count
        let tracks = db
            .get_playlist_tracks(&playlist.id)
            .expect("get tracks failed");
        assert_eq!(tracks.len(), 1);
        assert_eq!(tracks[0].title, "Take Five");
        assert_eq!(tracks[0].preferred_provider, "Tidal");

        let list_updated = db.get_playlists().expect("get playlists failed");
        assert_eq!(list_updated[0].track_count, 1);

        // 5. Update preferred provider to Spotify
        db.update_preferred_provider("trk-1", "Spotify")
            .expect("update provider failed");
        let tracks_updated = db
            .get_playlist_tracks(&playlist.id)
            .expect("get tracks failed");
        assert_eq!(tracks_updated[0].preferred_provider, "Spotify");

        // 6. Delete playlist
        let deleted = db.delete_playlist(&playlist.id).expect("delete failed");
        assert!(deleted);
        let list_empty = db.get_playlists().expect("get playlists failed");
        assert_eq!(list_empty.len(), 0);
    }

    #[test]
    fn test_seeding_defaults() {
        let db = Database::new_in_memory().expect("failed to init db");
        db.seed_defaults_if_empty().expect("seed failed");

        let playlists = db.get_playlists().expect("get playlists failed");
        assert_eq!(playlists.len(), 1);
        assert_eq!(playlists[0].track_count, 4);

        let tracks = db
            .get_playlist_tracks(&playlists[0].id)
            .expect("get tracks failed");
        assert_eq!(tracks.len(), 4);
    }
}
