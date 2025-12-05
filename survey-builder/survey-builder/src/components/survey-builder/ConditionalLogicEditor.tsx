import { useState } from 'react'
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Chip,
  IconButton,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import { SurveyQuestion, SkipLogicRule } from '@/lib/supabase'

interface ConditionalLogicEditorProps {
  question: SurveyQuestion
  allQuestions: SurveyQuestion[]
  skipLogic: SkipLogicRule[]
  onChange: (rules: SkipLogicRule[]) => void
}

export default function ConditionalLogicEditor({
  question,
  allQuestions,
  skipLogic,
  onChange,
}: ConditionalLogicEditorProps) {
  const [newRule, setNewRule] = useState<Partial<SkipLogicRule>>({
    condition: 'equals',
    action: 'show',
  })

  const previousQuestions = allQuestions.filter(
    (q) => q.order_index < question.order_index
  )

  const addRule = () => {
    if (!newRule.questionId || !newRule.value) return

    onChange([...skipLogic, newRule as SkipLogicRule])
    setNewRule({ condition: 'equals', action: 'show' })
  }

  const removeRule = (index: number) => {
    onChange(skipLogic.filter((_, i) => i !== index))
  }

  return (
    <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
      <Typography variant="subtitle2" gutterBottom>
        Conditional Logic (Skip Logic)
      </Typography>
      <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
        Show or hide this question based on previous answers
      </Typography>

      {skipLogic.map((rule, index) => (
        <Box key={index} sx={{ mb: 2, p: 2, bgcolor: 'white', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <Typography variant="body2">
              If question "{allQuestions.find(q => q.id === rule.questionId)?.question_text || 'Unknown'}" 
              {rule.condition === 'equals' && ' equals '}
              {rule.condition === 'not_equals' && ' does not equal '}
              {rule.condition === 'contains' && ' contains '}
              {rule.condition === 'not_contains' && ' does not contain '}
              {rule.condition === 'greater_than' && ' is greater than '}
              {rule.condition === 'less_than' && ' is less than '}
              {rule.condition === 'is_empty' && ' is empty'}
              {rule.condition === 'is_not_empty' && ' is not empty'}
              {!['is_empty', 'is_not_empty'].includes(rule.condition) && `"${rule.value}"`}
              {' '}then {rule.action === 'show' ? 'show' : rule.action === 'hide' ? 'hide' : 'skip to'} this question
            </Typography>
            <IconButton size="small" onClick={() => removeRule(index)}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>
      ))}

      {previousQuestions.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <FormControl fullWidth size="small" margin="dense">
            <InputLabel>Previous Question</InputLabel>
            <Select
              value={newRule.questionId || ''}
              onChange={(e) => setNewRule({ ...newRule, questionId: e.target.value })}
              label="Previous Question"
            >
              {previousQuestions.map((q) => (
                <MenuItem key={q.id} value={q.id}>
                  {q.question_text}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth size="small" margin="dense">
            <InputLabel>Condition</InputLabel>
            <Select
              value={newRule.condition || 'equals'}
              onChange={(e) => setNewRule({ ...newRule, condition: e.target.value as any })}
              label="Condition"
            >
              <MenuItem value="equals">Equals</MenuItem>
              <MenuItem value="not_equals">Does not equal</MenuItem>
              <MenuItem value="contains">Contains</MenuItem>
              <MenuItem value="not_contains">Does not contain</MenuItem>
              <MenuItem value="greater_than">Greater than</MenuItem>
              <MenuItem value="less_than">Less than</MenuItem>
              <MenuItem value="is_empty">Is empty</MenuItem>
              <MenuItem value="is_not_empty">Is not empty</MenuItem>
            </Select>
          </FormControl>

          {!['is_empty', 'is_not_empty'].includes(newRule.condition || '') && (
            <TextField
              fullWidth
              size="small"
              margin="dense"
              label="Value"
              value={newRule.value || ''}
              onChange={(e) => setNewRule({ ...newRule, value: e.target.value })}
            />
          )}

          <FormControl fullWidth size="small" margin="dense">
            <InputLabel>Action</InputLabel>
            <Select
              value={newRule.action || 'show'}
              onChange={(e) => setNewRule({ ...newRule, action: e.target.value as any })}
              label="Action"
            >
              <MenuItem value="show">Show this question</MenuItem>
              <MenuItem value="hide">Hide this question</MenuItem>
              <MenuItem value="skip_to">Skip to question</MenuItem>
            </Select>
          </FormControl>

          {newRule.action === 'skip_to' && (
            <FormControl fullWidth size="small" margin="dense">
              <InputLabel>Target Question</InputLabel>
              <Select
                value={newRule.targetQuestionId || ''}
                onChange={(e) => setNewRule({ ...newRule, targetQuestionId: e.target.value })}
                label="Target Question"
              >
                {allQuestions
                  .filter((q) => q.order_index > question.order_index)
                  .map((q) => (
                    <MenuItem key={q.id} value={q.id}>
                      {q.question_text}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
          )}

          <Button
            variant="outlined"
            size="small"
            startIcon={<AddIcon />}
            onClick={addRule}
            sx={{ mt: 1 }}
            disabled={!newRule.questionId || (!newRule.value && !['is_empty', 'is_not_empty'].includes(newRule.condition || ''))}
          >
            Add Rule
          </Button>
        </Box>
      )}

      {previousQuestions.length === 0 && (
        <Typography variant="caption" color="text.secondary">
          No previous questions available for conditional logic
        </Typography>
      )}
    </Box>
  )
}

