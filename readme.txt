=== TREB Spreadsheet ===
Contributors:      trebco llc
Tags:              block
Tested up to:      6.3
Stable tag:        0.5.0
License:           GPL-2.0-or-later
License URI:       https://www.gnu.org/licenses/gpl-2.0.html

A block editor for embedding interactive spreadsheets.


== Description ==

TREB is a web spreadsheet component. This plugin adds the spreadsheet component
to the block editor, so you can embed fully-interactive spreadsheets in your 
posts with just a few clicks.

TREB can read and write XLSX files so if you have a spreadsheet you want to 
embed in a post, it's as simple as (1) adding the block and (2) loading the 
file. 

== Installation ==

1. Upload the plugin files to the `/wp-content/plugins/treb-spreadsheet` directory, or install the plugin through the WordPress plugins screen directly.
2. Activate the plugin through the 'Plugins' screen in WordPress


== Frequently Asked Questions ==

= How do I upload a spreadsheet file? =

Just drag-and-drop the XLSX file or select the spreadsheet and click "Import" 
in the sidebar. 

= Does this upload my file to the cloud somewhere? =

No. Everything is served from your Wordpress blog. If you use an XLSX file, 
we convert it to our format and then include it directly in the HTML in a 
script tag.

= What files are supported? =

We support XLSX and CSV files (and our own JSON format). We don't support VBA.


== Screenshots ==

1. A spreadsheet in the block editor


== Changelog ==

= 0.5.0 =
* Preview release

