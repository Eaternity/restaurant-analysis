# restaurant-analysis

Bring up elastic search and Kibana containers

```bash
docker-compose up
```

Create a `data` dir in the project root and copy restaurant data (.csv files) into it.

Install node dependencies

```bash
npm install
```

Check whether Kibana is online by navigating to `localhost:5601`. Status should be green!

All fine? Populate elastic search...

```bash
npm start
```
