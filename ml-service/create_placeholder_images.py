"""
Script tạo hình ảnh placeholder đơn giản bằng PIL (không cần matplotlib)
"""

from PIL import Image, ImageDraw, ImageFont
from pathlib import Path
import random

# Tạo thư mục
images_dir = Path('readme_images')
images_dir.mkdir(exist_ok=True)

def create_placeholder_image(filename, title, width=800, height=600, color='#3498db'):
    """Tạo hình ảnh placeholder với tiêu đề"""
    img = Image.new('RGB', (width, height), color='white')
    draw = ImageDraw.Draw(img)
    
    # Vẽ viền
    draw.rectangle([10, 10, width-10, height-10], outline=color, width=5)
    
    # Vẽ background color
    draw.rectangle([15, 15, width-15, height-15], fill='#ecf0f1')
    
    # Thêm text (sử dụng font mặc định)
    text_bbox = draw.textbbox((0, 0), title)
    text_width = text_bbox[2] - text_bbox[0]
    text_height = text_bbox[3] - text_bbox[1]
    
    # Centered text
    x = (width - text_width) // 2
    y = (height - text_height) // 2
    
    # Vẽ shadow
    draw.text((x+2, y+2), title, fill='#7f8c8d')
    # Vẽ text chính
    draw.text((x, y), title, fill=color)
    
    # Thêm icon/symbol
    draw.ellipse([width//2-50, height//2-100, width//2+50, height//2], fill=color, outline='#2c3e50')
    
    img.save(images_dir / filename)
    print(f"✅ Created: {filename}")

print("=" * 60)
print("🎨 CREATING PLACEHOLDER IMAGES")
print("=" * 60)

# Tạo các hình ảnh placeholder
create_placeholder_image('01_data_distribution.png', 'Data Distribution Analysis', 800, 500, '#3498db')
create_placeholder_image('02_correlation_heatmap.png', 'Correlation Heatmap', 600, 600, '#e74c3c')
create_placeholder_image('03_outcome_distribution.png', 'Outcome Distribution', 700, 400, '#2ecc71')
create_placeholder_image('04_feature_boxplots.png', 'Feature Boxplots', 800, 500, '#f39c12')
create_placeholder_image('05_model_comparison.png', 'Model Performance Comparison', 800, 600, '#9b59b6')
create_placeholder_image('06_roc_curve.png', 'ROC Curve (AUC = 0.810)', 600, 600, '#e67e22')
create_placeholder_image('07_confusion_matrix.png', 'Confusion Matrix', 500, 500, '#16a085')
create_placeholder_image('08_feature_importance.png', 'Feature Importance', 700, 500, '#c0392b')
create_placeholder_image('09_metrics_comparison.png', 'Metrics Comparison', 800, 500, '#2980b9')

print("\n" + "=" * 60)
print("✅ ALL PLACEHOLDER IMAGES CREATED!")
print("=" * 60)
print(f"\n📁 Location: {images_dir.absolute()}")
print("\n💡 To create actual visualizations, run: python generate_readme_images.py")
print("   (Requires: pip install matplotlib seaborn)")
