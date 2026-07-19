<?php
/**
 * Slack addon — sends review notifications to Slack channels.
 *
 * @package TSReview
 */

namespace TSReview;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Addon_Slack {

	public static function init() {
		add_action( 'tsreview_review_submitted', array( __CLASS__, 'on_review_submitted' ), 10, 2 );
		add_action( 'wp_ajax_tsreview/slack/test', array( __CLASS__, 'ajax_test_webhook' ) );
	}

	public static function on_review_submitted( $review_data, $product_id ) {
		$settings = Addon_Manager::get_settings( 'slack' );
		$events   = $settings['events'] ?? array();

		if ( ! in_array( 'new_review', $events, true ) ) {
			return;
		}

		$rating  = intval( $review_data['rating'] ?? 0 );
		$stars   = str_repeat( '★', $rating ) . str_repeat( '☆', 5 - $rating );
		$product = get_the_title( $product_id );
		$reviewer = $review_data['reviewer_name'] ?? 'Anonymous';
		$text     = $review_data['review_content'] ?? '';
		$mention  = $settings['mention'] ?? '';

		$message = sprintf(
			"⭐ *New Review*\n\n*%s* rated *%s* %s\n\n> %s\n\n— %s",
			esc_html( $reviewer ),
			esc_html( $product ),
			$stars,
			esc_html( wp_trim_words( $text, 30 ) ),
			$mention ? esc_html( $mention ) : ''
		);

		self::send_notification( $message );
	}

	private static function send_notification( $message ) {
		$settings = Addon_Manager::get_settings( 'slack' );
		$url      = $settings['webhook_url'] ?? '';
		$channel  = $settings['channel'] ?? '';

		if ( empty( $url ) ) {
			return;
		}

		$payload = array(
			'text'    => $message,
			'unfurl_links' => false,
		);

		if ( ! empty( $channel ) ) {
			$payload['channel'] = $channel;
		}

		wp_remote_post( $url, array(
			'headers' => array( 'Content-Type' => 'application/json' ),
			'body'    => wp_json_encode( $payload ),
			'timeout' => 15,
		) );
	}

	public static function ajax_test_webhook() {
		check_ajax_referer( 'tsreview_nonce' );
		if ( ! current_user_can( 'manage_options' ) ) {
			wp_send_json_error( array( 'message' => 'Unauthorized' ) );
		}

		$settings = Addon_Manager::get_settings( 'slack' );
		$url      = $settings['webhook_url'] ?? '';

		if ( empty( $url ) ) {
			wp_send_json_error( array( 'message' => 'Webhook URL is required.' ) );
		}

		$response = wp_remote_post( $url, array(
			'headers' => array( 'Content-Type' => 'application/json' ),
			'body'    => wp_json_encode( array(
				'text' => '✅ Test notification from TS Review Showcase',
			) ),
			'timeout' => 15,
		) );

		if ( is_wp_error( $response ) ) {
			wp_send_json_error( array( 'message' => $response->get_error_message() ) );
		}

		$code = wp_remote_retrieve_response_code( $response );
		if ( $code >= 200 && $code < 300 ) {
			wp_send_json_success( array( 'message' => 'Slack notification sent.' ) );
		} else {
			wp_send_json_error( array( 'message' => 'Webhook returned status: ' . $code ) );
		}
	}
}
