import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { CatalogFacets, CatalogFilters } from '../../types';
import SidebarFilters from './SidebarFilters';

const FACETS: CatalogFacets = {
  categories: [{ name: 'Input Loan', count: 3 }],
  tenures: [6, 12],
  amount_range: { min: 1000, max: 50000 },
  max_interest_rate: 18,
};

function renderSidebar(
  overrides: Partial<React.ComponentProps<typeof SidebarFilters>> = {}
) {
  const onApply = vi.fn();
  const onReset = vi.fn();
  render(
    <SidebarFilters
      facets={FACETS}
      filters={{}}
      onApply={onApply}
      onReset={onReset}
      {...overrides}
    />
  );
  return { onApply, onReset };
}

const bookmarkBox = () => screen.getByLabelText(/bookmarked only/i);

describe('SidebarFilters — bookmarked-only filter', () => {
  it('applies is_saved when the box is ticked', () => {
    const { onApply } = renderSidebar();

    fireEvent.click(bookmarkBox());
    fireEvent.click(screen.getByRole('button', { name: /apply filters/i }));

    expect(onApply).toHaveBeenCalledWith({ is_saved: true });
  });

  it('does not apply anything until the farmer commits', () => {
    // The sidebar is a draft form; a tick on its own must not refetch. Applying
    // on change would make the bookmark box behave unlike every other control
    // in the panel.
    const { onApply } = renderSidebar();

    fireEvent.click(bookmarkBox());

    expect(onApply).not.toHaveBeenCalled();
  });

  it('deletes the key rather than sending is_saved: false when unticked', () => {
    // `is_saved=0` on the wire would read as "products I have *not* saved", and
    // an explicit undefined trips exactOptionalPropertyTypes. Absent is the only
    // honest encoding of an unticked box.
    const { onApply } = renderSidebar({ filters: { is_saved: true } });

    expect(bookmarkBox()).toBeChecked();
    fireEvent.click(bookmarkBox());
    fireEvent.click(screen.getByRole('button', { name: /apply filters/i }));

    const applied = onApply.mock.calls[0]?.[0] as CatalogFilters;
    expect('is_saved' in applied).toBe(false);
  });

  it('reflects a filter set from outside the panel', () => {
    renderSidebar({ filters: { is_saved: true } });
    expect(bookmarkBox()).toBeChecked();
  });

  it('stays available when the facets request fails', () => {
    // The bookmark filter reads the farmer's saved list, not the catalog's shape,
    // so a facets outage has no bearing on it — and hiding it there would hide
    // the bookmarks exactly when the sidebar is least able to explain why.
    renderSidebar({ facets: null, hasFailed: true });

    expect(bookmarkBox()).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /apply filters/i })).toBeInTheDocument();
  });

  it('stays available while the facets are still loading', () => {
    renderSidebar({ facets: null });

    expect(bookmarkBox()).toBeInTheDocument();
    expect(screen.getByText(/loading filters/i)).toBeInTheDocument();
  });

  it('stays available when the catalog has no facets to offer', () => {
    renderSidebar({
      facets: { categories: [], tenures: [], amount_range: null, max_interest_rate: null },
    });

    expect(bookmarkBox()).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /apply filters/i })).toBeInTheDocument();
  });

  it('clears the box on Reset All', () => {
    const { onReset } = renderSidebar({ filters: { is_saved: true } });

    fireEvent.click(screen.getByRole('button', { name: /reset all/i }));

    expect(onReset).toHaveBeenCalled();
    expect(bookmarkBox()).not.toBeChecked();
  });
});
