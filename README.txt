=== TS Customer Reviews ===
Contributors: themespell
Tags: customer reviews, woocommerce, reviews, review showcase, product reviews
Requires at least: 5.0
Tested up to: 7.1
Requires PHP: 7.4
Requires Plugins: woocommerce
Stable tag: 1.0.5
License: GPLv2 or later
License URI: http://www.gnu.org/licenses/gpl-2.0.txt

Beautifully showcase WooCommerce product reviews with custom layouts and multiple showcases.

== Description ==

TS Customer Reviews is a powerful WordPress plugin that replaces the default WooCommerce review display with beautiful, customizable review showcases. Create multiple showcases, select specific reviews, and display them anywhere on your site using shortcodes.

= Key Features =

* Multiple Review Showcases - Create unlimited review showcases
* Custom Review Form - Replace default WooCommerce review form with custom styling
* Beautiful Layouts - Grid, List, and Carousel, with Card and Overlay styles
* Responsive Design - Column count and gap follow the editor on desktop, tablet, and mobile
* Shortcode Support - Easy embedding with [ts_review_showcase id=""]
* Gutenberg Block - Insert a showcase from the block editor
* Verified Purchase Badge - Show verified buyer status
* Pro Version Ready - Easy upgrade to Pro features

= Shortcode Usage =

To display a review showcase, use the following shortcode:

`[ts_review_showcase id="123"]`

Where 123 is the ID of your showcase.

= Pro Features =

* More layout options
* Advanced styling controls
* Elementor widget
* Filterable review gallery
* And more...

== Installation ==

1. Upload the plugin files to the /wp-content/plugins/ directory
2. Activate the plugin through the 'Plugins' screen in WordPress
3. Navigate to 'TS Review Showcase' in the admin menu to create your first showcase

== Frequently Asked Questions ==

= Does this replace WooCommerce default reviews? =

Yes, this plugin is designed to replace the default WooCommerce review display with a more beautiful and customizable option.

= Can I display reviews from specific products only? =

The product page uses your default showcase. A showcase shortcode shows the approved reviews loaded for that showcase.

= Can I change the layout of reviews? =

Yes, you can choose Grid, List, or Carousel, and set columns and spacing per device.

= Where can I find the source code? =

The plugin is open source and available on GitHub at [https://github.com/themespell/ts-review-showcase/](https://github.com/themespell/ts-review-showcase/).

== Changelog ==

= 1.0.5 =
* Editor column and gap settings now apply on the live site
* Settings fields keep focus while typing
* Email tokens use one list, and the fields on the settings screen are saved
* Review schema is merged into WooCommerce structured data
* Public pages receive only the settings the showcase needs
* Frontend assets load only on product pages, shortcodes, and the showcase block
* Removed admin notice suppression and added uninstall cleanup
* One scheduled review reminder email after an order is completed
* One review reward coupon, sent after the review is approved
* Review form starts with no star selected and shows success in place
* List layout, with server-side star filter, sort, and a rating histogram
* Gutenberg block inserts a review showcase
* Plugin requires WooCommerce
* Smaller public script, and strings are ready for translation

= 1.0.4 =
* Updated Branding
* Readme updated

= 1.0.3 =
* Fixed version detection to read from PHP define() constant
* Fixed version mismatch between PHP constant and README
* Readme updated

= 1.0.2 =
* Updated asset loading for WordPress.org plugin review compatibility
* Updated plugin bootstrap filename and package metadata
* Readme updated

= 1.0.1 =
* Updated asset loading for WordPress.org plugin review compatibility
* Updated plugin bootstrap filename and package metadata

= 1.0.0 =
* Initial release
