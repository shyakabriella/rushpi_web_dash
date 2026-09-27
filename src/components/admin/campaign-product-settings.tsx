"use client";

import {
  campaignLayoutGroups,
  campaignLayouts,
} from "@/config/homepage-campaign-layouts";
import type {
  CampaignLayoutType,
  CampaignProductSource,
  HomepageCampaignForm,
} from "@/types/homepage-campaign";

type CampaignProductSettingsProps = {
  form: HomepageCampaignForm;

  updateField: <K extends keyof HomepageCampaignForm>(
    key: K,
    value: HomepageCampaignForm[K],
  ) => void;
};

const productSources: Array<{
  value: CampaignProductSource;
  label: string;
}> = [
  {
    value: "newest",
    label: "Newest approved seller products",
  },
  {
    value: "discounted",
    label: "Discounted products",
  },
  {
    value: "category",
    label: "Products from one category",
  },
  {
    value: "brand",
    label: "Products from one brand",
  },
  {
    value: "seller",
    label: "Products from one seller",
  },
  {
    value: "manual",
    label: "Manually selected products",
  },
];

export function CampaignProductSettings({
  form,
  updateField,
}: CampaignProductSettingsProps) {
  const layout = form.layout_type ?? "banner_products";

  const source = form.product_source ?? "newest";

  const selectedLayout =
    campaignLayouts.find((item) => item.value === layout) ?? campaignLayouts[0];

  const showProducts = form.show_products ?? true;

  const SelectedIcon = selectedLayout.icon;

  function changeLayout(value: CampaignLayoutType) {
    updateField("layout_type", value);

    if (value === "full_banner") {
      updateField("show_products", false);
      return;
    }

    if (form.show_products === false) {
      updateField("show_products", true);
    }
  }

  return (
    <div className="space-y-4 rounded-2xl border border-blue-100 bg-blue-50/40 p-4">
      <div>
        <p className="text-sm font-black text-slate-900">Campaign layout</p>

        <p className="mt-1 text-xs leading-5 text-slate-500">
          Choose how this campaign will appear on the homepage.
        </p>
      </div>

      <label className="block">
        <span className="mb-1.5 block text-sm font-bold text-slate-700">
          Layout style
        </span>

        <select
          value={layout}
          onChange={(event) =>
            changeLayout(event.target.value as CampaignLayoutType)
          }
          className="h-12 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm font-bold text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
        >
          {campaignLayoutGroups.map((group) => (
            <optgroup key={group} label={group}>
              {campaignLayouts
                .filter((item) => item.group === group)
                .map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
            </optgroup>
          ))}
        </select>
      </label>

      <div className="flex items-start gap-3 rounded-xl border border-blue-200 bg-white p-4 shadow-sm">
        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-blue-600 text-white">
          <SelectedIcon className="size-5" />
        </span>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-black text-slate-900">{selectedLayout.label}</p>

            <span className="rounded-full bg-blue-50 px-2 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-blue-700">
              {selectedLayout.group}
            </span>
          </div>

          <p className="mt-1 text-xs leading-5 text-slate-500">
            {selectedLayout.description}
          </p>
        </div>
      </div>

      {layout !== "full_banner" ? (
        <>
          <label className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4">
            <span>
              <span className="block text-sm font-black text-slate-800">
                Show seller products
              </span>

              <span className="mt-1 block text-xs leading-5 text-slate-500">
                Load approved and available seller products automatically.
              </span>
            </span>

            <input
              type="checkbox"
              checked={showProducts}
              onChange={(event) =>
                updateField("show_products", event.target.checked)
              }
              className="size-5 accent-blue-600"
            />
          </label>

          {showProducts ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1.5 block text-sm font-bold text-slate-700">
                  Product source
                </span>

                <select
                  value={source}
                  onChange={(event) =>
                    updateField(
                      "product_source",
                      event.target.value as CampaignProductSource,
                    )
                  }
                  className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none focus:border-blue-500"
                >
                  {productSources.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-1.5 block text-sm font-bold text-slate-700">
                  Number of products
                </span>

                <input
                  type="number"
                  min="1"
                  max="24"
                  value={form.product_limit ?? "8"}
                  onChange={(event) =>
                    updateField("product_limit", event.target.value)
                  }
                  className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none focus:border-blue-500"
                />
              </label>
            </div>
          ) : null}

          {showProducts && source === "category" ? (
            <IdentifierInput
              label="Category public ID"
              value={form.category_public_id ?? ""}
              placeholder="Paste the category public ID"
              onChange={(value) => updateField("category_public_id", value)}
            />
          ) : null}

          {showProducts && source === "brand" ? (
            <IdentifierInput
              label="Brand public ID"
              value={form.brand_public_id ?? ""}
              placeholder="Paste the brand public ID"
              onChange={(value) => updateField("brand_public_id", value)}
            />
          ) : null}

          {showProducts && source === "seller" ? (
            <IdentifierInput
              label="Seller public ID"
              value={form.seller_public_id ?? ""}
              placeholder="Paste the seller public ID"
              onChange={(value) => updateField("seller_public_id", value)}
            />
          ) : null}

          {showProducts && source === "manual" ? (
            <label className="block">
              <span className="mb-1.5 block text-sm font-bold text-slate-700">
                Product public IDs
              </span>

              <textarea
                value={(form.product_public_ids ?? []).join("\n")}
                placeholder="One product public ID per line"
                onChange={(event) =>
                  updateField(
                    "product_public_ids",
                    event.target.value
                      .split(/\n|,/)
                      .map((value) => value.trim())
                      .filter(Boolean),
                  )
                }
                rows={4}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm outline-none focus:border-blue-500"
              />
            </label>
          ) : null}
        </>
      ) : (
        <p className="rounded-xl border border-slate-200 bg-white p-3 text-xs leading-5 text-slate-500">
          This layout displays only one large product-led campaign.
        </p>
      )}
    </div>
  );
}

function IdentifierInput({
  label,
  value,
  placeholder,
  onChange,
}: {
  label: string;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-bold text-slate-700">
        {label}
      </span>

      <input
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none focus:border-blue-500"
      />
    </label>
  );
}
