import os
import torch
from torch.utils.data import DataLoader
from dataset import DEAPDataset
from models import FactorizedEEGNet

def evaluate_cross_dataset():
    # 1. Setup Device
    device = torch.device("mps" if torch.backends.mps.is_available() else "cuda" if torch.cuda.is_available() else "cpu")
    print(f"Evaluating on device: {device}")

    # 2. Paths (Update deap_dir if your DEAP data is stored elsewhere)
    deap_dir = os.path.join("data", "raw")
    model_path = os.path.join("models", "best_factorized.pt")

    if not os.path.exists(deap_dir):
        print(f"Error: DEAP dataset directory not found at {deap_dir}")
        print("Please ensure the DEAP '.dat' files are located there.")
        return

    if not os.path.exists(model_path):
        print(f"Error: Model checkpoint not found at {model_path}")
        return

    # 3. Load Dataset
    print(f"Loading DEAP dataset from {deap_dir}...")
    # Loading all 32 DEAP participants
    test_dataset = DEAPDataset(dat_dir=deap_dir, participant_indices=None)
    test_loader = DataLoader(test_dataset, batch_size=64, shuffle=False)
    print(f"Total testing epochs (windows) generated: {len(test_dataset)}")

    # 4. Load Model
    print("Loading FactorizedEEGNet checkpoint...")
    model = FactorizedEEGNet(in_channels=14, num_classes=2).to(device)
    model.load_state_dict(torch.load(model_path, map_location=device))
    model.eval()

    # 5. Evaluation Loop
    test_correct = 0
    test_total = 0
    
    print("Starting cross-dataset evaluation...")
    with torch.no_grad():
        for inputs, labels in test_loader:
            inputs, labels = inputs.to(device), labels.to(device)
            
            # Forward pass
            outputs = model(inputs)
            
            # Get predictions
            _, predicted = torch.max(outputs, 1)
            
            # Calculate accuracy metrics
            test_total += labels.size(0)
            test_correct += (predicted == labels).sum().item()

    # 6. Results
    final_accuracy = test_correct / test_total
    print("-" * 50)
    print(f"CROSS-DATASET EVALUATION COMPLETE")
    print(f"Model: FactorizedEEGNet (Trained on DREAMER)")
    print(f"Test Data: DEAP (32 Participants)")
    print(f"Final Accuracy: {final_accuracy:.4f} ({final_accuracy * 100:.2f}%)")
    print("-" * 50)

if __name__ == "__main__":
    evaluate_cross_dataset()
