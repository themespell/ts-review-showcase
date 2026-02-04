<?php
namespace TSReview;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Reviews {

	public static function init() {
		$self = new self();
		add_action( 'wp_ajax_tsreview/reviews/fetch', array( $self, 'get_reviews' ) );
		add_action( 'wp_ajax_tsreview/reviews/fetch/product', array( $self, 'get_product_reviews' ) );
		add_action( 'wp_ajax_tsreview/reviews/submit', array( $self, 'submit_review' ) );
		add_action( 'wp_ajax_nopriv_tsreview/reviews/submit', array( $self, 'submit_review' ) );
	}

	/**
	 * Fetch all WooCommerce reviews.
	 */
	public function get_reviews() {
		check_ajax_referer( 'tsreview_nonce' );
		if ( ! current_user_can( 'manage_options' ) ) {
			wp_die();
		}

		$args = array(
			'status'  => 'approve',
			'type'    => 'review',
			'number'  => -1,
			'orderby' => 'comment_date',
			'order'   => 'DESC',
		);

		$reviews = Helper::get_all_reviews( $args );

		if ( empty( $reviews ) ) {
			wp_send_json_error( array( 'message' => 'No reviews found' ) );
		}

		wp_send_json_success( $reviews );
	}

	/**
	 * Fetch reviews for a specific product.
	 */
	public function get_product_reviews() {
		check_ajax_referer( 'tsreview_nonce' );

		$product_id = isset( $_POST['product_id'] ) ? (int) $_POST['product_id'] : 0;

		if ( ! $product_id ) {
			wp_send_json_error( array( 'message' => 'Invalid product ID' ) );
		}

		$args = array(
			'status'  => 'approve',
			'type'    => 'review',
			'post_id' => $product_id,
			'number'  => -1,
			'orderby' => 'comment_date',
			'order'   => 'DESC',
		);

		$reviews = Helper::get_all_reviews( $args );

		if ( empty( $reviews ) ) {
			wp_send_json_error( array( 'message' => 'No reviews found for this product' ) );
		}

		wp_send_json_success( $reviews );
	}

	/**
	 * Handle custom review form submission.
	 */
	public function submit_review() {
		check_ajax_referer( 'tsreview_nonce' );

		$product_id = isset( $_POST['product_id'] ) ? (int) $_POST['product_id'] : 0;
		$rating = isset( $_POST['rating'] ) ? (int) $_POST['rating'] : 0;
		$name = isset( $_POST['name'] ) ? sanitize_text_field( wp_unslash( $_POST['name'] ) ) : '';
		$email = isset( $_POST['email'] ) ? sanitize_email( wp_unslash( $_POST['email'] ) ) : '';
		$title = isset( $_POST['title'] ) ? sanitize_text_field( wp_unslash( $_POST['title'] ) ) : '';
		$content = isset( $_POST['content'] ) ? sanitize_textarea_field( wp_unslash( $_POST['content'] ) ) : '';

		// Validate required fields
		if ( ! $product_id || ! $name || ! $email || ! $content ) {
			wp_send_json_error( array( 'message' => __( 'Please fill in all required fields.', 'ts-review-showcase' ) ) );
		}

		if ( ! is_email( $email ) ) {
			wp_send_json_error( array( 'message' => __( 'Please provide a valid email address.', 'ts-review-showcase' ) ) );
		}

		if ( $rating < 1 || $rating > 5 ) {
			wp_send_json_error( array( 'message' => __( 'Please select a valid rating.', 'ts-review-showcase' ) ) );
		}

		// Check if user already reviewed this product
		$user_id = get_current_user_id();

		if ( $user_id ) {
			$args = array(
				'user_id' => $user_id,
				'post_id' => $product_id,
				'type'    => 'review',
				'count'   => true,
			);

			if ( get_comments( $args ) > 0 ) {
				wp_send_json_error( array( 'message' => __( 'You have already reviewed this product.', 'ts-review-showcase' ) ) );
			}
		} else {
			$args = array(
				'author_email' => $email,
				'post_id'      => $product_id,
				'type'         => 'review',
				'count'        => true,
			);

			if ( get_comments( $args ) > 0 ) {
				wp_send_json_error( array( 'message' => __( 'You have already reviewed this product.', 'ts-review-showcase' ) ) );
			}
		}

		$comment_data = array(
			'comment_post_ID'      => $product_id,
			'comment_author'       => $name,
			'comment_author_email' => $email,
			'comment_content'      => $content,
			'comment_type'         => 'review',
			'comment_approved'     => 1, // Auto-approve, can be changed to 0 for moderation
			'user_id'              => $user_id,
		);

		$comment_id = wp_insert_comment( $comment_data );

		if ( is_wp_error( $comment_id ) ) {
			wp_send_json_error( array( 'message' => __( 'Failed to submit review.', 'ts-review-showcase' ) ) );
		}

		// Add rating meta
		update_comment_meta( $comment_id, 'rating', $rating );

		// Add verified flag if user purchased the product
		if ( $user_id ) {
			$verified = wc_customer_bought_product( $email, $user_id, $product_id );
			update_comment_meta( $comment_id, 'verified', $verified ? 1 : 0 );
		}

		// Store review title if provided
		if ( ! empty( $title ) ) {
			update_comment_meta( $comment_id, 'review_title', $title );
		}

		// Trigger WooCommerce review hooks
		do_action( 'woocommerce_review_added', $comment_id );

		wp_send_json_success( array(
			'message'    => __( 'Review submitted successfully!', 'ts-review-showcase' ),
			'comment_id' => $comment_id,
		) );
	}
}
