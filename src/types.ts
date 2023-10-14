
import type { EmbeddedSpreadsheetOptions } from '@trebco/treb';

export interface Attributes {

  /**
   * unique ID used to store data (in localStorage) to save view changes
   */
  uid: string;

  /**
   * the spreadsheet data, as stringified json
   */
  json: string;

  /**
   * theme
   */
  theme: string;

  /**
   * specific height, if set
   */
  height: number;

  /** 
   * specific width, if set. this can also be constrained to the 
   * column width, using a different option.
   */
  width: number;

  /**
   * spreadsheet options
   */
  options: EmbeddedSpreadsheetOptions;

  /**
   * constrain width to the column size. this is generally useful but
   * I suppose there are cases where you would want to disable it.
   */
  constrain_width: boolean;

  /**  */
  'file-version': number;

  /**
   * version of the library used when saving the block. we store this 
   * so we can prevent the "invalid content" / block recovery flow.
   * this will ensure that the saved block can be recostructed. this might
   * not be the optimal way to handle this.
   */
  'treb-version': string;

}
