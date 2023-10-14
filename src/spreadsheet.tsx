
import React from 'react';
import { TREB, type EmbeddedSpreadsheet, type EmbeddedSpreadsheetOptions, TREBGlobal } from '@trebco/treb';

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
  container?: HTMLElement & { instance?: { sheet?: EmbeddedSpreadsheet }};
  subscription?: number;
}

export class Spreadsheet extends React.Component<Props, State> {

  public container_ref = React.createRef<HTMLDivElement>();

  public sheet?: EmbeddedSpreadsheet; // <-- why is this not in state? 

  public Rebuild({ doc, element, data }: { doc: Document, element: HTMLElement, data?: string }) {

    const options = this.props.attributes.options || {};

    if (this.state?.container) {
      data = JSON.stringify(this.sheet?.SerializeDocument());
    }

    element.textContent = ''; // dump
    const container = element.ownerDocument.createElement('div');

    container.style.width = '100%';
    container.style.height = '100%';
    container.style.overflow = 'hidden';

    this.setState({container});

    element.append(container);

    const sheet = TREB.CreateSpreadsheet({
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
            this.props.setAttributes({ 
              width: rect.width, 
              height: rect.height,
            });
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
          this.props.setAttributes({ options: {...(this.props.attributes.options || {}), scale: this.sheet?.scale || 1 } })

          // cascade

        default:

          // we're updating a fake attribute that's not preserved. we'll
          // use the focus event to actually update, so we don't have to
          // serialize the document on every event.

          // we're now preserving this value.

          this.props.setAttributes({ 'file-version': (sheet as any).file_version });
          this.setState({dirty: true});

          break;

      }
    });
    this.setState({subscription});

  }

  public componentDidMount() {
    if (this.container_ref.current) {
      const element = this.container_ref.current;
      const doc = element.ownerDocument;
      this.setState({doc, element});
      this.Rebuild({doc, element, data: this.props.attributes.json || undefined});
    }
  }

  public componentDidUpdate(prev_props: Readonly<Props>, prev_state: State) {

    // we might need to rebuild if options have changed

    const a = JSON.stringify(this.props.attributes.options || {});
    const b = JSON.stringify(prev_props.attributes.options || {});

    let subscription = this.state.subscription;

    if (subscription && a !== b) {
      this.sheet?.Cancel(subscription);
      if (this.state.doc && this.state.element) {
        this.Rebuild({doc: this.state.doc, element: this.state.element});
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

    // why is this not called from Rebuild? (FIXME)

    this.props.setInstance(this.sheet);

  }

  public Save(force = false) {
    if (this.state.dirty || force) {
      const json = JSON.stringify(this.sheet?.SerializeDocument());
      this.props.setAttributes({json});
      this.setState({dirty: false});
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