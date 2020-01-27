python3 -m pip install -q --upgrade virtualenv --user
rm -rf ./venv
python3 -m virtualenv -p python3 ./venv
source ./venv/bin/activate

pip3 install utm
pip3 install geojson

# deactivate
