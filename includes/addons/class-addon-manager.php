<?php
/**
 * Addon Manager — registry, enable/disable, settings CRUD.
 *
 * Integrations marked is_pro are listed here for information only. Their code
 * ships in TS Review Showcase Pro, which marks them available and supplies a
 * settings schema through the tsreview_register_addons filter.
 *
 * @package TSReview
 */

namespace TSReview;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Addon_Manager {

	const OPTION_KEY = 'tsreview_addons';

	/**
	 * Built on first use so add-ons loaded after this plugin can still register.
	 *
	 * @var array<string, array<string, mixed>>|null
	 */
	private static $addons = null;

	public static function init() {
		add_action( 'wp_ajax_tsreview/addons/get', array( __CLASS__, 'ajax_get_addons' ) );
		add_action( 'wp_ajax_tsreview/addons/toggle', array( __CLASS__, 'ajax_toggle_addon' ) );
		add_action( 'wp_ajax_tsreview/addons/save_settings', array( __CLASS__, 'ajax_save_addon_settings' ) );
	}

	/**
	 * Addon registry.
	 *
	 * @return array<string, array<string, mixed>>
	 */
	private static function registry() {
		if ( null !== self::$addons ) {
			return self::$addons;
		}

		$pro = array(
			'google_reviews'     => array(
				'icon'        => '⭐',
				'category'    => 'integration',
				'name'        => __( 'Google Reviews', 'ts-review-showcase' ),
				'description' => __( 'Import and display Google Business reviews with a shortcode.', 'ts-review-showcase' ),
			),
			'google_shopping'    => array(
				'icon'        => '🛍️',
				'category'    => 'seo',
				'name'        => __( 'Google Shopping Feed', 'ts-review-showcase' ),
				'description' => __( 'Generate an XML product feed with review ratings for Google Merchant Center.', 'ts-review-showcase' ),
			),
			'trust_badge_widget' => array(
				'icon'        => '🛡️',
				'category'    => 'trust',
				'name'        => __( 'Floating Trust Badge', 'ts-review-showcase' ),
				'description' => __( 'Store-wide rating badge in a page corner and as a shortcode. Configure it under Settings > Trust Badges.', 'ts-review-showcase' ),
			),
			'mailchimp'          => array(
				'icon'        => '📧',
				'category'    => 'crm',
				'name'        => __( 'Mailchimp', 'ts-review-showcase' ),
				'description' => __( 'Add reviewers to your Mailchimp audience.', 'ts-review-showcase' ),
			),
			'zapier'             => array(
				'icon'        => '⚡',
				'category'    => 'automation',
				'name'        => __( 'Zapier', 'ts-review-showcase' ),
				'description' => __( 'Trigger Zapier workflows when reviews are submitted or replied to.', 'ts-review-showcase' ),
			),
			'slack'              => array(
				'icon'        => '💬',
				'category'    => 'automation',
				'name'        => __( 'Slack', 'ts-review-showcase' ),
				'description' => __( 'Send new review notifications to a Slack channel.', 'ts-review-showcase' ),
			),
			'hubspot'            => array(
				'icon'        => '🎯',
				'category'    => 'crm',
				'name'        => __( 'HubSpot CRM', 'ts-review-showcase' ),
				'description' => __( 'Sync reviewers and their reviews to HubSpot contacts.', 'ts-review-showcase' ),
			),
		);

		$addons = array(
			'woocommerce'     => array(
				'id'          => 'woocommerce',
				'name'        => __( 'WooCommerce', 'ts-review-showcase' ),
				'description' => __( 'Core integration with WooCommerce products and reviews.', 'ts-review-showcase' ),
				'icon'        => '🛒',
				'is_pro'      => false,
				'available'   => true,
				'is_active'   => true,
				'is_core'     => true,
				'category'    => 'integration',
			),
			'email_templates' => array(
				'id'          => 'email_templates',
				'name'        => __( 'Email Templates', 'ts-review-showcase' ),
				'description' => __( 'Review reminder and reward emails. Edit them under Settings > Emails.', 'ts-review-showcase' ),
				'icon'        => '✉️',
				'is_pro'      => false,
				'available'   => true,
				'is_active'   => true,
				'is_core'     => true,
				'category'    => 'communication',
			),
			'schema_markup'   => array(
				'id'          => 'schema_markup',
				'name'        => __( 'Schema Markup', 'ts-review-showcase' ),
				'description' => __( 'Review ratings in WooCommerce product structured data. Turn it on or off under Settings > Review Extensions.', 'ts-review-showcase' ),
				'icon'        => '🔍',
				'is_pro'      => false,
				'available'   => true,
				'is_active'   => true,
				'is_core'     => true,
				'category'    => 'seo',
			),
		);

		foreach ( $pro as $id => $info ) {
			$addons[ $id ] = array_merge(
				array(
					'id'        => $id,
					'is_pro'    => true,
					'available' => false,
					'is_active' => false,
					'is_core'   => false,
					'settings'  => array(),
				),
				$info
			);
		}

		$addons = apply_filters( 'tsreview_register_addons', $addons );

		// The trust badge is configured on the Settings screen, not toggled here.
		if ( isset( $addons['trust_badge_widget'] ) ) {
			$addons['trust_badge_widget']['available'] = Common::isProActivated();
			$addons['trust_badge_widget']['is_core']   = true;
			$addons['trust_badge_widget']['is_active'] = Common::isProActivated();
		}

		self::$addons = $addons;
		return self::$addons;
	}

	public static function get_all_addons() {
		$stored = get_option( self::OPTION_KEY, array() );
		if ( ! is_array( $stored ) ) {
			$stored = array();
		}

		$result = array();
		foreach ( self::registry() as $id => $addon ) {
			$available = ! empty( $addon['available'] );

			if ( $available && empty( $addon['is_core'] ) ) {
				$addon['is_active'] = isset( $stored[ $id ]['is_active'] )
					? (bool) $stored[ $id ]['is_active']
					: ! empty( $addon['is_active'] );
			} elseif ( ! $available ) {
				$addon['is_active'] = false;
			}

			$addon['settings'] = isset( $stored[ $id ]['settings'] ) && is_array( $stored[ $id ]['settings'] )
				? array_merge( $addon['settings'] ?? array(), $stored[ $id ]['settings'] )
				: ( $addon['settings'] ?? array() );
			$result[ $id ]     = $addon;
		}

		return $result;
	}

	public static function get_addon( $id ) {
		$all = self::get_all_addons();
		return isset( $all[ $id ] ) ? $all[ $id ] : null;
	}

	public static function is_active( $id ) {
		$addon = self::get_addon( $id );
		return $addon && ! empty( $addon['available'] ) && $addon['is_active'];
	}

	public static function get_settings( $id ) {
		$addon = self::get_addon( $id );
		return $addon ? ( $addon['settings'] ?? array() ) : array();
	}

	/**
	 * Whether the addon exists, has its code loaded, and can be switched.
	 *
	 * @param string $id Addon id.
	 * @return bool
	 */
	private static function is_switchable( $id ) {
		$registry = self::registry();
		return isset( $registry[ $id ] ) && ! empty( $registry[ $id ]['available'] ) && empty( $registry[ $id ]['is_core'] );
	}

	public static function toggle_addon( $id, $active ) {
		if ( ! self::is_switchable( $id ) ) {
			return false;
		}

		$stored = get_option( self::OPTION_KEY, array() );
		if ( ! is_array( $stored ) ) {
			$stored = array();
		}

		$stored[ $id ]['is_active'] = (bool) $active;
		update_option( self::OPTION_KEY, $stored );

		do_action( 'tsreview_addon_toggled', $id, (bool) $active );
		return true;
	}

	public static function save_addon_settings( $id, $settings ) {
		$registry = self::registry();
		if ( ! isset( $registry[ $id ] ) || empty( $registry[ $id ]['available'] ) ) {
			return false;
		}

		$stored = get_option( self::OPTION_KEY, array() );
		if ( ! is_array( $stored ) ) {
			$stored = array();
		}

		$defaults  = $registry[ $id ]['settings'] ?? array();
		$sanitized = array();
		foreach ( $defaults as $key => $default ) {
			$value = isset( $settings[ $key ] ) ? $settings[ $key ] : $default;
			if ( is_bool( $default ) ) {
				$sanitized[ $key ] = (bool) $value;
			} elseif ( is_int( $default ) ) {
				$sanitized[ $key ] = intval( $value );
			} elseif ( is_array( $default ) ) {
				$sanitized[ $key ] = is_array( $value ) ? array_values( array_map( 'sanitize_text_field', $value ) ) : $default;
			} elseif ( '_url' === substr( $key, -4 ) ) {
				$sanitized[ $key ] = esc_url_raw( (string) $value, array( 'https' ) );
			} else {
				$sanitized[ $key ] = sanitize_text_field( (string) $value );
			}
		}

		$stored[ $id ]['settings'] = $sanitized;
		update_option( self::OPTION_KEY, $stored );

		do_action( 'tsreview_addon_settings_saved', $id, $sanitized );
		return $sanitized;
	}

	public static function ajax_get_addons() {
		check_ajax_referer( 'tsreview_nonce' );

		if ( ! current_user_can( 'manage_options' ) ) {
			wp_send_json_error( array( 'message' => __( 'Unauthorized', 'ts-review-showcase' ) ) );
		}

		wp_send_json_success( self::get_all_addons() );
	}

	public static function ajax_toggle_addon() {
		check_ajax_referer( 'tsreview_nonce' );

		if ( ! current_user_can( 'manage_options' ) ) {
			wp_send_json_error( array( 'message' => __( 'Unauthorized', 'ts-review-showcase' ) ) );
		}

		$addon_id = isset( $_POST['addon_id'] ) ? sanitize_key( wp_unslash( $_POST['addon_id'] ) ) : '';
		$active   = isset( $_POST['active'] ) && '1' === $_POST['active'];

		if ( empty( $addon_id ) ) {
			wp_send_json_error( array( 'message' => __( 'Invalid addon.', 'ts-review-showcase' ) ) );
		}

		if ( self::toggle_addon( $addon_id, $active ) ) {
			wp_send_json_success( array( 'message' => __( 'Addon updated.', 'ts-review-showcase' ) ) );
		}

		wp_send_json_error( array( 'message' => __( 'This addon is not available. Pro integrations need TS Review Showcase Pro.', 'ts-review-showcase' ) ) );
	}

	public static function ajax_save_addon_settings() {
		check_ajax_referer( 'tsreview_nonce' );

		if ( ! current_user_can( 'manage_options' ) ) {
			wp_send_json_error( array( 'message' => __( 'Unauthorized', 'ts-review-showcase' ) ) );
		}

		$addon_id = isset( $_POST['addon_id'] ) ? sanitize_key( wp_unslash( $_POST['addon_id'] ) ) : '';
		$settings = isset( $_POST['settings'] ) ? json_decode( wp_unslash( $_POST['settings'] ), true ) : array(); // phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized -- sanitized per field in save_addon_settings().

		if ( empty( $addon_id ) || ! is_array( $settings ) ) {
			wp_send_json_error( array( 'message' => __( 'Invalid request.', 'ts-review-showcase' ) ) );
		}

		$saved = self::save_addon_settings( $addon_id, $settings );
		if ( false !== $saved ) {
			wp_send_json_success(
				array(
					'settings' => $saved,
					'message'  => __( 'Settings saved.', 'ts-review-showcase' ),
				)
			);
		}

		wp_send_json_error( array( 'message' => __( 'This addon is not available. Pro integrations need TS Review Showcase Pro.', 'ts-review-showcase' ) ) );
	}
}
