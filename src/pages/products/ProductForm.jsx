import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { 
  Box, Container, Typography, TextField, Button, Grid, 
  FormControl, InputLabel, Select, MenuItem, FormHelperText,
  Paper, CircularProgress, Card, CardMedia, IconButton
} from '@mui/material';
import { Delete, ArrowBack, Save } from '@mui/icons-material';
import api from '../../api/axios';
import * as yup from 'yup';
import { useFormik } from 'formik';

const validationSchema = yup.object({
  name: yup.string().required('Name is required'),
  slug: yup.string().required('Slug is required'),
  description: yup.string().required('Description is required'),
  price: yup.number().positive('Price must be positive').required('Price is required'),
  stock: yup.number().integer('Stock must be an integer').min(0, 'Stock cannot be negative').required('Stock is required'),
  status: yup.string().required('Status is required'),
  category_id: yup.number().required('Category is required'),
});

const ProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);
  const [loading, setLoading] = useState(isEditMode);
  const [categories, setCategories] = useState([]);
  const [images, setImages] = useState([]);
  const [mainImageIndex, setMainImageIndex] = useState(0);
  const [uploadProgress, setUploadProgress] = useState(0);

  const formik = useFormik({
    initialValues: {
      name: '',
      slug: '',
      description: '',
      price: '',
      stock: '',
      status: 'available',
      category_id: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        const formData = new FormData();
        
        // Add form fields to formData
        Object.keys(values).forEach(key => {
          formData.append(key, values[key]);
        });
        
        // Add images to formData
        images.forEach((image, index) => {
          formData.append(`images[${index}]`, image.file);
          if (index === mainImageIndex) {
            formData.append('main_image_index', index);
          }
        });

        if (isEditMode) {
          formData.append('_method', 'PUT'); // Laravel requires _method for PUT requests
          await api.post(`v1/admin/products/${id}`, formData, {
            headers: {
              'Content-Type': 'multipart/form-data'
            },
            onUploadProgress: (progressEvent) => {
              const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              setUploadProgress(percentCompleted);
            }
          });
        } else {
          await api.post('v1/admin/products', formData, {
            headers: {
              'Content-Type': 'multipart/form-data'
            },
            onUploadProgress: (progressEvent) => {
              const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              setUploadProgress(percentCompleted);
            }
          });
        }
        
        navigate('/admin/products');
      } catch (error) {
        console.error('Error saving product:', error);
      }
    },
  });

  useEffect(() => {
    fetchCategories();
    if (isEditMode) {
      fetchProduct();
    }
  }, [id]);

  const fetchCategories = async () => {
    try {
      const response = await api.get('v1/admin/categories');
      setCategories(response.data.data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchProduct = async () => {
    try {
      const response = await api.get(`v1/admin/products/${id}`);
      const product = response.data.data;
      
      // Set form values
      formik.setValues({
        name: product.name || '',
        slug: product.slug || '',
        description: product.description || '',
        price: product.price || '',
        stock: product.stock || '',
        status: product.status || 'available',
        category_id: product.category_id || '',
      });
      
      // Set images if available
      if (product.images && product.images.length > 0) {
        const productImages = product.images.map((img, index) => ({
          id: img.id,
          preview: img.url,
          isExisting: true,
        }));
        setImages(productImages);
        
        // Set main image index
        if (product.main_image_index !== undefined) {
          setMainImageIndex(product.main_image_index);
        }
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching product:', error);
      setLoading(false);
    }
  };

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif']
    },
    onDrop: acceptedFiles => {
      const newImages = acceptedFiles.map(file => ({
        file,
        preview: URL.createObjectURL(file),
        isExisting: false
      }));
      setImages([...images, ...newImages]);
    }
  });

  const handleRemoveImage = (index) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
    
    // Adjust main image index if needed
    if (mainImageIndex === index) {
      setMainImageIndex(0);
    } else if (mainImageIndex > index) {
      setMainImageIndex(mainImageIndex - 1);
    }
  };

  const handleSetMainImage = (index) => {
    setMainImageIndex(index);
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
        <IconButton onClick={() => navigate('/admin/products')} sx={{ mr: 2 }}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h4" component="h1">
          {isEditMode ? 'Edit Product' : 'Create New Product'}
        </Typography>
      </Box>

      <Paper sx={{ p: 3 }}>
        <form onSubmit={formik.handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                id="name"
                name="name"
                label="Product Name"
                value={formik.values.name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.name && Boolean(formik.errors.name)}
                helperText={formik.touched.name && formik.errors.name}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={6}>
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
            </Grid>
            
            <Grid item xs={12}>
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
            </Grid>
            
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                id="price"
                name="price"
                label="Price"
                type="number"
                value={formik.values.price}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.price && Boolean(formik.errors.price)}
                helperText={formik.touched.price && formik.errors.price}
                margin="normal"
                InputProps={{ inputProps: { min: 0, step: 0.01 } }}
              />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                id="stock"
                name="stock"
                label="Stock"
                type="number"
                value={formik.values.stock}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.stock && Boolean(formik.errors.stock)}
                helperText={formik.touched.stock && formik.errors.stock}
                margin="normal"
                InputProps={{ inputProps: { min: 0, step: 1 } }}
              />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <FormControl 
                fullWidth 
                margin="normal"
                error={formik.touched.status && Boolean(formik.errors.status)}
              >
                <InputLabel id="status-label">Status</InputLabel>
                <Select
                  labelId="status-label"
                  id="status"
                  name="status"
                  value={formik.values.status}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  label="Status"
                >
                  <MenuItem value="available">Available</MenuItem>
                  <MenuItem value="out_of_stock">Out of Stock</MenuItem>
                  <MenuItem value="discontinued">Discontinued</MenuItem>
                </Select>
                {formik.touched.status && formik.errors.status && (
                  <FormHelperText>{formik.errors.status}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <FormControl 
                fullWidth 
                margin="normal"
                error={formik.touched.category_id && Boolean(formik.errors.category_id)}
              >
                <InputLabel id="category-label">Category</InputLabel>
                <Select
                  labelId="category-label"
                  id="category_id"
                  name="category_id"
                  value={formik.values.category_id}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  label="Category"
                >
                  {categories.map((category) => (
                    <MenuItem key={category.id} value={category.id}>
                      {category.name}
                    </MenuItem>
                  ))}
                </Select>
                {formik.touched.category_id && formik.errors.category_id && (
                  <FormHelperText>{formik.errors.category_id}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Product Images
              </Typography>
              <Box 
                {...getRootProps()} 
                sx={{
                  border: '2px dashed #ccc',
                  borderRadius: 2,
                  p: 3,
                  textAlign: 'center',
                  cursor: 'pointer',
                  mb: 3,
                  '&:hover': {
                    borderColor: 'primary.main',
                  }
                }}
              >
                <input {...getInputProps()} />
                <Typography>
                  Drag & drop product images here, or click to select files
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  (Only images are accepted)
                </Typography>
              </Box>
              
              {images.length > 0 && (
                <Grid container spacing={2}>
                  {images.map((image, index) => (
                    <Grid item xs={6} sm={4} md={3} key={index}>
                      <Card 
                        sx={{ 
                          position: 'relative',
                          border: index === mainImageIndex ? '2px solid #4caf50' : 'none',
                        }}
                      >
                        <CardMedia
                          component="img"
                          height="140"
                          image={image.preview}
                          alt={`Product image ${index + 1}`}
                        />
                        <Box 
                          sx={{ 
                            position: 'absolute', 
                            top: 0, 
                            right: 0,
                            display: 'flex'
                          }}
                        >
                          <IconButton 
                            size="small" 
                            onClick={() => handleRemoveImage(index)}
                            sx={{ color: 'error.main', bgcolor: 'rgba(255,255,255,0.7)' }}
                          >
                            <Delete />
                          </IconButton>
                        </Box>
                        <Button
                          variant={index === mainImageIndex ? "contained" : "outlined"}
                          color="primary"
                          size="small"
                          fullWidth
                          onClick={() => handleSetMainImage(index)}
                          sx={{ borderRadius: '0 0 4px 4px' }}
                        >
                          {index === mainImageIndex ? 'Main Image' : 'Set as Main'}
                        </Button>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
            </Grid>
            
            <Grid item xs={12} sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
              <Button 
                variant="outlined" 
                onClick={() => navigate('/admin/products')}
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
                {formik.isSubmitting ? 'Saving...' : (isEditMode ? 'Update Product' : 'Create Product')}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
};

export default ProductForm;