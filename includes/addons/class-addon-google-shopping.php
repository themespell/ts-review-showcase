<?php
/**
 * Google Shopping Feed addon — generates XML product feed with review ratings.
 *
 * @package TSReview
 */

namespace TSReview;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Addon_Google_Shopping {

	public static function init() {
		add_action( 'init', array( __CLASS__, 'add_feed_endpoint' ) );
		add_action( 'template_redirect', array( __CLASS__, 'render_feed' ) );
	}

	public static function add_feed_endpoint() {
		$settings = Addon_Manager::get_settings( 'google_shopping' );
		$slug     = sanitize_title( $settings['feed_slug'] ?? 'product-feed' );
		add_rewrite_endpoint( $slug, EP_ROOT );
	}

	public static function render_feed() {
		global $wp;

		$settings = Addon_Manager::get_settings( 'google_shopping' );
		$slug     = sanitize_title( $settings['feed_slug'] ?? 'product-feed' );

		if ( ! isset( $wp->query_vars[ $slug ] ) ) {
			return;
		}

		if ( ! class_exists( 'WooCommerce' ) ) {
			return;
		}

		$include_rating      = ! empty( $settings['include_rating'] );
		$include_review_count = ! empty( $settings['include_review_count'] );

		header( 'Content-Type: application/rss+xml; charset=UTF-8' );
		echo '<?xml version="1.0" encoding="UTF-8"?>';
		echo '<rss version="2.0" xmlns:g="http://base.google.com/products/1.0">';
		echo '<channel>';
		echo '<title>' . esc_html( get_bloginfo( 'name' ) ) . ' Product Feed</title>';
		echo '<link>' . esc_url( home_url() ) . '</link>';
		echo '<description>Product feed with review ratings</description>';

		$products = wc_get_products( array(
			'status' => 'publish',
			'limit'  => -1,
		) );

		foreach ( $products as $product ) {
			$post_id = $product->get_id();
			echo '<item>';
			echo '<g:id>' . esc_html( $post_id ) . '</g:id>';
			echo '<title>' . esc_html( $product->get_name() ) . '</title>';
			echo '<link>' . esc_url( $product->get_permalink() ) . '</link>';
			echo '<description>' . esc_html( wp_strip_all_tags( $product->get_short_description() ) ) . '</description>';
			echo '<g:price>' . esc_html( $product->get_price() ) . '</g:price>';
			echo '<g:availability>' . esc_html( $product->is_in_stock() ? 'in stock' : 'out of stock' ) . '</g:availability>';
			echo '<g:condition>new</g:condition>';

			if ( $include_rating ) {
				echo '<g:rating>' . esc_html( $product->get_average_rating() ) . '</g:rating>';
			}
			if ( $include_review_count ) {
				echo '<g:review_count>' . esc_html( $product->get_rating_count() ) . '</g:review_count>';
			}

			$image_id  = $product->get_image_id();
			$image_url = $image_id ? wp_get_attachment_url( $image_id ) : wc_placeholder_img_src();
			echo '<g:image_link>' . esc_url( $image_url ) . '</g:image_link>';

			echo '</item>';
		}

		echo '</channel>';
		echo '</rss>';
		exit;
	}
}
