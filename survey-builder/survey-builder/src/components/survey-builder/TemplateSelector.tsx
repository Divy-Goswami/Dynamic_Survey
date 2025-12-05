import { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Tabs,
  Tab,
} from '@mui/material'
import { surveyTemplates, getTemplatesByCategory, SurveyTemplate } from '@/data/surveyTemplates'

interface TemplateSelectorProps {
  open: boolean
  onClose: () => void
  onSelect: (template: SurveyTemplate) => void
}

export default function TemplateSelector({
  open,
  onClose,
  onSelect,
}: TemplateSelectorProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  const templatesByCategory = getTemplatesByCategory()
  const categories = ['All', ...Object.keys(templatesByCategory)]

  const filteredTemplates =
    selectedCategory === 'All'
      ? surveyTemplates
      : templatesByCategory[selectedCategory] || []

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>Choose a Survey Template</DialogTitle>
      <DialogContent>
        <Tabs
          value={selectedCategory}
          onChange={(_, v) => setSelectedCategory(v)}
          sx={{ mb: 3 }}
          variant="scrollable"
          scrollButtons="auto"
        >
          {categories.map((cat) => (
            <Tab key={cat} label={cat} value={cat} />
          ))}
        </Tabs>

        <Grid container spacing={2}>
          {filteredTemplates.map((template) => (
            <Grid item xs={12} sm={6} md={4} key={template.id}>
              <Card
                sx={{
                  height: '100%',
                  cursor: 'pointer',
                  '&:hover': {
                    boxShadow: 4,
                    transform: 'translateY(-2px)',
                    transition: 'all 0.2s',
                  },
                }}
                onClick={() => {
                  onSelect(template)
                  onClose()
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <Typography variant="h4">{template.icon}</Typography>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" fontWeight="bold">
                        {template.name}
                      </Typography>
                      <Chip
                        label={template.category}
                        size="small"
                        sx={{ mt: 0.5 }}
                      />
                    </Box>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {template.description}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    {template.questions.length} questions
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
      </DialogActions>
    </Dialog>
  )
}

