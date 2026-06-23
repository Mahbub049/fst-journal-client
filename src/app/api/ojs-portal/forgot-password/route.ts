import https from "https";
import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const cleanBaseUrl = (url: string) => url.replace(/\/+$/, "");

const getOjsBaseUrl = () =>
  cleanBaseUrl(
    process.env.NEXT_PUBLIC_OJS_BASE_URL ||
      "https://testjournal.bup.edu.bd/index.php/jfst",
  );

const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
});

const collectCookieHeader = (cookies?: string[]) => {
  if (!cookies?.length) return undefined;

  return cookies
    .map((cookie) => cookie.split(";")[0])
    .filter(Boolean)
    .join("; ");
};

const readHiddenInputs = (html: string) => {
  const hiddenInputs: Record<string, string> = {};
  const inputRegex = /<input\b[^>]*>/gi;
  const nameRegex = /name=["']([^"']+)["']/i;
  const valueRegex = /value=["']([^"']*)["']/i;
  const typeRegex = /type=["']([^"']+)["']/i;

  for (const input of html.match(inputRegex) || []) {
    const type = input.match(typeRegex)?.[1]?.toLowerCase();
    if (type !== "hidden") continue;

    const name = input.match(nameRegex)?.[1];
    if (!name) continue;

    hiddenInputs[name] = input.match(valueRegex)?.[1] || "";
  }

  return hiddenInputs;
};

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { email?: string };
    const email = body.email?.trim();

    if (!email) {
      return NextResponse.json(
        { message: "Please enter a valid email address." },
        { status: 400 },
      );
    }

    const baseUrl = getOjsBaseUrl();
    const lostPasswordUrl = `${baseUrl}/login/lostPassword`;

    const pageResponse = await axios.get<string>(lostPasswordUrl, {
      httpsAgent,
      headers: {
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "User-Agent": "JournalFST-SubmissionPortal/1.0",
      },
      maxRedirects: 5,
      timeout: 15000,
      validateStatus: (status) => status >= 200 && status < 400,
    });

    const hiddenInputs = readHiddenInputs(pageResponse.data);
    const params = new URLSearchParams();

    Object.entries(hiddenInputs).forEach(([key, value]) => {
      params.set(key, value);
    });

    params.set("email", email);
    params.set("submit", "Reset Password");

    const cookieHeader = collectCookieHeader(pageResponse.headers["set-cookie"]);

    await axios.post(lostPasswordUrl, params.toString(), {
      httpsAgent,
      headers: {
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Content-Type": "application/x-www-form-urlencoded",
        Origin: baseUrl.replace(/\/index\.php\/jfst$/, ""),
        Referer: lostPasswordUrl,
        "User-Agent": "JournalFST-SubmissionPortal/1.0",
        ...(cookieHeader ? { Cookie: cookieHeader } : {}),
      },
      maxRedirects: 5,
      timeout: 15000,
      validateStatus: (status) => status >= 200 && status < 500,
    });

    return NextResponse.json({
      message:
        "If this email is registered, OJS will send password recovery instructions shortly.",
    });
  } catch (error) {
    console.error("OJS forgot password request failed:", error);

    return NextResponse.json(
      {
        message:
          "Password recovery could not be requested right now. Please try again later.",
      },
      { status: 502 },
    );
  }
}
