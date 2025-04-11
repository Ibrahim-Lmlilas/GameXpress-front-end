import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, Container, Typography, TextField, Button, Paper, 
  CircularProgress, IconButton
} from '@mui/material';
import { ArrowBack, Save } from '@mui/icons-material';
import api from '../../api/axios';
import * as yup from 'yup';
import { useFormik } from 'formik';

const validationSchema = yup.object({
  name: yup.string().required('Name is required'),
  slug: yup.string().required('Slug is required'),
});

const CategoryForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);
  const [loading, setLoading] = useState(isEditMode);

  const formik = useFormik({
    initialValues: {
      name: '',
      slug: '',
      description: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        if (isEditMode) {
          await api.put(`http://127.0.0.1:8000/api/v1/admin/categories/${id}`, values);
        } else {
          await api.post('http://127.0.0.1:8000/api/v1/admin/categories', values);
        }
        navigate('/categories');
      } catch (error) {
        console.error('Error saving category:', error.response?.data || error.message || error);
        alert('Error saving category: ' + (error.response?.data?.message || error.message || 'Unknown error'));
      }
    },
  });

  useEffect(() => {
    if (isEditMode) {
      fetchCategory();
    }
  }, [id]);

  const fetchCategory = async () => {
    try {
      const response = await api.get(`http://127.0.0.1:8000/api/v1/admin/categories/${id}`);
      const category = response.data;
      
      formik.setValues({
        name: category.name || '',
        slug: category.slug || '',
        description: category.description || '',
      });
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching category:', error);
      setLoading(false);
    }
  };

  const handleGenerateSlug = () => {
    const slug = formik.values.name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
    formik.setFieldValue('slug', slug);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" alignItems="center" mb={4}>
        <IconButton onClick={() => navigate('/categories')} sx={{ mr: 2 }}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h4" component="h1">
          {isEditMode ? 'Edit Category' : 'Create New Category'}
        </Typography>
      </Box>

      <Paper sx={{ p: 3 }}>
        <form onSubmit={formik.handleSubmit}>
          <TextField
            fullWidth
            id="name"
            name="name"
            label="Category Name"
            value={formik.values.name}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.name && Boolean(formik.errors.name)}
            helperText={formik.touched.name && formik.errors.name}
            margin="normal"
          />
          
          <Box display="flex" alignItems="flex-start">
            <TextField
              fullWidth
              id="slug"
              name="slug"
              label="Slug"
              value={formik.values.slug}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.slug && Boolean(formik.errors.slug)}
              helperText={formik.touched.slug && formik.errors.slug}
              margin="normal"
            />
            <Button 
              variant="outlined" 
              onClick={handleGenerateSlug}
              sx={{ mt: 2, ml: 1, height: 56 }}
            >
              Generate
            </Button>
          </Box>
          
          <TextField
            fullWidth
            id="description"
            name="description"
            label="Description"
            multiline
            rows={4}
            value={formik.values.description}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.description && Boolean(formik.errors.description)}
            helperText={formik.touched.description && formik.errors.description}
            margin="normal"
          />
          
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <Button 
              variant="outlined" 
              onClick={() => navigate('/categories')}
              sx={{ mr: 2 }}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="contained" 
              color="primary"
              startIcon={<Save />}
              disabled={formik.isSubmitting}
            >
              {formik.isSubmitting ? 'Saving...' : (isEditMode ? 'Update Category' : 'Create Category')}
            </Button>
          </Box>
        </form>
      </Paper>
    </Container>
  );
};

export default CategoryForm;