<?php

namespace TSReview;

use TSReview\Common;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Frontend {

	public static function init() {
		$self = new self();
		add_action( 'wp_enqueue_scripts', array( $self, 'tsreview_scripts' ) );
		add_action( 'elementor/editor/before_enqueue_scripts', array( $self, 'tsreview_scripts' ) );
		add_action( 'enqueue_block_editor_assets', array( $self, 'tsreview_scripts' ) );
		add_shortcode( 'ts_review_showcase', array( $self, 'ts_review_showcase_shortcode' ) );
	}

	public function tsreview_scripts() {
		if ( ! $this->page_needs_assets() ) {
			return;
		}

		$this->enqueue_assets();
	}

	/**
	 * Load showcase assets only where a showcase or product reviews can render.
	 *
	 * @return bool
	 */
	private function page_needs_assets() {
		if ( is_admin() ) {
			return true;
		}

		// The product reviews tab renders a showcase only when a default one is set.
		if ( function_exists( 'is_product' ) && is_product() && absint( get_option( 'tsreview_default_showcase_id', 0 ) ) ) {
			return true;
		}

		if ( is_singular() ) {
			$post = get_post();
			if ( $post && ( has_shortcode( $post->post_content, 'ts_review_showcase' ) || has_block( 'ts-review-showcase/showcase', $post ) ) ) {
				return true;
			}
		}

		return (bool) apply_filters( 'tsreview_force_frontend_assets', false );
	}

	public function enqueue_assets() {
		if ( wp_script_is( 'tsreview-frontend-script', 'enqueued' ) ) {
			return;
		}

		$isPro       = Common::isProActivated();
		$dependency  = array( 'jquery', 'wp-i18n' );
		$has_wc      = class_exists( __NAMESPACE__ . '\\WooCommerceIntegration' );
		$features    = $has_wc ? WooCommerceIntegration::get_public_feature_settings() : array();
		$review_form = $has_wc ? WooCommerceIntegration::get_review_form_settings() : array();

		wp_enqueue_style( 'tsreview-frontend-css', TSREVIEW_ROOT_DIR_URL . 'includes/assets/frontend/frontend.css', array(), TSREVIEW_VERSION );
		if ( $has_wc ) {
			wp_add_inline_style( 'tsreview-frontend-css', Common::sanitize_inline_css( WooCommerceIntegration::get_custom_css() ) );
		}
		wp_enqueue_script( 'tsreview-frontend-script', TSREVIEW_ROOT_DIR_URL . 'includes/assets/frontend/frontend.js', $dependency, TSREVIEW_VERSION, true );
		wp_set_script_translations( 'tsreview-frontend-script', 'ts-review-showcase', TSREVIEW_ROOT_DIR_PATH . 'languages' );
		wp_localize_script(
			'tsreview-frontend-script',
			'tsreview_i18n',
			Strings::get_translated_strings()
		);
		wp_localize_script(
			'tsreview-frontend-script',
			'tsreview_settings',
			array(
				'ajax_url'             => admin_url( 'admin-ajax.php' ),
				'nonce'                => wp_create_nonce( 'tsreview_nonce' ),
				'wp_url'               => site_url(),
				'plugin_url'           => TSREVIEW_ROOT_DIR_URL,
				'is_pro'               => $isPro,
				'devmode'              => false,
				'feature_settings'     => $features,
				'review_form_settings' => $review_form,
			)
		);

		add_filter( 'script_loader_tag', array( $this, 'add_module_type_to_script' ), 10, 3 );

		/**
		 * Fires after the showcase frontend assets are enqueued, so add-ons can
		 * load scripts that register extra views or details styles.
		 */
		do_action( 'tsreview_frontend_assets_enqueued' );
	}

	public function add_module_type_to_script( $tag, $handle, $src ) {
		if ( 'tsreview-frontend-script' === $handle ) {
			return str_replace( '<script ', '<script type="module" ', $tag );
		}
		return $tag;
	}

	public function ts_review_showcase_shortcode( $atts ) {
		$atts = shortcode_atts(
			array(
				'id' => '',
			),
			$atts,
			'ts_review_showcase'
		);

		$id = absint( $atts['id'] );
		if ( ! $id || 'ts-review-showcase' !== get_post_type( $id ) ) {
			// Only editors need to know the shortcode is broken.
			return current_user_can( 'edit_posts' ) ? esc_html__( 'Showcase ID Not Available', 'ts-review-showcase' ) : '';
		}

		$this->enqueue_assets();
		return '<div class="ts-review-showcase" data-id="' . esc_attr( $id ) . '"></div>';
	}
}
