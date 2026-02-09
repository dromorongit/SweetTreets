# Sweet Treets Inventory & Product Management System

A modern, robust, professional inventory management system with a full-stack integration for the Sweet Treets e-commerce website.

## 🌸 Brand Colors
- **Primary**: White (#FFFFFF)
- **Secondary**: Pink (#FFC0CB)
- **Accent**: Hot Pink (#FF69B4)

## 🏗️ Project Structure

```
SweetTreets/
├── backend/
│   ├── admin-dashboard/          # Admin dashboard UI
│   │   ├── index.html
│   │   ├── styles.css
│   │   └── app.js
│   ├── config/
│   │   └── database.js          # MongoDB connection
│   ├── controllers/
│   │   ├── adminController.js   # Admin authentication
│   │   └── productController.js  # Product CRUD operations
│   ├── middleware/
│   │   ├── auth.js              # JWT authentication
│   │   └── upload.js            # Multer image upload
│   ├── models/
│   │   ├── Admin.js            # Admin user model
│   │   └── Product.js          # Product schema
│   ├── routes/
│   │   ├── adminRoutes.js      # Admin routes
│   │   └── productRoutes.js    # Product routes
│   ├── uploads/                 # Uploaded images
│   ├── package.json
│   └── server.js               # Express server
├── assets/
│   └── images/
├── index.html
├── main.js
├── styles.css
└── shop.html
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v14+)
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. **Install Backend Dependencies**
```bash
cd backend
npm install
```

2. **Start MongoDB**
- Local: Make sure MongoDB is running on `localhost:27017`
- Atlas: Set `MONGODB_URI` environment variable

3. **Start the Server**
```bash
cd backend
node server.js
```

The server will start on `http://localhost:3000`

### Admin Setup

1. **Seed Default Admin**
```bash
# Using curl
curl -X POST http://localhost:3000/api/admin/seed
```

Default credentials:
- Username: `sweettreetsadmin`
- Password: `sweettreets123@Alice`

## 📡 API Endpoints

### Products
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | Get all products |
| GET | `/api/products/:id` | Get single product |
| GET | `/api/products/category/:category` | Get products by category |
| GET | `/api/products/new-arrivals` | Get new arrivals |
| GET | `/api/products/fast-selling` | Get fast selling products |
| POST | `/api/products` | Create product (protected) |
| PUT | `/api/products/:id` | Update product (protected) |
| DELETE | `/api/products/:id` | Delete product (protected) |
| PUT | `/api/products/deduct-stock/:id` | Deduct stock after order |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/admin/login` | Admin login |
| POST | `/api/admin/register` | Register new admin |
| POST | `/api/admin/seed` | Seed default admin |
| GET | `/api/admin/profile` | Get admin profile (protected) |

## 🛠️ Features

### Admin Dashboard
- ✅ Secure JWT authentication
- ✅ Product management (CRUD)
- ✅ Image upload with Multer
- ✅ Low stock indicators (pink highlight for stock < 5)
- ✅ Category management (Snacks, Drinks, Groceries)
- ✅ New Arrival & Fast Selling flags

### Frontend Integration
- ✅ Dynamic product loading from API
- ✅ Category-based filtering
- ✅ Homepage New Arrivals section
- ✅ Homepage Fast Selling section
- ✅ Automatic stock deduction after WhatsApp order

### Security
- ✅ JWT-based admin authentication
- ✅ Password hashing with bcrypt
- ✅ Protected admin routes
- ✅ Input validation
- ✅ Secure file uploads (images only)

## 🎨 UI/UX

### Admin Dashboard
- Modern, clean design with Sweet Treets pink branding
- Responsive sidebar navigation
- Data tables with search and filters
- Modal forms for add/edit products
- Toast notifications
- Low stock warnings

### Frontend
- Consistent Sweet Treets branding
- Pink accent colors for buttons/highlights
- Smooth animations and transitions
- Mobile responsive design

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the `backend` folder:

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/sweettreets
JWT_SECRET=your_super_secret_key
```

### Image Upload Settings
- **Allowed formats**: JPEG, JPG, PNG, WebP
- **Max file size**: 5MB
- **Upload directory**: `backend/uploads`

## 📱 Pages

### Frontend
- **Home** (`index.html`) - Hero, New Arrivals, Fast Selling
- **Shop** (`shop.html`) - All products with category tabs
- **Cart** (`cart.html`) - Shopping cart
- **Checkout** (`checkout.html`) - Order form
- **Contact** (`contact.html`) - Contact form
- **About** (`about.html`) - Company info

### Admin
- **Dashboard** (`/admin/`) - Stats, low stock alerts
- **Products** - Product listing with search/filter
- **Add Product** - Product creation form

## 🏃‍♂️ Workflow

1. Admin logs into dashboard
2. Admin adds products with images, prices, stock
3. Products appear on frontend automatically
4. Customers browse and add to cart
5. Customer completes checkout
6. Stock is automatically deducted
7. Order is sent via WhatsApp

## 🔮 Future Scalability
- Order history system
- Analytics dashboard
- Payment gateway integration
- Email notifications
- User accounts
- Advanced search & filtering

## 📄 License
© 2026 Sweet Treets. All Rights Reserved.
