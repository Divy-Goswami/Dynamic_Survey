import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Container,
  Typography,
  Button,
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import AnalyticsIcon from '@mui/icons-material/Analytics'
import LinkIcon from '@mui/icons-material/Link'
import PublishIcon from '@mui/icons-material/Publish'
import { useSurveys } from '@/hooks/useSurveys'
import { Survey } from '@/lib/supabase'
import TemplateSelector from '@/components/survey-builder/TemplateSelector'
import { SurveyTemplate } from '@/data/surveyTemplates'
import { supabase } from '@/lib/supabase'

export default function DashboardPage() {
  const navigate = useNavigate()
  const { surveys, loading, createSurvey, updateSurvey, deleteSurvey } = useSurveys()
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedSurvey, setSelectedSurvey] = useState<Survey | null>(null)
  const [newTitle, setNewTitle] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const [error, setError] = useState('')
  const [creating, setCreating] = useState(false)
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false)

  const handleCreate = async () => {
    if (!newTitle.trim()) {
      setError('Survey title is required')
      return
    }

    setCreating(true)
    setError('')

    try {
      const survey = await createSurvey(newTitle, newDescription)
      setCreateDialogOpen(false)
      setNewTitle('')
      setNewDescription('')
      if (survey) {
        navigate(`/survey/${survey.id}/edit`)
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create survey')
    } finally {
      setCreating(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedSurvey) return

    try {
      await deleteSurvey(selectedSurvey.id)
      setDeleteDialogOpen(false)
      setSelectedSurvey(null)
    } catch (err: any) {
      setError(err.message || 'Failed to delete survey')
    }
  }

  const handleTogglePublish = async (survey: Survey) => {
    try {
      await updateSurvey(survey.id, { is_published: !survey.is_published })
    } catch (err: any) {
      setError(err.message || 'Failed to update survey')
    }
  }

  const copyShareLink = (surveyId: string) => {
    const link = `${window.location.origin}/survey/${surveyId}/take`
    navigator.clipboard.writeText(link)
    alert('Survey link copied to clipboard!')
  }

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress />
      </Container>
    )
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" fontWeight="bold">
          My Surveys
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            onClick={() => setTemplateDialogOpen(true)}
            size="large"
          >
            Use Template
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setCreateDialogOpen(true)}
            size="large"
          >
            Create Survey
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {surveys.length === 0 ? (
        <Card sx={{ p: 6, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            You haven't created any surveys yet
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Get started by creating your first survey
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setCreateDialogOpen(true)}
          >
            Create Your First Survey
          </Button>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {surveys.map((survey) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={survey.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ mb: 2 }}>
                    <Chip
                      label={survey.is_published ? 'Published' : 'Draft'}
                      color={survey.is_published ? 'success' : 'default'}
                      size="small"
                    />
                  </Box>
                  <Typography variant="h6" gutterBottom>
                    {survey.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {survey.description || 'No description'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Created {new Date(survey.created_at).toLocaleDateString()}
                  </Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                  <Box>
                    <IconButton
                      size="small"
                      onClick={() => navigate(`/survey/${survey.id}/edit`)}
                      title="Edit"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => navigate(`/survey/${survey.id}/analytics`)}
                      title="Analytics"
                    >
                      <AnalyticsIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => copyShareLink(survey.id)}
                      title="Copy Link"
                    >
                      <LinkIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleTogglePublish(survey)}
                      title={survey.is_published ? 'Unpublish' : 'Publish'}
                      color={survey.is_published ? 'success' : 'default'}
                    >
                      <PublishIcon />
                    </IconButton>
                  </Box>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => {
                      setSelectedSurvey(survey)
                      setDeleteDialogOpen(true)
                    }}
                    title="Delete"
                  >
                    <DeleteIcon />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Survey</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <TextField
            autoFocus
            fullWidth
            label="Survey Title"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Description"
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
            margin="normal"
            multiline
            rows={3}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleCreate} variant="contained" disabled={creating}>
            {creating ? 'Creating...' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Survey</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{selectedSurvey?.title}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <TemplateSelector
        open={templateDialogOpen}
        onClose={() => setTemplateDialogOpen(false)}
        onSelect={async (template: SurveyTemplate) => {
          try {
            setCreating(true)
            const survey = await createSurvey(
              template.survey.title || 'New Survey',
              template.survey.description || ''
            )
            if (survey && template.survey.settings) {
              await updateSurvey(survey.id, { settings: template.survey.settings })
            }
            if (survey) {
              // Add questions from template
              for (const q of template.questions) {
                await supabase.from('survey_questions').insert({
                  survey_id: survey.id,
                  question_text: q.question_text || '',
                  question_type: q.question_type || 'text',
                  options: q.options || [],
                  validation_rules: q.validation_rules || {},
                  order_index: q.order_index || 0,
                  is_required: q.is_required || false,
                  help_text: q.help_text || '',
                  skip_logic: q.skip_logic || {},
                  score: q.score,
                })
              }
              navigate(`/survey/${survey.id}/edit`)
            }
          } catch (err: any) {
            setError(err.message || 'Failed to create survey from template')
          } finally {
            setCreating(false)
          }
        }}
      />
    </Container>
  )
}
