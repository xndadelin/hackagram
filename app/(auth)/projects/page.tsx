"use client";

export default function Projects() {
  return (
    <>
      <h2 className="text-2xl font-bold mb-6">Projects</h2>
      
      <div className="space-y-6">
        <div className="bg-[#ec3750]/20 p-6 rounded-lg border border-[#ec3750]/30 hover:bg-[#ec3750]/25 transition-colors">
          <h3 className="text-lg font-medium mb-4">Your projects</h3>
          <p>You don't have any projects yet. Start creating!</p>
        </div>
        
        <div className="bg-[#ec3750]/20 p-6 rounded-lg border border-[#ec3750]/30 hover:bg-[#ec3750]/25 transition-colors">
          <h3 className="text-lg font-medium mb-4">Community projects</h3>
          <p>Discover amazing projects from the Hack Club community.</p>
        </div>
      </div>
    </>
  );
}
