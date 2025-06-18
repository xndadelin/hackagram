"use client";

import { useEffect } from 'react';
import { useSignOut } from '@/utils/auth/signOut';
import { Loading } from '@/components/Loading';

export default function LogoutPage() {
  const { signOut, loading, error } = useSignOut();
  
  useEffect(() => {
    const performSignOut = async () => {
      await signOut();
    };
    
    performSignOut();
  }, [signOut]);
  
  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-black via-[#20080a] to-[#2c0915]">
        <div className="w-full max-w-md p-8 space-y-8 rounded-xl bg-gray-800/50 backdrop-blur-sm border border-gray-700">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white mb-2">Sign Out Error</h1>
            <div className="h-1 w-20 bg-[#ec3750] mx-auto rounded-full mb-6"></div>
            <p className="text-red-400 mb-4">{error}</p>
            <button 
              onClick={() => window.location.href = '/'}
              className="bg-[#ec3750] hover:bg-[#ec3750]/60 text-white py-2 px-4 rounded-md"
            >
              Return to Home
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-black via-[#20080a] to-[#2c0915]">
      <Loading text="Signing out" />
    </div>
  );
}
