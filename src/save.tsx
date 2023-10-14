/**
 * React hook that is used to mark the block wrapper element.
 * It provides all the necessary props like the class name.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/packages/packages-block-editor/#useblockprops
 */
import { useBlockProps } from '@wordpress/block-editor';

import type {  DOMAttributes }  from 'react';
import type { EmbeddedSpreadsheet, EmbeddedSpreadsheetOptions } from '@trebco/treb';
import type { Attributes } from './types';

// for versioning -- could be passed in as attribute
import { TREB } from '@trebco/treb';

declare global {
  namespace React.JSX {
    interface IntrinsicElements {
      ['treb-spreadsheet']: Omit<Partial<HTMLElement>, 'children'|'style'> & { children?: any; style?: Partial<CSSStyleDeclaration> };
    }
  }
}

/**
 * The save function defines the way in which the different attributes should
 * be combined into the final markup, which is then serialized by the block
 * editor into `post_content`.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/block-api/block-edit-save/#save
 *
 * @param {Object} props            Properties passed to the function.
 * @param {Object} props.attributes Available block attributes.
 * @return {Element} Element to render.
 */
export default function save({ attributes }: { attributes: Attributes }) {

	const blockProps = useBlockProps.save();

  const uid = attributes.uid;

  //
  // typing this temporarily just for convenience
  // wait -- do we support snake case for attribute options? 
  //
  // A: I guess we do, although we shouldn't necessarily rely on that?
  //
  const options: Partial<Record<keyof EmbeddedSpreadsheetOptions, string>> = {

    local_storage: `${uid}:${attributes['file-version'] || 0}-document`,
    persist_scale: `${uid}-scale`,
    font_scale: 'true',
    chart_menu: 'true',
    table_button: 'true',
    freeze_button: 'true',
    revert_button: 'true',
    revert_indicator: 'true',

  };

  for (const [key, value] of Object.entries(attributes.options || {})) {
    (options as Record<string, string>)[key] = (value as any).toString();
  }

  //
  // we set display to block in the style tag to prevent jittery loading 
  //
  const style_block: Partial<CSSStyleDeclaration> = {
    display: 'block',
    height: attributes.height ? attributes.height + 'px' : undefined,
    width: (attributes.width && !attributes.constrain_width) ? attributes.width + 'px' : undefined,
  };

  const version = attributes['treb-version'] || TREB.version;

	return (
    <div { ...blockProps }>
      <span></span>
      <treb-spreadsheet {...(options as Record<string, string>)}
          style={style_block}
          inline-document="true">
        <script type="application/json">
          {attributes.json || ''}
        </script>
      </treb-spreadsheet>
    </div>
  );

}
