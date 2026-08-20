# Epic: Farmer B2C Loan Marketplace & Application Flow

* **Issue Key:** `A2C-EPIC-01`
* **Issue Type:** `Epic`
* **Priority:** `High`
* **Summary:** Farmer B2C Authentication, Catalog Discovery, Application Lifecycle, and Profile Binding
* **Status:** Ready for Refinement
* **Target Repositories:**
  * Backend: `oan_a2c`
  * Frontend: `OAN-Access-To-Credit-System`

## Description
Enable self-service B2C farmer access to the OAN Access-to-Credit platform. Farmers can register with a phone number and password, browse active loan products across all participating banks without seeing internal drafts, create and edit draft applications, bookmark products, and submit applications gated on verified consent (which permanently binds the `User` account to their `A2C Farmer Profile`).

---

## Rollout Sequence & Dependency Graph

```
BE-100 (Core Schema & Role) ──┬──► BE-101 (Farmer Auth & Reg) ──► FE-201 (FE Architecture) ──► FE-202 (Auth UI)
                              ├──► BE-102 (Permissions) ──┬──► BE-104 (Catalog & Apps API) ──┐
                              │                           └──► BE-103 (App Lifecycle & Consent) ──► FE-203 (Full Flow UI)
                              ├──► BE-105 (Saved Products) ───────────────────────────────────┘
                              └──► BE-106 / BUG-107 (Stats Cache & Notifications)
```

---

## 1. Backend Tickets (`oan_a2c`)

### 🎫 BE-100: [Backend] Core Schema Updates, Farmer Role & Backfill Migration
* **Issue Type:** `Task`
* **Priority:** `Highest` (Blocker for all subsequent BE tickets)
* **Components:** `DocType`, `Patches`, `Permissions`
* **Estimated Story Points:** `3`

#### Description
Establish foundational schema fields, configure the `A2C Farmer` role as a website-only user (preventing seat consumption), apply DB backfills, and assign base DocPerms.

#### Technical Details & Files Changed
1. **`openagrinet_access_to_credit/doctype/a2c_loan_application/a2c_loan_application.json`**:
   * Add `farmer_profile` (`Link` to `A2C Farmer Profile`, `read_only: 1`, `search_index: 1`) under `links_section` immediately after `lead_id`. *(Fixes live bug where `farmer_profile` was kept in memory but not persisted in DB).*
2. **`openagrinet_access_to_credit/doctype/a2c_farmer_profile/a2c_farmer_profile.json`**:
   * Add `user` (`Link` to `User`, `unique: 1`, `search_index: 1`, `read_only: 1`).
3. **`openagrinet_access_to_credit/doctype/a2c_lead/a2c_lead.json`**:
   * Add `"Self Service"` to `lead_source` options: `"Missed Call\nIVR\nSMS\nAgent Entry\nSelf Service"`.
4. **`oan_a2c/patches/add_farmer_role.py`**:
   * Ensure role `A2C Farmer` exists with `desk_access = 0` (Website User, not System User).
   * Add `"A2C Farmer"` to role fixture filter in `hooks.py`.
5. **`oan_a2c/patches/backfill_loan_application_farmer_profile.py`**:
   * SQL backfill:
     ```sql
     UPDATE `tabA2C Loan Application` app
     INNER JOIN `tabA2C Lead` lead ON lead.name = app.lead_id
     SET app.farmer_profile = lead.farmer_profile
     WHERE app.farmer_profile IS NULL
       AND lead.farmer_profile IS NOT NULL;
     ```
6. **DocPerm Grants for `A2C Farmer`**:
   * `A2C Loan Application`: `read`, `create`, `write` (no `if_owner`).
   * `A2C Farmer Profile`: `read`, `write`.
   * `A2C Loan Product`: `read`.
   * `A2C Consent Request`: `read`, `create`.
   * `A2C Lead`: `read`, `create`.
7. **`patches.txt`**: Append entries to the end of the file.

#### Acceptance Criteria
- [ ] `bench --site development.localhost migrate` executes cleanly without schema collision.
- [ ] `A2C Loan Application.farmer_profile` is physically stored in DB with an index.
- [ ] Role `A2C Farmer` is created with `desk_access = 0`.
- [ ] Existing loan applications have `farmer_profile` backfilled from their associated lead.

---

### 🎫 BE-101: [Backend] Farmer Self-Registration & Phone-based Authentication
* **Issue Type:** `Story`
* **Priority:** `High`
* **Components:** `Auth API`, `Security`
* **Estimated Story Points:** `3`
* **Dependencies:** Blocks `FE-202`

#### Description
Support B2C farmer onboarding using Phone Number + Password. Ensure neutral duplicate responses to prevent phone harvesting oracles, and adjust rate-limit buckets for rural carrier NATs.

#### Technical Details & Files Changed
1. **`oan_a2c/api/v1/auth.py`**:
   * Add `FARMER_ROLE` to `SELF_REGISTERABLE_ROLES`.
   * In `register_user`: Accept `email` as optional when `role == FARMER_ROLE`.
   * Synthesise email: `<normalized_phone>@farmers.oan.local` via `validate_phone_string`.
   * Return identical neutral duplicate responses for already registered emails and phone numbers.
   * Rate limiting: Add a phone-keyed bucket alongside widened IP-based limits for carrier NAT protection.

#### Acceptance Criteria
- [ ] Farmer registers with phone + password without specifying an email.
- [ ] User record is created with synthesised email `<phone>@farmers.oan.local` and role `A2C Farmer`.
- [ ] Attempting registration with an existing phone returns a generic "Account already exists" response (no enumeration oracle).
- [ ] Login using phone number + password succeeds via `oan_a2c.api.auth.login`.
- [ ] Unit tests in `test_farmer_auth.py` pass.

---

### 🎫 BE-102: [Backend] Multi-Tenancy & Ownership Permission Scoping Hooks
* **Issue Type:** `Task`
* **Priority:** `Highest`
* **Components:** `Permissions`, `Multi-Tenancy`, `Hooks`
* **Estimated Story Points:** `5`
* **Dependencies:** Blocked by `BE-100`

#### Description
Implement permission query conditions and document-level checks for farmers. Farmers must NEVER be in `BANK_UNBOUND_ROLES` (which would leak cross-tenant loan applications), but must browse active products across all banks while only seeing their own applications, profiles, and consent requests.

#### Technical Details & Files Changed
1. **`oan_a2c/a2c_marketplace/permissions.py`**:
   * Add helpers `is_farmer(user)` and `get_user_farmer_profile(user)`.
   * Update `loan_application_scope_query`: If caller `is_farmer`, return `` `farmer_profile` = '{profile}' `` (or `1=0` if no profile bound). Omit draft gate for farmers (Draft is their working stage).
   * Add `loan_product_scope_query`: If caller `is_farmer`, return `` `status` = 'Active' ``; otherwise fall back to `bank_scope_query(user)`.
   * Add `farmer_own_profile_query` (matches `name = '{profile}'`).
   * Add `farmer_own_consent_query` (matches `farmer = '{profile}'`).
   * Update `bank_scope_doc`: Allow farmers to read `A2C Loan Product` if `status == "Active"`, and `A2C Loan Application` if `doc.farmer_profile == profile`.
2. **`oan_a2c/hooks.py`**:
   * Assign (do NOT append) hooks to `permission_query_conditions` for `A2C Loan Application`, `A2C Loan Product`, `A2C Farmer Profile`, and `A2C Consent Request`.
3. **`oan_a2c/tests/test_bank_scope_enforcement.py`**:
   * Extend test suite to assert farmer isolation across tenants and verify unbound role limits.

#### Acceptance Criteria
- [ ] Farmer sees all active products from Bank A and Bank B.
- [ ] Farmer sees 0 draft/archived products from any bank.
- [ ] Farmer sees only their own loan applications (including `Draft`).
- [ ] Farmer with no profile bound gets an empty list `[]` (not `1=0` SQL error or crash).
- [ ] Bank Agent/Officer sees 0 applications in `Draft` status.

---

### 🎫 BE-103: [Backend] Farmer Application Lifecycle, Workflow & Consent Profile Binding
* **Issue Type:** `Story`
* **Priority:** `High`
* **Components:** `API`, `Workflow`, `Consent`
* **Estimated Story Points:** `5`
* **Dependencies:** Blocked by `BE-102` and decision on D6 (Fayda/OTP at consent)

#### Description
Implement endpoints to start a draft application (with hidden lead + credit info) and submit an application into `Processing` gated on approved consent. Bind the user account to the farmer profile upon consent completion.

#### Technical Details & Files Changed
1. **`oan_a2c/patches/create_lead_loan_workflows.py` & `oan_a2c/patches/update_loan_workflow_for_farmer.py`**:
   * Add `FARMER_ROLE` transition: `Draft` -> `Processing` (Action: `Send for Review`).
   * Update and re-export `fixtures/workflow.json`.
2. **`oan_a2c/api/v1/farmer/applications.py`**:
   * Implement `start_application(**kwargs)`:
     - Validates chosen `loan_product`.
     - Creates internal `A2C Lead` (`lead_source = "Self Service"`, `status = "Active"`).
     - Creates `A2C Credit Information`.
     - Invokes `create_loan_application(lead_id=...)` returning `Draft` application.
   * Implement `submit_application(**kwargs)`:
     - Requires `application_id`.
     - Checks for approved `A2C Consent Request` for the lead. Throws `ValidationError` if missing.
     - Invokes `apply_status_transition(doc, "Processing")`.
     - Triggers notification to bank members (`notify_users`).
3. **`oan_a2c/api/v1/webhook_consent_data.py`**:
   * Implement `bind_user_to_profile(user, profile_name)`:
     - Match by verified `phone_number`.
     - Enforce single-user-to-profile ownership (raise error if profile is already bound to another user).
     - Set `A2C Farmer Profile.user = user` and `A2C Lead.farmer_profile = profile_name`.

#### Acceptance Criteria
- [ ] Farmer can initiate a draft application against any active loan product.
- [ ] Farmer can modify draft fields while in `Draft` status.
- [ ] Submitting without approved consent is rejected with clear error message.
- [ ] Upon approved consent & submission, application state moves to `Processing`.
- [ ] `User` account is permanently bound to `A2C Farmer Profile`.
- [ ] Bank staff are notified of new processing application.

---

### 🎫 BE-104: [Backend] Farmer Catalog & My Applications Endpoints
* **Issue Type:** `Story`
* **Priority:** `High`
* **Components:** `API`
* **Estimated Story Points:** `3`
* **Dependencies:** Blocked by `BE-102`

#### Description
Provide dedicated, secure endpoints for farmers to list active catalog products (with category/tag facets) and retrieve their own loan applications.

#### Technical Details & Files Changed
1. **`oan_a2c/api/v1/farmer/__init__.py`**
2. **`oan_a2c/api/v1/farmer/catalog.py`**:
   * `list_catalog(**kwargs)`: Whitelisted, `allow_guest=False`, validated via schema. Retrieves active products through `get_list` and term categories via `get_all` (`term_type = "Category"`).
   * `get_catalog_product(product_id)`: Fetches full product details and re-verifies active status.
3. **`oan_a2c/api/v1/farmer/applications.py`**:
   * `get_my_applications(**kwargs)`: Returns applications scoped to the caller's profile across all statuses (`Draft`, `Processing`, `Approved`, `Rejected`).

#### Acceptance Criteria
- [ ] `list_catalog` returns active products from all banks with category tags.
- [ ] `get_my_applications` returns all applications associated with the farmer's bound profile.
- [ ] All endpoints strictly follow decorator order: `@frappe.whitelist` -> `@validate_request` -> `@handle_api_errors`.
- [ ] Guest access is denied with 401/403.
- [ ] Unit tests in `test_farmer_catalog.py` pass.

---

### 🎫 BE-105: [Backend] Farmer Saved Products / Bookmarks
* **Issue Type:** `Story`
* **Priority:** `Medium`
* **Components:** `DocType`, `API`, `Patches`
* **Estimated Story Points:** `3`
* **Dependencies:** Blocked by `BE-100`

#### Description
Allow farmers to bookmark/save loan products. Stored as a user-owned (not bank-scoped) doctype with DB-enforced uniqueness per user/product pair.

#### Technical Details & Files Changed
1. **`A2C Saved Product` DocType in `a2c_marketplace`**:
   * Field: `loan_product` (`Link` to `A2C Loan Product`, `reqd: 1`, `search_index: 1`).
   * Scoping: User-owned (`owner` set by Frappe). DocPerm with `if_owner: 1` (`read`, `create`, `delete`).
   * Do **NOT** add to `BANK_SCOPED`.
2. **`oan_a2c/patches/add_saved_product_unique_index.py`**:
   * Add composite unique index `(owner, loan_product)`.
3. **`oan_a2c/api/v1/farmer/bookmarks.py`**:
   * Endpoints: `save_product(loan_product)`, `remove_saved_product(loan_product)`, `get_saved_products()`.
   * `get_saved_products` resolves products through `get_list` so archived/inactive products silently drop out.
4. **`CLAUDE.md` and `docs/multi_tenancy.md`**:
   * Document distinction between bank-scoped (`BANK_SCOPED`) and user-owned (`if_owner`) doctypes.

#### Acceptance Criteria
- [ ] Farmer can save and unsave active loan products.
- [ ] Duplicate saves are prevented by unique DB constraint.
- [ ] Farmer cannot see another user's saved products.
- [ ] Unit tests in `test_saved_products.py` pass.

---

### 🎫 BUG-107 / BE-106: [Backend] Fix Stats Cache Pending Status & Verify Bank Notifications
* **Issue Type:** `Bug`
* **Priority:** `Medium`
* **Components:** `Dashboard`, `Notifications`
* **Estimated Story Points:** `1`

#### Description
Fix the bug in `stats_cache.py` where `_PENDING_STATUSES` references invalid statuses `"Submitted", "Under Review"` instead of `"Processing"`, causing bank dashboard counters to always display 0. Ensure bank notifications fire on submission.

#### Technical Details & Files Changed
1. **`oan_a2c/a2c_marketplace/stats_cache.py`**:
   * Change `_PENDING_STATUSES = {"Submitted", "Under Review"}` to `_PENDING_STATUSES = {"Processing"}`.
2. **`oan_a2c/tests/test_stats_cache.py`**:
   * Add assertions verifying that applications in `Processing` are counted under `pending_applications`.

#### Acceptance Criteria
- [ ] Bank dashboard `pending_applications` metric increments when a farmer submits into `Processing`.
- [ ] Unit tests pass.

---

## 2. Frontend Tickets (`OAN-Access-To-Credit-System`)

### 🎫 FE-201: [Frontend] Farmer Feature Module Architecture & API Service Layer
* **Issue Type:** `Task`
* **Priority:** `High`
* **Components:** `Architecture`, `API Client`
* **Estimated Story Points:** `2`
* **Dependencies:** Blocked by `BE-101`

#### Description
Establish the architectural boundary for farmer-facing features with clean barrel exports, typed API services, and DTO interfaces matching the backend farmer endpoints.

#### Technical Details & Files Changed
1. **`src/features/(farmer-application)/index.ts`**: Barrel export complying with module boundary rules.
2. **`src/features/(farmer-application)/api/farmerApi.ts`**:
   * Service methods: `getCatalog()`, `getCatalogProduct(id)`, `getMyApplications(status?)`, `startApplication(productId, data)`, `submitApplication(applicationId)`, `getBookmarks()`, `saveBookmark(productId)`, `removeBookmark(productId)`.
3. **`src/features/(farmer-application)/types/index.ts`**: TypeScript interfaces for Catalog Products, Applications, Bookmarks, and API responses.

#### Acceptance Criteria
- [ ] Clean barrel export with no circular dependencies.
- [ ] All API requests route through the authenticated proxy client.
- [ ] Types strictly mirror backend schema responses.

---

### 🎫 FE-202: [Frontend] Farmer Authentication, Signup & Login UI
* **Issue Type:** `Story`
* **Priority:** `High`
* **Components:** `Auth UI`, `Pages`
* **Estimated Story Points:** `3`
* **Dependencies:** Blocked by `BE-101`, `FE-201`

#### Description
Implement farmer self-registration (phone + password) and streamline login by removing simulated delays and deprecated `farmerId` fields.

#### Technical Details & Files Changed
1. **`src/app/(portal-account)/signup/farmer/page.tsx`**:
   * Mobile-first registration form (Phone Number, Password, Confirm Password).
   * Integrates with `oan_a2c.api.v1.auth.register_user`.
2. **`src/app/(portal-account)/login/farmer/page.tsx`**:
   * Remove `farmerId` input and fake `setTimeout` simulation.
   * Route login through cookie-setting BFF route `/api/auth/login`.
   * Redirect authenticated farmers to `/discover-loans`.

#### Acceptance Criteria
- [ ] Farmer can sign up with phone and password.
- [ ] Form displays clear validation errors (phone format, password mismatch, duplicate account).
- [ ] Logging in sets httpOnly auth cookies and redirects to `/discover-loans`.

---

### 🎫 FE-203: [Frontend] Loan Catalog Discovery, Draft Editing, Consent & Submission Flow
* **Issue Type:** `Story`
* **Priority:** `High`
* **Components:** `Farmer Portal UI`, `Loan Discovery`, `Applications`
* **Estimated Story Points:** `5`
* **Dependencies:** Blocked by `BE-103`, `BE-104`, `BE-105`, `FE-201`

#### Description
Wire the complete farmer loan application journey: replace mock data with live API endpoints, support saving products, draft creation and editing, consent popup verification (Fayda/OTP), and application status tracking in "My Applications".

#### Technical Details & Files Changed
1. **`src/features/(farmer-application)/discover-loans/`**:
   * Remove `mockLoans.ts`.
   * Connect loan discovery grid and filters to `farmerApi.getCatalog()`.
   * Add interactive bookmark toggle connected to `farmerApi.saveBookmark()` / `removeBookmark()`.
2. **`src/features/(farmer-application)/apply-loans/`**:
   * Wire "Apply Now" to `farmerApi.startApplication()`.
   * Allow editing draft fields before submission.
3. **`src/features/(farmer-application)/consent/`**:
   * Wire `OtpVerificationPopup` for Fayda/OTP consent handshake prior to final submission.
   * Trigger `farmerApi.submitApplication(applicationId)` upon verified consent.
4. **`src/features/(farmer-application)/my-applications/`**:
   * Wire listing to `farmerApi.getMyApplications()`.
   * Display status badges (`Draft`, `Processing`, `Approved`, `Rejected`).

#### Acceptance Criteria
- [ ] Real loan products load dynamically from all participating banks.
- [ ] Farmer can bookmark/unbookmark loans and view saved loans.
- [ ] Farmer can start a loan draft and complete required credit info.
- [ ] Consent modal triggers and verifies OTP before submission.
- [ ] Submitted loans transition to `Processing` and show in "My Applications".

---

## 3. QA & Verification Commands

| Scope | Command | Expected Result |
| :--- | :--- | :--- |
| **Migrations** | `bench --site development.localhost migrate` | Schema syncs, patches 4.1–4.4 apply cleanly without rollback. |
| **Backend Unit Tests** | `bench --site development.localhost run-tests --app oan_a2c` | `test_bank_scope_enforcement`, `test_farmer_catalog`, `test_farmer_applications`, `test_farmer_auth`, `test_saved_products`, `test_workflow_farmer`, `test_stats_cache` all pass. |
| **Decorator Compliance** | `pytest oan_a2c/tests/test_api_decorator_enforcement.py` | All new whitelisted methods carry `@handle_api_errors`. |
| **Frontend Lint & Build** | `pnpm lint && pnpm build` | Clean build with zero TypeScript or boundary violations. |
