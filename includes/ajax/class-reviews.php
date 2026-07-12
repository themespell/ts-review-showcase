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
			Logger::log( 'review.submit.invalid_missing_fields', array( 'product_id' => $product_id ), 'warning', true );
			wp_send_json_error( array( 'message' => __( 'Please fill in all required fields.', 'ts-review-showcase' ) ) );
		}

		if ( ! is_email( $email ) ) {
			Logger::log( 'review.submit.invalid_email', array( 'product_id' => $product_id ), 'warning', true );
			wp_send_json_error( array( 'message' => __( 'Please provide a valid email address.', 'ts-review-showcase' ) ) );
		}

		if ( $rating < 1 || $rating > 5 ) {
			Logger::log( 'review.submit.invalid_rating', array( 'product_id' => $product_id, 'rating' => $rating ), 'warning', true );
			wp_send_json_error( array( 'message' => __( 'Please select a valid rating.', 'ts-review-showcase' ) ) );
		}

		$plugin_settings = WooCommerceIntegration::get_plugin_settings();

		if ( ! empty( $plugin_settings['general']['require_purchase'] ) ) {
			$user_id = get_current_user_id();
			$verified_purchase = wc_customer_bought_product( $email, $user_id, $product_id );
			if ( ! $verified_purchase ) {
				Logger::log( 'review.submit.blocked_unverified', array( 'product_id' => $product_id, 'email' => $email ), 'warning', true );
				wp_send_json_error( array( 'message' => __( 'Only verified customers can submit reviews for this product.', 'ts-review-showcase' ) ) );
			}
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
				Logger::log( 'review.submit.duplicate_user', array( 'product_id' => $product_id, 'user_id' => $user_id ), 'warning', true );
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
				Logger::log( 'review.submit.duplicate_email', array( 'product_id' => $product_id, 'email' => $email ), 'warning', true );
				wp_send_json_error( array( 'message' => __( 'You have already reviewed this product.', 'ts-review-showcase' ) ) );
			}
		}

		$comment_data = array(
			'comment_post_ID'      => $product_id,
			'comment_author'       => $name,
			'comment_author_email' => $email,
			'comment_content'      => $content,
			'comment_type'         => 'review',
			'comment_approved'     => ! empty( $plugin_settings['general']['auto_approve'] ) ? 1 : 0,
			'user_id'              => $user_id,
		);

		$comment_id = wp_insert_comment( $comment_data );

		if ( is_wp_error( $comment_id ) ) {
			Logger::log( 'review.submit.insert_failed', array( 'product_id' => $product_id ), 'error', true );
			wp_send_json_error( array( 'message' => __( 'Failed to submit review.', 'ts-review-showcase' ) ) );
		}

		// Add rating meta
		update_comment_meta( $comment_id, 'rating', $rating );

		// Add verified flag if user purchased the product
		if ( $user_id ) {
			$verified = wc_customer_bought_product( $email, $user_id, $product_id );
			update_comment_meta( $comment_id, 'verified', $verified ? 1 : 0 );
		} else {
			$verified = wc_customer_bought_product( $email, 0, $product_id );
			update_comment_meta( $comment_id, 'verified', $verified ? 1 : 0 );
		}

		// Store review title if provided
		if ( ! empty( $title ) ) {
			update_comment_meta( $comment_id, 'review_title', $title );
		}

		// Trigger WooCommerce review hooks
		do_action( 'woocommerce_review_added', $comment_id );

		if ( ! empty( $plugin_settings['general']['email_notifications'] ) && is_email( $plugin_settings['general']['notification_email'] ) ) {
			$subject = sprintf( __( 'New review submitted for %s', 'ts-review-showcase' ), get_the_title( $product_id ) );
			$message = sprintf(
				"Reviewer: %s\nEmail: %s\nRating: %s/5\nProduct: %s\n\n%s",
				$name,
				$email,
				$rating,
				get_the_title( $product_id ),
				$content
			);
			wp_mail( $plugin_settings['general']['notification_email'], $subject, $message );
		}

		Logger::log(
			'review.submit.success',
			array(
				'comment_id' => $comment_id,
				'product_id' => $product_id,
				'approved'   => ! empty( $plugin_settings['general']['auto_approve'] ),
			)
		);

		wp_send_json_success( array(
			'message'    => ! empty( $plugin_settings['general']['auto_approve'] ) ? __( 'Review submitted successfully!', 'ts-review-showcase' ) : __( 'Review submitted and awaiting approval.', 'ts-review-showcase' ),
			'comment_id' => $comment_id,
		) );
	}
}
