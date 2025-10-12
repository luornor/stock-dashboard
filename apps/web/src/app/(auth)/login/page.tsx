import GoogleLoginButton from "@/components/GoogleLoginButton";
import { Lock, Zap, ChartLine, CheckCircle2 } from "lucide-react";

export default function LoginPage() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(37,99,235,0.25),transparent_60%)] blur-2xl" />
        <div className="absolute -bottom-40 -right-20 h-[28rem] w-[28rem] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.18),transparent_60%)] blur-2xl" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom_right,rgba(255,255,255,0.06),transparent)] dark:bg-[linear-gradient(to_bottom_right,rgba(0,0,0,0.3),transparent)]" />
      </div>

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-6 py-12 md:grid-cols-2 md:items-center md:py-16 lg:py-20">
        {/* Left: brand + copy + CTA */}
        <section>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-neutral-200/60 px-3 py-1 text-xs text-neutral-600 dark:border-neutral-800 dark:text-neutral-300">
            <Zap className="h-3.5 w-3.5 text-brand" />
            Real-time stock dashboard
          </div>

          <h1 className="text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
            Track the market <span className="text-brand">live</span> with a
            polished, fast UI.
          </h1>

          <p className="mt-4 max-w-xl text-base text-neutral-600 dark:text-neutral-300">
            One secure sign-in. Sub-second updates. Beautiful charts. Build your
            watchlists and price alerts in minutes.
          </p>

          <ul className="mt-6 grid gap-3 text-sm text-neutral-600 dark:text-neutral-300">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-500" />
              Google-only authentication — no passwords to manage
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-500" />
              Live quotes via WebSockets
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-500" />
              Clean, responsive interface (dark mode ready)
            </li>
          </ul>

          <div className="mt-8">
            <GoogleLoginButton />
            <p className="mt-3 flex items-center gap-2 text-xs text-neutral-500">
              <Lock className="h-3.5 w-3.5" />
              We only use your email to create your account.
            </p>
          </div>
        </section>

        {/* Right: preview card */}
        <aside className="relative">
          <div className="card mx-auto max-w-lg p-5">
            <header className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-brand/15 text-brand">
                  <ChartLine className="h-4 w-4" />
                </span>
                <div>
                  <div className="text-sm font-medium">AAPL</div>
                  <div className="text-xs text-neutral-500">Apple Inc.</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-semibold">229.15</div>
                <div className="text-xs text-emerald-600">+0.84%</div>
              </div>
            </header>

            {/* simple sparkline */}
            <div className="h-24 w-full">
              <svg viewBox="0 0 400 100" className="h-full w-full">
                <defs>
                  <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopOpacity="0.35" />
                    <stop offset="100%" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path
                  d="M0,70 C40,60 80,80 120,50 C160,20 200,40 240,30 C280,20 320,40 360,25"
                  className="stroke-current"
                  strokeWidth="2"
                  fill="none"
                />
                <path
                  d="M0,70 C40,60 80,80 120,50 C160,20 200,40 240,30 C280,20 320,40 360,25 L360,100 L0,100 Z"
                  fill="url(#g)"
                />
              </svg>
            </div>

            {/* preview grid */}
            <div className="mt-5 grid grid-cols-2 gap-3">
              {[
                { s: "MSFT", p: "415.02", c: "+0.42%" },
                { s: "GOOGL", p: "142.77", c: "-0.18%" },
                { s: "AMZN", p: "178.01", c: "+0.91%" },
                { s: "NVDA", p: "894.33", c: "+1.12%" },
              ].map((x) => (
                <div key={x.s} className="rounded-xl border border-neutral-200/60 p-3 text-sm dark:border-neutral-800">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{x.s}</span>
                    <span className={x.c.startsWith("-") ? "text-red-600" : "text-emerald-600"}>{x.c}</span>
                  </div>
                  <div className="mt-1 text-base font-semibold">{x.p}</div>
                </div>
              ))}
            </div>
          </div>

          {/* floating badge */}
          <div className="absolute -left-5 -top-5 hidden rounded-full bg-white/80 px-3 py-1 text-xs shadow-soft backdrop-blur dark:bg-neutral-900/70 md:block">
            Demo preview
          </div>
        </aside>
      </div>

      {/* footer */}
      <footer className="mt-6 px-6 pb-8 text-center text-xs text-neutral-500">
        © {new Date().getFullYear()} Stock Dashboard — Built with Django, Channels & Next.js
      </footer>
    </main>
  );
}
