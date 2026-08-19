// Selectors, actions, and thunks from newLeadSlice
// Selectors, actions, and thunks from assignmentSlice
export {
    assignLeadThunk,
    clearAssignmentState, fetchAssignmentInfoThunk, selectAssignmentState
} from './store/assignmentSlice';
// Selectors, actions, and thunks from consentSlice
export {
    clearConsentState, searchFarmerConsent, selectConsentState, submitConsentThunk, verifyOtpThunk
} from './store/consentSlice';
export type { ConsentAudience } from './store/consentSlice';
// The consent UI itself, so a feature outside this one (the farmer's own
// apply-for-a-loan page) mounts the same components rather than cloning them.
export { ConsentManagementSection } from './components/ConsentManagementSection';
export { ConsentFinalizationSection } from './components/ConsentFinalizationSection';
// Selectors, actions, thunks, and types from farmerSlice
export {
    clearFarmerState, fetchLeadDetailsThunk, searchFarmerThunk, selectDetailsError, selectFarmerState, selectIsPollingLong, setFarmerId,
    updateFarmerDetails
} from './store/farmerSlice';
export type { FarmerDetails } from './store/farmerSlice';
export {
    addActivityNoteThunk, addCreditInfo, addCreditInfoThunk, clearForm, fetchActivitiesThunk, fetchCallDetailsThunk, fetchCreditInfoThunk, fetchLeadMetadataThunk, fetchLeadProfileThunk, initializeLead, selectActiveLeadId, selectActivities, selectCallDetails, selectCreditInfo, selectIsLeadFinalized, selectIsSubmitting, selectLeadFirstName,
    selectLeadLastName, selectLeadPhoneNumber, selectLeadSource, selectLeadSourcesOptions, selectLeadStatus, selectLeadStatusesOptions,
    selectLoanTypesOptions, selectNewLeadState, selectVerificationBlocked, setLeadSource,
    setLeadStatus, submitNewLeadThunk,
    updateLeadStatusThunk
} from './store/newLeadSlice';
export type { Activity, CallDetail, CreditInfo } from './store/newLeadSlice';
// Selectors, actions, and thunks from visitSlice
export {
    clearVisitState, fetchVisitSchedulesThunk,
    scheduleVisitThunk, selectVisitState, setVisitSchedule, updateVisitScheduleStatusThunk
} from './store/visitSlice';





