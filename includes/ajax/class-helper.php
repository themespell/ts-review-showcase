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
	public static function format_review_data( $comment, $include_email = false ) {
		$rating = get_comment_meta( $comment->comment_ID, 'rating', true );
		$verified = get_comment_meta( $comment->comment_ID, 'verified', true );
		$review_title = get_comment_meta( $comment->comment_ID, 'review_title', true );
		$incentivized = get_comment_meta( $comment->comment_ID, '_tsreview_incentivized', true );
		if ( ! $incentivized ) {
			$incentivized = get_comment_meta( $comment->comment_ID, 'tsreview_incentivized', true );
		}
		$plugin_settings = self::get_cached_plugin_settings();
		$verified_label = ! empty( $plugin_settings['review_extensions']['verified_owner_label'] )
			? $plugin_settings['review_extensions']['verified_owner_label']
			: __( 'Verified Purchase', 'ts-review-showcase' );
		$incentivized_label = ! empty( $plugin_settings['review_discount']['incentivized_badge_label'] )
			? $plugin_settings['review_discount']['incentivized_badge_label']
			: __( 'Incentivized', 'ts-review-showcase' );

		$product_id = (int) $comment->comment_post_ID;
		$product = function_exists( 'wc_get_product' ) ? wc_get_product( $product_id ) : null;

		$product_name = '';
		$product_image = '';
		$product_link = '';

		if ( $product ) {
			$product_name = $product->get_name();
			$image_id = $product->get_image_id();
			$product_image = $image_id ? wp_get_attachment_image_url( $image_id, 'thumbnail' ) : ( function_exists( 'wc_placeholder_img_src' ) ? wc_placeholder_img_src() : '' );
			$product_link = get_permalink( $product_id );
		}

		$avatar_url = get_avatar_url( $comment->comment_author_email, array( 'size' => 64 ) );

		$data = array(
			'comment_id'      => $comment->comment_ID,
			'reviewer_name'   => $comment->comment_author,
			'avatar_url'      => $avatar_url,
			'rating'          => (int) $rating,
			'review_title'    => $review_title ? $review_title : ( $comment->comment_title ?? '' ),
			'review_content'  => $comment->comment_content,
			'review_date'     => $comment->comment_date,
			'verified'        => (bool) $verified,
			'verified_label'  => $verified_label,
			'incentivized'    => (bool) $incentivized,
			'incentivized_label' => $incentivized_label,
			'product_id'      => $product_id,
			'product_name'    => $product_name,
			'product_image'   => $product_image,
			'product_link'    => $product_link,
		);

		if ( $include_email && current_user_can( 'manage_options' ) ) {
			$data['reviewer_email'] = $comment->comment_author_email;
		}

		return $data;
	}

	/**
	 * Plugin settings for the current request.
	 *
	 * @return array<string, mixed>
	 */
	private static function get_cached_plugin_settings() {
		static $settings = null;

		if ( null === $settings ) {
			$settings = class_exists( __NAMESPACE__ . '\\WooCommerceIntegration' )
				? WooCommerceIntegration::get_plugin_settings()
				: array();
		}

		return $settings;
	}

	/**
	 * Get all WooCommerce reviews.
	 *
	 * @param array $args Optional arguments for filtering.
	 * @return array Reviews array.
	 */
	public static function get_all_reviews( $args = array() ) {
		$include_email = ! empty( $args['include_email'] );
		unset( $args['include_email'] );

		$args = self::normalize_review_query_args( $args );
		$comments = get_comments( $args );

		if ( ! is_array( $comments ) ) {
			return array();
		}

		self::prime_review_caches( $comments );

		$reviews = array();

		foreach ( $comments as $comment ) {
			$reviews[] = self::format_review_data( $comment, $include_email );
		}

		return $reviews;
	}

	/**
	 * Count reviews without loading comment rows.
	 *
	 * @param array $args Query args. Pagination keys are ignored.
	 * @return int
	 */
	/**
	 * Public review query with server-side sort and star filter.
	 *
	 * @param array $args sort, rating, number, paged.
	 * @return array
	 */
	public static function build_public_review_query( $args = array() ) {
		$sort   = isset( $args['sort'] ) ? sanitize_key( $args['sort'] ) : 'recent';
		$rating = isset( $args['rating'] ) ? (int) $args['rating'] : 0;
		$query  = array(
			'status'  => 'approve',
			'type'    => 'review',
			'number'  => isset( $args['number'] ) ? (int) $args['number'] : 6,
			'paged'   => isset( $args['paged'] ) ? (int) $args['paged'] : 1,
			'orderby' => 'comment_date',
			'order'   => 'DESC',
		);

		if ( ! empty( $args['post_id'] ) ) {
			$query['post_id'] = absint( $args['post_id'] );
		}

		if ( $rating >= 1 && $rating <= 5 ) {
			$query['meta_query'] = array(
				array(
					'key'   => 'rating',
					'value' => (string) $rating,
				),
			);
		}

		if ( 'rating_high' === $sort || 'rating_low' === $sort ) {
			$query['meta_key'] = 'rating';
			$query['orderby']  = 'meta_value_num';
			$query['order']    = 'rating_low' === $sort ? 'ASC' : 'DESC';
		}

		return $query;
	}

	/**
	 * Star counts and average for every approved review, not the current page.
	 *
	 * @return array<string, mixed>
	 */
	public static function get_rating_summary( $post_id = 0 ) {
		global $wpdb;

		$post_sql = '';
		if ( $post_id ) {
			$post_sql = $wpdb->prepare( ' AND c.comment_post_ID = %d', absint( $post_id ) );
		}

		$rows = $wpdb->get_results(
			"SELECT CAST(cm.meta_value AS UNSIGNED) AS rating, COUNT(*) AS total
			FROM {$wpdb->comments} c
			INNER JOIN {$wpdb->commentmeta} cm ON c.comment_ID = cm.comment_ID AND cm.meta_key = 'rating'
			WHERE c.comment_approved = '1' AND c.comment_type = 'review' {$post_sql}
			GROUP BY CAST(cm.meta_value AS UNSIGNED)",
			ARRAY_A
		);

		return self::summarize_rating_rows( $rows );
	}

	/**
	 * Turn grouped rating rows into a total, average, and 1–5 counts.
	 *
	 * @param array<int, array<string, mixed>> $rows Query rows.
	 * @return array<string, mixed>
	 */
	public static function summarize_rating_rows( $rows ) {
		$counts   = array(
			'1' => 0,
			'2' => 0,
			'3' => 0,
			'4' => 0,
			'5' => 0,
		);
		$total    = 0;
		$weighted = 0;

		foreach ( (array) $rows as $row ) {
			$rating = (int) $row['rating'];
			if ( $rating < 1 || $rating > 5 ) {
				continue;
			}
			$count                      = (int) $row['total'];
			$counts[ (string) $rating ] = $count;
			$total                     += $count;
			$weighted                  += $rating * $count;
		}

		return array(
			'total'   => $total,
			'average' => $total ? round( $weighted / $total, 2 ) : 0,
			'counts'  => $counts,
		);
	}

	public static function count_reviews( $args = array() ) {
		unset( $args['number'], $args['offset'], $args['paged'], $args['include_email'] );

		$args = wp_parse_args(
			$args,
			array(
				'status' => 'approve',
				'type'   => 'review',
			)
		);
		$args['count'] = true;

		return (int) get_comments( $args );
	}

	/**
	 * Dashboard totals from count and aggregate queries.
	 *
	 * @return array<string, mixed>
	 */
	public static function get_review_summary() {
		global $wpdb;

		$total = self::count_reviews();
		$average = $wpdb->get_var(
			"SELECT AVG(CAST(cm.meta_value AS DECIMAL(10,2)))
			FROM {$wpdb->comments} c
			INNER JOIN {$wpdb->commentmeta} cm ON c.comment_ID = cm.comment_ID AND cm.meta_key = 'rating'
			WHERE c.comment_approved = '1' AND c.comment_type = 'review'"
		);
		$product_count = (int) $wpdb->get_var(
			"SELECT COUNT(DISTINCT comment_post_ID)
			FROM {$wpdb->comments}
			WHERE comment_approved = '1' AND comment_type = 'review'"
		);

		return array(
			'total'         => $total,
			'average'       => $total ? round( (float) $average, 2 ) : 0,
			'product_count' => $product_count,
			'recent'        => self::get_all_reviews(
				array(
					'number' => 4,
					'paged'  => 1,
				)
			),
		);
	}

	/**
	 * WordPress absint() turns number -1 into 1, so callers must pass a positive page size.
	 *
	 * @param array $args Raw query args.
	 * @return array
	 */
	private static function normalize_review_query_args( $args ) {
		$defaults = array(
			'status'  => 'approve',
			'type'    => 'review',
			'orderby' => 'comment_date',
			'order'   => 'DESC',
		);

		$page = isset( $args['paged'] ) ? max( 1, (int) $args['paged'] ) : 1;
		unset( $args['paged'] );

		$per_page = isset( $args['number'] ) ? (int) $args['number'] : 20;
		if ( $per_page < 1 ) {
			$per_page = 20;
		}
		$per_page = min( 100, $per_page );

		$args = wp_parse_args( $args, $defaults );
		$args['number'] = $per_page;
		$args['offset'] = ( $page - 1 ) * $per_page;

		return $args;
	}

	/**
	 * Prime post and comment caches before formatting a page of reviews.
	 *
	 * @param array $comments Comment objects.
	 * @return void
	 */
	private static function prime_review_caches( $comments ) {
		$comment_ids = array();
		$post_ids    = array();

		foreach ( $comments as $comment ) {
			$comment_ids[] = (int) $comment->comment_ID;
			$post_ids[]    = (int) $comment->comment_post_ID;
		}

		if ( $comment_ids ) {
			update_meta_cache( 'comment', $comment_ids );
		}

		$post_ids = array_values( array_unique( array_filter( $post_ids ) ) );
		if ( $post_ids && function_exists( '_prime_post_caches' ) ) {
			_prime_post_caches( $post_ids, false, true );
		}
	}
}
