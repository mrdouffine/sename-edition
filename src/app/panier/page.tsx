"use client";

import Link from "next/link";
import Footer from "@/components/Footer";
import UserMenu from "@/components/UserMenu";
import CartNavButton from "@/components/CartNavButton";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  clearCartItems,
  getCartCount,
  getCartItems,
  getCartSubtotal,
  removeCartItem,
  updateCartItemQuantity,
  type CartItem
} from "@/lib/cart/client";
import { fetchWithAuth } from "@/lib/api/client";
import { clearAuthToken, getSessionFromToken } from "@/lib/auth/client";
import { useRequireAuth } from "@/lib/auth/useRequireAuth";

export default function PanierPage() {
  const isAuthorized = useRequireAuth();
  const router = useRouter();
  const [items, setItems] = useState<CartItem[]>(() => getCartItems());
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [promo, setPromo] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoCode, setPromoCode] = useState<string | null>(null);
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutMessage, setCheckoutMessage] = useState<string | null>(null);
  const [paymentProvider, setPaymentProvider] = useState<"fedapay" | "paypal">("fedapay");
  const [lastSavedCartSignature, setLastSavedCartSignature] = useState<string | null>(null);

  const subtotal = useMemo(() => getCartSubtotal(items), [items]);
  const discount = promoApplied ? promoDiscount : 0;
  const total = Math.max(0, subtotal - discount);

  function isValidEmail(emailToCheck: string) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailToCheck.trim().length > 0 && emailRegex.test(emailToCheck.trim());
  }

  function updateQuantity(bookId: string, delta: number, current: number) {
    const nextQuantity = Math.max(1, current + delta);
    const next = updateCartItemQuantity(bookId, nextQuantity);
    setItems(next);
  }

  function onRemove(bookId: string) {
    const next = removeCartItem(bookId);
    setItems(next);
  }

  function onClear() {
    clearCartItems();
    setItems([]);
  }

  async function onApplyPromo() {
    if (!promo.trim()) {
      setPromoApplied(false);
      setPromoCode(null);
      setPromoDiscount(0);
      return;
    }

    const response = await fetch("/api/promo/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: promo, subtotal })
    });
    const payload = (await response.json()) as {
      data?: { code: string; discount: number };
      error?: string;
    };

    if (!response.ok || !payload.data) {
      setPromoApplied(false);
      setPromoCode(null);
      setPromoDiscount(0);
      setCheckoutMessage(payload.error ?? "Code promo invalide");
      return;
    }

    setPromoApplied(true);
    setPromoCode(payload.data.code);
    setPromoDiscount(payload.data.discount);
    setCheckoutMessage(`Code ${payload.data.code} appliqué`);
  }

  async function checkout() {
    setCheckoutLoading(true);
    setCheckoutMessage(null);
    setEmailError(null);

    try {
      // Validate email
      const trimmedEmail = email.trim();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!trimmedEmail || !emailRegex.test(trimmedEmail)) {
        setEmailError("Veuillez entrer une adresse email valide.");
        setCheckoutLoading(false);
        return;
      }

      const session = getSessionFromToken();
      if (!session) {
        router.push("/connexion?next=%2Fpanier&from=cart");
        return;
      }

      const crowdfundingItems = items.filter((item) => item.saleType === "crowdfunding");
      if (crowdfundingItems.length > 0) {
        const reason = encodeURIComponent("Les projets crowdfunding passent par contribution.");
        router.push(`/commande/echec?reason=${reason}`);
        return;
      }

      const directItems = items.filter((item) => item.saleType === "direct");
      const preorderItems = items.filter((item) => item.saleType === "preorder");
      const orderGroups = [
        { saleType: "direct" as const, items: directItems },
        { saleType: "preorder" as const, items: preorderItems }
      ].filter((group) => group.items.length > 0);

      if (orderGroups.length === 0) {
        const reason = encodeURIComponent("Votre panier est vide.");
        router.push(`/commande/echec?reason=${reason}`);
        return;
      }

      if (orderGroups.length > 1) {
        const reason = encodeURIComponent(
          "Merci de passer des commandes séparées pour achat direct et précommande."
        );
        router.push(`/commande/echec?reason=${reason}`);
        return;
      }

      const group = orderGroups[0];
      const createOrderResponse = await fetchWithAuth("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          saleType: group.saleType,
          paymentProvider,
          email: trimmedEmail,
          promoCode: promoCode ?? undefined,
          items: group.items.map((item) => ({
            bookId: item.bookId,
            quantity: item.quantity
          }))
        })
      });

      const createOrderPayload = (await createOrderResponse.json()) as {
        data?: { _id?: string };
        error?: string;
      };
      if (!createOrderResponse.ok || !createOrderPayload.data?._id) {
        if (createOrderResponse.status === 401) {
          clearAuthToken();
          router.push("/connexion?next=%2Fpanier&from=cart");
          return;
        }
        const reason = encodeURIComponent(createOrderPayload.error ?? "Échec de création de commande.");
        router.push(`/commande/echec?reason=${reason}`);
        return;
      }

      const orderId = createOrderPayload.data._id;
      if (paymentProvider === "fedapay") {
        router.push(`/commande/paiement/fedapay?orderId=${orderId}`);
        return;
      }

      const paypalResponse = await fetchWithAuth("/api/payments/paypal/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId })
      });
      const paypalPayload = (await paypalResponse.json()) as {
        data?: { approvalUrl?: string };
        error?: string;
      };
      if (!paypalResponse.ok || !paypalPayload.data?.approvalUrl) {
        const reason = encodeURIComponent(paypalPayload.error ?? "Échec initialisation PayPal.");
        router.push(`/commande/echec?reason=${reason}&orderId=${encodeURIComponent(orderId)}`);
        return;
      }

      window.location.href = paypalPayload.data.approvalUrl;
    } catch {
      const reason = encodeURIComponent("Erreur réseau pendant la commande.");
      router.push(`/commande/echec?reason=${reason}`);
    } finally {
      setCheckoutLoading(false);
    }
  }

  // Initialize email from session
  useEffect(() => {
    const session = getSessionFromToken();
    if (session?.email) {
      setEmail(session.email);
    }
  }, []);

  useEffect(() => {
    if (items.length === 0 || checkoutLoading) {
      return;
    }

    const signature = JSON.stringify(
      items.map((item) => ({
        bookId: item.bookId,
        quantity: item.quantity
      }))
    );
    if (signature === lastSavedCartSignature) {
      return;
    }

    const timeout = window.setTimeout(() => {
      void fetchWithAuth("/api/abandoned-cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subtotal,
          items: items.map((item) => ({
            bookId: item.bookId,
            slug: item.slug,
            title: item.title,
            quantity: item.quantity,
            unitPrice: item.price,
            saleType: item.saleType
          }))
        })
      });
      setLastSavedCartSignature(signature);
    }, 45000);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [checkoutLoading, items, lastSavedCartSignature, subtotal]);

  if (!isAuthorized) {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col bg-background-light text-[#181810]">
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between border-b border-solid border-[#e5e4e0] bg-white px-3 py-3 sm:px-6 sm:py-4 md:px-10 lg:px-20">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="flex size-8 items-center justify-center rounded-full bg-black text-primary">
            <span className="material-symbols-outlined text-xl">menu_book</span>
          </div>
          <h2 className="max-w-[38vw] truncate text-sm font-extrabold uppercase leading-tight tracking-tight text-[#181810] sm:max-w-none sm:text-lg">
            SENAME EDITION’S
          </h2>
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          <UserMenu showAuthLinks />
          <CartNavButton />
        </div>
      </header>

      <main className="flex-1 px-4 pb-10 pt-24 sm:px-6 sm:pb-12 sm:pt-28 md:px-12">
        <div className="mx-auto max-w-6xl">
        <div className="mb-6 text-xs text-[#8d895e] sm:mb-8 sm:text-sm">
          <Link href="/" className="hover:text-[#181810]">
            Accueil
          </Link>
          <span className="px-2">›</span>
          <span className="font-bold text-[#181810]">Panier</span>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[2fr_1fr]">
          <section>
            <div className="mb-4 flex items-center justify-between">
              <h1 className="text-[clamp(2rem,3.2vw,3.2rem)] font-light tracking-tight">Votre panier</h1>
              <p className="text-[clamp(0.95rem,1.4vw,1.25rem)] text-[#8d895e]">{getCartCount(items)} articles</p>
            </div>

            <div className="overflow-hidden rounded-xl border border-[#e3e0d0] bg-white">
              <div className="hidden grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 border-b border-[#ece9dc] px-6 py-4 text-sm font-semibold uppercase tracking-wider text-[#a8a382] md:grid">
                <p>Produit</p>
                <p>Prix</p>
                <p>Quantité</p>
                <p>Sous-total</p>
                <p></p>
              </div>

              {items.length === 0 ? (
                <div className="px-6 py-12 text-center">
                  <p className="text-lg text-[#6b6959]">Votre panier est vide.</p>
                  <Link
                    href="/"
                    className="mt-4 inline-block rounded-lg bg-primary px-5 py-3 text-sm font-bold uppercase"
                  >
                    Découvrir les ouvrages
                  </Link>
                </div>
              ) : (
                items.map((item) => (
                  <div
                    key={item.bookId}
                    className="grid grid-cols-1 gap-4 border-b border-[#ece9dc] px-6 py-5 md:grid-cols-[2fr_1fr_1fr_1fr_auto] md:items-center"
                  >
                  <div className="flex items-start gap-4">
                    <img
                      src={item.coverImage}
                      alt={`Couverture ${item.title}`}
                      className="h-20 w-14 rounded object-cover sm:h-24 sm:w-16"
                    />
                    <div>
                      <h3 className="text-xl font-bold leading-tight sm:text-2xl">{item.title}</h3>
                      {item.authorName ? (
                          <p className="text-base text-[#8d895e] sm:text-xl">{item.authorName}</p>
                        ) : null}
                      <span className="mt-2 inline-block rounded bg-[#ece9dc] px-2 py-1 text-xs font-semibold uppercase text-[#8d895e]">
                          {item.saleType === "direct"
                            ? "Achat direct"
                            : item.saleType === "preorder"
                              ? "Précommande"
                              : "Crowdfunding"}
                        </span>
                      </div>
                    </div>

                    <p className="text-lg font-semibold sm:text-2xl md:text-3xl">{item.price.toFixed(2)} €</p>

                    <div className="inline-flex w-fit items-center gap-4 rounded-lg border border-[#ddd8c4] px-3 py-2 text-base sm:text-xl">
                    <button
                    onClick={() => updateQuantity(item.bookId, -1, item.quantity)}
                    className="font-bold"
                    >
                    -
                    </button>
                    <span className="min-w-6 text-center font-semibold">{item.quantity}</span>
                    <button
                    onClick={() => updateQuantity(item.bookId, 1, item.quantity)}
                    className="font-bold"
                    >
                    +
                    </button>
                    </div>

                    <p className="text-lg font-semibold sm:text-2xl md:text-3xl">
                      {(item.price * item.quantity).toFixed(2)} €
                    </p>
+

                    <button
                      onClick={() => onRemove(item.bookId)}
                      className="text-[#a8a382] transition hover:text-[#181810]"
                      aria-label="Supprimer"
                    >
                      <span className="material-symbols-outlined">delete</span>
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-base text-[#8d895e] sm:text-xl">
              <Link href="/" className="inline-flex items-center gap-2 font-semibold hover:text-[#181810]">
                <span className="material-symbols-outlined text-base">arrow_back</span>
                Continuer les achats
              </Link>
              <button onClick={onClear} className="font-semibold hover:text-[#181810]">
                Vider le panier
              </button>
            </div>
          </section>

          <aside className="rounded-xl border border-[#e3e0d0] bg-white p-5 sm:p-6">
            <h2 className="mb-6 text-[clamp(1.6rem,2.6vw,2.4rem)] font-bold">Résumé de commande</h2>

            <label className="mb-2 block text-sm font-bold uppercase tracking-wider text-[#8d895e]">
              Votre email
            </label>
            <div className="mb-5">
              <input
                type="email"
                className="w-full rounded-lg border border-[#ddd8c4] bg-[#f8f8f5] px-3 py-2"
                placeholder="votre@email.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
              {emailError ? (
                <p className="mt-2 text-xs text-red-600">{emailError}</p>
              ) : null}
            </div>

            <label className="mb-2 block text-sm font-bold uppercase tracking-wider text-[#8d895e]">
              Code promo
            </label>
            <div className="mb-5 flex gap-2">
              <input
                className="w-full rounded-lg border border-[#ddd8c4] bg-[#f8f8f5] px-3 py-2"
                placeholder="Entrez le code"
                value={promo}
                onChange={(event) => setPromo(event.target.value)}
              />
              <button
                onClick={onApplyPromo}
                className="rounded-lg bg-black px-4 py-2 font-bold text-white"
              >
                Appliquer
              </button>
            </div>

            <div className="mb-5 border-t border-dashed border-[#e3e0d0]"></div>

            <div className="mb-6 space-y-3 text-[clamp(1rem,1.6vw,1.25rem)]">
              <div className="flex justify-between">
                <span className="text-[#8d895e]">Montant ouvrages</span>
                <span className="font-semibold">{subtotal.toFixed(2)} €</span>
              </div>
              {promoApplied ? (
                <div className="flex justify-between text-green-700">
                  <span>Réduction promo</span>
                  <span>-{discount.toFixed(2)} €</span>
                </div>
              ) : null}
            </div>

            <div className="mb-6 flex items-center justify-between text-[clamp(1.4rem,2.6vw,2.4rem)]">
              <span className="font-bold">Total</span>
              <span className="font-bold">{total.toFixed(2)} €</span>
            </div>

            <button
              className="mb-4 flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 text-base font-bold disabled:opacity-60 sm:py-4 sm:text-lg md:text-xl"
              disabled={items.length === 0 || checkoutLoading || !isValidEmail(email)}
              onClick={() => void checkout()}
            >
              Procéder au paiement
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>

            {checkoutMessage ? <p className="mb-4 text-sm text-[#6b6959]">{checkoutMessage}</p> : null}
            <div className="mb-4 rounded-lg border border-[#ece9dc] bg-[#f8f8f5] p-3">
              <p className="mb-2 text-xs font-bold uppercase tracking-wider text-[#8d895e]">Mode de paiement</p>
              <div className="flex flex-wrap gap-3 text-sm">
                <label className="inline-flex items-center gap-2">
                  <input
                    type="radio"
                    name="paymentProvider"
                    checked={paymentProvider === "fedapay"}
                    onChange={() => setPaymentProvider("fedapay")}
                  />
                  Paiement par Carte
                </label>
                <label className="inline-flex items-center gap-2">
                  <input
                    type="radio"
                    name="paymentProvider"
                    checked={paymentProvider === "paypal"}
                    onChange={() => setPaymentProvider("paypal")}
                  />
                  PayPal
                </label>
              </div>
            </div>
            <p className="text-sm text-[#8d895e]">Paiement sécurisé SSL</p>
            <p className="mt-1 text-sm text-[#8d895e]">Livraison offerte dès 50 €</p>
          </aside>
        </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
