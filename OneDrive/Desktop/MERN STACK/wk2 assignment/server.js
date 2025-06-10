const express = require('express');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
const { NotFoundError, ValidationError, AuthenticationError, DatabaseError } = require('./errors');

const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.json());

// Custom logger middleware
const loggerMiddleware = (req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.url}`);
    next();
};

// Authentication middleware
const authMiddleware = (req, res, next) => {
    const apiKey = req.headers['x-api-key'];
    if (!apiKey || apiKey !== 'your-secret-api-key') {
        throw new AuthenticationError('Invalid API key');
    }
    next();
};

// Async handler wrapper
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

// Apply middleware
app.use(loggerMiddleware);
app.use('/api', authMiddleware);

// In-memory products storage
let products = [];

// Validation middleware
const validateProduct = (req, res, next) => {
    const { name, description, price, category, inStock } = req.body;
    
    if (!name || !description || !price || !category || typeof inStock !== 'boolean') {
        throw new ValidationError('All fields are required and must be of correct type');
    }
    
    if (typeof price !== 'number' || price <= 0) {
        throw new ValidationError('Price must be a positive number');
    }
    
    next();
};

// Routes
app.get('/', (req, res) => {
    res.json({ message: 'Hello World!' });
});

// GET all products with filtering and pagination
app.get('/api/products', asyncHandler(async (req, res) => {
    const { category, page = 1, limit = 10 } = req.query;
    let filteredProducts = [...products];
    
    if (category) {
        filteredProducts = filteredProducts.filter(p => p.category === category);
    }
    
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedProducts = filteredProducts.slice(startIndex, endIndex);
    
    res.json({
        total: filteredProducts.length,
        page: parseInt(page),
        limit: parseInt(limit),
        products: paginatedProducts
    });
}));

// GET product by ID
app.get('/api/products/:id', asyncHandler(async (req, res) => {
    const product = products.find(p => p.id === req.params.id);
    if (!product) {
        throw new NotFoundError(`Product with ID ${req.params.id} not found`);
    }
    res.json(product);
}));

// POST new product
app.post('/api/products', validateProduct, asyncHandler(async (req, res) => {
    const newProduct = {
        id: uuidv4(),
        ...req.body
    };
    products.push(newProduct);
    res.status(201).json(newProduct);
}));

// PUT update product
app.put('/api/products/:id', validateProduct, asyncHandler(async (req, res) => {
    const index = products.findIndex(p => p.id === req.params.id);
    if (index === -1) {
        throw new NotFoundError(`Product with ID ${req.params.id} not found`);
    }
    
    products[index] = {
        ...products[index],
        ...req.body,
        id: req.params.id
    };
    
    res.json(products[index]);
}));

// DELETE product
app.delete('/api/products/:id', asyncHandler(async (req, res) => {
    const index = products.findIndex(p => p.id === req.params.id);
    if (index === -1) {
        throw new NotFoundError(`Product with ID ${req.params.id} not found`);
    }
    
    products = products.filter(p => p.id !== req.params.id);
    res.status(204).send();
}));

// Search products by name
app.get('/api/products/search', asyncHandler(async (req, res) => {
    const { name } = req.query;
    if (!name) {
        throw new ValidationError('Name parameter is required');
    }
    
    const searchResults = products.filter(p => 
        p.name.toLowerCase().includes(name.toLowerCase())
    );
    
    res.json(searchResults);
}));

// Get product statistics
app.get('/api/products/stats', asyncHandler(async (req, res) => {
    const stats = {
        totalProducts: products.length,
        categories: {},
        inStock: products.filter(p => p.inStock).length,
        outOfStock: products.filter(p => !p.inStock).length
    };
    
    products.forEach(product => {
        stats.categories[product.category] = (stats.categories[product.category] || 0) + 1;
    });
    
    res.json(stats);
}));

// Global error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);

    // Handle operational errors (our custom errors)
    if (err.isOperational) {
        return res.status(err.statusCode).json({
            status: err.status,
            message: err.message
        });
    }

    // Handle programming or unknown errors
    return res.status(500).json({
        status: 'error',
        message: 'Something went wrong!'
    });
});

// Handle 404 errors
app.use((req, res, next) => {
    next(new NotFoundError(`Can't find ${req.originalUrl} on this server!`));
});

// Start server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
}); 