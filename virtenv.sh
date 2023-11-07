python3 -m pip install -q --upgrade virtualenv --user
rm -rf ./venv
python3 -m virtualenv -p python3 ./venv
source ./venv/bin/activate

pip3 install utm
pip3 install geojson
pip3 install numpy
pip3 install GDAL==3.4.1

# deactivate
