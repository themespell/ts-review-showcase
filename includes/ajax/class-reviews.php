<?php
namespace TSReview;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Reviews {

	public static function init() {
		$self = new self();
		add_action( 'wp_ajax_tsreview/reviews/fetch', array( $self, 'get_reviews' ) );
		add_action( 'wp_ajax_tsreview/reviews/summary', array( $self, 'get_review_summary' ) );
		add_action( 'wp_ajax_tsreview/reviews/fetch/product', array( $self, 'get_product_reviews' ) );
		add_action( 'wp_ajax_tsreview/reviews/submit', array( $self, 'submit_review' ) );
		add_action( 'wp_ajax_nopriv_tsreview/reviews/submit', array( $self, 'submit_review' ) );
		add_action( 'comment_post', array( $self, 'maybe_fire_review_replied' ), 20, 3 );
	}

	/**
	 * Fire the reply hook when a new comment is a reply to a product review.
	 *
	 * @param int                  $comment_id   New comment ID.
	 * @param int|string           $approved     Approval status.
	 * @param array<string, mixed> $commentdata  Comment data.
	 * @return void
	 */
	public function maybe_fire_review_replied( $comment_id, $approved, $commentdata ) {
		$parent_id = isset( $commentdata['comment_parent'] ) ? (int) $commentdata['comment_parent'] : 0;
		if ( $parent_id < 1 ) {
			return;
		}

		$parent = get_comment( $parent_id );
		if ( ! $parent || 'review' !== $parent->comment_type ) {
			return;
		}

		do_action(
			'tsreview_review_replied',
			array(
				'comment_ID'      => (int) $comment_id,
				'comment_author'  => isset( $commentdata['comment_author'] ) ? $commentdata['comment_author'] : '',
				'comment_content' => isset( $commentdata['comment_content'] ) ? $commentdata['comment_content'] : '',
			),
			$parent_id
		);
	}

	/**
	 * Fetch all WooCommerce reviews.
	 */
	public function get_reviews() {
		check_ajax_referer( 'tsreview_nonce' );
		if ( ! current_user_can( 'manage_options' ) ) {
			wp_die();
		}

		$page     = self::request_page();
		$per_page = self::request_per_page( 20 );
		$args     = array(
			'status'        => 'approve',
			'type'          => 'review',
			'number'        => $per_page,
			'paged'         => $page,
			'orderby'       => 'comment_date',
			'order'         => 'DESC',
			'include_email' => true,
		);

		wp_send_json_success(
			array(
				'reviews'  => Helper::get_all_reviews( $args ),
				'total'    => Helper::count_reviews( $args ),
				'page'     => $page,
				'per_page' => $per_page,
			)
		);
	}

	/**
	 * Dashboard counts and the latest reviews.
	 */
	public function get_review_summary() {
		check_ajax_referer( 'tsreview_nonce' );
		if ( ! current_user_can( 'manage_options' ) ) {
			wp_send_json_error( array( 'message' => __( 'Permission denied', 'ts-review-showcase' ) ) );
		}

		wp_send_json_success( Helper::get_review_summary() );
	}

	/**
	 * Fetch reviews for a specific product.
	 */
	public function get_product_reviews() {
		check_ajax_referer( 'tsreview_nonce' );
		if ( ! current_user_can( 'manage_options' ) ) {
			wp_send_json_error( array( 'message' => __( 'Permission denied', 'ts-review-showcase' ) ) );
		}

		$product_id = isset( $_POST['product_id'] ) ? (int) $_POST['product_id'] : 0;

		if ( ! $product_id || ! self::is_reviewable_product( $product_id ) ) {
			wp_send_json_error( array( 'message' => 'Invalid product ID' ) );
		}

		$page     = self::request_page();
		$per_page = self::request_per_page( 20 );
		$args     = array(
			'status'        => 'approve',
			'type'          => 'review',
			'post_id'       => $product_id,
			'number'        => $per_page,
			'paged'         => $page,
			'orderby'       => 'comment_date',
			'order'         => 'DESC',
			'include_email' => true,
		);

		wp_send_json_success(
			array(
				'reviews'  => Helper::get_all_reviews( $args ),
				'total'    => Helper::count_reviews( $args ),
				'page'     => $page,
				'per_page' => $per_page,
			)
		);
	}

	/**
	 * Handle custom review form submission.
	 */
	public function submit_review() {
		check_ajax_referer( 'tsreview_nonce' );

		if ( ! empty( $_POST['tsreview_hp'] ) ) {
			wp_send_json_error( array( 'message' => __( 'Review could not be submitted.', 'ts-review-showcase' ) ) );
		}

		if ( self::is_rate_limited() ) {
			wp_send_json_error( array( 'message' => __( 'Too many reviews from this connection. Please try again later.', 'ts-review-showcase' ) ) );
		}

		$product_id = isset( $_POST['product_id'] ) ? (int) $_POST['product_id'] : 0;
		$rating = isset( $_POST['rating'] ) ? (int) $_POST['rating'] : 0;
		$name = isset( $_POST['name'] ) ? sanitize_text_field( wp_unslash( $_POST['name'] ) ) : '';
		$email = isset( $_POST['email'] ) ? sanitize_email( wp_unslash( $_POST['email'] ) ) : '';
		$title = isset( $_POST['title'] ) ? sanitize_text_field( wp_unslash( $_POST['title'] ) ) : '';
		$content = isset( $_POST['content'] ) ? sanitize_textarea_field( wp_unslash( $_POST['content'] ) ) : '';

		$input_errors = self::review_input_errors(
			array(
				'product_id' => $product_id,
				'name'       => $name,
				'email'      => $email,
				'content'    => $content,
				'rating'     => $rating,
			)
		);

		if ( in_array( 'missing', $input_errors, true ) || ! self::is_reviewable_product( $product_id ) ) {
			Logger::log( 'review.submit.invalid_missing_fields', array( 'product_id' => $product_id ), 'warning' );
			wp_send_json_error( array( 'message' => __( 'Please fill in all required fields.', 'ts-review-showcase' ) ) );
		}

		if ( in_array( 'email', $input_errors, true ) || ! is_email( $email ) ) {
			Logger::log( 'review.submit.invalid_email', array( 'product_id' => $product_id ), 'warning' );
			wp_send_json_error( array( 'message' => __( 'Please provide a valid email address.', 'ts-review-showcase' ) ) );
		}

		if ( in_array( 'rating', $input_errors, true ) ) {
			Logger::log( 'review.submit.invalid_rating', array( 'product_id' => $product_id, 'rating' => $rating ), 'warning' );
			wp_send_json_error( array( 'message' => __( 'Please select a valid rating.', 'ts-review-showcase' ) ) );
		}

		$plugin_settings = WooCommerceIntegration::get_plugin_settings();
		$user_id = get_current_user_id();
		$verified_purchase = self::customer_bought_product( $user_id, $product_id );

		if ( ! empty( $plugin_settings['general']['require_purchase'] ) && ! $verified_purchase ) {
			Logger::log( 'review.submit.blocked_unverified', array( 'product_id' => $product_id ), 'warning' );
			wp_send_json_error( array( 'message' => __( 'Only verified customers can submit reviews for this product.', 'ts-review-showcase' ) ) );
		}

		$spam_check = apply_filters(
			'tsreview_review_is_spam',
			false,
			array(
				'product_id' => $product_id,
				'name'       => $name,
				'email'      => $email,
				'content'    => $content,
				'rating'     => $rating,
			)
		);
		if ( $spam_check ) {
			Logger::log( 'review.submit.spam', array( 'product_id' => $product_id ), 'warning' );
			wp_send_json_error( array( 'message' => __( 'Review could not be submitted.', 'ts-review-showcase' ) ) );
		}

		if ( $user_id ) {
			$args = array(
				'user_id' => $user_id,
				'post_id' => $product_id,
				'type'    => 'review',
				'count'   => true,
			);

			if ( get_comments( $args ) > 0 ) {
				Logger::log( 'review.submit.duplicate_user', array( 'product_id' => $product_id, 'user_id' => $user_id ), 'warning' );
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
				Logger::log( 'review.submit.duplicate_email', array( 'product_id' => $product_id ), 'warning' );
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

		$comment_data = apply_filters( 'preprocess_comment', $comment_data );
		if ( isset( $comment_data['comment_approved'] ) && in_array( $comment_data['comment_approved'], array( 'spam', 'trash' ), true ) ) {
			Logger::log( 'review.submit.spam', array( 'product_id' => $product_id ), 'warning' );
			wp_send_json_error( array( 'message' => __( 'Review could not be submitted.', 'ts-review-showcase' ) ) );
		}

		$comment_id = wp_insert_comment( wp_slash( $comment_data ) );

		if ( ! $comment_id || is_wp_error( $comment_id ) ) {
			Logger::log( 'review.submit.insert_failed', array( 'product_id' => $product_id ), 'error' );
			wp_send_json_error( array( 'message' => __( 'Failed to submit review.', 'ts-review-showcase' ) ) );
		}

		$rating_saved = update_comment_meta( $comment_id, 'rating', $rating );
		if ( false === $rating_saved ) {
			wp_delete_comment( $comment_id, true );
			Logger::log( 'review.submit.insert_failed', array( 'product_id' => $product_id, 'reason' => 'rating_meta' ), 'error' );
			wp_send_json_error( array( 'message' => __( 'Failed to submit review.', 'ts-review-showcase' ) ) );
		}

		update_comment_meta( $comment_id, 'verified', $verified_purchase ? 1 : 0 );

		if ( ! empty( $title ) ) {
			update_comment_meta( $comment_id, 'review_title', $title );
		}

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

		do_action(
			'tsreview_review_submitted',
			array(
				'comment_ID'     => $comment_id,
				'reviewer_name'  => $name,
				'reviewer_email' => $email,
				'review_content' => $content,
				'rating'         => $rating,
				'product_id'     => $product_id,
			),
			$product_id
		);

		wp_send_json_success( array(
			'message'    => ! empty( $plugin_settings['general']['auto_approve'] ) ? __( 'Review submitted successfully!', 'ts-review-showcase' ) : __( 'Review submitted and awaiting approval.', 'ts-review-showcase' ),
			'comment_id' => $comment_id,
		) );
	}

	/**
	 * Field errors for a review submission before it is stored.
	 *
	 * @param array<string, mixed> $input product_id, name, email, content, rating.
	 * @return string[] missing, email, rating.
	 */
	public static function review_input_errors( $input ) {
		$product_id = isset( $input['product_id'] ) ? (int) $input['product_id'] : 0;
		$rating     = isset( $input['rating'] ) ? (int) $input['rating'] : 0;
		$name       = trim( (string) ( $input['name'] ?? '' ) );
		$email      = trim( (string) ( $input['email'] ?? '' ) );
		$content    = trim( (string) ( $input['content'] ?? '' ) );
		$errors     = array();

		if ( ! $product_id || '' === $name || '' === $email || '' === $content ) {
			$errors[] = 'missing';
		}

		if ( '' !== $email && ! preg_match( '/^[^\s@]+@[^\s@]+\.[^\s@]+$/', $email ) ) {
			$errors[] = 'email';
		}

		if ( $rating < 1 || $rating > 5 ) {
			$errors[] = 'rating';
		}

		return $errors;
	}

	/**
	 * Page number from the current request.
	 *
	 * @return int
	 */
	private static function request_page() {
		return isset( $_POST['page'] ) ? max( 1, absint( $_POST['page'] ) ) : 1;
	}

	/**
	 * Page size from the current request.
	 *
	 * @param int $default Default page size.
	 * @return int
	 */
	private static function request_per_page( $default ) {
		$per_page = isset( $_POST['per_page'] ) ? absint( $_POST['per_page'] ) : $default;
		if ( $per_page < 1 ) {
			$per_page = $default;
		}

		return min( 100, $per_page );
	}

	/**
	 * Whether the ID is a published WooCommerce product.
	 *
	 * @param int $product_id Product ID.
	 * @return bool
	 */
	private static function is_reviewable_product( $product_id ) {
		if ( ! function_exists( 'wc_get_product' ) ) {
			return false;
		}

		$product = wc_get_product( $product_id );
		return $product && 'publish' === get_post_status( $product_id );
	}

	/**
	 * Verified purchase is only true for the logged-in customer who bought the product.
	 *
	 * @param int $user_id User ID.
	 * @param int $product_id Product ID.
	 * @return bool
	 */
	private static function customer_bought_product( $user_id, $product_id ) {
		if ( ! $user_id || ! function_exists( 'wc_customer_bought_product' ) ) {
			return false;
		}

		$user = get_userdata( $user_id );
		if ( ! $user ) {
			return false;
		}

		return (bool) wc_customer_bought_product( $user->user_email, $user_id, $product_id );
	}

	/**
	 * Limit public submissions to five attempts per hour for each IP.
	 *
	 * @return bool
	 */
	private static function is_rate_limited() {
		$ip = isset( $_SERVER['REMOTE_ADDR'] ) ? sanitize_text_field( wp_unslash( $_SERVER['REMOTE_ADDR'] ) ) : 'unknown';
		$key = 'tsreview_rl_' . md5( $ip );
		$count = (int) get_transient( $key );

		if ( $count >= 5 ) {
			return true;
		}

		set_transient( $key, $count + 1, HOUR_IN_SECONDS );
		return false;
	}
}
