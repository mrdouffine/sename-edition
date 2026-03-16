/* eslint-disable react/no-unescaped-entities */
"use client";

import Link from "next/link";
import React, { useState, useEffect, useMemo, useCallback, type FormEvent, type ChangeEvent, Suspense } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { fetchWithAuth } from "@/lib/api/client";
import { clearAuthToken, getSessionFromToken } from "@/lib/auth/client";
import { normalizeNextPath } from "@/lib/auth/redirect";
import { slugify } from "@/lib/text/slugify";
import Logo from "@/components/Logo";
import BookCover from "@/components/BookCover";

type ApiResult<T> = { data?: T; error?: string };

type AdminStats = {
  usersCount: number;
  booksCount: number;
  ordersCount: number;
  contributionsCount: number;
  pendingCommentsCount: number;
  paidRevenue: number;
  paidContributions: number;
  salesByType: Array<{ type: "direct" | "preorder" | "crowdfunding"; count: number; total: number }>;
  topBooks: Array<{ bookId: string; title: string; quantitySold: number; revenue: number }>;
  campaignFunding: Array<{ bookId: string; title: string; collected: number; goal: number }>;
};

type AdminUser = { id: string; name: string; email: string; role: "client" | "admin" };
type AdminOrder = {
  id: string;
  userId: string;
  total: number;
  status: "pending" | "paid" | "cancelled" | "refunded";
  saleType: "direct" | "preorder";
};
type AdminContribution = {
  id: string;
  userId: string | null;
  bookId: string;
  amount: number;
  reward?: string;
  status: "pending" | "paid" | "refunded";
};
type AdminPaymentTx = {
  id: string;
  orderId: string | null;
  userId: string | null;
  user?: {
    name: string;
    email: string;
  } | null;
  provider: "fedapay" | "paypal";
  kind: "payment" | "refund" | "webhook";
  providerEventId: string | null;
  providerReference: string | null;
  status: "pending" | "succeeded" | "failed";
  amount: number | null;
  currency: string | null;
  createdAt?: string | null;
};
type AdminPromo = {
  id: string;
  code: string;
  type: "percent" | "fixed";
  value: number;
  minSubtotal: number;
  maxDiscount?: number;
  usageLimit?: number;
  usedCount: number;
  active: boolean;
  expiresAt?: string;
};
type AdminBook = {
  id: string;
  title: string;
  slug: string;
  subtitle?: string;
  description?: string;
  price: number;
  saleType: "direct" | "preorder" | "crowdfunding";
  stock?: number;
  fundingGoal?: number;
  fundingRaised?: number;
  coverImage?: string;
  releaseDate?: string;
  excerptUrl?: string;
};
type AdminAuditLog = {
  id: string;
  action: string;
  entity: string;
  entityId: string;
  payload: Record<string, unknown>;
  createdAt?: string;
  adminUser: {
    id: string;
    name: string;
    email: string;
  };
};

type Section =
  | "dashboard"
  | "ouvrages"
  | "users"
  | "orders"
  | "contributions"
  | "payments"
  | "marketing";

const ORDER_STATUS: AdminOrder["status"][] = ["pending", "paid", "cancelled", "refunded"];
const CONTRIBUTION_STATUS: AdminContribution["status"][] = ["pending", "paid", "refunded"];
const USER_ROLES: AdminUser["role"][] = ["client", "admin"];

const MENU: Array<{ key: Section; label: string; icon: string; href: string }> = [
  { key: "dashboard", label: "Tableau de bord", icon: "dashboard", href: "/admin" },
  { key: "ouvrages", label: "Ouvrages", icon: "menu_book", href: "/admin/ouvrages" },
  { key: "users", label: "Utilisateurs", icon: "group", href: "/admin/users" },
  { key: "orders", label: "Commandes", icon: "receipt_long", href: "/admin/orders" },
  {
    key: "contributions",
    label: "Contributions",
    icon: "rocket_launch",
    href: "/admin/contributions"
  },
  { key: "payments", label: "Paiements", icon: "payments", href: "/admin/payments" },
  { key: "marketing", label: "Marketing", icon: "local_offer", href: "/admin/marketing" }
];

function AdminPageContent() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [creatingBook, setCreatingBook] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [contributions, setContributions] = useState<AdminContribution[]>([]);
  const [payments, setPayments] = useState<AdminPaymentTx[]>([]);
  const [books, setBooks] = useState<AdminBook[]>([]);
  const [promos, setPromos] = useState<AdminPromo[]>([]);
  const [auditLogs, setAuditLogs] = useState<AdminAuditLog[]>([]);
  const [newPromo, setNewPromo] = useState({
    code: "",
    type: "percent" as "percent" | "fixed",
    value: "",
    minSubtotal: "0",
    maxDiscount: "",
    usageLimit: "",
    expiresAt: ""
  });

  const [newBook, setNewBook] = useState({
    title: "",
    slug: "",
    subtitle: "",
    description: "",
    price: "",
    saleType: "direct" as "direct" | "preorder" | "crowdfunding",
    releaseDate: "",
    isbn: "",
    stock: "",
    fundingGoal: "",
    fundingRaised: "0",
    pages: "",
    staticReviews: [] as Array<{
      id: string; // Add ID for better list management
      name: string;
      role?: string;
      content: string;
      rating: number;
    }>
  });
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [newBookSlugEdited, setNewBookSlugEdited] = useState(false);
  const [paymentsProviderFilter, setPaymentsProviderFilter] = useState<"all" | "fedapay" | "paypal">("all");
  const [paymentsStatusFilter, setPaymentsStatusFilter] = useState<"all" | "pending" | "succeeded" | "failed">("all");

  const [search, setSearch] = useState({
    users: "",
    orders: "",
    contributions: "",
    payments: "",
    ouvrages: "",
    promos: ""
  });
  const [page, setPage] = useState({
    users: 1,
    orders: 1,
    contributions: 1,
    payments: 1,
    ouvrages: 1,
    promos: 1
  });

  const activeSection: Section = useMemo(() => {
    if (pathname.startsWith("/admin/ouvrages")) return "ouvrages";
    if (pathname.startsWith("/admin/users")) return "users";
    if (pathname.startsWith("/admin/orders")) return "orders";
    if (pathname.startsWith("/admin/contributions")) return "contributions";
    if (pathname.startsWith("/admin/payments")) return "payments";
    if (pathname.startsWith("/admin/marketing")) return "marketing";
    return "dashboard";
  }, [pathname]);

  const SECTION_HEADERS: Record<
    Section,
    { title: string; subtitle: string }
  > = {
    dashboard: {
      title: "Tableau de bord",
      subtitle: "Vue globale de l'interface d'administration SENALE EDITION'S"
    },
    ouvrages: {
      title: "Ouvrages",
      subtitle: "Ajout, édition et suivi du catalogue"
    },
    users: {
      title: "Utilisateurs",
      subtitle: "Comptes, rôles et permissions"
    },
    orders: {
      title: "Commandes",
      subtitle: "Historique et statut des commandes"
    },
    contributions: {
      title: "Contributions",
      subtitle: "Campagnes participatives et suivi des soutiens"
    },
    payments: {
      title: "Paiements",
      subtitle: "Transactions, statuts et traçabilité des remboursements"
    },
    marketing: {
      title: "Marketing",
      subtitle: "Codes promo, newsletters et relances"
    }
  };
  const currentHeader = SECTION_HEADERS[activeSection];

  const pendingOrdersCount = useMemo(
    () => orders.filter((order) => order.status === "pending").length,
    [orders]
  );
  const recentOrders = useMemo(() => orders.slice(0, 4), [orders]);
  const highlightedCampaign = stats?.campaignFunding?.[0] ?? null;
  const PAGE_SIZE = 8;

  const filteredUsers = useMemo(
    () =>
      users.filter((user) =>
        `${user.name} ${user.email} ${user.role}`
          .toLowerCase()
          .includes(search.users.toLowerCase())
      ),
    [users, search.users]
  );

  const filteredOrders = useMemo(
    () =>
      orders.filter((order) =>
        `${order.id} ${order.userId} ${order.saleType} ${order.status}`
          .toLowerCase()
          .includes(search.orders.toLowerCase())
      ),
    [orders, search.orders]
  );

  const filteredContributions = useMemo(
    () =>
      contributions.filter((contribution) =>
        `${contribution.id} ${contribution.bookId} ${contribution.userId ?? ""} ${contribution.status} ${contribution.reward ?? ""}`
          .toLowerCase()
          .includes(search.contributions.toLowerCase())
      ),
    [contributions, search.contributions]
  );
  const filteredPayments = useMemo(
    () => {
      const byQuery = payments.filter((tx) =>
        `${tx.id} ${tx.orderId ?? ""} ${tx.userId ?? ""} ${tx.provider} ${tx.kind} ${tx.status} ${tx.providerReference ?? ""}`
          .toLowerCase()
          .includes(search.payments.toLowerCase())
      );

      const byProvider =
        paymentsProviderFilter === "all"
          ? byQuery
          : byQuery.filter((tx) => tx.provider === paymentsProviderFilter);

      const byStatus =
        paymentsStatusFilter === "all"
          ? byProvider
          : byProvider.filter((tx) => tx.status === paymentsStatusFilter);

      return byStatus;
    },
    [payments, paymentsProviderFilter, paymentsStatusFilter, search.payments]
  );

  const filteredBooks = useMemo(
    () =>
      books.filter((book) =>
        `${book.title} ${book.slug} ${book.saleType}`
          .toLowerCase()
          .includes(search.ouvrages.toLowerCase())
      ),
    [books, search.ouvrages]
  );
  const filteredPromos = useMemo(
    () =>
      promos.filter((promo) =>
        `${promo.code} ${promo.type} ${promo.value} ${promo.active ? "active" : "inactive"}`
          .toLowerCase()
          .includes(search.promos.toLowerCase())
      ),
    [promos, search.promos]
  );

  const pagedUsers = paginate(filteredUsers, page.users, PAGE_SIZE);
  const pagedOrders = paginate(filteredOrders, page.orders, PAGE_SIZE);
  const pagedContributions = paginate(filteredContributions, page.contributions, PAGE_SIZE);
  const pagedPayments = paginate(filteredPayments, page.payments, PAGE_SIZE);
  const pagedBooks = paginate(filteredBooks, page.ouvrages, PAGE_SIZE);
  const pagedPromos = paginate(filteredPromos, page.promos, PAGE_SIZE);

  const loadAdminData = useCallback(async () => {
    setLoading(true);
    setError(null);

    const session = getSessionFromToken();
    if (!session) {
      const searchString = searchParams.toString();
      const nextPath = normalizeNextPath(
        `${pathname}${searchString ? `?${searchString}` : ""}`,
        "/admin"
      );
      router.replace(`/connexion?next=${encodeURIComponent(nextPath)}`);
      return;
    }

    if (session.role !== "admin") {
      setError("Accès refusé: rôle admin requis.");
      setLoading(false);
      return;
    }

    try {
      const [
        statsRes,
        usersRes,
        ordersRes,
        contributionsRes,
        paymentsRes,
        booksRes,
        promosRes,
        auditRes
      ] =
        await Promise.all([
          fetchWithAuth("/api/admin/stats"),
          fetchWithAuth("/api/admin/users"),
          fetchWithAuth("/api/admin/orders"),
          fetchWithAuth("/api/admin/contributions"),
          fetchWithAuth("/api/admin/payments"),
          fetchWithAuth("/api/admin/books"),
          fetchWithAuth("/api/admin/promos"),
          fetchWithAuth("/api/admin/audit")
        ]);

      const [
        statsPayload,
        usersPayload,
        ordersPayload,
        contributionsPayload,
        paymentsPayload,
        booksPayload,
        promosPayload,
        auditPayload
      ] =
        (await Promise.all([
          statsRes.json(),
          usersRes.json(),
          ordersRes.json(),
          contributionsRes.json(),
          paymentsRes.json(),
          booksRes.json(),
          promosRes.json(),
          auditRes.json()
        ])) as [
          ApiResult<AdminStats>,
          ApiResult<AdminUser[]>,
          ApiResult<AdminOrder[]>,
          ApiResult<AdminContribution[]>,
          ApiResult<AdminPaymentTx[]>,
          ApiResult<AdminBook[]>,
          ApiResult<AdminPromo[]>,
          ApiResult<AdminAuditLog[]>
        ];

      if (
        !statsRes.ok ||
        !usersRes.ok ||
        !ordersRes.ok ||
        !contributionsRes.ok ||
        !paymentsRes.ok ||
        !booksRes.ok ||
        !promosRes.ok ||
        !auditRes.ok
      ) {
        setError(
          statsPayload.error ||
          usersPayload.error ||
          ordersPayload.error ||
          contributionsPayload.error ||
          paymentsPayload.error ||
          booksPayload.error ||
          promosPayload.error ||
          auditPayload.error ||
          "Erreur de chargement admin"
        );
        setLoading(false);
        return;
      }

      setStats(statsPayload.data ?? null);
      setUsers(usersPayload.data ?? []);
      setOrders(ordersPayload.data ?? []);
      setContributions(contributionsPayload.data ?? []);
      setPayments(paymentsPayload.data ?? []);
      setBooks(booksPayload.data ?? []);
      setPromos(promosPayload.data ?? []);
      setAuditLogs(auditPayload.data ?? []);
    } catch {
      setError("Erreur réseau");
    } finally {
      setLoading(false);
    }
  }, [pathname, router, searchParams]);

  function handleLogout() {
    clearAuthToken();
    void fetch("/api/auth/logout", { method: "POST", keepalive: true });
    window.location.replace("/");
  }

  useEffect(() => {
    // Initial data load for admin dashboard
    void loadAdminData();
  }, [loadAdminData]);

  async function exportCsv(endpoint: string, filename: string) {
    const response = await fetchWithAuth(`${endpoint}?format=csv`);
    if (!response.ok) {
      const payload = (await response.json()) as ApiResult<unknown>;
      setNotice(payload.error ?? "Export CSV impossible");
      return;
    }

    const csv = await response.text();
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  }

  async function runNotificationsNow() {
    const response = await fetchWithAuth("/api/admin/notifications/run", { method: "POST" });
    const payload = (await response.json()) as ApiResult<{ preorderEmailsSent: number; campaignEmailsSent: number }>;
    if (!response.ok || !payload.data) {
      setNotice(payload.error ?? "Exécution des notifications impossible");
      return;
    }
    setNotice(
      `Notifications envoyées: précommandes ${payload.data.preorderEmailsSent}, campagnes ${payload.data.campaignEmailsSent}`
    );
    void loadAdminData();
  }

  async function updateUserRole(userId: string, role: AdminUser["role"]) {
    const response = await fetchWithAuth("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, role })
    });

    const payload = (await response.json()) as ApiResult<AdminUser>;
    if (!response.ok || !payload.data) {
      setNotice(payload.error ?? "Impossible de mettre à jour le rôle");
      return;
    }

    setUsers((prev) => prev.map((user) => (user.id === userId ? payload.data! : user)));
    setNotice("Rôle utilisateur mis à jour");
  }

  async function updateOrderStatus(orderId: string, status: AdminOrder["status"]) {
    const response = await fetchWithAuth("/api/admin/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, status })
    });

    const payload = (await response.json()) as ApiResult<AdminOrder>;
    if (!response.ok || !payload.data) {
      setNotice(payload.error ?? "Impossible de mettre à jour la commande");
      return;
    }

    setOrders((prev) => prev.map((order) => (order.id === orderId ? payload.data! : order)));
    setNotice("Statut de commande mis à jour");
  }

  async function updateContributionStatus(
    contributionId: string,
    status: AdminContribution["status"]
  ) {
    const response = await fetchWithAuth("/api/admin/contributions", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contributionId, status })
    });

    const payload = (await response.json()) as ApiResult<AdminContribution>;
    if (!response.ok || !payload.data) {
      setNotice(payload.error ?? "Impossible de mettre à jour la contribution");
      return;
    }

    setContributions((prev) =>
      prev.map((contribution) =>
        contribution.id === contributionId ? payload.data! : contribution
      )
    );
    setNotice("Contribution mise à jour");
  }

  async function deleteBook(bookId: string) {
    const response = await fetchWithAuth("/api/admin/books", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookId })
    });

    const payload = (await response.json()) as ApiResult<{ id: string }>;
    if (!response.ok || !payload.data) {
      setNotice(payload.error ?? "Impossible de supprimer l'ouvrage");
      return;
    }

    setBooks((prev) => prev.filter((book) => book.id !== payload.data!.id));
    setNotice("Ouvrage supprimé");
  }

  async function createPromo(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const response = await fetchWithAuth("/api/admin/promos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code: newPromo.code,
        type: newPromo.type,
        value: Number(newPromo.value),
        minSubtotal: Number(newPromo.minSubtotal || "0"),
        maxDiscount: newPromo.maxDiscount ? Number(newPromo.maxDiscount) : undefined,
        usageLimit: newPromo.usageLimit ? Number(newPromo.usageLimit) : undefined,
        expiresAt: newPromo.expiresAt || undefined
      })
    });

    const payload = (await response.json()) as ApiResult<AdminPromo>;
    if (!response.ok || !payload.data) {
      setNotice(payload.error ?? "Impossible de créer le code promo");
      return;
    }

    setPromos((prev) => [payload.data!, ...prev]);
    setNewPromo({
      code: "",
      type: "percent",
      value: "",
      minSubtotal: "0",
      maxDiscount: "",
      usageLimit: "",
      expiresAt: ""
    });
    setNotice("Code promo créé");
  }

  async function togglePromoActive(promo: AdminPromo) {
    const response = await fetchWithAuth("/api/admin/promos", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        promoId: promo.id,
        active: !promo.active
      })
    });

    const payload = (await response.json()) as ApiResult<AdminPromo>;
    if (!response.ok || !payload.data) {
      setNotice(payload.error ?? "Impossible de mettre à jour le code promo");
      return;
    }

    setPromos((prev) => prev.map((item) => (item.id === promo.id ? payload.data! : item)));
    setNotice("Code promo mis à jour");
  }

  async function updateBook(
    bookId: string,
    patch: Partial<
      Pick<
        AdminBook,
        | "title"
        | "slug"
        | "subtitle"
        | "description"
        | "price"
        | "saleType"
        | "stock"
        | "fundingGoal"
        | "fundingRaised"
        | "coverImage"
        | "releaseDate"
        | "excerptUrl"
      >
    >
  ) {
    const response = await fetchWithAuth("/api/admin/books", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookId, ...patch })
    });

    const payload = (await response.json()) as ApiResult<AdminBook>;
    if (!response.ok || !payload.data) {
      setNotice(payload.error ?? "Impossible de mettre à jour l'ouvrage");
      return;
    }

    setBooks((prev) => prev.map((book) => (book.id === bookId ? payload.data! : book)));
    setNotice("Ouvrage mis à jour");
  }

  async function createBook(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (creatingBook) return;
    setNotice(null);
    setCreatingBook(true);

    // Filter valid reviews (must have name and content)
    const validReviews = newBook.staticReviews
      .filter((r) => r.name.trim().length >= 2 && r.content.trim().length >= 2)
      .map((r, i) => ({
        name: r.name.trim(),
        role: r.role?.trim() || undefined,
        content: r.content.trim(),
        rating: r.rating,
        order: i + 1
      }));

    if (newBook.staticReviews.length > 0 && validReviews.length < newBook.staticReviews.length) {
      setNotice("Certains avis sont incomplets (nom et texte obligatoires, min 2 caractères).");
      return;
    }

    if ((newBook.saleType === "direct" || newBook.saleType === "preorder") && newBook.stock.trim() === "") {
      setNotice("Le stock est obligatoire pour Achat direct / Précommande.");
      return;
    }

    if (newBook.saleType === "crowdfunding" && newBook.fundingGoal.trim() === "") {
      setNotice("L'objectif de financement est obligatoire pour le financement participatif.");
      return;
    }

    try {
      let coverImageUrl = "";

      if (coverPreview) {
        setNotice("Téléchargement de la couverture...");
        const uploadRes = await fetchWithAuth("/api/upload/image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            image: coverPreview,
            folder: "livreo/covers"
          })
        });

        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) {
          throw new Error(uploadData.error || "Échec de l'upload de l'image");
        }
        coverImageUrl = uploadData.url;
      }

      const body: Record<string, unknown> = {
        title: newBook.title.trim(),
        description: newBook.description.trim(),
        price: Number(newBook.price),
        saleType: newBook.saleType,
        coverImage: coverImageUrl
      };

      if (newBook.slug.trim()) body.slug = newBook.slug.trim();
      if (newBook.subtitle.trim()) body.subtitle = newBook.subtitle.trim();
      if (newBook.releaseDate) body.releaseDate = newBook.releaseDate;
      if (newBook.isbn.trim()) body.isbn = newBook.isbn.trim();

      if (newBook.stock.trim() !== "") body.stock = Number(newBook.stock);
      if (newBook.fundingGoal.trim() !== "") body.fundingGoal = Number(newBook.fundingGoal);
      if (newBook.fundingRaised.trim() !== "") body.fundingRaised = Number(newBook.fundingRaised);

      if (newBook.pages.trim()) body.pages = Number(newBook.pages);

      if (validReviews.length > 0) body.staticReviews = validReviews;

      const response = await fetchWithAuth("/api/books", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });

      const payload = (await response.json()) as ApiResult<unknown>;

      if (!response.ok) {
        setNotice(payload.error ?? "Impossible de créer l'ouvrage (erreur serveur)");
        return;
      }

      setNewBook({
        title: "",
        slug: "",
        subtitle: "",
        description: "",
        price: "",
        saleType: "direct",
        releaseDate: "",
        isbn: "",
        stock: "",
        fundingGoal: "",
        fundingRaised: "0",
        pages: "",
        staticReviews: []
      });
      setCoverFile(null);
      setCoverPreview(null);
      setNewBookSlugEdited(false);
      setNotice("✅ Ouvrage créé avec succès !");
      void loadAdminData();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      setNotice(`Erreur : ${err.message || "Une erreur est survenue"}`);
    } finally {
      setCreatingBook(false);
    }
  }

  function handleNewBookTitleChange(title: string) {
    setNewBook((prev) => ({
      ...prev,
      title,
      slug: newBookSlugEdited ? prev.slug : slugify(title)
    }));
  }

  function handleNewBookSlugChange(slug: string) {
    setNewBookSlugEdited(true);
    setNewBook((prev) => ({ ...prev, slug: slugify(slug) }));
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) {
      setCoverFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  return (
    <main className="min-h-screen bg-[#f3f4f6] text-[#181810] md:h-screen md:overflow-hidden">
      <div className="flex min-h-screen flex-col md:h-screen md:flex-row">
        <aside className="w-full border-b border-[#e5e7eb] bg-white p-4 sm:p-5 md:w-72 md:border-b-0 md:border-r md:h-screen md:shrink-0 md:overflow-y-auto">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-3">
              <Logo />
            </Link>
            <div>
              <p className="text-xs font-semibold text-[#6b7280] uppercase tracking-wide mt-1 underline decoration-primary underline-offset-4">administration</p>
            </div>
          </div>

          <nav className="mt-6 space-y-2">
            {MENU.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold transition ${activeSection === item.key
                  ? "bg-primary text-black"
                  : "text-[#4b5563] hover:bg-[#f4f5f7]"
                  }`}
              >
                <span className="material-symbols-outlined text-lg">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>

          <div className="mt-10">
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-[#fef2f2]"
            >
              <span className="material-symbols-outlined text-base">logout</span>
              Déconnexion
            </button>
          </div>
        </aside>

        <section className="flex-1 p-4 sm:p-6 md:p-8 md:h-screen md:overflow-y-auto">
          <header className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-black sm:text-3xl">{currentHeader.title}</h1>
              <p className="text-sm text-[#6b7280]">{currentHeader.subtitle}</p>
            </div>
          </header>

          {loading ? <p className="text-sm text-[#6b7280]">Chargement...</p> : null}
          {error ? (
            <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </p>
          ) : null}
          {notice ? (
            <p className="mb-4 rounded-xl border border-[#e5e7eb] bg-white px-4 py-3 text-sm">{notice}</p>
          ) : null}

          {!loading && !error && stats ? (
            <div className="space-y-6">
              {activeSection === "dashboard" ? (
                <div className="space-y-8">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <StatCard icon="group" label="Utilisateurs" value={stats.usersCount} />
                    <StatCard icon="receipt_long" label="Commandes" value={stats.ordersCount} />
                    <StatCard icon="rocket_launch" label="Contributions" value={stats.contributionsCount} />
                    <StatCard icon="euro" label="Chiffre d'affaires" value={`${stats.paidRevenue.toFixed(2)} €`} />
                  </div>

                  <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
                    <div className="rounded-2xl border border-[#e5e7eb] bg-white p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h2 className="text-2xl font-black">Campagne crowdfunding</h2>
                          <p className="text-sm text-[#6b7280]">Suivi des collectes et campagnes actives</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => void runNotificationsNow()}
                          className="rounded-lg bg-primary px-3 py-2 text-xs font-bold uppercase"
                        >
                          Exécuter notifications
                        </button>
                      </div>
                      <div className="mt-6 space-y-5">
                        {highlightedCampaign ? (
                          <div>
                            <div className="mb-2 flex items-center justify-between">
                              <span className="text-sm font-semibold text-[#181810]">{highlightedCampaign.title}</span>
                              <span className="text-xs text-[#6b7280]">
                                {Math.min(
                                  (highlightedCampaign.collected / highlightedCampaign.goal) * 100,
                                  100
                                ).toFixed(0)}%
                              </span>
                            </div>
                            <div className="h-2 rounded-full bg-[#f2f3f5]">
                              <div
                                className="h-2 rounded-full bg-primary"
                                style={{
                                  width: `${Math.min(
                                    (highlightedCampaign.collected / highlightedCampaign.goal) * 100,
                                    100
                                  )}%`
                                }}
                              />
                            </div>
                            <p className="text-xs text-[#6b7280] mt-2">
                              {highlightedCampaign.collected.toFixed(2)} € collectés / {highlightedCampaign.goal.toFixed(2)} € objectif
                            </p>
                          </div>
                        ) : (
                          <p className="text-sm text-[#6b7280]">Aucune campagne en cours.</p>
                        )}
                      </div>
                    </div>
                    <div className="rounded-2xl border border-[#e5e7eb] bg-white p-6">
                      <h2 className="text-2xl font-black">Statut contributions</h2>
                      <p className="text-sm text-[#6b7280]">Synthèse des contributions et des collectes</p>
                      <div className="mt-6 space-y-3 text-sm text-[#171717]">
                        <p>Total collecté: {stats.paidContributions.toFixed(2)} €</p>
                        <p>Campagnes suivies: {stats.campaignFunding.length}</p>
                        <p>Codes promo actifs: {promos.length}</p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-[#e5e7eb] bg-white p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-2xl font-black">Commandes récentes</h2>
                        <p className="text-sm text-[#6b7280]">
                          {pendingOrdersCount} commande(s) en attente — focus sur les 4 dernières commandes
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => void router.push("/admin/orders")}
                        className="text-xs font-bold text-[#6b7280] uppercase"
                      >
                        Voir tout
                      </button>
                    </div>
                    <div className="mt-4 overflow-x-auto">
                      <table className="w-full text-left text-sm">
                        <thead className="text-xs uppercase tracking-wider text-[#6b7280]">
                          <tr className="border-b border-[#eceff2]">
                            <th className="py-3">Commande</th>
                            <th className="py-3">Montant</th>
                            <th className="py-3">Type</th>
                            <th className="py-3">Statut</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#f2f4f7] text-sm">
                          {recentOrders.length ? (
                            recentOrders.map((order) => (
                              <tr key={order.id} className="hover:bg-[#f8f8f5]">
                                <td className="py-3 font-semibold">#{order.id.slice(-6)}</td>
                                <td className="py-3">{order.total.toFixed(2)} €</td>
                                <td className="py-3">{labelSaleType(order.saleType)}</td>
                                <td className="py-3 uppercase text-xs text-[#181810]">{labelOrderStatus(order.status)}</td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={4} className="py-6 text-center text-sm text-[#6b7280]">
                                Pas de commandes à afficher.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              ) : null}

              {(activeSection === "users") && (
                <Panel
                  title="Utilisateurs"
                  subtitle="Comptes, rôles et permissions"
                  actions={
                    <button
                      type="button"
                      onClick={() => void exportCsv("/api/admin/users", "users.csv")}
                      className="rounded border border-[#d8d7d0] px-3 py-1 text-xs font-semibold"
                    >
                      Exporter CSV
                    </button>
                  }
                >
                  <SearchBar
                    value={search.users}
                    onChange={(value) => {
                      setSearch((prev) => ({ ...prev, users: value }));
                      setPage((prev) => ({ ...prev, users: 1 }));
                    }}
                    placeholder="Rechercher nom, e-mail, rôle..."
                  />
                  <DataTable
                    headers={["Utilisateur", "E-mail", "Rôle", "Action"]}
                    rows={pagedUsers.items.map((user) => [
                      <div key={user.id} className="flex items-center gap-3">
                        <div className="size-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-black ring-1 ring-primary/30">
                          {user.name.slice(0, 2).toUpperCase()}
                        </div>
                        <span className="font-bold text-slate-800">{user.name}</span>
                      </div>,
                      <span key={`email-${user.id}`} className="text-slate-500 font-medium">{user.email}</span>,
                      <div key={`role-${user.id}`} className={`inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-widest ${user.role === 'admin' ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-50 text-slate-500'
                        }`}>
                        {labelUserRole(user.role)}
                      </div>,
                      <select
                        key={user.id}
                        className={`rounded border px-2 py-1 text-xs font-bold transition-all outline-none ${user.role === 'admin' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' : 'bg-slate-50 text-slate-700 border-slate-200'
                          }`}
                        value={user.role}
                        onChange={(event) => void updateUserRole(user.id, event.target.value as AdminUser["role"])}
                      >
                        {USER_ROLES.map((role) => (
                          <option key={role} value={role}>
                            {labelUserRole(role)}
                          </option>
                        ))}
                      </select>
                    ])}
                  />
                  <PaginationControls
                    page={page.users}
                    totalPages={pagedUsers.totalPages}
                    onChange={(nextPage) => setPage((prev) => ({ ...prev, users: nextPage }))}
                  />
                </Panel>
              )}

              {(activeSection === "orders") && (
                <Panel
                  id="orders-section"
                  title="Commandes"
                  subtitle="Historique et mise à jour des statuts"
                  actions={
                    <button
                      type="button"
                      onClick={() => void exportCsv("/api/admin/orders", "orders.csv")}
                      className="rounded border border-[#d8d7d0] px-3 py-1 text-xs font-semibold"
                    >
                      Exporter CSV
                    </button>
                  }
                >
                  <SearchBar
                    value={search.orders}
                    onChange={(value) => {
                      setSearch((prev) => ({ ...prev, orders: value }));
                      setPage((prev) => ({ ...prev, orders: 1 }));
                    }}
                    placeholder="Rechercher id, user, type, statut..."
                  />
                  <DataTable
                    headers={["Commande", "Utilisateur", "Montant", "Type", "Statut"]}
                    rows={pagedOrders.items.map((order) => [
                      <div key={order.id} className="flex flex-col">
                        <span className="font-bold text-slate-900 leading-none">#{order.id.slice(-8).toUpperCase()}</span>
                        <span className="text-[10px] text-slate-400 font-medium">ID: {order.id.slice(0, 8)}...</span>
                      </div>,
                      <div key={`user-${order.id}`} className="flex items-center gap-2">
                        <div className="size-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500 uppercase">
                          {order.userId.slice(0, 2)}
                        </div>
                        <span className="text-xs text-slate-600 font-medium">{order.userId.slice(0, 10)}...</span>
                      </div>,
                      <span key={`total-${order.id}`} className="font-black text-slate-900">{order.total.toFixed(2)} €</span>,
                      <div key={`type-${order.id}`} className={`inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-widest ${order.saleType === "direct" ? "bg-slate-100 text-slate-600" : "bg-amber-50 text-amber-600"
                        }`}>
                        {labelSaleType(order.saleType)}
                      </div>,
                      <select
                        key={order.id}
                        className={`rounded border border-slate-200 px-2 py-1 text-xs font-bold transition-all focus:ring-2 focus:ring-primary/20 outline-none ${order.status === 'paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                          order.status === 'cancelled' ? 'bg-red-50 text-red-700 border-red-100' :
                            'bg-slate-50 text-slate-700'
                          }`}
                        value={order.status}
                        onChange={(event) => void updateOrderStatus(order.id, event.target.value as AdminOrder["status"])}
                      >
                        {ORDER_STATUS.map((status) => (
                          <option key={status} value={status}>
                            {labelOrderStatus(status)}
                          </option>
                        ))}
                      </select>
                    ])}
                  />
                  <PaginationControls
                    page={page.orders}
                    totalPages={pagedOrders.totalPages}
                    onChange={(nextPage) => setPage((prev) => ({ ...prev, orders: nextPage }))}
                  />
                </Panel>
              )}

              {(activeSection === "contributions") && (
                <Panel
                  title="Contributions"
                  subtitle="Campagnes participatives et suivi des statuts"
                  actions={
                    <button
                      type="button"
                      onClick={() => void exportCsv("/api/admin/contributions", "contributions.csv")}
                      className="rounded border border-[#d8d7d0] px-3 py-1 text-xs font-semibold"
                    >
                      Exporter CSV
                    </button>
                  }
                >
                  <SearchBar
                    value={search.contributions}
                    onChange={(value) => {
                      setSearch((prev) => ({ ...prev, contributions: value }));
                      setPage((prev) => ({ ...prev, contributions: 1 }));
                    }}
                    placeholder="Rechercher id, livre, user, statut..."
                  />
                  <DataTable
                    headers={["Contribution", "Livre", "Auteur", "Don", "Statut"]}
                    rows={pagedContributions.items.map((contribution) => [
                      <div key={contribution.id} className="flex flex-col">
                        <span className="font-bold text-slate-900 leading-none">CONTRIB-{contribution.id.slice(-6).toUpperCase()}</span>
                        <span className="text-[10px] text-slate-400 font-medium">{contribution.id.slice(0, 8)}...</span>
                      </div>,
                      <span key={`book-${contribution.id}`} className="font-medium text-slate-700 text-xs truncate max-w-[120px] block">{contribution.bookId.slice(0, 10)}...</span>,
                      <span key={`user-${contribution.id}`} className="text-xs text-slate-500 font-medium">{contribution.userId ? contribution.userId.slice(0, 10) + '...' : "Anonyme"}</span>,
                      <span key={`amount-${contribution.id}`} className="font-black text-emerald-600">{contribution.amount.toFixed(2)} €</span>,
                      <select
                        key={contribution.id}
                        className={`rounded border border-slate-200 px-2 py-1 text-xs font-bold transition-all outline-none ${contribution.status === 'paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                          contribution.status === 'refunded' ? 'bg-slate-50 text-slate-500 border-slate-100' :
                            'bg-amber-50 text-amber-700 border-amber-100 text-amber-600'
                          }`}
                        value={contribution.status}
                        onChange={(event) =>
                          void updateContributionStatus(
                            contribution.id,
                            event.target.value as AdminContribution["status"]
                          )
                        }
                      >
                        {CONTRIBUTION_STATUS.map((status) => (
                          <option key={status} value={status}>
                            {labelContributionStatus(status)}
                          </option>
                        ))}
                      </select>
                    ])}
                  />
                  <PaginationControls
                    page={page.contributions}
                    totalPages={pagedContributions.totalPages}
                    onChange={(nextPage) =>
                      setPage((prev) => ({ ...prev, contributions: nextPage }))
                    }
                  />
                </Panel>
              )}

              {(activeSection === "payments") && (
                <Panel
                  title="Transactions Paiement"
                  subtitle="Traçabilité FedaPay/PayPal, paiements, remboursements, webhooks"
                >
                  <SearchBar
                    value={search.payments}
                    onChange={(value) => {
                      setSearch((prev) => ({ ...prev, payments: value }));
                      setPage((prev) => ({ ...prev, payments: 1 }));
                    }}
                    placeholder="Rechercher id, commande, provider, type, statut, référence..."
                  />
                  <div className="mb-3 flex flex-wrap gap-2">
                    <select
                      className="rounded border border-[#d8d7d0] px-3 py-2 text-sm"
                      value={paymentsProviderFilter}
                      onChange={(event) =>
                        setPaymentsProviderFilter(event.target.value as typeof paymentsProviderFilter)
                      }
                    >
                      <option value="all">Tous providers</option>
                      <option value="fedapay">FedaPay</option>
                      <option value="paypal">PayPal</option>
                    </select>
                    <select
                      className="rounded border border-[#d8d7d0] px-3 py-2 text-sm"
                      value={paymentsStatusFilter}
                      onChange={(event) =>
                        setPaymentsStatusFilter(event.target.value as typeof paymentsStatusFilter)
                      }
                    >
                      <option value="all">Tous statuts</option>
                      <option value="succeeded">Succès</option>
                      <option value="pending">En attente</option>
                      <option value="failed">Échec</option>
                    </select>
                  </div>
                  <DataTable
                    headers={["Date / Heure", "Type", "Réseau", "Utilisateur", "Commande", "Montant", "Statut"]}
                    rows={pagedPayments.items.map((tx) => [
                      <div key={tx.id} className="flex flex-col">
                        <span className="text-xs font-bold text-slate-700">
                          {tx.createdAt ? new Date(tx.createdAt).toLocaleDateString("fr-FR") : "-"}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {tx.createdAt ? new Date(tx.createdAt).toLocaleTimeString("fr-FR", { hour: '2-digit', minute: '2-digit' }) : ""}
                        </span>
                      </div>,
                      <div key={`kind-${tx.id}`} className={`inline-flex items-center rounded px-1.5 py-0.5 text-[9px] font-black uppercase tracking-tighter ${tx.kind === 'payment' ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-500'
                        }`}>
                        {tx.kind === "payment" ? "Paiement" : tx.kind === "refund" ? "Remboursement" : "Webhook"}
                      </div>,
                      <div key={`provider-${tx.id}`} className="flex items-center gap-1.5">
                        <div className={`size-1.5 rounded-full ${tx.provider === 'fedapay' ? 'bg-[#ff7b00]' : 'bg-[#003087]'}`} />
                        <span className="text-[10px] font-black uppercase text-slate-600">{tx.provider}</span>
                      </div>,
                      <div key={`user-${tx.id}`} className="flex flex-col">
                        <span className="text-[10px] font-bold text-slate-700">{tx.user?.name || "Anonyme"}</span>
                        <span className="text-[9px] text-slate-400">{tx.user?.email || (tx.userId ? tx.userId.slice(0, 8) : "-")}</span>
                      </div>,
                      <span key={`order-${tx.id}`} className="text-[10px] font-mono font-medium text-slate-400">{tx.orderId ? tx.orderId.slice(-10).toUpperCase() : "-"}</span>,
                      <span key={`amount-${tx.id}`} className="font-black text-slate-900">
                        {typeof tx.amount === "number" ? `${tx.amount.toFixed(2)} ${tx.currency ?? "EUR"}` : "-"}
                      </span>,
                      <div key={`status-${tx.id}`} className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-widest ${tx.status === "succeeded" ? "bg-emerald-50 text-emerald-700" :
                        tx.status === "pending" ? "bg-amber-50 text-amber-700" : "bg-red-50 text-red-700"
                        }`}>
                        <div className={`size-1 rounded-full ${tx.status === "succeeded" ? "bg-emerald-500" :
                          tx.status === "pending" ? "bg-amber-500" : "bg-red-500"
                          }`} />
                        {tx.status === "succeeded" ? "Succès" : tx.status === "pending" ? "En attente" : "Échec"}
                      </div>
                    ])}
                  />
                  <PaginationControls
                    page={page.payments}
                    totalPages={pagedPayments.totalPages}
                    onChange={(nextPage) => setPage((prev) => ({ ...prev, payments: nextPage }))}
                  />
                </Panel>
              )}

              {(activeSection === "ouvrages") && (
                <>
                  <Panel title="Ajouter un ouvrage" subtitle="Prépare les prochains titres">
                    <form className="grid grid-cols-1 gap-3 md:grid-cols-2" onSubmit={createBook}>
                      <input className="rounded border border-[#d8d7d0] px-3 py-2" placeholder="Titre" value={newBook.title} onChange={(event) => handleNewBookTitleChange(event.target.value)} required />
                      <input className="rounded border border-[#d8d7d0] px-3 py-2" placeholder="Slug (auto depuis le titre)" value={newBook.slug} onChange={(event) => handleNewBookSlugChange(event.target.value)} />
                      <input className="rounded border border-[#d8d7d0] px-3 py-2 md:col-span-2" placeholder="Sous-titre (optionnel)" value={newBook.subtitle} onChange={(event) => setNewBook((prev) => ({ ...prev, subtitle: event.target.value }))} />
                      <input className="rounded border border-[#d8d7d0] px-3 py-2" placeholder="Prix" type="number" min={0} step="0.01" value={newBook.price} onChange={(event) => setNewBook((prev) => ({ ...prev, price: event.target.value }))} required />
                      <select className="rounded border border-[#d8d7d0] px-3 py-2" value={newBook.saleType} onChange={(event) => setNewBook((prev) => ({ ...prev, saleType: event.target.value as "direct" | "preorder" | "crowdfunding" }))}>
                        <option value="direct">Achat direct</option>
                        <option value="preorder">Précommande</option>
                        <option value="crowdfunding">Financement participatif</option>
                      </select>
                      <input className="rounded border border-[#d8d7d0] px-3 py-2" placeholder="Date de sortie (YYYY-MM-DD)" type="date" value={newBook.releaseDate} onChange={(event) => setNewBook((prev) => ({ ...prev, releaseDate: event.target.value }))} />
                      <div className="md:col-span-2 space-y-2">
                        <label className="text-xs font-bold uppercase text-slate-500">Couverture de l'ouvrage</label>
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                          <div className="relative size-32 shrink-0 overflow-hidden rounded-lg border-2 border-dashed border-slate-200 bg-slate-50 flex items-center justify-center">
                            {coverPreview ? (
                              <img src={coverPreview} alt="Preview" className="h-full w-full object-cover" />
                            ) : (
                              <span className="material-symbols-outlined text-slate-300 text-3xl">image</span>
                            )}
                          </div>
                          <div className="flex-1 space-y-2">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleFileChange}
                              className="w-full text-xs text-slate-500 file:mr-4 file:rounded-full file:border-0 file:bg-primary file:px-4 file:py-2 file:text-xs file:font-bold file:text-black hover:file:bg-primary/80"
                            />
                            <p className="text-[10px] text-slate-400">PNG, JPG ou WEBP. Taille conseillée: 900x1350px.</p>
                          </div>
                        </div>
                      </div>
                      <textarea className="rounded border border-[#d8d7d0] px-3 py-2 md:col-span-2" placeholder="Description" value={newBook.description} onChange={(event) => setNewBook((prev) => ({ ...prev, description: event.target.value }))} required />
                      <input className="rounded border border-[#d8d7d0] px-3 py-2" placeholder="ISBN (optionnel)" value={newBook.isbn} onChange={(event) => setNewBook((prev) => ({ ...prev, isbn: event.target.value }))} />
                      <input className="rounded border border-[#d8d7d0] px-3 py-2" placeholder="Stock (achat direct/precommande)" type="number" min={0} required={newBook.saleType !== "crowdfunding"} value={newBook.stock} onChange={(event) => setNewBook((prev) => ({ ...prev, stock: event.target.value }))} />
                      <input className="rounded border border-[#d8d7d0] px-3 py-2" placeholder="Objectif financement (crowdfunding)" type="number" min={0} required={newBook.saleType === "crowdfunding"} value={newBook.fundingGoal} onChange={(event) => setNewBook((prev) => ({ ...prev, fundingGoal: event.target.value }))} />
                      <input className="rounded border border-[#d8d7d0] px-3 py-2" placeholder="Montant collecte (suivi)" type="number" min={0} value={newBook.fundingRaised} onChange={(event) => setNewBook((prev) => ({ ...prev, fundingRaised: event.target.value }))} />
                      <input className="rounded border border-[#d8d7d0] px-3 py-2 md:col-span-2" placeholder="Nombre de pages (optionnel)" type="number" min={1} value={newBook.pages} onChange={(event) => setNewBook((prev) => ({ ...prev, pages: event.target.value }))} />

                      <div className="md:col-span-2 space-y-3 rounded-lg border border-[#d8d7d0] bg-[#f8f8f5] p-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-bold">Avis statiques ({newBook.staticReviews.length}/4 max)</h3>
                          {newBook.staticReviews.length < 4 && (
                            <button
                              type="button"
                              onClick={() => {
                                setNewBook((prev) => ({
                                  ...prev,
                                  staticReviews: [
                                    ...prev.staticReviews,
                                    { id: Math.random().toString(36).slice(2), name: "", role: "", content: "", rating: 5 }
                                  ]
                                }));
                              }}
                              className="text-xs bg-primary px-2 py-1 rounded font-semibold text-black"
                            >
                              + Ajouter
                            </button>
                          )}
                        </div>

                        {newBook.staticReviews.map((review) => (
                          <div key={review.id} className="bg-white p-3 rounded border border-[#d8d7d0] space-y-2 shadow-sm">
                            <div className="grid grid-cols-2 gap-2">
                              <input
                                className="rounded border border-[#d8d7d0] px-2 py-1 text-sm focus:border-primary outline-none"
                                placeholder="Nom"
                                value={review.name}
                                onChange={(e) => {
                                  setNewBook((prev) => ({
                                    ...prev,
                                    staticReviews: prev.staticReviews.map((r) =>
                                      r.id === review.id ? { ...r, name: e.target.value } : r
                                    )
                                  }));
                                }}
                              />
                              <input
                                className="rounded border border-[#d8d7d0] px-2 py-1 text-sm focus:border-primary outline-none"
                                placeholder="Rôle (optionnel)"
                                value={review.role || ""}
                                onChange={(e) => {
                                  setNewBook((prev) => ({
                                    ...prev,
                                    staticReviews: prev.staticReviews.map((r) =>
                                      r.id === review.id ? { ...r, role: e.target.value } : r
                                    )
                                  }));
                                }}
                              />
                            </div>
                            <select
                              className="rounded border border-[#d8d7d0] px-2 py-1 text-sm w-full outline-none"
                              value={review.rating}
                              onChange={(e) => {
                                setNewBook((prev) => ({
                                  ...prev,
                                  staticReviews: prev.staticReviews.map((r) =>
                                    r.id === review.id ? { ...r, rating: Number(e.target.value) } : r
                                  )
                                }));
                              }}
                            >
                              <option value={1}>★☆☆☆☆ (1 étoile)</option>
                              <option value={2}>★★☆☆☆ (2 étoiles)</option>
                              <option value={3}>★★★☆☆ (3 étoiles)</option>
                              <option value={4}>★★★★☆ (4 étoiles)</option>
                              <option value={5}>★★★★★ (5 étoiles)</option>
                            </select>
                            <textarea
                              className="rounded border border-[#d8d7d0] px-2 py-1 text-sm w-full focus:border-primary outline-none"
                              placeholder="Texte de l'avis (min 2, max 1000)"
                              rows={2}
                              maxLength={1000}
                              value={review.content}
                              onChange={(e) => {
                                setNewBook((prev) => ({
                                  ...prev,
                                  staticReviews: prev.staticReviews.map((r) =>
                                    r.id === review.id ? { ...r, content: e.target.value } : r
                                  )
                                }));
                              }}
                            />
                            <div className="flex justify-end">
                              <button
                                type="button"
                                onClick={() => {
                                  setNewBook((prev) => ({
                                    ...prev,
                                    staticReviews: prev.staticReviews.filter((r) => r.id !== review.id)
                                  }));
                                }}
                                className="text-[10px] text-red-500 font-bold uppercase hover:underline"
                              >
                                Supprimer
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      <button
                        disabled={creatingBook}
                        className={`rounded-lg px-4 py-2 text-sm font-bold uppercase md:col-span-2 transition-all ${creatingBook ? 'bg-slate-300 cursor-not-allowed text-slate-500' : 'bg-primary text-black hover:bg-opacity-90 active:scale-95'}`}
                      >
                        {creatingBook ? (
                          <div className="flex items-center justify-center gap-2">
                            <span className="size-4 animate-spin rounded-full border-2 border-slate-400 border-t-transparent"></span>
                            Création en cours...
                          </div>
                        ) : "Créer ouvrage"}
                      </button>
                    </form>
                  </Panel>

                  <Panel title="Catalogue en ligne" subtitle="Stock, prix et collecte">
                    <SearchBar
                      value={search.ouvrages}
                      onChange={(value) => {
                        setSearch((prev) => ({ ...prev, ouvrages: value }));
                        setPage((prev) => ({ ...prev, ouvrages: 1 }));
                      }}
                      placeholder="Rechercher titre, slug, type..."
                    />
                    <DataTable
                      headers={["Ouvrage", "Type", "Prix", "Stock/Obj.", "Collecté", "Actions"]}
                      rows={pagedBooks.items.map((book) => [
                        <div key={book.id} className="flex items-center gap-4">
                          {book.slug ? (
                            <div className="h-14 w-10 shrink-0 border border-primary">
                              <BookCover
                                slug={book.slug}
                                coverImage={book.coverImage}
                                title={book.title}
                              />
                            </div>
                          ) : (
                            <div className="flex h-14 w-10 items-center justify-center rounded border border-slate-200 bg-slate-50 text-slate-300">
                              <span className="material-symbols-outlined text-lg">image</span>
                            </div>
                          )}
                          <div className="flex flex-col min-w-0">
                            <span className="font-bold text-slate-900 text-sm leading-tight truncate">{book.title}</span>
                            <span className="text-[10px] font-mono font-medium text-slate-400 tracking-tighter truncate">{book.slug}</span>
                          </div>
                        </div>,
                        <div key={`type-${book.id}`} className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest ${book.saleType === "direct" ? "bg-blue-50 text-blue-600 ring-1 ring-inset ring-blue-500/10" :
                          book.saleType === "preorder" ? "bg-amber-50 text-amber-600 ring-1 ring-inset ring-amber-500/10" :
                            "bg-emerald-50 text-emerald-600 ring-1 ring-inset ring-emerald-500/10"
                          }`}>
                          {labelSaleType(book.saleType)}
                        </div>,
                        <span key={`price-${book.id}`} className="font-black text-slate-900">{book.price.toFixed(2)} €</span>,
                        <div key={`stock-${book.id}`} className="flex flex-col">
                          <span className="text-sm font-bold text-slate-700">
                            {book.saleType === "crowdfunding" ? (book.fundingGoal ?? 0).toLocaleString() : (book.stock ?? 0).toLocaleString()}
                          </span>
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
                            {book.saleType === "crowdfunding" ? "Objectif" : "Unités"}
                          </span>
                        </div>,
                        <div key={`raised-${book.id}`} className="flex flex-col">
                          <span className={`text-sm font-black ${(book.fundingRaised ?? 0) > 0 ? "text-emerald-600" : "text-slate-400"}`}>
                            {(book.fundingRaised ?? 0).toLocaleString()} €
                          </span>
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Collecté</span>
                        </div>,
                        <div key={`actions-${book.id}`} className="flex items-center justify-end gap-2">
                          <Link
                            href={`/ouvrages/${book.slug}`}
                            className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white transition-all hover:bg-slate-50 hover:border-slate-300 shadow-sm"
                            title="Voir sur le site"
                            target="_blank"
                          >
                            <span className="material-symbols-outlined text-sm">visibility</span>
                          </Link>
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm("Supprimer cet ouvrage ?")) void deleteBook(book.id);
                            }}
                            className="flex h-8 w-8 items-center justify-center rounded-full border border-red-100 bg-white text-red-500 transition-all hover:bg-red-50 hover:border-red-200 shadow-sm"
                            title="Supprimer"
                          >
                            <span className="material-symbols-outlined text-sm">delete</span>
                          </button>
                        </div>
                      ])}
                    />
                    <PaginationControls
                      page={page.ouvrages}
                      totalPages={pagedBooks.totalPages}
                      onChange={(nextPage) => setPage((prev) => ({ ...prev, ouvrages: nextPage }))}
                    />
                  </Panel>
                </>
              )}

              {(activeSection === "marketing") && (
                <>
                  <Panel title="Créer un code promo" subtitle="Campagnes de fidélisation">
                    <form className="grid grid-cols-1 gap-3 md:grid-cols-3" onSubmit={createPromo}>
                      <input
                        className="rounded border border-[#d8d7d0] px-3 py-2"
                        placeholder="Code (ex: SENAME15)"
                        value={newPromo.code}
                        onChange={(event) =>
                          setNewPromo((prev) => ({ ...prev, code: event.target.value.toUpperCase() }))
                        }
                        required
                      />
                      <select
                        className="rounded border border-[#d8d7d0] px-3 py-2"
                        value={newPromo.type}
                        onChange={(event) =>
                          setNewPromo((prev) => ({
                            ...prev,
                            type: event.target.value as "percent" | "fixed"
                          }))
                        }
                      >
                        <option value="percent">Pourcentage</option>
                        <option value="fixed">Montant fixe</option>
                      </select>
                      <input
                        className="rounded border border-[#d8d7d0] px-3 py-2"
                        type="number"
                        min={0}
                        step="0.01"
                        placeholder="Valeur"
                        value={newPromo.value}
                        onChange={(event) =>
                          setNewPromo((prev) => ({ ...prev, value: event.target.value }))
                        }
                        required
                      />
                      <input
                        className="rounded border border-[#d8d7d0] px-3 py-2"
                        type="number"
                        min={0}
                        step="0.01"
                        placeholder="Minimum panier"
                        value={newPromo.minSubtotal}
                        onChange={(event) =>
                          setNewPromo((prev) => ({ ...prev, minSubtotal: event.target.value }))
                        }
                      />
                      <input
                        className="rounded border border-[#d8d7d0] px-3 py-2"
                        type="number"
                        min={0}
                        step="0.01"
                        placeholder="Plafond remise (optionnel)"
                        value={newPromo.maxDiscount}
                        onChange={(event) =>
                          setNewPromo((prev) => ({ ...prev, maxDiscount: event.target.value }))
                        }
                      />
                      <input
                        className="rounded border border-[#d8d7d0] px-3 py-2"
                        type="number"
                        min={1}
                        placeholder="Limite d'utilisation (optionnel)"
                        value={newPromo.usageLimit}
                        onChange={(event) =>
                          setNewPromo((prev) => ({ ...prev, usageLimit: event.target.value }))
                        }
                      />
                      <input
                        className="rounded border border-[#d8d7d0] px-3 py-2 md:col-span-2"
                        type="date"
                        value={newPromo.expiresAt}
                        onChange={(event) =>
                          setNewPromo((prev) => ({ ...prev, expiresAt: event.target.value }))
                        }
                      />
                      <button className="rounded-lg bg-primary px-4 py-2 text-sm font-bold uppercase">
                        Créer le code promo
                      </button>
                    </form>
                  </Panel>

                  <Panel title="Codes promo" subtitle="Actifs et statuts">
                    <SearchBar
                      value={search.promos}
                      onChange={(value) => {
                        setSearch((prev) => ({ ...prev, promos: value }));
                        setPage((prev) => ({ ...prev, promos: 1 }));
                      }}
                      placeholder="Rechercher code, type, statut..."
                    />
                    <DataTable
                      headers={["Code", "Type", "Valeur", "Usage", "Minimum", "Expiration", "Statut"]}
                      rows={pagedPromos.items.map((promo) => [
                        <span key={promo.id} className="font-mono font-black text-slate-900 bg-slate-100 px-2 py-1 rounded select-all tracking-wider">{promo.code}</span>,
                        <span key={`type-${promo.id}`} className="text-xs font-bold text-slate-500">{promo.type === "percent" ? "Pourcentage" : "Fixe"}</span>,
                        <span key={`val-${promo.id}`} className="font-black text-slate-900">{promo.type === "percent" ? `${promo.value}%` : `${promo.value.toFixed(2)} €`}</span>,
                        <div key={`usage-${promo.id}`} className="flex flex-col">
                          <span className="font-bold text-slate-700">{promo.usedCount}{promo.usageLimit ? ` / ${promo.usageLimit}` : ""}</span>
                          <div className="h-1 w-16 bg-slate-100 rounded-full mt-1 overflow-hidden">
                            <div className="h-full bg-primary" style={{ width: `${promo.usageLimit ? Math.min((promo.usedCount / promo.usageLimit) * 100, 100) : 0}%` }} />
                          </div>
                        </div>,
                        <span key={`min-${promo.id}`} className="font-medium text-slate-500">{promo.minSubtotal.toFixed(2)} €</span>,
                        <span key={`exp-${promo.id}`} className="text-xs text-slate-400 font-medium">{promo.expiresAt ? new Date(promo.expiresAt).toLocaleDateString("fr-FR") : "-"}</span>,
                        <button
                          key={promo.id}
                          type="button"
                          onClick={() => void togglePromoActive(promo)}
                          className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest transition-all ${promo.active
                            ? "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-500/20"
                            : "bg-slate-50 text-slate-400 ring-1 ring-slate-200"
                            }`}
                        >
                          {promo.active ? "Actif" : "Inactif"}
                        </button>
                      ])}
                    />
                    <PaginationControls
                      page={page.promos}
                      totalPages={pagedPromos.totalPages}
                      onChange={(nextPage) => setPage((prev) => ({ ...prev, promos: nextPage }))}
                    />
                  </Panel>
                </>
              )}

            </div>
          ) : null}
        </section>
      </div>
    </main>
  );
}

export default function AdminPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-[#f3f4f6]">
        <div className="flex items-center gap-3">
          <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-sm font-semibold text-[#6b7280] uppercase tracking-wide">Administration en chargement...</p>
        </div>
      </div>
    }>
      <AdminPageContent />
    </Suspense>
  );
}

function paginate<T>(items: T[], page: number, pageSize: number) {
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * pageSize;
  return {
    items: items.slice(start, start + pageSize),
    totalPages
  };
}

function SearchBar({
  value,
  onChange,
  placeholder
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <div className="mb-4">
      <input
        className="w-full rounded border border-[#d8d7d0] px-3 py-2 text-sm"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}

function PaginationControls({
  page,
  totalPages,
  onChange
}: {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}) {
  return (
    <div className="mt-4 flex items-center justify-end gap-3">
      <button
        onClick={() => onChange(Math.max(1, page - 1))}
        disabled={page <= 1}
        className="rounded border border-[#d8d7d0] px-3 py-1 text-xs font-semibold disabled:opacity-50"
      >
        Précédent
      </button>
      <span className="text-xs text-[#6b7280]">
        Page {page} / {totalPages}
      </span>
      <button
        onClick={() => onChange(Math.min(totalPages, page + 1))}
        disabled={page >= totalPages}
        className="rounded border border-[#d8d7d0] px-3 py-1 text-xs font-semibold disabled:opacity-50"
      >
        Suivant
      </button>
    </div>
  );
}

function labelSaleType(type: "direct" | "preorder" | "crowdfunding") {
  if (type === "direct") return "Achat direct";
  if (type === "preorder") return "Précommande";
  return "Financement participatif";
}

function labelOrderStatus(status: AdminOrder["status"]) {
  if (status === "pending") return "En attente";
  if (status === "paid") return "Payée";
  if (status === "cancelled") return "Annulée";
  return "Remboursée";
}

function labelContributionStatus(status: AdminContribution["status"]) {
  if (status === "pending") return "En attente";
  if (status === "paid") return "Payée";
  return "Remboursée";
}

function labelUserRole(role: AdminUser["role"]) {
  return role === "admin" ? "Administrateur" : "Client";
}

function StatCard({ icon, label, value }: { icon: string; label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-[#e5e7eb] bg-white p-5">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[#fff8b5]">
        <span className="material-symbols-outlined text-[20px]">{icon}</span>
      </div>
      <p className="text-sm text-[#6b7280]">{label}</p>
      <p className="mt-1 text-3xl font-black">{value}</p>
    </div>
  );
}

function Panel({
  title,
  subtitle,
  actions,
  id,
  children
}: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  id?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="rounded-2xl border border-[#e5e7eb] bg-white p-4 sm:p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-black sm:text-2xl">{title}</h2>
          {subtitle ? <p className="text-xs text-[#6b7280] sm:text-sm">{subtitle}</p> : null}
        </div>
        {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
      </div>
      {children}
    </section>
  );
}

function DataTable({
  headers,
  rows
}: {
  headers: string[];
  rows: Array<Array<React.ReactNode>>;
}) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200/50 bg-white shadow-sm">
      <table className="w-full min-w-[800px] text-sm">
        <thead>
          <tr className="border-b border-slate-100 bg-slate-50/50 text-left text-[11px] font-black uppercase tracking-widest text-slate-500">
            {headers.map((header, idx) => (
              <th key={header} className={`px-4 py-3.5 ${idx === headers.length - 1 ? 'text-right' : ''}`}>
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {rows.map((row, index) => (
            <tr key={index} className="transition-colors hover:bg-slate-50/30">
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} className={`px-4 py-4 align-middle ${cellIndex === row.length - 1 ? 'text-right' : ''}`}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function BookRow({
  book,
  onDelete,
  onUpdate
}: {
  book: AdminBook;
  onDelete: () => void;
  onUpdate: (
    bookId: string,
    patch: Partial<
      Pick<
        AdminBook,
        | "title"
        | "slug"
        | "subtitle"
        | "description"
        | "price"
        | "saleType"
        | "stock"
        | "fundingGoal"
        | "fundingRaised"
        | "releaseDate"
      >
    >
  ) => Promise<void>;
}) {
  const [title, setTitle] = useState(book.title);
  const [slug, setSlug] = useState(book.slug);
  const [subtitle, setSubtitle] = useState(book.subtitle ?? "");
  const [description, setDescription] = useState(book.description ?? "");
  const [price, setPrice] = useState(String(book.price));
  const [saleType, setSaleType] = useState(book.saleType);
  const [stock, setStock] = useState(book.stock === undefined ? "" : String(book.stock));
  const [fundingGoal, setFundingGoal] = useState(
    book.fundingGoal === undefined ? "" : String(book.fundingGoal)
  );
  const [fundingRaised, setFundingRaised] = useState(
    book.fundingRaised === undefined ? "" : String(book.fundingRaised)
  );
  const [releaseDate, setReleaseDate] = useState(
    book.releaseDate ? String(book.releaseDate).slice(0, 10) : ""
  );

  const percent =
    Number(fundingGoal) > 0
      ? Math.min((Number(fundingRaised || 0) / Number(fundingGoal)) * 100, 100)
      : 0;

  return (
    <div className="rounded-xl border border-[#eef0f3] p-4">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
        <p className="font-semibold">{book.slug}</p>
        <button onClick={onDelete} className="rounded-lg border border-red-200 px-3 py-1 text-xs text-red-700">
          Supprimer
        </button>
      </div>
      <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
        <input className="rounded border border-[#d8d7d0] px-2 py-1" value={title} onChange={(event) => setTitle(event.target.value)} />
        <input className="rounded border border-[#d8d7d0] px-2 py-1" value={slug} onChange={(event) => setSlug(event.target.value)} />
        <input className="rounded border border-[#d8d7d0] px-2 py-1 md:col-span-2" value={subtitle} onChange={(event) => setSubtitle(event.target.value)} placeholder="Sous-titre" />
        <textarea className="rounded border border-[#d8d7d0] px-2 py-1 md:col-span-2" value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Description" />
        <input className="rounded border border-[#d8d7d0] px-2 py-1" type="number" min={0} step="0.01" value={price} onChange={(event) => setPrice(event.target.value)} />
        <select className="rounded border border-[#d8d7d0] px-2 py-1" value={saleType} onChange={(event) => setSaleType(event.target.value as AdminBook["saleType"])}>
          <option value="direct">Achat direct</option>
          <option value="preorder">Précommande</option>
          <option value="crowdfunding">Financement participatif</option>
        </select>
        <input className="rounded border border-[#d8d7d0] px-2 py-1" type="number" min={0} value={stock} onChange={(event) => setStock(event.target.value)} />
        <input className="rounded border border-[#d8d7d0] px-2 py-1" type="number" min={0} value={fundingGoal} onChange={(event) => setFundingGoal(event.target.value)} placeholder="Objectif" />
        <input className="rounded border border-[#d8d7d0] px-2 py-1" type="number" min={0} value={fundingRaised} onChange={(event) => setFundingRaised(event.target.value)} placeholder="Collecte" />
        <input className="rounded border border-[#d8d7d0] px-2 py-1" type="date" value={releaseDate} onChange={(event) => setReleaseDate(event.target.value)} />
        {saleType === "crowdfunding" ? (
          <div className="md:col-span-2">
            <div className="mb-1 flex justify-between text-xs text-[#6b7280]">
              <span>Suivi collecte</span>
              <span>{percent.toFixed(0)}%</span>
            </div>
            <div className="h-2 rounded-full bg-[#eceff2]">
              <div className="h-2 rounded-full bg-primary" style={{ width: `${percent}%` }} />
            </div>
          </div>
        ) : null}
        <button
          onClick={() =>
            void onUpdate(book.id, {
              title,
              slug,
              subtitle: subtitle.trim() || undefined,
              description: description.trim() || undefined,
              price: Number(price),
              saleType,
              stock: stock ? Number(stock) : undefined,
              fundingGoal: fundingGoal ? Number(fundingGoal) : undefined,
              fundingRaised: fundingRaised ? Number(fundingRaised) : undefined,
              releaseDate: releaseDate || undefined
            })
          }
          className="rounded-lg bg-primary px-3 py-1 text-xs font-bold uppercase md:col-span-2"
        >
          Enregistrer
        </button>
      </div>
    </div>
  );
}
