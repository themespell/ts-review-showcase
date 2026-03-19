<?php

namespace TSReview;

use TSReview\Common;
use TSReview\Strings;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Enqueue {

	public static function init() {
		$self = new self();
		add_action( 'admin_enqueue_scripts', array( $self, 'tsreview_admin_scripts' ) );
	}

	public function tsreview_admin_scripts() {
		$screen_info = Common::get_current_screen_info();
		$isPro       = Common::isProActivated();
		$dependency  = array( 'jquery', 'wp-i18n' );

		if ( $isPro ) {
			$dependency[] = 'tsreviewpro-admin-script';
		}

		if ( $screen_info ) {
			wp_enqueue_media();
			wp_enqueue_style( 'tsreview-admin-css', TSREVIEW_ROOT_DIR_URL . 'includes/assets/admin/admin.css' );
			wp_enqueue_script( 'tsreview-admin-script', TSREVIEW_ROOT_DIR_URL . 'includes/assets/admin/admin.js', $dependency, TSREVIEW_VERSION, true );
			wp_set_script_translations( 'tsreview-admin-script', 'ts-review-showcase', TSREVIEW_ROOT_DIR_PATH . 'languages' );

			wp_localize_script(
				'tsreview-admin-script',
				'tsreview_settings',
				array(
					'ajax_url'     => admin_url( 'admin-ajax.php' ),
					'admin_url'    => get_admin_url(),
					'nonce'        => wp_create_nonce( 'tsreview_nonce' ),
					'wp_url'       => site_url(),
					'assets_path'  => TSREVIEW_ROOT_DIR_URL . 'includes/library/',
					'is_pro'       => $isPro,
					'plugin_url'   => TSREVIEW_ROOT_DIR_URL,
				)
			);

			wp_localize_script(
                'tsreview-admin-script',
                'tsreview_i18n',
                 Strings::get_translated_strings()
            );

			remove_all_actions( 'admin_notices' );
			remove_all_actions( 'all_admin_notices' );
		}

		add_filter( 'script_loader_tag', array( $this, 'add_module_type_to_script' ), 10, 3 );
	}

	public function add_module_type_to_script( $tag, $handle, $src ) {
		if ( 'tsreview-admin-script' === $handle ) {
			$tag = str_replace( '<script ', '<script type="module" ', $tag );
		}
		return $tag;
	}
}
