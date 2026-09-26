"use client";

import {
  CalendarClock,
  Edit3,
  ImageIcon,
  LayoutPanelTop,
  Loader2,
  Plus,
  RefreshCw,
  Trash2,
  X,
} from "lucide-react";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import {
  createCampaign,
  deleteCampaign,
  getAdminCampaigns,
  updateCampaign,
} from "@/lib/api/homepage-campaign-api";
import type {
  CampaignStatus,
  HomepageCampaign,
  HomepageCampaignForm,
} from "@/types/homepage-campaign";

const EMPTY_FORM: HomepageCampaignForm = {
  title: "",
  subtitle: "",
  background_color: "#ffffff",
  text_color: "#0f172a",
  button_text: "Shop now",
  link_type: "none",
  link_value: "",
  card_size: "medium",
  position: "0",
  starts_at: "",
  ends_at: "",
  is_active: true,
  desktop_image: null,
  mobile_image: null,
  remove_mobile_image: false,
};

function toDateTimeInput(value?: string | null): string {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60_000);

  return local.toISOString().slice(0, 16);
}

function formFromCampaign(campaign: HomepageCampaign): HomepageCampaignForm {
  return {
    title: campaign.title,
    subtitle: campaign.subtitle ?? "",
    background_color: campaign.background_color ?? "#ffffff",
    text_color: campaign.text_color ?? "#0f172a",
    button_text: campaign.button_text ?? "Shop now",
    link_type: campaign.link_type,
    link_value: campaign.link_value ?? "",
    card_size: campaign.card_size,
    position: String(campaign.position),
    starts_at: toDateTimeInput(campaign.starts_at),
    ends_at: toDateTimeInput(campaign.ends_at),
    is_active: campaign.is_active,
    desktop_image: null,
    mobile_image: null,
    remove_mobile_image: false,
  };
}

function statusClasses(status: CampaignStatus): string {
  switch (status) {
    case "active":
      return "bg-emerald-50 text-emerald-700";
    case "scheduled":
      return "bg-blue-50 text-blue-700";
    case "expired":
      return "bg-amber-50 text-amber-700";
    default:
      return "bg-slate-100 text-slate-600";
  }
}

export default function HomepageCampaignsPage() {
  const [campaigns, setCampaigns] = useState<HomepageCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<HomepageCampaign | null>(null);
  const [form, setForm] = useState<HomepageCampaignForm>(EMPTY_FORM);
  const [desktopPreview, setDesktopPreview] = useState<string | null>(null);
  const [mobilePreview, setMobilePreview] = useState<string | null>(null);

  const loadCampaigns = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      setCampaigns(await getAdminCampaigns());
    } catch (exception) {
      setError(
        exception instanceof Error
          ? exception.message
          : "Unable to load homepage campaigns.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCampaigns();
  }, [loadCampaigns]);

  function openCreateModal() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setDesktopPreview(null);
    setMobilePreview(null);
    setModalOpen(true);
  }

  function openEditModal(campaign: HomepageCampaign) {
    setEditing(campaign);
    setForm(formFromCampaign(campaign));
    setDesktopPreview(campaign.desktop_image_url);
    setMobilePreview(campaign.mobile_image_url ?? null);
    setModalOpen(true);
  }

  function closeModal() {
    if (saving) {
      return;
    }

    setModalOpen(false);
    setEditing(null);
    setForm(EMPTY_FORM);
    setDesktopPreview(null);
    setMobilePreview(null);
  }

  function updateField<K extends keyof HomepageCampaignForm>(
    key: K,
    value: HomepageCampaignForm[K],
  ) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function selectImage(type: "desktop" | "mobile", file: File | null) {
    if (!file) {
      return;
    }

    const preview = URL.createObjectURL(file);

    if (type === "desktop") {
      updateField("desktop_image", file);
      setDesktopPreview(preview);
      return;
    }

    updateField("mobile_image", file);
    updateField("remove_mobile_image", false);
    setMobilePreview(preview);
  }

  async function submitForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!editing && !form.desktop_image) {
      toast.error("Choose a desktop campaign image.");
      return;
    }

    setSaving(true);

    try {
      if (editing) {
        await updateCampaign(editing.public_id, form);

        toast.success("Campaign updated.");
      } else {
        await createCampaign(form);
        toast.success("Campaign created.");
      }

      closeModal();
      await loadCampaigns();
    } catch (exception) {
      toast.error(
        exception instanceof Error
          ? exception.message
          : "Unable to save the campaign.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function removeCampaign(campaign: HomepageCampaign) {
    const confirmed = window.confirm(`Delete "${campaign.title}" permanently?`);

    if (!confirmed) {
      return;
    }

    setDeletingId(campaign.public_id);

    try {
      await deleteCampaign(campaign.public_id);
      setCampaigns((current) =>
        current.filter((item) => item.public_id !== campaign.public_id),
      );
      toast.success("Campaign deleted.");
    } catch (exception) {
      toast.error(
        exception instanceof Error
          ? exception.message
          : "Unable to delete the campaign.",
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="min-h-full bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-[1500px]">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.16em] text-blue-600">
              Homepage management
            </p>

            <h1 className="mt-2 text-3xl font-black tracking-[-0.04em] text-slate-950">
              Homepage campaigns
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Create scheduled promotional cards that automatically appear on
              the public homepage.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => void loadCampaigns()}
              className="grid size-11 place-items-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:border-blue-300 hover:text-blue-700"
              aria-label="Refresh campaigns"
            >
              <RefreshCw
                className={`size-5 ${loading ? "animate-spin" : ""}`}
              />
            </button>

            <button
              type="button"
              onClick={openCreateModal}
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-black text-white transition hover:bg-blue-700"
            >
              <Plus className="size-4" />
              New campaign
            </button>
          </div>
        </div>

        <div className="mt-7 grid gap-4 sm:grid-cols-3">
          <StatCard label="Total campaigns" value={campaigns.length} />
          <StatCard
            label="Currently active"
            value={campaigns.filter((item) => item.status === "active").length}
          />
          <StatCard
            label="Scheduled"
            value={
              campaigns.filter((item) => item.status === "scheduled").length
            }
          />
        </div>

        {error ? (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
            {error}
          </div>
        ) : null}

        {loading ? (
          <div className="mt-10 flex min-h-72 items-center justify-center">
            <Loader2 className="size-8 animate-spin text-blue-600" />
          </div>
        ) : campaigns.length === 0 ? (
          <div className="mt-8 rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
            <LayoutPanelTop className="mx-auto size-12 text-slate-300" />
            <h2 className="mt-4 text-lg font-black text-slate-900">
              No homepage campaigns yet
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Create your first promotional homepage card.
            </p>
          </div>
        ) : (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {campaigns.map((campaign) => (
              <article
                key={campaign.public_id}
                className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="relative aspect-[16/9] overflow-hidden bg-slate-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={campaign.desktop_image_url}
                    alt={campaign.title}
                    className="size-full object-cover transition duration-500 hover:scale-105"
                  />

                  <span
                    className={`absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-black capitalize ${statusClasses(
                      campaign.status,
                    )}`}
                  >
                    {campaign.status}
                  </span>

                  <span className="absolute right-3 top-3 rounded-full bg-slate-950/75 px-3 py-1 text-xs font-bold capitalize text-white">
                    {campaign.card_size}
                  </span>
                </div>

                <div className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="font-black text-slate-950">
                        {campaign.title}
                      </h2>

                      <p className="mt-1 line-clamp-2 text-sm leading-6 text-slate-500">
                        {campaign.subtitle || "No campaign subtitle"}
                      </p>
                    </div>

                    <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-black text-slate-600">
                      #{campaign.position}
                    </span>
                  </div>

                  <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
                    <CalendarClock className="size-4" />
                    {campaign.starts_at
                      ? new Date(campaign.starts_at).toLocaleDateString()
                      : "Starts immediately"}
                    {" – "}
                    {campaign.ends_at
                      ? new Date(campaign.ends_at).toLocaleDateString()
                      : "No end date"}
                  </div>

                  <div className="mt-5 flex gap-2">
                    <button
                      type="button"
                      onClick={() => openEditModal(campaign)}
                      className="flex h-10 flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 transition hover:border-blue-300 hover:text-blue-700"
                    >
                      <Edit3 className="size-4" />
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => void removeCampaign(campaign)}
                      disabled={deletingId === campaign.public_id}
                      className="grid size-10 place-items-center rounded-xl border border-red-200 text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                      aria-label={`Delete ${campaign.title}`}
                    >
                      {deletingId === campaign.public_id ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <Trash2 className="size-4" />
                      )}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {modalOpen ? (
        <div className="fixed inset-0 z-[100] overflow-y-auto bg-slate-950/65 p-4 backdrop-blur-sm">
          <div className="flex min-h-full items-center justify-center">
            <form
              onSubmit={submitForm}
              className="my-6 w-full max-w-4xl overflow-hidden rounded-3xl bg-white shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 sm:px-7">
                <div>
                  <h2 className="text-xl font-black text-slate-950">
                    {editing ? "Edit campaign" : "Create campaign"}
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Control the promotional card shown on the homepage.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={closeModal}
                  className="grid size-10 place-items-center rounded-xl bg-slate-100 text-slate-600"
                >
                  <X className="size-5" />
                </button>
              </div>

              <div className="grid max-h-[72vh] gap-6 overflow-y-auto p-5 sm:p-7 lg:grid-cols-2">
                <div className="space-y-4">
                  <Input
                    label="Campaign title"
                    required
                    value={form.title}
                    onChange={(value) => updateField("title", value)}
                  />

                  <Input
                    label="Short description"
                    value={form.subtitle}
                    onChange={(value) => updateField("subtitle", value)}
                  />

                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      label="Button text"
                      value={form.button_text}
                      onChange={(value) => updateField("button_text", value)}
                    />

                    <Input
                      label="Position"
                      type="number"
                      value={form.position}
                      onChange={(value) => updateField("position", value)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <Select
                      label="Card size"
                      value={form.card_size}
                      onChange={(value) =>
                        updateField(
                          "card_size",
                          value as HomepageCampaignForm["card_size"],
                        )
                      }
                      options={[
                        ["large", "Large"],
                        ["medium", "Medium"],
                        ["small", "Small"],
                      ]}
                    />

                    <Select
                      label="Link type"
                      value={form.link_type}
                      onChange={(value) =>
                        updateField(
                          "link_type",
                          value as HomepageCampaignForm["link_type"],
                        )
                      }
                      options={[
                        ["none", "No link"],
                        ["category", "Category"],
                        ["brand", "Brand"],
                        ["product", "Product"],
                        ["custom", "Custom URL"],
                      ]}
                    />
                  </div>

                  {form.link_type !== "none" ? (
                    <Input
                      label="Link value"
                      value={form.link_value}
                      placeholder={
                        form.link_type === "custom"
                          ? "https://example.com"
                          : "Enter slug or public ID"
                      }
                      onChange={(value) => updateField("link_value", value)}
                    />
                  ) : null}

                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      label="Starts at"
                      type="datetime-local"
                      value={form.starts_at}
                      onChange={(value) => updateField("starts_at", value)}
                    />

                    <Input
                      label="Ends at"
                      type="datetime-local"
                      value={form.ends_at}
                      onChange={(value) => updateField("ends_at", value)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <ColorInput
                      label="Background"
                      value={form.background_color}
                      onChange={(value) =>
                        updateField("background_color", value)
                      }
                    />

                    <ColorInput
                      label="Text"
                      value={form.text_color}
                      onChange={(value) => updateField("text_color", value)}
                    />
                  </div>

                  <label className="flex items-center gap-3 rounded-xl border border-slate-200 p-4">
                    <input
                      type="checkbox"
                      checked={form.is_active}
                      onChange={(event) =>
                        updateField("is_active", event.target.checked)
                      }
                      className="size-4"
                    />
                    <span className="text-sm font-bold text-slate-700">
                      Campaign is active
                    </span>
                  </label>
                </div>

                <div className="space-y-4">
                  <ImagePicker
                    label="Desktop image"
                    required={!editing}
                    preview={desktopPreview}
                    onChange={(file) => selectImage("desktop", file)}
                  />

                  <ImagePicker
                    label="Mobile image"
                    preview={mobilePreview}
                    onChange={(file) => selectImage("mobile", file)}
                  />

                  {editing && editing.mobile_image_url ? (
                    <label className="flex items-center gap-3 rounded-xl border border-slate-200 p-4">
                      <input
                        type="checkbox"
                        checked={form.remove_mobile_image}
                        onChange={(event) => {
                          updateField(
                            "remove_mobile_image",
                            event.target.checked,
                          );

                          if (event.target.checked) {
                            setMobilePreview(null);
                          } else {
                            setMobilePreview(editing.mobile_image_url ?? null);
                          }
                        }}
                        className="size-4"
                      />
                      <span className="text-sm font-bold text-slate-700">
                        Remove current mobile image
                      </span>
                    </label>
                  ) : null}

                  <div
                    style={{
                      backgroundColor: form.background_color,
                      color: form.text_color,
                    }}
                    className="rounded-2xl border border-slate-200 p-5"
                  >
                    <p className="text-xs font-black uppercase tracking-[0.14em] opacity-60">
                      Card preview
                    </p>
                    <h3 className="mt-3 text-2xl font-black leading-tight">
                      {form.title || "Campaign title"}
                    </h3>
                    <p className="mt-2 text-sm opacity-75">
                      {form.subtitle || "Campaign description"}
                    </p>
                    <span className="mt-5 inline-flex rounded-full bg-white px-4 py-2 text-sm font-black text-slate-950">
                      {form.button_text || "Shop now"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t border-slate-200 px-5 py-4 sm:px-7">
                <button
                  type="button"
                  onClick={closeModal}
                  className="h-11 rounded-xl border border-slate-300 px-5 text-sm font-bold text-slate-700"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex h-11 items-center gap-2 rounded-xl bg-blue-600 px-6 text-sm font-black text-white disabled:opacity-60"
                >
                  {saving ? <Loader2 className="size-4 animate-spin" /> : null}
                  {editing ? "Save changes" : "Create campaign"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <p className="text-sm font-semibold text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-black text-slate-950">{value}</p>
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  type = "text",
  required = false,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-bold text-slate-700">
        {label}
      </span>
      <input
        type={type}
        required={required}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
      />
    </label>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<[string, string]>;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-bold text-slate-700">
        {label}
      </span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none focus:border-blue-500"
      >
        {options.map(([optionValue, label]) => (
          <option key={optionValue} value={optionValue}>
            {label}
          </option>
        ))}
      </select>
    </label>
  );
}

function ColorInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-bold text-slate-700">
        {label}
      </span>
      <div className="flex h-11 items-center gap-2 rounded-xl border border-slate-300 px-2">
        <input
          type="color"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="size-7 cursor-pointer border-0 bg-transparent"
        />
        <span className="text-xs font-bold text-slate-500">{value}</span>
      </div>
    </label>
  );
}

function ImagePicker({
  label,
  preview,
  onChange,
  required = false,
}: {
  label: string;
  preview: string | null;
  onChange: (file: File | null) => void;
  required?: boolean;
}) {
  return (
    <label className="block cursor-pointer">
      <span className="mb-1.5 block text-sm font-bold text-slate-700">
        {label}
      </span>

      <div className="overflow-hidden rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 transition hover:border-blue-400">
        {preview ? (
          <div className="aspect-[16/9]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt={label} className="size-full object-cover" />
          </div>
        ) : (
          <div className="flex aspect-[16/9] flex-col items-center justify-center">
            <ImageIcon className="size-9 text-slate-300" />
            <span className="mt-2 text-sm font-bold text-slate-500">
              Choose image
            </span>
            <span className="mt-1 text-xs text-slate-400">
              JPG, PNG or WebP
            </span>
          </div>
        )}
      </div>

      <input
        type="file"
        accept="image/jpeg,image/png,image/webp"
        required={required}
        onChange={(event) => onChange(event.target.files?.[0] ?? null)}
        className="sr-only"
      />
    </label>
  );
}
