import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Container,
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import DownloadIcon from '@mui/icons-material/Download'
import PeopleIcon from '@mui/icons-material/People'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import PercentIcon from '@mui/icons-material/Percent'
import { supabase } from '@/lib/supabase'
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface AnalyticsData {
  totalResponses: number
  completedResponses: number
  completionRate: number
  questionAnalytics: any[]
  responses: any[]
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D']

export default function AnalyticsPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    async function loadAnalytics() {
      if (!id) return

      try {
        const { data, error } = await supabase.functions.invoke('get-analytics', {
          body: { surveyId: id },
        })

        if (error) throw error

        setAnalytics(data.data)
      } catch (err: any) {
        setError(err.message || 'Failed to load analytics')
      } finally {
        setLoading(false)
      }
    }

    loadAnalytics()
  }, [id])

  const handleExport = async (format: 'json' | 'csv' | 'excel') => {
    setExporting(true)
    try {
      if (format === 'excel') {
        // Generate Excel file client-side
        const { data: analyticsData, error: analyticsError } = await supabase.functions.invoke('get-analytics', {
          body: { surveyId: id },
        })
        if (analyticsError) throw analyticsError

        // Convert to Excel format (CSV with proper formatting for Excel)
        const excelData = convertToExcel(analyticsData.data)
        const blob = new Blob([excelData], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `survey-${id}-responses.xlsx`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
        return
      }

      const { data, error } = await supabase.functions.invoke('export-responses', {
        body: { surveyId: id, format },
      })

      if (error) throw error

      if (format === 'csv') {
        // Create a download link for CSV
        const blob = new Blob([data], { type: 'text/csv' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `survey-${id}-responses.csv`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
      } else {
        // Download JSON
        const blob = new Blob([JSON.stringify(data.data, null, 2)], {
          type: 'application/json',
        })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `survey-${id}-responses.json`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
      }
    } catch (err: any) {
      setError(err.message || 'Failed to export data')
    } finally {
      setExporting(false)
    }
  }

  const convertToExcel = (data: AnalyticsData): string => {
    // Create a simple Excel-compatible CSV with UTF-8 BOM for Excel
    const BOM = '\uFEFF'
    let csv = BOM
    
    // Summary sheet
    csv += 'Summary\n'
    csv += `Total Responses,${data.totalResponses}\n`
    csv += `Completed Responses,${data.completedResponses}\n`
    csv += `Completion Rate,${data.completionRate}%\n\n`
    
    // Questions sheet
    csv += 'Question Analytics\n'
    data.questionAnalytics.forEach((qa, idx) => {
      csv += `\nQuestion ${idx + 1}: ${qa.questionText}\n`
      csv += `Total Responses,${qa.totalResponses}\n`
      
      if (qa.optionCounts) {
        csv += 'Option,Count\n'
        Object.entries(qa.optionCounts).forEach(([option, count]) => {
          csv += `"${option}",${count}\n`
        })
      }
      
      if (qa.averageRating !== undefined) {
        csv += `Average Rating,${qa.averageRating}\n`
      }
      
      if (qa.averagePositions) {
        csv += 'Option,Average Position\n'
        Object.entries(qa.averagePositions).forEach(([option, pos]) => {
          csv += `"${option}",${pos}\n`
        })
      }
      
      if (qa.responses && qa.responses.length > 0) {
        csv += 'Text Responses\n'
        qa.responses.forEach((resp: string) => {
          csv += `"${resp.replace(/"/g, '""')}"\n`
        })
      }
    })
    
    return csv
  }

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress />
      </Container>
    )
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    )
  }

  if (!analytics) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="info">No analytics data available</Alert>
      </Container>
    )
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/dashboard')}
          sx={{ mb: 2 }}
        >
          Back to Dashboard
        </Button>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4" fontWeight="bold">
            Survey Analytics
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={() => handleExport('csv')}
              disabled={exporting}
            >
              CSV
            </Button>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={() => handleExport('json')}
              disabled={exporting}
            >
              JSON
            </Button>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={() => handleExport('excel')}
              disabled={exporting}
            >
              Excel
            </Button>
          </Box>
        </Box>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <PeopleIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {analytics.totalResponses}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Responses
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <CheckCircleIcon sx={{ fontSize: 40, color: 'success.main' }} />
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {analytics.completedResponses}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Completed
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <PercentIcon sx={{ fontSize: 40, color: 'info.main' }} />
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {analytics.completionRate}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Completion Rate
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom fontWeight="bold">
          Question Analytics
        </Typography>

        {analytics.questionAnalytics.map((qa, index) => (
          <Box key={qa.questionId} sx={{ mb: 4 }}>
            <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
              {index + 1}. {qa.questionText}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
              {qa.totalResponses} responses
            </Typography>

            {qa.optionCounts && (
              <Box sx={{ mt: 2 }}>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={Object.entries(qa.optionCounts).map(([option, count]) => ({
                      option,
                      count,
                    }))}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="option" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            )}

            {qa.averageRating !== undefined && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="h5" color="primary" fontWeight="bold">
                  Average Rating: {qa.averageRating}
                </Typography>
                {qa.ratingDistribution && (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={Object.entries(qa.ratingDistribution).map(([rating, count]) => ({
                          name: `${rating} Stars`,
                          value: count,
                        }))}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(entry) => `${entry.name}: ${entry.value}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {Object.entries(qa.ratingDistribution).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </Box>
            )}

            {qa.responses && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Text Responses:
                </Typography>
                <Box sx={{ maxHeight: 200, overflow: 'auto' }}>
                  {qa.responses.slice(0, 10).map((response: string, idx: number) => (
                    <Typography key={idx} variant="body2" sx={{ p: 1, bgcolor: 'grey.50', mb: 1, borderRadius: 1 }}>
                      {response}
                    </Typography>
                  ))}
                  {qa.responses.length > 10 && (
                    <Typography variant="caption" color="text.secondary">
                      ... and {qa.responses.length - 10} more responses
                    </Typography>
                  )}
                </Box>
              </Box>
            )}
          </Box>
        ))}
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom fontWeight="bold">
          Recent Responses
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Response ID</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Started</TableCell>
                <TableCell>Completed</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {analytics.responses.slice(0, 10).map((response) => (
                <TableRow key={response.id}>
                  <TableCell>
                    <Typography variant="caption">{response.id.substring(0, 8)}...</Typography>
                  </TableCell>
                  <TableCell>{response.respondentEmail || 'Anonymous'}</TableCell>
                  <TableCell>
                    {new Date(response.startedAt).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    {response.completedAt
                      ? new Date(response.completedAt).toLocaleString()
                      : '-'}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={response.completedAt ? 'Completed' : 'In Progress'}
                      color={response.completedAt ? 'success' : 'warning'}
                      size="small"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        {analytics.responses.length === 0 && (
          <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 4 }}>
            No responses yet
          </Typography>
        )}
      </Paper>
    </Container>
  )
}
