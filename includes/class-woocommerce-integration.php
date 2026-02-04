<?php
/**
 * WooCommerce Integration for Review Showcase
 *
 * Handles overriding default WooCommerce reviews with custom review showcase.
 *
 * @package TSReview
 */

namespace TSReview;

use TSReview\Common;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class WooCommerce_Integration {

	/**
	 * Initialize the WooCommerce integration.
	 */
	public static function init() {
		$self = new self();

		// Add product meta field for selecting showcase
		add_action( 'add_meta_boxes', array( $self, 'add_product_meta_box' ) );
		add_action( 'save_post_product', array( $self, 'save_product_meta_box' ), 10, 2 );

		// Save WooCommerce product data field
		add_action( 'woocommerce_process_product_meta_simple', array( $self, 'save_woocommerce_product_meta' ) );
		add_action( 'woocommerce_process_product_meta_variable', array( $self, 'save_woocommerce_product_meta' ) );

		// Override WooCommerce reviews tabs
		add_filter( 'woocommerce_product_tabs', array( $self, 'override_reviews_tab' ), 100 );

		// Replace review form
		add_filter( 'woocommerce_product_review_form_args', array( $self, 'override_review_form' ), 100 );

		// Hide default reviews if showcase is active
		add_filter( 'woocommerce_product_review_count', array( $self, 'adjust_review_count' ), 100, 2 );

		// Add setting to select default showcase
		add_action( 'woocommerce_product_options_advanced', array( $self, 'add_product_setting_field' ) );

		// Add setting page for global default showcase
		add_action( 'admin_menu', array( $self, 'add_settings_page' ) );
		add_action( 'admin_init', array( $self, 'register_settings' ) );

		// Enqueue frontend assets for product pages
		add_action( 'wp_enqueue_scripts', array( $self, 'enqueue_frontend_assets' ) );

		// Add shortcode for standalone review form
		add_shortcode( 'ts_review_form', array( $self, 'review_form_shortcode' ) );

		// Make frontend script a module
		add_filter( 'script_loader_tag', array( $self, 'make_script_module' ), 10, 3 );
	}

	/**
	 * Add meta box for selecting review showcase on product edit page.
	 */
	public function add_product_meta_box() {
		add_meta_box(
			'tsreview_showcase_selector',
			esc_html__( 'Review Showcase', 'ts-review-showcase' ),
			array( $this, 'render_meta_box_content' ),
			'product',
			'side',
			'default'
		);
	}

	/**
	 * Render meta box content.
	 */
	public function render_meta_box_content( $post ) {
		wp_nonce_field( 'tsreview_showcase_nonce', 'tsreview_showcase_nonce' );

		$selected_showcase = get_post_meta( $post->ID, '_tsreview_showcase_id', true );
		$show_form = get_post_meta( $post->ID, '_tsreview_show_form', true );
		$showcases = $this->get_available_showcases();

		?>
		<div class="tsreview-showcase-selector">
			<p class="howto">
				<?php esc_html_e( 'Select a review showcase to display on this product page instead of default reviews.', 'ts-review-showcase' ); ?>
			</p>

			<label for="tsreview_showcase_id" style="display: block; margin-bottom: 8px; font-weight: 600;">
				<?php esc_html_e( 'Select Showcase:', 'ts-review-showcase' ); ?>
			</label>

			<select name="tsreview_showcase_id" id="tsreview_showcase_id" style="width: 100%; padding: 8px;">
				<option value="">
					<?php esc_html_e( 'Default WooCommerce Reviews', 'ts-review-showcase' ); ?>
				</option>
				<?php if ( empty( $showcases ) ) : ?>
					<option value="" disabled>
						<?php esc_html_e( 'No showcases available. Create one first.', 'ts-review-showcase' ); ?>
					</option>
				<?php else : ?>
					<?php foreach ( $showcases as $showcase ) : ?>
						<option value="<?php echo esc_attr( $showcase['ID'] ); ?>" <?php selected( $selected_showcase, $showcase['ID'] ); ?>>
							<?php echo esc_html( $showcase['post_title'] ); ?>
						</option>
					<?php endforeach; ?>
				<?php endif; ?>
			</select>

			<?php if ( ! empty( $showcases ) ) : ?>
				<p class="description" style="margin-top: 10px; color: #666;">
					<?php esc_html_e( 'Leave empty to use default WooCommerce reviews.', 'ts-review-showcase' ); ?>
				</p>
			<?php endif; ?>

			<div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid #ddd;">
				<label style="display: flex; align-items: center; cursor: pointer;">
					<input
						type="checkbox"
						name="tsreview_show_form"
						value="1"
						<?php checked( $show_form, '1' ); ?>
						style="margin-right: 8px;"
					/>
					<span style="font-weight: 600;">
						<?php esc_html_e( 'Show Review Form', 'ts-review-showcase' ); ?>
					</span>
				</label>
				<p class="description" style="margin-top: 8px; color: #666; margin-left: 20px;">
					<?php esc_html_e( 'Display a custom review form below the reviews.', 'ts-review-showcase' ); ?>
				</p>
			</div>
		</div>

		<style>
			.tsreview-showcase-selector select {
				min-width: 200px;
			}
		</style>
		<?php
	}

	/**
	 * Save meta box data.
	 */
	public function save_product_meta_box( $post_id, $post ) {
		// Check nonce
		if ( ! isset( $_POST['tsreview_showcase_nonce'] ) ||
		     ! wp_verify_nonce( $_POST['tsreview_showcase_nonce'], 'tsreview_showcase_nonce' ) ) {
			return;
		}

		// Check autosave
		if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) {
			return;
		}

		// Check permissions
		if ( ! current_user_can( 'edit_post', $post_id ) ) {
			return;
		}

		// Save showcase selection
		$showcase_id = isset( $_POST['tsreview_showcase_id'] ) ? sanitize_text_field( $_POST['tsreview_showcase_id'] ) : '';

		if ( empty( $showcase_id ) ) {
			delete_post_meta( $post_id, '_tsreview_showcase_id' );
		} else {
			update_post_meta( $post_id, '_tsreview_showcase_id', absint( $showcase_id ) );
		}

		// Save form display setting
		$show_form = isset( $_POST['tsreview_show_form'] ) ? '1' : '';
		update_post_meta( $post_id, '_tsreview_show_form', $show_form );
	}

	/**
	 * Get available review showcases.
	 */
	private function get_available_showcases() {
		$showcases = get_posts( array(
			'post_type'      => 'ts-review-showcase',
			'post_status'    => 'publish',
			'posts_per_page' => -1,
			'orderby'        => 'title',
			'order'          => 'ASC',
		) );

		return $showcases;
	}

	/**
	 * Add product setting field in WooCommerce product data section.
	 */
	public function add_product_setting_field() {
		global $product;

		if ( ! $product ) {
			return;
		}

		$showcases = $this->get_available_showcases();
		$selected_showcase = get_post_meta( $product->get_id(), '_tsreview_showcase_id', true );
		$show_form = get_post_meta( $product->get_id(), '_tsreview_show_form', true );

		echo '<div class="options_group show_if_simple show_if_variable">';

		woocommerce_wp_select(
			array(
				'id'          => '_tsreview_showcase_id',
				'label'       => esc_html__( 'Review Showcase', 'ts-review-showcase' ),
				'description' => esc_html__( 'Select a custom review showcase to display instead of default reviews.', 'ts-review-showcase' ),
				'value'       => $selected_showcase,
				'options'     => array(
					'' => esc_html__( 'Default WooCommerce Reviews', 'ts-review-showcase' ),
				) + wp_list_pluck( $showcases, 'post_title', 'ID' ),
			)
		);

		woocommerce_wp_checkbox(
			array(
				'id'          => '_tsreview_show_form',
				'label'       => esc_html__( 'Show Review Form', 'ts-review-showcase' ),
				'description' => esc_html__( 'Display a custom review form below the reviews.', 'ts-review-showcase' ),
				'value'       => '1',
				'cbvalue'     => '1',
			)
		);

		echo '</div>';
	}

	/**
	 * Override WooCommerce reviews tab.
	 */
	public function override_reviews_tab( $tabs ) {
		global $product;

		if ( ! $product ) {
			return $tabs;
		}

		$showcase_id = $this->get_showcase_id_for_product( $product->get_id() );

		// If no showcase selected, return default tabs
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
		global $product;

		if ( ! $product ) {
			return;
		}

		$showcase_id = $this->get_showcase_id_for_product( $product->get_id() );

		if ( ! $showcase_id ) {
			// Fallback to default
			comments_template();
			return;
		}

		// Check if review form is enabled
		$show_form = get_post_meta( $product->get_id(), '_tsreview_show_form', true );
		if ( $show_form === '' ) {
			$show_form = true;
		}

		// Get review count
		$count = $product->get_review_count();

		// Prepare settings object
		$settings = array(
			'ajax_url' => admin_url( 'admin-ajax.php' ),
			'nonce'    => wp_create_nonce( 'tsreview_nonce' ),
			'is_pro'   => Common::isProActivated(),
			'devmode'  => false,
		);

		// Output inline script with settings BEFORE the module loads
		echo '<script>window.tsreview_settings = ' . json_encode( $settings ) . ';</script>';

		// Enqueue frontend assets
		wp_enqueue_style( 'tsreview-frontend-css', TSREVIEW_ROOT_DIR_URL . 'includes/assets/frontend/frontend.css' );
		wp_enqueue_script( 'tsreview-frontend-script', TSREVIEW_ROOT_DIR_URL . 'includes/assets/frontend/frontend.js', array(), TSREVIEW_VERSION, true );

		// Output the review showcase with form
		echo '<div id="reviews" class="woocommerce-Reviews ts-review-showcase-wrapper" style="margin-top: 40px;">';
		echo '<div id="comments">';
		echo '<h2 class="woocommerce-Reviews-title">';

		if ( $count ) {
			printf( esc_html( _n( '%1$s review for %2$s', '%1$s reviews for %2$s', $count, 'ts-review-showcase' ) ), esc_html( $count ), '<span>' . esc_html( get_the_title() ) . '</span>' );
		} else {
			esc_html_e( 'Reviews', 'ts-review-showcase' );
		}

		echo '</h2>';

		// Review Showcase
		echo '<div class="ts-review-showcase" data-id="' . esc_attr( $showcase_id ) . '"></div>';

		// Review Form Toggle
		if ( $show_form ) {
			echo '<div class="tsreview-form-toggle-wrapper" style="margin-top: 24px; text-align: center;">';
			echo '<button id="tsreview-toggle-form" class="button alt" style="background: linear-gradient(135deg, #2271b1 0%, #135e96 100%); color: white; border: none; padding: 12px 28px; border-radius: 8px; font-size: 15px; font-weight: 500; cursor: pointer;">';
			esc_html_e( 'Write a Review', 'ts-review-showcase' );
			echo '</button>';
			echo '</div>';

			echo '<div id="tsreview-form-container" class="ts-review-form-container" data-product-id="' . esc_attr( $product->get_id() ) . '" style="display: none;"></div>';

			// Add toggle script
			echo '<script>';
			echo 'document.addEventListener("DOMContentLoaded", function() {';
			echo 'var toggleBtn = document.getElementById("tsreview-toggle-form");';
			echo 'var formContainer = document.getElementById("tsreview-form-container");';
			echo 'if (toggleBtn && formContainer) {';
			echo 'toggleBtn.addEventListener("click", function(e) {';
			echo 'e.preventDefault();';
			echo 'if (formContainer.style.display === "none") {';
			echo 'formContainer.style.display = "block";';
			echo 'toggleBtn.textContent = "Cancel";';
			echo 'formContainer.scrollIntoView({ behavior: "smooth", block: "start" });';
			echo '} else {';
			echo 'formContainer.style.display = "none";';
			echo 'toggleBtn.textContent = "Write a Review";';
			echo '}';
			echo '});';
			echo '}';
			echo '});';
			echo '</script>';
		}

		echo '</div></div>';
	}

	/**
	 * Make script a module type.
	 */
	public function make_script_module( $tag, $handle, $src ) {
		if ( 'tsreview-frontend-script' === $handle ) {
			return '<script type="module" src="' . esc_url( $src ) . '"></script>';
		}
		return $tag;
	}

	/**
	 * Override legacy/shortcode-based reviews.
	 */
	public function override_legacy_reviews( $template_name ) {
		if ( 'single-product/reviews.php' !== $template_name ) {
			return;
		}

		global $product;

		if ( ! $product ) {
			return;
		}

		$showcase_id = $this->get_showcase_id_for_product( $product->get_id() );

		if ( ! $showcase_id ) {
			return;
		}

		// Buffer and override
		ob_start();
		echo '<div id="reviews" class="woocommerce-Reviews">';
		echo do_shortcode( '[ts_review_showcase id="' . absint( $showcase_id ) . '"]' );
		echo '</div>';
		echo ob_get_clean();

		// Prevent default template from loading
		remove_action( 'woocommerce_product_after_tabs', 'comments_template', 10 );
	}

	/**
	 * Get the showcase ID for a product.
	 * Checks product meta first, then global setting.
	 */
	private function get_showcase_id_for_product( $product_id ) {
		// Check product-specific setting
		$showcase_id = get_post_meta( $product_id, '_tsreview_showcase_id', true );

		// If not set, check for global default
		if ( empty( $showcase_id ) ) {
			$showcase_id = get_option( 'tsreview_default_showcase_id', 0 );
		}

		// Return showcase_id if it's a valid positive integer
		return $showcase_id && $showcase_id > 0 ? absint( $showcase_id ) : null;
	}

	/**
	 * Save WooCommerce product meta field.
	 */
	public function save_woocommerce_product_meta( $post_id ) {
		// Check autosave
		if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) {
			return;
		}

		// Check permissions
		if ( ! current_user_can( 'edit_post', $post_id ) ) {
			return;
		}

		// Save showcase selection
		$showcase_id = isset( $_POST['_tsreview_showcase_id'] ) ? sanitize_text_field( $_POST['_tsreview_showcase_id'] ) : '';

		if ( empty( $showcase_id ) ) {
			delete_post_meta( $post_id, '_tsreview_showcase_id' );
		} else {
			update_post_meta( $post_id, '_tsreview_showcase_id', absint( $showcase_id ) );
		}

		// Save form display setting
		$show_form = isset( $_POST['_tsreview_show_form'] ) ? '1' : '';
		update_post_meta( $post_id, '_tsreview_show_form', $show_form );
	}

	/**
	 * Add settings page under TS Review Showcase menu.
	 */
	public function add_settings_page() {
		add_submenu_page(
			'ts-review-showcase',
			esc_html__( 'WooCommerce Settings', 'ts-review-showcase' ),
			esc_html__( 'WooCommerce', 'ts-review-showcase' ),
			'manage_options',
			'tsreview-woocommerce-settings',
			array( $this, 'render_settings_page' )
		);
	}

	/**
	 * Render settings page.
	 */
	public function render_settings_page() {
		?>
		<div class="wrap">
			<h1><?php esc_html_e( 'WooCommerce Integration Settings', 'ts-review-showcase' ); ?></h1>

			<form method="post" action="options.php">
				<?php
				settings_fields( 'tsreview_woocommerce_settings' );
				do_settings_sections( 'tsreview_woocommerce_settings' );
				submit_button();
				?>
			</form>
		</div>
		<?php
	}

	/**
	 * Register settings.
	 */
	public function register_settings() {
		register_setting( 'tsreview_woocommerce_settings', 'tsreview_default_showcase_id', array(
			'type'              => 'integer',
			'sanitize_callback' => 'absint',
			'default'           => 0,
		) );

		add_settings_section(
			'tsreview_woocommerce_main',
			esc_html__( 'Default Review Showcase', 'ts-review-showcase' ),
			array( $this, 'render_section_description' ),
			'tsreview_woocommerce_settings'
		);

		add_settings_field(
			'default_showcase_id',
			esc_html__( 'Default Showcase', 'ts-review-showcase' ),
			array( $this, 'render_default_showcase_field' ),
			'tsreview_woocommerce_settings',
			'tsreview_woocommerce_main'
		);
	}

	/**
	 * Render section description.
	 */
	public function render_section_description() {
		echo '<p>' . esc_html__( 'Select a default review showcase to display on all product pages. You can override this per product.', 'ts-review-showcase' ) . '</p>';
	}

	/**
	 * Render default showcase field.
	 */
	public function render_default_showcase_field() {
		$showcases = $this->get_available_showcases();
		$selected = get_option( 'tsreview_default_showcase_id', 0 );

		?>
		<select name="tsreview_default_showcase_id" id="tsreview_default_showcase_id" style="min-width: 300px;">
			<option value="0">
				<?php esc_html_e( 'Use Default WooCommerce Reviews', 'ts-review-showcase' ); ?>
			</option>
			<?php foreach ( $showcases as $showcase ) : ?>
				<option value="<?php echo esc_attr( $showcase->ID ); ?>" <?php selected( $selected, $showcase->ID ); ?>>
					<?php echo esc_html( $showcase->post_title ); ?>
				</option>
			<?php endforeach; ?>
		</select>
		<p class="description">
			<?php esc_html_e( 'Products can override this setting individually.', 'ts-review-showcase' ); ?>
		</p>
		<?php
	}

	/**
	 * Override comments template for products with custom showcase.
	 */
	public function override_comments_template( $template ) {
		if ( ! is_product() ) {
			return $template;
		}

		global $product;

		if ( ! $product ) {
			return $template;
		}

		$showcase_id = $this->get_showcase_id_for_product( $product->get_id() );

		if ( ! $showcase_id ) {
			return $template;
		}

		// Return our custom template
		return TSREVIEW_ROOT_DIR_PATH . 'templates/reviews-template.php';
	}

	/**
	 * Adjust review count when using custom showcase.
	 * Returns actual review count but allows hiding default reviews.
	 */
	public function adjust_review_count( $count, $product ) {
		$showcase_id = $this->get_showcase_id_for_product( $product->get_id() );

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

		global $product;

		if ( ! $product ) {
			return;
		}

		$showcase_id = $this->get_showcase_id_for_product( $product->get_id() );

		if ( ! $showcase_id ) {
			return;
		}

		// Enqueue frontend CSS
		wp_enqueue_style(
			'tsreview-frontend-style',
			TSREVIEW_ROOT_DIR_URL . 'includes/assets/frontend/frontend.css',
			array(),
			TSREVIEW_VERSION
		);

		// Enqueue frontend JS
		wp_enqueue_script(
			'tsreview-frontend-script',
			TSREVIEW_ROOT_DIR_URL . 'includes/assets/frontend/frontend.js',
			array(),
			TSREVIEW_VERSION,
			true
		);

		// Localize script
		wp_localize_script(
			'tsreview-frontend-script',
			'tsreview_settings',
			array(
				'ajax_url'     => admin_url( 'admin-ajax.php' ),
				'nonce'        => wp_create_nonce( 'tsreview_nonce' ),
				'wp_url'       => site_url(),
				'is_pro'       => Common::isProActivated(),
				'plugin_url'   => TSREVIEW_ROOT_DIR_URL,
				'devmode'      => get_option( 'tsreview_devmode', 0 ),
			)
		);
	}

	/**
	 * Output showcase before reviews (for block themes and alternative layouts).
	 */
	public function output_showcase_before_reviews() {
		global $product;

		if ( ! $product ) {
			return;
		}

		$showcase_id = $this->get_showcase_id_for_product( $product->get_id() );

		if ( ! $showcase_id ) {
			return;
		}

		// Only output once per page load
		static $showcase_outputted = false;

		if ( $showcase_outputted ) {
			return;
		}

		$showcase_outputted = true;

		// Remove default reviews
		remove_action( 'woocommerce_reviews_before_review_list', 'woocommerce_reviews_load_reviews_from_db', 10 );
		remove_action( 'woocommerce_reviews_before_review_list', 'woocommerce_review_form', 20 );

		$this->render_showcase_with_form( $showcase_id );
	}

	/**
	 * Replace review content entirely.
	 */
	public function replace_review_content() {
		global $product;

		if ( ! $product ) {
			return;
		}

		$showcase_id = $this->get_showcase_id_for_product( $product->get_id() );

		if ( ! $showcase_id ) {
			return;
		}

		// Only output once
		static $reviews_replaced = false;

		if ( $reviews_replaced ) {
			return;
		}

		$reviews_replaced = true;

		// Hide default reviews output
		echo '<style>#reviews .commentlist, #reviews .review-list { display: none !important; }</style>';

		$this->render_showcase_with_form( $showcase_id );
	}

	/**
	 * Render showcase with form.
	 */
	private function render_showcase_with_form( $showcase_id ) {
		global $product;

		if ( ! $product ) {
			return;
		}

		// Check if review form is enabled
		$show_form = get_post_meta( $product->get_id(), '_tsreview_show_form', true );
		if ( $show_form === '' ) {
			$show_form = true;
		}

		echo '<div class="ts-review-showcase-wrapper" style="margin: 32px 0;">';
		echo '<div class="ts-review-showcase" data-id="' . esc_attr( $showcase_id ) . '"></div>';

		if ( $show_form ) {
			$unique_id = 'tsreview-' . $product->get_id();

			echo '<div class="tsreview-form-toggle-wrapper" style="margin-top: 24px; text-align: center;">';
			echo '<button id="tsreview-toggle-form-' . esc_attr( $unique_id ) . '" class="button alt" style="background: linear-gradient(135deg, #2271b1 0%, #135e96 100%); color: white; border: none; padding: 12px 28px; border-radius: 8px; font-size: 15px; font-weight: 500; cursor: pointer;">';
			esc_html_e( 'Write a Review', 'ts-review-showcase' );
			echo '</button>';
			echo '</div>';
			echo '<div id="tsreview-form-container-' . esc_attr( $unique_id ) . '" class="ts-review-form-container" data-product-id="' . esc_attr( $product->get_id() ) . '" style="display: none;"></div>';

			echo '<script>';
			echo '(function() {';
			echo 'var toggleBtn = document.getElementById("tsreview-toggle-form-' . esc_js( $unique_id ) . '");';
			echo 'var formContainer = document.getElementById("tsreview-form-container-' . esc_js( $unique_id ) . '");';
			echo 'if (toggleBtn && formContainer) {';
			echo 'toggleBtn.addEventListener("click", function(e) {';
			echo 'e.preventDefault();';
			echo 'if (formContainer.style.display === "none") {';
			echo 'formContainer.style.display = "block";';
			echo 'toggleBtn.textContent = "Cancel";';
			echo 'formContainer.scrollIntoView({ behavior: "smooth", block: "start" });';
			echo '} else {';
			echo 'formContainer.style.display = "none";';
			echo 'toggleBtn.textContent = "Write a Review";';
			echo '}';
			echo '});';
			echo '}';
			echo '})();';
			echo '</script>';
		}

		echo '</div>';
	}

	/**
	 * Output CSS to hide default reviews if showcase is active.
	 */
	public function maybe_output_showcase_css() {
		global $product;

		if ( ! $product || ! is_product() ) {
			return;
		}

		$showcase_id = $this->get_showcase_id_for_product( $product->get_id() );

		if ( ! $showcase_id ) {
			return;
		}

		// Hide default WooCommerce reviews and form
		echo '<style id="tsreview-hide-default-reviews">
			#reviews .comment-respond,
			#reviews .comment-form,
			.woocommerce-Reviews .comment-respond,
			.woocommerce-Reviews .comment-form {
				display: none !important;
			}
		</style>';
	}

	/**
	 * Override the default review form with our custom form.
	 */
	public function override_review_form( $args ) {
		global $product;

		if ( ! $product ) {
			return $args;
		}

		$showcase_id = $this->get_showcase_id_for_product( $product->get_id() );

		if ( ! $showcase_id ) {
			return $args;
		}

		// Check if form is enabled
		$show_form = get_post_meta( $product->get_id(), '_tsreview_show_form', true );
		if ( $show_form === '' ) {
			$show_form = true;
		}

		if ( ! $show_form ) {
			return $args;
		}

		// Return empty args to prevent default form
		return array(
			'class'        => 'tsreview-hidden-form',
			'title_reply'  => '',
			'label_submit' => '',
		);
	}

	/**
	 * Shortcode for standalone review form.
	 * Usage: [ts_review_form product_id="123"]
	 */
	public function review_form_shortcode( $atts ) {
		$atts = shortcode_atts(
			array(
				'product_id' => 0,
			),
			$atts,
			'ts_review_form'
		);

		// If no product_id provided, try to get current product
		if ( empty( $atts['product_id'] ) && is_product() ) {
			global $product;
			if ( $product ) {
				$atts['product_id'] = $product->get_id();
			}
		}

		if ( empty( $atts['product_id'] ) ) {
			return '<div class="ts-review-error">' . esc_html__( 'Please provide a product ID.', 'ts-review-showcase' ) . '</div>';
		}

		return '<div class="ts-review-form-container" data-product-id="' . esc_attr( $atts['product_id'] ) . '"></div>';
	}
}
