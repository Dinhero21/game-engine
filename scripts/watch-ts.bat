concurrently -k -p "[{name}]" -n "TSC,Nodemon" -c "cyan.bold,green.bold,yellow.bold" "tsc -w" "nodemon --watch src/public --ext * --exec \"call scripts/copy-public-files\""