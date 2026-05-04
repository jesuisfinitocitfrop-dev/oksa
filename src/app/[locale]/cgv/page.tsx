import { setRequestLocale } from 'next-intl/server'
import Navbar from '@/components/Navbar'
import FireParticles from '@/components/FireParticles'

export default async function CGVPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

  return (
    <div className="min-h-screen relative">
      <FireParticles />
      <Navbar locale={locale} />

      <div className="relative z-10 pt-24 pb-20 px-4">
        <div className="max-w-3xl mx-auto">

          <h1 className="font-bangers text-5xl text-white mb-2">Règlement & CGV</h1>
          <p className="text-gray-500 text-sm mb-10">
            Conditions générales de vente et règlement du système de boost de chances — CITgive
          </p>

          <div className="space-y-8 text-gray-300 text-sm leading-relaxed">

            {/* Art 1 */}
            <section>
              <h2 className="font-bangers text-2xl text-gold-400 mb-3">Article 1 — Nature du service</h2>
              <div className="bg-cit-card border border-cit-border rounded-xl p-5 space-y-3">
                <p>
                  Le paiement d'un montant compris entre <strong className="text-white">1€ et 20€</strong> constitue
                  une <strong className="text-white">contribution volontaire</strong> au soutien du créateur de contenu
                  CIT (@CITlevrai). En contrepartie de cette contribution, le participant voit ses
                  probabilités statistiques augmentées dans le tirage aléatoire en cours, à raison de
                  <strong className="text-white"> +100 chances par euro versé</strong>.
                </p>
                <p className="text-red-400 font-medium">
                  ⚠️ Cette contribution ne constitue en aucun cas : un achat de billet, un contrat de vente
                  d'un bien ou service, ni la garantie d'obtenir une quelconque récompense.
                </p>
              </div>
            </section>

            {/* Art 2 */}
            <section>
              <h2 className="font-bangers text-2xl text-gold-400 mb-3">Article 2 — Absence totale de garantie</h2>
              <div className="bg-cit-card border border-cit-border rounded-xl p-5 space-y-3">
                <p>
                  <strong className="text-white">Aucune récompense n'est garantie</strong>, quelle que soit
                  la somme versée. L'augmentation des chances est purement statistique et aléatoire. Le résultat
                  du tirage est déterminé exclusivement par le hasard via un algorithme pondéré.
                </p>
                <p>
                  CIT (@CITlevrai) ne s'engage contractuellement à remettre aucun prix à un participant ayant
                  effectué un paiement, <strong className="text-white">sauf si ce participant est désigné gagnant
                  par le tirage aléatoire</strong>.
                </p>
                <p>
                  Le fait de payer, même un montant élevé, n'entraîne aucun droit acquis sur le prix mis en jeu.
                </p>
              </div>
            </section>

            {/* Art 3 */}
            <section>
              <h2 className="font-bangers text-2xl text-gold-400 mb-3">Article 3 — Gratuité de la participation</h2>
              <div className="bg-cit-card border border-cit-border rounded-xl p-5 space-y-3">
                <p>
                  Conformément à la réglementation française applicable aux jeux promotionnels,
                  <strong className="text-white"> une participation entièrement gratuite est toujours disponible</strong>.
                  Aucun achat n'est nécessaire pour s'inscrire au tirage.
                </p>
                <p>
                  Les participants sans paiement conservent une possibilité réelle et équitable de gagner.
                  Le système de boost est un avantage optionnel, non une condition d'accès au giveaway.
                </p>
              </div>
            </section>

            {/* Art 4 */}
            <section>
              <h2 className="font-bangers text-2xl text-gold-400 mb-3">Article 4 — Non-remboursement</h2>
              <div className="bg-cit-card border border-cit-border rounded-xl p-5 space-y-3">
                <p>
                  Les contributions volontaires sont <strong className="text-white">non remboursables</strong>,
                  le participant ayant bénéficié de l'augmentation de ses chances dès la validation du paiement,
                  indépendamment du résultat du tirage.
                </p>
                <p className="text-green-400">
                  Exception : en cas d'annulation totale du giveaway par l'organisateur (Article 6),
                  l'intégralité des paiements effectués sera remboursée dans un délai de 14 jours.
                </p>
              </div>
            </section>

            {/* Art 5 */}
            <section>
              <h2 className="font-bangers text-2xl text-gold-400 mb-3">Article 5 — Absence de contrat de vente</h2>
              <div className="bg-cit-card border border-cit-border rounded-xl p-5">
                <p>
                  Le paiement effectué <strong className="text-white">ne constitue pas un contrat de vente</strong> au
                  sens des articles 1582 et suivants du Code civil français. Il n'existe aucune obligation de résultat
                  dans la remise d'un prix. L'organisateur ne peut être tenu responsable de l'absence de gain
                  à l'issue du tirage, la sélection du gagnant étant aléatoire par nature.
                </p>
              </div>
            </section>

            {/* Art 6 */}
            <section>
              <h2 className="font-bangers text-2xl text-gold-400 mb-3">Article 6 — Modification et annulation</h2>
              <div className="bg-cit-card border border-cit-border rounded-xl p-5 space-y-3">
                <p>
                  CIT (@CITlevrai) se réserve le droit de <strong className="text-white">modifier, reporter
                  ou annuler</strong> le giveaway à tout moment et sans préavis, notamment en cas de force majeure,
                  de problème technique, de fraude avérée ou de toute circonstance rendant le tirage impossible
                  ou inéquitable.
                </p>
                <p>
                  En cas de modification des modalités (dates, prix mis en jeu), les participants déjà inscrits
                  en sont informés par email. En cas d'annulation totale, voir Article 4.
                </p>
              </div>
            </section>

            {/* Art 7 */}
            <section>
              <h2 className="font-bangers text-2xl text-gold-400 mb-3">Article 7 — Données personnelles et paiement</h2>
              <div className="bg-cit-card border border-cit-border rounded-xl p-5 space-y-3">
                <p>
                  Les paiements sont traités par <strong className="text-white">Stripe Inc.</strong> (prestataire
                  de services de paiement certifié PCI-DSS). CITgive ne stocke à aucun moment les informations
                  bancaires du participant (numéro de carte, CVV, etc.).
                </p>
                <p>
                  Les données collectées (email, montant) sont utilisées uniquement pour la gestion du giveaway
                  et ne sont pas revendues à des tiers. Conformément au RGPD, vous disposez d'un droit d'accès,
                  de rectification et de suppression de vos données en contactant l'organisateur.
                </p>
              </div>
            </section>

            {/* Art 8 */}
            <section>
              <h2 className="font-bangers text-2xl text-gold-400 mb-3">Article 8 — Fraude et disqualification</h2>
              <div className="bg-cit-card border border-cit-border rounded-xl p-5">
                <p>
                  Toute tentative de fraude (faux comptes multiples, contournement du système, rétrofacturation
                  abusive) entraîne la <strong className="text-white">disqualification immédiate et définitive</strong> du
                  participant, sans remboursement, et pourra faire l'objet de poursuites judiciaires.
                </p>
              </div>
            </section>

            {/* Art 9 */}
            <section>
              <h2 className="font-bangers text-2xl text-gold-400 mb-3">Article 9 — Droit applicable et litiges</h2>
              <div className="bg-cit-card border border-cit-border rounded-xl p-5 space-y-3">
                <p>
                  Le présent règlement est soumis au <strong className="text-white">droit français</strong>.
                  En cas de litige, une solution amiable sera recherchée en priorité. À défaut, le litige
                  sera soumis aux tribunaux compétents français.
                </p>
                <p>
                  Conformément à l'article L.612-1 du Code de la consommation, le consommateur peut recourir
                  gratuitement à un médiateur de la consommation.
                </p>
              </div>
            </section>

            {/* Art 10 */}
            <section>
              <h2 className="font-bangers text-2xl text-gold-400 mb-3">Article 10 — Acceptation</h2>
              <div className="bg-gold-400/10 border border-gold-400/30 rounded-xl p-5">
                <p>
                  En effectuant un paiement sur CITgive, le participant reconnaît avoir lu, compris et accepté
                  <strong className="text-white"> l'intégralité du présent règlement sans réserve</strong>,
                  et notamment le fait qu'aucune récompense n'est garantie en échange du paiement.
                </p>
              </div>
            </section>

            <div className="border-t border-cit-border pt-6 text-gray-600 text-xs space-y-1">
              <p>Organisateur : CIT (@CITlevrai) — Créateur de contenu YouTube (732 000 abonnés)</p>
              <p>Site : citgive.com — Contact : via YouTube @CITlevrai</p>
              <p>Dernière mise à jour : {new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}</p>
            </div>

          </div>
        </div>
      </div>

      <footer className="relative z-10 border-t border-cit-border py-8 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="font-bangers text-2xl">CIT<span className="text-fire-500">give</span></div>
          <a href="/" className="text-gray-500 text-sm hover:text-white transition-colors">← Retour au giveaway</a>
        </div>
      </footer>
    </div>
  )
}
