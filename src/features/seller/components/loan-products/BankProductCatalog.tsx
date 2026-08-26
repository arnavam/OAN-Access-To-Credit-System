'use client';

import CatalogBrowser from '@/components/loan-catalog/CatalogBrowser';
import { getCatalog } from '@/lib/api/catalogApi';
import type { CatalogProduct } from '@/types/loan-catalog';
import { useCallback } from 'react';
import { BankCatalogCard } from './BankCatalogCard';
import { BankHeaderCard } from './BankHeaderCard';

interface BankProductCatalogProps {
  portalLabel?: string;
}

// Archived products are soft-deleted: still stored, but hidden from this view.
// The catalog returns them because a bank caller gets every status, and the
// endpoint has no exclusion parameter.
const hideArchived = (products: CatalogProduct[]) =>
  products.filter((product) => product.status !== 'Archived');

/**
 * The bank's own loan products, in the same catalog view farmers browse.
 *
 * Same endpoint as `/discover-loans`, scoped server-side to the caller's bank
 * and widened to every status — so what the bank sees here is what it publishes,
 * laid out the way a farmer will meet it.
 */
export function BankProductCatalog({ portalLabel }: BankProductCatalogProps) {
  const renderCard = useCallback(
    (product: CatalogProduct) => <BankCatalogCard key={product.name} product={product} />,
    []
  );

  return (
    <CatalogBrowser
      fetchProducts={getCatalog}
      renderCard={renderCard}
      filterProducts={hideArchived}
      header={<BankHeaderCard portalLabel={portalLabel} />}
      emptyTitle="No loan products found"
      emptySubtitle="Create a loan product to publish it to the marketplace."
    />
  );
}
