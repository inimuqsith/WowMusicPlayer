use aes_gcm::{
    aead::{Aead, KeyInit},
    Aes256Gcm, Nonce,
};
use argon2::Argon2;
use rand::{rngs::OsRng, RngCore};
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct EncryptedVaultItem {
    pub ciphertext_b64: String,
    pub nonce_b64: String,
    pub salt_b64: String,
}

pub struct CryptoVault;

impl CryptoVault {
    /// Derives a 256-bit (32 bytes) master key from a user password and salt using Argon2id.
    pub fn derive_key(password: &str, salt_bytes: &[u8]) -> Result<[u8; 32], String> {
        let mut key = [0u8; 32];
        let argon2 = Argon2::default();
        argon2
            .hash_password_into(password.as_bytes(), salt_bytes, &mut key)
            .map_err(|e| format!("Argon2 derivation error: {}", e))?;
        Ok(key)
    }

    /// Encrypts plaintext string using AES-256-GCM.
    pub fn encrypt(password: &str, plaintext: &str) -> Result<EncryptedVaultItem, String> {
        // Generate random 16-byte salt for Argon2
        let mut salt = [0u8; 16];
        OsRng.fill_bytes(&mut salt);

        // Derive 32-byte key
        let key = Self::derive_key(password, &salt)?;

        // Generate random 12-byte nonce for AES-256-GCM
        let mut nonce_bytes = [0u8; 12];
        OsRng.fill_bytes(&mut nonce_bytes);
        let nonce = Nonce::from_slice(&nonce_bytes);

        // Encrypt with AES-GCM
        let cipher = Aes256Gcm::new_from_slice(&key)
            .map_err(|e| format!("Cipher init error: {}", e))?;
        
        let ciphertext = cipher
            .encrypt(nonce, plaintext.as_bytes())
            .map_err(|e| format!("Encryption error: {}", e))?;

        Ok(EncryptedVaultItem {
            ciphertext_b64: base64_simd_encode(&ciphertext),
            nonce_b64: base64_simd_encode(&nonce_bytes),
            salt_b64: base64_simd_encode(&salt),
        })
    }

    /// Decrypts ciphertext back to plaintext using the password and vault item.
    pub fn decrypt(password: &str, item: &EncryptedVaultItem) -> Result<String, String> {
        let salt = base64_simd_decode(&item.salt_b64)
            .map_err(|e| format!("Invalid salt base64: {}", e))?;
        let nonce_bytes = base64_simd_decode(&item.nonce_b64)
            .map_err(|e| format!("Invalid nonce base64: {}", e))?;
        let ciphertext = base64_simd_decode(&item.ciphertext_b64)
            .map_err(|e| format!("Invalid ciphertext base64: {}", e))?;

        if nonce_bytes.len() != 12 {
            return Err("Invalid nonce length: expected 12 bytes".to_string());
        }

        let key = Self::derive_key(password, &salt)?;
        let cipher = Aes256Gcm::new_from_slice(&key)
            .map_err(|e| format!("Cipher init error: {}", e))?;
        let nonce = Nonce::from_slice(&nonce_bytes);

        let plaintext_bytes = cipher
            .decrypt(nonce, ciphertext.as_ref())
            .map_err(|_| "Decryption failed: invalid password or corrupted data".to_string())?;

        String::from_utf8(plaintext_bytes)
            .map_err(|e| format!("UTF-8 decode error: {}", e))
    }
}

// Simple internal Base64 helpers using the base64 crate
fn base64_simd_encode(data: &[u8]) -> String {
    use base64::Engine;
    base64::engine::general_purpose::STANDARD.encode(data)
}

fn base64_simd_decode(data: &str) -> Result<Vec<u8>, base64::DecodeError> {
    use base64::Engine;
    base64::engine::general_purpose::STANDARD.decode(data)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_vault_encryption_decryption_cycle() {
        let password = "SuperSecretAudiophilePassword123!";
        let original_token = r#"{"tidal_token": "tidal_sec_token_98273498273", "spotify_token": "sp_oauth_482937"}"#;

        let encrypted = CryptoVault::encrypt(password, original_token)
            .expect("Encryption should succeed");

        assert_ne!(encrypted.ciphertext_b64, original_token);

        let decrypted = CryptoVault::decrypt(password, &encrypted)
            .expect("Decryption should succeed");

        assert_eq!(decrypted, original_token);
    }

    #[test]
    fn test_vault_wrong_password_fails() {
        let password = "CorrectPassword123";
        let wrong_password = "WrongPassword999";
        let original = "sensitive_api_token_value";

        let encrypted = CryptoVault::encrypt(password, original)
            .expect("Encryption should succeed");

        let result = CryptoVault::decrypt(wrong_password, &encrypted);
        assert!(result.is_err());
    }
}
