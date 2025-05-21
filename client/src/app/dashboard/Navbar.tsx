"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "next-themes";
import { Input } from "@/components/ui/input";
import useAngleOneCredentials from "@/hooks/useAngleOneCredentials";
import { DialogDescription, DialogTitle } from "@radix-ui/react-dialog";

export default function Navbar() {
    const [open, setOpen] = useState(false);
    const { theme, setTheme } = useTheme();
    const [formData, setFormData] = useState({
        CLIENT_CODE: "",
        CLIENT_PASSWORD: "",
        MPIN: "",
        TOTP_SECRET: "",
        HISTORIC_API_KEY: "",
        REALTIME_API_KEY: "",
    });

    const handleThemeToggle = () => {
        setTheme(theme === "dark" ? "light" : "dark");
    };

    const angleLogin = useAngleOneCredentials();

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log(formData);
        angleLogin(formData);
    };

    return (
        <nav className="flex justify-between items-center px-6 py-4 bg-muted shadow-md">
            <h1 className="text-xl font-semibold">TrendForge</h1>
            <div className="flex items-center space-x-4">
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button variant="outline">AngleOne</Button>
                    </DialogTrigger>
                   
                    <DialogContent className="max-w-sm">
                        <DialogHeader className="mb-3">
                            <DialogTitle>Angle One</DialogTitle>
                        </DialogHeader>
                        <form method="POST" className="flex items-center justify-between flex-col gap-4 w-full ">
                            <div className="flex-0 w-full">
                                <Input placeholder="Client Code" name="CLIENT_CODE" value={formData.CLIENT_CODE} onChange={(e) => setFormData({...formData, CLIENT_CODE : e.target.value})}/>
                            </div>
                            <div className="flex-0 w-full">
                                <Input placeholder="Password" name="CLIENT_PASSWORD" value={formData.CLIENT_PASSWORD} onChange={(e) => setFormData({ ...formData, CLIENT_PASSWORD: e.target.value })} />
                            </div>
                            <div className="flex-0 w-full">
                                <Input placeholder="MPIN" name="MPIN" value={formData.MPIN} onChange={(e) => setFormData({ ...formData, MPIN: e.target.value })} />
                            </div>
                            <div className="flex-0 w-full">
                                <Input placeholder="TOTP Key" name="TOTP_SECRET" value={formData.TOTP_SECRET} onChange={(e) => setFormData({ ...formData, TOTP_SECRET: e.target.value })} />
                            </div>
                            <div className="flex-0 w-full">
                                <Input placeholder="Historic API Key" name="HISTORIC_API_KEY" value={formData.HISTORIC_API_KEY} onChange={(e) => setFormData({ ...formData, HISTORIC_API_KEY: e.target.value })} />
                            </div>
                            <div className="flex-0 w-full">
                                <Input placeholder="Realtime API Key" name="REALTIME_API_KEY" value={formData.REALTIME_API_KEY} onChange={(e) => setFormData({ ...formData, REALTIME_API_KEY: e.target.value })} />
                            </div>
                            <Button type="submit" className="w-full cursor-pointer" onClick={submit}>
                                Submit
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>

                <div className="flex items-center justify-between gap-2">
                    <Switch checked={theme === "dark"} onCheckedChange={handleThemeToggle} />
                </div>
            </div>
        </nav>
    );
}
