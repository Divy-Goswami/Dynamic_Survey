import { useState } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  IconButton,
  Chip,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormControlLabel,
  Switch,
  Button,
  Collapse,
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import DragIndicatorIcon from '@mui/icons-material/DragIndicator'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import SaveIcon from '@mui/icons-material/Save'
import { SurveyQuestion } from '@/lib/supabase'
import { useQuestions } from '@/hooks/useQuestions'

interface QuestionListProps {
  surveyId: string
  questions: SurveyQuestion[]
  onUpdate: () => void
}

export default function QuestionList({ surveyId, questions, onUpdate }: QuestionListProps) {
  const { updateQuestion, deleteQuestion } = useQuestions(surveyId)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Partial<SurveyQuestion>>({})

  const handleEdit = (question: SurveyQuestion) => {
    setEditingId(question.id)
    setEditForm(question)
    setExpandedId(question.id)
  }

  const handleSaveEdit = async () => {
    if (!editingId) return

    try {
      await updateQuestion(editingId, editForm)
      setEditingId(null)
      setEditForm({})
      onUpdate()
    } catch (error) {
      console.error('Failed to update question:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this question?')) {
      try {
        await deleteQuestion(id)
        onUpdate()
      } catch (error) {
        console.error('Failed to delete question:', error)
      }
    }
  }

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id)
  }

  if (questions.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 4 }}>
        No questions yet. Click "Add Question" to get started.
      </Typography>
    )
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {questions.map((question, index) => {
        const isEditing = editingId === question.id
        const isExpanded = expandedId === question.id

        return (
          <Card key={question.id} variant="outlined">
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                <DragIndicatorIcon sx={{ color: 'text.secondary', cursor: 'grab', mt: 1 }} />
                
                <Box sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Question {index + 1}
                    </Typography>
                    <Chip
                      label={question.question_type.replace('_', ' ')}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                    {question.is_required && (
                      <Chip label="Required" size="small" color="error" />
                    )}
                  </Box>

                  {isEditing ? (
                    <Box sx={{ mt: 2 }}>
                      <TextField
                        fullWidth
                        label="Question Text"
                        value={editForm.question_text || ''}
                        onChange={(e) =>
                          setEditForm({ ...editForm, question_text: e.target.value })
                        }
                        margin="normal"
                      />

                      <FormControl fullWidth margin="normal">
                        <InputLabel>Question Type</InputLabel>
                        <Select
                          value={editForm.question_type || ''}
                          onChange={(e) =>
                            setEditForm({ ...editForm, question_type: e.target.value as any })
                          }
                          label="Question Type"
                        >
                          <MenuItem value="text">Text</MenuItem>
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

                      {['multiple_choice', 'checkbox', 'dropdown', 'ranking', 'matrix'].includes(editForm.question_type || '') && (
                        <TextField
                          fullWidth
                          label="Options (comma-separated)"
                          value={(editForm.options || []).join(', ')}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              options: e.target.value.split(',').map((o) => o.trim()),
                            })
                          }
                          margin="normal"
                          helperText="Enter options separated by commas"
                        />
                      )}

                      <TextField
                        fullWidth
                        label="Help Text"
                        value={editForm.help_text || ''}
                        onChange={(e) =>
                          setEditForm({ ...editForm, help_text: e.target.value })
                        }
                        margin="normal"
                      />

                      <FormControlLabel
                        control={
                          <Switch
                            checked={editForm.is_required || false}
                            onChange={(e) =>
                              setEditForm({ ...editForm, is_required: e.target.checked })
                            }
                          />
                        }
                        label="Required"
                        sx={{ mt: 2 }}
                      />

                      <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                        <Button
                          variant="contained"
                          startIcon={<SaveIcon />}
                          onClick={handleSaveEdit}
                        >
                          Save
                        </Button>
                        <Button onClick={() => setEditingId(null)}>Cancel</Button>
                      </Box>
                    </Box>
                  ) : (
                    <>
                      <Typography variant="body1" fontWeight="medium">
                        {question.question_text}
                      </Typography>

                      {question.help_text && (
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                          {question.help_text}
                        </Typography>
                      )}

                      <Collapse in={isExpanded}>
                        <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                          {question.options && question.options.length > 0 && (
                            <Box sx={{ mb: 1 }}>
                              <Typography variant="caption" fontWeight="bold">Options:</Typography>
                              <Typography variant="body2">
                                {question.options.join(', ')}
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      </Collapse>
                    </>
                  )}
                </Box>

                <Box>
                  {!isEditing && (
                    <>
                      <IconButton size="small" onClick={() => toggleExpand(question.id)}>
                        {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                      </IconButton>
                      <IconButton size="small" onClick={() => handleEdit(question)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton size="small" color="error" onClick={() => handleDelete(question.id)}>
                        <DeleteIcon />
                      </IconButton>
                    </>
                  )}
                </Box>
              </Box>
            </CardContent>
          </Card>
        )
      })}
    </Box>
  )
}
