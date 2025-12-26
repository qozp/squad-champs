Run from main to init local
```
python3 -m venv venv
source venv/bin/activate
cd backend

pip install -r requirements.txt
cd ..
```

Run from backend to update reqs
```
pip freeze > requirements.txt
```

Insert new players list when convenient (run from main)
```
cd backend
python3 manual/insert_new_players.py
```
