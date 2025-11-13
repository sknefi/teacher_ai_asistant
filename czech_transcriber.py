#!/usr/bin/env python3
"""
Czech Speech Transcription Tool

This module provides functionality to transcribe Czech speech from MP3 audio files
using OpenAI's Whisper model. It includes audio loading, format conversion, and
accurate speech-to-text transcription optimized for Czech language.

Author: AI Assistant
Date: November 2025
"""

import os
import sys
import logging
from pathlib import Path
from typing import Optional, Union
import warnings

try:
    import whisper
except ImportError:
    print("Error: OpenAI Whisper not installed. Please run: pip install openai-whisper")
    sys.exit(1)

try:
    import librosa
    import soundfile as sf
except ImportError:
    print("Error: librosa not installed. Please run: pip install librosa soundfile")
    sys.exit(1)

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Suppress FP16 warnings from Whisper
warnings.filterwarnings("ignore", message="FP16 is not supported on CPU; using FP32 instead")


class CzechTranscriber:
    """
    A class for transcribing Czech speech from audio files using OpenAI Whisper.
    
    The 'medium' model is recommended for Czech as it provides a good balance
    between accuracy and processing speed. For highest accuracy, use 'large'.
    """
    
    def __init__(self, model_size: str = "medium"):
        """
        Initialize the transcriber with a specified Whisper model.
        
        Args:
            model_size (str): Whisper model size. Options: 'tiny', 'base', 'small', 
                            'medium', 'large'. Default 'medium' is recommended for Czech.
        """
        self.model_size = model_size
        self.model = None
        logger.info(f"Initializing Czech transcriber with {model_size} model")
    
    def _load_model(self) -> None:
        """Load the Whisper model on first use to save memory."""
        if self.model is None:
            logger.info(f"Loading Whisper {self.model_size} model...")
            try:
                self.model = whisper.load_model(self.model_size)
                logger.info("Model loaded successfully")
            except Exception as e:
                logger.error(f"Failed to load model: {e}")
                raise
    
    def load_and_convert_audio(self, file_path: Union[str, Path]) -> str:
        """
        Load an audio file and convert it to the format required by Whisper.
        
        Uses librosa to load audio files and converts them to the optimal format
        for Whisper (16kHz mono WAV).
        
        Args:
            file_path (Union[str, Path]): Path to the input audio file
            
        Returns:
            str: Path to the converted WAV file (temporary file)
            
        Raises:
            FileNotFoundError: If the input file doesn't exist
            Exception: If audio conversion fails
        """
        file_path = Path(file_path)
        
        # Check if file exists
        if not file_path.exists():
            raise FileNotFoundError(f"Audio file not found: {file_path}")
        
        logger.info(f"Loading audio file: {file_path}")
        
        try:
            # Load audio using librosa with 16kHz sample rate (Whisper's preference)
            audio_data, sample_rate = librosa.load(str(file_path), sr=16000, mono=True)
            
            # Create temporary WAV file
            import tempfile
            temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.wav')
            temp_path = temp_file.name
            temp_file.close()
            
            # Save as WAV using soundfile
            sf.write(temp_path, audio_data, 16000)
            logger.info(f"Audio converted and saved to temporary file: {temp_path}")
            
            return temp_path
            
        except Exception as e:
            logger.error(f"Failed to load/convert audio file: {e}")
            raise Exception(f"Audio processing error: {e}")
    
    def transcribe_audio(self, audio_path: str, language: str = "cs") -> str:
        """
        Transcribe audio to text using Whisper.
        
        Args:
            audio_path (str): Path to the audio file (preferably WAV)
            language (str): Language code for transcription. Default "cs" for Czech
            
        Returns:
            str: Transcribed text
            
        Raises:
            Exception: If transcription fails
        """
        self._load_model()
        
        logger.info(f"Starting transcription of: {audio_path}")
        
        try:
            # Transcribe with language specification for better accuracy
            result = self.model.transcribe(
                audio_path,
                language=language,
                verbose=False,
                fp16=False  # Use FP32 for better compatibility
            )
            
            transcribed_text = result["text"].strip()
            logger.info("Transcription completed successfully")
            
            return transcribed_text
            
        except Exception as e:
            logger.error(f"Transcription failed: {e}")
            raise Exception(f"Transcription error: {e}")
    
    def transcribe_file(self, file_path: Union[str, Path]) -> str:
        """
        Complete transcription pipeline: load audio, convert format, and transcribe.
        
        This is the main method that handles the entire process from MP3 file
        to transcribed text with proper error handling and cleanup.
        
        Args:
            file_path (Union[str, Path]): Path to the input audio file
            
        Returns:
            str: Complete transcribed text
            
        Raises:
            FileNotFoundError: If the input file doesn't exist
            Exception: If any step of the transcription process fails
        """
        temp_audio_path = None
        
        try:
            # Step 1: Load and convert audio
            temp_audio_path = self.load_and_convert_audio(file_path)
            
            # Step 2: Transcribe audio
            transcription = self.transcribe_audio(temp_audio_path)
            
            return transcription
            
        except Exception as e:
            logger.error(f"Transcription pipeline failed: {e}")
            raise
        
        finally:
            # Clean up temporary file
            if temp_audio_path and os.path.exists(temp_audio_path):
                try:
                    os.unlink(temp_audio_path)
                    logger.info("Temporary audio file cleaned up")
                except Exception as e:
                    logger.warning(f"Failed to clean up temporary file: {e}")


def transcribe_czech_audio(file_path: Union[str, Path], 
                          model_size: str = "medium") -> str:
    """
    Convenience function to transcribe Czech audio from a file.
    
    This function provides a simple interface for one-off transcriptions
    without needing to manage the CzechTranscriber class.
    
    Args:
        file_path (Union[str, Path]): Path to the audio file
        model_size (str): Whisper model size ('tiny', 'base', 'small', 'medium', 'large')
                         Default 'medium' recommended for Czech
    
    Returns:
        str: Transcribed text
        
    Raises:
        FileNotFoundError: If the audio file doesn't exist
        Exception: If transcription fails
    """
    transcriber = CzechTranscriber(model_size=model_size)
    return transcriber.transcribe_file(file_path)


def main():
    """
    Main function with example usage and command-line interface.
    """
    if len(sys.argv) != 2:
        print("Usage: python czech_transcriber.py <audio_file_path>")
        print("\nExample:")
        print("  python czech_transcriber.py audio.mp3")
        print("  python czech_transcriber.py /path/to/czech_speech.mp3")
        print("\nSupported formats: MP3, WAV, M4A, AAC")
        print("\nModel recommendations for Czech:")
        print("  - 'medium': Best balance of speed and accuracy (recommended)")
        print("  - 'large': Highest accuracy, slower processing")
        print("  - 'small': Faster processing, lower accuracy")
        sys.exit(1)
    
    audio_file = sys.argv[1]
    
    try:
        print(f"Transcribing Czech audio from: {audio_file}")
        print("This may take a few moments depending on file size and model...")
        print("-" * 60)
        
        # Use medium model for good Czech accuracy
        transcription = transcribe_czech_audio(audio_file, model_size="medium")
        
        print("TRANSCRIPTION:")
        print("=" * 60)
        print(transcription)
        print("=" * 60)
        print("\nTranscription completed successfully!")
        
        # Optionally save to file
        output_file = Path(audio_file).with_suffix('.txt')
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write(transcription)
        print(f"Transcription saved to: {output_file}")
        
    except FileNotFoundError:
        print(f"Error: File '{audio_file}' not found.")
        sys.exit(1)
    except Exception as e:
        print(f"Error during transcription: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
