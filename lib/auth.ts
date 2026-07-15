import crypto from "crypto";

const SECRET = process.env.NEXTAUTH_SECRET || "phamdanghaifamilysecretkeys";

export function signToken(payload: any): string {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto
    .createHmac("sha256", SECRET)
    .update(`${header}.${body}`)
    .digest("base64url");
  return `${header}.${body}.${signature}`;
}

export function verifyToken(token: string | undefined): any | null {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;

  const [header, body, signature] = parts;
  const expectedSignature = crypto
    .createHmac("sha256", SECRET)
    .update(`${header}.${body}`)
    .digest("base64url");

  if (signature !== expectedSignature) return null;

  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
    if (payload.exp && payload.exp < Date.now()) {
      return null; // Đã hết hạn
    }
    return payload;
  } catch (e) {
    return null;
  }
}

// Hàm kiểm tra nhanh xem cookie session có quyền Admin hay không
export function checkAdminSession(token: string | undefined): boolean {
  const payload = verifyToken(token);
  return payload?.email === "pdanghai@gmail.com";
}
