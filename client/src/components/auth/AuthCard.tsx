"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {Card, CardContent} from "@/components/ui/card";
import AuthForm from "./AuthForm";

export default function AuthCard() {
    const [mode, setMode] = useState<"login" | "register">("login");

    return (
        <Card className="w-full max-w-md backdrop-blur-xl bg-white/10 border-white/20 border shadow-2xl text-white rounded-2xl">
            <CardContent className="p-6">
                <h2 className="text-2xl font-bold mb-6 text-center capitalize">
                    {mode === "login" ? "Welcome Back" : "Create an Account"}
                </h2>
                <AuthForm mode={mode} />
                <div className="text-center mt-4">
                    <p className="text-sm">
                        {mode === "login"
                            ? "Don't have an account?"
                            : "Already have an account?"}{" "}
                        <Button
                            variant="link"
                            onClick={() => setMode(mode === "login" ? "register" : "login")}
                            className="text-blue-400 hover:underline px-0"
                        >
                            {mode === "login" ? "Register" : "Login"}
                        </Button>
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
