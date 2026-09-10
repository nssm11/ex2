"use client";
import { useEffect, useRef } from "react";
import { useCart } from "./cart-provider";

/**
 * Miroir serveur du panier, utilisé uniquement pour la relance de panier
 * abandonné.
 *
 * Le panier reste la propriété du navigateur (`localStorage`) : ce composant
 * ne modifie rien à ce fonctionnement, il se contente de signaler au serveur
 * les identifiants et quantités détenus, pour les clients connectés. Les
 * visiteurs anonymes ne sont jamais synchronisés, donc jamais relancés.
 *
 * Le serveur ignore tout le reste (libellés, prix, images) : il relit ces
 * valeurs depuis la base au moment de composer le courriel.
 */
export function CartSync({ enabled }: { enabled: boolean }) {
  const { lines, hydrated } = useCart();
  const last = useRef<string | null>(null);

  useEffect(() => {
    if (!enabled || !hydrated) return;

    // Empreinte du seul contenu utile : un changement de prix ou de stock ne
    // doit pas déclencher de requête, ni repousser le délai d'abandon.
    const signature = lines
      .map((l) => `${l.productId}:${l.quantity}`)
      .sort()
      .join(",");
    if (signature === last.current) return;

    const timer = setTimeout(() => {
      // Relu à l'exécution : le panier a pu changer pendant le délai.
      last.current = signature;
      void fetch("/api/cart/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lines: lines.map((l) => ({ productId: l.productId, quantity: l.quantity })) }),
        keepalive: true,
      }).catch(() => {
        // Une synchronisation manquée n'affecte pas le panier : au pire, la
        // relance partira sur un état légèrement antérieur, ou pas du tout.
      });
    }, 1200);

    return () => clearTimeout(timer);
  }, [enabled, hydrated, lines]);

  return null;
}
