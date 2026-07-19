<?php
/**
 * Mailchimp addon — syncs reviewer emails to Mailchimp audience.
 *
 * @package TSReview
 */

namespace TSReview;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Addon_Mailchimp {

	public static function init() {
		add_action( 'tsreview_review_submitted', array( __CLASS__, 'on_review_submitted' ), 10, 2 );
		add_action( 'wp_ajax_tsreview/mailchimp/test', array( __CLASS__, 'ajax_test_connection' ) );
	}

	public static function on_review_submitted( $review_data, $product_id ) {
		$settings = Addon_Manager::get_settings( 'mailchimp' );
		if ( empty( $settings['api_key'] ) || empty( $settings['list_id'] ) ) {
			return;
		}

		$email = $review_data['reviewer_email'] ?? '';
		if ( empty( $email ) || ! is_email( $email ) ) {
			return;
		}

		$name      = $review_data['reviewer_name'] ?? '';
		$tags      = array_filter( array_map( 'trim', explode( ',', $settings['tags'] ?? '' ) ) );
		$double_optin = ! empty( $settings['double_optin'] );

		self::add_subscriber( $email, $name, $tags, $double_optin );
	}

	private static function add_subscriber( $email, $name, $tags = array(), $double_optin = true ) {
		$settings = Addon_Manager::get_settings( 'mailchimp' );
		$api_key  = sanitize_text_field( $settings['api_key'] );
		$list_id  = sanitize_text_field( $settings['list_id'] );

		$server = substr( $api_key, strpos( $api_key, '-' ) + 1 );
		$url    = "https://{$server}.api.mailchimp.com/3.0/lists/{$list_id}/members";

		$data = array(
			'email_address' => $email,
			'status'        => $double_optin ? 'pending' : 'subscribed',
		);

		if ( ! empty( $name ) ) {
			$name_parts = explode( ' ', $name, 2 );
			$data['merge_fields'] = array(
				'FNAME' => $name_parts[0] ?? '',
				'LNAME' => $name_parts[1] ?? '',
			);
		}

		if ( ! empty( $tags ) ) {
			$data['tags'] = $tags;
		}

		$response = wp_remote_post( $url, array(
			'headers' => array(
				'Authorization' => 'Basic ' . base64_encode( 'anystring:' . $api_key ),
				'Content-Type'  => 'application/json',
			),
			'body'    => wp_json_encode( $data ),
			'timeout' => 15,
		) );

		return ! is_wp_error( $response ) && wp_remote_retrieve_response_code( $response ) < 400;
	}

	public static function ajax_test_connection() {
		check_ajax_referer( 'tsreview_nonce' );
		if ( ! current_user_can( 'manage_options' ) ) {
			wp_send_json_error( array( 'message' => 'Unauthorized' ) );
		}

		$settings = Addon_Manager::get_settings( 'mailchimp' );
		$api_key  = $settings['api_key'] ?? '';
		$list_id  = $settings['list_id'] ?? '';

		if ( empty( $api_key ) ) {
			wp_send_json_error( array( 'message' => 'API key is required.' ) );
		}

		$server = substr( $api_key, strpos( $api_key, '-' ) + 1 );
		$url    = "https://{$server}.api.mailchimp.com/3.0/lists/{$list_id}";

		$response = wp_remote_get( $url, array(
			'headers' => array(
				'Authorization' => 'Basic ' . base64_encode( 'anystring:' . $api_key ),
			),
			'timeout' => 15,
		) );

		if ( is_wp_error( $response ) ) {
			wp_send_json_error( array( 'message' => $response->get_error_message() ) );
		}

		$body = json_decode( wp_remote_retrieve_body( $response ), true );
		if ( wp_remote_retrieve_response_code( $response ) === 200 ) {
			wp_send_json_success( array( 'message' => 'Connected to: ' . ( $body['name'] ?? 'Unknown list' ) ) );
		} else {
			$message = $body['detail'] ?? 'Connection failed.';
			wp_send_json_error( array( 'message' => $message ) );
		}
	}
}
