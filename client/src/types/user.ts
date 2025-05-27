export interface User {
    id: string;
    username: string;
    email: string;
    password: string;
    is_verified?: boolean;
    created_at: string;
    updated_at: string;
    refresh_token?: string;
    access_token?: string;
    is_admin?: boolean;
    profile_picture_url?: string;
}