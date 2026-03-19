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

		// Override WooCommerce reviews tabs
		add_filter( 'woocommerce_product_tabs', array( $self, 'override_reviews_tab' ), 100 );

		// Replace review form
		add_filter( 'woocommerce_product_review_form_args', array( $self, 'override_review_form' ), 100 );

		// Hide default reviews if showcase is active
		add_filter( 'woocommerce_product_review_count', array( $self, 'adjust_review_count' ), 100, 2 );

		// Enqueue frontend assets for product pages
		add_action( 'wp_enqueue_scripts', array( $self, 'enqueue_frontend_assets' ) );

		// Add custom CSS
		add_action( 'wp_head', array( $self, 'add_custom_css' ) );
	}

	/**
	 * Get settings via AJAX.
	 */
	public function get_settings() {
		check_ajax_referer( 'tsreview_nonce' );
		if ( ! current_user_can( 'manage_options' ) ) {
			wp_send_json_error( array( 'message' => 'Permission denied' ) );
		}

		$showcase_id = get_option( 'tsreview_default_showcase_id', 0 );
		$show_form = get_option( 'tsreview_show_review_form', '1' );

		wp_send_json_success( array(
			'default_showcase' => $showcase_id,
			'show_review_form' => $show_form,
		) );
	}

	/**
	 * Save settings via AJAX.
	 */
	public function save_settings() {
		check_ajax_referer( 'tsreview_nonce' );
		if ( ! current_user_can( 'manage_options' ) ) {
			wp_send_json_error( array( 'message' => 'Permission denied' ) );
		}

		$showcase_id = isset( $_POST['default_showcase'] ) ? absint( $_POST['default_showcase'] ) : 0;
		$show_form = isset( $_POST['show_review_form'] ) ? '1' : '';

		update_option( 'tsreview_default_showcase_id', $showcase_id );
		update_option( 'tsreview_show_review_form', $show_form );

		wp_send_json_success( array( 'message' => 'Settings saved successfully' ) );
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

		// Enqueue frontend JS as a module
		$dependency = array( 'jquery' );
		if ( Common::isProActivated() ) {
			$dependency[] = 'ts-review-pro-frontend-script';
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
		);

		wp_add_inline_script(
			'tsreview-frontend-script',
			'window.tsreview_settings = ' . wp_json_encode( $settings ) . ';',
			'before'
		);
	}

	/**
	 * Add custom CSS to hide default WooCommerce form.
	 */
	public function add_custom_css() {
		if ( ! is_product() ) {
			return;
		}

		$showcase_id = $this->get_showcase_id_for_product();

		if ( ! $showcase_id ) {
			return;
		}
		?>
		<style>
			/* Hide default WooCommerce review form */
			.tsreview-hidden-form,
			.woocommerce-Reviews .comment-respond {
				display: none !important;
			}
			/* Ensure our form is visible */
			.ts-review-form-container {
				display: block !important;
			}
			/* Ensure the form wrapper is visible */
			.tsreview-woocommerce-form-wrapper {
				display: block !important;
			}
		</style>
		<?php
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
}
