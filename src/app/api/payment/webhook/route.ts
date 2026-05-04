import { NextRequest, NextResponse } from 'next/server'
import { getServiceClient } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  const stripeKey = process.env.STRIPE_SECRET_KEY
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!stripeKey || !webhookSecret) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 503 })
  }

  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 })
  }

  let event: any
  try {
    const Stripe = (await import('stripe')).default
    const stripe = new Stripe(stripeKey)
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as any
    const { entry_id, chances_added } = session.metadata

    if (!entry_id || !chances_added) {
      return NextResponse.json({ error: 'Missing metadata' }, { status: 400 })
    }

    const db = getServiceClient()

    // Mark payment as completed
    await db
      .from('payments')
      .update({ status: 'completed' })
      .eq('stripe_payment_id', session.id)

    // Add chances to entry
    const { data: entry } = await db
      .from('entries')
      .select('chances')
      .eq('id', entry_id)
      .single()

    if (entry) {
      await db
        .from('entries')
        .update({ chances: entry.chances + Number(chances_added) })
        .eq('id', entry_id)
    }
  }

  return NextResponse.json({ received: true })
}
