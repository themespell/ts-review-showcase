<?php

namespace TSReview;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Database {

	public static function init() {
		$self            = new self();
		$self->rest_base = 'ts-review-showcase';
		add_action( 'init', array( $self, 'tsreview_showcase_post_type' ) );
		add_action( 'rest_api_init', array( $self, 'register_tsreview_showcase_meta' ) );
		add_action( 'rest_api_init', array( $self, 'tsreview_rest_routes' ) );
	}

	/**
	 * Register custom post type for review showcases.
	 */
	public function tsreview_showcase_post_type() {
		$args = array(
			'label'               => __( 'TS Review Showcase', 'ts-review-showcase' ),
			'description'         => __( 'Post Type For TS Review Showcase', 'ts-review-showcase' ),
			'supports'            => array( 'title', 'author' ),
			'hierarchical'        => false,
			'public'              => true,
			'show_ui'             => false,
			'can_export'          => true,
			'has_archive'         => false,
			'exclude_from_search' => true,
			'publicly_queryable'  => true,
			'capability_type'     => 'post',
			'show_in_rest'        => true,
		);

		register_post_type( $this->rest_base, $args );
	}

	/**
	 * Register meta fields for the review showcase post type.
	 */
	public function register_tsreview_showcase_meta() {
		$showcase_meta = array(
			'tsreview_showcase_settings' => 'string',
			'tsreview_reviews'           => 'array',
		);

		foreach ( $showcase_meta as $meta_key => $meta_value_type ) {
			register_meta(
				'post',
				$meta_key,
				array(
					'object_subtype'    => 'ts-review-showcase',
					'type'              => $meta_value_type,
					'single'            => true,
					'show_in_rest'      => false,
					'sanitize_callback' => array( $this, 'sanitize_review_meta' ),
					'auth_callback'     => function () {
						return current_user_can( 'edit_posts' );
					},
				)
			);
		}
	}

	/**
	 * Sanitize review meta values.
	 *
	 * @param mixed $meta_value The meta value to sanitize.
	 * @return array Sanitized array of integers.
	 */
	public function sanitize_review_meta( $meta_value ) {
		return array_map( 'intval', (array) $meta_value );
	}

	/**
	 * Register REST API routes.
	 */
	public function tsreview_rest_routes() {
		register_rest_route(
			'tsreview-showcase/v1',
			'/' . $this->rest_base,
			array(
				'methods'             => \WP_REST_Server::READABLE,
				'callback'            => array( $this, 'get_showcase_data' ),
				'permission_callback' => function() {
                    return current_user_can( 'manage_options' );
                }
			)
		);
	}

	/**
	 * Get showcase data via REST API.
	 *
	 * @return WP_REST_Response REST response with showcase data.
	 */
	public function get_showcase_data() {
		$args = array(
			'post_type' => $this->rest_base,
		);

		$showcases = get_posts( $args );

		$enhanced_showcases = array();
		if ( ! empty( $showcases ) ) {
			foreach ( $showcases as $showcase ) {
				$showcase_meta = array(
					'showcase_title'        => get_the_title( $showcase->ID ),
					'showcase_settings'     => get_post_meta( $showcase->ID, 'tsreview_showcase_settings', true ),
					'showcase_reviews'      => get_post_meta( $showcase->ID, 'tsreview_reviews', true ),
				);

				$enhanced_showcase    = $showcase_meta;
				$enhanced_showcases[] = $enhanced_showcase;
			}

			return rest_ensure_response( $enhanced_showcases );
		} else {
			return wp_send_json_error( 'no_showcases_found', 'No showcases found.', array( 'status' => 404 ) );
		}
	}
}
