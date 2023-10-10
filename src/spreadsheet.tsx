
import React from 'react';
import { TREB, type EmbeddedSpreadsheet, type EmbeddedSpreadsheetOptions, TREBGlobal } from '@trebco/treb';
import type { Attributes } from './types';

export interface Props {
  children?: any;
  attributes: Partial<Attributes>;
  setAttributes: (attrs: Partial<Attributes> & { revision_id?: number }) => void;
  setInstance: (sheet?: EmbeddedSpreadsheet) => void;
  onResize: () => void;
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

    let container = this.state?.container;

    // who takes priority if we pass in data but we also have a
    // container? not sure...

    if (container) {
      data = JSON.stringify(this.sheet?.SerializeDocument());
      element.removeChild(container);
    }

    const options = (this.props.attributes.options || {}) as EmbeddedSpreadsheetOptions;

    container = doc.createElement('treb-spreadsheet');
    if (this.props.attributes.theme) {
      container.classList.add(this.props.attributes.theme);
    }

    // container.setAttribute('style', 'width: 100%; height: 100%; overflow: hidden;');

    /*
    container.setAttribute('collapsed', options.collapsed ? 'true' : 'false');
    container.setAttribute('toolbar', options.toolbar ? 'true' : 'false');
    container.setAttribute('resizable', options.resizable ? 'true' : 'false');
    container.setAttribute('scale_control', options.scale_control ? 'true' : 'false');
    */

    let width = '100%';
    if (!this.props.attributes.constrain_width && this.props.attributes.width) {
      width = this.props.attributes.width + 'px';
    }

    const attributes: EmbeddedSpreadsheetOptions & { style?: string } = {

      style: `width: ${width}; height: 100%; overflow: hidden;`,

      collapsed: !!options.collapsed,
      toolbar: !!options.toolbar,
      resizable: !!options.resizable,
      scale_control: !!options.scale_control,

      font_scale: true,
      chart_menu: true,
      table_button: true,
      freeze_button: true,
      add_tab: true,
      scale: .95,
      dnd: true,

    };

    for (const [key, value] of Object.entries(attributes)) {
      container.setAttribute(key, value.toString());
    }

    if (data) {

      const script = doc.createElement('script');
      script.setAttribute('type', 'application/json');
      script.textContent = data;
      container.appendChild(script);
      container.setAttribute('inline-document', 'true');
    }

    element.appendChild(container);      

    this.setState({ container });
    this.sheet = undefined;

    let counter = 20;
    let interval = window.setInterval(() => {
      if (container?.instance || counter-- <= 0) {
        window.clearInterval(interval);
        if (container?.instance) {
          this.sheet = container.instance.sheet;
          this.props.setInstance(this.sheet);

          if (this.sheet) {
            const sheet = this.sheet;
            const subscription = sheet.Subscribe(event => {
              switch (event.type) {
                case 'resize':
                  if (container) {
                    const rect = container.getBoundingClientRect();
                    if (rect) {
                      if (this.props.attributes.constrain_width) {
                        container.style.width = '100%';
                        this.props.setAttributes({ height: rect.height });
                      }
                      else {
                        this.props.setAttributes({ width: rect.width, height: rect.height });
                      }
                    }
                  }
                  break;

                case 'selection':
                  break;

                default:

                  // we're updating a fake attribute that's not preserved. we'll
                  // use the focus event to actually update, so we don't have to
                  // serialize the document on every event.

                  this.props.setAttributes({ revision_id: (sheet as any).file_version });
                  this.setState({dirty: true});

                  break;

                /*
                case 'load':
                case 'document-change':
                  {
                    const json = JSON.stringify(this.sheet?.SerializeDocument());
                    this.props.setAttributes({...(this.props.attributes), json});
                  }
                  break;
                */
              }
            });
            this.setState({subscription});
          }

        }
      }
    }, 20);

  }

  public componentDidMount() {
    
    // console.info(" ** mount ** ");

    if (this.container_ref.current) {

      const element = this.container_ref.current;
      const doc = element.ownerDocument;

      const script = doc.createElement('script');
      script.setAttribute('type', 'module');
      script.setAttribute('src', 'https://unpkg.com/@trebco/treb@' + TREB.version);
      element.appendChild(script); // could use doc.head

      this.setState({doc, element});
      this.Rebuild({doc, element, data: this.props.attributes.json || undefined});

    }
  }

  public componentDidUpdate(prev_props: Readonly<Props>, prev_state: State) {

    // we might need to rebuild if options have changed

    const a = JSON.stringify(this.props.attributes.options || {});
    const b = JSON.stringify(prev_props.attributes.options || {});

    // console.info(` -- update (${a !== b})`);

    let subscription = this.state.subscription;

    if (subscription && a !== b) {
      this.sheet?.Cancel(subscription);
      if (this.state.doc && this.state.element) {
        this.Rebuild({doc: this.state.doc, element: this.state.element});
      }
    }
    else {
      
      // for this attribute we only have to be concerned with the state change
      // from unconstrained to constrained.

      if (this.state.container && !prev_props.attributes.constrain_width && this.props.attributes.constrain_width) {
        this.state.container.style.width = '100%';
      }

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

  public Blur() {
    if (this.state.dirty) {
      const json = JSON.stringify(this.sheet?.SerializeDocument());
      this.props.setAttributes({json});
      this.setState({dirty: false});
    }
  }

  public render() {
    return (
      <div className="spreadsheet-container" 
           style={{ height: this.props.attributes?.height || undefined }} 
           ref={this.container_ref} 
           onBlur={e => this.Blur()}></div>
    );
  }

};