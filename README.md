# MApps-CMS-BackEnd
Mobile Apps CMS Project Backend

## Week 2 Tasks

- [x] Map out elements and endpoints that the client application will need to receive and handle.
- [ ] Construct a simple backend application that can handle some of these endpoints that as a prototype.
- [ ] Create some simple test cases that will test the functions. In addition, create test cases that will simulate a client sending data to particular endpoints you have designed.

### Test Cases - Commands

http://localhost:3000/users

curl -X POST http://localhost:3000/users/create \
     -H "Content-Type: application/json" \
     -d '{"name": "John"}'

curl -X DELETE http://localhost:3000/users/2

