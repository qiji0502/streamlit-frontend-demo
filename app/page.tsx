"use client"

import { useState, useCallback } from "react"
import { TopNav } from "@/components/top-nav"
import { AppSidebar, type ViewType } from "@/components/app-sidebar"
import { ChatInterface, type ChatMessage } from "@/components/chat-interface"
import { FileUpload, type UploadedFile } from "@/components/file-upload"
import { DocumentManager } from "@/components/document-manager"
import { ExportPanel } from "@/components/export-panel"
import { KnowledgeBase } from "@/components/knowledge-base"
import { HistoryView } from "@/components/history-view"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

const AI_RESPONSES = [
  "根据您上传的文档，我已经完成了初步分析。以下是文档的主要内容摘要：\n\n**核心要点：**\n1. 文档涵盖了项目的整体架构设计方案\n2. 关键技术选型包括微服务架构和云原生部署\n3. 数据库采用分布式存储方案\n\n**详细分析：**\n文档中提出的方案具有较好的可扩展性，但在高并发场景下可能需要考虑额外的缓存策略。建议在实施前进行压力测试。\n\n如需进一步分析特定章节，请告诉我。",
  "我已经仔细阅读了您的文档内容。以下是关键信息提取结果：\n\n**文档类型：** 技术报告\n**主要主题：** 系统性能优化\n\n**关键发现：**\n- 当前系统响应时间平均为 320ms\n- 数据库查询占总延迟的 65%\n- 缓存命中率仅为 42%\n\n**优化建议：**\n1. 引入 Redis 缓存层，预计可将响应时间降低 40%\n2. 优化 SQL 查询，使用索引覆盖\n3. 实施读写分离策略\n\n需要我对某个方面进行更深入的分析吗？",
  "文档总结已完成。这是一份关于产品需求的文档，以下是结构化摘要：\n\n**项目概述：**\n该项目旨在构建一个智能文档管理平台，支持多格式文件的上传、解析和智能分析。\n\n**功能需求（按优先级）：**\n- P0：文档上传与预览\n- P0：AI 智能摘要生成\n- P1：多人协作编辑\n- P1：版本历史管理\n- P2：自定义分析模板\n\n**非功能需求：**\n- 响应时间 < 2 秒\n- 支持 10 万级文档存储\n- 99.9% 可用性\n\n您还有什么问题吗？",
]

export default function HomePage() {
  const [activeView, setActiveView] = useState<ViewType>("chat")
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [activeChatId, setActiveChatId] = useState("chat-1")

  // Select mode for copy/quote
  const [selectMode, setSelectMode] = useState<"copy" | "quote" | null>(null)
  const [selectedMessageIds, setSelectedMessageIds] = useState<Set<string>>(new Set())

  const [chatSessions, setChatSessions] = useState([
    { id: "chat-1", title: "新对话", time: "刚刚", isActive: true },
  ])

  // Handle file upload
  const handleFilesUploaded = useCallback((newFiles: UploadedFile[]) => {
    setUploadedFiles((prev) => {
      const updated = [...prev]
      newFiles.forEach((nf) => {
        const existingIndex = updated.findIndex((f) => f.id === nf.id)
        if (existingIndex >= 0) {
          updated[existingIndex] = nf
        } else {
          updated.push(nf)
        }
      })
      return updated
    })
  }, [])

  const handleRemoveFile = useCallback((id: string) => {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== id))
  }, [])

  // Handle chat
  const handleSendMessage = useCallback(
    (content: string) => {
      if (!content.trim()) return

      const attachedFiles = uploadedFiles
        .filter((f) => f.status === "success")
        .map((f) => ({ name: f.name, type: f.type }))

      const userMessage: ChatMessage = {
        id: `msg-${Date.now()}`,
        role: "user",
        content,
        timestamp: new Date(),
        files: attachedFiles.length > 0 ? attachedFiles : undefined,
      }

      setMessages((prev) => [...prev, userMessage])
      setIsLoading(true)

      if (messages.length === 0) {
        setChatSessions((prev) =>
          prev.map((s) =>
            s.id === activeChatId
              ? { ...s, title: content.slice(0, 20) + (content.length > 20 ? "..." : "") }
              : s
          )
        )
      }

      setTimeout(() => {
        const responseIndex = Math.floor(Math.random() * AI_RESPONSES.length)
        const aiMessage: ChatMessage = {
          id: `msg-${Date.now()}-ai`,
          role: "assistant",
          content: AI_RESPONSES[responseIndex],
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, aiMessage])
        setIsLoading(false)
      }, 1500 + Math.random() * 1500)
    },
    [uploadedFiles, messages.length, activeChatId]
  )

  const handleStopGenerating = useCallback(() => {
    setIsLoading(false)
  }, [])

  // Chat session management
  const handleNewChat = useCallback(() => {
    const newId = `chat-${Date.now()}`
    setChatSessions((prev) => [
      { id: newId, title: "新对话", time: "刚刚", isActive: true },
      ...prev.map((s) => ({ ...s, isActive: false })),
    ])
    setActiveChatId(newId)
    setMessages([])
    setActiveView("chat")
  }, [])

  const handleSelectChat = useCallback((id: string) => {
    setChatSessions((prev) =>
      prev.map((s) => ({ ...s, isActive: s.id === id }))
    )
    setActiveChatId(id)
    setActiveView("chat")
  }, [])

  const handleDeleteChat = useCallback(
    (id: string) => {
      setChatSessions((prev) => {
        const filtered = prev.filter((s) => s.id !== id)
        if (filtered.length === 0) {
          return [{ id: `chat-${Date.now()}`, title: "新对话", time: "刚刚", isActive: true }]
        }
        if (id === activeChatId) {
          filtered[0].isActive = true
          setActiveChatId(filtered[0].id)
          setMessages([])
        }
        return filtered
      })
    },
    [activeChatId]
  )

  const handleAnalyzeFile = useCallback(
    (fileId: string) => {
      const file = uploadedFiles.find((f) => f.id === fileId)
      if (file) {
        setActiveView("chat")
        handleSendMessage(`请分析文件「${file.name}」的内容并生成摘要`)
      }
    },
    [uploadedFiles, handleSendMessage]
  )

  // Select mode handlers for copy/quote
  const handleEnterSelectMode = useCallback((mode: "copy" | "quote") => {
    setSelectMode(mode)
    setSelectedMessageIds(new Set())
  }, [])

  const handleToggleMessageSelect = useCallback((id: string) => {
    setSelectedMessageIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }, [])

  const handleCancelSelect = useCallback(() => {
    setSelectMode(null)
    setSelectedMessageIds(new Set())
  }, [])

  const handleConfirmSelect = useCallback(() => {
    const selectedMsgs = messages.filter((m) => selectedMessageIds.has(m.id))
    if (selectedMsgs.length === 0) return

    if (selectMode === "copy") {
      const text = selectedMsgs
        .map((m) => {
          const role = m.role === "user" ? "用户" : "AI 助手"
          return `${role}:\n${m.content}`
        })
        .join("\n\n---\n\n")
      navigator.clipboard.writeText(text)
    } else if (selectMode === "quote") {
      const quoteText = selectedMsgs
        .map((m) => {
          const role = m.role === "user" ? "用户" : "AI 助手"
          return `> ${role}:\n> ${m.content.split("\n").join("\n> ")}`
        })
        .join("\n\n")
      navigator.clipboard.writeText(quoteText)
    }

    setSelectMode(null)
    setSelectedMessageIds(new Set())
  }, [messages, selectedMessageIds, selectMode])

  const viewLabels: Record<ViewType, string> = {
    chat: "AI 对话",
    documents: "文档管理",
    knowledge: "知识库",
    history: "历史记录",
  }

  return (
    <div className="flex h-screen flex-col bg-background">
      <TopNav />

      <div className="flex flex-1 pt-14">
        <AppSidebar
          activeView={activeView}
          onViewChange={setActiveView}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          chatSessions={chatSessions}
          onNewChat={handleNewChat}
          onSelectChat={handleSelectChat}
          onDeleteChat={handleDeleteChat}
        />

        <main
          className={cn(
            "flex flex-1 flex-col transition-all duration-300",
            sidebarCollapsed ? "ml-16" : "ml-60"
          )}
        >
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 border-b border-border bg-card px-6 py-2">
            <span className="text-xs text-muted-foreground">智析 AI</span>
            <span className="text-xs text-muted-foreground">/</span>
            <span className="text-xs font-medium text-primary">
              {viewLabels[activeView]}
            </span>
          </div>

          {/* Content Area */}
          <div className="flex flex-1 overflow-hidden">
            {/* Chat View */}
            {activeView === "chat" && (
              <div className="flex flex-1 overflow-hidden">
                <div className="flex flex-1 flex-col overflow-hidden">
                  <ChatInterface
                    messages={messages}
                    onSendMessage={handleSendMessage}
                    isLoading={isLoading}
                    onStopGenerating={handleStopGenerating}
                    uploadedFiles={uploadedFiles}
                    selectMode={selectMode}
                    selectedMessageIds={selectedMessageIds}
                    onToggleMessageSelect={handleToggleMessageSelect}
                    onCancelSelect={handleCancelSelect}
                    onConfirmSelect={handleConfirmSelect}
                  />
                </div>

                {/* Right Panel: Upload + Export */}
                <div className="hidden lg:flex w-80 flex-col border-l border-border bg-card overflow-y-auto">
                  <div className="p-4">
                    <h3 className="text-sm font-semibold text-foreground mb-3">
                      文件上传
                    </h3>
                    <FileUpload
                      onFilesUploaded={handleFilesUploaded}
                      uploadedFiles={uploadedFiles}
                      onRemoveFile={handleRemoveFile}
                    />
                  </div>
                  <Separator />
                  <div className="p-4">
                    <ExportPanel
                      messages={messages}
                      onEnterSelectMode={handleEnterSelectMode}
                      selectModeActive={selectMode !== null}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Documents View */}
            {activeView === "documents" && (
              <div className="flex-1 overflow-hidden">
                <DocumentManager
                  files={uploadedFiles}
                  onRemoveFile={handleRemoveFile}
                  onAnalyzeFile={handleAnalyzeFile}
                  onFilesUploaded={handleFilesUploaded}
                />
              </div>
            )}

            {/* Knowledge Base View */}
            {activeView === "knowledge" && (
              <div className="flex-1 overflow-hidden">
                <KnowledgeBase files={uploadedFiles} />
              </div>
            )}

            {/* History View */}
            {activeView === "history" && (
              <div className="flex-1 overflow-hidden">
                <HistoryView
                  sessions={chatSessions}
                  onSelectChat={handleSelectChat}
                  onDeleteChat={handleDeleteChat}
                />
              </div>
            )}
          </div>

          {/* Footer */}
          <footer className="flex items-center justify-between border-t border-border bg-card px-6 py-2">
            <span className="text-[10px] text-muted-foreground">
              {"智析 AI v1.0 | 豆包 + LangChain + ChromaDB"}
            </span>
            <div className="flex items-center gap-4 text-[10px] text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">
                使用说明
              </a>
              <a href="#" className="hover:text-foreground transition-colors">
                API 文档
              </a>
              <a href="#" className="hover:text-foreground transition-colors">
                反馈建议
              </a>
            </div>
          </footer>
        </main>
      </div>
    </div>
  )
}
