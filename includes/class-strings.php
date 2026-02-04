<?php

namespace TSReview;

if (!defined('ABSPATH')) {
    exit;
}

class Strings {

    public static function get_translated_strings() {
        return array(
            // Menu items
            'dashboard'              => __('Dashboard', 'ts-review-showcase'),
            'review_showcase'        => __('Review Showcase', 'ts-review-showcase'),
            'tools'                  => __('Tools', 'ts-review-showcase'),
            'account'                => __('Account', 'ts-review-showcase'),
            'support_forum'          => __('Support', 'ts-review-showcase'),
            'get_pro'                => __('Get Pro', 'ts-review-showcase'),
            'upgrade_to_pro'         => __('Upgrade to Pro', 'ts-review-showcase'),
            'documentations'         => __('Documentations', 'ts-review-showcase'),
            'help_and_support'       => __('Help & Support', 'ts-review-showcase'),

            // Actions
            'add'                    => __('Add', 'ts-review-showcase'),
            'create'                 => __('Create', 'ts-review-showcase'),
            'select'                 => __('Select', 'ts-review-showcase'),
            'settings'               => __('Settings', 'ts-review-showcase'),
            'update'                 => __('Update', 'ts-review-showcase'),
            'publish'                => __('Publish', 'ts-review-showcase'),
            'save'                   => __('Save', 'ts-review-showcase'),
            'cancel'                 => __('Cancel', 'ts-review-showcase'),
            'title'                  => __('Title', 'ts-review-showcase'),
            'shortcode'              => __('Shortcode', 'ts-review-showcase'),
            'snippet'                => __('Snippet', 'ts-review-showcase'),
            'action'                 => __('Action', 'ts-review-showcase'),
            'edit'                   => __('Edit', 'ts-review-showcase'),
            'edit_design'            => __('Edit Design', 'ts-review-showcase'),
            'delete'                 => __('Delete', 'ts-review-showcase'),
            'duplicate'              => __('Duplicate', 'ts-review-showcase'),

            // Review fields
            'reviewer_name'          => __('Reviewer Name', 'ts-review-showcase'),
            'reviewer_email'         => __('Reviewer Email', 'ts-review-showcase'),
            'rating'                 => __('Rating', 'ts-review-showcase'),
            'review_title'           => __('Review Title', 'ts-review-showcase'),
            'review_content'         => __('Review Content', 'ts-review-showcase'),
            'review_date'            => __('Review Date', 'ts-review-showcase'),
            'verified_purchase'      => __('Verified Purchase', 'ts-review-showcase'),
            'product'                => __('Product', 'ts-review-showcase'),
            'image'                  => __('Image', 'ts-review-showcase'),

            // Showcase settings
            'showcase_name'          => __('Showcase Name', 'ts-review-showcase'),
            'select_reviews'         => __('Select Reviews', 'ts-review-showcase'),
            'select_showcase'        => __('Select Showcase', 'ts-review-showcase'),
            'all_reviews'            => __('All Reviews', 'ts-review-showcase'),
            'filter_by_product'      => __('Filter by Product', 'ts-review-showcase'),
            'filter_by_rating'       => __('Filter by Rating', 'ts-review-showcase'),
            'loading_editor'         => __('Loading Editor', 'ts-review-showcase'),

            // Display settings
            'view_style'             => __('View Style', 'ts-review-showcase'),
            'layout'                 => __('Layout', 'ts-review-showcase'),
            'grid_view'              => __('Grid View', 'ts-review-showcase'),
            'list_view'              => __('List View', 'ts-review-showcase'),
            'masonry_view'           => __('Masonry View', 'ts-review-showcase'),
            'columns'                => __('Columns', 'ts-review-showcase'),
            'column_gap'             => __('Column Gap', 'ts-review-showcase'),
            'container_width'        => __('Container Width', 'ts-review-showcase'),
            'style'                  => __('Style', 'ts-review-showcase'),
            'common_styles'          => __('Common Styles', 'ts-review-showcase'),

            // Style settings
            'background_color'       => __('Background Color', 'ts-review-showcase'),
            'text_color'             => __('Text Color', 'ts-review-showcase'),
            'star_color'             => __('Star Color', 'ts-review-showcase'),
            'border_color'           => __('Border Color', 'ts-review-showcase'),
            'border_width'           => __('Border Width', 'ts-review-showcase'),
            'border_radius'          => __('Border Radius', 'ts-review-showcase'),
            'card_background_color'  => __('Card Background Color', 'ts-review-showcase'),
            'name_color'             => __('Name Color', 'ts-review-showcase'),
            'rating_color'           => __('Rating Color', 'ts-review-showcase'),
            'content_color'          => __('Content Color', 'ts-review-showcase'),

            // Typography
            'font'                   => __('Font', 'ts-review-showcase'),
            'name_typography'        => __('Name Typography', 'ts-review-showcase'),
            'content_typography'     => __('Content Typography', 'ts-review-showcase'),
            'rating_typography'      => __('Rating Typography', 'ts-review-showcase'),

            // Display options
            'show_images'            => __('Show Images', 'ts-review-showcase'),
            'show_ratings'           => __('Show Ratings', 'ts-review-showcase'),
            'show_dates'             => __('Show Dates', 'ts-review-showcase'),
            'show_products'          => __('Show Products', 'ts-review-showcase'),
            'show_verified_badge'    => __('Show Verified Badge', 'ts-review-showcase'),

            // Messages
            'successfully_updated'   => __('Successfully Updated', 'ts-review-showcase'),
            'settings_updated_message' => __('The settings have been successfully updated.', 'ts-review-showcase'),
            'showcase_created'       => __('Showcase created successfully.', 'ts-review-showcase'),
            'showcase_updated'       => __('Showcase updated successfully.', 'ts-review-showcase'),
            'showcase_deleted'       => __('Showcase deleted successfully.', 'ts-review-showcase'),
            'showcase_duplicated'    => __('Showcase duplicated successfully.', 'ts-review-showcase'),
            'are_you_sure'           => __('Are you sure?', 'ts-review-showcase'),
            'delete_confirmation'    => __("You're going to delete this", 'ts-review-showcase'),
            'no_keep_it'             => __('No, Keep it.', 'ts-review-showcase'),
            'yes_delete'             => __('Yes, Delete!', 'ts-review-showcase'),
            'no_reviews_found'       => __('No reviews found.', 'ts-review-showcase'),
            'no_showcases_found'     => __('No showcases found. Create your first showcase!', 'ts-review-showcase'),
            'select_showcase_to_edit' => __('Select a showcase to edit or create a new one.', 'ts-review-showcase'),

            // Review form
            'submit_review'          => __('Submit Review', 'ts-review-showcase'),
            'your_review'            => __('Your Review', 'ts-review-showcase'),
            'rate_this_product'      => __('Rate this product', 'ts-review-showcase'),
            'your_name'              => __('Your Name', 'ts-review-showcase'),
            'your_email'             => __('Your Email', 'ts-review-showcase'),
            'review_headline'        => __('Review Headline', 'ts-review-showcase'),
            'write_review'           => __('Write Your Review Here', 'ts-review-showcase'),
            'required_fields'        => __('(*) fields are required', 'ts-review-showcase'),

            // Sort options
            'sort_by'                => __('Sort By', 'ts-review-showcase'),
            'newest_first'           => __('Newest First', 'ts-review-showcase'),
            'oldest_first'           => __('Oldest First', 'ts-review-showcase'),
            'highest_rated'          => __('Highest Rated', 'ts-review-showcase'),
            'lowest_rated'           => __('Lowest Rated', 'ts-review-showcase'),
            'most_helpful'           => __('Most Helpful', 'ts-review-showcase'),
        );
    }
}
