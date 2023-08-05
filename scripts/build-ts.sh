pwd

babel --config-file ./babel.config.typescript.json src --out-dir dist --extensions ".ts" $@

scripts/copy-public-files.sh