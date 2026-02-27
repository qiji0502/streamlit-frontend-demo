import { NextRequest, NextResponse } from "next/server"

/**
 * Chat API Route
 *
 * This endpoint connects to the Python backend (Streamlit + LangChain + ChromaDB + Doubao).
 *
 * In production, this would forward requests to:
 * - Streamlit backend running on a separate port
 * - Or a FastAPI backend that wraps the LangChain pipeline
 *
 * Backend architecture:
 * 1. TextIn - Document parsing (PDF, Word, images, etc.)
 * 2. LangChain - Framework for chaining AI operations
 * 3. ChromaDB - Vector database for document embeddings
 * 4. Doubao (豆包) API - AI model for text generation
 */

const PYTHON_BACKEND_URL = process.env.PYTHON_BACKEND_URL || "http://localhost:8501"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message, fileIds } = body

    // In production, forward to Python backend:
    // const response = await fetch(`${PYTHON_BACKEND_URL}/api/chat`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ message, file_ids: fileIds }),
    // })
    // const data = await response.json()
    // return NextResponse.json(data)

    // Mock response for demo
    const mockResponses = [
      "根据文档分析，以下是关键摘要信息...",
      "文档中的核心要点已提取完成...",
      "智能分析结果如下...",
    ]

    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    return NextResponse.json({
      success: true,
      response: mockResponses[Math.floor(Math.random() * mockResponses.length)],
      metadata: {
        model: "doubao",
        framework: "langchain",
        vectorDB: "chromadb",
        parser: "textin",
      },
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "处理请求时发生错误" },
      { status: 500 }
    )
  }
}
