import sqlite3
p='db.sqlite3'
conn=sqlite3.connect(p)
cur=conn.cursor()
rows=cur.execute("PRAGMA table_info('contest_contest')").fetchall()
if not rows:
    print('NO_TABLE')
else:
    for r in rows:
        print(r)
conn.close()
