# analyzer_api.py

import io
import torch
import torch.nn as nn
from torchvision import transforms
from PIL import Image
from fastapi import FastAPI, File, UploadFile
from fastapi.responses import JSONResponse
from image_analyzer import TinyCNN, img_size, num_classes  # Import your model class

# -----------------------------
# 1️⃣ Initialize FastAPI
# -----------------------------
app = FastAPI(title="Tiny X-ray Classifier")

# -----------------------------
# 2️⃣ Load model
# -----------------------------
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model = TinyCNN(num_classes)
model.load_state_dict(torch.load("xray_tiny_cnn.pth", map_location=device))
model.to(device)
model.eval()

# Map numeric labels to class names
class_names = ["normal", "pneumonia"]  # change if you have different folders

# -----------------------------
# 3️⃣ Image preprocessing
# -----------------------------
transform = transforms.Compose([
    transforms.Resize((img_size, img_size)),
    transforms.ToTensor()
])

# -----------------------------
# 4️⃣ Prediction endpoint
# -----------------------------
@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    try:
        # Read image
        image_bytes = await file.read()
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        image = transform(image).unsqueeze(0).to(device)  # add batch dim

        # Forward pass
        with torch.no_grad():
            outputs = model(image)
            probs = torch.softmax(outputs, dim=1)
            confidence, predicted = torch.max(probs, 1)

        result = {
            "class": class_names[predicted.item()],
            "confidence": float(confidence.item() * 100)
        }
        return JSONResponse(content=result)

    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)
