<?php

/**
 *
 * @link              https://themespell.com/
 * @since             1.0.3
 * @package           TS Customer Reviews
 *
 * @wordpress-plugin
 * Plugin Name:       TS Customer Reviews
 * Plugin URI:        https://themespell.com/ts-review-showcase
 * Description:       Beautifully showcase WooCommerce product reviews with custom layouts and multiple showcases.
 * Version:           1.0.4
 * Author:            Themespell
 * Author URI:        https://themespell.com/
 * License:           GPL-2.0+
 * License URI:       http://www.gnu.org/licenses/gpl-2.0.txt
 * Text Domain:       ts-review-showcase
 * Tested up to:      7.0
 * Requires PHP:      7.4
 * Requires at least: 5.0
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

require_once plugin_dir_path( __FILE__ ) . 'class-ts-review-showcase.php';
