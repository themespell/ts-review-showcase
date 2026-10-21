<?php

use PHPUnit\Framework\TestCase;
use TSReview\Helper;
use TSReview\Reviews;
use TSReview\WooCommerceIntegration;

class SmokeTest extends TestCase {

	public function test_review_input_rejects_missing_fields_and_bad_rating() {
		$errors = Reviews::review_input_errors(
			array(
				'product_id' => 0,
				'name'       => '',
				'email'      => '',
				'content'    => '',
				'rating'     => 0,
			)
		);

		$this->assertContains( 'missing', $errors );
		$this->assertContains( 'rating', $errors );
		$this->assertNotContains( 'email', $errors );
	}

	public function test_review_input_rejects_invalid_email() {
		$errors = Reviews::review_input_errors(
			array(
				'product_id' => 12,
				'name'       => 'Amina',
				'email'      => 'not-an-email',
				'content'    => 'Good product',
				'rating'     => 4,
			)
		);

		$this->assertSame( array( 'email' ), $errors );
	}

	public function test_review_input_accepts_a_complete_review() {
		$errors = Reviews::review_input_errors(
			array(
				'product_id' => 12,
				'name'       => 'Amina',
				'email'      => 'amina@example.com',
				'content'    => 'Good product',
				'rating'     => 5,
			)
		);

		$this->assertSame( array(), $errors );
	}

	public function test_public_query_sorts_and_filters_on_the_server() {
		$recent = Helper::build_public_review_query( array( 'sort' => 'recent', 'rating' => 9 ) );
		$this->assertSame( 'comment_date', $recent['orderby'] );
		$this->assertArrayNotHasKey( 'meta_query', $recent );

		$high = Helper::build_public_review_query(
			array(
				'sort'    => 'rating_high',
				'rating'  => 3,
				'post_id' => 44,
			)
		);
		$this->assertSame( 'meta_value_num', $high['orderby'] );
		$this->assertSame( 'DESC', $high['order'] );
		$this->assertSame( 44, $high['post_id'] );
		$this->assertSame( '3', $high['meta_query'][0]['value'] );

		$low = Helper::build_public_review_query( array( 'sort' => 'rating_low' ) );
		$this->assertSame( 'ASC', $low['order'] );
	}

	public function test_rating_summary_uses_the_full_set() {
		$summary = Helper::summarize_rating_rows(
			array(
				array( 'rating' => 5, 'total' => 2 ),
				array( 'rating' => 4, 'total' => 1 ),
				array( 'rating' => 0, 'total' => 9 ),
			)
		);

		$this->assertSame( 3, $summary['total'] );
		$this->assertSame( 4.67, $summary['average'] );
		$this->assertSame( 2, $summary['counts']['5'] );
		$this->assertSame( 0, $summary['counts']['1'] );
	}

	public function test_settings_save_keeps_groups_that_were_not_posted() {
		$current = array(
			'general' => array(
				'default_showcase' => '8',
				'auto_approve'     => false,
			),
			'emails'  => array(
				'from_name' => 'Shop',
				'bcc'       => '',
			),
		);
		$incoming = array(
			'emails'  => array(
				'from_name' => 'Makatab',
			),
			'unknown' => array(
				'from_name' => 'Ignored',
			),
		);

		$merged = WooCommerceIntegration::merge_setting_groups( $current, $incoming );

		$this->assertSame( '8', $merged['general']['default_showcase'] );
		$this->assertFalse( $merged['general']['auto_approve'] );
		$this->assertSame( 'Makatab', $merged['emails']['from_name'] );
		$this->assertSame( '', $merged['emails']['bcc'] );
		$this->assertArrayNotHasKey( 'unknown', $merged );
	}
}
