"use client";

import { SidebarTrigger, useSidebar } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { LogOut, User as UserIcon } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth'; // Import useAuth
import { Skeleton } from '@/components/ui/skeleton'; // Import Skeleton
import type { User } from '@/types/user';



export function AppHeader() {
    const { isMobile } = useSidebar();
    const router = useRouter();
    const { toast } = useToast();
    const { user, loading, logout } = useAuth(); // Use the auth hook

    const handleLogout = () => {
        logout(); // Use logout from auth hook
        toast({
            title: "Logged Out",
            description: "You have been successfully logged out.",
        });
        router.push('/register'); // Redirect to register page
    };

    return (
        <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-4 sm:h-16 sm:px-6 backdrop-blur-sm bg-background/80">
            {/* Sidebar Trigger - Only show on mobile */}
            {isMobile && <SidebarTrigger />}

            <div className="flex-1">
                {/* Placeholder for Breadcrumbs or Page Title */}
                {/* <h1 className="text-lg font-semibold">Dashboard</h1> */}
            </div>

             {loading ? (
                <Skeleton className="h-10 w-10 rounded-full" />
            ) : user ? (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                            <Avatar className="h-9 w-9">
                                
                                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <span className="sr-only">Toggle user menu</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel className="font-normal">
                            <div className="flex flex-col space-y-1">
                                <p className="text-sm font-medium leading-none">{user.name}</p>
                                <p className="text-xs leading-none text-muted-foreground">
                                    {user.email}
                                </p>
                                <p className="text-xs font-medium text-primary">{user.role}</p>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem disabled> {/* Disable profile link for now */}
                            <UserIcon className="mr-2 h-4 w-4" />
                            <span>Profile</span>
                            {/* Add Link or onClick handler for profile page */}
                            {/* <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut> */}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleLogout}>
                            <LogOut className="mr-2 h-4 w-4" />
                            <span>Log out</span>
                            {/* <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut> */}
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
             ) : (
                // Optional: Render something if user is somehow null after loading (e.g., a login button)
                 <Button variant="outline" size="sm" onClick={() => router.push('/login')}>Login</Button>
             )}
        </header>
    );
}
