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
import math
import tempfile
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
    
    def __init__(self, model_size: str = "small"):
        """
        Initialize the transcriber with a specified Whisper model.
        
        Args:
            model_size (str): Whisper model size. Options: 'tiny', 'base', 'small', 
                            'medium', 'large'. Default 'small' for balanced speed/accuracy.
                            
        Speed/Quality Guide:
        - 'tiny': ~39MB, fastest, lowest accuracy (good for quick overview)
        - 'base': ~142MB, fast, good for clear audio
        - 'small': ~244MB, balanced speed/accuracy (recommended)
        - 'medium': ~769MB, slower, better accuracy
        - 'large': ~1550MB, slowest, highest accuracy
        """
        self.model_size = model_size
        self.model = None
        
        # Validate model size
        valid_sizes = ['tiny', 'base', 'small', 'medium', 'large']
        if model_size not in valid_sizes:
            raise ValueError(f"Invalid model size '{model_size}'. Choose from: {valid_sizes}")
            
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
    
    def transcribe_long_audio(self, file_path: Union[str, Path], chunk_minutes: int = 10) -> str:
        """
        Transcribe long audio files by splitting into chunks for faster processing.
        
        This method splits long audio files into smaller chunks and processes them
        sequentially, which is much faster than processing the entire file at once.
        
        Args:
            file_path (Union[str, Path]): Path to the input audio file
            chunk_minutes (int): Minutes per chunk (default 10)
            
        Returns:
            str: Complete transcription of all chunks combined
            
        Raises:
            FileNotFoundError: If the input file doesn't exist
            Exception: If chunking or transcription fails
        """
        import librosa
        import soundfile as sf
        
        file_path = Path(file_path)
        if not file_path.exists():
            raise FileNotFoundError(f"Audio file not found: {file_path}")
            
        logger.info(f"Processing long audio file in {chunk_minutes}-minute chunks...")
        
        try:
            # Load full audio to determine duration and create chunks
            audio, sr = librosa.load(file_path, sr=16000, mono=True)
            duration = len(audio) / sr / 60  # duration in minutes
            
            if duration <= chunk_minutes:
                # File is short enough, process normally
                logger.info(f"File duration ({duration:.1f} min) <= chunk size, processing normally")
                return self.transcribe_file(file_path, use_chunking=False)
            
            chunk_samples = chunk_minutes * 60 * sr
            total_chunks = math.ceil(len(audio) / chunk_samples)
            
            logger.info(f"Audio duration: {duration:.1f} minutes, splitting into {total_chunks} chunks")
            
            full_transcription = []
            
            for i in range(total_chunks):
                start_sample = i * chunk_samples
                end_sample = min((i + 1) * chunk_samples, len(audio))
                
                chunk_audio = audio[start_sample:end_sample]
                chunk_duration = len(chunk_audio) / sr / 60
                
                # Save chunk as temporary file
                temp_file = tempfile.NamedTemporaryFile(suffix='.wav', delete=False)
                try:
                    sf.write(temp_file.name, chunk_audio, sr)
                    temp_file.close()
                    
                    logger.info(f"Processing chunk {i+1}/{total_chunks} ({chunk_duration:.1f} min)...")
                    chunk_result = self.transcribe_audio(temp_file.name)
                    
                    if chunk_result.strip():  # Only add non-empty transcriptions
                        full_transcription.append(chunk_result.strip())
                    
                finally:
                    # Clean up temporary file
                    if os.path.exists(temp_file.name):
                        os.unlink(temp_file.name)
            
            result = " ".join(full_transcription)
            logger.info(f"Completed transcription of {total_chunks} chunks")
            return result
            
        except Exception as e:
            logger.error(f"Long audio transcription failed: {e}")
            raise Exception(f"Chunked transcription error: {e}")

    def transcribe_file(self, file_path: Union[str, Path], use_chunking: bool = True) -> str:
        """
        Complete transcription pipeline with automatic chunking for long files.
        
        This method automatically detects long files and uses chunking for faster processing.
        For educational content analysis, this provides much faster results.
        
        Args:
            file_path (Union[str, Path]): Path to the input audio file
            use_chunking (bool): Whether to use chunking for long files (default True)
            
        Returns:
            str: Complete transcribed text
            
        Raises:
            FileNotFoundError: If the input file doesn't exist
            Exception: If any step of the transcription process fails
        """
        file_path = Path(file_path)
        
        if not file_path.exists():
            raise FileNotFoundError(f"Audio file not found: {file_path}")
        
        logger.info(f"Starting transcription of: {file_path.name}")
        
        try:
            # Check if file is long and use chunking if enabled
            if use_chunking:
                import librosa
                audio, _ = librosa.load(file_path, sr=16000)
                duration_minutes = len(audio) / 16000 / 60
                
                if duration_minutes > 15:  # Use chunking for files > 15 minutes
                    logger.info(f"Long file detected ({duration_minutes:.1f} min), using chunking...")
                    return self.transcribe_long_audio(file_path)
            
            # Original method for shorter files
            temp_audio_path = self.load_and_convert_audio(file_path)
            transcription = self.transcribe_audio(temp_audio_path)
            
            # Clean up temporary file if it was created
            if temp_audio_path != str(file_path) and os.path.exists(temp_audio_path):
                os.unlink(temp_audio_path)
                logger.info("Temporary audio file cleaned up")
                
            return transcription
            
        except Exception as e:
            logger.error(f"Transcription pipeline failed: {e}")
            raise


def transcribe_czech_audio(file_path: Union[str, Path], 
                          model_size: str = "small") -> str:
    """
    Convenience function to transcribe Czech audio from a file.
    
    This function provides a simple interface for one-off transcriptions
    without needing to manage the CzechTranscriber class.
    
    Args:
        file_path (Union[str, Path]): Path to the audio file
        model_size (str): Whisper model size ('tiny', 'base', 'small', 'medium', 'large')
                         Default 'small' recommended for speed/accuracy balance
    
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
    Main function with enhanced command-line interface for faster processing.
    """
    import argparse
    
    parser = argparse.ArgumentParser(description='Transcribe Czech audio files with speed optimizations')
    parser.add_argument('audio_file', help='Path to audio file')
    parser.add_argument('--model', choices=['tiny', 'base', 'small', 'medium', 'large'], 
                       default='small', help='Whisper model size (default: small for speed/accuracy balance)')
    parser.add_argument('--fast', action='store_true', 
                       help='Use fastest settings (tiny model + optimized chunking)')
    parser.add_argument('--chunk-minutes', type=int, default=10,
                       help='Minutes per chunk for long files (default: 10)')
    parser.add_argument('--no-chunking', action='store_true',
                       help='Disable automatic chunking for long files')
    
    # If no arguments provided, show simple usage
    if len(sys.argv) == 1:
        print("Usage: python czech_transcriber.py <audio_file_path> [options]")
        print("\nQuick examples:")
        print("  python czech_transcriber.py audio.mp3                    # Balanced speed/quality")
        print("  python czech_transcriber.py long_audio.mp3 --fast        # Fastest processing")
        print("  python czech_transcriber.py audio.mp3 --model medium     # Higher quality")
        print("\nSupported formats: MP3, WAV, M4A, AAC")
        print("\nFor detailed options: python czech_transcriber.py --help")
        sys.exit(1)
    
    args = parser.parse_args()
    
    # Configure model based on options
    if args.fast:
        model_size = 'tiny'
        chunk_minutes = 5  # Smaller chunks for faster processing
        print("🚀 FAST MODE: Using tiny model with 5-minute chunks for maximum speed")
        print("   Note: Quality will be lower but processing will be much faster")
    else:
        model_size = args.model
        chunk_minutes = args.chunk_minutes
    
    audio_file = args.audio_file
    
    try:
        print(f"Transcribing Czech audio from: {audio_file}")
        print(f"Using '{model_size}' model...")
        
        # Show estimated time based on model and file
        try:
            import librosa
            audio, _ = librosa.load(audio_file, sr=16000)
            duration_min = len(audio) / 16000 / 60
            
            # Rough time estimates (will vary by system)
            time_estimates = {
                'tiny': duration_min * 0.1,
                'base': duration_min * 0.15, 
                'small': duration_min * 0.25,
                'medium': duration_min * 0.5,
                'large': duration_min * 1.0
            }
            
            estimated_time = time_estimates.get(model_size, duration_min * 0.25)
            print(f"Audio duration: {duration_min:.1f} minutes")
            print(f"Estimated processing time: {estimated_time:.1f} minutes")
            
        except Exception:
            print("Could not estimate processing time")
        
        print("-" * 60)
        
        transcriber = CzechTranscriber(model_size=model_size)
        
        # Choose processing method
        use_chunking = not args.no_chunking
        if args.fast:
            # For fast mode, always use chunking with small chunks
            transcription = transcriber.transcribe_long_audio(audio_file, chunk_minutes)
        else:
            transcription = transcriber.transcribe_file(audio_file, use_chunking=use_chunking)
        
        print("TRANSCRIPTION:")
        print("=" * 60)
        print(transcription)
        print("=" * 60)
        print("\nTranscription completed successfully!")
        
        # Save to file
        output_file = Path(audio_file).with_suffix('.txt')
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write(transcription)
        print(f"Transcription saved to: {output_file}")
        
        # Show quality/speed info
        print(f"\nProcessing info:")
        print(f"  Model used: {model_size}")
        print(f"  Chunking: {'Enabled' if use_chunking else 'Disabled'}")
        if use_chunking:
            print(f"  Chunk size: {chunk_minutes} minutes")
        
    except FileNotFoundError:
        print(f"Error: File '{audio_file}' not found.")
        sys.exit(1)
    except Exception as e:
        print(f"Error during transcription: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
