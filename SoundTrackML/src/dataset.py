import os
import pickle
import numpy as np
import torch
from torch.utils.data import Dataset
import scipy.io as sio
from scipy.signal import butter, filtfilt

class DREAMERDataset(Dataset):
    def __init__(self, mat_file_path, participant_indices=None, window_size=512, step_size=512):
        self.epochs = []
        self.labels = []
        self.fs = 128
        
        # Design a 5th-order Butterworth bandpass filter (4 Hz to 45 Hz)
        nyq = 0.5 * self.fs
        low = 4.0 / nyq
        high = 45.0 / nyq
        self.b, self.a = butter(5, [low, high], btype='band')
        
        mat = sio.loadmat(mat_file_path)
        participants = mat['DREAMER'][0, 0]['Data'][0]
        
        if participant_indices is None:
            participant_indices = range(len(participants))
            
        for p_idx in participant_indices:
            participant_data = participants[p_idx]
            eeg_stimuli = participant_data['EEG'][0, 0]['stimuli'][0, 0]
            valence_scores = participant_data['ScoreValence'][0, 0]
            
            for trial_idx in range(18):
                # Shape: (14 channels, trial_samples)
                raw_eeg = eeg_stimuli[trial_idx, 0].T
                
                # 1. Apply Zero-Phase Bandpass Filter to remove DC drift and high-freq noise
                filtered_eeg = filtfilt(self.b, self.a, raw_eeg, axis=1)
                
                # 2. Trial-level Z-score per channel on the CLEANED signal
                trial_mean = np.mean(filtered_eeg, axis=1, keepdims=True)
                trial_std = np.std(filtered_eeg, axis=1, keepdims=True) + 1e-8
                norm_trial = (filtered_eeg - trial_mean) / trial_std
                
                label = 1 if valence_scores[trial_idx, 0] > 3.0 else 0
                
                # 3. Slice into independent windows
                num_samples = norm_trial.shape[1]
                for start in range(0, num_samples - window_size + 1, step_size):
                    end = start + window_size
                    epoch = norm_trial[:, start:end]
                    
                    self.epochs.append(epoch)
                    self.labels.append(label)

        self.epochs = np.array(self.epochs, dtype=np.float32)
        self.labels = np.array(self.labels, dtype=np.int64)

    def __len__(self):
        return len(self.labels)

    def __getitem__(self, idx):
        return torch.tensor(self.epochs[idx]), torch.tensor(self.labels[idx])


class DEAPDataset(Dataset):
    def __init__(self, dat_dir, participant_indices=None, window_size=512, step_size=512):
        self.epochs = []
        self.labels = []
        self.fs = 128
        
        # 5th-order Butterworth bandpass (4-45 Hz)
        nyq = 0.5 * self.fs
        self.b, self.a = butter(5, [4.0 / nyq, 45.0 / nyq], btype='band')
        
        # Map DEAP's 32 channels down to the 14 Emotiv channels your model knows
        # Emotiv layout: AF3, F7, F3, FC5, T7, P7, O1, O2, P8, T8, FC6, F4, F8, AF4
        self.emotiv_indices = [1, 3, 2, 4, 7, 11, 13, 31, 29, 25, 21, 19, 20, 17]
        
        dat_files = sorted([f for f in os.listdir(dat_dir) if f.endswith('.dat')])
        if participant_indices is None:
            participant_indices = range(len(dat_files))
            
        for p_idx in participant_indices:
            file_path = os.path.join(dat_dir, dat_files[p_idx])
            with open(file_path, 'rb') as f:
                data = pickle.load(f, encoding='latin1')
            
            # DEAP data shape: (40 trials, 40 channels, 8064 samples)
            # Channels 0-31 are EEG. 
            eeg_data = data['data'][:, self.emotiv_indices, :] 
            valence_scores = data['labels'][:, 0] # Valence is the 1st label
            
            for trial_idx in range(40):
                # DEAP includes a 3-second baseline at the start (384 samples)
                # We skip the baseline and take the 60-second video trial
                trial_eeg = eeg_data[trial_idx, :, 384:]
                
                # 1. Bandpass filter
                filtered_eeg = filtfilt(self.b, self.a, trial_eeg, axis=1)
                
                # 2. Trial-level Z-score per channel
                trial_mean = np.mean(filtered_eeg, axis=1, keepdims=True)
                trial_std = np.std(filtered_eeg, axis=1, keepdims=True) + 1e-8
                norm_trial = (filtered_eeg - trial_mean) / trial_std
                
                # DEAP is scored 1-9. Binarize at 5.0.
                label = 1 if valence_scores[trial_idx] >= 5.0 else 0
                
                # 3. Slice into independent windows
                num_samples = norm_trial.shape[1]
                for start in range(0, num_samples - window_size + 1, step_size):
                    end = start + window_size
                    epoch = norm_trial[:, start:end]
                    
                    self.epochs.append(epoch)
                    self.labels.append(label)

        self.epochs = np.array(self.epochs, dtype=np.float32)
        self.labels = np.array(self.labels, dtype=np.int64)

    def __len__(self):
        return len(self.labels)

    def __getitem__(self, idx):
        return torch.tensor(self.epochs[idx]), torch.tensor(self.labels[idx])
