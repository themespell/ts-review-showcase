<?php
/**
 * File documentation for Common classes.
 *
 * This class is responsible for loading common methods for TSReview.
 *
 * @package TSReview
 */

namespace TSReview;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Class Common
 *
 * This class handles common methods.
 */
class Common {

	/**
	 * Check if Pro version is activated.
	 *
	 * @return bool True if Pro is active, false otherwise.
	 */
	public static function isProActivated() {
		include_once ABSPATH . 'wp-admin/includes/plugin.php';
		$plugin_file = 'tsreview-pro/class-review-pro.php';
		return is_plugin_active( $plugin_file );
	}

	/**
	 * Get current screen info to check if we're on the plugin's admin page.
	 *
	 * @return bool True if on plugin page, false otherwise.
	 */
	public static function get_current_screen_info() {
		$current_screen  = get_current_screen();
		$targeted_screen = 'ts-team_page_tsreview-showcase';
		$targeted_screen_02 = 'toplevel_page_ts-review-showcase';

		if ( $targeted_screen === $current_screen->base || $targeted_screen_02 === $current_screen->base) {
			return true;
		}
		return false;
	}

	/**
	 * Get default showcase settings.
	 *
	 * @return string JSON encoded default settings.
	 */
	public static function get_default_showcase_settings() {
		$showcase_settings = array(
			'selectedView'      => array(
				'label' => 'Grid',
				'value' => 'grid',
				'type'  => 'free',
			),
			'selectedLayout'    => array(
				'label' => 'Card',
				'value' => 'Card',
				'type'  => 'free',
			),
			'layout'            => 'grid',
			'view'              => 'grid',
			'columns'           => 3,
			'column_gap'        => 20,
			'container_width'   => 1200,
			'border_radius'     => 8,
			'background_color'  => '#ffffff',
			'text_color'        => '#333333',
			'star_color'        => '#f5c518',
			'show_images'       => true,
			'show_ratings'      => true,
			'show_dates'        => true,
			'show_product_name' => true,
			'show_verified_badge' => true,
		);

		return wp_json_encode( $showcase_settings );
	}
}
