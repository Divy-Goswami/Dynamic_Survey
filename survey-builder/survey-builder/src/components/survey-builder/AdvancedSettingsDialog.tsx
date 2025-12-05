import { useState, useEffect } from 'react'
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
  Tabs,
  Tab,
  Box,
  Typography,
  Divider,
  Chip,
} from '@mui/material'
import { Survey, SurveySettings } from '@/lib/supabase'

interface AdvancedSettingsDialogProps {
  open: boolean
  onClose: () => void
  survey: Survey | null
  onSave: (settings: SurveySettings) => void
}

export default function AdvancedSettingsDialog({
  open,
  onClose,
  survey,
  onSave,
}: AdvancedSettingsDialogProps) {
  const [tabValue, setTabValue] = useState(0)
  const [settings, setSettings] = useState<SurveySettings>({
    theme: {},
    randomization: {},
    progress: {},
    limits: {},
    scoring: {},
    languages: [],
    webhooks: {},
  })

  useEffect(() => {
    if (survey?.settings) {
      setSettings(survey.settings)
    }
  }, [survey])

  const handleSave = () => {
    onSave(settings)
    onClose()
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Advanced Settings</DialogTitle>
      <DialogContent>
        <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)} sx={{ mb: 3 }}>
          <Tab label="Theme" />
          <Tab label="Randomization" />
          <Tab label="Progress" />
          <Tab label="File Limits" />
          <Tab label="Scoring/Quiz" />
          <Tab label="Languages" />
          <Tab label="Webhooks" />
        </Tabs>

        {tabValue === 0 && (
          <Box>
            <Typography variant="h6" gutterBottom>Theme Customization</Typography>
            <TextField
              fullWidth
              label="Primary Color"
              type="color"
              value={settings.theme?.primaryColor || '#1976d2'}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  theme: { ...settings.theme, primaryColor: e.target.value },
                })
              }
              margin="normal"
            />
            <TextField
              fullWidth
              label="Secondary Color"
              type="color"
              value={settings.theme?.secondaryColor || '#dc004e'}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  theme: { ...settings.theme, secondaryColor: e.target.value },
                })
              }
              margin="normal"
            />
            <TextField
              fullWidth
              label="Background Color"
              type="color"
              value={settings.theme?.backgroundColor || '#ffffff'}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  theme: { ...settings.theme, backgroundColor: e.target.value },
                })
              }
              margin="normal"
            />
            <TextField
              fullWidth
              label="Font Family"
              value={settings.theme?.fontFamily || 'Roboto'}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  theme: { ...settings.theme, fontFamily: e.target.value },
                })
              }
              margin="normal"
              helperText="e.g., Roboto, Arial, Georgia"
            />
            <TextField
              fullWidth
              label="Logo URL"
              value={settings.theme?.logoUrl || ''}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  theme: { ...settings.theme, logoUrl: e.target.value },
                })
              }
              margin="normal"
              helperText="URL to your logo image"
            />
          </Box>
        )}

        {tabValue === 1 && (
          <Box>
            <Typography variant="h6" gutterBottom>Randomization</Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.randomization?.randomizeQuestions || false}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      randomization: {
                        ...settings.randomization,
                        randomizeQuestions: e.target.checked,
                      },
                    })
                  }
                />
              }
              label="Randomize Question Order"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={settings.randomization?.randomizeOptions || false}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      randomization: {
                        ...settings.randomization,
                        randomizeOptions: e.target.checked,
                      },
                    })
                  }
                />
              }
              label="Randomize Option Order"
            />
          </Box>
        )}

        {tabValue === 2 && (
          <Box>
            <Typography variant="h6" gutterBottom>Progress Settings</Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.progress?.showProgressBar ?? true}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      progress: {
                        ...settings.progress,
                        showProgressBar: e.target.checked,
                      },
                    })
                  }
                />
              }
              label="Show Progress Bar"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={settings.progress?.allowSaveProgress || false}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      progress: {
                        ...settings.progress,
                        allowSaveProgress: e.target.checked,
                      },
                    })
                  }
                />
              }
              label="Allow Respondents to Save Progress"
            />
            <Alert severity="info" sx={{ mt: 2 }}>
              When enabled, respondents can save their progress and return later using a unique link.
            </Alert>
          </Box>
        )}

        {tabValue === 3 && (
          <Box>
            <Typography variant="h6" gutterBottom>File Upload Limits</Typography>
            <TextField
              fullWidth
              label="Max File Size (MB)"
              type="number"
              value={settings.limits?.maxFileSize || 10}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  limits: {
                    ...settings.limits,
                    maxFileSize: parseInt(e.target.value) || 10,
                  },
                })
              }
              margin="normal"
              inputProps={{ min: 1, max: 100 }}
            />
            <TextField
              fullWidth
              label="Max Number of Files"
              type="number"
              value={settings.limits?.maxFiles || 5}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  limits: {
                    ...settings.limits,
                    maxFiles: parseInt(e.target.value) || 5,
                  },
                })
              }
              margin="normal"
              inputProps={{ min: 1, max: 20 }}
            />
            <TextField
              fullWidth
              label="Allowed File Types"
              value={settings.limits?.allowedFileTypes?.join(', ') || ''}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  limits: {
                    ...settings.limits,
                    allowedFileTypes: e.target.value.split(',').map(t => t.trim()),
                  },
                })
              }
              margin="normal"
              helperText="Comma-separated (e.g., image/*, application/pdf, .doc, .docx)"
            />
          </Box>
        )}

        {tabValue === 4 && (
          <Box>
            <Typography variant="h6" gutterBottom>Scoring & Quiz Settings</Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.scoring?.isQuiz || false}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      scoring: {
                        ...settings.scoring,
                        isQuiz: e.target.checked,
                      },
                    })
                  }
                />
              }
              label="Enable Quiz Mode"
            />
            {settings.scoring?.isQuiz && (
              <>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.scoring?.showScore || false}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          scoring: {
                            ...settings.scoring,
                            showScore: e.target.checked,
                          },
                        })
                      }
                    />
                  }
                  label="Show Score to Respondent"
                />
                <TextField
                  fullWidth
                  label="Passing Score (%)"
                  type="number"
                  value={settings.scoring?.passingScore || 70}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      scoring: {
                        ...settings.scoring,
                        passingScore: parseInt(e.target.value) || 70,
                      },
                    })
                  }
                  margin="normal"
                  inputProps={{ min: 0, max: 100 }}
                />
              </>
            )}
          </Box>
        )}

        {tabValue === 5 && (
          <Box>
            <Typography variant="h6" gutterBottom>Multi-Language Support</Typography>
            <TextField
              fullWidth
              label="Supported Languages (comma-separated codes)"
              value={settings.languages?.join(', ') || ''}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  languages: e.target.value.split(',').map(l => l.trim()).filter(Boolean),
                })
              }
              margin="normal"
              helperText="e.g., en, es, fr, de"
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Default Language</InputLabel>
              <Select
                value={settings.defaultLanguage || 'en'}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    defaultLanguage: e.target.value,
                  })
                }
                label="Default Language"
              >
                <MenuItem value="en">English</MenuItem>
                <MenuItem value="es">Spanish</MenuItem>
                <MenuItem value="fr">French</MenuItem>
                <MenuItem value="de">German</MenuItem>
                <MenuItem value="zh">Chinese</MenuItem>
                <MenuItem value="ja">Japanese</MenuItem>
              </Select>
            </FormControl>
          </Box>
        )}

        {tabValue === 6 && (
          <Box>
            <Typography variant="h6" gutterBottom>Webhook Configuration</Typography>
            <TextField
              fullWidth
              label="Webhook URL"
              value={settings.webhooks?.url || ''}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  webhooks: {
                    ...settings.webhooks,
                    url: e.target.value,
                  },
                })
              }
              margin="normal"
              helperText="URL to receive real-time notifications"
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Webhook Events</InputLabel>
              <Select
                multiple
                value={settings.webhooks?.events || []}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    webhooks: {
                      ...settings.webhooks,
                      events: e.target.value as string[],
                    },
                  })
                }
                label="Webhook Events"
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {(selected as string[]).map((value) => (
                      <Chip key={value} label={value} size="small" />
                    ))}
                  </Box>
                )}
              >
                <MenuItem value="response.started">Response Started</MenuItem>
                <MenuItem value="response.completed">Response Completed</MenuItem>
                <MenuItem value="response.updated">Response Updated</MenuItem>
              </Select>
            </FormControl>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained">
          Save Settings
        </Button>
      </DialogActions>
    </Dialog>
  )
}

