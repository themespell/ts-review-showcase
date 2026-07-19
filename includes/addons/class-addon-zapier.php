<?php
/**
 * Zapier addon — triggers webhooks on review events.
 *
 * @package TSReview
 */

namespace TSReview;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Addon_Zapier {

	public static function init() {
		add_action( 'tsreview_review_submitted', array( __CLASS__, 'on_review_submitted' ), 10, 2 );
		add_action( 'tsreview_review_replied', array( __CLASS__, 'on_review_replied' ), 10, 2 );
		add_action( 'wp_ajax_tsreview/zapier/test', array( __CLASS__, 'ajax_test_webhook' ) );
	}

	public static function on_review_submitted( $review_data, $product_id ) {
		$settings = Addon_Manager::get_settings( 'zapier' );
		$events   = $settings['events'] ?? array();

		if ( ! in_array( 'new_review', $events, true ) ) {
			return;
		}

		self::send_webhook( array(
			'event'      => 'new_review',
			'review_id'  => $review_data['comment_ID'] ?? 0,
			'product_id' => $product_id,
			'rating'     => $review_data['rating'] ?? 0,
			'reviewer'   => $review_data['reviewer_name'] ?? '',
			'email'      => $review_data['reviewer_email'] ?? '',
			'review'     => $review_data['review_content'] ?? '',
			'date'       => current_time( 'mysql' ),
		) );
	}

	public static function on_review_replied( $reply_data, $review_id ) {
		$settings = Addon_Manager::get_settings( 'zapier' );
		$events   = $settings['events'] ?? array();

		if ( ! in_array( 'review_replied', $events, true ) ) {
			return;
		}

		self::send_webhook( array(
			'event'     => 'review_replied',
			'review_id' => $review_id,
			'reply_id'  => $reply_data['comment_ID'] ?? 0,
			'replyer'   => $reply_data['comment_author'] ?? '',
			'reply'     => $reply_data['comment_content'] ?? '',
			'date'      => current_time( 'mysql' ),
		) );
	}

	private static function send_webhook( $payload ) {
		$settings = Addon_Manager::get_settings( 'zapier' );
		$url      = $settings['webhook_url'] ?? '';

		if ( empty( $url ) ) {
			return;
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

		$settings = Addon_Manager::get_settings( 'zapier' );
		$url      = $settings['webhook_url'] ?? '';

		if ( empty( $url ) ) {
			wp_send_json_error( array( 'message' => 'Webhook URL is required.' ) );
		}

		$response = wp_remote_post( $url, array(
			'headers' => array( 'Content-Type' => 'application/json' ),
			'body'    => wp_json_encode( array(
				'event'   => 'test',
				'message' => 'Test webhook from TS Review Showcase',
				'date'    => current_time( 'mysql' ),
			) ),
			'timeout' => 15,
		) );

		if ( is_wp_error( $response ) ) {
			wp_send_json_error( array( 'message' => $response->get_error_message() ) );
		}

		$code = wp_remote_retrieve_response_code( $response );
		if ( $code >= 200 && $code < 300 ) {
			wp_send_json_success( array( 'message' => 'Webhook sent successfully.' ) );
		} else {
			wp_send_json_error( array( 'message' => 'Webhook returned status: ' . $code ) );
		}
	}
}
