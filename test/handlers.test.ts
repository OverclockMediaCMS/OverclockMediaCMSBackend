import { beforeEach, expect, test } from 'vitest'
import express from 'express';
import { CreatePostHandler, createToken, DeleteUserByIdHandler, GetMediaHandler, GetPostsHandler, GetTagsHandler, GetUserByIdHandler, GetUsersHandler, IndexRequestHandler, LoginUserHandler, PostCommentHandler, PostUserHandler, RegisterUserHandler, SearchUsersHandler } from '../index';
import { sequelize } from '../db';

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

    end(){

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

    getEndCallback() {
        const ref = this;
        return () => {
            ref.end();
            return this;
        }
    }
}

beforeEach(async () => {
    await sequelize.seedDummyData();
});

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
        const res = { json: pipe.getJSONCallback(), status : pipe.getStatusCallback() };
        const token = createToken(1);
        const req = {
            headers : {
                authorization: `Bearer ${token}`
            }
        }

        await GetUsersHandler( req as any, res as any);

        const expected = {
            "response": [
                {
                "Email": "u1@email.com",
                "FirstName": "u1",
                "LastName": "u1",
                "id": 1,
                },
                {
                "Email": "u2@email.com",
                "FirstName": "u2",
                "LastName": "u2",
                "id": 2,
                },
            ],
            "status": 200,
        }

        const result = pipe.data[1];

        expect(result).toEqual(expected);
})

test('Checks if GetUserById handler responds with data',
    async () => {
        const pipe = new SendPipe();
        const res = { json: pipe.getJSONCallback() , status : pipe.getStatusCallback() };
        const token = createToken(1);
        const req = {
            params: {
                id: '2'
            },
            headers : {
                authorization: `Bearer ${token}`
            }
        };
        await GetUserByIdHandler(req as any, res as any);
        const expected = {
            "id": 2,
            "FirstName": "u2",
            "LastName": "u2",
            "Email": "u2@email.com"
        }
        const result = pipe.data[1];
})

test('Checks if GetUserById handler responds with 404 when user is not found',
    async () => {
        const pipe = new SendPipe();
        const token = createToken(1);
        const res = {
            status: pipe.getStatusCallback(),
            send: pipe.getCallback(),
            json: pipe.getJSONCallback()
        };

        const req = {
            params: { id: '99' },
            headers : {
                authorization: `Bearer ${token}`
            }
        };

        await GetUserByIdHandler(req as any, res as any);

        expect(pipe.data[0]).toEqual("Status: 404");
        expect(pipe.data[1]).toEqual({
            "response": "Error - User Not Found",
            "status": 404,
        });
})

test('Checks if SearchUsers handler correctly filters users by FirstName query',
    async () => {
        const pipe = new SendPipe();
        const res = { json: pipe.getJSONCallback() };
        const token = createToken(1);
        const req = {
            query: {
                FirstName: 'u1'
            },
            headers : {
                authorization: `Bearer ${token}`
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

test('Check if GetPosts without search params returns most recent',
    async () => {
        const pipe = new SendPipe();
        const res = { json: pipe.getJSONCallback() };
        
        const token = createToken(1);
        const req = {
            headers : {
                authorization: `Bearer ${token}`
            },
            query: {}
        }
        await GetPostsHandler(req as any, res as any);

        const mockTimestamp : Date = new Date();
        const mockTimeString : string = mockTimestamp.toISOString();

        const expected = [
        {
          "id": 2,
          "Title": "post 2",
          "Body": "## firstsection\n### subsection\n## secondsection \n### subsection\n*italic*",
          "isDraft": false,
          "Date": mockTimeString,
          "UserId": 2,
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
          "Comments": [],
          "Media": []
        },
        {
          "id": 3,
          "Title": "post 3",
          "Body": "## firstsection\n### subsection\n## secondsection \n### subsection\n*italic*",
          "isDraft": false,
          "Date": mockTimeString,
          "UserId": 1,
          "User": {
            "id": 1,
            "FirstName": "u1",
            "LastName": "u1",
            "Email": "u1@email.com"
          },
          "Tags": [],
          "Comments": [],
          "Media": []
        },
        {
          "id": 4,
          "Title": "post 4",
          "Body": "## firstsection\n### subsection\n## secondsection \n### subsection\n*italic*",
          "isDraft": false,
          "Date": mockTimeString,
          "UserId": 2,
          "User": {
            "id": 2,
            "FirstName": "u2",
            "LastName": "u2",
            "Email": "u2@email.com"
          },
          "Tags": [],
          "Comments": [],
          "Media": []
        },
        {
          "id": 5,
          "Title": "post 5",
          "Body": "## firstsection\n### subsection\n## secondsection \n### subsection\n*italic*",
          "isDraft": false,
          "Date": mockTimeString,
          "UserId": 2,
          "User": {
            "id": 2,
            "FirstName": "u2",
            "LastName": "u2",
            "Email": "u2@email.com"
          },
          "Tags": [],
          "Comments": [],
          "Media": []
        },
        {
          "id": 1,
          "Title": "A Guide to Urban Gardening",
          "Body": "## Getting Started\n### Choosing Your Space\nWhether you have a balcony, rooftop, or small backyard, almost any space can be transformed into a productive garden. Start by assessing how much sunlight your space receives throughout the day.\n### Essential Tools\nYou don't need much to get started. A trowel, watering can, and some basic pots will get you a long way. Invest in quality soil before anything else.\n## Choosing What to Grow\n### Vegetables\nTomatoes, lettuce, and herbs are the best starting points for urban gardeners. They grow quickly, don't need much space, and are satisfying to harvest.\n### Herbs\nBasil, mint, and chives are nearly impossible to kill and incredibly useful in the kitchen. Keep them near a sunny window if space is tight.\n### Flowers\nMarigolds and nasturtiums are great companions for vegetables, deterring pests naturally while adding colour to your garden.\n## Soil and Nutrition\n### Picking the Right Soil\nNever use soil straight from the ground in containers — it compacts too easily. Use a quality potting mix designed for container gardening.\n### Composting\nEven in a small apartment you can maintain a worm farm or bokashi bin to turn food scraps into rich compost for your plants.\n## Watering and Maintenance\n### How Often to Water\nMost container plants need watering more frequently than garden beds since they dry out faster. Check the top inch of soil — if it's dry, water it.\n### Dealing with Pests\nAphids and fungus gnats are the most common urban garden pests. A diluted neem oil spray handles both without harsh chemicals.\n## Harvesting\n### Knowing When to Pick\nHarvesting at the right time encourages more growth. For most leafy greens, pick outer leaves first and let the centre keep producing.\n### Storing Your Produce\nFresh herbs last longest when stored upright in a glass of water in the fridge, loosely covered with a plastic bag.",
          "isDraft": false,
          "Date": mockTimeString,
          "UserId": 1,
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
          "Comments": [],
          "Media": []
        }
        ]

        pipe.data[0].forEach((element : any) => {
            if (element) element.Date = mockTimeString;
        });
        const sort = (arr: any[]) => [...arr].sort((a, b) => a.id - b.id);
        expect(sort(pipe.data[0])).toEqual(sort(expected));
    }
)

test('Check if GetMedia handler responds with data',
    async () => {
        const pipe = new SendPipe();
        const res = { json: pipe.getJSONCallback(), status : pipe.getStatusCallback() };
        const token = createToken(1);
        const req = {
            headers : {
                authorization: `Bearer ${token}`
            },
            query : {}
        };
        await GetMediaHandler(req as any, res as any);

        const mockTimestamp : Date = new Date();
        const mockTimeString : string = mockTimestamp.toISOString();

        const expected = [
            {
                "id": 1,
                "Title": "photo1",
                "FilePath": "media/photos/photo1",
                "FileExtension": "jpg",
                "Date": mockTimeString,
                "isDraft": false,
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
                "Title": "photo2",
                "FilePath": "media/photos/photo1",
                "FileExtension": "png",
                "Date": mockTimeString,
                "isDraft": false,
                "UserId": 1,
                "User": {
                "id": 1,
                "FirstName": "u1",
                "LastName": "u1",
                "Email": "u1@email.com"
                }
            },
            {
                "id": 3,
                "Title": "video1",
                "FilePath": "media/videos/video1",
                "FileExtension": "mp4",
                "Date": mockTimeString,
                "isDraft": false,
                "UserId": 1,
                "User": {
                "id": 1,
                "FirstName": "u1",
                "LastName": "u1",
                "Email": "u1@email.com"
                }
            },
            {
                "id": 4,
                "Title": "video2",
                "FilePath": "media/videos/video1",
                "FileExtension": "mp4",
                "Date": mockTimeString,
                "isDraft": false,
                "UserId": 1,
                "User": {
                "id": 1,
                "FirstName": "u1",
                "LastName": "u1",
                "Email": "u1@email.com"
                }
            }
        ];

        pipe.data[0].forEach((element : any) => {
            element.Date = mockTimeString;
        });

        expect(pipe.data[0]).toEqual(expected);
    }
)

test('Checks if GetTags handler responds with data', 
    async () => {
        const pipe = new SendPipe();
        const res = { json: pipe.getJSONCallback(), status : pipe.getStatusCallback() };
        const token = createToken(1);
        const req = {
            headers : {
                authorization: `Bearer ${token}`
            },
            query : {}
        };
        await GetTagsHandler(req as any, res as any)

        const expected = {
            "response": [
                {
                "Title": "Update",
                "id": 1,
                },
                {
                "Title": "Urgent",
                "id": 2,
                },
            ],
            "status": 200,
        }
        
        expect(pipe.data[1]).toEqual(expected);
    }
)

test('Checks if GetPost handler with id responds with correct data',
    async () => {
        const pipe = new SendPipe();
        const res = { json: pipe.getJSONCallback() , status : pipe.getStatusCallback() };
        const token = createToken(1);
        const req = {
            headers : {
                authorization: `Bearer ${token}`
            },
            query : { id: '1' }
        };
        
        const mockTimestamp : Date = new Date();
        const mockTimeString : string = mockTimestamp.toISOString();

        await GetPostsHandler(req as any, res as any);

        const expected = {
            "id": 1,
            "Title": "A Guide to Urban Gardening",
            "Body": "## Getting Started\n### Choosing Your Space\nWhether you have a balcony, rooftop, or small backyard, almost any space can be transformed into a productive garden. Start by assessing how much sunlight your space receives throughout the day.\n### Essential Tools\nYou don't need much to get started. A trowel, watering can, and some basic pots will get you a long way. Invest in quality soil before anything else.\n## Choosing What to Grow\n### Vegetables\nTomatoes, lettuce, and herbs are the best starting points for urban gardeners. They grow quickly, don't need much space, and are satisfying to harvest.\n### Herbs\nBasil, mint, and chives are nearly impossible to kill and incredibly useful in the kitchen. Keep them near a sunny window if space is tight.\n### Flowers\nMarigolds and nasturtiums are great companions for vegetables, deterring pests naturally while adding colour to your garden.\n## Soil and Nutrition\n### Picking the Right Soil\nNever use soil straight from the ground in containers — it compacts too easily. Use a quality potting mix designed for container gardening.\n### Composting\nEven in a small apartment you can maintain a worm farm or bokashi bin to turn food scraps into rich compost for your plants.\n## Watering and Maintenance\n### How Often to Water\nMost container plants need watering more frequently than garden beds since they dry out faster. Check the top inch of soil — if it's dry, water it.\n### Dealing with Pests\nAphids and fungus gnats are the most common urban garden pests. A diluted neem oil spray handles both without harsh chemicals.\n## Harvesting\n### Knowing When to Pick\nHarvesting at the right time encourages more growth. For most leafy greens, pick outer leaves first and let the centre keep producing.\n### Storing Your Produce\nFresh herbs last longest when stored upright in a glass of water in the fridge, loosely covered with a plastic bag.",
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
            ],
            "Media": []
        }

        pipe.data[0].Date = mockTimeString;
        expect(pipe.data[0]).toEqual(expected);
    }
)

test.skip('Checks if PostUser handler inserts new user correctly',
    async () => {
        const pipe = new SendPipe();
        const res = { json: pipe.getJSONCallback() , status : pipe.getStatusCallback()};
        const token = createToken(1);
        const req = {
            body : {
                FirstName : "Tim",
                LastName : "Chalamet",
                InternalPhone : "0422111222",
                Email : "tim@email.com",
                MobilePhone : "0400111222",
                PasswordHash : "1234",
                Role : "TBD"
            },
            headers : {
                authorization: `Bearer ${token}`
            },
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
            "InternalPhone" : "0422111222",
            "LastName" : "Chalamet",
            "MobilePhone" : "0400111222",
            "Email" : "tim@email.com",
            "PasswordHash" : "1234",
            "Role" : "TBD",
            "id" : 3
        }

        expect(pipe.data[0]).toEqual(expectedResponse);
        expect(pipe.data[1]).toEqual(expectedGetUser);
    }
)

test('Checks if DeleteUser handler deletes data correctly',
    async () => {
        const pipe = new SendPipe();
        const res = {
            status: pipe.getStatusCallback(),
            send: pipe.getCallback(),
            json: pipe.getJSONCallback()
        };
        const token = createToken(1);
        const req = {
            params : { id : 1 },
            headers : {
                authorization: `Bearer ${token}`
            }
        }
        await DeleteUserByIdHandler(req as any, res as any);
        await GetUserByIdHandler(req as any, res as any)

        const expectedResponse = {
            "response": {
            "Email": "u1@email.com",
            "FirstName": "u1",
            "LastName": "u1",
            "id": 1,
        },
            "status": 200,
        }

        const expectedResponse1 = {
            "response": "Error - User Not Found",
            "status": 404,
        }
        

        expect(pipe.data[1]).toEqual(expectedResponse);
        expect(pipe.data[0]).toEqual("Status: 200");
        expect(pipe.data[2]).toEqual("Status: 404");
        expect(pipe.data[3]).toEqual(expectedResponse1);
    }
)

test('Checks if PostComment handler inserts data correctly',
    async () => {
        const pipe = new SendPipe();
        const res = {
            status: pipe.getStatusCallback(),
            send: pipe.getCallback(),
            json: pipe.getJSONCallback()
        };
        const token = createToken(1);
        const req = {
            body : {
                Description : "This is description",
                UserId : 1,
                PostId : 1
            },
            headers : {
                authorization: `Bearer ${token}`
            }
        }
        await PostCommentHandler(req as any, res as any);

        const mockTimestamp : Date = new Date();
        const mockTimeString : string = mockTimestamp.toISOString();

        const expectedResponse = {
            "Date": mockTimeString,
            "createdAt": mockTimeString,
            "response": {
                "Date": mockTimeString,
                "Description": "This is description",
                "PostId": 1,
                "UserId": 1,

                "createdAt": mockTimeString,
                "id": 1,
                "updatedAt": mockTimeString,
            },
            "status": 200,
            "updatedAt": mockTimeString,
        }


        pipe.data[1].Date = mockTimeString;
        pipe.data[1].createdAt = mockTimeString;
        pipe.data[1].updatedAt = mockTimeString;
        pipe.data[1].response.Date = mockTimeString;
        pipe.data[1].response.updatedAt = mockTimeString;
        pipe.data[1].response.createdAt = mockTimeString;
        expect(pipe.data[1]).toEqual(expectedResponse);
    }
)

test('Checks if SearchUsers handler responds with filtered data',
    async () => {
        const pipe = new SendPipe();
        const res = {
            json: pipe.getJSONCallback()
        };
        const token = createToken(1);
        const req = {
            query : {FirstName : "1" },
            headers : {
                authorization: `Bearer ${token}`
            }
        }
        
        await SearchUsersHandler(req as any, res as any);

        const expectedResponse = [
            {
                "id": 1,
                "FirstName": "u1",
                "LastName": "u1",
                "Email": "u1@email.com"
            }
        ];

        expect(pipe.data[0]).toEqual(expectedResponse);
    }
);

test('Check if RegisterUser handler inserts user data properly',
    async () => {
        const pipe = new SendPipe();
        const res = {
            status: pipe.getStatusCallback(),
            send: pipe.getCallback(),
            json: pipe.getJSONCallback(),
            end: () => {}
        };
        const token = createToken(1);
        const req = {
            body : {
                FirstName : "Tim",
                LastName : "Chalamet",
                Email : "tim@email.com",
                Password : "1234",
            },
            headers : {
                authorization: `Bearer ${token}`
            }
        };

        const getreq = {
            params : {id : 3},
            headers : {
                authorization: `Bearer ${token}`
            }
        };

        await RegisterUserHandler(req as any, res as any);
        await GetUserByIdHandler( getreq as any, res as any);
        const expectedResponse = "Register user successful";
        const expectedGetUser = {
            "response": {
                "Email": "tim@email.com",
                "FirstName": "Tim",
                "LastName": "Chalamet",
                "id": 3,
                "mediaCount": 0,
                "postCount": 0,
            },
            "status": 200,
        }
        
        expect(pipe.data[0]).toEqual("Status: 200");
        expect(pipe.data[1]).toEqual("Status: 200");
        expect(pipe.data[2]).toEqual(expectedGetUser);
    }
);

test('Check if LoginUser handler succesfully logins with correct user details', 
    async () => {
        const pipe = new SendPipe();
        const res = {
            status: pipe.getStatusCallback(),
            send: pipe.getCallback(),
            json: pipe.getJSONCallback()
        };
        const req1 = {
            body : {
                FirstName : "Tim",
                LastName : "Chalamet",
                Email : "tim@email.com",
                Password : "1234"
            }
        }
        const req2 = {
            body : {
                Email : "tim@email.com",
                Password : "1234"
            }
        }

        const expectedResponse = {
            "token" : createToken(3),
            "user": {
                "Email": "tim@email.com",
                "FirstName": "Tim",
                "LastName": "Chalamet",
                "id": 3,
                "mediaCount": 0,
                "postCount": 0,
            },
        }

        await RegisterUserHandler(req1 as any, res as any);
        await LoginUserHandler(req2 as any, res as any);
        expect(pipe.data[2]).toEqual(expectedResponse);
    }
)

test.todo('Checks if PostPost inserts into Post correctly', async () => {
    const pipe = new SendPipe();
    const res = {
            status: pipe.getStatusCallback(),
            send: pipe.getCallback(),
            json: pipe.getJSONCallback()
        };
    const token = createToken(1);
    const req = {
        headers : {
            authorization: `Bearer ${token}`
        }
    }
    await CreatePostHandler(req as any, res as any);
})

// test.todo('Checks if DeletePost handler delete posts properly with id param')

test.todo('Checks if PostMedia handler creates media properly')

// test.todo('Checks if DeleteMedia handler is deleting data correctly')

test.todo('Checks if PostTag handler inserts data correctly')

// test.todo('Checks if DeleteTag handler delete data correctly')

// test.todo('Checks if DeleteComment handler delete data correctly')

test.todo('Checks if PostMediaPost handler is inserting data correctly')