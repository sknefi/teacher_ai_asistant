# Czech Speech Transcription Tool

A Python tool for accurately transcribing Czech speech from MP3 audio files using OpenAI's Whisper model. This project is optimized for Czech language transcription with modular design, comprehensive error handling, and easy setup.

## Features

- **High Accuracy**: Uses OpenAI Whisper models optimized for Czech language
- **Format Support**: Handles MP3, WAV, M4A, AAC audio formats
- **Modular Design**: Clean separation of audio loading, conversion, and transcription
- **Error Handling**: Graceful handling of missing files and invalid formats
- **Easy to Use**: Simple command-line interface and programmatic API
- **Automatic Cleanup**: Temporary files are automatically removed
- **Model Options**: Choose between different Whisper models based on accuracy/speed needs

## Requirements

- Python 3.8 or higher
- FFmpeg (for audio format conversion)
- At least 2GB of free disk space (for model downloads)
- 4GB+ RAM recommended for medium/large models

## Installation

### 1. Clone or Download

```bash
git clone <repository-url>
cd hack
```

### 2. Create Virtual Environment (Recommended)

```bash
python -m venv .venv
source .venv/bin/activate  # On macOS/Linux
# or
.venv\Scripts\activate     # On Windows
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Install FFmpeg

**macOS (using Homebrew):**
```bash
brew install ffmpeg
```

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install ffmpeg
```

**Windows:**
- Download from [FFmpeg website](https://ffmpeg.org/download.html)
- Add to PATH environment variable

## Usage

### Command Line Interface

**Basic Usage:**
```bash
python czech_transcriber.py audio.mp3
```

**Full Example:**
```bash
python czech_transcriber.py /path/to/czech_speech.mp3
```

The transcription will be displayed in the terminal and saved to a `.txt` file with the same name as the input file.

### Programmatic Usage

```python
from czech_transcriber import transcribe_czech_audio, CzechTranscriber

# Simple one-line transcription
transcription = transcribe_czech_audio("audio.mp3")
print(transcription)

# Using the class for multiple files or custom settings
transcriber = CzechTranscriber(model_size="large")
text = transcriber.transcribe_file("czech_speech.mp3")
print(text)
```

### Advanced Usage

```python
from czech_transcriber import CzechTranscriber

# Initialize with specific model
transcriber = CzechTranscriber(model_size="large")

# Process multiple files
audio_files = ["file1.mp3", "file2.mp3", "file3.mp3"]
for file_path in audio_files:
    try:
        transcription = transcriber.transcribe_file(file_path)
        print(f"File: {file_path}")
        print(f"Transcription: {transcription}\n")
    except Exception as e:
        print(f"Error processing {file_path}: {e}")
```

## Model Selection

Choose the appropriate Whisper model based on your needs:

| Model  | Size | Speed | Accuracy | Recommended For |
|--------|------|-------|----------|----------------|
| `tiny` | ~39 MB | Fastest | Lowest | Quick testing |
| `base` | ~74 MB | Fast | Good | Real-time apps |
| `small` | ~244 MB | Medium | Better | General use |
| `medium` | ~769 MB | Slower | **Best for Czech** | **Recommended** |
| `large` | ~1550 MB | Slowest | Highest | Maximum accuracy |

**For Czech language, we recommend the `medium` model** as it provides the best balance between accuracy and processing speed.

## File Format Support

| Format | Extension | Notes |
|--------|-----------|-------|
| MP3 | `.mp3` | Primary target format |
| WAV | `.wav` | Highest quality, larger files |
| M4A | `.m4a` | Apple audio format |
| AAC | `.aac` | Advanced Audio Coding |

The tool automatically converts all formats to the optimal format for Whisper (16kHz mono WAV).

## Error Handling

The tool handles various error scenarios gracefully:

- **File not found**: Clear error message with file path
- **Unsupported format**: Attempts generic file loading
- **Corrupted audio**: Audio processing error details
- **Memory issues**: Model loading failure information
- **Network issues**: Model download problems

## Project Structure

```
hack/
├── czech_transcriber.py    # Main transcription script
├── requirements.txt        # Python dependencies
├── README.md              # This documentation
└── .venv/                 # Virtual environment (after setup)
```

## Function Documentation

### `CzechTranscriber` Class

Main class for handling Czech speech transcription.

#### Methods:

- `__init__(model_size="medium")` - Initialize with specified model
- `load_and_convert_audio(file_path)` - Load and convert audio to Whisper format
- `transcribe_audio(audio_path, language="cs")` - Transcribe converted audio
- `transcribe_file(file_path)` - Complete pipeline from file to text

### `transcribe_czech_audio(file_path, model_size="medium")`

Convenience function for one-off transcriptions.

**Parameters:**
- `file_path`: Path to audio file
- `model_size`: Whisper model size (default: "medium")

**Returns:** Transcribed text as string

## Performance Tips

1. **Model Choice**: Use `medium` for best Czech accuracy/speed balance
2. **File Size**: Smaller audio files process faster
3. **Format**: WAV files avoid conversion overhead
4. **Memory**: Close other applications when using large models
5. **Disk Space**: Ensure sufficient space for model downloads

## Troubleshooting

### Common Issues

**Import Error: whisper not found**
```bash
pip install openai-whisper
```

**Import Error: pydub not found**
```bash
pip install pydub
```

**FFmpeg not found**
- Install FFmpeg using your system package manager
- Ensure FFmpeg is in your PATH

**Out of Memory**
- Use a smaller model (`small` or `base`)
- Close other applications
- Process shorter audio segments

**Slow Processing**
- Use smaller model for faster results
- Consider upgrading hardware
- Process files in smaller chunks

### Getting Help

1. Check the error messages for specific guidance
2. Verify all dependencies are installed correctly
3. Test with a small, known-good audio file
4. Check FFmpeg installation with `ffmpeg -version`

## Example Output

```
$ python czech_transcriber.py test_audio.mp3
Transcribing Czech audio from: test_audio.mp3
This may take a few moments depending on file size and model...
------------------------------------------------------------
TRANSCRIPTION:
============================================================
Dobrý den, jak se máte? Jsem rád, že se s vámi mohu setkat.
Dnes budeme mluvit o novém projektu, který nás čeká.
============================================================

Transcription completed successfully!
Transcription saved to: test_audio.txt
```

## License

This project is open source. Please ensure you comply with OpenAI's usage policies when using Whisper models.

## Contributing

Feel free to submit issues, feature requests, or pull requests to improve the tool.

---

**Note**: On first run, Whisper will download the selected model (this happens only once per model). Internet connection is required for the initial model download.
