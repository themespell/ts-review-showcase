( function ( wp ) {
	const { registerBlockType } = wp.blocks;
	const { SelectControl, Placeholder } = wp.components;
	const { createElement } = wp.element;
	const { useBlockProps } = wp.blockEditor;
	const { __ } = wp.i18n;
	const el = createElement;
	const showcases = ( window.tsreviewBlockData && window.tsreviewBlockData.showcases ) || [];

	registerBlockType( 'ts-review-showcase/showcase', {
		apiVersion: 3,
		title: __( 'Review Showcase', 'ts-review-showcase' ),
		icon: 'star-filled',
		category: 'widgets',
		description: __( 'Display a review showcase.', 'ts-review-showcase' ),
		attributes: {
			id: {
				type: 'string',
				default: '',
			},
		},
		edit: function ( props ) {
			const blockProps = useBlockProps();

			return el(
				'div',
				blockProps,
				el(
					Placeholder,
					{
						icon: 'star-filled',
						label: __( 'Review Showcase', 'ts-review-showcase' ),
						instructions: showcases.length
							? __( 'The block renders this showcase on the page.', 'ts-review-showcase' )
							: __( 'Create a showcase under TS Review > Review Showcase first.', 'ts-review-showcase' ),
					},
					el( SelectControl, {
						label: __( 'Showcase', 'ts-review-showcase' ),
						value: props.attributes.id || '',
						options: [ { label: __( 'Select a showcase', 'ts-review-showcase' ), value: '' } ].concat( showcases ),
						onChange: function ( value ) {
							props.setAttributes( { id: value } );
						},
						__nextHasNoMarginBottom: true,
					} )
				)
			);
		},
		save: function () {
			return null;
		},
	} );
}( window.wp ) );
