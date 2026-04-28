export const reportService = {
  /**
   * Download settlement PDF report
   */
  async downloadSettlementPdf(monthId: string): Promise<void> {
    const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'
    const token = localStorage.getItem('accessToken')
    
    // We can't easily use apiClient for direct file downloads with headers in a simple <a> tag,
    // so we fetch and create a blob URL, or redirect with token in query (less secure)
    // Professional approach: Fetch as blob
    const response = await fetch(`${backendUrl}/api/v1/reports/settlement/${monthId}/pdf`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    if (!response.ok) {
      throw new Error('Failed to download report')
    }
    
    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `settlement-${monthId}.pdf`)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
  },

  async getSettlementPdf(monthId: string): Promise<void> {
    return this.downloadSettlementPdf(monthId)
  },
}
