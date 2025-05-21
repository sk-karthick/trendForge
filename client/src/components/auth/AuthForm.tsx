"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuthLogin, useAuthRegister } from "@/hooks/useAuth";
import { useState } from "react";
import LoadingSpinner from "../ui/loadingSpinner";

interface AuthFormProps {
    mode: "login" | "register";
}

export default function AuthForm({ mode }: AuthFormProps) {
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        name: "",
    });

    const { login, isLoggedIn, error, loading } = useAuthLogin();
    const { register, isRegistered, error: registerError, loading: registerLoading } = useAuthRegister();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (mode === "login") {
            await login(formData.email, formData.password);
        } else {
            await register(formData.email, formData.password, formData.name);
        }
    };

    return (
        <>
            {(loading || registerLoading) && <LoadingSpinner />}
            <form className="space-y-4" onSubmit={handleSubmit}>
                {mode === "register" && (
                    <Input
                        placeholder="Name"
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                        }
                    />
                )}

                <Input
                    placeholder="Email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                    }
                />

                <Input
                    placeholder="Password"
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                    }
                />

                <Button type="submit" className="w-full">
                    {mode === "login" ? "Login" : "Register"}
                </Button>

                {error && <p className="text-red-500">{error}</p>}
                {registerError && <p className="text-red-500">{registerError}</p>}

                {isLoggedIn && <p className="text-green-500">Logged in successfully!</p>}
                {isRegistered && <p className="text-green-500">Registered successfully!</p>}
            </form>
        </>
    );
}
