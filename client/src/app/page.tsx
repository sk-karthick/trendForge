"use client"
import LoginPage from "./login/page";
import useHydrate from "@/hooks/useHydrate";
import { store } from "@/store/store";
import { Provider } from "react-redux";

export default function Home() {

  return (
    <>
      <Provider store={store}>
        <LoginPage />
      </Provider>
    </>
  );
}
