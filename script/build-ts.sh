pwd

babel --config-file ./babel.config.typescript.json src --out-dir dist --extensions ".ts" $@

script/copy-public-files.sh