use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TimedLyricLine {
    pub timestamp_ms: u64,
    pub text: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LyricsPayload {
    pub track_title: String,
    pub artist_name: String,
    pub is_synced: bool,
    pub lines: Vec<TimedLyricLine>,
    pub source: String,
}

#[derive(Deserialize)]
struct LrclibResponse {
    #[serde(rename = "syncedLyrics")]
    synced_lyrics: Option<String>,
    #[serde(rename = "plainLyrics")]
    plain_lyrics: Option<String>,
}

pub struct LyricsEngine;

impl LyricsEngine {
    /// Parses LRC content string into timed lines
    pub fn parse_lrc(lrc_content: &str) -> Vec<TimedLyricLine> {
        let mut lines = Vec::new();

        for line in lrc_content.lines() {
            let line = line.trim();
            if !line.starts_with('[') {
                continue;
            }

            if let Some(close_bracket) = line.find(']') {
                let time_str = &line[1..close_bracket];
                let text = line[close_bracket + 1..].trim();

                // Format: mm:ss.xx or mm:ss:xx or mm:ss
                let parts: Vec<&str> = time_str.split(':').collect();
                if parts.len() >= 2 {
                    if let Ok(minutes) = parts[0].parse::<u64>() {
                        let sec_parts: Vec<&str> = parts[1].split('.').collect();
                        if let Ok(seconds) = sec_parts[0].parse::<u64>() {
                            let ms = if sec_parts.len() > 1 {
                                let frac = sec_parts[1];
                                match frac.len() {
                                    1 => frac.parse::<u64>().unwrap_or(0) * 100,
                                    2 => frac.parse::<u64>().unwrap_or(0) * 10,
                                    _ => frac[..3].parse::<u64>().unwrap_or(0),
                                }
                            } else {
                                0
                            };

                            let total_ms = (minutes * 60 * 1000) + (seconds * 1000) + ms;
                            lines.push(TimedLyricLine {
                                timestamp_ms: total_ms,
                                text: text.to_string(),
                            });
                        }
                    }
                }
            }
        }

        lines.sort_by_key(|l| l.timestamp_ms);
        lines
    }

    /// Fetches synced lyrics from LRCLIB open API
    pub async fn fetch_lyrics(
        track_name: &str,
        artist_name: &str,
        album_name: Option<&str>,
        duration_secs: Option<u32>,
    ) -> Result<LyricsPayload, String> {
        let client = reqwest::Client::builder()
            .timeout(std::time::Duration::from_secs(5))
            .build()
            .map_err(|e| e.to_string())?;

        let mut url = format!(
            "https://lrclib.net/api/get?track_name={}&artist_name={}",
            urlencoding(track_name),
            urlencoding(artist_name)
        );

        if let Some(album) = album_name {
            url.push_str(&format!("&album_name={}", urlencoding(album)));
        }
        if let Some(duration) = duration_secs {
            url.push_str(&format!("&duration={}", duration));
        }

        let resp = client
            .get(&url)
            .header("User-Agent", "WowMusicPlayer/0.4.0")
            .send()
            .await
            .map_err(|e| format!("Failed to reach LRCLIB: {}", e))?;

        if !resp.status().is_success() {
            return Err(format!("Lyrics not found (HTTP {})", resp.status()));
        }

        let data: LrclibResponse = resp
            .json()
            .await
            .map_err(|e| format!("Failed to parse response: {}", e))?;

        if let Some(synced) = data.synced_lyrics {
            let lines = Self::parse_lrc(&synced);
            return Ok(LyricsPayload {
                track_title: track_name.to_string(),
                artist_name: artist_name.to_string(),
                is_synced: true,
                lines,
                source: "LRCLIB (Synced)".to_string(),
            });
        }

        if let Some(plain) = data.plain_lyrics {
            let lines = plain
                .lines()
                .enumerate()
                .map(|(i, line)| TimedLyricLine {
                    timestamp_ms: (i as u64) * 3000,
                    text: line.trim().to_string(),
                })
                .collect();

            return Ok(LyricsPayload {
                track_title: track_name.to_string(),
                artist_name: artist_name.to_string(),
                is_synced: false,
                lines,
                source: "LRCLIB (Plain)".to_string(),
            });
        }

        Err("No lyrics available".to_string())
    }
}

fn urlencoding(s: &str) -> String {
    let mut encoded = String::new();
    for byte in s.bytes() {
        if byte.is_ascii_alphanumeric() || byte == b'-' || byte == b'_' || byte == b'.' || byte == b'~' {
            encoded.push(byte as char);
        } else {
            encoded.push_str(&format!("%{:02X}", byte));
        }
    }
    encoded
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_parse_lrc_timestamps() {
        let lrc_sample = r#"
[00:12.50]Is this the real life?
[00:15.80]Is this just fantasy?
[00:21.05]Caught in a landslide, no escape from reality
"#;

        let parsed = LyricsEngine::parse_lrc(lrc_sample);
        assert_eq!(parsed.len(), 3);
        assert_eq!(parsed[0].timestamp_ms, 12500);
        assert_eq!(parsed[0].text, "Is this the real life?");
        assert_eq!(parsed[1].timestamp_ms, 15800);
        assert_eq!(parsed[2].timestamp_ms, 21050);
    }
}
