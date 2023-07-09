pwd

babel --config-file ./babel.config.typescript.json src --out-dir dist --extensions ".ts" --source-maps inline $@

scripts/copy-public-files.sh