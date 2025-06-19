"use client"

import { Home, Users, Code, Rocket, LogOut } from "lucide-react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { useGetUser } from "@/utils/queries/getUser"
import { useSignOut } from "@/utils/auth/signOut"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from "@/components/ui/sidebar"


const navItems = [
  {
    title: "Home",
    url: "/",
    icon: Home,
  },
  {
    title: "Community",
    url: "/community",
    icon: Users,
  },
  {
    title: "Hackathons",
    url: "/hackathons",
    icon: Rocket,
  },
  {
    title: "Projects",
    url: "/projects",
    icon: Code,
  }
]

export function AppSidebar() {
  const pathname = usePathname()
  const { data: userData } = useGetUser()
  const { signOut, loading: signOutLoading } = useSignOut()
  const avatarUrl = userData?.user?.user_metadata?.avatar_url
  const fullName = userData?.user?.user_metadata?.full_name || 'Hack Clubber'
  const userEmail = userData?.user?.email || ''
  
  const handleSignOut = async () => {
    await signOut()
  }
  
  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <div className="flex flex-col items-center space-y-3">
          {avatarUrl ? (
            <img 
              src={avatarUrl} 
              alt="User avatar" 
              className="h-16 w-16 rounded-full object-cover border-2 border-[#ec3750]/50"
            />
          ) : (
            <div className="h-16 w-16 bg-gradient-to-br from-[#ec3750] to-[#ff9a9a] rounded-full flex items-center justify-center text-primary font-bold text-xl">
              {fullName.charAt(0)}
            </div>
          )}
          <div className="text-center">
            <h3 className="font-medium text-sm">{fullName}</h3>
            {userEmail && <p className="text-xs text-muted-foreground mt-1">{userEmail}</p>}
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent className="mt-2">
            <nav className="space-y-1 px-2">
              {navItems.map((item) => {
                const isActive = pathname === item.url || (item.url !== "/" && pathname.startsWith(item.url))

                return (
                  <Link 
                    key={item.title}
                    href={item.url} 
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-md text-sm w-full",
                      "transition-all duration-200 group",
                      isActive 
                        ? "bg-[#ec3750]/10 text-[#ec3750] font-medium" 
                        : "hover:bg-[#ec3750]/10 hover:text-[#ec3750]"
                    )}
                  >
                    <item.icon className={cn(
                      "h-4 w-4",
                      isActive 
                        ? "text-[#ec3750]" 
                        : "text-muted-foreground group-hover:text-[#ec3750]"
                    )} />
                    <span>{item.title}</span>
                  </Link>
                )
              })}
            </nav>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter className="mt-auto p-4">
        <button
          onClick={handleSignOut}
          disabled={signOutLoading}
          className="flex items-center justify-center gap-3 px-4 py-2.5 rounded-md text-sm font-medium text-primary-foreground bg-[#ec3750]/80 hover:bg-[#ec3750] transition-colors w-full disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <LogOut className="h-4 w-4" />
          <span>{signOutLoading ? 'Signing out...' : 'Sign out'}</span>
        </button>
      </SidebarFooter>
    </Sidebar>
  )
}
