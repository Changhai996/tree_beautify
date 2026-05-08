# TVBOT Local

> A blazing-fast, fully-featured local application for phylogenetic tree visualization, annotation, and publication-ready rendering.

TVBOT Local is an advanced, standalone version of the TVBOT web tool, rebuilt and optimized specifically for researchers who demand high performance, data privacy, and unlimited operational capacity. Say goodbye to server upload limits, slow rendering of massive trees, and clunky web interfaces.

## 🌟 Why Choose TVBOT Local? (Exclusive Local Features)

1. **Unlimited Capacity & True Privacy**
   - **No Upload Limits**: Render trees with tens of thousands of leaves instantly without server timeouts.
   - **Infinite Saves**: Save your exact drawing state (`.json`) locally and resume your workspace anytime without worrying about cloud storage quotas.
   - **100% Offline**: All data parsing, rendering, and exporting happens on your local machine. Your unpublished data never leaves your computer.

2. **True Canvas Annotation Engine**
   - **Interactive Drawing Board**: Not just a tree viewer, but a genuine canvas. Manually draw, drag, drop, and annotate nodes, branches, and clades exactly where you want them.
   - **Pixel-Perfect PDF/SVG Exports**: Completely rewritten rendering engine ensures that every rotated text, custom shape, and complex bootstrap legend is exported to PDF/SVG with 100% accuracy, preserving vector scalability for high-impact journals.

3. **Advanced Bioinformatics Integrations**
   - **Native IQ-TREE Dual Bootstrap Support**: Automatically parses trees containing multiple support values (e.g., `SH-aLRT / UFboot`). Dynamically display both values simultaneously (e.g., `98/100`) on branches, with automatically generated legends.
   - **Smart Auto-Folding by Taxon**: Upload your metadata (CSV/TSV), select a column (e.g., "Phylum" or "Family"), and the engine will automatically find the largest monophyletic clades and fold them perfectly. Includes a "relaxed mode" that gracefully handles datasets with missing annotations.
   - **Proportional Clade Folding**: The shape and width of folded triangles dynamically scale (using logarithmic dampening) based on the number of leaves they contain, preventing massive overlapping while accurately representing clade sizes.

4. **Seamless Workflow Enhancements**
   - **Fluid Layout Transitions**: Instantly switch between Circular, Normal (Rectangular), and Unrooted layouts without losing your layer data or custom annotations.
   - **Robust ID Normalization**: Stop fighting with Newick quote parsing. Our engine intelligently normalizes Newick IDs (handling hidden quotes, underscores vs. spaces) to perfectly match your uploaded metadata tables.

---

## 🚀 Lightweight & Cross-Platform

We explicitly designed TVBOT Local to run seamlessly on your browser without compiling heavy Electron or native desktop wrappers. This guarantees:
- **Zero OS compatibility issues**: If you have a browser and Python installed, it works.
- **Ultra-low memory footprint**: No heavy Chromium instances running in the background.
- **Immediate updates**: Just edit the HTML/JS and refresh the page.

---

## 📥 Installation & Usage

You only need **Python 3** or **Conda** installed on your system. The scripts will automatically handle creating isolated virtual environments and installing dependencies so it won't mess up your system Python.

### Option A: Standard Start (Uses `venv` + `pip`)

**For Mac / Linux:**
1. Open your terminal in this folder.
2. Run the start script:
   ```bash
   ./start_mac_linux.sh
   ```

**For Windows:**
1. Double-click the `start_windows.bat` file.

### Option B: Conda Start (Uses `conda` environment)
If you prefer managing environments with Anaconda/Miniconda, run the script with the `--conda` flag. It will automatically create an environment named `tvbot-local`.

**For Mac / Linux:**
```bash
./start_mac_linux.sh --conda
```

**For Windows:**
Open Command Prompt or PowerShell in this folder and run:
```cmd
start_windows.bat --conda
```

*(Note: Once the server starts, your default browser will automatically open to the TVBOT interface!)*

## 📖 Citation

If you use TVBOT Local in your research, please cite our underlying rendering engine:
*Xie et al., (2023) Nucleic Acids Res doi: 10.1093/nar/gkad359*
