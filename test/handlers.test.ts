import { expect, test } from 'vitest'
import express from 'express';
import { GetUserByIdHandler, GetUserHandler, IndexRequestHandler, SearchUsersHandler } from '../app';

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

        IndexRequestHandler({} as express.Request, 
            res as express.Response);

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