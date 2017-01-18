# Sqlite2JSON #1.0.0

Sqlite 2 JSON is a simple script to export partial or the whole content from SQLite Databases. 

## Code Example
You can run the script using the provided example database

Dumping the database completely:
```javascript
npm install
node . -d example/example.db
```

Dumping the database partially:
```javascript
npm install
node . -d example/example.db -f example/structure.json 
```

Specifying an output file:
```javascript
npm install
node . -d example/example.db -f example/structure.json -o /path/to/output/file
```

## Structure file example

The Structure file allows you to specify custom queries and therefore reduce considerably the amount of information dumped by the script.

```json
{
    "tables": [
        {
            "query": "SELECT * from colors where name like 'red';",
            "key": "colors"
        },
        {
            "query": "SELECT * from shapes;",
            "key": "shapes"
        }
    ]
}
```


## Installation
- Clone this project
- npm install
- Run the script

### Version
1.0.0


### Contact Info
* [twitter](https://twitter.com/xaviercolomer)
* [linkedin](https://es.linkedin.com/in/xaviercolomer)
* [website](http://xavicolomer.com)
