import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import {
  Container,
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  RadioGroup,
  Radio,
  FormControlLabel,
  Checkbox,
  FormGroup,
  Rating,
  Select,
  MenuItem,
  FormControl,
  LinearProgress,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  IconButton,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import DragIndicatorIcon from '@mui/icons-material/DragIndicator'
import { supabase, Survey, SurveyQuestion } from '@/lib/supabase'
import { evaluateSkipLogic, applyRandomization, calculateScore, validateAnswer } from '@/utils/surveyHelpers'

interface SortableItemProps {
  id: string
  value: string
  index: number
}

function SortableItem({ id, value, index }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <ListItem
      ref={setNodeRef}
      style={style}
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1,
        mb: 1,
        bgcolor: 'background.paper',
        cursor: 'grab',
        '&:active': {
          cursor: 'grabbing',
        },
      }}
    >
      <DragIndicatorIcon
        sx={{ color: 'text.secondary', mr: 2 }}
        {...attributes}
        {...listeners}
      />
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexGrow: 1 }}>
        <Typography
          variant="body2"
          sx={{
            minWidth: 24,
            height: 24,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
            fontWeight: 'bold',
            fontSize: '0.75rem',
          }}
        >
          {index + 1}
        </Typography>
        <ListItemText primary={value} />
      </Box>
    </ListItem>
  )
}

interface RankingQuestionProps {
  question: SurveyQuestion
  value: string[]
  onChange: (value: string[]) => void
}

function RankingQuestion({ question, value, onChange }: RankingQuestionProps) {
  // Initialize with all options if no value is set
  const rankingValue = value && value.length > 0 ? value : [...(question.options || [])]
  
  // Initialize the answer if it hasn't been set yet
  useEffect(() => {
    if (!value || value.length === 0) {
      onChange([...(question.options || [])])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Only run once on mount

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = rankingValue.indexOf(active.id as string)
      const newIndex = rankingValue.indexOf(over.id as string)
      const newRanking = arrayMove(rankingValue, oldIndex, newIndex)
      onChange(newRanking)
    }
  }

  return (
    <Box>
      <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
        Drag and drop to rank the options from most to least preferred
      </Typography>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={rankingValue}
          strategy={verticalListSortingStrategy}
        >
          <List sx={{ p: 0 }}>
            {rankingValue.map((option: string, index: number) => (
              <SortableItem
                key={option}
                id={option}
                value={option}
                index={index}
              />
            ))}
          </List>
        </SortableContext>
      </DndContext>
    </Box>
  )
}

export default function SurveyTakePage() {
  const { id } = useParams<{ id: string }>()
  const [survey, setSurvey] = useState<Survey | null>(null)
  const [questions, setQuestions] = useState<SurveyQuestion[]>([])
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [currentStep, setCurrentStep] = useState(0)

  useEffect(() => {
    async function loadSurvey() {
      if (!id) return

      try {
        const { data: surveyData, error: surveyError } = await supabase
          .from('surveys')
          .select('*')
          .eq('id', id)
          .eq('is_published', true)
          .maybeSingle()

        if (surveyError) throw surveyError
        if (!surveyData) throw new Error('Survey not found or not published')

        setSurvey(surveyData)

        const { data: questionsData, error: questionsError } = await supabase
          .from('survey_questions')
          .select('*')
          .eq('survey_id', id)
          .order('order_index', { ascending: true })

        if (questionsError) throw questionsError

        // Apply randomization if enabled
        const processedQuestions = applyRandomization(questionsData || [], surveyData.settings || {})
        setQuestions(processedQuestions)
        
        // Load saved progress if enabled
        if (surveyData.settings?.progress?.allowSaveProgress) {
          const savedProgress = localStorage.getItem(`survey_progress_${id}`)
          if (savedProgress) {
            try {
              const parsed = JSON.parse(savedProgress)
              setAnswers(parsed.answers || {})
            } catch (e) {
              console.error('Failed to load saved progress', e)
            }
          }
        }
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadSurvey()
  }, [id])

  const handleAnswerChange = (questionId: string, value: any) => {
    const question = questions.find(q => q.id === questionId)
    if (question) {
      const validation = validateAnswer(question, value)
      if (!validation.valid) {
        setError(validation.message || 'Invalid answer')
        return
      }
    }

    const newAnswers = {
      ...answers,
      [questionId]: value,
    }
    setAnswers(newAnswers)

    // Save progress if enabled
    if (survey?.settings?.progress?.allowSaveProgress && id) {
      localStorage.setItem(`survey_progress_${id}`, JSON.stringify({
        answers: newAnswers,
        timestamp: new Date().toISOString(),
      }))
    }
  }

  const handleSubmit = async () => {
    // Filter visible questions based on conditional logic
    const visibleQuestions = questions.filter(q => evaluateSkipLogic(q, questions, answers))
    
    // Validate required questions
    const missingRequired = visibleQuestions.filter((q) => {
      if (!q.is_required) return false
      const answer = answers[q.id]
      // Check if answer is empty (null, undefined, empty string, or empty array)
      return !answer || (Array.isArray(answer) && answer.length === 0) || (typeof answer === 'string' && answer.trim() === '')
    })

    if (missingRequired.length > 0) {
      setError('Please answer all required questions')
      return
    }

    // Calculate score if quiz mode
    let score = null
    if (survey?.settings?.scoring?.isQuiz) {
      score = calculateScore(visibleQuestions, answers)
    }

    setSubmitting(true)
    setError('')

    try {
      const { data, error } = await supabase.functions.invoke('submit-response', {
        body: {
          surveyId: id,
          answers: Object.entries(answers).map(([questionId, value]) => ({
            questionId,
            value,
          })),
          respondentEmail: null,
          score: score,
        },
      })

      if (error) throw error

      // Clear saved progress
      if (id) {
        localStorage.removeItem(`survey_progress_${id}`)
      }

      // Show score if quiz mode and enabled
      if (survey?.settings?.scoring?.isQuiz && survey?.settings?.scoring?.showScore && score) {
        const passed = score.percentage >= (survey.settings.scoring.passingScore || 70)
        setError(`Your score: ${score.total}/${score.max} (${score.percentage}%) - ${passed ? 'Passed!' : 'Not passed'}`)
      }

      setSubmitted(true)
    } catch (err: any) {
      setError(err.message || 'Failed to submit survey')
    } finally {
      setSubmitting(false)
    }
  }

  const renderQuestion = (question: SurveyQuestion) => {
    const value = answers[question.id]

    switch (question.question_type) {
      case 'text':
        return (
          <TextField
            fullWidth
            multiline
            rows={3}
            value={value || ''}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            placeholder="Your answer"
          />
        )

      case 'multiple_choice':
        return (
          <RadioGroup
            value={value || ''}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
          >
            {question.options.map((option, index) => (
              <FormControlLabel
                key={index}
                value={option}
                control={<Radio />}
                label={option}
              />
            ))}
          </RadioGroup>
        )

      case 'checkbox':
        return (
          <FormGroup>
            {question.options.map((option, index) => (
              <FormControlLabel
                key={index}
                control={
                  <Checkbox
                    checked={value?.includes(option) || false}
                    onChange={(e) => {
                      const currentValues = value || []
                      const newValues = e.target.checked
                        ? [...currentValues, option]
                        : currentValues.filter((v: string) => v !== option)
                      handleAnswerChange(question.id, newValues)
                    }}
                  />
                }
                label={option}
              />
            ))}
          </FormGroup>
        )

      case 'dropdown':
        return (
          <FormControl fullWidth>
            <Select
              value={value || ''}
              onChange={(e) => handleAnswerChange(question.id, e.target.value)}
              displayEmpty
            >
              <MenuItem value="" disabled>
                Select an option
              </MenuItem>
              {question.options.map((option, index) => (
                <MenuItem key={index} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )

      case 'rating':
        return (
          <Rating
            value={value || 0}
            onChange={(e, newValue) => handleAnswerChange(question.id, newValue)}
            size="large"
          />
        )

      case 'ranking':
        return (
          <RankingQuestion
            question={question}
            value={value || question.options || []}
            onChange={(newValue) => handleAnswerChange(question.id, newValue)}
          />
        )

      case 'date':
        return (
          <TextField
            fullWidth
            type="date"
            value={value || ''}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
        )

      case 'time':
        return (
          <TextField
            fullWidth
            type="time"
            value={value || ''}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
        )

      case 'matrix':
        const matrixParts = question.options.join(',').split('|')
        const matrixRows = matrixParts[0] ? matrixParts[0].split(',').map(r => r.trim()) : []
        const matrixCols = matrixParts[1] ? matrixParts[1].split(',').map(c => c.trim()) : []
        const matrixValue = value || {}
        
        return (
          <Box sx={{ overflowX: 'auto' }}>
            <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse', mt: 2 }}>
              <Box component="thead">
                <Box component="tr">
                  <Box component="th" sx={{ p: 1, textAlign: 'left', border: '1px solid', borderColor: 'divider' }}></Box>
                  {matrixCols.map((col, idx) => (
                    <Box key={idx} component="th" sx={{ p: 1, textAlign: 'center', border: '1px solid', borderColor: 'divider', minWidth: 100 }}>
                      {col}
                    </Box>
                  ))}
                </Box>
              </Box>
              <Box component="tbody">
                {matrixRows.map((row, rowIdx) => (
                  <Box key={rowIdx} component="tr">
                    <Box component="td" sx={{ p: 1, border: '1px solid', borderColor: 'divider', fontWeight: 'medium' }}>
                      {row}
                    </Box>
                    {matrixCols.map((col, colIdx) => (
                      <Box key={colIdx} component="td" sx={{ p: 1, border: '1px solid', borderColor: 'divider', textAlign: 'center' }}>
                        <Radio
                          checked={matrixValue[`${rowIdx}-${colIdx}`] === true}
                          onChange={() => {
                            const newValue = { ...matrixValue, [`${rowIdx}-${colIdx}`]: true }
                            handleAnswerChange(question.id, newValue)
                          }}
                          size="small"
                        />
                      </Box>
                    ))}
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>
        )

      case 'file':
        const fileValue = value || []
        const maxFileSize = survey?.settings?.limits?.maxFileSize || 10 // MB
        const maxFiles = survey?.settings?.limits?.maxFiles || 5
        const allowedTypes = survey?.settings?.limits?.allowedFileTypes || ['image/*', 'application/pdf', '.doc', '.docx']
        
        return (
          <Box>
            <input
              accept={allowedTypes.join(',')}
              style={{ display: 'none' }}
              id={`file-upload-${question.id}`}
              multiple={maxFiles > 1}
              type="file"
              onChange={(e) => {
                const files = Array.from(e.target.files || [])
                const validFiles = files.filter(file => {
                  const sizeMB = file.size / (1024 * 1024)
                  return sizeMB <= maxFileSize
                })
                
                if (validFiles.length !== files.length) {
                  setError(`Some files exceed the maximum size of ${maxFileSize}MB`)
                }
                
                if (validFiles.length + fileValue.length > maxFiles) {
                  setError(`Maximum ${maxFiles} files allowed`)
                  return
                }
                
                // Convert files to base64 or store file info
                Promise.all(validFiles.map(file => {
                  return new Promise((resolve) => {
                    const reader = new FileReader()
                    reader.onload = () => resolve({
                      name: file.name,
                      size: file.size,
                      type: file.type,
                      data: reader.result
                    })
                    reader.readAsDataURL(file)
                  })
                })).then(fileData => {
                  handleAnswerChange(question.id, [...fileValue, ...fileData])
                })
              }}
            />
            <label htmlFor={`file-upload-${question.id}`}>
              <Button variant="outlined" component="span" startIcon={<AddIcon />}>
                Upload Files
              </Button>
            </label>
            {fileValue.length > 0 && (
              <Box sx={{ mt: 2 }}>
                {fileValue.map((file: any, idx: number) => (
                  <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Typography variant="body2">{file.name}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      ({(file.size / 1024).toFixed(2)} KB)
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={() => {
                        const newFiles = fileValue.filter((_: any, i: number) => i !== idx)
                        handleAnswerChange(question.id, newFiles)
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                ))}
              </Box>
            )}
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
              Max {maxFileSize}MB per file, up to {maxFiles} files
            </Typography>
          </Box>
        )

      default:
        return null
    }
  }

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress />
      </Container>
    )
  }

  if (submitted) {
    return (
      <Container maxWidth="md" sx={{ mt: 8 }}>
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <Typography variant="h4" gutterBottom fontWeight="bold" color="success.main">
            Thank You!
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Your response has been submitted successfully.
          </Typography>
        </Paper>
      </Container>
    )
  }

  if (!survey) {
    return (
      <Container maxWidth="md" sx={{ mt: 8 }}>
        <Alert severity="error">Survey not found or not published</Alert>
      </Container>
    )
  }

  const progress = ((Object.keys(answers).length / questions.length) * 100) || 0

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom fontWeight="bold">
          {survey.title}
        </Typography>
        {survey.description && (
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            {survey.description}
          </Typography>
        )}

        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="caption" color="text.secondary">
              Progress
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {Math.round(progress)}%
            </Typography>
          </Box>
          <LinearProgress variant="determinate" value={progress} />
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {questions
            .filter(q => evaluateSkipLogic(q, questions, answers))
            .map((question, index) => (
            <Box key={question.id}>
              <Typography variant="h6" gutterBottom>
                {index + 1}. {question.question_text}
                {question.is_required && (
                  <Typography component="span" color="error">
                    {' '}*
                  </Typography>
                )}
              </Typography>
              {question.help_text && (
                <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
                  {question.help_text}
                </Typography>
              )}
              {renderQuestion(question)}
            </Box>
          ))}
        </Box>

        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            size="large"
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? 'Submitting...' : 'Submit Survey'}
          </Button>
        </Box>
      </Paper>
    </Container>
  )
}
