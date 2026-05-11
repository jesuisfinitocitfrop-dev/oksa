import { NextRequest, NextResponse } from 'next/server'
import { getServiceClient } from '@/lib/supabase'

const TIER_GIVEAWAYS: Record<string, number> = {
  starter: 1,
  plus: 4,
  vip: 999,
}

export async function POST(request: NextRequest) {
  const stripeKey = process.env.STRIPE_SECRET_KEY
  const webhookSecret = process.env.STRIPE_SUBSCRIPTION_WEBHOOK_SECRET || process.env.STRIPE_WEBHOOK_SECRET

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
    console.error('Subscription webhook signature verification failed:', err.message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const db = getServiceClient()

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as any
    if (session.mode !== 'subscription') return NextResponse.json({ received: true })

    const { email, roblox_username, tier, giveaways_remaining, bonus_chances } = session.metadata ?? {}
    if (!email || !tier) return NextResponse.json({ received: true })

    const { data: existing } = await db
      .from('subscriptions')
      .select('id')
      .eq('stripe_subscription_id', session.subscription)
      .maybeSingle()

    if (!existing) {
      await db.from('subscriptions').insert({
        email,
        roblox_username: roblox_username || null,
        tier,
        amount_eur: tier === 'starter' ? 5 : tier === 'plus' ? 9 : 19,
        stripe_subscription_id: session.subscription,
        stripe_customer_id: session.customer,
        status: 'active',
        giveaways_remaining: Number(giveaways_remaining ?? 1),
        bonus_chances: Number(bonus_chances ?? 0),
      })
    }
  }

  if (event.type === 'customer.subscription.deleted') {
    const sub = event.data.object as any
    await db
      .from('subscriptions')
      .update({ status: 'cancelled' })
      .eq('stripe_subscription_id', sub.id)
  }

  if (event.type === 'invoice.payment_failed') {
    const invoice = event.data.object as any
    if (invoice.subscription) {
      await db
        .from('subscriptions')
        .update({ status: 'past_due' })
        .eq('stripe_subscription_id', invoice.subscription)
    }
  }

  if (event.type === 'invoice.payment_succeeded') {
    const invoice = event.data.object as any
    // Reset giveaways on monthly renewal (not initial payment)
    if (invoice.subscription && invoice.billing_reason === 'subscription_cycle') {
      const { data: sub } = await db
        .from('subscriptions')
        .select('tier')
        .eq('stripe_subscription_id', invoice.subscription)
        .maybeSingle()

      if (sub) {
        const giveaways = TIER_GIVEAWAYS[sub.tier] ?? 1
        await db
          .from('subscriptions')
          .update({ status: 'active', giveaways_remaining: giveaways })
          .eq('stripe_subscription_id', invoice.subscription)
      }
    }
  }

  return NextResponse.json({ received: true })
}
