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

$product_id    = $product->get_id();
$container_id  = 'tsreview-form-container-' . $product_id;
$button_id     = 'tsreview-toggle-form-' . $product_id;
$frontend_css  = '
.tsreview-form-toggle-wrapper {
	margin-top: 32px;
	text-align: center;
}

.tsreview-form-toggle-button {
	background: linear-gradient(135deg, #2271b1 0%, #135e96 100%);
	border: 0;
	border-radius: 8px;
	box-shadow: none;
	color: #fff;
	cursor: pointer;
	font-size: 16px;
	font-weight: 500;
	padding: 14px 32px;
	transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.tsreview-form-toggle-button:hover,
.tsreview-form-toggle-button:focus {
	box-shadow: 0 4px 12px rgba(34, 113, 177, 0.3);
	color: #fff;
	transform: translateY(-2px);
}

.ts-review-form-container.is-hidden {
	display: none;
}';

if ( class_exists( '\TSReview\Common' ) ) {
	$frontend_css = \TSReview\Common::sanitize_inline_css( $frontend_css );
}

wp_add_inline_style( 'tsreview-frontend-css', $frontend_css );
wp_add_inline_style( 'tsreview-frontend-style', $frontend_css );

$frontend_script = "(function(){function init(){document.querySelectorAll('.tsreview-form-toggle-button').forEach(function(toggleBtn){if(toggleBtn.dataset.tsreviewBound==='1'){return;}var targetId=toggleBtn.getAttribute('aria-controls');var formContainer=targetId?document.getElementById(targetId):null;if(!formContainer){return;}toggleBtn.dataset.tsreviewBound='1';toggleBtn.addEventListener('click',function(event){event.preventDefault();var isHidden=formContainer.classList.contains('is-hidden');formContainer.classList.toggle('is-hidden');toggleBtn.textContent=isHidden?toggleBtn.dataset.hideLabel:toggleBtn.dataset.showLabel;toggleBtn.setAttribute('aria-expanded',isHidden?'true':'false');if(isHidden){formContainer.scrollIntoView({behavior:'smooth',block:'start'});}});});}if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',init,{once:true});}else{init();}})();";

wp_add_inline_script( 'tsreview-frontend-script', $frontend_script );

?>
<div id="reviews" class="woocommerce-Reviews ts-review-showcase-wrapper">
	<div id="comments">
		<h2 class="woocommerce-Reviews-title">
			<?php
			$count = $product->get_review_count();
			if ( $count ) {
				/* translators: 1: Review count, 2: Product title */
				printf( esc_html( _n( '%1$s review for %2$s', '%1$s reviews for %2$s', $count, 'ts-review-showcase' ) ), esc_html( $count ), '<span>' . esc_html( get_the_title() ) . '</span>' );
			} else {
				esc_html_e( 'Reviews', 'ts-review-showcase' );
			}
			?>
		</h2>

		<!-- Review Showcase -->
		<div class="ts-review-showcase" data-id="<?php echo esc_attr( $showcase_id ); ?>"></div>

		<?php if ( $show_form ) : ?>
			<div class="tsreview-form-toggle-wrapper">
				<button
					id="<?php echo esc_attr( $button_id ); ?>"
					class="button alt tsreview-form-toggle-button"
					type="button"
					aria-controls="<?php echo esc_attr( $container_id ); ?>"
					aria-expanded="false"
					data-show-label="<?php echo esc_attr__( 'Write a Review', 'ts-review-showcase' ); ?>"
					data-hide-label="<?php echo esc_attr__( 'Cancel Review', 'ts-review-showcase' ); ?>"
				>
					<?php esc_html_e( 'Write a Review', 'ts-review-showcase' ); ?>
				</button>
			</div>

			<div
				id="<?php echo esc_attr( $container_id ); ?>"
				class="ts-review-form-container is-hidden"
				data-product-id="<?php echo esc_attr( $product_id ); ?>"
			></div>
		<?php endif; ?>
	</div>
</div>
