# TVBOT Desktop / Local

> A blazing-fast, fully-featured local application for phylogenetic tree visualization, annotation, and publication-ready rendering.
> 
> The desktop/local version of TVBOT is built specifically for researchers who demand high data privacy, rendering performance, and support for massive tree files. Say goodbye to web upload limits, rendering lags, and clunky operations.

## 🌟 Key Features & Updates

### 1. Unlimited Capacity & Persistent Storage
- **Break Upload Limits**: Run locally to instantly open massive phylogenetic trees containing tens of thousands of leaves without server timeout fears.
- **Unlimited Local Saving**: Save your current drawing state and layer data entirely as a local `.json` file. Restore your workspace anytime, anywhere, unconstrained by cloud storage quotas.
- **100% Data Privacy**: All data parsing, rendering, and exporting are completed on your local device. Your unpublished research data never leaks.

### 2. True Canvas Annotation
- **Free Interactive Canvas**: More than just a tree viewer, it's a true drawing canvas. Manually drag, drop, annotate, and customize nodes, branches, and clades just like using design software.
- **Perfect Vector Export**: The underlying rendering engine has been deeply refactored to ensure complex rotated text, custom shapes, and bootstrap legends are exported as PDF/SVG vector graphics with 100% accuracy, directly meeting top-tier journal publication requirements.

### 3. Detail Optimizations & Workflow Enhancements
- **🔄 Seamless Layout Transitions**: Switch freely between different tree layouts (e.g., Circle Tree to Normal Tree / Unrooted Tree) with a single click **without losing** existing Layer data and custom annotations.
- **🧬 Smart Taxon Auto-clustering & Folding**: Automatically identify, cluster, and fold identical taxa based on imported classification files (e.g., Phylum / Family). The folded triangle proportions incorporate a logarithmic scaling algorithm to dynamically adjust size based on the number of leaves, preventing massive overlap. Branch counts are also smartly displayed next to the name (e.g., `CladeA (42)`).
- **📊 Perfect IQ-TREE Dual Bootstrap Support**: Thoroughly fixed parsing and display issues for IQ-TREE output files containing multiple support values (e.g., `98/100`). The system now accurately separates and simultaneously displays **SH-aLRT support (%)** and **ultrafast bootstrap support (%)**, while perfectly generating corresponding legends.
- **🔍 Root Node ID & Copy Logic Fix**: Fixed duplicate ID issues caused by re-rooting operations. You can now accurately copy all leaf IDs under any branch or node with one click.
- **🏷️ Smart ID Alignment**: Optimized ID matching logic between Newick tree files and uploaded tables, intelligently handling differences like hidden quotes, underscores, and spaces.

---

## 🚀 Minimalist Cross-Platform Installation & Usage

Thanks to its lightweight architecture, this tool requires no bulky Electron desktop wrappers, completely eliminating OS compatibility issues. It comes with a one-click startup script that automatically manages isolated Python environments (Venv/Conda) without polluting your system environment.

**Prerequisites:** `Python 3` or `Conda` installed on your computer.

### Option 1: Standard Start (Recommended, uses `venv` + `pip`)

**For Mac / Linux Users:**
1. Open your terminal in the current folder.
2. Run the startup script:
   ```bash
   ./start_mac_linux.sh
   ```

**For Windows Users:**
1. Simply double-click `start_windows.bat` to run.

### Option 2: Conda Environment Start (For Anaconda/Miniconda users)
If you add the `--conda` flag after the script, the system will automatically create a dedicated Conda environment named `tvbot-local` for you.

**Mac / Linux:**
```bash
./start_mac_linux.sh --conda
```

**Windows:**
Open Command Prompt (CMD) or PowerShell in the current directory and run:
```cmd
start_windows.bat --conda
```

> **🎉 Tip:** Once successfully started, the program will automatically open the TVBOT local interface in your default browser. Ready to use out of the box!

---

## 📖 Citation & Acknowledgements

If you use this tool in your research, please cite the original TVBOT rendering engine paper:
*Xie et al., (2023) Nucleic Acids Res doi: 10.1093/nar/gkad359*
