# 📸 Hướng Dẫn Tạo Hình Ảnh Minh Họa Chất Lượng Cao

## ✅ Đã hoàn thành

Tôi đã cập nhật README với các hình ảnh minh họa cho phần Machine Learning:

### 🎯 Các thay đổi đã thực hiện:

1. ✅ **Thêm hình ảnh minh họa từ web** (Phần Giới thiệu):
   - Hình ảnh Diabetes từ Freepik
   - Hình ảnh AI/ML application từ Freepik
   - Logo BRFSS từ CDC

2. ✅ **Thêm đường dẫn hình ảnh local** (Phần Kết quả):
   - Phân phối dữ liệu
   - Ma trận tương quan
   - So sánh mô hình
   - Đường cong ROC
   - Confusion Matrix
   - Feature Importance
   - Metrics comparison

3. ✅ **Tạo hình ảnh placeholder** (9 files):
   - Đã tạo trong `ml-service/readme_images/`
   - Sử dụng làm placeholder tạm thời

---

## 🚀 Bước tiếp theo: Tạo hình ảnh thực tế

### Option 1: Sử dụng Script Tự Động ⭐ (Khuyến nghị)

```bash
# Bước 1: Cài đặt thư viện
cd ml-service
pip install matplotlib seaborn scikit-learn pandas numpy

# Bước 2: Chạy script
python generate_readme_images.py
```

Script này sẽ:
- 📊 Load dữ liệu từ `data/pima_clean.csv`
- 📈 Tạo 9 biểu đồ chất lượng cao
- 💾 Lưu vào `readme_images/` với DPI 300
- ⚡ Tự động thay thế placeholder images

### Option 2: Tạo từ Jupyter Notebook

```bash
# Mở notebook training
jupyter notebook notebooks/diabetes_model_training.ipynb

# Trong notebook, thêm vào cuối mỗi visualization cell:
plt.savefig('../readme_images/ten_file.png', dpi=300, bbox_inches='tight')
```

### Option 3: Sử dụng hình từ kết quả training thực tế

Nếu bạn đã train model và có kết quả:

```python
# Trong file training của bạn, export các hình:
import matplotlib.pyplot as plt

# Sau khi vẽ biểu đồ
plt.savefig('ml-service/readme_images/06_roc_curve.png', dpi=300, bbox_inches='tight')
```

---

## 📋 Danh sách hình ảnh cần tạo

| # | File | Mô tả | Kích thước | Nguồn dữ liệu |
|---|------|-------|------------|---------------|
| 1 | `01_data_distribution.png` | Phân phối 8 features | 800x500 | pima_clean.csv |
| 2 | `02_correlation_heatmap.png` | Ma trận tương quan | 600x600 | pima_clean.csv |
| 3 | `03_outcome_distribution.png` | Phân phối target | 700x400 | pima_clean.csv |
| 4 | `04_feature_boxplots.png` | Boxplot theo outcome | 800x500 | pima_clean.csv |
| 5 | `05_model_comparison.png` | So sánh 5 models | 800x600 | Training results |
| 6 | `06_roc_curve.png` | ROC curve | 600x600 | Model evaluation |
| 7 | `07_confusion_matrix.png` | Confusion matrix | 500x500 | Model evaluation |
| 8 | `08_feature_importance.png` | Feature importance | 700x500 | Model analysis |
| 9 | `09_metrics_comparison.png` | Metrics (radar+bar) | 800x500 | Model evaluation |

---

## 💡 Tips để tạo hình ảnh đẹp

### 1. Màu sắc chuyên nghiệp
```python
# Sử dụng color palette đẹp
colors = ['#3498db', '#2ecc71', '#e74c3c', '#f39c12', '#9b59b6']
sns.set_palette("husl")
```

### 2. Font và kích thước
```python
plt.rcParams['font.size'] = 12
plt.rcParams['font.weight'] = 'bold'
plt.title('Title', fontsize=14, fontweight='bold')
```

### 3. Grid và style
```python
plt.style.use('seaborn-v0_8-darkgrid')
plt.grid(True, alpha=0.3)
```

### 4. High DPI
```python
plt.savefig('image.png', dpi=300, bbox_inches='tight')
```

### 5. Legends
```python
plt.legend(loc='best', frameon=True, shadow=True)
```

---

## 🔧 Troubleshooting

### Lỗi: ModuleNotFoundError

```bash
pip install matplotlib seaborn pandas numpy scikit-learn
```

### Lỗi: File not found (pima_clean.csv)

Đảm bảo file dữ liệu tồn tại:
```bash
ls ml-service/data/pima_clean.csv
```

Nếu không có, download từ Kaggle:
- Dataset: Pima Indians Diabetes Database
- Link: https://www.kaggle.com/datasets/uciml/pima-indians-diabetes-database

### Hình ảnh không hiển thị trong README

1. Kiểm tra đường dẫn tương đối
2. Đảm bảo file tồn tại trong `ml-service/readme_images/`
3. Commit và push lên GitHub
4. Kiểm tra trên GitHub (hình local sẽ không hiện trên GitHub nếu chưa push)

---

## 🌐 Alternative: Sử dụng hình ảnh online

Nếu không muốn tạo hình local, có thể:

### 1. Upload lên GitHub
```bash
git add ml-service/readme_images/*.png
git commit -m "Add ML visualization images"
git push
```

Sau đó sử dụng:
```markdown
![Image](https://raw.githubusercontent.com/nghuy0701/Website-MyHealthMate/main/ml-service/readme_images/06_roc_curve.png)
```

### 2. Upload lên Imgur/Cloudinary
- Upload hình ảnh lên service
- Copy direct link
- Thay thế trong README

### 3. Sử dụng Plotly hoặc Colab
- Tạo visualization trong Google Colab
- Export và download
- Upload vào project

---

## 📊 Code Templates

### Template 1: Data Distribution
```python
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns

df = pd.read_csv('data/pima_clean.csv')
fig, axes = plt.subplots(2, 4, figsize=(16, 8))
features = df.columns[:-1]

for idx, feature in enumerate(features):
    row, col = idx // 4, idx % 4
    axes[row, col].hist(df[feature], bins=30, alpha=0.7, color='skyblue', edgecolor='black')
    axes[row, col].set_xlabel(feature, fontweight='bold')
    axes[row, col].set_ylabel('Frequency', fontweight='bold')
    axes[row, col].grid(True, alpha=0.3)

plt.suptitle('Data Distribution', fontsize=16, fontweight='bold')
plt.tight_layout()
plt.savefig('readme_images/01_data_distribution.png', dpi=300, bbox_inches='tight')
plt.show()
```

### Template 2: Correlation Heatmap
```python
plt.figure(figsize=(10, 8))
corr = df.corr()
mask = np.triu(np.ones_like(corr, dtype=bool))
sns.heatmap(corr, mask=mask, annot=True, fmt='.2f', 
            cmap='coolwarm', center=0, square=True)
plt.title('Correlation Matrix', fontsize=14, fontweight='bold', pad=20)
plt.tight_layout()
plt.savefig('readme_images/02_correlation_heatmap.png', dpi=300, bbox_inches='tight')
plt.show()
```

### Template 3: Model Comparison
```python
models = ['Logistic Regression', 'Random Forest', 'Gradient Boosting', 'SVM', 'Neural Network']
accuracy = [70.1, 68.8, 69.2, 67.5, 66.9]
roc_auc = [0.810, 0.795, 0.800, 0.785, 0.775]

fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(14, 6))

ax1.barh(models, accuracy, color='skyblue', edgecolor='black')
ax1.set_xlabel('Accuracy (%)', fontweight='bold')
ax1.set_title('Model Accuracy Comparison', fontweight='bold')
ax1.grid(axis='x', alpha=0.3)

ax2.barh(models, roc_auc, color='lightcoral', edgecolor='black')
ax2.set_xlabel('ROC-AUC Score', fontweight='bold')
ax2.set_title('Model ROC-AUC Comparison', fontweight='bold')
ax2.grid(axis='x', alpha=0.3)

plt.tight_layout()
plt.savefig('readme_images/05_model_comparison.png', dpi=300, bbox_inches='tight')
plt.show()
```

---

## ✅ Checklist hoàn thành

- [x] Tạo thư mục `ml-service/readme_images/`
- [x] Tạo placeholder images (9 files)
- [x] Cập nhật README với image paths
- [x] Tạo script `generate_readme_images.py`
- [x] Tạo script `create_placeholder_images.py`
- [x] Tạo README trong thư mục images
- [x] Tạo hướng dẫn chi tiết (file này)

### Việc cần làm tiếp:
- [ ] Cài đặt matplotlib, seaborn
- [ ] Chạy `generate_readme_images.py`
- [ ] Kiểm tra hình ảnh được tạo ra
- [ ] Commit và push lên GitHub
- [ ] Verify hình ảnh hiển thị trên GitHub

---

## 📞 Support

Nếu gặp vấn đề:
1. Kiểm tra file `ml-service/readme_images/README.md` để xem hướng dẫn chi tiết
2. Chạy script với verbose mode để debug
3. Kiểm tra logs và error messages
4. Liên hệ qua GitHub Issues

---

**Happy visualizing! 🎨📊📈**
