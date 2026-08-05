import Link from "next/link";

export default function RegisterPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
      <section className="w-full max-w-lg rounded-3xl bg-white p-8 text-center shadow-xl">
        <h1 className="text-3xl font-black text-slate-950">
          Create your RushPi account
        </h1>

        <p className="mt-4 text-slate-600">
          The complete registration form will be created next.
        </p>

        <Link
          href="/login"
          className="mt-7 inline-flex rounded-full bg-blue-700 px-6 py-3 font-black text-white"
        >
          Return to sign in
        </Link>
      </section>
    </main>
  );
}
