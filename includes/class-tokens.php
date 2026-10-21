<?php

namespace TSReview;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Tokens {

	/**
	 * Replace email tokens, including legacy aliases.
	 *
	 * @param string               $content Template text.
	 * @param array<string,string> $tokens  Token map.
	 * @return string
	 */
	public static function replace( $content, $tokens ) {
		$tokens = is_array( $tokens ) ? $tokens : array();

		if ( isset( $tokens['{store_name}'] ) && ! isset( $tokens['{shop_name}'] ) ) {
			$tokens['{shop_name}'] = $tokens['{store_name}'];
		}
		if ( isset( $tokens['{review_link}'] ) && ! isset( $tokens['{review_url}'] ) ) {
			$tokens['{review_url}'] = $tokens['{review_link}'];
		}

		return strtr( (string) $content, $tokens );
	}
}
