import os
import argparse
import numpy as np
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader
from dataset import DREAMERDataset
from models import FactorizedEEGNet, StandardEEGNet

def parse_args():
    parser = argparse.ArgumentParser(description="Benchmark EEG Architectures on DREAMER")
    parser.add_argument(
        "--model", 
        type=str, 
        choices=["factorized", "eegnet"], 
        default="factorized",
        help="Select architecture: 'factorized' or 'eegnet'"
    )
    parser.add_argument("--epochs", type=int, default=30)
    parser.add_argument("--batch_size", type=int, default=64)
    parser.add_argument("--lr", type=float, default=1e-3)
    parser.add_argument("--patience", type=int, default=7)
    return parser.parse_args()

def train_model():
    args = parse_args()
    device = torch.device("mps" if torch.backends.mps.is_available() else "cuda" if torch.cuda.is_available() else "cpu")
    print(f"Training on device: {device}")
    print(f"Selected Architecture: {args.model.upper()}")

    mat_path = os.path.join("data", "raw", "DREAMER.mat")
    
    print("Loading Training Data (Subjects 1-18)...")
    train_dataset = DREAMERDataset(mat_path, participant_indices=list(range(0, 18)))
    print("Loading Validation Data (Subjects 19-23)...")
    val_dataset = DREAMERDataset(mat_path, participant_indices=list(range(18, 23)))

    train_loader = DataLoader(train_dataset, batch_size=args.batch_size, shuffle=True)
    val_loader = DataLoader(val_dataset, batch_size=args.batch_size, shuffle=False)

    # Instantiate chosen model
    if args.model == "factorized":
        model = FactorizedEEGNet(in_channels=14, num_classes=2).to(device)
    else:
        model = StandardEEGNet(num_classes=2, channels=14, samples=512).to(device)

    param_count = sum(p.numel() for p in model.parameters() if p.requires_grad)
    print(f"Trainable parameters: {param_count:,}")

    # Dynamic class weighting
    low_count = np.sum(train_dataset.labels == 0)
    high_count = np.sum(train_dataset.labels == 1)
    total = len(train_dataset)
    class_weights = torch.tensor(
        [total / (2.0 * low_count), total / (2.0 * high_count)],
        dtype=torch.float32
    ).to(device)
    
    criterion = nn.CrossEntropyLoss(weight=class_weights, label_smoothing=0.0)
    optimizer = optim.AdamW(model.parameters(), lr=args.lr, weight_decay=1e-2)

    best_val_loss = float('inf')
    best_val_acc = 0.0
    patience_counter = 0
    save_path = f"models/best_{args.model}.pt"

    for epoch in range(args.epochs):
        model.train()
        train_loss, train_correct, train_total = 0.0, 0, 0
        
        for inputs, labels in train_loader:
            inputs, labels = inputs.to(device), labels.to(device)
            optimizer.zero_grad()
            outputs = model(inputs)
            loss = criterion(outputs, labels)
            loss.backward()
            optimizer.step()

            train_loss += loss.item() * inputs.size(0)
            _, predicted = torch.max(outputs, 1)
            train_total += labels.size(0)
            train_correct += (predicted == labels).sum().item()

        train_acc = train_correct / train_total
        avg_train_loss = train_loss / train_total

        model.eval()
        val_loss, val_correct, val_total = 0.0, 0, 0
        
        with torch.no_grad():
            for inputs, labels in val_loader:
                inputs, labels = inputs.to(device), labels.to(device)
                outputs = model(inputs)
                loss = criterion(outputs, labels)
                
                val_loss += loss.item() * inputs.size(0)
                _, predicted = torch.max(outputs, 1)
                val_total += labels.size(0)
                val_correct += (predicted == labels).sum().item()

        val_acc = val_correct / val_total
        avg_val_loss = val_loss / val_total

        print(f"Epoch {epoch+1:02d}/{args.epochs} | Train Loss: {avg_train_loss:.4f} Acc: {train_acc:.4f} | Val Loss: {avg_val_loss:.4f} Acc: {val_acc:.4f}")

        if avg_val_loss < best_val_loss:
            best_val_loss = avg_val_loss
            best_val_acc = val_acc
            patience_counter = 0
            os.makedirs("models", exist_ok=True)
            torch.save(model.state_dict(), save_path)
        else:
            patience_counter += 1
            if patience_counter >= args.patience:
                print(f"\nEarly stopping triggered! Best checkpoint saved to {save_path}")
                break

    print(f"\n{args.model.upper()} Benchmark Complete. Best Val Accuracy: {best_val_acc:.4f}")

if __name__ == "__main__":
    train_model()
