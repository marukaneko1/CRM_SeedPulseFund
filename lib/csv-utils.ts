// CSV export utilities

export function exportToCSV(data: any[], filename: string, columns: { key: string, label: string }[]) {
  // Create CSV header
  const headers = columns.map(col => col.label).join(',')
  
  // Create CSV rows
  const rows = data.map(item => {
    return columns.map(col => {
      const value = col.key.includes('.') 
        ? col.key.split('.').reduce((obj, key) => obj?.[key], item)
        : item[col.key]
      
      // Escape commas and quotes
      if (value === null || value === undefined) return ''
      const stringValue = String(value)
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`
      }
      return stringValue
    }).join(',')
  })

  // Combine headers and rows
  const csv = [headers, ...rows].join('\n')

  // Create and download file
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  
  link.setAttribute('href', url)
  link.setAttribute('download', `${filename}.csv`)
  link.style.visibility = 'hidden'
  
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// CSV import utilities
export function parseCSV(csvString: string): any[] {
  const lines = csvString.split('\n').filter(line => line.trim())
  if (lines.length === 0) return []

  const headers = lines[0].split(',').map(h => h.trim())
  const data = []

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''))
    const row: any = {}
    
    headers.forEach((header, index) => {
      row[header] = values[index] || ''
    })
    
    data.push(row)
  }

  return data
}

// Excel export utilities  
export function exportToExcel(data: any[], filename: string, columns: { key: string, label: string }[]) {
  // For now, use CSV export (Excel can open CSV files)
  // Later can be upgraded to use a library like xlsx
  exportToCSV(data, filename, columns)
}

