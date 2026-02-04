<?php

namespace TSReview;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Admin {

	public static function init() {
		$self = new self();
		add_action( 'admin_menu', array( $self, 'add_admin_menu' ) );
	}

	public function add_admin_menu() {
		$parent = 'ts-review-showcase';

		add_menu_page(
			__( 'TS Review Showcase', 'ts-review-showcase' ),
			'TS Review Showcase',
			'manage_options',
			$parent,
			array( $this, 'tsreview_callback' ),
			'dashicons-testimonial',
			30
		);

		add_submenu_page(
        	$parent,
        	__( 'Dashboard', 'ts-review-showcase' ),
        	__( 'Dashboard', 'ts-review-showcase' ),
        	'manage_options',
        	'ts-review-showcase&path=dashboard',
        	array( $this, 'tsreview_callback' ),
        );

		add_submenu_page(
			$parent,
			__( 'Review Showcase', 'ts-review-showcase' ),
			__( 'Review Showcase', 'ts-review-showcase' ),
			'manage_options',
			'ts-review-showcase&path=showcase',
			array( $this, 'tsreview_callback' ),
		);

		add_submenu_page(
			$parent,
			__( 'Custom Review Form', 'ts-review-showcase' ),
			__( 'Review Form', 'ts-review-showcase' ),
			'manage_options',
			'ts-review-showcase&path=review-form',
			array( $this, 'tsreview_callback' ),
		);

		// Remove the duplicate parent submenu
		remove_submenu_page( $parent, $parent );
	}

	public function tsreview_callback() {
		?>
		<div id="ts-review-showcase"></div>
		<?php
	}
}
