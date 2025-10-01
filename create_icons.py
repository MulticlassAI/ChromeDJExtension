#!/usr/bin/env python3
"""
Simple script to create basic icon files for the Chrome extension
"""

from PIL import Image, ImageDraw, ImageFont
import os

def create_icon(size, filename):
    # Create a new image with orange background (SoundCloud color)
    img = Image.new('RGB', (size, size), '#ff5500')
    draw = ImageDraw.Draw(img)
    
    # Draw a simple music note or play symbol
    if size >= 48:
        # Draw a simple music note for larger icons
        # Note head
        draw.ellipse([size//3, size//2, size//2, size*2//3], fill='white')
        # Note stem
        draw.rectangle([size//2-2, size//4, size//2+2, size//2], fill='white')
        # Note flag
        draw.polygon([
            (size//2+2, size//4),
            (size*2//3, size//3),
            (size*2//3, size//2),
            (size//2+2, size//2-5)
        ], fill='white')
    else:
        # Simple play triangle for small icon
        triangle_points = [
            (size//3, size//4),
            (size//3, size*3//4),
            (size*2//3, size//2)
        ]
        draw.polygon(triangle_points, fill='white')
    
    # Save the image
    img.save(filename, 'PNG')
    print(f"Created {filename} ({size}x{size})")

if __name__ == "__main__":
    # Create icons in different sizes
    create_icon(16, 'icon16.png')
    create_icon(48, 'icon48.png')
    create_icon(128, 'icon128.png')
    
    print("All icons created successfully!")
