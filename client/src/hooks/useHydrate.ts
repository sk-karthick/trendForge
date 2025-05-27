"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { setUser } from "@/store/userSlice";

const useHydrate = () => {
    const router = useRouter();
    const dispatch = useDispatch();

    useEffect(() => {
        try {
            const token = localStorage.getItem("token") || sessionStorage.getItem("token");
            const userData = localStorage.getItem("user-data");
          
            if (userData) {
                console.log("Hydrating user data from localStorage:", userData);
                const user = JSON.parse(userData);
                if(user){
                    dispatch(setUser(user));
                }
            }
 
            if (token) {
                router.push("/dashboard");
            } else {
                router.push("/");
            }
        } catch (error) {
            console.error("Error during hydration:", error);
        }
    }, [router]);
};

export default useHydrate;
