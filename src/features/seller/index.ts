// Page components (client-side) — import only from app/ route files
export { default as BankAdminDashboardPage } from './pages/BankAdminDashboardPage';
export { default as AgentDashboardPage } from './pages/AgentDashboardPage';
export { default as LoanProductsPage } from './pages/LoanProductsPage';
export { default as AgentLoanProductsPage } from './pages/AgentLoanProductsPage';
export { default as KycCompliancePage } from './pages/KycCompliancePage';
export { default as ProductApprovalsPage } from './pages/ProductApprovalsPage';

// Store — loan products
export {
  fetchProducts,
  fetchProductDetail,
  fetchTaxonomy,
  fetchDashboardStats,
  createProductCompound,
  updateProductCompound,
  archiveProduct,
  clearMutationError,
  clearSelectedProductDetail,
  sellerProductsReducer,
  selectProducts,
  selectSelectedProductDetail,
  selectCategories,
  selectTags,
  selectAttributes,
  selectSellerStats,
  selectProductsListStatus,
  selectProductsListError,
  selectProductsMutationStatus,
  selectProductsMutationError,
} from './store/loanProductsSlice';

// Store — onboarding
export {
  registerSeller,
  fetchBankStatus,
  saveOrgContacts,
  uploadKycDocument,
  updateBankStatus,
  clearOnboardingErrors,
  sellerOnboardingReducer,
} from './store/onboardingSlice';

// Store — team
export {
  fetchTeamUsers,
  inviteUser,
  deactivateUser,
  updateUserProfile,
  clearTeamMutationError,
  sellerTeamReducer,
  selectTeamUsers,
  selectTeamListStatus,
  selectTeamListError,
  selectTeamMutationStatus,
  selectTeamMutationError,
} from './store/teamSlice';

// Types — safe to import from server and client contexts
export type { CreateLoanProductPayload, UpdateLoanProductPayload, CreateLoanProductCompoundInput, UpdateLoanProductCompoundInput, ListProductsParams } from './types/loan-products.types';
export type { RegisterSellerPayload, SaveOrgContactsPayload, UploadKycDocumentPayload, UpdateBankStatusPayload } from './types/onboarding.types';
export type { InviteUserPayload, UpdateUserProfilePayload } from './types/team.types';
