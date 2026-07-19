<?php
/**
 * HubSpot CRM addon — syncs review data and contacts to HubSpot.
 *
 * @package TSReview
 */

namespace TSReview;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Addon_HubSpot {

	private static $api_base = 'https://api.hubapi.com/crm/v3';

	public static function init() {
		add_action( 'tsreview_review_submitted', array( __CLASS__, 'on_review_submitted' ), 10, 2 );
		add_action( 'wp_ajax_tsreview/hubspot/test', array( __CLASS__, 'ajax_test_connection' ) );
	}

	public static function on_review_submitted( $review_data, $product_id ) {
		$settings = Addon_Manager::get_settings( 'hubspot' );
		$api_key  = $settings['api_key'] ?? '';

		if ( empty( $api_key ) ) {
			return;
		}

		$email = $review_data['reviewer_email'] ?? '';
		if ( ! empty( $email ) && is_email( $email ) ) {
			$contact_id = self::create_or_update_contact( $email, $review_data );
			if ( $contact_id ) {
				self::add_engagement( $contact_id, $review_data, $product_id );
			}
		}
	}

	private static function create_or_update_contact( $email, $review_data ) {
		$settings = Addon_Manager::get_settings( 'hubspot' );
		$api_key  = $settings['api_key'] ?? '';
		$name     = $review_data['reviewer_name'] ?? '';

		$payload = array(
			'properties' => array(
				'email' => $email,
			),
		);

		if ( ! empty( $name ) ) {
			$name_parts = explode( ' ', $name, 2 );
			$payload['properties']['firstname'] = $name_parts[0] ?? '';
			$payload['properties']['lastname']  = $name_parts[1] ?? '';
		}

		$response = wp_remote_post( self::$api_base . '/objects/contacts', array(
			'headers' => array(
				'Authorization' => 'Bearer ' . $api_key,
				'Content-Type'  => 'application/json',
			),
			'body'    => wp_json_encode( $payload ),
			'timeout' => 15,
		) );

		if ( is_wp_error( $response ) ) {
			return null;
		}

		$code = wp_remote_retrieve_response_code( $response );
		$body = json_decode( wp_remote_retrieve_body( $response ), true );

		if ( $code === 201 ) {
			return $body['id'] ?? null;
		}

		// If contact exists (409 conflict), search for it
		if ( $code === 409 ) {
			return self::search_contact( $email );
		}

		return null;
	}

	private static function search_contact( $email ) {
		$settings = Addon_Manager::get_settings( 'hubspot' );
		$api_key  = $settings['api_key'] ?? '';

		$response = wp_remote_post( self::$api_base . '/objects/contacts/search', array(
			'headers' => array(
				'Authorization' => 'Bearer ' . $api_key,
				'Content-Type'  => 'application/json',
			),
			'body' => wp_json_encode( array(
				'filterGroups' => array(
					array(
						'filters' => array(
							array(
								'propertyName' => 'email',
								'operator'     => 'EQ',
								'value'        => $email,
							),
						),
					),
				),
				'limit' => 1,
			) ),
			'timeout' => 15,
		) );

		if ( is_wp_error( $response ) ) {
			return null;
		}

		$body = json_decode( wp_remote_retrieve_body( $response ), true );
		return $body['results'][0]['id'] ?? null;
	}

	private static function add_engagement( $contact_id, $review_data, $product_id ) {
		$settings = Addon_Manager::get_settings( 'hubspot' );
		$api_key  = $settings['api_key'] ?? '';

		$rating  = intval( $review_data['rating'] ?? 0 );
		$product = get_the_title( $product_id );

		$payload = array(
			'properties' => array(
				'hs_note_body' => sprintf(
					"Review for %s\nRating: %d/5\n\n%s",
					$product,
					$rating,
					$review_data['review_content'] ?? ''
				),
				'hs_timestamp' => (string) ( time() * 1000 ),
			),
			'associations' => array(
				array(
					'types' => array(
						array( 'associationTypeId' => 202 ),
					),
					'id' => $contact_id,
				),
			),
		);

		wp_remote_post( self::$api_base . '/objects/notes', array(
			'headers' => array(
				'Authorization' => 'Bearer ' . $api_key,
				'Content-Type'  => 'application/json',
			),
			'body'    => wp_json_encode( $payload ),
			'timeout' => 15,
		) );
	}

	public static function ajax_test_connection() {
		check_ajax_referer( 'tsreview_nonce' );
		if ( ! current_user_can( 'manage_options' ) ) {
			wp_send_json_error( array( 'message' => 'Unauthorized' ) );
		}

		$settings = Addon_Manager::get_settings( 'hubspot' );
		$api_key  = $settings['api_key'] ?? '';

		if ( empty( $api_key ) ) {
			wp_send_json_error( array( 'message' => 'API key is required.' ) );
		}

		$response = wp_remote_get( self::$api_base . '/objects/contacts?limit=1', array(
			'headers' => array(
				'Authorization' => 'Bearer ' . $api_key,
			),
			'timeout' => 15,
		) );

		if ( is_wp_error( $response ) ) {
			wp_send_json_error( array( 'message' => $response->get_error_message() ) );
		}

		$code = wp_remote_retrieve_response_code( $response );
		if ( $code === 200 ) {
			wp_send_json_success( array( 'message' => 'Connected to HubSpot CRM.' ) );
		} else {
			wp_send_json_error( array( 'message' => 'Connection failed with status: ' . $code ) );
		}
	}
}
