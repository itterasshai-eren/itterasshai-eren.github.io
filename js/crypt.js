
function get_mime(filename){
    const extension = filename.split('.').pop().toLowerCase();
    switch (extension) {
        case 'pdf':
            return 'application/pdf';
        case 'txt':
            return 'text/plain';
        case 'jpg':
        case 'jpeg':
            return 'image/jpeg';
        case 'png':
            return 'image/png';
        default:
            return 'application/octet-stream'; // Default MIME type for unknown extensions
    }

}
export async function decryptAndDownload(url, password, filename) {
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
    }

    const encrypted = new Uint8Array(
        await response.arrayBuffer()
    );

    // -------------------------
    // Parse file
    // -------------------------

    const salt = encrypted.slice(0, 16);
    const iv = encrypted.slice(16, 28);
    const ciphertext = encrypted.slice(28);

    console.log("salt:", toHex(salt));
    console.log("iv:", toHex(iv));

    // -------------------------
    // Convert password -> PBKDF2 key
    // -------------------------

    const passwordKey = await crypto.subtle.importKey(
        "raw",
        new TextEncoder().encode(password),
        {
            name: "PBKDF2"
        },
        false,
        ["deriveKey"]
    );

    const key = await crypto.subtle.deriveKey(
        {
            name: "PBKDF2",
            salt: salt,
            iterations: 600000,
            hash: "SHA-256"
        },
        passwordKey,
        {
            name: "AES-GCM",
            length: 256
        },
        false,
        ["decrypt"]
    );

    // -------------------------
    // Decrypt
    // -------------------------

    const decrypted = await crypto.subtle.decrypt(
        {
            name: "AES-GCM",
            iv: iv,
            tagLength: 128
        },
        key,
        ciphertext
    );

    // -------------------------
    // Download
    // -------------------------

    const blob = new Blob([decrypted], {
        type: get_mime(filename)
    });

    const downloadUrl = URL.createObjectURL(blob);

    window.open(downloadUrl);


    // Don't immediately revoke in some browsers
    setTimeout(() => {
        URL.revokeObjectURL(downloadUrl);
    }, 600000);//10 minutes

    // return downloadUrl;
}

function toHex(bytes) {
    return [...bytes]
        .map(b => b.toString(16).padStart(2, "0"))
        .join("");
}

window.decryptAndDownload = decryptAndDownload;