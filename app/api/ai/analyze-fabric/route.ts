// API endpoint để phân tích ảnh vải bằng Google Gemini Vision API
// POST /api/ai/analyze-fabric

import { NextRequest, NextResponse } from 'next/server'

export interface FabricAnalysisResult {
  material: string // Chất liệu
  color: string // Màu sắc
  pattern: string // Họa tiết
  confidence: number // 0-1
  analysis_notes: string
  name?: string // Tên vải (nếu AI đọc được từ ảnh)
  origin?: string // Xuất xứ (Trung Quốc, Hàn Quốc, Việt Nam, Ý, Pháp...)
  width?: number // Chiều rộng (cm)
  weight?: number // Trọng lượng (g/m²)
  price_estimate?: number // Giá ước lượng (VNĐ/m)
}

interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const imageFile = formData.get('image') as File
    
    if (!imageFile) {
      return NextResponse.json({
        success: false,
        error: 'Không tìm thấy ảnh để phân tích'
      } as ApiResponse<null>, { status: 400 })
    }

    // Validate file type
    if (!imageFile.type.startsWith('image/')) {
      return NextResponse.json({
        success: false,
        error: 'File không phải là ảnh'
      } as ApiResponse<null>, { status: 400 })
    }

    // Convert image to base64 and compress if needed
    const bytes = await imageFile.arrayBuffer()
    let buffer = Buffer.from(bytes)
    const mimeType = imageFile.type

    // Compress image if larger than 500KB to avoid 413 error
    const maxSize = 500 * 1024 // 500KB
    if (buffer.length > maxSize) {
      console.log('🗜️ Compressing image from', (buffer.length / 1024).toFixed(2), 'KB')

      // Use sharp to compress image
      const sharp = require('sharp')

      // Resize to max 800px width while maintaining aspect ratio
      buffer = await sharp(buffer)
        .resize(800, null, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .jpeg({ quality: 75 })
        .toBuffer()

      console.log('✅ Compressed to', (buffer.length / 1024).toFixed(2), 'KB')
    }

    const base64Image = buffer.toString('base64')

    // Get API key from environment
    const apiKey = process.env.GEMINI_API_KEY

    if (!apiKey) {
      return NextResponse.json({
        success: false,
        error: 'Gemini API key chưa được cấu hình. Vui lòng thêm GEMINI_API_KEY vào file .env'
      } as ApiResponse<null>, { status: 500 })
    }

    console.log('🤖 Analyzing fabric image with Gemini Vision...')
    console.log(`📸 Compressed size: ${(buffer.length / 1024).toFixed(2)} KB`)
    console.log(`📝 MIME type: ${mimeType}`)

    // Prepare prompt - Yêu cầu AI phân tích đầy đủ thông tin
    const prompt = `Phân tích ảnh vải này và trả về JSON với các thông tin sau:

{
  "material": "Chất liệu (Cotton/Polyester/Silk/Linen/Wool/Blend/Satin/Chiffon/Organza/Taffeta/Velvet...)",
  "color": "Màu sắc chính (tiếng Việt, ví dụ: Xanh navy, Đỏ đô, Trắng kem...)",
  "pattern": "Họa tiết (Trơn/Kẻ sọc/Hoa văn/Chấm bi/Caro/Họa tiết hình học...)",
  "confidence": 0.85,
  "analysis_notes": "Mô tả chi tiết về vải (độ bóng, kết cấu, đặc điểm nổi bật...)",
  "name": "Tên vải nếu có thể đọc được từ ảnh (null nếu không có)",
  "origin": "Xuất xứ nếu nhận diện được (Trung Quốc/Hàn Quốc/Việt Nam/Ý/Pháp/Nhật Bản... hoặc null)",
  "width": 150,
  "weight": 200,
  "price_estimate": 50000
}

**Lưu ý quan trọng:**
- Chỉ điền thông tin nếu CHẮC CHẮN, nếu không chắc thì để null
- width: Chiều rộng tiêu chuẩn của loại vải này (cm), ví dụ: Cotton thường 140-150cm, Silk 90-114cm
- weight: Trọng lượng ước lượng dựa trên chất liệu và độ dày (g/m²), ví dụ: Cotton mỏng 100-150, dày 200-300
- price_estimate: Giá ước lượng thị trường Việt Nam (VNĐ/m), dựa trên chất liệu và chất lượng
- origin: Chỉ điền nếu có dấu hiệu rõ ràng (nhãn mác, đặc điểm đặc trưng...)
- name: Chỉ điền nếu đọc được text/nhãn trên ảnh

Chỉ trả về JSON, không giải thích thêm.`

    // Call Gemini Vision API (Updated to gemini-2.5-flash)
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt
              },
              {
                inline_data: {
                  mime_type: mimeType,
                  data: base64Image
                }
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 2048,
          responseMimeType: 'application/json'
        }
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Gemini API error:', errorText)

      return NextResponse.json({
        success: false,
        error: `Gemini API error: ${response.status} ${response.statusText}`
      } as ApiResponse<null>, { status: response.status })
    }

    const result = await response.json()
    console.log('✅ Gemini API response:', JSON.stringify(result, null, 2))

    // Extract analysis from response
    const content = result.candidates?.[0]?.content?.parts?.[0]?.text
    if (!content) {
      console.error('❌ No content in response:', JSON.stringify(result, null, 2))

      // Check for finish reason
      const finishReason = result.candidates?.[0]?.finishReason
      if (finishReason === 'MAX_TOKENS') {
        return NextResponse.json({
          success: false,
          error: 'AI response bị cắt ngắn (MAX_TOKENS). Vui lòng thử lại.'
        } as ApiResponse<null>, { status: 500 })
      }

      return NextResponse.json({
        success: false,
        error: 'Không nhận được kết quả phân tích từ AI'
      } as ApiResponse<null>, { status: 500 })
    }

    // Parse JSON response
    let analysis: FabricAnalysisResult
    try {
      analysis = JSON.parse(content)
    } catch (parseError) {
      console.error('❌ Failed to parse AI response:', content)
      return NextResponse.json({
        success: false,
        error: 'Không thể parse kết quả phân tích từ AI'
      } as ApiResponse<null>, { status: 500 })
    }

    console.log('✅ Fabric analysis completed:', analysis)

    // Return analysis result
    return NextResponse.json({
      success: true,
      data: analysis
    } as ApiResponse<FabricAnalysisResult>)

  } catch (error) {
    console.error('❌ Error analyzing fabric:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Lỗi không xác định khi phân tích ảnh'
    } as ApiResponse<null>, { status: 500 })
  }
}
