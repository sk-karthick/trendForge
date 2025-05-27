import { User } from "@/types/user";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UserState {
    user: User | null
}

const getUserData = (key: string): User | null => {
    const item = localStorage.getItem(key) || sessionStorage.getItem(key);
    if (item) {
        try {
            return JSON.parse(item) as User;
        } catch (error) {
            return null;
        }
    }
    return null;
};

const initialState: UserState = {
    user: getUserData("user-data") || null,
}

const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        setUser: (state, action: PayloadAction<User>) => {
            state.user = action.payload;
        },
        clearUser: (state) => {
            state.user = null;
        },
        setError: (state, action: PayloadAction<string>) => {
            console.error("Error:", action.payload);
        }
    },
});

export const { setUser, clearUser } = userSlice.actions;

export default userSlice.reducer;