/**
 * WordPress components that create the necessary UI elements for the block
 *
 * @see https://developer.wordpress.org/block-editor/packages/packages-components/
 */
import { Button, ToggleControl, SelectControl  } from '@wordpress/components';
import { Spreadsheet } from './spreadsheet';
import { PanelBody, PanelRow } from '@wordpress/components';

//
// typescript wizardry
// https://stackoverflow.com/questions/46583883/typescript-pick-properties-with-a-defined-type
//
type PickByType<T, Value> = {
  [P in keyof T as T[P] extends Value | undefined ? P : never]: T[P]
}

// temp
const __ = (text: string, context: string) => text;

/**
 * we can't use crypto.randomUUID because this might run in an 
 * insecure context. maybe we could try it first? these numbers 
 * only need to be unique in the context of the particular domain.
 */
const UID = () => {
  let hash = 0;
  const data = new Date().toString() + Math.random().toString();
    for (let i = 0, len = data.length; i < len; i++) {
      hash = (hash << 5) - hash + data.charCodeAt(i);
      hash |= 0; 
  }
  return Math.abs(hash).toString(16);
}

/**
 * React hook that is used to mark the block wrapper element.
 * It provides all the necessary props like the class name.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/packages/packages-block-editor/#useblockprops
 */
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import { TREB, type EmbeddedSpreadsheet, type EmbeddedSpreadsheetOptions } from '@trebco/treb';
import type { Attributes } from './types';

/**
 * The edit function describes the structure of your block in the context of the
 * editor. This represents what the editor will render when the block is used.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/block-api/block-edit-save/#edit
 *
 * @param {Object}   props               Properties passed to the function.
 * @param {Object}   props.attributes    Available block attributes.
 * @param {Function} props.setAttributes Function that updates individual attributes.
 *
 * @return {Element} Element to render.
 */
export default function Edit({
      attributes, 
      setAttributes,
    }: { 
      attributes: Partial<Attributes>, 
      setAttributes: (attrs: Partial<Attributes>) => void,
  }) {

	const blockProps = useBlockProps();

  let uid = attributes.uid || '';
  let options: EmbeddedSpreadsheetOptions = {...(attributes.options || {})}; // copy
  let theme = attributes.theme || '';

  if (!uid) {
    uid = UID();
    setAttributes({uid});
  }

  if (!attributes['treb-version']) {
    setAttributes({'treb-version': TREB.version});
  }

  let sheet: EmbeddedSpreadsheet|undefined;

  const setInstance = (instance?: EmbeddedSpreadsheet) => {
    sheet = instance;
  };
  
  const ImportFile = (event: React.MouseEvent) => {
    sheet?.LoadLocalFile();
  };

  const ResetDocument = (event: React.MouseEvent) => {
    sheet?.Reset();
  };

  //
  // toggle boolean option
  //
  const ToggleOption = <K extends keyof PickByType<EmbeddedSpreadsheetOptions, boolean>>(option: K) => {
    options[option] = !options[option];
    setAttributes({options: {...options}});
  };

  // 
  // set explicitly
  //
  const SetOption = <K extends keyof EmbeddedSpreadsheetOptions>(option: K, value: EmbeddedSpreadsheetOptions[K]) => {
    options[option] = value;
    setAttributes({options: {...options}});
  };


	return (
		<div { ...blockProps }>

      <InspectorControls>
        <div id='treb-options'>

            <PanelBody title="Document" initialOpen={ true }>
              <PanelRow>
                <Button 
                  onClick={ImportFile}>Import XLSX or JSON file</Button>
              </PanelRow>
              <PanelRow>
                <Button 
                  onClick={ResetDocument}>Reset document (clear)</Button>
              </PanelRow>
            </PanelBody>

            <PanelBody title="Options" initialOpen={ true }>
              
              <PanelRow>
                <ToggleControl
                  label="Collapsed"
                  help={ options.collapsed ? 'Start with the sidebar closed' : 'Start with the sidebar open' }
                  checked={!!options.collapsed}
                  onChange={() => ToggleOption('collapsed')}
                  />
              </PanelRow>
              
              <PanelRow>
                <ToggleControl
                  label="Toolbar"
                  help={ options.toolbar ? 'Include the toolbar (it starts hidden)' : 'No toolbar' }
                  checked={!!options.toolbar}
                  onChange={() => SetOption('toolbar', !options.toolbar)}
                  />
              </PanelRow>

              <PanelRow>
                <ToggleControl
                  label="Scale control"
                  help={ options.scale_control ? 'Users can change spreadsheet scale' : 'The scale slider is hidden' }
                  checked={!!options.scale_control}
                  onChange={() => ToggleOption('scale_control')}
                  />
              </PanelRow>

              <PanelRow>
                <ToggleControl
                  label="Resizable"
                  help={ options.resizable ? 'Spreadsheet is resizable' : 'Spreadsheet has a fixed size' }
                  checked={!!options.resizable}
                  onChange={() => ToggleOption('resizable')}
                  />
              </PanelRow>
              <PanelRow>
                <ToggleControl 
                  help={ options.constrain_width ? 'Resize height but use column width' : 'Allow resizing to change width'}
                  label="Constrain width"
                  checked={!!options.constrain_width}
                  disabled={!options.resizable} 
                  onChange={() => ToggleOption('constrain_width')}
                  />
              </PanelRow>

              <PanelRow>
                <SelectControl
                    label="Theme"
                    value={theme}
                    options={ [
                        { label: 'Automatic dark/light', value: 'treb-light-dark-theme' },
                        { label: 'Dark', value: 'treb-dark-theme' },
                        { label: 'Light', value: '' },
                    ] }
                    onChange={(value) => setAttributes({theme: value})}
                />
              </PanelRow>

            </PanelBody>


        </div>
      </InspectorControls>
      <Spreadsheet {...{attributes, setAttributes, setInstance}}></Spreadsheet>        
		</div>
	);
}
