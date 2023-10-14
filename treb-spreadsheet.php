<?php
/**
 * Plugin Name:       TREB Spreadsheet
 * Description:       A block editor for embedding TREB spreadsheets in posts
 * Version:           0.6.0
 * Requires at least: 6.3
 * Requires PHP:      7.0
 * Author:            trebco llc
 * Author URI:        https://treb.app
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       treb-spreadsheet
 *
 * @package           create-block
 */

function add_type_attribute($tag, $handle, $src) {

  if ( 'treb' !== $handle ) {
    return $tag;
  }

  // change the script tag by adding type="module" and return it.
  $tag = '<script treb type="module" src="' . esc_url( $src ) . '"></script>';
  return $tag;

}

/**
 * Registers the block using the metadata loaded from the `block.json` file.
 * Behind the scenes, it registers also all assets so they can be enqueued
 * through the block editor in the corresponding context.
 *
 * @see https://developer.wordpress.org/reference/functions/register_block_type/
 */
function create_block_treb_spreadsheet_block_init() {
	register_block_type( __DIR__ . '/build' );

  $url = plugins_url('assets/treb-spreadsheet.mjs', __FILE__);
  $version = '28.0.5';

  wp_enqueue_script(
    'treb', 
    $url,
    array(),
    $version,
    array());

  // thanks to 
  // https://stackoverflow.com/questions/58931144/enqueue-javascript-with-type-module
  //
  // although we should check if there's a standard or offical way to do this
  
  add_filter('script_loader_tag', 'add_type_attribute' , 10, 3);

}

add_action( 'init', 'create_block_treb_spreadsheet_block_init' );
