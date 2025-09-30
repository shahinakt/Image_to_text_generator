from fastapi import FastAPI, File, UploadFile, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from io import BytesIO
from PIL import Image
import numpy as np
import easyocr
import uvicorn
from transformers import pipeline
import torch
import tempfile
import os
from typing import Optional


app = FastAPI(title="GPU Accelerated Image to Text Generator API")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# Configuration 
MAX_TEXT_LENGTH = 1000  # Maximum characters for summarization
MAX_IMAGE_SIZE = 5 * 1024 * 1024  # 5MB 
MAX_DIMENSION = 1600  # Max width or height for resizing

# Language mapping for EasyOCR
SUPPORTED_LANGUAGES = {
    "en": ["en"],           # English
    "es": ["es", "en"],     # Spanish + English fallback
    "fr": ["fr", "en"],     # French + English fallback  
    "de": ["de", "en"],     # German + English fallback
    "it": ["it", "en"]      # Italian + English fallback
}

# Detect GPU availability
USE_CUDA = torch.cuda.is_available()
DEVICE_ARG = 0 if USE_CUDA else -1 # Use GPU if available, else CPU

# Global models (load once startup)
readers = {}  # Dictionary to store readers for different languages
summarizer = None


@app.on_event("startup")
def load_models():
    global readers, summarizer
    # Load EasyOCR readers for all supported languages
    print("Loading OCR models for multiple languages...")
    for lang_code, ocr_langs in SUPPORTED_LANGUAGES.items():
        print(f"Loading {lang_code} OCR model...")
        readers[lang_code] = easyocr.Reader(ocr_langs, gpu=USE_CUDA)
    
    # Transformers summarizer on GPU if available
    print("Loading summarization model...")
    summarizer = pipeline("summarization", device=DEVICE_ARG)
    print("All models loaded successfully!")

def get_reader_for_language(lang: str):
    """Get the appropriate OCR reader for the specified language"""
    if lang in readers:
        return readers[lang]
    else:
        # Fallback to English if language not supported
        return readers["en"]

def resize_image_if_needed(pil_img: Image.Image, max_dim: int = MAX_DIMENSION) -> Image.Image:
    w, h = pil_img.size
    if max(w, h) > max_dim:
        pil_img.thumbnail((max_dim, max_dim), Image.LANCZOS)
    return pil_img

@app.post("/extract_text/")
async def extract_text(file: UploadFile = File(...), lang: Optional[str] = Form("en")):
    # Validate language
    if lang not in SUPPORTED_LANGUAGES:
        lang = "en"  # Default to English if unsupported language
    
    if file.content_type not in ["image/jpeg", "image/png", "image/bmp", "image/tiff"]:
        raise HTTPException(status_code=400, detail="Invalid file type. Only JPEG, PNG, BMP, and TIFF are supported.")
    
    contents = await file.read()
    if len(contents) > MAX_IMAGE_SIZE:
        raise HTTPException(status_code=400, detail="File size exceeds the maximum limit of 5MB.")
    
    # Save to a temporary file for EasyOCR
    tmp = tempfile.NamedTemporaryFile(delete=False, suffix=".png")
    try:
        tmp.write(contents)
        tmp.flush() 
        tmp.close()
        
        # Read image with PIL and resize if needed
        pil_img = Image.open(tmp.name).convert("RGB")
        pil_img = resize_image_if_needed(pil_img)
        
        # Convert to numpy array for EasyOCR
        img_array = np.array(pil_img)
        
        # Get the appropriate OCR reader for the selected language
        current_reader = get_reader_for_language(lang)
        
        # OCR using EasyOCR with language-specific reader
        result = current_reader.readtext(img_array, detail=0)
        extracted_text = " ".join(result).strip()
        
        if not extracted_text:
            return {
                "extracted_text": "", 
                "summary": "", 
                "message": f"No text found in the image using {lang.upper()} OCR.",
                "language_used": lang
            }
        
        # Truncate if too long
        text_to_summarize = extracted_text[:MAX_TEXT_LENGTH]

        # Summarization using Transformers (GPU if available)
        with torch.no_grad():
            if USE_CUDA:
                with torch.cuda.amp.autocast():
                    summary_obj = summarizer(text_to_summarize, max_length=130, min_length=30, do_sample=False)
            else:
                summary_obj = summarizer(text_to_summarize, max_length=130, min_length=30, do_sample=False)
            summary = summary_obj[0]["summary_text"].strip()

        return {
            "extracted_text": extracted_text,
            "summary": summary,
            "message": f"Text extracted and summarized successfully using {lang.upper()} OCR.",
            "language_used": lang,
            "cuda": USE_CUDA
        }
    
    finally:
        # Delete temporary file
        try:
            os.unlink(tmp.name)
        except Exception:
            pass

if __name__ == "__main__":
    uvicorn.run("backend:app", host="0.0.0.0", port=8000, reload=False)