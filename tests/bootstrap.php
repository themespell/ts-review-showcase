<?php

define( 'ABSPATH', __DIR__ . '/' );

if ( ! function_exists( 'sanitize_key' ) ) {
	function sanitize_key( $key ) {
		$key = strtolower( (string) $key );
		return preg_replace( '/[^a-z0-9_\-]/', '', $key );
	}
}

if ( ! function_exists( 'absint' ) ) {
	function absint( $maybeint ) {
		return abs( (int) $maybeint );
	}
}

require dirname( __DIR__ ) . '/includes/ajax/class-helper.php';
require dirname( __DIR__ ) . '/includes/ajax/class-reviews.php';
require dirname( __DIR__ ) . '/includes/addons/class-woocommerce.php';
