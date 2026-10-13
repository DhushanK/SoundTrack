from neurosdk.scanner import Scanner
from neurosdk.cmn_types import *

import concurrent.futures
from time import sleep
from datetime import datetime
import numpy as np
from collections import deque
from scipy import signal
import threading
import time
import firebase_admin
from firebase_admin import credentials, firestore
import json

# EEG Signal Processing Parameters
# 1.1 Sampling rate and channels
fs = 250  # Hz - sampling rate
n_channels = 4  # 4 EEG channels
eeg_idx = [0, 1, 2, 3]  # indices for all 4 channels

# 1.2 Analysis parameters for post-recording
analysis_window_sec = 60.0  # Analyze 1-minute chunks
analysis_window_samples = int(analysis_window_sec * fs)

# 1.3 Data collection - store all data during recording
recorded_data = [[] for _ in range(n_channels)]

# 1.4 Frequency bands
BANDS = {
    "delta": (0.5, 4),      # Delta waves
    "theta": (4, 8),        # Theta waves
    "alpha": (8, 12),       # Alpha waves
    "alphaMajor": (4, 12),  # Combined theta (4-8) and alpha (8-12)
    "beta": (13, 30),       # Beta waves
    "betaMajor": (13, 30),  # Same as beta (for consistency)
    "gamma": (30, 45),      # Gamma waves
}

# Firebase upload settings
upload_interval = 60  # Upload every 60 seconds
last_upload_time = 0
firebase_initialized = False

def initialize_firebase():
    """Initialize Firebase Admin SDK"""
    global firebase_initialized
    try:
        cred = credentials.Certificate('htv2025-7cc7d-firebase-adminsdk-fbsvc-b6df0eb1d6.json')
        firebase_admin.initialize_app(cred)
        print("✅ Firebase initialized successfully")
        firebase_initialized = True
        return True
    except Exception as e:
        print(f"❌ Firebase initialization failed: {e}")
        firebase_initialized = False
        return False

def upload_eeg_data(eeg_data):
    """Upload EEG data to Firestore biometrics collection"""
    if not firebase_initialized:
        print("⚠️  Firebase not initialized, skipping upload")
        return None
        
    try:
        db = firestore.client()
        
        # Create document data
        doc_data = {
            'timestamp': datetime.now(),
            'eegData': eeg_data,
            'createdAt': firestore.SERVER_TIMESTAMP,
            'sessionId': f"session_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        }
        
        # Add to biometrics collection
        doc_ref = db.collection('biometrics').add(doc_data)
        print(f"📤 EEG data uploaded to Firestore with ID: {doc_ref[1].id}")
        return doc_ref[1].id
        
    except Exception as e:
        print(f"❌ Error uploading EEG data: {e}")
        return None

def upload_mood_data(mood_value):
    """Upload mood data to separate Firestore mood collection"""
    if not firebase_initialized or not mood_value:
        return None
        
    try:
        db = firestore.client()
        
        # Create mood document data - only mood and created_at
        mood_doc_data = {
            'mood': mood_value,
            'created_at': datetime.now().strftime('%B %d, %Y at %I:%M:%S %p UTC-4')
        }
        
        # Add to mood collection
        doc_ref = db.collection('mood').add(mood_doc_data)
        print(f"🎭 Mood data uploaded to Firestore mood collection with ID: {doc_ref[1].id}")
        return doc_ref[1].id
        
    except Exception as e:
        print(f"❌ Error uploading mood data: {e}")
        return None

def get_comprehensive_eeg_data():
    """Get comprehensive EEG data including latest voltage and frequency analysis"""
    if len(recorded_data[0]) < 1:  # Need at least one sample
        return None
    
    # Try to get minute analysis with frequency bands
    band_analysis = None
    if len(recorded_data[0]) >= fs * 60:  # Have at least 1 minute of data
        minute_samples = fs * 60
        minute_data = []
        for ch in range(n_channels):
            if len(recorded_data[ch]) >= minute_samples:
                minute_data.append(recorded_data[ch][-minute_samples:])
            else:
                minute_data = None
                break
        
        if minute_data:
            band_analysis = process_eeg_data_batch(minute_data)
    
    # Create data structure - maintain existing paths for backward compatibility
    comprehensive_data = {
        'channels': {},
        'timestamp': datetime.now().isoformat(),
        'samplingRate': fs
    }
    
    # Add new frequency analysis fields as top-level additions (don't break existing paths)
    if band_analysis is not None:
        comprehensive_data['frequencyAnalysis'] = {
            'hasAnalysis': True,
            'analysisWindow': 60.0,
            'samplesAnalyzed': fs * 60,
            'channels': {}
        }
        
        # Note: Mood data is uploaded separately to mood collection
    
    for ch in range(n_channels):
        if len(recorded_data[ch]) > 0:
            # Get the latest single voltage value (in microVolts)
            latest_voltage = recorded_data[ch][-1]
            channel_name = f'channel_{ch}'
            
            # Maintain existing structure for backward compatibility
            channel_data = {
                'voltageValue': latest_voltage,  # Keep existing field name
                'channelName': channel_name
            }
            
            # Add frequency band analysis in separate section if available
            if band_analysis and channel_name in band_analysis:
                channel_bands = band_analysis[channel_name]
                
                # Calculate all important EEG ratios
                delta_power = channel_bands.get('delta', 0)
                theta_power = channel_bands.get('theta', 0)
                alpha_power = channel_bands.get('alpha', 0)
                beta_power = channel_bands.get('beta', 0)
                gamma_power = channel_bands.get('gamma', 0)
                alpha_major_power = channel_bands.get('alphaMajor', 0)
                beta_major_power = channel_bands.get('betaMajor', 0)
                
                # Store frequency analysis in separate section
                comprehensive_data['frequencyAnalysis']['channels'][channel_name] = {
                    'frequencyBands': {
                        'delta': delta_power,
                        'theta': theta_power,
                        'alpha': alpha_power,
                        'beta': beta_power,
                        'gamma': gamma_power,
                        'alphaMajor': alpha_major_power,
                        'betaMajor': beta_major_power
                    },
                    'ratios': {
                        'alphaBetaRatio': alpha_power / beta_power if beta_power > 0 else 0,
                        'thetaAlphaRatio': theta_power / alpha_power if alpha_power > 0 else 0,
                        'thetaBetaRatio': theta_power / beta_power if beta_power > 0 else 0,
                        'alphaThetaRatio': alpha_power / theta_power if theta_power > 0 else 0,
                        'alphaMajorBetaMajorRatio': alpha_major_power / beta_major_power if beta_major_power > 0 else 0
                    }
                }
            
            comprehensive_data['channels'][channel_name] = channel_data
    
    return comprehensive_data

def calculate_overall_mood(band_powers):
    """Calculate the overall mood across all channels for database upload"""
    if not band_powers or len(band_powers) == 0:
        return None
    
    # Calculate average ratios across all channels
    total_alpha_beta = 0
    total_theta_beta = 0
    channel_count = 0
    
    for channel_name, channel_bands in band_powers.items():
        alpha_power = channel_bands.get('alpha', 0)
        beta_power = channel_bands.get('beta', 0)
        theta_power = channel_bands.get('theta', 0)
        
        if beta_power > 0:
            total_alpha_beta += alpha_power / beta_power
            total_theta_beta += theta_power / beta_power
            channel_count += 1
    
    if channel_count == 0:
        return None
    
    avg_alpha_beta = total_alpha_beta / channel_count
    avg_theta_beta = total_theta_beta / channel_count
    
    # Calculate overall mood states (no gray zones)
    if avg_alpha_beta >= 1.0:
        overall_calmness_anxiety = "Calmness"
        excess = avg_alpha_beta - 1.0
        overall_calmness_confidence = min(95, 50 + (excess * 30))
    else:
        overall_calmness_anxiety = "Anxiety"
        deficit = 1.0 - avg_alpha_beta
        overall_calmness_confidence = min(95, 50 + (deficit * 30))
    
    if avg_theta_beta <= 2.5:
        overall_focus_fatigue = "Focus"
        overall_focus_confidence = min(95, 50 + ((2.5 - avg_theta_beta) * 18))
    else:
        overall_focus_fatigue = "Fatigue"
        excess = avg_theta_beta - 2.5
        overall_focus_confidence = min(95, 50 + (excess * 18))
    
    # Pick the overall mood with higher confidence
    if overall_calmness_confidence >= overall_focus_confidence:
        return overall_calmness_anxiety.lower()  # Return lowercase for database
    else:
        return overall_focus_fatigue.lower()  # Return lowercase for database

def calculate_and_display_minute_analysis():
    """Calculate and display alpha/beta ratios for the last minute of data"""
    if len(recorded_data[0]) < fs * 60:  # Need at least 1 minute of data (250 Hz * 60 sec)
        return
    
    # Get the last minute of data (60 seconds)
    minute_samples = fs * 60  # 15,000 samples at 250 Hz
    
    # Extract the last minute of data for all channels
    minute_data = []
    for ch in range(n_channels):
        if len(recorded_data[ch]) >= minute_samples:
            minute_data.append(recorded_data[ch][-minute_samples:])
        else:
            return  # Not enough data
    
    # Process the minute of data to get frequency band powers
    band_powers = process_eeg_data_batch(minute_data)
    
    if band_powers is None:
        return
    
    # Display the analysis in terminal
    print("🧠 EEG Frequency Band Analysis (Last 60 seconds):")
    print("-" * 70)
    for channel_name, channel_bands in band_powers.items():
        print(f"  {channel_name}:")
        
        # Individual bands
        delta_power = channel_bands.get('delta', 0)
        theta_power = channel_bands.get('theta', 0)
        alpha_power = channel_bands.get('alpha', 0)
        beta_power = channel_bands.get('beta', 0)
        gamma_power = channel_bands.get('gamma', 0)
        
        # Major bands (combined)
        alpha_major_power = channel_bands.get('alphaMajor', 0)
        beta_major_power = channel_bands.get('betaMajor', 0)
        
        print(f"    Delta (0.5-4 Hz):     {delta_power:.4f}")
        print(f"    Theta (4-8 Hz):       {theta_power:.4f}")
        print(f"    Alpha (8-12 Hz):      {alpha_power:.4f}")
        print(f"    Beta (13-30 Hz):      {beta_power:.4f}")
        print(f"    Gamma (30-45 Hz):     {gamma_power:.4f}")
        print(f"    Alpha Major (4-12 Hz): {alpha_major_power:.4f}")
        print(f"    Beta Major (13-30 Hz): {beta_major_power:.4f}")
        
        # Calculate all important EEG ratios
        alpha_beta_ratio = alpha_power / beta_power if beta_power > 0 else 0
        alpha_major_beta_major_ratio = alpha_major_power / beta_major_power if beta_major_power > 0 else 0
        theta_alpha_ratio = theta_power / alpha_power if alpha_power > 0 else 0
        theta_beta_ratio = theta_power / beta_power if beta_power > 0 else 0
        alpha_theta_ratio = alpha_power / theta_power if theta_power > 0 else 0
        
        print(f"    ┌─ EEG Ratios:")
        print(f"    │  Alpha/Beta Ratio (ABR):     {alpha_beta_ratio:.3f}")
        print(f"    │  Theta/Alpha Ratio (TAR):    {theta_alpha_ratio:.3f}")
        print(f"    │  Theta/Beta Ratio (TBR):     {theta_beta_ratio:.3f}")
        print(f"    │  Alpha/Theta Ratio (ATR):    {alpha_theta_ratio:.3f}")
        print(f"    │  AlphaMajor/BetaMajor:       {alpha_major_beta_major_ratio:.3f}")
        print(f"    └─")
        print()
    print("-" * 70)
    
    # Display mood analysis
    calculate_mood_analysis(band_powers)

def calculate_mood_analysis(band_powers):
    """Calculate mood states based on EEG ratios with confidence percentages"""
    print("🎭 Mood Analysis (Last 60 seconds):")
    print("-" * 50)
    
    for channel_name, channel_bands in band_powers.items():
        print(f"  {channel_name}:")
        
        # Get band powers
        alpha_power = channel_bands.get('alpha', 0)
        beta_power = channel_bands.get('beta', 0)
        theta_power = channel_bands.get('theta', 0)
        
        # Calculate ratios
        alpha_beta_ratio = alpha_power / beta_power if beta_power > 0 else 0
        beta_alpha_ratio = beta_power / alpha_power if alpha_power > 0 else 0
        theta_beta_ratio = theta_power / beta_power if beta_power > 0 else 0
        beta_theta_ratio = beta_power / theta_power if theta_power > 0 else 0
        
        # Mood 1: Calmness vs Anxiety (Alpha/Beta ratio)
        if alpha_beta_ratio >= 1.0:
            # Closer to Calmness
            calmness_anxiety_mood = "Calmness"
            # Calculate confidence: further from 1.0 = higher confidence
            excess = alpha_beta_ratio - 1.0
            calmness_confidence = min(95, 50 + (excess * 30))  # 50% base + up to 45% more
        else:
            # Closer to Anxiety
            calmness_anxiety_mood = "Anxiety"
            # Calculate confidence: further from 1.0 = higher confidence
            deficit = 1.0 - alpha_beta_ratio
            calmness_confidence = min(95, 50 + (deficit * 30))  # 50% base + up to 45% more
        
        # Mood 2: Focus vs Fatigue (Theta/Beta ratio)
        if theta_beta_ratio <= 2.5:
            # Closer to Focus
            focus_fatigue_mood = "Focus"
            # Calculate confidence: closer to 0 = higher confidence
            focus_confidence = min(95, 50 + ((2.5 - theta_beta_ratio) * 18))  # 50% base + up to 45% more
        else:
            # Closer to Fatigue
            focus_fatigue_mood = "Fatigue"
            # Calculate confidence: further from 2.5 = higher confidence
            excess = theta_beta_ratio - 2.5
            focus_confidence = min(95, 50 + (excess * 18))  # 50% base + up to 45% more
        
        # Pick the mood with higher confidence as the final mood
        if calmness_confidence >= focus_confidence:
            final_mood = calmness_anxiety_mood
            final_confidence = calmness_confidence
        else:
            final_mood = focus_fatigue_mood
            final_confidence = focus_confidence
        
        # Display mood analysis
        print(f"    🧘 Calmness/Anxiety: {calmness_anxiety_mood} ({calmness_confidence:.0f}%)")
        print(f"    🎯 Focus/Fatigue:    {focus_fatigue_mood} ({focus_confidence:.0f}%)")
        print(f"    🏆 FINAL MOOD:       {final_mood}")
        
        # Show underlying ratios for reference
        print(f"    📊 Alpha/Beta: {alpha_beta_ratio:.3f}, Theta/Beta: {theta_beta_ratio:.3f}")
        print()
    
    # Calculate overall average across all channels
    if len(band_powers) > 1:
        print("  🌐 OVERALL AVERAGE (All Channels):")
        
        # Calculate average ratios across all channels
        total_alpha_beta = 0
        total_theta_beta = 0
        channel_count = 0
        
        for channel_name, channel_bands in band_powers.items():
            alpha_power = channel_bands.get('alpha', 0)
            beta_power = channel_bands.get('beta', 0)
            theta_power = channel_bands.get('theta', 0)
            
            if beta_power > 0:
                total_alpha_beta += alpha_power / beta_power
                total_theta_beta += theta_power / beta_power
                channel_count += 1
        
        if channel_count > 0:
            avg_alpha_beta = total_alpha_beta / channel_count
            avg_theta_beta = total_theta_beta / channel_count
            
            # Calculate overall mood states (no gray zones)
            if avg_alpha_beta >= 1.0:
                overall_calmness_anxiety = "Calmness"
                excess = avg_alpha_beta - 1.0
                overall_calmness_confidence = min(95, 50 + (excess * 30))
            else:
                overall_calmness_anxiety = "Anxiety"
                deficit = 1.0 - avg_alpha_beta
                overall_calmness_confidence = min(95, 50 + (deficit * 30))
            
            if avg_theta_beta <= 2.5:
                overall_focus_fatigue = "Focus"
                overall_focus_confidence = min(95, 50 + ((2.5 - avg_theta_beta) * 18))
            else:
                overall_focus_fatigue = "Fatigue"
                excess = avg_theta_beta - 2.5
                overall_focus_confidence = min(95, 50 + (excess * 18))
            
            # Pick the overall mood with higher confidence
            if overall_calmness_confidence >= overall_focus_confidence:
                overall_final_mood = overall_calmness_anxiety
                overall_final_confidence = overall_calmness_confidence
            else:
                overall_final_mood = overall_focus_fatigue
                overall_final_confidence = overall_focus_confidence
            
            print(f"    🧘 Overall Calmness/Anxiety: {overall_calmness_anxiety} ({overall_calmness_confidence:.0f}%)")
            print(f"    🎯 Overall Focus/Fatigue:    {overall_focus_fatigue} ({overall_focus_confidence:.0f}%)")
            print(f"    🏆 OVERALL FINAL MOOD:      {overall_final_mood}")
            print(f"    📊 Avg Alpha/Beta: {avg_alpha_beta:.3f}, Avg Theta/Beta: {avg_theta_beta:.3f}")
    
    print("-" * 50)

def check_and_upload_data():
    """Check if it's time to upload data and do so if needed"""
    global last_upload_time
    
    current_time = time.time()
    
    # Check if it's time to upload data
    if current_time - last_upload_time >= upload_interval:
        print(f"\n📡 Uploading EEG data at {datetime.now().strftime('%H:%M:%S')}")
        
        # Calculate and display alpha/beta ratios in terminal
        calculate_and_display_minute_analysis()
        
        # Get comprehensive EEG data for upload (includes frequency analysis)
        eeg_data = get_comprehensive_eeg_data()
        
        if eeg_data:
            # Upload EEG data to biometrics collection
            doc_id = upload_eeg_data(eeg_data)
            if doc_id:
                print(f"✅ Successfully uploaded EEG data (ID: {doc_id})")
            else:
                print("❌ Failed to upload EEG data")
            
            # Upload mood data to separate mood collection
            if eeg_data.get('frequencyAnalysis') and eeg_data['frequencyAnalysis'].get('hasAnalysis'):
                # Calculate overall mood for separate upload
                band_analysis = None
                if len(recorded_data[0]) >= fs * 60:
                    minute_samples = fs * 60
                    minute_data = []
                    for ch in range(n_channels):
                        if len(recorded_data[ch]) >= minute_samples:
                            minute_data.append(recorded_data[ch][-minute_samples:])
                        else:
                            minute_data = None
                            break
                    
                    if minute_data:
                        band_analysis = process_eeg_data_batch(minute_data)
                
                if band_analysis:
                    overall_mood = calculate_overall_mood(band_analysis)
                    if overall_mood:
                        mood_doc_id = upload_mood_data(overall_mood)
                        if mood_doc_id:
                            print(f"✅ Successfully uploaded mood data (ID: {mood_doc_id})")
                        else:
                            print("❌ Failed to upload mood data")
        else:
            print("⚠️  No EEG data available for upload")
        
        last_upload_time = current_time
        print("📡 Upload complete\n")

def preprocess_eeg(eeg_data, fs=250):
    """Preprocess EEG data with bandpass filtering"""
    # Bandpass filter 0.5-45 Hz
    b, a = signal.butter(4, [0.5, 45], btype='band', fs=fs)
    filtered = signal.filtfilt(b, a, eeg_data)
    
    return filtered

def compute_band_power(signal_data, fs, band_range):
    """Compute power in a specific frequency band using Welch's method"""
    f, psd = signal.welch(signal_data, fs, nperseg=min(256, len(signal_data)))
    band_mask = (f >= band_range[0]) & (f <= band_range[1])
    band_power = np.trapz(psd[band_mask], f[band_mask])
    return band_power

def process_eeg_data_batch(data_segment):
    """Process a segment of EEG data and compute frequency band powers"""
    if len(data_segment[0]) < analysis_window_samples:
        return None  # Not enough data for analysis
    
    # Convert to numpy arrays and convert from microVolts to Volts
    eeg_data = np.array(data_segment) # Convert μV to V
    
    # Compute band powers for each channel
    band_powers = {}
    for channel_idx in range(n_channels):
        # Preprocess the channel data
        channel_data = preprocess_eeg(eeg_data[channel_idx], fs)
        channel_powers = {}
        
        for band_name, band_range in BANDS.items():
            power = compute_band_power(channel_data, fs, band_range)
            channel_powers[band_name] = power
        
        band_powers[f'channel_{channel_idx}'] = channel_powers
    
    return band_powers

def analyze_recorded_data():
    """Analyze all recorded data in chunks"""
    total_samples = len(recorded_data[0])
    if total_samples < analysis_window_samples:
        print(f"Not enough data for analysis. Have {total_samples} samples, need {analysis_window_samples}")
        return
    
    print(f"Analyzing {total_samples} samples ({total_samples/fs:.1f} seconds) of EEG data...")
    print("=" * 60)
    
    # Process data in chunks
    chunk_count = 0
    for start_idx in range(0, total_samples - analysis_window_samples + 1, analysis_window_samples):
        chunk_count += 1
        end_idx = start_idx + analysis_window_samples
        
        # Extract chunk for all channels
        chunk_data = [recorded_data[ch][start_idx:end_idx] for ch in range(n_channels)]
        
        # Process this chunk
        band_powers = process_eeg_data_batch(chunk_data)
        if band_powers is not None:
            print(f"Chunk {chunk_count} (t={start_idx/fs:.1f}s - {end_idx/fs:.1f}s):")
            for channel_name, powers in band_powers.items():
                # Calculate alpha/beta ratio
                alpha_beta_ratio = powers['alpha'] / powers['beta'] if powers['beta'] > 0 else 0
                print(f"  {channel_name}:")
                print(f"    Alpha (4-12 Hz):  {powers['alpha']:.4f}")
                print(f"    Beta (13-30 Hz):  {powers['beta']:.4f}")
                print(f"    Alpha/Beta Ratio: {alpha_beta_ratio:.3f}")
                print()
    
    print("Analysis complete!")

def sensor_found(scanner, sensors):
    for index in range(len(sensors)):
        print('Sensor found: %s' % sensors[index])

def on_sensor_state_changed(sensor, state):
    print('Sensor {0} is {1}'.format(sensor.name, state))

def on_battery_changed(sensor, battery):
    print('Battery: {0}'.format(battery))

def on_signal_received(sensor, data):
    timestamp = datetime.now()
    
    for packet in data:
        # Extract EEG samples for the 4 channels and store them
        if len(packet.Samples) >= 4:
            for channel_idx in range(n_channels):
                recorded_data[channel_idx].append(packet.Samples[channel_idx])
        
        # Progress indicator every 10 seconds
        if packet.PackNum % (fs * 10) == 0:  # Every 10 seconds
            total_samples = len(recorded_data[0])
            duration_sec = total_samples / fs
            print(f"📊 Recording... PackNum: {packet.PackNum}, Duration: {duration_sec:.1f}s, Samples collected: {total_samples}")
        
        # Check for upload opportunity (non-blocking)
        check_and_upload_data()

def on_mems_received(sensor, data):
    print(data)

def on_fpg_received(sensor, data):
    print(data)

def on_amp_received(sensor, data):
    print(data)

def main():
    """Main integrated EEG recording and upload system"""
    print("🧠 Integrated EEG Recording & Upload System")
    print("=" * 50)
    print("Features:")
    print("1. 🔗 Connect to BrainBit EEG device")
    print("2. 📊 Record continuous EEG data")
    print("3. 📡 Auto-upload latest samples to Firebase every minute")
    print("4. 📈 Post-recording frequency analysis")
    print("=" * 50)
    
    # Initialize Firebase
    initialize_firebase()
    
    try:
        scanner = Scanner([SensorFamily.LEBrainBit2, SensorFamily.LEBrainBitPro, SensorFamily.LEBrainBitFlex])

        scanner.sensorsChanged = sensor_found
        scanner.start()
        print("🔍 Starting sensor search for 5 seconds...")
        sleep(5)
        scanner.stop()

        sensorsInfo = scanner.sensors()
        for i in range(len(sensorsInfo)):
            current_sensor_info = sensorsInfo[i]
            print(sensorsInfo[i])

            sensor = scanner.create_sensor(sensorsInfo[i])

            sensor.sensorStateChanged = on_sensor_state_changed
            sensor.batteryChanged = on_battery_changed

            sensFamily = sensor.sens_family

            sensorState = sensor.state
            if sensorState == SensorState.StateInRange:
                print("✅ Connected to BrainBit device")
            else:
                print("❌ Device disconnected")

            print(sensFamily)
            print(sensor.features)
            print(sensor.commands)
            print(sensor.parameters)
            print(sensor.supported_channels)
            print(sensor.name)
            print(sensor.state)
            print(sensor.address)
            print(sensor.serial_number)
            print(sensor.batt_power)
            if sensor.is_supported_parameter(SensorParameter.SamplingFrequency):
                print(sensor.sampling_frequency)
            if sensor.is_supported_parameter(SensorParameter.Offset):
                print(sensor.data_offset)
            print(sensor.version)

            ch_count = sensor.channels_count

            amp_param = sensor.amplifier_param
            amp_param.ChGain = [SensorGain.Gain3 for i in range(ch_count)]
            amp_param.ChSignalMode = [BrainBit2ChannelMode.ChModeNormal for i in range(ch_count)]
            amp_param.ChResistUse = [True for i in range(ch_count)]
            amp_param.Current = GenCurrent.GenCurr6nA
            sensor.amplifier_param = amp_param

            sensor.sensorAmpModeChanged = on_amp_received

            if sensor.is_supported_feature(SensorFeature.Signal):
                sensor.signalDataReceived = on_signal_received

            if sensor.is_supported_command(SensorCommand.StartSignal):
                sensor.exec_command(SensorCommand.StartSignal)
                print("🚀 Start signal - Recording EEG data with auto-upload...")
                print("📡 Firebase uploads every 60 seconds")
                print("⏹️  Press Ctrl+C to stop recording and analyze data")
                
                try:
                    # Keep recording indefinitely until interrupted
                    while True:
                        sleep(1)
                except KeyboardInterrupt:
                    print("\n⏹️  Recording stopped by user")
                    
                    # Stop the signal
                    if sensor.is_supported_command(SensorCommand.StopSignal):
                        sensor.exec_command(SensorCommand.StopSignal)
                        print("🛑 Signal stopped")
                    
                    # Analyze the recorded data
                    analyze_recorded_data()
                    
    except Exception as err:
        print(f"❌ Error: {err}")

if __name__ == "__main__":
    main()
