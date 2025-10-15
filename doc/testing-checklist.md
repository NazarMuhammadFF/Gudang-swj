# End-to-End Testing Checklist - TASK-017

**Date:** October 15, 2025  
**Server:** http://localhost:3001

## 🔐 Authentication & Authorization Testing

### Login Flow

- [ ] Navigate to /login
- [ ] Login as admin (admin@bekasberkah.id / admin123)
  - [ ] Should redirect to /admin
  - [ ] Should show "Admin Panel" button in navbar (not profile)
  - [ ] Should save admin profile to localStorage
- [ ] Logout from admin
- [ ] Login as user (user@bekasberkah.id / user123)
  - [ ] Should redirect to /account
  - [ ] Should show profile button with name in navbar
  - [ ] Should save user profile to localStorage
- [ ] Test invalid credentials
  - [ ] Should show error toast

### Access Control

- [ ] As guest, try to access /admin → Should redirect to /login
- [ ] As guest, try to access /account → Should redirect to /login
- [ ] As user, try to access /admin → Should redirect to /login
- [ ] As admin, try to access /account → Should redirect to /admin
- [ ] Test navbar buttons visibility:
  - [ ] Guest: Shows "Login" button only
  - [ ] Admin: Shows "Admin Panel" button only (no profile)
  - [ ] User: Shows profile button only (no admin)

---

## 👨‍💼 Admin Workflow Testing

### Dashboard (/)

- [ ] Login as admin
- [ ] Check dashboard loads
- [ ] Verify stats widgets show correct counts:
  - [ ] Total Products
  - [ ] Total Categories
  - [ ] Total Submissions
  - [ ] Total Orders
  - [ ] Orders in Process
  - [ ] Revenue
- [ ] Check recent orders table displays
- [ ] Test "Seed Database" button
- [ ] Test "Clear Database" button
- [ ] Test "Reset Database" button
- [ ] Verify quick action cards work:
  - [ ] Add Product → Opens product form
  - [ ] View Orders → Goes to orders page
  - [ ] Review Submissions → Goes to submissions page

### Product Management (/admin/products)

- [ ] Navigate to Products page
- [ ] Verify product list displays
- [ ] Test search functionality
- [ ] Test category filter
- [ ] Test status filter (all/active/inactive)
- [ ] Test sorting (name, price, category, status)
- [ ] Test pagination if many products

#### Create Product

- [ ] Click "Add Product" button
- [ ] Fill form with valid data:
  - [ ] Name
  - [ ] Description
  - [ ] Price
  - [ ] Category (dropdown)
  - [ ] Image URL
  - [ ] Status (Active/Inactive toggle)
- [ ] Submit form
- [ ] Verify success toast
- [ ] Verify product appears in list
- [ ] Verify product persists after page refresh

#### Edit Product

- [ ] Click edit button on a product
- [ ] Verify form pre-fills with product data
- [ ] Modify data
- [ ] Submit form
- [ ] Verify success toast
- [ ] Verify changes appear in list
- [ ] Verify changes persist

#### Delete Product

- [ ] Click delete button
- [ ] Verify confirmation dialog appears
- [ ] Cancel deletion → Product should remain
- [ ] Delete again and confirm
- [ ] Verify success toast
- [ ] Verify product removed from list

#### Toggle Status

- [ ] Toggle product status (Active ↔ Inactive)
- [ ] Verify badge updates
- [ ] Verify status persists
- [ ] Check that inactive products don't show on storefront

### Category Management (/admin/categories)

- [ ] Navigate to Categories page
- [ ] Verify category list displays
- [ ] Verify product count shows for each category

#### Create Category

- [ ] Click "Add Category" button
- [ ] Fill form (name, description)
- [ ] Submit form
- [ ] Verify success toast
- [ ] Verify category appears in list
- [ ] Verify category available in product dropdown

#### Edit Category

- [ ] Click edit button
- [ ] Modify data
- [ ] Submit form
- [ ] Verify changes appear

#### Delete Category

- [ ] Try to delete category with products
  - [ ] Should show warning about products using it
- [ ] Delete category without products
  - [ ] Should delete successfully

### Submission Management (/admin/submissions)

- [ ] Navigate to Submissions page
- [ ] Verify submissions list displays
- [ ] Test status filter (pending, approved, rejected)
- [ ] Test search by seller name or product

#### Review Submission

- [ ] Click on a pending submission
- [ ] Review submission details:
  - [ ] Seller information
  - [ ] Product details
  - [ ] Images
  - [ ] Pricing
- [ ] Approve submission:
  - [ ] Add admin notes
  - [ ] Click Approve
  - [ ] Verify toast success
  - [ ] Verify status changes to "Approved"
  - [ ] Check if product auto-created (if configured)
- [ ] Reject submission:
  - [ ] Add rejection reason
  - [ ] Click Reject
  - [ ] Verify status changes to "Rejected"

### Order Management (/admin/orders)

- [ ] Navigate to Orders page
- [ ] Verify orders list displays
- [ ] Verify status stats show correct counts
- [ ] Test status filter (pending, processing, shipped, delivered, cancelled)
- [ ] Test date range filter
- [ ] Test search by order number or customer name

#### Update Order Status

- [ ] Click on an order
- [ ] View order details
- [ ] Update status: Pending → Processing
- [ ] Update status: Processing → Shipped
- [ ] Update status: Shipped → Delivered
- [ ] Verify each status change:
  - [ ] Shows success toast
  - [ ] Updates in list
  - [ ] Persists in database
  - [ ] Updates stats correctly

### Admin Profile & Logout

- [ ] Click admin avatar/dropdown in sidebar
- [ ] Verify shows "Mode Administrator" info
- [ ] Verify explanation text shows admin doesn't transact
- [ ] Click logout
- [ ] Verify redirects to /login
- [ ] Verify localStorage cleared
- [ ] Verify can't access /admin anymore

---

## 🛍️ Buyer Journey Testing

### Browse & Discovery

- [ ] Navigate to homepage (/)
- [ ] Verify hero section displays
- [ ] Verify featured products show (4 products)
- [ ] Verify stats section displays
- [ ] Verify product grid shows latest products
- [ ] Click "Jelajahi Produk" → Should go to /products
- [ ] Click on a product card → Should go to /products/[id]

### Product Listing (/products)

- [ ] Navigate to /products
- [ ] Verify all active products display
- [ ] Verify grid layout responsive (2/3/4 columns)

#### Search

- [ ] Type in search box
- [ ] Verify results filter in real-time
- [ ] Verify URL updates with search param
- [ ] Clear search → All products return

#### Filter by Category

- [ ] Select a category from dropdown
- [ ] Verify products filter by category
- [ ] Verify URL updates
- [ ] Select "All Categories" → All products return

#### Price Range Filter

- [ ] Drag price range slider
- [ ] Verify products filter by price range
- [ ] Verify range values update
- [ ] Reset filter → All products return

#### Sort Products

- [ ] Sort by "Terbaru" (Newest)
- [ ] Sort by "Harga: Rendah ke Tinggi"
- [ ] Sort by "Harga: Tinggi ke Rendah"
- [ ] Sort by "Nama: A-Z"
- [ ] Sort by "Nama: Z-A"
- [ ] Verify each sort works correctly

#### Combined Filters

- [ ] Apply search + category + price range + sort
- [ ] Verify all filters work together
- [ ] Verify URL params updated
- [ ] Verify active filters show in badges
- [ ] Click badge X to remove individual filter
- [ ] Click "Reset Filters" to clear all

### Product Detail (/products/[id])

- [ ] Click on a product
- [ ] Verify product details display:
  - [ ] Image
  - [ ] Name
  - [ ] Price
  - [ ] Category
  - [ ] Description
  - [ ] Features
- [ ] Verify breadcrumb navigation
- [ ] Verify related products section shows (same category)
- [ ] Test quantity selector:
  - [ ] Increment quantity
  - [ ] Decrement quantity (min 1)
  - [ ] Type quantity directly
- [ ] Click "Tambah ke Keranjang"
  - [ ] Verify success toast
  - [ ] Verify cart badge updates
- [ ] Test back to products navigation

### Shopping Cart

- [ ] Click cart icon
- [ ] Verify cart drawer opens
- [ ] Verify added items show with:
  - [ ] Product image
  - [ ] Name
  - [ ] Price
  - [ ] Quantity
  - [ ] Subtotal
- [ ] Test quantity controls in cart:
  - [ ] Increment quantity → Total updates
  - [ ] Decrement quantity → Total updates
  - [ ] Can't go below 1
- [ ] Test checkbox selection:
  - [ ] Select individual items
  - [ ] Select all items
  - [ ] Deselect items
- [ ] Test "Hapus X Item Terpilih" button:
  - [ ] Only selected items removed
  - [ ] Toast shows success
  - [ ] Total updates
- [ ] Test "Hapus" button on individual item
- [ ] Test "Checkout" button:
  - [ ] Should go to /checkout
  - [ ] Should carry cart data
- [ ] Test cart persistence:
  - [ ] Add items
  - [ ] Refresh page → Items should persist
  - [ ] Close browser and reopen → Items should persist

### Checkout Process (/checkout)

- [ ] Navigate to /checkout with items in cart
- [ ] Verify cart summary sidebar shows:
  - [ ] All items
  - [ ] Quantities
  - [ ] Prices
  - [ ] Subtotal
  - [ ] Total

#### Customer Information Form

- [ ] Fill customer info:
  - [ ] Name (required)
  - [ ] Email (required, valid format)
  - [ ] Phone (required)
- [ ] Test validation:
  - [ ] Submit without name → Error
  - [ ] Submit with invalid email → Error
  - [ ] Submit without phone → Error

#### Shipping Address Form

- [ ] Fill shipping address:
  - [ ] Address (required)
  - [ ] City (required)
  - [ ] Postal Code (required)
  - [ ] Notes (optional)
- [ ] Test validation

#### Payment Method

- [ ] Select "Cash on Delivery (COD)"
- [ ] Select "Transfer Bank"
- [ ] Select "E-Wallet"
- [ ] Verify selection updates

#### Place Order

- [ ] Fill all required fields
- [ ] Click "Proses Pesanan"
- [ ] Verify loading state shows
- [ ] Verify success redirect to /checkout/success
- [ ] Verify order created in database
- [ ] Verify cart cleared after order

### Order Success (/checkout/success)

- [ ] Verify success message displays
- [ ] Verify order details show:
  - [ ] Order number
  - [ ] Customer information
  - [ ] Shipping address
  - [ ] Items ordered with quantities
  - [ ] Payment method
  - [ ] Total amount
- [ ] Verify "Next Steps" info box
- [ ] Click "Kembali ke Beranda" → Goes to /
- [ ] Click "Belanja Lagi" → Goes to /products
- [ ] Verify can't access order without orderId param

---

## 📦 Seller Journey Testing

### Submit Item (/sell)

- [ ] Navigate to /sell page
- [ ] Verify form displays

#### Fill Seller Information

- [ ] Fill seller info:
  - [ ] Name (required)
  - [ ] Email (required, valid)
  - [ ] Phone (required)
  - [ ] WhatsApp (optional)

#### Fill Product Information

- [ ] Fill product details:
  - [ ] Product name (required)
  - [ ] Category (required, dropdown)
  - [ ] Price (required, number)
  - [ ] Condition (required: Seperti Baru/Bekas Baik/Bekas Normal)
  - [ ] Description (required)
  - [ ] Reason for selling (required)
  - [ ] Purchase year (optional)
- [ ] Upload images (optional/required)
- [ ] Test validation:
  - [ ] Submit without required fields → Errors
  - [ ] Submit with invalid email → Error
  - [ ] Submit with invalid price → Error

#### Submit Form

- [ ] Fill all fields correctly
- [ ] Click "Ajukan Produk"
- [ ] Verify loading state
- [ ] Verify success redirect to /sell/success
- [ ] Verify submission created in database

### Submission Success (/sell/success)

- [ ] Verify success message
- [ ] Verify submission reference number
- [ ] Verify info about review process
- [ ] Click "Lacak Status Pengajuan" → Goes to /sell/status or /account
- [ ] Click "Ajukan Produk Lain" → Goes back to /sell

### Track Submission (/account - Submissions tab)

- [ ] Login as user with email matching submission
- [ ] Navigate to account page
- [ ] Click "Pengajuan Penjual" tab
- [ ] Verify submissions show with:
  - [ ] Product name
  - [ ] Status (Pending/Approved/Rejected)
  - [ ] Submission date
  - [ ] Admin notes (if any)
- [ ] Verify can see only own submissions (by email)
- [ ] Test status badges (Pending/Approved/Rejected)

---

## 👤 User Account Testing

### Account Overview

- [ ] Login as user
- [ ] Navigate to /account
- [ ] Verify overview section shows:
  - [ ] Total orders
  - [ ] Total spent
  - [ ] Delivered orders
  - [ ] In-transit orders
  - [ ] Pending submissions
  - [ ] Approved submissions
- [ ] Verify profile card shows:
  - [ ] Name
  - [ ] Email
  - [ ] Phone
  - [ ] Address
  - [ ] Member since

### Order History

- [ ] Click "Riwayat Pesanan" tab
- [ ] Verify orders list shows only user's orders (by email)
- [ ] Verify each order shows:
  - [ ] Order number
  - [ ] Date
  - [ ] Status badge
  - [ ] Total amount
  - [ ] Items count
- [ ] Click "Lihat Detail" on an order
- [ ] Verify order details modal/page shows full info
- [ ] Test status colors match admin (Pending/Processing/Shipped/Delivered/Cancelled)

### Submissions Tracking

- [ ] Click "Pengajuan Penjual" tab
- [ ] Verify only user's submissions show
- [ ] Verify status updates from admin reflect here
- [ ] Test filtering by status

### Account Settings

- [ ] Click "Pengaturan Akun" tab
- [ ] Update profile information:
  - [ ] Change name
  - [ ] Change phone
  - [ ] Change address
- [ ] Click "Simpan Perubahan"
- [ ] Verify success toast
- [ ] Verify changes persist
- [ ] Refresh page → Changes should remain
- [ ] Update preferences:
  - [ ] Toggle email updates
  - [ ] Toggle SMS updates
  - [ ] Toggle marketing tips
- [ ] Save preferences
- [ ] Verify they persist

### Logout from Account

- [ ] Scroll to bottom or find logout button
- [ ] Click logout
- [ ] Verify redirect to /login or /
- [ ] Verify localStorage cleared
- [ ] Verify can't access /account anymore

---

## 🔄 Cross-Feature Integration Testing

### Cart + Checkout + Order Flow

- [ ] Add multiple products to cart (different quantities)
- [ ] Go to checkout
- [ ] Complete order
- [ ] Verify order appears in:
  - [ ] Admin orders list (/admin/orders)
  - [ ] User order history (/account)
- [ ] Verify order details match across:
  - [ ] Checkout form data
  - [ ] Database
  - [ ] Admin view
  - [ ] User view

### Submission + Admin + User Flow

- [ ] Submit product as seller (logged in as user)
- [ ] Login as admin
- [ ] Go to submissions
- [ ] Find and approve the submission
- [ ] Logout from admin
- [ ] Login as original user
- [ ] Check account → Submission should show "Approved"
- [ ] Logout
- [ ] Check storefront → Approved product should appear (if auto-created)

### Category + Product Filtering Flow

- [ ] Login as admin
- [ ] Create new category "Test Category"
- [ ] Create products in "Test Category"
- [ ] Logout
- [ ] Go to /products
- [ ] Filter by "Test Category"
- [ ] Verify only those products show
- [ ] Click on product → Details correct

### Search Across Multiple Pages

- [ ] Search from homepage navbar
- [ ] Search from /products page
- [ ] Search from product detail page
- [ ] Verify search works consistently
- [ ] Verify results link correctly

---

## 🐛 Error Handling & Edge Cases

### Database Errors

- [ ] Clear database completely
- [ ] Try to browse products → Should show empty state
- [ ] Try to filter → Should handle gracefully
- [ ] Seed database → Products should appear
- [ ] Try to create order with empty cart → Should prevent
- [ ] Try to checkout without items → Should redirect or show error

### Form Validation

- [ ] Submit all forms with empty fields → Proper errors
- [ ] Submit with invalid email formats → Proper errors
- [ ] Submit with negative prices → Proper errors
- [ ] Submit with special characters where not allowed → Proper errors

### Navigation Errors

- [ ] Go to /products/99999 (non-existent product) → Should show 404 or redirect
- [ ] Go to /checkout/success without order → Should redirect or show error
- [ ] Direct URL access to protected pages when logged out → Should redirect to login

### Loading States

- [ ] Verify all async operations show loading indicators:
  - [ ] Database queries
  - [ ] Form submissions
  - [ ] Status updates
  - [ ] Login process
- [ ] Verify no double-submissions possible (buttons disabled during loading)

### Responsive Design

- [ ] Test on mobile view (< 768px):
  - [ ] Navbar collapses correctly
  - [ ] Cart drawer works
  - [ ] Forms are usable
  - [ ] Product grid responsive (2 columns)
  - [ ] Admin tables show mobile cards
- [ ] Test on tablet (768-1024px):
  - [ ] Layout adapts
  - [ ] Product grid (3 columns)
- [ ] Test on desktop (>1024px):
  - [ ] Full layout
  - [ ] Product grid (4 columns)

---

## 🎯 Priority Issues to Fix

### Critical (Must Fix)

- [ ] Any broken authentication flows
- [ ] Cart not persisting
- [ ] Orders not creating
- [ ] Database operations failing
- [ ] Critical navigation broken

### High (Should Fix)

- [ ] Missing loading states
- [ ] Missing error messages
- [ ] Confusing user flows
- [ ] Accessibility issues
- [ ] Mobile usability issues

### Medium (Nice to Fix)

- [ ] UI polish items
- [ ] Minor UX improvements
- [ ] Performance optimizations
- [ ] Code cleanup

### Low (Optional)

- [ ] Additional features
- [ ] Advanced filters
- [ ] Animations
- [ ] Easter eggs

---

## ✅ Testing Sign-Off

**Tested by:** ********\_********  
**Date:** ********\_********  
**Build Version:** ********\_********  
**Browser(s):** ********\_********  
**Device(s):** ********\_********

**Overall Status:**

- [ ] All critical flows work end-to-end
- [ ] No blocking bugs found
- [ ] Ready for Phase 3 completion
- [ ] Ready for deployment preparation

**Notes:**

---

---

---
