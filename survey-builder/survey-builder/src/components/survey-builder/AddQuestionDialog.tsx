import { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Alert,
} from '@mui/material'
import { useQuestions } from '@/hooks/useQuestions'
import { SurveyQuestion } from '@/lib/supabase'

interface AddQuestionDialogProps {
  open: boolean
  onClose: () => void
  surveyId: string
  onQuestionAdded: () => void
}

export default function AddQuestionDialog({
  open,
  onClose,
  surveyId,
  onQuestionAdded,
}: AddQuestionDialogProps) {
  const { questions, addQuestion } = useQuestions(surveyId)
  const [questionText, setQuestionText] = useState('')
  const [questionType, setQuestionType] = useState<SurveyQuestion['question_type']>('text')
  const [options, setOptions] = useState('')
  const [helpText, setHelpText] = useState('')
  const [isRequired, setIsRequired] = useState(false)
  const [error, setError] = useState('')
  const [adding, setAdding] = useState(false)

  const handleAdd = async () => {
    if (!questionText.trim()) {
      setError('Question text is required')
      return
    }

    if (['multiple_choice', 'checkbox', 'dropdown', 'ranking', 'matrix'].includes(questionType) && !options.trim()) {
      setError('Options are required for this question type')
      return
    }
    
    if (questionType === 'matrix' && !options.includes('|')) {
      setError('Matrix questions require rows and columns separated by | (e.g., Row1,Row2|Col1,Col2)')
      return
    }

    setAdding(true)
    setError('')

    try {
      const newQuestion: Omit<SurveyQuestion, 'id'> = {
        survey_id: surveyId,
        question_text: questionText,
        question_type: questionType,
        options: options ? options.split(',').map((o) => o.trim()) : [],
        validation_rules: {},
        order_index: questions.length,
        is_required: isRequired,
        help_text: helpText,
        skip_logic: {},
      }

      await addQuestion(newQuestion)
      onQuestionAdded()
      handleClose()
    } catch (err: any) {
      setError(err.message || 'Failed to add question')
    } finally {
      setAdding(false)
    }
  }

  const handleClose = () => {
    setQuestionText('')
    setQuestionType('text')
    setOptions('')
    setHelpText('')
    setIsRequired(false)
    setError('')
    onClose()
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>Add New Question</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <FormControl fullWidth margin="normal">
          <InputLabel>Question Type</InputLabel>
          <Select
            value={questionType}
            onChange={(e) => setQuestionType(e.target.value as SurveyQuestion['question_type'])}
            label="Question Type"
          >
            <MenuItem value="text">Text Input</MenuItem>
            <MenuItem value="multiple_choice">Multiple Choice</MenuItem>
            <MenuItem value="checkbox">Checkbox</MenuItem>
            <MenuItem value="dropdown">Dropdown</MenuItem>
            <MenuItem value="rating">Rating</MenuItem>
            <MenuItem value="ranking">Ranking</MenuItem>
            <MenuItem value="matrix">Matrix/Grid</MenuItem>
            <MenuItem value="file">File Upload</MenuItem>
            <MenuItem value="date">Date</MenuItem>
            <MenuItem value="time">Time</MenuItem>
          </Select>
        </FormControl>

        <TextField
          fullWidth
          label="Question Text"
          value={questionText}
          onChange={(e) => setQuestionText(e.target.value)}
          margin="normal"
          required
          multiline
          rows={2}
        />

        {['multiple_choice', 'checkbox', 'dropdown', 'ranking'].includes(questionType) && (
          <TextField
            fullWidth
            label="Options (comma-separated)"
            value={options}
            onChange={(e) => setOptions(e.target.value)}
            margin="normal"
            required
            helperText="Enter options separated by commas (e.g., Option 1, Option 2, Option 3)"
            multiline
            rows={2}
          />
        )}
        
        {questionType === 'matrix' && (
          <TextField
            fullWidth
            label="Matrix Configuration"
            value={options}
            onChange={(e) => setOptions(e.target.value)}
            margin="normal"
            required
            helperText="Format: Rows separated by commas, then |, then Columns (e.g., Row1,Row2,Row3|Col1,Col2,Col3)"
            multiline
            rows={3}
            placeholder="Row1,Row2,Row3|Col1,Col2,Col3"
          />
        )}
        
        {questionType === 'file' && (
          <Alert severity="info" sx={{ mt: 2 }}>
            File uploads will be configured in survey settings. Default: Max 10MB per file, common file types allowed.
          </Alert>
        )}

        <TextField
          fullWidth
          label="Help Text (optional)"
          value={helpText}
          onChange={(e) => setHelpText(e.target.value)}
          margin="normal"
          helperText="Additional guidance or instructions for respondents"
        />

        <FormControlLabel
          control={
            <Switch
              checked={isRequired}
              onChange={(e) => setIsRequired(e.target.checked)}
            />
          }
          label="Make this question required"
          sx={{ mt: 2 }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleAdd} variant="contained" disabled={adding}>
          {adding ? 'Adding...' : 'Add Question'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
