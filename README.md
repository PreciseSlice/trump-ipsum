# BYOB Trump Ipsum Backend
[![Build Status](https://travis-ci.org/PreciseSlice/trump-ipsum.svg?branch=master)](https://travis-ci.org/PreciseSlice/trump-ipsum)

An API which serves official presidential remarks one paragraph at a time.

Authorized users have the ability to `POST` `PATCH` `DELETE` and are validated via Jason Web Tokens.

### Libraries utilized

This project was made using Node, Express, Knex and PostgreSQL.

The testing utilizes Chai and Mocha.

### Data 

The source of the data for the project is [whitehouse.gov](https://www.whitehouse.gov/search/?s=remarks) specifically the remarks section. 
<br/>

## Endpoints


### Authentication for authorized users

#### `https://trump-ipsum-backend.herokuapp.com/authenticate`

Visit the url above and [login](https://trump-ipsum-backend.herokuapp.com/authenticate) if you are an authorized user in order to receive a JWT granting `POST` `PATCH` `DELETE` permissions.  

### Base url: 
#### `https://trump-ipsum-backend.herokuapp.com/api/v1`

## GET

### Remarks:
### `/remarks`

A `GET` to this endpoint returns and array of all remarks.

Remarks objects have `id` `title` `topic` `date` `timestamp` properties. 

The paragraphs corresponding to a particular `remark_id` are found under the paragraphs endpoint.  

#### Response  

```
[
	{
		"id": 1,
		"title": "The Title",
		"topic": "TOPIC ONE",
		"date": "2/12/2018",
		"created_at": "2018-03-30T05:36:53.234Z",
		"updated_at": "2018-03-30T05:36:53.234Z"
	},
	{
		"id": 2,
		"title": "Another Title",
		"topic": "TOPIC TWO",
		"date": "2/14/2018",
		"created_at": "2018-03-30T05:36:53.234Z",
		"updated_at": "2018-03-30T05:36:53.234Z"

	}
]

```
<br/>

### `/remarks/:id`

Pass in the id number of the remark in the place of `:id`. 

A `GET` to this endpoint returns a specific remark.

#### Response 
```
[
	{
		"id": 1,
		"title": "The Title",
		"topic": "TOPIC ONE",
		"date": "2/12/2018",
		"created_at": "2018-03-30T05:36:53.234Z",
		"updated_at": "2018-03-30T05:36:53.234Z"
	}
]
```
<br/>

####Custom topic parameters 
###`/remarks?topic=TOPIC%20ONE`

Pass in the name of the topic your are searching for in place of `TOPIC%20ONE` in the example above

A `GET` will return the remark with the topic of your query if it exist in the database.

### Responce 
```
[
    {
        "id": 1,
        "title": "The Title",
        "topic": "TOPIC ONE",
        "date": "2/12/2018",
        "created_at": "2018-03-29T22:45:54.710Z",
        "updated_at": "2018-03-29T22:45:54.710Z"
    }
]
``` 
<br />

### Paragraphs:
### `/api/v1/paragraphs`

A `GET` to this endpoint returns and array of all the remarks.

Paragraph objects have `id` `length` `text` `remarks_id` `created_at` `updated_at` properties. 

### Response
```
[
	{
		"id": 1,
		"length": "long",
		"text": "Well, thank you everybody.  This has been long in the making.  You’ve heard many, many speeches by me and talks by me, and interviews where I talk about unfair trade practices.  We’ve lost, over a fairly short period of time, 60,000 factories in our country — closed, shuttered, gone.  Six million jobs, at least, gone.  And now they’re starting to come back.  You see what’s happening with Chrysler, with Foxconn, with so many other companies wanting to come back into the United States.",
		"remarks_id": 1,
		"created_at": "2018-03-30T05:36:53.242Z",
		"updated_at": "2018-03-30T05:36:53.242Z"
	},
	{
		"id": 2,
		"length": "short",
		"text": "But we have one particular problem.  And I view them as a friend; I have tremendous respect for President Xi.",
		"remarks_id": 1,
		"created_at": "2018-03-30T05:36:53.242Z",
		"updated_at": "2018-03-30T05:36:53.242Z"
	},
	{
		"id": 3,
		"length": "short",
		"text": "We have a great relationship.  They’re helping us a lot in North Korea.  And that’s China.",
		"remarks_id": 1,
		"created_at": "2018-03-30T05:36:53.242Z",
		"updated_at": "2018-03-30T05:36:53.242Z"
	},
	
	... continued 
```
<br/>

### `/api/v1/paragraphs/:id`
Pass in the id number of the paragraph in the place of :id.

A `GET` to this endpoint returns a specific paragraph.

### Response
```
[
	{
		"id": 24,
		"length": "medium",
		"text": "We buy billions and billions of dollars’ worth of that beautiful F-35.  It’s stealth.  You cannot see it.  Is that correct?",
		"remarks_id": 1,
		"created_at": "2018-03-30T05:36:53.242Z",
		"updated_at": "2018-03-30T05:36:53.242Z"
	}
]
```
<br/>

## POST

### `/api/v1/remarks`

`POST` request to this endpoint require `title` `topic` `date` `token` parameters in the body.

### Example Body:

```
{
	title: 'Another Title',
 	topic: 'TOPIC TWO',
 	date: '02/28/2018',
 	token:  "eyMhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcHBOYW1lIjoibXlBcHAiLCJlbWFpbCI6ImFkbWluQHR1cmluZy5pcyIsImlhdCI6MTUyMjUaNDYwOH0.uu0hwZ-Lkv5v6XbMNOBxBwisAVZDXMW_tGnbjesMJWs"
}
```

### Response
The remark id is returned in the case of a successful `POST`. Your response has been added to the database. 

```
{
    "id": 3
}
```
<br/>

### `/api/v1/paragraphs`

`POST` request to this endpoint require `length` `text` `remarks_id` `token` parameters in the body.

```
{ 
	"length": "short",
	"text": "This is the first of many.  This is number one, but this is the first of many.",
	"remarks_id": "1",
	"token": "eyMhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcHBOYW1lIjoibXlBcHAiLCJlbWFpbCI6ImFkbWluQHR1cmluZy5pcyIsImlhdCI6MTUyMjUaNDYwOH0.uu0hwZ-Lkv5v6XbMNOBxBwisAVZDXMW_tGnbjesMJWs"
}
```

### Response
The paragraph id is returned in the case of a successful `POST`. Your response has been added to the database. 

```
{
    "id": 31
}
```
<br/>

## PATCH

### ` /api/v1/remarks/:id`
Pass in the id number of the remark in the place of `:id`. 

`PATCH` request to this endpoint require `title` `topic` `date` `token` parameters in the body.
### Example Body:

```
{
	title: 'Another Title',
 	topic: 'TOPIC TWO',
 	date: '02/28/2018',
 	token:  "eyMhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcHBOYW1lIjoibXlBcHAiLCJlbWFpbCI6ImFkbWluQHR1cmluZy5pcyIsImlhdCI6MTUyMjUaNDYwOH0.uu0hwZ-Lkv5v6XbMNOBxBwisAVZDXMW_tGnbjesMJWs"
}
```
### Response
The remark id returned in the case of successful `PATCH`.  Your remark has been updated in the database. 

```
{
    "remark": 1
}
```
<br/>

### `/api/v1/paragraphs/:id`
Pass in the id number of the paragraph in the place of `:id`. 

`POST` request to this endpoint require `length` `text` `remarks_id` `token` parameters in the body.
### Example Body:

```
{ 
	"length": "short",
	"text": "This is the first of many.  This is number one, but this is the first of many.",
	"remarks_id": "1",
	"token": "eyMhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcHBOYW1lIjoibXlBcHAiLCJlbWFpbCI6ImFkbWluQHR1cmluZy5pcyIsImlhdCI6MTUyMjUaNDYwOH0.uu0hwZ-Lkv5v6XbMNOBxBwisAVZDXMW_tGnbjesMJWs"
}
```
### Response
A status of 201The paragraph id returned in the case of successful `PATCH`. Your remark has been updated in the database. 

```
{
    "paragraph": 1
}
```
<br/>

## Delete

### `/api/v1/remarks/:id`
Pass in the id number of the remark in the place of `:id`. 

`DELETE` request to this endpoint require `token` parameters in the body.
### Example Body:

```
{
 	token:  "eyMhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcHBOYW1lIjoibXlBcHAiLCJlbWFpbCI6ImFkbWluQHR1cmluZy5pcyIsImlhdCI6MTUyMjUaNDYwOH0.uu0hwZ-Lkv5v6XbMNOBxBwisAVZDXMW_tGnbjesMJWs"
}
```
### Response
The remark id returned in the case of successful `DELETE`.  Your remark has been removed from the database. 

```
{
    "remark": 1
}
```
<br/>

### `/api/v1/paragraphs/:id`
Pass in the id number of the paragraph in the place of `:id`. 

`DELETE` request to this endpoint require `token` parameters in the body.
### Example Body:

```
{
 	token:  "eyMhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcHBOYW1lIjoibXlBcHAiLCJlbWFpbCI6ImFkbWluQHR1cmluZy5pcyIsImlhdCI6MTUyMjUaNDYwOH0.uu0hwZ-Lkv5v6XbMNOBxBwisAVZDXMW_tGnbjesMJWs"
}
```
### Response
The remark id returned in the case of successful `DELETE`.  Your remark has been removed from the database. 

```
{
    "paragraph": 1
}
```
<br/>

