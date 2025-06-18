import { createClient } from "@/lib/supabase/client"
import { useState } from "react"

export const useSignOut = () => {
   const [loading, setLoading] = useState(false)
   const [error, setError] = useState<string | null>(null)
   
   const signOut = async () => {
      setLoading(true)
      setError(null)
      
      try {
         const supabase = createClient()
         const { error: signOutError } = await supabase.auth.signOut()
         
         if (signOutError) {
            setError(signOutError.message)
            return { success: false, error: signOutError.message }
         }

         window.location.href = "/"
         
         return { success: true }
      } catch (e) {
         const errorMessage = e instanceof Error ? e.message : 'Unknown error occurred'
         setError(errorMessage)
         return { success: false, error: errorMessage }
      } finally {
         setLoading(false)
      }
   }
   
   return {
      loading,
      error,
      signOut
   }
}
