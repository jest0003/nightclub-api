# Night Club API

## Installation

```bash
npm install
```

## Running the API

```bash
npm start
```

The API will be available at [http://localhost:4000](http://localhost:4000).

Useful data scripts:

```bash
npm run reset-db
npm run seed
```

`reset-db` and `seed` both restore `db.json` from `db_backup.json`.

## API Contract

Core read endpoints:

- `GET /events`
- `GET /events/:id`
- `GET /events/:slug`
- `GET /events/:id?_embed=comments`
- `GET /comments`
- `GET /comments?eventId=:id`
- `GET /gallery`
- `GET /testimonials`
- `GET /reservations`
- `GET /reservations?eventId=:id`

Core write endpoints:

- `POST /comments`
- `POST /contact_messages`
- `POST /newsletters`
- `POST /reservations`
- `DELETE /comments/:id`
- `DELETE /reservations/:id`

Events are read-only.

Event objects include both overview fields and detail-page fields:

```json
{
  "id": 1,
  "slug": "neon-nights-grand-opening",
  "title": "Neon Nights Grand Opening",
  "excerpt": "Short text for event cards.",
  "description": "Short intro text.",
  "content": "Long body text for the event detail page.",
  "date": "2026-05-09T21:00:00+02:00",
  "doorsOpen": "2026-05-09T20:00:00+02:00",
  "asset": {
    "url": "/file-bucket/event-thumb1.jpg",
    "width": 570,
    "height": 403,
    "alt": "Singer performing under purple stage lights"
  },
  "heroAsset": {
    "url": "/file-bucket/event-hero1.jpg",
    "width": 1170,
    "height": 500,
    "alt": "Singer performing to a packed purple-lit club"
  },
  "location": "Center Stage",
  "category": "House",
  "lineup": ["Mika Vale", "Nora Lumen"],
  "schedule": [
    {
      "time": "21:00",
      "label": "Doors and welcome drinks"
    }
  ],
  "price": "150 DKK",
  "ageLimit": "18+",
  "isFeatured": true
}
```

Event objects do not include a reservation URL. The frontend should build that
route from the event id.

`asset.url` points to an event thumbnail for cards, and `heroAsset.url` points
to a hero image for event detail pages. Both image objects include `width` and
`height`, so they can be passed directly to image components such as
`next/image`. They also include a short
descriptive `alt` text.

Event comments are stored in the `comments` collection and reference events by
`eventId`. To show comments on an event detail page, fetch the event and then
fetch its comments with `GET /comments?eventId=1`. A numeric event request can
also embed comments with `GET /events/1?_embed=comments`.

To create a new event comment, post to `POST /comments`:

```json
{
  "eventId": 1,
  "name": "Robert Downey Junior",
  "content": "What an amazing evening!",
  "date": "2026-05-09T22:15:00+02:00"
}
```

## Pagination And Filtering

Collection endpoints support standard `json-server` query parameters for
pagination and filtering. `_page` is one-based, and `_limit` controls how many
items are returned per page.

```txt
GET /events?_page=2&_limit=3
GET /comments?eventId=1&_page=1&_limit=5
```

## Validation And Errors

The server validates write requests for these collections:

- `comments`
- `gallery`
- `testimonials`
- `contact_messages`
- `reservations`
- `newsletters`

All error responses use the same JSON structure. For validation and conflict errors, it contains field-level information.

```json
{
  "error": {
    "code": "EMAIL_ALREADY_SUBSCRIBED",
    "message": "This email address is already subscribed.",
    "details": [
      {
        "field": "email",
        "message": "This email address is already subscribed.",
        "code": "conflict"
      }
    ]
  }
}
```

Newsletter signups also reject duplicate email addresses with HTTP `409 Conflict`
and `EMAIL_ALREADY_SUBSCRIBED`.
Comment requests require an `eventId` that references an existing event.
Reservation requests also reject unknown table numbers, guest counts above the
selected table's capacity, and duplicate reservations for the same table on the
same calendar date. If a reservation includes `eventId`, the event must exist
and the reservation `date` must be on the same calendar date as that event.
The frontend can use `GET /reservations` or `GET /reservations?eventId=1` to
derive which tables are already reserved before submitting a new reservation.

Common status codes:

- `200 OK` for successful reads and health checks
- `201 Created` for successful `POST` requests
- `400 Bad Request` with `VALIDATION_ERROR` for invalid payloads
- `404 Not Found` with `NOT_FOUND` for unknown routes
- `405 Method Not Allowed` with `METHOD_NOT_ALLOWED` for event write requests
- `409 Conflict` with `EMAIL_ALREADY_SUBSCRIBED` for duplicate newsletter signups
- `409 Conflict` with `RESOURCE_CONFLICT` for reservation conflicts
- `500 Internal Server Error` with `INTERNAL_SERVER_ERROR` for unexpected server failures

## Documentation

Docs are located at [http://localhost:4000](http://localhost:4000).

**Note:** Authentication has been removed from this API. You can access all endpoints without an access token.

Read about `json-server` features like pagination, embedding and filtering at [npmjs.com/package/json-server](https://www.npmjs.com/package/json-server/v/0.17.4).
