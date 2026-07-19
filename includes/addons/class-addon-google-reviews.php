<?php
/**
 * Google Reviews addon — imports and displays Google Business reviews.
 *
 * @package TSReview
 */

namespace TSReview;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Addon_Google_Reviews {

	private static $option_key = 'tsreview_google_reviews_data';

	public static function init() {
		add_shortcode( 'tsreview_google_reviews', array( __CLASS__, 'render_shortcode' ) );
		add_action( 'wp_ajax_tsreview/google_reviews/sync', array( __CLASS__, 'ajax_sync' ) );
		add_action( 'tsreview_google_reviews_cron', array( __CLASS__, 'sync_reviews' ) );

		if ( ! wp_next_scheduled( 'tsreview_google_reviews_cron' ) ) {
			wp_schedule_event( time(), 'daily', 'tsreview_google_reviews_cron' );
		}
	}

	public static function render_shortcode( $atts ) {
		$atts = shortcode_atts( array(
			'count' => 5,
		), $atts, 'tsreview_google_reviews' );

		$reviews = get_option( self::$option_key, array() );
		if ( empty( $reviews ) ) {
			return '<p class="tsreview-google-reviews-empty">No Google reviews imported yet.</p>';
		}

		$count  = intval( $atts['count'] );
		$reviews = array_slice( $reviews, 0, $count );

		ob_start();
		echo '<div class="tsreview-google-reviews">';
		foreach ( $reviews as $review ) {
			$rating = isset( $review['rating'] ) ? intval( $review['rating'] ) : 5;
			$stars  = str_repeat( '★', $rating ) . str_repeat( '☆', 5 - $rating );
			?>
			<div class="tsreview-google-review" style="padding: 16px; border: 1px solid #e5e7eb; border-radius: 12px; margin-bottom: 12px;">
				<div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
					<?php if ( ! empty( $review['profile_photo_url'] ) ) : ?>
						<img src="<?php echo esc_url( $review['profile_photo_url'] ); ?>" alt="" style="width: 32px; height: 32px; border-radius: 50%;" />
					<?php endif; ?>
					<div>
						<div style="font-weight: 600; font-size: 14px;"><?php echo esc_html( $review['author_name'] ?? 'Anonymous' ); ?></div>
						<div style="color: #f59e0b; font-size: 13px;"><?php echo esc_html( $stars ); ?></div>
					</div>
				</div>
				<p style="font-size: 13px; color: #555; margin: 0;"><?php echo esc_html( $review['text'] ?? '' ); ?></p>
				<?php if ( ! empty( $review['time'] ) ) : ?>
					<div style="font-size: 11px; color: #999; margin-top: 8px;"><?php echo esc_html( human_time_diff( $review['time'] ) ); ?> ago</div>
				<?php endif; ?>
			</div>
			<?php
		}
		echo '</div>';
		return ob_get_clean();
	}

	public static function sync_reviews() {
		$settings = Addon_Manager::get_settings( 'google_reviews' );
		if ( empty( $settings['api_key'] ) || empty( $settings['place_id'] ) ) {
			return;
		}

		$count    = intval( $settings['review_count'] ?? 10 );
		$api_key  = sanitize_text_field( $settings['api_key'] );
		$place_id = sanitize_text_field( $settings['place_id'] );

		$url = sprintf(
			'https://maps.googleapis.com/maps/api/place/details/json?place_id=%s&fields=reviews&key=%s',
			rawurlencode( $place_id ),
			rawurlencode( $api_key )
		);

		$response = wp_remote_get( $url, array( 'timeout' => 15 ) );
		if ( is_wp_error( $response ) ) {
			return;
		}

		$body = json_decode( wp_remote_retrieve_body( $response ), true );
		if ( empty( $body['result']['reviews'] ) ) {
			return;
		}

		$reviews = array();
		foreach ( array_slice( $body['result']['reviews'], 0, $count ) as $review ) {
			$reviews[] = array(
				'author_name'      => $review['author_name'] ?? '',
				'rating'           => $review['rating'] ?? 5,
				'text'             => $review['text'] ?? '',
				'time'             => $review['time'] ?? 0,
				'profile_photo_url' => $review['profile_photo_url'] ?? '',
				'language'         => $review['language'] ?? 'en',
			);
		}

		update_option( self::$option_key, $reviews );
	}

	public static function ajax_sync() {
		check_ajax_referer( 'tsreview_nonce' );
		if ( ! current_user_can( 'manage_options' ) ) {
			wp_send_json_error( array( 'message' => 'Unauthorized' ) );
		}

		self::sync_reviews();

		$reviews = get_option( self::$option_key, array() );
		wp_send_json_success( array(
			'message' => sprintf( '%d reviews synced.', count( $reviews ) ),
			'count'   => count( $reviews ),
		) );
	}
}
