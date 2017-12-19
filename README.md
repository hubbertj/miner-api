#CounterDraft WebApp and API
Backend & web app code for all CounterDraft

#Running the project locally / development.
1. Download postgre from https://www.postgresql.org/download/
2. Create database counter and copy the master_config.js file in the /config directory, save it in the same dir and name it local_config.js .
3. Add a new database  to your local_config:
	    database: {
	        "user": "postgres",
	        "password": "postgres",
	        "database": "counter",
	        "host": "localhost",
	        "port": 5432,
	        "dialect": "postgres"
	    },
	    environment: 'development',
	    migration_run: false
	
	This file is used to override any master configs for your local enviroment.
	note - migration_run needs to be set to false the first time you run the project.
4. Install npm via brew. 
	'brew install node'
5. Install all npm libs via the root directory of project. (where the package.json file is located)
	'npm install'
6. Run the init seeder file by running the following script:
	'npm run-script init'
7. Run the project with the following command:
	'npm start'
	optional you can set the seeder flag in your local_config to run the other seeder files, but you dont need to.

-The project should create all the tables and relationships. Now run the querys on the counter database, located in scripts/testData.sql.
-You can comment out the migration_run property in your local_config.js if you dont want migrations to try to run.

#Running the project in production.



#REST API CALL EX.

	GET /api/v1/patron/total HTTP/1.1
	Host: 127.0.0.1:8080
	Connection: keep-alive
	Cache-Control: no-cache
	If-None-Match: W/"7e-arpybt5vc1bMW9L5AlxhRw"
	key: 6156d683723d4831b268632df8a4c496
	employee_id: 123
	User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/53.0.2785.143 Safari/537.36
	Accept: */*
	Accept-Encoding: gzip, deflate, sdch
	Accept-Language: en-US,en;q=0.8
	Cookie: __utma=96992031.1298053576.1475776111.1475776111.1476132552.2; __utmz=96992031.1475776111.1.1.utmcsr=(direct)|utmccn=(direct)|utmcmd=(none); sessionid=o049yzi4jlfb3wj12k5vot44xhlsh7th; csrftoken=i0TFLav5k24C1Lv2QMQbfLrG3YeRSDPi; connect.sid=s%3A70f7831c-f29a-4f34-82c0-05b2d719eccf.JsiR8Cguzzs%2Bu8eHg9mUGR0hREaLdQSw7evYKlJLYCc

employee_id = The id of the employee in the organization.
key = The secert API key you recieve when your oganization is created.



[![Built with Grunt](https://cdn.gruntjs.com/builtwith.png)](http://gruntjs.com/)

