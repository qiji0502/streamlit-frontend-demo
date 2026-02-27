"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import {
  Send,
  Sparkles,
  Copy,
  RotateCcw,
  ThumbsUp,
  ThumbsDown,
  Paperclip,
  StopCircle,
  ChevronDown,
  Check,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import type { UploadedFile } from "@/components/file-upload"

export interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  files?: { name: string; type: string }[]
}

interface ChatInterfaceProps {
  messages: ChatMessage[]
  onSendMessage: (content: string, files?: File[]) => void
  isLoading: boolean
  onStopGenerating: () => void
  uploadedFiles: UploadedFile[]
  selectMode: "copy" | "quote" | null
  selectedMessageIds: Set<string>
  onToggleMessageSelect: (id: string) => void
  onCancelSelect: () => void
  onConfirmSelect: () => void
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1.5 px-4 py-3">
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-soft">
        <Sparkles className="h-4 w-4 text-primary" />
      </div>
      <div className="flex items-center gap-1 rounded-xl bg-card px-4 py-3 border border-border">
        <div className="typing-dot h-2 w-2 rounded-full bg-primary" />
        <div className="typing-dot h-2 w-2 rounded-full bg-primary" />
        <div className="typing-dot h-2 w-2 rounded-full bg-primary" />
      </div>
    </div>
  )
}

function MessageBubble({
  message,
  onCopy,
  onRetry,
  selectMode,
  isSelected,
  onToggleSelect,
}: {
  message: ChatMessage
  onCopy: (content: string) => void
  onRetry?: () => void
  selectMode: "copy" | "quote" | null
  isSelected: boolean
  onToggleSelect: () => void
}) {
  const isUser = message.role === "user"
  const [feedback, setFeedback] = useState<"up" | "down" | null>(null)

  return (
    <div
      className={cn(
        "flex gap-3 animate-message-in relative",
        isUser ? "flex-row-reverse" : "flex-row",
        selectMode && "cursor-pointer"
      )}
      onClick={selectMode ? onToggleSelect : undefined}
    >
      {/* Selection checkbox */}
      {selectMode && (
        <div className="absolute -left-1 top-1 z-10">
          <div
            className={cn(
              "flex h-5 w-5 items-center justify-center rounded-md border-2 transition-all",
              isSelected
                ? "border-primary bg-primary"
                : "border-border bg-card hover:border-primary/50"
            )}
          >
            {isSelected && <Check className="h-3 w-3 text-primary-foreground" />}
          </div>
        </div>
      )}

      {/* Avatar */}
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-medium",
          isUser
            ? "bg-purple-soft text-foreground"
            : "bg-blue-soft text-primary",
          selectMode && "ml-5"
        )}
      >
        {isUser ? "你" : <Sparkles className="h-4 w-4" />}
      </div>

      {/* Content */}
      <div className={cn("flex max-w-[75%] flex-col gap-1", isUser ? "items-end" : "items-start")}>
        {/* Files attached */}
        {message.files && message.files.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-1">
            {message.files.map((f, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 rounded-md bg-beige-soft px-2 py-0.5 text-xs text-foreground"
              >
                <Paperclip className="h-3 w-3" />
                {f.name}
              </span>
            ))}
          </div>
        )}

        <div
          className={cn(
            "rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
            isUser
              ? "bg-primary text-primary-foreground rounded-tr-sm"
              : "bg-card border border-border text-card-foreground rounded-tl-sm",
            selectMode && isSelected && "ring-2 ring-primary/40"
          )}
        >
          {message.content.split("\n").map((line, i) => (
            <span key={i}>
              {line}
              {i < message.content.split("\n").length - 1 && <br />}
            </span>
          ))}
        </div>

        {/* Message Actions - only show when NOT in select mode */}
        {!isUser && !selectMode && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => onCopy(message.content)}
                  className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  aria-label="复制回答"
                >
                  <Copy className="h-3.5 w-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent>复制</TooltipContent>
            </Tooltip>
            {onRetry && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={onRetry}
                    className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    aria-label="重新生成"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>重新生成</TooltipContent>
              </Tooltip>
            )}
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setFeedback(feedback === "up" ? null : "up")}
                  className={cn(
                    "p-1.5 rounded-md transition-colors",
                    feedback === "up"
                      ? "text-primary bg-blue-soft"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                  aria-label="有帮助"
                >
                  <ThumbsUp className="h-3.5 w-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent>有帮助</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setFeedback(feedback === "down" ? null : "down")}
                  className={cn(
                    "p-1.5 rounded-md transition-colors",
                    feedback === "down"
                      ? "text-destructive bg-red-50"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                  aria-label="没帮助"
                >
                  <ThumbsDown className="h-3.5 w-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent>没帮助</TooltipContent>
            </Tooltip>
          </div>
        )}

        {/* Timestamp */}
        <span className="text-[10px] text-muted-foreground px-1">
          {message.timestamp.toLocaleTimeString("zh-CN", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>
    </div>
  )
}

export function ChatInterface({
  messages,
  onSendMessage,
  isLoading,
  onStopGenerating,
  uploadedFiles,
  selectMode,
  selectedMessageIds,
  onToggleMessageSelect,
  onCancelSelect,
  onConfirmSelect,
}: ChatInterfaceProps) {
  const [input, setInput] = useState("")
  const [showScrollDown, setShowScrollDown] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, isLoading, scrollToBottom])

  const handleSend = () => {
    if (!input.trim() && uploadedFiles.length === 0) return
    onSendMessage(input.trim())
    setInput("")
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleTextareaInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
    const textarea = e.target
    textarea.style.height = "auto"
    textarea.style.height = Math.min(textarea.scrollHeight, 160) + "px"
  }

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content)
  }

  const hasSuccessFiles = uploadedFiles.some((f) => f.status === "success")

  return (
    <div className="flex h-full flex-col">
      {/* Selection mode toolbar */}
      {selectMode && (
        <div className="flex items-center justify-between border-b border-border bg-blue-soft/20 px-4 py-2 animate-message-in">
          <div className="flex items-center gap-2 text-sm text-foreground">
            <span className="font-medium">
              {selectMode === "copy" ? "选择要复制的对话" : "选择要引用的对话"}
            </span>
            <span className="text-xs text-muted-foreground">
              (已选 {selectedMessageIds.size} 条)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={onCancelSelect}
              className="gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
              取消
            </Button>
            <Button
              size="sm"
              onClick={onConfirmSelect}
              disabled={selectedMessageIds.size === 0}
              className="gap-1 text-xs bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Check className="h-3.5 w-3.5" />
              确认{selectMode === "copy" ? "复制" : "引用"}
            </Button>
          </div>
        </div>
      )}

      {/* Messages Area */}
      <div className="relative flex-1 overflow-hidden">
        <ScrollArea className="h-full" ref={scrollAreaRef}>
          <div className="flex flex-col gap-4 p-4 pb-4">
            {messages.length === 0 && (
              <div className="flex flex-1 flex-col items-center justify-center py-20">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-soft">
                  <Sparkles className="h-8 w-8 text-primary" />
                </div>
                <h2 className="mt-4 text-lg font-semibold text-foreground text-balance text-center">
                  {"你好，我是智析 AI"}
                </h2>
                <p className="mt-2 max-w-sm text-center text-sm text-muted-foreground leading-relaxed">
                  上传文档后，我可以帮你智能分析和总结文档内容。
                  支持 PDF、Word、图片、代码、Excel、PPT 等多种格式。
                </p>
                <div className="mt-6 flex flex-wrap justify-center gap-2">
                  {[
                    "总结这篇文档的要点",
                    "提取文档中的关键信息",
                    "将文档内容翻译成英文",
                    "生成文档摘要报告",
                  ].map((prompt) => (
                    <button
                      key={prompt}
                      onClick={() => {
                        setInput(prompt)
                        textareaRef.current?.focus()
                      }}
                      className="rounded-lg border border-border bg-card px-3 py-2 text-xs text-muted-foreground hover:text-foreground hover:border-primary/50 hover:bg-blue-soft/20 transition-colors"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((message) => (
              <div key={message.id} className="group">
                <MessageBubble
                  message={message}
                  onCopy={handleCopy}
                  onRetry={
                    message.role === "assistant"
                      ? () => {
                          const prevUserMsg = messages
                            .slice(0, messages.indexOf(message))
                            .reverse()
                            .find((m) => m.role === "user")
                          if (prevUserMsg) {
                            onSendMessage(prevUserMsg.content)
                          }
                        }
                      : undefined
                  }
                  selectMode={selectMode}
                  isSelected={selectedMessageIds.has(message.id)}
                  onToggleSelect={() => onToggleMessageSelect(message.id)}
                />
              </div>
            ))}

            {isLoading && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {showScrollDown && (
          <button
            onClick={scrollToBottom}
            className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1 rounded-full bg-card border border-border px-3 py-1.5 text-xs text-muted-foreground shadow-sm hover:bg-muted transition-colors"
            aria-label="滚动到底部"
          >
            <ChevronDown className="h-3 w-3" />
            新消息
          </button>
        )}
      </div>

      {/* Input Area */}
      <div className="border-t border-border bg-card p-4">
        {hasSuccessFiles && (
          <div className="mb-2 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Paperclip className="h-3 w-3" />
            {"已附加 "}
            {uploadedFiles.filter((f) => f.status === "success").length}
            {" 个文件"}
          </div>
        )}

        <div className="flex items-end gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => fileInputRef.current?.click()}
                className="shrink-0 text-muted-foreground hover:text-primary"
                aria-label="添加附件"
              >
                <Paperclip className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>添加附件</TooltipContent>
          </Tooltip>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            aria-hidden="true"
          />

          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleTextareaInput}
              onKeyDown={handleKeyDown}
              placeholder="输入问题，Shift+Enter 换行..."
              rows={1}
              className="w-full resize-none rounded-xl border border-border bg-muted/30 px-4 py-2.5 pr-12 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/30 transition-all leading-relaxed"
              style={{ minHeight: "42px", maxHeight: "160px" }}
            />
          </div>

          {isLoading ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  onClick={onStopGenerating}
                  className="shrink-0 bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  aria-label="停止生成"
                >
                  <StopCircle className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>停止生成</TooltipContent>
            </Tooltip>
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  onClick={handleSend}
                  disabled={!input.trim() && !hasSuccessFiles}
                  className="shrink-0 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                  aria-label="发送消息"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{"发送 (Enter)"}</TooltipContent>
            </Tooltip>
          )}
        </div>

        <p className="mt-2 text-center text-[10px] text-muted-foreground">
          {"智析 AI 可能会产生不准确的信息，请核实重要内容"}
        </p>
      </div>
    </div>
  )
}
