import json
import sys
from pathlib import Path
from nse import NSE

def main():
    if len(sys.argv) < 3:
        raise SystemExit("usage: nse_annual_reports.py <list|download> <symbol|url> [folder]")

    action = sys.argv[1]
    target = sys.argv[2]
    folder = sys.argv[3] if len(sys.argv) > 3 else None

    kwargs = {}
    if folder:
      kwargs["download_folder"] = folder

    with NSE(**kwargs) as nse:
        if action == "list":
            data = nse.annual_reports(target)
            print(json.dumps(data))
            return

        if action == "download":
            result = nse.download_document(target, folder=folder)
            print(json.dumps({"filePath": str(Path(result).resolve())}))
            return

    raise SystemExit(f"unsupported action: {action}")


if __name__ == "__main__":
    main()
