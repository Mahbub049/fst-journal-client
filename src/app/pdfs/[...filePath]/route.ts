import { NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const getBackendOrigin = () => {
  const internalUrl =
    process.env.SERVER_INTERNAL_URL ||
    process.env.NEXT_PUBLIC_SERVER_INTERNAL_URL ||
    process.env.NEXT_PUBLIC_FILE_SERVER_URL ||
    "http://127.0.0.1:5000";

  return internalUrl.replace(/\/$/, "").replace(/\/api\/?$/, "");
};

const getSafePdfPath = (filePath: string[]) => {
  const cleanedSegments = filePath
    .map((segment) => decodeURIComponent(segment))
    .filter(Boolean);

  if (
    cleanedSegments.length === 0 ||
    cleanedSegments.some(
      (segment) =>
        segment === "." ||
        segment === ".." ||
        segment.includes("/") ||
        segment.includes("\\")
    )
  ) {
    return null;
  }

  return cleanedSegments.map((segment) => encodeURIComponent(segment)).join("/");
};

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ filePath: string[] }> }
) {
  const { filePath } = await context.params;
  const safePdfPath = getSafePdfPath(filePath || []);

  if (!safePdfPath) {
    return new Response("Invalid PDF path", { status: 400 });
  }

  const backendPdfUrl = `${getBackendOrigin()}/pdfs/${safePdfPath}`;

  try {
    const pdfResponse = await fetch(backendPdfUrl, {
      cache: "no-store",
    });

    if (!pdfResponse.ok || !pdfResponse.body) {
      return new Response("PDF file was not found", { status: 404 });
    }

    const headers = new Headers();
    headers.set(
      "content-type",
      pdfResponse.headers.get("content-type") || "application/pdf"
    );
    headers.set("cache-control", "no-store");

    const contentLength = pdfResponse.headers.get("content-length");
    if (contentLength) {
      headers.set("content-length", contentLength);
    }

    const fileName = safePdfPath.split("/").pop() || "article.pdf";
    headers.set("content-disposition", `inline; filename="${fileName}"`);

    return new Response(pdfResponse.body, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error("PDF proxy error:", error);
    return new Response("Failed to load PDF", { status: 500 });
  }
}
