// Page components (client-side) — import only from app/ route files
export { default as AgentDashboardPage } from './pages/AgentDashboardPage';
export { default as AgentLoanProductsPage } from './pages/AgentLoanProductsPage';
export { default as BankAdminDashboardPage } from './pages/BankAdminDashboardPage';
export { default as KycCompliancePage } from './pages/KycCompliancePage';
export { default as LoanProductsPage } from './pages/LoanProductsPage';
export { default as ProductApprovalsPage } from './pages/ProductApprovalsPage';
// Store — loan products
export {
    archiveProduct, clearMutationError,
    clearSelectedProductDetail, createProductCompound, fetchDashboardStats, fetchProductDetail, fetchProducts, fetchTaxonomy, selectAttributes, selectCategories, selectProducts, selectProductsListError, selectProductsListStatus, selectProductsMutationError, selectProductsMutationStatus, selectSelectedProductDetail, selectSellerStats, selectTags, sellerProductsReducer, setProductStatus, updateProductCompound
} from './store/loanProductsSlice';
// Store — onboarding
export {
    clearOnboardingErrors, registerSeller,
    saveOrgContacts, sellerOnboardingReducer, updateBankStatus, uploadKycDocument
} from './store/onboardingSlice';
// Store — team
export {
    clearTeamMutationError, deactivateUser, fetchTeamUsers,
    inviteUser, selectTeamListError, selectTeamListStatus, selectTeamMutationError, selectTeamMutationStatus, selectTeamUsers, sellerTeamReducer, updateUser
} from './store/teamSlice';
// Types — safe to import from server and client contexts
export type { ArchiveLoanProductInput, CreateLoanProductCompoundInput, CreateLoanProductPayload, ListProductsParams, SetLoanProductStatusInput, UpdateLoanProductCompoundInput, UpdateLoanProductPayload } from './types/loan-products.types';
export type { RegisterSellerPayload, SaveOrgContactsPayload, UpdateBankStatusPayload, UploadKycDocumentPayload } from './types/onboarding.types';
export type { InviteUserPayload, UpdateUserPayload, UpdateUserProfilePayload } from './types/team.types';




