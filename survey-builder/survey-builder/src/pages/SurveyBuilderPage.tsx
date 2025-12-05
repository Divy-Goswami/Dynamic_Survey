import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Container,
  Box,
  Typography,
  Button,
  TextField,
  Paper,
  Alert,
  CircularProgress,
  Divider,
  IconButton,
  FormControlLabel,
  Switch,
} from '@mui/material'
import SaveIcon from '@mui/icons-material/Save'
import PreviewIcon from '@mui/icons-material/Preview'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import AddIcon from '@mui/icons-material/Add'
import { supabase, Survey } from '@/lib/supabase'
import { useQuestions } from '@/hooks/useQuestions'
import QuestionList from '@/components/survey-builder/QuestionList'
import AddQuestionDialog from '@/components/survey-builder/AddQuestionDialog'
import AdvancedSettingsDialog from '@/components/survey-builder/AdvancedSettingsDialog'
import SettingsIcon from '@mui/icons-material/Settings'

export default function SurveyBuilderPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [survey, setSurvey] = useState<Survey | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [isPublished, setIsPublished] = useState(false)
  const [addQuestionOpen, setAddQuestionOpen] = useState(false)
  const [advancedSettingsOpen, setAdvancedSettingsOpen] = useState(false)

  const { questions, fetchQuestions } = useQuestions(id)

  useEffect(() => {
    async function loadSurvey() {
      if (!id || id === 'create') {
        setLoading(false)
        return
      }

      try {
        const { data, error } = await supabase
          .from('surveys')
          .select('*')
          .eq('id', id)
          .maybeSingle()

        if (error) throw error

        if (data) {
          setSurvey(data)
          setTitle(data.title)
          setDescription(data.description || '')
          setIsPublished(data.is_published)
        }
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadSurvey()
  }, [id])

  const handleSave = async () => {
    if (!title.trim()) {
      setError('Survey title is required')
      return
    }

    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const { data, error } = await supabase
        .from('surveys')
        .update({
          title,
          description,
          is_published: isPublished,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .maybeSingle()

      if (error) throw error

      setSurvey(data)
      setSuccess('Survey saved successfully')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err: any) {
      setError(err.message || 'Failed to save survey')
    } finally {
      setSaving(false)
    }
  }

  const handlePreview = () => {
    navigate(`/survey/${id}/take`)
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
      <Box sx={{ mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/dashboard')}
          sx={{ mb: 2 }}
        >
          Back to Dashboard
        </Button>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4" fontWeight="bold">
            {id === 'create' ? 'Create Survey' : 'Edit Survey'}
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<SettingsIcon />}
              onClick={() => setAdvancedSettingsOpen(true)}
              disabled={!id || id === 'create'}
            >
              Advanced Settings
            </Button>
            <Button
              variant="outlined"
              startIcon={<PreviewIcon />}
              onClick={handlePreview}
              disabled={!id || id === 'create'}
            >
              Preview
            </Button>
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={handleSave}
              disabled={saving || !id || id === 'create'}
            >
              {saving ? 'Saving...' : 'Save'}
            </Button>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
            {success}
          </Alert>
        )}
      </Box>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom fontWeight="bold">
          Survey Settings
        </Typography>
        <TextField
          fullWidth
          label="Survey Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          margin="normal"
          required
        />
        <TextField
          fullWidth
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          margin="normal"
          multiline
          rows={3}
        />
        <FormControlLabel
          control={
            <Switch
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
            />
          }
          label="Publish Survey"
          sx={{ mt: 2 }}
        />
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6" fontWeight="bold">
            Questions
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setAddQuestionOpen(true)}
            disabled={!id || id === 'create'}
          >
            Add Question
          </Button>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {id && id !== 'create' ? (
          <QuestionList surveyId={id} questions={questions} onUpdate={fetchQuestions} />
        ) : (
          <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 4 }}>
            Save the survey first to start adding questions
          </Typography>
        )}
      </Paper>

      {id && id !== 'create' && (
        <>
          <AddQuestionDialog
            open={addQuestionOpen}
            onClose={() => setAddQuestionOpen(false)}
            surveyId={id}
            onQuestionAdded={fetchQuestions}
          />
          <AdvancedSettingsDialog
            open={advancedSettingsOpen}
            onClose={() => setAdvancedSettingsOpen(false)}
            survey={survey}
            onSave={async (settings) => {
              if (id && survey) {
                await supabase
                  .from('surveys')
                  .update({ settings, updated_at: new Date().toISOString() })
                  .eq('id', id)
                setSurvey({ ...survey, settings })
              }
            }}
          />
        </>
      )}
    </Container>
  )
}
