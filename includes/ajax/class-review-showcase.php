<?php
namespace TSReview;

use TSReview\Helper;
use TSReview\Common;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class ReviewShowcase {

	public static function init() {
		$self = new self();
		add_action( 'wp_ajax_tsreview/review_showcase/fetch', array( $self, 'get_showcase' ) );
		add_action( 'wp_ajax_tsreview/review_showcase/fetch/single', array( $self, 'get_showcase_by_id' ) );
		add_action( 'wp_ajax_nopriv_tsreview/review_showcase/fetch/single', array( $self, 'get_showcase_by_id' ) );
		add_action( 'wp_ajax_tsreview/review_showcase/create', array( $self, 'create_showcase' ) );
		add_action( 'wp_ajax_tsreview/review_showcase/update', array( $self, 'update_showcase' ) );
		add_action( 'wp_ajax_tsreview/review_showcase/update/settings', array( $self, 'update_showcase_settings' ) );
		add_action( 'wp_ajax_tsreview/review_showcase/duplicate', array( $self, 'duplicate_showcase' ) );
		add_action( 'wp_ajax_tsreview/review_showcase/delete', array( $self, 'delete_showcase' ) );
	}

	/**
	 * Fetch all review showcases.
	 */
	public function get_showcase() {
		check_ajax_referer( 'tsreview_nonce' );
		if ( ! current_user_can( 'manage_options' ) ) {
			wp_die();
		}

		$args = array(
			'post_type' => 'ts-review-showcase',
			'posts_per_page' => -1,
			'orderby' => 'date',
			'order' => 'DESC'
		);

		$query = new \WP_Query( $args );

		if ( ! $query->have_posts() ) {
			wp_send_json_error( array( 'message' => 'No showcases found' ) );
		}

		$showcases = array();

		while ( $query->have_posts() ) {
			$query->the_post();

			$showcases[] = array(
				'post_id'   => get_the_ID(),
				'title'     => get_the_title(),
				'shortcode' => '[ts_review_showcase id="' . get_the_ID() . '"]',
				'snippet'   => '<?php echo do_shortcode(\'[ts_review_showcase id="' . get_the_ID() . '"]\'); ?>',
			);
		}

		wp_reset_postdata();

		wp_send_json_success( $showcases );
	}

	/**
	 * Fetch a single showcase by ID.
	 */
	public function get_showcase_by_id() {
		check_ajax_referer( 'tsreview_nonce' );

		$post_id = isset( $_POST['post_id'] ) ? (int) $_POST['post_id'] : 0;

		$args = array(
			'post_type' => 'ts-review-showcase',
			'p'         => $post_id,
		);

		$query = new \WP_Query( $args );

		if ( ! $query->have_posts() ) {
			wp_send_json_error( array( 'message' => 'Showcase not found' ) );
			return;
		}

		$query->the_post();
		$post_id = get_the_ID();

		$showcase_settings = get_post_meta( $post_id, 'tsreview_showcase_settings', true );

		// Fetch ALL approved reviews automatically (no manual selection needed)
		$reviews = Helper::get_all_reviews( array(
			'status'  => 'approve',
			'type'    => 'review',
			'number'  => -1,
			'orderby' => 'comment_date',
			'order'   => 'DESC',
		) );

		$showcase = array(
			'post_id'   => $post_id,
			'title'     => get_the_title( $post_id ),
			'content'   => get_the_content(),
			'meta_data' => array(
				'reviews'            => $reviews ? $reviews : array(),
				'showcase_settings'  => ! empty( $showcase_settings ) ? $showcase_settings : json_decode( Common::get_default_showcase_settings(), true ),
			),
		);

		wp_reset_postdata();
		wp_send_json_success( $showcase );
	}

	/**
	 * Create a new showcase.
	 */
	public function create_showcase() {
		check_ajax_referer( 'tsreview_nonce' );

		if ( ! current_user_can( 'manage_options' ) ) {
			wp_die();
		}

		$showcase_title = isset( $_POST['title'] ) ? sanitize_text_field( wp_unslash( $_POST['title'] ) ) : '';
		$showcase_settings = isset( $_POST['data'] ) ? array_map( function( $item ) {
			return is_array( $item ) ? $item : sanitize_text_field( $item );
		}, wp_unslash( $_POST['data'] ) ) : array();

		$args = array(
			'post_title'  => $showcase_title,
			'post_status' => 'publish',
			'post_author' => get_current_user_id(),
			'post_type'   => 'ts-review-showcase',
		);

		$is_post = wp_insert_post( $args );

		if ( is_wp_error( $is_post ) ) {
			wp_send_json_error( array( 'message' => 'Failed to create showcase' ) );
			return;
		}

		// Reviews are fetched automatically, no need to store IDs
		update_post_meta( $is_post, 'tsreview_showcase_settings', $showcase_settings );
		wp_send_json_success( array( 'post_id' => $is_post ) );
	}

	/**
	 * Update an existing showcase.
	 */
	public function update_showcase() {
		check_ajax_referer( 'tsreview_nonce' );

		if ( ! current_user_can( 'manage_options' ) ) {
			wp_die();
		}

		$post_id = isset( $_POST['data']['post_id'] ) ? absint( $_POST['data']['post_id'] ) : 0;

		if ( ! $post_id ) {
			wp_send_json_error( array( 'message' => 'Invalid ID' ) );
		}

		$showcase_title = isset( $_POST['data']['title'] ) ? sanitize_text_field( wp_unslash( $_POST['data']['title'] ) ) : '';

		$args = array(
			'ID'         => $post_id,
			'post_title' => $showcase_title,
			'post_type'  => 'ts-review-showcase',
		);

		$is_post = wp_update_post( $args );
		wp_send_json_success( array( 'post_id' => $is_post ) );
	}

	/**
	 * Update showcase settings.
	 */
	public function update_showcase_settings() {
		check_ajax_referer( 'tsreview_nonce' );
		if ( ! current_user_can( 'manage_options' ) ) {
			wp_die();
		}

		$post_id = isset( $_POST['post_id'] ) ? absint( $_POST['post_id'] ) : 0;
		$showcase_settings = isset( $_POST['data'] ) ? array_map( function( $item ) {
			return is_array( $item ) ? $item : sanitize_text_field( $item );
		}, wp_unslash( $_POST['data'] ) ) : array();

		$args = array(
			'ID'        => $post_id,
			'post_type' => 'ts-review-showcase',
		);

		$is_post = wp_update_post( $args, true );

		if ( is_wp_error( $is_post ) ) {
			wp_send_json_error( array( 'message' => 'Failed to update showcase' ) );
			return;
		}

		update_post_meta( $post_id, 'tsreview_showcase_settings', $showcase_settings );
		wp_send_json_success( array( 'post_id' => $post_id ) );
	}

	/**
	 * Duplicate an existing showcase.
	 */
	public function duplicate_showcase() {
		check_ajax_referer( 'tsreview_nonce' );

		if ( ! current_user_can( 'manage_options' ) ) {
			wp_die();
		}

		try {
			$post_id = isset( $_POST['post_id'] ) ? absint( $_POST['post_id'] ) : 0;

			if ( ! $post_id ) {
				wp_send_json_error( array( 'message' => 'Invalid ID' ) );
				return;
			}

			$post = get_post( $post_id );

			if ( ! $post || $post->post_type !== 'ts-review-showcase' ) {
				wp_send_json_error( array( 'message' => 'Showcase not found' ) );
				return;
			}

			$showcase_settings = get_post_meta( $post_id, 'tsreview_showcase_settings', true );

			$args = array(
				'post_title'   => $post->post_title . ' (Copy)',
				'post_content' => $post->post_content,
				'post_status'  => 'publish',
				'post_author'  => get_current_user_id(),
				'post_type'    => 'ts-review-showcase',
			);

			$new_post_id = wp_insert_post( $args );

			if ( is_wp_error( $new_post_id ) ) {
				wp_send_json_error( array( 'message' => 'Failed to duplicate showcase: ' . $new_post_id->get_error_message() ) );
				return;
			}

			// Reviews are fetched automatically, no need to store IDs
			update_post_meta( $new_post_id, 'tsreview_showcase_settings', $showcase_settings );

			wp_send_json_success(
				array(
					'message' => 'Showcase duplicated successfully',
					'post_id' => $new_post_id
				)
			);
		} catch ( Exception $e ) {
			wp_send_json_error( array( 'message' => 'Exception occurred: ' . $e->getMessage() ) );
		}
	}

	/**
	 * Delete a showcase.
	 */
	public function delete_showcase() {
		check_ajax_referer( 'tsreview_nonce' );
		if ( ! current_user_can( 'manage_options' ) ) {
			wp_die();
		}

		$post_id = isset( $_POST['post_id'] ) ? absint( $_POST['post_id'] ) : 0;

		if ( ! $post_id ) {
			wp_send_json_error( array( 'message' => 'Invalid showcase ID' ) );
		}

		$deleted = wp_delete_post( $post_id, true );

		if ( $deleted ) {
			wp_send_json_success(
				array(
					'message' => 'Showcase deleted successfully',
					'post_id' => $post_id,
				)
			);
		} else {
			wp_send_json_error( array( 'message' => 'Failed to delete showcase' ) );
		}
	}
}
