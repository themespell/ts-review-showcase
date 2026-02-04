<?php
/**
 * Custom Reviews Template for TS Review Showcase
 *
 * This template replaces the default WooCommerce reviews when a custom showcase is selected.
 *
 * @package TSReview
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

global $product;

if ( ! $product ) {
	return;
}

// Get the showcase ID for this product
$showcase_id = get_post_meta( $product->get_id(), '_tsreview_showcase_id', true );

// If no product-specific showcase, check global default
if ( ! $showcase_id ) {
	$showcase_id = get_option( 'tsreview_default_showcase_id', '' );
}

// If no showcase selected, fall back to default template
if ( ! $showcase_id ) {
	// Load default WooCommerce comments template
	wc_get_template( 'single-product-reviews.php' );
	return;
}

// Check if review form is enabled for this product
$show_form = get_post_meta( $product->get_id(), '_tsreview_show_form', true );
// Default to true if not set
if ( $show_form === '' ) {
	$show_form = true;
}

?>
<div id="reviews" class="woocommerce-Reviews ts-review-showcase-wrapper">
	<div id="comments">
		<h2 class="woocommerce-Reviews-title">
			<?php
			$count = $product->get_review_count();
			if ( $count ) {
				printf( esc_html( _n( '%1$s review for %2$s', '%1$s reviews for %2$s', $count, 'ts-review-showcase' ) ), esc_html( $count ), '<span>' . get_the_title() . '</span>' );
			} else {
				esc_html_e( 'Reviews', 'ts-review-showcase' );
			}
			?>
		</h2>

		<!-- Review Showcase -->
		<div class="ts-review-showcase" data-id="<?php echo esc_attr( $showcase_id ); ?>"></div>

		<?php if ( $show_form ) : ?>
			<!-- Review Form Toggle Button -->
			<div class="tsreview-form-toggle-wrapper" style="margin-top: 32px; text-align: center;">
				<button
					id="tsreview-toggle-form"
					class="button alt"
					style="
						background: linear-gradient(135deg, #2271b1 0%, #135e96 100%);
						color: white;
						border: none;
						padding: 14px 32px;
						border-radius: 8px;
						font-size: 16px;
						font-weight: 500;
						cursor: pointer;
						transition: transform 0.2s, box-shadow 0.2s;
					"
					onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 12px rgba(34, 113, 177, 0.3)'"
					onmouseout="this.style.transform=''; this.style.boxShadow=''"
				>
					<?php esc_html_e( 'Write a Review', 'ts-review-showcase' ); ?>
				</button>
			</div>

			<!-- Review Form Container (Hidden by default) -->
			<div
				id="tsreview-form-container"
				class="ts-review-form-container"
				data-product-id="<?php echo esc_attr( $product->get_id() ); ?>"
				style="display: none;"
			></div>
		<?php endif; ?>
	</div>
</div>

<script>
document.addEventListener('DOMContentLoaded', function() {
	var toggleBtn = document.getElementById('tsreview-toggle-form');
	var formContainer = document.getElementById('tsreview-form-container');

	if (toggleBtn && formContainer) {
		toggleBtn.addEventListener('click', function(e) {
			e.preventDefault();
			if (formContainer.style.display === 'none') {
				formContainer.style.display = 'block';
				toggleBtn.textContent = '<?php esc_html_e( 'Cancel Review', 'ts-review-showcase' ); ?>';
				// Scroll to form
				formContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
			} else {
				formContainer.style.display = 'none';
				toggleBtn.textContent = '<?php esc_html_e( 'Write a Review', 'ts-review-showcase' ); ?>';
			}
		});
	}
});
</script>
