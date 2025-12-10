# Image to Text Generator

A powerful web application that extracts text from images using advanced OCR (Optical Character Recognition) technology with GPU acceleration support.

## ✨ Features

- **Multi-language OCR** - Supports English, Spanish, French, German, and Italian
- **GPU Acceleration** - Automatic CUDA detection for faster processing
- **Smart Text Processing** - AI-powered text summarization
- **Image Optimization** - Automatic resizing and format handling
- **Export Options** - Download extracted text as PDF
- **Real-time Processing** - Fast and responsive interface

## 🛠️ Tech Stack

**Backend:**
- FastAPI (Python web framework)
- EasyOCR (OCR engine)
- Transformers (AI text processing)
- PyTorch (Machine learning)
- Pillow (Image processing)

**Frontend:**
- React 19
- Modern JavaScript
- CSS3 styling
- jsPDF (PDF generation)

## 📁 Project Structure

```
├── backend/           # FastAPI server
│   ├── backend.py     # Main server application
│   └── requirement.txt# Python dependencies
├── frontend/          # React application
│   ├── src/           # Source code
│   ├── public/        # Static assets
│   └── package.json   # Node dependencies
└── README.md         # Project documentation
```

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Node.js 14+
- Optional: CUDA-compatible GPU for acceleration

### Backend Setup
```bash
cd backend
pip install -r requirement.txt
python backend.py
```
The API will be available at `http://localhost:8000`

### Frontend Setup
```bash
cd frontend
npm install
npm start
```
The web app will open at `http://localhost:3000`

## 📖 Usage

1. **Upload Image**: Choose an image file (JPG, PNG, etc.)
2. **Select Language**: Pick the primary language of text in the image
3. **Extract Text**: Click process to extract text using OCR
4. **Review Results**: View extracted text with optional AI summarization
5. **Export**: Download results as PDF if needed

## 🔧 Configuration

The application automatically:
- Detects GPU availability for faster processing
- Resizes large images (max 1600px dimension)
- Limits file size (5MB max)
- Handles multiple image formats

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).