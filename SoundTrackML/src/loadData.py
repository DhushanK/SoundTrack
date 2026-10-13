import os
import pickle
import numpy as np

def load_participant_data(file_path: str):
    """
    Loads a single DEAP participant .dat file.
    Returns:
        data: ndarray with shape (40 trials, 40 channels, 8064 time samples)
        labels: ndarray with shape (40 trials, 4 ratings: valence, arousal, dominance, liking)
    """
    with open(file_path, 'rb') as f:
        # 'latin1' encoding is mandatory for Python 3 compatibility with DEAP
        subject_data = pickle.load(f, encoding='latin1')
    
    data = subject_data['data']
    labels = subject_data['labels']
    return data, labels

if __name__ == "__main__":
    # Test loading the first participant
    sample_file = os.path.join("data", "raw", "s01.dat")
    
    if not os.path.exists(sample_file):
        # Fallback if files were extracted inside a subfolder
        potential_files = [f for f in os.listdir("data/raw") if f.endswith(".dat")]
        if potential_files:
            sample_file = os.path.join("data", "raw", potential_files[0])
            print(f"Using found file: {sample_file}")
        else:
            raise FileNotFoundError(f"No .dat files found in data/raw/")

    data, labels = load_participant_data(sample_file)
    print(f"Loaded {sample_file} successfully.")
    print(f"EEG/Physio Data shape: {data.shape} -> (trials, channels, samples)")
    print(f"Labels shape:          {labels.shape} -> (trials, ratings)")
    print(f"Sample label (Trial 0): Valence={labels[0, 0]:.2f}, Arousal={labels[0, 1]:.2f}")
