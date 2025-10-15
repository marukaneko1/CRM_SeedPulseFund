"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Download, Upload, FileSpreadsheet, X, CheckCircle, AlertCircle } from "lucide-react"
import { exportToCSV, parseCSV } from "@/lib/csv-utils"

interface BulkActionsProps {
  data: any[]
  columns: { key: string, label: string }[]
  entityName: string
  onImport: (data: any[]) => Promise<void>
}

export function BulkActions({ data, columns, entityName, onImport }: BulkActionsProps) {
  const [showImport, setShowImport] = useState(false)
  const [importing, setImporting] = useState(false)
  const [importResult, setImportResult] = useState<{ success: number, errors: string[] } | null>(null)

  const handleExport = () => {
    exportToCSV(data, `${entityName}-export-${new Date().toISOString().split('T')[0]}`, columns)
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setImporting(true)
    setImportResult(null)

    try {
      const text = await file.text()
      const parsedData = parseCSV(text)

      // Call the import handler
      await onImport(parsedData)
      
      setImportResult({
        success: parsedData.length,
        errors: []
      })

      setTimeout(() => {
        setShowImport(false)
        setImportResult(null)
      }, 3000)
    } catch (error: any) {
      setImportResult({
        success: 0,
        errors: [error.message || 'Failed to import data']
      })
    } finally {
      setImporting(false)
    }
  }

  return (
    <div className="flex gap-2">
      <Button variant="outline" onClick={handleExport} disabled={data.length === 0}>
        <Download className="w-4 h-4 mr-2" />
        Export CSV
      </Button>
      <Button variant="outline" onClick={() => setShowImport(true)}>
        <Upload className="w-4 h-4 mr-2" />
        Import CSV
      </Button>

      {/* Import Modal */}
      {showImport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Import {entityName}</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setShowImport(false)}>
                <X className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent>
              {importResult ? (
                <div className={`p-4 rounded-md ${importResult.errors.length > 0 ? 'bg-red-50' : 'bg-green-50'}`}>
                  {importResult.errors.length > 0 ? (
                    <>
                      <div className="flex items-center gap-2 mb-2">
                        <AlertCircle className="w-5 h-5 text-red-600" />
                        <p className="font-semibold text-red-600">Import Failed</p>
                      </div>
                      <ul className="text-sm text-red-600 list-disc list-inside">
                        {importResult.errors.map((error, i) => (
                          <li key={i}>{error}</li>
                        ))}
                      </ul>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <p className="font-semibold text-green-600">Import Successful!</p>
                      </div>
                      <p className="text-sm text-green-600">
                        Successfully imported {importResult.success} records
                      </p>
                    </>
                  )}
                </div>
              ) : (
                <>
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-2">
                      Upload a CSV file to import {entityName}. The file should include the following columns:
                    </p>
                    <div className="bg-gray-50 p-3 rounded-md">
                      <code className="text-xs text-gray-700">
                        {columns.map(c => c.label).join(', ')}
                      </code>
                    </div>
                  </div>

                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <FileSpreadsheet className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <span className="text-blue-600 hover:text-blue-700 font-medium">
                        Click to upload
                      </span>
                      <span className="text-gray-600"> or drag and drop</span>
                      <input
                        id="file-upload"
                        type="file"
                        accept=".csv"
                        onChange={handleFileUpload}
                        className="hidden"
                        disabled={importing}
                      />
                    </label>
                    <p className="text-xs text-gray-500 mt-2">CSV files only</p>
                  </div>

                  {importing && (
                    <div className="mt-4 text-center">
                      <p className="text-sm text-gray-600">Importing...</p>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

