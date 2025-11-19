# analyzer_api.py

import io
import torch
from torchvision import transforms
from PIL import Image
from fastapi import FastAPI, File, UploadFile
from fastapi.responses import JSONResponse
from image_analyzer import TinyCNN, img_size, num_classes

app = FastAPI(title="Tiny X-ray Classifier")

device = torch.device("cpu")
model = TinyCNN(num_classes)
model.load_state_dict(torch.load("xray_tiny_cnn.pth", map_location=device))
model.to(device)
model.eval()

class_names = ["normal", "pneumonia"]

transform = transforms.Compose([
    transforms.Resize((img_size, img_size)),
    transforms.ToTensor()
])

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    try:
        image_bytes = await file.read()
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        image = transform(image).unsqueeze(0).to(device)

        with torch.no_grad():
            outputs = model(image)
            probs = torch.softmax(outputs, dim=1)
            confidence, predicted = torch.max(probs, 1)

        return JSONResponse(content={
            "class": class_names[predicted.item()],
            "confidence": float(confidence.item() * 100)
        })

    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)
