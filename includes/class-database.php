<?php

namespace TSReview;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Database {

	/**
	 * Post type slug, also used as the REST route base.
	 *
	 * @var string
	 */
	private $rest_base = 'ts-review-showcase';

	public static function init() {
		$self = new self();
		add_action( 'init', array( $self, 'tsreview_showcase_post_type' ) );
		add_action( 'init', array( $self, 'register_tsreview_showcase_meta' ) );
		add_action( 'rest_api_init', array( $self, 'tsreview_rest_routes' ) );
	}

	/**
	 * Register custom post type for review showcases.
	 *
	 * Showcases are settings containers rendered through the shortcode or block,
	 * so they get no public URL, no sitemap entry and no core REST endpoint.
	 */
	public function tsreview_showcase_post_type() {
		$args = array(
			'label'               => __( 'TS Review Showcase', 'ts-review-showcase' ),
			'description'         => __( 'Post Type For TS Review Showcase', 'ts-review-showcase' ),
			'supports'            => array( 'title', 'author' ),
			'hierarchical'        => false,
			'public'              => false,
			'show_ui'             => false,
			'show_in_nav_menus'   => false,
			'can_export'          => true,
			'has_archive'         => false,
			'exclude_from_search' => true,
			'publicly_queryable'  => false,
			'rewrite'             => false,
			'query_var'           => false,
			'capability_type'     => 'post',
			'show_in_rest'        => false,
		);

		register_post_type( $this->rest_base, $args );
	}

	/**
	 * Register meta fields for the review showcase post type.
	 */
	public function register_tsreview_showcase_meta() {
		register_meta(
			'post',
			'tsreview_showcase_settings',
			array(
				'object_subtype' => $this->rest_base,
				'type'           => 'object',
				'single'         => true,
				'show_in_rest'   => false,
				'auth_callback'  => array( $this, 'can_edit_showcase' ),
			)
		);

		// Legacy list of picked review IDs from 1.0.x. No longer written.
		register_meta(
			'post',
			'tsreview_reviews',
			array(
				'object_subtype'    => $this->rest_base,
				'type'              => 'array',
				'single'            => true,
				'show_in_rest'      => false,
				'sanitize_callback' => array( $this, 'sanitize_review_meta' ),
				'auth_callback'     => array( $this, 'can_edit_showcase' ),
			)
		);
	}

	/**
	 * @return bool
	 */
	public function can_edit_showcase() {
		return current_user_can( 'manage_options' );
	}

	/**
	 * Sanitize the legacy review ID list.
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
				'permission_callback' => function () {
					return current_user_can( 'manage_options' );
				},
			)
		);
	}

	/**
	 * Get showcase data via REST API.
	 *
	 * @return \WP_REST_Response|\WP_Error REST response with showcase data.
	 */
	public function get_showcase_data() {
		$showcases = get_posts(
			array(
				'post_type'      => $this->rest_base,
				'post_status'    => 'any',
				'posts_per_page' => -1,
			)
		);

		if ( empty( $showcases ) ) {
			return new \WP_Error( 'no_showcases_found', __( 'No showcases found.', 'ts-review-showcase' ), array( 'status' => 404 ) );
		}

		$enhanced_showcases = array();
		foreach ( $showcases as $showcase ) {
			$enhanced_showcases[] = array(
				'showcase_id'       => $showcase->ID,
				'showcase_title'    => get_the_title( $showcase->ID ),
				'showcase_settings' => get_post_meta( $showcase->ID, 'tsreview_showcase_settings', true ),
			);
		}

		return rest_ensure_response( $enhanced_showcases );
	}
}
