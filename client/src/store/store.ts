import { configureStore } from '@reduxjs/toolkit'
import userReducer from './userSlice'

export const store = configureStore({
    reducer: {
        user: userReducer,
        search : (state = "", action) => {
            switch (action.type) {
                case 'search/setSearch':
                    return action.payload;
                default:
                    return state;
            }
        }
    },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
