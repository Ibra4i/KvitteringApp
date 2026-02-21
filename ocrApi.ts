const OCR_URL = "https://extractreceipt-kaizlo3eaq-uc.a.run.app";

export type OcrResult = {
  ok: boolean;
  version?: string;
  total?: string;
  merchant?: string;
  date?: string;
  time?: string;
  vat?: string;
  rawText?: string;
  error?: string;
};

export async function extractReceiptFromImage(imageUrl: string): Promise<OcrResult> {
  const res = await fetch(OCR_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ imageUrl }),
  });

  const json = (await res.json()) as OcrResult;
  if (!json.ok) throw new Error(json.error || "OCR failed");
  return json;
}