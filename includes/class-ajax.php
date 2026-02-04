<?php
namespace TSReview;

use TSReview\Reviews;
use TSReview\ReviewShowcase;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class AJAX {

	public static function init() {
		$self = new self();
		Reviews::init();
		ReviewShowcase::init();
	}
}
