<?php
namespace TSReview;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Helper {

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
