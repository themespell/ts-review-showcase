<?php
/**
 * Integration Settings for Review Showcase
 *
 * Handles settings for product review display.
 *
 * @package TSReview
 */

namespace TSReview;

use TSReview\Common;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class WooCommerceIntegration {

	/**
	 * Initialize the integration settings.
	 */
	public static function init() {
		$self = new self();

		// AJAX handlers for settings
		add_action( 'wp_ajax_tsreview/settings/get', array( $self, 'get_settings' ) );
		add_action( 'wp_ajax_tsreview/settings/save', array( $self, 'save_settings' ) );
		add_action( 'wp_ajax_tsreview/review-form/get', array( $self, 'get_review_form_settings_ajax' ) );
		add_action( 'wp_ajax_tsreview/review-form/save', array( $self, 'save_review_form_settings_ajax' ) );

		// Override WooCommerce reviews tabs
		add_filter( 'woocommerce_product_tabs', array( $self, 'override_reviews_tab' ), 100 );

		// Replace review form
		add_filter( 'woocommerce_product_review_form_args', array( $self, 'override_review_form' ), 100 );

		// Hide default reviews if showcase is active
		add_filter( 'woocommerce_product_review_count', array( $self, 'adjust_review_count' ), 100, 2 );

		// Enqueue frontend assets for product pages
		add_action( 'wp_enqueue_scripts', array( $self, 'enqueue_frontend_assets' ) );
	}

	/**
	 * Get settings via AJAX.
	 */
	public function get_settings() {
		check_ajax_referer( 'tsreview_nonce' );
		if ( ! current_user_can( 'manage_options' ) ) {
			wp_send_json_error( array( 'message' => 'Permission denied' ) );
		}

		$showcase_id = get_option( 'tsreview_default_showcase_id', 0 );
		$show_form = get_option( 'tsreview_show_review_form', '1' );

		wp_send_json_success( array(
			'default_showcase' => $showcase_id,
			'show_review_form' => $show_form,
		) );
	}

	/**
	 * Save settings via AJAX.
	 */
	public function save_settings() {
		check_ajax_referer( 'tsreview_nonce' );
		if ( ! current_user_can( 'manage_options' ) ) {
			wp_send_json_error( array( 'message' => 'Permission denied' ) );
		}

		$showcase_id = isset( $_POST['default_showcase'] ) ? absint( $_POST['default_showcase'] ) : 0;
		$show_form = isset( $_POST['show_review_form'] ) ? '1' : '';

		update_option( 'tsreview_default_showcase_id', $showcase_id );
		update_option( 'tsreview_show_review_form', $show_form );

		wp_send_json_success( array( 'message' => 'Settings saved successfully' ) );
	}

	/**
	 * Return default review form settings.
	 *
	 * @return array<string, mixed>
	 */
	public static function get_default_review_form_settings() {
		return array(
			'id'           => 'default-review-form',
			'name'         => 'Product page reviews',
			'preset'       => 'card',
			'accent'       => '#2563eb',
			'background'   => '#ffffff',
			'text'         => '#0f172a',
			'radius'       => 16,
			'spacing'      => 2,
			'font'         => 'sans',
			'showLabels'   => true,
			'buttonLabel'  => 'Submit review',
			'buttonStyle'  => 'solid',
			'sections'     => array(
				array(
					'id'         => 'default-section',
					'background' => '',
					'paddingY'   => 16,
					'paddingX'   => 0,
					'gap'        => 16,
					'columns'    => array(
						array(
							'id'      => 'default-column',
							'width'   => '1/1',
							'align'   => 'top',
							'widgets' => array(
								array( 'id' => 'w-heading', 'type' => 'heading', 'settings' => array( 'text' => 'Write a review', 'level' => 'h3' ) ),
								array( 'id' => 'w-paragraph', 'type' => 'paragraph', 'settings' => array( 'text' => 'Share your experience with others.' ) ),
								array( 'id' => 'w-name', 'type' => 'name', 'settings' => array( 'label' => 'Your name', 'placeholder' => 'Jane Doe', 'required' => true ) ),
								array( 'id' => 'w-email', 'type' => 'email', 'settings' => array( 'label' => 'Email', 'placeholder' => 'jane@example.com', 'required' => true ) ),
								array( 'id' => 'w-rating', 'type' => 'rating', 'settings' => array( 'label' => 'Rating', 'required' => true ) ),
								array( 'id' => 'w-title', 'type' => 'title', 'settings' => array( 'label' => 'Headline', 'placeholder' => 'Sum it up in a few words', 'required' => false ) ),
								array( 'id' => 'w-review', 'type' => 'review', 'settings' => array( 'label' => 'Your review', 'placeholder' => 'Tell others what you thought...', 'required' => true ) ),
								array( 'id' => 'w-button', 'type' => 'button', 'settings' => array( 'label' => 'Submit review', 'buttonStyle' => 'solid' ) ),
							),
						),
					),
				),
			),
			'updatedAt'    => time(),
		);
	}

	/**
	 * Get saved review form settings merged with defaults.
	 *
	 * @return array<string, mixed>
	 */
	public static function get_review_form_settings() {
		$saved = get_option( 'tsreview_review_form_settings', array() );

		if ( ! is_array( $saved ) ) {
			$saved = array();
		}

		return self::sanitize_review_form_settings( array_merge( self::get_default_review_form_settings(), $saved ) );
	}

	/**
	 * Sanitize review form settings.
	 *
	 * @param array<string, mixed> $settings Settings to sanitize.
	 * @return array<string, mixed>
	 */
	private static function sanitize_review_form_settings( $settings ) {
		$defaults = self::get_default_review_form_settings();
		$merged   = array_merge( $defaults, is_array( $settings ) ? $settings : array() );
		$allowed_presets = array( 'minimal', 'card', 'editorial', 'playful', 'brutalist' );
		$allowed_fonts = array( 'sans', 'serif' );
		$allowed_button_styles = array( 'solid', 'outline', 'ghost' );
		$allowed_widths = array( '1/1', '1/2', '1/3', '2/3', '1/4', '3/4' );
		$allowed_aligns = array( 'top', 'center', 'bottom' );
		$allowed_widgets = array( 'name', 'email', 'rating', 'title', 'review', 'divider', 'spacer', 'heading', 'paragraph', 'button' );
		$allowed_levels = array( 'h2', 'h3', 'h4' );
		$allowed_divider_styles = array( 'solid', 'dashed', 'dotted' );

		$sections = array();
		if ( isset( $merged['sections'] ) && is_array( $merged['sections'] ) ) {
			foreach ( $merged['sections'] as $section ) {
				if ( empty( $section['id'] ) ) {
					continue;
				}

				$columns = array();
				if ( isset( $section['columns'] ) && is_array( $section['columns'] ) ) {
					foreach ( $section['columns'] as $column ) {
						if ( empty( $column['id'] ) ) {
							continue;
						}

						$widgets = array();
						if ( isset( $column['widgets'] ) && is_array( $column['widgets'] ) ) {
							foreach ( $column['widgets'] as $widget ) {
								if ( empty( $widget['id'] ) || empty( $widget['type'] ) || ! in_array( $widget['type'], $allowed_widgets, true ) ) {
									continue;
								}

								$widget_settings = isset( $widget['settings'] ) && is_array( $widget['settings'] ) ? $widget['settings'] : array();
								$sanitized_widget = array(
									'id'       => sanitize_text_field( $widget['id'] ),
									'type'     => sanitize_key( $widget['type'] ),
									'settings' => array(),
								);

								if ( isset( $widget_settings['label'] ) ) {
									$sanitized_widget['settings']['label'] = sanitize_text_field( $widget_settings['label'] );
								}
								if ( isset( $widget_settings['placeholder'] ) ) {
									$sanitized_widget['settings']['placeholder'] = sanitize_text_field( $widget_settings['placeholder'] );
								}
								if ( isset( $widget_settings['required'] ) ) {
									$sanitized_widget['settings']['required'] = ! empty( $widget_settings['required'] );
								}
								if ( isset( $widget_settings['text'] ) ) {
									$sanitized_widget['settings']['text'] = sanitize_text_field( $widget_settings['text'] );
								}
								if ( isset( $widget_settings['level'] ) && in_array( $widget_settings['level'], $allowed_levels, true ) ) {
									$sanitized_widget['settings']['level'] = $widget_settings['level'];
								}
								if ( isset( $widget_settings['thickness'] ) ) {
									$sanitized_widget['settings']['thickness'] = max( 1, absint( $widget_settings['thickness'] ) );
								}
								if ( isset( $widget_settings['dividerStyle'] ) && in_array( $widget_settings['dividerStyle'], $allowed_divider_styles, true ) ) {
									$sanitized_widget['settings']['dividerStyle'] = $widget_settings['dividerStyle'];
								}
								if ( isset( $widget_settings['height'] ) ) {
									$sanitized_widget['settings']['height'] = max( 0, absint( $widget_settings['height'] ) );
								}
								if ( isset( $widget_settings['buttonStyle'] ) && in_array( $widget_settings['buttonStyle'], $allowed_button_styles, true ) ) {
									$sanitized_widget['settings']['buttonStyle'] = $widget_settings['buttonStyle'];
								}

								$widgets[] = $sanitized_widget;
							}
						}

						$columns[] = array(
							'id'      => sanitize_text_field( $column['id'] ),
							'width'   => in_array( $column['width'], $allowed_widths, true ) ? $column['width'] : '1/1',
							'align'   => in_array( $column['align'], $allowed_aligns, true ) ? $column['align'] : 'top',
							'widgets' => $widgets,
						);
					}
				}

				if ( empty( $columns ) ) {
					continue;
				}

				$sections[] = array(
					'id'         => sanitize_text_field( $section['id'] ),
					'background' => isset( $section['background'] ) ? sanitize_hex_color( $section['background'] ) : '',
					'paddingY'   => isset( $section['paddingY'] ) ? max( 0, absint( $section['paddingY'] ) ) : 16,
					'paddingX'   => isset( $section['paddingX'] ) ? max( 0, absint( $section['paddingX'] ) ) : 0,
					'gap'        => isset( $section['gap'] ) ? max( 0, absint( $section['gap'] ) ) : 16,
					'columns'    => $columns,
				);
			}
		}

		return array(
			'id'          => isset( $merged['id'] ) ? sanitize_text_field( $merged['id'] ) : $defaults['id'],
			'name'        => isset( $merged['name'] ) ? sanitize_text_field( $merged['name'] ) : $defaults['name'],
			'preset'      => isset( $merged['preset'] ) && in_array( $merged['preset'], $allowed_presets, true ) ? $merged['preset'] : $defaults['preset'],
			'accent'      => isset( $merged['accent'] ) ? sanitize_hex_color( $merged['accent'] ) : $defaults['accent'],
			'background'  => isset( $merged['background'] ) ? sanitize_hex_color( $merged['background'] ) : $defaults['background'],
			'text'        => isset( $merged['text'] ) ? sanitize_hex_color( $merged['text'] ) : $defaults['text'],
			'radius'      => isset( $merged['radius'] ) ? max( 0, absint( $merged['radius'] ) ) : $defaults['radius'],
			'spacing'     => isset( $merged['spacing'] ) ? max( 0, min( 3, absint( $merged['spacing'] ) ) ) : $defaults['spacing'],
			'font'        => isset( $merged['font'] ) && in_array( $merged['font'], $allowed_fonts, true ) ? $merged['font'] : $defaults['font'],
			'showLabels'  => ! empty( $merged['showLabels'] ),
			'buttonLabel' => isset( $merged['buttonLabel'] ) ? sanitize_text_field( $merged['buttonLabel'] ) : $defaults['buttonLabel'],
			'buttonStyle' => isset( $merged['buttonStyle'] ) && in_array( $merged['buttonStyle'], $allowed_button_styles, true ) ? $merged['buttonStyle'] : $defaults['buttonStyle'],
			'sections'    => ! empty( $sections ) ? $sections : $defaults['sections'],
			'updatedAt'   => time(),
		);
	}

	/**
	 * Get review form settings via AJAX.
	 */
	public function get_review_form_settings_ajax() {
		check_ajax_referer( 'tsreview_nonce' );
		if ( ! current_user_can( 'manage_options' ) ) {
			wp_send_json_error( array( 'message' => 'Permission denied' ) );
		}

		wp_send_json_success( self::get_review_form_settings() );
	}

	/**
	 * Save review form settings via AJAX.
	 */
	public function save_review_form_settings_ajax() {
		check_ajax_referer( 'tsreview_nonce' );
		if ( ! current_user_can( 'manage_options' ) ) {
			wp_send_json_error( array( 'message' => 'Permission denied' ) );
		}

		$settings = isset( $_POST['settings'] ) ? wp_unslash( $_POST['settings'] ) : array();
		if ( is_string( $settings ) ) {
			$decoded = json_decode( $settings, true );
			$settings = is_array( $decoded ) ? $decoded : array();
		}

		$sanitized = self::sanitize_review_form_settings( $settings );
		update_option( 'tsreview_review_form_settings', $sanitized );

		wp_send_json_success(
			array(
				'message'  => 'Review form settings saved successfully',
				'settings' => $sanitized,
			)
		);
	}

	/**
	 * Override WooCommerce reviews tab.
	 */
	public function override_reviews_tab( $tabs ) {
		$product = wc_get_product();

		if ( ! $product ) {
			return $tabs;
		}

		$showcase_id = $this->get_showcase_id_for_product();

		// If no showcase selected globally, return default tabs
		if ( ! $showcase_id ) {
			return $tabs;
		}

		// Override the reviews tab
		if ( isset( $tabs['reviews'] ) ) {
			$tabs['reviews']['callback'] = array( $this, 'render_custom_reviews' );
			$tabs['reviews']['title']     = esc_html__( 'Reviews', 'ts-review-showcase' );
		}

		return $tabs;
	}

	/**
	 * Render custom review showcase content.
	 */
	public function render_custom_reviews( $comments ) {
		$product = wc_get_product();

		if ( ! $product ) {
			return;
		}

		$showcase_id = $this->get_showcase_id_for_product();

		if ( ! $showcase_id ) {
			// Fallback to default
			comments_template();
			return;
		}

		$show_form = get_option( 'tsreview_show_review_form', '1' );

		// Get review count
		$count = $product->get_review_count();

		// Output the review showcase with form
		echo '<div id="reviews" class="woocommerce-Reviews ts-review-showcase-wrapper">';
		echo '<div id="comments">';
		echo '<h2 class="woocommerce-Reviews-title">';

		if ( $count ) {
			/* translators: 1: Review count, 2: Product title */
			printf( esc_html( _n( '%1$s review for %2$s', '%1$s reviews for %2$s', $count, 'ts-review-showcase' ) ), esc_html( $count ), '<span>' . esc_html( get_the_title() ) . '</span>' );
		} else {
			esc_html_e( 'Reviews', 'ts-review-showcase' );
		}

		echo '</h2>';

		// Review Showcase
		echo '<div class="ts-review-showcase" data-id="' . esc_attr( $showcase_id ) . '"></div>';

		// Review Form - Always rendered, React handles the toggle
		if ( $show_form ) {
			echo '<div class="tsreview-woocommerce-form-wrapper" style="margin-top: 24px;">';
			echo '<div class="ts-review-form-container" data-product-id="' . esc_attr( $product->get_id() ) . '"></div>';
			echo '</div>';
		}

		echo '</div></div>';
	}

	/**
	 * Get the showcase ID from global settings.
	 */
	private function get_showcase_id_for_product() {
		$showcase_id = get_option( 'tsreview_default_showcase_id', 0 );

		// Return showcase_id if it's a valid positive integer
		return $showcase_id && $showcase_id > 0 ? absint( $showcase_id ) : null;
	}

	/**
	 * Adjust review count when using custom showcase.
	 */
	public function adjust_review_count( $count, $product ) {
		$showcase_id = $this->get_showcase_id_for_product();

		if ( ! $showcase_id ) {
			return $count;
		}

		// Get actual review count from the showcase
		$review_ids = get_post_meta( $showcase_id, 'tsreview_reviews', true );

		if ( ! empty( $review_ids ) && is_array( $review_ids ) ) {
			return count( $review_ids );
		}

		return $count;
	}

	/**
	 * Enqueue frontend assets for product pages.
	 */
	public function enqueue_frontend_assets() {
		if ( ! is_product() ) {
			return;
		}

		$product = wc_get_product();

		if ( ! $product ) {
			return;
		}

		$showcase_id = $this->get_showcase_id_for_product();

		if ( ! $showcase_id ) {
			return;
		}

		// Enqueue jQuery (required for AJAX)
		wp_enqueue_script( 'jquery' );

		// Enqueue frontend CSS
		wp_enqueue_style(
			'tsreview-frontend-style',
			TSREVIEW_ROOT_DIR_URL . 'includes/assets/frontend/frontend.css',
			array(),
			TSREVIEW_VERSION
		);
		wp_add_inline_style( 'tsreview-frontend-style', Common::sanitize_inline_css( $this->get_custom_css() ) );

		// Enqueue frontend JS as a module
		$dependency = array( 'jquery' );
		if ( Common::isProActivated() ) {
			$dependency[] = 'tsreviewpro-frontend-script';
		}

		wp_enqueue_script(
			'tsreview-frontend-script',
			TSREVIEW_ROOT_DIR_URL . 'includes/assets/frontend/frontend.js',
			$dependency,
			TSREVIEW_VERSION,
			true
		);

		// Add inline script for settings before the module loads
		$settings = array(
			'ajax_url'     => admin_url( 'admin-ajax.php' ),
			'nonce'        => wp_create_nonce( 'tsreview_nonce' ),
			'wp_url'       => site_url(),
			'is_pro'       => Common::isProActivated(),
			'plugin_url'   => TSREVIEW_ROOT_DIR_URL,
			'devmode'      => get_option( 'tsreview_devmode', 0 ),
			'review_form_settings' => self::get_review_form_settings(),
		);

		wp_add_inline_script(
			'tsreview-frontend-script',
			'window.tsreview_settings = ' . wp_json_encode( $settings ) . ';',
			'before'
		);
	}

	/**
	 * Return custom CSS to hide the default WooCommerce form.
	 */
	private function get_custom_css() {
		return '
		.tsreview-hidden-form,
		.woocommerce-Reviews .comment-respond {
			display: none !important;
		}

		.ts-review-form-container {
			display: block !important;
		}

		.tsreview-woocommerce-form-wrapper {
			display: block !important;
		}';
	}

	/**
	 * Override the default review form - we render our own form.
	 */
	public function override_review_form( $args ) {
		$product = wc_get_product();

		if ( ! $product ) {
			return $args;
		}

		$showcase_id = $this->get_showcase_id_for_product();

		if ( ! $showcase_id ) {
			return $args;
		}

		// Return empty args to hide default WooCommerce form
		return array(
			'class'        => 'tsreview-hidden-form',
			'title_reply'  => '',
			'label_submit' => '',
			'comment_field' => '',
		);
	}
}
