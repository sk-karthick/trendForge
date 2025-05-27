import AuthCard from "@/components/auth/AuthCard";
import useHydrate from "@/hooks/useHydrate";
import Image from "next/image";

export default function LoginPage() {
    useHydrate()

    return (
        <div className="relative h-screen w-full">
            <Image
            width={1920}
            height={1080}
                src="/images/forge-bg.jpg"
                alt="Background"
                className="absolute inset-0 h-full w-full object-cover z-0"
            />
            <div className="absolute inset-0 bg-black/60 z-10" />
            <div className="relative z-20 flex items-center justify-center h-full px-4">
                <AuthCard />
            </div>
        </div>
    );
}
