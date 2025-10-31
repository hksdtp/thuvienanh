'use client'

import { useState, useEffect } from 'react'
import { SparklesIcon, PhotoIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { FabricAnalysisResult } from '@/app/api/ai/analyze-fabric/route'

export interface FabricFormData {
  name: string
  code: string
  description: string
  material: string
  width: number
  weight: number
  color: string
  pattern: string
  finish: string
  origin: string
  price_per_meter: number
  stock_quantity: number
  min_order_quantity: number
  tags: string[]
  search_keywords: string
  images: File[]
}

interface FabricCreateFormProps {
  onSubmit: (data: FabricFormData) => Promise<void>
  onCancel: () => void
  isSubmitting?: boolean
}

export default function FabricCreateForm({
  onSubmit,
  onCancel,
  isSubmitting = false
}: FabricCreateFormProps) {
  const [formData, setFormData] = useState<FabricFormData>({
    name: '',
    code: '',
    description: '',
    material: '',
    width: 140,
    weight: 200,
    color: '',
    pattern: '',
    finish: '',
    origin: '',
    price_per_meter: 0,
    stock_quantity: 0,
    min_order_quantity: 1,
    tags: [],
    search_keywords: '',
    images: []
  })

  const [errors, setErrors] = useState<Partial<Record<keyof FabricFormData, string>>>({})
  const [tagInput, setTagInput] = useState('')
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<FabricAnalysisResult | null>(null)

  // Analysis steps state
  const [analysisSteps, setAnalysisSteps] = useState<{
    uploading: 'pending' | 'loading' | 'complete'
    material: { status: 'pending' | 'complete', value: string }
    color: { status: 'pending' | 'complete', value: string }
    pattern: { status: 'pending' | 'complete', value: string }
  }>({
    uploading: 'pending',
    material: { status: 'pending', value: '' },
    color: { status: 'pending', value: '' },
    pattern: { status: 'pending', value: '' }
  })

  // Auto-generate code from name
  useEffect(() => {
    if (formData.name && !formData.code) {
      const code = generateCodeFromName(formData.name)
      setFormData(prev => ({ ...prev, code }))
    }
  }, [formData.name])

  const generateCodeFromName = (name: string): string => {
    // Remove Vietnamese accents and convert to uppercase
    const normalized = name
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')
      .substring(0, 6)
    
    const timestamp = Date.now().toString().slice(-4)
    return `${normalized}${timestamp}`
  }

  const handleInputChange = (field: keyof FabricFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user types
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    // Update form data
    setFormData(prev => ({ ...prev, images: files }))

    // Generate previews
    const previews = await Promise.all(
      files.map(file => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader()
          reader.onloadend = () => resolve(reader.result as string)
          reader.readAsDataURL(file)
        })
      })
    )
    setImagePreviews(previews)

    // Clear error
    if (errors.images) {
      setErrors(prev => ({ ...prev, images: '' }))
    }

    // TỰ ĐỘNG PHÂN TÍCH AI NGAY KHI UPLOAD ẢNH
    if (files.length > 0) {
      await analyzeImageWithAI(files[0])
    }
  }

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }))
    setImagePreviews(prev => prev.filter((_, i) => i !== index))
  }

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }))
      setTagInput('')
    }
  }

  const handleRemoveTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }))
  }

  // Tách logic phân tích AI thành function riêng để tái sử dụng
  const analyzeImageWithAI = async (imageFile: File) => {
    setIsAnalyzing(true)
    setAnalysisResult(null)

    // Reset steps
    setAnalysisSteps({
      uploading: 'loading',
      material: { status: 'pending', value: '' },
      color: { status: 'pending', value: '' },
      pattern: { status: 'pending', value: '' }
    })

    try {
      const formDataToSend = new FormData()
      formDataToSend.append('image', imageFile)

      const response = await fetch('/api/ai/analyze-fabric', {
        method: 'POST',
        body: formDataToSend
      })

      const result = await response.json()

      if (result.success && result.data) {
        const analysis: FabricAnalysisResult = result.data

        // Bước 1: Upload hoàn thành
        setAnalysisSteps(prev => ({ ...prev, uploading: 'complete' }))

        // Delay để animation mượt hơn
        await new Promise(resolve => setTimeout(resolve, 300))

        // Bước 2: Hiển thị chất liệu
        setAnalysisSteps(prev => ({
          ...prev,
          material: { status: 'complete', value: analysis.material }
        }))

        await new Promise(resolve => setTimeout(resolve, 300))

        // Bước 3: Hiển thị màu sắc
        setAnalysisSteps(prev => ({
          ...prev,
          color: { status: 'complete', value: analysis.color }
        }))

        await new Promise(resolve => setTimeout(resolve, 300))

        // Bước 4: Hiển thị họa tiết
        setAnalysisSteps(prev => ({
          ...prev,
          pattern: { status: 'complete', value: analysis.pattern }
        }))

        setAnalysisResult(analysis)

        // Auto-fill form fields từ kết quả AI
        setFormData(prev => ({
          ...prev,
          name: analysis.name || prev.name, // Tên vải nếu AI đọc được
          material: analysis.material || prev.material,
          color: analysis.color || prev.color,
          pattern: analysis.pattern || prev.pattern,
          origin: analysis.origin || prev.origin, // Xuất xứ
          width: analysis.width || prev.width, // Chiều rộng (cm)
          weight: analysis.weight || prev.weight, // Trọng lượng (g/m²)
          price_per_meter: analysis.price_estimate || prev.price_per_meter, // Giá ước lượng
          description: analysis.analysis_notes || prev.description // Lưu mô tả chi tiết vào field NOTE
        }))

        console.log('✅ AI phân tích thành công:', analysis)
      } else {
        // Reset về pending nếu lỗi
        setAnalysisSteps({
          uploading: 'pending',
          material: { status: 'pending', value: '' },
          color: { status: 'pending', value: '' },
          pattern: { status: 'pending', value: '' }
        })
        console.error('❌ Lỗi phân tích:', result.error)
        alert(`❌ Lỗi: ${result.error}`)
      }
    } catch (error) {
      setAnalysisSteps({
        uploading: 'pending',
        material: { status: 'pending', value: '' },
        color: { status: 'pending', value: '' },
        pattern: { status: 'pending', value: '' }
      })
      console.error('Error analyzing fabric:', error)
      alert('❌ Lỗi kết nối đến AI')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleAIAnalyze = async () => {
    if (formData.images.length === 0) {
      alert('Vui lòng chọn ít nhất 1 ảnh để phân tích')
      return
    }
    await analyzeImageWithAI(formData.images[0])
  }

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof FabricFormData, string>> = {}

    // Trường bắt buộc
    if (!formData.name.trim()) newErrors.name = 'Tên vải là bắt buộc'
    if (!formData.material.trim()) newErrors.material = 'Chất liệu là bắt buộc'
    if (!formData.color.trim()) newErrors.color = 'Màu sắc là bắt buộc'
    if (formData.images.length === 0) newErrors.images = 'Vui lòng chọn ít nhất 1 ảnh'

    // Trường số phải hợp lệ (nếu có giá trị)
    if (formData.width <= 0) newErrors.width = 'Chiều rộng phải lớn hơn 0'
    if (formData.weight <= 0) newErrors.weight = 'Trọng lượng phải lớn hơn 0'
    if (formData.price_per_meter < 0) newErrors.price_per_meter = 'Giá không được âm'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    // Auto-generate code if empty
    const finalFormData = { ...formData }
    if (!finalFormData.code.trim()) {
      // Generate code from name: "Vải Cotton Cao Cấp" -> "VCC"
      const words = finalFormData.name.trim().split(' ')
      const initials = words.map(w => w[0]).join('').toUpperCase()
      const timestamp = Date.now().toString().slice(-4)
      finalFormData.code = `${initials}${timestamp}`
    }

    await onSubmit(finalFormData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Image Upload Section */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border-2 border-dashed border-blue-300">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <PhotoIcon className="w-6 h-6 text-blue-600" />
            Ảnh vải
          </h3>
        </div>

        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageChange}
          className="hidden"
          id="fabric-images"
          disabled={isAnalyzing || isSubmitting}
        />
        
        <label
          htmlFor="fabric-images"
          className="block w-full p-8 border-2 border-dashed border-gray-300 rounded-lg text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all"
        >
          <PhotoIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-600">
            Click để chọn ảnh hoặc kéo thả vào đây
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Hỗ trợ: JPG, PNG, WebP (tối đa 20MB/ảnh)
          </p>
        </label>

        {errors.images && (
          <p className="mt-2 text-sm text-red-600">{errors.images}</p>
        )}

        {/* Image Previews */}
        {imagePreviews.length > 0 && (
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {imagePreviews.map((preview, index) => (
              <div key={index} className="relative group">
                <img
                  src={preview}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg border-2 border-gray-200"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* AI Analysis Steps Box */}
        {(analysisSteps.uploading !== 'pending' || isAnalyzing) && (
          <div className="mt-4 p-5 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 border border-indigo-200 rounded-xl shadow-sm">
            <div className="space-y-3">
              {/* Step 1: Upload */}
              <div className="flex items-center gap-3 text-sm">
                {analysisSteps.uploading === 'loading' ? (
                  <svg className="w-5 h-5 text-indigo-600 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-green-600 animate-scale-in" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
                <span className={`font-medium ${analysisSteps.uploading === 'complete' ? 'text-gray-700' : 'text-indigo-700'}`}>
                  {analysisSteps.uploading === 'loading' ? 'Đang tải ảnh lên...' : 'Hoàn thành'}
                </span>
              </div>

              {/* Step 2: Material */}
              {analysisSteps.material.status === 'complete' && (
                <div className="flex items-start gap-3 text-sm animate-fade-in-up">
                  <svg className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                  </svg>
                  <div className="flex-1">
                    <span className="text-gray-600">Chất liệu:</span>
                    <span className="ml-2 font-semibold text-gray-900">{analysisSteps.material.value}</span>
                  </div>
                </div>
              )}

              {/* Step 3: Color */}
              {analysisSteps.color.status === 'complete' && (
                <div className="flex items-start gap-3 text-sm animate-fade-in-up">
                  <svg className="w-5 h-5 text-pink-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                  </svg>
                  <div className="flex-1">
                    <span className="text-gray-600">Màu sắc:</span>
                    <span className="ml-2 font-semibold text-gray-900">{analysisSteps.color.value}</span>
                  </div>
                </div>
              )}

              {/* Step 4: Pattern */}
              {analysisSteps.pattern.status === 'complete' && (
                <div className="flex items-start gap-3 text-sm animate-fade-in-up">
                  <svg className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zM14 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1h-4a1 1 0 01-1-1v-3z" />
                  </svg>
                  <div className="flex-1">
                    <span className="text-gray-600">Họa tiết:</span>
                    <span className="ml-2 font-semibold text-gray-900">{analysisSteps.pattern.value}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* AI Analysis Result Summary */}
        {analysisResult && (
          <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-300 rounded-lg">
            <div className="flex items-start gap-3">
              <SparklesIcon className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900 mb-2">
                  📊 Kết quả phân tích
                </p>
                <div className="grid grid-cols-3 gap-3 text-sm">
                  <div>
                    <span className="text-gray-600">Chất liệu:</span>
                    <p className="font-medium text-gray-900">{analysisResult.material}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Màu sắc:</span>
                    <p className="font-medium text-gray-900">{analysisResult.color}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Họa tiết:</span>
                    <p className="font-medium text-gray-900">{analysisResult.pattern}</p>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  💡 {analysisResult.analysis_notes}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Basic Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Tên vải */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tên vải <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="VD: Vải Cotton Cao Cấp"
            disabled={isSubmitting}
          />
          {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
        </div>

        {/* Mã vải */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Mã vải
          </label>
          <input
            type="text"
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Tự động tạo nếu để trống"
            disabled={isSubmitting}
          />
        </div>

        {/* Chất liệu */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Chất liệu <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.material}
            onChange={(e) => setFormData({ ...formData, material: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="VD: Cotton, Polyester, Lụa"
            disabled={isSubmitting}
          />
          {errors.material && <p className="mt-1 text-sm text-red-600">{errors.material}</p>}
        </div>

        {/* Màu sắc */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Màu sắc <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.color}
            onChange={(e) => setFormData({ ...formData, color: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="VD: Đỏ, Xanh, Trắng"
            disabled={isSubmitting}
          />
          {errors.color && <p className="mt-1 text-sm text-red-600">{errors.color}</p>}
        </div>

        {/* Họa tiết */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Họa tiết
          </label>
          <input
            type="text"
            value={formData.pattern}
            onChange={(e) => setFormData({ ...formData, pattern: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="VD: Trơn, Kẻ sọc, Hoa văn"
            disabled={isSubmitting}
          />
        </div>

        {/* Xuất xứ */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Xuất xứ
          </label>
          <input
            type="text"
            value={formData.origin}
            onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="VD: Việt Nam, Trung Quốc, Hàn Quốc"
            disabled={isSubmitting}
          />
        </div>

        {/* Chiều rộng */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Chiều rộng (cm)
          </label>
          <input
            type="number"
            value={formData.width}
            onChange={(e) => setFormData({ ...formData, width: parseFloat(e.target.value) || 0 })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="140"
            disabled={isSubmitting}
          />
          {errors.width && <p className="mt-1 text-sm text-red-600">{errors.width}</p>}
        </div>

        {/* Trọng lượng */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Trọng lượng (g/m²)
          </label>
          <input
            type="number"
            value={formData.weight}
            onChange={(e) => setFormData({ ...formData, weight: parseFloat(e.target.value) || 0 })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="200"
            disabled={isSubmitting}
          />
          {errors.weight && <p className="mt-1 text-sm text-red-600">{errors.weight}</p>}
        </div>

        {/* Giá */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Giá (VNĐ/m)
          </label>
          <input
            type="number"
            value={formData.price_per_meter}
            onChange={(e) => setFormData({ ...formData, price_per_meter: parseFloat(e.target.value) || 0 })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="50000"
            disabled={isSubmitting}
          />
          {errors.price_per_meter && <p className="mt-1 text-sm text-red-600">{errors.price_per_meter}</p>}
        </div>

        {/* Số lượng tồn kho */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tồn kho (m)
          </label>
          <input
            type="number"
            value={formData.stock_quantity}
            onChange={(e) => setFormData({ ...formData, stock_quantity: parseFloat(e.target.value) || 0 })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="0"
            disabled={isSubmitting}
          />
        </div>
      </div>

      {/* Mô tả */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Mô tả chi tiết
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Mô tả chi tiết về vải..."
          disabled={isSubmitting}
        />
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          disabled={isSubmitting}
        >
          Hủy
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Đang lưu...' : 'Lưu vải mới'}
        </button>
      </div>
    </form>
  )
}


