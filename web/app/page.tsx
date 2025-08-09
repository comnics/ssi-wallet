"use client";
import DidHeader from "@/components/DidHeader";
import Onboarding from "@/components/Onboarding";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <DidHeader />
      <main className="flex-1">
        <div className="max-w-3xl mx-auto p-6">
          <Onboarding />
        </div>
      </main>
    </div>
  );
}
