<?php
namespace TSReview;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Helper {

	public static function init() {
		$self = new self();
		add_action( 'wp_ajax_tsreview/get_custom_form_id', array( $self, 'get_custom_form_id' ) );
		add_action( 'wp_ajax_nopriv_tsreview/get_custom_form_id', array( $self, 'get_custom_form_id' ) );
		add_action( 'wp_ajax_tsreview/get_review_form_settings', array( $self, 'get_review_form_settings' ) );
		add_action( 'wp_ajax_tsreview/save_review_form_settings', array( $self, 'save_review_form_settings' ) );
	}

	/**
	 * Get the custom form ID from settings
	 */
	public function get_custom_form_id() {
		check_ajax_referer( 'tsreview_nonce' );

		$custom_form_id = get_option( 'tsreview_custom_form_id', 0 );

		wp_send_json_success( array(
			'custom_form_id' => (int) $custom_form_id
		) );
	}

	/**
	 * Get review form settings
	 */
	public function get_review_form_settings() {
		check_ajax_referer( 'tsreview_nonce' );

		$settings = get_option( 'tsreview_form_settings', array() );

		// Add custom_form_id separately
		$custom_form_id = get_option( 'tsreview_custom_form_id', '' );

		$data = array_merge(
			array( 'custom_form_id' => $custom_form_id ),
			$settings
		);

		wp_send_json_success( $data );
	}

	/**
	 * Save review form settings
	 */
	public function save_review_form_settings() {
		check_ajax_referer( 'tsreview_nonce' );

		if ( ! current_user_can( 'manage_options' ) ) {
			wp_die();
		}

		$data = isset( $_POST['data'] ) ? $this->sanitize_array( wp_unslash( $_POST['data'] ) ) : array();

		// Extract custom_form_id and save separately
		$custom_form_id = isset( $data['custom_form_id'] ) ? sanitize_text_field( $data['custom_form_id'] ) : '';
		unset( $data['custom_form_id'] );

		// Save custom form ID
		update_option( 'tsreview_custom_form_id', $custom_form_id );

		// Save other settings
		update_option( 'tsreview_form_settings', $data );

		wp_send_json_success( array(
			'message' => 'Settings saved successfully',
			'custom_form_id' => (int) $custom_form_id
		) );
	}

	/**
	 * Recursively sanitize an array.
	 */
	private function sanitize_array( $data ) {
		if ( is_array( $data ) ) {
			return array_map( array( $this, 'sanitize_array' ), $data );
		}
		return sanitize_text_field( $data );
	}

	/**
	 * Get reviews by their comment IDs.
	 *
	 * @param array $review_ids Array of comment IDs.
	 * @return array Result with error status and reviews data.
	 */
	public static function get_reviews_by_ids( $review_ids ) {
		$review_ids = is_array( $review_ids ) ? array_map( 'intval', $review_ids ) : array();

		if ( empty( $review_ids ) ) {
			return array(
				'error'   => true,
				'message' => 'No review IDs provided',
			);
		}

		$reviews = array();

		foreach ( $review_ids as $comment_id ) {
			$comment = get_comment( $comment_id );

			if ( ! $comment || $comment->comment_type !== 'review' ) {
				continue;
			}

			$reviews[] = self::format_review_data( $comment );
		}

		if ( empty( $reviews ) ) {
			return array(
				'error'   => true,
				'message' => 'No valid reviews found',
			);
		}

		return array(
			'error'   => false,
			'reviews' => $reviews,
		);
	}

	/**
	 * Format review data for frontend display.
	 *
	 * @param WP_Comment $comment The comment object.
	 * @return array Formatted review data.
	 */
	public static function format_review_data( $comment ) {
		$rating = get_comment_meta( $comment->comment_ID, 'rating', true );
		$verified = get_comment_meta( $comment->comment_ID, 'verified', true );

		// Get product data
		$product_id = $comment->comment_post_ID;
		$product = wc_get_product( $product_id );

		$product_name = '';
		$product_image = '';
		$product_link = '';

		if ( $product ) {
			$product_name = $product->get_name();
			$image_id = $product->get_image_id();
			$product_image = $image_id ? wp_get_attachment_image_url( $image_id, 'thumbnail' ) : wc_placeholder_img_src();
			$product_link = get_permalink( $product_id );
		}

		// Get reviewer avatar
		$avatar_url = get_avatar_url( $comment->comment_author_email, array( 'size' => 64 ) );

		return array(
			'comment_id'      => $comment->comment_ID,
			'reviewer_name'   => $comment->comment_author,
			'reviewer_email'  => $comment->comment_author_email,
			'avatar_url'      => $avatar_url,
			'rating'          => (int) $rating,
			'review_title'    => $comment->comment_title ?? '',
			'review_content'  => $comment->comment_content,
			'review_date'     => $comment->comment_date,
			'verified'        => (bool) $verified,
			'product_id'      => $product_id,
			'product_name'    => $product_name,
			'product_image'   => $product_image,
			'product_link'    => $product_link,
		);
	}

	/**
	 * Get all WooCommerce reviews.
	 *
	 * @param array $args Optional arguments for filtering.
	 * @return array Reviews array.
	 */
	public static function get_all_reviews( $args = array() ) {
		$defaults = array(
			'status'  => 'approve',
			'type'    => 'review',
			'orderby' => 'comment_date',
			'order'   => 'DESC',
		);

		$args = wp_parse_args( $args, $defaults );

		$comments = get_comments( $args );
		$reviews = array();

		foreach ( $comments as $comment ) {
			$reviews[] = self::format_review_data( $comment );
		}

		return $reviews;
	}
}
