<?php

namespace TSReview;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Logger {

	const LOG_OPTION  = 'tsreview_dev_logs';
	const MODE_OPTION = 'tsreview_devmode';
	const MAX_LOGS    = 200;

	/**
	 * Check if dev logging is enabled.
	 *
	 * @return bool
	 */
	public static function is_enabled() {
		return '1' === get_option( self::MODE_OPTION, '0' );
	}

	/**
	 * Enable or disable dev logging.
	 *
	 * @param bool $enabled Enabled state.
	 * @return void
	 */
	public static function set_enabled( $enabled ) {
		update_option( self::MODE_OPTION, $enabled ? '1' : '0' );
	}

	/**
	 * Append log entry.
	 *
	 * @param string               $event Event name.
	 * @param array<string, mixed> $context Context.
	 * @param string               $level Level.
	 * @param bool                 $force Force log when disabled.
	 * @return void
	 */
	public static function log( $event, $context = array(), $level = 'info', $force = false ) {
		if ( ! self::is_enabled() && ! $force ) {
			return;
		}

		$logs   = self::get_logs();
		$logs[] = array(
			'time'    => current_time( 'mysql' ),
			'level'   => sanitize_key( $level ),
			'event'   => sanitize_text_field( $event ),
			'context' => self::sanitize_context( $context ),
		);

		if ( count( $logs ) > self::MAX_LOGS ) {
			$logs = array_slice( $logs, - self::MAX_LOGS );
		}

		update_option( self::LOG_OPTION, $logs, false );
	}

	/**
	 * Get all logs.
	 *
	 * @return array<int, array<string, mixed>>
	 */
	public static function get_logs() {
		$logs = get_option( self::LOG_OPTION, array() );
		return is_array( $logs ) ? $logs : array();
	}

	/**
	 * Clear logs.
	 *
	 * @return void
	 */
	public static function clear_logs() {
		update_option( self::LOG_OPTION, array(), false );
	}

	/**
	 * Sanitize log context.
	 *
	 * @param mixed $context Context.
	 * @return mixed
	 */
	private static function sanitize_context( $context ) {
		if ( is_array( $context ) ) {
			$clean = array();
			foreach ( $context as $key => $value ) {
				$clean[ sanitize_key( (string) $key ) ] = self::sanitize_context( $value );
			}
			return $clean;
		}

		if ( is_bool( $context ) || is_numeric( $context ) || null === $context ) {
			return $context;
		}

		return sanitize_text_field( (string) $context );
	}
}
