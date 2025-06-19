"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { useGetUser } from "@/utils/queries/getUser";
import { Loader2, Save } from "lucide-react";

export default function ProfileSettings() {
  const router = useRouter();
  const { data: userData, isLoading } = useGetUser();
  
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState({
    full_name: "",
    bio: "",
    website: ""
  });

  useEffect(() => {
    if (!userData?.user?.id) return;
    
    const createClient = require('@/lib/supabase/client').createClient;
    const supabase = createClient();
    
    async function fetchUserProfile() {
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userData?.user?.id || '')
          .single();
          
        if (error) {
          console.error("error fetching user profile:", error);
          return;
        }

        setProfileData({
          full_name: data?.full_name || userData?.user?.user_metadata?.full_name || "",
          bio: data?.bio || "",
          website: data?.website || ""
        });
      } catch (error) {
        console.error("error loading profile:", error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchUserProfile();
  }, [userData?.user?.id, userData?.user?.user_metadata]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userData?.user?.id) {
      return;
    }
    
    try {
      setIsSubmitting(true);
      const createClient = require('@/lib/supabase/client').createClient;
      const supabase = createClient();
      
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: userData.user.id,
          full_name: profileData.full_name,
          bio: profileData.bio,
          website: profileData.website,
          updated_at: new Date().toISOString()
        });
        
      if (error) throw error;
      
      router.push(`/profile/${userData.user.id}`);
      
    } catch (error) {
      console.error("error updating profile:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || loading) {
    return (
      <SidebarProvider>
        <div className="grid grid-cols-[auto_1fr] w-full min-h-screen">
          <AppSidebar />
          <main className="flex flex-col items-center p-6">
            <div className="w-full max-w-4xl flex items-center mb-6 gap-2">
              <SidebarTrigger />
              <div className="h-5 w-px bg-border" />
              <h1 className="text-xl font-medium">Edit Profile</h1>
            </div>
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ec3750]"></div>
            </div>
          </main>
        </div>
      </SidebarProvider>
    );
  }

  if (!userData?.user) {
    router.push("/");
    return null;
  }

  return (
    <SidebarProvider>
      <div className="grid grid-cols-[auto_1fr] w-full min-h-screen">
        <AppSidebar />
        <main className="flex flex-col items-center p-6">
          <div className="w-full max-w-4xl flex items-center mb-6 gap-2">
            <SidebarTrigger />
            <div className="h-5 w-px bg-border" />
            <h1 className="text-xl font-medium">Edit Profile</h1>
          </div>
          
          <div className="w-full max-w-2xl">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex items-center space-x-4 mb-8">
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-border">
                  <img 
                    src={userData.user?.user_metadata?.avatar_url || "https://assets.hackclub.com/flag-standalone.svg"} 
                    alt={`${userData.user?.user_metadata?.full_name}'s avatar`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h2 className="text-lg font-medium">{userData.user?.user_metadata?.full_name}</h2>
                  <p className="text-sm text-muted-foreground">Profile photo is based on your Slack account</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Name</Label>
                  <Input 
                    id="fullName"
                    value={profileData.full_name}
                    onChange={(e) => setProfileData({...profileData, full_name: e.target.value})}
                    placeholder="Your name"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea 
                    id="bio"
                    value={profileData.bio}
                    onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                    placeholder="Tell us about yourself..."
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input 
                    id="website"
                    value={profileData.website}
                    onChange={(e) => setProfileData({...profileData, website: e.target.value})}
                    placeholder="https://yourwebsite.com"
                    type="url"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => router.push(`/profile/${userData?.user?.id}`)}
                  className="mr-2"
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  className="bg-[#ec3750] hover:bg-[#ec3750]/90 text-white"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
