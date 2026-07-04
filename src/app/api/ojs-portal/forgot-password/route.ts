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

type ParsedInput = {
  name: string;
  value: string;
  type: string;
  checked: boolean;
};

const collectCookieHeader = (cookies?: string[] | string) => {
  const cookieList = Array.isArray(cookies) ? cookies : cookies ? [cookies] : [];

  if (!cookieList.length) return undefined;

  return cookieList
    .map((cookie) => cookie.split(";")[0])
    .filter(Boolean)
    .join("; ");
};

const decodeHtmlAttribute = (value: string) =>
  value
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");

const parseAttributes = (tag: string) => {
  const attrs: Record<string, string> = {};
  const attrRegex = /([:\w\-\[\]]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>/=`]+)))?/g;
  let match: RegExpExecArray | null;

  while ((match = attrRegex.exec(tag)) !== null) {
    const key = match[1].toLowerCase();
    if (key === "input") continue;

    attrs[key] = decodeHtmlAttribute(match[2] ?? match[3] ?? match[4] ?? "");
  }

  return attrs;
};

const readInputs = (html: string): ParsedInput[] => {
  const inputs: ParsedInput[] = [];
  const inputRegex = /<input\b[^>]*>/gi;

  for (const input of html.match(inputRegex) || []) {
    const attrs = parseAttributes(input);
    const name = attrs.name;

    if (!name) continue;

    inputs.push({
      name,
      value: attrs.value || "",
      type: (attrs.type || "text").toLowerCase(),
      checked: Object.prototype.hasOwnProperty.call(attrs, "checked"),
    });
  }

  return inputs;
};

const appendInputValues = (params: URLSearchParams, inputs: ParsedInput[]) => {
  inputs.forEach((input) => {
    if (input.type === "hidden") {
      params.append(input.name, input.value);
      return;
    }

    if ((input.type === "checkbox" || input.type === "radio") && input.checked) {
      params.append(input.name, input.value || "1");
    }
  });
};

const stripTags = (html: string) =>
  html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const extractOjsError = (html: string) => {
  if (!/formErrors|Errors occurred processing this form|The form could not be submitted|alert-danger|pkp_form_error/i.test(html)) {
    return "";
  }

  const errorBlock =
    html.match(/<div[^>]*(?:id|class)=["'][^"']*(?:formErrors|alert-danger|pkp_form_error)[^"']*["'][^>]*>[\s\S]*?<\/div>/i)?.[0] ||
    html.match(/Errors occurred processing this form[\s\S]{0,1200}/i)?.[0] ||
    html;

  return (
    stripTags(errorBlock)
      .replace(/^Errors occurred processing this form:?\s*/i, "")
      .replace(/^Error:?\s*/i, "") ||
    "OJS rejected the password reset request. Please check the email address and try again."
  );
};

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { email?: string };
    const email = body.email?.trim();

    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      return NextResponse.json(
        { message: "Please enter a valid registered email address." },
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

    const params = new URLSearchParams();
    appendInputValues(params, readInputs(pageResponse.data));

    // OJS lost password expects the simple `email` field from its native form.
    // submitFormButton is included because some OJS themes/forms depend on it.
    params.set("email", email);
    params.set("submitFormButton", "Reset Password");
    params.set("submit", "Reset Password");

    const cookieHeader = collectCookieHeader(pageResponse.headers["set-cookie"]);

    const postResponse = await axios.post<string>(lostPasswordUrl, params.toString(), {
      httpsAgent,
      headers: {
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Content-Type": "application/x-www-form-urlencoded",
        Origin: new URL(baseUrl).origin,
        Referer: lostPasswordUrl,
        "User-Agent": "JournalFST-SubmissionPortal/1.0",
        ...(cookieHeader ? { Cookie: cookieHeader } : {}),
      },
      maxRedirects: 0,
      timeout: 15000,
      validateStatus: (status) => status >= 200 && status < 400,
    });

    const errorMessage =
      typeof postResponse.data === "string" ? extractOjsError(postResponse.data) : "";

    if (errorMessage) {
      return NextResponse.json({ message: errorMessage }, { status: 400 });
    }

    return NextResponse.json({
      message:
        "Password reset request has been sent to OJS. Please check the registered email inbox and spam folder.",
    });
  } catch (error) {
    console.error("OJS forgot password request failed:", error);

    return NextResponse.json(
      {
        message:
          "Password recovery could not be requested right now. Please try again later or use the OJS reset page directly.",
      },
      { status: 502 },
    );
  }
}
