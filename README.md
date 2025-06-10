# Express.js RESTful API

A RESTful API built with Express.js that implements CRUD operations for products with advanced features like filtering, pagination, and search.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Start the server:

```bash
node server.js
```

The server will run on `http://localhost:3000`

## API Endpoints

### Authentication

All API endpoints require an API key to be sent in the `x-api-key` header.

### Products API

#### List Products

- **GET** `/api/products`
- Query Parameters:
  - `category`: Filter by category
  - `page`: Page number (default: 1)
  - `limit`: Items per page (default: 10)

#### Get Product by ID

- **GET** `/api/products/:id`

#### Create Product

- **POST** `/api/products`
- Required fields:
  ```json
  {
    "name": "string",
    "description": "string",
    "price": number,
    "category": "string",
    "inStock": boolean
  }
  ```

#### Update Product

- **PUT** `/api/products/:id`
- Same fields as Create Product

#### Delete Product

- **DELETE** `/api/products/:id`

#### Search Products

- **GET** `/api/products/search?name=searchTerm`

#### Get Product Statistics

- **GET** `/api/products/stats`

## Error Handling

The API implements proper error handling with appropriate HTTP status codes:

- 400: Bad Request (Validation Error)
- 401: Unauthorized (Invalid API Key)
- 404: Not Found
- 500: Internal Server Error

## Testing

You can test the API using tools like Postman, Insomnia, or curl. Remember to include the API key in the headers:

```
x-api-key: your-secret-api-key
```
