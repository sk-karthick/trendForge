"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const useHydrate = () => {
    const router = useRouter();

    useEffect(() => {
        try {
            const token = localStorage.getItem("token") || sessionStorage.getItem("token");
            if (token) {
                router.push("/dashboard");
            } else {
                router.push("/auth");
            }
        } catch (error) {
            console.error("Error during hydration:", error);
        }
    }, [router]);
};

export default useHydrate;
