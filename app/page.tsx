"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Navbar from "@/components/navbar"

export default function Home() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    router.push("/dashboard")
  }, [router])

  if (!mounted) return null

  return (
    <main>
      <Navbar />
    </main>
  )
}
