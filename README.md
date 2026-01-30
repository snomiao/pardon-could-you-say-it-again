# Pardon, could you say it again?

A lightweight userscript that enhances your video and audio learning experience by providing intuitive keyboard controls for playback speed and position.

[Install from Greasyfork](https://greasyfork.org/en/scripts/503802-pardon-could-you-say-it-again)

## Features

- **Quick Replay**: Press `,` (comma) to jump back 3 seconds and slow down playback to 0.8x speed
- **Speed Up**: Press `.` (period) to increase playback speed to 1.2x
- **Precise Navigation**: Use arrow keys for frame-by-frame control
- **Visual Feedback**: On-screen tooltip shows current time and playback speed
- **Universal Compatibility**: Works on any website with video or audio elements
- **Zero Configuration**: Works out of the box on YouTube, Bilibili, Spotify, and countless other platforms

## Use Cases

- **Language Learning**: Replay difficult phrases at slower speeds to catch every word
- **Music Practice**: Study instrumental parts by replaying sections at reduced tempo
- **Educational Videos**: Review complex concepts at your own pace
- **Podcast Listening**: Control playback without touching the mouse

## Installation

1. Install a userscript manager:
   - [Violentmonkey](https://violentmonkey.github.io/) (Recommended)
   - [Tampermonkey](https://www.tampermonkey.net/)
   - [Greasemonkey](https://www.greasespot.net/)

2. Click here to install: [Pardon, could you say it again?](https://greasyfork.org/en/scripts/503802-pardon-could-you-say-it-again)

3. Confirm installation in your userscript manager

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `,` (Comma) | Jump back 3 seconds and slow down to 0.8x speed |
| `.` (Period) | Speed up playback to 1.2x |
| `←` (Left Arrow) | Jump back 1 second |
| `→` (Right Arrow) | Skip forward 4 seconds |

**Note**: Shortcuts are disabled when typing in text fields to avoid conflicts with normal input.

## Supported Platforms

This script works universally on any website with HTML5 video or audio elements, including but not limited to:

- YouTube
- Bilibili
- Spotify
- Netflix
- Coursera
- Udemy
- Podcasts platforms
- And many more...

## How It Works

The script monitors keyboard events and controls the playback of `<video>` and `<audio>` elements on the page. It:

1. Detects active media elements (currently playing)
2. Adjusts `currentTime` and `playbackRate` properties based on keyboard input
3. Shows a temporary tooltip with current playback information
4. Prevents conflicts with text input fields

## Development

```bash
# Clone the repository
git clone https://github.com/snomiao/pardon-could-you-say-it-again.git

# Edit the userscript
vim pardon-could-you-say-it-again.user.js

# Install locally for testing
# Copy the file content and create a new script in your userscript manager
```

## Contributing

Contributions are welcome! Feel free to:

- Report bugs via [GitHub Issues](https://github.com/snomiao/pardon-could-you-say-it-again/issues)
- Submit pull requests for improvements
- Suggest new features or keyboard shortcuts
- Improve translations

## Translations

This script includes built-in support for 16 languages:

- English, French, German, Spanish
- Chinese (Simplified), Japanese, Korean
- Portuguese, Russian, Italian
- Dutch, Swedish, Arabic
- Hindi, Turkish, Polish

## License

MIT License - feel free to use, modify, and distribute.

## Support

- [GitHub Repository](https://github.com/snomiao/pardon-could-you-say-it-again)
- [Greasyfork Page](https://greasyfork.org/en/scripts/503802-pardon-could-you-say-it-again)
- [Report Issues](https://github.com/snomiao/pardon-could-you-say-it-again/issues)

## Author

[snomiao](https://github.com/snomiao)

---

Made with ♥ for language learners and music enthusiasts worldwide.
