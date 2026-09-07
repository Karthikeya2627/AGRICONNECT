node -v# AgriConnect — SIH Demo

A polished farm-to-consumer prototype inspired by the supplied AgriConnect reference.

## Included
- Consumer marketplace with 15 fruits/vegetables
- Search, categories and cart
- Demo login with Consumer/Farmer roles
- Farmer dashboard with inventory, orders, sales and payouts
- Consumer order tracking dashboard
- Transparent farmer/platform/consumer pricing
- Farm-to-door traceability UI
- AI produce-quality scan demo
- Responsive desktop/mobile UI
- LocalStorage cart/login persistence

## Run locally
Open `index.html` directly in a browser, or run:
`python -m http.server 5500`
and open `http://localhost:5500`

## Deploy to Vercel
Upload the project folder/repository to Vercel as a static site. No build command is required.

## Important
The login, payment, delivery tracking, inventory updates and AI quality scan are demo/front-end flows. For a real SIH deployment, connect them to a backend such as Supabase/Firebase/Node + PostgreSQL and replace the simulated AI result with a trained computer-vision model/API.
