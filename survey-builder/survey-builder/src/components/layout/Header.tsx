import { AppBar, Toolbar, Typography, Button, Box, Container } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import AssignmentIcon from '@mui/icons-material/Assignment'

export default function Header() {
  const navigate = useNavigate()
  const { user, signOut } = useAuth()

  const handleSignOut = async () => {
    try {
      await signOut()
      navigate('/login')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return (
    <AppBar position="static" elevation={1}>
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <AssignmentIcon sx={{ mr: 1 }} />
          <Typography
            variant="h6"
            component="a"
            onClick={() => navigate('/')}
            sx={{
              mr: 2,
              fontWeight: 700,
              color: 'inherit',
              textDecoration: 'none',
              cursor: 'pointer',
              flexGrow: 0,
            }}
          >
            Survey Builder
          </Typography>

          <Box sx={{ flexGrow: 1 }} />

          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            {user ? (
              <>
                <Button color="inherit" onClick={() => navigate('/dashboard')}>
                  Dashboard
                </Button>
                <Button color="inherit" onClick={() => navigate('/survey/create')}>
                  Create Survey
                </Button>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  {user.email}
                </Typography>
                <Button color="inherit" onClick={handleSignOut}>
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Button color="inherit" onClick={() => navigate('/login')}>
                  Login
                </Button>
                <Button variant="contained" color="secondary" onClick={() => navigate('/register')}>
                  Sign Up
                </Button>
              </>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  )
}
