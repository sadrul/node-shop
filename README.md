# Node.js E-commerce Shop

A full-featured e-commerce application built with Node.js, Express, TypeScript, and MongoDB.

## Features

- 🔐 User authentication and authorization
- 🛍️ Product browsing and searching
- 🛒 Shopping cart functionality
- 💳 Secure payment processing with Stripe
- 📦 Order management
- 👤 User profile management
- 📱 Responsive design

## Tech Stack

- **Backend:**
  - Node.js
  - Express.js
  - TypeScript
  - MongoDB with Mongoose
  - JWT for authentication
  - Stripe for payments

- **Frontend:**
  - EJS templating engine
  - Tailwind CSS for styling
  - Alpine.js for interactivity

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- Stripe account (for payment processing)

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_PUBLIC_KEY=your_stripe_public_key
JWT_SECRET=your_jwt_secret
```

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd node-shop
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5001`

## Project Structure

```
src/
├── config/         # Configuration files
├── controllers/    # Route controllers
├── middleware/     # Custom middleware
├── models/         # Database models
├── routes/         # Route definitions
├── utils/          # Utility functions
└── views/          # EJS templates
```

## API Endpoints

### Authentication
- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login user
- `GET /auth/logout` - Logout user

### Products
- `GET /products` - Get all products
- `GET /products/:id` - Get product details
- `GET /products/search` - Search products

### Cart
- `POST /cart/add` - Add item to cart
- `POST /cart/update` - Update cart item quantity
- `DELETE /cart/remove/:productId` - Remove item from cart
- `GET /cart` - View cart

### Orders
- `POST /orders/create` - Create new order
- `GET /orders` - Get user orders
- `GET /orders/:id` - Get order details

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Express.js](https://expressjs.com/)
- [MongoDB](https://www.mongodb.com/)
- [Stripe](https://stripe.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Alpine.js](https://alpinejs.dev/)