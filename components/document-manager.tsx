"use client"

import {
  FileText,
  Image,
  FileCode,
  Table,
  Presentation,
  Link2,
  Search,
  Trash2,
  File,
  CheckCircle2,
  Plus,
  FolderOpen,
  Upload,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import type { UploadedFile } from "@/components/file-upload"
import { useState, useRef } from "react"

interface DocumentManagerProps {
  files: UploadedFile[]
  onRemoveFile: (id: string) => void
  onAnalyzeFile: (id: string) => void
  onFilesUploaded: (files: UploadedFile[]) => void
}

type CategoryFilter = "all" | "pdf" | "word" | "image" | "text" | "code" | "excel" | "ppt" | "link"

const categories: { id: CategoryFilter; label: string; icon: typeof FileText }[] = [
  { id: "all", label: "全部", icon: FolderOpen },
  { id: "pdf", label: "PDF", icon: FileText },
  { id: "word", label: "Word", icon: FileText },
  { id: "image", label: "图片", icon: Image },
  { id: "text", label: "文本", icon: FileText },
  { id: "code", label: "代码", icon: FileCode },
  { id: "excel", label: "Excel", icon: Table },
  { id: "ppt", label: "PPT", icon: Presentation },
  { id: "link", label: "链接", icon: Link2 },
]

function getFileCategory(file: UploadedFile): CategoryFilter {
  if (file.type === "url") return "link"
  if (file.type.includes("pdf")) return "pdf"
  if (file.type.includes("word") || file.type.includes("document")) return "word"
  if (file.type.includes("image")) return "image"
  if (file.type.includes("sheet") || file.type.includes("excel")) return "excel"
  if (file.type.includes("presentation") || file.type.includes("powerpoint")) return "ppt"
  if (file.type === "text/plain") return "text"
  const ext = file.name.split(".").pop()?.toLowerCase()
  const codeExts = ["py", "js", "ts", "tsx", "jsx", "java", "cpp", "c", "go", "rs", "rb", "php", "html", "css", "json", "xml", "yaml", "yml", "sh", "sql"]
  if (ext && codeExts.includes(ext)) return "code"
  if (ext === "txt" || ext === "md") return "text"
  return "text"
}

function getFileIcon(file: UploadedFile) {
  if (file.type === "url") return Link2
  if (file.type.includes("pdf")) return FileText
  if (file.type.includes("word") || file.type.includes("document")) return FileText
  if (file.type.includes("image")) return Image
  if (file.type.includes("sheet") || file.type.includes("excel")) return Table
  if (file.type.includes("presentation") || file.type.includes("powerpoint")) return Presentation
  const ext = file.name.split(".").pop()?.toLowerCase()
  const codeExts = ["py", "js", "ts", "tsx", "jsx", "java", "cpp", "c", "go", "rs", "rb", "php", "html", "css", "json", "xml", "yaml", "yml", "sh", "sql"]
  if (ext && codeExts.includes(ext)) return FileCode
  return File
}

function getFileColor(file: UploadedFile) {
  if (file.type === "url") return "text-primary"
  if (file.type.includes("pdf")) return "text-red-500"
  if (file.type.includes("word") || file.type.includes("document")) return "text-[#4a9aba]"
  if (file.type.includes("image")) return "text-green-500"
  if (file.type.includes("sheet") || file.type.includes("excel")) return "text-emerald-600"
  if (file.type.includes("presentation") || file.type.includes("powerpoint")) return "text-orange-500"
  return "text-[#9b8ec4]"
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "-"
  if (bytes < 1024) return bytes + " B"
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB"
  return (bytes / (1024 * 1024)).toFixed(1) + " MB"
}

const ACCEPTED_EXTENSIONS = ".pdf,.doc,.docx,.jpg,.png,.jpeg,.txt,.xls,.xlsx,.ppt,.pptx,.py,.js,.ts,.tsx,.jsx,.java,.cpp,.c,.go,.rs,.rb,.php,.html,.css,.json,.xml,.yaml,.yml,.md,.sh,.sql"

export function DocumentManager({ files, onRemoveFile, onAnalyzeFile, onFilesUploaded }: DocumentManagerProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>("all")
  const [showUrlInput, setShowUrlInput] = useState(false)
  const [urlInput, setUrlInput] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const successFiles = files.filter((f) => f.status === "success")

  const filteredFiles = successFiles.filter((f) => {
    const matchesSearch = f.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = activeCategory === "all" || getFileCategory(f) === activeCategory
    return matchesSearch && matchesCategory
  })

  const categoryCounts = categories.map((cat) => ({
    ...cat,
    count: cat.id === "all"
      ? successFiles.length
      : successFiles.filter((f) => getFileCategory(f) === cat.id).length,
  }))

  const handleAddFiles = (inputFiles: FileList | null) => {
    if (!inputFiles) return
    const fileArr = Array.from(inputFiles)
    const newFiles: UploadedFile[] = fileArr.map((file) => ({
      id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: file.name,
      size: file.size,
      type: file.type || "text/plain",
      status: "success" as const,
      progress: 100,
    }))
    onFilesUploaded(newFiles)
  }

  const handleUrlSubmit = () => {
    if (!urlInput.trim()) return
    const urlFile: UploadedFile = {
      id: `url-${Date.now()}`,
      name: urlInput.trim(),
      size: 0,
      type: "url",
      status: "success",
      progress: 100,
    }
    onFilesUploaded([urlFile])
    setUrlInput("")
    setShowUrlInput(false)
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 pb-0">
        <div>
          <h2 className="text-lg font-semibold text-foreground">文档管理</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {"共 "}
            {successFiles.length}
            {" 个文件"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowUrlInput(!showUrlInput)}
            className="gap-1.5 text-xs hover:border-primary/50 hover:text-primary"
          >
            <Link2 className="h-3.5 w-3.5" />
            添加链接
          </Button>
          <Button
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            className="gap-1.5 text-xs bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="h-3.5 w-3.5" />
            添加文件
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={ACCEPTED_EXTENSIONS}
            onChange={(e) => handleAddFiles(e.target.files)}
            className="hidden"
            aria-hidden="true"
          />
        </div>
      </div>

      {/* URL Input */}
      {showUrlInput && (
        <div className="flex gap-2 px-4 pt-3 animate-message-in">
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="输入网址链接..."
            className="flex-1 h-9 rounded-lg border border-border bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/30"
            onKeyDown={(e) => {
              if (e.key === "Enter") handleUrlSubmit()
            }}
          />
          <Button size="sm" onClick={handleUrlSubmit} className="bg-primary text-primary-foreground hover:bg-primary/90">
            添加
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => { setShowUrlInput(false); setUrlInput(""); }}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Search */}
      <div className="px-4 py-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索文件名..."
            className="h-9 w-full rounded-lg border border-border bg-muted/30 pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/30 transition-all"
          />
        </div>
      </div>

      {/* Category filter tabs */}
      <div className="px-4 pb-2">
        <div className="flex flex-wrap gap-1.5">
          {categoryCounts.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs transition-all",
                activeCategory === cat.id
                  ? "bg-primary text-primary-foreground font-medium"
                  : "bg-card border border-border text-muted-foreground hover:text-foreground hover:border-primary/30"
              )}
            >
              <cat.icon className="h-3 w-3" />
              {cat.label}
              {cat.count > 0 && (
                <span className={cn(
                  "text-[10px] rounded-full px-1.5 min-w-[18px] text-center",
                  activeCategory === cat.id
                    ? "bg-primary-foreground/20 text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                )}>
                  {cat.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <Separator />

      {/* File List */}
      <ScrollArea className="flex-1">
        <div className="p-4 flex flex-col gap-2">
          {filteredFiles.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Upload className="h-10 w-10 text-muted-foreground/40" />
              <p className="mt-3 text-sm text-muted-foreground">
                {searchQuery || activeCategory !== "all"
                  ? "未找到匹配的文件"
                  : "暂无文件，点击上方按钮添加"}
              </p>
              {!searchQuery && activeCategory === "all" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-3 gap-1.5 text-xs"
                >
                  <Plus className="h-3.5 w-3.5" />
                  添加第一个文件
                </Button>
              )}
            </div>
          ) : (
            filteredFiles.map((file) => {
              const Icon = getFileIcon(file)
              const color = getFileColor(file)
              const category = getFileCategory(file)
              const catLabel = categories.find((c) => c.id === category)?.label || "文件"
              return (
                <div
                  key={file.id}
                  className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 hover:border-primary/30 hover:shadow-sm transition-all group"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted shrink-0">
                    <Icon className={cn("h-5 w-5", color)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">
                      {file.name}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {file.size > 0 && (
                        <span className="text-xs text-muted-foreground">
                          {formatFileSize(file.size)}
                        </span>
                      )}
                      <Badge variant="secondary" className="text-[10px] h-4 px-1.5">
                        {catLabel}
                      </Badge>
                      <span className="flex items-center gap-1 text-[10px] text-emerald-600">
                        <CheckCircle2 className="h-3 w-3" />
                        就绪
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onAnalyzeFile(file.id)}
                      className="h-8 text-xs text-primary hover:text-primary hover:bg-blue-soft/30"
                    >
                      分析
                    </Button>
                    <button
                      onClick={() => onRemoveFile(file.id)}
                      className="p-1.5 text-muted-foreground hover:text-destructive rounded-md transition-colors"
                      aria-label={`删除 ${file.name}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
