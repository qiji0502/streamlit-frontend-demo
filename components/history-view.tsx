"use client"

import {
  History,
  MessageSquare,
  Clock,
  Search,
  Trash2,
  ChevronRight,
  Calendar,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { useState } from "react"

interface ChatSession {
  id: string
  title: string
  time: string
  isActive: boolean
}

interface HistoryViewProps {
  sessions: ChatSession[]
  onSelectChat: (id: string) => void
  onDeleteChat: (id: string) => void
}

export function HistoryView({ sessions, onSelectChat, onDeleteChat }: HistoryViewProps) {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredSessions = sessions.filter((s) =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Group by date
  const today = filteredSessions.filter((s) => s.time.includes("分钟") || s.time.includes("小时") || s.time === "刚刚")
  const earlier = filteredSessions.filter((s) => !s.time.includes("分钟") && !s.time.includes("小时") && s.time !== "刚刚")

  return (
    <div className="flex h-full flex-col">
      <div className="p-4 pb-0">
        <h2 className="text-lg font-semibold text-foreground">历史记录</h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          共 {sessions.length} 条对话记录
        </p>
      </div>

      {/* Search */}
      <div className="px-4 py-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索对话历史..."
            className="h-9 w-full rounded-lg border border-border bg-muted/30 pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/30 transition-all"
          />
        </div>
      </div>

      <Separator />

      <ScrollArea className="flex-1">
        <div className="p-4 flex flex-col gap-4">
          {/* Today */}
          {today.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs font-medium text-muted-foreground">今天</span>
              </div>
              <div className="flex flex-col gap-1.5">
                {today.map((session) => (
                  <button
                    key={session.id}
                    onClick={() => onSelectChat(session.id)}
                    className={cn(
                      "group flex items-center gap-3 rounded-xl border border-border bg-card p-3 text-left hover:border-primary/30 hover:shadow-sm transition-all",
                      session.isActive && "border-primary/50 bg-blue-soft/10"
                    )}
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-soft shrink-0">
                      <MessageSquare className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">
                        {session.title}
                      </p>
                      <p className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                        <Clock className="h-3 w-3" />
                        {session.time}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onDeleteChat(session.id)
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-md text-muted-foreground hover:text-destructive transition-all"
                        aria-label="删除"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Earlier */}
          {earlier.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs font-medium text-muted-foreground">更早</span>
              </div>
              <div className="flex flex-col gap-1.5">
                {earlier.map((session) => (
                  <button
                    key={session.id}
                    onClick={() => onSelectChat(session.id)}
                    className="group flex items-center gap-3 rounded-xl border border-border bg-card p-3 text-left hover:border-primary/30 hover:shadow-sm transition-all"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-soft/50 shrink-0">
                      <MessageSquare className="h-4 w-4 text-[#9b8ec4]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">
                        {session.title}
                      </p>
                      <p className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                        <Clock className="h-3 w-3" />
                        {session.time}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onDeleteChat(session.id)
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-md text-muted-foreground hover:text-destructive transition-all"
                        aria-label="删除"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {filteredSessions.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12">
              <History className="h-10 w-10 text-muted-foreground/40" />
              <p className="mt-3 text-sm text-muted-foreground">
                {searchQuery ? "未找到匹配的对话" : "暂无对话历史"}
              </p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
