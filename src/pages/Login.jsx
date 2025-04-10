import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { TextField, Button, Container, Typography, Box, Alert } from '@mui/material';

// Form field configuration - makes it easy to add/modify fields

const formFields = [
  {
    id: 'email',
    label: 'Email Address',
    type: 'text',
    name: 'email',
    autoComplete: 'email',
    autoFocus: true,
    required: true
  },
  {
    id: 'password',
    label: 'Password',
    type: 'password',
    name: 'password',
    autoComplete: 'current-password',
    required: true
  }
];

const Login = () => {
  const [credentials, setCredentials] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const { login , isAuthenticated  } = useAuth();

  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const result = await login(credentials);
      if (result.success) {
        navigate('/');
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError(err.message || 'An error occurred during login');
    }
  };

  // Reusable form field component
  const renderFormField = (field) => (
    <TextField
      key={field.id}
      margin="normal"
      fullWidth
      id={field.id}
      label={field.label}
      name={field.name}
      type={field.type}
      autoComplete={field.autoComplete}
      autoFocus={field.autoFocus}
      required={field.required}
      value={credentials[field.name]}
      onChange={handleChange}
    />
  );

  return (
    <Container maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography component="h1" variant="h5">
          Sign in
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ width: '100%', mt: 2 }}>
            {error}
          </Alert>
        )}
        
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
          {formFields.map(renderFormField)}
          
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            Sign In
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default Login;