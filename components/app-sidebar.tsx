"use client"

import {
  MessageSquare,
  FileText,
  History,
  BookOpen,
  FolderOpen,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

export type ViewType = "chat" | "documents" | "history" | "knowledge"

interface ChatSession {
  id: string
  title: string
  time: string
  isActive: boolean
}

interface AppSidebarProps {
  activeView: ViewType
  onViewChange: (view: ViewType) => void
  collapsed: boolean
  onToggleCollapse: () => void
  chatSessions: ChatSession[]
  onNewChat: () => void
  onSelectChat: (id: string) => void
  onDeleteChat: (id: string) => void
}

const navItems = [
  { id: "chat" as ViewType, label: "AI 对话", icon: MessageSquare },
  { id: "documents" as ViewType, label: "文档管理", icon: FileText },
  { id: "knowledge" as ViewType, label: "知识库", icon: BookOpen },
  { id: "history" as ViewType, label: "历史记录", icon: History },
]

export function AppSidebar({
  activeView,
  onViewChange,
  collapsed,
  onToggleCollapse,
  chatSessions,
  onNewChat,
  onSelectChat,
  onDeleteChat,
}: AppSidebarProps) {
  return (
    <aside
      className={cn(
        "fixed left-0 top-14 bottom-0 z-40 flex flex-col border-r border-border bg-sidebar transition-all duration-300",
        collapsed ? "w-16" : "w-60"
      )}
    >
      {/* New Chat Button */}
      <div className="p-3">
        {collapsed ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={onNewChat}
                size="icon"
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                aria-label="新建对话"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">新建对话</TooltipContent>
          </Tooltip>
        ) : (
          <Button
            onClick={onNewChat}
            className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            新建对话
          </Button>
        )}
      </div>

      <Separator />

      {/* Navigation */}
      <nav className="flex flex-col gap-1 p-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = activeView === item.id
          return collapsed ? (
            <Tooltip key={item.id}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => onViewChange(item.id)}
                  className={cn(
                    "flex h-10 w-full items-center justify-center rounded-lg text-sm transition-colors",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-primary font-medium"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                  )}
                  aria-label={item.label}
                  aria-current={isActive ? "page" : undefined}
                >
                  <Icon className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">{item.label}</TooltipContent>
            </Tooltip>
          ) : (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={cn(
                "flex h-10 w-full items-center gap-3 rounded-lg px-3 text-sm transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-primary font-medium"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="truncate">{item.label}</span>
            </button>
          )
        })}
      </nav>

      <Separator />

      {/* Chat Sessions List */}
      {!collapsed && (
        <div className="flex flex-1 flex-col overflow-hidden">
          <div className="flex items-center justify-between px-3 py-2">
            <span className="text-xs font-medium text-muted-foreground">
              最近对话
            </span>
            <FolderOpen className="h-3 w-3 text-muted-foreground" />
          </div>
          <ScrollArea className="flex-1 px-2">
            <div className="flex flex-col gap-0.5 pb-2">
              {chatSessions.map((session) => (
                <div
                  key={session.id}
                  className={cn(
                    "group flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors cursor-pointer",
                    session.isActive
                      ? "bg-sidebar-accent text-sidebar-foreground"
                      : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                  )}
                  onClick={() => onSelectChat(session.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      onSelectChat(session.id)
                    }
                  }}
                >
                  <MessageSquare className="h-3.5 w-3.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm">{session.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {session.time}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onDeleteChat(session.id)
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:text-destructive rounded"
                    aria-label={`删除对话: ${session.title}`}
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}

      {/* Collapse Toggle */}
      <div className="border-t border-border p-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={onToggleCollapse}
              className="flex h-9 w-full items-center justify-center rounded-lg text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground transition-colors"
              aria-label={collapsed ? "展开侧边栏" : "收起侧边栏"}
            >
              {collapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </button>
          </TooltipTrigger>
          <TooltipContent side="right">
            {collapsed ? "展开侧边栏" : "收起侧边栏"}
          </TooltipContent>
        </Tooltip>
      </div>
    </aside>
  )
}
