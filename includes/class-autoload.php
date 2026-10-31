<?php
namespace TSReview;

class Autoload {

	public static function autoload() {
		$directories = array(
			TSREVIEW_INCLUDES_DIR_PATH,
			TSREVIEW_INCLUDES_DIR_PATH . 'ajax/',
			TSREVIEW_INCLUDES_DIR_PATH . 'addons/',
		);

		foreach ( $directories as $directory ) {
			$files = glob( $directory . '*.php' );

			foreach ( $files as $file ) {
				if ( file_exists( $file ) ) {
					require_once $file;
				}
			}
		}
	}

	public static function init() {
		static $registered = false;

		if ( ! $registered ) {
			spl_autoload_register( array( __CLASS__, 'autoload' ) );
			$registered = true;
		}
	}
}

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

Autoload::init();
