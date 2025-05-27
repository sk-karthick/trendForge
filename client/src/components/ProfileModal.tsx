import { Avatar, AvatarFallback, AvatarImage } from '@radix-ui/react-avatar'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@radix-ui/react-dropdown-menu'
import { Popover, PopoverContent, PopoverPortal, PopoverTrigger } from '@radix-ui/react-popover';
import { LogOut } from 'lucide-react'
import React from 'react'
import { useSelector } from 'react-redux';
import { Button } from './ui/button';
import { useAuthLogout } from '@/hooks/useAuth';

interface RootState {
    user: {
        user: {
            profile_picture_url?: string;
            username?: string;
            email?: string;
        } | null;
    };
}

const ProfileModal = () => {
    const user = useSelector((state: RootState) => state.user.user);
    const { logout, loading } = useAuthLogout();

    return (
        <Popover>
            <PopoverTrigger asChild >
                <Avatar className="relative w-10 h-10 rounded-full flex items-center justify-items-center shadow-lg cursor-pointer">
                    <AvatarImage src={user?.profile_picture_url} alt="NeuroTrade Logo"></AvatarImage>
                    <AvatarFallback className="text-[#FFD700] font-bold text-lg p-2 bg-accent-foreground rounded-full w-[40px] h-[40px] flex items-center justify-center capitalize">
                        {user?.username?.charAt(0)}
                    </AvatarFallback>
                </Avatar>
            </PopoverTrigger>
            <PopoverPortal>
                <PopoverContent className="w-84 p-5 bg-accent border-4 rounded-xl" align="end">
                    <div className='flex items-center gap-5'>
                        <Avatar className="relative w-15 h-15 rounded-full flex items-center justify-items-center shadow-lg">
                            <AvatarImage src={user?.profile_picture_url} alt="NeuroTrade Logo"></AvatarImage>
                            <AvatarFallback className="text-[#FFD700] font-bold text-4xl p-2 bg-accent-foreground rounded-full w-[60px] h-[60px] flex items-center justify-center capitalize">
                                {user?.username?.charAt(0)}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                            <span className="font-medium">{user?.username}</span>
                            <span className="text-sm text-muted-foreground">{user?.email}</span>
                        </div>
                    </div>
                    <div>
                        
                    </div>
                    <Button variant="outline" className="w-full mt-4" onClick={() => logout()} disabled={loading}>
                        <LogOut className="mr-2 h-4 w-4" />
                        Logout
                    </Button>
                </PopoverContent>
            </PopoverPortal>
        </Popover>
    )
}

export default ProfileModal