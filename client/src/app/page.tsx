"use client"
import LoginPage from "./login/page";
import useHydrate from "@/hooks/useHydrate";

export default function Home() {
  useHydrate()

  return (
  <>
    <LoginPage />
  </>
  );
}
