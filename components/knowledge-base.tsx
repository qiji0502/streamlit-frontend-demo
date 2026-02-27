"use client"

import {
  BookOpen,
  Database,
  FileText,
  Search,
  Plus,
  Trash2,
  RefreshCw,
  Layers,
  HardDrive,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import type { UploadedFile } from "@/components/file-upload"

interface KnowledgeBaseProps {
  files: UploadedFile[]
}

interface VectorCollection {
  id: string
  name: string
  docCount: number
  vectorCount: number
  lastUpdated: string
}

export function KnowledgeBase({ files }: KnowledgeBaseProps) {
  const successFiles = files.filter((f) => f.status === "success")

  // Mock vector collections
  const collections: VectorCollection[] = [
    {
      id: "1",
      name: "默认知识库",
      docCount: successFiles.length,
      vectorCount: successFiles.length * 42,
      lastUpdated: "刚刚",
    },
  ]

  return (
    <div className="flex h-full flex-col">
      <div className="p-4 pb-0">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">知识库</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              基于 ChromaDB 向量数据库
            </p>
          </div>
          <Button size="sm" className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90">
            <Plus className="h-3.5 w-3.5" />
            新建知识库
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 p-4">
        <div className="rounded-xl border border-border bg-blue-soft/20 p-3 text-center">
          <FileText className="mx-auto h-5 w-5 text-primary" />
          <p className="mt-1.5 text-xl font-bold text-foreground">{successFiles.length}</p>
          <p className="text-[10px] text-muted-foreground">文档数</p>
        </div>
        <div className="rounded-xl border border-border bg-purple-soft/20 p-3 text-center">
          <Layers className="mx-auto h-5 w-5 text-[#9b8ec4]" />
          <p className="mt-1.5 text-xl font-bold text-foreground">{successFiles.length * 42}</p>
          <p className="text-[10px] text-muted-foreground">向量数</p>
        </div>
        <div className="rounded-xl border border-border bg-beige-soft/30 p-3 text-center">
          <HardDrive className="mx-auto h-5 w-5 text-[#d4b96a]" />
          <p className="mt-1.5 text-xl font-bold text-foreground">
            {(successFiles.length * 0.5).toFixed(1)}
          </p>
          <p className="text-[10px] text-muted-foreground">MB 占用</p>
        </div>
      </div>

      <Separator />

      {/* Collections */}
      <ScrollArea className="flex-1">
        <div className="p-4 flex flex-col gap-3">
          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            向量集合
          </h3>
          {collections.map((col) => (
            <div
              key={col.id}
              className="rounded-xl border border-border bg-card p-4 hover:border-primary/30 hover:shadow-sm transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-soft">
                    <Database className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {col.name}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-[10px] h-4 px-1.5">
                        {col.docCount} 文档
                      </Badge>
                      <Badge variant="secondary" className="text-[10px] h-4 px-1.5">
                        {col.vectorCount} 向量
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    className="text-muted-foreground hover:text-primary"
                    aria-label="刷新"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>

              <Separator className="my-3" />

              <div className="text-xs text-muted-foreground">
                最近更新: {col.lastUpdated}
              </div>

              {/* Indexed files */}
              {successFiles.length > 0 && (
                <div className="mt-3 flex flex-col gap-1.5">
                  {successFiles.slice(0, 5).map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center gap-2 rounded-lg bg-muted/30 px-3 py-1.5 text-xs"
                    >
                      <FileText className="h-3 w-3 text-muted-foreground" />
                      <span className="truncate text-foreground">{file.name}</span>
                      <Badge variant="secondary" className="ml-auto text-[10px] h-4 px-1 bg-emerald-50 text-emerald-700 border-emerald-200">
                        已索引
                      </Badge>
                    </div>
                  ))}
                  {successFiles.length > 5 && (
                    <p className="text-center text-[10px] text-muted-foreground">
                      还有 {successFiles.length - 5} 个文件...
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}

          {/* Architecture info */}
          <div className="rounded-xl border border-dashed border-border bg-beige-soft/20 p-4">
            <h4 className="text-xs font-medium text-foreground mb-2">技术架构</h4>
            <div className="flex flex-col gap-1.5 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                向量数据库: ChromaDB
              </div>
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[#9b8ec4]" />
                AI 模型: 豆包 (Doubao)
              </div>
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[#d4b96a]" />
                框架: LangChain
              </div>
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                文档解析: TextIn
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}
