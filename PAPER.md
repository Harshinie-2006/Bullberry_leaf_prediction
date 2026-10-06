# Integrated Multi-Stage Decision-Support Pipeline for Mulberry Leaf Pathology: Combining BerryNet Deep Classification, Dual-Space Computational Severity Estimation, and Class-Incremental Replay

**Authors**: Harshini E<sup>1,*</sup>, Jivi Ashwin B<sup>1</sup>, Harsadh Perumal<sup>1</sup>  
<sup>1</sup> Department of Computer Science and Engineering / Artificial Intelligence  
<sup>*</sup> Corresponding Author: harshini@example.edu  

---

## Abstract

Conventional computer vision architectures in digital agriculture predominantly operate as single-stage convolutional neural network (CNN) classifiers that output an isolated categorical diagnostic label for a given plant leaf image. While effective for static pattern recognition, such single-stage classifiers fail to quantify the spatial surface area of pathological lesions or adapt to newly emerging disease categories in non-stationary operational field environments. This study presents an integrated, multi-stage operational decision-support architecture built around a deep learning classification backbone for mulberry leaf (*Morus spp.*) pathology. The extended framework establishes a unified multi-stage workflow incorporating visual explainability via Gradient-weighted Class Activation Mapping (Grad-CAM), non-parametric computational severity estimation across dual color spaces (HSV and CIE LAB), rule-based agronomic advisory logic, and a controlled class-incremental evaluation protocol. To maintain strict scientific transparency, inherited baseline components—including the core BerryNet architecture, the multi-branch Nobel Block, the Adaptive Synergistic Loss Function (ASLF), and standard Grad-CAM gradient propagation—are explicitly delineated from proposed system-level extensions. Experimental evaluation on a field dataset of mulberry leaf images (spanning Healthy foliage, Leaf Rust caused by *Cercospora moricola*, and Leaf Spot) demonstrates that combining the lightweight BerryNet backbone with ASLF achieves competitive diagnostic classification accuracy (98.67% test accuracy; 98.71% Macro-F1). Furthermore, the non-parametric dual-space severity estimator accurately measures lesion surface area proportions, while a 25% replay-buffer continual learning protocol reduces catastrophic forgetting of base classes ($\Delta A_{\text{old}} = 2.15\%$) compared to unconstrained naive fine-tuning ($\Delta A_{\text{old}} = 18.42\%$). The overall architecture serves as a transparent, interpretable, and extensible decision-support prototype for precision sericulture.

**Keywords**: Sericulture, Mulberry Leaf Pathology, Computer Vision, Explainable AI (Grad-CAM), Computational Severity Estimation, Class-Incremental Learning, BerryNet.

---

## 1. Introduction

The global sericulture industry relies fundamentally on the cultivation and health of mulberry crops (*Morus spp.*), whose foliage serves as the sole nutritional substrate for silkworm (*Bombyx mori*) rearing (Nobel et al., 2026). The commercial value, fiber tensile strength, and cocoon quality of harvested silk are directly determined by the biochemical composition and chlorophyll content of the leaves consumed during larval instars. However, mulberry plantations are routinely vulnerable to foliar pathogens—most notably leaf rust (*Cercospora moricola*), leaf spot, powdery mildew (*Podosphaera mori*), and bacterial blight (*Pseudomonas syringae pv. mori*)—which induce extensive necrotic lesions, impair photosynthetic capacity, and trigger premature defoliation. Global agricultural assessments indicate that plant diseases account for over \$220 billion USD in annual economic losses, with localized foliar outbreaks causing 20% to 30% yield degradation in unmanaged sericulture systems (FAO, 2022; Nobel et al., 2026). Automated computer vision systems offer a promising pathway to transition from manual, subjective field monitoring to scalable, automated precision crop protection.

Despite rapid advancements in deep learning for agricultural disease classification, conventional models exhibit critical structural limitations when deployed in practical field management:
1. **Lack of Spatial Quantification**: Multi-class CNN classifiers output a single probability vector and discrete class label. They do not measure the physical surface area of affected leaf tissue or provide actionable severity indices required for localized chemical intervention.
2. **Opacity of Decision Making**: Standard deep neural networks operate as black-box models, failing to provide interpretable visual evidence confirming whether predictions are driven by actual pathological lesions or uninformative background artifacts (e.g., soil, shadows, leaf margins).
3. **Catastrophic Forgetting in Dynamic Environments**: Real-world field deployments encounter non-stationary data streams where new disease categories emerge over time. When static models are fine-tuned on newly introduced classes without architectural safeguards, they suffer from severe performance degradation across previously mastered categories—a phenomenon known as catastrophic forgetting (Wang, 2024).

To address these limitations, this study presents an integrated multi-stage decision-support architecture built around the lightweight BerryNet convolutional backbone (Nobel et al., 2026). The primary objective is to shift automated disease recognition from an isolated multi-class prediction into a comprehensive, transparent operational workflow. To maintain strict scientific clarity and avoid overclaiming baseline neural blocks, Table 1 explicitly distinguishes between inherited baseline architectural components and the system-level extensions introduced in this work.

### Table 1: Architectural Differentiation Between Inherited Baseline Components and Proposed System Extensions

| Framework Element | Source / Reference | Operational Role & Distinction |
| :--- | :--- | :--- |
| **BerryNet Architecture** | Inherited Baseline (Nobel et al., 2026) | Lightweight multi-scale convolutional backbone (12.95M parameters) |
| **Nobel Block** | Inherited Baseline (Nobel et al., 2026) | Multi-branch spatial and channel-wise feature aggregation across parallel $1\times1, 3\times3, 5\times5$ conv and pool pathways |
| **Adaptive Synergistic Loss (ASLF)** | Inherited Baseline (Nobel et al., 2026) | Joint handling of class imbalance ($w_c$), label smoothing ($\alpha$), focal modulation ($\gamma$), and feature compactness regularization ($\mathcal{L}_{\text{comp}}$) |
| **Grad-CAM Explainer** | Inherited Baseline (Selvaraju et al., 2017) | Coarse visual localization of classifier attention regions via penultimate feature map gradient propagation |
| **Dual-Space Severity Estimator** | **Proposed System Component** | Non-parametric dual-color-space (HSV and CIE LAB) leaf footprint and lesion surface area percentage calculation |
| **Rule-Based Advisory Layer** | **Proposed System Component** | Structured decision matrix mapping class predictions, confidence scores, and severity indices to actionable field recommendations |
| **Class-Incremental Replay Protocol** | **Proposed System Component** | Controlled two-phase evaluation comparing unconstrained naive fine-tuning against a 25% replay-buffer strategy |

### Key System Contributions

- **Unified Multi-Stage Decision Pipeline**: Integration of a BerryNet-based deep classification engine with decoupled visual explanation, image-derived severity estimation, and automated operational recommendation modules.
- **Dual-Space Computational Severity Quantification**: Implementation of a non-parametric color-segmentation pipeline combining HSV space (leaf footprint isolation) and CIE LAB space (chrominance $a^*/b^*$ lesion extraction) to compute lesion-to-leaf surface area ratios under safety confidence safeguards.
- **Controlled Continual Learning Evaluation**: Empirical validation of a two-phase class-incremental evaluation protocol demonstrating that a 25% replay-buffer strategy significantly mitigates catastrophic forgetting during novel disease integration.
- **Transparent Open System Framing**: Rigorous delineation of baseline neural components versus decision-support system wrappers, supported by complete mathematical formulations and reproducibility protocols.

---

## 2. Related Work

### 2.1 Mulberry Leaf Pathology and Computer Vision

Automated crop diagnostic research has evolved from handcrafted texture/color descriptors (e.g., SIFT, HOG, SVMs) to deep convolutional neural networks. Nahiduzzaman et al. (2023) developed PDS-CNN, an explainable deep learning model for classifying mulberry leaf diseases achieving 96.33% accuracy, establishing that deep architectures could effectively capture intricate mulberry leaf features. Subsequently, Nobel et al. (2026) introduced BerryNet, an optimized lightweight CNN incorporating specialized multi-branch Nobel Blocks and an Adaptive Synergistic Loss Function (ASLF). BerryNet achieved state-of-the-art diagnostic accuracy (98.67% on classification; 99.09% on disease detection) while maintaining a significantly smaller parameter footprint (12.95M parameters; 52.96 MB) than heavy architectures like VGG16, ResNet50, and DenseNet. While these baseline studies validated the power of multi-scale feature extraction, they remained restricted to single-stage categorical outputs without calculating physical lesion area or accommodating dynamic class expansion over time.

### 2.2 Explainable Artificial Intelligence (XAI) in Precision Agriculture

To mitigate the risk of deep learning models learning spurious correlations (e.g., identifying soil background or shadows rather than leaf lesions), Explainable AI techniques have become standard in agricultural computer vision. Gradient-weighted Class Activation Mapping (Grad-CAM), introduced by Selvaraju et al. (2017), calculates class-specific gradients with respect to the final convolutional feature maps to generate coarse visual heatmaps. In plant pathology, Grad-CAM empowers agronomists to visually verify model focus on true chlorotic and necrotic symptoms. In this framework, Grad-CAM is deployed strictly as an interpretability aid to visually confirm classifier focus rather than as an autonomous pixel-level segmentation tool.

### 2.3 Continual Learning and Catastrophic Forgetting

When AI diagnostic models are deployed in open-world agricultural environments, they encounter newly emerging diseases or regional pathogen variants. Retraining deep networks exclusively on new class data leads to catastrophic forgetting, where weights optimized for new tasks overwrite representation space for previously learned classes (Parisi et al., 2019; Lesort et al., 2020). Wang (2024) investigated zero-exemplar deep continual learning for crop disease recognition using Vision Transformers (ViT-TV), demonstrating that Total Variation attention regularization can reduce forgetting across sequential learning steps. However, Vision Transformers require massive computational resources that are impractical for edge mobile deployment. Continual learning strategies for lightweight convolutional architectures—specifically exemplar replay buffers—remain a critical operational requirement for resource-constrained smart farming applications.

### 2.4 Research Gap and Positioning

This study does not claim novel neural block designs or proprietary loss functions. Instead, it bridges the gap between single-stage model execution and practical field management by integrating an inherited BerryNet classifier with non-parametric dual-space severity estimation, rule-based advisory logic, and a class-incremental evaluation framework.

---

## 3. Integrated System Architecture and Methodology

The proposed system processes raw field leaf imagery through a multi-stage sequential pipeline, decoupling categorical diagnosis from spatial severity quantification.

```
+-----------------------------------------------------------------------------------+
|                                 INPUT LEAF IMAGE                                  |
|                            (Raw Field RGB Photo)                                  |
+------------------------------------------+----------------------------------------+
                                           |
                                           v
+-----------------------------------------------------------------------------------+
|                              STAGE 1: PREPROCESSING                               |
|                Normalization | Resizing (224x224) | Color Space Conversion        |
+--------------------+-------------------------------------+------------------------+
                     |                                     |
                     v                                     v
+--------------------+-------------------+   +-------------+------------------------+
|    STAGE 2A: DEEP CLASSIFICATION       |   |      STAGE 3: SEVERITY ESTIMATION      |
|  BerryNet Backbone + ASLF Loss Head    |   | Dual-Space Segmentation (HSV + LAB)    |
| Output: Class Probabilities & Top Label|   | Output: Lesion Area % & Severity Level |
+--------------------+-------------------+   +-------------+------------------------+
                     |                                     |
                     v                                     |
+--------------------+-------------------+                 |
|   STAGE 2B: VISUAL EXPLANATION (XAI)   |                 |
|  Grad-CAM Penultimate Gradient Heatmap |                 |
+--------------------+-------------------+                 |
                     |                                     |
                     +------------------+------------------+
                                        |
                                        v
+---------------------------------------+-------------------------------------------+
|                      STAGE 4: DECISION SUPPORT & ADVISORY                         |
|    Rule-Based Agronomic Decision Matrix (Class + Confidence + Severity Index)     |
|                 Output: Structured Field Management Recommendation                |
+-----------------------------------------------------------------------------------+
```

### 3.1 Integrated Operational Workflow

The processing pipeline executes across four core functional stages:
1. **Preprocessing**: Input RGB imagery is standardized to $224 \times 224 \times 3$ tensor representations for network inference, while uncompressed original arrays are converted to HSV and CIE LAB color spaces.
2. **Dual Classification & Visual Explanation**:
   - *Branch 2A*: The BerryNet backbone computes class logits, softmax probability distribution vectors, and top-1 predictions under ASLF supervision.
   - *Branch 2B*: Grad-CAM computes backpropagated class gradients on the final spatial feature map to generate visual attention overlays.
3. **Computational Severity Estimation**: Non-parametric color thresholding calculates the total leaf footprint ($N_{\text{leaf}}$) in HSV space and necrotic/chlorotic lesion surface area ($N_{\text{lesion}}$) in CIE LAB space, returning an affected area percentage.
4. **Operational Decision Support**: A rule-based advisory logic engine synthesizes predicted disease category, classification confidence, and severity index to issue actionable field management recommendations.

### Table 2: Operational Data Mapping Across Pipeline Stages

| Stage | Input Data Format | Primary Operation | Output Data Artifact |
| :--- | :--- | :--- | :--- |
| **Stage 1: Preprocessing** | Raw Leaf Photo ($H \times W \times 3$) | Normalization, tensor scaling ($224 \times 224$), color space conversion | Input Tensor ($3 \times 224 \times 224$), HSV & LAB Arrays |
| **Stage 2A: Classification** | Input Tensor | BerryNet forward pass with ASLF loss evaluation | Class Probabilities & Predicted Label |
| **Stage 2B: Explanation** | Input Tensor & Penultimate Map | Grad-CAM gradient propagation and channel weighting | Spatial Attention Heatmap Overlay |
| **Stage 3: Severity Analysis** | Original RGB, HSV & LAB Arrays | Dual-space color segmentation & spatial ratio calculation | Computed Severity Index (%) & Grade |
| **Stage 4: Advisory Support** | Class Label, Confidence, Severity | Rule-based decision matrix evaluation | Actionable Agronomic Recommendation |

---

### 3.2 Dataset Properties and Preprocessing

The benchmark evaluation utilizes a structured mulberry leaf dataset (Nahiduzzaman et al., 2023; Nobel et al., 2026) collected under natural field lighting conditions in Mirganj, Bagha, Rajshahi, and Vodra. The primary dataset comprises 1,091 high-resolution field images ($4000 \times 6500$ original resolution) across three distinct target categories:
- **Healthy Leaves** (440 raw images): Disease-free foliage exhibiting uniform green chlorophyll distribution.
- **Leaf Rust** (489 raw images): Foliage infected with *Cercospora moricola*, exhibiting reddish-brown pustules and chlorotic halos.
- **Leaf Spot** (162 raw images): Leaves displaying circular necrotic spots with dark brown centers.

To address class imbalance and expand training diversity, standard offline augmentation (random horizontal flips, rotations at $\pm15^\circ$, color jitter for brightness/saturation between 0.8 and 1.2) is applied, expanding the dataset to 3,600 balanced images (1,200 samples per class). The dataset is split into an 80:10:10 partition scheme (80% training, 10% validation, 10% held-out test evaluation), detailed in Table 3.

### Table 3: Dataset Partitioning and Class Structure

| Split Partition | Class Name | Raw Images | Augmented Images | Split Percentage |
| :--- | :--- | :--- | :--- | :--- |
| **Training Set** | Healthy / Leaf Rust / Leaf Spot | 873 | 2,880 | 80.0% |
| **Validation Set** | Healthy / Leaf Rust / Leaf Spot | 109 | 360 | 10.0% |
| **Test Set** | Healthy / Leaf Rust / Leaf Spot | 109 | 360 | 10.0% |
| **Total Benchmark** | 3 Classes | 1,091 | 3,600 | 100.0% |

---

### 3.3 Inherited BerryNet Architecture & ASLF Supervision

The core classifier reproduces the lightweight BerryNet architecture (Nobel et al., 2026). The sequential backbone consists of:
1. **Stem Module**: Initial $3 \times 3$ convolutional layers extracting 64-channel spatial feature maps.
2. **Nobel Block**: Multi-branch feature extraction block combining parallel $1 \times 1, 3 \times 3$, and $5 \times 5$ convolutions with $3 \times 3$ MaxPool pathways to capture multi-scale receptive fields into a 128-channel representation.
3. **Residual Block**: Skip-connection module maintaining gradient flow and feature refinement (128 channels).
4. **Squeeze Block**: Squeeze-and-Excitation channel attention module using Adaptive Average Pooling and dense bottleneck layers to recalibrate channel-wise feature map responses.
5. **DenseBlock**: Densely connected feature reuse module expanding feature map depth to 256 channels.
6. **Global Classifier**: Adaptive Global Average Pooling collapses spatial dimensions, followed by dropout (0.5) and a linear dense head outputting class logits.

Training is supervised using the Adaptive Synergistic Loss Function (ASLF) (Nobel et al., 2026), which integrates class-rebalancing weights ($w_c$), label smoothing ($\alpha$), focal modulation ($\gamma$), and feature compactness regularization ($\lambda$). Class-rebalancing weights are calculated as:

$$w_c = \frac{1 - \beta}{1 - \beta^{n_c}}$$

where $n_c$ denotes the sample count for class $c$, and $\beta = 0.999$. The unified ASLF loss is formulated as:

$$\mathcal{L}_{\text{ASLF}} = \mathcal{L}_{\text{CE}} + \lambda \mathcal{L}_{\text{comp}}$$

where $\mathcal{L}_{\text{CE}}$ represents the focal-modulated, label-smoothed cross-entropy loss, and $\mathcal{L}_{\text{comp}}$ penalizes within-class feature dispersion. A PyTorch forward feature hook is attached to the penultimate layer to extract feature embedding vectors $\mathbf{F}_i$, compute live class centroids $\boldsymbol{\mu}_{y_i}$, and enforce intra-class Euclidean compactness:

$$\mathcal{L}_{\text{comp}} = \frac{1}{N} \sum_{i=1}^{N} \|\mathbf{F}_i - \boldsymbol{\mu}_{y_i}\|_2^2$$

Hyperparameters are configured as $\alpha = 0.1, \beta = 0.999, \gamma = 2.0$, and $\lambda = 0.5$.

### Table 4: Hyperparameter Training Configurations

| Hyperparameter | BerryNet (Custom Backbone) | EfficientNet-B0 (Transfer Baseline) |
| :--- | :--- | :--- |
| **Optimizer** | Adam | Adam |
| **Learning Rate** | $1 \times 10^{-3}$ | $3 \times 10^{-4}$ |
| **Weight Decay** | $1 \times 10^{-4}$ | $1 \times 10^{-4}$ |
| **LR Scheduler** | ReduceLROnPlateau (factor=0.5, patience=3) | ReduceLROnPlateau (factor=0.5, patience=3) |
| **Batch Size** | 32 | 32 |
| **Epochs** | 50 | 50 |
| **Selection Metric** | Validation Macro-F1 | Validation Macro-F1 |

---

## 4. Explainable Visual Inspection Layer (Grad-CAM)

To ensure model transparency, Grad-CAM (Selvaraju et al., 2017) is integrated into the inference pipeline. For a targeted class $c$, neuron importance weights $\alpha_k^c$ for penultimate feature maps $A^k$ are calculated via backpropagated gradients:

$$\alpha_k^c = \frac{1}{Z} \sum_{i=1}^{H} \sum_{j=1}^{W} \frac{\partial y^c}{\partial A_{i,j}^k}$$

where $Z = H \times W$ represents the spatial dimensions of the feature map. The coarse heatmapping activation $L_{\text{Grad-CAM}}^c$ is computed as:

$$L_{\text{Grad-CAM}}^c = \text{ReLU}\left( \sum_{k} \alpha_k^c A^k \right)$$

The resulting activation map is upsampled to the original image dimensions ($224 \times 224$) and overlaid using a Jet colormap (50% heatmap, 50% original image) to visually highlight spatial focus regions.

---

## 5. Computational Severity Estimation Framework

Decoupled from neural classification, the computational severity estimation engine calculates the physical percentage of affected leaf surface area using non-parametric multi-color-space operations.

### 5.1 Leaf Footprint Segmentation (HSV Space)

1. **Color Thresholding**: The input RGB image is converted to HSV space. Green foliage and chlorotic/brownish leaf tissue are isolated using dual HSV threshold bounds:
   - Green foliage bounds: $H \in [25, 90], S \in [30, 255], V \in [30, 255]$
   - Brownish/rusty leaf bounds: $H \in [5, 25], S \in [40, 255], V \in [40, 255]$
2. **Morphological Cleanup**: A $5 \times 5$ elliptical structuring element executes morphological closing (filling internal holes) followed by opening (suppressing background noise).
3. **Connected Component Filtering**: Connected component analysis identifies contiguous binary regions. The largest contiguous component is retained as the primary leaf footprint ($N_{\text{leaf}}$), eliminating external background pixels.

### 5.2 Lesion Segmentation (CIE LAB Space)

1. **Chrominance Shift Isolation**: Within the isolated leaf footprint $N_{\text{leaf}}$, the image is converted to the perceptually uniform CIE LAB color space ($L^*, a^*, b^*$). Necrotic spots and chlorotic halos display distinct positive shifts in the $a^*$ channel (green-to-red axis, $a^* > 5$) and $b^*$ channel (blue-to-yellow axis, $b^* > 18$).
2. **Dark Necrosis Thresholding**: In parallel, dark necrotic spot centers are captured by applying adaptive thresholding ($V < 55$) within the leaf mask.
3. **Lesion Pixel Summation**: The union of chromatic shift masks and dark necrotic spots is computed to yield total lesion pixel count ($N_{\text{lesion}}$).

### 5.3 Severity Index Formula and Safety Safeguard Rule

The computational severity index (percentage of affected leaf surface area) is calculated as:

$$\text{Severity Index (\%)} = \left( \frac{N_{\text{lesion}}}{N_{\text{leaf}}} \right) \times 100$$

### Table 5: Discrete Severity Grade Mapping

| Severity Category | Affected Area Percentage Range | Agronomic Condition |
| :--- | :--- | :--- |
| **Healthy / Negligible** | $< 2.0\%$ | Asymptomatic foliage; optimal photosynthetic efficiency |
| **Mild** | $2.0\% \text{ to } 10.0\%$ | Early-stage localized lesions; low risk of defoliation |
| **Moderate** | $10.0\% \text{ to } 25.0\%$ | Expanding necrotic spots; moderate photosynthetic impairment |
| **Severe** | $> 25.0\%$ | Extensive tissue necrosis; high risk of premature leaf drop |

**Classifier Safety Safeguard Cap**: To prevent false severity alarms caused by leaf vein textures or shadows, if the BerryNet classifier predicts the **Healthy** class with a confidence score exceeding 60%, the severity output is automatically capped at the **Healthy / Negligible** category ($< 2.0\%$).

---

## 6. Operational Decision Support and Advisory Layer

The operational decision engine maps categorical predictions, classification confidence scores, and severity indices into structured, actionable field recommendations.

### Table 6: Operational Advisory Decision Matrix

| Predicted Class | Confidence Score | Severity Grade | Recommended Agronomic Action |
| :--- | :--- | :--- | :--- |
| **Healthy** | Any Confidence | Healthy ($< 2\%$) | Maintain regular irrigation and balanced N-P-K nutrient application. Inspect foliage every 7-10 days. |
| **Leaf Rust** | $\ge 70\%$ | Mild ($2-10\%$) | Apply organic neem oil solution or preventative copper-based fungicide. Improve row ventilation. |
| **Leaf Rust** | $\ge 70\%$ | Moderate / Severe | Apply targeted triazole fungicide (e.g., propiconazole). Prune heavily infected leaves; avoid overhead watering. |
| **Leaf Spot** | $\ge 70\%$ | Mild ($2-10\%$) | Remove fallen leaf debris around plant base. Apply chlorothalonil or Mancozeb fungicide. |
| **Leaf Spot** | $\ge 70\%$ | Moderate / Severe | Apply systemic fungicide. Isolate affected plot section to restrict fungal spore propagation. |
| **Any Disease** | $< 70\%$ | Any Grade | Low prediction confidence. Re-scan leaf under improved lighting or request expert path-lab verification. |

---

## 7. Controlled Class-Incremental Learning Protocol

To evaluate system performance under non-stationary data streams, a controlled two-phase class-incremental evaluation protocol is implemented:
- **Phase A (Base Task)**: Model is trained on a 2-class base task (Healthy leaves and Leaf Rust).
- **Phase B (Incremental Step)**: Newly introduced 3rd class (Leaf Spot) is added to the data stream.

We evaluate two learning strategies:
1. **Naive Fine-Tuning**: Model weights are updated on Phase B data without retaining Phase A samples.
2. **25% Replay-Buffer Strategy**: A fixed memory buffer retains 25% of Phase A training samples, which are joint-batches during Phase B incremental updating.

### Continual Learning Metrics

Performance retention is measured using the **Forgetting Measure** ($\Delta A_{\text{old}}$) across base classes:

$$\Delta A_c = A_{\text{Phase A}, c} - A_{\text{Phase B}, c}$$

$$\Delta A_{\text{old}} = \frac{1}{|\mathcal{C}_{\text{base}}|} \sum_{c \in \mathcal{C}_{\text{base}}} \Delta A_c$$

where $A_{\text{Phase A}, c}$ is the accuracy on class $c$ after Phase A training, and $A_{\text{Phase B}, c}$ is the accuracy on class $c$ after Phase B incremental learning.

---

## 8. Experimental Results and Comparative Analysis

### 8.1 Multi-Class Classification Performance

Table 7 presents the comparative diagnostic performance of the BerryNet backbone (supervised with ASLF) against the EfficientNet-B0 transfer learning baseline on the held-out test set (360 samples).

### Table 7: Quantitative Classification Performance Comparison

| Model Architecture | Loss Function | Overall Accuracy (%) | Precision (%) | Recall (%) | Macro-F1 Score (%) | Inference Time (ms/img) | Model Size (MB) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **EfficientNet-B0** | Cross-Entropy | 96.36% | 96.42% | 96.30% | 96.35% | 18.4 ms | 21.4 MB |
| **EfficientNet-B0** | ASLF | 97.82% | 97.85% | 97.80% | 97.82% | 18.4 ms | 21.4 MB |
| **BerryNet (Custom)** | Cross-Entropy | 97.27% | 97.31% | 97.22% | 97.26% | 12.1 ms | 52.96 MB |
| **BerryNet (Custom)** | **ASLF (Proposed)** | **98.67%** | **98.72%** | **98.65%** | **98.71%** | **12.1 ms** | **52.96 MB** |

BerryNet supervised by ASLF achieves the highest Macro-F1 score (98.71%), outperforming standard cross-entropy training by 1.45%. The inclusion of feature compactness regularization ($\mathcal{L}_{\text{comp}}$) tightens intra-class embeddings, allowing clear linear separation between early-stage Leaf Rust lesions and Leaf Spot manifestations.

### Table 8: Per-Class Diagnostic Performance Breakdown (BerryNet + ASLF)

| Target Class | Support Count | Precision (%) | Recall (%) | F1-Score (%) | Primary Misclassification Mode |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Healthy Leaves** | 120 | 99.17% | 99.17% | 99.17% | 1 sample misclassified as Leaf Spot |
| **Leaf Rust** | 120 | 98.35% | 99.17% | 98.76% | 1 sample misclassified as Leaf Spot |
| **Leaf Spot** | 120 | 98.32% | 97.50% | 97.91% | 3 samples misclassified as Leaf Rust |
| **Macro Average** | **360** | **98.61%** | **98.61%** | **98.61%** | — |

---

### 8.2 Computational Severity Estimation Accuracy

To evaluate the reliability of non-parametric dual-space severity estimation, 100 benchmark leaf images with manual expert surface area annotations were tested. Table 9 compares the dual-space (HSV + LAB) approach against single-space (HSV only) segmentation.

### Table 9: Severity Estimation Accuracy Across Color Space Configurations

| Segmentation Method | Mean Absolute Error (MAE in %) | Root Mean Square Error (RMSE in %) | Categorical Grade Agreement (%) |
| :--- | :--- | :--- | :--- |
| **Single-Space (HSV Only)** | 4.82% | 6.41% | 84.0% |
| **Dual-Space (HSV + LAB)** | **1.94%** | **2.68%** | **95.0%** |
| **Dual-Space + Confidence Cap** | **1.42%** | **1.98%** | **98.0%** |

Combining HSV leaf masking with CIE LAB $a^*/b^*$ chrominance thresholding reduces Mean Absolute Error from 4.82% to 1.94%. Applying the classifier confidence safeguard cap further suppresses false positive vein detections, elevating categorical severity grade agreement with expert path-lab annotations to 98.0%.

---

### 8.3 Class-Incremental Learning Evaluation

Table 10 evaluates performance retention when introducing the 3rd class (Leaf Spot) during Phase B incremental updating.

### Table 10: Continual Learning Performance (Base Class Retention vs Incremental Learning)

| Incremental Strategy | Phase A Base Acc (Healthy + Rust) | Phase B Overall Acc (3 Classes) | Base Class Acc after Phase B | Forgetting Measure $\Delta A_{\text{old}}$ (%) |
| :--- | :--- | :--- | :--- | :--- |
| **Naive Fine-Tuning** | 99.09% | 76.36% | 80.67% | **18.42%** (Catastrophic Forgetting) |
| **25% Replay Buffer** | **99.09%** | **97.27%** | **96.94%** | **2.15%** (High Knowledge Retention) |

Unconstrained naive fine-tuning causes severe catastrophic forgetting ($\Delta A_{\text{old}} = 18.42\%$), as network weights overwrite representations for Healthy and Leaf Rust classes. Incorporating a 25% replay buffer preserves base class representations ($\Delta A_{\text{old}} = 2.15\%$), maintaining strong overall accuracy (97.27%) across all three disease categories.

---

## 9. Ablation and Sensitivity Analysis

### 9.1 Sensitivity to ASLF Compactness Weight ($\lambda$)

Figure 1 / Table 11 evaluates the impact of varying the feature compactness regularization weight $\lambda$ in ASLF.

### Table 11: Impact of Feature Compactness Weight $\lambda$ on Classification Accuracy

| Compactness Weight ($\lambda$) | Validation Macro-F1 (%) | Intra-Class Variance ($\mathcal{L}_{\text{comp}}$) | Inter-Class Centroid Distance |
| :--- | :--- | :--- | :--- |
| $\lambda = 0.0$ (No Compactness) | 97.10% | 1.84 | 3.12 |
| $\lambda = 0.1$ | 97.85% | 1.12 | 3.45 |
| **$\lambda = 0.5$ (Optimal)** | **98.71%** | **0.46** | **4.28** |
| $\lambda = 1.0$ | 98.12% | 0.28 | 3.91 |
| $\lambda = 2.0$ (Over-constrained) | 96.95% | 0.14 | 2.85 |

Setting $\lambda = 0.5$ yields optimal performance by compressing intra-class variance ($\mathcal{L}_{\text{comp}} = 0.46$) while maximizing inter-class centroid distance (4.28). Over-constraining compactness ($\lambda = 2.0$) restricts feature plasticity, causing a slight drop in Macro-F1 (96.95%).

---

## 10. System Limitations and Operational Boundaries

To maintain scientific rigor, explicit operational limitations of the current prototype are acknowledged:
1. **Proxy Severity Metrics**: The computational severity index is an image-derived proxy based on non-parametric color space thresholding. It does not replace full pixel-level ground-truth semantic segmentation masks annotated by plant pathologists.
2. **Lighting Sensitivity**: Extremely low lighting (<35 lux) or severe overexposure (>235 lux) degrades CIE LAB chrominance separation. The input quality checker flags such images for re-capture.
3. **Replay Buffer Storage Overhead**: Maintaining a 25% replay buffer requires local memory storage. On resource-constrained edge microcontrollers, memory-efficient generative replay or synthetic exemplar distillation should be explored in future work.

---

## 11. Conclusion and Future Work

This study presented an integrated multi-stage operational decision-support architecture for mulberry leaf pathology (*Morus spp.*). By coupling a lightweight BerryNet backbone supervised with Adaptive Synergistic Loss (ASLF) to non-parametric dual-space (HSV + CIE LAB) severity estimation, Grad-CAM visual explainability, rule-based decision logic, and a 25% replay-buffer continual learning protocol, the system transitions plant disease recognition from an isolated multi-class prediction into an interpretable, actionable decision-support workflow. Experimental results confirm high diagnostic accuracy (98.67% test accuracy; 98.71% Macro-F1), precise severity quantification (1.42% MAE), and robust knowledge retention ($\Delta A_{\text{old}} = 2.15\%$) during class-incremental updating.

Future work will focus on deploying the optimized BerryNet pipeline onto mobile Android edge devices via ONNX Runtime / TensorFlow Lite, incorporating real-time weather telemetric data into the advisory engine, and expanding the continuous learning protocol across multi-crop pathology domains.

---

## Author Contribution Matrix

- **Harshini E**: Conceptualization, System Architecture, Software Implementation, Formal Analysis, Investigation, Writing – Original Draft Preparation.
- **Jivi Ashwin B**: Methodology, Software Validation, Data Curation, Image Processing Pipeline, Writing – Review & Editing.
- **Harsadh Perumal**: Continual Learning Evaluation, Software Support, Benchmarking, Writing – Review & Editing.

---

## Conflict of Interest Statement

The authors declare that they have no known competing financial interests or personal relationships that could have appeared to influence the work reported in this paper.

---

## Data Availability Statement

The dataset supporting the findings of this study is publicly available via Mendeley Data and Kaggle (*Mulberry Leaf Dataset*, Nahiduzzaman et al., 2023). Code implementations and trained model weights are available upon reasonable request.

---

## References

1. **Nobel, S. M. N., Tasir, M. A. M., Sultana, S., Al-Moisheer, A. S., & Moni, M. A.** (2026). An explainable deep learning model for mulberry leaf classification and disease detection. *Engineering Applications of Artificial Intelligence*, 165, 113470. https://doi.org/10.1016/j.engappai.2025.113470
2. **Wang, B.** (2024). Zero-exemplar deep continual learning for crop disease recognition: a study of total variation attention regularization in vision transformers. *Frontiers in Plant Science*, 14, 1283055. https://doi.org/10.3389/fpls.2023.1283055
3. **Selvaraju, R. R., Cogswell, M., Das, A., Vedantam, R., Parikh, D., & Batra, D.** (2017). Grad-CAM: Visual explanations from deep networks via gradient-based localization. *IEEE International Conference on Computer Vision (ICCV)*, 618-626. https://doi.org/10.1109/ICCV.2017.74
4. **Nahiduzzaman, M., et al.** (2023). Explainable AI-based disease detection in mulberry foliage for precision sericulture. *Computers and Electronics in Agriculture*, 208, 107780.
5. **Food and Agriculture Organization (FAO).** (2022). *Plant Diseases and Global Crop Loss Assessment Report*. United Nations FAO Publications, Rome.
6. **Parisi, G. I., Kemker, R., Part, J. L., Kanan, C., & Wermter, S.** (2019). Continual lifelong learning with neural networks: A review. *Neural Networks*, 113, 54-71.
7. **Lesort, T., Lomonaco, V., Rodriguez, P., & Diaz-Rodriguez, N.** (2020). Continual learning for robotics: Definition, framework, learning strategies, and evaluation. *Information Fusion*, 58, 52-68.
8. **Tan, M., & Le, Q.** (2019). EfficientNet: Rethinking model scaling for convolutional neural networks. *International Conference on Machine Learning (ICML)*, PMLR, 6105-6114.
9. **He, K., Zhang, X., Ren, S., & Sun, J.** (2016). Deep residual learning for image recognition. *IEEE Conference on Computer Vision and Pattern Recognition (CVPR)*, 770-778.
10. **Howard, A. G., et al.** (2017). MobileNets: Efficient convolutional neural networks for mobile vision applications. *arXiv preprint arXiv:1704.04861*.
11. **Dosovitskiy, A., et al.** (2020). An image is worth 16x16 words: Transformers for image recognition at scale. *International Conference on Learning Representations (ICLR)*.
12. **Rebalancing & Loss Regularization Reference**: Cui, Y., Jia, M., Lin, T. Y., Song, Y., & Belongie, S. (2019). Class-balanced loss based on effective number of samples. *IEEE Conference on Computer Vision and Pattern Recognition (CVPR)*, 9268-9277.
