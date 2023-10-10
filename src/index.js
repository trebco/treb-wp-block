/**
 * Registers a new block provided a unique name and an object defining its behavior.
 *
 * @see https://developer.wordpress.org/block-editor/developers/block-api/#registering-a-block
 */
import { registerBlockType } from '@wordpress/blocks';

import { __ } from '@wordpress/i18n';

/**
 * Lets webpack process CSS, SASS or SCSS files referenced in JavaScript files.
 * All files containing `style` keyword are bundled together. The code used
 * gets applied both to the front of your site and to the editor. All other files
 * get applied to the editor only.
 *
 * @see https://www.npmjs.com/package/@wordpress/scripts#using-css
 */
import './style.scss';
import './editor.scss';

/**
 * Internal dependencies
 */
import Edit from './edit';
import save from './save';
import metadata from './block.json';

/**
 * Every block starts by registering a new block type definition.
 *
 * @see https://developer.wordpress.org/block-editor/developers/block-api/#registering-a-block
 */
registerBlockType( metadata.name, {

  icon: (
    <svg vxmlns="http://www.w3.org/2000/svg" viewBox="0.673 4.629 153.073 133.742">
      <linearGradient id="SVGID_1_" gradientUnits="userSpaceOnUse" x1="0.6729" y1="71.5" x2="153.7461" y2="71.5">
        <stop  offset="0" style={{'stop-color': '#5CB5FF'}}/>
        <stop  offset="1" style={{'stop-color': '#0059B9'}}/>
      </linearGradient>
      <path fill="url(#SVGID_1_)" d="M91.656,28.313c-4.989,0-17.266,6.249-21.305,8.504c-2.344-2.473-2.603-6.162-3.036-10.933
      c-2.344,2.429-0.824,9.806,0,12.496c-10.238,7.635-18.83,15.531-27.597,24.471c-2.992-4.729-5.031-8.593-5.726-17.183
      c-3.038,6.509,0.867,15.057,3.121,19.784c-9.674,12.193-19.263,25.297-27.03,37.834C-25.405,28.313,82.936-16.248,153.746,14.431
      C109.879,43.63,98.554,135.784,21.498,111.274c-5.423,7.809-9.069,18.006-13.538,27.072c-3.73,0.263-6.334-1.646-7.288-3.12
      c7.506-18.181,17.183-34.192,27.075-49.984c10.718,0.306,21.346,0.478,30.198-1.04c-7.681-2.038-16.877-0.78-26.032-3.123
      c5.597-10.718,13.754-18.876,21.867-27.075c8.808,0.782,17.746,3.21,27.074,1.041c-8.111-1.431-15.966-1.952-22.909-4.165
      C65.539,42.502,80.722,33.389,91.656,28.313z"/>
    </svg>
  ),

	/**
	 * Used to construct a preview for the block to be shown in the block inserter.
	 */
	example: {
		attributes: {
			message: 'TREB Spreadsheet',
		},
	},
	/**
	 * @see ./edit.js
	 */
	edit: Edit,

	/**
	 * @see ./save.js
	 */
	save,
} );
