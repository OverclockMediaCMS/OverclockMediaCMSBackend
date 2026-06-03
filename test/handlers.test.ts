import { expect, test } from 'vitest'
import express from 'express';
import { GetMediaContainsNameHandler, GetMediaHandler, GetPostByIdHandler, GetPostsHandler, GetTagsHandler, GetUserByIdHandler, GetUserHandler, IndexRequestHandler, PostUserHandler, SearchUsersHandler } from '../index';

class SendPipe {

    data: any[] = [];

    send(msg: any){
        this.data.push(msg);
    }

    json(msg: any){
        const cleanJson = JSON.parse(JSON.stringify(msg));
        this.data.push(cleanJson);
    }

    status(statusCode : number){
        this.send(`Status: ${statusCode}`);
    }

    getCallback() {
        const ref = this;
        return (msg: string) => {
            ref.send(msg);
        }
    }
    getJSONCallback(){
        const ref = this;
        return (msg: any) => {
            ref.json(msg);
        }
    }
    getStatusCallback() {
        const ref = this;
        return (statusCode : number) => {
            ref.status(statusCode);
            return this;
        }
    }
}

test('Checks if Index handler responds with data',
    () => {

        const pipe = new SendPipe();
        const res = { send: pipe.getCallback() };

        IndexRequestHandler({} as express.Request, res as express.Response);

        expect(pipe.data[0]).toEqual("Hello Overclock Media Backend!");
})

test('Checks if GetUser handler responds with data',
    async () => {

        const pipe = new SendPipe();
        const res = { json: pipe.getJSONCallback() };

        await GetUserHandler({} as express.Request, res as express.Response);

        const expected = [
            {
                "id": 1,
                "FirstName": "u1",
                "LastName": "u1",
                "Email": "u1@email.com"
            },
            {
                "id": 2,
                "FirstName": "u2",
                "LastName": "u2",
                "Email": "u2@email.com"
            }
        ];

        const result = pipe.data[0];

        expect(result).toEqual(expected);
})

test('Checks if GetUserById handler responds with data',
    async () => {
        const pipe = new SendPipe();
        const res = { json: pipe.getJSONCallback() };
        const req = {
            params: {
                id: '2'
            }
        };
        await GetUserByIdHandler(req as any, res as express.Response);
        const expected = {
            "id": 2,
            "FirstName": "u2",
            "LastName": "u2",
            "Email": "u2@email.com"
        }
        const result = pipe.data[0];
})

test('Checks if GetUserById handler responds with 404 when user is not found',
    async () => {
        const pipe = new SendPipe();
        
        const res = {
            status: pipe.getStatusCallback(),
            send: pipe.getCallback()
        };

        const req = { params: { id: '99' } };

        await GetUserByIdHandler(req as any, res as any);

        expect(pipe.data[0]).toEqual("Status: 404");
        expect(pipe.data[1]).toEqual("not found");
})

test('Checks if SearchUser handler correctly filters users by FirstName query',
    async () => {
        const pipe = new SendPipe();
        const res = { json: pipe.getJSONCallback() };

        const req = {
            query: {
                FirstName: 'u1'
            }
        };

        await SearchUsersHandler(req as any, res as any);

        const expected = [
            {
                "id": 1,
                "FirstName": "u1",
                "LastName": "u1",
                "Email": "u1@email.com"
            }
        ];

        expect(pipe.data[0]).toEqual(expected);
})

test('Checks if GetPosts handler correctly returns data',
    async () => {
        const pipe = new SendPipe();
        const res = { json: pipe.getJSONCallback() };
        
        await GetPostsHandler({} as express.Request, res as any);

        const mockTimestamp : Date = new Date();
        const mockTimeString : string = mockTimestamp.toISOString();

        const expected = [
            {
                "id": 1,
                "Title": "This is a post",
                "Body": "This is the body",
                "isDraft": false,
                "Date": mockTimeString,
                "User": {
                "id": 1,
                "FirstName": "u1",
                "LastName": "u1",
                "Email": "u1@email.com"
                },
                "Tags": [
                {
                    "id": 2,
                    "Title": "Urgent",
                    "TagPost": {
                    "TagId": 2,
                    "PostId": 1
                    }
                }
                ],
                "Comments": []
            },
            {
                "id": 2,
                "Title": "This is another post",
                "Body": "This is the body",
                "isDraft": false,
                "Date": mockTimeString,
                "User": {
                "id": 2,
                "FirstName": "u2",
                "LastName": "u2",
                "Email": "u2@email.com"
                },
                "Tags": [
                    {
                        "id": 1,
                        "Title": "Update",
                        "TagPost": {
                        "TagId": 1,
                        "PostId": 2
                        }
                    }
                ],
                "Comments": []
            }
        ];

        pipe.data[0].forEach((element : any) => {
            if (element) element.Date = mockTimeString;
        });

        expect(pipe.data[0]).toEqual(expected);
    }
)

test('Check if GetMedia handler responds with data',
    async () => {
        const pipe = new SendPipe();
        const res = { json: pipe.getJSONCallback() };
        
        await GetMediaHandler({} as express.Request, res as any);

        const mockTimestamp : Date = new Date();
        const mockTimeString : string = mockTimestamp.toISOString();

        const expected = [
            {
                "id": 1,
                "Title": "photo1",
                "FilePath": "media/photos/photo1",
                "FileExtension": "jpg",
                "Date": mockTimeString,
                "UserId": 1,
                "User": {
                "id": 1,
                "FirstName": "u1",
                "LastName": "u1",
                "Email": "u1@email.com"
                }
            },
            {
                "id": 2,
                "Title": "video1",
                "FilePath": "media/videos/video1",
                "FileExtension": "mp4",
                "Date": mockTimeString,
                "UserId": 1,
                "User": {
                "id": 1,
                "FirstName": "u1",
                "LastName": "u1",
                "Email": "u1@email.com"
                }
            }
        ]

        pipe.data[0].forEach((element : any) => {
            element.Date = mockTimeString;
        });

        expect(pipe.data[0]).toEqual(expected);
    }
)

test('Checks if GetMediaContainsName handler responds with correct data',
    async () => {
        const pipe = new SendPipe();
        const res = { json: pipe.getJSONCallback() };

        const req = { params: { like: 'video' } };

        const mockTimestamp : Date = new Date();
        const mockTimeString : string = mockTimestamp.toISOString();

        await GetMediaContainsNameHandler(req as any, res as any);

        const expected = [
            {
                "id": 2,
                "Title": "video1",
                "FilePath": "media/videos/video1",
                "FileExtension": "mp4",
                "Date": mockTimeString,
                "UserId": 1,
                "User": {
                "id": 1,
                "FirstName": "u1",
                "LastName": "u1",
                "Email": "u1@email.com"
                }
            }
        ]

        pipe.data[0].forEach((element : any) => {
            if (element) element.Date = mockTimeString;
        });

        expect(pipe.data[0]).toEqual(expected);

    }
)

test('Checks if GetTags handler responds with data', 
    async () => {
        const pipe = new SendPipe();
        const res = { json: pipe.getJSONCallback() };

        await GetTagsHandler({} as express.Request, res as any)

        const expected = [
            {
                "id": 1,
                "Title": "Update"
            },
            {
                "id": 2,
                "Title": "Urgent"
            }
        ]
        
        await GetMediaHandler({} as express.Request, res as any);
        expect(pipe.data[0]).toEqual(expected);
    }
)

test('Checks if GetPostById handler responds with correct data',
    async () => {
        const pipe = new SendPipe();
        const res = { json: pipe.getJSONCallback() };
        const req = { params: { id: '1' } };
        
        const mockTimestamp : Date = new Date();
        const mockTimeString : string = mockTimestamp.toISOString();

        await GetPostByIdHandler(req as any, res as any);

        const expected = {
            "id": 1,
            "Title": "This is a post",
            "Body": "This is the body",
            "isDraft": false,
            "Date": mockTimeString,
            "User": {
                "id": 1,
                "FirstName": "u1",
                "LastName": "u1",
                "Email": "u1@email.com"
            },
            "Comments": [],
            "Tags": [
                {
                "id": 2,
                "Title": "Urgent",
                "TagPost": {
                    "TagId": 2,
                    "PostId": 1
                }
                }
            ]
        }

        pipe.data[0].Date = mockTimeString;
        expect(pipe.data[0]).toEqual(expected);
    }
)

test('Checks if PostUser handler inserts new user correctly',
    async () => {
        const pipe = new SendPipe();
        const res = { json: pipe.getJSONCallback() };
        const req = {
            body : {
                FirstName : "Tim",
                LastName : "Chalamet",
                Email : "tim@email.com",
                PasswordHash : "1234"
            }
        }
        
        await PostUserHandler(req as any, res as any);
        await GetUserByIdHandler({params : { id: 3}} as any, res as any);

        const expectedGetUser = {
            "FirstName" : "Tim",
            "LastName" : "Chalamet",
            "Email" : "tim@email.com",
            "id" : 3
        }
        const expectedResponse = {
            "FirstName" : "Tim",
            "LastName" : "Chalamet",
            "Email" : "tim@email.com",
            "PasswordHash" : "1234",
            "id" : 3
        }

        expect(pipe.data[0]).toEqual(expectedResponse);
        expect(pipe.data[1]).toEqual(expectedGetUser);
    }
)