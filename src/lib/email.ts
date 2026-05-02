import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendConfirmationEmail(
  email: string,
  robloxUsername: string,
  editionTitle: string,
  drawDate: string,
  locale: string
) {
  const subjects: Record<string, string> = {
    fr: `✅ Tu es inscrit au giveaway CIT — ${editionTitle}`,
    en: `✅ You're registered for the CIT giveaway — ${editionTitle}`,
    es: `✅ Estás registrado en el sorteo CIT — ${editionTitle}`,
  }

  const bodies: Record<string, string> = {
    fr: `
      <div style="background:#0A0A0F;color:#ffffff;padding:40px;font-family:Arial,sans-serif;max-width:600px;margin:0 auto;border-radius:12px;">
        <h1 style="color:#FFD700;font-size:32px;margin-bottom:8px;">🐉 CITgive</h1>
        <h2 style="color:#ffffff;margin-bottom:24px;">Tu participes au tirage !</h2>
        <div style="background:#12121A;border:1px solid #1E1E2E;border-radius:8px;padding:24px;margin-bottom:24px;">
          <p style="color:#aaa;margin:0 0 8px;">Édition</p>
          <p style="color:#FFD700;font-size:20px;font-weight:bold;margin:0 0 16px;">${editionTitle}</p>
          <p style="color:#aaa;margin:0 0 8px;">Pseudo Roblox</p>
          <p style="color:#ffffff;font-size:18px;margin:0 0 16px;">${robloxUsername}</p>
          <p style="color:#aaa;margin:0 0 8px;">Date du tirage</p>
          <p style="color:#FF6B00;font-size:18px;font-weight:bold;margin:0;">${new Date(drawDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </div>
        <p style="color:#aaa;font-size:14px;">Bonne chance ! Le gagnant sera annoncé sur <a href="https://youtube.com/@CITlevrai" style="color:#FFD700;">la chaîne YouTube CIT</a>.</p>
        <p style="color:#555;font-size:12px;margin-top:24px;">1 seule participation par personne. Toute tentative de triche entraînera une disqualification.</p>
      </div>
    `,
    en: `
      <div style="background:#0A0A0F;color:#ffffff;padding:40px;font-family:Arial,sans-serif;max-width:600px;margin:0 auto;border-radius:12px;">
        <h1 style="color:#FFD700;font-size:32px;margin-bottom:8px;">🐉 CITgive</h1>
        <h2 style="color:#ffffff;margin-bottom:24px;">You're entered in the draw!</h2>
        <div style="background:#12121A;border:1px solid #1E1E2E;border-radius:8px;padding:24px;margin-bottom:24px;">
          <p style="color:#aaa;margin:0 0 8px;">Edition</p>
          <p style="color:#FFD700;font-size:20px;font-weight:bold;margin:0 0 16px;">${editionTitle}</p>
          <p style="color:#aaa;margin:0 0 8px;">Roblox Username</p>
          <p style="color:#ffffff;font-size:18px;margin:0 0 16px;">${robloxUsername}</p>
          <p style="color:#aaa;margin:0 0 8px;">Draw date</p>
          <p style="color:#FF6B00;font-size:18px;font-weight:bold;margin:0;">${new Date(drawDate).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </div>
        <p style="color:#aaa;font-size:14px;">Good luck! The winner will be announced on <a href="https://youtube.com/@CITlevrai" style="color:#FFD700;">CIT's YouTube channel</a>.</p>
        <p style="color:#555;font-size:12px;margin-top:24px;">1 entry per person. Any cheating attempt will result in disqualification.</p>
      </div>
    `,
    es: `
      <div style="background:#0A0A0F;color:#ffffff;padding:40px;font-family:Arial,sans-serif;max-width:600px;margin:0 auto;border-radius:12px;">
        <h1 style="color:#FFD700;font-size:32px;margin-bottom:8px;">🐉 CITgive</h1>
        <h2 style="color:#ffffff;margin-bottom:24px;">¡Estás en el sorteo!</h2>
        <div style="background:#12121A;border:1px solid #1E1E2E;border-radius:8px;padding:24px;margin-bottom:24px;">
          <p style="color:#aaa;margin:0 0 8px;">Edición</p>
          <p style="color:#FFD700;font-size:20px;font-weight:bold;margin:0 0 16px;">${editionTitle}</p>
          <p style="color:#aaa;margin:0 0 8px;">Usuario Roblox</p>
          <p style="color:#ffffff;font-size:18px;margin:0 0 16px;">${robloxUsername}</p>
          <p style="color:#aaa;margin:0 0 8px;">Fecha del sorteo</p>
          <p style="color:#FF6B00;font-size:18px;font-weight:bold;margin:0;">${new Date(drawDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </div>
        <p style="color:#aaa;font-size:14px;">¡Buena suerte! El ganador se anunciará en <a href="https://youtube.com/@CITlevrai" style="color:#FFD700;">el canal YouTube de CIT</a>.</p>
        <p style="color:#555;font-size:12px;margin-top:24px;">1 participación por persona. Cualquier intento de trampa resultará en descalificación.</p>
      </div>
    `,
  }

  const lang = locale in bodies ? locale : 'fr'

  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL!,
    to: email,
    subject: subjects[lang],
    html: bodies[lang],
  })
}

export async function sendAnnouncementEmails(
  emails: string[],
  edition: { title: string; prize_name: string; prize_image_url: string | null; draw_date: string },
) {
  const BATCH = 100
  let sent = 0

  const html = `
    <div style="background:#0A0A0F;color:#fff;padding:40px;font-family:Arial,sans-serif;max-width:600px;margin:0 auto;border-radius:12px;">
      <h1 style="color:#FFD700;font-size:32px;margin:0 0 4px;">🐉 CITgive</h1>
      <h2 style="color:#FF6B00;font-size:22px;margin:0 0 24px;">Nouveau Giveaway disponible !</h2>
      <div style="background:#12121A;border:1px solid #1E1E2E;border-radius:8px;padding:24px;margin-bottom:24px;">
        <p style="color:#aaa;margin:0 0 6px;font-size:13px;">ÉDITION</p>
        <p style="color:#FFD700;font-size:22px;font-weight:bold;margin:0 0 16px;">${edition.title}</p>
        <p style="color:#aaa;margin:0 0 6px;font-size:13px;">PRIX À GAGNER</p>
        <p style="color:#fff;font-size:20px;font-weight:bold;margin:0 0 16px;">🏆 ${edition.prize_name}</p>
        <p style="color:#aaa;margin:0 0 6px;font-size:13px;">DATE DU TIRAGE</p>
        <p style="color:#FF6B00;font-size:18px;font-weight:bold;margin:0;">
          ${new Date(edition.draw_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>
      <a href="${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://citgive.vercel.app'}"
         style="display:inline-block;background:linear-gradient(135deg,#FFD700,#FF6B00);color:#0A0A0F;font-weight:bold;font-size:18px;padding:14px 32px;border-radius:10px;text-decoration:none;margin-bottom:24px;">
        🎯 PARTICIPER MAINTENANT
      </a>
      <p style="color:#555;font-size:12px;margin-top:16px;">
        Tu reçois cet email car tu as déjà participé à un giveaway CIT.<br/>
        Inscription 100% gratuite — 1 seule participation par personne.
      </p>
    </div>
  `

  for (let i = 0; i < emails.length; i += BATCH) {
    const slice = emails.slice(i, i + BATCH)
    await resend.batch.send(
      slice.map(to => ({
        from: process.env.RESEND_FROM_EMAIL!,
        to,
        subject: `🐉 Nouveau Giveaway CIT — Gagne le ${edition.prize_name} !`,
        html,
      }))
    )
    sent += slice.length
  }

  return sent
}
