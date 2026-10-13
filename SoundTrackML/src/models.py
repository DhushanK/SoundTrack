import torch
import torch.nn as nn

# =====================================================================
# Model 1: Custom Factorized Architecture (Temporal -> Spatial -> GAP)
# =====================================================================
class FactorizedEEGNet(nn.Module):
    def __init__(self, in_channels=14, num_classes=2):
        super().__init__()
        
        # 1. Per-channel temporal FIR filterbank (~0.5s filter at 128 Hz)
        self.temporal_filterbank = nn.Sequential(
            nn.Conv1d(
                in_channels=in_channels,
                out_channels=in_channels * 4,
                kernel_size=65,
                padding=32,
                groups=in_channels,
                bias=False
            ),
            nn.BatchNorm1d(in_channels * 4),
            nn.ELU(),
            nn.AvgPool1d(kernel_size=4, stride=4),  # 512 -> 128
            nn.Dropout(0.3)
        )
        
        # 2. Cross-channel spatial projection (learns cross-electrode contrast)
        self.spatial_mixer = nn.Sequential(
            nn.Conv1d(in_channels * 4, 32, kernel_size=1, bias=False),
            nn.BatchNorm1d(32),
            nn.ELU(),
            nn.Dropout(0.3)
        )
        
        # 3. Temporal feature refinement
        self.residual_conv = nn.Sequential(
            nn.Conv1d(32, 64, kernel_size=15, padding=7, bias=False),
            nn.BatchNorm1d(64),
            nn.ELU(),
            nn.AvgPool1d(kernel_size=4, stride=4),  # 128 -> 32
            nn.Dropout(0.4)
        )
        
        # 4. Global Average Pooling replaces flattened dense layers
        self.global_pool = nn.AdaptiveAvgPool1d(1)
        self.classifier = nn.Sequential(
            nn.Flatten(),
            nn.Linear(64, num_classes)
        )

    def forward(self, x):
        # Expects (Batch, Channels, Samples)
        x = self.temporal_filterbank(x)
        x = self.spatial_mixer(x)
        x = self.residual_conv(x)
        x = self.global_pool(x)
        return self.classifier(x)


# =====================================================================
# Model 2: Standard EEGNet (Lawhern et al., 2018 / EEGNet-8,2)
# =====================================================================
class Conv2dWithConstraint(nn.Conv2d):
    def __init__(self, *args, max_norm_val=1.0, **kwargs):
        super().__init__(*args, **kwargs)
        self.max_norm_val = max_norm_val

    def forward(self, x):
        if self.max_norm_val is not None:
            with torch.no_grad():
                self.weight.data = torch.renorm(self.weight.data, p=2, dim=0, maxnorm=self.max_norm_val)
        return super().forward(x)

class LinearWithConstraint(nn.Linear):
    def __init__(self, *args, max_norm_val=0.25, **kwargs):
        super().__init__(*args, **kwargs)
        self.max_norm_val = max_norm_val

    def forward(self, x):
        if self.max_norm_val is not None:
            with torch.no_grad():
                self.weight.data = torch.renorm(self.weight.data, p=2, dim=0, maxnorm=self.max_norm_val)
        return super().forward(x)

class StandardEEGNet(nn.Module):
    def __init__(self, num_classes=2, channels=14, samples=512, 
                 F1=8, D=2, F2=16, kernel_length=64, dropout_rate=0.5):
        super().__init__()
        
        # Block 1: Temporal Conv -> Spatial Depthwise Conv
        self.block1 = nn.Sequential(
            nn.Conv2d(1, F1, (1, kernel_length), padding=(0, kernel_length // 2), bias=False),
            nn.BatchNorm2d(F1),
            Conv2dWithConstraint(F1, F1 * D, (channels, 1), groups=F1, bias=False, max_norm_val=1.0),
            nn.BatchNorm2d(F1 * D),
            nn.ELU(),
            nn.AvgPool2d((1, 4)),
            nn.Dropout(dropout_rate)
        )
        
        # Block 2: Separable Conv (Depthwise temporal + Pointwise 1x1)
        self.block2 = nn.Sequential(
            nn.Conv2d(F1 * D, F1 * D, (1, 16), padding=(0, 8), groups=F1 * D, bias=False),
            nn.Conv2d(F1 * D, F2, (1, 1), bias=False),
            nn.BatchNorm2d(F2),
            nn.ELU(),
            nn.AvgPool2d((1, 8)),
            nn.Dropout(dropout_rate)
        )
        
        flatten_dim = F2 * 1 * (samples // 32)
        self.classifier = nn.Sequential(
            nn.Flatten(),
            LinearWithConstraint(flatten_dim, num_classes, max_norm_val=0.25)
        )

    def forward(self, x):
        # Accepts (Batch, Channels, Samples) -> converts to (Batch, 1, Channels, Samples)
        if x.dim() == 3:
            x = x.unsqueeze(1)
        x = self.block1(x)
        x = self.block2(x)
        return self.classifier(x)
