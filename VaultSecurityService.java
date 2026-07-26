// VaultSecurityService.java
// Java 21 Virtual Threads for high-concurrency cryptographic operations.

package com.aura.obsidian.security;

import javax.crypto.Cipher;
import javax.crypto.SecretKey;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.util.Base64;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;

public class VaultSecurityService {

    private static final String AES = "AES";
    private static final String AES_GCM_NO_PADDING = "AES/GCM/NoPadding";
    private static final int GCM_IV_LENGTH = 12;
    private static final int GCM_TAG_LENGTH = 128;
    
    // In production, this key is loaded from an HSM or KMS
    private static final byte[] RAW_ENCLAVE_KEY = "32-byte-obsidian-enclave-key!!!!".getBytes(StandardCharsets.UTF_8);
    private static final SecretKey SECRET_KEY = new SecretKeySpec(RAW_ENCLAVE_KEY, AES);
    
    private final SecureRandom secureRandom;
    
    // Java 21 Virtual Thread Executor. 
    // Replaces traditional thread pools for massive I/O bound concurrency without reactive overhead.
    private final ExecutorService virtualThreadExecutor;

    public VaultSecurityService() {
        this.secureRandom = new SecureRandom();
        this.virtualThreadExecutor = Executors.newVirtualThreadPerTaskExecutor();
    }

    /**
     * Encrypts plaintext using AES-GCM. 
     * Submitted to a virtual thread to prevent blocking the main request thread 
     * during heavy cryptographic operations.
     */
    public Future<String> encryptAsync(String plaintext) {
        return virtualThreadExecutor.submit(() -> {
            try {
                byte[] iv = new byte[GCM_IV_LENGTH];
                secureRandom.nextBytes(iv);

                Cipher cipher = Cipher.getInstance(AES_GCM_NO_PADDING);
                GCMParameterSpec parameterSpec = new GCMParameterSpec(GCM_TAG_LENGTH, iv);
                cipher.init(Cipher.ENCRYPT_MODE, SECRET_KEY, parameterSpec);

                byte[] ciphertext = cipher.doFinal(plaintext.getBytes(StandardCharsets.UTF_8));

                ByteBuffer byteBuffer = ByteBuffer.allocate(iv.length + ciphertext.length);
                byteBuffer.put(iv);
                byteBuffer.put(ciphertext);

                return Base64.getEncoder().encodeToString(byteBuffer.array());
            } catch (Exception e) {
                throw new SecurityException("Enclave encryption failed", e);
            }
        });
    }

    /**
     * Decrypts AES-GCM ciphertext.
     */
    public Future<String> decryptAsync(String encryptedBase64) {
        return virtualThreadExecutor.submit(() -> {
            try {
                byte[] decoded = Base64.getDecoder().decode(encryptedBase64);
                ByteBuffer byteBuffer = ByteBuffer.wrap(decoded);

                byte[] iv = new byte[GCM_IV_LENGTH];
                byteBuffer.get(iv);

                byte[] ciphertext = new byte[byteBuffer.remaining()];
                byteBuffer.get(ciphertext);

                Cipher cipher = Cipher.getInstance(AES_GCM_NO_PADDING);
                GCMParameterSpec parameterSpec = new GCMParameterSpec(GCM_TAG_LENGTH, iv);
                cipher.init(Cipher.DECRYPT_MODE, SECRET_KEY, parameterSpec);

                byte[] plaintext = cipher.doFinal(ciphertext);
                return new String(plaintext, StandardCharsets.UTF_8);
            } catch (Exception e) {
                throw new SecurityException("Enclave decryption failed. Tampered data detected.", e);
            }
        });
    }

    public void shutdown() {
        virtualThreadExecutor.shutdown();
    }
}
