"use client";

import { useGetUser } from '@/utils/queries/getUser';
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { useEffect } from 'react';
import { Loading } from '@/components/Loading';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: userData, isLoading } = useGetUser();
  
  useEffect(() => {
    if (!isLoading && !userData?.user) {
      window.location.href = '/';
    }
  }, [userData, isLoading]);
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-black via-[#20080a] to-[#2c0915]">
        <Loading text="Hackagram" />
      </div>
    );
  }
  
  if (!userData?.user) {
    return null;
  }
  
  return (
    <SidebarProvider>
      <div className="grid grid-cols-[auto_1fr] min-h-screen">
        <AppSidebar />
        <main className="flex flex-col p-6">
          <div className="flex items-center mb-6 gap-2">
            <SidebarTrigger />
            <div className="h-5 w-px bg-border" />
            <h1 className="text-xl font-medium">Hackagram</h1>
          </div>
          
          <div className="max-w-4xl">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
