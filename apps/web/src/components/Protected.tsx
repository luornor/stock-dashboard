"use client";
import { useEffect, useState } from "react";

export default function Protected({ children }: { children: React.ReactNode }) {
    const [ok, setOk] = useState(false);

    useEffect(() => {
        const access = localStorage.getItem("access");
        if (!access) {
            window.location.href = "/login";
        } else {
            setOk(true);
        }
    }, []);

    if (!ok) return null;
    return <>{children}</>;
}