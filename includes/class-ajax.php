<?php
namespace TSReview;

use TSReview\Reviews;
use TSReview\ReviewShowcase;
use TSReview\FormBuilder;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class AJAX {

	public static function init() {
		$self = new self();
		Helper::init();
		Reviews::init();
		ReviewShowcase::init();
		FormBuilder::init();
	}
}
