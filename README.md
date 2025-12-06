# SiYuan Image Studio User Guide

## 📖 Introduction

SiYuan Image Studio is a lightweight image editing plugin designed for SiYuan Notes, allowing you to annotate, doodle, crop, and perform other operations on images directly within your notes without external tools.

![preview.png](./preview.png)

## ✨ Main Features

### 🎨 Drawing Tools

- ​**Brush**: Freehand drawing and doodling
- ​**Line**: Draw straight lines
- ​**Arrow**: Add directional arrows
- ​**Rectangle**: Draw rectangular boxes
- ​**Ellipse/Circle**: Draw ellipses or circles
- ​**Mosaic**: Pixelate sensitive areas

### 📝 Annotation Tools

- ​**Text**: Add text labels
- ​**Sequence Marker**: Add numbered circle markers (❶❷❸...)
- ​**Emoji Stamp**: Insert common emoji symbols

### ✂️ Image Operations

- ​**Crop**: Free crop image regions
- ​**Flip**: Horizontal/vertical image flipping
- ​**Insert Image**: Overlay other images on current image

### 🛠️ Auxiliary Functions

- ​**Undo/Redo**: Support multi-step undo and redo
- ​**Zoom/Pan**: Freely zoom and pan canvas to view details
- ​**Color Selection**: Customize brush and annotation colors
- ​**Multi-format Save**: Support PNG, JPG, WebP formats
- ​**Image Compression**: Optional compression to reduce file size
- ​**Copy to Clipboard**: Quickly copy editing results

## 🚀 Quick Start

### Install Plugin

1. Open SiYuan Notes
2. Go to `Settings`​ → `Marketplace`​ → `Plugins`
3. Search for "SiYuan Image Studio"
4. Click `Download` and enable the plugin

### Open Editor

There are two ways to open the image editor:

**Method 1: Context Menu**

1. Right-click any image in your notes
2. Select `Edit` from the popup menu

**Method 2: Keyboard Shortcut**

1. Select an image in your notes (click to highlight it)
2. Press the shortcut `Ctrl+Shift+E`​ (Mac: `⌘⇧E`)

> 💡 ​**Tip**: The shortcut can be customized in plugin settings

## 🎯 Feature Details

### Basic Operations

#### Selection Tool (V)

- Click objects to select and move them
- Hold `Ctrl`​/`⌘` for multi-selection
- Drag object corners to resize
- Press `Delete` or click delete button to remove selected objects

#### Hand Tool (Space)

- Hold `Space` to temporarily switch to pan mode
- Release Space to return to previous tool
- Useful for viewing different areas of large images

#### Canvas Zoom

- ​`+` button: Zoom in
- ​`-` button: Zoom out
- ​`1:1` button: Reset to 100% display
- Mouse wheel: Scroll to zoom (centered on cursor position)

### Drawing Tools

#### Brush (P)

1. Click brush tool or press `P` key
2. Drag mouse on canvas to draw freely
3. Change brush color in color picker

#### Line (L)

1. Click line tool or press `L` key
2. Click start point, drag to end point and release
3. Hold `Shift` to draw horizontal/vertical lines

#### Arrow (A)

1. Click arrow tool or press `A` key
2. Same operation as line
3. Automatically adds arrowhead at end point

#### Rectangle (R)

1. Click rectangle tool or press `R` key
2. Drag mouse to draw rectangle
3. Hold `Shift` to draw square

#### Ellipse/Circle (C)

1. Click ellipse tool or press `C` key
2. Drag mouse to draw ellipse
3. Hold `Shift` to draw perfect circle

#### Mosaic (M)

1. Click mosaic tool or press `M` key
2. Select area to pixelate
3. Release mouse to generate pixelated mosaic effect

> ⚠️ ​**Warning**: Mosaic is irreversible - original image cannot be recovered after saving

### Annotation Tools

#### Text (T)

1. Click text tool or press `T` key
2. Click on canvas to add text
3. Default shows "Double-click to edit", double-click to modify
4. Select text to change color

#### Sequence Marker (K)

1. Click sequence tool or press `K` key
2. Click on canvas to add numbers (auto-increments from 1)
3. Click `1↺` button to reset counter
4. Select markers to drag and reposition

#### Emoji Stamp (😊)

1. Click emoji tool
2. Select emoji from popup panel
3. Click on canvas to add emoji
4. Select to adjust size and position

### Image Operations

#### Crop Image (✂️)

1. Click crop tool
2. Adjust crop box position and size
3. Box shows real-time dimensions (e.g., 800 × 600)
4. Click `⎷ Confirm crop` to apply
5. Click `☓` to cancel cropping

> 💡 ​**Tip**: Canvas auto-adjusts after cropping to fit new image

#### Flip Image

- **Flip Horizontal** (↔️): Mirror left-right
- **Flip Vertical** (↕️): Mirror top-bottom

#### Insert Image (🖼️)

1. Click insert image tool
2. Select image file to overlay
3. Image appears at canvas center
4. Drag and resize to adjust position and size

### Save & Export

#### Quick Save

- Click `💾 Save` button to save in original format
- Automatically updates image in notes after saving

#### Save with Format Selection

1. Click `▼` dropdown arrow next to save button
2. Choose target format:

    - ​**PNG**: Supports transparency, highest quality
    - ​**JPG**: Small size, suitable for photos
    - ​**WebP**: Modern format, balances quality and size

#### Image Compression

- Check `Compress` option in toolbar to enable compression
- Compressed images have smaller file size with nearly lossless visual quality
- Suitable for scenarios requiring reduced document size

#### Copy to Clipboard (📋)

- Click copy button to copy editing result to clipboard
- Can paste directly into other applications

## ⌨️ Keyboard Shortcuts Reference

|Function|Windows/Linux|Mac|
| ------------------| ---------------| ------------|
|Open Editor|​`Ctrl+Shift+E`|​`⌘⇧E`|
|Undo|​`Ctrl+Z`|​`⌘Z`|
|Redo|​`Ctrl+Y`|​`⌘Y`|
|Selection Tool|​`V`|​`V`|
|Hand Tool|​`Space`(hold)|​`Space`(hold)|
|Brush|​`P`|​`P`|
|Line|​`L`|​`L`|
|Arrow|​`A`|​`A`|
|Rectangle|​`R`|​`R`|
|Ellipse|​`C`|​`C`|
|Mosaic|​`M`|​`M`|
|Text|​`T`|​`T`|
|Sequence Marker|​`K`|​`K`|
|Delete Selected|​`Delete/Backspace`|​`Delete/⌫`|
|Cancel Operation|​`Esc`|​`Esc`|

## ⚙️ Plugin Settings

Configure in SiYuan Notes `Settings`​ → `Plugins`​ → `SiYuan Image Studio`:

### Shortcut Key

- Customize the shortcut to open editor
- Default is `Ctrl+Shift+E`

### Backup

- When enabled, original image is backed up to `/temp/assets_backup/` before editing
- Recommended for important images

### Image Compression

- Enabled by default, automatically compresses images when saving
- Can be toggled temporarily in editor toolbar

### VIP Features

- Free users get **3 saves per day**
- Upgrade to VIP to unlock:

  - ✅ Unlimited usage
  - ✅ Advanced AI image editing (coming soon)
  - ✅ Batch image processing (coming soon)

#### How to Upgrade to VIP

1. Click `Buy Now` button in settings
2. Scan QR code with WeChat or Alipay to donate
3. Contact author via one of these methods to get license key:

    - LianDi Community DM: [@wilsons](https://ld246.com/chats/wilsons)
    - QQ email [Click Here](https://mail.qq.com/cgi-bin/qm_share?t=qm_mailme&email=MkVbQVoHAwMHclRdSl9TW14cUV1f)
    - Join QQ group: 283157619 then ask group master for help
4. Enter license key in `VIP Key` field in settings
5. Click `Verify Key` to activate

> ⏰ Author typically responds within 24 hours with license key

## 💡 Usage Tips

### Precise Drawing

- Hold `Shift` while drawing rectangles/ellipses to get squares/circles
- Hold `Shift` while drawing lines/arrows to constrain to horizontal/vertical

### Color Switching

- Select existing objects, then click color picker to batch change colors
- Supports color change for multiple selected objects

### Multi-Select Objects

- Hold `Ctrl`​/`⌘` and click to select multiple objects
- Move or delete multiple objects simultaneously

### View Details

- Use mouse wheel to quickly zoom canvas
- Hold `Space` and drag to view different areas
- Click `1:1` button to quickly restore original size

### Paste Images

- Press `Ctrl+V`​/`⌘V` in editor to paste clipboard images
- Can also drag and drop image files into editor window

## ❓ FAQ

**Q: Why doesn't my image have an "Edit" option in the context menu?**   
A: Only images stored in the notebook's `assets` directory are editable. External linked images are not supported.

**Q: What if saving fails after editing?**   
A: Check if you've exceeded the free quota (3 times per day). Upgrade to VIP for unlimited saves.

**Q: How to restore the original image before editing?**   
A: If "Backup" is enabled in settings, the original image is saved in `/temp/assets_backup/` directory.

**Q: Does the plugin work on mobile devices?**   
A: The plugin is optimized for desktop use. Mobile support may be limited.

**Q: Can I edit animated GIFs?**   
A: Currently only static images are supported. Animated images (GIF, APNG, animated WebP) will show an error message.

**Q: What's the difference between PNG, JPG, and WebP?**   
A:

- ​**PNG**: Best for graphics with transparency, largest file size
- ​**JPG**: Best for photos, smaller file size, no transparency
- ​**WebP**: Modern format with good compression, not supported by older browsers

**Q: Will compression reduce image quality?**   
A: The compression is nearly lossless - file size is reduced by \~30% with no visible quality loss to the human eye.

**Q: Can I undo after saving?**   
A: No, save is permanent. Use the backup feature if you need to preserve originals.

## 🔒 Privacy & Security

- All editing is done locally - no data is sent to external servers
- VIP key verification uses local encryption algorithms
- Backup files are stored only in your local SiYuan workspace

## 🐛 Troubleshooting

**Issue: Editor window is blank or not loading**

- Check your internet connection (required for loading libraries)
- Try disabling other plugins that might conflict
- Restart SiYuan Notes

**Issue: Shortcut key not working**

- Check if another plugin is using the same shortcut
- Try changing the shortcut in settings
- Ensure the image is selected before pressing the shortcut

**Issue: Saved image not updating in notes**

- Refresh the page or restart SiYuan
- Check if the image format changed (extension mismatch)
- Verify file permissions in the assets folder

## 📞 Support & Feedback

If you encounter issues or have suggestions:

- ​**GitHub Issues**​: [Report a bug](https://github.com/wish5115/siyuan-image-studio/issues)
- ​**LianDi Community**​: [@wilsons](https://ld246.com/chats/wilsons)
- ​**QQ Group**: 283157619

## 📄 License

This plugin is licensed under the GNU Affero General Public License v3.0 (AGPL-3.0).

---

**Enjoy editing!**  🎨✨
