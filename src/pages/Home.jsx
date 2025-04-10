import { Typography, Container, Box, Button } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const Home = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <Container maxWidth="lg">
      <Box
        sx={{
          my: 4,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
          minHeight: '60vh',
        }}
      >
        <Typography variant="h3" component="h2" gutterBottom>
          Welcome to Our E-Commerce Store Game Express
        </Typography>
        <Typography variant="h5" component="h2" gutterBottom>
          {isAuthenticated
            ? `Hello, ${user.user?.name}!`
            : 'Please login or register to continue'}
        </Typography>
        {!isAuthenticated && (
          <Box sx={{ mt: 3 }}>
            <Button
              variant="contained"
              size="large"
              component={Link}
              to="/login"
              sx={{ mr: 2 }}
            >
              Login
            </Button>
            <Button
              variant="outlined"
              size="large"
              component={Link}
              to="/register"
            >
              Register
            </Button>
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default Home;