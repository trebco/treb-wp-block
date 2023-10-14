
import React from 'react';
import { type EmbeddedSpreadsheet, type EmbeddedSpreadsheetOptions, TREBGlobal } from '@trebco/treb';

import type { Attributes } from './types';

export interface Props {
  children?: any;
  attributes: Partial<Attributes>;
  setAttributes: (attrs: Partial<Attributes> & { revision_id?: number }) => void;
  setInstance: (sheet?: EmbeddedSpreadsheet) => void;
}

export interface State {
  doc?: Document;
  dirty?: boolean;
  element?: HTMLElement;
  container?: HTMLElement & { instance?: { sheet?: EmbeddedSpreadsheet } };
  subscription?: number;
}

export class Spreadsheet extends React.Component<Props, State> {

  public static TREB?: TREBGlobal;

  public container_ref = React.createRef<HTMLDivElement>();

  public sheet?: EmbeddedSpreadsheet; // <-- why is this not in state? 

  public Rebuild({ doc, element, data }: { doc: Document, element: HTMLElement, data?: string }) {

    const options = this.props.attributes.options || {};

    if (!Spreadsheet.TREB) {
      throw new Error('Rebuild called without global');
    }

    if (this.state?.container) {
      data = JSON.stringify(this.sheet?.SerializeDocument());
    }

    element.textContent = ''; // dump
    const container = element.ownerDocument.createElement('div');

    container.style.width = '100%';
    container.style.height = '100%';
    container.style.overflow = 'hidden';

    this.setState({ container });

    element.append(container);

    const sheet = Spreadsheet.TREB.CreateSpreadsheet({
      container,

      collapsed: !!options.collapsed,
      toolbar: !!options.toolbar,
      resizable: !!options.resizable,
      scale_control: !!options.scale_control,
      constrain_width: !!options.constrain_width,

      font_scale: true,
      chart_menu: true,
      table_button: true,
      freeze_button: true,
      add_tab: true,
      scale: typeof options.scale === 'number' ? options.scale : .95,
      dnd: true,
      toll_initial_load: !!data,

    });

    if (data) {
      sheet.LoadDocument(JSON.parse(data));
    }

    this.sheet = sheet;

    const subscription = sheet.Subscribe(event => {

      switch (event.type) {

        case 'resize':
          if (container) {
            const rect = container.getBoundingClientRect();
            const attrs = {
              height: rect.height,
              width: (this.props.attributes?.options?.constrain_width) ? undefined : rect.width,
            };
            this.props.setAttributes(attrs);
          }
          break;

        case 'selection':
          break;

        case 'load':
        case 'reset':

          // these event might be triggered without focus (focus is in the
          // sidebar). for that reason we need to actually update here,
          // rather than just update the file version. although we should
          // set the file version as well.

          this.props.setAttributes({ 'file-version': (sheet as any).file_version });
          this.Save(true);
          break;

        case 'view-change':
          this.props.setAttributes({ options: { ...(this.props.attributes.options || {}), scale: this.sheet?.scale || 1 } })

        // cascade

        default:

          // we're updating the version attribute, but not the full contents
          // so we don't have to serialize the document on every event. if 
          // dirty is set, serialize the content on focus out.

          this.props.setAttributes({ 'file-version': (sheet as any).file_version });
          this.setState({ dirty: true });

          break;

      }
    });
    this.setState({ subscription });

  }

  public componentDidMount() {

    if (this.container_ref.current) {
      const element = this.container_ref.current;
      const doc = element.ownerDocument;
      this.setState({ doc, element });

      // get the script from the parent window. we're using a dynamic import 
      // here because it's the only way we can call the API using the script 
      // that's already loaded. if we import it statically in this class it'll 
      // be bundled by webpack and bloat up the plugin.

      // note the attribute selector, we're setting that attribute when we 
      // add the script tag (via the php plugin).

      const container_script = document.head.querySelector('script[treb]') as HTMLScriptElement;
      if (container_script) {
        import(/* webpackIgnore: true */ container_script.src).then((mod?: { TREB?: TREBGlobal }) => {
          if (mod?.TREB) {
            Spreadsheet.TREB = mod.TREB;
            this.Rebuild({ doc, element, data: this.props.attributes.json || undefined });
          }
        });

      }

    }
  }

  /**
   * @param prev_props 
   * @param prev_state 
   */
  public componentDidUpdate(prev_props: Readonly<Props>, prev_state: State) {

    // we might need to rebuild if options have changed

    const a = JSON.stringify(this.props.attributes.options || {});
    const b = JSON.stringify(prev_props.attributes.options || {});

    let subscription = this.state.subscription;

    if (subscription && a !== b) {
      this.sheet?.Cancel(subscription);
      if (this.state.doc && this.state.element) {
        this.Rebuild({ doc: this.state.doc, element: this.state.element });
      }
    }
    else {

      if (this.state.container && prev_props.attributes.theme !== this.props.attributes.theme) {

        if (prev_props.attributes.theme) {
          this.state.container.classList.remove(prev_props.attributes.theme);
        }

        if (this.props.attributes.theme) {
          this.state.container.classList.add(this.props.attributes.theme);
        }

        this.sheet?.UpdateTheme();
      }

    }

    this.props.setInstance(this.sheet);

  }

  public Save(force = false) {
    if (this.state.dirty || force) {
      const json = JSON.stringify(this.sheet?.SerializeDocument());
      this.props.setAttributes({ json });
      this.setState({ dirty: false });
    }
  }

  public render() {
    return (
      <div className="spreadsheet-container"
        onBlur={e => this.Save()}
        style={{ height: this.props.attributes?.height || undefined }}
        ref={this.container_ref}
      ></div>
    );
  }

};