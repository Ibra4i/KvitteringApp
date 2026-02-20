import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { storage } from "./firebase";

async function uriToBlob(uri: string) {
  const response = await fetch(uri);
  return await response.blob();
}

export async function uploadReceiptImage(uri: string) {
  const blob = await uriToBlob(uri);

  const filename = `receipts/${Date.now()}.jpg`;
  const fileRef = ref(storage, filename);

  await uploadBytes(fileRef, blob, {
    contentType: "image/jpeg",
  });

  const downloadURL = await getDownloadURL(fileRef);
  return downloadURL;
}