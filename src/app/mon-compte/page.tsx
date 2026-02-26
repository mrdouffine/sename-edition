"use client";

import Link from "next/link";
import { Suspense, useEffect, useMemo, useState } from "react";
import { clearAuthToken } from "@/lib/auth/client";
import { fetchWithAuth } from "@/lib/api/client";
import { useSearchParams } from "next/navigation";
import { useRequireAuth } from "@/lib/auth/useRequireAuth";

type MeResponse = {
  data?: {
    user: UserProfile;
  };
  error?: string;
};

type UserProfile = {
  id: string;
  name: string;
  email: string;
  role: "client" | "admin";
};

type OrderItem = {
  quantity: number;
  unitPrice: number;
  book: { id: string; title?: string; slug?: string; coverImage?: string } | null;
};

type MyOrder = {
  id: string;
  total: number;
  status: "pending" | "paid" | "cancelled" | "refunded";
  saleType: "direct" | "preorder";
  paymentMethod: "stripe" | "paypal" | "mobile_money";
  invoiceNumber: string;
  createdAt?: string | null;
  items: OrderItem[];
};

type OrdersResponse = {
  data?: MyOrder[];
  error?: string;
};

type ProfileResponse = {
  data?: UserProfile;
  error?: string;
};

type MyContribution = {
  id: string;
  amount: number;
  reward: string;
  status: "pending" | "paid" | "refunded";
  book: {
    id: string;
    title?: string;
    slug?: string;
    coverImage?: string;
  } | null;
};

type ContributionsResponse = {
  data?: MyContribution[];
  error?: string;
};

type WishlistBook = {
  id: string;
  title?: string;
  slug?: string;
  coverImage?: string;
  price?: number;
  saleType?: string;
  authorName?: string;
};

type WishlistResponse = {
  data?: WishlistBook[];
  error?: string;
};

type MyTransaction = {
  id: string;
  orderId: string | null;
  provider: "stripe" | "paypal";
  kind: "payment" | "refund" | "webhook";
  providerReference: string | null;
  status: "pending" | "succeeded" | "failed";
  amount: number | null;
  currency: string | null;
  createdAt?: string | null;
};

type TransactionsResponse = {
  data?: MyTransaction[];
  error?: string;
};

type Section =
  | "dashboard"
  | "orders"
  | "transactions"
  | "contributions"
  | "wishlist"
  | "profile";

const SECTION_KEYS: Section[] = ["dashboard", "orders", "transactions", "contributions", "wishlist", "profile"];

const contributionStatusLabel: Record<MyContribution["status"], string> = {
  pending: "En attente",
  paid: "Payée",
  refunded: "Remboursée"
};

function AccountPageContent() {
  const searchParams = useSearchParams();
  const requestedSection = searchParams.get("section");
  const [activeSection, setActiveSection] = useState<Section>(() =>
    requestedSection && SECTION_KEYS.includes(requestedSection as Section)
      ? (requestedSection as Section)
      : "dashboard"
  );
  // All hooks must be called at the top level, before any conditional returns
  const isAuthorized = useRequireAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [orders, setOrders] = useState<MyOrder[]>([]);
  const [transactions, setTransactions] = useState<MyTransaction[]>([]);
  const [contributions, setContributions] = useState<MyContribution[]>([]);
  // Add all other useState, useMemo, useEffect hooks here
  // Example:
  // ...existing code...
  const [contributionTab, setContributionTab] = useState("all");
  const [contributionStatusFilter, setContributionStatusFilter] = useState("all");
  const [contributionSort, setContributionSort] = useState("recent");
  const [ordersQuery, setOrdersQuery] = useState("");
  const [ordersStatusFilter, setOrdersStatusFilter] = useState("all");
  const [ordersRange, setOrdersRange] = useState("30d");
  const [ordersPage, setOrdersPage] = useState(1);
  const [notice, setNotice] = useState("");
  const [contributionsError, setContributionsError] = useState("");
  const [transactionsError, setTransactionsError] = useState("");
  const [transactionsQuery, setTransactionsQuery] = useState("");
  const [transactionsProviderFilter, setTransactionsProviderFilter] = useState<"all" | "stripe" | "paypal">("all");
  const [transactionsStatusFilter, setTransactionsStatusFilter] = useState<"all" | "pending" | "succeeded" | "failed">("all");
  const [wishlist, setWishlist] = useState<any[]>([]);
  const [wishlistError, setWishlistError] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [invoiceDialogMessage, setInvoiceDialogMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [passwordCurrent, setPasswordCurrent] = useState("");
  const [passwordNext, setPasswordNext] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [passwordNotice, setPasswordNotice] = useState<string | null>(null);
  // ...existing code...
  useEffect(() => {
    if (!requestedSection) {
      return;
    }
    if (SECTION_KEYS.includes(requestedSection as Section)) {
      setActiveSection(requestedSection as Section);
    }
  }, [requestedSection]);

  useEffect(() => {
    if (!isAuthorized) return;
    async function loadMe() {
      setIsLoading(true);
      setError(null);

      try {
        const [meResponse, ordersResponse, transactionsResponse, contributionsResponse, wishlistResponse] = await Promise.all([
          fetchWithAuth("/api/auth/me"),
          fetchWithAuth("/api/me/orders"),
          fetchWithAuth("/api/me/transactions"),
          fetchWithAuth("/api/me/contributions"),
          fetchWithAuth("/api/me/wishlist")
        ]);
        const mePayload = (await meResponse.json()) as MeResponse;
        const ordersPayload = (await ordersResponse.json()) as OrdersResponse;
        const transactionsPayload = (await transactionsResponse.json()) as TransactionsResponse;
        const contributionsPayload = (await contributionsResponse.json()) as ContributionsResponse;
        const wishlistPayload = (await wishlistResponse.json()) as WishlistResponse;

        if (!meResponse.ok || !mePayload.data?.user) {
          if (meResponse.status === 401) {
            clearAuthToken();
          }
          setError(mePayload.error ?? "Impossible de charger le profil");
          return;
        }

        setUser(mePayload.data.user);
        setName(mePayload.data.user.name);
        setOrders(ordersResponse.ok ? ordersPayload.data ?? [] : []);
        setTransactions(transactionsResponse.ok ? transactionsPayload.data ?? [] : []);
        setContributions(contributionsResponse.ok ? contributionsPayload.data ?? [] : []);
        setWishlist(wishlistResponse.ok ? wishlistPayload.data ?? [] : []);
        if (!ordersResponse.ok && ordersPayload.error) setNotice(ordersPayload.error);
        if (!transactionsResponse.ok && transactionsPayload.error) setTransactionsError(transactionsPayload.error);
        if (!contributionsResponse.ok && contributionsPayload.error)
          setContributionsError(contributionsPayload.error);
        if (!wishlistResponse.ok && wishlistPayload.error) setWishlistError(wishlistPayload.error);
      } catch {
        setError("Erreur réseau");
      } finally {
        setIsLoading(false);
      }
    }

    void loadMe();
  }, [isAuthorized]);

  const stats = useMemo(() => {
    const totalReservations = orders.length;
    const upcoming = orders.filter((order) => order.status === "pending").length;
    const totalSpent = orders
      .filter((order) => order.status === "paid")
      .reduce((sum, order) => sum + order.total, 0);
    return { totalReservations, upcoming, totalSpent };
  }, [orders]);

  function getObjectIdTime(id?: string) {
    if (!id || id.length < 8) return 0;
    const hex = id.slice(0, 8);
    const seconds = Number.parseInt(hex, 16);
    return Number.isNaN(seconds) ? 0 : seconds;
  }

  const filteredContributions = useMemo(() => {
    const tabFiltered =
      contributionTab === "all"
        ? contributions
        : contributions.filter((item) => item.status === contributionTab);

    const statusFiltered =
      contributionStatusFilter === "all"
        ? tabFiltered
        : tabFiltered.filter((item) => item.status === contributionStatusFilter);

    const sorted = [...statusFiltered].sort((a, b) => {
      if (contributionSort === "amount_desc") return b.amount - a.amount;
      if (contributionSort === "amount_asc") return a.amount - b.amount;
      return getObjectIdTime(b.id) - getObjectIdTime(a.id);
    });

    return sorted;
  }, [contributions, contributionTab, contributionStatusFilter, contributionSort]);

  const filteredTransactions = useMemo(() => {
    const query = transactionsQuery.trim().toLowerCase();
    const byQuery = query
      ? transactions.filter((tx) =>
        `${tx.id} ${tx.orderId ?? ""} ${tx.provider} ${tx.kind} ${tx.providerReference ?? ""} ${tx.status}`
          .toLowerCase()
          .includes(query)
      )
      : transactions;

    const byProvider =
      transactionsProviderFilter === "all"
        ? byQuery
        : byQuery.filter((tx) => tx.provider === transactionsProviderFilter);

    const byStatus =
      transactionsStatusFilter === "all"
        ? byProvider
        : byProvider.filter((tx) => tx.status === transactionsStatusFilter);

    return byStatus;
  }, [transactions, transactionsProviderFilter, transactionsQuery, transactionsStatusFilter]);

  const filteredOrders = useMemo(() => {
    const query = ordersQuery.trim().toLowerCase();
    const filteredByQuery = query
      ? orders.filter((order) => {
        const titles = order.items
          ?.map((item) => item.book?.title ?? "")
          .join(" ")
          .toLowerCase();
        return (
          order.id.toLowerCase().includes(query) ||
          order.invoiceNumber?.toLowerCase().includes(query) ||
          titles.includes(query)
        );
      })
      : orders;

    const filteredByStatus =
      ordersStatusFilter === "all"
        ? filteredByQuery
        : filteredByQuery.filter((order) => order.status === ordersStatusFilter);

    const now = new Date();
    const filteredByRange = filteredByStatus.filter((order) => {
      if (ordersRange === "all") return true;
      if (!order.createdAt) return false;
      const created = new Date(order.createdAt);
      if (ordersRange === "2023") return created.getFullYear() === 2023;
      if (ordersRange === "6m") {
        const cutoff = new Date(now);
        cutoff.setMonth(now.getMonth() - 6);
        return created >= cutoff;
      }
      const cutoff = new Date(now);
      cutoff.setDate(now.getDate() - 30);
      return created >= cutoff;
    });

    return filteredByRange;
  }, [orders, ordersQuery, ordersStatusFilter, ordersRange]);

  useEffect(() => {
    setOrdersPage(1);
  }, [ordersQuery, ordersStatusFilter, ordersRange]);

  const ORDERS_PAGE_SIZE = 4;
  const pagedOrders = useMemo(() => {
    const start = (ordersPage - 1) * ORDERS_PAGE_SIZE;
    return filteredOrders.slice(start, start + ORDERS_PAGE_SIZE);
  }, [filteredOrders, ordersPage]);

  const totalOrderPages = Math.max(1, Math.ceil(filteredOrders.length / ORDERS_PAGE_SIZE));

  useEffect(() => {
    if (ordersPage > totalOrderPages) {
      setOrdersPage(totalOrderPages);
    }
  }, [ordersPage, totalOrderPages]);

  function formatOrderDate(order: MyOrder) {
    if (!order.createdAt) return "-";
    const date = new Date(order.createdAt);
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  }

  function exportOrdersCsv() {
    const rows = filteredOrders.map((order) => ({
      id: order.id,
      date: order.createdAt ? new Date(order.createdAt).toISOString() : "",
      amount: order.total.toFixed(2),
      status: order.status,
      invoice: order.invoiceNumber,
      items: order.items?.map((item) => item.book?.title ?? "").join(", ")
    }));
    const header = ["ID", "DATE", "MONTANT", "STATUT", "FACTURE", "ARTICLES"];
    const csv = [
      header.join(","),
      ...rows.map((row) =>
        [
          row.id,
          row.date,
          row.amount,
          row.status,
          row.invoice,
          `"${row.items.replace(/\"/g, '""')}"`
        ].join(",")
      )
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "mes-commandes.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  function canAccessInvoice(status: MyOrder["status"]) {
    return status === "paid" || status === "refunded";
  }

  function handleInvoiceView(order: MyOrder) {
    if (!canAccessInvoice(order.status)) {
      setInvoiceDialogMessage("La facture est générée uniquement après un paiement effectué avec succès.");
      return;
    }
    window.open(`/factures/${order.id}`, "_blank", "noopener,noreferrer");
  }

  function handleInvoiceDownload(order: MyOrder) {
    if (!canAccessInvoice(order.status)) {
      setInvoiceDialogMessage("La facture est générée uniquement après un paiement effectué avec succès.");
      return;
    }
    window.open(`/api/orders/${order.id}/invoice?disposition=attachment`, "_blank", "noopener,noreferrer");
  }

  async function saveProfile() {
    setIsSaving(true);
    setMessage(null);

    try {
      const response = await fetchWithAuth("/api/me/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name })
      });
      const payload = (await response.json()) as ProfileResponse;

      if (!response.ok || !payload.data) {
        setMessage(payload.error ?? "Mise à jour impossible");
        return;
      }

      setUser(payload.data);
      setMessage("Profil mis à jour");
    } catch {
      setMessage("Erreur réseau");
    } finally {
      setIsSaving(false);
    }
  }

  async function changePassword() {
    setPasswordNotice(null);
    if (!passwordCurrent || !passwordNext || !passwordConfirm) {
      setPasswordNotice("Tous les champs sont obligatoires.");
      return;
    }

    try {
      const response = await fetchWithAuth("/api/me/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwordCurrent,
          nextPassword: passwordNext,
          confirmPassword: passwordConfirm
        })
      });
      const payload = (await response.json()) as { data?: { success: boolean }; error?: string };
      if (!response.ok) {
        setPasswordNotice(payload.error ?? "Impossible de mettre à jour le mot de passe");
        return;
      }
      setPasswordCurrent("");
      setPasswordNext("");
      setPasswordConfirm("");
      setPasswordNotice("Mot de passe mis à jour.");
    } catch {
      setPasswordNotice("Erreur réseau");
    }
  }

  async function removeWishlistBook(bookId: string) {
    const response = await fetchWithAuth("/api/me/wishlist", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookId })
    });

    const payload = (await response.json()) as WishlistResponse;
    if (!response.ok) {
      setWishlistError(payload.error ?? "Suppression impossible");
      return;
    }

    setWishlist(payload.data ?? []);
  }

  async function addWishlistItemToCart(book: WishlistBook) {
    if (!book.id) return;
    try {
      const response = await fetchWithAuth("/api/me/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookId: book.id, quantity: 1 })
      });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        setMessage(payload.error ?? "Impossible d'ajouter au panier.");
        return;
      }
      setMessage("Ajouté au panier.");
    } catch {
      setMessage("Impossible d'ajouter au panier.");
    }
  }

  async function addAllWishlistToCart() {
    try {
      const response = await fetchWithAuth("/api/me/cart/wishlist", { method: "POST" });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        setMessage(payload.error ?? "Impossible d'ajouter tous les articles.");
        return;
      }
      setMessage("Tous les articles ont été ajoutés au panier.");
      window.location.href = "/panier";
    } catch {
      setMessage("Impossible d'ajouter tous les articles.");
    }
  }

  async function shareWishlist() {
    try {
      const response = await fetchWithAuth("/api/me/wishlist/share", { method: "POST" });
      const payload = (await response.json()) as { data?: { token: string }; error?: string };
      if (!response.ok || !payload.data?.token) {
        setMessage(payload.error ?? "Impossible de partager la wishlist.");
        return;
      }
      const url = `${window.location.origin}/api/wishlist/share/${payload.data.token}`;
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = url;
        textarea.style.position = "fixed";
        textarea.style.left = "-9999px";
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      setMessage("Lien de wishlist copié.");
    } catch {
      setMessage("Impossible de copier le lien.");
    }
  }

  function handleLogout() {
    clearAuthToken();
    void fetch("/api/auth/logout", { method: "POST", keepalive: true });
    window.location.replace("/");
  }

  if (!isAuthorized) {
    return <div>Vous devez être connecté pour accéder à cette page.</div>;
  }

  return (
    <main className="min-h-screen bg-[#f8f8f5] md:h-screen md:overflow-hidden">
      <div className="flex min-h-screen w-full flex-col md:h-screen md:flex-row">
        <nav className="hidden w-64 flex-col gap-4 bg-white p-5 shadow-sm md:flex md:h-screen md:shrink-0 md:overflow-y-auto">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-3">
                <div className="flex size-8 items-center justify-center rounded-full bg-black text-primary">
                  <span className="material-symbols-outlined text-xl">menu_book</span>
                </div>
                <h2 className="text-lg font-extrabold uppercase leading-tight tracking-tight text-[#181810]">
                  SENAME EDITION’S
                </h2>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-1 text-sm">
            <button
              type="button"
              onClick={() => setActiveSection("dashboard")}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-left font-semibold ${activeSection === "dashboard"
                ? "bg-primary text-black"
                : "text-[#181810] hover:bg-[#f6f5ef]"
                }`}
            >
              <span className="material-symbols-outlined text-base text-[#8d895e]">dashboard</span>
              Tableau de bord
            </button>
            <button
              type="button"
              onClick={() => setActiveSection("orders")}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-left ${activeSection === "orders"
                ? "bg-primary text-black"
                : "text-[#181810] hover:bg-[#f6f5ef]"
                }`}
            >
              <span className="material-symbols-outlined text-base text-[#8d895e]">receipt_long</span>
              Mes Commandes
            </button>
            <button
              type="button"
              onClick={() => setActiveSection("contributions")}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-left ${activeSection === "contributions"
                ? "bg-primary text-black"
                : "text-[#181810] hover:bg-[#f6f5ef]"
                }`}
            >
              <span className="material-symbols-outlined text-base text-[#8d895e]">handshake</span>
              Mes contributions
            </button>
            <button
              type="button"
              onClick={() => setActiveSection("transactions")}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-left ${activeSection === "transactions"
                ? "bg-primary text-black"
                : "text-[#181810] hover:bg-[#f6f5ef]"
                }`}
            >
              <span className="material-symbols-outlined text-base text-[#8d895e]">payments</span>
              Mes transactions
            </button>
            <button
              type="button"
              onClick={() => setActiveSection("wishlist")}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-left ${activeSection === "wishlist"
                ? "bg-primary text-black"
                : "text-[#181810] hover:bg-[#f6f5ef]"
                }`}
            >
              <span className="material-symbols-outlined text-base text-[#8d895e]">favorite</span>
              Ma liste d&apos;envies
            </button>
            <button
              type="button"
              onClick={() => setActiveSection("profile")}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-left ${activeSection === "profile"
                ? "bg-primary text-black"
                : "text-[#181810] hover:bg-[#f6f5ef]"
                }`}
            >
              <span className="material-symbols-outlined text-base text-[#8d895e]">badge</span>
              Mon Profil
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="mt-2 flex items-center gap-3 rounded-lg px-3 py-2 text-left text-red-600 hover:bg-[#fef2f2]"
            >
              <span className="material-symbols-outlined text-base">logout</span>
              Déconnexion
            </button>
          </div>
        </nav>

        <section className="flex-1 min-w-0 md:h-screen md:overflow-y-auto">
          <div className="p-4 sm:p-6 md:p-6">
            <div className="mb-6 flex flex-wrap gap-2 md:hidden">
              {[
                { key: "dashboard", label: "Tableau de bord" },
                { key: "orders", label: "Commandes" },
                { key: "transactions", label: "Transactions" },
                { key: "contributions", label: "Contributions" },
                { key: "wishlist", label: "Liste d'envies" },
                { key: "profile", label: "Profil" }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveSection(tab.key as typeof activeSection)}
                  className={`rounded-full px-4 py-2 text-xs font-bold ${activeSection === tab.key
                    ? "bg-primary text-[#181810]"
                    : "bg-white border border-[#e5e5e0] text-[#181810]"
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {isLoading ? (
              <div className="rounded-2xl border border-[#e5e5e0] bg-white p-6 text-sm text-[#6b6959]">
                Chargement du profil...
              </div>
            ) : null}

            {!isLoading && error ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
                <p className="text-sm text-red-700">{error}</p>
                <Link href="/connexion" className="mt-4 inline-block text-sm font-bold underline">
                  Se connecter
                </Link>
              </div>
            ) : null}

            {!isLoading && !error && user ? (
              <>
                {notice ? (
                  <div className="mb-6 rounded-xl border border-[#e5e5e0] bg-white px-4 py-3 text-sm text-[#8d895e]">
                    {notice}
                  </div>
                ) : null}

                {activeSection === "dashboard" ? (
                  <>
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                      <div>
                        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                          Tableau de bord
                        </h2>
                        <p className="text-slate-500 mt-1">
                          Votre activité récente sur SENAME EDITION’S.
                        </p>
                      </div>
                    </div>
                    <br />
                    <section className="mb-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                      <div className="bg-white p-6 shadow-sm border-l-4 border-black flex flex-col justify-between">
                        <p className="text-xs font-bold uppercase text-gray-400 tracking-wider">Commandes passées</p>
                        <div className="flex items-end justify-between mt-4">
                          <span className="text-3xl font-extrabold">{stats.totalReservations}</span>
                          <div className="text-primary">
                            <span className="material-symbols-outlined">shopping_bag</span>
                          </div>
                        </div>
                      </div>
                      <div className="bg-white p-6 shadow-sm border-l-4 border-black flex flex-col justify-between">
                        <p className="text-xs font-bold uppercase text-gray-400 tracking-wider">Contributions</p>
                        <div className="flex items-end justify-between mt-4">
                          <span className="text-3xl font-extrabold">{contributions.length}</span>
                          <div className="text-primary text-xs font-bold uppercase">Actives</div>
                        </div>
                      </div>
                      <div className="bg-white p-6 shadow-sm border-l-4 border-black flex flex-col justify-between">
                        <p className="text-xs font-bold uppercase text-gray-400 tracking-wider">Liste d&apos;envies</p>
                        <div className="flex items-end justify-between mt-4">
                          <span className="text-3xl font-extrabold">{wishlist.length}</span>
                          <span className="text-xs text-gray-500 mb-1">Articles</span>
                        </div>
                      </div>
                      <div className="bg-primary p-6 shadow-sm flex flex-col justify-between">
                        <p className="text-xs font-bold uppercase text-black tracking-wider opacity-60">Total dépensé</p>
                        <div className="flex items-end justify-between mt-4">
                          <span className="text-3xl font-extrabold">{stats.totalSpent.toFixed(2)} €</span>
                          <span className="material-symbols-outlined">paid</span>
                        </div>
                      </div>
                    </section>

                    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                      <div className="space-y-8 lg:col-span-2">
                        <section className="bg-white p-8 shadow-sm border border-gray-100">
                          <div className="flex items-center justify-between mb-8">
                            <h2 className="text-xl font-bold uppercase tracking-tight">Contributions en cours</h2>
                            <button
                              type="button"
                              onClick={() => setActiveSection("contributions")}
                              className="text-xs font-bold text-gray-400 hover:text-dark uppercase transition-colors"
                            >
                              Tout voir
                            </button>
                          </div>
                          {contributions.length ? (
                            <div className="flex flex-col sm:flex-row gap-6 items-center">
                              <div className="w-24 h-36 bg-gray-100 flex-shrink-0 shadow-md overflow-hidden">
                                {contributions[0]?.book?.coverImage ? (
                                  <img
                                    src={contributions[0].book.coverImage}
                                    alt={contributions[0].book?.title ?? "Contribution"}
                                    className="w-full h-full object-cover"
                                  />
                                ) : null}
                              </div>
                              <div className="flex-1 w-full">
                                <div className="flex justify-between items-start mb-2">
                                  <div>
                                    <h3 className="font-extrabold text-lg">{contributions[0].book?.title ?? "Projet"}</h3>
                                    <p className="text-sm text-gray-500">
                                      Contribution en cours
                                    </p>
                                  </div>
                                  <span className="bg-primary px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest">
                                    {contributionStatusLabel[contributions[0].status]}
                                  </span>
                                </div>
                                <div className="w-full bg-gray-100 h-2 mt-4 relative overflow-hidden">
                                  <div className="bg-black h-full" style={{ width: "70%" }}></div>
                                </div>
                                <div className="flex justify-between items-center mt-3">
                                  <p className="text-xs font-bold">
                                    {contributions[0].amount.toFixed(2)} €
                                    <span className="text-gray-400 font-medium"> soutenus</span>
                                  </p>
                                  <p className="text-xs font-bold text-gray-500">En cours</p>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <p className="text-sm text-gray-500">Aucune contribution en cours.</p>
                          )}
                        </section>

                        <section className="bg-white shadow-sm border border-gray-100 overflow-hidden">
                          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-5 sm:px-8 sm:py-6">
                            <h2 className="text-xl font-bold uppercase tracking-tight">Commandes récentes</h2>
                            <button className="text-xs font-bold bg-gray-100 px-4 py-2 hover:bg-dark hover:text-white transition-all uppercase">
                              Télécharger CSV
                            </button>
                          </div>
                          <div className="overflow-x-auto">
                            <table className="min-w-[560px] w-full text-left">
                              <thead className="bg-gray-50 text-[10px] uppercase font-extrabold text-gray-400 tracking-widest">
                                <tr>
                                  <th className="px-4 py-4 sm:px-8">ID commande</th>
                                  <th className="px-4 py-4 sm:px-8">Date</th>
                                  <th className="px-4 py-4 sm:px-8">Montant</th>
                                  <th className="px-4 py-4 text-right sm:px-8">Statut</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-100">
                                {orders.slice(0, 3).map((order) => (
                                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-4 py-5 text-sm font-bold sm:px-8">#{order.id.slice(-6)}</td>
                                    <td className="px-4 py-5 text-sm text-gray-500 sm:px-8">-</td>
                                    <td className="px-4 py-5 text-sm font-bold sm:px-8">{order.total.toFixed(2)} €</td>
                                    <td className="px-4 py-5 text-right sm:px-8">
                                      <span className="inline-block w-2 h-2 rounded-full bg-primary mr-2"></span>
                                      <span className="text-xs font-bold uppercase">
                                        {order.status === "paid"
                                          ? "Livrée"
                                          : order.status === "pending"
                                            ? "En attente"
                                            : order.status === "refunded"
                                              ? "Remboursée"
                                              : "Annulée"}
                                      </span>
                                    </td>
                                  </tr>
                                ))}
                                {orders.length === 0 ? (
                                  <tr>
                                    <td colSpan={4} className="px-4 py-6 text-center text-sm text-gray-500 sm:px-8">
                                      Aucune commande récente.
                                    </td>
                                  </tr>
                                ) : null}
                              </tbody>
                            </table>
                          </div>
                          <div className="bg-gray-50 px-4 py-4 text-center sm:px-8">
                            <button
                              type="button"
                              onClick={() => setActiveSection("orders")}
                              className="text-xs font-extrabold text-dark uppercase underline decoration-primary decoration-2 underline-offset-4"
                            >
                              Voir tout l&apos;historique des commandes
                            </button>
                          </div>
                        </section>
                      </div>
                    </div>
                  </>
                ) : null}

                {activeSection === "orders" ? (
                  <div className="space-y-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                      <div>
                        <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">Mes Commandes</h2>
                        <p className="text-slate-500 mt-1">
                          Gérez et suivez vos achats de livres récents en temps réel.
                        </p>
                      </div>
                      <button
                        onClick={() => window.open("/api/me/orders/export", "_blank")}
                        className="flex w-full items-center justify-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-lg text-sm font-bold shadow-sm hover:bg-slate-50 md:w-auto"
                      >
                        <span className="material-symbols-outlined text-base">download</span>
                        Exporter CSV
                      </button>
                    </div>

                    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-wrap gap-4 items-center">
                      <div className="relative w-full sm:w-auto sm:min-w-[260px] flex-1">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                          search
                        </span>
                        <input
                          className="w-full bg-[#f8f8f5] border-none rounded-lg py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary/50 text-slate-900"
                          placeholder="Rechercher par ID ou titre de livre..."
                          type="text"
                          value={ordersQuery}
                          onChange={(event) => setOrdersQuery(event.target.value)}
                        />
                      </div>
                      <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
                        <select
                          className="bg-[#f8f8f5] border-none rounded-lg py-2.5 pl-4 pr-10 text-sm focus:ring-2 focus:ring-primary/50 text-slate-900 appearance-none cursor-pointer"
                          value={ordersStatusFilter}
                          onChange={(event) =>
                            setOrdersStatusFilter(event.target.value as typeof ordersStatusFilter)
                          }
                        >
                          <option value="all">Tous les statuts</option>
                          <option value="paid">Livrée</option>
                          <option value="pending">En attente</option>
                          <option value="cancelled">Annulée</option>
                          <option value="refunded">Remboursée</option>
                        </select>
                        <select
                          className="bg-[#f8f8f5] border-none rounded-lg py-2.5 pl-4 pr-10 text-sm focus:ring-2 focus:ring-primary/50 text-slate-900 appearance-none cursor-pointer"
                          value={ordersRange}
                          onChange={(event) => setOrdersRange(event.target.value as typeof ordersRange)}
                        >
                          <option value="30d">Derniers 30 jours</option>
                          <option value="6m">Derniers 6 mois</option>
                          <option value="2023">Année 2023</option>
                          <option value="all">Tout</option>
                        </select>
                      </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="min-w-[760px] w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                ID Commande
                              </th>
                              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                Date
                              </th>
                              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                Articles
                              </th>
                              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">
                                Montant
                              </th>
                              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                Statut
                              </th>
                              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">
                                Factures
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {pagedOrders.map((order) => {
                              const itemCount = order.items?.length ?? 0;
                              const itemsLabel = itemCount > 1 ? `${itemCount} articles` : `${itemCount} article`;
                              const titles = order.items
                                ?.map((item) => item.book?.title)
                                .filter(Boolean)
                                .join(", ");
                              const statusStyles =
                                order.status === "paid"
                                  ? "bg-emerald-100 text-emerald-700"
                                  : order.status === "pending"
                                    ? "bg-amber-100 text-amber-700"
                                    : order.status === "refunded"
                                      ? "bg-slate-200 text-slate-600"
                                      : "bg-blue-100 text-blue-700";
                              const dotColor =
                                order.status === "paid"
                                  ? "bg-emerald-500"
                                  : order.status === "pending"
                                    ? "bg-amber-500"
                                    : order.status === "refunded"
                                      ? "bg-slate-500"
                                      : "bg-blue-500";

                              return (
                                <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                                  <td className="px-6 py-5">
                                    <span className="font-bold text-slate-900">#LV-{order.id.slice(-4)}</span>
                                  </td>
                                  <td className="px-6 py-5 text-sm text-slate-500">{formatOrderDate(order)}</td>
                                  <td className="px-6 py-5">
                                    <div className="flex flex-col">
                                      <span className="text-sm font-semibold text-slate-700 truncate max-w-[220px]">
                                        {titles || "Ouvrage"}
                                      </span>
                                      <span className="text-[11px] text-slate-400 uppercase font-medium">
                                        {itemsLabel}
                                      </span>
                                    </div>
                                  </td>
                                  <td className="px-6 py-5 text-sm font-bold text-right text-slate-900">
                                    {order.total.toFixed(2)} €
                                  </td>
                                  <td className="px-6 py-5">
                                    <span
                                      className={`inline-flex items-center gap-1.5 py-1 px-3 rounded-full text-xs font-bold ${statusStyles}`}
                                    >
                                      <span className={`size-1.5 rounded-full ${dotColor}`}></span>
                                      {order.status === "paid"
                                        ? "Livrée"
                                        : order.status === "pending"
                                          ? "En attente"
                                          : order.status === "refunded"
                                            ? "Remboursée"
                                            : "Expédiée"}
                                    </span>
                                  </td>
                                  <td className="px-6 py-5 text-right">
                                    <div className="flex flex-wrap items-center justify-end gap-2">
                                      <button
                                        type="button"
                                        onClick={() => handleInvoiceView(order)}
                                        className="p-1.5 rounded-lg hover:bg-primary/20 text-slate-400 hover:text-slate-900 transition-colors"
                                        title="Voir facture"
                                      >
                                        <span className="material-symbols-outlined text-lg">visibility</span>
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleInvoiceDownload(order)}
                                        className="p-1.5 rounded-lg bg-primary text-slate-900 font-bold text-xs px-3 py-1.5 shadow-sm hover:shadow-md transition-all"
                                      >
                                        Télécharger
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                            {filteredOrders.length === 0 ? (
                              <tr>
                                <td colSpan={6} className="px-6 py-6 text-center text-sm text-slate-500">
                                  Aucune commande pour le moment.
                                </td>
                              </tr>
                            ) : null}
                          </tbody>
                        </table>
                      </div>
                      <div className="px-6 py-4 bg-slate-50 flex items-center justify-between border-t border-slate-200">
                        <p className="text-sm text-slate-500">
                          Affichage de <span className="font-bold text-slate-900">1</span> à{" "}
                          <span className="font-bold text-slate-900">
                            {Math.min(ordersPage * ORDERS_PAGE_SIZE, filteredOrders.length || 0)}
                          </span>{" "}
                          sur <span className="font-bold text-slate-900">{filteredOrders.length || 0}</span> commandes
                        </p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setOrdersPage((prev) => Math.max(1, prev - 1))}
                            disabled={ordersPage === 1}
                            className={`size-9 flex items-center justify-center rounded-lg bg-white border border-slate-200 ${ordersPage === 1 ? "text-slate-400 cursor-not-allowed" : "hover:bg-slate-50"
                              }`}
                          >
                            <span className="material-symbols-outlined">chevron_left</span>
                          </button>
                          {Array.from({ length: Math.min(totalOrderPages, 3) }).map((_, index) => {
                            const page = index + 1;
                            return (
                              <button
                                key={page}
                                onClick={() => setOrdersPage(page)}
                                className={`size-9 flex items-center justify-center rounded-lg border ${ordersPage === page
                                  ? "bg-primary text-slate-900 font-bold border-primary"
                                  : "bg-white border-slate-200 hover:bg-slate-50 font-bold"
                                  }`}
                              >
                                {page}
                              </button>
                            );
                          })}
                          <button
                            onClick={() => setOrdersPage((prev) => Math.min(totalOrderPages, prev + 1))}
                            disabled={ordersPage === totalOrderPages}
                            className={`size-9 flex items-center justify-center rounded-lg bg-white border border-slate-200 ${ordersPage === totalOrderPages ? "text-slate-400 cursor-not-allowed" : "hover:bg-slate-50"
                              }`}
                          >
                            <span className="material-symbols-outlined">chevron_right</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : null}

                {activeSection === "transactions" ? (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">Mes Transactions</h2>
                      <p className="text-slate-500 mt-1">
                        Historique de vos paiements et remboursements.
                      </p>
                    </div>

                    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-wrap gap-4 items-center">
                      <div className="relative w-full sm:w-auto sm:min-w-[260px] flex-1">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                          search
                        </span>
                        <input
                          className="w-full bg-[#f8f8f5] border-none rounded-lg py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary/50 text-slate-900"
                          placeholder="Rechercher référence, commande, provider..."
                          type="text"
                          value={transactionsQuery}
                          onChange={(event) => setTransactionsQuery(event.target.value)}
                        />
                      </div>
                      <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
                        <select
                          className="bg-[#f8f8f5] border-none rounded-lg py-2.5 pl-4 pr-10 text-sm focus:ring-2 focus:ring-primary/50 text-slate-900 appearance-none cursor-pointer"
                          value={transactionsProviderFilter}
                          onChange={(event) => setTransactionsProviderFilter(event.target.value as typeof transactionsProviderFilter)}
                        >
                          <option value="all">Tous providers</option>
                          <option value="stripe">Stripe</option>
                          <option value="paypal">PayPal</option>
                        </select>
                        <select
                          className="bg-[#f8f8f5] border-none rounded-lg py-2.5 pl-4 pr-10 text-sm focus:ring-2 focus:ring-primary/50 text-slate-900 appearance-none cursor-pointer"
                          value={transactionsStatusFilter}
                          onChange={(event) => setTransactionsStatusFilter(event.target.value as typeof transactionsStatusFilter)}
                        >
                          <option value="all">Tous statuts</option>
                          <option value="succeeded">Succès</option>
                          <option value="pending">En attente</option>
                          <option value="failed">Échec</option>
                        </select>
                      </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                      {transactionsError ? (
                        <p className="px-6 py-4 text-sm text-red-700">{transactionsError}</p>
                      ) : null}
                      <div className="overflow-x-auto">
                        <table className="min-w-[720px] w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Type</th>
                              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Provider</th>
                              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Référence</th>
                              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Montant</th>
                              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Statut</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {filteredTransactions.map((tx) => (
                              <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="px-6 py-4 text-sm text-slate-600">
                                  {tx.createdAt ? new Date(tx.createdAt).toLocaleString("fr-FR") : "-"}
                                </td>
                                <td className="px-6 py-4 text-sm font-semibold text-slate-800">
                                  {tx.kind === "payment" ? "Paiement" : tx.kind === "refund" ? "Remboursement" : "Webhook"}
                                </td>
                                <td className="px-6 py-4 text-sm text-slate-700 uppercase">{tx.provider}</td>
                                <td className="px-6 py-4 text-xs text-slate-500">{tx.providerReference ?? "-"}</td>
                                <td className="px-6 py-4 text-sm font-bold text-right text-slate-900">
                                  {typeof tx.amount === "number" ? `${tx.amount.toFixed(2)} ${tx.currency ?? "EUR"}` : "-"}
                                </td>
                                <td className="px-6 py-4">
                                  <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${tx.status === "succeeded"
                                    ? "bg-emerald-100 text-emerald-700"
                                    : tx.status === "pending"
                                      ? "bg-amber-100 text-amber-700"
                                      : "bg-red-100 text-red-700"
                                    }`}>
                                    {tx.status === "succeeded" ? "Succès" : tx.status === "pending" ? "En attente" : "Échec"}
                                  </span>
                                </td>
                              </tr>
                            ))}
                            {filteredTransactions.length === 0 ? (
                              <tr>
                                <td colSpan={6} className="px-6 py-6 text-center text-sm text-slate-500">
                                  Aucune transaction.
                                </td>
                              </tr>
                            ) : null}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                ) : null}

                {activeSection === "contributions" ? (
                  <div className="space-y-6">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                      <div>
                        <h2 className="text-2xl font-extrabold tracking-tight text-[#181810] sm:text-3xl md:text-4xl">Mes Contributions</h2>
                        <p className="text-gray-500 max-w-2xl mt-2">
                          Suivez l&apos;impact de vos soutiens aux projets participatifs et découvrez l&apos;évolution de vos investissements.
                        </p>
                      </div>
                      <button className="bg-primary text-[#181810] px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:shadow-lg transition-all active:scale-95 w-full md:w-auto">
                        <span className="material-symbols-outlined">explore</span>
                        Explorer des projets
                      </button>
                    </div>

                    <div className="flex flex-col gap-4 border-b border-[#e7e6da] md:flex-row md:items-center md:justify-between">
                      <div className="flex flex-wrap gap-6">
                        <button
                          onClick={() => setContributionTab("all")}
                          className={`pb-4 text-sm font-bold border-b-2 ${contributionTab === "all"
                            ? "border-primary text-[#181810]"
                            : "border-transparent text-gray-400 hover:text-gray-600"
                            }`}
                        >
                          Tous ({contributions.length})
                        </button>
                        <button
                          onClick={() => setContributionTab("pending")}
                          className={`pb-4 text-sm font-bold border-b-2 ${contributionTab === "pending"
                            ? "border-primary text-[#181810]"
                            : "border-transparent text-gray-400 hover:text-gray-600"
                            }`}
                        >
                          En cours ({contributions.filter((item) => item.status === "pending").length})
                        </button>
                        <button
                          onClick={() => setContributionTab("paid")}
                          className={`pb-4 text-sm font-bold border-b-2 ${contributionTab === "paid"
                            ? "border-primary text-[#181810]"
                            : "border-transparent text-gray-400 hover:text-gray-600"
                            }`}
                        >
                          Réussis ({contributions.filter((item) => item.status === "paid").length})
                        </button>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 pb-2">
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-[#e7e6da] rounded-lg">
                          <span className="material-symbols-outlined text-sm">filter_list</span>
                          <select
                            className="text-xs font-bold bg-transparent border-none focus:ring-0"
                            value={contributionStatusFilter}
                            onChange={(event) =>
                              setContributionStatusFilter(event.target.value as typeof contributionStatusFilter)
                            }
                          >
                            <option value="all">Filtrer</option>
                            <option value="pending">En cours</option>
                            <option value="paid">Réussis</option>
                            <option value="refunded">Remboursés</option>
                          </select>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-[#e7e6da] rounded-lg">
                          <span className="material-symbols-outlined text-sm">swap_vert</span>
                          <select
                            className="text-xs font-bold bg-transparent border-none focus:ring-0"
                            value={contributionSort}
                            onChange={(event) =>
                              setContributionSort(event.target.value as typeof contributionSort)
                            }
                          >
                            <option value="recent">Trier par date</option>
                            <option value="amount_desc">Montant ↓</option>
                            <option value="amount_asc">Montant ↑</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {contributionsError ? (
                      <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                        {contributionsError}
                      </p>
                    ) : null}

                    {!filteredContributions.length ? (
                      <div className="rounded-2xl border border-[#e5e5e0] bg-white p-6 text-sm text-[#8d895e]">
                        Aucune contribution pour le moment.
                      </div>
                    ) : null}

                    <div className="flex flex-col gap-4">
                      {filteredContributions.map((contribution) => (
                        <article
                          key={contribution.id}
                          className="bg-white border border-[#e7e6da] rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
                        >
                          <div className="flex flex-wrap md:flex-nowrap gap-6 items-start">
                            <div
                              className="w-full md:w-48 h-32 rounded-lg bg-cover bg-center shrink-0"
                              style={{
                                backgroundImage: `url('${contribution.book?.coverImage ?? ""}')`
                              }}
                            ></div>
                            <div className="flex-1 flex flex-col justify-between h-auto md:h-32">
                              <div className="flex justify-between items-start">
                                <div className="flex flex-col gap-1">
                                  <div className="flex items-center gap-2">
                                    <span
                                      className={`px-2 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wider ${contribution.status === "paid"
                                        ? "bg-green-100 text-green-700"
                                        : contribution.status === "pending"
                                          ? "bg-primary/30 text-[#181810]"
                                          : "bg-blue-100 text-blue-700"
                                        }`}
                                    >
                                      {contributionStatusLabel[contribution.status]}
                                    </span>
                                    <span className="text-xs text-gray-400 font-medium">Projet</span>
                                  </div>
                                  <h3 className="text-xl font-extrabold hover:text-primary transition-colors cursor-pointer">
                                    {contribution.book?.title ?? "Contribution"}
                                  </h3>
                                </div>
                                <div className="text-right">
                                  <p className="text-xs font-bold text-gray-400 uppercase">Contribution</p>
                                  <p className="text-lg font-extrabold">{contribution.amount.toFixed(2)} €</p>
                                </div>
                              </div>
                              <div className="mt-4 md:mt-0">
                                <div className="flex justify-between text-xs font-bold mb-1.5">
                                  <span className="text-gray-500">Progression du financement</span>
                                  <span className="text-[#181810]">70% (€10,500 / €15,000)</span>
                                </div>
                                <div className="w-full h-2.5 bg-[#f8f8f5] rounded-full overflow-hidden">
                                  <div className="h-full bg-primary" style={{ width: "70%" }}></div>
                                </div>
                                <div className="flex justify-between mt-2">
                                  <p className="text-xs text-gray-500">
                                    Soutenu récemment
                                  </p>
                                  <p className="text-xs font-bold text-gray-400">
                                    {contribution.status === "paid" ? "Objectif atteint !" : "En cours"}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </article>
                      ))}
                    </div>
                  </div>
                ) : null}

                {activeSection === "wishlist" ? (
                  <div className="space-y-8">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                      <div>
                        <h1 className="text-2xl font-black tracking-tight text-[#181810] mb-2 sm:text-3xl md:text-4xl">Ma liste d&apos;envies</h1>
                        <p className="text-[#8d895e] text-base font-medium flex items-center gap-2">
                          <span className="material-symbols-outlined text-sm">auto_stories</span>
                          {wishlist.length} articles sauvegardés dans votre liste
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-3">
                        <button
                          onClick={() => void shareWishlist()}
                          className="flex items-center gap-2 rounded-xl border border-[#e5e5df] bg-white px-4 py-3 text-sm font-bold shadow-sm transition-all hover:bg-gray-50 sm:px-6"
                        >
                          <span className="material-symbols-outlined text-lg">share</span>
                          Partager la liste
                        </button>
                        <button
                          onClick={() => addAllWishlistToCart()}
                          className="flex items-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-[#181810] shadow-md transition-all hover:brightness-105 sm:px-6"
                        >
                          <span className="material-symbols-outlined text-lg">add_shopping_cart</span>
                          Tout ajouter au panier
                        </button>
                      </div>
                    </div>

                    {wishlistError ? (
                      <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                        {wishlistError}
                      </p>
                    ) : null}
                    {message ? (
                      <p className="rounded-lg border border-[#e7e6da] bg-white p-3 text-sm text-[#6b6959]">
                        {message}
                      </p>
                    ) : null}

                    {wishlist.length === 0 ? (
                      <div className="rounded-2xl border border-[#e5e5e0] bg-white p-6 text-sm text-[#8d895e]">
                        Votre liste d&apos;envies est vide.
                      </div>
                    ) : null}

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {wishlist.map((book) => (
                        <article
                          key={book.id}
                          className="group bg-white rounded-xl border border-[#e5e5df] overflow-hidden flex flex-col shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                        >
                          <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
                            {book.coverImage ? (
                              <img
                                src={book.coverImage}
                                alt={book.title ?? "Ouvrage"}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                              />
                            ) : null}
                            <button
                              type="button"
                              onClick={() => void removeWishlistBook(book.id)}
                              className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full text-red-500 shadow-sm hover:bg-red-500 hover:text-white transition-colors"
                            >
                              <span className="material-symbols-outlined text-lg">delete</span>
                            </button>
                          </div>
                          <div className="p-4 flex flex-col flex-1">
                            <div className="mb-4">
                              <h3 className="text-[#181810] font-bold text-lg leading-tight mb-1 truncate">
                                {book.title ?? "Ouvrage"}
                              </h3>
                              <p className="text-[#8d895e] text-sm">{book.authorName ?? "Auteur"}</p>
                            </div>
                            <div className="mt-auto">
                              <p className="text-xl font-black text-primary mb-4 drop-shadow-sm">
                                {book.price?.toFixed(2) ?? "0.00"} €
                              </p>
                              <button
                                onClick={() => addWishlistItemToCart(book)}
                                className="w-full py-2.5 bg-primary/10 text-[#181810] font-bold rounded-lg hover:bg-primary transition-colors text-sm flex items-center justify-center gap-2"
                              >
                                <span className="material-symbols-outlined text-lg">shopping_cart</span>
                                Ajouter au panier
                              </button>
                            </div>
                          </div>
                        </article>
                      ))}
                    </div>
                  </div>
                ) : null}

                {activeSection === "profile" ? (
                  <div className="space-y-8 max-w-5xl">
                    <header className="mb-2">
                      <h1 className="text-2xl font-black tracking-tight text-[#181810] mb-2 sm:text-3xl md:text-4xl">Mon Profil</h1>
                      <p className="text-[#8d895e] text-lg">
                        Gérez vos informations personnelles et la sécurité de votre compte SENAME EDITION’S.
                      </p>
                    </header>

                    <section className="bg-white rounded-xl shadow-sm border border-[#e7e6da] overflow-hidden">
                      <div className="px-6 py-4 border-b border-[#e7e6da] bg-zinc-50/50 flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">badge</span>
                        <h2 className="text-lg font-bold text-[#181810]">Informations Personnelles</h2>
                      </div>
                      <div className="p-8">
                        <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="flex flex-col gap-2">
                            <label className="text-sm font-bold text-[#181810]">Nom Complet</label>
                            <input
                              className="w-full px-4 py-3 rounded-lg border border-[#e7e6da] bg-white text-[#181810] focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                              placeholder="Nom complet"
                              type="text"
                              value={name}
                              onChange={(event) => setName(event.target.value)}
                            />
                          </div>
                          <div className="flex flex-col gap-2">
                            <label className="text-sm font-bold text-[#181810]">Adresse E-mail</label>
                            <input
                              className="w-full px-4 py-3 rounded-lg border border-[#e7e6da] bg-white text-[#181810] focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                              placeholder="email@exemple.com"
                              type="email"
                              value={user.email}
                              readOnly
                            />
                          </div>
                          <div className="md:col-span-2 flex justify-end mt-4">
                            <button
                              type="button"
                              onClick={() => void saveProfile()}
                              disabled={isSaving || name.trim().length < 2}
                              className="bg-primary hover:brightness-105 text-[#181810] font-bold px-8 py-3 rounded-lg transition-all shadow-md active:scale-95 disabled:opacity-60"
                            >
                              {isSaving ? "Enregistrement..." : "Sauvegarder les modifications"}
                            </button>
                            {message ? <p className="ml-4 text-sm text-[#6b6959]">{message}</p> : null}
                          </div>
                        </form>
                      </div>
                    </section>

                    <section className="bg-white rounded-xl shadow-sm border border-[#e7e6da] overflow-hidden">
                      <div className="px-6 py-4 border-b border-[#e7e6da] bg-zinc-50/50 flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">lock</span>
                        <h2 className="text-lg font-bold text-[#181810]">Modifier le mot de passe</h2>
                      </div>
                      <div className="p-8">
                        <form className="flex flex-col gap-6 max-w-xl">
                          <div className="flex flex-col gap-2">
                            <label className="text-sm font-bold text-[#181810]">Mot de passe actuel</label>
                            <input
                              className="w-full px-4 py-3 rounded-lg border border-[#e7e6da] bg-white text-[#181810] focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                              placeholder="••••••••••••"
                              type="password"
                              value={passwordCurrent}
                              onChange={(event) => setPasswordCurrent(event.target.value)}
                            />
                            <Link
                              href="/mot-de-passe-oublie"
                              className="text-xs font-bold text-[#8d895e] hover:text-[#181810]"
                            >
                              Mot de passe oublié ?
                            </Link>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="flex flex-col gap-2">
                              <label className="text-sm font-bold text-[#181810]">Nouveau mot de passe</label>
                              <input
                                className="w-full px-4 py-3 rounded-lg border border-[#e7e6da] bg-white text-[#181810] focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                                placeholder="••••••••••••"
                                type="password"
                                value={passwordNext}
                                onChange={(event) => setPasswordNext(event.target.value)}
                              />
                            </div>
                            <div className="flex flex-col gap-2">
                              <label className="text-sm font-bold text-[#181810]">Confirmer le mot de passe</label>
                              <input
                                className="w-full px-4 py-3 rounded-lg border border-[#e7e6da] bg-white text-[#181810] focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                                placeholder="••••••••••••"
                                type="password"
                                value={passwordConfirm}
                                onChange={(event) => setPasswordConfirm(event.target.value)}
                              />
                            </div>
                          </div>
                          <div className="flex items-center justify-between mt-4">
                            <p className="text-xs text-[#8d895e] italic">
                              Minimum 8 caractères, incluant un chiffre et un symbole.
                            </p>
                            <button
                              type="button"
                              onClick={() => void changePassword()}
                              className="bg-zinc-900 text-white font-bold px-8 py-3 rounded-lg transition-all hover:bg-zinc-800 active:scale-95 shadow-md"
                            >
                              Actualiser le mot de passe
                            </button>
                          </div>
                          {passwordNotice ? (
                            <p className="text-sm text-[#8d895e]">{passwordNotice}</p>
                          ) : null}
                        </form>
                      </div>
                    </section>
                  </div>
                ) : null}
              </>
            ) : null}
          </div>
        </section>
      </div>
      {invoiceDialogMessage ? (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-black text-[#181810]">Facture indisponible</h3>
            <p className="mt-2 text-sm text-[#6b6959]">{invoiceDialogMessage}</p>
            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => setInvoiceDialogMessage(null)}
                className="rounded bg-primary px-4 py-2 text-xs font-bold uppercase text-[#181810]"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}

export default function AccountPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-[#f8f8f5]">
        <div className="flex items-center gap-3">
          <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-sm font-semibold text-[#6b6959]">Chargement de votre compte...</p>
        </div>
      </div>
    }>
      <AccountPageContent />
    </Suspense>
  );
}
