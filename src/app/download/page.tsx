import {
  Download,
  ShieldCheck,
  Smartphone,
} from "lucide-react";
import Link from "next/link";

export default function DownloadPage() {
  return (
    <main className="min-h-screen bg-[#f6f8fb]">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-5 sm:px-8">
          <Link
            href="/"
            className="text-xl font-bold text-[#062F63]"
          >
            NTEZINET
          </Link>

          <Link
            href="/"
            className="text-sm font-semibold text-slate-600 hover:text-[#062F63]"
          >
            Back to website
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-5 py-14 sm:px-8 sm:py-20">
        <div className="mx-auto max-w-xl">
          <div className="mb-6 flex size-14 items-center justify-center rounded-xl bg-[#062F63] text-white">
            <Smartphone className="size-7" />
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-[#031B38] sm:text-4xl">
            NTEZINET for Android
          </h1>

          <p className="mt-4 text-base leading-7 text-slate-600">
            Download the official NTEZINET Android application.
          </p>

          <a
            href="/downloads/ntezinet.apk"
            download
            className="mt-8 inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-[#FF5A00] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#e65000]"
          >
            <Download className="size-5" />
            Download Android App
          </a>

          <div className="mt-8 border-t border-slate-200 pt-7">
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 size-5 shrink-0 text-green-700" />

              <div>
                <p className="font-semibold text-[#031B38]">
                  Official NTEZINET download
                </p>

                <p className="mt-1 text-sm leading-6 text-slate-600">
                  This application is distributed directly through the
                  official RushPi / NTEZINET website.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <h2 className="text-lg font-bold text-[#031B38]">
              Installation
            </h2>

            <ol className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
              <li>
                1. Tap <strong>Download Android App</strong>.
              </li>

              <li>
                2. Open the downloaded APK file.
              </li>

              <li>
                3. If Android asks, allow your browser to install apps from
                this source.
              </li>

              <li>
                4. Tap <strong>Install</strong>.
              </li>
            </ol>
          </div>

          <p className="mt-10 text-xs text-slate-500">
            Android application · NTEZINET
          </p>
        </div>
      </section>
    </main>
  );
}
