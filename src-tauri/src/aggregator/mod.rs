use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum TrackSource {
    Spotify,
    YouTubeMusic,
    AppleMusic,
    Tidal,
    Local,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UnifiedTrack {
    pub id: String,
    pub title: String,
    pub artist: String,
    pub album: String,
    pub duration_secs: u32,
    pub isrc: Option<String>,
    pub source: TrackSource,
    pub cover_url: Option<String>,
    pub tidal_id: Option<String>,
    pub match_confidence: MatchConfidence,
    pub audio_quality: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum MatchConfidence {
    ExactIsrcHiFi,
    FuzzyMetadataMatched,
    AlternativeVersion,
    FallbackSource,
}

pub struct IsrcMatcher;

impl IsrcMatcher {
    /// Normalizes strings for resilient fuzzy matching (lowercase, trimmed, stripping special characters)
    pub fn normalize(s: &str) -> String {
        s.to_lowercase()
            .replace(['(', ')', '[', ']', '-', '_', '.', ','], " ")
            .split_whitespace()
            .collect::<Vec<&str>>()
            .join(" ")
    }

    /// Evaluates matching between a source track (e.g. Spotify/YT Music) and a candidate catalog track (e.g. TIDAL).
    pub fn score_match(source: &UnifiedTrack, candidate_title: &str, candidate_artist: &str, candidate_duration: u32, candidate_isrc: Option<&str>) -> (bool, MatchConfidence) {
        // Priority 1: Exact ISRC Match -> 100% Guaranteed HiFi/Lossless
        if let (Some(src_isrc), Some(cand_isrc)) = (&source.isrc, candidate_isrc) {
            if !src_isrc.is_empty() && src_isrc.eq_ignore_ascii_case(cand_isrc) {
                return (true, MatchConfidence::ExactIsrcHiFi);
            }
        }

        // Priority 2: Fuzzy Title + Artist + Duration Check
        let norm_src_title = Self::normalize(&source.title);
        let norm_cand_title = Self::normalize(candidate_title);

        let norm_src_artist = Self::normalize(&source.artist);
        let norm_cand_artist = Self::normalize(candidate_artist);

        let titles_match = norm_src_title.contains(&norm_cand_title) || norm_cand_title.contains(&norm_src_title);
        let artists_match = norm_src_artist.contains(&norm_cand_artist) || norm_cand_artist.contains(&norm_src_artist);

        let duration_diff = (source.duration_secs as i64 - candidate_duration as i64).abs();
        let duration_tolerated = duration_diff <= 3; // Within 3 seconds

        if titles_match && artists_match {
            if duration_tolerated {
                return (true, MatchConfidence::FuzzyMetadataMatched);
            } else if duration_diff <= 15 {
                // Possible Extended / Radio Edit / Live alternative
                return (true, MatchConfidence::AlternativeVersion);
            }
        }

        (false, MatchConfidence::FallbackSource)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_exact_isrc_matching() {
        let source_track = UnifiedTrack {
            id: "sp_1".into(),
            title: "Bohemian Rhapsody".into(),
            artist: "Queen".into(),
            album: "A Night at the Opera".into(),
            duration_secs: 354,
            isrc: Some("GBUM71029604".into()),
            source: TrackSource::Spotify,
            cover_url: None,
            tidal_id: None,
            match_confidence: MatchConfidence::FallbackSource,
            audio_quality: "Lossy 320kbps".into(),
        };

        let (matched, confidence) = IsrcMatcher::score_match(
            &source_track,
            "Bohemian Rhapsody (2011 Mix)",
            "Queen",
            354,
            Some("GBUM71029604"),
        );

        assert!(matched);
        assert_eq!(confidence, MatchConfidence::ExactIsrcHiFi);
    }

    #[test]
    fn test_fuzzy_metadata_matching_without_isrc() {
        let source_track = UnifiedTrack {
            id: "yt_1".into(),
            title: "Starboy (feat. Daft Punk)".into(),
            artist: "The Weeknd".into(),
            album: "Starboy".into(),
            duration_secs: 230,
            isrc: None,
            source: TrackSource::YouTubeMusic,
            cover_url: None,
            tidal_id: None,
            match_confidence: MatchConfidence::FallbackSource,
            audio_quality: "Opus 160kbps".into(),
        };

        let (matched, confidence) = IsrcMatcher::score_match(
            &source_track,
            "Starboy",
            "The Weeknd",
            231, // 1 second difference
            None,
        );

        assert!(matched);
        assert_eq!(confidence, MatchConfidence::FuzzyMetadataMatched);
    }
}
