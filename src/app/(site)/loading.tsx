/*
 * Squelette neutre : il sert de repli à toutes les routes du groupe (site)
 * pendant la navigation, y compris le compte et le panier. Il dessine donc
 * une page générique — surtout pas une grille de produits, qui n'a de sens
 * que pour le catalogue (chaque page du catalogue porte son propre Suspense).
 */
export default function Loading() {
  return (
    <div className="container-lux py-12 lg:py-16" aria-busy="true" aria-live="polite">
      <span className="sr-only">Chargement…</span>
      <div className="max-w-md space-y-3">
        <div className="skeleton h-2.5 w-24" />
        <div className="skeleton h-10 w-full" />
        <div className="skeleton h-10 w-3/4" />
      </div>
      <div className="mt-10 grid gap-10 lg:grid-cols-12">
        <div className="space-y-3 lg:col-span-4">
          <div className="skeleton h-3 w-32" />
          <div className="skeleton h-3 w-40" />
          <div className="skeleton mt-8 aspect-[4/3] w-full" />
        </div>
        <div className="space-y-4 lg:col-span-8">
          <div className="skeleton h-3 w-full" />
          <div className="skeleton h-3 w-11/12" />
          <div className="skeleton h-3 w-4/5" />
          <div className="skeleton mt-6 h-40 w-full" />
        </div>
      </div>
    </div>
  );
}
