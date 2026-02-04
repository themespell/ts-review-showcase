<?php

	/**
	 *
	 * @link              https://themespell.com/
	 * @since             1.0.0
	 * @package           TS Review Showcase
	 *
	 * @wordpress-plugin
	 * Plugin Name:       TS Review Showcase
	 * Plugin URI:        https://themespell.com/ts-review-showcase
	 * Description:       Beautifully showcase WooCommerce product reviews with custom layouts and multiple showcases.
	 * Version:           1.0.0
	 * Author:            Themespell
	 * Author URI:        https://themespell.com/
	 * License:           GPL-2.0+
	 * License URI:       http://www.gnu.org/licenses/gpl-2.0.txt
	 * Text Domain:       ts-review-showcase
	 * Tested up to:      6.8
	 * Requires PHP:      7.4
	 * Requires at least: 5.0
	 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

final class TSREVIEW {

	private function __construct() {
		$this->define_constants();
		$this->load_dependency();
		register_activation_hook( __FILE__, array( $this, 'activate' ) );
		register_deactivation_hook( __FILE__, array( $this, 'deactivate' ) );
		add_action( 'plugins_loaded', array( $this, 'init_plugin' ) );
		add_action( 'admin_init', array( $this, 'check_activation_redirect' ) );
	}

	public static function init() {
		static $instance = false;

		if ( ! $instance ) {
			$instance = new self();
		}

			return $instance;
	}

	public function define_constants() {
		define( 'TSREVIEW_VERSION', '1.0.0' );
		define( 'TSREVIEW_PLUGIN_FILE', __FILE__ );
		define( 'TSREVIEW_PLUGIN_BASENAME', plugin_basename( __FILE__ ) );
		define( 'TSREVIEW_ROOT_DIR_PATH', plugin_dir_path( __FILE__ ) );
		define( 'TSREVIEW_ROOT_DIR_URL', plugin_dir_url( __FILE__ ) );
		define( 'TSREVIEW_INCLUDES_DIR_PATH', TSREVIEW_ROOT_DIR_PATH . 'includes/' );
		define( 'TSREVIEW_PLUGIN_SLUG', 'ts-review-showcase' );
	}

	public function on_plugins_loaded() {
		do_action( 'tsreview_loaded' );
	}

	public function init_plugin() {
		$this->dispatch_hooks();
	}

	public function dispatch_hooks() {
		TSReview\Autoload::init();
		TSReview\Database::init();
		TSReview\Admin::init();
		TSReview\AJAX::init();
		TSReview\Enqueue::init();
		TSReview\Frontend::init();

		// Initialize WooCommerce integration if WooCommerce is active
		if ( $this->is_woocommerce_active() ) {
			require_once TSREVIEW_INCLUDES_DIR_PATH . 'class-woocommerce-integration.php';
			TSReview\WooCommerce_Integration::init();
		}
	}

	/**
	 * Check if WooCommerce is active.
	 */
	private function is_woocommerce_active() {
		$active_plugins = apply_filters( 'active_plugins', get_option( 'active_plugins' ) );

		if ( in_array( 'woocommerce/woocommerce.php', $active_plugins, true ) ) {
			return true;
		}

		// Check for network activation
		if ( is_multisite() ) {
			$active_plugins = get_site_option( 'active_sitewide_plugins' );
			if ( isset( $active_plugins['woocommerce/woocommerce.php'] ) ) {
				return true;
			}
		}

		return false;
	}

	public function load_dependency() {
		require_once TSREVIEW_INCLUDES_DIR_PATH . 'class-autoload.php';
	}

	public function activate() {
	    set_transient( 'tsreview_plugin_activated', true, 30 );
	}

	public function deactivate() {
	    delete_transient( 'tsreview_plugin_activated' );
	}

    public function check_activation_redirect() {
            if ( get_transient( 'tsreview_plugin_activated' ) ) {
                delete_transient( 'tsreview_plugin_activated' );
                wp_redirect( admin_url( 'admin.php?page=ts-review-showcase' ) );
                exit;
            }
    }
}

function tsreview_start() {
	return TSREVIEW::init();
}

tsreview_start();
