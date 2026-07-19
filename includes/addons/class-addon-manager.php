<?php
/**
 * Addon Manager — registry, enable/disable, settings CRUD.
 *
 * @package TSReview
 */

namespace TSReview;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Addon_Manager {

	const OPTION_KEY = 'tsreview_addons';

	private static $addons = array();

	public static function init() {
		add_action( 'wp_ajax_tsreview/addons/get', array( __CLASS__, 'ajax_get_addons' ) );
		add_action( 'wp_ajax_tsreview/addons/toggle', array( __CLASS__, 'ajax_toggle_addon' ) );
		add_action( 'wp_ajax_tsreview/addons/save_settings', array( __CLASS__, 'ajax_save_addon_settings' ) );

		self::register_core_addons();
	}

	private static function register_core_addons() {
		self::$addons = array(
			'woocommerce' => array(
				'id'          => 'woocommerce',
				'name'        => __( 'WooCommerce', 'ts-review-showcase' ),
				'description' => __( 'Core integration with WooCommerce products and reviews.', 'ts-review-showcase' ),
				'icon'        => '🛒',
				'is_pro'      => false,
				'is_active'   => true,
				'is_core'     => true,
				'category'    => 'integration',
			),
			'email_templates' => array(
				'id'          => 'email_templates',
				'name'        => __( 'Email Templates', 'ts-review-showcase' ),
				'description' => __( 'Customizable email templates for review reminders and discount coupons.', 'ts-review-showcase' ),
				'icon'        => '✉️',
				'is_pro'      => false,
				'is_active'   => true,
				'is_core'     => false,
				'category'    => 'communication',
			),
			'schema_markup' => array(
				'id'          => 'schema_markup',
				'name'        => __( 'Schema Markup', 'ts-review-showcase' ),
				'description' => __( 'Output JSON-LD structured data for product reviews to boost SEO.', 'ts-review-showcase' ),
				'icon'        => '🔍',
				'is_pro'      => false,
				'is_active'   => true,
				'is_core'     => false,
				'category'    => 'seo',
			),
			'google_reviews' => array(
				'id'          => 'google_reviews',
				'name'        => __( 'Google Reviews', 'ts-review-showcase' ),
				'description' => __( 'Import and display Google Business reviews on your product pages.', 'ts-review-showcase' ),
				'icon'        => '⭐',
				'is_pro'      => true,
				'is_active'   => false,
				'is_core'     => false,
				'category'    => 'integration',
				'settings'    => array(
					'api_key'       => '',
					'place_id'      => '',
					'review_count'  => 10,
					'sync_interval' => 'weekly',
					'display'       => 'product_page',
				),
			),
			'google_shopping' => array(
				'id'          => 'google_shopping',
				'name'        => __( 'Google Shopping Feed', 'ts-review-showcase' ),
				'description' => __( 'Generate XML product feeds with review ratings for Google Merchant Center.', 'ts-review-showcase' ),
				'icon'        => '🛍️',
				'is_pro'      => true,
				'is_active'   => false,
				'is_core'     => false,
				'category'    => 'seo',
				'settings'    => array(
					'include_rating'     => true,
					'include_review_count' => true,
					'feed_slug'          => 'product-feed',
				),
			),
			'trust_badge_widget' => array(
				'id'          => 'trust_badge_widget',
				'name'        => __( 'Trust Badge Widget', 'ts-review-showcase' ),
				'description' => __( 'Floating trust badge showing real-time store rating and review count.', 'ts-review-showcase' ),
				'icon'        => '🛡️',
				'is_pro'      => true,
				'is_active'   => false,
				'is_core'     => false,
				'category'    => 'trust',
				'settings'    => array(
					'position'  => 'bottom-right',
					'style'     => 'light',
					'show_rating'   => true,
					'show_count'    => true,
				),
			),
			'mailchimp' => array(
				'id'          => 'mailchimp',
				'name'        => __( 'Mailchimp', 'ts-review-showcase' ),
				'description' => __( 'Sync reviewer emails to your Mailchimp audience for remarketing.', 'ts-review-showcase' ),
				'icon'        => '📧',
				'is_pro'      => true,
				'is_active'   => false,
				'is_core'     => false,
				'category'    => 'crm',
				'settings'    => array(
					'api_key'       => '',
					'list_id'       => '',
					'double_optin'  => true,
					'tags'          => '',
				),
			),
			'zapier' => array(
				'id'          => 'zapier',
				'name'        => __( 'Zapier', 'ts-review-showcase' ),
				'description' => __( 'Trigger Zapier workflows when new reviews are submitted.', 'ts-review-showcase' ),
				'icon'        => '⚡',
				'is_pro'      => true,
				'is_active'   => false,
				'is_core'     => false,
				'category'    => 'automation',
				'settings'    => array(
					'webhook_url' => '',
					'events'      => array( 'new_review' ),
				),
			),
			'slack' => array(
				'id'          => 'slack',
				'name'        => __( 'Slack', 'ts-review-showcase' ),
				'description' => __( 'Send review notifications to your Slack channels.', 'ts-review-showcase' ),
				'icon'        => '💬',
				'is_pro'      => true,
				'is_active'   => false,
				'is_core'     => false,
				'category'    => 'automation',
				'settings'    => array(
					'webhook_url' => '',
					'channel'     => '',
					'mention'     => '',
					'events'      => array( 'new_review' ),
				),
			),
			'hubspot' => array(
				'id'          => 'hubspot',
				'name'        => __( 'HubSpot CRM', 'ts-review-showcase' ),
				'description' => __( 'Sync review data and customer contacts to HubSpot CRM.', 'ts-review-showcase' ),
				'icon'        => '🎯',
				'is_pro'      => true,
				'is_active'   => false,
				'is_core'     => false,
				'category'    => 'crm',
				'settings'    => array(
					'api_key'          => '',
					'sync_on_review' => true,
				),
			),
		);

		self::$addons = apply_filters( 'tsreview_register_addons', self::$addons );
	}

	public static function get_all_addons() {
		$stored = get_option( self::OPTION_KEY, array() );
		if ( ! is_array( $stored ) ) {
			$stored = array();
		}

		$result = array();
		foreach ( self::$addons as $id => $addon ) {
			$addon['is_active'] = isset( $stored[ $id ]['is_active'] )
				? (bool) $stored[ $id ]['is_active']
				: $addon['is_active'];
			$addon['settings'] = isset( $stored[ $id ]['settings'] )
				? array_merge( $addon['settings'] ?? array(), $stored[ $id ]['settings'] )
				: ( $addon['settings'] ?? array() );
			$result[ $id ] = $addon;
		}

		return $result;
	}

	public static function get_addon( $id ) {
		$all = self::get_all_addons();
		return isset( $all[ $id ] ) ? $all[ $id ] : null;
	}

	public static function is_active( $id ) {
		$addon = self::get_addon( $id );
		return $addon && $addon['is_active'];
	}

	public static function get_settings( $id ) {
		$addon = self::get_addon( $id );
		return $addon ? ( $addon['settings'] ?? array() ) : array();
	}

	public static function init_active_addons() {
		$addon_classes = array(
			'google_reviews'  => 'Addon_Google_Reviews',
			'google_shopping' => 'Addon_Google_Shopping',
			'mailchimp'       => 'Addon_Mailchimp',
			'zapier'          => 'Addon_Zapier',
			'slack'           => 'Addon_Slack',
			'hubspot'         => 'Addon_HubSpot',
		);

		foreach ( $addon_classes as $id => $class ) {
			if ( self::is_active( $id ) && class_exists( "TSReview\\" . $class ) ) {
				call_user_func( array( "TSReview\\" . $class, 'init' ) );
			}
		}
	}

	public static function toggle_addon( $id, $active ) {
		$stored = get_option( self::OPTION_KEY, array() );
		if ( ! is_array( $stored ) ) {
			$stored = array();
		}

		if ( ! isset( self::$addons[ $id ] ) ) {
			return false;
		}

		$stored[ $id ]['is_active'] = (bool) $active;
		update_option( self::OPTION_KEY, $stored );
		return true;
	}

	public static function save_addon_settings( $id, $settings ) {
		$stored = get_option( self::OPTION_KEY, array() );
		if ( ! is_array( $stored ) ) {
			$stored = array();
		}

		if ( ! isset( self::$addons[ $id ] ) ) {
			return false;
		}

		$defaults = self::$addons[ $id ]['settings'] ?? array();
		$sanitized = array();
		foreach ( $defaults as $key => $default ) {
			$value = isset( $settings[ $key ] ) ? $settings[ $key ] : $default;
			if ( is_bool( $default ) ) {
				$sanitized[ $key ] = (bool) $value;
			} elseif ( is_int( $default ) ) {
				$sanitized[ $key ] = intval( $value );
			} elseif ( is_array( $default ) ) {
				$sanitized[ $key ] = is_array( $value ) ? array_map( 'sanitize_text_field', $value ) : $default;
			} else {
				$sanitized[ $key ] = sanitize_text_field( wp_unslash( $value ) );
			}
		}

		$stored[ $id ]['settings'] = $sanitized;
		update_option( self::OPTION_KEY, $stored );
		return $sanitized;
	}

	public static function ajax_get_addons() {
		check_ajax_referer( 'tsreview_nonce' );

		if ( ! current_user_can( 'manage_options' ) ) {
			wp_send_json_error( array( 'message' => __( 'Unauthorized', 'ts-review-showcase' ) ) );
		}

		$addons = self::get_all_addons();
		wp_send_json_success( $addons );
	}

	public static function ajax_toggle_addon() {
		check_ajax_referer( 'tsreview_nonce' );

		if ( ! current_user_can( 'manage_options' ) ) {
			wp_send_json_error( array( 'message' => __( 'Unauthorized', 'ts-review-showcase' ) ) );
		}

		$addon_id = isset( $_POST['addon_id'] ) ? sanitize_text_field( wp_unslash( $_POST['addon_id'] ) ) : '';
		$active   = isset( $_POST['active'] ) ? '1' === $_POST['active'] : false;

		if ( empty( $addon_id ) ) {
			wp_send_json_error( array( 'message' => __( 'Invalid addon.', 'ts-review-showcase' ) ) );
		}

		$result = self::toggle_addon( $addon_id, $active );
		if ( $result ) {
			wp_send_json_success( array( 'message' => __( 'Addon updated.', 'ts-review-showcase' ) ) );
		} else {
			wp_send_json_error( array( 'message' => __( 'Addon not found.', 'ts-review-showcase' ) ) );
		}
	}

	public static function ajax_save_addon_settings() {
		check_ajax_referer( 'tsreview_nonce' );

		if ( ! current_user_can( 'manage_options' ) ) {
			wp_send_json_error( array( 'message' => __( 'Unauthorized', 'ts-review-showcase' ) ) );
		}

		$addon_id = isset( $_POST['addon_id'] ) ? sanitize_text_field( wp_unslash( $_POST['addon_id'] ) ) : '';
		$settings = isset( $_POST['settings'] ) ? json_decode( wp_unslash( $_POST['settings'] ), true ) : array();

		if ( empty( $addon_id ) || ! is_array( $settings ) ) {
			wp_send_json_error( array( 'message' => __( 'Invalid request.', 'ts-review-showcase' ) ) );
		}

		$saved = self::save_addon_settings( $addon_id, $settings );
		if ( $saved ) {
			wp_send_json_success( array( 'settings' => $saved, 'message' => __( 'Settings saved.', 'ts-review-showcase' ) ) );
		} else {
			wp_send_json_error( array( 'message' => __( 'Addon not found.', 'ts-review-showcase' ) ) );
		}
	}
}
