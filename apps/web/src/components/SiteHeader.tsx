"use client";
import { Moon, SunMedium } from "lucide-react";
import { useTheme } from "next-themes";

export default function SiteHeader() {
    const { theme, setTheme } = useTheme();
    return (
        <header className="sticky top-0 z-20 backdrop-blur border-b border-neutral-200/60 dark:border-neutral-800 bg-white/60 dark:bg-neutral-950/60">
            <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
                <div className="font-semibold tracking-wide">Stock Dashboard</div>
                <button
                    onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                    className="rounded-full p-2 hover:bg-neutral-200/60 dark:hover:bg-neutral-800"
                    aria-label="Toggle theme"
                >
                    <SunMedium className="hidden dark:inline h-5 w-5" />
                    <Moon className="inline dark:hidden h-5 w-5" />
                </button>
            </div>
        </header>
    );
}
