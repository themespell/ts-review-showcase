<?php
/**
 * Remove plugin data on uninstall.
 *
 * @package TSReview
 */

if ( ! defined( 'WP_UNINSTALL_PLUGIN' ) ) {
	exit;
}

$options = array(
	'tsreview_default_showcase_id',
	'tsreview_show_review_form',
	'tsreview_email_notifications',
	'tsreview_notification_email',
	'tsreview_require_purchase',
	'tsreview_auto_approve',
	'tsreview_settings_review_extensions',
	'tsreview_settings_review_discount',
	'tsreview_settings_trust_badges',
	'tsreview_settings_emails',
	'tsreview_settings_messages',
	'tsreview_settings_review_reminder',
	'tsreview_review_form_settings',
	'tsreview_addons',
	'tsreview_logs',
);

foreach ( $options as $option ) {
	delete_option( $option );
}

$showcases = get_posts(
	array(
		'post_type'      => 'ts-review-showcase',
		'post_status'    => 'any',
		'posts_per_page' => -1,
		'fields'         => 'ids',
	)
);

foreach ( $showcases as $showcase_id ) {
	wp_delete_post( (int) $showcase_id, true );
}

wp_clear_scheduled_hook( 'tsreview_send_review_reminder_event' );
