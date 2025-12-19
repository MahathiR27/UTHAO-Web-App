# Referral System & Promocode API Documentation

## Overview
This system allows users to refer new users and rewards them with promotional codes that can be used for discounts during checkout.

---

## Features Implemented

### 1. **User Registration with Referral Code**
New users can optionally provide a referral code during registration.

### 2. **Automatic Promocode Generation**
When a valid referral code is used, the new user receives 3 promocodes:
- **WELCOMETOUTHAO**: 10% discount
- **JOSSMAMA**: 50% discount  
- **LOVEYOU**: 25% discount

### 3. **Promocode Management**
- Each promocode can only be used once
- Promocodes never expire
- Discounts apply to the total bill amount

---

## API Endpoints

### Registration with Referral Code

**Endpoint:** `POST /api/signup`

**Request Body:**
```json
{
  "UserName": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "phone": "1234567890",
  "address": "123 Main St",
  "referralCode": "USR-507f1f77bcf86cd799439011"  // Optional
}
```

**Success Response (with referral):**
```json
{
  "message": "User registered successfully with referral bonus!",
  "user": { /* user object */ },
  "promocodes": [
    { "code": "WELCOMETOUTHAO", "discount": 10 },
    { "code": "JOSSMAMA", "discount": 50 },
    { "code": "LOVEYOU", "discount": 25 }
  ]
}
```

**Error Responses:**
```json
// Invalid referral code
{
  "message": "Invalid referral code. The code you entered does not exist."
}

// User trying to use their own code
{
  "message": "You cannot use your own referral code."
}
```

---

### Get User's Promocodes

**Endpoint:** `GET /api/dashboard/get-promocodes`

**Headers:** 
```
Authorization: Bearer <token>
```

**Success Response:**
```json
{
  "promocodes": [
    {
      "code": "WELCOMETOUTHAO",
      "discount": 10,
      "used": false,
      "createdAt": "2025-12-20T10:30:00.000Z"
    },
    {
      "code": "JOSSMAMA",
      "discount": 50,
      "used": true,
      "createdAt": "2025-12-20T10:30:00.000Z"
    },
    {
      "code": "LOVEYOU",
      "discount": 25,
      "used": false,
      "createdAt": "2025-12-20T10:30:00.000Z"
    }
  ],
  "availableCount": 2
}
```

---

### Validate Promocode (Preview)

**Endpoint:** `POST /api/dashboard/validate-promocode`

**Headers:** 
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "promocode": "WELCOMETOUTHAO",
  "totalAmount": 100
}
```

**Success Response:**
```json
{
  "valid": true,
  "promocode": "WELCOMETOUTHAO",
  "discount": 10,
  "originalAmount": 100,
  "discountAmount": 10,
  "finalAmount": 90
}
```

**Error Responses:**
```json
// Promocode not found
{
  "message": "Promocode not found",
  "valid": false
}

// Already used
{
  "message": "This promocode has already been used",
  "valid": false
}
```

---

### Apply Promocode (Checkout)

**Endpoint:** `POST /api/dashboard/apply-promocode`

**Headers:** 
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "promocode": "JOSSMAMA",
  "totalAmount": 200
}
```

**Success Response:**
```json
{
  "message": "Promocode applied successfully",
  "originalAmount": 200,
  "discount": 50,
  "discountAmount": 100,
  "finalAmount": 100,
  "promocode": "JOSSMAMA"
}
```

**Note:** After this call, the promocode is marked as used and cannot be used again.

---

### Generate Reference ID (for existing users)

**Endpoint:** `POST /api/dashboard/generate-refid`

**Headers:** 
```
Authorization: Bearer <token>
```

**Success Response:**
```json
{
  "message": "Reference ID generated successfully",
  "refId": "USR-507f1f77bcf86cd799439011",
  "user": { /* user object */ }
}
```

---

## Usage Flow

### For New Users:
1. **Registration**: Include optional `referralCode` in signup request
2. **Validation**: System validates the referral code exists and is not the user's own
3. **Promocode Creation**: If valid, 3 promocodes are automatically created
4. **Receive Confirmation**: Registration response includes the promocodes

### For Checkout:
1. **Get Available Promocodes**: Call `GET /api/dashboard/get-promocodes`
2. **Validate Promocode** (optional): Call `POST /api/dashboard/validate-promocode` to preview discount
3. **Apply Promocode**: Call `POST /api/dashboard/apply-promocode` during checkout
4. **Complete Purchase**: Use the `finalAmount` returned for payment processing

### For Existing Users to Refer:
1. **Generate RefID**: Call `POST /api/dashboard/generate-refid` (if not already done)
2. **Share RefID**: Share the `refId` with potential new users
3. **New User Uses Code**: New user includes the `refId` as `referralCode` during registration

---

## Database Schema Updates

### User Schema - New Fields:

```javascript
promocodes: {
  type: [
    {
      code: { type: String, required: true },
      discount: { type: Number, required: true }, // Percentage
      used: { type: Boolean, default: false },
      createdAt: { type: Date, default: Date.now }
    }
  ],
  default: []
}
```

---

## Important Notes

1. **Referral Code is Optional**: Users can register without a referral code
2. **One-Time Use**: Each promocode can only be used once
3. **No Expiration**: Promocodes never expire
4. **Self-Referral Prevention**: Users cannot use their own referral code
5. **Total Bill Discount**: Discounts apply to the total order amount
6. **Case Sensitive**: Promocodes are case-sensitive

---

## Example Integration (Frontend)

### Registration Form:
```javascript
const handleSignup = async (formData) => {
  const response = await fetch('/api/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      UserName: formData.name,
      email: formData.email,
      password: formData.password,
      phone: formData.phone,
      address: formData.address,
      referralCode: formData.referralCode || undefined
    })
  });
  
  const data = await response.json();
  
  if (data.promocodes) {
    // Show user their new promocodes
    console.log('You received promocodes:', data.promocodes);
  }
};
```

### Checkout Flow:
```javascript
const applyDiscount = async (promocode, totalAmount) => {
  // First validate to show preview
  const validateResponse = await fetch('/api/dashboard/validate-promocode', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ promocode, totalAmount })
  });
  
  const validation = await validateResponse.json();
  
  if (validation.valid) {
    // Show discount preview to user
    console.log(`Save $${validation.discountAmount}!`);
    
    // User confirms - apply the promocode
    const applyResponse = await fetch('/api/dashboard/apply-promocode', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ promocode, totalAmount })
    });
    
    const result = await applyResponse.json();
    // Proceed with payment using result.finalAmount
  }
};
```
