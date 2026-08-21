"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Search, Globe, Link as LinkIcon, AlertTriangle, BarChart3,
  Plus, Pencil, Trash2, ExternalLink, RefreshCw, CheckCircle2,
  ArrowRight, X, Eye, EyeOff, ChevronRight, FileText
} from "lucide-react";
import api from "@/lib/api";
import { toast } from "react-hot-toast";

// ── Types ─────────────────────────────────────────────────────
interface SeoStats {
  totalPages: number;
  overrideCount: number;
  redirectCount: number;
  crawlErrors7d: number;
  totalCrawlErrors: number;
}
interface SeoPage {
  slug: string;
  title: string;
  priority: number;
  hasOverride: boolean;
  overrideTitle?: string;
  overrideDescription?: string;
}
interface MetadataOverride {
  id: string;
  slug: string;
  title?: string;
  description?: string;
  ogTitle?: string;
  ogDescription?: string;
  noIndex?: boolean;
  updatedAt: string;
  updatedBy: string;
}
interface Redirect {
  id: string;
  from: string;
  to: string;
  type: 301 | 302;
  hits: number;
  createdAt: string;
  createdBy: string;
}
interface CrawlError {
  id: string;
  path: string;
  referrer?: string;
  userAgent?: string;
  hits: number;
  firstSeen: string;
  lastSeen: string;
}

// ── Reusable Modal ────────────────────────────────────────────
function Modal({ title, open, onClose, children }: {
  title: string; open: boolean; onClose: () => void; children: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg border border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 space-y-4">{children}</div>
      </div>
    </div>
  );
}

function Input({ label, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</label>
      <input {...props} className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white dark:bg-slate-800 dark:border-slate-700 dark:text-white" />
    </div>
  );
}

function Textarea({ label, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</label>
      <textarea {...props} rows={3} className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white dark:bg-slate-800 dark:border-slate-700 dark:text-white resize-none" />
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────
export default function SeoDashboard() {
  const [stats, setStats] = useState<SeoStats | null>(null);
  const [pages, setPages] = useState<SeoPage[]>([]);
  const [overrides, setOverrides] = useState<MetadataOverride[]>([]);
  const [redirects, setRedirects] = useState<Redirect[]>([]);
  const [crawlErrors, setCrawlErrors] = useState<CrawlError[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Modal states
  const [overrideModal, setOverrideModal] = useState(false);
  const [redirectModal, setRedirectModal] = useState(false);
  const [editOverride, setEditOverride] = useState<MetadataOverride | null>(null);
  const [editRedirect, setEditRedirect] = useState<Redirect | null>(null);

  // Form state
  const [oForm, setOForm] = useState({ slug: "", title: "", description: "", ogTitle: "", ogDescription: "", noIndex: false });
  const [rForm, setRForm] = useState({ from: "", to: "", type: "301" });

  // ── Fetch ────────────────────────────────────────────────────
  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [s, p, o, r, c] = await Promise.all([
        api.get("/seo/stats"),
        api.get("/seo/pages"),
        api.get("/seo/overrides"),
        api.get("/seo/redirects"),
        api.get("/seo/crawl-errors"),
      ]);
      setStats(s.data.data);
      setPages(p.data.data);
      setOverrides(o.data.data);
      setRedirects(r.data.data);
      setCrawlErrors(c.data.data);
    } catch {
      toast.error("Failed to load SEO data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ── Override CRUD ─────────────────────────────────────────────
  const openNewOverride = (prefillSlug?: string) => {
    setEditOverride(null);
    setOForm({ slug: prefillSlug || "", title: "", description: "", ogTitle: "", ogDescription: "", noIndex: false });
    setOverrideModal(true);
  };
  const openEditOverride = (o: MetadataOverride) => {
    setEditOverride(o);
    setOForm({ slug: o.slug, title: o.title || "", description: o.description || "", ogTitle: o.ogTitle || "", ogDescription: o.ogDescription || "", noIndex: o.noIndex || false });
    setOverrideModal(true);
  };
  const saveOverride = async () => {
    try {
      if (editOverride) {
        await api.put(`/seo/overrides/${editOverride.id}`, oForm);
        toast.success("Override updated");
      } else {
        await api.post("/seo/overrides", oForm);
        toast.success("Override created");
      }
      setOverrideModal(false);
      fetchAll();
    } catch (e: any) {
      toast.error(e.response?.data?.error || "Failed to save");
    }
  };
  const deleteOverride = async (id: string) => {
    if (!confirm("Delete this override?")) return;
    await api.delete(`/seo/overrides/${id}`);
    toast.success("Override deleted");
    fetchAll();
  };

  // ── Redirect CRUD ─────────────────────────────────────────────
  const openNewRedirect = (prefillFrom?: string) => {
    setEditRedirect(null);
    setRForm({ from: prefillFrom || "", to: "", type: "301" });
    setRedirectModal(true);
  };
  const openEditRedirect = (r: Redirect) => {
    setEditRedirect(r);
    setRForm({ from: r.from, to: r.to, type: String(r.type) });
    setRedirectModal(true);
  };
  const saveRedirect = async () => {
    try {
      if (editRedirect) {
        await api.put(`/seo/redirects/${editRedirect.id}`, rForm);
        toast.success("Redirect updated");
      } else {
        await api.post("/seo/redirects", rForm);
        toast.success("Redirect created");
      }
      setRedirectModal(false);
      fetchAll();
    } catch (e: any) {
      toast.error(e.response?.data?.error || "Failed to save");
    }
  };
  const deleteRedirect = async (id: string) => {
    if (!confirm("Delete this redirect?")) return;
    await api.delete(`/seo/redirects/${id}`);
    toast.success("Redirect deleted");
    fetchAll();
  };

  // ── Crawl Errors ──────────────────────────────────────────────
  const dismissError = async (id: string) => {
    await api.delete(`/seo/crawl-errors/${id}`);
    fetchAll();
  };
  const clearAllErrors = async () => {
    if (!confirm("Clear ALL crawl errors?")) return;
    await api.delete("/seo/crawl-errors");
    toast.success("All cleared");
    fetchAll();
  };

  const filteredPages = pages.filter(p =>
    p.slug.includes(search) || p.title.toLowerCase().includes(search.toLowerCase())
  );

  // ── Stats Cards ───────────────────────────────────────────────
  const statCards = stats ? [
    { label: "Indexed Pages", value: stats.totalPages, icon: Globe, color: "text-sky-500", bg: "bg-sky-50", note: "All sitemap entries" },
    { label: "Metadata Overrides", value: stats.overrideCount, icon: FileText, color: "text-purple-500", bg: "bg-purple-50", note: "Manual title/desc overrides" },
    { label: "301/302 Redirects", value: stats.redirectCount, icon: LinkIcon, color: "text-green-500", bg: "bg-green-50", note: "Active redirect rules" },
    { label: "404 Errors (7d)", value: stats.crawlErrors7d, icon: AlertTriangle, color: stats.crawlErrors7d > 0 ? "text-red-500" : "text-green-500", bg: stats.crawlErrors7d > 0 ? "bg-red-50" : "bg-green-50", note: stats.crawlErrors7d > 0 ? "Needs attention" : "All clean" },
  ] : [];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">SEO Manager</h1>
          <p className="text-sm text-muted-foreground mt-1">Live metadata overrides, redirect rules, and crawl error monitoring.</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchAll} disabled={loading} className="gap-2">
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6 h-20 bg-slate-100 rounded-xl" />
            </Card>
          ))
        ) : statCards.map((s, i) => (
          <Card key={i} className="border-0 shadow-sm">
            <CardContent className="p-5 flex items-center gap-4">
              <div className={`w-11 h-11 rounded-xl ${s.bg} flex items-center justify-center flex-shrink-0`}>
                <s.icon className={`w-5 h-5 ${s.color}`} />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900 dark:text-white">{s.value}</div>
                <div className="text-xs text-slate-500">{s.label}</div>
                <div className="text-xs text-slate-400">{s.note}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="pages" className="space-y-4">
        <TabsList className="bg-slate-100 dark:bg-slate-800 rounded-xl p-1 h-auto gap-1">
          {[
            { value: "pages", label: `All Pages (${pages.length})` },
            { value: "overrides", label: `Overrides (${overrides.length})` },
            { value: "redirects", label: `Redirects (${redirects.length})` },
            { value: "crawl", label: `404 Errors (${crawlErrors.length})` },
          ].map(t => (
            <TabsTrigger key={t.value} value={t.value} className="rounded-lg text-sm px-4 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* ── ALL PAGES TAB ──────────────────────────────── */}
        <TabsContent value="pages">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">All SEO Pages</CardTitle>
                  <CardDescription>All sitemap pages. Click to add or edit a metadata override.</CardDescription>
                </div>
                <div className="relative w-64">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search pages..."
                    className="pl-9 h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="border rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b text-slate-500 text-xs uppercase tracking-wide">
                      <th className="text-left px-4 py-3 font-medium">Page</th>
                      <th className="text-left px-4 py-3 font-medium">Priority</th>
                      <th className="text-left px-4 py-3 font-medium">Override</th>
                      <th className="text-right px-4 py-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredPages.map(page => (
                      <tr key={page.slug} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="font-medium text-slate-800">{page.title}</div>
                          <div className="text-xs text-slate-400 font-mono">{page.slug}</div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-bold ${page.priority >= 0.9 ? 'text-green-600' : page.priority >= 0.7 ? 'text-sky-600' : 'text-slate-500'}`}>
                            {page.priority.toFixed(1)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {page.hasOverride ? (
                            <Badge className="bg-purple-100 text-purple-700 border-0 text-xs">
                              <CheckCircle2 className="w-3 h-3 mr-1" /> Override Active
                            </Badge>
                          ) : (
                            <span className="text-xs text-slate-400">Auto-generated</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <a href={page.slug.startsWith('/') ? page.slug : `/${page.slug}`} target="_blank" rel="noopener noreferrer">
                              <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-slate-400 hover:text-sky-600">
                                <ExternalLink className="w-3.5 h-3.5" />
                              </Button>
                            </a>
                            <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-slate-600 hover:text-purple-700"
                              onClick={() => openNewOverride(page.slug)}>
                              <Pencil className="w-3 h-3 mr-1" />
                              {page.hasOverride ? "Edit Override" : "Add Override"}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredPages.length === 0 && (
                  <div className="py-12 text-center text-slate-400 text-sm">No pages match your search.</div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── OVERRIDES TAB ─────────────────────────────── */}
        <TabsContent value="overrides">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">Metadata Overrides</CardTitle>
                  <CardDescription>Manually override auto-generated titles, descriptions, and OG tags for any page.</CardDescription>
                </div>
                <Button size="sm" onClick={() => openNewOverride()} className="gap-2 bg-sky-600 hover:bg-sky-700">
                  <Plus className="w-4 h-4" /> Add Override
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {overrides.length === 0 ? (
                <div className="border-2 border-dashed border-slate-200 rounded-xl py-16 text-center">
                  <FileText className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500 font-medium">No overrides configured</p>
                  <p className="text-slate-400 text-sm mt-1">All pages are using their auto-generated metadata.</p>
                  <Button size="sm" onClick={() => openNewOverride()} className="mt-4 gap-2">
                    <Plus className="w-4 h-4" /> Create First Override
                  </Button>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 border rounded-xl overflow-hidden">
                  {overrides.map(o => (
                    <div key={o.id} className="p-4 hover:bg-slate-50 transition-colors">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-mono text-sm font-bold text-sky-700">{o.slug}</span>
                            {o.noIndex && <Badge className="bg-red-100 text-red-600 border-0 text-xs"><EyeOff className="w-3 h-3 mr-1" />noindex</Badge>}
                          </div>
                          {o.title && <p className="text-sm font-medium text-slate-800 truncate">{o.title}</p>}
                          {o.description && <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{o.description}</p>}
                          <p className="text-xs text-slate-400 mt-1">Updated {new Date(o.updatedAt).toLocaleDateString()} by {o.updatedBy}</p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Button variant="ghost" size="sm" onClick={() => openEditOverride(o)} className="h-8 gap-1.5 text-slate-600">
                            <Pencil className="w-3.5 h-3.5" /> Edit
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => deleteOverride(o.id)} className="h-8 text-red-500 hover:text-red-700 hover:bg-red-50">
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── REDIRECTS TAB ─────────────────────────────── */}
        <TabsContent value="redirects">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">Redirect Manager</CardTitle>
                  <CardDescription>Manage permanent (301) and temporary (302) URL redirections to preserve link equity.</CardDescription>
                </div>
                <Button size="sm" onClick={() => openNewRedirect()} className="gap-2 bg-sky-600 hover:bg-sky-700">
                  <Plus className="w-4 h-4" /> Create Redirect
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {redirects.length === 0 ? (
                <div className="border-2 border-dashed border-slate-200 rounded-xl py-16 text-center">
                  <LinkIcon className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500 font-medium">No redirect rules</p>
                  <p className="text-slate-400 text-sm mt-1">Add 301/302 rules to safely change URLs without losing SEO equity.</p>
                  <Button size="sm" onClick={() => openNewRedirect()} className="mt-4 gap-2">
                    <Plus className="w-4 h-4" /> Create Redirect
                  </Button>
                </div>
              ) : (
                <div className="border rounded-xl overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50 border-b text-slate-500 text-xs uppercase tracking-wide">
                        <th className="text-left px-4 py-3 font-medium">From</th>
                        <th className="px-2 py-3"></th>
                        <th className="text-left px-4 py-3 font-medium">To</th>
                        <th className="text-center px-4 py-3 font-medium">Type</th>
                        <th className="text-center px-4 py-3 font-medium">Hits</th>
                        <th className="text-right px-4 py-3 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {redirects.map(r => (
                        <tr key={r.id} className="hover:bg-slate-50">
                          <td className="px-4 py-3 font-mono text-sky-700 text-xs">{r.from}</td>
                          <td className="px-2 py-3"><ArrowRight className="w-4 h-4 text-slate-400" /></td>
                          <td className="px-4 py-3 font-mono text-slate-700 text-xs">{r.to}</td>
                          <td className="px-4 py-3 text-center">
                            <Badge className={`text-xs border-0 ${r.type === 301 ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                              {r.type}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-center text-slate-600 font-medium">{r.hits}</td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex justify-end gap-1">
                              <Button variant="ghost" size="sm" onClick={() => openEditRedirect(r)} className="h-7 w-7 p-0">
                                <Pencil className="w-3.5 h-3.5" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => deleteRedirect(r.id)} className="h-7 w-7 p-0 text-red-500 hover:text-red-700">
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── CRAWL ERRORS TAB ──────────────────────────── */}
        <TabsContent value="crawl">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">404 Crawl Error Log</CardTitle>
                  <CardDescription>URLs returning 404 — hit by users or bots. Fix or create a redirect for high-traffic 404s.</CardDescription>
                </div>
                {crawlErrors.length > 0 && (
                  <Button size="sm" variant="outline" onClick={clearAllErrors} className="gap-2 text-red-500 border-red-200 hover:bg-red-50">
                    <Trash2 className="w-4 h-4" /> Clear All
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {crawlErrors.length === 0 ? (
                <div className="border-2 border-dashed border-green-100 rounded-xl py-16 text-center bg-green-50/30">
                  <CheckCircle2 className="w-8 h-8 text-green-500 mx-auto mb-3" />
                  <p className="text-green-700 font-medium">No 404 errors detected</p>
                  <p className="text-green-600 text-sm mt-1">All crawled URLs are resolving correctly.</p>
                </div>
              ) : (
                <div className="border rounded-xl overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50 border-b text-slate-500 text-xs uppercase tracking-wide">
                        <th className="text-left px-4 py-3 font-medium">Path</th>
                        <th className="text-left px-4 py-3 font-medium">Referrer</th>
                        <th className="text-center px-4 py-3 font-medium">Hits</th>
                        <th className="text-left px-4 py-3 font-medium">Last Seen</th>
                        <th className="text-right px-4 py-3 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {crawlErrors.map(e => (
                        <tr key={e.id} className="hover:bg-slate-50">
                          <td className="px-4 py-3">
                            <span className="font-mono text-red-600 text-xs font-bold">{e.path}</span>
                          </td>
                          <td className="px-4 py-3 text-slate-500 text-xs truncate max-w-[200px]">
                            {e.referrer || <span className="text-slate-300">—</span>}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <Badge className={`text-xs border-0 ${e.hits > 10 ? 'bg-red-100 text-red-700' : e.hits > 3 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>
                              {e.hits}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-slate-500 text-xs">
                            {new Date(e.lastSeen).toLocaleString()}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex justify-end gap-1">
                              <Button variant="ghost" size="sm" onClick={() => openNewRedirect(e.path)} className="h-7 px-2 text-xs text-sky-600 hover:text-sky-800">
                                <LinkIcon className="w-3 h-3 mr-1" /> Fix
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => dismissError(e.id)} className="h-7 w-7 p-0 text-slate-400 hover:text-red-500">
                                <X className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ── Override Modal ──────────────────────────────── */}
      <Modal title={editOverride ? "Edit Metadata Override" : "Add Metadata Override"} open={overrideModal} onClose={() => setOverrideModal(false)}>
        <Input label="Page Slug (e.g. /freshers-jobs)" placeholder="/your-page-slug" value={oForm.slug}
          onChange={e => setOForm(f => ({ ...f, slug: e.target.value }))} disabled={!!editOverride} />
        <Input label="Title Tag" placeholder="Page Title | Techwell" value={oForm.title}
          onChange={e => setOForm(f => ({ ...f, title: e.target.value }))} />
        <Textarea label="Meta Description" placeholder="A concise, compelling description (150–160 chars)." value={oForm.description}
          onChange={e => setOForm(f => ({ ...f, description: e.target.value }))} />
        <Input label="OG Title (Social)" placeholder="Social share title" value={oForm.ogTitle}
          onChange={e => setOForm(f => ({ ...f, ogTitle: e.target.value }))} />
        <Textarea label="OG Description (Social)" placeholder="Social share description." value={oForm.ogDescription}
          onChange={e => setOForm(f => ({ ...f, ogDescription: e.target.value }))} />
        <label className="flex items-center gap-3 cursor-pointer select-none">
          <input type="checkbox" checked={oForm.noIndex} onChange={e => setOForm(f => ({ ...f, noIndex: e.target.checked }))}
            className="w-4 h-4 rounded" />
          <span className="text-sm text-slate-700">Exclude from search (noindex, nofollow)</span>
        </label>
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="outline" onClick={() => setOverrideModal(false)}>Cancel</Button>
          <Button onClick={saveOverride} className="bg-sky-600 hover:bg-sky-700">Save Override</Button>
        </div>
      </Modal>

      {/* ── Redirect Modal ──────────────────────────────── */}
      <Modal title={editRedirect ? "Edit Redirect" : "Create Redirect Rule"} open={redirectModal} onClose={() => setRedirectModal(false)}>
        <Input label="From (old URL path)" placeholder="/old-page-url" value={rForm.from}
          onChange={e => setRForm(f => ({ ...f, from: e.target.value }))} />
        <Input label="To (destination URL or path)" placeholder="/new-page or https://..." value={rForm.to}
          onChange={e => setRForm(f => ({ ...f, to: e.target.value }))} />
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Redirect Type</label>
          <div className="grid grid-cols-2 gap-3">
            {["301", "302"].map(type => (
              <button key={type} onClick={() => setRForm(f => ({ ...f, type }))}
                className={`p-3 rounded-lg border text-sm font-semibold transition-colors ${rForm.type === type ? 'border-sky-500 bg-sky-50 text-sky-700' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}>
                {type} — {type === "301" ? "Permanent" : "Temporary"}
              </button>
            ))}
          </div>
          <p className="text-xs text-slate-400">Use 301 for permanent URL changes (passes SEO equity). Use 302 for temporary redirects.</p>
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="outline" onClick={() => setRedirectModal(false)}>Cancel</Button>
          <Button onClick={saveRedirect} className="bg-sky-600 hover:bg-sky-700">Save Redirect</Button>
        </div>
      </Modal>
    </div>
  );
}
