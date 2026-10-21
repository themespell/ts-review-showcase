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

		if ( function_exists( 'is_product' ) && is_product() ) {
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

		$isPro      = Common::isProActivated();
		$dependency = array( 'jquery', 'wp-i18n' );
		$features   = class_exists( __NAMESPACE__ . '\\WooCommerceIntegration' )
			? WooCommerceIntegration::get_public_feature_settings()
			: array();

		wp_enqueue_style( 'tsreview-frontend-css', TSREVIEW_ROOT_DIR_URL . 'includes/assets/frontend/frontend.css' );
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
				'ajax_url'         => admin_url( 'admin-ajax.php' ),
				'nonce'            => wp_create_nonce( 'tsreview_nonce' ),
				'is_pro'           => $isPro,
				'devmode'          => false,
				'feature_settings' => $features,
			)
		);

		add_filter( 'script_loader_tag', array( $this, 'add_module_type_to_script' ), 10, 3 );
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

		if ( empty( $atts['id'] ) ) {
			return esc_html__( 'Showcase ID Not Available', 'ts-review-showcase' );
		}

		$this->enqueue_assets();
		return '<div class="ts-review-showcase" data-id="' . esc_attr( $atts['id'] ) . '"></div>';
	}
}
