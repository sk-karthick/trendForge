import { useRouter } from "next/navigation";
import { useState } from "react";

type AuthResponse = {
    success: boolean;
    message: string;
    token?: string;
};

export const useAuthLogin = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const login = async (email: string, password: string): Promise<AuthResponse | void> => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(process.env.NEXT_PUBLIC_LOGIN_API!, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password_hash: password }),
            });

            const data: AuthResponse = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Login failed");
            }

            setIsLoggedIn(true);
            localStorage.setItem("token", data.token || "");
            sessionStorage.setItem("token", data.token || "");
            router.push("/dashboard");
            
            return data;
        } catch (err: any) {
            setError(err.message || "An error occurred during login.");
        } finally {
            setLoading(false);
        }
    };

    return { login, isLoggedIn, error, loading };
};

export const useAuthRegister = () => {
    const [isRegistered, setIsRegistered] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const register = async (email: string, password: string, name: string): Promise<AuthResponse | void> => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(process.env.NEXT_PUBLIC_REGISTER_API!, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password_hash: password, name }),
            });

            const data: AuthResponse = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Registration failed");
            }

            setIsRegistered(true);
            return data;
        } catch (err: any) {
            setError(err.message || "An error occurred during registration.");
        } finally {
            setLoading(false);
        }
    };

    return { register, isRegistered, error, loading };
};
