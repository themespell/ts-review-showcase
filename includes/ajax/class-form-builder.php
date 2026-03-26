<?php
namespace TSReview;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class FormBuilder {

	public static function init() {
		$self = new self();
		add_action( 'wp_ajax_tsreview/form_builder/fetch', array( $self, 'get_forms' ) );
		add_action( 'wp_ajax_tsreview/form_builder/fetch/single', array( $self, 'get_form_by_id' ) );
		add_action( 'wp_ajax_nopriv_tsreview/form_builder/fetch/single', array( $self, 'get_form_by_id' ) );
		add_action( 'wp_ajax_tsreview/form_builder/create', array( $self, 'create_form' ) );
		add_action( 'wp_ajax_tsreview/form_builder/update', array( $self, 'update_form' ) );
		add_action( 'wp_ajax_tsreview/form_builder/save_settings', array( $self, 'save_form_settings' ) );
		add_action( 'wp_ajax_tsreview/form_builder/duplicate', array( $self, 'duplicate_form' ) );
		add_action( 'wp_ajax_tsreview/form_builder/delete', array( $self, 'delete_form' ) );
		add_action( 'wp_ajax_nopriv_tsreview/form_builder/submit', array( $self, 'submit_form' ) );
	}

	/**
	 * Fetch all custom forms.
	 */
	public function get_forms() {
		check_ajax_referer( 'tsreview_nonce' );
		if ( ! current_user_can( 'manage_options' ) ) {
			wp_die();
		}

		$args = array(
			'post_type'   => 'ts-form-builder',
			'posts_per_page' => -1,
			'orderby'     => 'date',
			'order'       => 'DESC'
		);

		$query = new \WP_Query( $args );

		if ( ! $query->have_posts() ) {
			wp_send_json_error( array( 'message' => 'No forms found' ) );
		}

		$forms = array();

		while ( $query->have_posts() ) {
			$query->the_post();

			$form_data = get_post_meta( get_the_ID(), 'tsreview_form_data', true );
			$form_type = ! empty( $form_data['formType'] ) ? $form_data['formType'] : 'custom';

			$forms[] = array(
				'post_id'   => get_the_ID(),
				'title'     => get_the_title(),
				'shortcode' => '[ts_review_form id="' . get_the_ID() . '"]',
				'form_type' => $form_type,
			);
		}

		wp_reset_postdata();
		wp_send_json_success( $forms );
	}

	/**
	 * Fetch a single form by ID.
	 */
	public function get_form_by_id() {
		check_ajax_referer( 'tsreview_nonce' );

		$post_id = isset( $_POST['form_id'] ) ? (int) $_POST['form_id'] : 0;

		if ( ! $post_id ) {
			wp_send_json_error( array( 'message' => 'Invalid form ID' ) );
			return;
		}

		$post = get_post( $post_id );

		if ( ! $post || $post->post_type !== 'ts-form-builder' ) {
			wp_send_json_error( array( 'message' => 'Form not found' ) );
			return;
		}

		$form_data = get_post_meta( $post_id, 'tsreview_form_data', true );

		wp_send_json_success( array(
			'post_id'    => $post_id,
			'title'      => $post->post_title,
			'form_data'  => $form_data ? $form_data : $this->get_default_form_data(),
		) );
	}

	/**
	 * Create a new form.
	 */
	public function create_form() {
		check_ajax_referer( 'tsreview_nonce' );

		if ( ! current_user_can( 'manage_options' ) ) {
			wp_die();
		}

		$form_title = isset( $_POST['title'] ) ? sanitize_text_field( wp_unslash( $_POST['title'] ) ) : 'Custom Form';
		$form_data = isset( $_POST['data'] ) ? $this->sanitize_array( wp_unslash( $_POST['data'] ) ) : array();

		$args = array(
			'post_title'  => $form_title,
			'post_status' => 'publish',
			'post_author' => get_current_user_id(),
			'post_type'   => 'ts-form-builder',
		);

		$post_id = wp_insert_post( $args );

		if ( is_wp_error( $post_id ) ) {
			wp_send_json_error( array( 'message' => 'Failed to create form' ) );
			return;
		}

		// Merge with default data
		$default_data = $this->get_default_form_data();
		$form_data = wp_parse_args( $form_data, $default_data );

		update_post_meta( $post_id, 'tsreview_form_data', $form_data );
		wp_send_json_success( array( 'post_id' => $post_id, 'data' => $form_data ) );
	}

	/**
	 * Update an existing form.
	 */
	public function update_form() {
		check_ajax_referer( 'tsreview_nonce' );

		if ( ! current_user_can( 'manage_options' ) ) {
			wp_die();
		}

		$post_id = isset( $_POST['data']['post_id'] ) ? absint( $_POST['data']['post_id'] ) : 0;

		if ( ! $post_id ) {
			wp_send_json_error( array( 'message' => 'Invalid ID' ) );
		}

		$form_title = isset( $_POST['data']['title'] ) ? sanitize_text_field( wp_unslash( $_POST['data']['title'] ) ) : '';

		$args = array(
			'ID'         => $post_id,
			'post_title' => $form_title,
			'post_type'  => 'ts-form-builder',
		);

		$post_id = wp_update_post( $args );

		if ( is_wp_error( $post_id ) ) {
			wp_send_json_error( array( 'message' => 'Failed to update form' ) );
			return;
		}

		wp_send_json_success( array( 'post_id' => $post_id ) );
	}

	/**
	 * Save form settings.
	 */
	public function save_form_settings() {
		check_ajax_referer( 'tsreview_nonce' );

		if ( ! current_user_can( 'manage_options' ) ) {
			wp_die();
		}

		$post_id = isset( $_POST['post_id'] ) ? absint( $_POST['post_id'] ) : 0;
		$form_data = isset( $_POST['data'] ) ? $this->sanitize_array( wp_unslash( $_POST['data'] ) ) : array();

		if ( ! $post_id ) {
			wp_send_json_error( array( 'message' => 'Invalid ID' ) );
		}

		// Get existing data and merge
		$existing_data = get_post_meta( $post_id, 'tsreview_form_data', true );
		$form_data = wp_parse_args( $form_data, $existing_data ? $existing_data : $this->get_default_form_data() );

		update_post_meta( $post_id, 'tsreview_form_data', $form_data );

		// Update post title if provided
		if ( isset( $form_data['formName'] ) ) {
			wp_update_post( array(
				'ID'         => $post_id,
				'post_title' => $form_data['formName'],
			));
		}

		wp_send_json_success( array(
			'post_id' => $post_id,
			'data' => $form_data,
			'message' => 'Form saved successfully'
		) );
	}

	/**
	 * Duplicate an existing form.
	 */
	public function duplicate_form() {
		check_ajax_referer( 'tsreview_nonce' );

		if ( ! current_user_can( 'manage_options' ) ) {
			wp_die();
		}

		$post_id = isset( $_POST['post_id'] ) ? absint( $_POST['post_id'] ) : 0;

		if ( ! $post_id ) {
			wp_send_json_error( array( 'message' => 'Invalid ID' ) );
			return;
		}

		$post = get_post( $post_id );

		if ( ! $post || $post->post_type !== 'ts-form-builder' ) {
			wp_send_json_error( array( 'message' => 'Form not found' ) );
			return;
		}

		$form_data = get_post_meta( $post_id, 'tsreview_form_data', true );

		$args = array(
			'post_title'   => $post->post_title . ' (Copy)',
			'post_content' => $post->post_content,
			'post_status'  => 'publish',
			'post_author'  => get_current_user_id(),
			'post_type'    => 'ts-form-builder',
		);

		$new_post_id = wp_insert_post( $args );

		if ( is_wp_error( $new_post_id ) ) {
			wp_send_json_error( array( 'message' => 'Failed to duplicate form' ) );
			return;
		}

		update_post_meta( $new_post_id, 'tsreview_form_data', $form_data );

		wp_send_json_success( array(
			'message' => 'Form duplicated successfully',
			'post_id' => $new_post_id
		) );
	}

	/**
	 * Delete a form.
	 */
	public function delete_form() {
		check_ajax_referer( 'tsreview_nonce' );

		if ( ! current_user_can( 'manage_options' ) ) {
			wp_die();
		}

		$post_id = isset( $_POST['post_id'] ) ? absint( $_POST['post_id'] ) : 0;

		if ( ! $post_id ) {
			wp_send_json_error( array( 'message' => 'Invalid form ID' ) );
		}

		$deleted = wp_delete_post( $post_id, true );

		if ( $deleted ) {
			wp_send_json_success( array(
				'message' => 'Form deleted successfully',
				'post_id' => $post_id,
			) );
		} else {
			wp_send_json_error( array( 'message' => 'Failed to delete form' ) );
		}
	}

	/**
	 * Handle form submission from frontend.
	 */
	public function submit_form() {
		check_ajax_referer( 'tsreview_nonce', 'nonce', false );

		$form_id = isset( $_POST['form_id'] ) ? (int) $_POST['form_id'] : 0;

		if ( ! $form_id ) {
			wp_send_json_error( array( 'message' => 'Invalid form ID' ) );
			return;
		}

		// Get form data
		$form_data = get_post_meta( $form_id, 'tsreview_form_data', true );

		if ( ! $form_data ) {
			wp_send_json_error( array( 'message' => 'Form not found' ) );
			return;
		}

		$settings = $form_data['formSettings'] ?? array();
		$fields = $form_data['fields'] ?? array();

		// Validate required fields
		$errors = array();
		$submission_data = array();

		foreach ( $fields as $field ) {
			if ( empty( $field['visible'] ) ) {
				continue;
			}

			$field_id = $field['id'];
			$field_value = isset( $_POST[ $field_id ] ) ? sanitize_text_field( wp_unslash( $_POST[ $field_id ] ) ) : '';

			if ( ! empty( $field['required'] ) && empty( $field_value ) ) {
				$errors[ $field_id ] = $field['label'] . ' is required';
			}

			// Email validation
			if ( $field['type'] === 'email' && ! empty( $field_value ) ) {
				if ( ! is_email( $field_value ) ) {
					$errors[ $field_id ] = 'Please enter a valid email address';
				}
			}

			$submission_data[ $field_id ] = $field_value;
		}

		if ( ! empty( $errors ) ) {
			wp_send_json_error( array(
				'message' => 'Please fix the errors below',
				'errors' => $errors
			) );
			return;
		}

		// Create review comment
		$reviewer_name = $submission_data['reviewer_name'] ?? '';
		$reviewer_email = $submission_data['reviewer_email'] ?? '';
		$review_content = $submission_data['review_body'] ?? '';
		$review_title = $submission_data['review_title'] ?? '';
		$rating = $submission_data['rating'] ?? 0;

		// Get current product ID if on product page
		$product_id = isset( $_POST['product_id'] ) ? (int) $_POST['product_id'] : 0;

		if ( ! $product_id ) {
			wp_send_json_error( array( 'message' => 'Product ID is required' ) );
			return;
		}

		$comment_data = array(
			'comment_post_ID'      => $product_id,
			'comment_author'       => $reviewer_name,
			'comment_author_email' => $reviewer_email,
			'comment_content'      => $review_content,
			'comment_approved'     => ! empty( $settings['autoApprove'] ) ? 1 : 0,
			'comment_type'         => 'review',
		);

		// Add comment title if supported
		if ( isset( $comment_data['comment_title'] ) ) {
			$comment_data['comment_title'] = $review_title;
		}

		$comment_id = wp_new_comment( $comment_data );

		if ( is_wp_error( $comment_id ) ) {
			wp_send_json_error( array( 'message' => 'Failed to submit review' ) );
			return;
		}

		// Save rating
		if ( $rating > 0 ) {
			update_comment_meta( $comment_id, 'rating', $rating );
		}

		// Handle file attachments if any
		if ( isset( $_FILES ) && ! empty( $submission_data['attachments'] ) ) {
			$this->handle_file_attachments( $comment_id, $_FILES );
		}

		// Trigger WooCommerce review count calculation
		if ( class_exists( 'WC_Comments' ) ) {
			WC_Comments::get_review_count_for_product( $product_id );
		}

		wp_send_json_success( array(
			'message' => $settings['successMessage'] ?? 'Thank you for your review!',
			'comment_id' => $comment_id
		) );
	}

	/**
	 * Handle file attachments for review.
	 */
	private function handle_file_attachments( $comment_id, $files ) {
		// Implement file upload logic if needed
		// For now, just a placeholder
	}

	/**
	 * Get default form data structure.
	 */
	private function get_default_form_data() {
		return array(
			'formId'       => '',
			'formName'     => 'Custom Form',
			'formType'     => 'custom',
			'fields'       => array(),
			'formSettings' => array(
				'submitButtonText' => 'Submit Review',
				'successMessage'   => 'Thank you for your review!',
				'requireLogin'     => false,
				'autoApprove'      => true,
			),
			'formStyles'   => array(
				'container' => array(
					'backgroundColor' => '#f9fafb',
					'padding'         => '24px',
					'borderRadius'    => '12px',
					'border'          => '1px solid #e5e7eb',
				),
				'field'     => array(
					'marginBottom' => '16px',
				),
				'label'     => array(
					'fontSize'   => '14px',
					'fontWeight' => '600',
					'color'      => '#374151',
				),
				'input'     => array(
					'backgroundColor' => '#ffffff',
					'border'          => '1px solid #d1d5db',
					'borderRadius'    => '8px',
					'padding'         => '10px 14px',
				),
				'button'    => array(
					'backgroundColor' => '#3b82f6',
					'color'           => '#ffffff',
					'borderRadius'    => '8px',
					'padding'         => '12px 24px',
					'fontWeight'      => '600',
				),
			),
		);
	}

	/**
	 * Recursively sanitize an array.
	 */
	private function sanitize_array( $data ) {
		if ( is_array( $data ) ) {
			return array_map( array( $this, 'sanitize_array' ), $data );
		}
		return sanitize_text_field( $data );
	}
}
