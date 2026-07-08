<?php
/**
 * Main Plugin Class
 *
 * @link              https://themespell.com/
 * @since             1.0.2
 * @package           TS Review Showcase
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

final class TSREVIEW {

	private function __construct() {
		$this->define_constants();
		$this->load_dependency();
		register_activation_hook( TSREVIEW_PLUGIN_FILE, array( $this, 'activate' ) );
		register_deactivation_hook( TSREVIEW_PLUGIN_FILE, array( $this, 'deactivate' ) );
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
		define( 'TSREVIEW_VERSION', '1.0.2' );
		define( 'TSREVIEW_PLUGIN_FILE', dirname( __FILE__ ) . '/ts-review-showcase.php' );
		define( 'TSREVIEW_PLUGIN_BASENAME', plugin_basename( TSREVIEW_PLUGIN_FILE ) );
		define( 'TSREVIEW_ROOT_DIR_PATH', plugin_dir_path( TSREVIEW_PLUGIN_FILE ) );
		define( 'TSREVIEW_ROOT_DIR_URL', plugin_dir_url( TSREVIEW_PLUGIN_FILE ) );
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
			TSReview\WooCommerceIntegration::init();
		}
	}

	/**
	 * Check if WooCommerce is active.
	 */
	private function is_woocommerce_active() {
		return in_array( 'woocommerce/woocommerce.php', apply_filters( 'active_plugins', get_option( 'active_plugins' ) ), true );
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
			wp_safe_redirect( admin_url( 'admin.php?page=ts-review-showcase' ) );
			exit;
		}
	}
}

function tsreview_start() {
	return TSREVIEW::init();
}

tsreview_start();
