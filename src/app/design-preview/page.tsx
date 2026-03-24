import { notFound } from "next/navigation"
import { HeroDemo } from "@/components/hero-demo"

// Dev-only page — not accessible in production
export default function DesignPreviewPage() {
  if (process.env.NODE_ENV === "production") notFound()
  return (
    <main className="min-h-screen bg-background">
      <HeroDemo />
    </main>
  )
}
