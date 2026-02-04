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
		$isPro      = Common::isProActivated();
		$dependency = array( 'jquery' );

		if ( $isPro ) {
			$dependency[] = 'tsreviewpro-frontend-script';
		}

		wp_enqueue_style( 'tsreview-frontend-css', TSREVIEW_ROOT_DIR_URL . 'includes/assets/frontend/frontend.css' );
		wp_enqueue_script( 'tsreview-frontend-script', TSREVIEW_ROOT_DIR_URL . 'includes/assets/frontend/frontend.js', $dependency, TSREVIEW_VERSION, true );
		wp_localize_script(
			'tsreview-frontend-script',
			'tsreview_settings',
			array(
				'ajax_url' => admin_url( 'admin-ajax.php' ),
				'nonce'    => wp_create_nonce( 'tsreview_nonce' ),
				'is_pro'   => $isPro,
				'devmode'  => false,
			)
		);

		add_filter( 'script_loader_tag', array( $this, 'add_module_type_to_script' ), 10, 3 );
	}

	public function add_module_type_to_script( $tag, $handle, $src ) {
		if ( 'tsreview-frontend-script' === $handle ) {
			return '<script type="module" src="' . esc_url( $src ) . '"></script>';
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
		return '<div class="ts-review-showcase" data-id="' . esc_attr( $atts['id'] ) . '"></div>';
	}
}
