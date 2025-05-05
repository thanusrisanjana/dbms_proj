"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { LogOut, User, Home, CalendarCheck, Users, Settings, FileText, KeyRound, BookUser } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import * as React from 'react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth'; // Import useAuth
import { Skeleton } from '@/components/ui/skeleton'; // Import Skeleton


export function AppSidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const { toast } = useToast();
    const { state } = useSidebar();
    const { user, loading, logout } = useAuth(); // Use the auth hook

    const isActive = (path: string) => pathname === path;

    const handleLogout = () => {
        logout(); // Use logout from auth hook
        toast({
            title: "Logged Out",
            description: "You have been successfully logged out.",
        });
        router.push('/register'); // Redirect to register page
    };

    if (loading) {
        return (
             <>
                <SidebarHeader className="p-4 flex items-center gap-3">
                     <Skeleton className={cn("w-8 h-8 rounded-full transition-opacity duration-200", state === 'collapsed' && 'opacity-0')} />
                     <Skeleton className={cn("h-6 w-24 transition-opacity duration-200", state === 'collapsed' && 'opacity-0')} />
                </SidebarHeader>
                <Separator />
                <SidebarContent className="flex-1 p-4 space-y-2">
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                </SidebarContent>
                <Separator />
                <SidebarFooter className="p-4 flex flex-col gap-3">
                     <div className={cn("flex items-center gap-3 transition-opacity duration-200", state === 'collapsed' && 'opacity-0')}>
                         <Skeleton className="h-10 w-10 rounded-full" />
                         <div className="space-y-1">
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-3 w-28" />
                            <Skeleton className="h-3 w-12" />
                         </div>
                     </div>
                     <Skeleton className="h-9 w-full" />
                </SidebarFooter>
             </>
        );
    }

    if (!user) {
        // Handle case where user is not logged in (though layout should protect)
         // router.push('/register'); // Redirect if not logged in
         return null; // Or a loading state/message
    }


    return (
        <>
            <SidebarHeader className="p-4 flex items-center gap-3">
                 {/* Using KeyRound for consistency with login/register */}
                 <KeyRound className={cn("w-8 h-8 text-primary transition-opacity duration-200", state === 'collapsed' && 'opacity-0')}/>
                 <span className={cn("font-bold text-xl text-primary transition-opacity duration-200", state === 'collapsed' && 'opacity-0')}>AttendEase</span>

            </SidebarHeader>
            <Separator />
            <SidebarContent className="flex-1 p-4">
                <SidebarMenu>
                    {/* Common: Dashboard */}
                    <SidebarMenuItem>
                        <Link href="/dashboard" passHref>
                            <SidebarMenuButton isActive={isActive('/dashboard')} tooltip="Dashboard">
                                <Home className="mr-2" />
                                Dashboard
                            </SidebarMenuButton>
                        </Link>
                    </SidebarMenuItem>

                     {/* Teacher & Admin: Attendance Management */}
                     {(user.role === 'admin' || user.role === 'teacher') && (
                        <SidebarMenuItem>
                            <Link href="/attendance" passHref>
                                <SidebarMenuButton isActive={isActive('/attendance')} tooltip="Attendance">
                                    <CalendarCheck className="mr-2" />
                                    Attendance
                                </SidebarMenuButton>
                            </Link>
                        </SidebarMenuItem>
                     )}
                      {/* Student: View Own Attendance */}
                      {user.role === 'student' && (
                          <SidebarMenuItem>
                              <Link href="/attendance" passHref>
                                  <SidebarMenuButton isActive={isActive('/attendance')} tooltip="My Attendance">
                                      <CalendarCheck className="mr-2" />
                                      My Attendance
                                  </SidebarMenuButton>
                              </Link>
                          </SidebarMenuItem>
                      )}


                    {/* Teacher & Admin: Student Management (Admin has full CRUD) */}
                    {(user.role === 'admin' || user.role === 'teacher') && (
                         <SidebarMenuItem>
                            <Link href="/students" passHref>
                                <SidebarMenuButton isActive={isActive('/students')} tooltip="Students">
                                    <Users className="mr-2" />
                                    Students
                                </SidebarMenuButton>
                            </Link>
                        </SidebarMenuItem>
                    )}

                     {/* All Roles: Absence Explanations (Different views) */}
                     <SidebarMenuItem>
                        <Link href="/absences" passHref>
                            <SidebarMenuButton isActive={isActive('/absences')} tooltip="Absence Explanations">
                                <FileText className="mr-2" />
                                {user.role === 'student' ? 'My Absences' : 'Absence Explanations'}
                            </SidebarMenuButton>
                         </Link>
                    </SidebarMenuItem>

                    {/* Admin Only: User Management */}
                    {user.role === 'admin' && (
                         <SidebarMenuItem>
                            <Link href="/users" passHref>
                                <SidebarMenuButton isActive={isActive('/users')} tooltip="User Management">
                                    <Settings className="mr-2" />
                                    User Management
                                </SidebarMenuButton>
                            </Link>
                        </SidebarMenuItem>
                    )}

                     {/* Student Only: Profile (Example) */}
                    {user.role === 'student' && (
                         <SidebarMenuItem>
                            <Link href="/profile" passHref> {/* Example route */}
                                <SidebarMenuButton isActive={isActive('/profile')} tooltip="My Profile">
                                    <BookUser className="mr-2" />
                                    My Profile
                                </SidebarMenuButton>
                            </Link>
                        </SidebarMenuItem>
                    )}
                </SidebarMenu>
            </SidebarContent>
             <Separator />
            <SidebarFooter className="p-4 flex flex-col gap-3">
                <div className={cn("flex items-center gap-3 transition-opacity duration-200", state === 'collapsed' && 'opacity-0')}>
                     <Avatar className="h-10 w-10">
                       
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                     </Avatar>
                     <div>
                        <p className="font-semibold text-sm">{user.name}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                        <p className="text-xs text-primary font-medium">{user.role}</p>
                     </div>
                </div>

                 <Button variant="ghost" size="sm" className="w-full justify-start gap-2" onClick={handleLogout}>
                      <LogOut className="w-4 h-4"/>
                      <span className={cn("transition-opacity duration-200", state === 'collapsed' && 'opacity-0')}>Logout</span>
                </Button>
            </SidebarFooter>
        </>
    );
}
