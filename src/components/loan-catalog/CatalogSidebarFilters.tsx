'use client';

import Button from '@/components/ui/Button';
import { Bookmark, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import type { CatalogFacets, CatalogFilters } from '@/types/loan-catalog';

interface CatalogSidebarFiltersProps {
  /** Options derived from the live catalog; null while loading or after a failure. */
  facets: CatalogFacets | null;
  /** True when the facets request failed — a different state from "no options". */
  hasFailed?: boolean;
  onRetry?: () => void;
  filters: CatalogFilters;
  onApply: (filters: CatalogFilters) => void;
  onReset: () => void;
}

function Section({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className={`flex items-center justify-between w-full group ${open ? 'mb-4' : ''}`}
      >
        <h3 className="text-sm font-bold text-gray-900">{title}</h3>
        <div className="w-6 h-6 rounded-full border border-gray-200 flex items-center justify-center transition-colors group-hover:border-gray-300">
          {open ? (
            <ChevronUp className="w-4 h-4 text-gray-500 group-hover:text-gray-700" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-500 group-hover:text-gray-700" />
          )}
        </div>
      </button>
      {open && children}
    </div>
  );
}

const formatETB = (value: number) =>
  new Intl.NumberFormat('en-ET', { maximumFractionDigits: 0 }).format(value);

export default function CatalogSidebarFilters({ facets, hasFailed = false, onRetry, filters, onApply, onReset }: CatalogSidebarFiltersProps) {
  // Draft state: the sidebar is an "apply" form, so nothing refetches until the
  // farmer commits. Seeded from the applied filters so reopening shows the truth.
  const [draft, setDraft] = useState<CatalogFilters>(filters);

  // The applied filters can also change from outside this component — a reset on
  // the results side, or a future URL-driven filter — and the controls must not
  // keep showing selections that are no longer in effect. Adjusting state during
  // render is React's documented answer to "reset state when a prop changes"; an
  // effect would render the stale controls once before correcting them.
  const [lastApplied, setLastApplied] = useState<CatalogFilters>(filters);
  if (lastApplied !== filters) {
    setLastApplied(filters);
    setDraft(filters);
  }

  // Read defensively rather than behind an early return. These used to sit after
  // a `if (!facets) return`, which guaranteed the object; the bookmark filter
  // below has to render whether or not the facets request landed, so the guard
  // moved onto the individual sections. Each fallback renders nothing rather
  // than throwing — including `tenures`, whose absence from the payload once took
  // the whole page down with a TypeError instead of dropping one section.
  const amountMax = facets?.amount_range?.max ?? 0;
  const amountMin = facets?.amount_range?.min ?? 0;
  const hasAmountRange = amountMax > amountMin;
  const rateCeiling = facets?.max_interest_rate ?? null;
  const tenures = facets?.tenures ?? [];
  const categories = facets?.categories ?? [];

  // A catalog with nothing in it has nothing to filter by. Saying so beats
  // rendering empty controls that look broken. Worded without naming the
  // catalog because this panel also serves a bank looking at its own products.
  const hasAnyFacet =
    hasAmountRange || rateCeiling !== null || tenures.length > 0 || categories.length > 0;

  return (
    <div className="h-fit bg-white rounded-2xl border border-gray-200 p-6 flex flex-col gap-5 border-[#F1F3F4] shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.05),0px_2px_4px_-1px_rgba(0,0,0,0.03)] hover:-translate-y-1 hover:shadow-lg transition-all">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900">Filters</h2>
        <button
          onClick={() => {
            setDraft({});
            onReset();
          }}
          className="text-sm font-bold text-[#16A34A] hover:text-[#10883c] transition-colors"
        >
          Reset All
        </button>
      </div>

      <hr className="border-gray-200 -mx-6" />

      {/* The bookmark filter is the one control here that owes nothing to the
          facets request — it narrows by the farmer's own saved list, not by the
          shape of the catalog. So it renders in all three states below, failure
          included: a facets outage must not be what hides the bookmarks the
          farmer opened this panel to find. */}
      <Section title="Bookmarks">
        <label className="flex items-center gap-2.5 text-sm font-medium text-gray-700 cursor-pointer">
          <input
            type="checkbox"
            checked={draft.is_saved ?? false}
            onChange={(e) => {
              const next = { ...draft };
              if (e.target.checked) {
                next.is_saved = true;
              } else {
                // Deleted rather than set to false, as with the tenure chips:
                // exactOptionalPropertyTypes treats absent and undefined as
                // different types, and an `is_saved=0` on the wire would read as
                // "products I have *not* saved" — not what unticking a box means.
                delete next.is_saved;
              }
              setDraft(next);
            }}
            className="w-4 h-4 rounded accent-[#16A34A]"
          />
          <Bookmark className="w-4 h-4 text-[#16A34A] shrink-0" fill="currentColor" />
          <span className="flex-1">Bookmarked only</span>
        </label>
      </Section>

      {/* Failure is checked before loading: a failed request also leaves `facets`
          null, and "Loading filters…" forever is the one thing worse than saying
          so. It is reported as a failure, too — substituting an all-empty facet
          set made the sidebar say "the catalog is empty", which is a statement
          about the catalog, not about the request that did not arrive. */}
      {hasFailed ? (
        <div className="flex flex-col gap-3">
          <p className="text-sm font-medium text-gray-500">
            We could not load the rest of the filter options. The loans themselves are still listed.
          </p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="self-start text-sm font-bold text-[#16A34A] hover:text-[#10883c] transition-colors"
            >
              Try again
            </button>
          )}
        </div>
      ) : !facets ? (
        <p className="text-sm font-medium text-gray-500">Loading filters…</p>
      ) : !hasAnyFacet ? (
        <p className="text-sm font-medium text-gray-500">
          No catalog filters available — the catalog is empty.
        </p>
      ) : null}

      {hasAmountRange && (
        <Section title="Loan Amount">
          <div>
            <div className="flex justify-between text-xs font-bold text-gray-500 mb-2">
              <span>
                ETB
                <br />
                {formatETB(amountMin)}
              </span>
              <span className="text-right">
                ETB
                <br />
                {formatETB(amountMax)}
              </span>
            </div>
            <input
              type="range"
              min={amountMin}
              max={amountMax}
              step={Math.max(1, Math.round((amountMax - amountMin) / 100))}
              value={draft.max_amount ?? amountMax}
              onChange={(e) => setDraft({ ...draft, max_amount: Number(e.target.value) })}
              className="w-full accent-[#16A34A]"
              aria-label="Maximum loan amount"
            />
            <div className="text-xs font-bold text-gray-700 mt-1">
              Up to ETB {formatETB(draft.max_amount ?? amountMax)}
            </div>
          </div>
        </Section>
      )}

      {rateCeiling !== null && rateCeiling > 0 && (
        <Section title="Interest Rate">
          <div>
            <input
              type="range"
              min={0}
              max={rateCeiling}
              step={0.5}
              value={draft.max_interest_rate ?? rateCeiling}
              onChange={(e) => setDraft({ ...draft, max_interest_rate: Number(e.target.value) })}
              className="w-full accent-[#16A34A]"
              aria-label="Maximum interest rate"
            />
            <div className="text-xs font-bold text-gray-700 mt-1">
              Up to {draft.max_interest_rate ?? rateCeiling}%
            </div>
          </div>
        </Section>
      )}

      {tenures.length > 0 && (
        <Section title="Tenure">
          <div className="flex flex-wrap gap-2">
            {tenures.map((months) => {
              const selected = draft.tenure_months === months;
              return (
                <button
                  key={months}
                  onClick={() => {
                    // One chip at a time — the endpoint takes a tenure *span*, so a
                    // multi-select of non-adjacent tenures cannot be sent honestly.
                    // Clicking the selected chip clears it, which is the only way
                    // back to "any tenure" without Reset All. The key is deleted
                    // rather than set to undefined: exactOptionalPropertyTypes
                    // treats absent and undefined as different types.
                    const next = { ...draft };
                    if (selected) {
                      delete next.tenure_months;
                    } else {
                      next.tenure_months = months;
                    }
                    setDraft(next);
                  }}
                  aria-pressed={selected}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                    selected
                      ? 'bg-[#16A34A] text-white border-[#16A34A]'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-[#16A34A]'
                  }`}
                >
                  {months} Mon
                </button>
              );
            })}
          </div>
        </Section>
      )}

      {categories.length > 0 && (
        <Section title="Loan Types">
          <div className="flex flex-col gap-2">
            {categories.map((cat) => {
              const selected = draft.category === cat.name;
              return (
                <label
                  key={cat.name}
                  className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer"
                >
                  <input
                    type="radio"
                    name="loan-category"
                    checked={selected}
                    // Clicking the selected category clears it. A radio group with
                    // no "any" option is otherwise a one-way door: once a farmer
                    // picks a type, only Reset All gets them back to everything.
                    onClick={() => {
                      if (!selected) return;
                      const next = { ...draft };
                      delete next.category;
                      setDraft(next);
                    }}
                    onChange={() => setDraft({ ...draft, category: cat.name })}
                    className="accent-[#16A34A]"
                  />
                  <span className="flex-1">{cat.name}</span>
                  <span className="text-xs font-bold text-gray-400">{cat.count}</span>
                </label>
              );
            })}
          </div>
        </Section>
      )}

      {/* Unconditional, where it used to hang off hasAnyFacet: the bookmark
          checkbox is committable on its own, so there is no longer a state of
          this sidebar with nothing to apply. */}
      <Button onClick={() => onApply(draft)} className="w-full">
        Apply Filters
      </Button>
    </div>
  );
}
