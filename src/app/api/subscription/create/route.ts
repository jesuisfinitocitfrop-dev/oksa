import { NextRequest, NextResponse } from 'next/server'

const TIER_CONFIG = {
  starter: { price: 5, giveaways: 1, bonusChances: 0, label: 'Starter', priceEnv: 'STRIPE_PRICE_STARTER' },
  plus: { price: 9, giveaways: 4, bonusChances: 0, label: 'Plus', priceEnv: 'STRIPE_PRICE_PLUS' },
  vip: { price: 19, giveaways: 999, bonusChances: 1000, label: 'VIP', priceEnv: 'STRIPE_PRICE_VIP' },
} as const

type Tier = keyof typeof TIER_CONFIG

// POST /api/subscription/create
// body: { email, roblox_username, tier, locale }
export async function POST(request: NextRequest) {
  const { email, roblox_username, tier, locale } = await request.json()

  if (!email || !roblox_username || !tier) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  if (!Object.keys(TIER_CONFIG).includes(tier)) {
    return NextResponse.json({ error: 'Invalid tier' }, { status: 400 })
  }

  const config = TIER_CONFIG[tier as Tier]
  const stripeKey = process.env.STRIPE_SECRET_KEY
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://citgive.com'

  if (!stripeKey) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 503 })
  }

  const loc = locale || 'fr'
  const successUrl = `${siteUrl}/${loc}/premium?subscription=success&email=${encodeURIComponent(email)}&roblox=${encodeURIComponent(roblox_username)}&tier=${tier}`
  const cancelUrl = `${siteUrl}/${loc}/premium?subscription=cancelled`

  const Stripe = (await import('stripe')).default
  const stripe = new Stripe(stripeKey)

  const priceId = process.env[config.priceEnv]

  const sessionParams: any = {
    payment_method_types: ['card'],
    mode: 'subscription',
    customer_email: email,
    metadata: {
      email,
      roblox_username,
      tier,
      giveaways_remaining: String(config.giveaways),
      bonus_chances: String(config.bonusChances),
    },
    success_url: successUrl,
    cancel_url: cancelUrl,
  }

  if (priceId) {
    sessionParams.line_items = [{ price: priceId, quantity: 1 }]
  } else {
    sessionParams.line_items = [{
      price_data: {
        currency: 'eur',
        recurring: { interval: 'month' },
        product_data: {
          name: `CITgive Premium ${config.label} — Headless Horseman`,
          description: config.bonusChances > 0
            ? `+${config.bonusChances} chances par giveaway premium`
            : `${config.giveaways} giveaway${config.giveaways > 1 ? 's' : ''} premium par mois`,
        },
        unit_amount: config.price * 100,
      },
      quantity: 1,
    }]
  }

  const session = await stripe.checkout.sessions.create(sessionParams)

  return NextResponse.json({ url: session.url })
}
