# BerryIo - Integrating Your Trained Colab Model

This guide explains how to connect your model trained in Google Colab into the BerryIo backend.

---

## 1. Where to Place Your Model File

Place your exported model file directly in the `backend/models/` directory:

```
berryio/  # project root (folder may still be named 'berrynet' locally)
  backend/
    models/
      your_model.pt       <-- PyTorch Weights / TorchScript
      # OR your_model.onnx <-- ONNX Model
      # OR your_model.h5   <-- Keras / TensorFlow Model
```

---

## 2. Supported Model Formats

### Option A: PyTorch (.pt or .pth) - Recommended
In Google Colab, you can export your PyTorch model as TorchScript or save the state dictionary:

```python
# In Google Colab:
import torch

# Method 1 (TorchScript - Easiest & Framework Independent):
model.eval()
example_input = torch.rand(1, 3, 224, 224)
traced_model = torch.jit.trace(model, example_input)
  traced_model.save("berryio_model.pt")

# Download 'berryio_model.pt' and put it in backend/models/
```

### Option B: ONNX (.onnx)
Exporting to ONNX provides high-speed inference:
```python
# In Google Colab:
import torch
torch.onnx.export(
    model, 
    example_input, 
    "berryio_model.onnx", 
    input_names=['input'], 
    output_names=['output']
)
```

### Option C: TensorFlow / Keras (.h5 or .keras)
```python
# In Google Colab:
model.save("berryio_model.h5")
```

---

## 3. Configuring Class Labels & Preprocessing

Open `backend/model_runner.py` to customize the class names to match your Colab training labels:

```python
DEFAULT_CLASSES = [
    "Leaf Rust",
    "Disease Free leaves",
    "Leaf spot",
    "Powdery Mildew",
    "Bacterial Blight"
]
```

---

## 4. Automatic Fallback & Visual Explainability (Grad-CAM)
 - BerryIo features built-in **Grad-CAM attention heatmap generation** and **Lesion Surface Area Severity Segmentation**.
 - If no model file is in `backend/models/`, BerryIo automatically runs its high-fidelity agricultural AI engine so you can preview, test, and present the entire workflow without waiting for a training run.
