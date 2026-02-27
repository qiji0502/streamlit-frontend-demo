"use client"

import { useState, useRef, useCallback } from "react"
import {
  Upload,
  FileText,
  Image,
  FileCode,
  Table,
  Presentation,
  Link2,
  FolderOpen,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
  File,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export interface UploadedFile {
  id: string
  name: string
  size: number
  type: string
  status: "uploading" | "success" | "error"
  progress: number
}

interface FileUploadProps {
  onFilesUploaded: (files: UploadedFile[]) => void
  uploadedFiles: UploadedFile[]
  onRemoveFile: (id: string) => void
}

const ACCEPTED_TYPES = {
  "application/pdf": { icon: FileText, label: "PDF", color: "text-red-500" },
  "application/msword": { icon: FileText, label: "Word", color: "text-blue-500" },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": { icon: FileText, label: "Word", color: "text-blue-500" },
  "image/jpeg": { icon: Image, label: "图片", color: "text-green-500" },
  "image/png": { icon: Image, label: "图片", color: "text-green-500" },
  "image/jpg": { icon: Image, label: "图片", color: "text-green-500" },
  "text/plain": { icon: FileText, label: "文本", color: "text-gray-500" },
  "application/vnd.ms-excel": { icon: Table, label: "Excel", color: "text-emerald-600" },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": { icon: Table, label: "Excel", color: "text-emerald-600" },
  "application/vnd.ms-powerpoint": { icon: Presentation, label: "PPT", color: "text-orange-500" },
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": { icon: Presentation, label: "PPT", color: "text-orange-500" },
} as Record<string, { icon: typeof FileText; label: string; color: string }>

const ACCEPTED_EXTENSIONS = ".pdf,.doc,.docx,.jpg,.png,.jpeg,.txt,.xls,.xlsx,.ppt,.pptx,.py,.js,.ts,.tsx,.jsx,.java,.cpp,.c,.go,.rs,.rb,.php,.html,.css,.json,.xml,.yaml,.yml,.md,.sh,.sql"

function getFileInfo(file: { name: string; type: string }) {
  if (ACCEPTED_TYPES[file.type]) {
    return ACCEPTED_TYPES[file.type]
  }
  const ext = file.name.split(".").pop()?.toLowerCase()
  const codeExts = ["py", "js", "ts", "tsx", "jsx", "java", "cpp", "c", "go", "rs", "rb", "php", "html", "css", "json", "xml", "yaml", "yml", "sh", "sql"]
  if (ext && codeExts.includes(ext)) {
    return { icon: FileCode, label: "代码", color: "text-purple-500" }
  }
  if (ext === "md") {
    return { icon: FileText, label: "Markdown", color: "text-gray-600" }
  }
  return { icon: File, label: "文件", color: "text-muted-foreground" }
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B"
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB"
  return (bytes / (1024 * 1024)).toFixed(1) + " MB"
}

export function FileUpload({ onFilesUploaded, uploadedFiles, onRemoveFile }: FileUploadProps) {
  const [isDragActive, setIsDragActive] = useState(false)
  const [urlInput, setUrlInput] = useState("")
  const [showUrlInput, setShowUrlInput] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const folderInputRef = useRef<HTMLInputElement>(null)

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragActive(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragActive(false)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const simulateUpload = useCallback((files: File[]) => {
    const newFiles: UploadedFile[] = files.map((file) => ({
      id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: file.name,
      size: file.size,
      type: file.type || "text/plain",
      status: "uploading" as const,
      progress: 0,
    }))

    onFilesUploaded(newFiles)

    // Simulate progress
    newFiles.forEach((f) => {
      let progress = 0
      const interval = setInterval(() => {
        progress += Math.random() * 30 + 10
        if (progress >= 100) {
          progress = 100
          clearInterval(interval)
          onFilesUploaded([{ ...f, progress: 100, status: "success" }])
        } else {
          onFilesUploaded([{ ...f, progress: Math.min(progress, 99) }])
        }
      }, 300)
    })
  }, [onFilesUploaded])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragActive(false)

      const files = Array.from(e.dataTransfer.files)
      if (files.length > 0) {
        simulateUpload(files)
      }
    },
    [simulateUpload]
  )

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      simulateUpload(files)
    }
    if (e.target) e.target.value = ""
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
    <div className="flex flex-col gap-4">
      {/* Drop Zone */}
      <div
        className={cn(
          "relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 transition-all cursor-pointer",
          isDragActive
            ? "upload-zone-active border-primary bg-blue-soft/30"
            : "border-border bg-card hover:border-primary/50 hover:bg-blue-soft/10"
        )}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        role="button"
        tabIndex={0}
        aria-label="点击或拖拽上传文件"
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            fileInputRef.current?.click()
          }
        }}
      >
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-soft">
          <Upload className="h-6 w-6 text-primary" />
        </div>
        <p className="mt-3 text-sm font-medium text-foreground">
          点击或拖拽文件到此处上传
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          支持 PDF、Word、图片、代码、Excel、PPT、文本文件
        </p>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={ACCEPTED_EXTENSIONS}
          onChange={handleFileSelect}
          className="hidden"
          aria-hidden="true"
        />
      </div>

      {/* Quick Action Buttons */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={(e) => {
            e.stopPropagation()
            fileInputRef.current?.click()
          }}
          className="gap-1.5 text-xs bg-card hover:bg-blue-soft/30 hover:text-primary hover:border-primary/50"
        >
          <FileText className="h-3.5 w-3.5" />
          选择文件
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={(e) => {
            e.stopPropagation()
            folderInputRef.current?.click()
          }}
          className="gap-1.5 text-xs bg-card hover:bg-blue-soft/30 hover:text-primary hover:border-primary/50"
        >
          <FolderOpen className="h-3.5 w-3.5" />
          上传文件夹
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={(e) => {
            e.stopPropagation()
            setShowUrlInput(!showUrlInput)
          }}
          className="gap-1.5 text-xs bg-card hover:bg-purple-soft/30 hover:text-[#9b8ec4] hover:border-[#9b8ec4]/50"
        >
          <Link2 className="h-3.5 w-3.5" />
          网址链接
        </Button>

        <input
          ref={folderInputRef}
          type="file"
          // @ts-expect-error webkitdirectory is not in the type definition
          webkitdirectory=""
          directory=""
          multiple
          onChange={handleFileSelect}
          className="hidden"
          aria-hidden="true"
        />
      </div>

      {/* URL Input */}
      {showUrlInput && (
        <div className="flex gap-2 animate-message-in">
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="输入网址链接，例如 https://example.com/document"
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
            onClick={() => {
              setShowUrlInput(false)
              setUrlInput("")
            }}
          >
            取消
          </Button>
        </div>
      )}

      {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">
              已上传文件 ({uploadedFiles.length})
            </span>
          </div>
          <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto">
            {uploadedFiles.map((file) => {
              const info = getFileInfo(file)
              const Icon = file.type === "url" ? Link2 : info.icon
              return (
                <div
                  key={file.id}
                  className="flex items-center gap-3 rounded-lg border border-border bg-card px-3 py-2 text-sm animate-message-in"
                >
                  <Icon className={cn("h-4 w-4 shrink-0", file.type === "url" ? "text-primary" : info.color)} />
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm text-foreground">{file.name}</p>
                    <div className="flex items-center gap-2">
                      {file.size > 0 && (
                        <span className="text-xs text-muted-foreground">
                          {formatFileSize(file.size)}
                        </span>
                      )}
                      <Badge
                        variant="secondary"
                        className="text-[10px] h-4 px-1.5"
                      >
                        {file.type === "url" ? "链接" : info.label}
                      </Badge>
                    </div>
                    {file.status === "uploading" && (
                      <Progress value={file.progress} className="mt-1 h-1" />
                    )}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {file.status === "uploading" && (
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    )}
                    {file.status === "success" && (
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    )}
                    {file.status === "error" && (
                      <AlertCircle className="h-4 w-4 text-destructive" />
                    )}
                    <button
                      onClick={() => onRemoveFile(file.id)}
                      className="p-1 text-muted-foreground hover:text-destructive rounded transition-colors"
                      aria-label={`移除文件: ${file.name}`}
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
