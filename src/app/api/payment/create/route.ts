import { NextRequest, NextResponse } from 'next/server'
import { getServiceClient } from '@/lib/supabase'

// POST /api/payment/create
// body: { entry_id, amount_eur (1-20) }
export async function POST(request: NextRequest) {
  const { entry_id, amount_eur } = await request.json()

  if (!entry_id || !amount_eur) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  const amount = Math.floor(Number(amount_eur))
  if (amount < 1 || amount > 20) {
    return NextResponse.json({ error: 'Amount must be between 1 and 20' }, { status: 400 })
  }

  const db = getServiceClient()

  const { data: entry } = await db
    .from('entries')
    .select('id, edition_id, email')
    .eq('id', entry_id)
    .single()

  if (!entry) {
    return NextResponse.json({ error: 'Entry not found' }, { status: 404 })
  }

  const stripeKey = process.env.STRIPE_SECRET_KEY
  if (!stripeKey) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 503 })
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://citgive.com'
  const chances_added = amount * 100

  // Dynamically import stripe to avoid build errors when key is not set
  const Stripe = (await import('stripe')).default
  const stripe = new Stripe(stripeKey)

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    customer_email: entry.email,
    line_items: [
      {
        price_data: {
          currency: 'eur',
          product_data: {
            name: `Boost Giveaway CITgive — +${chances_added} chances`,
            description: `${amount}€ = ${chances_added} chances supplémentaires dans le tirage`,
          },
          unit_amount: amount * 100, // Stripe uses cents
        },
        quantity: 1,
      },
    ],
    metadata: {
      entry_id,
      edition_id: entry.edition_id,
      amount_eur: String(amount),
      chances_added: String(chances_added),
    },
    success_url: `${siteUrl}?payment=success&entry_id=${entry_id}`,
    cancel_url: `${siteUrl}?payment=cancelled&entry_id=${entry_id}`,
  })

  // Pre-record payment as pending
  await db.from('payments').insert({
    entry_id,
    edition_id: entry.edition_id,
    amount_eur: amount,
    chances_added,
    stripe_payment_id: session.id,
    status: 'pending',
  })

  return NextResponse.json({ url: session.url })
}
