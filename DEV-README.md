# TS Review Showcase Dev Plan

## Goal

Port selected feature areas from `customer-reviews-woocommerce` into `ts-review-showcase` in staged, maintainable phases.

Source plugin audited:

- `/Users/anonnaabir/Local Sites/themespell/app/public/wp-content/plugins/customer-reviews-woocommerce`

Primary reference tabs:

- `admin.php?page=cr-reviews-settings&tab=review_extensions`
- `admin.php?page=cr-reviews-settings&tab=review_discount`
- `admin.php?page=cr-reviews-settings&tab=trust_badges`
- `admin.php?page=cr-reviews-settings&tab=emails`
- `admin.php?page=cr-reviews-settings&tab=messages`
- `admin.php?page=cr-reviews-settings&tab=review_reminder`

## Current State

`ts-review-showcase` currently has a very small settings backend.

Real saved options today:

- `tsreview_default_showcase_id`
- `tsreview_show_review_form`
- `tsreview_review_form_settings`

Current settings UI in `src/admin/components/Settings.jsx` already shows extra fields, but most are not persisted by backend.

Relevant file:

- `includes/addons/class-woocommerce.php`

## Port Strategy

Do not try to clone CusRev 1:1 in one pass. Build shared settings/data infrastructure first, then layer feature behavior.

### Phase 1: Settings Architecture

Implement a real tabbed settings system inside `ts-review-showcase` for:

- Review Extensions
- Review Discount
- Trust Badges
- Emails
- Messages
- Review Reminder

Requirements:

- central option schema
- load/save endpoints for all tabs
- sanitized persistence
- admin UI mapped to actual saved values
- extensible data shape for future pro features

### Phase 2: Review Extensions

Highest-value, most feasible end-to-end features to wire now:

- enhanced review UI toggle
- default review quantity
- default sorting order
- disable lightbox
- reviews summary bar / histogram
- review schema markup toggle
- custom verified owner label
- avatar mode
- remove branding toggle

Behavior hooks likely touch:

- `includes/ajax/class-helper.php`
- `includes/addons/class-woocommerce.php`
- `src/frontend/*`

### Phase 3: Review Discount

This is a larger subsystem, not only settings.

Needed pieces:

- enable/disable review incentives
- incentivized badge settings
- coupon tier configuration
- existing coupon vs generated coupon rules
- restrictions by roles/categories/products
- email channel settings for coupon delivery
- eventual fulfillment logic after qualifying review submission

Recommended approach:

- first build settings + data model
- then implement coupon issuance flow as separate milestone

### Phase 4: Trust Badges

Needed pieces:

- trust badge enablement and settings
- badge style/location options
- frontend render block/widget/shortcode
- source metrics for rating/review count/verification claims

Recommended approach:

- ship admin config first
- wire frontend render second

### Phase 5: Emails

Needed pieces:

- email template settings
- subject/heading/body/color controls
- from/reply-to/BCC
- test send action
- template-preview/admin management UI

Recommended approach:

- store templates/settings first
- implement send/test pipeline second

### Phase 6: Messages

Needed pieces:

- WhatsApp/message template settings
- channel enablement
- message content variables
- future delivery integration

Recommended approach:

- admin-side template management first
- actual sending integration later

### Phase 7: Review Reminder

Largest subsystem.

Needed pieces:

- automatic/manual reminder enablement
- delay rules
- consent settings
- scheduler/queue
- tracking/status
- reminder templates
- mailer selection
- order-level reminder bookkeeping

Recommended approach:

- define storage + settings first
- implement scheduling/workflow in dedicated milestone

## Practical Build Order

1. Expand backend option storage and sanitization.
2. Replace current single-page Settings UI with tabbed settings sections.
3. Persist all currently visible settings for real.
4. Wire Review Extensions frontend behavior.
5. Add admin-side config models for Discounts, Trust Badges, Emails, Messages, Reminders.
6. Implement heavy operational systems one by one:
   - coupon generation and delivery
   - trust badge frontend
   - email template sending/testing
   - WhatsApp/message delivery
   - reminder scheduling

## Recommended Data Layout

Prefer one namespaced option per domain, for example:

- `tsreview_settings_general`
- `tsreview_settings_review_extensions`
- `tsreview_settings_review_discount`
- `tsreview_settings_trust_badges`
- `tsreview_settings_emails`
- `tsreview_settings_messages`
- `tsreview_settings_review_reminder`

This keeps migration and sanitization isolated.

## Important Constraints

- Avoid direct CusRev code copy without adaptation.
- Keep TS Review Showcase branding/UI consistent.
- Do not expose admin fields that backend cannot save.
- Heavy systems like reminders/coupons/messages need separate business logic, not only React forms.
- Review form and showcase rendering already use React; prefer extending existing data flow instead of bolting on unrelated admin-page patterns.

## Recommended Next Implementation Start

Start with:

1. backend option schema
2. `Settings.jsx` tab redesign
3. AJAX load/save for all settings groups
4. Review Extensions behavior wiring

This gives immediate value and creates base for all later phases.
