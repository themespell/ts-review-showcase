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
		// Guests post from pages that may be served from a page cache, where a
		// nonce goes stale after a day. A guest has no session to forge, so the
		// nonce only guards logged-in customers. Honeypot and rate limit cover guests.
		if ( is_user_logged_in() ) {
			check_ajax_referer( 'tsreview_nonce' );
		}

		if ( ! empty( $_POST['tsreview_hp'] ) ) {
			wp_send_json_error( array( 'message' => __( 'Review could not be submitted.', 'ts-review-showcase' ) ) );
		}

		if ( self::is_rate_limited() ) {
			wp_send_json_error( array( 'message' => __( 'Too many reviews from this connection. Please try again later.', 'ts-review-showcase' ) ) );
		}

		$user_id    = get_current_user_id();
		$user       = $user_id ? get_userdata( $user_id ) : null;
		$product_id = isset( $_POST['product_id'] ) ? (int) $_POST['product_id'] : 0;
		$rating     = isset( $_POST['rating'] ) ? (int) $_POST['rating'] : 0;
		$title      = isset( $_POST['title'] ) ? sanitize_text_field( wp_unslash( $_POST['title'] ) ) : '';
		$content    = isset( $_POST['content'] ) ? sanitize_textarea_field( wp_unslash( $_POST['content'] ) ) : '';

		// A logged-in customer reviews as themselves, not as whatever name or email was typed.
		if ( $user ) {
			$name  = $user->display_name ? $user->display_name : $user->user_login;
			$email = $user->user_email;
		} else {
			$name  = isset( $_POST['name'] ) ? sanitize_text_field( wp_unslash( $_POST['name'] ) ) : '';
			$email = isset( $_POST['email'] ) ? sanitize_email( wp_unslash( $_POST['email'] ) ) : '';
		}

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

		if ( ! comments_open( $product_id ) ) {
			wp_send_json_error( array( 'message' => __( 'Reviews are closed for this product.', 'ts-review-showcase' ) ) );
		}

		if ( in_array( 'email', $input_errors, true ) || ! is_email( $email ) ) {
			Logger::log( 'review.submit.invalid_email', array( 'product_id' => $product_id ), 'warning' );
			wp_send_json_error( array( 'message' => __( 'Please provide a valid email address.', 'ts-review-showcase' ) ) );
		}

		if ( in_array( 'rating', $input_errors, true ) ) {
			Logger::log( 'review.submit.invalid_rating', array( 'product_id' => $product_id, 'rating' => $rating ), 'warning' );
			wp_send_json_error( array( 'message' => __( 'Please select a valid rating.', 'ts-review-showcase' ) ) );
		}

		$plugin_settings   = WooCommerceIntegration::get_plugin_settings();
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

		$duplicate_args = $user_id
			? array( 'user_id' => $user_id )
			: array( 'author_email' => $email );
		$duplicate_args = array_merge(
			$duplicate_args,
			array(
				'post_id' => $product_id,
				'type'    => 'review',
				'parent'  => 0,
				'status'  => array( 'approve', 'hold' ),
				'count'   => true,
			)
		);

		if ( get_comments( $duplicate_args ) > 0 ) {
			Logger::log( 'review.submit.duplicate', array( 'product_id' => $product_id ), 'warning' );
			wp_send_json_error( array( 'message' => __( 'You have already reviewed this product.', 'ts-review-showcase' ) ) );
		}

		$comment_data = array(
			'comment_post_ID'      => $product_id,
			'comment_author'       => $name,
			'comment_author_email' => $email,
			'comment_author_url'   => '',
			'comment_content'      => $content,
			'comment_type'         => 'review',
			'comment_parent'       => 0,
			'user_id'              => $user_id,
			'comment_author_IP'    => self::client_ip(),
			'comment_agent'        => isset( $_SERVER['HTTP_USER_AGENT'] ) ? substr( sanitize_text_field( wp_unslash( $_SERVER['HTTP_USER_AGENT'] ) ), 0, 254 ) : '',
			'comment_date'         => current_time( 'mysql' ),
			'comment_date_gmt'     => current_time( 'mysql', true ),
		);

		$comment_data = apply_filters( 'preprocess_comment', $comment_data );

		// Core checks: duplicate content, flood, disallowed keys, moderation keys, and spam filters (e.g. Akismet).
		$approved = wp_allow_comment( $comment_data, true );
		if ( is_wp_error( $approved ) ) {
			Logger::log( 'review.submit.rejected', array( 'product_id' => $product_id, 'reason' => $approved->get_error_code() ), 'warning' );
			wp_send_json_error( array( 'message' => wp_strip_all_tags( $approved->get_error_message() ) ) );
		}
		if ( in_array( $approved, array( 'spam', 'trash' ), true ) ) {
			Logger::log( 'review.submit.spam', array( 'product_id' => $product_id ), 'warning' );
			wp_send_json_error( array( 'message' => __( 'Review could not be submitted.', 'ts-review-showcase' ) ) );
		}

		// Auto approve only when core would also approve; moderation rules still hold reviews.
		$auto_approve                     = ! empty( $plugin_settings['general']['auto_approve'] );
		$comment_data['comment_approved'] = ( $auto_approve && 1 === (int) $approved ) ? 1 : 0;

		// Meta is stored before WooCommerce recounts the product rating on insert.
		$comment_data['comment_meta'] = array(
			'rating'   => $rating,
			'verified' => $verified_purchase ? 1 : 0,
		);
		if ( '' !== $title ) {
			$comment_data['comment_meta']['review_title'] = $title;
		}

		$comment_id = wp_insert_comment( wp_slash( $comment_data ) );

		if ( ! $comment_id ) {
			Logger::log( 'review.submit.insert_failed', array( 'product_id' => $product_id ), 'error' );
			wp_send_json_error( array( 'message' => __( 'Failed to submit review.', 'ts-review-showcase' ) ) );
		}

		self::record_submission();

		$is_approved = 1 === (int) $comment_data['comment_approved'];

		do_action( 'woocommerce_review_added', $comment_id );

		if ( ! empty( $plugin_settings['general']['email_notifications'] ) && is_email( $plugin_settings['general']['notification_email'] ) ) {
			/* translators: %s: product name */
			$subject = sprintf( __( 'New review submitted for %s', 'ts-review-showcase' ), get_the_title( $product_id ) );
			$message = sprintf(
				/* translators: 1: reviewer name, 2: reviewer email, 3: rating, 4: product name, 5: review text, 6: moderation link */
				__( "Reviewer: %1\$s\nEmail: %2\$s\nRating: %3\$s/5\nProduct: %4\$s\n\n%5\$s\n\nModerate: %6\$s", 'ts-review-showcase' ),
				$name,
				$email,
				$rating,
				get_the_title( $product_id ),
				$content,
				admin_url( 'edit.php?post_type=product&page=product-reviews' )
			);
			wp_mail( $plugin_settings['general']['notification_email'], $subject, $message );
		}

		Logger::log(
			'review.submit.success',
			array(
				'comment_id' => $comment_id,
				'product_id' => $product_id,
				'approved'   => $is_approved,
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

		wp_send_json_success(
			array(
				'message'    => $is_approved ? __( 'Review submitted successfully!', 'ts-review-showcase' ) : __( 'Review submitted and awaiting approval.', 'ts-review-showcase' ),
				'comment_id' => $comment_id,
			)
		);
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
	 * Visitor IP. Sites behind a proxy or CDN can return the real client IP
	 * through the tsreview_client_ip filter; forwarded headers are not trusted by default.
	 *
	 * @return string
	 */
	private static function client_ip() {
		$ip = isset( $_SERVER['REMOTE_ADDR'] ) ? sanitize_text_field( wp_unslash( $_SERVER['REMOTE_ADDR'] ) ) : '';
		$ip = (string) apply_filters( 'tsreview_client_ip', $ip );

		return filter_var( $ip, FILTER_VALIDATE_IP ) ? $ip : '';
	}

	/**
	 * Transient key for the current visitor's submission count.
	 *
	 * @return string
	 */
	private static function rate_limit_key() {
		$ip = self::client_ip();
		return 'tsreview_rl_' . md5( $ip ? $ip : 'unknown' );
	}

	/**
	 * Five stored reviews per hour for each IP. Rejected attempts do not count.
	 *
	 * @return bool
	 */
	private static function is_rate_limited() {
		$limit = (int) apply_filters( 'tsreview_review_rate_limit', 5 );
		return $limit > 0 && (int) get_transient( self::rate_limit_key() ) >= $limit;
	}

	/**
	 * Count a stored review against the visitor's hourly limit.
	 */
	private static function record_submission() {
		$key = self::rate_limit_key();
		set_transient( $key, (int) get_transient( $key ) + 1, HOUR_IN_SECONDS );
	}

}
