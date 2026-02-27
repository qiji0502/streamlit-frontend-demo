"use client"

import {
  Download,
  FileText,
  Copy,
  Check,
  Quote,
  FileType2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useState } from "react"
import type { ChatMessage } from "@/components/chat-interface"

interface ExportPanelProps {
  messages: ChatMessage[]
  onEnterSelectMode: (mode: "copy" | "quote") => void
  selectModeActive: boolean
}

export function ExportPanel({ messages, onEnterSelectMode, selectModeActive }: ExportPanelProps) {
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null)

  const getConversationText = () => {
    return messages
      .map((m) => {
        const role = m.role === "user" ? "用户" : "AI 助手"
        const time = m.timestamp.toLocaleString("zh-CN")
        return `[${time}] ${role}:\n${m.content}\n`
      })
      .join("\n---\n\n")
  }

  const handleExportPDF = () => {
    // Generate a simple HTML-based PDF download
    const content = messages
      .map((m) => {
        const role = m.role === "user" ? "用户" : "AI 助手"
        const time = m.timestamp.toLocaleString("zh-CN")
        return `<div style="margin-bottom:16px;"><strong>${role}</strong> <span style="color:#888;font-size:12px;">${time}</span><p style="margin-top:4px;white-space:pre-wrap;">${m.content}</p></div>`
      })
      .join('<hr style="border:none;border-top:1px solid #e2ded6;margin:12px 0;">')

    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>智析 AI 分析报告</title><style>body{font-family:'Noto Sans SC',sans-serif;padding:40px;max-width:800px;margin:0 auto;color:#2c2a35;}h1{color:#4a9aba;border-bottom:2px solid #4a9aba;padding-bottom:8px;}p{line-height:1.6;}</style></head><body><h1>智析 AI 分析报告</h1><p style="color:#888;">生成时间: ${new Date().toLocaleString("zh-CN")}</p><hr>${content}</body></html>`

    const blob = new Blob([html], { type: "application/pdf" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `智析AI_分析报告_${Date.now()}.html`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleExportWord = () => {
    const content = messages
      .map((m) => {
        const role = m.role === "user" ? "用户" : "AI 助手"
        const time = m.timestamp.toLocaleString("zh-CN")
        return `<p><b>${role}</b> <span style="color:gray;font-size:10pt;">${time}</span></p><p style="white-space:pre-wrap;">${m.content}</p><br/>`
      })
      .join("")

    const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="utf-8"><title>智析 AI 分析报告</title></head><body style="font-family:'Noto Sans SC',sans-serif;"><h1 style="color:#4a9aba;">智析 AI 分析报告</h1><p style="color:gray;">生成时间: ${new Date().toLocaleString("zh-CN")}</p><hr/>${content}</body></html>`

    const blob = new Blob(["\ufeff" + html], {
      type: "application/msword",
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `智析AI_分析报告_${Date.now()}.doc`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleCopySelect = () => {
    onEnterSelectMode("copy")
  }

  const handleQuoteSelect = () => {
    onEnterSelectMode("quote")
  }

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4">
      <div className="flex items-center gap-2">
        <Download className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold text-foreground">导出结果</h3>
      </div>

      <Separator />

      {/* Download as PDF */}
      <button
        onClick={handleExportPDF}
        disabled={messages.length === 0}
        className="flex items-center gap-3 rounded-lg border border-border p-3 text-left hover:border-primary/30 hover:bg-blue-soft/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-soft">
          <FileText className="h-4 w-4 text-primary" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-foreground">导出 PDF</p>
          <p className="text-xs text-muted-foreground">下载完整分析报告</p>
        </div>
        <Download className="h-4 w-4 text-muted-foreground" />
      </button>

      {/* Download as Word */}
      <button
        onClick={handleExportWord}
        disabled={messages.length === 0}
        className="flex items-center gap-3 rounded-lg border border-border p-3 text-left hover:border-primary/30 hover:bg-blue-soft/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-soft">
          <FileType2 className="h-4 w-4 text-[#9b8ec4]" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-foreground">导出 Word</p>
          <p className="text-xs text-muted-foreground">可编辑的文档格式</p>
        </div>
        <Download className="h-4 w-4 text-muted-foreground" />
      </button>

      <Separator />

      {/* Copy selected messages */}
      <Button
        variant="outline"
        size="sm"
        onClick={handleCopySelect}
        disabled={messages.length === 0}
        className={`gap-2 w-full ${selectModeActive ? "border-primary bg-blue-soft/20 text-primary" : ""}`}
      >
        <Copy className="h-3.5 w-3.5" />
        复制对话内容
      </Button>

      {/* Quote selected messages */}
      <Button
        variant="outline"
        size="sm"
        onClick={handleQuoteSelect}
        disabled={messages.length === 0}
        className="gap-2 w-full"
      >
        <Quote className="h-3.5 w-3.5" />
        引用对话内容
      </Button>
    </div>
  )
}
