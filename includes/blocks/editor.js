( function ( wp ) {
	const { registerBlockType } = wp.blocks;
	const { SelectControl } = wp.components;
	const { createElement } = wp.element;
	const el = createElement;
	const showcases = ( window.tsreviewBlockData && window.tsreviewBlockData.showcases ) || [];

	registerBlockType( 'ts-review-showcase/showcase', {
		title: 'Review Showcase',
		icon: 'star-filled',
		category: 'widgets',
		description: 'Display a review showcase.',
		attributes: {
			id: {
				type: 'string',
				default: '',
			},
		},
		edit: function ( props ) {
			return el(
				'div',
				{ className: props.className, style: { padding: '12px', border: '1px dashed #c3c4c7', borderRadius: '8px' } },
				el( 'p', { style: { marginTop: 0, fontWeight: 600 } }, 'Review Showcase' ),
				el( SelectControl, {
					label: 'Showcase',
					value: props.attributes.id || '',
					options: [ { label: 'Select a showcase', value: '' } ].concat( showcases ),
					onChange: function ( value ) {
						props.setAttributes( { id: value } );
					},
					help: 'The block renders this showcase on the page.',
				} )
			);
		},
		save: function () {
			return null;
		},
	} );
}( window.wp ) );
