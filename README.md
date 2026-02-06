This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/pages/api-reference/create-next-app).

## Getting Started

1. First copy the `.env.local` to the project root
2. Run `docker compose up` from a terminal at project root. This will boot up postgres and minio bucket service. Ensure you have docker desktop running.
3. Run `npm i`. If this fails, do `npm i --legacy-peer-deps`
4. Run `npm run dev`

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

[http://localhost:3000/dicom/remote](http://localhost:3000/dicom/remote) will fetch dicom files from `https://d14fa38qiwhyfd.cloudfront.net/dicomweb` server. This is rendered client side using `@ohif/viewer` package.

## Bucket and Database

You can visit the bucket at [http://localhost:9001](http://localhost:9001) and use credentials from docker compose up to view persistent files that you have uploaded already.

Use a database client to connect to `localhost:5432` with credentials in the docker compose up to view persistent database.

Data on both postgres and minio persists in the container volumes.

### TODO

1. `/dicom/local` to render local files using `@ohif/viewer`. This needs a study api endpoint.
2. Add testing for apis and components.
