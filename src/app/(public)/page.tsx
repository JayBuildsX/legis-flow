import Link from 'next/link';
import { Button } from '@/components/ui/button';

export const dynamic = 'force-dynamic';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="rounded-md bg-primary-500 p-1 text-white">LF</div>
            <span className="text-lg font-semibold text-slate-800">LEGIS-FLOW</span>
          </div>
          <nav className="hidden space-x-8 md:flex">
            <a href="#features" className="text-sm font-medium text-slate-600 hover:text-primary-600">
              Fonctionnalités
            </a>
            <a href="#about" className="text-sm font-medium text-slate-600 hover:text-primary-600">
              À propos
            </a>
            <a href="#contact" className="text-sm font-medium text-slate-600 hover:text-primary-600">
              Contact
            </a>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-sm font-medium text-slate-600 hover:text-primary-600">
              Se connecter
            </Link>
            <Button size="sm">Demander une démo</Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-b from-slate-50 to-white py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-12 lg:gap-8">
            <div className="lg:col-span-6">
              <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl md:text-6xl">
                Gestion moderne des{' '}
                <span className="text-primary-600">textes normatifs</span>
              </h1>
              <p className="mt-6 text-lg text-slate-600">
                LEGIS-FLOW est une solution intégrée pour la rédaction, la validation et la publication
                des textes législatifs et réglementaires. Simplifiez vos processus et améliorez la
                collaboration entre les acteurs.
              </p>
              <div className="mt-8 flex gap-4">
                <Button size="lg">Commencer maintenant</Button>
                <Button size="lg" variant="outline">
                  En savoir plus
                </Button>
              </div>
            </div>
            <div className="mt-12 lg:col-span-6 lg:mt-0">
              <div className="aspect-[4/3] overflow-hidden rounded-xl bg-slate-100 shadow-lg">
                <div className="h-full w-full bg-gradient-to-br from-primary-500/20 to-secondary-500/20 p-8">
                  <div className="h-full rounded-lg bg-white/80 p-6 backdrop-blur-sm">
                    <div className="flex h-8 items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-accent-red"></div>
                      <div className="h-3 w-3 rounded-full bg-accent-orange"></div>
                      <div className="h-3 w-3 rounded-full bg-secondary-500"></div>
                      <div className="ml-4 h-5 w-40 rounded bg-slate-200"></div>
                    </div>
                    <div className="mt-6 space-y-4">
                      <div className="h-4 w-3/4 rounded bg-slate-200"></div>
                      <div className="h-4 w-full rounded bg-slate-200"></div>
                      <div className="h-4 w-5/6 rounded bg-slate-200"></div>
                      <div className="h-4 w-full rounded bg-slate-200"></div>
                      <div className="h-4 w-2/3 rounded bg-slate-200"></div>
                    </div>
                    <div className="mt-8 flex gap-4">
                      <div className="h-8 w-24 rounded bg-primary-200"></div>
                      <div className="h-8 w-24 rounded bg-slate-200"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="bg-white py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Fonctionnalités principales
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600">
              Une suite complète d&apos;outils pour gérer l&apos;ensemble du cycle de vie des textes normatifs.
            </p>
          </div>

          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {/* Feature 1 */}
            <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
              <div className="rounded-md bg-primary-100 p-2 text-primary-600 w-fit">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-medium text-slate-900">Édition collaborative</h3>
              <p className="mt-2 text-slate-600">
                Travaillez simultanément sur les documents avec suivi des modifications et commentaires.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
              <div className="rounded-md bg-primary-100 p-2 text-primary-600 w-fit">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="3" y1="9" x2="21" y2="9"></line>
                  <line x1="9" y1="21" x2="9" y2="9"></line>
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-medium text-slate-900">Workflows configurables</h3>
              <p className="mt-2 text-slate-600">
                Définissez des circuits de validation adaptés à vos processus internes.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
              <div className="rounded-md bg-primary-100 p-2 text-primary-600 w-fit">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-medium text-slate-900">Signature électronique</h3>
              <p className="mt-2 text-slate-600">
                Signez et validez les documents avec une valeur juridique probante.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
              <div className="rounded-md bg-primary-100 p-2 text-primary-600 w-fit">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-medium text-slate-900">Recherche avancée</h3>
              <p className="mt-2 text-slate-600">
                Retrouvez rapidement vos documents gr&apos;ce à la recherche plein texte et aux filtres.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
              <div className="rounded-md bg-primary-100 p-2 text-primary-600 w-fit">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-medium text-slate-900">Statistiques et rapports</h3>
              <p className="mt-2 text-slate-600">
                Suivez l'activité et identifiez les goulots d'étranglement dans vos processus.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
              <div className="rounded-md bg-primary-100 p-2 text-primary-600 w-fit">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"></path>
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-medium text-slate-900">API et intégrations</h3>
              <p className="mt-2 text-slate-600">
                Connectez LEGIS-FLOW à vos systèmes existants grâce aux API REST.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary-600 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="lg:flex lg:items-center lg:justify-between">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Prêt à moderniser votre processus législatif?
              <br />
              <span className="text-primary-200">Commencez dès aujourd&apos;hui.</span>
            </h2>
            <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
              <div className="inline-flex rounded-md shadow">
                <Button
                  size="lg"
                  className="bg-white text-primary-600 hover:bg-slate-100"
                >
                  Demander une démo
                </Button>
              </div>
              <div className="ml-3 inline-flex rounded-md shadow">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-primary-700"
                >
                  En savoir plus
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="md:flex md:items-center md:justify-between">
            <div className="flex items-center gap-2">
              <div className="rounded-md bg-primary-500 p-1 text-white">LF</div>
              <span className="text-lg font-semibold text-white">LEGIS-FLOW</span>
            </div>
            <div className="mt-8 flex space-x-6 md:mt-0">
              <a href="#" className="text-slate-400 hover:text-slate-300">
                <span className="sr-only">LinkedIn</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>
              <a href="#" className="text-slate-400 hover:text-slate-300">
                <span className="sr-only">Twitter</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
              <a href="#" className="text-slate-400 hover:text-slate-300">
                <span className="sr-only">GitHub</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
          </div>
          <div className="mt-8 border-t border-slate-800 pt-8 md:flex md:items-center md:justify-between">
            <div className="flex space-x-6 md:order-2">
              <a href="#" className="text-sm text-slate-400 hover:text-slate-300">
                Mentions légales
              </a>
              <a href="#" className="text-sm text-slate-400 hover:text-slate-300">
                Politique de confidentialité
              </a>
              <a href="#" className="text-sm text-slate-400 hover:text-slate-300">
                Conditions d'utilisation
              </a>
            </div>
            <p className="mt-8 text-sm text-slate-400 md:mt-0 md:order-1">
              &copy; 2024 LEGIS-FLOW. Tous droits réservés.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
} 