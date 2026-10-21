<?php

namespace TSReview;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Block {

	public static function init() {
		add_action( 'init', array( __CLASS__, 'register' ) );
	}

	public static function register() {
		wp_register_script(
			'tsreview-showcase-block',
			TSREVIEW_ROOT_DIR_URL . 'includes/blocks/editor.js',
			array( 'wp-blocks', 'wp-element', 'wp-components', 'wp-block-editor' ),
			TSREVIEW_VERSION,
			true
		);

		$showcases = get_posts(
			array(
				'post_type'      => 'ts-review-showcase',
				'post_status'    => 'publish',
				'posts_per_page' => 100,
				'orderby'        => 'title',
				'order'          => 'ASC',
			)
		);
		$options = array();
		foreach ( $showcases as $showcase ) {
			$options[] = array(
				'label' => $showcase->post_title ? $showcase->post_title : '#' . $showcase->ID,
				'value' => (string) $showcase->ID,
			);
		}

		wp_localize_script(
			'tsreview-showcase-block',
			'tsreviewBlockData',
			array(
				'showcases' => $options,
			)
		);

		register_block_type(
			'ts-review-showcase/showcase',
			array(
				'api_version'     => 3,
				'title'           => __( 'Review Showcase', 'ts-review-showcase' ),
				'description'     => __( 'Display a TS Review showcase.', 'ts-review-showcase' ),
				'category'        => 'widgets',
				'icon'            => 'star-filled',
				'editor_script'   => 'tsreview-showcase-block',
				'render_callback' => array( __CLASS__, 'render' ),
				'attributes'      => array(
					'id' => array(
						'type'    => 'string',
						'default' => '',
					),
				),
			)
		);
	}

	/**
	 * @param array<string, mixed> $attributes Block attributes.
	 * @return string
	 */
	public static function render( $attributes ) {
		$id = isset( $attributes['id'] ) ? absint( $attributes['id'] ) : 0;
		if ( ! $id ) {
			return '';
		}

		return do_shortcode( '[ts_review_showcase id="' . $id . '"]' );
	}
}
