<?php
/**
 * Integration Settings for Review Showcase
 *
 * Handles settings for product review display.
 *
 * @package TSReview
 */

namespace TSReview;

use TSReview\Common;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class WooCommerceIntegration {

	/**
	 * Initialize the integration settings.
	 */
	public static function init() {
		$self = new self();

		// AJAX handlers for settings
		add_action( 'wp_ajax_tsreview/settings/get', array( $self, 'get_settings' ) );
		add_action( 'wp_ajax_tsreview/settings/save', array( $self, 'save_settings' ) );
		add_action( 'wp_ajax_tsreview/review-form/get', array( $self, 'get_review_form_settings_ajax' ) );
		add_action( 'wp_ajax_tsreview/review-form/save', array( $self, 'save_review_form_settings_ajax' ) );
		add_action( 'wp_ajax_tsreview/emails/send_test', array( $self, 'send_test_email' ) );
		add_action( 'wp_ajax_tsreview/review_reminder/send_test', array( $self, 'send_test_review_reminder' ) );
		add_action( 'wp_ajax_tsreview/messages/send_test', array( $self, 'send_test_message' ) );
		add_action( 'wp_ajax_tsreview/devmode/get_logs', array( $self, 'get_devmode_logs' ) );
		add_action( 'wp_ajax_tsreview/devmode/clear_logs', array( $self, 'clear_devmode_logs' ) );
		add_action( 'wp_ajax_tsreview/devmode/toggle', array( $self, 'toggle_devmode' ) );

		// Override WooCommerce reviews tabs
		add_filter( 'woocommerce_product_tabs', array( $self, 'override_reviews_tab' ), 100 );

		// Replace review form
		add_filter( 'woocommerce_product_review_form_args', array( $self, 'override_review_form' ), 100 );

		// Hide default reviews if showcase is active
		add_filter( 'woocommerce_product_review_count', array( $self, 'adjust_review_count' ), 100, 2 );

		// Enqueue frontend assets for product pages
		add_action( 'wp_enqueue_scripts', array( $self, 'enqueue_frontend_assets' ) );

		// Structured review schema when enabled.
		add_action( 'wp_head', array( $self, 'output_review_schema' ) );

		// Reminder automation.
		add_action( 'woocommerce_order_status_completed', array( $self, 'schedule_review_reminder_for_order' ) );
		add_action( 'tsreview_send_review_reminder_event', array( $self, 'process_scheduled_review_reminder' ) );
	}

	/**
	 * Get default grouped plugin settings.
	 *
	 * @return array<string, mixed>
	 */
	public static function get_default_settings() {
		return array(
			'general'           => array(
				'default_showcase'    => '',
				'show_review_form'    => true,
				'email_notifications' => true,
				'notification_email'  => get_option( 'admin_email' ),
				'require_purchase'    => false,
				'auto_approve'        => true,
			),
			'review_extensions' => array(
				'enhanced_review_ui'   => true,
				'reviews_per_page'     => 6,
				'sort_order'           => 'recent',
				'disable_lightbox'     => false,
				'show_histogram'       => true,
				'enable_schema'        => true,
				'remove_branding'      => true,
				'verified_owner_label' => '',
				'avatar_mode'          => 'standard',
			),
			'review_discount'   => array(
				'enabled'                  => false,
				'incentivized_badge'       => true,
				'incentivized_badge_label' => 'Incentivized',
				'coupon_channel'           => 'email',
				'email_bcc'                => '',
				'email_reply_to'           => get_option( 'admin_email' ),
				'tiers'                    => array(),
			),
			'trust_badges'      => array(
				'enabled'             => false,
				'badge_label'         => 'Trusted Reviews',
				'show_average_rating' => true,
				'show_review_count'   => true,
				'show_verified_claim' => true,
			),
			'emails'            => array(
				'from_name'               => get_bloginfo( 'name' ),
				'from_email'              => get_option( 'admin_email' ),
				'reply_to'                => get_option( 'admin_email' ),
				'accent_color'            => '#575ECF',
				'review_reminder_subject' => 'How was your order?',
				'review_reminder_body'    => 'Tell us what you think about your recent purchase.',
				'review_discount_subject' => 'Your review reward is ready',
				'review_discount_body'    => 'Thanks for your review. Here is your discount reward.',
			),
			'messages'          => array(
				'wa_review_reminder_enabled'  => false,
				'wa_review_reminder_template' => 'Hi {customer_name}, how was your order from {store_name}?',
			),
			'review_reminder'   => array(
				'enabled'          => false,
				'manual_enabled'   => false,
				'consent_required' => true,
				'delay_days'       => 5,
				'sender_name'      => get_bloginfo( 'name' ),
				'tracking_enabled' => false,
			),
		);
	}

	/**
	 * Get sanitized grouped plugin settings.
	 *
	 * @return array<string, mixed>
	 */
	public static function get_plugin_settings() {
		$defaults = self::get_default_settings();

		$settings = array(
			'general'           => array_merge(
				$defaults['general'],
				array(
					'default_showcase'    => (string) get_option( 'tsreview_default_showcase_id', '' ),
					'show_review_form'    => '1' === get_option( 'tsreview_show_review_form', '1' ),
					'email_notifications' => '1' === get_option( 'tsreview_email_notifications', '1' ),
					'notification_email'  => get_option( 'tsreview_notification_email', $defaults['general']['notification_email'] ),
					'require_purchase'    => '1' === get_option( 'tsreview_require_purchase', '' ),
					'auto_approve'        => '1' === get_option( 'tsreview_auto_approve', '1' ),
				)
			),
			'review_extensions' => wp_parse_args( get_option( 'tsreview_settings_review_extensions', array() ), $defaults['review_extensions'] ),
			'review_discount'   => wp_parse_args( get_option( 'tsreview_settings_review_discount', array() ), $defaults['review_discount'] ),
			'trust_badges'      => wp_parse_args( get_option( 'tsreview_settings_trust_badges', array() ), $defaults['trust_badges'] ),
			'emails'            => wp_parse_args( get_option( 'tsreview_settings_emails', array() ), $defaults['emails'] ),
			'messages'          => wp_parse_args( get_option( 'tsreview_settings_messages', array() ), $defaults['messages'] ),
			'review_reminder'   => wp_parse_args( get_option( 'tsreview_settings_review_reminder', array() ), $defaults['review_reminder'] ),
		);

		return self::sanitize_grouped_settings( $settings );
	}

	/**
	 * Return dev mode logs.
	 *
	 * @return void
	 */
	public function get_devmode_logs() {
		check_ajax_referer( 'tsreview_nonce' );
		if ( ! current_user_can( 'manage_options' ) ) {
			wp_send_json_error( array( 'message' => 'Permission denied' ) );
		}

		wp_send_json_success(
			array(
				'enabled' => Logger::is_enabled(),
				'logs'    => array_reverse( Logger::get_logs() ),
			)
		);
	}

	/**
	 * Clear dev mode logs.
	 *
	 * @return void
	 */
	public function clear_devmode_logs() {
		check_ajax_referer( 'tsreview_nonce' );
		if ( ! current_user_can( 'manage_options' ) ) {
			wp_send_json_error( array( 'message' => 'Permission denied' ) );
		}

		Logger::clear_logs();
		Logger::log( 'devmode.logs_cleared', array(), 'info', true );
		wp_send_json_success( array( 'message' => 'Logs cleared.' ) );
	}

	/**
	 * Toggle dev mode logging.
	 *
	 * @return void
	 */
	public function toggle_devmode() {
		check_ajax_referer( 'tsreview_nonce' );
		if ( ! current_user_can( 'manage_options' ) ) {
			wp_send_json_error( array( 'message' => 'Permission denied' ) );
		}

		$enabled = isset( $_POST['enabled'] ) && '1' === (string) wp_unslash( $_POST['enabled'] );
		Logger::set_enabled( $enabled );
		Logger::log( 'devmode.toggled', array( 'enabled' => $enabled ), 'info', true );
		wp_send_json_success( array( 'message' => $enabled ? 'Dev mode enabled.' : 'Dev mode disabled.', 'enabled' => $enabled ) );
	}

	/**
	 * Sanitize grouped plugin settings.
	 *
	 * @param array<string, mixed> $settings Raw settings.
	 * @return array<string, mixed>
	 */
	private static function sanitize_grouped_settings( $settings ) {
		$defaults = self::get_default_settings();
		$settings = wp_parse_args( is_array( $settings ) ? $settings : array(), $defaults );

		$allowed_sort_order  = array( 'recent', 'rating_high', 'rating_low' );
		$allowed_avatar_mode = array( 'standard', 'initials', 'hidden' );

		return array(
			'general'           => array(
				'default_showcase'    => isset( $settings['general']['default_showcase'] ) ? (string) absint( $settings['general']['default_showcase'] ) : '',
				'show_review_form'    => ! empty( $settings['general']['show_review_form'] ),
				'email_notifications' => ! empty( $settings['general']['email_notifications'] ),
				'notification_email'  => sanitize_email( $settings['general']['notification_email'] ?? $defaults['general']['notification_email'] ),
				'require_purchase'    => ! empty( $settings['general']['require_purchase'] ),
				'auto_approve'        => ! empty( $settings['general']['auto_approve'] ),
			),
			'review_extensions' => array(
				'enhanced_review_ui'   => ! empty( $settings['review_extensions']['enhanced_review_ui'] ),
				'reviews_per_page'     => max( 1, min( 24, absint( $settings['review_extensions']['reviews_per_page'] ?? $defaults['review_extensions']['reviews_per_page'] ) ) ),
				'sort_order'           => in_array( $settings['review_extensions']['sort_order'] ?? '', $allowed_sort_order, true ) ? $settings['review_extensions']['sort_order'] : $defaults['review_extensions']['sort_order'],
				'disable_lightbox'     => ! empty( $settings['review_extensions']['disable_lightbox'] ),
				'show_histogram'       => ! empty( $settings['review_extensions']['show_histogram'] ),
				'enable_schema'        => ! empty( $settings['review_extensions']['enable_schema'] ),
				'remove_branding'      => ! empty( $settings['review_extensions']['remove_branding'] ),
				'verified_owner_label' => sanitize_text_field( $settings['review_extensions']['verified_owner_label'] ?? '' ),
				'avatar_mode'          => in_array( $settings['review_extensions']['avatar_mode'] ?? '', $allowed_avatar_mode, true ) ? $settings['review_extensions']['avatar_mode'] : $defaults['review_extensions']['avatar_mode'],
			),
			'review_discount'   => array(
				'enabled'                  => ! empty( $settings['review_discount']['enabled'] ),
				'incentivized_badge'       => ! empty( $settings['review_discount']['incentivized_badge'] ),
				'incentivized_badge_label' => sanitize_text_field( $settings['review_discount']['incentivized_badge_label'] ?? $defaults['review_discount']['incentivized_badge_label'] ),
				'coupon_channel'           => 'wa' === ( $settings['review_discount']['coupon_channel'] ?? '' ) ? 'wa' : 'email',
				'email_bcc'                => sanitize_email( $settings['review_discount']['email_bcc'] ?? '' ),
				'email_reply_to'           => sanitize_email( $settings['review_discount']['email_reply_to'] ?? $defaults['review_discount']['email_reply_to'] ),
				'tiers'                    => isset( $settings['review_discount']['tiers'] ) && is_array( $settings['review_discount']['tiers'] ) ? array_values( $settings['review_discount']['tiers'] ) : array(),
			),
			'trust_badges'      => array(
				'enabled'             => ! empty( $settings['trust_badges']['enabled'] ),
				'badge_label'         => sanitize_text_field( $settings['trust_badges']['badge_label'] ?? $defaults['trust_badges']['badge_label'] ),
				'show_average_rating' => ! empty( $settings['trust_badges']['show_average_rating'] ),
				'show_review_count'   => ! empty( $settings['trust_badges']['show_review_count'] ),
				'show_verified_claim' => ! empty( $settings['trust_badges']['show_verified_claim'] ),
			),
			'emails'            => array(
				'from_name'               => sanitize_text_field( $settings['emails']['from_name'] ?? $defaults['emails']['from_name'] ),
				'from_email'              => sanitize_email( $settings['emails']['from_email'] ?? $defaults['emails']['from_email'] ),
				'reply_to'                => sanitize_email( $settings['emails']['reply_to'] ?? $defaults['emails']['reply_to'] ),
				'accent_color'            => sanitize_hex_color( $settings['emails']['accent_color'] ?? $defaults['emails']['accent_color'] ),
				'review_reminder_subject' => sanitize_text_field( $settings['emails']['review_reminder_subject'] ?? $defaults['emails']['review_reminder_subject'] ),
				'review_reminder_body'    => sanitize_textarea_field( $settings['emails']['review_reminder_body'] ?? $defaults['emails']['review_reminder_body'] ),
				'review_discount_subject' => sanitize_text_field( $settings['emails']['review_discount_subject'] ?? $defaults['emails']['review_discount_subject'] ),
				'review_discount_body'    => sanitize_textarea_field( $settings['emails']['review_discount_body'] ?? $defaults['emails']['review_discount_body'] ),
			),
			'messages'          => array(
				'wa_review_reminder_enabled'  => ! empty( $settings['messages']['wa_review_reminder_enabled'] ),
				'wa_review_reminder_template' => sanitize_textarea_field( $settings['messages']['wa_review_reminder_template'] ?? $defaults['messages']['wa_review_reminder_template'] ),
			),
			'review_reminder'   => array(
				'enabled'          => ! empty( $settings['review_reminder']['enabled'] ),
				'manual_enabled'   => ! empty( $settings['review_reminder']['manual_enabled'] ),
				'consent_required' => ! empty( $settings['review_reminder']['consent_required'] ),
				'delay_days'       => max( 1, min( 60, absint( $settings['review_reminder']['delay_days'] ?? $defaults['review_reminder']['delay_days'] ) ) ),
				'sender_name'      => sanitize_text_field( $settings['review_reminder']['sender_name'] ?? $defaults['review_reminder']['sender_name'] ),
				'tracking_enabled' => ! empty( $settings['review_reminder']['tracking_enabled'] ),
			),
		);
	}

	/**
	 * Get settings via AJAX.
	 */
	public function get_settings() {
		check_ajax_referer( 'tsreview_nonce' );
		if ( ! current_user_can( 'manage_options' ) ) {
			wp_send_json_error( array( 'message' => 'Permission denied' ) );
		}

		$settings = self::get_plugin_settings();

		wp_send_json_success(
			array_merge(
				$settings,
				array(
					'default_showcase' => $settings['general']['default_showcase'],
					'show_review_form' => $settings['general']['show_review_form'] ? '1' : '',
				)
			)
		);
	}

	/**
	 * Save settings via AJAX.
	 */
	public function save_settings() {
		check_ajax_referer( 'tsreview_nonce' );
		if ( ! current_user_can( 'manage_options' ) ) {
			wp_send_json_error( array( 'message' => 'Permission denied' ) );
		}

		$raw_settings = isset( $_POST['settings'] ) ? wp_unslash( $_POST['settings'] ) : null;
		$settings = array();

		if ( is_string( $raw_settings ) ) {
			$decoded = json_decode( $raw_settings, true );
			$settings = is_array( $decoded ) ? $decoded : array();
		}

		if ( empty( $settings ) ) {
			$settings = array(
				'general' => array(
					'default_showcase' => isset( $_POST['default_showcase'] ) ? wp_unslash( $_POST['default_showcase'] ) : '',
					'show_review_form' => isset( $_POST['show_review_form'] ),
				),
			);
		}

		$sanitized = self::sanitize_grouped_settings( $settings );

		update_option( 'tsreview_default_showcase_id', absint( $sanitized['general']['default_showcase'] ) );
		update_option( 'tsreview_show_review_form', $sanitized['general']['show_review_form'] ? '1' : '' );
		update_option( 'tsreview_email_notifications', $sanitized['general']['email_notifications'] ? '1' : '' );
		update_option( 'tsreview_notification_email', $sanitized['general']['notification_email'] );
		update_option( 'tsreview_require_purchase', $sanitized['general']['require_purchase'] ? '1' : '' );
		update_option( 'tsreview_auto_approve', $sanitized['general']['auto_approve'] ? '1' : '' );
		update_option( 'tsreview_settings_review_extensions', $sanitized['review_extensions'] );
		update_option( 'tsreview_settings_review_discount', $sanitized['review_discount'] );
		update_option( 'tsreview_settings_trust_badges', $sanitized['trust_badges'] );
		update_option( 'tsreview_settings_emails', $sanitized['emails'] );
		update_option( 'tsreview_settings_messages', $sanitized['messages'] );
		update_option( 'tsreview_settings_review_reminder', $sanitized['review_reminder'] );

		wp_send_json_success( array( 'message' => 'Settings saved successfully', 'settings' => $sanitized ) );
	}

	/**
	 * Return default review form settings.
	 *
	 * @return array<string, mixed>
	 */
	public static function get_default_review_form_settings() {
		return array(
			'id'           => 'default-review-form',
			'name'         => 'Product page reviews',
			'preset'       => 'card',
			'accent'       => '#2563eb',
			'background'   => '#ffffff',
			'text'         => '#0f172a',
			'radius'       => 16,
			'spacing'      => 2,
			'font'         => 'sans',
			'showLabels'   => true,
			'buttonLabel'  => 'Submit review',
			'buttonStyle'  => 'solid',
			'sections'     => array(
				array(
					'id'         => 'default-section',
					'background' => '',
					'paddingY'   => 16,
					'paddingX'   => 0,
					'gap'        => 16,
					'columns'    => array(
						array(
							'id'      => 'default-column',
							'width'   => '1/1',
							'align'   => 'top',
							'widgets' => array(
								array( 'id' => 'w-heading', 'type' => 'heading', 'settings' => array( 'text' => 'Write a review', 'level' => 'h3' ) ),
								array( 'id' => 'w-paragraph', 'type' => 'paragraph', 'settings' => array( 'text' => 'Share your experience with others.' ) ),
								array( 'id' => 'w-name', 'type' => 'name', 'settings' => array( 'label' => 'Your name', 'placeholder' => 'Jane Doe', 'required' => true ) ),
								array( 'id' => 'w-email', 'type' => 'email', 'settings' => array( 'label' => 'Email', 'placeholder' => 'jane@example.com', 'required' => true ) ),
								array( 'id' => 'w-rating', 'type' => 'rating', 'settings' => array( 'label' => 'Rating', 'required' => true ) ),
								array( 'id' => 'w-title', 'type' => 'title', 'settings' => array( 'label' => 'Headline', 'placeholder' => 'Sum it up in a few words', 'required' => false ) ),
								array( 'id' => 'w-review', 'type' => 'review', 'settings' => array( 'label' => 'Your review', 'placeholder' => 'Tell others what you thought...', 'required' => true ) ),
								array( 'id' => 'w-button', 'type' => 'button', 'settings' => array( 'label' => 'Submit review', 'buttonStyle' => 'solid' ) ),
							),
						),
					),
				),
			),
			'updatedAt'    => time(),
		);
	}

	/**
	 * Get saved review form settings merged with defaults.
	 *
	 * @return array<string, mixed>
	 */
	public static function get_review_form_settings() {
		$saved = get_option( 'tsreview_review_form_settings', array() );

		if ( ! is_array( $saved ) ) {
			$saved = array();
		}

		return self::sanitize_review_form_settings( array_merge( self::get_default_review_form_settings(), $saved ) );
	}

	/**
	 * Sanitize review form settings.
	 *
	 * @param array<string, mixed> $settings Settings to sanitize.
	 * @return array<string, mixed>
	 */
	private static function sanitize_review_form_settings( $settings ) {
		$defaults = self::get_default_review_form_settings();
		$merged   = array_merge( $defaults, is_array( $settings ) ? $settings : array() );
		$allowed_presets = array( 'minimal', 'card', 'editorial', 'playful', 'brutalist' );
		$allowed_fonts = array( 'sans', 'serif' );
		$allowed_button_styles = array( 'solid', 'outline', 'ghost' );
		$allowed_widths = array( '1/1', '1/2', '1/3', '2/3', '1/4', '3/4' );
		$allowed_aligns = array( 'top', 'center', 'bottom' );
		$allowed_widgets = array( 'name', 'email', 'rating', 'title', 'review', 'divider', 'spacer', 'heading', 'paragraph', 'button' );
		$allowed_levels = array( 'h2', 'h3', 'h4' );
		$allowed_divider_styles = array( 'solid', 'dashed', 'dotted' );

		$sections = array();
		if ( isset( $merged['sections'] ) && is_array( $merged['sections'] ) ) {
			foreach ( $merged['sections'] as $section ) {
				if ( empty( $section['id'] ) ) {
					continue;
				}

				$columns = array();
				if ( isset( $section['columns'] ) && is_array( $section['columns'] ) ) {
					foreach ( $section['columns'] as $column ) {
						if ( empty( $column['id'] ) ) {
							continue;
						}

						$widgets = array();
						if ( isset( $column['widgets'] ) && is_array( $column['widgets'] ) ) {
							foreach ( $column['widgets'] as $widget ) {
								if ( empty( $widget['id'] ) || empty( $widget['type'] ) || ! in_array( $widget['type'], $allowed_widgets, true ) ) {
									continue;
								}

								$widget_settings = isset( $widget['settings'] ) && is_array( $widget['settings'] ) ? $widget['settings'] : array();
								$sanitized_widget = array(
									'id'       => sanitize_text_field( $widget['id'] ),
									'type'     => sanitize_key( $widget['type'] ),
									'settings' => array(),
								);

								if ( isset( $widget_settings['label'] ) ) {
									$sanitized_widget['settings']['label'] = sanitize_text_field( $widget_settings['label'] );
								}
								if ( isset( $widget_settings['placeholder'] ) ) {
									$sanitized_widget['settings']['placeholder'] = sanitize_text_field( $widget_settings['placeholder'] );
								}
								if ( isset( $widget_settings['required'] ) ) {
									$sanitized_widget['settings']['required'] = ! empty( $widget_settings['required'] );
								}
								if ( isset( $widget_settings['text'] ) ) {
									$sanitized_widget['settings']['text'] = sanitize_text_field( $widget_settings['text'] );
								}
								if ( isset( $widget_settings['level'] ) && in_array( $widget_settings['level'], $allowed_levels, true ) ) {
									$sanitized_widget['settings']['level'] = $widget_settings['level'];
								}
								if ( isset( $widget_settings['thickness'] ) ) {
									$sanitized_widget['settings']['thickness'] = max( 1, absint( $widget_settings['thickness'] ) );
								}
								if ( isset( $widget_settings['dividerStyle'] ) && in_array( $widget_settings['dividerStyle'], $allowed_divider_styles, true ) ) {
									$sanitized_widget['settings']['dividerStyle'] = $widget_settings['dividerStyle'];
								}
								if ( isset( $widget_settings['height'] ) ) {
									$sanitized_widget['settings']['height'] = max( 0, absint( $widget_settings['height'] ) );
								}
								if ( isset( $widget_settings['buttonStyle'] ) && in_array( $widget_settings['buttonStyle'], $allowed_button_styles, true ) ) {
									$sanitized_widget['settings']['buttonStyle'] = $widget_settings['buttonStyle'];
								}

								$widgets[] = $sanitized_widget;
							}
						}

						$columns[] = array(
							'id'      => sanitize_text_field( $column['id'] ),
							'width'   => in_array( $column['width'], $allowed_widths, true ) ? $column['width'] : '1/1',
							'align'   => in_array( $column['align'], $allowed_aligns, true ) ? $column['align'] : 'top',
							'widgets' => $widgets,
						);
					}
				}

				if ( empty( $columns ) ) {
					continue;
				}

				$sections[] = array(
					'id'         => sanitize_text_field( $section['id'] ),
					'background' => isset( $section['background'] ) ? sanitize_hex_color( $section['background'] ) : '',
					'paddingY'   => isset( $section['paddingY'] ) ? max( 0, absint( $section['paddingY'] ) ) : 16,
					'paddingX'   => isset( $section['paddingX'] ) ? max( 0, absint( $section['paddingX'] ) ) : 0,
					'gap'        => isset( $section['gap'] ) ? max( 0, absint( $section['gap'] ) ) : 16,
					'columns'    => $columns,
				);
			}
		}

		return array(
			'id'          => isset( $merged['id'] ) ? sanitize_text_field( $merged['id'] ) : $defaults['id'],
			'name'        => isset( $merged['name'] ) ? sanitize_text_field( $merged['name'] ) : $defaults['name'],
			'preset'      => isset( $merged['preset'] ) && in_array( $merged['preset'], $allowed_presets, true ) ? $merged['preset'] : $defaults['preset'],
			'accent'      => isset( $merged['accent'] ) ? sanitize_hex_color( $merged['accent'] ) : $defaults['accent'],
			'background'  => isset( $merged['background'] ) ? sanitize_hex_color( $merged['background'] ) : $defaults['background'],
			'text'        => isset( $merged['text'] ) ? sanitize_hex_color( $merged['text'] ) : $defaults['text'],
			'radius'      => isset( $merged['radius'] ) ? max( 0, absint( $merged['radius'] ) ) : $defaults['radius'],
			'spacing'     => isset( $merged['spacing'] ) ? max( 0, min( 3, absint( $merged['spacing'] ) ) ) : $defaults['spacing'],
			'font'        => isset( $merged['font'] ) && in_array( $merged['font'], $allowed_fonts, true ) ? $merged['font'] : $defaults['font'],
			'showLabels'  => ! empty( $merged['showLabels'] ),
			'buttonLabel' => isset( $merged['buttonLabel'] ) ? sanitize_text_field( $merged['buttonLabel'] ) : $defaults['buttonLabel'],
			'buttonStyle' => isset( $merged['buttonStyle'] ) && in_array( $merged['buttonStyle'], $allowed_button_styles, true ) ? $merged['buttonStyle'] : $defaults['buttonStyle'],
			'sections'    => ! empty( $sections ) ? $sections : $defaults['sections'],
			'updatedAt'   => time(),
		);
	}

	/**
	 * Get review form settings via AJAX.
	 */
	public function get_review_form_settings_ajax() {
		check_ajax_referer( 'tsreview_nonce' );
		if ( ! current_user_can( 'manage_options' ) ) {
			wp_send_json_error( array( 'message' => 'Permission denied' ) );
		}

		wp_send_json_success( self::get_review_form_settings() );
	}

	/**
	 * Save review form settings via AJAX.
	 */
	public function save_review_form_settings_ajax() {
		check_ajax_referer( 'tsreview_nonce' );
		if ( ! current_user_can( 'manage_options' ) ) {
			wp_send_json_error( array( 'message' => 'Permission denied' ) );
		}

		$settings = isset( $_POST['settings'] ) ? wp_unslash( $_POST['settings'] ) : array();
		if ( is_string( $settings ) ) {
			$decoded = json_decode( $settings, true );
			$settings = is_array( $decoded ) ? $decoded : array();
		}

		$sanitized = self::sanitize_review_form_settings( $settings );
		update_option( 'tsreview_review_form_settings', $sanitized );

		wp_send_json_success(
			array(
				'message'  => 'Review form settings saved successfully',
				'settings' => $sanitized,
			)
		);
	}

	/**
	 * Send a configured test email.
	 *
	 * @return void
	 */
	public function send_test_email() {
		check_ajax_referer( 'tsreview_nonce' );
		if ( ! current_user_can( 'manage_options' ) ) {
			wp_send_json_error( array( 'message' => 'Permission denied' ) );
		}

		$to       = isset( $_POST['email'] ) ? sanitize_email( wp_unslash( $_POST['email'] ) ) : '';
		$template = isset( $_POST['template'] ) ? sanitize_key( wp_unslash( $_POST['template'] ) ) : 'review_reminder';

		if ( ! is_email( $to ) ) {
			Logger::log( 'email.test.invalid_recipient', array( 'template' => $template ), 'warning', true );
			wp_send_json_error( array( 'message' => 'Valid test email required.' ) );
		}

		$plugin_settings = self::get_plugin_settings();
		$email_settings  = $plugin_settings['emails'];
		$subject         = 'review_discount' === $template ? $email_settings['review_discount_subject'] : $email_settings['review_reminder_subject'];
		$body            = 'review_discount' === $template ? $email_settings['review_discount_body'] : $email_settings['review_reminder_body'];
		$tokens          = array(
			'{store_name}'    => get_bloginfo( 'name' ),
			'{customer_name}' => 'Test Customer',
			'{product_name}'  => 'Sample Product',
			'{review_link}'   => home_url( '/product/sample-product/#reviews' ),
			'{coupon_code}'   => 'TSREVIEW10',
		);

		$sent = $this->send_configured_email(
			$to,
			$this->replace_tokens( $subject, $tokens ),
			$this->replace_tokens( $body, $tokens ),
			'Test Email'
		);

		if ( $sent ) {
			Logger::log( 'email.test.sent', array( 'to' => $to, 'template' => $template ) );
			wp_send_json_success( array( 'message' => 'Test email sent.' ) );
		}

		Logger::log( 'email.test.failed', array( 'to' => $to, 'template' => $template ), 'error', true );
		wp_send_json_error( array( 'message' => 'wp_mail failed while sending test email.' ) );
	}

	/**
	 * Send a manual test reminder email.
	 *
	 * @return void
	 */
	public function send_test_review_reminder() {
		check_ajax_referer( 'tsreview_nonce' );
		if ( ! current_user_can( 'manage_options' ) ) {
			wp_send_json_error( array( 'message' => 'Permission denied' ) );
		}

		$to = isset( $_POST['email'] ) ? sanitize_email( wp_unslash( $_POST['email'] ) ) : '';
		if ( ! is_email( $to ) ) {
			Logger::log( 'reminder.test.invalid_recipient', array(), 'warning', true );
			wp_send_json_error( array( 'message' => 'Valid reminder email required.' ) );
		}

		$sent = $this->send_review_reminder_email(
			$to,
			'Test Customer',
			'Sample Product',
			home_url( '/product/sample-product/#reviews' )
		);

		if ( $sent ) {
			Logger::log( 'reminder.test.sent', array( 'to' => $to ) );
			wp_send_json_success( array( 'message' => 'Test reminder sent.' ) );
		}

		Logger::log( 'reminder.test.failed', array( 'to' => $to ), 'error', true );
		wp_send_json_error( array( 'message' => 'wp_mail failed while sending test reminder.' ) );
	}

	/**
	 * Send test message through external provider hook.
	 *
	 * @return void
	 */
	public function send_test_message() {
		check_ajax_referer( 'tsreview_nonce' );
		if ( ! current_user_can( 'manage_options' ) ) {
			wp_send_json_error( array( 'message' => 'Permission denied' ) );
		}

		$recipient = isset( $_POST['recipient'] ) ? sanitize_text_field( wp_unslash( $_POST['recipient'] ) ) : '';
		if ( '' === $recipient ) {
			Logger::log( 'message.test.invalid_recipient', array(), 'warning', true );
			wp_send_json_error( array( 'message' => 'Recipient is required.' ) );
		}

		$plugin_settings = self::get_plugin_settings();
		$template        = $plugin_settings['messages']['wa_review_reminder_template'];
		$message         = $this->replace_tokens(
			$template,
			array(
				'{store_name}'    => get_bloginfo( 'name' ),
				'{customer_name}' => 'Test Customer',
			)
		);

		$result = apply_filters(
			'tsreview_send_test_message',
			array(
				'success' => false,
				'message' => 'No message provider configured for ts-review-showcase.',
			),
			array(
				'recipient' => $recipient,
				'message'   => $message,
			)
		);

		if ( ! empty( $result['success'] ) ) {
			Logger::log( 'message.test.sent', array( 'recipient' => $recipient ) );
			wp_send_json_success( array( 'message' => $result['message'] ?? 'Test message sent.' ) );
		}

		Logger::log( 'message.test.failed', array( 'recipient' => $recipient, 'reason' => $result['message'] ?? 'provider_not_configured' ), 'error', true );
		wp_send_json_error( array( 'message' => $result['message'] ?? 'No message provider configured.' ) );
	}

	/**
	 * Override WooCommerce reviews tab.
	 */
	public function override_reviews_tab( $tabs ) {
		$product = wc_get_product();

		if ( ! $product ) {
			return $tabs;
		}

		$showcase_id = $this->get_showcase_id_for_product();

		// If no showcase selected globally, return default tabs
		if ( ! $showcase_id ) {
			return $tabs;
		}

		// Override the reviews tab
		if ( isset( $tabs['reviews'] ) ) {
			$tabs['reviews']['callback'] = array( $this, 'render_custom_reviews' );
			$tabs['reviews']['title']     = esc_html__( 'Reviews', 'ts-review-showcase' );
		}

		return $tabs;
	}

	/**
	 * Render custom review showcase content.
	 */
	public function render_custom_reviews( $comments ) {
		$product = wc_get_product();

		if ( ! $product ) {
			return;
		}

		$showcase_id = $this->get_showcase_id_for_product();

		if ( ! $showcase_id ) {
			// Fallback to default
			comments_template();
			return;
		}

		$show_form = get_option( 'tsreview_show_review_form', '1' );

		// Get review count
		$count = $product->get_review_count();

		// Output the review showcase with form
		echo '<div id="reviews" class="woocommerce-Reviews ts-review-showcase-wrapper">';
		echo '<div id="comments">';
		echo '<h2 class="woocommerce-Reviews-title">';

		if ( $count ) {
			/* translators: 1: Review count, 2: Product title */
			printf( esc_html( _n( '%1$s review for %2$s', '%1$s reviews for %2$s', $count, 'ts-review-showcase' ) ), esc_html( $count ), '<span>' . esc_html( get_the_title() ) . '</span>' );
		} else {
			esc_html_e( 'Reviews', 'ts-review-showcase' );
		}

		echo '</h2>';

		$this->render_trust_badge( $product );

		// Review Showcase
		echo '<div class="ts-review-showcase" data-id="' . esc_attr( $showcase_id ) . '"></div>';

		// Review Form - Always rendered, React handles the toggle
		if ( $show_form ) {
			echo '<div class="tsreview-woocommerce-form-wrapper" style="margin-top: 24px;">';
			echo '<div class="ts-review-form-container" data-product-id="' . esc_attr( $product->get_id() ) . '"></div>';
			echo '</div>';
		}

		echo '</div></div>';
	}

	/**
	 * Render trust badge summary.
	 *
	 * @param \WC_Product $product Product instance.
	 * @return void
	 */
	private function render_trust_badge( $product ) {
		$settings = self::get_plugin_settings();
		$badge    = $settings['trust_badges'];

		if ( empty( $badge['enabled'] ) || ! $product ) {
			return;
		}

		$review_count   = (int) $product->get_review_count();
		$average_rating = (float) $product->get_average_rating();
		$verified_text  = $settings['review_extensions']['verified_owner_label'] ? $settings['review_extensions']['verified_owner_label'] : __( 'Verified owner', 'ts-review-showcase' );

		echo '<div class="tsreview-trust-badge" style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin:0 0 20px;padding:14px 16px;border:1px solid rgba(87,94,207,0.12);border-radius:14px;background:linear-gradient(135deg, rgba(87,94,207,0.06), rgba(139,123,255,0.04));">';
		echo '<strong style="color:#1f2340;">' . esc_html( $badge['badge_label'] ) . '</strong>';

		if ( ! empty( $badge['show_average_rating'] ) ) {
			echo '<span style="color:#575ecf;font-weight:600;">' . esc_html( number_format_i18n( $average_rating, 1 ) ) . '/5</span>';
		}

		if ( ! empty( $badge['show_review_count'] ) ) {
			echo '<span style="color:#4b5563;">' . esc_html( sprintf( _n( '%s review', '%s reviews', $review_count, 'ts-review-showcase' ), number_format_i18n( $review_count ) ) ) . '</span>';
		}

		if ( ! empty( $badge['show_verified_claim'] ) ) {
			echo '<span style="color:#15803d;">' . esc_html( $verified_text ) . '</span>';
		}

		echo '</div>';
	}

	/**
	 * Get the showcase ID from global settings.
	 */
	private function get_showcase_id_for_product() {
		$showcase_id = get_option( 'tsreview_default_showcase_id', 0 );

		// Return showcase_id if it's a valid positive integer
		return $showcase_id && $showcase_id > 0 ? absint( $showcase_id ) : null;
	}

	/**
	 * Adjust review count when using custom showcase.
	 */
	public function adjust_review_count( $count, $product ) {
		$showcase_id = $this->get_showcase_id_for_product();

		if ( ! $showcase_id ) {
			return $count;
		}

		// Get actual review count from the showcase
		$review_ids = get_post_meta( $showcase_id, 'tsreview_reviews', true );

		if ( ! empty( $review_ids ) && is_array( $review_ids ) ) {
			return count( $review_ids );
		}

		return $count;
	}

	/**
	 * Enqueue frontend assets for product pages.
	 */
	public function enqueue_frontend_assets() {
		if ( ! is_product() ) {
			return;
		}

		$product = wc_get_product();

		if ( ! $product ) {
			return;
		}

		$showcase_id = $this->get_showcase_id_for_product();

		if ( ! $showcase_id ) {
			return;
		}

		// Enqueue jQuery (required for AJAX)
		wp_enqueue_script( 'jquery' );

		// Enqueue frontend CSS
		wp_enqueue_style(
			'tsreview-frontend-style',
			TSREVIEW_ROOT_DIR_URL . 'includes/assets/frontend/frontend.css',
			array(),
			TSREVIEW_VERSION
		);
		wp_add_inline_style( 'tsreview-frontend-style', Common::sanitize_inline_css( $this->get_custom_css() ) );

		// Enqueue frontend JS as a module
		$dependency = array( 'jquery' );
		if ( Common::isProActivated() ) {
			$dependency[] = 'tsreviewpro-frontend-script';
		}

		wp_enqueue_script(
			'tsreview-frontend-script',
			TSREVIEW_ROOT_DIR_URL . 'includes/assets/frontend/frontend.js',
			$dependency,
			TSREVIEW_VERSION,
			true
		);

		// Add inline script for settings before the module loads
		$settings = array(
			'ajax_url'     => admin_url( 'admin-ajax.php' ),
			'nonce'        => wp_create_nonce( 'tsreview_nonce' ),
			'wp_url'       => site_url(),
			'is_pro'       => Common::isProActivated(),
			'plugin_url'   => TSREVIEW_ROOT_DIR_URL,
			'devmode'      => get_option( 'tsreview_devmode', 0 ),
			'feature_settings' => self::get_plugin_settings(),
			'review_form_settings' => self::get_review_form_settings(),
		);

		wp_add_inline_script(
			'tsreview-frontend-script',
			'window.tsreview_settings = ' . wp_json_encode( $settings ) . ';',
			'before'
		);
	}

	/**
	 * Return custom CSS to hide the default WooCommerce form.
	 */
	private function get_custom_css() {
		return '
		.tsreview-hidden-form,
		.woocommerce-Reviews .comment-respond {
			display: none !important;
		}

		.ts-review-form-container {
			display: block !important;
		}

		.tsreview-woocommerce-form-wrapper {
			display: block !important;
		}';
	}

	/**
	 * Override the default review form - we render our own form.
	 */
	public function override_review_form( $args ) {
		$product = wc_get_product();

		if ( ! $product ) {
			return $args;
		}

		$showcase_id = $this->get_showcase_id_for_product();

		if ( ! $showcase_id ) {
			return $args;
		}

		// Return empty args to hide default WooCommerce form
		return array(
			'class'        => 'tsreview-hidden-form',
			'title_reply'  => '',
			'label_submit' => '',
			'comment_field' => '',
		);
	}

	/**
	 * Output JSON-LD schema for product reviews when enabled.
	 *
	 * @return void
	 */
	public function output_review_schema() {
		if ( ! is_product() ) {
			return;
		}

		$settings = self::get_plugin_settings();
		if ( empty( $settings['review_extensions']['enable_schema'] ) ) {
			return;
		}

		$product = wc_get_product();
		if ( ! $product ) {
			return;
		}

		$reviews = get_comments(
			array(
				'post_id' => $product->get_id(),
				'status'  => 'approve',
				'type'    => 'review',
				'number'  => 5,
			)
		);

		$schema_reviews = array();
		foreach ( $reviews as $review ) {
			$rating = (int) get_comment_meta( $review->comment_ID, 'rating', true );
			if ( $rating < 1 ) {
				continue;
			}

			$schema_reviews[] = array(
				'@type'         => 'Review',
				'author'        => array(
					'@type' => 'Person',
					'name'  => $review->comment_author,
				),
				'reviewBody'    => wp_strip_all_tags( $review->comment_content ),
				'datePublished' => mysql2date( 'c', $review->comment_date ),
				'reviewRating'  => array(
					'@type'       => 'Rating',
					'ratingValue' => $rating,
					'bestRating'  => 5,
				),
			);
		}

		$schema = array(
			'@context' => 'https://schema.org',
			'@type'    => 'Product',
			'name'     => $product->get_name(),
			'url'      => get_permalink( $product->get_id() ),
			'aggregateRating' => array(
				'@type'       => 'AggregateRating',
				'ratingValue' => (float) $product->get_average_rating(),
				'reviewCount' => (int) $product->get_review_count(),
			),
		);

		if ( ! empty( $schema_reviews ) ) {
			$schema['review'] = $schema_reviews;
		}

		echo '<script type="application/ld+json">' . wp_json_encode( $schema ) . '</script>';
	}

	/**
	 * Schedule reminder when order completed.
	 *
	 * @param int $order_id Order ID.
	 * @return void
	 */
	public function schedule_review_reminder_for_order( $order_id ) {
		$settings = self::get_plugin_settings();
		if ( empty( $settings['review_reminder']['enabled'] ) ) {
			return;
		}

		$order = wc_get_order( $order_id );
		if ( ! $order ) {
			Logger::log( 'reminder.schedule.order_missing', array( 'order_id' => $order_id ), 'warning', true );
			return;
		}

		if ( 'yes' === $order->get_meta( '_tsreview_reminder_sent', true ) || 'yes' === $order->get_meta( '_tsreview_reminder_scheduled', true ) ) {
			Logger::log( 'reminder.schedule.skipped_duplicate', array( 'order_id' => $order_id ) );
			return;
		}

		if ( ! empty( $settings['review_reminder']['consent_required'] ) && 'yes' !== $order->get_meta( '_tsreview_review_consent', true ) ) {
			Logger::log( 'reminder.schedule.skipped_consent', array( 'order_id' => $order_id ) );
			return;
		}

		$delay = max( 1, absint( $settings['review_reminder']['delay_days'] ) ) * DAY_IN_SECONDS;
		wp_schedule_single_event( time() + $delay, 'tsreview_send_review_reminder_event', array( $order_id ) );
		$order->update_meta_data( '_tsreview_reminder_scheduled', 'yes' );
		$order->update_meta_data( '_tsreview_reminder_scheduled_at', time() + $delay );
		$order->save();
		Logger::log( 'reminder.schedule.created', array( 'order_id' => $order_id, 'send_at' => time() + $delay ) );
	}

	/**
	 * Process scheduled reminder event.
	 *
	 * @param int $order_id Order ID.
	 * @return void
	 */
	public function process_scheduled_review_reminder( $order_id ) {
		$order = wc_get_order( $order_id );
		if ( ! $order || 'yes' === $order->get_meta( '_tsreview_reminder_sent', true ) ) {
			Logger::log( 'reminder.process.skipped', array( 'order_id' => $order_id ), 'warning', true );
			return;
		}

		$email = $order->get_billing_email();
		if ( ! is_email( $email ) ) {
			Logger::log( 'reminder.process.invalid_email', array( 'order_id' => $order_id ), 'error', true );
			return;
		}

		$product_name = 'your purchase';
		$review_link  = wc_get_page_permalink( 'shop' );
		foreach ( $order->get_items() as $item ) {
			$product = $item->get_product();
			if ( $product ) {
				$product_name = $product->get_name();
				$review_link  = get_permalink( $product->get_id() ) . '#reviews';
				break;
			}
		}

		$sent = $this->send_review_reminder_email(
			$email,
			$order->get_billing_first_name() ? $order->get_billing_first_name() : 'Customer',
			$product_name,
			$review_link
		);

		if ( $sent ) {
			$order->update_meta_data( '_tsreview_reminder_sent', 'yes' );
			$order->update_meta_data( '_tsreview_reminder_sent_at', time() );
			$order->save();
			Logger::log( 'reminder.process.sent', array( 'order_id' => $order_id, 'email' => $email ) );
		} else {
			Logger::log( 'reminder.process.failed', array( 'order_id' => $order_id, 'email' => $email ), 'error', true );
		}
	}

	/**
	 * Send reminder email.
	 *
	 * @param string $to Recipient email.
	 * @param string $customer_name Customer name.
	 * @param string $product_name Product name.
	 * @param string $review_link Review link.
	 * @return bool
	 */
	public function send_review_reminder_email( $to, $customer_name, $product_name, $review_link ) {
		$plugin_settings = self::get_plugin_settings();
		$email_settings  = $plugin_settings['emails'];
		$subject         = $this->replace_tokens(
			$email_settings['review_reminder_subject'],
			array(
				'{store_name}'    => get_bloginfo( 'name' ),
				'{customer_name}' => $customer_name,
				'{product_name}'  => $product_name,
				'{review_link}'   => $review_link,
			)
		);
		$body            = $this->replace_tokens(
			$email_settings['review_reminder_body'],
			array(
				'{store_name}'    => get_bloginfo( 'name' ),
				'{customer_name}' => $customer_name,
				'{product_name}'  => $product_name,
				'{review_link}'   => $review_link,
			)
		);

		return $this->send_configured_email( $to, $subject, $body, $plugin_settings['review_reminder']['sender_name'] ?: get_bloginfo( 'name' ) );
	}

	/**
	 * Send configured HTML email.
	 *
	 * @param string $to Recipient.
	 * @param string $subject Subject.
	 * @param string $body Body.
	 * @param string $heading Heading.
	 * @return bool
	 */
	private function send_configured_email( $to, $subject, $body, $heading ) {
		$plugin_settings = self::get_plugin_settings();
		$email_settings  = $plugin_settings['emails'];
		$headers         = array( 'Content-Type: text/html; charset=UTF-8' );

		if ( ! empty( $email_settings['from_name'] ) && ! empty( $email_settings['from_email'] ) ) {
			$headers[] = 'From: ' . $email_settings['from_name'] . ' <' . $email_settings['from_email'] . '>';
		}
		if ( ! empty( $email_settings['reply_to'] ) ) {
			$headers[] = 'Reply-To: ' . $email_settings['reply_to'];
		}

		$html = '<div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto;padding:24px;border:1px solid #e5e7eb;border-radius:16px;">';
		$html .= '<div style="font-size:22px;font-weight:700;color:#111827;margin-bottom:12px;">' . esc_html( $heading ) . '</div>';
		$html .= '<div style="font-size:15px;line-height:1.7;color:#374151;white-space:pre-line;">' . nl2br( esc_html( $body ) ) . '</div>';
		$html .= '<div style="margin-top:20px;font-size:12px;color:#6b7280;">' . esc_html( get_bloginfo( 'name' ) ) . '</div>';
		$html .= '</div>';

		$sent = wp_mail( $to, $subject, $html, $headers );
		Logger::log(
			'email.send',
			array(
				'to'      => $to,
				'subject' => $subject,
				'status'  => $sent ? 'sent' : 'failed',
			),
			$sent ? 'info' : 'error',
			! $sent
		);
		return $sent;
	}

	/**
	 * Replace string tokens.
	 *
	 * @param string $content Content with tokens.
	 * @param array<string, string> $tokens Tokens.
	 * @return string
	 */
	private function replace_tokens( $content, $tokens ) {
		return strtr( (string) $content, $tokens );
	}
}
