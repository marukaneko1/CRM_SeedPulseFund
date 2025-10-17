"use client"

import { DealAssistChat } from "@/components/ai/deal-assist-chat"

export default function DealAssistPage() {
  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-y-auto">
      <DealAssistChat />
    </div>
  )
}
