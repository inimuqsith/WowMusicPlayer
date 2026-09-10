use reqwest::Client;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

// Standard TIDAL Client ID for TV / Desktop devices (Configurable via env)
const DEFAULT_CLIENT_ID: &str = "zU4XHVVkc2tDPo4t";
const AUTH_BASE_URL: &str = "https://auth.tidal.com/v1/oauth2";
const API_BASE_URL: &str = "https://api.tidal.com/v1";

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DeviceAuthResponse {
    pub device_code: String,
    pub user_code: String,
    pub verification_uri: String,
    pub verification_uri_complete: Option<String>,
    pub expires_in: u32,
    pub interval: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TidalToken {
    pub access_token: String,
    pub refresh_token: Option<String>,
    pub token_type: String,
    pub expires_in: u32,
    pub user_id: Option<u64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TidalTrack {
    pub id: u64,
    pub title: String,
    pub artist_name: String,
    pub album_title: Option<String>,
    pub duration: u32,
    pub isrc: Option<String>,
    pub audio_quality: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TidalPlaybackInfo {
    pub track_id: u64,
    pub audio_quality: String,
    pub manifest_mime_type: String,
    pub manifest: String,
}

pub struct TidalClient {
    client: Client,
    client_id: String,
}

impl Default for TidalClient {
    fn default() -> Self {
        Self::new()
    }
}

impl TidalClient {
    pub fn new() -> Self {
        let client_id = std::env::var("TIDAL_CLIENT_ID").unwrap_or_else(|_| DEFAULT_CLIENT_ID.to_string());
        Self {
            client: Client::builder()
                .user_agent("WowMusicPlayer/0.2.0 (Linux; x86_64)")
                .build()
                .unwrap_or_default(),
            client_id,
        }
    }

    pub fn with_client_id(client_id: String) -> Self {
        Self {
            client: Client::builder()
                .user_agent("WowMusicPlayer/0.2.0 (Linux; x86_64)")
                .build()
                .unwrap_or_default(),
            client_id,
        }
    }

    /// Step 1: Initiate OAuth2 Device Authorization Flow
    pub async fn start_device_auth(&self) -> Result<DeviceAuthResponse, String> {
        let mut params = HashMap::new();
        params.insert("client_id", self.client_id.as_str());
        params.insert("scope", "r_usr w_usr");

        let url = format!("{}/device/authorization", AUTH_BASE_URL);
        let resp = self
            .client
            .post(&url)
            .form(&params)
            .send()
            .await
            .map_err(|e| format!("Network error contacting TIDAL Auth: {}", e))?;

        if !resp.status().is_success() {
            let status = resp.status();
            let text = resp.text().await.unwrap_or_default();
            return Err(format!("TIDAL device auth failed ({}): {}", status, text));
        }

        #[derive(Deserialize)]
        #[serde(rename_all = "camelCase")]
        struct RawAuthResp {
            device_code: String,
            user_code: String,
            verification_uri: String,
            verification_uri_complete: Option<String>,
            expires_in: u32,
            interval: Option<u32>,
        }

        let raw: RawAuthResp = resp
            .json()
            .await
            .map_err(|e| format!("Failed to parse TIDAL response: {}", e))?;

        Ok(DeviceAuthResponse {
            device_code: raw.device_code,
            user_code: raw.user_code,
            verification_uri: raw.verification_uri,
            verification_uri_complete: raw.verification_uri_complete,
            expires_in: raw.expires_in,
            interval: raw.interval.unwrap_or(5),
        })
    }

    /// Step 2: Poll for user approval of the device code
    pub async fn poll_device_token(&self, device_code: &str) -> Result<TidalToken, String> {
        let mut params = HashMap::new();
        params.insert("client_id", self.client_id.as_str());
        params.insert("device_code", device_code);
        params.insert("grant_type", "urn:ietf:params:oauth:grant-type:device_code");
        params.insert("scope", "r_usr w_usr");

        let url = format!("{}/token", AUTH_BASE_URL);
        let resp = self
            .client
            .post(&url)
            .form(&params)
            .send()
            .await
            .map_err(|e| format!("Network error polling TIDAL Token: {}", e))?;

        let status = resp.status();
        if !status.is_success() {
            let text = resp.text().await.unwrap_or_default();
            return Err(format!("Waiting for user authorization: (Status {}) {}", status, text));
        }

        #[derive(Deserialize)]
        struct RawTokenResp {
            access_token: String,
            refresh_token: Option<String>,
            token_type: String,
            expires_in: u32,
            user_id: Option<u64>,
        }

        let raw: RawTokenResp = resp
            .json()
            .await
            .map_err(|e| format!("Failed to parse token response: {}", e))?;

        Ok(TidalToken {
            access_token: raw.access_token,
            refresh_token: raw.refresh_token,
            token_type: raw.token_type,
            expires_in: raw.expires_in,
            user_id: raw.user_id,
        })
    }

    /// Step 3: Search for a track in the TIDAL catalog by metadata/query
    pub async fn search_track(&self, query: &str, token: Option<&str>) -> Result<Vec<TidalTrack>, String> {
        let url = format!("{}/search/tracks", API_BASE_URL);
        let mut req = self.client.get(&url).query(&[
            ("query", query),
            ("limit", "5"),
            ("countryCode", "US"),
        ]);

        if let Some(tok) = token {
            req = req.header("Authorization", format!("Bearer {}", tok));
        } else {
            req = req.header("x-tidal-token", &self.client_id);
        }

        let resp = req
            .send()
            .await
            .map_err(|e| format!("TIDAL search request failed: {}", e))?;

        if !resp.status().is_success() {
            return Err(format!("TIDAL search failed with status {}", resp.status()));
        }

        #[derive(Deserialize)]
        struct SearchResp {
            items: Vec<RawTrack>,
        }

        #[derive(Deserialize)]
        struct RawArtist {
            name: String,
        }

        #[derive(Deserialize)]
        struct RawAlbum {
            title: String,
        }

        #[derive(Deserialize)]
        #[serde(rename_all = "camelCase")]
        struct RawTrack {
            id: u64,
            title: String,
            artist: RawArtist,
            album: Option<RawAlbum>,
            duration: u32,
            isrc: Option<String>,
            audio_quality: Option<String>,
        }

        let data: SearchResp = resp
            .json()
            .await
            .map_err(|e| format!("Failed to parse TIDAL search json: {}", e))?;

        Ok(data
            .items
            .into_iter()
            .map(|t| TidalTrack {
                id: t.id,
                title: t.title,
                artist_name: t.artist.name,
                album_title: t.album.map(|a| a.title),
                duration: t.duration,
                isrc: t.isrc,
                audio_quality: t.audio_quality,
            })
            .collect())
    }

    /// Step 4: Fetch stream manifest & audio quality info for playback
    pub async fn get_playback_info(
        &self,
        track_id: u64,
        token: &str,
        quality: Option<&str>,
    ) -> Result<TidalPlaybackInfo, String> {
        let requested_quality = quality.unwrap_or("LOSSLESS");
        let url = format!("{}/tracks/{}/playbackinfopostpaywall", API_BASE_URL, track_id);

        let resp = self
            .client
            .get(&url)
            .header("Authorization", format!("Bearer {}", token))
            .query(&[
                ("audioquality", requested_quality),
                ("playbackmode", "STREAM"),
                ("assetpresentation", "FULL"),
            ])
            .send()
            .await
            .map_err(|e| format!("Playback info request error: {}", e))?;

        if !resp.status().is_success() {
            return Err(format!("Failed to retrieve playback info: status {}", resp.status()));
        }

        #[derive(Deserialize)]
        #[serde(rename_all = "camelCase")]
        struct RawPlaybackResp {
            track_id: u64,
            audio_quality: String,
            manifest_mime_type: String,
            manifest: String,
        }

        let raw: RawPlaybackResp = resp
            .json()
            .await
            .map_err(|e| format!("Failed to parse playback json: {}", e))?;

        Ok(TidalPlaybackInfo {
            track_id: raw.track_id,
            audio_quality: raw.audio_quality,
            manifest_mime_type: raw.manifest_mime_type,
            manifest: raw.manifest,
        })
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_tidal_client_initialization() {
        let client = TidalClient::new();
        assert_eq!(client.client_id, DEFAULT_CLIENT_ID);

        let custom_client = TidalClient::with_client_id("custom_id_123".to_string());
        assert_eq!(custom_client.client_id, "custom_id_123");
    }

    #[test]
    fn test_tidal_mock_track_struct() {
        let track = TidalTrack {
            id: 1234567,
            title: "Bohemian Rhapsody".to_string(),
            artist_name: "Queen".to_string(),
            album_title: Some("A Night at the Opera".to_string()),
            duration: 354,
            isrc: Some("GBUM71029604".to_string()),
            audio_quality: Some("LOSSLESS".to_string()),
        };

        assert_eq!(track.id, 1234567);
        assert_eq!(track.isrc.as_deref(), Some("GBUM71029604"));
        assert_eq!(track.audio_quality.as_deref(), Some("LOSSLESS"));
    }
}
