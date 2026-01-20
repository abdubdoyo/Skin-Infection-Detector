# 🧠 Derma Detect — AI-Based Skin Condition Risk Assessment

Derma Detect is an AI-powered application that uses convolutional neural networks and transfer learning
to analyze skin images and estimate the likelihood of common skin conditions.
The system provides educational insights and non-clinical skincare guidance to support early awareness,
while prioritizing user privacy and ethical AI practices.

This project explores how machine learning can be used responsibly to support early awareness while respecting ethical and privacy constraints.

## 🎥 App Preview
https://github.com/user-attachments/assets/0694098a-f881-4f9a-a4bd-b8701964d76b

## 🧩 System Architecture
Derma Detect follows a modular client–server architecture:

1. **Client Interface**
   - Users upload skin images via a web/mobile interface
   - Images are validated for format and quality before submission

2. **Backend API (Flask)**
   - Handles image preprocessing and inference requests
   - Exposes REST endpoints for predictions and recommendations
   - Enforces request limits and input validation

3. **ML Inference Pipeline**
   - Pretrained CNN (EfficientNet/MobileNet) fine-tuned using transfer learning
   - Images are resized, normalized, and augmented before inference
   - Model outputs class probabilities for 10 skin condition categories

4. **Recommendation Engine**
   - Maps predicted risk categories to educational skincare guidance
   - Outputs non-medical suggestions for skin care and lifestyle awareness

## 📊 Evaluation
- Achieved ~70% validation accuracy across 10 skin condition classes
- Evaluated using a held-out validation split
- Confusion matrix analysis used to identify overlapping disease classes
- Model performance varies depending on lighting and image quality
- Trained on a curated dataset of labeled skin-condition images sourced from publicly available medical image repositories

## 🔐 Privacy, Ethics & Safety
- Uploaded images are processed temporarily and **automatically deleted after inference**
- No user images or personal data are stored
- The system does **not** provide medical diagnoses
- Results are presented as educational risk assessments only
- Includes clear user disclaimers encouraging consultation with medical professionals

## 🏗️ Tech Stack

- **Backend:** Python, TensorFlow/Keras, Flask 
- **Frontend:** React Native
- **Model:** CNN (e.g., EfficientNet, MobileNet)
- **Tools:** Docker, Git, GitHub Actions, VS Code

- ## 🚀 Getting Started

Follow these steps to set up and run the Derma Detect application locally.

### Prerequisites

- **Python 3.8+**: For the backend AI analysis.
- **Node.js 16+ and npm**: For the frontend React Native app.
- **Git**: To clone the repository.
- **Expo CLI** (optional, for easier React Native development): Install globally with `npm install -g @expo/cli`.

### Installation and Running the Application

```bash
# Clone the repository:
   $ git clone https://github.com/abdubdoyo/Skin-Infection-Detector.git
   $ cd Skin-infection-detector

# Set up Backend:
    $ cd backend
    $ pip install -r requirements.txt
    $ python main.py

# Set up Frontend:
    $ cd ../frontend
    $ npm install
    $ npm start
```
