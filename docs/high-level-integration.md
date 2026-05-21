# Stratum3D High-Level Integration

This diagram shows how the main Stratum3D website, admin area, and required external services fit together.

## System Diagram

```mermaid
flowchart LR
  customer["Customer"]
  admin["Admin / Staff"]

  subgraph app["Stratum3D Web App<br/>(Next.js on Vercel)"]
    storefront["Public Website<br/>Home, Quote, Gallery, Policies"]
    api["App Server / API Routes<br/>Quotes, Uploads, Checkout,<br/>Webhooks, Settings, Gallery"]
    adminPortal["Admin Portal<br/>Orders, Gallery, Colours, Settings"]
  end

  subgraph supabase["Supabase"]
    db["Postgres Database<br/>orders, quote_inputs, history,<br/>settings, sessions, rate limits"]
    storage["Storage Buckets<br/>order-files, gallery"]
  end

  stripe["Stripe<br/>Checkout, Payment Intents, Webhooks"]
  resend["Resend<br/>Customer + Admin Emails"]
  google["Google Maps Places<br/>Australian address verification"]

  customer --> storefront
  admin --> adminPortal

  storefront --> api
  adminPortal --> api

  storefront -->|Shipping address lookup| google

  api -->|Read/write business data| db
  api -->|Create signed upload URLs<br/>download uploaded files| storage
  storefront -->|Upload STL files with signed URLs| storage

  api -->|Create checkout session| stripe
  storefront -->|Redirect customer to payment page| stripe
  stripe -->|Webhook events back to app| api

  adminPortal -->|Approve = capture payment<br/>Reject = cancel authorisation| stripe

  api -->|Send order confirmations,<br/>status updates, admin alerts| resend
```

## Simple Flow

1. The customer uses the public website to upload STL files, configure print settings, and request a quote.
2. The app stores quote/order data in Supabase and uploads the STL files into Supabase Storage.
3. If the customer chooses shipping, the address is verified through Google Maps Places.
4. The app creates a Stripe Checkout session and sends the customer to Stripe to authorise payment.
5. Stripe sends webhook events back to the app after checkout.
6. The app updates the order in Supabase and sends email notifications through Resend.
7. The admin logs into the admin portal to review the order.
8. When the admin approves the order, the app captures the Stripe payment. If the admin rejects it, the app cancels the payment authorisation.
9. The admin portal continues updating order status, gallery content, colours, and settings through the same app and Supabase backend.

## Required Services In The Current Build

- `Vercel`: hosts the Next.js website and API routes.
- `Supabase`: database, storage, and admin session persistence.
- `Stripe`: checkout, payment authorisation, capture, cancellation, refunds, and webhooks.
- `Resend`: transactional customer/admin emails.
- `Google Maps Places`: shipping-address verification for Australian addresses.

