// eslint-disable-next-line no-unused-vars
import { __ } from '@wordpress/i18n';
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import { useSelect } from '@wordpress/data';
import { RawHTML } from '@wordpress/element';
import { PanelBody, ToggleControl, QueryControls } from '@wordpress/components';
// eslint-disable-next-line @wordpress/no-unsafe-wp-apis
import { format, dateI18n, getSettings } from '@wordpress/date';
import './editor.scss';

export default function Edit( { attributes, setAttributes } ) {
	const { numberOfPosts, displayFeaturedImage, order, orderBy, categories } =
		attributes;
	const catIDs =
		categories && categories.length > 0
			? categories.map( ( cat ) => cat.id )
			: [];
	const posts = useSelect(
		( select ) => {
			return select( 'core' ).getEntityRecords( 'postType', 'post', {
				per_page: numberOfPosts,
				_embed: true,
				order,
				orderby: orderBy,
				categories: catIDs,
			} );
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[ numberOfPosts, order, orderBy, categories ]
	);

	const allCats = useSelect( ( select ) => {
		return select( 'core' ).getEntityRecords( 'taxonomy', 'category', {
			per_page: -1,
		} );
	}, [] );

	const catSuggestions = {};
	if ( allCats ) {
		for ( let i = 0; i < allCats.length; i++ ) {
			const cat = allCats[ i ];
			catSuggestions[ cat.name ] = cat;
		}
	}

	const onDisplayFeaturedImageChange = ( value ) => {
		setAttributes( {
			displayFeaturedImage: value,
		} );
	};
	const onNumberChange = ( value ) => {
		setAttributes( {
			numberOfPosts: value,
		} );
	};

	const onCategoryChange = ( values ) => {
		const hasNoSuggestions = values.some(
			( value ) => typeof value === 'string' && ! catSuggestions[ value ]
		);
		if ( hasNoSuggestions ) return;

		const updatedCats = values.map( ( token ) => {
			return typeof token === 'string' ? catSuggestions[ token ] : token;
		} );

		setAttributes( { categories: updatedCats } );
	};
	return (
		<>
			<InspectorControls>
				<PanelBody>
					<ToggleControl
						label={ __( 'Display Featured Image', 'latest-posts' ) }
						checked={ displayFeaturedImage }
						onChange={ onDisplayFeaturedImageChange }
					/>
					<QueryControls
						numberOfItems={ numberOfPosts }
						onNumberOfItemsChange={ onNumberChange }
						minItems={ 1 }
						maxItems={ 10 }
						orderBy={ orderBy }
						onOrderByChange={ ( val ) =>
							setAttributes( { orderBy: val } )
						}
						order={ order }
						onOrderChange={ ( val ) =>
							setAttributes( { order: val } )
						}
						categorySuggestions={ catSuggestions }
						selectedCategories={ categories }
						onCategoryChange={ onCategoryChange }
					/>
				</PanelBody>
			</InspectorControls>
			<ul { ...useBlockProps() }>
				{ posts &&
					posts.map( ( post ) => {
						const featuredImage =
							post._embedded[ 'wp:featuredmedia' ]?.length > 0 &&
							post._embedded[ 'wp:featuredmedia' ][ 0 ];
						return (
							<li key={ post.id }>
								{ displayFeaturedImage && featuredImage && (
									<img
										src={
											featuredImage.media_details.sizes
												.large.source_url
										}
										alt={ featuredImage.alt_text }
									/>
								) }
								<h5>
									<a href={ post.link }>
										{ post.title.rendered ? (
											<RawHTML>
												{ post.title.rendered }
											</RawHTML>
										) : (
											__( 'No Title', 'latest-posts' )
										) }
									</a>
								</h5>
								{ post.date_gmt && (
									<time
										dateTime={ format(
											'c',
											post.date_gmt
										) }
									>
										{ dateI18n(
											getSettings().formats.date,
											post.date_gmt
										) }
									</time>
								) }
								{ post.excerpt.rendered && (
									<RawHTML>{ post.excerpt.rendered }</RawHTML>
								) }
							</li>
						);
					} ) }
			</ul>
		</>
	);
}
