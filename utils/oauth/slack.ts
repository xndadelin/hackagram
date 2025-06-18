import { createClient } from "@/lib/supabase/client"
import { useState } from "react"

export const useSlackAuth = () => {
   const [loading, setLoading] = useState(false)
   const [error, setError] = useState<string | null>(null)
   
   const signInWithSlack = async () => {
      setLoading(true)
      setError(null)
      
      try {
         const supabase = createClient()
         const { data, error: authError } = await supabase.auth.signInWithOAuth({
            provider: 'slack_oidc',
            options: {
               redirectTo: `${process.env.NEXT_PUBLIC_URL}`,
            }
         })
         
         if (authError) {
            setError(authError.message)
            return { success: false, error: authError.message }
         }
         
         return { success: true, data }
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
      signInWithSlack
   }
}