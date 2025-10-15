"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { X, Check, Pencil, Type } from "lucide-react"

interface SignaturePadProps {
  onSave: (signatureData: string, signatureType: 'draw' | 'type') => void
  onCancel: () => void
}

export function SignaturePad({ onSave, onCancel }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [typedSignature, setTypedSignature] = useState('')
  const [selectedFont, setSelectedFont] = useState('cursive')

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight

    // Set drawing styles
    ctx.strokeStyle = '#000'
    ctx.lineWidth = 2
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
  }, [])

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    setIsDrawing(true)
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top

    ctx.beginPath()
    ctx.moveTo(x, y)
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top

    ctx.lineTo(x, y)
    ctx.stroke()
  }

  const stopDrawing = () => {
    setIsDrawing(false)
  }

  const clearCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)
  }

  const saveDrawnSignature = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const signatureData = canvas.toDataURL('image/png')
    onSave(signatureData, 'draw')
  }

  const saveTypedSignature = () => {
    if (!typedSignature.trim()) return

    // Create a temporary canvas for typed signature
    const canvas = document.createElement('canvas')
    canvas.width = 400
    canvas.height = 100
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.fillStyle = '#fff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    ctx.fillStyle = '#000'
    ctx.font = `48px ${selectedFont}`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(typedSignature, canvas.width / 2, canvas.height / 2)

    const signatureData = canvas.toDataURL('image/png')
    onSave(signatureData, 'type')
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Sign Document</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="draw">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="draw">
              <Pencil className="w-4 h-4 mr-2" />
              Draw
            </TabsTrigger>
            <TabsTrigger value="type">
              <Type className="w-4 h-4 mr-2" />
              Type
            </TabsTrigger>
          </TabsList>

          {/* Draw Tab */}
          <TabsContent value="draw" className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-2 bg-white">
              <canvas
                ref={canvasRef}
                className="w-full h-48 cursor-crosshair"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={clearCanvas}>
                <X className="w-4 h-4 mr-2" />
                Clear
              </Button>
              <Button onClick={saveDrawnSignature} className="flex-1">
                <Check className="w-4 h-4 mr-2" />
                Save Signature
              </Button>
              <Button variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            </div>
          </TabsContent>

          {/* Type Tab */}
          <TabsContent value="type" className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Type your name</label>
              <Input
                placeholder="Enter your full name"
                value={typedSignature}
                onChange={(e) => setTypedSignature(e.target.value)}
                className="text-2xl"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Font Style</label>
              <div className="grid grid-cols-3 gap-2">
                {['cursive', 'serif', 'sans-serif'].map((font) => (
                  <button
                    key={font}
                    onClick={() => setSelectedFont(font)}
                    className={`p-3 border rounded-lg text-center ${
                      selectedFont === font ? 'border-blue-600 bg-blue-50' : 'border-gray-300'
                    }`}
                  >
                    <div style={{ fontFamily: font }} className="text-xl">
                      {typedSignature || 'Sample'}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {typedSignature && (
              <div className="border-2 border-gray-300 rounded-lg p-6 bg-white text-center">
                <div style={{ fontFamily: selectedFont }} className="text-4xl">
                  {typedSignature}
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <Button onClick={saveTypedSignature} disabled={!typedSignature.trim()} className="flex-1">
                <Check className="w-4 h-4 mr-2" />
                Save Signature
              </Button>
              <Button variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
