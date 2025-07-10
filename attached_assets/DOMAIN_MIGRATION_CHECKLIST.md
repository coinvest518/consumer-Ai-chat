# Domain Migration Checklist for consumerai.info 🚀

## ✅ **Environment Variables Updated**

### **In `.env` file:**
```env
# Application URLs
VITE_PUBLIC_URL=https://consumerai.info
VITE_API_BASE_URL=https://consumerai.info/api

# Stripe Configuration (Updated)
STRIPE_SUCCESS_URL=https://consumerai.info/thank-you
STRIPE_CANCEL_URL=https://consumerai.info/pricing
```

## ✅ **Server Configuration Updated**

### **CORS Settings:**
- Added `https://consumerai.info` and `https://www.consumerai.info` to allowed origins
- Updated origin checking logic to include `consumerai.info` domain

### **Payment Verification:**
- Added missing `/api/verify-payment/:sessionId` GET endpoint
- Handles Stripe session verification for thank-you page

## 🔄 **ACTION REQUIRED: Update Stripe Dashboard**

### **Critical: Update Payment Link Redirect URL**

1. **Login to Stripe Dashboard** → [dashboard.stripe.com](https://dashboard.stripe.com)
2. **Go to Payment Links** → Products → Payment Links
3. **Find your payment link:** `https://buy.stripe.com/9AQeYP2cUcq0eA0bIU`
4. **Click "Edit"**
5. **Update "After payment" redirect URL to:**
   ```
   https://consumerai.info/thank-you?session_id={CHECKOUT_SESSION_ID}
   ```
6. **Save changes**

### **Alternative: Create New Payment Link**
If you can't edit the existing link, create a new one with:
- **Success URL:** `https://consumerai.info/thank-you?session_id={CHECKOUT_SESSION_ID}`
- **Cancel URL:** `https://consumerai.info/pricing`

Then update these files with the new link:
- `src/pages/Dashboard.tsx` (line 117)
- `src/components/home/PricingSection.tsx` (line 35)

## ✅ **Files Already Using Environment Variables Correctly**

These files automatically use the environment variables and will work with the new domain:

### **Backend API Configuration:**
- `src/lib/config.ts` - Uses relative `/api` paths in production
- `src/lib/api.ts` - Uses `API_BASE_URL` from config

### **Authentication & Database:**
- All Supabase, Astra DB, and Langflow URLs are properly configured
- No hardcoded domain references found

### **Tavus AI Integration:**
- All API calls use relative paths
- CORS updated to allow new domain

## 🔧 **Production Deployment Configuration**

### **Vercel.json:**
```json
{
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "server/src/server.ts"
    },
    {
      "handle": "filesystem"
    },
    {
      "src": "/(.*)",
      "dest": "/dist/$1"
    }
  ]
}
```
✅ Already configured correctly for any domain

### **Environment Variables for Production:**
Make sure these are set in your hosting platform:

**Required for Production:**
```env
# Database
ASTRA_DB_APPLICATION_TOKEN=AstraCS:cbhQNuZcbPeCHUCyfLZLcuGn:...
ASTRA_DB_ENDPOINT=https://cd1d8253-301e-450b-a88c-012bc7a6a620-us-east-2.apps.astra.datastax.com

# Authentication  
VITE_SUPABASE_URL=https://ffvvesrqtdktayjwurwm.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# AI Services
LANGFLOW_API_URL=https://api.langflow.astra.datastax.com/lf/...
LANGFLOW_API_KEY=AstraCS:amfyHbguUDqJuIIAZNKfsUNO:...

# Payments
STRIPE_SECRET_KEY=rk_live_51MecVjE4H116aDHA...
STRIPE_PUBLISHABLE_KEY=pk_live_51MecVjE4H116aDHA...

# Tavus AI
TAVUS_API_KEY=2205a4ce09c0421b8470878eb22e14e0
TAVUS_PERSONA_ID=pb1db14ac254
TAVUS_REPLICA_ID=r4317e64d25a

# Application
VITE_PUBLIC_URL=https://consumerai.info
```

## 🧪 **Testing Checklist**

### **After Updating Stripe Payment Link:**

1. **Test Payment Flow:**
   - Visit `https://consumerai.info/pricing`
   - Click "Get Started" 
   - Complete payment on Stripe
   - Verify redirect to `https://consumerai.info/thank-you?session_id=...`
   - Check that credits are added to user account

2. **Test API Endpoints:**
   - Chat functionality
   - Template usage
   - Tavus video chat
   - User authentication

3. **Test CORS:**
   - All frontend-to-backend API calls should work
   - No CORS errors in browser console

## 🎯 **Current Payment Link Status**

**Current Link:** `https://buy.stripe.com/9AQeYP2cUcq0eA0bIU`
**Used in:** 
- Dashboard → "Get More Credits" button
- Pricing Section → "Get Started" button

**⚠️ This link redirects to old domain - MUST be updated in Stripe Dashboard**

## ✅ **Domain Migration Complete After Stripe Update**

Once you update the Stripe payment link redirect URL, your application will be fully configured for `consumerai.info` with:

- ✅ Proper environment variables
- ✅ CORS configuration
- ✅ Payment verification endpoints
- ✅ AI services integration
- ✅ Database connections
- ✅ Authentication flow
- ✅ Tavus video chat

The only remaining step is updating the Stripe payment link redirect URL in your Stripe Dashboard! 🎉
