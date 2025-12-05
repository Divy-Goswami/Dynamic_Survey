import { Container, Typography, Button, Box, Grid, Card, CardContent } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import CreateIcon from '@mui/icons-material/Create'
import AnalyticsIcon from '@mui/icons-material/Analytics'
import ShareIcon from '@mui/icons-material/Share'
import SpeedIcon from '@mui/icons-material/Speed'

export default function HomePage() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const features = [
    {
      icon: <CreateIcon fontSize="large" color="primary" />,
      title: 'Easy Survey Creation',
      description: 'Create surveys with drag-and-drop interface and multiple question types.',
    },
    {
      icon: <AnalyticsIcon fontSize="large" color="primary" />,
      title: 'Powerful Analytics',
      description: 'Get real-time insights with charts, graphs, and detailed response data.',
    },
    {
      icon: <ShareIcon fontSize="large" color="primary" />,
      title: 'Simple Sharing',
      description: 'Share surveys via unique links and collect responses effortlessly.',
    },
    {
      icon: <SpeedIcon fontSize="large" color="primary" />,
      title: 'Fast & Responsive',
      description: 'Modern, responsive design that works perfectly on all devices.',
    },
  ]

  return (
    <Box>
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          py: 12,
          textAlign: 'center',
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h2" component="h1" gutterBottom fontWeight="bold">
            Create Surveys in Minutes
          </Typography>
          <Typography variant="h5" sx={{ mb: 4, opacity: 0.9 }}>
            Build powerful surveys, collect responses, and analyze data with our intuitive survey builder
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            {user ? (
              <>
                <Button
                  variant="contained"
                  size="large"
                  color="secondary"
                  onClick={() => navigate('/dashboard')}
                  sx={{ px: 4, py: 1.5 }}
                >
                  Go to Dashboard
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  sx={{ px: 4, py: 1.5, borderColor: 'white', color: 'white' }}
                  onClick={() => navigate('/survey/create')}
                >
                  Create Survey
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="contained"
                  size="large"
                  color="secondary"
                  onClick={() => navigate('/register')}
                  sx={{ px: 4, py: 1.5 }}
                >
                  Get Started Free
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  sx={{ px: 4, py: 1.5, borderColor: 'white', color: 'white' }}
                  onClick={() => navigate('/login')}
                >
                  Sign In
                </Button>
              </>
            )}
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h3" align="center" gutterBottom fontWeight="bold" sx={{ mb: 6 }}>
          Why Choose Our Survey Builder?
        </Typography>
        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
              <Card sx={{ height: '100%', textAlign: 'center' }}>
                <CardContent>
                  <Box sx={{ mb: 2 }}>{feature.icon}</Box>
                  <Typography variant="h6" gutterBottom fontWeight="bold">
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      <Box sx={{ backgroundColor: 'grey.100', py: 8 }}>
        <Container maxWidth="md">
          <Typography variant="h4" align="center" gutterBottom fontWeight="bold">
            Ready to Get Started?
          </Typography>
          <Typography variant="body1" align="center" sx={{ mb: 4 }} color="text.secondary">
            Create your first survey in minutes. No credit card required.
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Button
              variant="contained"
              size="large"
              color="primary"
              onClick={() => navigate(user ? '/survey/create' : '/register')}
              sx={{ px: 6, py: 1.5 }}
            >
              {user ? 'Create Your First Survey' : 'Sign Up Now'}
            </Button>
          </Box>
        </Container>
      </Box>
    </Box>
  )
}
