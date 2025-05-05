"use client"; // Add 'use client' because we are using hooks

import type { Metadata } from 'next';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { AppHeader } from '@/components/app-header';
import { useAuth } from '@/hooks/use-auth'; // Import useAuth
import { useRouter } from 'next/navigation'; // Import useRouter
import * as React from 'react';

// Metadata can still be defined, but might be less effective if route is client-rendered heavily
// export const metadata: Metadata = {
//   title: 'AttendEase Dashboard',
//   description: 'Manage attendance, students, and users.',
// };


export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
   const { user, loading } = useAuth();
   const router = useRouter();

    React.useEffect(() => {
        if (!loading && !user) {
        router.replace('/login'); // Redirect to login if not authenticated after loading
        }
    }, [user, loading, router]);


   if (loading || !user) {
        // Show a loading state or null while checking auth / redirecting
        return (
            <div className="flex h-screen items-center justify-center">
                <p>Loading user data...</p> {/* Or a spinner component */}
            </div>
        );
   }


  // If user is loaded and authenticated, render the layout
  return (
    <SidebarProvider defaultOpen={true}>
        <Sidebar>
            <AppSidebar />
        </Sidebar>
        <SidebarInset className="flex flex-col">
            <AppHeader />
            <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-secondary">
                {children}
            </main>
        </SidebarInset>
    </SidebarProvider>
  );
}
