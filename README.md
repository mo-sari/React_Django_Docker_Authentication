### Django_React_Docker

## Jazzmin

you could customize the admin panel as you wish using this package, just add it to
installed apps and also paste the configuration's from readthedocs.

## Database tables and rows

you could run the following commands to visit the tables and rows in you
containerized postgresql database.

1- docker-compose up -d db ==> run the database service
2- docker-compose exec db sh ==> open a shell inside postgresql container
3- psql -U <db_user> -d <db_name> ==> connect to the database
4- use \q for quiting the shell.

## API Views.

If you want to retrieve a single object based on some criteria other than id (e.g., a slug, username, or other unique field), you override the get_object method,If you want to retrieve a queryset filtered by some criteria (e.g., all objects with a certain status, all posts for a category, etc.), you override the get_queryset method.(in both these cases you are getting the parameter in url)
if you're not getting the value in url and want to change the criteria, just set lookup_field='<new_criteria>'
