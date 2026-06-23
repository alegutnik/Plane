@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo ========================================
echo  PNG Resizer - max quality
echo ========================================
echo.

:: Проверяем Python
where python >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python not found.
    echo Download: https://www.python.org/downloads/
    pause
    exit /b 1
)

:: Проверяем Pillow
python -c "from PIL import Image" >nul 2>&1
if %errorlevel% neq 0 (
    echo Installing Pillow...
    python -m pip install Pillow --quiet
)

:: Пишем Python-скрипт во временный файл
set "SCRIPT=%TEMP%\resize_png_tmp.py"
set "FOLDER=%~dp0"
set "FOLDER=!FOLDER:\=\\!"

(
echo import os, sys
echo from PIL import Image
echo.
echo folder = r"%~dp0"
echo output_dir = os.path.join^(folder, "resized"^)
echo os.makedirs^(output_dir, exist_ok=True^)
echo.
echo size = int^(sys.argv[1]^)
echo side = sys.argv[2]
echo.
echo files = [f for f in os.listdir^(folder^) if f.lower^(^).endswith^(".png"^)]
echo if not files:
echo     print^("No PNG files found."^)
echo     sys.exit^(0^)
echo.
echo for filename in files:
echo     src = os.path.join^(folder, filename^)
echo     with Image.open^(src^) as img:
echo         w, h = img.size
echo         if side == "w":
echo             new_w = size
echo             new_h = int^(h * size / w^)
echo         else:
echo             new_h = size
echo             new_w = int^(w * size / h^)
echo         resized = img.resize^(^(new_w, new_h^), Image.Resampling.LANCZOS^)
echo         out_path = os.path.join^(output_dir, filename^)
echo         resized.save^(out_path, "PNG", compress_level=1, optimize=False^)
echo         print^(f"Done: {filename} -^> {new_w}x{new_h}"^)
echo.
echo print^(f"\nFinished! {len^(files^)} files -^> {output_dir}"^)
) > "%SCRIPT%"

set /p SIDE="Resize by width or height? (w / h) [default w]: "
if /i "!SIDE!"=="" set "SIDE=w"

set /p SIZE="Size in px [default 200]: "
if "!SIZE!"=="" set "SIZE=200"

echo.
echo Settings: side=!SIDE!, size=!SIZE!px
echo.

python "%SCRIPT%" !SIZE! !SIDE!

echo.
pause
