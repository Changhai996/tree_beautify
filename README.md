# TVBOT_Desktop

TVBOT_Desktop is a local-first application for phylogenetic tree visualization, annotation, comparison, and publication-ready export (PDF/SVG).

## Version

Current release: **v1.0.0**

## Highlights

- Local-first workflow: all parsing, rendering, and exporting run on your own machine.
- Multi-layout support: Normal, Circular, and Unrooted layouts.
- Workspace management: save and reload tree states as JSON.
- Tanglegram workflow: compare two trees in one canvas with connection editing.
- Publication export: vector output for high-quality figures.

## Requirements

- `Python 3.8+`
- `Node.js` (with `npm`)

## Quick Start

### 1) Clone

```bash
git clone https://github.com/Changhai996/TVBOT_Desktop.git
cd TVBOT_Desktop
```

### 2) Run

```bash
python start.py
```

Optional wrappers:

- macOS/Linux: `./start_mac_linux.sh`
- Windows: `start_windows.bat`

The app starts at `http://127.0.0.1:8000/`.

## Repository Structure

- `src/`: frontend pages, styles, TypeScript/JavaScript modules
- `server.py`: Flask backend entry
- `start.py`: unified startup workflow (cross-platform)
- `start_mac_linux.sh`, `start_windows.bat`: thin wrappers for `start.py`
- `requirements.txt`: Python dependencies
- `data/`: local workspace data (not recommended to commit personal datasets)

## Cleanup Notes (v1.0.0)

The repository has been simplified for public use:

- Removed legacy one-off replacement scripts.
- Removed duplicate environment manager configs (single startup flow kept).
- Removed obsolete test/temporary files and local-only cache artifacts from versioning.

## Citation

If you use this tool in your research, please cite this repository and the original TVBOT engine:

- Xie et al. (2023), *Nucleic Acids Research*, doi:10.1093/nar/gkad359
