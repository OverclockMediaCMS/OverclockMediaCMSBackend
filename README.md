# MApps-CMS-BackEnd
Mobile Apps CMS Project Backend

## Week 2 Tasks

- [x] Map out elements and endpoints that the client application will need to receive and handle.
- [ ] Construct a simple backend application that can handle some of these endpoints that as a prototype.
- [ ] Create some simple test cases that will test the functions. In addition, create test cases that will simulate a client sending data to particular endpoints you have designed.

### List of Possible Endpoints

http://localhost:3000/~

## GET

/users
/users/:id
/users/:id/posts

/posts
/posts/:id

/media
/media/:id

## POST

/users/create
/users/:id/posts/create
/users/:id/media/create

## PUT

/users/:id/edit
/posts/:id/edit
/media/:id

## DELETE

/users/:id/delete
/posts/:id/delete
/media/:id/delete


### Test Cases - Commands

Test Case 1: Get all users from the database
Command:
     http://localhost:3000/users
Test Case 2: Get user by Id from db
Command:
     http://localhost:3000/users/1
     http://localhost:3000/users/2

Test Case 3: Create New user
Command: 
     curl -X POST http://localhost:3000/users/create \
     -H "Content-Type: application/json" \
     -d '{"FirstName": "u3", "LastName": "u3", "Email": "u3@email.com", "PasswordHash": "password" '}'





curl -X POST http://localhost:3000/users/create \
     -H "Content-Type: application/json" \
     -d '{"FirstName": "John" , "LastName": "Smith", "Email": "js@mail.com", "PasswordHash" : "pass1234"}' | jq
     
curl -X POST http://localhost:3000/users/create \
     -H "Content-Type: application/json" \
     -d '{"FirstName": "John" , "LastName": "Doe", "Email": "jd@mail.com", "PasswordHash" : "pass123"}' | jq

curl -X DELETE http://localhost:3000/users/2

curl -X

curl http://localhost:3000/
curl http://localhost:3000/users/

# 4 Main HTTP methods

- GET
- POST
- PUT
- DELETE

curl 
