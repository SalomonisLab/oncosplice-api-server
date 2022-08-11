##Oncosplice Server

To run this server, navigate to the root directory and use the following command:
´node server.js´
Make sure you're logged in to the correct vpn, and type http://localhost:8081/api/datasets into Postman's POST request. Use raw json data as input; here's an example you can use.
´{
    "data": "GBM"
}´