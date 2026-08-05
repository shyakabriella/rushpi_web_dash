import {
  type NextRequest,
  NextResponse,
} from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ErrorPayload = {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
};

function getBackendApiUrl(): string | null {
  const configuredUrl =
    process.env.BACKEND_API_URL ??
    process.env.NEXT_PUBLIC_API_BASE_URL;

  if (!configuredUrl) {
    return null;
  }

  return configuredUrl.replace(/\/+$/, "");
}

function parsePayload(
  responseBody: string,
): unknown {
  if (!responseBody.trim()) {
    return null;
  }

  try {
    return JSON.parse(responseBody);
  } catch {
    return {
      success: false,
      message: responseBody,
    };
  }
}

export async function POST(
  request: NextRequest,
) {
  const backendApiUrl =
    getBackendApiUrl();

  if (!backendApiUrl) {
    const payload: ErrorPayload = {
      success: false,
      message:
        "The backend API URL is not configured.",
      errors: {
        configuration: [
          "Set BACKEND_API_URL in the Next.js environment file.",
        ],
      },
    };

    return NextResponse.json(
      payload,
      {
        status: 500,
      },
    );
  }

  let requestBody: unknown;

  try {
    requestBody = await request.json();
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "Invalid registration request.",
        errors: {
          request: [
            "The submitted request is not valid JSON.",
          ],
        },
      },
      {
        status: 400,
      },
    );
  }

  const controller =
    new AbortController();

  const timeout = setTimeout(
    () => controller.abort(),
    30000,
  );

  try {
    const backendResponse =
      await fetch(
        `${backendApiUrl}/register`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify(
            requestBody,
          ),
          signal: controller.signal,
          cache: "no-store",
        },
      );

    const responseBody =
      await backendResponse.text();

    const payload =
      parsePayload(responseBody);

    return NextResponse.json(
      payload ?? {
        success:
          backendResponse.ok,
        message:
          backendResponse.ok
            ? "Registration completed."
            : "Registration failed.",
      },
      {
        status:
          backendResponse.status,
      },
    );
  } catch (error) {
    console.error(
      "RushPi registration API error:",
      error,
    );

    const message =
      error instanceof Error &&
      error.name === "AbortError"
        ? "The registration service timed out."
        : "The registration service could not be reached.";

    return NextResponse.json(
      {
        success: false,
        message,
        errors: {
          connection: [
            "Check that the Laravel API is running and BACKEND_API_URL is correct.",
          ],
        },
      },
      {
        status: 502,
      },
    );
  } finally {
    clearTimeout(timeout);
  }
}
