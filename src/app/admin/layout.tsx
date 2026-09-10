import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/auth";
import { logoutAction } from "@/actions/auth";
import { AdminNav } from "@/components/admin/admin-nav";
import { ExternalIcon, LogoMark, LogoutIcon } from "@/components/icons";
export const metadata: Metadata = {
  title: { default: "Administration", template: "%s — Admin Cléopâtre" },
  robots: { index: false, follow: false },
};
export default async function AdminLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/connexion?next=/admin");
  if (user.role !== "admin" && user.role !== "support") redirect("/compte");
  return (
    <div className="min-h-dvh bg-admin-bg text-admin-text">
      {/* Top bar — glass, lab precise */}
      <header className="sticky top-0 z-40 border-b border-admin-border bg-admin-bg/80 backdrop-blur-[16px]">
        <div className="mx-auto flex h-[68px] max-w-[110rem] items-center justify-between gap-4 px-4 lg:px-8">
          <Link href="/admin" className="group flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-admin-gold/20 bg-admin-gold/10 text-admin-gold">
              <LogoMark size={18} />
            </span>
            <span className="flex flex-col leading-none">
              <span className="font-display text-[18px] font-[550] tracking-[-0.01em] text-admin-text">Cléopâtre</span>
              <span className="mt-0.5 text-[8px] font-semibold uppercase tracking-[0.28em] text-admin-muted">Back office · Apothecary Lab</span>
            </span>
          </Link>
          <div className="flex items-center gap-3 text-xs">
            <span className="hidden items-center gap-3 rounded-full border border-admin-border bg-admin-panel px-3 py-1.5 md:flex">
              <span className="flex h-7 w-7 items-center justify-center rounded-full border border-admin-gold/20 bg-admin-gold/10 font-display text-xs font-semibold text-admin-gold">
                {user.firstName.charAt(0)}
                {user.lastName.charAt(0)}
              </span>
              <span className="flex flex-col leading-tight">
                <span className="text-admin-text">{user.firstName} {user.lastName}</span>
                <span className="text-[10px] uppercase tracking-[0.14em] text-admin-muted">
                  {user.role === "admin" ? "Administrateur" : "Support"}
                </span>
              </span>
            </span>
            <Link
              href="/"
              className="hidden items-center gap-1.5 rounded-full border border-admin-border bg-admin-panel px-3 py-2 text-admin-muted transition-colors hover:border-admin-gold/30 hover:text-admin-gold sm:flex"
            >
              <ExternalIcon size={13} /> <span>Voir la boutique</span>
            </Link>
            <form action={logoutAction}>
              <button className="flex items-center gap-1.5 rounded-full bg-admin-text px-4 py-2 text-xs font-semibold text-admin-bg transition-colors hover:bg-white">
                <LogoutIcon size={13} /> Quitter
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[110rem] gap-6 px-4 py-6 lg:grid-cols-[248px_1fr] lg:px-8 lg:py-8">
        <aside className="lg:pr-6">
          <div className="rounded-2xl border border-admin-border bg-admin-panel p-3 lg:sticky lg:top-[84px]">
            <p className="mb-3 px-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-admin-muted">Navigation</p>
            <AdminNav role={user.role} />
          </div>
        </aside>
        <main id="contenu" className="min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}
