#!/bin/bash
echo "🚀 Bismillah, App is starting..."
echo "⚙️ ARGS: "
echo $@
# echo "$1"

# python main.py $@

if [ "$(python -V 2>&1 | cut -d' ' -f 2 | cut -d. -f1)" -lt "3" ]; then
    python3 main.py $@
else
    python main.py $@
fi
