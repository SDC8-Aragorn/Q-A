# Q-A

ETL CODE:

COPY tablename(columns)
FROM 'path to file to copy into current db'
DELIMITER ','
CSV HEADER;

running the schema in psql
psql -d mydb -f myschemafile.sql