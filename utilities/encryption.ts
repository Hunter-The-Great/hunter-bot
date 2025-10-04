import crypto from "crypto";

async function encrypt(text) {
  const binaryDerStringPub = atob(process.env.PUBLIC_KEY!);
  const binaryDerPub = str2ab(binaryDerStringPub);
  const publicKey = await crypto.subtle.importKey(
    "spki",
    binaryDerPub,
    {
      name: "RSA-OAEP",
      hash: "SHA-256",
    },
    true,
    ["encrypt"]
  );

  const enc = new TextEncoder();
  const encoded = enc.encode(text);
  const encrypted = await crypto.subtle.encrypt("RSA-OAEP", publicKey, encoded);
  return encrypted;
}

async function decrypt(text) {
  const dec = new TextDecoder();
  const binaryDerStringPriv = atob(process.env.PRIVATE_KEY!);
  const binaryDerPriv = str2ab(binaryDerStringPriv);
  const privateKey = await crypto.subtle.importKey(
    "pkcs8",
    binaryDerPriv,
    {
      name: "RSA-OAEP",
      hash: "SHA-256",
    },
    true,
    ["decrypt"]
  );
  const decrypted = await crypto.subtle.decrypt("RSA-OAEP", privateKey, text);
  return dec.decode(decrypted);
}

function str2ab(str) {
  const buf = new ArrayBuffer(str.length);
  const bufView = new Uint8Array(buf);
  for (let i = 0, strLen = str.length; i < strLen; i++) {
    bufView[i] = str.charCodeAt(i);
  }
  return buf;
}

export { encrypt, decrypt };
