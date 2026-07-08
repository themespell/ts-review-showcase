import { useEffect, useMemo, useRef, useState } from "react";
import { deleteData } from "../services/deleteData";
import { duplicateData } from "../services/duplicateData.js";
import { fetchData } from "../services/fetchData";
import { toastNotification } from "../utils/toastNotification.js";
import {
  AlertTriangle,
  Brush,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Copy,
  Ellipsis,
  FilePenLine,
  Search,
  Sparkles,
  Trash2,
} from "lucide-react";
import { getTranslations } from "../utils/translations.js";

import commonStore from "../states/commonStore.js";
import TsButton from "./controls/TsButton.jsx";
import { TsModal } from "./controls/tsControls.js";

function DataTable({ type, title, editor }) {
  const translations = getTranslations();
  const [data, setData] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [openMenuId, setOpenMenuId] = useState(null);
  const [copiedValue, setCopiedValue] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const menuRef = useRef(null);
  const pageSize = 10;

  const isPro = window.tsreview_settings?.is_pro || false;
  const isLicenseInactive = window.tsTeamPro?.is_licence_inactive || false;
  const canDuplicate = isPro && !isLicenseInactive;

  const { saveSettings, updateModal, reloadData } = commonStore((state) => ({
    saveSettings: state.saveSettings,
    updateModal: state.updateModal,
    reloadData: state.reloadData,
  }));

  useEffect(() => {
    setLoading(true);
    fetchData(`tsreview/${type}/fetch`, (response) => {
      if (response?.success) {
        const showcaseData = response.data.map((item) => ({
          key: item.post_id,
          ...item,
        }));

        setData(showcaseData);
      } else {
        console.error("Error fetching showcases:", response);
      }
      setLoading(false);
    });
  }, [type, reloadData]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenuId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!copiedValue) {
      return undefined;
    }

    const timeout = window.setTimeout(() => setCopiedValue(""), 1500);
    return () => window.clearTimeout(timeout);
  }, [copiedValue]);

  const normalizedData = useMemo(() => data.map((item) => ({
    ...item,
    title: item.title || item.name || `${title} #${item.key}`,
    shortcode: item.shortcode || `[ts_review_showcase id="${item.key}"]`,
    snippet: item.snippet || `<?php echo do_shortcode('[ts_review_showcase id="${item.key}"]'); ?>`,
    reviews: item.reviews || item.review_count || item.count || 0,
    updated: item.updated || item.modified || item.date || item.created_at || "",
    status: String(item.status || item.post_status || "published").toLowerCase(),
  })), [data, title]);

  const filteredData = useMemo(() => normalizedData.filter((item) => {
    const searchable = [item.title, item.shortcode, item.snippet, item.updated]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    const matchesSearch = searchable.includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || item.status === statusFilter;

    return matchesSearch && matchesStatus;
  }), [normalizedData, searchTerm, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedData = filteredData.slice(startIndex, startIndex + pageSize);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, reloadData]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const statusOptions = useMemo(() => {
    const options = Array.from(new Set(normalizedData.map((item) => item.status).filter(Boolean)));
    return ["all", ...options];
  }, [normalizedData]);

  const handleDelete = (post_id) => {
    setDeleteId(post_id);
    setDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    deleteData(`tsreview/${type}/delete`, deleteId)
      .then((response) => {
        if (response.success) {
          toastNotification("success", `${title} Deleted`, `The ${title} has been successfully deleted.`);
          setData((prevData) => prevData.filter((item) => item.key !== deleteId));
          setDeleteModalOpen(false);
        } else {
          toastNotification("error", "Error", `There was an error deleting the ${title}.`);
        }
      })
      .catch((error) => {
        toastNotification("error", "Error", `There was an error deleting the ${error}.`);
      });
  };

  const handleDuplicate = (post_id) => {
    duplicateData(`tsreview/${type}/duplicate`, post_id)
      .then((response) => {
        if (response.success) {
          toastNotification("success", `${title} Duplicated`, `The ${title} has been successfully duplicated.`);
          saveSettings("reloadData", !reloadData);
        } else {
          toastNotification("error", "Error", `There was an error duplicating the ${title}.`);
        }
      })
      .catch(() => {
        toastNotification("error", "Error", `There was an error duplicating the ${title}.`);
      });
  };

  const handleProFeature = () => {
    toastNotification("info", "Pro Feature", "Duplicate showcase available in Pro version.");
    window.open("https://themespell.com/ts-review-showcase", "_blank", "noopener,noreferrer");
  };

  const handleEdit = (post_id) => {
    setSelectedPost(post_id);
    saveSettings("updateModal", true);
  };

  const closeModal = () => {
    saveSettings("updateModal", false);
    setSelectedPost(null);
  };

  const handleEditor = (post_id, currentType) => {
    let currentUrl = window.location.href;
    if (currentUrl.includes("?")) {
      currentUrl += `&path=editor&type=${currentType}&post_id=${post_id}`;
    } else {
      currentUrl += `?path=editor&type=${currentType}&post_id=${post_id}`;
    }
    window.location.href = currentUrl;
  };

  const handleCopy = async (value) => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(value);
      } else {
        const input = document.createElement("textarea");
        input.value = value;
        document.body.appendChild(input);
        input.select();
        document.execCommand("copy");
        document.body.removeChild(input);
      }

      setCopiedValue(value);
      toastNotification("success", "Copied", "Value copied to clipboard.");
    } catch {
      toastNotification("error", "Copy failed", "Unable to copy value to clipboard.");
    }
  };

  const renderStatus = (status) => {
    const isPublished = status === "published";
    const classes = isPublished ? "bg-success/10 text-success" : "bg-warning/10 text-warning";

    return (
      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize ${classes}`}>
        {isPublished ? <Check className="h-3 w-3" /> : <Clock3 className="h-3 w-3" />}
        {status}
      </span>
    );
  };

  const compactCode = (value, limit = 34) => (
    value.length > limit ? `${value.slice(0, limit)}...` : value
  );

  const formatRelativeTime = (value) => {
    if (!value) {
      return "Recently";
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return value;
    }

    const diffMs = Date.now() - date.getTime();
    const diffMinutes = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMinutes < 1) {
      return "Just now";
    }
    if (diffMinutes < 60) {
      return `${diffMinutes}m ago`;
    }
    if (diffHours < 24) {
      return `${diffHours}h ago`;
    }
    if (diffDays < 7) {
      return `${diffDays}d ago`;
    }

    return date.toLocaleDateString();
  };

  return (
    <div className="max-w-full overflow-x-hidden rounded-[28px]">
      <div className="flex flex-wrap items-center gap-3 border-b border-border p-4 sm:p-5">
        <div className="relative min-w-[220px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search showcases..."
            className="w-full rounded-lg border border-border bg-background py-2 pl-9 pr-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
          />
        </div>

        <div className="relative">
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="appearance-none rounded-lg border border-border bg-background px-3 py-2 pr-9 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
          >
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {status === "all" ? "All statuses" : status.charAt(0).toUpperCase() + status.slice(1)}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        </div>
      </div>

      {loading ? (
        <div className="space-y-3 p-5">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={`loading-${index}`} className="h-16 animate-pulse rounded-2xl bg-muted/60" />
          ))}
        </div>
      ) : (
        <>
          <div>
            <table className="w-full table-fixed text-sm">
              <colgroup>
                <col style={{ width: '24%' }} />
                <col style={{ width: '34%' }} />
                <col style={{ width: '8%' }} />
                <col style={{ width: '14%' }} />
                <col style={{ width: '12%' }} />
                <col style={{ width: '8%' }} />
              </colgroup>
              <thead>
                <tr className="border-b border-border bg-muted/20 text-left text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                  <th className="px-5 py-3">{translations.title || "Title"}</th>
                  <th className="px-5 py-3">Embed</th>
                  <th className="px-5 py-3">Reviews</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Updated</th>
                  <th className="px-5 py-3 text-right">{translations.action || "Action"}</th>
                </tr>
              </thead>

              <tbody>
                {paginatedData.length ? paginatedData.map((record) => (
                  <tr key={record.key} className="border-b border-border/60 transition hover:bg-muted/30">
                    <td className="max-w-0 px-5 py-3 align-middle">
                      <div className="flex items-center gap-3">
                        <span className="grid h-8 w-8 place-items-center rounded-xl bg-primary/10 text-primary">
                          <Sparkles className="h-3.5 w-3.5" />
                        </span>
                        <div>
                          <div className="font-semibold text-foreground">{record.title}</div>
                          <div className="text-xs text-muted-foreground">ID #{record.key}</div>
                        </div>
                      </div>
                    </td>

                    <td className="max-w-0 px-5 py-3 align-middle">
                      <div className="space-y-2">
                        <button
                          type="button"
                          onClick={() => handleCopy(record.shortcode)}
                          className="tsreview-code-chip group"
                          title={record.shortcode}
                        >
                          <span className="tsreview-code-chip__label">Shortcode</span>
                          <span className="min-w-0 truncate">{compactCode(record.shortcode, 26)}</span>
                          {copiedValue === record.shortcode ? (
                            <Check className="h-3.5 w-3.5 shrink-0 text-primary" />
                          ) : (
                            <Copy className="h-3.5 w-3.5 shrink-0 text-muted-foreground transition group-hover:text-primary" />
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleCopy(record.snippet)}
                          className="tsreview-code-chip group"
                          title={record.snippet}
                        >
                          <span className="tsreview-code-chip__label">PHP</span>
                          <span className="min-w-0 truncate">{compactCode(record.snippet, 34)}</span>
                          {copiedValue === record.snippet ? (
                            <Check className="h-3.5 w-3.5 shrink-0 text-primary" />
                          ) : (
                            <Copy className="h-3.5 w-3.5 shrink-0 text-muted-foreground transition group-hover:text-primary" />
                          )}
                        </button>
                      </div>
                    </td>

                    <td className="px-5 py-3 align-middle font-semibold text-foreground">{record.reviews}</td>
                    <td className="px-5 py-3 align-middle">{renderStatus(record.status)}</td>
                    <td className="px-5 py-3 align-middle text-muted-foreground">{formatRelativeTime(record.updated)}</td>

                    <td className="px-5 py-3 align-middle text-right">
                      <div className="relative inline-flex" ref={openMenuId === record.key ? menuRef : null}>
                        <button
                          type="button"
                          onClick={() => setOpenMenuId(openMenuId === record.key ? null : record.key)}
                          className="grid h-8 w-8 place-items-center rounded-xl border border-transparent text-muted-foreground transition hover:border-border hover:bg-muted hover:text-foreground"
                        >
                          <Ellipsis className="h-4 w-4" />
                        </button>

                        {openMenuId === record.key ? (
                          <div className="absolute bottom-full right-0 z-20 mb-2 w-56 rounded-2xl border border-border bg-card p-2 shadow-[var(--shadow-soft)]">
                            <button type="button" onClick={() => { setOpenMenuId(null); handleEdit(record.key); }} className="tsreview-action-item">
                              <FilePenLine className="h-4 w-4" />
                              {translations.edit}
                            </button>

                            {editor ? (
                              <button type="button" onClick={() => { setOpenMenuId(null); handleEditor(record.key, type); }} className="tsreview-action-item">
                                <Brush className="h-4 w-4" />
                                {translations.editDesign}
                              </button>
                            ) : null}

                            <button
                              type="button"
                              onClick={() => {
                                setOpenMenuId(null);
                                if (canDuplicate) {
                                  handleDuplicate(record.key);
                                } else {
                                  handleProFeature();
                                }
                              }}
                              className="tsreview-action-item"
                            >
                              <Copy className={`h-4 w-4 ${canDuplicate ? "" : "text-muted-foreground"}`} />
                              <span className="flex-1 text-left">{translations.duplicate || "Duplicate"}</span>
                              {!canDuplicate ? <span className="rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-semibold text-white">PRO</span> : null}
                            </button>

                            <button
                              type="button"
                              onClick={() => { setOpenMenuId(null); handleDelete(record.key); }}
                              className="tsreview-action-item text-red-500 hover:bg-red-50 hover:text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                              {translations.delete}
                            </button>
                          </div>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={7} className="px-5 py-12 text-center">
                      <div className="mx-auto max-w-sm">
                        <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-muted text-muted-foreground">
                          <Search className="h-5 w-5" />
                        </div>
                        <h3 className="mt-4 text-base font-semibold text-foreground">No showcases found</h3>
                        <p className="mt-1 text-sm text-muted-foreground">Try different search or status filter.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-5 py-2.5 text-xs text-muted-foreground">
            <span>
              Showing {filteredData.length ? startIndex + 1 : 0}–{Math.min(startIndex + pageSize, filteredData.length)} of {filteredData.length}
            </span>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                disabled={currentPage === 1}
                className="rounded-lg px-2 py-1 transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              <button type="button" className="rounded-lg bg-primary px-2.5 py-1 text-xs font-semibold text-primary-foreground">
                {currentPage}
              </button>

              <button
                type="button"
                onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                disabled={currentPage === totalPages}
                className="rounded-lg px-2 py-1 transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </>
      )}

      <TsModal
        actionType="edit"
        formSupport={true}
        name={title}
        type={type}
        id={selectedPost}
        isOpen={updateModal}
        isClose={closeModal}
        width={800}
      />

      <TsModal
        isOpen={deleteModalOpen}
        isClose={() => setDeleteModalOpen(false)}
        width={400}
        name={title}
      >
        <div className="flex flex-col items-center justify-center p-6">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
            <AlertTriangle className="h-8 w-8 text-red-500" />
          </div>

          <h3 className="mb-2 text-xl font-semibold text-gray-900">{translations.areYouSure}</h3>
          <p className="mb-8 text-center text-gray-600">
            {translations.deleteConfirmation} "{title}". {translations.areYouSure}
          </p>

          <div className="flex w-full space-x-4">
            <TsButton
              label={translations.noKeepIt}
              onClick={() => setDeleteModalOpen(false)}
              className="flex-1 rounded-lg bg-gray-100 py-2.5 text-gray-700 hover:bg-gray-200"
            />
            <TsButton
              label={translations.yesDelete}
              onClick={confirmDelete}
              className="flex-1 rounded-lg bg-red-500 py-2.5 text-white hover:bg-red-600"
            />
          </div>
        </div>
      </TsModal>
    </div>
  );
}

export default DataTable;
