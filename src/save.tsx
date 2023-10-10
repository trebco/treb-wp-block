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
import { TREB } from '@trebco/treb';

type CustomElement<T> = Partial<T & DOMAttributes<T> & { children: any }>;

declare global {
  namespace JSX {
    interface IntrinsicElements {
      ['treb-spreadsheet']: CustomElement<HTMLElement & { instance: { sheet: EmbeddedSpreadsheet }}>;
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

  // typing this temporarily just for convenience
  const options: Partial<Record<keyof EmbeddedSpreadsheetOptions, string>> = {

    local_storage: `${uid}-document`,
    persist_scale: `${uid}-scale`,
    font_scale: 'true',
    chart_menu: 'true',
    table_button: 'true',
    freeze_button: 'true',

  };

  for (const [key, value] of Object.entries(attributes.options || {})) {
    (options as Record<string, string>)[key] = (value as any).toString();
  }

  const style_block: Record<string, string> = {};
  if (attributes.height) {
    style_block.height = attributes.height + 'px';
  }
  if (attributes.width && !attributes.constrain_width) {
    style_block.width = attributes.width + 'px';
  }

	return (
    <div { ...blockProps }>
      <span></span>
      <script type="module" src={`https://unpkg.com/@trebco/treb@${TREB.version}`}></script>
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
