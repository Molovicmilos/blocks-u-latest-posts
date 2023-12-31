<?php
/**
 * Plugin Name:       Latest Posts Molke
 * Description:       Display and filter posts
 * Requires PHP:      7.0
 * Author:            Molke
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       latest-posts
 *
 * @package           blocks-u
 */

/**
 * Registers the block using the metadata loaded from the `block.json` file.
 * Behind the scenes, it registers also all assets so they can be enqueued
 * through the block editor in the corresponding context.
 *
 * @see https://developer.wordpress.org/reference/functions/register_block_type/
 */

 function blocks_u_render_lates_posts_block($attributes) {
	$args = array(
		'posts_per_page' => $attributes['numberOfPosts'],
		'post_status' => 'publish',
		'order' => $attributes['order'],
		'orderby' => $attributes['orderBy']
	);
	if(isset($attributes['categories'])) {
		$args['category__in'] = array_column($attributes['categories'], 'id');
	}
	$recent_posts = get_posts($args);

	$posts = '<ul ' . get_block_wrapper_attributes() . '>';
	foreach($recent_posts as $post) {
		$title = get_the_title($post);
		$title = $title ? $title : __('(No title)', 'latest-posts');
		$permalink = get_permalink( $post );
		$excerpt = get_the_excerpt( $post );
		
		$posts .= '<li>';

		if($attributes["displayFeaturedImage"] && has_post_thumbnail( $post )) {
			$posts .= get_the_post_thumbnail( $post, 'large' );
		}

		$posts .= '<h5><a href="'. esc_url($permalink) . '">' . $title . '</a></h5>';
		$posts .= '<time datetime="' . esc_attr( get_the_date('c', $post)) . '">' . esc_html( get_the_date('', $post)) . '</time>';

		$excerpt ? $posts .='<p>' . $excerpt . '</p>' : null;

		$posts .= '</li>';
	}
	$posts .= '</ul>';

	return $posts;
}

function blocks_u_latest_posts_block_init() {
	register_block_type( __DIR__ . '/build', array(
		'render_callback' => 'blocks_u_render_lates_posts_block'
	) );
}
add_action( 'init', 'blocks_u_latest_posts_block_init' );
