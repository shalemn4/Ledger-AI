"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ReplayWorkspace } from "@/components/replay-workspace";
import { useWorkspaceStore } from "@/lib/workspace-store";
import { Loader2 } from "lucide-react";

export default function WorkspacePage() {
  const router = useRouter();
  const { user } = useWorkspaceStore();

  useEffect(() => {
    if (!user) {
      router.push("/auth");
    }
  }, [user, router]);

  if (!user) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-[#f8f6f2] gap-3">
        <Loader2 className="animate-spin h-6 w-6 text-[#8b7ca4]" />
        <p className="text-[11px] font-semibold text-[#6f6c66]">Redirecting to sign in...</p>
      </div>
    );
  }

  return <ReplayWorkspace />;
}
