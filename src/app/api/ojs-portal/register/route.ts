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

type RegisterPayload = {
  givenName?: string;
  familyName?: string;
  affiliation?: string;
  country?: string;
  email?: string;
  username?: string;
  password?: string;
  password2?: string;
  privacyConsent?: string | boolean;
};

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

const appendAuthorUserGroups = (params: URLSearchParams, inputs: ParsedInput[]) => {
  if (params.has("userGroupIds[]")) return;

  const userGroupIds = Array.from(
    new Set(
      inputs
        .filter((input) => input.name === "userGroupIds[]" && input.value)
        .map((input) => input.value),
    ),
  );

  userGroupIds.forEach((id) => params.append("userGroupIds[]", id));
};

const stripTags = (html: string) =>
  html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const extractRegistrationError = (html: string) => {
  if (!/formErrors|Errors occurred processing this form|The form could not be submitted/i.test(html)) {
    return "";
  }

  const errorBlock =
    html.match(/<div[^>]*(?:id|class)=["'][^"']*formErrors[^"']*["'][^>]*>[\s\S]*?<\/div>/i)?.[0] ||
    html.match(/Errors occurred processing this form[\s\S]{0,1200}/i)?.[0] ||
    html;

  return (
    stripTags(errorBlock)
      .replace(/^Errors occurred processing this form:?\s*/i, "")
      .replace(/^Error:?\s*/i, "") ||
    "OJS rejected the registration. Please check the information and try again."
  );
};

const toRequiredString = (value: unknown) =>
  typeof value === "string" ? value.trim() : "";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as RegisterPayload;

    const givenName = toRequiredString(body.givenName);
    const familyName = toRequiredString(body.familyName);
    const affiliation = toRequiredString(body.affiliation);
    const country = toRequiredString(body.country) || "BD";
    const email = toRequiredString(body.email);
    const username = toRequiredString(body.username);
    const password = toRequiredString(body.password);
    const password2 = toRequiredString(body.password2);
    const hasPrivacyConsent =
      body.privacyConsent === true ||
      body.privacyConsent === "1" ||
      body.privacyConsent === "on";

    if (!givenName || !familyName || !affiliation || !email || !username || !password) {
      return NextResponse.json(
        { message: "Please fill in all required registration fields." },
        { status: 400 },
      );
    }

    if (password !== password2) {
      return NextResponse.json(
        { message: "Password and confirm password do not match." },
        { status: 400 },
      );
    }

    if (!hasPrivacyConsent) {
      return NextResponse.json(
        { message: "Please agree to the journal privacy statement." },
        { status: 400 },
      );
    }

    const baseUrl = getOjsBaseUrl();
    const registerUrl = `${baseUrl}/user/register`;
    const submissionsUrl = `${baseUrl}/submissions`;

    const registerPageResponse = await axios.get<string>(registerUrl, {
      headers: {
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "User-Agent": "JournalFST-SubmissionPortal/1.0",
      },
      maxRedirects: 5,
      timeout: 15000,
      validateStatus: (status) => status >= 200 && status < 400,
    });

    const inputs = readInputs(registerPageResponse.data);
    const params = new URLSearchParams();

    appendInputValues(params, inputs);
    appendAuthorUserGroups(params, inputs);

    // OJS expects these fields as plain strings. Do not submit givenName[en_US]
    // or affiliation[en_US], otherwise OJS displays them as "Array".
    params.set("givenName", givenName);
    params.set("familyName", familyName);
    params.set("affiliation", affiliation);
    params.set("country", country);
    params.set("email", email);
    params.set("username", username);
    params.set("password", password);
    params.set("password2", password2);
    params.set("privacyConsent", "1");
    params.set("source", submissionsUrl);
    params.set("returnUrl", submissionsUrl);
    params.set("registerAsAuthor", "1");
    params.set("submitFormButton", "Register");

    const cookieHeader = collectCookieHeader(registerPageResponse.headers["set-cookie"]);

    const postResponse = await axios.post<string>(registerUrl, params.toString(), {
      headers: {
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Content-Type": "application/x-www-form-urlencoded",
        Origin: new URL(baseUrl).origin,
        Referer: registerUrl,
        "User-Agent": "JournalFST-SubmissionPortal/1.0",
        ...(cookieHeader ? { Cookie: cookieHeader } : {}),
      },
      maxRedirects: 0,
      timeout: 15000,
      validateStatus: (status) => status >= 200 && status < 400,
    });

    const redirectLocation = postResponse.headers.location;
    const ojsRedirectUrl = redirectLocation
      ? new URL(redirectLocation, registerUrl).toString()
      : submissionsUrl;

    if (
      postResponse.status >= 300 &&
      postResponse.status < 400 &&
      !ojsRedirectUrl.includes("formErrors")
    ) {
      return NextResponse.json({
        message: "Registration completed. Redirecting to manuscript submission...",
        redirectUrl: submissionsUrl,
      });
    }

    const errorMessage = extractRegistrationError(postResponse.data || "");

    if (errorMessage) {
      return NextResponse.json({ message: errorMessage }, { status: 400 });
    }

    return NextResponse.json({
      message: "Registration completed. Redirecting to manuscript submission...",
      redirectUrl: submissionsUrl,
    });
  } catch (error) {
    console.error("OJS registration request failed:", error);

    return NextResponse.json(
      {
        message:
          "Registration could not be completed right now. Please try again later.",
      },
      { status: 502 },
    );
  }
}
