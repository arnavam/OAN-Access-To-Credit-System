'use client';

import CatalogBrowser from '@/components/loan-catalog/CatalogBrowser';
import { selectCatalogVersion } from '@/features/seller/store/loanProductsSlice';
import { getCatalog } from '@/lib/api/catalogApi';
import { useAppSelector } from '@/store/hooks';
import type { CatalogProduct } from '@/types/loan-catalog';
import { useCallback } from 'react';
import { BankCatalogCard } from './BankCatalogCard';
import { BankHeaderCard } from './BankHeaderCard';

interface BankProductCatalogProps {
  portalLabel?: string;
}

/**
 * The bank's own loan products, in the same catalog view farmers browse.
 *
 * Same endpoint as `/discover-loans`, scoped server-side to the caller's bank
 * and widened to every status but Archived — so what the bank sees here is what
 * it publishes, laid out the way a farmer will meet it. `list_catalog` excludes
 * Archived itself, which is why nothing filters for it here: a client-side pass
 * would only desync this page from the total the pager counts.
 *
 * The add/edit/archive modals write through `loanProductsSlice`, which refetches
 * the *seller* product list — a different endpoint that this page does not read.
 * `catalogVersion` is what carries a mutation across that gap: the slice bumps it
 * once per mutation, and the browser refetches when it moves.
 */
export function BankProductCatalog({ portalLabel }: BankProductCatalogProps) {
  const catalogVersion = useAppSelector(selectCatalogVersion);

  const renderCard = useCallback(
    (product: CatalogProduct) => <BankCatalogCard key={product.name} product={product} />,
    []
  );

  return (
    <CatalogBrowser
      fetchProducts={getCatalog}
      renderCard={renderCard}
      refreshToken={catalogVersion}
      header={<BankHeaderCard portalLabel={portalLabel} />}
      emptyTitle="No loan products found"
      emptySubtitle="Create a loan product to publish it to the marketplace."
    />
  );
}
